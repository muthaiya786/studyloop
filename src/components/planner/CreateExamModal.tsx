import React, { useState } from 'react';
import { X, Calendar, Plus, Trash2, Sparkles, Loader2, BookOpen } from 'lucide-react';
import { api } from '../../api/client.ts';
import { useToast } from '../common/Toast.tsx';

interface CreateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExamCreated: (newExam: any) => void;
}

export const CreateExamModal: React.FC<CreateExamModalProps> = ({
  isOpen,
  onClose,
  onExamCreated,
}) => {
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [dailyMinutes, setDailyMinutes] = useState(45);
  const [availableDays, setAvailableDays] = useState<string[]>([
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
  ]);
  const [notes, setNotes] = useState('');

  // Syllabus topics list
  const [topics, setTopics] = useState<Array<{ name: string; difficulty: 'easy' | 'medium' | 'hard'; weightPercentage: number }>>([
    { name: 'Core Foundations & Principles', difficulty: 'medium', weightPercentage: 25 },
    { name: 'System Architecture & Topologies', difficulty: 'hard', weightPercentage: 35 },
    { name: 'Practical Applications & Algorithms', difficulty: 'medium', weightPercentage: 40 },
  ]);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDiff, setNewTopicDiff] = useState<'easy' | 'medium' | 'hard'>('medium');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const toggleDay = (day: string) => {
    if (availableDays.includes(day)) {
      if (availableDays.length > 1) {
        setAvailableDays(availableDays.filter(d => d !== day));
      } else {
        showToast('At least one available study day is required.', 'info');
      }
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const handleAddTopic = () => {
    if (!newTopicName.trim()) return;
    setTopics(prev => [
      ...prev,
      {
        name: newTopicName.trim(),
        difficulty: newTopicDiff,
        weightPercentage: Math.max(10, Math.round(100 / (prev.length + 1))),
      },
    ]);
    setNewTopicName('');
    setNewTopicDiff('medium');
  };

  const handleRemoveTopic = (idx: number) => {
    if (topics.length <= 1) {
      showToast('At least one syllabus topic is required.', 'info');
      return;
    }
    setTopics(topics.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim() || !targetDate) {
      setErrorMsg('Please enter an exam title, subject, and valid date.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const res = await api.exams.create({
        title: title.trim(),
        subject: subject.trim(),
        targetDate: new Date(targetDate).toISOString(),
        dailyMinutes,
        availableDays,
        topics,
        notes: notes.trim() || undefined,
      });

      if (res.success && res.exam) {
        showToast('Smart Exam Plan generated successfully!');
        onExamCreated(res.exam);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create exam plan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white border border-[#E7ECF3] w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E7ECF3] flex items-center justify-between bg-[#F7F9FC]">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#6857E8]" />
            <div>
              <h2 className="text-base font-bold text-[#172033]">Create Smart Exam Plan</h2>
              <p className="text-xs text-[#778196]">
                Algorithmically distributed revision timetable with active recall
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#778196] hover:text-[#172033]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold text-[#172033] block mb-1">
                Exam Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Midterm: Organic Chemistry"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E7ECF3] focus:outline-none focus:border-[#6857E8]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172033] block mb-1">
                Subject / Course Code *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. CHEM201"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E7ECF3] focus:outline-none focus:border-[#6857E8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold text-[#172033] block mb-1">
                Exam Date *
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E7ECF3] focus:outline-none focus:border-[#6857E8]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172033] block mb-1">
                Daily Study Duration
              </label>
              <select
                value={dailyMinutes}
                onChange={e => setDailyMinutes(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E7ECF3] focus:outline-none focus:border-[#6857E8] bg-white"
              >
                <option value={30}>30 mins / day</option>
                <option value={45}>45 mins / day (Recommended)</option>
                <option value={60}>60 mins / day</option>
                <option value={90}>90 mins / day</option>
                <option value={120}>120 mins / day</option>
              </select>
            </div>
          </div>

          {/* Available Study Days */}
          <div>
            <label className="text-xs font-bold text-[#172033] block mb-1.5">
              Available Study Days Each Week
            </label>
            <div className="flex flex-wrap gap-1.5">
              {daysOfWeek.map(day => {
                const isSelected = availableDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-[#6857E8] border-[#6857E8] text-white'
                        : 'bg-white border-[#E7ECF3] text-[#778196] hover:bg-[#F7F9FC]'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Syllabus Topics */}
          <div>
            <label className="text-xs font-bold text-[#172033] block mb-1">
              Syllabus Topics to Cover
            </label>
            <div className="space-y-2 mb-2">
              {topics.map((t, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl border border-[#E7ECF3] bg-[#F7F9FC] text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#172033]">{t.name}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                        t.difficulty === 'hard'
                          ? 'bg-[#FFF2DF] text-[#B97820]'
                          : t.difficulty === 'easy'
                          ? 'bg-[#E3F8EF] text-[#238A66]'
                          : 'bg-[#E8F2FF] text-[#3977D6]'
                      }`}
                    >
                      {t.difficulty}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTopic(idx)}
                    className="text-[#778196] hover:text-[#C24141] p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Topic Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTopicName}
                onChange={e => setNewTopicName(e.target.value)}
                placeholder="Add topic (e.g. Reaction Kinetics)"
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-[#E7ECF3] focus:outline-none focus:border-[#6857E8]"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTopic();
                  }
                }}
              />
              <select
                value={newTopicDiff}
                onChange={e => setNewTopicDiff(e.target.value as any)}
                className="px-2 py-1.5 text-xs rounded-xl border border-[#E7ECF3] bg-white focus:outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <button
                type="button"
                onClick={handleAddTopic}
                className="px-3 py-1.5 rounded-xl bg-[#F0EEFF] text-[#6857E8] font-bold text-xs hover:bg-[#6857E8] hover:text-white transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-[#FFF2DF] text-[#C24141] text-xs rounded-xl border border-[#C24141]/20">
              {errorMsg}
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-3 border-t border-[#E7ECF3] flex items-center justify-between">
            <span className="text-[11px] text-[#778196]">
              Study Loop allocates revision days &amp; practice quizzes automatically
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-[#778196]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#6857E8] hover:bg-[#5645D3] disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-[#6857E8]/20 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Distributing Sessions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Revision Plan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
