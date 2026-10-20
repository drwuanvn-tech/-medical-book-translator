import React from 'react';
import {
  Sparkles,
  BookOpen,
  Layers,
  RefreshCw,
  Columns,
  Maximize2,
  CheckCircle2,
  AlertCircle,
  X,
  Volume2,
  Cpu,
} from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';
import { DualViewMode } from '../types';

interface TranslationControlPanelProps {
  currentPageNumber: number;
  totalPages: number;
}

export const TranslationControlPanel: React.FC<TranslationControlPanelProps> = ({
  currentPageNumber,
  totalPages,
}) => {
  const {
    readerDocument,
    isTranslating,
    translationProgress,
    translationMessage,
    dualViewMode,
    setDualViewMode,
    toggleDualView,
    translatePage,
    translateFullBook,
    translationNotification,
    dismissNotification,
  } = useDocuments();

  if (!readerDocument) return null;

  return (
    <div className="space-y-2 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
      {/* Top Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: AI Translation Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Action 1: Translate Current Page */}
          <button
            type="button"
            disabled={isTranslating}
            onClick={() => translatePage(readerDocument.id, currentPageNumber)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F52BA] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#0A3C8A] active:scale-[0.98] disabled:opacity-50 transition cursor-pointer"
            title="Translate current page with Gemini 3.8 Flash medical system prompt"
          >
            {isTranslating ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-blue-200" />
            )}
            <span>Translate Page {currentPageNumber}</span>
          </button>

          {/* Action 2: Translate Full Book */}
          <button
            type="button"
            disabled={isTranslating}
            onClick={() => translateFullBook(readerDocument.id)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition cursor-pointer"
            title="Translate all pages in this medical textbook"
          >
            <BookOpen className="h-3.5 w-3.5 text-[#2E8B57]" />
            <span>Translate Full Book ({totalPages} pgs)</span>
          </button>

          {/* AI Engine Status Badge */}
          <div className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-mono text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Cpu className="h-3 w-3" />
            <span>Gemini 3.8 Flash · MeSH 2026</span>
          </div>
        </div>

        {/* Right: Layout Toggle Mode Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden md:inline">
            Layout View:
          </span>

          <div className="flex items-center rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setDualViewMode('dual')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition ${
                dualViewMode === 'dual'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="Dual-View: Side-by-side English & Vietnamese"
            >
              <Columns className="h-3.5 w-3.5" />
              <span>Dual-View</span>
            </button>

            <button
              type="button"
              onClick={() => setDualViewMode('source_only')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                dualViewMode === 'source_only'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="English Source Document Only"
            >
              <span>English Only</span>
            </button>

            <button
              type="button"
              onClick={() => setDualViewMode('target_only')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                dualViewMode === 'target_only'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="Vietnamese Medical Translation Only"
            >
              <span>Tiếng Việt Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar & Processing Spinner when Communicating with AI Service */}
      {isTranslating && (
        <div className="rounded-lg border border-[#0F52BA]/30 bg-[#0F52BA]/5 p-2.5 dark:bg-blue-950/20 dark:border-blue-800 animate-in fade-in">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-[#0F52BA] dark:text-blue-300">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>{translationMessage || 'Processing with Gemini API...'}</span>
            </span>
            <span className="font-mono text-xs font-bold text-[#0F52BA] dark:text-blue-300">
              {translationProgress}%
            </span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#0F52BA] to-[#2E8B57] transition-all duration-300"
              style={{ width: `${translationProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Notification Toast Alert */}
      {translationNotification && (
        <div
          className={`flex items-start justify-between gap-3 rounded-lg border p-2.5 text-xs animate-in fade-in ${
            translationNotification.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200'
              : translationNotification.type === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200'
              : 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200'
          }`}
        >
          <div className="flex items-start gap-2">
            {translationNotification.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#2E8B57] mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            )}
            <div>
              <div className="font-bold">{translationNotification.title}</div>
              <div className="text-[11px] opacity-90">{translationNotification.message}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={dismissNotification}
            className="p-0.5 rounded opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
