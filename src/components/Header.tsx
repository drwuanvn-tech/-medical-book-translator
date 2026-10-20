import React from 'react';
import { Sun, Moon, Sparkles, BookOpen, FileText, Mic, BookMarked, Settings } from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';
import { SAMPLE_GLOSSARY_CARDIOLOGY } from '../data/sampleBooks';

interface HeaderProps {
  activeTab: 'upload' | 'library' | 'reader' | 'speech-lab' | 'vocabulary' | 'architecture';
  setActiveTab: (tab: 'upload' | 'library' | 'reader' | 'speech-lab' | 'vocabulary' | 'architecture') => void;
  onOpenQuickSample: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenQuickSample }) => {
  const { theme, toggleTheme, documents, savedVocab, openPronunciationLab, openSettings } = useDocuments();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark (Single element, no nested pills) */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F52BA] text-white shadow-sm shadow-[#0F52BA]/20">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('upload');
              }}
              className="whitespace-nowrap font-sans text-lg font-bold tracking-tight text-[#1E293B] dark:text-white"
            >
              MED-TRANSLATE-AI
            </a>
            <span className="hidden sm:inline text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Smart Medical Book Translator & Learning Platform
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setActiveTab('upload')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeTab === 'upload'
                ? 'border-[#0F52BA] text-[#0F52BA] font-semibold dark:border-[#2E8B57] dark:text-[#2E8B57]'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Upload & Parsing
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'library'
                ? 'border-[#0F52BA] text-[#0F52BA] font-semibold dark:border-[#2E8B57] dark:text-[#2E8B57]'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Library</span>
            <span className="font-mono text-xs tabular-nums px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {documents.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('reader')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'reader'
                ? 'border-[#6D28D9] text-[#6D28D9] font-bold dark:border-purple-400 dark:text-purple-300'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-[#6D28D9]" />
            <span>Dual-Pane Reader</span>
          </button>
          <button
            onClick={() => setActiveTab('speech-lab')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'speech-lab'
                ? 'border-[#6D28D9] text-[#6D28D9] font-bold dark:border-purple-400 dark:text-purple-300'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Mic className="h-3.5 w-3.5 text-[#6D28D9]" />
            <span>Speech Lab (🎤)</span>
          </button>
          <button
            onClick={() => setActiveTab('vocabulary')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'vocabulary'
                ? 'border-[#0F52BA] text-[#0F52BA] font-bold dark:border-blue-400 dark:text-blue-300'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookMarked className="h-3.5 w-3.5 text-[#0F52BA]" />
            <span>Vocabulary Deck</span>
            <span className="font-mono text-xs tabular-nums px-1.5 py-0.2 rounded bg-blue-100 text-[#0F52BA] font-bold dark:bg-blue-950 dark:text-blue-300">
              {savedVocab.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeTab === 'architecture'
                ? 'border-[#0F52BA] text-[#0F52BA] font-semibold dark:border-[#2E8B57] dark:text-[#2E8B57]'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Modules & Specs
          </button>
        </nav>

        {/* Zone 3: Actions (Single-line controls) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => openPronunciationLab(SAMPLE_GLOSSARY_CARDIOLOGY[0])}
            type="button"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#6D28D9] hover:bg-[#5B21B6] active:scale-[0.98] rounded-md transition shadow-xs cursor-pointer"
            title="Launch Clinical Pronunciation Lab (Speech Practice & AI Syllable Assessment)"
          >
            <Mic className="h-3.5 w-3.5" />
            <span className="whitespace-nowrap">Pronunciation Lab</span>
          </button>

          <button
            onClick={onOpenQuickSample}
            type="button"
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0F52BA] hover:bg-[#0A3C8A] active:scale-[0.98] rounded-md transition shadow-xs cursor-pointer"
            title="Load standard medical textbooks for instant testing"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="whitespace-nowrap">Sample Textbooks</span>
          </button>

          {/* Module 5 Settings Modal Trigger */}
          <button
            onClick={openSettings}
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition cursor-pointer"
            aria-label="Application Settings & API Configuration"
            title="Settings & BYOK Gemini API Key Config (Module 5)"
          >
            <Settings className="h-4 w-4" />
          </button>

          <button
            onClick={toggleTheme}
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition"
            aria-label="Toggle light/dark theme"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
