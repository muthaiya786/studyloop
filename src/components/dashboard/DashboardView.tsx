import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Flame,
  Clock,
  BookOpen,
  CalendarCheck2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  PlusCircle,
  Calendar,
  Check,
  ChevronRight,
  RefreshCw,
  Share2,
} from 'lucide-react';
import { api } from '../../api/client.ts';
import { useToast } from '../common/Toast.tsx';

interface DashboardViewProps {
  onNavigate: (route: string) => void;
  onOpenUpload: () => void;
  onOpenCreateExam: () => void;
  user: any;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenUpload,
  onOpenCreateExam,
  user,
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.dashboard.get();
      if (res.success) {
        setData(res.data);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleToggleTask = async (taskId: string) => {
    try {
      setCompletingTaskId(taskId);
      const res = await api.sessions.complete(taskId);
      if (res.success) {
        showToast('Study task completed! Streak updated.');
        await fetchDashboard();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to complete task', 'error');
    } finally {
      setCompletingTaskId(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse select-none">
        <div className="h-8 bg-white/70 rounded-xl w-64 border border-[#E7ECF3]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-28 bg-white rounded-2xl border border-[#E7ECF3]" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-white rounded-2xl border border-[#E7ECF3] lg:col-span-2" />
          <div className="h-64 bg-white rounded-2xl border border-[#E7ECF3]" />
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    weeklyStudyMinutes: 0,
    completionPercentage: 0,
    decksCount: 0,
    currentStreak: 0,
  };

  const todayTasks = data?.todayTasks || [];
  const upcomingExams = data?.upcomingExams || [];
  const weakTopics = data?.weakTopics || [];
  const recentQuizResults = data?.recentQuizResults || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-7 select-none">
      {/* Personalized Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-[#172033] tracking-tight">
              Welcome back, {user?.name ? user.name.split(' ')[0] : 'Scholar'}
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#F0EEFF] text-[#6857E8] text-[10px] font-bold uppercase tracking-wider">
              Student Workspace
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#778196]">
            Your study sessions, revision plans, and adaptive quizzes for today.
          </p>
        </div>

        {/* Quick Action Pill Row */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#6857E8] hover:bg-[#5645D3] text-white text-xs font-bold shadow-sm shadow-[#6857E8]/20 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Upload Notes</span>
          </button>
          <button
            onClick={onOpenCreateExam}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F7F9FC] border border-[#E7ECF3] text-[#172033] text-xs font-bold shadow-xs transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-[#3977D6]" />
            <span>Create Study Plan</span>
          </button>
          <button
            onClick={() => onNavigate('/app/quiz')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F7F9FC] border border-[#E7ECF3] text-[#172033] text-xs font-bold shadow-xs transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#238A66]" />
            <span>Start Quiz</span>
          </button>
          <button
            onClick={() => onNavigate('/app/progress')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F7F9FC] border border-[#E7ECF3] text-[#172033] text-xs font-bold shadow-xs transition-all"
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#6857E8]" />
            <span>View Progress</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Weekly Study Time */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#778196] block mb-1">
              Weekly Study Time
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-[#172033]">
                {stats.weeklyStudyMinutes}
              </span>
              <span className="text-xs font-bold text-[#778196]">mins</span>
            </div>
            <span className="text-[10px] text-[#238A66] font-semibold mt-1 block">
              Active retention pace
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#E8F2FF] text-[#3977D6] flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Plan Completion */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs flex items-center justify-between">
          <div className="w-full mr-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#778196] block mb-1">
              Plan Completion
            </span>
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-2xl font-black text-[#172033]">
                {stats.completionPercentage}%
              </span>
              <span className="text-xs text-[#778196]">of schedule</span>
            </div>
            <div className="w-full bg-[#E7ECF3] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#238A66] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, stats.completionPercentage)}%` }}
              />
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#E3F8EF] text-[#238A66] flex items-center justify-center shrink-0">
            <CalendarCheck2 className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Study Decks */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#778196] block mb-1">
              Study Decks
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-[#172033]">
                {stats.decksCount}
              </span>
              <span className="text-xs text-[#778196]">active</span>
            </div>
            <button
              onClick={() => onNavigate('/app/library')}
              className="text-[10px] text-[#6857E8] font-bold hover:underline mt-1 block"
            >
              Browse library &rarr;
            </button>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#F0EEFF] text-[#6857E8] flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Current Study Streak */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#778196] block mb-1">
              Study Streak
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-[#B97820]">
                {stats.currentStreak}
              </span>
              <span className="text-xs font-bold text-[#778196]">days in rhythm</span>
            </div>
            <span className="text-[10px] text-[#778196] block mt-1">
              Maintained with active study
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#FFF2DF] text-[#B97820] flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 fill-[#B97820]" />
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Tasks & Upcoming Examinations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Today's Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E7ECF3]">
              <div>
                <h2 className="text-base font-bold text-[#172033] flex items-center gap-2">
                  <span>Today's Study Tasks</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#F0EEFF] text-[#6857E8] text-[10px] font-bold">
                    {todayTasks.filter((t: any) => t.status === 'pending').length} Remaining
                  </span>
                </h2>
                <p className="text-xs text-[#778196]">
                  Check off completed tasks to advance your revision calendar and streak.
                </p>
              </div>
              <button
                onClick={() => onNavigate('/app/planner')}
                className="text-xs font-bold text-[#6857E8] hover:underline flex items-center gap-1"
              >
                <span>Full Planner</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todayTasks.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#E3F8EF] text-[#238A66] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#172033]">All caught up for today!</h3>
                <p className="text-xs text-[#778196] max-w-sm mx-auto">
                  No pending study sessions scheduled for today. Create a study plan for your next exam or review weak topics.
                </p>
                <button
                  onClick={onOpenCreateExam}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#6857E8] bg-[#F0EEFF] hover:bg-[#6857E8] hover:text-white rounded-lg transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Upcoming Exam Plan</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {todayTasks.map((task: any) => {
                  const isCompleted = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isCompleted
                          ? 'bg-[#F7F9FC] border-[#E7ECF3] opacity-60'
                          : 'bg-white border-[#E7ECF3] hover:border-[#6857E8]/40 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleTask(task.id)}
                          disabled={completingTaskId === task.id || isCompleted}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                            isCompleted
                              ? 'bg-[#238A66] text-white'
                              : 'border-2 border-[#E7ECF3] hover:border-[#238A66] text-transparent hover:text-[#238A66]'
                          }`}
                          aria-label={isCompleted ? 'Completed task' : 'Mark task complete'}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-bold ${
                                isCompleted ? 'line-through text-[#778196]' : 'text-[#172033]'
                              }`}
                            >
                              {task.topicName || 'Scheduled Revision'}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                task.sessionType === 'revision'
                                  ? 'bg-[#FFF2DF] text-[#B97820]'
                                  : task.sessionType === 'practice_quiz'
                                  ? 'bg-[#E8F2FF] text-[#3977D6]'
                                  : 'bg-[#F0EEFF] text-[#6857E8]'
                              }`}
                            >
                              {task.sessionType.replace('_', ' ')}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#778196] block mt-0.5">
                            {task.durationMinutes} mins &bull; {task.notes || 'Core study session'}
                          </span>
                        </div>
                      </div>

                      {!isCompleted && (
                        <button
                          onClick={() => handleToggleTask(task.id)}
                          className="px-3 py-1 rounded-lg text-xs font-bold text-[#238A66] bg-[#E3F8EF] hover:bg-[#238A66] hover:text-white transition-all shrink-0"
                        >
                          Mark Done
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Weak-Topic Recommendations */}
          <div className="p-6 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E7ECF3]">
              <div>
                <h2 className="text-base font-bold text-[#172033] flex items-center gap-2">
                  <span>Weak-Topic Recommendations</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FFF2DF] text-[#B97820] text-[10px] font-bold">
                    Target Revision
                  </span>
                </h2>
                <p className="text-xs text-[#778196]">
                  Topics below 70% mastery identified by your adaptive quiz answers.
                </p>
              </div>
              <button
                onClick={() => onNavigate('/app/progress')}
                className="text-xs font-bold text-[#6857E8] hover:underline flex items-center gap-1"
              >
                <span>All Analytics</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {weakTopics.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#778196]">
                <p className="font-semibold text-[#172033] mb-1">No weak topics identified yet!</p>
                <p className="max-w-md mx-auto">
                  Take a quiz practice session. Study Loop will track your accuracy and automatically prioritize missed concepts here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {weakTopics.map((topic: any) => (
                  <div
                    key={topic.id}
                    className="p-3.5 rounded-xl border border-[#E7ECF3] bg-[#F7F9FC] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#172033] truncate">
                          {topic.topicName}
                        </span>
                        <span className="text-xs font-black text-[#C24141]">
                          {topic.masteryPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-[#E7ECF3] h-1.5 rounded-full overflow-hidden mb-2">
                        <div
                          className="bg-[#C24141] h-full rounded-full"
                          style={{ width: `${topic.masteryPercentage}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[#778196] block mb-3">
                        {topic.totalCorrect} correct of {topic.totalAnswered} questions
                      </span>
                    </div>

                    <button
                      onClick={() => onNavigate('/app/quiz')}
                      className="w-full py-1.5 text-center text-xs font-bold rounded-lg bg-white border border-[#E7ECF3] hover:border-[#6857E8] text-[#6857E8] hover:bg-[#F0EEFF] transition-all flex items-center justify-center gap-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Practice Now</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Upcoming Exams & Recent Quizzes */}
        <div className="space-y-6">
          {/* Upcoming Examinations Card */}
          <div className="p-6 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E7ECF3]">
              <h2 className="text-base font-bold text-[#172033] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#3977D6]" />
                <span>Upcoming Exams</span>
              </h2>
              <button
                onClick={onOpenCreateExam}
                className="text-xs font-bold text-[#6857E8] hover:underline"
              >
                + Plan Exam
              </button>
            </div>

            {upcomingExams.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#778196] space-y-2">
                <p>No exams currently registered.</p>
                <button
                  onClick={onOpenCreateExam}
                  className="px-3 py-1.5 rounded-lg bg-[#6857E8] text-white font-bold text-xs"
                >
                  Set Exam Target Date
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {upcomingExams.map((exam: any) => (
                  <div
                    key={exam.id}
                    onClick={() => onNavigate('/app/planner')}
                    className="p-3.5 rounded-xl border border-[#E7ECF3] hover:border-[#3977D6]/50 bg-[#F7F9FC] cursor-pointer transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-xs font-bold text-[#172033] leading-tight">
                        {exam.title}
                      </h4>
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-[#E8F2FF] text-[#3977D6] text-[10px] font-black">
                        {exam.daysLeft}d left
                      </span>
                    </div>
                    <span className="text-[11px] text-[#778196] block mb-2">
                      {exam.subject}
                    </span>
                    <div className="text-[10px] font-semibold text-[#778196] flex items-center justify-between">
                      <span>Exam: {new Date(exam.targetDate).toLocaleDateString()}</span>
                      <span className="text-[#3977D6] hover:underline">View Calendar &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Quiz Results */}
          <div className="p-6 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E7ECF3]">
              <h2 className="text-base font-bold text-[#172033] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#238A66]" />
                <span>Recent Quizzes</span>
              </h2>
              <button
                onClick={() => onNavigate('/app/progress')}
                className="text-xs font-bold text-[#6857E8] hover:underline"
              >
                History
              </button>
            </div>

            {recentQuizResults.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#778196]">
                <p>No quiz attempts logged yet.</p>
                <button
                  onClick={() => onNavigate('/app/quiz')}
                  className="mt-2 text-xs font-bold text-[#6857E8] hover:underline"
                >
                  Start your first quiz &rarr;
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentQuizResults.slice(0, 3).map((quiz: any) => (
                  <div
                    key={quiz.id}
                    className="p-3 rounded-xl border border-[#E7ECF3] bg-[#FFFFFF] flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#172033] block truncate max-w-[140px]">
                        {quiz.deckTitle || 'Practice Quiz'}
                      </span>
                      <span className="text-[10px] text-[#778196]">
                        {quiz.score}/{quiz.totalQuestions} correct &bull; {new Date(quiz.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-black px-2 py-1 rounded-lg ${
                        quiz.percentage >= 70
                          ? 'bg-[#E3F8EF] text-[#238A66]'
                          : 'bg-[#FFF2DF] text-[#B97820]'
                      }`}
                    >
                      {quiz.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
