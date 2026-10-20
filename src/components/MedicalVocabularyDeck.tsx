import React, { useState, useMemo } from 'react';
import {
  BookMarked,
  Search,
  Filter,
  Plus,
  Volume2,
  Mic,
  Trash2,
  ExternalLink,
  Sparkles,
  Download,
  GraduationCap,
  RotateCcw,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  X,
  FileSpreadsheet,
  FileText,
  SlidersHorizontal,
  FolderDown,
  Square,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';
import { SavedVocabTerm, VocabMasteryLevel, GlossaryTerm } from '../types';
import { useDocuments } from '../context/DocumentContext';

interface MedicalVocabularyDeckProps {
  onOpenReader?: () => void;
}

export const MedicalVocabularyDeck: React.FC<MedicalVocabularyDeckProps> = ({ onOpenReader }) => {
  const {
    savedVocab,
    removeTermFromVocab,
    updateTermMastery,
    addCustomVocabTerm,
    openPronunciationLab,
    resetVocabToSample,
  } = useDocuments();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMastery, setSelectedMastery] = useState<'all' | VocabMasteryLevel>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Flashcard Study Mode State
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [studyCardIndex, setStudyCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [activeTtsId, setActiveTtsId] = useState<string | null>(null);

  // Add Term Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTerm, setNewTerm] = useState({
    term: '',
    ipa: '',
    translatedTerm: '',
    definition: '',
    code: 'MeSH / ICD-11',
    category: 'clinical' as const,
    notes: '',
  });

  // Filtered terms
  const filteredTerms = useMemo(() => {
    return savedVocab.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.translatedTerm && item.translatedTerm.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.definition && item.definition.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.ipa && item.ipa.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesMastery = selectedMastery === 'all' || item.masteryLevel === selectedMastery;
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

      return matchesSearch && matchesMastery && matchesCategory;
    });
  }, [savedVocab, searchQuery, selectedMastery, selectedCategory]);

  // Statistics
  const stats = useMemo(() => {
    const total = savedVocab.length;
    const mastered = savedVocab.filter((t) => t.masteryLevel === 'mastered').length;
    const reviewing = savedVocab.filter((t) => t.masteryLevel === 'reviewing').length;
    const learning = savedVocab.filter((t) => t.masteryLevel === 'learning').length;
    const masteredPct = total > 0 ? Math.round((mastered / total) * 100) : 0;

    return { total, mastered, reviewing, learning, masteredPct };
  }, [savedVocab]);

  // TTS audio playback
  const playTermAudio = (termString: string, id: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (activeTtsId === id) {
      window.speechSynthesis.cancel();
      setActiveTtsId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(termString);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;

    utterance.onstart = () => setActiveTtsId(id);
    utterance.onend = () => setActiveTtsId(null);
    utterance.onerror = () => setActiveTtsId(null);

    window.speechSynthesis.speak(utterance);
  };

  // Study Flashcard Navigation
  const currentStudyCard = filteredTerms[studyCardIndex] || filteredTerms[0];

  const handleNextStudyCard = (masteryToSet?: VocabMasteryLevel) => {
    if (masteryToSet && currentStudyCard) {
      updateTermMastery(currentStudyCard.id, masteryToSet);
      if (masteryToSet === 'mastered') {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
          });
        } catch (_) {}
      }
    }

    setIsCardFlipped(false);
    if (studyCardIndex < filteredTerms.length - 1) {
      setStudyCardIndex((prev) => prev + 1);
    } else {
      setStudyCardIndex(0);
    }
  };

  const handlePrevStudyCard = () => {
    setIsCardFlipped(false);
    if (studyCardIndex > 0) {
      setStudyCardIndex((prev) => prev - 1);
    } else {
      setStudyCardIndex(filteredTerms.length - 1);
    }
  };

  // Export to Anki CSV / TSV
  const handleExportAnki = () => {
    const header = 'Front (English & IPA)\tBack (Vietnamese & Definition)\tMeSH/ICD Code\tCategory\tTags\n';
    const rows = savedVocab
      .map(
        (v) =>
          `"${v.term} ${v.ipa || ''}"\t"${v.translatedTerm}: ${v.definition}"\t"${v.code}"\t"${v.category}"\t"med_translate_ai ${v.masteryLevel}"`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'MedTranslate_Vocabulary_Deck_Anki.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export to PDF Study Sheet
  const handleExportPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 210;
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;

    doc.setFillColor(15, 82, 186); // Medical Blue
    doc.rect(margin, margin, contentWidth, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 82, 186);
    doc.text('MED-TRANSLATE-AI: PERSONAL MEDICAL VOCABULARY DECK', margin, margin + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Sổ từ vựng y khoa cá nhân  •  Total Terms: ${savedVocab.length}  •  Mastery: ${stats.masteredPct}%  •  Date: ${new Date().toLocaleDateString()}`,
      margin,
      margin + 13
    );

    let currentY = margin + 20;

    savedVocab.forEach((term, idx) => {
      if (currentY > 270) {
        doc.addPage();
        currentY = margin + 10;
      }

      doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
      doc.rect(margin, currentY, contentWidth, 12, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, currentY, contentWidth, 12, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 82, 186);
      doc.text(`${term.term} ${term.ipa ? `[${term.ipa}]` : ''}`, margin + 3, currentY + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(109, 40, 217);
      doc.text(`[${term.category.toUpperCase()}] ${term.code}`, pageWidth - margin - 3, currentY + 4.5, {
        align: 'right',
      });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text(`→ ${term.translatedTerm}: `, margin + 3, currentY + 9);

      const offset = margin + 3 + doc.getTextWidth(`→ ${term.translatedTerm}: `);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      const def = term.definition.length > 85 ? term.definition.substring(0, 82) + '...' : term.definition;
      doc.text(def, offset, currentY + 9);

      currentY += 13.5;
    });

    doc.save('Personal_Medical_Vocabulary_Deck.pdf');
  };

  // Add Custom Term Submit
  const handleAddTermSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.term.trim() || !newTerm.translatedTerm.trim()) return;

    addCustomVocabTerm({
      term: newTerm.term.trim(),
      ipa: newTerm.ipa.trim() || undefined,
      translatedTerm: newTerm.translatedTerm.trim(),
      definition: newTerm.definition.trim() || 'Thuật ngữ y khoa chuyên khoa tự thêm.',
      code: newTerm.code.trim(),
      category: newTerm.category,
      sourceLang: 'en',
      targetLang: 'vi',
      confidenceScore: 1.0,
      masteryLevel: 'learning',
      reviewCount: 0,
      notes: newTerm.notes.trim() || undefined,
      documentTitle: 'Sổ từ vựng cá nhân',
    });

    setNewTerm({
      term: '',
      ipa: '',
      translatedTerm: '',
      definition: '',
      code: 'MeSH / ICD-11',
      category: 'clinical',
      notes: '',
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Mastery Progress Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F52BA] text-white shadow-md shadow-[#0F52BA]/25">
                <BookMarked className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1E293B] dark:text-white flex items-center gap-2">
                  <span>Personal Medical Vocabulary Deck</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#6D28D9]/10 text-[#6D28D9] border border-[#6D28D9]/20 dark:bg-purple-950/60 dark:text-purple-300">
                    Sổ từ vựng y khoa
                  </span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track, pronounce, and master specialized anatomical, pathological, and clinical terms extracted during reading.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setIsStudyMode(true);
                setStudyCardIndex(0);
                setIsCardFlipped(false);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#6D28D9] hover:bg-[#5B21B6] active:scale-[0.98] rounded-xl transition shadow-sm shadow-[#6D28D9]/25 cursor-pointer"
              title="Practice active vocabulary using interactive flip flashcards"
            >
              <GraduationCap className="h-4 w-4" />
              <span>Flashcard Study Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#0F52BA] hover:bg-[#0A3C8A] active:scale-[0.98] rounded-xl transition shadow-sm shadow-[#0F52BA]/25 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Custom Term</span>
            </button>

            {/* Export Dropdown / Buttons */}
            <button
              type="button"
              onClick={handleExportAnki}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 cursor-pointer"
              title="Export formatted for Anki flashcard software (.txt)"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
              <span>Export Anki</span>
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 cursor-pointer"
              title="Export formatted clinical study sheet in PDF"
            >
              <FileText className="h-3.5 w-3.5 text-[#0F52BA]" />
              <span>PDF Sheet</span>
            </button>
          </div>
        </div>

        {/* Telemetry Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-xl border border-slate-100 bg-[#F8FAFC] dark:bg-slate-800/40 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Saved Terms</span>
            <div className="text-xl font-bold font-mono text-[#1E293B] dark:text-white mt-0.5">
              {stats.total}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Extracted from books</div>
          </div>

          <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900/40">
            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Mastered (Thành thạo)</span>
            </span>
            <div className="text-xl font-bold font-mono text-emerald-800 dark:text-emerald-300 mt-0.5">
              {stats.mastered} <span className="text-xs font-normal">({stats.masteredPct}%)</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-emerald-200/60 rounded-full h-1.5 mt-2 dark:bg-emerald-900/50">
              <div
                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${stats.masteredPct}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-xl border border-amber-100 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/40">
            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reviewing (Đang ôn)</span>
            </span>
            <div className="text-xl font-bold font-mono text-amber-800 dark:text-amber-300 mt-0.5">
              {stats.reviewing}
            </div>
            <div className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-1">Needs periodic recall</div>
          </div>

          <div className="p-3 rounded-xl border border-blue-100 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900/40">
            <span className="text-[11px] font-medium text-[#0F52BA] dark:text-blue-400 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>New / Learning (Mới lưu)</span>
            </span>
            <div className="text-xl font-bold font-mono text-[#0F52BA] dark:text-blue-300 mt-0.5">
              {stats.learning}
            </div>
            <div className="text-[10px] text-blue-600/80 dark:text-blue-400/80 mt-1">Pending first assessment</div>
          </div>
        </div>
      </div>

      {/* FLASHCARD STUDY MODAL OVERLAY */}
      {isStudyMode && currentStudyCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 flex flex-col min-h-[460px]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-[#6D28D9]" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Flashcard Quiz: Card {studyCardIndex + 1} of {filteredTerms.length}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {currentStudyCard.category.toUpperCase()}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsStudyMode(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Flashcard Body */}
            <div
              onClick={() => setIsCardFlipped(!isCardFlipped)}
              className="my-auto py-8 px-6 rounded-2xl border-2 border-dashed border-[#0F52BA]/30 bg-[#F8FAFC] dark:bg-slate-950/50 hover:border-[#0F52BA] transition-all cursor-pointer flex flex-col items-center justify-center text-center select-none min-h-[240px] relative group"
            >
              <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-400 group-hover:text-[#0F52BA]">
                Click or Tap to Flip 🔄
              </div>

              {!isCardFlipped ? (
                // FRONT
                <div className="space-y-3 animate-in fade-in zoom-in-95 duration-150">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">English Medical Term</span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] dark:text-white">
                    {currentStudyCard.term}
                  </div>
                  {currentStudyCard.ipa && (
                    <div className="text-sm font-mono font-medium text-[#0F52BA] dark:text-blue-400">
                      {currentStudyCard.ipa}
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playTermAudio(currentStudyCard.term, currentStudyCard.id);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs hover:bg-slate-50 text-xs font-semibold text-[#0F52BA] dark:bg-slate-800 dark:border-slate-700 dark:text-blue-300"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>🔊 Listen Audio</span>
                    </button>
                  </div>
                </div>
              ) : (
                // BACK
                <div className="space-y-3 animate-in fade-in zoom-in-95 duration-150">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#6D28D9] font-bold">
                    Vietnamese Clinical Translation & Definition
                  </span>
                  <div className="text-xl font-bold text-[#0F52BA] dark:text-blue-400">
                    {currentStudyCard.translatedTerm}
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 max-w-md">
                    {currentStudyCard.definition}
                  </p>
                  <div className="text-[11px] font-mono text-slate-400 pt-1">
                    Ontology: {currentStudyCard.code}
                  </div>
                  {currentStudyCard.notes && (
                    <div className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-800 text-left">
                      💡 Note: {currentStudyCard.notes}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Assessment Buttons */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleNextStudyCard('learning')}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300 cursor-pointer"
                >
                  <span>⚠️ Needs Review</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNextStudyCard('reviewing')}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-semibold transition dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300 cursor-pointer"
                >
                  <span>🔄 Good Recall</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNextStudyCard('mastered')}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300 cursor-pointer"
                >
                  <span>🎉 Mastered!</span>
                </button>
              </div>

              {/* Prev / Next controls */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <button
                  type="button"
                  onClick={handlePrevStudyCard}
                  className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-white"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Previous Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNextStudyCard()}
                  className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-white"
                >
                  <span>Skip Card</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved clinical terms (e.g., Infarction, Huyết áp kế, STEMI, /ɪˈskiː/)..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F52BA]/30"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mastery Selector */}
          <div className="inline-flex rounded-xl border border-slate-200 bg-[#F8FAFC] p-0.5 dark:border-slate-800 dark:bg-slate-800 text-xs">
            {(['all', 'learning', 'reviewing', 'mastered'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMastery(m)}
                className={`px-2.5 py-1 rounded-lg font-medium capitalize transition cursor-pointer ${
                  selectedMastery === m
                    ? 'bg-white text-[#0F52BA] shadow-xs font-bold dark:bg-slate-700 dark:text-blue-300'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Reset button if terms are low */}
          {savedVocab.length < 3 && (
            <button
              type="button"
              onClick={resetVocabToSample}
              className="text-xs text-[#0F52BA] hover:underline dark:text-blue-400"
            >
              Reload Preset Terms
            </button>
          )}
        </div>
      </div>

      {/* Vocabulary Terms Grid / Table */}
      {filteredTerms.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <BookMarked className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No terms matched your criteria</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
            Try adjusting your search query or mastery filter. You can also save new medical terms directly while reading books in Module 3!
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedMastery('all');
                setSelectedCategory('all');
              }}
              className="px-3 py-1.5 text-xs font-semibold text-[#0F52BA] hover:underline"
            >
              Clear Filters
            </button>
            {onOpenReader && (
              <button
                type="button"
                onClick={onOpenReader}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0F52BA] rounded-lg hover:bg-[#0A3C8A]"
              >
                Open Dual-Pane Reader &rarr;
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTerms.map((item) => {
            const isPlaying = activeTtsId === item.id;

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 transition group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base text-[#1E293B] dark:text-white">
                          {item.term}
                        </h3>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#6D28D9]/10 text-[#6D28D9] border border-[#6D28D9]/20 dark:bg-purple-950/60 dark:text-purple-300">
                          {item.category}
                        </span>
                      </div>

                      {/* IPA Phonetic */}
                      {item.ipa && (
                        <div className="text-xs font-mono text-[#0F52BA] dark:text-blue-400 font-medium mt-0.5">
                          {item.ipa}
                        </div>
                      )}
                    </div>

                    {/* Remove Action */}
                    <button
                      type="button"
                      onClick={() => removeTermFromVocab(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition p-1"
                      title="Remove term from personal vocabulary deck"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Vietnamese Translation & Clinical Definition */}
                  <div className="mt-3 space-y-1">
                    <div className="text-xs font-bold text-[#0F52BA] dark:text-blue-300 flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-[#6D28D9]" />
                      <span>{item.translatedTerm}</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                      {item.definition}
                    </p>
                  </div>

                  {/* Notes if available */}
                  {item.notes && (
                    <div className="mt-2.5 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200 dark:border-amber-800/50">
                      <span className="font-semibold">Clinical Note:</span> {item.notes}
                    </div>
                  )}
                </div>

                {/* Footer Controls & Mastery Selector */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-slate-400 truncate max-w-[130px]" title={item.code}>
                      {item.code}
                    </span>

                    {/* Mastery Level Switcher */}
                    <div className="flex items-center gap-1">
                      {(['learning', 'reviewing', 'mastered'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => updateTermMastery(item.id, lvl)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold capitalize transition cursor-pointer ${
                            item.masteryLevel === lvl
                              ? lvl === 'mastered'
                                ? 'bg-emerald-600 text-white'
                                : lvl === 'reviewing'
                                ? 'bg-amber-600 text-white'
                                : 'bg-[#0F52BA] text-white'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {lvl === 'learning' ? 'Learn' : lvl === 'reviewing' ? 'Review' : 'Mastered'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons: 🔊 Listen & 🎤 Practice Syllables */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => playTermAudio(item.term, item.id)}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        isPlaying
                          ? 'bg-[#0F52BA] text-white animate-pulse'
                          : 'bg-white border border-slate-200 text-[#0F52BA] hover:bg-blue-50 dark:bg-slate-800 dark:border-slate-700 dark:text-blue-300'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Square className="h-3 w-3 fill-current" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3 w-3" />
                          <span>🔊 Listen</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => openPronunciationLab(item)}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition shadow-2xs active:scale-[0.98] cursor-pointer"
                      title="Practice pronunciation in AI Speech Lab"
                    >
                      <Mic className="h-3 w-3" />
                      <span>🎤 Practice</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD CUSTOM TERM MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#0F52BA]" />
                <span>Add Medical Term to Deck</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddTermSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    English Term *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTerm.term}
                    onChange={(e) => setNewTerm({ ...newTerm, term: e.target.value })}
                    placeholder="e.g., Cardiomyopathy"
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    IPA Phonetic (Optional)
                  </label>
                  <input
                    type="text"
                    value={newTerm.ipa}
                    onChange={(e) => setNewTerm({ ...newTerm, ipa: e.target.value })}
                    placeholder="/ˌkɑːr.di.oʊ.maɪˈɑː.pə.θi/"
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs font-mono dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Vietnamese Clinical Translation *
                </label>
                <input
                  type="text"
                  required
                  value={newTerm.translatedTerm}
                  onChange={(e) => setNewTerm({ ...newTerm, translatedTerm: e.target.value })}
                  placeholder="e.g., Bệnh cơ tim"
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Clinical Definition
                </label>
                <textarea
                  rows={2}
                  value={newTerm.definition}
                  onChange={(e) => setNewTerm({ ...newTerm, definition: e.target.value })}
                  placeholder="Bệnh lý làm suy giảm khả năng co bóp và bơm máu của cơ tim..."
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Category
                  </label>
                  <select
                    value={newTerm.category}
                    onChange={(e) => setNewTerm({ ...newTerm, category: e.target.value as any })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  >
                    <option value="pathology">Pathology</option>
                    <option value="anatomy">Anatomy</option>
                    <option value="pharmacology">Pharmacology</option>
                    <option value="clinical">Clinical</option>
                    <option value="diagnostic">Diagnostic</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    MeSH / ICD-11 Code
                  </label>
                  <input
                    type="text"
                    value={newTerm.code}
                    onChange={(e) => setNewTerm({ ...newTerm, code: e.target.value })}
                    placeholder="MeSH:D002311"
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs font-mono dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Clinical Notes / Mnemonic (Optional)
                </label>
                <input
                  type="text"
                  value={newTerm.notes}
                  onChange={(e) => setNewTerm({ ...newTerm, notes: e.target.value })}
                  placeholder="Key subtypes: Dilated, Hypertrophic, Restrictive."
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0F52BA] hover:bg-[#0A3C8A] rounded-lg transition"
                >
                  Save to Deck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
