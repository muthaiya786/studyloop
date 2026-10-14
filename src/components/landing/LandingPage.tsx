import React, { useState } from 'react';
import { StudyLoopLogo } from '../common/StudyLoopLogo.tsx';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  CalendarCheck2,
  HelpCircle,
  TrendingUp,
  Flame,
  CheckCircle2,
  Shield,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (route: string) => void;
  onQuickDemoLogin?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onQuickDemoLogin,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Study Loop turn notes into study materials?',
      a: 'Study Loop accepts PDF lecture slides, TXT notes, or Markdown outlines. Our server-side AI model extracts key concepts, creates executive summaries, active recall flashcards with question-and-explanation pairs, and rigorous multiple-choice assessments.',
    },
    {
      q: 'What makes the quiz system truly adaptive?',
      a: "Unlike static quiz apps, Study Loop tracks your mastery percentage across every individual topic. When you take subsequent quizzes, questions from low-mastery topics (<70%) and concepts you previously missed are weighted and prioritized automatically.",
    },
    {
      q: 'How does the Smart Exam Planner distribute study sessions?',
      a: 'You enter your target examination date, daily available time, and syllabus topics. Study Loop calculates the days remaining, schedules core study sessions, inserts revision and practice quiz checkpoints every few days, and reserves the final days for comprehensive mock reviews.',
    },
    {
      q: 'How are study streaks calculated?',
      a: 'Streaks are awarded only for verified study activity (completing a quiz, reviewing flashcards, or finishing a scheduled session) in your local timezone, not just opening the webpage.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#172033] select-none">
      {/* Public Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E7ECF3] px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <StudyLoopLogo size="md" showWordmark={true} />

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => onNavigate('/login')}
              className="text-xs sm:text-sm font-bold text-[#778196] hover:text-[#172033] px-3 py-1.5 transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => onNavigate('/signup')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6857E8] hover:bg-[#5645D3] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#6857E8]/20 transition-all hover:scale-[1.02]"
            >
              <span>Build My Study Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 lg:px-8 pt-16 pb-20 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F0EEFF] border border-[#6857E8]/20 text-[#6857E8] text-xs font-bold uppercase tracking-wider animate-in fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Your study, in rhythm.</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#172033] tracking-tight leading-[1.12]">
          Study smarter. <br className="hidden sm:inline" />
          <span className="text-[#6857E8]">Walk into exams prepared.</span>
        </h1>

        <p className="text-base sm:text-lg text-[#778196] max-w-2xl mx-auto leading-relaxed">
          Upload your syllabus and notes, get a personalized revision plan, and practice quizzes that adapt to what you don't know.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <button
            onClick={() => onNavigate('/signup')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#6857E8] hover:bg-[#5645D3] text-white text-sm font-black shadow-lg shadow-[#6857E8]/25 transition-all hover:scale-[1.02]"
          >
            <span>Build My Study Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          {onQuickDemoLogin && (
            <button
              onClick={onQuickDemoLogin}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-[#F7F9FC] border border-[#E7ECF3] text-[#172033] text-sm font-bold shadow-xs transition-all"
            >
              <span>Explore Demo Workspace &rarr;</span>
            </button>
          )}
        </div>

        {/* Feature Badges */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-5 text-xs text-[#778196]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#238A66]" />
            PDF, TXT &amp; Markdown Notes
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#238A66]" />
            Adaptive Topic Mastery
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#238A66]" />
            Exam Calendar Distribution
          </span>
        </div>
      </section>

      {/* Live Preview Mockup Card */}
      <section className="px-4 lg:px-8 pb-20 max-w-5xl mx-auto">
        <div className="rounded-3xl border border-[#E7ECF3] bg-white shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E7ECF3]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#C24141]/80" />
              <span className="w-3 h-3 rounded-full bg-[#B97820]/80" />
              <span className="w-3 h-3 rounded-full bg-[#238A66]/80" />
              <span className="text-xs font-bold text-[#778196] ml-2">Study Loop Workspace &bull; CS301 Distributed Systems</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-md bg-[#E3F8EF] text-[#238A66] text-[10px] font-black uppercase">
              Adaptive Loop Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#E7ECF3] space-y-2">
              <span className="text-[10px] font-bold text-[#6857E8] uppercase tracking-wider">1. Extracted Concept</span>
              <h4 className="text-xs font-bold text-[#172033]">The CAP Theorem</h4>
              <p className="text-[11px] text-[#778196] leading-relaxed">
                Partition tolerance (P) is inevitable in distributed networks, requiring an explicit architectural trade-off between Consistency (C) and Availability (A).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF2DF]/40 border border-[#B97820]/30 space-y-2">
              <span className="text-[10px] font-bold text-[#B97820] uppercase tracking-wider">2. Identified Weak Concept</span>
              <h4 className="text-xs font-bold text-[#172033]">Raft Leader Election Timeouts</h4>
              <p className="text-[11px] text-[#778196] leading-relaxed">
                Current topic mastery: <strong>45%</strong>. Study Loop automatically schedules targeted revision sessions before exam day.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#E8F2FF]/40 border border-[#3977D6]/30 space-y-2">
              <span className="text-[10px] font-bold text-[#3977D6] uppercase tracking-wider">3. Exam Revision Rhythm</span>
              <h4 className="text-xs font-bold text-[#172033]">7 Days Until Examination</h4>
              <p className="text-[11px] text-[#778196] leading-relaxed">
                Daily 45-min sessions distributed across available days with a dedicated mock assessment and formula sheet recap.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-20 border-y border-[#E7ECF3] px-4 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6857E8]">
              The 3-Step Study Loop
            </span>
            <h2 className="text-3xl font-black text-[#172033]">
              From messy notes to total exam confidence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-[#F7F9FC] border border-[#E7ECF3] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F0EEFF] text-[#6857E8] font-black text-sm flex items-center justify-center">
                1
              </div>
              <h3 className="text-base font-bold text-[#172033]">Upload Notes &amp; Syllabus</h3>
              <p className="text-xs text-[#778196] leading-relaxed">
                Drag and drop your lecture PDFs, plain text summaries, or syllabus outline. Edit raw text right in your browser before generation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F7F9FC] border border-[#E7ECF3] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8F2FF] text-[#3977D6] font-black text-sm flex items-center justify-center">
                2
              </div>
              <h3 className="text-base font-bold text-[#172033]">Generate Structured Rhythm</h3>
              <p className="text-xs text-[#778196] leading-relaxed">
                Study Loop synthesizes high-yield executive summaries, active recall flashcards, and balanced calendar revision sessions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F7F9FC] border border-[#E7ECF3] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#E3F8EF] text-[#238A66] font-black text-sm flex items-center justify-center">
                3
              </div>
              <h3 className="text-base font-bold text-[#172033]">Practice Adaptive Quizzes</h3>
              <p className="text-xs text-[#778196] leading-relaxed">
                Take tests that dynamically adapt. Missed concepts resurface in future rounds until topic mastery reaches 100%.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 lg:px-8 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-[#172033]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-[#778196]">
            Everything you need to know about Study Loop's architecture and learning engine.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#E7ECF3] bg-white overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-sm font-bold text-[#172033] hover:text-[#6857E8] transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-[#6857E8]" /> : <ChevronDown className="w-4 h-4 shrink-0 text-[#778196]" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-[#778196] leading-relaxed border-t border-[#E7ECF3] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Final CTA Bar */}
      <section className="px-4 lg:px-8 pb-20 max-w-5xl mx-auto">
        <div className="p-10 rounded-3xl bg-gradient-to-br from-[#6857E8] to-[#5645D3] text-white text-center space-y-4 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Ready to find your study rhythm?
          </h2>
          <p className="text-xs sm:text-sm text-white/80 max-w-md mx-auto leading-relaxed">
            Create your account today, upload your first lecture notes, and get an exam plan tailored to your schedule.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('/signup')}
              className="px-8 py-3.5 rounded-xl bg-white text-[#6857E8] hover:bg-[#F0EEFF] text-sm font-black shadow-md transition-all hover:scale-105"
            >
              Build My Study Plan &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E7ECF3] bg-white py-8 px-4 lg:px-8 text-xs text-[#778196]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <StudyLoopLogo size="sm" showWordmark={true} />
          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate('/login')} className="hover:text-[#172033]">
              Login
            </button>
            <button onClick={() => onNavigate('/signup')} className="hover:text-[#172033]">
              Sign Up
            </button>
            <button onClick={() => onNavigate('/privacy')} className="hover:text-[#172033]">
              Privacy Policy
            </button>
            <button onClick={() => onNavigate('/terms')} className="hover:text-[#172033]">
              Terms of Service
            </button>
          </div>
          <span>&copy; 2026 Study Loop Inc. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};
