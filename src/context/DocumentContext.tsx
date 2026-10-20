import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  MedicalDocument,
  UploadDraft,
  ProcessingStepId,
  ProcessingLog,
  DocumentPage,
  LayoutBoundingBox,
  GlossaryTerm,
  DualViewMode,
  TranslationNotification,
  SavedVocabTerm,
  VocabMasteryLevel,
  UserSettings,
} from '../types';
import {
  INITIAL_SAMPLE_DOCUMENTS,
  SAMPLE_GLOSSARY_CARDIOLOGY,
  DEFAULT_SAVED_VOCABULARY,
  DEFAULT_USER_SETTINGS,
} from '../data/sampleBooks';
import { translateMedicalBlocks } from '../services/translationService';

interface DocumentContextType {
  documents: MedicalDocument[];
  activeDocument: MedicalDocument | null;
  readerDocument: MedicalDocument | null;
  jsonModalDocument: MedicalDocument | null;
  deleteTargetDocument: MedicalDocument | null;
  isProcessing: boolean;
  currentProcessingDoc: MedicalDocument | null;
  currentStep: ProcessingStepId;
  overallProgress: number;
  processingLogs: ProcessingLog[];
  theme: 'light' | 'dark';
  // Module 2: Translation Engine & Dual View Controls
  isTranslating: boolean;
  translationProgress: number;
  translationMessage: string;
  dualViewMode: DualViewMode;
  translationNotification: TranslationNotification | null;
  translatePage: (docId: string, pageNumber: number) => Promise<void>;
  translateFullBook: (docId: string) => Promise<void>;
  toggleDualView: () => void;
  setDualViewMode: (mode: DualViewMode) => void;
  dismissNotification: () => void;
  // Module 4: Pronunciation Lab & Audio Engine
  practiceTerm: GlossaryTerm | null;
  openPronunciationLab: (term: GlossaryTerm) => void;
  closePronunciationLab: () => void;
  // Module 5: Vocabulary Deck, Export & Settings
  savedVocab: SavedVocabTerm[];
  saveTermToVocab: (term: GlossaryTerm, docTitle?: string) => void;
  removeTermFromVocab: (termId: string) => void;
  updateTermMastery: (termId: string, level: VocabMasteryLevel) => void;
  addCustomVocabTerm: (term: Omit<SavedVocabTerm, 'id' | 'savedAt'>) => void;
  isTermSaved: (term: string) => boolean;
  resetVocabToSample: () => void;
  userSettings: UserSettings;
  updateUserSettings: (settings: Partial<UserSettings>) => void;
  isExportPdfOpen: boolean;
  exportPdfDoc: MedicalDocument | null;
  openExportPdf: (doc?: MedicalDocument) => void;
  closeExportPdf: () => void;
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  toggleTheme: () => void;
  startProcessing: (draft: UploadDraft) => void;
  cancelProcessing: () => void;
  openReader: (doc: MedicalDocument) => void;
  closeReader: () => void;
  openJsonModal: (doc: MedicalDocument) => void;
  closeJsonModal: () => void;
  confirmDelete: (doc: MedicalDocument) => void;
  cancelDelete: () => void;
  executeDelete: () => void;
  reprocessDocument: (doc: MedicalDocument) => void;
  resetToSampleData: () => void;
}

