import React, { useRef, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  Terminal,
  BookOpen,
  Code,
  X,
  FileCheck2,
  AlertCircle,
  Database,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';
import { ProcessingStepId } from '../types';

interface StepMeta {
  id: ProcessingStepId;
  title: string;
  subtitle: string;
  icon: React.ElementType;
}

const STEPS_CONFIG: StepMeta[] = [
  {
    id: 1,
    title: 'Step 1: Uploading file to secure storage...',
    subtitle: 'SHA-256 integrity hash verification & AES-256 quarantine encryption',
    icon: Database,
  },
  {
    id: 2,
    title: 'Step 2: Parsing document structure & bounding boxes...',
    subtitle: 'OCR vector extraction, multi-column flow reflow, figure & table boundaries',
    icon: Layers,
  },
  {
    id: 3,
    title: 'Step 3: Initializing Medical Glossary Engine...',
    subtitle: 'Aligning anatomical Latin binomials, MeSH 2026 & SNOMED-CT entities',
    icon: Cpu,
  },
  {
    id: 4,
    title: 'Step 4: Ready for Dual-Pane Translation view.',
    subtitle: 'Bilingual sentence alignment and interactive coordinate schema synchronized',
    icon: BookOpen,
  },
];

export const ProcessingModal: React.FC = () => {
  const {
    isProcessing,
    currentProcessingDoc,
    currentStep,
    overallProgress,
    processingLogs,
    cancelProcessing,
    openReader,
    openJsonModal,
  } = useDocuments();

  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll log console
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [processingLogs]);

  if (!isProcessing || !currentProcessingDoc) return null;

  const isCompleted = overallProgress >= 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F52BA]/10 text-[#0F52BA] dark:bg-blue-500/20 dark:text-blue-400">
              {isCompleted ? <FileCheck2 className="h-5 w-5 text-[#2E8B57]" /> : <Cpu className="h-5 w-5 animate-pulse" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isCompleted ? 'Layout Parsing Complete' : 'Medical Layout Extraction Engine'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                {currentProcessingDoc.fileName} · {currentProcessingDoc.format} · {currentProcessingDoc.estimatedPages} pages
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCompleted ? (
              <button
                type="button"
                onClick={cancelProcessing}
                className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={cancelProcessing}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="space-y-6 overflow-y-auto p-6">
          {/* Overall Progress Bar */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Pipeline Extraction Progress
              </span>
              <span className="font-mono text-sm font-bold tabular-nums text-[#0F52BA] dark:text-blue-400">
                {overallProgress}%
              </span>
            </div>

            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#0F52BA] to-[#2E8B57] transition-all duration-300 ease-out"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          {/* 4 Multi-Step Cards */}
          <div className="space-y-2.5">
            {STEPS_CONFIG.map((step) => {
              const StepIcon = step.icon;
              const isPast = currentStep > step.id || isCompleted;
              const isCurrent = currentStep === step.id && !isCompleted;
              const isFuture = currentStep < step.id;

              return (
                <div
                  key={step.id}
                  className={`flex items-start gap-3.5 rounded-lg border p-3.5 transition-all ${
                    isPast
                      ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                      : isCurrent
                      ? 'border-[#0F52BA] bg-[#0F52BA]/5 shadow-xs dark:border-blue-500/80 dark:bg-blue-950/30'
                      : 'border-slate-200/60 bg-slate-50/30 opacity-70 dark:border-slate-800 dark:bg-slate-900/30'
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold ${
                      isPast
                        ? 'bg-[#2E8B57] text-white'
                        : isCurrent
                        ? 'bg-[#0F52BA] text-white animate-pulse'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="h-4 w-4" /> : step.id}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">
                        {step.title}
                      </div>
                      <div className="text-[11px] font-mono">
                        {isPast && (
                          <span className="text-[#2E8B57] dark:text-emerald-400 font-medium">Done</span>
                        )}
                        {isCurrent && (
                          <span className="text-[#0F52BA] dark:text-blue-400 font-semibold animate-pulse">
                            Processing...
                          </span>
                        )}
                        {isFuture && (
                          <span className="text-slate-400 dark:text-slate-500">Queued</span>
                        )}
                      </div>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      {step.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Terminal / Telemetry Console */}
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 shadow-inner">
            <div className="mb-2 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 font-mono">
                <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                <span>Layout Parser Telemetry Stream</span>
              </span>
              <span className="font-mono text-slate-500">
                {processingLogs.length} events logged
              </span>
            </div>

            <div className="max-h-36 overflow-y-auto font-mono text-xs text-slate-300 space-y-1">
              {processingLogs.length === 0 && (
                <div className="text-slate-500 text-[11px] italic">
                  Initializing layout parsing sandbox container...
                </div>
              )}
              {processingLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-2 leading-relaxed text-[11px]">
                  <span className="text-slate-500 tabular-nums shrink-0">{log.timestamp}</span>
                  <span
                    className={`font-semibold shrink-0 ${
                      log.level === 'success'
                        ? 'text-emerald-400'
                        : log.level === 'warn'
                        ? 'text-amber-400'
                        : log.level === 'error'
                        ? 'text-rose-400'
                        : 'text-blue-400'
                    }`}
                  >
                    [{log.stage}]
                  </span>
                  <span className="text-slate-200">{log.message}</span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>

          {/* Completion Metrics Summary */}
          {isCompleted && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-900 dark:text-emerald-200 mb-2">
                <Sparkles className="h-4 w-4 text-[#2E8B57]" />
                <span>Ready for Dual-Pane Translation</span>
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 mb-3">
                Layout tree, high-resolution bounding boxes, and anatomical glossaries have been extracted and bound into the bilingual reading schema.
              </p>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 font-mono text-xs">
                <div className="rounded bg-white/70 p-2 dark:bg-slate-900/60">
                  <div className="text-slate-400 text-[10px]">TOTAL BLOCKS</div>
                  <div className="font-bold text-slate-900 dark:text-white tabular-nums">
                    {currentProcessingDoc.layoutBlocksCount || 142} blocks
                  </div>
                </div>
                <div className="rounded bg-white/70 p-2 dark:bg-slate-900/60">
                  <div className="text-slate-400 text-[10px]">GLOSSARY MAPPED</div>
                  <div className="font-bold text-[#0F52BA] dark:text-blue-400 tabular-nums">
                    {currentProcessingDoc.glossaryCount || 384} terms
                  </div>
                </div>
                <div className="rounded bg-white/70 p-2 dark:bg-slate-900/60">
                  <div className="text-slate-400 text-[10px]">CLINICAL TABLES</div>
                  <div className="font-bold text-slate-900 dark:text-white tabular-nums">
                    {currentProcessingDoc.tablesCount || 8} tables
                  </div>
                </div>
                <div className="rounded bg-white/70 p-2 dark:bg-slate-900/60">
                  <div className="text-slate-400 text-[10px]">DIAGRAMS & FIGURES</div>
                  <div className="font-bold text-[#2E8B57] dark:text-emerald-400 tabular-nums">
                    {currentProcessingDoc.figuresCount || 12} figures
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {isCompleted ? 'Pipeline complete. Click Open Reader to begin.' : 'Estimated remaining time: ~2 seconds'}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {isCompleted ? (
              <>
                <button
                  type="button"
                  onClick={() => openJsonModal(currentProcessingDoc)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white transition"
                >
                  <Code className="h-4 w-4" />
                  <span>Inspect Layout JSON</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    cancelProcessing();
                    openReader(currentProcessingDoc);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0F52BA] hover:bg-[#0A3C8A] active:scale-[0.98] rounded-lg transition shadow-md shadow-[#0F52BA]/20 cursor-pointer"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Open Dual-Pane Reader</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={cancelProcessing}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Abort Processing
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
