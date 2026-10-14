import { GoogleGenAI, Type } from '@google/genai';

export interface GeneratedStudyMaterial {
  isAiGenerated: boolean;
  isDemoMode: boolean;
  title: string;
  subject: string;
  summary: {
    overview: string;
    keyConcepts: Array<{ title: string; explanation: string }>;
    definitions: Array<{ term: string; definition: string }>;
    mainPoints: string[];
    revisionHighlights: string[];
  };
  flashcards: Array<{
    front: string;
    back: string;
    topic: string;
  }>;
  questions: Array<{
    prompt: string;
    explanation: string;
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
    options: Array<{
      text: string;
      isCorrect: boolean;
    }>;
  }>;
}

export async function generateStudyDeckFromText(
  inputText: string,
  preferredTitle?: string,
  preferredSubject?: string
): Promise<GeneratedStudyMaterial> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.length > 5) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `You are an expert university professor and exam preparation coach. Analyze the following student study notes/syllabus and generate a comprehensive, high-yield study deck.

User Preferred Title: ${preferredTitle || 'Auto-detect'}
User Preferred Subject: ${preferredSubject || 'Auto-detect'}

Source Notes Content:
"""
${inputText.slice(0, 12000)}
"""

Produce an exhaustive study deck containing:
1. title: Concise and descriptive title
2. subject: Academic field or course title
3. summary:
   - overview: A thorough 2-3 paragraph academic overview
   - keyConcepts: 4 to 6 crucial concepts with title and detailed explanation
   - definitions: 4 to 6 core technical definitions (term & definition)
   - mainPoints: 4 to 6 bullet highlights
   - revisionHighlights: 3 to 5 high-yield revision facts/formulas
4. flashcards: 6 to 10 active recall flashcards with clear questions on the front and accurate explanations on the back, labeled with subtopics.
5. questions: 5 to 8 multiple-choice questions. Each question must have:
   - prompt: Clear question text
   - explanation: Educational explanation of why the correct answer is right and why others are wrong
   - topic: Specific subtopic
   - difficulty: "easy", "medium", or "hard"
   - options: EXACTLY 4 options, where EXACTLY 1 option has isCorrect: true and the other 3 have isCorrect: false.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              subject: { type: Type.STRING },
              summary: {
                type: Type.OBJECT,
                properties: {
                  overview: { type: Type.STRING },
                  keyConcepts: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        explanation: { type: Type.STRING },
                      },
                      required: ['title', 'explanation'],
                    },
                  },
                  definitions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        term: { type: Type.STRING },
                        definition: { type: Type.STRING },
                      },
                      required: ['term', 'definition'],
                    },
                  },
                  mainPoints: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  revisionHighlights: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['overview', 'keyConcepts', 'definitions', 'mainPoints', 'revisionHighlights'],
              },
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    front: { type: Type.STRING },
                    back: { type: Type.STRING },
                    topic: { type: Type.STRING },
                  },
                  required: ['front', 'back', 'topic'],
                },
              },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    prompt: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    topic: { type: Type.STRING },
                    difficulty: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          text: { type: Type.STRING },
                          isCorrect: { type: Type.BOOLEAN },
                        },
                        required: ['text', 'isCorrect'],
                      },
                    },
                  },
                  required: ['prompt', 'explanation', 'topic', 'difficulty', 'options'],
                },
              },
            },
            required: ['title', 'subject', 'summary', 'flashcards', 'questions'],
          },
        },
      });

      const rawText = response.text || '';
      const parsed = JSON.parse(rawText);

      return {
        isAiGenerated: true,
        isDemoMode: false,
        title: preferredTitle || parsed.title || 'Generated Study Deck',
        subject: preferredSubject || parsed.subject || 'General Studies',
        summary: parsed.summary,
        flashcards: parsed.flashcards,
        questions: (parsed.questions || []).map((q: any) => ({
          prompt: q.prompt,
          explanation: q.explanation,
          topic: q.topic || parsed.subject || 'General',
          difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
          options: (q.options || []).slice(0, 4),
        })),
      };
    } catch (error) {
      console.warn('Gemini API call failed or timed out, falling back to rule-based generation with demo indicator:', error);
    }
  }

  // Fallback demo generator (Clearly flagged as isDemoMode: true)
  return generateLocalRuleBasedDeck(inputText, preferredTitle, preferredSubject);
}

function generateLocalRuleBasedDeck(
  text: string,
  preferredTitle?: string,
  preferredSubject?: string
): GeneratedStudyMaterial {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const detectedSubject = preferredSubject || 'Computer Science & Engineering';
  const detectedTitle = preferredTitle || (lines[0] && lines[0].length < 60 ? lines[0] : 'Essential Study Deck');

  const sampleParagraphs = lines.filter(l => l.length > 40);
  const overview = sampleParagraphs.slice(0, 2).join(' ') ||
    `This synthesized study deck provides essential high-yield concepts, definitions, and active recall assessments based on uploaded notes in ${detectedSubject}.`;

  return {
    isAiGenerated: false,
    isDemoMode: true,
    title: detectedTitle,
    subject: detectedSubject,
    summary: {
      overview,
      keyConcepts: [
        {
          title: 'Core Fundamentals & Principles',
          explanation: 'Foundational framework and axiomatic rules governing the subject matter, emphasizing theoretical coherence.',
        },
        {
          title: 'Practical Application & Architecture',
          explanation: 'Real-world implementation strategies, trade-offs between speed, durability, and resource consumption.',
        },
        {
          title: 'Optimization & Analysis',
          explanation: 'Methods for profiling performance bottlenecks, algorithmic bounds, and edge case resilience.',
        },
      ],
      definitions: [
        {
          term: 'Invariant',
          definition: 'A condition or predicate that remains true throughout the execution of a system or algorithm.',
        },
        {
          term: 'Throughput',
          definition: 'The rate at which a system processes completed units of work in a given time window.',
        },
        {
          term: 'Fault Tolerance',
          definition: 'The capability of a system to continue normal operation despite internal component or node failures.',
        },
      ],
      mainPoints: [
        'Review primary axioms and boundary conditions before tackling complex multi-step problems.',
        'Benchmark execution tradeoffs under peak load and partial network disconnection scenarios.',
        'Always verify algorithmic invariants prior to deploying state mutations.',
      ],
      revisionHighlights: [
        'Active recall retention doubles when practiced within 24 hours of first review.',
        'High-weight exam questions frequently test edge cases rather than average cases.',
      ],
    },
    flashcards: [
      {
        front: 'What is the primary role of an algorithmic invariant?',
        back: 'It establishes a guaranteed truth that holds across state transitions, ensuring mathematical correctness.',
        topic: 'Foundations',
      },
      {
        front: 'Why must fault tolerance be considered during initial system design rather than added later?',
        back: 'Because failure modes dictate data replication, consensus boundaries, and messaging topologies that cannot be retrofitted easily.',
        topic: 'System Architecture',
      },
      {
        front: 'How does active recall differ from passive rereading?',
        back: 'Active recall forces the brain to retrieve information from memory, strengthening synaptic pathways and long-term retention.',
        topic: 'Learning Science',
      },
      {
        front: 'What is the key trade-off when increasing system caching?',
        back: 'Lower read latency at the expense of potential cache invalidation lag and temporary data inconsistency.',
        topic: 'Performance & Optimization',
      },
    ],
    questions: [
      {
        prompt: 'Which strategy provides the strongest guarantee of long-term memory consolidation according to cognitive science?',
        explanation: 'Spaced repetition combined with active retrieval testing consistently outperforms passive rereading in peer-reviewed retention studies.',
        topic: 'Learning Science',
        difficulty: 'medium',
        options: [
          { text: 'Highlighting textbook paragraphs in fluorescent colors', isCorrect: false },
          { text: 'Spaced retrieval practice with adaptive feedback', isCorrect: true },
          { text: 'Listening to lecture recordings while sleeping', isCorrect: false },
          { text: 'Reviewing solved answer keys immediately before resting', isCorrect: false },
        ],
      },
      {
        prompt: 'When evaluating system throughput vs latency, what is typically observed under saturated load?',
        explanation: 'As queue sizes grow under saturated load, wait times spike exponentially, causing latency to increase even as throughput hits its ceiling.',
        topic: 'Performance & Optimization',
        difficulty: 'hard',
        options: [
          { text: 'Latency remains constant while throughput drops to zero', isCorrect: false },
          { text: 'Latency increases dramatically as queues saturate near capacity', isCorrect: true },
          { text: 'Throughput doubles automatically to accommodate backlog', isCorrect: false },
          { text: 'CPU temperatures drop due to instruction cache hits', isCorrect: false },
        ],
      },
      {
        prompt: 'In distributed computing, what is an "invariant"?',
        explanation: 'An invariant is a mathematical property that must hold true across all reachable system states.',
        topic: 'Foundations',
        difficulty: 'easy',
        options: [
          { text: 'A variable whose memory location changes at runtime', isCorrect: false },
          { text: 'A property that remains true across all valid execution states', isCorrect: true },
          { text: 'A network packet discarded by firewall filters', isCorrect: false },
          { text: 'A hardware clock with fluctuating frequency', isCorrect: false },
        ],
      },
    ],
  };
}
