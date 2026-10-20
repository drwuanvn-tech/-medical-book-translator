import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Sparkles,
  ShieldCheck,
  Check,
  Copy,
  Mic,
  Square,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { GlossaryTerm, AudioPlaybackSpeed } from '../types';
import { useDocuments } from '../context/DocumentContext';

interface MedicalGlossaryPopoverProps {
  term: GlossaryTerm;
  children: React.ReactNode;
}

export const MedicalGlossaryPopover: React.FC<MedicalGlossaryPopoverProps> = ({
  term,
  children,
}) => {
  const { openPronunciationLab, saveTermToVocab, removeTermFromVocab, isTermSaved, userSettings } =
    useDocuments();
  const [isOpen, setIsOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);
  const [speed, setSpeed] = useState<AudioPlaybackSpeed>(userSettings.ttsDefaultSpeed || 1.0);

  const isSaved = isTermSaved(term.term);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) {
      // Find and remove
      // Or simply save with notification
    }
    saveTermToVocab(term);
  };

  // Audio Playback using Web Speech API with selected speed
  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(term.term);
      utterance.lang = 'en-US';
      utterance.rate = speed;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(true);
      setTimeout(() => setIsPlayingAudio(false), 1400);
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `${term.term} ${term.ipa ? term.ipa + ' ' : ''}- ${term.translatedTerm}\n${term.definition}\n${term.code}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleOpenPractice = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    openPronunciationLab(term);
  };

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Highlighted Term Trigger: Royal Purple accent for AI Glossary highlight */}
      <span
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="cursor-pointer border-b-2 border-dotted border-[#6D28D9] text-[#6D28D9] bg-[#6D28D9]/8 hover:bg-[#6D28D9]/15 px-1 py-0.5 rounded transition font-medium dark:text-purple-300 dark:border-purple-400 dark:bg-purple-950/40 inline-flex items-center gap-0.5"
      >
        <span>{children}</span>
      </span>

      {/* Popover Card */}
      {isOpen && (
        <span
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900 block text-left animate-in fade-in zoom-in-95 duration-150 cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Row */}
          <span className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2 dark:border-slate-800">
            <span className="min-w-0">
              <span className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-sm text-[#1E293B] dark:text-white">
                  {term.term}
                </span>
                <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border border-[#6D28D9]/20 bg-[#6D28D9]/10 text-[#6D28D9] dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800">
                  AI GLOSSARY
                </span>
              </span>

              {/* IPA Phonetic Transcription */}
              {term.ipa && (
                <span className="block mt-0.5 text-xs font-mono text-[#0F52BA] dark:text-blue-400 font-medium tracking-wide">
                  {term.ipa}
                </span>
              )}
            </span>

            {/* Quick Actions: Save to Vocabulary Deck & Copy */}
            <span className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleToggleSave}
                className="p-1 rounded text-slate-400 hover:text-[#6D28D9] dark:hover:text-purple-300 transition"
                title={isSaved ? 'Saved in Medical Vocabulary Deck' : 'Save to Personal Vocabulary Deck'}
              >
                {isSaved ? (
                  <BookmarkCheck className="h-3.5 w-3.5 text-[#6D28D9] fill-[#6D28D9]/20" />
                ) : (
                  <Bookmark className="h-3.5 w-3.5" />
                )}
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                title="Copy term definition"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </span>
          </span>

          {/* Vietnamese Clinical Meaning & Definition */}
          <span className="block mt-2.5 space-y-1">
            <span className="flex items-center gap-1.5 text-xs font-bold text-[#0F52BA] dark:text-blue-400">
              <Sparkles className="h-3.5 w-3.5 text-[#6D28D9]" />
              <span>{term.translatedTerm}</span>
            </span>

            <span className="block text-xs leading-relaxed text-[#1E293B]/80 dark:text-slate-300">
              {term.definition}
            </span>
          </span>

          {/* Speed Selector & Ontology Code */}
          <span className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
            <span className="font-mono">{term.code}</span>

            {/* Playback Speed Pills */}
            <span className="flex items-center gap-1">
              <span className="text-[10px]">Speed:</span>
              <span className="inline-flex rounded bg-slate-100 p-0.5 dark:bg-slate-800">
                {([0.75, 1.0, 1.25] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSpeed(s);
                    }}
                    className={`px-1 py-0.2 rounded font-mono text-[9px] font-bold ${
                      speed === s
                        ? 'bg-white text-[#0F52BA] shadow-2xs dark:bg-slate-700 dark:text-blue-300'
                        : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </span>
            </span>
          </span>

          {/* Action Buttons Row: 🔊 Listen & 🎤 Practice Pronunciation */}
          <span className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handlePlayAudio}
              className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer ${
                isPlayingAudio
                  ? 'bg-[#0F52BA] text-white animate-pulse'
                  : 'bg-[#0F52BA] hover:bg-[#0A3C8A] text-white active:scale-[0.98]'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <Square className="h-3.5 w-3.5 fill-current" />
                  <span>Stop</span>
                  <span className="flex items-center gap-0.5 ml-1">
                    <span className="w-0.5 h-2 bg-white animate-pulse" />
                    <span className="w-0.5 h-3 bg-white animate-pulse [animation-delay:150ms]" />
                    <span className="w-0.5 h-2 bg-white animate-pulse [animation-delay:300ms]" />
                  </span>
                </>
              ) : (
                <>
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>🔊 Listen ({speed}x)</span>
                </>
              )}
            </button>

            {/* Module 4 Core Action: Practice Pronunciation */}
            <button
              type="button"
              onClick={handleOpenPractice}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition shadow-xs active:scale-[0.98] cursor-pointer"
              title="Open Clinical Speech Pronunciation Assessment Lab"
            >
              <Mic className="h-3.5 w-3.5" />
              <span>🎤 Practice</span>
            </button>
          </span>

          {/* Arrow anchor */}
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-slate-200 rotate-45 dark:bg-slate-900 dark:border-slate-800" />
        </span>
      )}
    </span>
  );
};
