import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck2,
  BookOpen,
  HelpCircle,
  TrendingUp,
  BellRing,
  Settings,
  Sparkles,
  Flame,
  X,
  Share2,
} from 'lucide-react';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  streakCount: number;
  activeDeckId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  mobileOpen,
  onCloseMobile,
  streakCount,
  activeDeckId,
}) => {
  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      route: '/app/dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'planner',
      label: 'Study Planner',
      route: '/app/planner',
      icon: CalendarCheck2,
    },
    {
      id: 'library',
      label: 'My Notes & Decks',
      route: '/app/library',
      icon: BookOpen,
    },
    {
      id: 'quiz',
      label: 'Quiz Practice',
      route: activeDeckId ? `/app/quiz/${activeDeckId}` : '/app/quiz',
      icon: HelpCircle,
    },
    {
      id: 'progress',
      label: 'Progress',
      route: '/app/progress',
      icon: TrendingUp,
    },
    {
      id: 'reminders',
      label: 'Reminders',
      route: '/app/reminders',
      icon: BellRing,
    },
    {
      id: 'settings',
      label: 'Settings',
      route: '/app/settings',
      icon: Settings,
    },
  ];

  const handleNavClick = (route: string) => {
    onNavigate(route);
    onCloseMobile();
  };

  const isItemActive = (itemRoute: string) => {
    if (itemRoute === '/app/dashboard' && currentRoute === '/app/dashboard') return true;
    if (itemRoute.startsWith('/app/planner') && currentRoute.startsWith('/app/planner')) return true;
    if (itemRoute.startsWith('/app/library') && (currentRoute.startsWith('/app/library') || currentRoute.startsWith('/app/decks'))) return true;
    if (itemRoute.startsWith('/app/quiz') && currentRoute.startsWith('/app/quiz')) return true;
    if (itemRoute.startsWith('/app/progress') && currentRoute.startsWith('/app/progress')) return true;
    if (itemRoute.startsWith('/app/reminders') && currentRoute.startsWith('/app/reminders')) return true;
    if (itemRoute.startsWith('/app/settings') && currentRoute.startsWith('/app/settings')) return true;
    return false;
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between py-5 px-3">
      {/* Top Nav links */}
      <div className="space-y-6">
        <div className="px-3 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#778196]">
            Study Navigation
          </span>
          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 text-[#778196] hover:text-[#172033]"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="space-y-1">
          {navItems.map(item => {
            const active = isItemActive(item.route);
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.route)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all select-none ${
                  active
                    ? 'bg-[#F0EEFF] text-[#6857E8] shadow-xs'
                    : 'text-[#778196] hover:text-[#172033] hover:bg-[#F7F9FC]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    active ? 'text-[#6857E8]' : 'text-[#778196]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
                {item.id === 'quiz' && (
                  <span className="ml-auto text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-[#E8F2FF] text-[#3977D6]">
                    Adaptive
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom info banner */}
      <div className="space-y-3 px-2">
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#F0EEFF] to-[#FFFFFF] border border-[#6857E8]/20">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-[#6857E8]" />
            <span className="text-xs font-bold text-[#172033]">Adaptive Learning</span>
          </div>
          <p className="text-[11px] text-[#778196] leading-relaxed mb-2.5">
            Quizzes automatically prioritize topics where your mastery is below 70%.
          </p>
          <div className="flex items-center justify-between text-[11px] font-bold text-[#6857E8]">
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-[#B97820] fill-[#B97820]" />
              {streakCount} Day Streak
            </span>
            <button
              onClick={() => handleNavClick('/app/progress')}
              className="hover:underline text-[11px] font-semibold text-[#6857E8]"
            >
              View Analytics &rarr;
            </button>
          </div>
        </div>

        <div className="text-center text-[10px] text-[#778196]">
          Study Loop v1.0 &bull; In rhythm.
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-[#FFFFFF] border-r border-[#E7ECF3] min-h-[calc(100vh-61px)] no-print">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex no-print"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-xs bg-white h-full shadow-2xl z-10 flex flex-col">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
