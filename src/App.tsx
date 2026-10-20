/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DocumentProvider, useDocuments } from './context/DocumentContext';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { UploadSection } from './components/UploadSection';
import { DocumentDashboard } from './components/DocumentDashboard';
import { ProcessingModal } from './components/ProcessingModal';
import { DualPaneReaderModal } from './components/DualPaneReaderModal';
import { LayoutJsonModal } from './components/LayoutJsonModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { QuickSampleModal } from './components/QuickSampleModal';
import { ArchitectureView } from './components/ArchitectureView';
import { DualPaneReaderView } from './components/DualPaneReaderView';
import { PronunciationLabModal } from './components/PronunciationLabModal';
import { MedicalSpeechLabView } from './components/MedicalSpeechLabView';
import { MedicalVocabularyDeck } from './components/MedicalVocabularyDeck';
import { ExportPdfModal } from './components/ExportPdfModal';
import { SettingsModal } from './components/SettingsModal';
import { SAMPLE_GLOSSARY_CARDIOLOGY } from './data/sampleBooks';
import { UploadDraft } from './types';
import { BookOpen, Layers, Sparkles, CheckCircle2, Mic, BookMarked, Settings } from 'lucide-react';

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'library' | 'reader' | 'speech-lab' | 'vocabulary' | 'architecture'>('upload');
  const [isQuickSampleOpen, setIsQuickSampleOpen] = useState(false);
  const {
    startProcessing,
    documents,
    resetToSampleData,
    practiceTerm,
    openPronunciationLab,
    closePronunciationLab,
    isExportPdfOpen,
    exportPdfDoc,
    closeExportPdf,
    isSettingsOpen,
    closeSettings,
  } = useDocuments();

  const handleNextTerm = () => {
    if (!practiceTerm) return;
    const allTerms = SAMPLE_GLOSSARY_CARDIOLOGY;
    const currentIndex = allTerms.findIndex(
      (t) => t.term.toLowerCase() === practiceTerm.term.toLowerCase()
    );
    const nextIndex = (currentIndex + 1) % allTerms.length;
    openPronunciationLab(allTerms[nextIndex]);
  };

  const handleStartProcessing = (draft: UploadDraft) => {
    startProcessing(draft);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {/* Top Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickSample={() => setIsQuickSampleOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Telemetry Metric Strip */}
        <StatsBar />

        {/* View Switcher Content */}
        {activeTab === 'upload' && (
          <div className="space-y-8">
            {/* Core Upload & Extraction Section */}
            <UploadSection onStartProcessing={handleStartProcessing} />

            {/* Document History preview on the same screen for instant feedback */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="h-4 w-4 text-[#0F52BA] dark:text-blue-400" />
                    <span>Document History & Parsing Status</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Review previously uploaded medical books, check processing states, or open the dual-pane reader.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('library')}
                  className="text-xs font-semibold text-[#0F52BA] hover:underline dark:text-blue-400 cursor-pointer"
                >
                  View Full Library ({documents.length}) &rarr;
                </button>
              </div>

              <DocumentDashboard />
            </div>
          </div>
        )}

        {activeTab === 'library' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Medical Book Repository & Parsing History
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage all ingested clinical books, inspect extracted JSON coordinate schemas, and open the dual-pane translation reader.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetToSampleData}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
                  title="Reload preset clinical books (Harrison's, Gray's, Robbins, Guyton)"
                >
                  Reload Sample Books
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0F52BA] hover:bg-[#0A3C8A] rounded-lg transition shadow-xs cursor-pointer"
                >
                  + Upload New Book
                </button>
              </div>
            </div>

            <DocumentDashboard />
          </div>
        )}

        {activeTab === 'reader' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#1E293B] dark:text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#6D28D9]" />
                  <span>Module 3: Interactive Dual-Pane Clinical Reader</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Side-by-side synchronized English and Vietnamese translation with locked scrolling, Royal Purple AI highlights, and printable PDF export.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('library')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 transition cursor-pointer"
                >
                  &larr; Switch Book from Library
                </button>
              </div>
            </div>

            <DualPaneReaderView />
          </div>
        )}

        {activeTab === 'speech-lab' && (
          <MedicalSpeechLabView onOpenReader={() => setActiveTab('reader')} />
        )}

        {/* Module 5: Personal Medical Vocabulary Deck */}
        {activeTab === 'vocabulary' && (
          <MedicalVocabularyDeck onOpenReader={() => setActiveTab('reader')} />
        )}

        {activeTab === 'architecture' && <ArchitectureView />}
      </main>

      {/* Modals & Dialogs */}
      <ProcessingModal />
      <DualPaneReaderModal />
      <LayoutJsonModal />
      <DeleteConfirmModal />
      <QuickSampleModal
        isOpen={isQuickSampleOpen}
        onClose={() => setIsQuickSampleOpen(false)}
        onSelectSample={handleStartProcessing}
      />
      <PronunciationLabModal
        term={practiceTerm}
        isOpen={!!practiceTerm}
        onClose={closePronunciationLab}
        onNextTerm={handleNextTerm}
      />
      {/* Module 5 Modals */}
      <ExportPdfModal
        isOpen={isExportPdfOpen}
        document={exportPdfDoc}
        onClose={closeExportPdf}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={closeSettings}
      />

      {/* Clinical Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-500 dark:text-slate-400 mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#1E293B] dark:text-slate-200">
              MED-TRANSLATE-AI
            </span>
            <span aria-hidden="true">·</span>
            <span>Complete 5-Module Clinical Translation Platform</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px] text-[#6D28D9] dark:text-purple-400 font-semibold">
              Gemini 3.8 Flash & MeSH / ICD-11 Engine
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Theme: Medical Blue (#0F52BA) & Royal Purple (#6D28D9)</span>
            <span aria-hidden="true">·</span>
            <span>Module 5: PDF Export & Personal Vocab Deck Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <DocumentProvider>
      <MainContent />
    </DocumentProvider>
  );
}
