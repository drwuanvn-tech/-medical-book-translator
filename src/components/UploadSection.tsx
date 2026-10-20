import React, { useState, useRef, useCallback } from 'react';
import {
  UploadCloud,
  FileText,
  Book,
  AlertCircle,
  CheckCircle2,
  X,
  Play,
  Layers,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import { UploadDraft, DocumentFormat, MedicalSpecialty } from '../types';
import { MEDICAL_SPECIALTIES, SUPPORTED_LANGUAGES, PRESET_QUICK_BOOKS } from '../data/sampleBooks';
import { useDocuments } from '../context/DocumentContext';

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

interface UploadSectionProps {
  onStartProcessing: (draft: UploadDraft) => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onStartProcessing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<UploadDraft | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form selections
  const [specialty, setSpecialty] = useState<MedicalSpecialty>('cardiology');
  const [sourceLang] = useState<string>('en');
  const [targetLang, setTargetLang] = useState<string>('vi');
  const [dictionaryStandard, setDictionaryStandard] = useState<'SNOMED-CT / MeSH 2026' | 'ICD-11 / UMLS' | 'WHO MeSH Core'>('SNOMED-CT / MeSH 2026');

  // Helper to estimate page count from file size and format
  const estimatePages = (sizeBytes: number, format: DocumentFormat): number => {
    // Average 1 medical book page is ~400KB in PDF (with high-res diagrams) or ~300KB in EPUB
    const bytesPerPage = format === 'PDF' ? 420 * 1024 : 320 * 1024;
    return Math.max(12, Math.min(1800, Math.round(sizeBytes / bytesPerPage)));
  };

  const handleFile = useCallback((file: File) => {
    setErrorMessage(null);

    // Validate size (Max 50MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(`File exceeds the 50MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please select a file under 50MB.`);
      setSelectedDraft(null);
      return;
    }

    // Validate format (PDF or ePub)
    const fileName = file.name;
    const extension = fileName.split('.').pop()?.toLowerCase();

    if (extension !== 'pdf' && extension !== 'epub') {
      setErrorMessage('Unsupported file format. Please upload a medical book in PDF (.pdf) or ePub (.epub) format.');
      setSelectedDraft(null);
      return;
    }

    const format: DocumentFormat = extension === 'pdf' ? 'PDF' : 'EPUB';
    const estimatedPages = estimatePages(file.size, format);

    // Auto-detect specialty from file name if applicable
    let detectedSpecialty: MedicalSpecialty = specialty;
    const lowerName = fileName.toLowerCase();
    if (lowerName.includes('cardio') || lowerName.includes('heart') || lowerName.includes('ami')) {
      detectedSpecialty = 'cardiology';
    } else if (lowerName.includes('anat') || lowerName.includes('gray')) {
      detectedSpecialty = 'anatomy';
    } else if (lowerName.includes('patho') || lowerName.includes('robbins')) {
      detectedSpecialty = 'pathology';
    } else if (lowerName.includes('pharm') || lowerName.includes('drug')) {
      detectedSpecialty = 'pharmacology';
    } else if (lowerName.includes('neuro') || lowerName.includes('brain')) {
      detectedSpecialty = 'neurology';
    } else if (lowerName.includes('surg')) {
      detectedSpecialty = 'surgery';
    }
    setSpecialty(detectedSpecialty);

    setSelectedDraft({
      file,
      name: fileName,
      sizeBytes: file.size,
      format,
      estimatedPages,
      specialty: detectedSpecialty,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      dictionaryStandard,
    });
  }, [specialty, sourceLang, targetLang, dictionaryStandard]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_QUICK_BOOKS[0]) => {
    setErrorMessage(null);
    setSpecialty(preset.specialty);
    setTargetLang(preset.targetLang);

    setSelectedDraft({
      file: null,
      name: preset.fileName,
      sizeBytes: Math.round(preset.sizeMb * 1024 * 1024),
      format: preset.format,
      estimatedPages: preset.pages,
      specialty: preset.specialty,
      sourceLanguage: preset.sourceLang,
      targetLanguage: preset.targetLang,
      dictionaryStandard,
    });
  };

  const handleStart = () => {
    if (!selectedDraft) return;
    onStartProcessing({
      ...selectedDraft,
      specialty,
      targetLanguage: targetLang,
      dictionaryStandard,
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <div className="space-y-6">
      {/* Upload Box Card */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-[#0F52BA] dark:text-blue-400" />
              <span>Medical Document Upload & Layout Extraction</span>
            </h2>
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
              ACCEPTED: <span className="font-semibold text-slate-700 dark:text-slate-200">PDF, ePub</span> · MAX: <span className="font-semibold text-slate-700 dark:text-slate-200">50 MB</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Securely upload clinical textbooks, anatomical compendiums, or peer-reviewed monographs for optical layout parsing and MeSH terminology alignment.
          </p>
        </div>

        {/* Drag and Drop Surface */}
        {!selectedDraft ? (
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all ${
              isDragOver
                ? 'border-[#0F52BA] bg-[#0F52BA]/5 dark:border-blue-400 dark:bg-blue-950/20'
                : 'border-slate-300 hover:border-[#0F52BA] hover:bg-slate-50/70 dark:border-slate-700 dark:hover:border-blue-500 dark:hover:bg-slate-800/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.epub,application/pdf,application/epub+zip"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />

            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#0F52BA]/10 text-[#0F52BA] transition-transform group-hover:scale-105 dark:bg-[#0F52BA]/20 dark:text-blue-400">
              <UploadCloud className="h-7 w-7" />
            </div>

            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              Drag & Drop your medical book here, or <span className="text-[#0F52BA] underline underline-offset-2 dark:text-blue-400">browse file</span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Supports vector & scanned medical PDFs, clinical monographs, and formatted ePub files (up to 50MB)
            </p>

            <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-rose-500" /> PDF (.pdf)
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Book className="h-3.5 w-3.5 text-emerald-500" /> ePub (.epub)
              </span>
              <span>·</span>
              <span>HIPAA / AES-256 Compliant</span>
            </div>
          </div>
        ) : (
          /* Selected File Inspector Card */
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
                    selectedDraft.format === 'PDF'
                      ? 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                      : 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                  }`}
                >
                  {selectedDraft.format === 'PDF' ? (
                    <FileText className="h-6 w-6" />
                  ) : (
                    <Book className="h-6 w-6" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 truncate max-w-md dark:text-white text-sm sm:text-base">
                      {selectedDraft.name}
                    </span>
                    <span className="px-1.5 py-0.5 text-[11px] font-mono font-bold rounded bg-slate-200/80 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                      {selectedDraft.format}
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      Size: <strong className="font-mono text-slate-700 dark:text-slate-300">{formatFileSize(selectedDraft.sizeBytes)}</strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Est. Pages: <strong className="font-mono text-slate-700 dark:text-slate-300">~{selectedDraft.estimatedPages} pages</strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Ready for Parsing
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white"
                >
                  Change File
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDraft(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-700 transition"
                  title="Remove selected file"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Parsing Preparation Configuration Parameters */}
            <div className="mt-4 pt-4 border-t border-slate-200/70 dark:border-slate-700/60 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Medical Specialty Domain
                </label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value as MedicalSpecialty)}
                  className="w-full text-xs rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-slate-800 focus:border-[#0F52BA] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {MEDICAL_SPECIALTIES.map((spec) => (
                    <option key={spec.value} value={spec.value}>
                      {spec.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Translation Language
                </label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full text-xs rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-slate-800 focus:border-[#0F52BA] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      English (en) → {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Glossary Ontology Standard
                </label>
                <select
                  value={dictionaryStandard}
                  onChange={(e) => setDictionaryStandard(e.target.value as any)}
                  className="w-full text-xs rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-slate-800 focus:border-[#0F52BA] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="SNOMED-CT / MeSH 2026">SNOMED-CT / MeSH 2026 (Gold Standard)</option>
                  <option value="ICD-11 / UMLS">ICD-11 / UMLS Unified Metathesaurus</option>
                  <option value="WHO MeSH Core">WHO MeSH Core Clinical Vocabulary</option>
                </select>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200/70 dark:border-slate-700/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Info className="h-3.5 w-3.5 text-[#0F52BA] dark:text-blue-400" />
                <span>Runs 4-stage pipeline: Cloud Storage → Layout OCR → MeSH Engine → Dual-Pane Setup</span>
              </div>

              <button
                type="button"
                onClick={handleStart}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#0F52BA] hover:bg-[#0A3C8A] active:scale-[0.99] transition shadow-md shadow-[#0F52BA]/20 cursor-pointer"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Start Processing & Extract Layout</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Error message alert */}
        {errorMessage && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span className="flex-1">{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Preset High-Yield Medical Textbooks Strip */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#2E8B57]" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Instant Test Library: Clinical Medical Book Samples
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Click any textbook to pre-load for instant processing simulation
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PRESET_QUICK_BOOKS.map((preset) => (
            <button
              key={preset.fileName}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="group text-left p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-[#0F52BA]/5 hover:border-[#0F52BA]/40 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-blue-500/40 dark:hover:bg-slate-800/80 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded ${
                      preset.format === 'PDF'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    }`}
                  >
                    {preset.format}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                    {preset.sizeMb} MB · {preset.pages} pgs
                  </span>
                </div>
                <div className="font-semibold text-xs text-slate-900 group-hover:text-[#0F52BA] dark:text-white dark:group-hover:text-blue-400 line-clamp-2">
                  {preset.title}
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  {preset.blurb}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between text-[11px] font-medium text-[#0F52BA] dark:text-blue-400">
                <span>Select & Test</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
