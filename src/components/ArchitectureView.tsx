import React from 'react';
import {
  UploadCloud,
  Layers,
  Cpu,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Database,
  ArrowRight,
  Sparkles,
  Volume2,
  Columns,
  Mic,
  Activity,
  BookMarked,
  FileDown,
  Settings,
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#0F52BA] dark:text-blue-400">
              MED-TRANSLATE-AI System Architecture
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              Modules 1 - 4: Document Ingestion, Gemini 3.8 Flash Engine, Dual-Pane Reader & Clinical Audio Lab
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
              Medical textbooks present complex layout and semantic challenges: multi-column text flows, clinical diagnostic tables, anatomical vector schematics, and strict medical abbreviations. Module 1 handles layout extraction, Module 2 translates with Gemini 3.8 Flash, Module 3 coordinates synchronized dual-pane reading, and Module 4 powers Medical Audio TTS and Speech-to-Text Pronunciation Assessment.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#6D28D9]/10 text-[#6D28D9] dark:bg-purple-900/30 dark:text-purple-300 font-bold">
              Modules 1-4 Active
            </span>
          </div>
        </div>
      </div>

      {/* Module 2 Deep Dive Highlight */}
      <div className="rounded-xl border border-[#0F52BA]/30 bg-[#0F52BA]/[0.03] p-5 dark:border-blue-800 dark:bg-blue-950/20">
        <div className="flex items-center gap-2 mb-2 text-[#0F52BA] dark:text-blue-400 font-bold text-sm">
          <Sparkles className="h-4 w-4 text-[#2E8B57]" />
          <span>Module 2: AI Translation Engine & Medical Glossary Integration</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          Module 2 consumes the bounding box blocks extracted by Module 1, dispatches them through the Express backend proxy to <strong>Gemini 3.8 Flash</strong>, and maps clinical concepts to standardized ontologies with IPA phonetic transcriptions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
              <ShieldCheck className="h-4 w-4 text-[#2E8B57]" />
              <span>Acronym Preservation</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Strictly preserves standardized clinical abbreviations (STEMI, ECG, PCI, cTnI, CT-Scan) in parentheses alongside target translations.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
              <Volume2 className="h-4 w-4 text-[#0F52BA]" />
              <span>IPA Phonetics & Audio Bridge</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Extracts International Phonetic Alphabet transcriptions and connects to the speech synthesis engine for audio pronunciation.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
              <Columns className="h-4 w-4 text-purple-600" />
              <span>Multi-View Layout Modes</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Seamlessly toggles between Dual-View (50/50 English & Vietnamese), English Source Only, and Vietnamese Translation Only.
            </p>
          </div>
        </div>
      </div>

      {/* Module 3 Deep Dive Highlight */}
      <div className="rounded-xl border border-[#0F52BA]/30 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 mb-2 text-[#0F52BA] dark:text-blue-400 font-bold text-sm">
          <BookOpen className="h-4 w-4 text-[#0F52BA]" />
          <span>Module 3: Interactive Dual-Pane Reader UI & Synchronized Scrolling</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          A medical-grade bilingual split-screen reader designed for clinicians and medical students. Left pane displays original English medical chapters and vector diagrams; Right pane renders aligned Vietnamese translations matching block-by-block. Synchronized scrolling automatically recalculates proportional scroll heights to keep clinical concepts aligned.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-3 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="font-bold text-xs text-[#0F52BA] dark:text-blue-400 flex items-center gap-1.5 mb-1">
              <Columns className="h-4 w-4" />
              <span>50/50 Synchronized Split Screen</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Dual-Pane view with ratio-locked scroll events and one-click toggle to Single-Pane full width. Cross-pane block highlight tracks reading position.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-3 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="font-bold text-xs text-[#6D28D9] dark:text-purple-300 flex items-center gap-1.5 mb-1">
              <Sparkles className="h-4 w-4" />
              <span>Interactive Glossary Popover</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Hover or click any clinical term to reveal English spelling, IPA transcription, Vietnamese MeSH translation, definition, and quick audio/practice triggers.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-3 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="font-bold text-xs text-[#1E293B] dark:text-slate-200 flex items-center gap-1.5 mb-1">
              <FileText className="h-4 w-4 text-[#0F52BA]" />
              <span>Clinical Toolbar & PDF Export</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Page [ 12 ] of 450 direct navigation, zoom controls (75%-150%), Global TTS Audio play, and printable bilingual PDF chapter exporter.
            </p>
          </div>
        </div>
      </div>

      {/* Module 4 Deep Dive Highlight */}
      <div className="rounded-xl border border-[#6D28D9]/30 bg-[#6D28D9]/[0.03] p-5 dark:border-purple-800 dark:bg-purple-950/20">
        <div className="flex items-center gap-2 mb-2 text-[#6D28D9] dark:text-purple-300 font-bold text-sm">
          <Mic className="h-4 w-4 text-[#6D28D9]" />
          <span>Module 4: Medical Audio (TTS) & Clinical Speech Pronunciation Assessment Lab</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          Mastering spoken medical English is essential for healthcare providers and international clinical communication. Module 4 introduces paragraph-level and concept-level Text-to-Speech audio synthesis with speed controls (0.75x, 1.0x, 1.25x), visual waveforms, and an interactive Speech Pronunciation Assessment Lab with syllable breakdown and clinical guidance.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
              <Volume2 className="h-4 w-4 text-[#0F52BA]" />
              <span>Paragraph & Term TTS</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Play buttons with speed toggles (0.75x, 1.0x, 1.25x) embedded in the Dual-Pane Reader for all English text blocks and popover cards with animated waveforms.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
              <Activity className="h-4 w-4 text-[#6D28D9]" />
              <span>Real-Time Waveform & Mic</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Captures live vocal audio via MediaRecorder API with real-time waveform visualization, recording timer, and instant playback comparison.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Syllable Scoring & Feedback</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Provides overall phonetic scores (e.g. 88/100), highlights mispronounced syllables in red, and offers constructive clinical guidance on tonic stress and aspiration.
            </p>
          </div>
        </div>
      </div>

      {/* Module 5 Deep Dive Highlight */}
      <div className="rounded-xl border border-[#0F52BA]/30 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 mb-2 text-[#0F52BA] dark:text-blue-400 font-bold text-sm">
          <BookMarked className="h-4 w-4 text-[#0F52BA]" />
          <span>Module 5: PDF Export Service, Personal Medical Vocabulary Deck & Settings (BYOK)</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          The final module completes the clinical learning loop. Medical learners can export publication-ready bilingual PDF dossiers with customizable scopes (Current Page, Chapter, Full Book) and layout alignments. Saved clinical terms are organized into a Personal Medical Vocabulary Notebook (Sổ từ vựng y khoa) with 3D flip card study mode, mastery progression (Learning, Reviewing, Mastered), and Anki deck export. Clinicians can also configure their custom Gemini API Key (BYOK) and customize TTS voices and medical thesauri.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-3 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="font-bold text-xs text-[#0F52BA] dark:text-blue-400 flex items-center gap-1.5 mb-1">
              <FileDown className="h-4 w-4" />
              <span>Multi-Scope PDF Export</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Client-side PDF generation using jsPDF with dual-pane parallel columns, Vietnamese clinical layout, MeSH/ICD terminology appendix, and browser print preview.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-3 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="font-bold text-xs text-[#6D28D9] dark:text-purple-300 flex items-center gap-1.5 mb-1">
              <BookMarked className="h-4 w-4" />
              <span>Personal Vocabulary Deck & Flashcards</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Organize saved terms with 3-tier mastery levels, interactive 3D flip study mode, celebration confetti on mastery, and export to Anki (.txt) or PDF study sheets.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-3 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
              <Settings className="h-4 w-4 text-[#0F52BA]" />
              <span>BYOK API Key & Clinical Settings</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Secure custom Gemini API key input with real-time latency ping verification, model switching (Flash vs Pro), TTS voice speeds (0.75x-1.25x), and ontology selection.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Pipeline Stages Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F52BA]/10 text-[#0F52BA] mb-3">
            <Database className="h-5 w-5" />
          </div>
          <div className="text-xs font-mono font-bold text-[#0F52BA] dark:text-blue-400 mb-1">
            STAGE 01
          </div>
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">
            Secure Ingestion & Validation
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Pre-flight validation for format (.pdf, .epub) & size (&le;50MB). Generates SHA-256 integrity hash and establishes AES-256 encrypted sandbox storage.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2E8B57]/10 text-[#2E8B57] mb-3">
            <Layers className="h-5 w-5" />
          </div>
          <div className="text-xs font-mono font-bold text-[#2E8B57] dark:text-emerald-400 mb-1">
            STAGE 02
          </div>
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">
            Optical Layout Segmentation
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Multi-column reading order reflow, heading hierarchy detection, table grid cell bounding box coordinates, and anatomical figure callout extraction.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 mb-3">
            <Cpu className="h-5 w-5" />
          </div>
          <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 mb-1">
            STAGE 03
          </div>
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">
            Gemini 3.8 Flash Clinical AI
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Medical linguist system instruction translates blocks with strict precision, preserves clinical acronyms, and extracts IPA phonetic transcriptions.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 mb-3">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mb-1">
            STAGE 04
          </div>
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">
            Dual-Pane Synced Reader
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Binds layout bounding boxes with interactive popovers, audio pronunciation, and multi-view layout switching (Dual, English, Vietnamese).
          </p>
        </div>
      </div>
    </div>
  );
};
