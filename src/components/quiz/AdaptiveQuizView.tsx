import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  BookOpen,
  Award,
  ChevronRight,
  Loader2,
  AlertCircle,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../api/client.ts';
import { useToast } from '../common/Toast.tsx';

interface AdaptiveQuizViewProps {
  deckId: string;
  onNavigate: (route: string) => void;
  onBack: () => void;
}

export const AdaptiveQuizView: React.FC<AdaptiveQuizViewProps> = ({
  deckId,
  onNavigate,
  onBack,
}) => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [deckInfo, setDeckInfo] = useState<{ id: string; title: string; subject: string } | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // User selections for each question: questionId -> selectedOptionId
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [startTime] = useState<number>(Date.now());

  // Per-question instant submitted state: questionId -> feedback object from server
  const [revealedFeedback, setRevealedFeedback] = useState<Record<string, any>>({});
  const [submittingCurrent, setSubmittingCurrent] = useState(false);

  // Final Results state
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalResult, setFinalResult] = useState<any>(null);
  const [reviewOnlyIncorrect, setReviewOnlyIncorrect] = useState(false);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await api.quiz.getQuestions(deckId);
      if (res.success) {
        setDeckInfo(res.deck);
        setQuestions(res.questions);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to initialize quiz', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [deckId]);

  const currentQ = questions[currentIndex];
  const currentSelectedOpt = currentQ ? selectedAnswers[currentQ.id] : undefined;
  const currentFeedback = currentQ ? revealedFeedback[currentQ.id] : undefined;

  // Handle single question submission to reveal feedback without exposing whole quiz
  const handleCheckCurrentAnswer = async () => {
    if (!currentQ || !currentSelectedOpt) return;

    try {
      setSubmittingCurrent(true);
      // Submit single-question attempt evaluation
      const res = await api.quiz.submitAttempt(deckId, {
        answers: [{ questionId: currentQ.id, selectedOptionId: currentSelectedOpt }],
        timeSpentSeconds: 15,
      });

      if (res.success && res.feedback && res.feedback[0]) {
        const fb = res.feedback[0];
        setRevealedFeedback(prev => ({
          ...prev,
          [currentQ.id]: fb,
        }));
      }
    } catch (err: any) {
      showToast(err.message || 'Error evaluating answer', 'error');
    } finally {
      setSubmittingCurrent(false);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleFinalSubmission();
    }
  };

  const handleFinalSubmission = async () => {
    try {
      setSubmittingCurrent(true);
      const totalSeconds = Math.round((Date.now() - startTime) / 1000);
      const answersPayload = questions.map(q => ({
        questionId: q.id,
        selectedOptionId: selectedAnswers[q.id] || '',
        timeSpentSeconds: Math.round(totalSeconds / questions.length),
      }));

      const res = await api.quiz.submitAttempt(deckId, {
        answers: answersPayload,
        timeSpentSeconds: totalSeconds,
      });

      if (res.success) {
        setFinalResult(res);
        setIsCompleted(true);

        if (res.attempt.percentage >= 70) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#6857E8', '#238A66', '#3977D6'],
          });
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to record full quiz results', 'error');
    } finally {
      setSubmittingCurrent(false);
    }
  };

  const handleRetryQuiz = () => {
    setSelectedAnswers({});
    setRevealedFeedback({});
    setIsCompleted(false);
    setFinalResult(null);
    setCurrentIndex(0);
    setReviewOnlyIncorrect(false);
    fetchQuestions();
    showToast('Adaptive quiz restarted with prioritized questions.');
  };

  if (loading || !deckInfo) {
    return (
      <div className="p-12 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center select-none">
        <Loader2 className="w-8 h-8 animate-spin text-[#6857E8] mb-3" />
        <span className="text-sm font-bold text-[#172033]">Assembling Adaptive Quiz...</span>
        <span className="text-xs text-[#778196] mt-1">
          Evaluating your historical topic masteries and prioritizing missed questions.
        </span>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 select-none">
        <AlertCircle className="w-12 h-12 text-[#B97820] mx-auto" />
        <h2 className="text-lg font-bold text-[#172033]">No Quiz Questions Available</h2>
        <p className="text-xs text-[#778196]">
          This deck does not contain any questions yet. Generate or add notes to this deck to generate questions.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-[#6857E8] text-white text-xs font-bold rounded-xl"
        >
          Return to Deck
        </button>
      </div>
    );
  }

  // ================= FINAL RESULTS SCREEN =================
  if (isCompleted && finalResult) {
    const { attempt, feedback, updatedMasteries } = finalResult;
    const incorrectQuestions = (feedback || []).filter((fb: any) => !fb.isCorrect);
    const displayedFeedback = reviewOnlyIncorrect ? incorrectQuestions : feedback;

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6 select-none">
        {/* Score Hero Card */}
        <div className="p-8 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs text-center space-y-4">
          <div
            className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
              attempt.percentage >= 70 ? 'bg-[#E3F8EF] text-[#238A66]' : 'bg-[#FFF2DF] text-[#B97820]'
            }`}
          >
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#778196] block mb-1">
              Adaptive Quiz Complete
            </span>
            <h1 className="text-3xl font-black text-[#172033] tracking-tight">
              Score: {attempt.score} / {attempt.totalQuestions} ({attempt.percentage}%)
            </h1>
            <p className="text-xs text-[#778196] mt-1">
              {attempt.percentage >= 85
                ? 'Outstanding mastery! Your cognitive recall on this topic is robust.'
                : attempt.percentage >= 70
                ? 'Good work! Review your missed concepts below to lock in complete mastery.'
                : 'Keep practicing! The adaptive planner will prioritize these missed topics in your upcoming sessions.'}
            </p>
          </div>

          {/* Quick Metrics pill row */}
          <div className="flex items-center justify-center gap-6 pt-2 border-t border-[#E7ECF3] max-w-sm mx-auto text-xs text-[#778196]">
            <div>
              <span className="font-bold text-[#172033] block text-sm">
                {attempt.timeSpentSeconds}s
              </span>
              <span>Total Time</span>
            </div>
            <div className="h-6 w-px bg-[#E7ECF3]" />
            <div>
              <span className="font-bold text-[#172033] block text-sm">
                {incorrectQuestions.length}
              </span>
              <span>Needs Review</span>
            </div>
            <div className="h-6 w-px bg-[#E7ECF3]" />
            <div>
              <span className="font-bold text-[#238A66] block text-sm">
                +1 Day
              </span>
              <span>Streak Maintained</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3 pt-3 flex-wrap">
            <button
              onClick={handleRetryQuiz}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#6857E8] hover:bg-[#5645D3] text-white text-xs font-bold shadow-md shadow-[#6857E8]/20 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Adaptive Quiz</span>
            </button>
            <button
              onClick={() => onNavigate(`/app/decks/${deckId}`)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F7F9FC] border border-[#E7ECF3] text-[#172033] text-xs font-bold transition-all"
            >
              <BookOpen className="w-4 h-4 text-[#778196]" />
              <span>Return to Deck</span>
            </button>
            <button
              onClick={() => onNavigate('/app/progress')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F7F9FC] border border-[#E7ECF3] text-[#172033] text-xs font-bold transition-all"
            >
              <span>View Updated Analytics &rarr;</span>
            </button>
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div className="p-6 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7ECF3]">
            <h3 className="text-sm font-bold text-[#172033]">
              Review Explanations & Key Takeaways
            </h3>
            {incorrectQuestions.length > 0 && (
              <button
                onClick={() => setReviewOnlyIncorrect(!reviewOnlyIncorrect)}
                className="text-xs font-bold text-[#6857E8] hover:underline"
              >
                {reviewOnlyIncorrect ? 'Show All Questions' : `Show Only Missed (${incorrectQuestions.length})`}
              </button>
            )}
          </div>

          <div className="space-y-4">
            {(displayedFeedback || []).map((item: any, idx: number) => (
              <div
                key={item.questionId || idx}
                className={`p-4 rounded-xl border transition-all ${
                  item.isCorrect
                    ? 'border-[#238A66]/30 bg-[#E3F8EF]/20'
                    : 'border-[#C24141]/30 bg-[#FFF2DF]/20'
                }`}
              >
                <div className="flex items-start gap-2 mb-2">
                  {item.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-[#238A66] shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#C24141] shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="text-xs font-bold text-[#172033] block">
                      {idx + 1}. {item.prompt}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-[#778196] tracking-wider">
                      Topic: {item.topic}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pl-6 my-2 text-xs">
                  {item.options?.map((opt: any) => {
                    const isSelected = opt.id === item.selectedOptionId;
                    const isCorrect = opt.id === item.correctOptionId || opt.isCorrect;

                    let badge = '';
                    if (isCorrect) badge = 'bg-[#E3F8EF] border-[#238A66] text-[#238A66] font-bold';
                    else if (isSelected && !isCorrect)
                      badge = 'bg-[#FFF2DF] border-[#C24141] text-[#C24141] line-through';
                    else badge = 'bg-white border-[#E7ECF3] text-[#778196]';

                    return (
                      <div key={opt.id} className={`p-2 rounded-lg border text-xs ${badge}`}>
                        {opt.text} {isCorrect && ' ✓ (Correct)'} {isSelected && !isCorrect && ' ✗ (Selected)'}
                      </div>
                    );
                  })}
                </div>

                <div className="pl-6 pt-2 border-t border-[#E7ECF3] text-[11px] text-[#172033]">
                  <strong className="text-[#6857E8]">Explanation:</strong> {item.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ================= ACTIVE QUIZ PLAYER =================
  const isAnswerSelected = Boolean(currentSelectedOpt);
  const isRevealed = Boolean(currentFeedback);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6 select-none">
      {/* Quiz Header & Adaptive Banner */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-[#778196] hover:text-[#172033]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Quiz</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#172033]">{deckInfo.title}</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F2FF] text-[#3977D6]">
            Adaptive
          </span>
        </div>
      </div>

      {/* Adaptive Logic Tooltip Banner */}
      <div className="p-3 rounded-xl bg-[#F0EEFF] border border-[#6857E8]/20 flex items-center justify-between text-xs text-[#6857E8]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span className="font-semibold text-[11px]">
            Adaptive Engine: Weak topics &amp; previously missed questions are weighted higher.
          </span>
        </div>
        <span className="text-[10px] font-bold text-[#778196]">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#E7ECF3] h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-[#6857E8] h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs space-y-6">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#F7F9FC] border border-[#E7ECF3] text-[10px] font-bold text-[#778196] uppercase tracking-wider">
              {currentQ.topic || deckInfo.subject}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                currentQ.difficulty === 'hard'
                  ? 'bg-[#FFF2DF] text-[#B97820]'
                  : currentQ.difficulty === 'easy'
                  ? 'bg-[#E3F8EF] text-[#238A66]'
                  : 'bg-[#E8F2FF] text-[#3977D6]'
              }`}
            >
              {currentQ.difficulty}
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-[#172033] leading-relaxed">
            {currentQ.prompt}
          </h2>
        </div>

        {/* 4 Selectable Options */}
        <div className="space-y-2.5" role="radiogroup" aria-label="Question options">
          {currentQ.options.map((opt: any, optIdx: number) => {
            const isSelected = currentSelectedOpt === opt.id;
            const letter = String.fromCharCode(65 + optIdx);

            let optionStyle =
              'border-[#E7ECF3] bg-white hover:border-[#6857E8]/40 hover:bg-[#F7F9FC] text-[#172033]';

            if (isRevealed) {
              const isCorrectOpt = opt.id === currentFeedback?.correctOptionId;
              if (isCorrectOpt) {
                optionStyle = 'border-[#238A66] bg-[#E3F8EF] text-[#238A66] font-bold';
              } else if (isSelected && !isCorrectOpt) {
                optionStyle = 'border-[#C24141] bg-[#FFF2DF] text-[#C24141]';
              } else {
                optionStyle = 'border-[#E7ECF3] bg-[#F7F9FC] opacity-50 text-[#778196]';
              }
            } else if (isSelected) {
              optionStyle = 'border-[#6857E8] bg-[#F0EEFF] text-[#6857E8] font-bold shadow-xs';
            }

            return (
              <div
                key={opt.id}
                onClick={() => {
                  if (!isRevealed) {
                    setSelectedAnswers(prev => ({ ...prev, [currentQ.id]: opt.id }));
                  }
                }}
                className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${optionStyle}`}
              >
                <div
                  className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-[#6857E8] text-white' : 'bg-[#E7ECF3] text-[#778196]'
                  }`}
                >
                  {letter}
                </div>
                <span className="text-xs leading-relaxed">{opt.text}</span>
              </div>
            );
          })}
        </div>

        {/* Feedback Reveal Box */}
        {isRevealed && currentFeedback && (
          <div
            className={`p-4 rounded-xl border text-xs space-y-1.5 animate-in fade-in ${
              currentFeedback.isCorrect
                ? 'bg-[#E3F8EF]/40 border-[#238A66]/30 text-[#172033]'
                : 'bg-[#FFF2DF]/40 border-[#C24141]/30 text-[#172033]'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {currentFeedback.isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#238A66]" />
                  <span className="text-[#238A66]">Correct Answer!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-[#C24141]" />
                  <span className="text-[#C24141]">Incorrect</span>
                </>
              )}
            </div>
            <p className="text-xs text-[#172033] leading-relaxed">
              <strong className="text-[#6857E8]">Explanation:</strong> {currentFeedback.explanation}
            </p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-[#E7ECF3]">
          <span className="text-[11px] text-[#778196]">
            {!isRevealed
              ? 'Select an option and submit to verify'
              : currentIndex + 1 === questions.length
              ? 'Final question answered'
              : 'Proceed to next question'}
          </span>

          {!isRevealed ? (
            <button
              onClick={handleCheckCurrentAnswer}
              disabled={!isAnswerSelected || submittingCurrent}
              className="px-5 py-2.5 rounded-xl bg-[#6857E8] hover:bg-[#5645D3] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-[#6857E8]/20 transition-all"
            >
              {submittingCurrent ? 'Evaluating...' : 'Submit Answer'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#238A66] hover:bg-[#1E7758] text-white text-xs font-bold shadow-md shadow-[#238A66]/20 transition-all"
            >
              <span>{currentIndex + 1 === questions.length ? 'View Final Results' : 'Next Question'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
