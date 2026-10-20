import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Pause, Play, Square } from 'lucide-react';
import { AudioPlaybackSpeed } from '../types';

interface AudioPlayerButtonProps {
  text: string;
  label?: string;
  size?: 'sm' | 'md';
  variant?: 'minimal' | 'full' | 'compact';
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export const AudioPlayerButton: React.FC<AudioPlayerButtonProps> = ({
  text,
  label,
  size = 'md',
  variant = 'full',
  onPlayStateChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<AudioPlaybackSpeed>(1.0);
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Stop playback when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis is not supported in this browser environment.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      onPlayStateChange?.(false);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean text: strip hashtags or markup tags
    const cleanText = text
      .replace(/#[a-zA-Z0-9_]+/g, '')
      .replace(/CLINICAL PEARL:/gi, 'Clinical Pearl.')
      .replace(/Table [0-9-]+:/gi, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = speed;
    utterance.pitch = 1.0;

    // Pick a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
    );
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      onPlayStateChange?.(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      onPlayStateChange?.(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      onPlayStateChange?.(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleSpeedChange = (newSpeed: AudioPlaybackSpeed, e: React.MouseEvent) => {
    e.stopPropagation();
    setSpeed(newSpeed);
    setIsSpeedMenuOpen(false);

    // If currently playing, restart at new rate
    if (isPlaying && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = newSpeed;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center gap-1">
        <button
          type="button"
          onClick={handleTogglePlay}
          className={`inline-flex items-center justify-center rounded-md p-1.5 transition cursor-pointer ${
            isPlaying
              ? 'bg-[#6D28D9] text-white animate-pulse'
              : 'text-[#0F52BA] hover:bg-[#0F52BA]/10 hover:text-[#0A3C8A] dark:text-blue-400 dark:hover:bg-blue-950/40'
          }`}
          title={isPlaying ? 'Pause audio' : 'Listen to audio'}
          aria-label={isPlaying ? 'Pause audio' : 'Listen to audio'}
        >
          {isPlaying ? <Square className="h-3.5 w-3.5 fill-current" /> : <Volume2 className="h-3.5 w-3.5" />}
        </button>

        {isPlaying && (
          <div className="flex items-center gap-0.5 px-1">
            <span className="h-2 w-0.5 animate-[pulse_0.6s_ease-in-out_infinite] rounded-full bg-[#6D28D9]" />
            <span className="h-3 w-0.5 animate-[pulse_0.4s_ease-in-out_infinite_0.1s] rounded-full bg-[#0F52BA]" />
            <span className="h-2.5 w-0.5 animate-[pulse_0.5s_ease-in-out_infinite_0.2s] rounded-full bg-[#6D28D9]" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-1 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Play/Stop Button with Audio Wave */}
      <button
        type="button"
        onClick={handleTogglePlay}
        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition cursor-pointer active:scale-[0.98] ${
          isPlaying
            ? 'bg-[#6D28D9] text-white shadow-xs'
            : 'bg-[#0F52BA] text-white hover:bg-[#0A3C8A]'
        }`}
        title={isPlaying ? 'Stop playback' : 'Listen to clinical English pronunciation'}
      >
        {isPlaying ? (
          <>
            <Square className="h-3.5 w-3.5 fill-current" />
            <span>Stop</span>
          </>
        ) : (
          <>
            <Volume2 className="h-3.5 w-3.5" />
            <span>{label || '🔊 Listen'}</span>
          </>
        )}
      </button>

      {/* Visual Audio Wave Animation while Playing */}
      {isPlaying && (
        <div className="flex items-center gap-0.5 px-1.5" title="Audio playing">
          <span className="h-3 w-1 animate-[pulse_0.5s_ease-in-out_infinite] rounded-full bg-[#6D28D9]" />
          <span className="h-4.5 w-1 animate-[pulse_0.35s_ease-in-out_infinite_0.1s] rounded-full bg-[#0F52BA]" />
          <span className="h-2.5 w-1 animate-[pulse_0.6s_ease-in-out_infinite_0.2s] rounded-full bg-[#6D28D9]" />
          <span className="h-4 w-1 animate-[pulse_0.4s_ease-in-out_infinite_0.15s] rounded-full bg-[#0F52BA]" />
        </div>
      )}

      {/* Speed Controls (0.75x, 1.0x, 1.25x) */}
      <div className="flex items-center rounded-md bg-slate-100 p-0.5 dark:bg-slate-800">
        {([0.75, 1.0, 1.25] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={(e) => handleSpeedChange(s, e)}
            className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold transition cursor-pointer ${
              speed === s
                ? 'bg-white text-[#0F52BA] shadow-2xs dark:bg-slate-700 dark:text-blue-300'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
            title={`Set playback speed to ${s}x`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
};
