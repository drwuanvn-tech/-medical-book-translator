import React from 'react';
import { X, Sparkles, Book, FileText, ArrowRight } from 'lucide-react';
import { PRESET_QUICK_BOOKS } from '../data/sampleBooks';
import { useDocuments } from '../context/DocumentContext';
import { UploadDraft } from '../types';

interface QuickSampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (draft: UploadDraft) => void;
}

export const QuickSampleModal: React.FC<QuickSampleModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F52BA]/10 text-[#0F52BA] dark:bg-blue-500/20 dark:text-blue-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Preset Clinical Textbooks for Instant Testing
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select any verified medical textbook chapter to simulate the 4-step parsing pipeline.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {PRESET_QUICK_BOOKS.map((preset) => (
            <button
              key={preset.fileName}
              type="button"
              onClick={() => {
                onSelectSample({
                  file: null,
                  name: preset.fileName,
                  sizeBytes: Math.round(preset.sizeMb * 1024 * 1024),
                  format: preset.format,
                  estimatedPages: preset.pages,
                  specialty: preset.specialty,
                  sourceLanguage: preset.sourceLang,
                  targetLanguage: preset.targetLang,
                  dictionaryStandard: 'SNOMED-CT / MeSH 2026',
                });
                onClose();
              }}
              className="w-full text-left p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-[#0F52BA]/5 hover:border-[#0F52BA]/40 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-blue-500/40 dark:hover:bg-slate-800 transition flex items-center justify-between group cursor-pointer"
            >
              <div className="min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded ${
                      preset.format === 'PDF'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    }`}
                  >
                    {preset.format}
                  </span>
                  <span className="text-xs font-semibold text-slate-900 group-hover:text-[#0F52BA] dark:text-white dark:group-hover:text-blue-400">
                    {preset.title}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {preset.blurb}
                </p>
                <div className="mt-1 text-[11px] font-mono text-slate-400">
                  {preset.sizeMb} MB · {preset.pages} pages · Specialty: {preset.specialty}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1 text-xs font-semibold text-[#0F52BA] dark:text-blue-400">
                <span>Start</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
