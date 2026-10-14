import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileUp,
  AlignLeft,
  BookOpen,
} from 'lucide-react';
import { api } from '../../api/client.ts';
import { useToast } from '../common/Toast.tsx';

interface DeckGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeckCreated: (newDeck: any) => void;
}

export const DeckGeneratorModal: React.FC<DeckGeneratorModalProps> = ({
  isOpen,
  onClose,
  onDeckCreated,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [notesText, setNotesText] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSizeBytes, setFileSizeBytes] = useState(0);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage('');
    setNoticeMessage('');

    // Validation: 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10MB limit. Please upload a smaller file.');
      return;
    }

    const validExtensions = ['.pdf', '.txt', '.md'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setErrorMessage('Only PDF, TXT, and Markdown (.md) files are supported.');
      return;
    }

    setFileName(file.name);
    setFileSizeBytes(file.size);
    if (!title) {
      // Suggest title from file name
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(cleanTitle);
    }

    try {
      setIsUploading(true);
      setUploadProgress(30);

      const interval = setInterval(() => {
        setUploadProgress(prev => (prev < 85 ? prev + 15 : prev));
      }, 150);

      const res = await api.decks.uploadNoteFile(file);
      clearInterval(interval);
      setUploadProgress(100);

      if (res.success && res.document) {
        setNotesText(res.document.extractedText);
        if (res.document.extractedText.includes('Scanned PDF detected') || res.document.extractedText.includes('OCR Required')) {
          setNoticeMessage('Note: Your PDF appears to be a scanned image. Plain text was minimal. You can review and paste your lecture notes directly below.');
        } else {
          showToast(`Extracted ${res.document.wordCount} words from ${file.name}`);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to extract text from file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateDeck = async () => {
    if (!notesText || notesText.trim().length < 20) {
      setErrorMessage('Please provide at least 20 characters of notes or syllabus content.');
      return;
    }

    setErrorMessage('');
    setIsGenerating(true);

    try {
      const res = await api.decks.generate({
        text: notesText,
        title: title.trim() || undefined,
        subject: subject.trim() || undefined,
      });

      if (res.success && res.data) {
        showToast(
          res.data.deck.isDemoMode
            ? 'Demo Deck generated! (AI key not set or offline)'
            : 'AI Study Deck generated successfully!'
        );
        onDeckCreated(res.data.deck);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const loadSampleNotes = () => {
    setTitle('Cellular Biology & ATP Metabolism');
    setSubject('Molecular Biology');
    setNotesText(`Chapter 4: Cellular Respiration and Energy Production
Overview:
Cellular respiration is a set of metabolic reactions that take place in the cells of organisms to convert biochemical energy from nutrients into adenosine triphosphate (ATP), and then release waste products. The catabolic reactions involved in respiration include glycolysis, the citric acid cycle (Krebs cycle), and oxidative phosphorylation via the electron transport chain.

Glycolysis:
- Takes place in the cytoplasm of the cell.
- Does not require oxygen (anaerobic).
- Breaks down 1 glucose molecule (6 carbons) into 2 molecules of pyruvate (3 carbons).
- Yields a net gain of 2 ATP (4 produced, 2 consumed) and 2 NADH molecules.
- Key rate-limiting enzyme: Phosphofructokinase-1 (PFK-1), allosterically inhibited by high ATP levels and activated by AMP.

The Citric Acid Cycle (Krebs Cycle):
- Located inside the mitochondrial matrix.
- Aerobic pathway: pyruvate enters the mitochondria and is converted into Acetyl-CoA by pyruvate dehydrogenase.
- Generates 3 NADH, 1 FADH2, and 1 GTP/ATP per turn (2 turns per glucose molecule).
- Releases carbon dioxide as a metabolic byproduct.

Oxidative Phosphorylation:
- Occurs across the inner mitochondrial membrane.
- Electron Transport Chain (Complexes I-IV) transfers electrons from NADH and FADH2 to molecular oxygen, the terminal electron acceptor, forming water.
- Proton pumping creates an electrochemical proton gradient across the inner membrane.
- Chemiosmosis: ATP synthase utilizes the proton-motive force to synthesize ATP from ADP and inorganic phosphate.
- Produces roughly 30-32 ATP molecules per oxidized glucose molecule under aerobic conditions.

Key Definitions:
- Chemiosmosis: The movement of ions across a semipermeable membrane down their electrochemical gradient.
- Proton-Motive Force: The energy stored in an electrochemical gradient of protons across a biological membrane.
- Phosphofructokinase-1 (PFK-1): Crucial regulatory enzyme in glycolysis.`);
    showToast('Loaded sample Molecular Biology notes!');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#FFFFFF] border border-[#E7ECF3] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E7ECF3] flex items-center justify-between bg-[#F7F9FC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F0EEFF] text-[#6857E8] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#172033]">Notes-to-Study-Deck Generator</h2>
              <p className="text-xs text-[#778196]">
                Transform lecture slides, syllabi, or raw notes into summaries, flashcards, and quizzes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#778196] hover:text-[#172033] hover:bg-white rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 pt-4 flex items-center gap-2 border-b border-[#E7ECF3]">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'border-[#6857E8] text-[#6857E8]'
                : 'border-transparent text-[#778196] hover:text-[#172033]'
            }`}
          >
            <FileUp className="w-4 h-4" />
            Upload File (PDF / TXT / MD)
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'paste'
                ? 'border-[#6857E8] text-[#6857E8]'
                : 'border-transparent text-[#778196] hover:text-[#172033]'
            }`}
          >
            <AlignLeft className="w-4 h-4" />
            Paste Notes Directly
          </button>

          <button
            onClick={loadSampleNotes}
            type="button"
            className="ml-auto mb-2 text-xs font-semibold text-[#6857E8] hover:text-[#5645D3] flex items-center gap-1 bg-[#F0EEFF] px-2.5 py-1 rounded-md"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Load Sample Notes
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Metadata Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">
                Deck Title <span className="text-[#778196] font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Molecular Biology: Cellular Respiration"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E7ECF3] focus:outline-none focus:border-[#6857E8] focus:ring-1 focus:ring-[#6857E8] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">
                Course / Subject <span className="text-[#778196] font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Biology, CS, History"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E7ECF3] focus:outline-none focus:border-[#6857E8] focus:ring-1 focus:ring-[#6857E8] transition-all"
              />
            </div>
          </div>

          {/* Tab 1: File Upload */}
          {activeTab === 'upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.md,text/plain,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#E7ECF3] hover:border-[#6857E8] bg-[#F7F9FC] hover:bg-[#F0EEFF]/30 rounded-xl p-6 text-center cursor-pointer transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-[#FFFFFF] shadow-sm flex items-center justify-center mx-auto mb-3 text-[#6857E8]">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-[#172033] mb-1">
                  Click to browse or drag and drop your study file
                </p>
                <p className="text-[11px] text-[#778196]">
                  Supports PDF (text-based), Plain Text (.txt), or Markdown (.md) up to 10MB
                </p>

                {fileName && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#E3F8EF] border border-[#238A66]/20 text-[#238A66] text-xs font-medium">
                    <FileText className="w-4 h-4" />
                    <span>{fileName} ({(fileSizeBytes / 1024).toFixed(1)} KB)</span>
                  </div>
                )}

                {isUploading && (
                  <div className="mt-3 max-w-xs mx-auto">
                    <div className="flex justify-between text-[10px] text-[#778196] mb-1">
                      <span>Extracting text...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E7ECF3] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#6857E8] transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Text Editor (Always visible or primary in paste tab) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#172033]">
                {activeTab === 'upload' ? 'Extracted Notes & Content (Editable)' : 'Paste Notes & Syllabus Topics'}
              </label>
              <span className="text-[11px] text-[#778196]">
                {notesText.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              rows={8}
              value={notesText}
              onChange={e => setNotesText(e.target.value)}
              placeholder="Paste your lecture notes, textbook summaries, definitions, or syllabus outline here..."
              className="w-full p-3 text-xs font-mono leading-relaxed rounded-xl border border-[#E7ECF3] focus:outline-none focus:border-[#6857E8] focus:ring-1 focus:ring-[#6857E8] bg-white text-[#172033] transition-all resize-y"
            />
          </div>

          {/* Notices & Errors */}
          {noticeMessage && (
            <div className="p-3 rounded-xl bg-[#FFF2DF] border border-[#B97820]/20 text-[#B97820] text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{noticeMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#C24141]/30 text-[#C24141] text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F7F9FC] border-t border-[#E7ECF3] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-[#778196]">
            <CheckCircle2 className="w-4 h-4 text-[#238A66]" />
            <span>Generates Summary, Flashcards & Adaptive Quiz</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 text-xs font-bold text-[#778196] hover:text-[#172033] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateDeck}
              disabled={isGenerating || !notesText.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6857E8] hover:bg-[#5645D3] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-[#6857E8]/20 transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Study Materials...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Study Deck</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
