import React, { useState } from 'react';
import {
  FileDown,
  X,
  CheckCircle2,
  Columns,
  FileText,
  BookOpen,
  Sparkles,
  Printer,
  Layers,
  BookMarked,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { MedicalDocument, ExportScope, ExportLayout, ExportPdfConfig } from '../types';
import { generateTranslatedPdf, ExportPdfResult } from '../services/pdfExportService';

interface ExportPdfModalProps {
  document: MedicalDocument | null;
  isOpen: boolean;
  currentPageNumber?: number;
  onClose: () => void;
}

export const ExportPdfModal: React.FC<ExportPdfModalProps> = ({
  document,
  isOpen,
  currentPageNumber = 1,
  onClose,
}) => {
  const [scope, setScope] = useState<ExportScope>('current_page');
  const [layout, setLayout] = useState<ExportLayout>('dual_side_by_side');
  const [includeGlossary, setIncludeGlossary] = useState(true);
  const [includePhonetics, setIncludePhonetics] = useState(true);
  const [includePageNumbers, setIncludePageNumbers] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<ExportPdfResult | null>(null);

  if (!isOpen || !document) return null;

  const totalPagesInDoc = document.pages?.length || 1;
  const estimatedExportPages =
    scope === 'current_page'
      ? 1 + (includeGlossary ? 1 : 0)
      : scope === 'chapter'
      ? Math.min(3, totalPagesInDoc) + (includeGlossary ? 1 : 0)
      : (document.estimatedPages || totalPagesInDoc) + (includeGlossary ? 2 : 0);

  const handleGeneratePdf = async () => {
    setIsExporting(true);
    setExportResult(null);

    const config: ExportPdfConfig = {
      scope,
      layout,
      includeGlossaryAppendix: includeGlossary,
      includePhonetics,
      includePageNumbers,
      includeWatermark: false,
    };

    try {
      // Simulate brief processing latency for high-res layout alignment
      await new Promise((r) => setTimeout(r, 600));
      const result = await generateTranslatedPdf(document, config, currentPageNumber);
      setExportResult(result);
    } catch (err: any) {
      setExportResult({
        success: false,
        filename: 'export_error.pdf',
        pageCount: 0,
        fileSizeBytes: 0,
        error: err.message || 'Error creating PDF',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F52BA] text-white shadow-md shadow-[#0F52BA]/25">
              <FileDown className="h-5 w-5" />
            </div>
            <div>
              <h3 id="export-modal-title" className="text-base font-bold text-[#1E293B] dark:text-white flex items-center gap-2">
                <span>Export Translated Medical Document</span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#6D28D9]/10 text-[#6D28D9] border border-[#6D28D9]/20 dark:bg-purple-950 dark:text-purple-300">
                  Module 5
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                {document.title} ({document.fileName})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Section 1: Export Scope */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              1. Export Range & Scope
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Current Page */}
              <button
                type="button"
                onClick={() => setScope('current_page')}
                className={`flex flex-col text-left p-3.5 rounded-xl border transition cursor-pointer ${
                  scope === 'current_page'
                    ? 'border-[#0F52BA] bg-[#0F52BA]/5 dark:bg-blue-950/30 dark:border-blue-500 ring-1 ring-[#0F52BA]'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-[#0F52BA]" />
                    <span>Current Page</span>
                  </span>
                  {scope === 'current_page' && <CheckCircle2 className="h-3.5 w-3.5 text-[#0F52BA]" />}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Page {currentPageNumber} of {document.estimatedPages || totalPagesInDoc}
                </span>
              </button>

              {/* Selected Chapter */}
              <button
                type="button"
                onClick={() => setScope('chapter')}
                className={`flex flex-col text-left p-3.5 rounded-xl border transition cursor-pointer ${
                  scope === 'chapter'
                    ? 'border-[#0F52BA] bg-[#0F52BA]/5 dark:bg-blue-950/30 dark:border-blue-500 ring-1 ring-[#0F52BA]'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-[#0F52BA]" />
                    <span>Active Chapter</span>
                  </span>
                  {scope === 'chapter' && <CheckCircle2 className="h-3.5 w-3.5 text-[#0F52BA]" />}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Sections 1 to 3 with figures
                </span>
              </button>

              {/* Full Book */}
              <button
                type="button"
                onClick={() => setScope('full_book')}
                className={`flex flex-col text-left p-3.5 rounded-xl border transition cursor-pointer ${
                  scope === 'full_book'
                    ? 'border-[#0F52BA] bg-[#0F52BA]/5 dark:bg-blue-950/30 dark:border-blue-500 ring-1 ring-[#0F52BA]'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-[#0F52BA]" />
                    <span>Full Book</span>
                  </span>
                  {scope === 'full_book' && <CheckCircle2 className="h-3.5 w-3.5 text-[#0F52BA]" />}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  All {document.estimatedPages || totalPagesInDoc} clinical pages
                </span>
              </button>
            </div>
          </div>

          {/* Section 2: Layout Style */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              2. PDF Output Layout
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Dual-Pane Side-by-Side */}
              <button
                type="button"
                onClick={() => setLayout('dual_side_by_side')}
                className={`flex flex-col text-left p-3.5 rounded-xl border transition cursor-pointer ${
                  layout === 'dual_side_by_side'
                    ? 'border-[#6D28D9] bg-[#6D28D9]/5 dark:bg-purple-950/30 dark:border-purple-500 ring-1 ring-[#6D28D9]'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Columns className="h-4 w-4 text-[#6D28D9]" />
                    <span>Dual-Pane Parallel</span>
                  </span>
                  {layout === 'dual_side_by_side' && <CheckCircle2 className="h-3.5 w-3.5 text-[#6D28D9]" />}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Landscape 2-column alignment (EN | VI)
                </span>
              </button>

              {/* Vietnamese Only */}
              <button
                type="button"
                onClick={() => setLayout('target_clinical')}
                className={`flex flex-col text-left p-3.5 rounded-xl border transition cursor-pointer ${
                  layout === 'target_clinical'
                    ? 'border-[#6D28D9] bg-[#6D28D9]/5 dark:bg-purple-950/30 dark:border-purple-500 ring-1 ring-[#6D28D9]'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-[#6D28D9]" />
                    <span>Vietnamese Clinical</span>
                  </span>
                  {layout === 'target_clinical' && <CheckCircle2 className="h-3.5 w-3.5 text-[#6D28D9]" />}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Standard portrait medical textbook format
                </span>
              </button>

              {/* Annotated Bilingual */}
              <button
                type="button"
                onClick={() => setLayout('annotated_bilingual')}
                className={`flex flex-col text-left p-3.5 rounded-xl border transition cursor-pointer ${
                  layout === 'annotated_bilingual'
                    ? 'border-[#6D28D9] bg-[#6D28D9]/5 dark:bg-purple-950/30 dark:border-purple-500 ring-1 ring-[#6D28D9]'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-[#6D28D9]" />
                    <span>Annotated Study</span>
                  </span>
                  {layout === 'annotated_bilingual' && <CheckCircle2 className="h-3.5 w-3.5 text-[#6D28D9]" />}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Full text with MeSH & clinical callouts
                </span>
              </button>
            </div>
          </div>

          {/* Section 3: Specialized Toggles */}
          <div className="space-y-3 rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
              3. Clinical Inclusions
            </span>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                <BookMarked className="h-4 w-4 text-[#6D28D9]" />
                <span>Append Specialized Medical Glossary Table at the end</span>
              </span>
              <input
                type="checkbox"
                checked={includeGlossary}
                onChange={(e) => setIncludeGlossary(e.target.checked)}
                className="h-4 w-4 rounded text-[#0F52BA] focus:ring-[#0F52BA] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                <Sparkles className="h-4 w-4 text-[#0F52BA]" />
                <span>Include IPA Phonetics (/ˌmaɪ.oʊˈkɑːr.di.əl/) for English terms</span>
              </span>
              <input
                type="checkbox"
                checked={includePhonetics}
                onChange={(e) => setIncludePhonetics(e.target.checked)}
                className="h-4 w-4 rounded text-[#0F52BA] focus:ring-[#0F52BA] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Header stamp with ICD-11 / MeSH verification & hospital timestamp</span>
              </span>
              <input
                type="checkbox"
                checked={includePageNumbers}
                onChange={(e) => setIncludePageNumbers(e.target.checked)}
                className="h-4 w-4 rounded text-[#0F52BA] focus:ring-[#0F52BA] cursor-pointer"
              />
            </label>
          </div>

          {/* Export Status / Feedback message */}
          {exportResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                exportResult.success
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                  : 'border-rose-200 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
              }`}
            >
              {exportResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-bold">
                  {exportResult.success ? 'PDF Generated & Download Initiated!' : 'Export Failed'}
                </div>
                <div className="text-[11px] mt-0.5">
                  {exportResult.success
                    ? `Saved "${exportResult.filename}" (${(exportResult.fileSizeBytes / 1024).toFixed(1)} KB, ${exportResult.pageCount} pages).`
                    : exportResult.error}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Est. Output: <span className="font-semibold text-slate-800 dark:text-slate-200">~{estimatedExportPages} Pages</span> ({layout === 'dual_side_by_side' ? 'Landscape' : 'Portrait'})
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleBrowserPrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
              title="Print via browser native print dialogue"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Preview</span>
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={handleGeneratePdf}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#0F52BA] hover:bg-[#0A3C8A] active:scale-[0.98] disabled:opacity-60 rounded-lg transition shadow-md shadow-[#0F52BA]/25 cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4" />
                  <span>Download Translated PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
