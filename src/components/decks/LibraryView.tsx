import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  PlusCircle,
  HelpCircle,
  Share2,
  Trash2,
  Search,
  Sparkles,
  ExternalLink,
  Loader2,
  Filter,
} from 'lucide-react';
import { api } from '../../api/client.ts';
import { useToast } from '../common/Toast.tsx';

interface LibraryViewProps {
  onNavigate: (route: string) => void;
  onOpenUpload: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  onNavigate,
  onOpenUpload,
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [decks, setDecks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  const fetchDecks = async () => {
    try {
      setLoading(true);
      const res = await api.decks.getAll();
      if (res.success) {
        setDecks(res.decks || []);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load decks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  const subjects = ['all', ...Array.from(new Set(decks.map(d => d.subject).filter(Boolean)))];

  const filteredDecks = decks.filter(deck => {
    const matchesSearch =
      deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || deck.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const handleDeleteDeck = async (e: React.MouseEvent, deckId: string, deckTitle: string) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${deckTitle}"?`)) return;

    try {
      await api.decks.delete(deckId);
      showToast('Deck deleted successfully.');
      await fetchDecks();
    } catch (err: any) {
      showToast('Failed to delete deck: ' + err.message, 'error');
    }
  };

  if (loading && decks.length === 0) {
    return (
      <div className="p-8 max-w-6xl mx-auto flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#6857E8]" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-[#172033] tracking-tight">
              My Notes &amp; Decks
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0EEFF] text-[#6857E8]">
              {decks.length} Active Decks
            </span>
          </div>
          <p className="text-xs text-[#778196]">
            All synthesized summaries, active recall flashcards, and adaptive quiz sets.
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#6857E8] hover:bg-[#5645D3] text-white text-xs font-bold shadow-md shadow-[#6857E8]/20 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Upload Notes / Create Deck</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E7ECF3] shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#778196] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search decks or subjects..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#E7ECF3] focus:outline-none focus:border-[#6857E8]"
          />
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-[#778196] mr-1 hidden sm:inline">Subject:</span>
          {subjects.map(subj => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
                selectedSubject === subj
                  ? 'bg-[#6857E8] text-white'
                  : 'bg-[#F7F9FC] text-[#778196] hover:text-[#172033]'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* Decks Grid */}
      {filteredDecks.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E7ECF3] space-y-3">
          <BookOpen className="w-10 h-10 text-[#6857E8] mx-auto opacity-70" />
          <h3 className="text-base font-bold text-[#172033]">No Study Decks Found</h3>
          <p className="text-xs text-[#778196] max-w-sm mx-auto">
            {searchQuery
              ? 'No study decks matched your search query. Try another keyword or clear the filter.'
              : 'Upload lecture slides, notes, or syllabi to generate your first study deck.'}
          </p>
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 bg-[#6857E8] text-white text-xs font-bold rounded-xl"
          >
            Upload Notes Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDecks.map(deck => (
            <div
              key={deck.id}
              onClick={() => onNavigate(`/app/decks/${deck.id}`)}
              className="p-5 rounded-2xl bg-white border border-[#E7ECF3] hover:border-[#6857E8]/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#F7F9FC] border border-[#E7ECF3] text-[10px] font-bold text-[#778196] uppercase tracking-wider">
                    {deck.subject}
                  </span>
                  {deck.isDemoMode ? (
                    <span className="text-[10px] font-bold text-[#B97820] bg-[#FFF2DF] px-2 py-0.5 rounded">
                      Demo Mode
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-[#6857E8] bg-[#F0EEFF] px-2 py-0.5 rounded flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Synthesized
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-[#172033] group-hover:text-[#6857E8] transition-colors leading-snug">
                  {deck.title}
                </h3>

                <p className="text-xs text-[#778196] line-clamp-2 leading-relaxed">
                  {deck.description || 'Comprehensive revision materials generated from lecture notes.'}
                </p>

                {/* Content Counts */}
                <div className="flex items-center gap-3 text-xs text-[#778196] pt-2 border-t border-[#E7ECF3]">
                  <span>{deck.flashcardsCount} Cards</span>
                  <span>&bull;</span>
                  <span>{deck.questionsCount} Questions</span>
                  <span>&bull;</span>
                  <span>{deck.attemptsCount} Quizzed</span>
                </div>
              </div>

              {/* Action Buttons footer */}
              <div className="flex items-center justify-between pt-4 mt-3 border-t border-[#E7ECF3]/70">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onNavigate(`/app/quiz/${deck.id}`);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F0EEFF] hover:bg-[#6857E8] text-[#6857E8] hover:text-white text-xs font-bold transition-all"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Start Quiz</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={e => handleDeleteDeck(e, deck.id, deck.title)}
                    className="p-1.5 text-[#778196] hover:text-[#C24141] hover:bg-[#F7F9FC] rounded-lg transition-colors"
                    title="Delete deck"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
