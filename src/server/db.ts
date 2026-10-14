import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  avatarUrl?: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  id: string;
  userId: string;
  dailyStudyGoalMinutes: number;
  notificationsEnabled: boolean;
  preferredStudyTime: string;
  theme: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderPreference {
  id: string;
  userId: string;
  browserEnabled: boolean;
  emailEnabled: boolean;
  scheduledHour: number;
  scheduledMinute: number;
  daysOfWeek: string;
  lastNotifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Exam {
  id: string;
  userId: string;
  title: string;
  subject: string;
  targetDate: string;
  dailyMinutes: number;
  availableDays: string[];
  status: 'in_progress' | 'completed' | 'archived';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyllabusTopic {
  id: string;
  examId: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  weightPercentage: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  id: string;
  examId: string;
  topicId?: string;
  topicName?: string;
  scheduledDate: string; // YYYY-MM-DD
  durationMinutes: number;
  sessionType: 'study' | 'revision' | 'practice_quiz' | 'final_review';
  status: 'pending' | 'completed' | 'skipped';
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteDocument {
  id: string;
  userId: string;
  originalName: string;
  mimeType: string;
  fileSizeBytes: number;
  extractedText: string;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Summary {
  id: string;
  deckId: string;
  overview: string;
  keyConcepts: Array<{ title: string; explanation: string }>;
  definitions: Array<{ term: string; definition: string }>;
  mainPoints: string[];
  revisionHighlights: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  topic: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface FlashcardReview {
  id: string;
  userId: string;
  flashcardId: string;
  knewIt: boolean;
  reviewedAt: string;
}

export interface QuestionOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface Question {
  id: string;
  deckId: string;
  prompt: string;
  explanation: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  orderIndex: number;
  options: QuestionOption[];
  createdAt: string;
  updatedAt: string;
}

export interface StudyDeck {
  id: string;
  userId: string;
  noteDocumentId?: string;
  title: string;
  subject: string;
  description?: string;
  isAiGenerated: boolean;
  isDemoMode: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOptionId?: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  deckId: string;
  deckTitle?: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
  timeSpentSeconds: number;
  answers: QuizAnswer[];
}

export interface TopicMastery {
  id: string;
  userId: string;
  topicName: string;
  masteryPercentage: number;
  totalAnswered: number;
  totalCorrect: number;
  lastPracticedAt?: string;
  updatedAt: string;
}

export interface ShareLink {
  id: string;
  deckId: string;
  shareToken: string;
  isActive: boolean;
  viewsCount: number;
  createdAt: string;
  expiresAt?: string;
}

export interface PasswordResetToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

interface DatabaseSchema {
  users: User[];
  userSettings: UserSettings[];
  reminderPreferences: ReminderPreference[];
  exams: Exam[];
  syllabusTopics: SyllabusTopic[];
  studySessions: StudySession[];
  noteDocuments: NoteDocument[];
  studyDecks: StudyDeck[];
  summaries: Summary[];
  flashcards: Flashcard[];
  flashcardReviews: FlashcardReview[];
  questions: Question[];
  quizAttempts: QuizAttempt[];
  topicMasteries: TopicMastery[];
  shareLinks: ShareLink[];
  passwordResetTokens: PasswordResetToken[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'studyloop.json');

// Simple crypto password hashing with salt
export function hashPassword(password: string): string {
  const salt = 'studyloop_salt_2026';
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

export function generateId(): string {
  return crypto.randomUUID();
}

function getInitialDatabase(): DatabaseSchema {
  const defaultUserId = 'user_demo_student_01';
  const defaultExamId = 'exam_demo_cs301';
  const defaultDeckId = 'deck_demo_distributed_sys';

  const demoTopics: SyllabusTopic[] = [
    { id: 'top_1', examId: defaultExamId, name: 'CAP Theorem & PACELC', difficulty: 'medium', weightPercentage: 20, completed: true, createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), updatedAt: new Date().toISOString() },
    { id: 'top_2', examId: defaultExamId, name: 'Consensus & Raft Protocol', difficulty: 'hard', weightPercentage: 25, completed: false, createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), updatedAt: new Date().toISOString() },
    { id: 'top_3', examId: defaultExamId, name: 'Consistent Hashing & DHTs', difficulty: 'hard', weightPercentage: 20, completed: false, createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), updatedAt: new Date().toISOString() },
    { id: 'top_4', examId: defaultExamId, name: 'Vector Clocks & Logical Time', difficulty: 'medium', weightPercentage: 15, completed: true, createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), updatedAt: new Date().toISOString() },
    { id: 'top_5', examId: defaultExamId, name: 'MapReduce & Distributed Compute', difficulty: 'easy', weightPercentage: 20, completed: false, createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), updatedAt: new Date().toISOString() },
  ];

  const today = new Date();
  const formatDay = (daysOffset: number) => {
    const d = new Date(today.getTime() + daysOffset * 86400000);
    return d.toISOString().split('T')[0];
  };

  const demoSessions: StudySession[] = [
    { id: 'sess_1', examId: defaultExamId, topicId: 'top_1', topicName: 'CAP Theorem & PACELC', scheduledDate: formatDay(-2), durationMinutes: 45, sessionType: 'study', status: 'completed', completedAt: new Date(Date.now() - 86400000 * 2).toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'sess_2', examId: defaultExamId, topicId: 'top_4', topicName: 'Vector Clocks & Logical Time', scheduledDate: formatDay(-1), durationMinutes: 45, sessionType: 'study', status: 'completed', completedAt: new Date(Date.now() - 86400000).toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'sess_3', examId: defaultExamId, topicId: 'top_2', topicName: 'Consensus & Raft Protocol', scheduledDate: formatDay(0), durationMinutes: 60, sessionType: 'study', status: 'pending', notes: 'Focus on leader election timeouts and log replication RPCs', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'sess_4', examId: defaultExamId, topicId: 'top_3', topicName: 'Consistent Hashing & DHTs', scheduledDate: formatDay(1), durationMinutes: 45, sessionType: 'study', status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'sess_5', examId: defaultExamId, topicId: 'top_2', topicName: 'Consensus & Raft Protocol', scheduledDate: formatDay(2), durationMinutes: 45, sessionType: 'revision', status: 'pending', notes: 'Weak topic revision from quiz errors', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'sess_6', examId: defaultExamId, scheduledDate: formatDay(4), durationMinutes: 60, sessionType: 'practice_quiz', status: 'pending', notes: 'Full mock timed practice quiz', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'sess_7', examId: defaultExamId, scheduledDate: formatDay(6), durationMinutes: 90, sessionType: 'final_review', status: 'pending', notes: 'High-yield formula sheet and definition speed-run', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];

  const demoSummary: Summary = {
    id: 'sum_1',
    deckId: defaultDeckId,
    overview: 'Comprehensive study notes on modern Distributed Systems design patterns, fault-tolerant consensus mechanisms, partitioning algorithms, and high-throughput data processing.',
    keyConcepts: [
      { title: 'The CAP Theorem', explanation: 'A distributed data store can simultaneously provide at most two of three guarantees: Consistency, Availability, and Partition Tolerance. In real networks, P is mandatory, forcing a trade-off between C and A.' },
      { title: 'Raft Consensus Protocol', explanation: 'A consensus algorithm designed to be understandable, decomposing consensus into leader election, log replication, and safety. A node can be Leader, Follower, or Candidate.' },
      { title: 'Consistent Hashing', explanation: 'Distributes keys across a ring topology using hash ranges with virtual nodes. When nodes join or leave, only K/N keys need to be remapped on average.' },
      { title: 'Vector Clocks', explanation: 'An algorithm for generating a partial ordering of events in a distributed system and detecting causality violations or concurrent conflicts without synchronized physical wall clocks.' }
    ],
    definitions: [
      { term: 'Split-Brain', definition: 'A condition where a distributed cluster divides into two or more independent partitions, each believing it is the sole active cluster.' },
      { term: 'Linearizability', definition: 'The strongest consistency model, guaranteeing that all operations appear to execute atomically at a specific point in time between their invocation and response.' },
      { term: 'Virtual Nodes', definition: 'Technique in consistent hashing where each physical server maps to multiple tokens across the hash ring to guarantee uniform key distribution.' }
    ],
    mainPoints: [
      'Network partitions cannot be avoided; systems must explicitly design their failover and degradation modes.',
      'Raft achieves fault tolerance as long as a quorum (strict majority: (N/2)+1) of nodes remains operational.',
      'Eventual consistency guarantees that all replicas will converge given sufficient time without new updates.',
      'Two-Phase Commit (2PC) is a blocking atomic commit protocol, vulnerable if the coordinator crashes during the prepare phase.'
    ],
    revisionHighlights: [
      'Quorum formula: Read quorum (R) + Write quorum (W) > Total nodes (N) guarantees strong consistency.',
      'Heartbeat timeout in Raft is typically 150ms-300ms randomized to avoid split votes.',
      'PACELC extends CAP: If there is a Partition, trade Availability vs Consistency; Else, trade Latency vs Consistency.'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const demoFlashcards: Flashcard[] = [
    {
      id: 'fc_1',
      deckId: defaultDeckId,
      front: 'What does the CAP Theorem state for networked distributed systems?',
      back: 'Because physical network partitions (P) are inevitable in real networks, a system can only guarantee either strict Consistency (C) or Availability (A) during network failure, never both.',
      topic: 'CAP Theorem & PACELC',
      orderIndex: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fc_2',
      deckId: defaultDeckId,
      front: 'What are the three states a node can have in the Raft consensus algorithm?',
      back: 'Follower (passive, responds to RPCs), Candidate (starts election after heartbeat timeout), and Leader (handles client writes and dispatches AppendEntries RPCs).',
      topic: 'Consensus & Raft Protocol',
      orderIndex: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fc_3',
      deckId: defaultDeckId,
      front: 'Why does Consistent Hashing use "Virtual Nodes"?',
      back: 'To prevent "hot spots" and ensure uniform distribution of keys across physical nodes, especially when server hardware capacities differ or the number of physical nodes is small.',
      topic: 'Consistent Hashing & DHTs',
      orderIndex: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fc_4',
      deckId: defaultDeckId,
      front: 'What is the main drawback of the Two-Phase Commit (2PC) protocol?',
      back: 'It is a blocking protocol. If the coordinator crashes after nodes have acknowledged the "Prepare" phase, participants must wait indefinitely, holding database row locks.',
      topic: 'Distributed Transactions',
      orderIndex: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fc_5',
      deckId: defaultDeckId,
      front: 'In Dynamo-style storage, how do R, W, and N relate to strong consistency?',
      back: 'When R + W > N (where N is replication factor, R is read quorum, and W is write quorum), any read set overlaps with at least one node containing the latest write.',
      topic: 'Vector Clocks & Logical Time',
      orderIndex: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fc_6',
      deckId: defaultDeckId,
      front: 'What does the PACELC theorem add to the CAP theorem?',
      back: 'If Partition (P), trade Availability (A) vs Consistency (C); Else (E), when running normally, trade Latency (L) vs Consistency (C).',
      topic: 'CAP Theorem & PACELC',
      orderIndex: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const demoQuestions: Question[] = [
    {
      id: 'q_1',
      deckId: defaultDeckId,
      prompt: 'Under the CAP Theorem, when an unavoidable network partition separates a cluster into two disconnected segments, what must an CP system choose to do?',
      explanation: 'In a CP (Consistent & Partition Tolerant) system, nodes on a partition that cannot achieve a verified majority quorum reject incoming writes and reads to avoid split-brain and stale reads, sacrificing availability.',
      topic: 'CAP Theorem & PACELC',
      difficulty: 'medium',
      orderIndex: 0,
      options: [
        { id: 'opt_1a', questionId: 'q_1', text: 'Accept all writes on both sides and resolve conflicts with timestamps', isCorrect: false, orderIndex: 0 },
        { id: 'opt_1b', questionId: 'q_1', text: 'Reject writes on the minority partition to prevent conflicting updates', isCorrect: true, orderIndex: 1 },
        { id: 'opt_1c', questionId: 'q_1', text: 'Automatically double the replication factor across all alive nodes', isCorrect: false, orderIndex: 2 },
        { id: 'opt_1d', questionId: 'q_1', text: 'Shut down the entire distributed cluster until the physical link recovers', isCorrect: false, orderIndex: 3 }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'q_2',
      deckId: defaultDeckId,
      prompt: 'In the Raft consensus algorithm, how does a candidate node prevent split-vote deadlocks during leader elections?',
      explanation: 'Raft uses randomized election timeouts (e.g. 150ms-300ms) for each node so that typically a single follower times out first, increments the term, and collects votes before other nodes wake up.',
      topic: 'Consensus & Raft Protocol',
      difficulty: 'hard',
      orderIndex: 1,
      options: [
        { id: 'opt_2a', questionId: 'q_2', text: 'By electing the node with the lowest IP address in the cluster', isCorrect: false, orderIndex: 0 },
        { id: 'opt_2b', questionId: 'q_2', text: 'By utilizing randomized election timeouts across nodes', isCorrect: true, orderIndex: 1 },
        { id: 'opt_2c', questionId: 'q_2', text: 'By requiring every candidate to communicate through an external Zookeeper coordinator', isCorrect: false, orderIndex: 2 },
        { id: 'opt_2d', questionId: 'q_2', text: 'By allowing multiple leaders to serve writes concurrently on distinct partitions', isCorrect: false, orderIndex: 3 }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'q_3',
      deckId: defaultDeckId,
      prompt: 'When adding 1 new cache server to a cluster of N existing cache servers using traditional modulo hashing (hash(key) % N), what fraction of keys typically need to be re-cached?',
      explanation: 'With standard modulo hashing, changing N to N+1 alters the modulus result for nearly all keys (approx N/(N+1) ≈ 80-90%+ of keys), whereas Consistent Hashing only moves K/(N+1) keys.',
      topic: 'Consistent Hashing & DHTs',
      difficulty: 'hard',
      orderIndex: 2,
      options: [
        { id: 'opt_3a', questionId: 'q_3', text: 'Only 1/N of keys', isCorrect: false, orderIndex: 0 },
        { id: 'opt_3b', questionId: 'q_3', text: 'Almost all keys (approximately N / (N + 1))', isCorrect: true, orderIndex: 1 },
        { id: 'opt_3c', questionId: 'q_3', text: 'Zero keys, because caching is non-deterministic', isCorrect: false, orderIndex: 2 },
        { id: 'opt_3d', questionId: 'q_3', text: 'Exactly 50% of the key space', isCorrect: false, orderIndex: 3 }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'q_4',
      deckId: defaultDeckId,
      prompt: 'In distributed storage systems, what is the purpose of Vector Clocks?',
      explanation: 'Vector clocks record the causal history of events across independent processes. By comparing vector clock vectors, the system can determine whether event A happened-before event B or if they are concurrent conflicts.',
      topic: 'Vector Clocks & Logical Time',
      difficulty: 'medium',
      orderIndex: 3,
      options: [
        { id: 'opt_4a', questionId: 'q_4', text: 'To synchronize GPS physical clock time down to microseconds', isCorrect: false, orderIndex: 0 },
        { id: 'opt_4b', questionId: 'q_4', text: 'To detect causal relationships and concurrent update conflicts', isCorrect: true, orderIndex: 1 },
        { id: 'opt_4c', questionId: 'q_4', text: 'To encrypt data packets in transit between data center regions', isCorrect: false, orderIndex: 2 },
        { id: 'opt_4d', questionId: 'q_4', text: 'To calculate the round-trip ping time to client web browsers', isCorrect: false, orderIndex: 3 }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'q_5',
      deckId: defaultDeckId,
      prompt: 'Why is Two-Phase Commit (2PC) considered a blocking protocol in distributed database transactions?',
      explanation: 'If the coordinator crashes after participants vote "YES" in Phase 1 (Prepare), participants must hold local locks and cannot unilaterally commit or abort until the coordinator recovers.',
      topic: 'Consistent Hashing & DHTs',
      difficulty: 'medium',
      orderIndex: 4,
      options: [
        { id: 'opt_5a', questionId: 'q_5', text: 'Participants must block because network latency is always non-zero', isCorrect: false, orderIndex: 0 },
        { id: 'opt_5b', questionId: 'q_5', text: 'If the coordinator fails after participants prepare, participants cannot decide independently', isCorrect: true, orderIndex: 1 },
        { id: 'opt_5c', questionId: 'q_5', text: 'It requires locking all DNS records across global regions', isCorrect: false, orderIndex: 2 },
        { id: 'opt_5d', questionId: 'q_5', text: 'It prevents read-only transactions from ever finishing', isCorrect: false, orderIndex: 3 }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  return {
    users: [
      {
        id: defaultUserId,
        email: 'alex@studyloop.edu',
        passwordHash: hashPassword('studyloop123'),
        name: 'Alex Rivera',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        timezone: 'America/New_York',
        createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    userSettings: [
      {
        id: 'set_1',
        userId: defaultUserId,
        dailyStudyGoalMinutes: 45,
        notificationsEnabled: true,
        preferredStudyTime: '18:00',
        theme: 'light',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    reminderPreferences: [
      {
        id: 'rem_1',
        userId: defaultUserId,
        browserEnabled: true,
        emailEnabled: true,
        scheduledHour: 18,
        scheduledMinute: 30,
        daysOfWeek: '1,2,3,4,5,6',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    exams: [
      {
        id: defaultExamId,
        userId: defaultUserId,
        title: 'Midterm: Distributed Systems & Cloud Architecture',
        subject: 'Computer Science (CS301)',
        targetDate: new Date(Date.now() + 86400000 * 7).toISOString(),
        dailyMinutes: 60,
        availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        status: 'in_progress',
        notes: 'Covers Chapters 1-6. Key focus on Raft and Consistent Hashing.',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    syllabusTopics: demoTopics,
    studySessions: demoSessions,
    noteDocuments: [
      {
        id: 'doc_1',
        userId: defaultUserId,
        originalName: 'CS301_Distributed_Systems_Lecture_Notes.pdf',
        mimeType: 'application/pdf',
        fileSizeBytes: 245000,
        extractedText: 'Lecture notes covering CAP theorem, PACELC model, Raft consensus protocol, vector clocks, consistent hashing with virtual nodes, and distributed 2PC transactions.',
        wordCount: 1420,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    studyDecks: [
      {
        id: defaultDeckId,
        userId: defaultUserId,
        noteDocumentId: 'doc_1',
        title: 'Distributed Systems & Cloud Architecture',
        subject: 'Computer Science',
        description: 'Comprehensive high-yield notes covering CAP, Raft, Consistent Hashing, and 2PC.',
        isAiGenerated: true,
        isDemoMode: false,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    summaries: [demoSummary],
    flashcards: demoFlashcards,
    flashcardReviews: [
      { id: 'rev_1', userId: defaultUserId, flashcardId: 'fc_1', knewIt: true, reviewedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: 'rev_2', userId: defaultUserId, flashcardId: 'fc_2', knewIt: false, reviewedAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 'rev_3', userId: defaultUserId, flashcardId: 'fc_3', knewIt: false, reviewedAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 'rev_4', userId: defaultUserId, flashcardId: 'fc_4', knewIt: true, reviewedAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 'rev_5', userId: defaultUserId, flashcardId: 'fc_5', knewIt: true, reviewedAt: new Date().toISOString() },
    ],
    questions: demoQuestions,
    quizAttempts: [
      {
        id: 'att_1',
        userId: defaultUserId,
        deckId: defaultDeckId,
        deckTitle: 'Distributed Systems & Cloud Architecture',
        score: 3,
        totalQuestions: 5,
        percentage: 60,
        completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        timeSpentSeconds: 195,
        answers: [
          { id: 'ans_1', attemptId: 'att_1', questionId: 'q_1', selectedOptionId: 'opt_1b', isCorrect: true, timeSpentSeconds: 30 },
          { id: 'ans_2', attemptId: 'att_1', questionId: 'q_2', selectedOptionId: 'opt_2a', isCorrect: false, timeSpentSeconds: 45 },
          { id: 'ans_3', attemptId: 'att_1', questionId: 'q_3', selectedOptionId: 'opt_3a', isCorrect: false, timeSpentSeconds: 50 },
          { id: 'ans_4', attemptId: 'att_1', questionId: 'q_4', selectedOptionId: 'opt_4b', isCorrect: true, timeSpentSeconds: 35 },
          { id: 'ans_5', attemptId: 'att_1', questionId: 'q_5', selectedOptionId: 'opt_5b', isCorrect: true, timeSpentSeconds: 35 },
        ]
      }
    ],
    topicMasteries: [
      { id: 'tm_1', userId: defaultUserId, topicName: 'CAP Theorem & PACELC', masteryPercentage: 88, totalAnswered: 8, totalCorrect: 7, lastPracticedAt: new Date(Date.now() - 86400000 * 2).toISOString(), updatedAt: new Date().toISOString() },
      { id: 'tm_2', userId: defaultUserId, topicName: 'Consensus & Raft Protocol', masteryPercentage: 45, totalAnswered: 6, totalCorrect: 3, lastPracticedAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date().toISOString() },
      { id: 'tm_3', userId: defaultUserId, topicName: 'Consistent Hashing & DHTs', masteryPercentage: 50, totalAnswered: 6, totalCorrect: 3, lastPracticedAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date().toISOString() },
      { id: 'tm_4', userId: defaultUserId, topicName: 'Vector Clocks & Logical Time', masteryPercentage: 80, totalAnswered: 5, totalCorrect: 4, lastPracticedAt: new Date(Date.now() - 86400000 * 2).toISOString(), updatedAt: new Date().toISOString() },
    ],
    shareLinks: [
      {
        id: 'share_1',
        deckId: defaultDeckId,
        shareToken: 'dist-sys-cs301-shared',
        isActive: true,
        viewsCount: 14,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      }
    ],
    passwordResetTokens: []
  };
}

class DatabaseManager {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        // Ensure all required arrays exist
        return {
          users: parsed.users || [],
          userSettings: parsed.userSettings || [],
          reminderPreferences: parsed.reminderPreferences || [],
          exams: parsed.exams || [],
          syllabusTopics: parsed.syllabusTopics || [],
          studySessions: parsed.studySessions || [],
          noteDocuments: parsed.noteDocuments || [],
          studyDecks: parsed.studyDecks || [],
          summaries: parsed.summaries || [],
          flashcards: parsed.flashcards || [],
          flashcardReviews: parsed.flashcardReviews || [],
          questions: parsed.questions || [],
          quizAttempts: parsed.quizAttempts || [],
          topicMasteries: parsed.topicMasteries || [],
          shareLinks: parsed.shareLinks || [],
          passwordResetTokens: parsed.passwordResetTokens || [],
        };
      }
    } catch (err) {
      console.error('Failed to load database file, resetting to initial seed data:', err);
    }
    const initial = getInitialDatabase();
    this.saveImmediate(initial);
    return initial;
  }

  private saveImmediate(dataToSave: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database to file:', err);
    }
  }

  public save() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveImmediate(this.data);
    }, 100);
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }

  // --- Users & Auth ---
  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(userData: { email: string; password: string; name: string; timezone?: string }): User {
    const newUser: User = {
      id: generateId(),
      email: userData.email.toLowerCase().trim(),
      passwordHash: hashPassword(userData.password),
      name: userData.name.trim(),
      timezone: userData.timezone || 'UTC',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);

    // Create default settings & reminder prefs
    this.data.userSettings.push({
      id: generateId(),
      userId: newUser.id,
      dailyStudyGoalMinutes: 45,
      notificationsEnabled: true,
      preferredStudyTime: '18:00',
      theme: 'light',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    this.data.reminderPreferences.push({
      id: generateId(),
      userId: newUser.id,
      browserEnabled: false,
      emailEnabled: true,
      scheduledHour: 18,
      scheduledMinute: 0,
      daysOfWeek: '1,2,3,4,5',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    this.save();
    return newUser;
  }

  public updateUser(userId: string, updates: Partial<User>): User | undefined {
    const user = this.findUserById(userId);
    if (!user) return undefined;
    Object.assign(user, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return user;
  }

  public deleteUser(userId: string): boolean {
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== userId);
    this.data.userSettings = this.data.userSettings.filter(s => s.userId !== userId);
    this.data.reminderPreferences = this.data.reminderPreferences.filter(r => r.userId !== userId);
    this.data.exams = this.data.exams.filter(e => e.userId !== userId);
    this.data.studyDecks = this.data.studyDecks.filter(d => d.userId !== userId);
    this.data.quizAttempts = this.data.quizAttempts.filter(q => q.userId !== userId);
    this.data.topicMasteries = this.data.topicMasteries.filter(t => t.userId !== userId);
    this.save();
    return this.data.users.length < initialLen;
  }

  // --- Settings & Reminders ---
  public getUserSettings(userId: string): UserSettings | undefined {
    return this.data.userSettings.find(s => s.userId === userId);
  }

  public updateUserSettings(userId: string, updates: Partial<UserSettings>): UserSettings {
    let settings = this.getUserSettings(userId);
    if (!settings) {
      settings = {
        id: generateId(),
        userId,
        dailyStudyGoalMinutes: 45,
        notificationsEnabled: true,
        preferredStudyTime: '18:00',
        theme: 'light',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.data.userSettings.push(settings);
    }
    Object.assign(settings, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return settings;
  }

  public getReminderPreferences(userId: string): ReminderPreference {
    let pref = this.data.reminderPreferences.find(r => r.userId === userId);
    if (!pref) {
      pref = {
        id: generateId(),
        userId,
        browserEnabled: false,
        emailEnabled: true,
        scheduledHour: 18,
        scheduledMinute: 0,
        daysOfWeek: '1,2,3,4,5',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.data.reminderPreferences.push(pref);
      this.save();
    }
    return pref;
  }

  public updateReminderPreferences(userId: string, updates: Partial<ReminderPreference>): ReminderPreference {
    const pref = this.getReminderPreferences(userId);
    Object.assign(pref, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return pref;
  }

  // --- Exams & Study Planner ---
  public getExams(userId: string): Exam[] {
    return this.data.exams.filter(e => e.userId === userId);
  }

  public getExamById(examId: string, userId: string): (Exam & { topics: SyllabusTopic[]; sessions: StudySession[] }) | undefined {
    const exam = this.data.exams.find(e => e.id === examId && e.userId === userId);
    if (!exam) return undefined;
    const topics = this.data.syllabusTopics.filter(t => t.examId === examId);
    const sessions = this.data.studySessions.filter(s => s.examId === examId);
    return { ...exam, topics, sessions };
  }

  public createExam(userId: string, examData: {
    title: string;
    subject: string;
    targetDate: string;
    dailyMinutes?: number;
    availableDays?: string[];
    topics?: Array<{ name: string; difficulty?: 'easy' | 'medium' | 'hard'; weightPercentage?: number }>;
    notes?: string;
  }): Exam & { topics: SyllabusTopic[]; sessions: StudySession[] } {
    const examId = generateId();
    const newExam: Exam = {
      id: examId,
      userId,
      title: examData.title.trim(),
      subject: examData.subject.trim(),
      targetDate: examData.targetDate,
      dailyMinutes: examData.dailyMinutes || 45,
      availableDays: examData.availableDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      status: 'in_progress',
      notes: examData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.exams.push(newExam);

    const createdTopics: SyllabusTopic[] = [];
    if (examData.topics && examData.topics.length > 0) {
      examData.topics.forEach(t => {
        const topic: SyllabusTopic = {
          id: generateId(),
          examId,
          name: t.name.trim(),
          difficulty: t.difficulty || 'medium',
          weightPercentage: t.weightPercentage || Math.round(100 / examData.topics!.length),
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.data.syllabusTopics.push(topic);
        createdTopics.push(topic);
      });
    }

    this.save();
    // Generate initial schedule plan automatically
    const planSessions = this.generatePlanForExam(newExam.id, userId);

    return { ...newExam, topics: createdTopics, sessions: planSessions };
  }

  public updateExam(examId: string, userId: string, updates: Partial<Exam>): Exam | undefined {
    const exam = this.data.exams.find(e => e.id === examId && e.userId === userId);
    if (!exam) return undefined;
    Object.assign(exam, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return exam;
  }

  public deleteExam(examId: string, userId: string): boolean {
    const exam = this.data.exams.find(e => e.id === examId && e.userId === userId);
    if (!exam) return false;
    this.data.exams = this.data.exams.filter(e => e.id !== examId);
    this.data.syllabusTopics = this.data.syllabusTopics.filter(t => t.examId !== examId);
    this.data.studySessions = this.data.studySessions.filter(s => s.examId !== examId);
    this.save();
    return true;
  }

  // --- Smart Plan Generation Logic ---
  public generatePlanForExam(examId: string, userId: string): StudySession[] {
    const exam = this.data.exams.find(e => e.id === examId && e.userId === userId);
    if (!exam) return [];

    // Remove existing pending sessions for this exam to regenerate
    this.data.studySessions = this.data.studySessions.filter(s => s.examId !== examId || s.status === 'completed');

    const topics = this.data.syllabusTopics.filter(t => t.examId === examId);
    if (topics.length === 0) return [];

    // Check user topic masteries to prioritize low mastery topics!
    const masteries = this.data.topicMasteries.filter(m => m.userId === userId);
    const topicMasteryMap = new Map<string, number>();
    masteries.forEach(m => topicMasteryMap.set(m.topicName.toLowerCase(), m.masteryPercentage));

    // Sort topics: prioritize low mastery first, then hard difficulty
    const sortedTopics = [...topics].sort((a, b) => {
      const mastA = topicMasteryMap.get(a.name.toLowerCase()) ?? (a.difficulty === 'hard' ? 40 : a.difficulty === 'medium' ? 65 : 85);
      const mastB = topicMasteryMap.get(b.name.toLowerCase()) ?? (b.difficulty === 'hard' ? 40 : b.difficulty === 'medium' ? 65 : 85);
      return mastA - mastB;
    });

    const targetDate = new Date(exam.targetDate);
    const now = new Date();
    const msDiff = targetDate.getTime() - now.getTime();
    const daysAvailable = Math.max(1, Math.ceil(msDiff / (1000 * 60 * 60 * 24)));

    const dayNameMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const validDays = new Set(exam.availableDays.length > 0 ? exam.availableDays : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);

    // Find all calendar days available from today up to targetDate (reserving the final 1-2 days for final review)
    const availableDates: Date[] = [];
    for (let i = 0; i < daysAvailable; i++) {
      const d = new Date();
      d.setDate(now.getDate() + i);
      const dayOfWeek = dayNameMap[d.getDay()];
      if (validDays.has(dayOfWeek)) {
        availableDates.push(d);
      }
    }

    if (availableDates.length === 0) {
      // Fallback: use next 7 calendar days
      for (let i = 0; i < Math.min(daysAvailable, 7); i++) {
        const d = new Date();
        d.setDate(now.getDate() + i);
        availableDates.push(d);
      }
    }

    const generatedSessions: StudySession[] = [];
    let topicIdx = 0;

    // Last session reserved for final review
    const finalReviewDate = availableDates[availableDates.length - 1];
    const studyDates = availableDates.slice(0, availableDates.length > 1 ? -1 : 1);

    studyDates.forEach((dateObj, idx) => {
      const dateStr = dateObj.toISOString().split('T')[0];
      const assignedTopic = sortedTopics[topicIdx % sortedTopics.length];
      topicIdx++;

      // Every 3rd session, allocate as a practice quiz or revision session
      let sessionType: StudySession['sessionType'] = 'study';
      let notes = `Core study session: Deep dive into ${assignedTopic.name}.`;

      if (idx > 0 && idx % 3 === 0) {
        sessionType = 'revision';
        notes = `Active recall & revision: Review flashcards and key definitions for ${assignedTopic.name}.`;
      } else if (idx > 0 && idx % 5 === 0) {
        sessionType = 'practice_quiz';
        notes = `Formative assessment: Take practice quiz questions on ${assignedTopic.name}.`;
      }

      const session: StudySession = {
        id: generateId(),
        examId,
        topicId: assignedTopic.id,
        topicName: assignedTopic.name,
        scheduledDate: dateStr,
        durationMinutes: exam.dailyMinutes,
        sessionType,
        status: 'pending',
        notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      generatedSessions.push(session);
      this.data.studySessions.push(session);
    });

    // Add Final Review Session
    if (finalReviewDate) {
      const finalSession: StudySession = {
        id: generateId(),
        examId,
        scheduledDate: finalReviewDate.toISOString().split('T')[0],
        durationMinutes: Math.min(120, exam.dailyMinutes * 2),
        sessionType: 'final_review',
        status: 'pending',
        notes: 'Final comprehensive recap: review weak concepts, high-yield summary points, and formula sheets before the exam.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      generatedSessions.push(finalSession);
      this.data.studySessions.push(finalSession);
    }

    this.save();
    return generatedSessions;
  }

  public updateStudySession(sessionId: string, updates: Partial<StudySession>): StudySession | undefined {
    const session = this.data.studySessions.find(s => s.id === sessionId);
    if (!session) return undefined;
    Object.assign(session, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return session;
  }

  // --- Decks, Summaries, Flashcards, Questions ---
  public getDecks(userId: string): StudyDeck[] {
    return this.data.studyDecks.filter(d => d.userId === userId);
  }

  public getDeckDetails(deckId: string, userId?: string): {
    deck: StudyDeck;
    summary?: Summary;
    flashcards: Flashcard[];
    questionsCount: number;
    attemptsCount: number;
    shareLink?: ShareLink;
  } | undefined {
    const deck = this.data.studyDecks.find(d => d.id === deckId && (!userId || d.userId === userId));
    if (!deck) return undefined;

    const summary = this.data.summaries.find(s => s.deckId === deckId);
    const flashcards = this.data.flashcards.filter(f => f.deckId === deckId);
    const questionsCount = this.data.questions.filter(q => q.deckId === deckId).length;
    const attemptsCount = this.data.quizAttempts.filter(a => a.deckId === deckId).length;
    const shareLink = this.data.shareLinks.find(s => s.deckId === deckId && s.isActive);

    return {
      deck,
      summary,
      flashcards,
      questionsCount,
      attemptsCount,
      shareLink
    };
  }

  public createDeckWithContent(userId: string, data: {
    title: string;
    subject: string;
    description?: string;
    isAiGenerated: boolean;
    isDemoMode: boolean;
    summary: {
      overview: string;
      keyConcepts: Array<{ title: string; explanation: string }>;
      definitions: Array<{ term: string; definition: string }>;
      mainPoints: string[];
      revisionHighlights: string[];
    };
    flashcards: Array<{ front: string; back: string; topic: string }>;
    questions: Array<{
      prompt: string;
      explanation: string;
      topic: string;
      difficulty: 'easy' | 'medium' | 'hard';
      options: Array<{ text: string; isCorrect: boolean }>;
    }>;
    noteDocumentId?: string;
  }): { deck: StudyDeck; summary: Summary; flashcards: Flashcard[]; questions: Question[] } {
    const deckId = generateId();
    const newDeck: StudyDeck = {
      id: deckId,
      userId,
      noteDocumentId: data.noteDocumentId,
      title: data.title,
      subject: data.subject,
      description: data.description,
      isAiGenerated: data.isAiGenerated,
      isDemoMode: data.isDemoMode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.studyDecks.push(newDeck);

    // Summary
    const summary: Summary = {
      id: generateId(),
      deckId,
      overview: data.summary.overview,
      keyConcepts: data.summary.keyConcepts || [],
      definitions: data.summary.definitions || [],
      mainPoints: data.summary.mainPoints || [],
      revisionHighlights: data.summary.revisionHighlights || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.summaries.push(summary);

    // Flashcards
    const createdFlashcards: Flashcard[] = (data.flashcards || []).map((fc, idx) => {
      const card: Flashcard = {
        id: generateId(),
        deckId,
        front: fc.front,
        back: fc.back,
        topic: fc.topic || data.subject,
        orderIndex: idx,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.data.flashcards.push(card);
      return card;
    });

    // Questions
    const createdQuestions: Question[] = (data.questions || []).map((q, qIdx) => {
      const qId = generateId();
      const question: Question = {
        id: qId,
        deckId,
        prompt: q.prompt,
        explanation: q.explanation,
        topic: q.topic || data.subject,
        difficulty: q.difficulty || 'medium',
        orderIndex: qIdx,
        options: q.options.map((opt, optIdx) => ({
          id: generateId(),
          questionId: qId,
          text: opt.text,
          isCorrect: opt.isCorrect,
          orderIndex: optIdx
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.data.questions.push(question);
      return question;
    });

    this.save();
    return { deck: newDeck, summary, flashcards: createdFlashcards, questions: createdQuestions };
  }

  public deleteDeck(deckId: string, userId: string): boolean {
    const deck = this.data.studyDecks.find(d => d.id === deckId && d.userId === userId);
    if (!deck) return false;
    this.data.studyDecks = this.data.studyDecks.filter(d => d.id !== deckId);
    this.data.summaries = this.data.summaries.filter(s => s.deckId !== deckId);
    this.data.flashcards = this.data.flashcards.filter(f => f.deckId !== deckId);
    this.data.questions = this.data.questions.filter(q => q.deckId !== deckId);
    this.data.quizAttempts = this.data.quizAttempts.filter(a => a.deckId !== deckId);
    this.data.shareLinks = this.data.shareLinks.filter(s => s.deckId !== deckId);
    this.save();
    return true;
  }

  // --- Adaptive Quiz Logic ---
  // Returns questions for quiz practice WITHOUT revealing isCorrect or explanation
  public getAdaptiveQuizQuestions(deckId: string, userId: string): Array<{
    id: string;
    prompt: string;
    topic: string;
    difficulty: string;
    options: Array<{ id: string; text: string }>;
  }> {
    const questions = this.data.questions.filter(q => q.deckId === deckId);
    if (questions.length === 0) return [];

    // Adaptive sorting: Find user's weak topics and previous missed questions
    const masteries = this.data.topicMasteries.filter(m => m.userId === userId);
    const masteryMap = new Map<string, number>();
    masteries.forEach(m => masteryMap.set(m.topicName.toLowerCase(), m.masteryPercentage));

    // Also inspect previous failed questions
    const pastAttempts = this.data.quizAttempts.filter(a => a.userId === userId && a.deckId === deckId);
    const missedQuestionIds = new Set<string>();
    pastAttempts.forEach(att => {
      att.answers.forEach(ans => {
        if (!ans.isCorrect) missedQuestionIds.add(ans.questionId);
      });
    });

    const weightedQuestions = [...questions].sort((a, b) => {
      // Prioritize previously missed questions
      const aMissed = missedQuestionIds.has(a.id) ? 1 : 0;
      const bMissed = missedQuestionIds.has(b.id) ? 1 : 0;
      if (aMissed !== bMissed) return bMissed - aMissed;

      // Then prioritize lowest topic mastery
      const aMast = masteryMap.get(a.topic.toLowerCase()) ?? 75;
      const bMast = masteryMap.get(b.topic.toLowerCase()) ?? 75;
      return aMast - bMast;
    });

    // Return safe quiz view: Shuffle options, omit correct flag and explanation
    return weightedQuestions.map(q => {
      // Shuffle options copy
      const shuffledOptions = [...q.options]
        .sort(() => Math.random() - 0.5)
        .map(opt => ({
          id: opt.id,
          text: opt.text
        }));

      return {
        id: q.id,
        prompt: q.prompt,
        topic: q.topic,
        difficulty: q.difficulty,
        options: shuffledOptions
      };
    });
  }

  // Record quiz attempt, evaluate answers, update topic mastery
  public submitQuizAttempt(userId: string, deckId: string, submittedAnswers: Array<{ questionId: string; selectedOptionId: string; timeSpentSeconds?: number }>, totalTimeSeconds: number): {
    attempt: QuizAttempt;
    feedback: Array<{
      questionId: string;
      prompt: string;
      topic: string;
      selectedOptionId: string;
      correctOptionId: string;
      isCorrect: boolean;
      explanation: string;
      options: QuestionOption[];
    }>;
    updatedMasteries: TopicMastery[];
  } {
    const deck = this.data.studyDecks.find(d => d.id === deckId);
    const deckQuestions = this.data.questions.filter(q => q.deckId === deckId);
    const questionMap = new Map(deckQuestions.map(q => [q.id, q]));

    const attemptId = generateId();
    let score = 0;
    const evaluatedAnswers: QuizAnswer[] = [];
    const feedbackList: any[] = [];

    // Track per-topic performance for this attempt
    const topicStats = new Map<string, { answered: number; correct: number }>();

    submittedAnswers.forEach(sub => {
      const q = questionMap.get(sub.questionId);
      if (!q) return;

      const correctOpt = q.options.find(o => o.isCorrect);
      const isCorrect = correctOpt ? correctOpt.id === sub.selectedOptionId : false;

      if (isCorrect) score++;

      const answer: QuizAnswer = {
        id: generateId(),
        attemptId,
        questionId: q.id,
        selectedOptionId: sub.selectedOptionId,
        isCorrect,
        timeSpentSeconds: sub.timeSpentSeconds || 0,
      };
      evaluatedAnswers.push(answer);

      feedbackList.push({
        questionId: q.id,
        prompt: q.prompt,
        topic: q.topic,
        selectedOptionId: sub.selectedOptionId,
        correctOptionId: correctOpt?.id || '',
        isCorrect,
        explanation: q.explanation,
        options: q.options,
      });

      // Aggregate topic
      const topicKey = q.topic.trim();
      const current = topicStats.get(topicKey) || { answered: 0, correct: 0 };
      current.answered++;
      if (isCorrect) current.correct++;
      topicStats.set(topicKey, current);
    });

    const totalQuestions = submittedAnswers.length || 1;
    const percentage = Math.round((score / totalQuestions) * 100);

    const attempt: QuizAttempt = {
      id: attemptId,
      userId,
      deckId,
      deckTitle: deck?.title || 'Study Deck',
      score,
      totalQuestions,
      percentage,
      completedAt: new Date().toISOString(),
      timeSpentSeconds: totalTimeSeconds || 60,
      answers: evaluatedAnswers,
    };
    this.data.quizAttempts.push(attempt);

    // Update TopicMastery
    const updatedMasteries: TopicMastery[] = [];
    topicStats.forEach((stats, topicName) => {
      let mastery = this.data.topicMasteries.find(
        m => m.userId === userId && m.topicName.toLowerCase() === topicName.toLowerCase()
      );

      if (!mastery) {
        mastery = {
          id: generateId(),
          userId,
          topicName,
          masteryPercentage: Math.round((stats.correct / stats.answered) * 100),
          totalAnswered: stats.answered,
          totalCorrect: stats.correct,
          lastPracticedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.data.topicMasteries.push(mastery);
      } else {
        mastery.totalAnswered += stats.answered;
        mastery.totalCorrect += stats.correct;
        mastery.masteryPercentage = Math.round((mastery.totalCorrect / mastery.totalAnswered) * 100);
        mastery.lastPracticedAt = new Date().toISOString();
        mastery.updatedAt = new Date().toISOString();
      }
      updatedMasteries.push(mastery);
    });

    this.save();
    return { attempt, feedback: feedbackList, updatedMasteries };
  }

  // --- Flashcard Review ---
  public recordFlashcardReview(userId: string, flashcardId: string, knewIt: boolean): FlashcardReview {
    const review: FlashcardReview = {
      id: generateId(),
      userId,
      flashcardId,
      knewIt,
      reviewedAt: new Date().toISOString(),
    };
    this.data.flashcardReviews.push(review);
    this.save();
    return review;
  }

  // --- Learning Analytics & Weak Topics ---
  public getProgressAnalytics(userId: string): {
    overallMastery: number;
    quizAccuracy: number;
    totalQuestionsPracticed: number;
    totalQuizzesTaken: number;
    topicMasteries: TopicMastery[];
    weakTopics: TopicMastery[];
    strongTopics: TopicMastery[];
    recentAttempts: QuizAttempt[];
    missedConcepts: Array<{ questionPrompt: string; topic: string; explanation: string; failCount: number }>;
  } {
    const attempts = this.data.quizAttempts.filter(a => a.userId === userId);
    const masteries = this.data.topicMasteries.filter(m => m.userId === userId);

    let totalAnswered = 0;
    let totalCorrect = 0;
    attempts.forEach(a => {
      totalAnswered += a.totalQuestions;
      totalCorrect += a.score;
    });

    const quizAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    let overallMastery = 0;
    if (masteries.length > 0) {
      const sum = masteries.reduce((acc, m) => acc + m.masteryPercentage, 0);
      overallMastery = Math.round(sum / masteries.length);
    } else {
      overallMastery = quizAccuracy;
    }

    const sortedMasteries = [...masteries].sort((a, b) => a.masteryPercentage - b.masteryPercentage);
    const weakTopics = sortedMasteries.filter(m => m.masteryPercentage < 70);
    const strongTopics = sortedMasteries.filter(m => m.masteryPercentage >= 70);

    // Calculate frequently missed concepts
    const failCountMap = new Map<string, number>();
    attempts.forEach(att => {
      att.answers.forEach(ans => {
        if (!ans.isCorrect) {
          failCountMap.set(ans.questionId, (failCountMap.get(ans.questionId) || 0) + 1);
        }
      });
    });

    const questionMap = new Map(this.data.questions.map(q => [q.id, q]));
    const missedConcepts: Array<{ questionPrompt: string; topic: string; explanation: string; failCount: number }> = [];

    failCountMap.forEach((failCount, qId) => {
      const q = questionMap.get(qId);
      if (q) {
        missedConcepts.push({
          questionPrompt: q.prompt,
          topic: q.topic,
          explanation: q.explanation,
          failCount
        });
      }
    });

    missedConcepts.sort((a, b) => b.failCount - a.failCount);

    return {
      overallMastery,
      quizAccuracy,
      totalQuestionsPracticed: totalAnswered,
      totalQuizzesTaken: attempts.length,
      topicMasteries: sortedMasteries,
      weakTopics,
      strongTopics,
      recentAttempts: [...attempts].reverse().slice(0, 5),
      missedConcepts: missedConcepts.slice(0, 6)
    };
  }

  // --- Study Streak Calculation ---
  // Calculates streak strictly from completed activity days (quizzes, flashcard reviews, or completed sessions)
  public calculateStreak(userId: string): { currentStreak: number; longestStreak: number; activeDays: string[] } {
    const activityTimestamps: string[] = [];

    this.data.quizAttempts.filter(a => a.userId === userId).forEach(a => activityTimestamps.push(a.completedAt));
    this.data.flashcardReviews.filter(r => r.userId === userId).forEach(r => activityTimestamps.push(r.reviewedAt));
    this.data.studySessions.filter(s => s.status === 'completed' && s.completedAt).forEach(s => activityTimestamps.push(s.completedAt!));

    const dateSet = new Set<string>();
    activityTimestamps.forEach(ts => {
      const d = new Date(ts).toISOString().split('T')[0];
      dateSet.add(d);
    });

    const sortedDays = Array.from(dateSet).sort().reverse();
    if (sortedDays.length === 0) {
      return { currentStreak: 0, longestStreak: 0, activeDays: [] };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    // Current streak counts if user studied today OR yesterday
    let currentStreak = 0;
    let checkDate = new Date();

    if (!dateSet.has(todayStr) && !dateSet.has(yesterdayStr)) {
      currentStreak = 0;
    } else {
      if (!dateSet.has(todayStr)) {
        checkDate = yesterdayDate;
      }
      while (true) {
        const curStr = checkDate.toISOString().split('T')[0];
        if (dateSet.has(curStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    return {
      currentStreak,
      longestStreak: Math.max(currentStreak, sortedDays.length),
      activeDays: Array.from(dateSet)
    };
  }

  // --- Sharing ---
  public getOrCreateShareLink(deckId: string): ShareLink {
    let link = this.data.shareLinks.find(s => s.deckId === deckId && s.isActive);
    if (!link) {
      link = {
        id: generateId(),
        deckId,
        shareToken: 'share_' + crypto.randomBytes(8).toString('hex'),
        isActive: true,
        viewsCount: 0,
        createdAt: new Date().toISOString(),
      };
      this.data.shareLinks.push(link);
      this.save();
    }
    return link;
  }

  public revokeShareLink(deckId: string): boolean {
    const link = this.data.shareLinks.find(s => s.deckId === deckId && s.isActive);
    if (!link) return false;
    link.isActive = false;
    this.save();
    return true;
  }

  public getSharedDeck(shareToken: string): {
    deck: StudyDeck;
    summary?: Summary;
    flashcards: Flashcard[];
    questionsCount: number;
  } | undefined {
    const link = this.data.shareLinks.find(s => s.shareToken === shareToken && s.isActive);
    if (!link) return undefined;

    link.viewsCount++;
    this.save();

    const deck = this.data.studyDecks.find(d => d.id === link.deckId);
    if (!deck) return undefined;

    const summary = this.data.summaries.find(s => s.deckId === deck.id);
    const flashcards = this.data.flashcards.filter(f => f.deckId === deck.id);
    const questionsCount = this.data.questions.filter(q => q.deckId === deck.id).length;

    return { deck, summary, flashcards, questionsCount };
  }

  // --- Documents ---
  public saveNoteDocument(userId: string, docData: {
    originalName: string;
    mimeType: string;
    fileSizeBytes: number;
    extractedText: string;
  }): NoteDocument {
    const words = docData.extractedText.trim().split(/\s+/).filter(Boolean).length;
    const doc: NoteDocument = {
      id: generateId(),
      userId,
      originalName: docData.originalName,
      mimeType: docData.mimeType,
      fileSizeBytes: docData.fileSizeBytes,
      extractedText: docData.extractedText,
      wordCount: words,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.noteDocuments.push(doc);
    this.save();
    return doc;
  }
}

export const db = new DatabaseManager();
