import React from 'react';
import { StudyLoopLogo } from './StudyLoopLogo.tsx';
import { Flame, PlusCircle, Bell, Menu, X, Calendar, LogOut } from 'lucide-react';

interface NavbarProps {
  user: any;
  streakCount: number;
  onOpenUpload: () => void;
  onOpenMobileMenu: () => void;
  onLogout: () => void;
  onNavigate: (route: string) => void;
  currentRoute: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  streakCount,
  onOpenUpload,
  onOpenMobileMenu,
  onLogout,
  onNavigate,
  currentRoute,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FFFFFF] border-b border-[#E7ECF3] px-4 lg:px-8 py-3 select-none no-print">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-[#778196] hover:text-[#172033] hover:bg-[#F7F9FC] rounded-lg transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => onNavigate('/app/dashboard')}
            className="flex items-center text-left"
          >
            <StudyLoopLogo size="sm" showWordmark={true} />
          </button>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Study Streak Badge */}
          <button
            onClick={() => onNavigate('/app/reminders')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF2DF] border border-[#B97820]/20 text-[#B97820] text-xs font-bold transition-transform hover:scale-105"
            title="Daily Study Streak: Maintained by completing quizzes and study sessions"
          >
            <Flame className="w-4 h-4 text-[#B97820] fill-[#B97820]" />
            <span>{streakCount} {streakCount === 1 ? 'day' : 'days'} streak</span>
          </button>

          {/* Quick Upload CTA */}
          <button
            onClick={onOpenUpload}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#6857E8] hover:bg-[#5645D3] text-white text-xs font-semibold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload Notes</span>
          </button>

          {/* User profile capsule */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-[#E7ECF3]">
            <button
              onClick={() => onNavigate('/app/settings')}
              className="flex items-center gap-2 text-left group"
              title="View settings and profile"
            >
              <div className="w-8 h-8 rounded-full bg-[#F0EEFF] text-[#6857E8] font-bold text-xs flex items-center justify-center border border-[#6857E8]/20 group-hover:border-[#6857E8]">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'SL'}
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-xs font-bold text-[#172033] group-hover:text-[#6857E8] transition-colors leading-tight">
                  {user?.name || 'Student'}
                </span>
                <span className="text-[10px] text-[#778196] leading-tight">
                  {user?.email || 'student@studyloop.edu'}
                </span>
              </div>
            </button>

            <button
              onClick={onLogout}
              className="p-1.5 text-[#778196] hover:text-[#C24141] hover:bg-[#F7F9FC] rounded-lg transition-colors"
              title="Log out of Study Loop"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
