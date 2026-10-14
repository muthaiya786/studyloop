import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Clock,
  Download,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Shield,
} from 'lucide-react';
import { api } from '../../api/client.ts';
import { useToast } from '../common/Toast.tsx';

interface SettingsViewProps {
  user: any;
  onUserUpdated: (updatedUser: any) => void;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUserUpdated,
  onLogout,
}) => {
  const { showToast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(
    user?.settings?.dailyStudyGoalMinutes || 45
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setTimezone(user.timezone || 'UTC');
      if (user.settings) {
        setDailyGoalMinutes(user.settings.dailyStudyGoalMinutes || 45);
      }
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await api.settings.update({
        name,
        timezone,
        settings: {
          dailyStudyGoalMinutes: dailyGoalMinutes,
        },
      });
      if (res.success && res.user) {
        showToast('Settings updated successfully!');
        onUserUpdated(res.user);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      // Fetch fresh data for export
      const [dash, decks, exams, progress] = await Promise.all([
        api.dashboard.get(),
        api.decks.getAll(),
        api.exams.getAll(),
        api.progress.get(),
      ]);

      const exportBundle = {
        exportedAt: new Date().toISOString(),
        user: { name: user.name, email: user.email, timezone },
        dashboard: dash.data,
        decks: decks.decks,
        exams: exams.exams,
        progress,
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `study_loop_export_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast('Export downloaded successfully!');
    } catch (err: any) {
      showToast('Export failed: ' + err.message, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await api.settings.deleteAccount();
      showToast('Account permanently removed.');
      onLogout();
    } catch (err: any) {
      showToast('Delete failed: ' + err.message, 'error');
      setIsDeleting(false);
    }
  };

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Singapore',
    'Asia/Kolkata',
    'Australia/Sydney',
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 select-none">
      <div>
        <h1 className="text-2xl font-black text-[#172033] tracking-tight">Account &amp; Study Settings</h1>
        <p className="text-xs text-[#778196]">
          Manage profile credentials, timezone alignment, data archives, and preferences.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Profile Card */}
        <div className="p-6 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E7ECF3]">
            <User className="w-5 h-5 text-[#6857E8]" />
            <h2 className="text-sm font-bold text-[#172033]">Personal Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#172033] block mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E7ECF3] focus:outline-none focus:border-[#6857E8]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172033] block mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E7ECF3] bg-[#F7F9FC] text-[#778196] cursor-not-allowed"
              />
              <span className="text-[10px] text-[#778196] block mt-0.5">
                Primary login credential
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-[#172033] block mb-1">
                Timezone (Used for Streak &amp; Reminder scheduling)
              </label>
              <select
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E7ECF3] focus:outline-none focus:border-[#6857E8] bg-white text-[#172033]"
              >
                {timezones.map(tz => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#172033] block mb-1">
                Daily Study Goal (Minutes)
              </label>
              <input
                type="number"
                min="15"
                max="360"
                step="15"
                value={dailyGoalMinutes}
                onChange={e => setDailyGoalMinutes(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E7ECF3] focus:outline-none focus:border-[#6857E8]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#E7ECF3] flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#6857E8] hover:bg-[#5645D3] disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-[#6857E8]/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Data Export Card */}
      <div className="p-6 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-[#3977D6]" />
            <h3 className="text-sm font-bold text-[#172033]">Export All Study Data</h3>
          </div>
          <p className="text-xs text-[#778196] mt-0.5">
            Download your notes, flashcards, questions, exam schedules, and quiz attempts in standard JSON format.
          </p>
        </div>

        <button
          onClick={handleExportData}
          disabled={isExporting}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E7ECF3] bg-white hover:bg-[#F7F9FC] text-[#172033] text-xs font-bold transition-all shrink-0"
        >
          <Download className="w-4 h-4 text-[#3977D6]" />
          <span>{isExporting ? 'Exporting...' : 'Download Archive'}</span>
        </button>
      </div>

      {/* Danger Zone */}
      <div className="p-6 rounded-2xl bg-white border border-[#C24141]/30 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#C24141]" />
          <h3 className="text-sm font-bold text-[#C24141]">Danger Zone</h3>
        </div>
        <p className="text-xs text-[#778196] leading-relaxed">
          Permanently delete your Study Loop account and all generated study materials, adaptive quiz attempts, and exam schedules.
        </p>

        <div className="pt-2">
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFF2DF] hover:bg-[#C24141] hover:text-white border border-[#C24141]/30 text-[#C24141] text-xs font-bold transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account &amp; Data</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-[#E7ECF3] w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-[#C24141]">Confirm Account Deletion</h3>
            <p className="text-xs text-[#778196] leading-relaxed">
              This will permanently purge your student account and all study decks. This action cannot be reversed.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-3 py-1.5 text-xs font-bold text-[#778196]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-4 py-2 bg-[#C24141] text-white text-xs font-bold rounded-xl"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