const STORAGE_KEY = 'med_translate_ai_documents_v1';
const THEME_KEY = 'med_translate_ai_theme';
const VOCAB_STORAGE_KEY = 'med_translate_ai_vocab_v1';
const SETTINGS_STORAGE_KEY = 'med_translate_ai_settings_v1';

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Documents state
  const [documents, setDocuments] = useState<MedicalDocument[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse documents from localStorage:', e);
      }
    }
    return INITIAL_SAMPLE_DOCUMENTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    } catch (e) {
      console.warn('Failed to save documents to localStorage:', e);
    }
  }, [documents]);

  // Modal and action states
  const [activeDocument] = useState<MedicalDocument | null>(null);
  const [readerDocument, setReaderDocument] = useState<MedicalDocument | null>(null);
  const [jsonModalDocument, setJsonModalDocument] = useState<MedicalDocument | null>(null);
  const [deleteTargetDocument, setDeleteTargetDocument] = useState<MedicalDocument | null>(null);

  // Processing Simulation states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentProcessingDoc, setCurrentProcessingDoc] = useState<MedicalDocument | null>(null);
  const [currentStep, setCurrentStep] = useState<ProcessingStepId>(1);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [processingLogs, setProcessingLogs] = useState<ProcessingLog[]>([]);

  // Module 2: AI Translation Engine State
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translationProgress, setTranslationProgress] = useState<number>(0);
  const [translationMessage, setTranslationMessage] = useState<string>('');
  const [dualViewMode, setDualViewMode] = useState<DualViewMode>('dual');
  const [translationNotification, setTranslationNotification] = useState<TranslationNotification | null>(null);

  // Module 4: Pronunciation Lab State
  const [practiceTerm, setPracticeTerm] = useState<GlossaryTerm | null>(null);

  const openPronunciationLab = useCallback((term: GlossaryTerm) => {
    setPracticeTerm(term);
  }, []);

  const closePronunciationLab = useCallback(() => {
    setPracticeTerm(null);
  }, []);

  // Module 5: Vocabulary Deck & Mastery State
  const [savedVocab, setSavedVocab] = useState<SavedVocabTerm[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(VOCAB_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse vocab from localStorage:', e);
      }
    }
    return DEFAULT_SAVED_VOCABULARY;
  });

  useEffect(() => {
    try {
      localStorage.setItem(VOCAB_STORAGE_KEY, JSON.stringify(savedVocab));
    } catch (e) {
      console.warn('Failed to save vocab to localStorage:', e);
    }
  }, [savedVocab]);

  // Module 5: User Settings State
  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
          return { ...DEFAULT_USER_SETTINGS, ...JSON.parse(stored) };
        }
      } catch (e) {
        console.warn('Failed to parse settings from localStorage:', e);
      }
    }
    return DEFAULT_USER_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(userSettings));
    } catch (e) {
      console.warn('Failed to save settings to localStorage:', e);
    }
  }, [userSettings]);

  const updateUserSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setUserSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // Module 5: Export PDF Modal State
  const [isExportPdfOpen, setIsExportPdfOpen] = useState(false);
  const [exportPdfDoc, setExportPdfDoc] = useState<MedicalDocument | null>(null);

  const openExportPdf = useCallback((doc?: MedicalDocument) => {
    setExportPdfDoc(doc || readerDocument || documents[0] || null);
    setIsExportPdfOpen(true);
  }, [readerDocument, documents]);

  const closeExportPdf = useCallback(() => {
    setIsExportPdfOpen(false);
    setExportPdfDoc(null);
  }, []);

  // Module 5: Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const openSettings = useCallback(() => setIsSettingsOpen(true), []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

  // Vocabulary handlers
  const saveTermToVocab = useCallback((term: GlossaryTerm, docTitle?: string) => {
    setSavedVocab((prev) => {
      const existing = prev.find((t) => t.term.toLowerCase() === term.term.toLowerCase());
      if (existing) {
        return prev.map((t) =>
          t.id === existing.id
            ? { ...t, reviewCount: t.reviewCount + 1, lastReviewedAt: new Date().toISOString() }
            : t
        );
      }
      const newEntry: SavedVocabTerm = {
        ...term,
        id: `vocab-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        savedAt: new Date().toISOString(),
        masteryLevel: 'learning',
        reviewCount: 1,
        documentTitle: docTitle || 'Clinical Reader',
      };
      return [newEntry, ...prev];
    });
  }, []);

  const removeTermFromVocab = useCallback((termId: string) => {
    setSavedVocab((prev) => prev.filter((t) => t.id !== termId));
  }, []);

  const updateTermMastery = useCallback((termId: string, level: VocabMasteryLevel) => {
    setSavedVocab((prev) =>
      prev.map((t) =>
        t.id === termId
          ? {
              ...t,
              masteryLevel: level,
              reviewCount: t.reviewCount + 1,
              lastReviewedAt: new Date().toISOString(),
            }
          : t
      )
    );
  }, []);

  const addCustomVocabTerm = useCallback((termData: Omit<SavedVocabTerm, 'id' | 'savedAt'>) => {
    const newEntry: SavedVocabTerm = {
      ...termData,
      id: `vocab-${Date.now()}`,
      savedAt: new Date().toISOString(),
    };
    setSavedVocab((prev) => [newEntry, ...prev]);
  }, []);

  const isTermSaved = useCallback(
    (term: string) => {
      return savedVocab.some((t) => t.term.toLowerCase() === term.toLowerCase());
    },
    [savedVocab]
  );

  const resetVocabToSample = useCallback(() => {
    setSavedVocab(DEFAULT_SAVED_VOCABULARY);
  }, []);

  // Simulation timer refs
  const cancelRef = React.useRef(false);

  const addLog = useCallback((stage: string, level: 'info' | 'success' | 'warn' | 'error', message: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setProcessingLogs(prev => [...prev, { timestamp: time, stage, level, message }]);
  }, []);

  // Helper to create synthetic parsed page structure for new uploads
  const generateSyntheticPages = (
    title: string,
    specialty: string,
    _format: string,
    targetLang: string
  ): DocumentPage[] => {
    const isVietnamese = targetLang === 'vi';

    const p1Boxes: LayoutBoundingBox[] = [
      {
        id: 'box-new-1',
        page: 1,
        type: 'heading',
        confidence: 0.99,
        box: { top: 4, left: 6, width: 88, height: 7 },
        sourceText: title.toUpperCase(),
        translatedText: isVietnamese ? `TÀI LIỆU CHUYÊN KHOA: ${title.toUpperCase()}` : `SPECIALIZED TRANSLATION: ${title.toUpperCase()}`,
        glossaryTerms: [SAMPLE_GLOSSARY_CARDIOLOGY[0]],
      },
      {
        id: 'box-new-2',
        page: 1,
        type: 'paragraph',
        confidence: 0.98,
        box: { top: 13, left: 6, width: 42, height: 26 },
        sourceText: 'Clinical diagnosis relies on standardized physiological criteria, objective biomarker quantification, and evidence-based diagnostic imaging protocols.',
        translatedText: isVietnamese
          ? 'Chẩn đoán lâm sàng dựa trên các tiêu chuẩn sinh lý chuẩn hóa, định lượng chỉ dấu sinh học khách quan và các quy trình chẩn đoán hình ảnh dựa trên bằng chứng.'
          : 'El diagnóstico clínico se basa en criterios fisiológicos estandarizados, cuantificación objetiva de biomarcadores y protocolos de imagenología basados en evidencia.',
        glossaryTerms: [SAMPLE_GLOSSARY_CARDIOLOGY[1], SAMPLE_GLOSSARY_CARDIOLOGY[4]],
      },
      {
        id: 'box-new-3',
        page: 1,
        type: 'paragraph',
        confidence: 0.97,
        box: { top: 13, left: 52, width: 42, height: 26 },
        sourceText: 'Specialized pharmacological therapeutic interventions must be titrated according to individualized renal clearance, hepatic function, and hemodynamic tolerances.',
        translatedText: isVietnamese
          ? 'Các can thiệp điều trị dược lý chuyên khoa phải được chuẩn độ theo độ thanh thải thận cá thể hóa, chức năng gan và khả năng dung nạp huyết động.'
          : 'Las intervenciones terapéuticas farmacológicas especializadas deben titularse de acuerdo con el aclaramiento renal individualizado.',
        glossaryTerms: [SAMPLE_GLOSSARY_CARDIOLOGY[2]],
      },
      {
        id: 'box-new-4',
        page: 1,
        type: 'table',
        confidence: 0.95,
        box: { top: 43, left: 6, width: 88, height: 28 },
        sourceText: 'Diagnostic Protocol Matrix & Recommended Interventions',
        translatedText: isVietnamese ? 'Ma trận quy trình chẩn đoán và các can thiệp khuyến nghị' : 'Matriz de protocolo de diagnóstico e intervenciones recomendadas',
        tableData: {
          headers: ['Clinical Stage', 'First-Line Diagnostic', 'Guideline Recommendation', 'Evidence Level'],
          rows: [
            ['Phase I: Triage', '12-Lead Electrocardiogram', 'Immediate continuous telemetry', 'Class I, Level A'],
            ['Phase II: Laboratory', 'High-Sensitivity Troponin / Chem-7', 'Serial blood sampling at 0h and 3h', 'Class I, Level B'],
            ['Phase III: Structural', 'Transthoracic Echocardiogram', 'Evaluate left ventricular ejection fraction', 'Class I, Level B'],
            ['Phase IV: Interventional', 'Coronary Angiography', 'Revascularization as indicated', 'Class IIa, Level A'],
          ],
        },
      },
      {
        id: 'box-new-5',
        page: 1,
        type: 'callout',
        confidence: 0.99,
        box: { top: 74, left: 6, width: 88, height: 18 },
        sourceText: `CLINICAL SUMMARY: Layout verified under domain [${specialty}]. Terminology mappings verified with 99.4% confidence rating against standardized clinical thesauri.`,
        translatedText: isVietnamese
          ? `TỔNG QUÁT LÂM SÀNG: Bố cục đã được xác thực trong chuyên khoa [${specialty}]. Ánh xạ thuật ngữ được xác minh với độ tin cậy 99,4% so với từ điển y khoa chuẩn hóa.`
          : `RESUMEN CLÍNICO: Diseño verificado en la especialidad [${specialty}]. Mapeo terminológico verificado con 99,4% de confianza.`,
      },
    ];

    return [{ pageNumber: 1, title: 'Chapter Overview & Primary Layout', boxes: p1Boxes }];
  };

  const startProcessing = useCallback(
    (draft: UploadDraft) => {
      cancelRef.current = false;
      setIsProcessing(true);
      setCurrentStep(1);
      setOverallProgress(2);
      setProcessingLogs([]);

      // Create a pending document record
      const newDocId = `doc-${Date.now()}`;
      const newDoc: MedicalDocument = {
        id: newDocId,
        title: draft.name.replace(/\.(pdf|epub)$/i, ''),
        fileName: draft.name,
        fileSizeBytes: draft.sizeBytes,
        format: draft.format,
        estimatedPages: draft.estimatedPages || Math.max(12, Math.round(draft.sizeBytes / (350 * 1024))),
        uploadedAt: new Date().toISOString(),
        status: 'processing',
        specialty: draft.specialty,
        sourceLanguage: draft.sourceLanguage,
        targetLanguage: draft.targetLanguage,
        currentStep: 1,
        overallProgress: 5,
        glossaryCount: 0,
        layoutBlocksCount: 0,
        tablesCount: 0,
        figuresCount: 0,
        dictionaryStandard: draft.dictionaryStandard,
        logs: [],
      };

      setCurrentProcessingDoc(newDoc);

      // Prepend to documents list as processing
      setDocuments(prev => [newDoc, ...prev.filter(d => d.id !== newDocId)]);

      // STEP 1: Uploading file to secure storage (0s - 1.4s)
      addLog('Storage', 'info', `Initiating secure multi-part chunked upload for ${draft.name} (${(draft.sizeBytes / (1024 * 1024)).toFixed(1)} MB)...`);

      setTimeout(() => {
        if (cancelRef.current) return;
        addLog('Storage', 'info', 'Generating SHA-256 integrity hash & verifying AES-256 envelope encryption...');
        setOverallProgress(14);
      }, 500);

      setTimeout(() => {
        if (cancelRef.current) return;
        addLog('Storage', 'success', 'Storage verification successful. Quarantine scan passed (0 threats detected).');
        setOverallProgress(25);
        setCurrentStep(2);

        // STEP 2: Parsing document structure & bounding boxes (1.4s - 3.2s)
        addLog('Layout Parser', 'info', 'Extracting document vector layers and high-resolution raster tiles...');
      }, 1200);

      setTimeout(() => {
        if (cancelRef.current) return;
        addLog('Layout Parser', 'info', 'Running layout bounding-box segmentation (two-column flow reflow, headers, paragraphs, figure callouts)...');
        setOverallProgress(45);
      }, 2000);

      setTimeout(() => {
        if (cancelRef.current) return;
        const tablesDetected = Math.max(2, Math.floor(newDoc.estimatedPages / 6));
        const figuresDetected = Math.max(3, Math.floor(newDoc.estimatedPages / 4));
        const blocksCount = Math.max(28, newDoc.estimatedPages * 3);
        addLog('Layout Parser', 'success', `Layout boundaries extracted: ${blocksCount} content blocks, ${tablesDetected} clinical tables, ${figuresDetected} figure callouts identified.`);
        setOverallProgress(60);
        setCurrentStep(3);

        // STEP 3: Initializing Medical Glossary Engine (3.2s - 4.8s)
        addLog('Glossary Engine', 'info', `Matching vocabulary against ${draft.dictionaryStandard} ontology...`);
      }, 3000);

      setTimeout(() => {
        if (cancelRef.current) return;
        addLog('Glossary Engine', 'info', 'Detecting Latin anatomical binomials, pharmacologic chemical entities, and ICD-11 codes...');
        setOverallProgress(78);
      }, 4000);

      setTimeout(() => {
        if (cancelRef.current) return;
        const glossaryCount = Math.max(65, Math.floor(newDoc.estimatedPages * 4.8));
        addLog('Glossary Engine', 'success', `Medical Glossary Engine initialized: ${glossaryCount} validated clinical terms indexed with definition anchors.`);
        setOverallProgress(90);
        setCurrentStep(4);

        // STEP 4: Ready for Dual-Pane Translation view (4.8s - 5.6s)
        addLog('Dual-Pane Sync', 'info', `Constructing synchronized dual-pane reading tree for ${draft.sourceLanguage.toUpperCase()} -> ${draft.targetLanguage.toUpperCase()}...`);
      }, 4800);

      setTimeout(() => {
        if (cancelRef.current) return;
        addLog('Dual-Pane Sync', 'success', 'Document processing completed! Layout schema locked and ready for Dual-Pane Translation view.');
        setOverallProgress(100);

        // Finalize document state
        const tablesDetected = Math.max(2, Math.floor(newDoc.estimatedPages / 6));
        const figuresDetected = Math.max(3, Math.floor(newDoc.estimatedPages / 4));
        const blocksCount = Math.max(28, newDoc.estimatedPages * 3);
        const glossaryCount = Math.max(65, Math.floor(newDoc.estimatedPages * 4.8));

        const completedDoc: MedicalDocument = {
          ...newDoc,
          status: 'completed',
          currentStep: 4,
          overallProgress: 100,
          glossaryCount,
          layoutBlocksCount: blocksCount,
          tablesCount: tablesDetected,
          figuresCount: figuresDetected,
          pages: generateSyntheticPages(newDoc.title, newDoc.specialty, newDoc.format, newDoc.targetLanguage),
        };

        setCurrentProcessingDoc(completedDoc);
        setDocuments(prev => [completedDoc, ...prev.filter(d => d.id !== completedDoc.id)]);
      }, 5600);
    },
    [addLog]
  );

  const cancelProcessing = useCallback(() => {
    cancelRef.current = true;
    setIsProcessing(false);
    if (currentProcessingDoc) {
      setDocuments(prev =>
        prev.map(d =>
          d.id === currentProcessingDoc.id
            ? { ...d, status: 'failed', errorMessage: 'Processing aborted by user.' }
            : d
        )
      );
    }
    setCurrentProcessingDoc(null);
  }, [currentProcessingDoc]);

  const openReader = useCallback((doc: MedicalDocument) => {
    // If pages are not yet generated, attach synthetic page for preview
    if (!doc.pages || doc.pages.length === 0) {
      const generatedDoc: MedicalDocument = {
        ...doc,
        pages: generateSyntheticPages(doc.title, doc.specialty, doc.format, doc.targetLanguage),
      };
      setReaderDocument(generatedDoc);
    } else {
      setReaderDocument(doc);
    }
  }, []);

  const closeReader = useCallback(() => {
    setReaderDocument(null);
  }, []);

  const openJsonModal = useCallback((doc: MedicalDocument) => {
    setJsonModalDocument(doc);
  }, []);

  const closeJsonModal = useCallback(() => {
    setJsonModalDocument(null);
  }, []);

  const confirmDelete = useCallback((doc: MedicalDocument) => {
    setDeleteTargetDocument(doc);
  }, []);

  const cancelDelete = useCallback(() => {
    setDeleteTargetDocument(null);
  }, []);

  const executeDelete = useCallback(() => {
    if (!deleteTargetDocument) return;
    setDocuments(prev => prev.filter(d => d.id !== deleteTargetDocument.id));
    if (readerDocument?.id === deleteTargetDocument.id) {
      setReaderDocument(null);
    }
    if (jsonModalDocument?.id === deleteTargetDocument.id) {
      setJsonModalDocument(null);
    }
    setDeleteTargetDocument(null);
  }, [deleteTargetDocument, readerDocument, jsonModalDocument]);

  const reprocessDocument = useCallback(
    (doc: MedicalDocument) => {
      const draft: UploadDraft = {
        file: null,
        name: doc.fileName,
        sizeBytes: doc.fileSizeBytes,
        format: doc.format,
        estimatedPages: doc.estimatedPages,
        specialty: doc.specialty,
        sourceLanguage: doc.sourceLanguage,
        targetLanguage: doc.targetLanguage,
        dictionaryStandard: doc.dictionaryStandard,
      };
      startProcessing(draft);
    },
    [startProcessing]
  );

  const resetToSampleData = useCallback(() => {
    setDocuments(INITIAL_SAMPLE_DOCUMENTS);
  }, []);

  const toggleDualView = useCallback(() => {
    setDualViewMode((prev) => {
      if (prev === 'dual') return 'target_only';
      if (prev === 'target_only') return 'source_only';
      return 'dual';
    });
  }, []);

  const dismissNotification = useCallback(() => {
    setTranslationNotification(null);
  }, []);

  const translatePage = useCallback(
    async (docId: string, pageNumber: number) => {
      const doc = documents.find((d) => d.id === docId) || readerDocument;
      if (!doc || !doc.pages) return;

      const page = doc.pages.find((p) => p.pageNumber === pageNumber) || doc.pages[0];
      if (!page) return;

      setIsTranslating(true);
      setTranslationProgress(25);
      setTranslationMessage(`Sending Page ${pageNumber} extracted blocks to Gemini 3.8 Flash...`);

      try {
        const blocksToTranslate = page.boxes.map((b) => ({
          id: b.id,
          sourceText: b.sourceText,
          type: b.type,
        }));

        setTranslationProgress(55);
        setTranslationMessage('Translating medical prose & aligning ICD-11 / MeSH terminology...');

        const result = await translateMedicalBlocks({
          blocks: blocksToTranslate,
          targetLanguage: doc.targetLanguage || 'vi',
          specialty: doc.specialty,
          customApiKey: userSettings.customApiKey,
          selectedModel: userSettings.selectedModel,
          translationTone: userSettings.translationTone,
        });

        setTranslationProgress(85);
        setTranslationMessage('Synthesizing IPA phonetics & clinical popover definitions...');

        const resultMap = new Map(result.results.map((r) => [r.id, r]));

        const updatedBoxes = page.boxes.map((b) => {
          const res = resultMap.get(b.id);
          if (res) {
            return {
              ...b,
              translatedText: res.translatedText,
              glossaryTerms: res.glossaryTerms && res.glossaryTerms.length > 0 ? res.glossaryTerms : b.glossaryTerms,
            };
          }
          return b;
        });

        const updatedPages = doc.pages.map((p) =>
          p.pageNumber === page.pageNumber ? { ...p, boxes: updatedBoxes } : p
        );

        const updatedDoc: MedicalDocument = {
          ...doc,
          pages: updatedPages,
        };

        setDocuments((prev) => prev.map((d) => (d.id === doc.id ? updatedDoc : d)));
        if (readerDocument?.id === doc.id) {
          setReaderDocument(updatedDoc);
        }

        setTranslationProgress(100);
        setTranslationNotification({
          id: `trans-${Date.now()}`,
          type: 'success',
          title: 'Page Translation Complete',
          message: `Page ${pageNumber} translated with strict clinical accuracy via ${result.source} (${result.latencyMs}ms). Acronyms (STEMI, ECG, PCI) preserved.`,
          timestamp: new Date().toLocaleTimeString(),
        });
      } catch (err: any) {
        setTranslationNotification({
          id: `trans-err-${Date.now()}`,
          type: 'error',
          title: 'Translation Request Failed',
          message: err.message || 'Unable to complete AI translation. Please retry.',
          timestamp: new Date().toLocaleTimeString(),
        });
      } finally {
        setTimeout(() => {
          setIsTranslating(false);
          setTranslationProgress(0);
        }, 600);
      }
    },
    [documents, readerDocument, userSettings]
  );

  const translateFullBook = useCallback(
    async (docId: string) => {
      const doc = documents.find((d) => d.id === docId) || readerDocument;
      if (!doc || !doc.pages) return;

      setIsTranslating(true);
      setTranslationProgress(10);
      setTranslationMessage(`Initializing Full Book Translation Pipeline for "${doc.title}"...`);

      try {
        let totalTermsCount = 0;
        const totalPages = doc.pages.length;
        const updatedPages: DocumentPage[] = [];

        for (let i = 0; i < totalPages; i++) {
          const page = doc.pages[i];
          const pct = Math.round(15 + ((i + 1) / totalPages) * 75);
          setTranslationProgress(pct);
          setTranslationMessage(`Translating Page ${page.pageNumber} of ${totalPages} with Gemini 3.8 Flash...`);

          const blocksToTranslate = page.boxes.map((b) => ({
            id: b.id,
            sourceText: b.sourceText,
            type: b.type,
          }));

          const result = await translateMedicalBlocks({
            blocks: blocksToTranslate,
            targetLanguage: doc.targetLanguage || 'vi',
            specialty: doc.specialty,
            customApiKey: userSettings.customApiKey,
            selectedModel: userSettings.selectedModel,
            translationTone: userSettings.translationTone,
          });

          const resultMap = new Map(result.results.map((r) => [r.id, r]));

          const updatedBoxes = page.boxes.map((b) => {
            const res = resultMap.get(b.id);
            if (res) {
              if (res.glossaryTerms) totalTermsCount += res.glossaryTerms.length;
              return {
                ...b,
                translatedText: res.translatedText,
                glossaryTerms: res.glossaryTerms && res.glossaryTerms.length > 0 ? res.glossaryTerms : b.glossaryTerms,
              };
            }
            return b;
          });

          updatedPages.push({ ...page, boxes: updatedBoxes });
        }

        const updatedDoc: MedicalDocument = {
          ...doc,
          pages: updatedPages,
          glossaryCount: Math.max(doc.glossaryCount, totalTermsCount + 20),
        };

        setDocuments((prev) => prev.map((d) => (d.id === doc.id ? updatedDoc : d)));
        if (readerDocument?.id === doc.id) {
          setReaderDocument(updatedDoc);
        }

        setTranslationProgress(100);
        setTranslationNotification({
          id: `trans-full-${Date.now()}`,
          type: 'success',
          title: 'Full Medical Book Translation Complete',
          message: `All pages translated and synchronized into dual-pane reading tree. ${totalTermsCount} medical terms indexed with IPA and clinical definitions.`,
          timestamp: new Date().toLocaleTimeString(),
        });
      } catch (err: any) {
        setTranslationNotification({
          id: `trans-err-${Date.now()}`,
          type: 'error',
          title: 'Full Translation Failed',
          message: err.message || 'Error occurred during full document translation.',
          timestamp: new Date().toLocaleTimeString(),
        });
      } finally {
        setTimeout(() => {
          setIsTranslating(false);
          setTranslationProgress(0);
        }, 800);
      }
    },
    [documents, readerDocument, userSettings]
  );

  return (
    <DocumentContext.Provider
      value={{
        documents,
        activeDocument,
        readerDocument,
        jsonModalDocument,
        deleteTargetDocument,
        isProcessing,
        currentProcessingDoc,
        currentStep,
        overallProgress,
        processingLogs,
        theme,
        isTranslating,
        translationProgress,
        translationMessage,
        dualViewMode,
        translationNotification,
        translatePage,
        translateFullBook,
        toggleDualView,
        setDualViewMode,
        dismissNotification,
        practiceTerm,
        openPronunciationLab,
        closePronunciationLab,
        // Module 5
        savedVocab,
        saveTermToVocab,
        removeTermFromVocab,
        updateTermMastery,
        addCustomVocabTerm,
        isTermSaved,
        resetVocabToSample,
        userSettings,
        updateUserSettings,
        isExportPdfOpen,
        exportPdfDoc,
        openExportPdf,
        closeExportPdf,
        isSettingsOpen,
        openSettings,
        closeSettings,
        toggleTheme,
        startProcessing,
        cancelProcessing,
        openReader,
        closeReader,
        openJsonModal,
        closeJsonModal,
        confirmDelete,
        cancelDelete,
        executeDelete,
        reprocessDocument,
        resetToSampleData,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};
