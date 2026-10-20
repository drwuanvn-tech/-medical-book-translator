import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Layers,
  Sparkles,
  Check,
  FileText,
  Bookmark,
  Share2,
  Printer,
  Download,
  Lock,
  Unlock,
  Columns,
  Eye,
  Info,
  Volume2,
  ArrowRight,
  HelpCircle,
  Mic,
  Square,
} from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';
import { GlossaryTerm, LayoutBoundingBox, MedicalDocument } from '../types';
import { MedicalGlossaryPopover } from './MedicalGlossaryPopover';
import { TranslationControlPanel } from './TranslationControlPanel';
import { AudioPlayerButton } from './AudioPlayerButton';
import { SAMPLE_GLOSSARY_CARDIOLOGY } from '../data/sampleBooks';

interface DualPaneReaderViewProps {
  document?: MedicalDocument;
  onClose?: () => void;
  isModal?: boolean;
}

export const DualPaneReaderView: React.FC<DualPaneReaderViewProps> = ({
  document: propDoc,
  onClose,
  isModal = false,
}) => {
  const {
    readerDocument: contextDoc,
    documents,
    dualViewMode,
    setDualViewMode,
    openPronunciationLab,
    openExportPdf,
  } = useDocuments();

  const doc = propDoc || contextDoc || documents[0];

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isSyncScrollEnabled, setIsSyncScrollEnabled] = useState(true);
  const [isDualPane, setIsDualPane] = useState(true);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [showGlossaryHighlights, setShowGlossaryHighlights] = useState(true);
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);
  const [isGlobalTtsPlaying, setIsGlobalTtsPlaying] = useState(false);
  const [globalTtsSpeed, setGlobalTtsSpeed] = useState<number>(1.0);

  // Pane Refs for Synchronized Scrolling
  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const isSyncingScrollRef = useRef(false);

  if (!doc) {
    return (
      <div className="flex h-96 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <BookOpen className="h-10 w-10 text-slate-400 mb-3" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
          No Medical Document Selected
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm">
          Please select a medical book from the Document History to open the Interactive Dual-Pane Reader.
        </p>
      </div>
    );
  }

  const pages = doc.pages || [];
  const totalPages = doc.estimatedPages || (pages.length > 0 ? pages.length : 1);
  const currentPage = pages[currentPageIndex] || (pages.length > 0 ? pages[0] : null);

  // Navigation Handlers
  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex((prev) => prev + 1);
    }
  };

  const handlePageSelect = (pageIdx: number) => {
    setCurrentPageIndex(Math.max(0, Math.min(totalPages - 1, pageIdx)));
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(150, Math.max(75, prev + delta)));
  };

  // Synchronized Scrolling Implementation
  const handleScroll = (source: 'left' | 'right') => {
    if (!isSyncScrollEnabled || isSyncingScrollRef.current) return;

    const sourceEl = source === 'left' ? leftPaneRef.current : rightPaneRef.current;
    const targetEl = source === 'left' ? rightPaneRef.current : leftPaneRef.current;

    if (!sourceEl || !targetEl) return;

    const sourceScrollable = sourceEl.scrollHeight - sourceEl.clientHeight;
    const targetScrollable = targetEl.scrollHeight - targetEl.clientHeight;

    if (sourceScrollable <= 0 || targetScrollable <= 0) return;

    const scrollRatio = sourceEl.scrollTop / sourceScrollable;

    isSyncingScrollRef.current = true;
    targetEl.scrollTop = scrollRatio * targetScrollable;

    // Reset flag on next frame
    requestAnimationFrame(() => {
      isSyncingScrollRef.current = false;
    });
  };

  // Global Page TTS Audio Player
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentPageIndex]);

  const handleToggleGlobalTts = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isGlobalTtsPlaying) {
      window.speechSynthesis.cancel();
      setIsGlobalTtsPlaying(false);
      return;
    }

    const fullPageText =
      currentPage?.boxes
        .filter((b) => b.type !== 'figure')
        .map((b) => b.sourceText)
        .join('. ') || '';

    if (!fullPageText) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(fullPageText);
    utterance.lang = 'en-US';
    utterance.rate = globalTtsSpeed;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsGlobalTtsPlaying(true);
    utterance.onend = () => setIsGlobalTtsPlaying(false);
    utterance.onerror = () => setIsGlobalTtsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  // Export PDF: Launches Module 5 PDF Export Service Modal
  const handleExportPDF = () => {
    openExportPdf(doc);
  };

  // Helper to highlight clinical terms inside text blocks
  const renderInteractiveMedicalText = (text: string, terms?: GlossaryTerm[]) => {
    if (!showGlossaryHighlights || !terms || terms.length === 0 || !text) return text;

    const searchPhrases: Array<{ phrase: string; term: GlossaryTerm }> = [];
    terms.forEach((t) => {
      if (t.translatedTerm) {
        const cleanTarget = t.translatedTerm.replace(/\s*\([^)]*\)/g, '').trim();
        if (cleanTarget.length > 2) searchPhrases.push({ phrase: cleanTarget, term: t });
      }
      if (t.term && t.term.length > 2) {
        searchPhrases.push({ phrase: t.term, term: t });
      }
    });

    searchPhrases.sort((a, b) => b.phrase.length - a.phrase.length);
    if (searchPhrases.length === 0) return text;

    const escaped = searchPhrases.map((p) => p.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${escaped})`, 'gi');

    const parts = text.split(regex);
    if (parts.length <= 1) return text;

    return (
      <>
        {parts.map((part, index) => {
          const matched = searchPhrases.find((p) => p.phrase.toLowerCase() === part.toLowerCase());
          if (matched) {
            return (
              <MedicalGlossaryPopover key={index} term={matched.term}>
                {part}
              </MedicalGlossaryPopover>
            );
          }
          return <React.Fragment key={index}>{part}</React.Fragment>;
        })}
      </>
    );
  };

  return (
    <div className="flex flex-col w-full overflow-hidden rounded-xl border border-slate-200/90 bg-[#F8FAFC] shadow-sm dark:border-slate-800 dark:bg-slate-950 transition-all min-h-[640px]">
      {/* ======================================================== */}
      {/* 1. TOP NAVIGATION & CONTROL BAR                          */}
      {/* Design: Clean White background, Medical Blue (#0F52BA),  */}
      {/* Royal Purple (#6D28D9) AI highlights, Deep Slate text.  */}
      {/* ======================================================== */}
      <div className="border-b border-slate-200/90 bg-white px-4 py-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left Zone: Book Title & Metadata */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0F52BA] text-white shadow-xs">
              <BookOpen className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-[#1E293B] dark:text-white truncate max-w-xs sm:max-w-md lg:max-w-xl">
                  {doc.title}
                </h2>
                {/* Royal Purple AI Feature Badge */}
                <span className="inline-flex items-center gap-1 rounded-md border border-[#6D28D9]/30 bg-[#6D28D9]/10 px-2 py-0.5 text-[10px] font-mono font-bold text-[#6D28D9] dark:bg-purple-950/60 dark:text-purple-300">
                  <Sparkles className="h-3 w-3" />
                  <span>AI DUAL-READER</span>
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  {doc.format}
                </span>
                <span>·</span>
                <span className="capitalize">{doc.specialty.replace('_', ' ')}</span>
                <span>·</span>
                <span className="font-medium text-[#0F52BA] dark:text-blue-400">
                  {doc.sourceLanguage.toUpperCase()} ⇄ {doc.targetLanguage.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Right Zone: Controls (Page Selector, Zoom, Dual-Pane Switch, Export PDF) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Page Selector Stepper & Direct Page Input: "Page [ 12 ] of 450" */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-[#F8FAFC] p-0.5 dark:border-slate-700 dark:bg-slate-800">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={currentPageIndex === 0}
                className="p-1.5 rounded hover:bg-white text-slate-600 disabled:opacity-30 dark:hover:bg-slate-700 dark:text-slate-300 transition cursor-pointer"
                title="Previous page"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              <div className="flex items-center px-1 text-xs text-slate-600 dark:text-slate-300">
                <span className="font-medium mr-1.5 hidden sm:inline">Page</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={currentPageIndex + 1}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1 && val <= totalPages) {
                      handlePageSelect(val - 1);
                    }
                  }}
                  className="w-10 rounded border border-slate-300 bg-white px-1 py-0.5 text-center font-mono text-xs font-bold text-[#0F52BA] focus:border-[#0F52BA] focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-blue-400"
                  aria-label="Current page number"
                />
                <span className="ml-1.5 font-mono text-slate-400">
                  of {totalPages}
                </span>
              </div>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={currentPageIndex >= totalPages - 1}
                className="p-1.5 rounded hover:bg-white text-slate-600 disabled:opacity-30 dark:hover:bg-slate-700 dark:text-slate-300 transition cursor-pointer"
                title="Next page"
                aria-label="Next page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Synchronized Scrolling Toggle */}
            <button
              type="button"
              onClick={() => setIsSyncScrollEnabled(!isSyncScrollEnabled)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition cursor-pointer ${
                isSyncScrollEnabled
                  ? 'border-[#0F52BA]/30 bg-[#0F52BA]/10 text-[#0F52BA] dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
              }`}
              title={isSyncScrollEnabled ? 'Synchronized Scrolling ON (Locked)' : 'Independent Scrolling (Unlocked)'}
            >
              {isSyncScrollEnabled ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">
                {isSyncScrollEnabled ? 'Sync Scroll' : 'Free Scroll'}
              </span>
            </button>

            {/* Toggle Switch: Dual-Pane View / Single-Pane View */}
            <button
              type="button"
              onClick={() => setIsDualPane(!isDualPane)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                isDualPane
                  ? 'border-[#6D28D9]/40 bg-[#6D28D9]/10 text-[#6D28D9] dark:border-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
              title="Toggle Switch: Dual-Pane View / Single-Pane View"
            >
              <Columns className="h-3.5 w-3.5" />
              <span>{isDualPane ? 'Dual-Pane View' : 'Single-Pane View'}</span>
            </button>

            {/* Zoom Controls (- / +) */}
            <div className="hidden md:flex items-center rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => handleZoom(-10)}
                disabled={zoomLevel <= 75}
                className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 dark:text-slate-300 transition cursor-pointer"
                title="Zoom Out (-)"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="px-1.5 font-mono text-[11px] font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={() => handleZoom(10)}
                disabled={zoomLevel >= 150}
                className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 dark:text-slate-300 transition cursor-pointer"
                title="Zoom In (+)"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Core Action 1: 🔊 Global TTS Audio */}
            <div className="flex items-center rounded-lg border border-[#6D28D9]/30 bg-purple-50/50 p-0.5 dark:border-purple-800 dark:bg-purple-950/30">
              <button
                type="button"
                onClick={handleToggleGlobalTts}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  isGlobalTtsPlaying
                    ? 'bg-[#6D28D9] text-white animate-pulse'
                    : 'text-[#6D28D9] hover:bg-[#6D28D9]/10 dark:text-purple-300 dark:hover:bg-purple-900/40'
                }`}
                title={isGlobalTtsPlaying ? 'Stop Global TTS Audio' : 'Play Global TTS Audio for entire current page'}
              >
                {isGlobalTtsPlaying ? (
                  <>
                    <Square className="h-3.5 w-3.5 fill-current" />
                    <span>Stop TTS</span>
                    <span className="flex items-center gap-0.5 ml-1">
                      <span className="w-0.5 h-2 bg-white animate-pulse" />
                      <span className="w-0.5 h-3 bg-white animate-pulse [animation-delay:150ms]" />
                      <span className="w-0.5 h-2 bg-white animate-pulse [animation-delay:300ms]" />
                    </span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>🔊 Global TTS Audio</span>
                  </>
                )}
              </button>
              <select
                value={globalTtsSpeed}
                onChange={(e) => setGlobalTtsSpeed(Number(e.target.value))}
                className="bg-transparent text-[10px] font-mono font-bold px-1 text-purple-700 hover:text-purple-900 focus:outline-none dark:text-purple-300 cursor-pointer"
                title="Global Audio Speed"
              >
                <option value={0.75} className="dark:bg-slate-800">0.75x</option>
                <option value={1.0} className="dark:bg-slate-800">1.0x</option>
                <option value={1.25} className="dark:bg-slate-800">1.25x</option>
              </select>
            </div>

            {/* Pronunciation Lab Quick Action */}
            <button
              type="button"
              onClick={() => {
                const termToPractice =
                  currentPage?.boxes.flatMap((b) => b.glossaryTerms || [])[0] ||
                  SAMPLE_GLOSSARY_CARDIOLOGY[0];
                openPronunciationLab(termToPractice);
              }}
              className="hidden lg:inline-flex items-center gap-1.5 rounded-lg bg-[#6D28D9]/10 border border-[#6D28D9]/30 hover:bg-[#6D28D9]/20 px-3 py-1.5 text-xs font-semibold text-[#6D28D9] dark:text-purple-300 transition cursor-pointer"
              title="Launch Clinical Pronunciation Lab (Record speech & view phonetic accuracy)"
            >
              <Mic className="h-3.5 w-3.5" />
              <span>🎤 Practice</span>
            </button>

            {/* Core Action 2: 📥 Export Translated PDF */}
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F52BA] hover:bg-[#0A3C8A] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs active:scale-[0.98] transition cursor-pointer"
              title="Export bilingual chapter to printable PDF format"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isExporting ? 'Generating PDF...' : '📥 Export Translated PDF'}</span>
            </button>

            {/* Close Modal if applicable */}
            {isModal && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                aria-label="Close reader"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Export Success Banner */}
        {exportSuccessMessage && (
          <div className="mt-2.5 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span>{exportSuccessMessage}</span>
            </span>
            <button
              type="button"
              onClick={() => setExportSuccessMessage(null)}
              className="text-emerald-600 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. MODULE 2 AI TRANSLATION INTEGRATION PANEL             */}
      {/* ======================================================== */}
      <TranslationControlPanel
        currentPageNumber={currentPageIndex + 1}
        totalPages={totalPages}
      />

      {/* ======================================================== */}
      {/* 3. DUAL-PANE / SINGLE-PANE VIEWPORT STAGE                */}
      {/* Left Pane: English Original Text / Layout                */}
      {/* Right Pane: Vietnamese Translated Text Block-by-Block    */}
      {/* ======================================================== */}
      <div
        className={`flex-1 overflow-hidden grid bg-[#F8FAFC] dark:bg-slate-950 ${
          isDualPane
            ? 'grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800'
            : 'grid-cols-1'
        }`}
      >
        {/* ====================================================== */}
        {/* LEFT PANE: English Original Document                   */}
        {/* ====================================================== */}
        <div className="flex flex-col h-full overflow-hidden">
          {/* Left Pane Header */}
          <div className="flex items-center justify-between border-b border-slate-200/80 bg-white px-4 py-2 text-xs font-semibold text-[#1E293B] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
            <span className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-[#0F52BA]" />
              <span>English Original Document ({doc.sourceLanguage.toUpperCase()})</span>
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              Page {currentPageIndex + 1} · Vector Extracted
            </span>
          </div>

          {/* Left Pane Scroll Container */}
          <div
            ref={leftPaneRef}
            onScroll={() => handleScroll('left')}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-white dark:bg-slate-900"
            style={{ fontSize: `${(zoomLevel / 100) * 14}px` }}
          >
            {currentPage?.boxes.map((box, bIdx) => {
              const isHovered = hoveredBlockId === box.id;

              return (
                <div
                  key={box.id}
                  onMouseEnter={() => setHoveredBlockId(box.id)}
                  onMouseLeave={() => setHoveredBlockId(null)}
                  className={`group relative rounded-xl transition-all duration-150 ${
                    isHovered
                      ? 'ring-2 ring-[#6D28D9] bg-[#6D28D9]/[0.03] shadow-xs'
                      : showBoundingBoxes
                      ? 'border border-dashed border-[#0F52BA]/25 bg-[#0F52BA]/[0.015] hover:border-[#0F52BA]/60'
                      : 'border border-transparent'
                  } p-3 sm:p-4`}
                >
                  {/* Bounding Box Type & Block Number Indicator */}
                  {showBoundingBoxes && (
                    <div className="absolute -top-2.5 left-3 flex items-center gap-1.5 rounded-md bg-[#0F52BA] px-1.5 py-0.2 text-[9px] font-mono font-bold text-white shadow-xs">
                      <span>#{bIdx + 1}</span>
                      <span className="opacity-70">|</span>
                      <span>{box.type.toUpperCase()}</span>
                      <span className="opacity-70">|</span>
                      <span>{(box.confidence * 100).toFixed(0)}%</span>
                    </div>
                  )}

                  {/* Module 4 Audio Control Strip for English Paragraphs / Blocks */}
                  {(box.type === 'paragraph' || box.type === 'heading' || box.type === 'callout') && (
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        <Volume2 className="h-3 w-3 text-[#0F52BA]" />
                        <span>English Paragraph Audio:</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <AudioPlayerButton
                          text={box.sourceText}
                          label="Listen"
                          variant="full"
                        />
                        {box.glossaryTerms && box.glossaryTerms.length > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openPronunciationLab(box.glossaryTerms![0]);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#6D28D9]/30 bg-[#6D28D9]/10 hover:bg-[#6D28D9]/20 px-2 py-1 text-[11px] font-semibold text-[#6D28D9] dark:bg-purple-950/50 dark:text-purple-300 transition cursor-pointer shadow-2xs"
                            title={`Practice speech pronunciation for "${box.glossaryTerms[0].term}"`}
                          >
                            <Mic className="h-3 w-3 text-[#6D28D9]" />
                            <span>Practice: <strong className="underline decoration-dotted">{box.glossaryTerms[0].term}</strong></span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Heading */}
                  {box.type === 'heading' && (
                    <h2 className="font-bold tracking-tight text-[#1E293B] dark:text-white text-base leading-snug">
                      {renderInteractiveMedicalText(box.sourceText, box.glossaryTerms)}
                    </h2>
                  )}

                  {/* Paragraph */}
                  {box.type === 'paragraph' && (
                    <p className="leading-relaxed text-[#1E293B]/90 dark:text-slate-300 text-justify">
                      {renderInteractiveMedicalText(box.sourceText, box.glossaryTerms)}
                    </p>
                  )}

                  {/* Table */}
                  {box.type === 'table' && box.tableData && (
                    <div className="my-2 overflow-x-auto">
                      <div className="text-xs font-bold text-[#1E293B] dark:text-slate-200 mb-1.5">
                        {box.sourceText}
                      </div>
                      <table className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                        <thead className="bg-[#F8FAFC] dark:bg-slate-800 font-semibold text-[#1E293B] dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                          <tr>
                            {box.tableData.headers.map((h, i) => (
                              <th key={i} className="px-3 py-2 text-left font-semibold">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                          {box.tableData.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                              {row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  className="px-3 py-2 font-mono text-[11px] text-[#1E293B] dark:text-slate-300"
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Callout Box */}
                  {box.type === 'callout' && (
                    <div className="rounded-lg border border-[#0F52BA]/30 bg-[#0F52BA]/5 p-3.5 text-xs leading-relaxed text-[#1E293B] dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-100">
                      {renderInteractiveMedicalText(box.sourceText, box.glossaryTerms)}
                    </div>
                  )}

                  {/* Figure Schematic */}
                  {box.type === 'figure' && (
                    <div className="my-2 rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 text-center dark:border-slate-800 dark:bg-slate-950">
                      <div className="flex h-36 items-center justify-center rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900">
                        <div className="text-center p-3">
                          <Bookmark className="h-7 w-7 mx-auto text-[#0F52BA] mb-1.5" />
                          <div className="font-mono text-xs font-semibold text-[#1E293B] dark:text-slate-200">
                            [High-Resolution Anatomical Schematic]
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Optical vector layer synchronized
                          </div>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 italic">
                        {box.figureCaption || box.sourceText}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ====================================================== */}
        {/* RIGHT PANE: Vietnamese Translated Document             */}
        {/* Matching block by block with Royal Purple AI highlights*/}
        {/* ====================================================== */}
        {isDualPane && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Right Pane Header */}
            <div className="flex items-center justify-between border-b border-slate-200/80 bg-white px-4 py-2 text-xs font-semibold text-[#1E293B] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              <span className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-[#6D28D9]" />
                <span>Bản Dịch Y Khoa Chuẩn Hóa ({doc.targetLanguage.toUpperCase()})</span>
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#6D28D9] dark:text-purple-300 font-bold bg-[#6D28D9]/10 px-1.5 py-0.2 rounded">
                <Check className="h-3 w-3" /> Block-Aligned MeSH
              </span>
            </div>

            {/* Right Pane Scroll Container */}
            <div
              ref={rightPaneRef}
              onScroll={() => handleScroll('right')}
              className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-white dark:bg-slate-900"
              style={{ fontSize: `${(zoomLevel / 100) * 14}px` }}
            >
              {currentPage?.boxes.map((box, bIdx) => {
                const isHovered = hoveredBlockId === box.id;

                return (
                  <div
                    key={`trans-${box.id}`}
                    onMouseEnter={() => setHoveredBlockId(box.id)}
                    onMouseLeave={() => setHoveredBlockId(null)}
                    className={`group relative rounded-xl transition-all duration-150 ${
                      isHovered
                        ? 'ring-2 ring-[#6D28D9] bg-[#6D28D9]/[0.03] shadow-xs'
                        : showBoundingBoxes
                        ? 'border border-dashed border-[#6D28D9]/25 bg-[#6D28D9]/[0.015] hover:border-[#6D28D9]/60'
                        : 'border border-transparent'
                    } p-3 sm:p-4`}
                  >
                    {/* Synchronized Block Tag */}
                    {showBoundingBoxes && (
                      <div className="absolute -top-2.5 left-3 flex items-center gap-1.5 rounded-md bg-[#6D28D9] px-1.5 py-0.2 text-[9px] font-mono font-bold text-white shadow-xs">
                        <span>#trans_{bIdx + 1}</span>
                        <span className="opacity-70">|</span>
                        <span>{box.type.toUpperCase()}</span>
                      </div>
                    )}

                    {/* Heading */}
                    {box.type === 'heading' && (
                      <h2 className="font-bold tracking-tight text-[#1E293B] dark:text-white text-base leading-snug">
                        {renderInteractiveMedicalText(box.translatedText || box.sourceText, box.glossaryTerms)}
                      </h2>
                    )}

                    {/* Paragraph */}
                    {box.type === 'paragraph' && (
                      <p className="leading-relaxed text-[#1E293B]/90 dark:text-slate-300 text-justify">
                        {renderInteractiveMedicalText(box.translatedText || box.sourceText, box.glossaryTerms)}
                      </p>
                    )}

                    {/* Table */}
                    {box.type === 'table' && box.tableData && (
                      <div className="my-2 overflow-x-auto">
                        <div className="text-xs font-bold text-[#1E293B] dark:text-slate-200 mb-1.5">
                          {box.translatedText || box.sourceText}
                        </div>
                        <table className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                          <thead className="bg-purple-50/60 dark:bg-purple-950/30 font-semibold text-[#1E293B] dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                              {box.tableData.headers.map((h, i) => (
                                <th key={i} className="px-3 py-2 text-left font-semibold">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                            {box.tableData.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                                {row.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className="px-3 py-2 font-mono text-[11px] text-[#1E293B] dark:text-slate-300"
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Callout Box */}
                    {box.type === 'callout' && (
                      <div className="rounded-lg border border-[#6D28D9]/30 bg-[#6D28D9]/5 p-3.5 text-xs leading-relaxed text-[#1E293B] dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-100">
                        {renderInteractiveMedicalText(box.translatedText || box.sourceText, box.glossaryTerms)}
                      </div>
                    )}

                    {/* Figure Caption */}
                    {box.type === 'figure' && (
                      <div className="my-2 rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 text-center dark:border-slate-800 dark:bg-slate-950">
                        <div className="flex h-36 items-center justify-center rounded-lg border border-dashed border-purple-300 dark:border-purple-800 bg-white dark:bg-slate-900">
                          <div className="text-center p-3">
                            <Bookmark className="h-7 w-7 mx-auto text-[#6D28D9] mb-1.5" />
                            <div className="font-mono text-xs font-semibold text-[#1E293B] dark:text-slate-200">
                              [Sơ Đồ Giải Phẫu Học Đồng Bộ Hóa]
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Tọa độ khung hình được giữ nguyên vẹn
                            </div>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 italic">
                          {box.translatedText || box.figureCaption || box.sourceText}
                        </p>
                      </div>
                    )}

                    {/* In-Block Quick Terms Bar */}
                    {showGlossaryHighlights && box.glossaryTerms && box.glossaryTerms.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          MeSH Terms:
                        </span>
                        {box.glossaryTerms.map((term, tIdx) => (
                          <MedicalGlossaryPopover key={tIdx} term={term}>
                            <span className="inline-flex items-center gap-1 text-[11px]">
                              <Info className="h-3 w-3" />
                              <span>{term.translatedTerm || term.term}</span>
                            </span>
                          </MedicalGlossaryPopover>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Reader Status Bar Footer */}
      <div className="flex items-center justify-between border-t border-slate-200/90 bg-white px-4 py-2 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                isSyncScrollEnabled ? 'bg-[#0F52BA]' : 'bg-slate-400'
              }`}
            />
            <span>Scroll Sync: {isSyncScrollEnabled ? 'Locked' : 'Unlocked'}</span>
          </span>
          <span aria-hidden="true">·</span>
          <span>View: {isDualPane ? 'Dual-Pane 50/50' : 'Single Pane'}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono text-[11px]">Zoom: {zoomLevel}%</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono">
            {currentPage?.boxes.length || 0} layout blocks aligned
          </span>
          <span aria-hidden="true">·</span>
          <span className="text-[#6D28D9] dark:text-purple-400 font-semibold text-[11px]">
            Royal Purple AI Engine Active
          </span>
        </div>
      </div>
    </div>
  );
};
