import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  HelpCircle,
  Share2,
  Printer,
  Trash2,
  Shuffle,
  RotateCcw,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  ShieldAlert,
  Loader2,
  Tag,
  GraduationCap,
} from 'lucide-react';
import { api } from '../../api/client.ts';
import { useToast } from '../common/Toast.tsx';

interface DeckDetailViewProps {
  deckId: string;
  onNavigate: (route: string) => void;
  onBack: () => void;
}

export const DeckDetailView: React.FC<DeckDetailViewProps> = ({
  deckId,
  onNavigate,
  onBack,
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards' | 'questions'>('summary');

  // Flashcard interaction state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcardList, setFlashcardList] = useState<any[]>([]);

  // Share Modal state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState<any>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDeck = async () => {
    try {
      setLoading(true);
      const res = await api.decks.getById(deckId);
      if (res.success) {
        setData(res);
        setFlashcardList(res.flashcards || []);
        if (res.shareLink) {
          setShareLink(res.shareLink);
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load deck', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeck();
  }, [deckId]);

  // Flashcard controls
  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex(prev => (prev + 1 < flashcardList.length ? prev + 1 : 0));
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex(prev => (prev - 1 >= 0 ? prev - 1 : flashcardList.length - 1));
  };

  const handleShuffleCards = () => {
    setIsFlipped(false);
    const shuffled = [...flashcardList].sort(() => Math.random() - 0.5);
    setFlashcardList(shuffled);
    setCurrentCardIndex(0);
    showToast('Flashcards shuffled!');
  };

  const handleRestartCards = () => {
    setIsFlipped(false);
    setCurrentCardIndex(0);
    showToast('Flashcards reset to beginning.');
  };

  const handleReviewCard = async (knewIt: boolean) => {
    const card = flashcardList[currentCardIndex];
    if (!card) return;

    try {
      await api.flashcards.review(card.id, knewIt);
      showToast(knewIt ? 'Recorded as Mastered!' : 'Marked for Review Again.');
      handleNextCard();
    } catch (err: any) {
      showToast('Could not record review: ' + err.message, 'error');
    }
  };

  // Share actions
  const handleOpenShare = async () => {
    setShareModalOpen(true);
    if (!shareLink) {
      try {
        setIsSharing(true);
        const res = await api.decks.share(deckId);
        if (res.success && res.shareLink) {
          setShareLink(res.shareLink);
        }
      } catch (err: any) {
        showToast('Failed to create share link: ' + err.message, 'error');
      } finally {
        setIsSharing(false);
      }
    }
  };

  const handleCopyShareLink = () => {
    if (!shareLink?.shareToken) return;
    const url = `${window.location.origin}/share/${shareLink.shareToken}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        showToast('Share link copied to clipboard!');
      })
      .catch(() => {
        showToast('Please copy link manually: ' + url, 'info');
      });
  };

  const handleRevokeShare = async () => {
    try {
      setIsSharing(true);
      await api.decks.revokeShare(deckId);
      setShareLink(null);
      showToast('Share link revoked.');
      setShareModalOpen(false);
    } catch (err: any) {
      showToast('Failed to revoke share: ' + err.message, 'error');
    } finally {
      setIsSharing(false);
    }
  };

  const handleDeleteDeck = async () => {
    try {
      setIsDeleting(true);
      await api.decks.delete(deckId);
      showToast('Deck deleted successfully.');
      onNavigate('/app/library');
    } catch (err: any) {
      showToast('Failed to delete deck: ' + err.message, 'error');
      setIsDeleting(false);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  if (loading || !data) {
    return (
      <div className="p-8 max-w-5xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2 text-[#778196]">
          <Loader2 className="w-8 h-8 animate-spin text-[#6857E8]" />
          <span className="text-xs font-semibold">Loading study deck...</span>
        </div>
      </div>
    );
  }

  const { deck, summary, questionsCount } = data;
  const currentCard = flashcardList[currentCardIndex];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 select-none">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-[#E7ECF3] bg-white text-[#778196] hover:text-[#172033] hover:bg-[#F7F9FC] transition-colors"
            aria-label="Back to library"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#172033] tracking-tight">
                {deck.title}
              </h1>
              {deck.isDemoMode ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF2DF] text-[#B97820]">
                  Demo Generated
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0EEFF] text-[#6857E8] flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Synthesized
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-[#778196] mt-0.5">
              <span className="font-semibold text-[#172033]">{deck.subject}</span>
              <span>&bull;</span>
              <span>{flashcardList.length} flashcards</span>
              <span>&bull;</span>
              <span>{questionsCount} quiz questions</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigate(`/app/quiz/${deck.id}`)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6857E8] hover:bg-[#5645D3] text-white text-xs font-bold shadow-md shadow-[#6857E8]/20 transition-all hover:scale-[1.02]"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Practice Adaptive Quiz</span>
          </button>
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#F7F9FC] border border-[#E7ECF3] text-[#172033] text-xs font-bold transition-colors"
            title="Export summary, flashcards, and questions to printable PDF format"
          >
            <Printer className="w-4 h-4 text-[#778196]" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={handleOpenShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#F7F9FC] border border-[#E7ECF3] text-[#172033] text-xs font-bold transition-colors"
            title="Generate secure shareable public deck link"
          >
            <Share2 className="w-4 h-4 text-[#3977D6]" />
            <span>Share</span>
          </button>
          <button
            onClick={() => setDeleteConfirmOpen(true)}
            className="p-2 rounded-xl bg-white hover:bg-[#F7F9FC] border border-[#E7ECF3] text-[#778196] hover:text-[#C24141] transition-colors"
            aria-label="Delete deck"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
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
          <span>Executive Summary & Concepts</span>
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
          <span>Active Recall Flashcards ({flashcardList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'questions'
              ? 'border-[#6857E8] text-[#6857E8]'
              : 'border-transparent text-[#778196] hover:text-[#172033]'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Quiz Questions ({questionsCount})</span>
        </button>
      </div>

      {/* Printable Area Wrapper */}
      <div className="printable-area space-y-6">
        {/* TAB 1: SUMMARY */}
        {(activeTab === 'summary' || typeof window !== 'undefined') && (
          <div className={activeTab !== 'summary' ? 'hidden print:block' : 'space-y-6'}>
            {/* Print Header */}
            <div className="hidden print:block border-b pb-4 mb-4">
              <h1 className="text-2xl font-bold">{deck.title}</h1>
              <p className="text-sm text-gray-600">Subject: {deck.subject} &bull; Study Loop Revision Guide</p>
            </div>

            {/* Overview */}
            <div className="p-6 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#6857E8] flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Topic Overview</span>
              </h3>
              <p className="text-sm text-[#172033] leading-relaxed font-normal">
                {summary?.overview || deck.description || 'No overview summary provided.'}
              </p>
            </div>

            {/* Key Concepts Grid */}
            {summary?.keyConcepts && summary.keyConcepts.length > 0 && (
              <div className="p-6 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#172033]">
                  Key Conceptual Pillars
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {summary.keyConcepts.map((kc: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-[#E7ECF3] bg-[#F7F9FC] space-y-1.5"
                    >
                      <h4 className="text-xs font-bold text-[#172033]">{kc.title}</h4>
                      <p className="text-xs text-[#778196] leading-relaxed">{kc.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Important Definitions */}
            {summary?.definitions && summary.definitions.length > 0 && (
              <div className="p-6 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#172033]">
                  Key Technical Definitions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {summary.definitions.map((def: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-[#E7ECF3] bg-white hover:border-[#6857E8]/40 transition-colors"
                    >
                      <span className="text-xs font-bold text-[#6857E8] block mb-1">
                        {def.term}
                      </span>
                      <p className="text-xs text-[#172033] leading-relaxed">{def.definition}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Points & Revision Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Main Points */}
              <div className="p-6 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#172033]">
                  Main Takeaways
                </h3>
                <ul className="space-y-2">
                  {(summary?.mainPoints || []).map((pt: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[#172033]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6857E8] mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Revision Highlights */}
              <div className="p-6 rounded-2xl bg-[#FFF2DF]/30 border border-[#B97820]/30 shadow-xs space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#B97820]">
                  High-Yield Revision Facts
                </h3>
                <ul className="space-y-2">
                  {(summary?.revisionHighlights || []).map((rh: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[#172033]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B97820] mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{rh}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FLASHCARDS INTERACTIVE CAROUSEL */}
        {activeTab === 'flashcards' && (
          <div className="space-y-6 no-print">
            {flashcardList.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-[#E7ECF3]">
                <p className="text-sm text-[#778196]">No flashcards found in this study deck.</p>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-4">
                {/* Controls Bar */}
                <div className="flex items-center justify-between text-xs text-[#778196]">
                  <span className="font-bold text-[#172033]">
                    Card {currentCardIndex + 1} of {flashcardList.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleShuffleCards}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#E7ECF3] bg-white hover:bg-[#F7F9FC] text-[#172033] font-semibold transition-colors"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      <span>Shuffle</span>
                    </button>
                    <button
                      onClick={handleRestartCards}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#E7ECF3] bg-white hover:bg-[#F7F9FC] text-[#172033] font-semibold transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restart</span>
                    </button>
                  </div>
                </div>

                {/* Progress line */}
                <div className="w-full bg-[#E7ECF3] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#6857E8] h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentCardIndex + 1) / flashcardList.length) * 100}%`,
                    }}
                  />
                </div>

                {/* 3D-Like Flippable Card */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className={`min-h-[280px] p-8 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-sm relative text-center ${
                    isFlipped
                      ? 'bg-[#F0EEFF] border-[#6857E8]/40 shadow-[#6857E8]/10'
                      : 'bg-white border-[#E7ECF3] hover:border-[#6857E8]/40'
                  }`}
                >
                  {/* Topic badge */}
                  <div className="flex items-center justify-between w-full">
                    <span className="px-2.5 py-0.5 rounded-md bg-white border border-[#E7ECF3] text-[10px] font-bold text-[#778196] uppercase tracking-wider">
                      {currentCard?.topic || deck.subject}
                    </span>
                    <span className="text-[11px] font-semibold text-[#6857E8]">
                      {isFlipped ? 'Answer Revealed' : 'Click to Reveal'}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="py-6 my-auto">
                    {!isFlipped ? (
                      <p className="text-base sm:text-lg font-bold text-[#172033] leading-relaxed">
                        {currentCard?.front}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-[#6857E8] uppercase tracking-wider block">
                          Explanation & Concept
                        </span>
                        <p className="text-sm sm:text-base text-[#172033] leading-relaxed font-normal">
                          {currentCard?.back}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Prompt hint */}
                  <span className="text-[11px] text-[#778196]">
                    {!isFlipped ? 'Space or click anywhere on card to flip' : 'Review outcome buttons below'}
                  </span>
                </div>

                {/* Outcome Evaluation Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleReviewCard(false)}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[#C24141]/30 bg-white hover:bg-[#FFF2DF] text-[#C24141] text-xs font-bold transition-all shadow-xs"
                  >
                    <X className="w-4 h-4" />
                    <span>Review Again</span>
                  </button>
                  <button
                    onClick={() => handleReviewCard(true)}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#238A66] hover:bg-[#1E7758] text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>Know It</span>
                  </button>
                </div>

                {/* Navigation Arrows */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handlePrevCard}
                    className="flex items-center gap-1 text-xs font-bold text-[#778196] hover:text-[#172033] px-3 py-1.5 rounded-lg border border-[#E7ECF3] bg-white transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Card</span>
                  </button>
                  <button
                    onClick={handleNextCard}
                    className="flex items-center gap-1 text-xs font-bold text-[#6857E8] hover:text-[#5645D3] px-3 py-1.5 rounded-lg border border-[#6857E8]/30 bg-[#F0EEFF] transition-colors"
                  >
                    <span>Next Card</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: QUIZ QUESTIONS PREVIEW */}
        {activeTab === 'questions' && (
          <div className="space-y-4 no-print">
            <div className="p-6 rounded-2xl bg-white border border-[#E7ECF3] shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#172033]">
                  Ready to test your active recall?
                </h3>
                <p className="text-xs text-[#778196]">
                  The adaptive quiz presents questions one at a time and adjusts selection based on previous misses.
                </p>
              </div>
              <button
                onClick={() => onNavigate(`/app/quiz/${deck.id}`)}
                className="px-4 py-2.5 rounded-xl bg-[#6857E8] text-white text-xs font-bold shadow-sm hover:bg-[#5645D3] transition-all"
              >
                Launch Adaptive Quiz &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {(data.questions || []).map((q: any, idx: number) => (
                <div
                  key={q.id || idx}
                  className="p-4 rounded-xl border border-[#E7ECF3] bg-white space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#172033]">
                      Question {idx + 1}: {q.prompt}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                        q.difficulty === 'hard'
                          ? 'bg-[#FFF2DF] text-[#B97820]'
                          : q.difficulty === 'easy'
                          ? 'bg-[#E3F8EF] text-[#238A66]'
                          : 'bg-[#E8F2FF] text-[#3977D6]'
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#778196]">
                    {(q.options || []).map((opt: any, optIdx: number) => (
                      <div
                        key={opt.id || optIdx}
                        className={`p-2 rounded-lg border text-xs ${
                          opt.isCorrect
                            ? 'border-[#238A66] bg-[#E3F8EF]/40 text-[#238A66] font-medium'
                            : 'border-[#E7ECF3] bg-[#F7F9FC]'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}. {opt.text}
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#778196] border-t border-[#E7ECF3] pt-2">
                    <strong className="text-[#172033]">Explanation:</strong> {q.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SHARE MODAL */}
      {shareModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-[#E7ECF3] w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#3977D6]" />
                <h3 className="text-base font-bold text-[#172033]">Share Study Deck</h3>
              </div>
              <button
                onClick={() => setShareModalOpen(false)}
                className="p-1 text-[#778196] hover:text-[#172033]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#778196]">
              Anyone with this link can view this study deck's summary, flashcards, and questions in read-only mode without needing an account.
            </p>

            {isSharing ? (
              <div className="py-6 text-center text-xs text-[#778196] flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#6857E8]" />
                <span>Generating secure share token...</span>
              </div>
            ) : shareLink ? (
              <div className="space-y-4">
                <div className="p-3 bg-[#F7F9FC] border border-[#E7ECF3] rounded-xl flex items-center justify-between gap-2">
                  <span className="text-xs text-[#172033] font-mono truncate">
                    {window.location.origin}/share/{shareLink.shareToken}
                  </span>
                  <button
                    onClick={handleCopyShareLink}
                    className="p-2 bg-white hover:bg-[#F0EEFF] text-[#6857E8] rounded-lg border border-[#E7ECF3] shrink-0 transition-colors"
                    title="Copy share link"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E7ECF3]">
                  <button
                    onClick={handleRevokeShare}
                    className="text-xs font-semibold text-[#C24141] hover:underline"
                  >
                    Revoke Public Link
                  </button>
                  <button
                    onClick={handleCopyShareLink}
                    className="px-4 py-2 bg-[#6857E8] hover:bg-[#5645D3] text-white text-xs font-bold rounded-xl transition-all"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-[#E7ECF3] w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#C24141]">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-base font-bold text-[#172033]">Delete Study Deck?</h3>
            </div>
            <p className="text-xs text-[#778196] leading-relaxed">
              Are you sure you want to delete <strong className="text-[#172033]">{deck.title}</strong>? This action cannot be undone and will remove all associated flashcards and quiz history.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-3 py-1.5 text-xs font-bold text-[#778196] hover:text-[#172033]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDeck}
                disabled={isDeleting}
                className="px-4 py-2 bg-[#C24141] hover:bg-[#A83535] text-white text-xs font-bold rounded-xl transition-all"
              >
                {isDeleting ? 'Deleting...' : 'Delete Deck'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
