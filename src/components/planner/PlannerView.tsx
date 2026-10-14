import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ListTodo,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Check,
  Edit2,
  CalendarCheck2,
  SkipForward,
  Loader2,
  X,
} from 'lucide-react';
import { api } from '../../api/client.ts';
import { useToast } from '../common/Toast.tsx';

interface PlannerViewProps {
  onOpenCreateExam: () => void;
}

export const PlannerView: React.FC<PlannerViewProps> = ({ onOpenCreateExam }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'agenda'>('agenda');

  // Month navigation for calendar view
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());

  // Editing session modal
  const [editingSession, setEditingSession] = useState<any>(null);
  const [editDate, setEditDate] = useState('');
  const [editDuration, setEditDuration] = useState(45);
  const [editNotes, setEditNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await api.exams.getAll();
      if (res.success) {
        setExams(res.exams);
        if (res.exams.length > 0 && !selectedExamId) {
          setSelectedExamId(res.exams[0].id);
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load exam plans', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const activeExam = exams.find(e => e.id === selectedExamId) || exams[0];

  const handleToggleComplete = async (sessionId: string) => {
    try {
      const res = await api.sessions.complete(sessionId);
      if (res.success) {
        showToast('Study session marked as complete!');
        await fetchExams();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to complete session', 'error');
    }
  };

  const handleSkipSession = async (sessionId: string) => {
    try {
      const res = await api.sessions.update(sessionId, { status: 'skipped' });
      if (res.success) {
        showToast('Session skipped.');
        await fetchExams();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to skip session', 'error');
    }
  };

  const handleRegeneratePlan = async () => {
    if (!activeExam) return;
    try {
      setLoading(true);
      const res = await api.exams.generatePlan(activeExam.id);
      if (res.success) {
        showToast('Plan regenerated, incorporating your latest mastery scores!');
        await fetchExams();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to regenerate plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSessionEdit = async () => {
    if (!editingSession) return;
    try {
      setIsUpdating(true);
      await api.sessions.update(editingSession.id, {
        scheduledDate: editDate,
        durationMinutes: editDuration,
        notes: editNotes,
      });
      showToast('Session updated successfully.');
      setEditingSession(null);
      await fetchExams();
    } catch (err: any) {
      showToast(err.message || 'Failed to update session', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteExam = async () => {
    if (!activeExam) return;
    if (!window.confirm(`Are you sure you want to delete "${activeExam.title}"?`)) return;

    try {
      await api.exams.delete(activeExam.id);
      showToast('Exam plan deleted.');
      setSelectedExamId(null);
      await fetchExams();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete exam', 'error');
    }
  };

  if (loading && exams.length === 0) {
    return (
      <div className="p-8 max-w-6xl mx-auto flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#6857E8]" />
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 select-none">
        <div className="w-16 h-16 rounded-full bg-[#F0EEFF] text-[#6857E8] flex items-center justify-center mx-auto">
          <CalendarCheck2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#172033]">No Exam Revision Plans Yet</h2>
        <p className="text-xs text-[#778196] leading-relaxed">
          Create an exam target date and add your syllabus topics. Study Loop's algorithm will automatically distribute sessions, prioritize weak topics, and schedule final reviews.
        </p>
        <button
          onClick={onOpenCreateExam}
          className="px-5 py-2.5 rounded-xl bg-[#6857E8] text-white text-xs font-bold shadow-md shadow-[#6857E8]/20 hover:bg-[#5645D3] transition-all"
        >
          Create First Study Plan
        </button>
      </div>
    );
  }

  const sessions = activeExam?.sessions || [];
  const topics = activeExam?.topics || [];
  const completedCount = sessions.filter((s: any) => s.status === 'completed').length;
  const progressPercent = sessions.length > 0 ? Math.round((completedCount / sessions.length) * 100) : 0;
  const daysLeft = Math.max(0, Math.ceil((new Date(activeExam.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 select-none">
      {/* Top Banner & Exam Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-[#172033] tracking-tight">Smart Exam Planner</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F2FF] text-[#3977D6]">
              Algorithmically Scheduled
            </span>
          </div>
          <p className="text-xs text-[#778196]">
            Personalized revision calendar distributing topics, practice quizzes, and final recaps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Exam Selector Dropdown */}
          <select
            value={activeExam?.id}
            onChange={e => setSelectedExamId(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-[#E7ECF3] bg-white text-[#172033] focus:outline-none focus:border-[#6857E8]"
          >
            {exams.map(e => (
              <option key={e.id} value={e.id}>
                {e.title} ({new Date(e.targetDate).toLocaleDateString()})
              </option>
            ))}
          </select>

          <button
            onClick={onOpenCreateExam}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#6857E8] text-white text-xs font-bold hover:bg-[#5645D3] shadow-xs transition-all shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ New Exam</span>
          </button>
        </div>
      </div>

      {/* Active Exam Overview Pill Card */}
      {activeExam && (
        <div className="p-5 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#172033]">{activeExam.title}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF2DF] text-[#B97820]">
                {daysLeft} Days Countdown
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#778196]">
              <span>Subject: {activeExam.subject}</span>
              <span>&bull;</span>
              <span>Daily target: {activeExam.dailyMinutes} mins</span>
              <span>&bull;</span>
              <span>Exam Date: {new Date(activeExam.targetDate).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs font-bold text-[#172033] block">
                {completedCount} of {sessions.length} Sessions Done
              </span>
              <div className="w-32 bg-[#E7ECF3] h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-[#238A66] h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <button
              onClick={handleRegeneratePlan}
              className="p-2 rounded-xl border border-[#E7ECF3] bg-white hover:bg-[#F0EEFF] text-[#6857E8] transition-colors"
              title="Regenerate schedule prioritizing latest weak topics"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleDeleteExam}
              className="p-2 rounded-xl border border-[#E7ECF3] bg-white hover:bg-[#FFF2DF] text-[#C24141] transition-colors"
              title="Delete exam plan"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* View Switcher (Agenda vs Calendar) */}
      <div className="flex items-center justify-between border-b border-[#E7ECF3] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('agenda')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'agenda'
                ? 'bg-[#6857E8] text-white shadow-xs'
                : 'text-[#778196] hover:bg-[#F7F9FC]'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Agenda View</span>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'calendar'
                ? 'bg-[#6857E8] text-white shadow-xs'
                : 'text-[#778196] hover:bg-[#F7F9FC]'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Calendar View</span>
          </button>
        </div>

        <span className="text-xs text-[#778196]">
          {sessions.length} scheduled revision tasks
        </span>
      </div>

      {/* AGENDA VIEW */}
      {viewMode === 'agenda' && (
        <div className="space-y-3">
          {sessions.map((sess: any) => {
            const isCompleted = sess.status === 'completed';
            const isSkipped = sess.status === 'skipped';
            const isToday = sess.scheduledDate === new Date().toISOString().split('T')[0];

            return (
              <div
                key={sess.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCompleted
                    ? 'bg-[#F7F9FC] border-[#E7ECF3] opacity-65'
                    : isToday
                    ? 'bg-white border-[#6857E8]/50 ring-1 ring-[#6857E8]/20 shadow-xs'
                    : 'bg-white border-[#E7ECF3] hover:border-[#6857E8]/40'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <button
                    onClick={() => handleToggleComplete(sess.id)}
                    disabled={isCompleted}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all mt-0.5 sm:mt-0 ${
                      isCompleted
                        ? 'bg-[#238A66] text-white'
                        : 'border-2 border-[#E7ECF3] hover:border-[#238A66] text-transparent hover:text-[#238A66]'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-bold ${
                          isCompleted ? 'line-through text-[#778196]' : 'text-[#172033]'
                        }`}
                      >
                        {sess.topicName || (sess.sessionType === 'final_review' ? 'Final Comprehensive Recap' : 'Exam Session')}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          sess.sessionType === 'revision'
                            ? 'bg-[#FFF2DF] text-[#B97820]'
                            : sess.sessionType === 'practice_quiz'
                            ? 'bg-[#E8F2FF] text-[#3977D6]'
                            : sess.sessionType === 'final_review'
                            ? 'bg-[#E3F8EF] text-[#238A66]'
                            : 'bg-[#F0EEFF] text-[#6857E8]'
                        }`}
                      >
                        {sess.sessionType.replace('_', ' ')}
                      </span>
                      {isToday && (
                        <span className="px-2 py-0.5 rounded bg-[#6857E8] text-white text-[9px] font-black uppercase">
                          Today
                        </span>
                      )}
                      {isSkipped && (
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-500 text-[9px] font-bold">
                          Skipped
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#778196] block mt-0.5">
                      {new Date(sess.scheduledDate).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      &bull; {sess.durationMinutes} mins &bull; {sess.notes}
                    </span>
                  </div>
                </div>

                {/* Session Action Buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  {!isCompleted && !isSkipped && (
                    <button
                      onClick={() => handleToggleComplete(sess.id)}
                      className="px-3 py-1 rounded-lg text-xs font-bold text-[#238A66] bg-[#E3F8EF] hover:bg-[#238A66] hover:text-white transition-all"
                    >
                      Complete
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingSession(sess);
                      setEditDate(sess.scheduledDate);
                      setEditDuration(sess.durationMinutes);
                      setEditNotes(sess.notes || '');
                    }}
                    className="p-1.5 rounded-lg border border-[#E7ECF3] bg-white text-[#778196] hover:text-[#172033] transition-colors"
                    title="Reschedule / Edit session"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {!isCompleted && !isSkipped && (
                    <button
                      onClick={() => handleSkipSession(sess.id)}
                      className="p-1.5 rounded-lg border border-[#E7ECF3] bg-white text-[#778196] hover:text-[#B97820] transition-colors"
                      title="Skip this session"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="p-6 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7ECF3]">
            <h3 className="text-sm font-bold text-[#172033]">
              {currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  const prev = new Date(currentMonthDate);
                  prev.setMonth(prev.getMonth() - 1);
                  setCurrentMonthDate(prev);
                }}
                className="p-1.5 rounded-lg border border-[#E7ECF3] hover:bg-[#F7F9FC]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const next = new Date(currentMonthDate);
                  next.setMonth(next.getMonth() + 1);
                  setCurrentMonthDate(next);
                }}
                className="p-1.5 rounded-lg border border-[#E7ECF3] hover:bg-[#F7F9FC]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-2 text-[10px] font-bold text-[#778196] uppercase">
                {day}
              </div>
            ))}

            {/* Calendar cell rendering */}
            {Array.from({ length: 35 }).map((_, i) => {
              const year = currentMonthDate.getFullYear();
              const month = currentMonthDate.getMonth();
              const firstDayOfMonth = new Date(year, month, 1).getDay();
              const dayNum = i - firstDayOfMonth + 1;
              const dateObj = new Date(year, month, dayNum);
              const dateStr = dateObj.toISOString().split('T')[0];
              const isCurrentMonth = dateObj.getMonth() === month;
              const daySessions = sessions.filter((s: any) => s.scheduledDate === dateStr);

              return (
                <div
                  key={i}
                  className={`min-h-[75px] p-1.5 rounded-xl border text-left flex flex-col justify-between ${
                    isCurrentMonth ? 'bg-white border-[#E7ECF3]' : 'bg-[#F7F9FC]/50 border-transparent opacity-40'
                  }`}
                >
                  <span className="text-[10px] font-bold text-[#778196] block mb-1">
                    {dateObj.getDate()}
                  </span>

                  <div className="space-y-1 overflow-hidden">
                    {daySessions.map((s: any) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setEditingSession(s);
                          setEditDate(s.scheduledDate);
                          setEditDuration(s.durationMinutes);
                          setEditNotes(s.notes || '');
                        }}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded truncate cursor-pointer transition-colors ${
                          s.status === 'completed'
                            ? 'bg-[#E3F8EF] text-[#238A66] line-through'
                            : 'bg-[#F0EEFF] text-[#6857E8] hover:bg-[#6857E8] hover:text-white'
                        }`}
                        title={`${s.topicName || 'Session'} (${s.durationMinutes}m)`}
                      >
                        {s.topicName || s.sessionType}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EDIT / RESCHEDULE SESSION MODAL */}
      {editingSession && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-[#E7ECF3] w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E7ECF3]">
              <h3 className="text-sm font-bold text-[#172033]">Reschedule / Edit Session</h3>
              <button
                onClick={() => setEditingSession(null)}
                className="p-1 text-[#778196] hover:text-[#172033]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#172033] block mb-1">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={e => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E7ECF3] focus:outline-none focus:border-[#6857E8]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#172033] block mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  max="240"
                  step="15"
                  value={editDuration}
                  onChange={e => setEditDuration(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E7ECF3] focus:outline-none focus:border-[#6857E8]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#172033] block mb-1">
                  Session Notes
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  placeholder="Focus topics, formula sheets, etc."
                  className="w-full p-2.5 text-xs rounded-xl border border-[#E7ECF3] focus:outline-none focus:border-[#6857E8]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E7ECF3]">
              <button
                onClick={() => setEditingSession(null)}
                className="px-3 py-1.5 text-xs font-bold text-[#778196]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSessionEdit}
                disabled={isUpdating}
                className="px-4 py-2 bg-[#6857E8] text-white text-xs font-bold rounded-xl hover:bg-[#5645D3]"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
