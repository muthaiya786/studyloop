import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Printer,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ExternalLink,
  Loader2,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';
import { StudyLoopLogo } from '../common/StudyLoopLogo.tsx';
import { api } from '../../api/client.ts';

interface SharedDeckViewProps {
  shareToken: string;
  onNavigate: (route: string) => void;
}

export const SharedDeckView: React.FC<SharedDeckViewProps> = ({
  shareToken,
  onNavigate,
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards'>('summary');

  // Flashcards state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const fetchShared = async () => {
      try {
        setLoading(true);
        const res = await api.shared.getByToken(shareToken);
        if (res.success) {
          setData(res);
        }
      } catch (err: any) {
        setError(err.message || 'Shared deck not found or link has expired.');
      } finally {
        setLoading(false);
      }
    };
    fetchShared();
  }, [shareToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-6 select-none">
        <div className="flex flex-col items-center gap-2 text-[#778196]">
          <Loader2 className="w-8 h-8 animate-spin text-[#6857E8]" />
          <span className="text-xs font-semibold">Loading shared study deck...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-6 select-none">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-[#E7ECF3] shadow-lg text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-[#C24141] mx-auto" />
          <h2 className="text-lg font-bold text-[#172033]">Study Deck Unavailable</h2>
          <p className="text-xs text-[#778196]">{error || 'This link has expired or was revoked by its owner.'}</p>
          <button
            onClick={() => onNavigate('/')}
            className="px-4 py-2 bg-[#6857E8] text-white text-xs font-bold rounded-xl"
          >
            Visit Study Loop Homepage
          </button>
        </div>
      </div>
    );
  }

  const { deck, summary, flashcards, questionsCount } = data;
  const currentCard = flashcards[cardIndex];

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#172033] select-none">
      {/* Top Banner */}
      <header className="bg-white border-b border-[#E7ECF3] px-6 py-3.5 sticky top-0 z-30 no-print">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => onNavigate('/')} className="flex items-center">
            <StudyLoopLogo size="sm" showWordmark={true} />
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E7ECF3] text-xs font-bold hover:bg-[#F7F9FC] text-[#172033]"
            >
              <Printer className="w-4 h-4 text-[#778196]" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={() => onNavigate('/signup')}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-[#6857E8] hover:bg-[#5645D3] text-white text-xs font-bold transition-all shadow-xs"
            >
              <span>Build My Study Plan &rarr;</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Deck Title Header */}
        <div className="p-6 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#F0EEFF] text-[#6857E8] text-[10px] font-bold uppercase tracking-wider">
              {deck.subject}
            </span>
            <span className="text-[11px] text-[#778196] font-medium">Read-Only Shared Study Deck</span>
          </div>
          <h1 className="text-2xl font-black text-[#172033]">{deck.title}</h1>
          <p className="text-xs text-[#778196]">
            {flashcards.length} Flashcards &bull; {questionsCount} Quiz Questions &bull; Publicly shared
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-[#E7ECF3] no-print">
          <button
            onClick={() => setActiveTab('summary')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'summary'
                ? 'border-[#6857E8] text-[#6857E8]'
                : 'border-transparent text-[#778196] hover:text-[#172033]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Summary &amp; Definitions</span>
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'flashcards'
                ? 'border-[#6857E8] text-[#6857E8]'
                : 'border-transparent text-[#778196] hover:text-[#172033]'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Flashcards ({flashcards.length})</span>
          </button>
        </div>

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6857E8]">
                Topic Overview
              </h3>
              <p className="text-sm text-[#172033] leading-relaxed">
                {summary?.overview || deck.description}
              </p>
            </div>

            {summary?.keyConcepts && (
              <div className="p-6 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#172033]">
                  Key Concepts
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {summary.keyConcepts.map((kc: any, i: number) => (
                    <div key={i} className="p-3.5 rounded-xl border border-[#E7ECF3] bg-[#F7F9FC]">
                      <h4 className="text-xs font-bold text-[#172033] mb-1">{kc.title}</h4>
                      <p className="text-xs text-[#778196] leading-relaxed">{kc.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {summary?.definitions && (
              <div className="p-6 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#172033]">
                  Definitions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {summary.definitions.map((def: any, i: number) => (
                    <div key={i} className="p-3.5 rounded-xl border border-[#E7ECF3] bg-white">
                      <span className="text-xs font-bold text-[#6857E8] block mb-1">{def.term}</span>
                      <p className="text-xs text-[#172033]">{def.definition}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Flashcards Tab */}
        {activeTab === 'flashcards' && flashcards.length > 0 && (
          <div className="max-w-xl mx-auto space-y-4 no-print">
            <div className="flex items-center justify-between text-xs text-[#778196]">
              <span className="font-bold text-[#172033]">
                Card {cardIndex + 1} of {flashcards.length}
              </span>
              <button
                onClick={() => {
                  setCardIndex(0);
                  setIsFlipped(false);
                }}
                className="flex items-center gap-1 hover:text-[#172033]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart</span>
              </button>
            </div>

            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className={`min-h-[260px] p-8 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between text-center ${
                isFlipped ? 'bg-[#F0EEFF] border-[#6857E8]/40' : 'bg-white border-[#E7ECF3]'
              }`}
            >
              <span className="text-[10px] font-bold text-[#778196] uppercase tracking-wider">
                {currentCard?.topic || deck.subject}
              </span>
              <div className="my-auto py-4">
                {!isFlipped ? (
                  <p className="text-base font-bold text-[#172033]">{currentCard?.front}</p>
                ) : (
                  <p className="text-sm text-[#172033] font-normal leading-relaxed">{currentCard?.back}</p>
                )}
              </div>
              <span className="text-[11px] text-[#6857E8] font-semibold">
                {isFlipped ? 'Answer Revealed' : 'Click to Flip'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setCardIndex(prev => (prev - 1 >= 0 ? prev - 1 : flashcards.length - 1));
                }}
                className="px-3 py-1.5 text-xs font-bold text-[#778196] border border-[#E7ECF3] bg-white rounded-lg hover:text-[#172033]"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setCardIndex(prev => (prev + 1 < flashcards.length ? prev + 1 : 0));
                }}
                className="px-3 py-1.5 text-xs font-bold text-[#6857E8] border border-[#6857E8]/30 bg-[#F0EEFF] rounded-lg hover:bg-[#6857E8] hover:text-white transition-all"
              >
                Next Card
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
