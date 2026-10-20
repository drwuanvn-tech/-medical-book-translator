export type DocumentFormat = 'PDF' | 'EPUB';

export type DocumentStatus = 'processing' | 'completed' | 'failed' | 'draft';

export type ProcessingStepId = 1 | 2 | 3 | 4;

export type MedicalSpecialty =
  | 'internal_medicine'
  | 'cardiology'
  | 'neurology'
  | 'anatomy'
  | 'pathology'
  | 'pharmacology'
  | 'surgery'
  | 'pediatrics';

export interface ProcessingStep {
  id: ProcessingStepId;
  title: string;
  description: string;
  status: 'waiting' | 'in_progress' | 'completed' | 'failed';
  progress: number; // 0 to 100
  details?: string[];
}

export interface GlossaryTerm {
  term: string;
  ipa?: string; // IPA Phonetic transcription (e.g. /ˌmaɪ.oʊˈkɑːr.di.əl/)
  code: string; // MeSH, ICD-11, SNOMED-CT
  category: 'anatomy' | 'pathology' | 'pharmacology' | 'clinical' | 'diagnostic';
  sourceLang: string;
  targetLang: string;
  translatedTerm: string;
  definition: string;
  confidenceScore: number;
}

export type DualViewMode = 'dual' | 'source_only' | 'target_only';

export type AudioPlaybackSpeed = 0.75 | 1.0 | 1.25;

export interface SyllableAssessment {
  syllable: string;
  ipa: string;
  isCorrect: boolean;
  isStressed?: boolean;
  feedback?: string;
}

export interface PronunciationAssessment {
  term: string;
  ipa: string;
  overallScore: number; // 0 - 100
  fluencyScore: number;
  accuracyScore: number;
  stressScore: number;
  syllables: SyllableAssessment[];
  clinicalTip: string;
  recordedDurationSeconds: number;
}

export interface TranslationNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

export interface LayoutBoundingBox {
  id: string;
  page: number;
  type: 'heading' | 'paragraph' | 'figure' | 'table' | 'footnote' | 'callout';
  confidence: number;
  box: {
    top: number; // percentage (0-100)
    left: number; // percentage (0-100)
    width: number;
    height: number;
  };
  sourceText: string;
  translatedText?: string;
  glossaryTerms?: GlossaryTerm[];
  figureCaption?: string;
  tableData?: {
    headers: string[];
    rows: string[][];
  };
}

export interface DocumentPage {
  pageNumber: number;
  title?: string;
  boxes: LayoutBoundingBox[];
}

export interface ProcessingLog {
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  stage: string;
  message: string;
}

export interface MedicalDocument {
  id: string;
  title: string;
  fileName: string;
  fileSizeBytes: number;
  format: DocumentFormat;
  estimatedPages: number;
  uploadedAt: string;
  status: DocumentStatus;
  specialty: MedicalSpecialty;
  sourceLanguage: string;
  targetLanguage: string;
  currentStep?: ProcessingStepId;
  overallProgress: number; // 0 to 100
  glossaryCount: number;
  layoutBlocksCount: number;
  tablesCount: number;
  figuresCount: number;
  errorMessage?: string;
  pages?: DocumentPage[];
  logs?: ProcessingLog[];
  dictionaryStandard: 'SNOMED-CT / MeSH 2026' | 'ICD-11 / UMLS' | 'WHO MeSH Core';
}

export interface UploadDraft {
  file: File | null;
  name: string;
  sizeBytes: number;
  format: DocumentFormat;
  estimatedPages: number;
  specialty: MedicalSpecialty;
  sourceLanguage: string;
  targetLanguage: string;
  dictionaryStandard: 'SNOMED-CT / MeSH 2026' | 'ICD-11 / UMLS' | 'WHO MeSH Core';
  rawPreviewUrl?: string;
}

// Module 5: Personal Medical Vocabulary Deck & Mastery
export type VocabMasteryLevel = 'learning' | 'reviewing' | 'mastered';

export interface SavedVocabTerm extends GlossaryTerm {
  id: string;
  savedAt: string;
  masteryLevel: VocabMasteryLevel;
  reviewCount: number;
  lastReviewedAt?: string;
  notes?: string;
  documentTitle?: string;
}

// Module 5: PDF Export Service
export type ExportScope = 'current_page' | 'chapter' | 'full_book';
export type ExportLayout = 'dual_side_by_side' | 'target_clinical' | 'annotated_bilingual';

export interface ExportPdfConfig {
  scope: ExportScope;
  layout: ExportLayout;
  includeGlossaryAppendix: boolean;
  includePhonetics: boolean;
  includePageNumbers: boolean;
  includeWatermark: boolean;
  notes?: string;
}

// Module 5: Settings & Custom API Key (BYOK)
export interface UserSettings {
  customApiKey: string;
  selectedModel: 'gemini-3.8-flash' | 'gemini-2.5-pro';
  dictionaryStandard: 'SNOMED-CT / MeSH 2026' | 'ICD-11 / UMLS' | 'WHO MeSH Core';
  translationTone: 'academic_clinical' | 'patient_friendly';
  ttsVoiceAccent: 'en-US' | 'en-GB' | 'bilingual';
  ttsDefaultSpeed: AudioPlaybackSpeed;
  autoPlayOnHover: boolean;
  autoSaveLookups: boolean;
}
