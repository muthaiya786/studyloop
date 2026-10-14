import React, { useState, useEffect } from 'react';
import {
  BellRing,
  Flame,
  Clock,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Save,
  Loader2,
} from 'lucide-react';
import { api } from '../../api/client.ts';
import { useToast } from '../common/Toast.tsx';

export const RemindersView: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Reminder preferences
  const [browserEnabled, setBrowserEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [scheduledHour, setScheduledHour] = useState(18);
  const [scheduledMinute, setScheduledMinute] = useState(30);
  const [daysOfWeek, setDaysOfWeek] = useState<string>('1,2,3,4,5');

  // Streak state
  const [streak, setStreak] = useState<{ currentStreak: number; longestStreak: number; activeDays: string[] }>({
    currentStreak: 0,
    longestStreak: 0,
    activeDays: [],
  });

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const res = await api.reminders.get();
      if (res.success) {
        if (res.reminders) {
          setBrowserEnabled(res.reminders.browserEnabled);
          setEmailEnabled(res.reminders.emailEnabled);
          setScheduledHour(res.reminders.scheduledHour);
          setScheduledMinute(res.reminders.scheduledMinute);
          setDaysOfWeek(res.reminders.daysOfWeek || '1,2,3,4,5');
        }
        if (res.streak) {
          setStreak(res.streak);
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load reminder preferences', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const requestBrowserNotifications = async () => {
    if (typeof Notification === 'undefined') {
      showToast('Notifications are not supported in this browser.', 'error');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        setBrowserEnabled(true);
        showToast('Browser notifications enabled!');
        new Notification('Study Loop Reminders Active', {
          body: 'Your study rhythm notifications are now active.',
          icon: '/favicon.ico',
        });
      } else {
        setBrowserEnabled(false);
        showToast('Notification permission was denied or dismissed.', 'info');
      }
    } catch (err: any) {
      showToast('Error requesting permission: ' + err.message, 'error');
    }
  };

  const handleSavePreferences = async () => {
    try {
      setIsSaving(true);
      const res = await api.reminders.update({
        browserEnabled,
        emailEnabled,
        scheduledHour,
        scheduledMinute,
        daysOfWeek,
      });
      if (res.success) {
        showToast('Reminder preferences saved successfully!');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save preferences', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDayOfWeek = (dayNum: number) => {
    const list = daysOfWeek.split(',').filter(Boolean).map(n => parseInt(n, 10));
    let nextList: number[];
    if (list.includes(dayNum)) {
      if (list.length <= 1) {
        showToast('At least one day must be active for daily study reminders.', 'info');
        return;
      }
      nextList = list.filter(d => d !== dayNum);
    } else {
      nextList = [...list, dayNum].sort((a, b) => a - b);
    }
    setDaysOfWeek(nextList.join(','));
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#6857E8]" />
      </div>
    );
  }

  const daysLabels = [
    { num: 1, label: 'Mon' },
    { num: 2, label: 'Tue' },
    { num: 3, label: 'Wed' },
    { num: 4, label: 'Thu' },
    { num: 5, label: 'Fri' },
    { num: 6, label: 'Sat' },
    { num: 0, label: 'Sun' },
  ];
  const activeDayNums = daysOfWeek.split(',').map(n => parseInt(n, 10));

  // 14-day history calendar squares
  const recentDays = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const str = d.toISOString().split('T')[0];
    const isStudied = streak.activeDays.includes(str);
    return {
      dateStr: str,
      dayLabel: d.toLocaleDateString(undefined, { weekday: 'narrow' }),
      isStudied,
    };
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-black text-[#172033] tracking-tight">
            Reminders &amp; Study Streak
          </h1>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF2DF] text-[#B97820] flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 fill-[#B97820]" />
            Streak Engine
          </span>
        </div>
        <p className="text-xs text-[#778196]">
          Set your rhythm. Streaks are calculated from real completed study activity, not just logins.
        </p>
      </div>

      {/* Streak Showcase Card */}
      <div className="p-6 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF2DF] text-[#B97820] flex items-center justify-center shrink-0">
              <Flame className="w-8 h-8 fill-[#B97820]" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#778196]">
                Current Study Streak
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#172033]">
                  {streak.currentStreak}
                </span>
                <span className="text-xs font-bold text-[#B97820]">
                  {streak.currentStreak === 1 ? 'day in rhythm' : 'days in rhythm'}
                </span>
              </div>
              <span className="text-xs text-[#778196]">
                Longest consecutive run: {streak.longestStreak} days
              </span>
            </div>
          </div>

          <div className="p-3 bg-[#F7F9FC] rounded-xl border border-[#E7ECF3] text-xs text-[#778196] max-w-xs">
            <strong className="text-[#172033] block mb-0.5">Authentic Verification:</strong>
            Streaks require completing at least one quiz attempt, flashcard session, or scheduled study task within your local day.
          </div>
        </div>

        {/* 14-Day Activity Heatmap */}
        <div className="pt-4 border-t border-[#E7ECF3]">
          <span className="text-xs font-bold text-[#172033] block mb-2.5">
            Past 14 Days Activity Rhythm
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {recentDays.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1 shrink-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    day.isStudied
                      ? 'bg-[#238A66] text-white shadow-xs'
                      : 'bg-[#F7F9FC] border border-[#E7ECF3] text-[#778196]'
                  }`}
                  title={`${day.dateStr}: ${day.isStudied ? 'Studied' : 'No activity logged'}`}
                >
                  {day.isStudied ? '✓' : ''}
                </div>
                <span className="text-[10px] text-[#778196]">{day.dayLabel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reminder Preferences Card */}
      <div className="p-6 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7ECF3]">
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-[#6857E8]" />
            <h2 className="text-sm font-bold text-[#172033]">Daily Revision Reminders</h2>
          </div>
          <span className="text-xs text-[#778196]">Local Timezone: America/New_York</span>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Browser Notifications Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-[#E7ECF3] bg-[#F7F9FC]">
            <div>
              <span className="text-xs font-bold text-[#172033] block">
                Browser Push Notifications
              </span>
              <span className="text-[11px] text-[#778196]">
                Receive prompt reminders on your desktop or mobile browser.
              </span>
            </div>
            <div className="flex items-center gap-2">
              {notificationPermission !== 'granted' && (
                <button
                  type="button"
                  onClick={requestBrowserNotifications}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#F0EEFF] text-[#6857E8] hover:bg-[#6857E8] hover:text-white transition-all"
                >
                  Request Permission
                </button>
              )}
              <input
                type="checkbox"
                checked={browserEnabled}
                onChange={e => {
                  if (e.target.checked && notificationPermission !== 'granted') {
                    requestBrowserNotifications();
                  } else {
                    setBrowserEnabled(e.target.checked);
                  }
                }}
                className="w-4 h-4 accent-[#6857E8]"
              />
            </div>
          </div>

          {/* Email Notifications Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-[#E7ECF3] bg-[#F7F9FC]">
            <div>
              <span className="text-xs font-bold text-[#172033] block">
                Email Daily Digest
              </span>
              <span className="text-[11px] text-[#778196]">
                Receive today's study schedule and weakest topic recommendation by email.
              </span>
            </div>
            <input
              type="checkbox"
              checked={emailEnabled}
              onChange={e => setEmailEnabled(e.target.checked)}
              className="w-4 h-4 accent-[#6857E8]"
            />
          </div>

          {/* Preferred Study Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-[#172033] block mb-1">
                Preferred Study Time
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={`${String(scheduledHour).padStart(2, '0')}:${String(scheduledMinute).padStart(2, '0')}`}
                  onChange={e => {
                    const [h, m] = e.target.value.split(':').map(Number);
                    setScheduledHour(h);
                    setScheduledMinute(m);
                  }}
                  className="px-3 py-2 text-xs font-bold rounded-xl border border-[#E7ECF3] bg-white text-[#172033] focus:outline-none focus:border-[#6857E8]"
                />
                <span className="text-xs text-[#778196]">Daily scheduled notification</span>
              </div>
            </div>

            {/* Days of week */}
            <div>
              <label className="text-xs font-bold text-[#172033] block mb-1.5">
                Active Reminder Days
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {daysLabels.map(d => {
                  const isActive = activeDayNums.includes(d.num);
                  return (
                    <button
                      key={d.num}
                      type="button"
                      onClick={() => toggleDayOfWeek(d.num)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                        isActive
                          ? 'bg-[#6857E8] border-[#6857E8] text-white'
                          : 'bg-white border-[#E7ECF3] text-[#778196] hover:bg-[#F7F9FC]'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Save button footer */}
        <div className="pt-4 border-t border-[#E7ECF3] flex justify-end">
          <button
            onClick={handleSavePreferences}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#6857E8] hover:bg-[#5645D3] disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-[#6857E8]/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Reminder Preferences'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
