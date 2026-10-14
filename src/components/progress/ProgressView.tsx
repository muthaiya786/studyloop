import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Award,
  HelpCircle,
  Clock,
  Sparkles,
  Info,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { api } from '../../api/client.ts';
import { useToast } from '../common/Toast.tsx';

interface ProgressViewProps {
  onNavigate: (route: string) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const res = await api.progress.get();
      if (res.success) {
        setData(res);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load progress analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  if (loading && !data) {
    return (
      <div className="p-8 max-w-5xl mx-auto flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#6857E8]" />
      </div>
    );
  }

  const {
    overallMastery = 0,
    quizAccuracy = 0,
    totalQuestionsPracticed = 0,
    totalQuizzesTaken = 0,
    topicMasteries = [],
    weakTopics = [],
    strongTopics = [],
    recentAttempts = [],
    missedConcepts = [],
    streak = { currentStreak: 0, longestStreak: 0 },
  } = data || {};

  const hasActivity = totalQuizzesTaken > 0 || topicMasteries.length > 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-[#172033] tracking-tight">
              Weak-Topic &amp; Mastery Analytics
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0EEFF] text-[#6857E8]">
              Active Retention
            </span>
          </div>
          <p className="text-xs text-[#778196]">
            Visual tracking of retention, topic strength, and frequently missed concepts.
          </p>
        </div>

        <button
          onClick={() => setShowFormulaInfo(!showFormulaInfo)}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#6857E8] hover:underline"
        >
          <Info className="w-4 h-4" />
          <span>How Mastery is Calculated</span>
        </button>
      </div>

      {/* Info Callout */}
      {showFormulaInfo && (
        <div className="p-4 rounded-xl bg-[#F0EEFF] border border-[#6857E8]/20 text-xs text-[#172033] space-y-1.5 animate-in fade-in">
          <p className="font-bold text-[#6857E8]">Topic Mastery Formula:</p>
          <p className="leading-relaxed text-[#778196]">
            Topic Mastery is strictly calculated from your cumulative quiz answers: <br />
            <code className="font-mono bg-white px-2 py-0.5 rounded border border-[#6857E8]/30 text-[#172033]">
              Mastery % = (Total Correct Answers / Total Answered Questions in Topic) &times; 100
            </code>
            <br />
            Topics under 70% are automatically tagged as <strong>Weak Topics</strong> and prioritized by Study Loop's Adaptive Engine during subsequent quiz sessions and revision calendar slots.
          </p>
        </div>
      )}

      {/* Primary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Overall Mastery */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#778196] block mb-1">
            Overall Retention
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-[#172033]">{overallMastery}%</span>
            <span className="text-xs text-[#778196]">mastery</span>
          </div>
          <div className="w-full bg-[#E7ECF3] h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full ${
                overallMastery >= 70 ? 'bg-[#238A66]' : 'bg-[#B97820]'
              }`}
              style={{ width: `${overallMastery}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Quiz Accuracy */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#778196] block mb-1">
            Quiz Accuracy
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-[#3977D6]">{quizAccuracy}%</span>
            <span className="text-xs text-[#778196]">average</span>
          </div>
          <span className="text-[11px] text-[#778196] mt-2 block">
            Across {totalQuestionsPracticed} questions practiced
          </span>
        </div>

        {/* Metric 3: Quizzes Completed */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#778196] block mb-1">
            Quizzes Completed
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-[#6857E8]">{totalQuizzesTaken}</span>
            <span className="text-xs text-[#778196]">assessments</span>
          </div>
          <span className="text-[11px] text-[#238A66] mt-2 block font-semibold">
            Active recall rhythm
          </span>
        </div>

        {/* Metric 4: Streak */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#778196] block mb-1">
            Active Study Days
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-[#B97820]">{streak.currentStreak}</span>
            <span className="text-xs text-[#778196]">days in rhythm</span>
          </div>
          <span className="text-[11px] text-[#778196] mt-2 block">
            Longest run: {streak.longestStreak} days
          </span>
        </div>
      </div>

      {!hasActivity ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E7ECF3] space-y-3">
          <HelpCircle className="w-10 h-10 text-[#6857E8] mx-auto opacity-70" />
          <h3 className="text-base font-bold text-[#172033]">No Learning Analytics Data Yet</h3>
          <p className="text-xs text-[#778196] max-w-md mx-auto">
            Take practice quizzes or review flashcards to populate your mastery percentages. We never display fabricated statistics on your dashboard.
          </p>
          <button
            onClick={() => onNavigate('/app/quiz')}
            className="px-4 py-2 bg-[#6857E8] text-white text-xs font-bold rounded-xl"
          >
            Start First Quiz Practice
          </button>
        </div>
      ) : (
        <>
          {/* Weak Topics vs Strong Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weak Topics Card */}
            <div className="p-6 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7ECF3]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#FFF2DF] text-[#B97820] flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#172033]">
                      Needs Revision (&lt; 70% Mastery)
                    </h3>
                    <span className="text-[10px] text-[#778196]">
                      Prioritized in next adaptive quizzes
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#C24141]">
                  {weakTopics.length} Topics
                </span>
              </div>

              {weakTopics.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#238A66] font-semibold">
                  ✓ Great job! All tested topics are currently above 70% mastery.
                </div>
              ) : (
                <div className="space-y-3">
                  {weakTopics.map((topic: any) => (
                    <div
                      key={topic.id}
                      className="p-3 rounded-xl border border-[#E7ECF3] bg-[#FFF2DF]/20"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-[#172033]">{topic.topicName}</span>
                        <span className="font-black text-[#C24141]">
                          {topic.masteryPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-[#E7ECF3] h-1.5 rounded-full overflow-hidden mb-2">
                        <div
                          className="bg-[#C24141] h-full rounded-full"
                          style={{ width: `${topic.masteryPercentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#778196]">
                        <span>
                          {topic.totalCorrect} / {topic.totalAnswered} answered correctly
                        </span>
                        <button
                          onClick={() => onNavigate('/app/quiz')}
                          className="font-bold text-[#6857E8] hover:underline"
                        >
                          Targeted Quiz &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Strong Topics Card */}
            <div className="p-6 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7ECF3]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#E3F8EF] text-[#238A66] flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#172033]">
                      Solid Mastery (&ge; 70% Mastery)
                    </h3>
                    <span className="text-[10px] text-[#778196]">
                      Reliable recall retention
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#238A66]">
                  {strongTopics.length} Topics
                </span>
              </div>

              {strongTopics.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#778196]">
                  No topics have crossed 70% mastery yet. Keep practicing!
                </div>
              ) : (
                <div className="space-y-3">
                  {strongTopics.map((topic: any) => (
                    <div
                      key={topic.id}
                      className="p-3 rounded-xl border border-[#E7ECF3] bg-[#E3F8EF]/20"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-[#172033]">{topic.topicName}</span>
                        <span className="font-black text-[#238A66]">
                          {topic.masteryPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-[#E7ECF3] h-1.5 rounded-full overflow-hidden mb-2">
                        <div
                          className="bg-[#238A66] h-full rounded-full"
                          style={{ width: `${topic.masteryPercentage}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[#778196] block">
                        {topic.totalCorrect} / {topic.totalAnswered} answered correctly
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Frequently Missed Concepts */}
          <div className="p-6 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7ECF3]">
              <div>
                <h3 className="text-sm font-bold text-[#172033]">
                  Frequently Missed Concepts &amp; Traps
                </h3>
                <span className="text-xs text-[#778196]">
                  Specific questions where you made mistakes in recent quizzes.
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF2DF] text-[#B97820]">
                {missedConcepts.length} Concepts
              </span>
            </div>

            {missedConcepts.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#778196]">
                No recurring missed concepts found in your history.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {missedConcepts.map((concept: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-[#E7ECF3] bg-[#F7F9FC] space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-[#172033] leading-snug">
                        {concept.questionPrompt}
                      </span>
                      <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF2DF] text-[#C24141]">
                        Missed {concept.failCount}x
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#778196] uppercase tracking-wider block">
                      Topic: {concept.topic}
                    </span>
                    <p className="text-xs text-[#172033] pt-1.5 border-t border-[#E7ECF3] leading-relaxed">
                      <strong className="text-[#6857E8]">Key Insight:</strong>{' '}
                      {concept.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Quiz Attempts Table */}
          <div className="p-6 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#172033] pb-3 border-b border-[#E7ECF3]">
              Assessment History &amp; Score Progression
            </h3>

            {recentAttempts.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#778196]">
                No quiz attempts logged yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E7ECF3] text-[10px] uppercase font-bold text-[#778196]">
                      <th className="py-2.5">Deck / Assessment</th>
                      <th className="py-2.5">Date Practiced</th>
                      <th className="py-2.5">Duration</th>
                      <th className="py-2.5">Score</th>
                      <th className="py-2.5">Mastery Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7ECF3]">
                    {recentAttempts.map((attempt: any) => (
                      <tr key={attempt.id} className="hover:bg-[#F7F9FC]">
                        <td className="py-3 font-bold text-[#172033]">
                          {attempt.deckTitle || 'Practice Quiz'}
                        </td>
                        <td className="py-3 text-[#778196]">
                          {new Date(attempt.completedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-[#778196]">
                          {attempt.timeSpentSeconds || 60}s
                        </td>
                        <td className="py-3 font-semibold text-[#172033]">
                          {attempt.score} / {attempt.totalQuestions}
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              attempt.percentage >= 70
                                ? 'bg-[#E3F8EF] text-[#238A66]'
                                : 'bg-[#FFF2DF] text-[#B97820]'
                            }`}
                          >
                            {attempt.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
