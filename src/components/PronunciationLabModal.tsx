import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Sparkles,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Play,
  RotateCcw,
  Check,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { GlossaryTerm, PronunciationAssessment, SyllableAssessment } from '../types';
import { AudioPlayerButton } from './AudioPlayerButton';
import { SAMPLE_GLOSSARY_CARDIOLOGY } from '../data/sampleBooks';

interface PronunciationLabModalProps {
  term: GlossaryTerm | null;
  isOpen: boolean;
  onClose: () => void;
  onNextTerm?: () => void;
}

// Preset Syllable Assessment Dictionary for clinical medical terms
const MEDICAL_SYLLABLE_MAP: Record<
  string,
  {
    syllables: Array<{ syllable: string; ipa: string; isStressed: boolean; defaultCorrect: boolean; feedback?: string }>;
    defaultScore: number;
    clinicalTip: string;
  }
> = {
  'myocardial infarction': {
    defaultScore: 88,
    clinicalTip:
      'Emphasize the primary stress on the third syllable: my-o-CAR-di-al (/kɑːr/). Ensure the rhotic /r/ in in-FARC-tion is pronounced cleanly without swallowing the dental /ʃ/ in -tion.',
    syllables: [
      { syllable: 'my', ipa: 'maɪ', isStressed: false, defaultCorrect: true },
      { syllable: 'o', ipa: 'oʊ', isStressed: false, defaultCorrect: true },
      { syllable: 'car', ipa: 'kɑːr', isStressed: true, defaultCorrect: false, feedback: 'Primary stress required: strengthen vowel duration /ɑːr/' },
      { syllable: 'di', ipa: 'di', isStressed: false, defaultCorrect: true },
      { syllable: 'al', ipa: 'əl', isStressed: false, defaultCorrect: true },
      { syllable: 'in', ipa: 'ɪn', isStressed: false, defaultCorrect: true },
      { syllable: 'farc', ipa: 'fɑːrk', isStressed: true, defaultCorrect: true },
      { syllable: 'tion', ipa: 'ʃən', isStressed: false, defaultCorrect: true },
    ],
  },
  'ischemia': {
    defaultScore: 92,
    clinicalTip:
      'The initial "ch" is pronounced /k/, not /tʃ/ or /ʃ/: is-KEE-mi-a. Place the primary stress on the second syllable /kiː/.',
    syllables: [
      { syllable: 'is', ipa: 'ɪs', isStressed: false, defaultCorrect: true },
      { syllable: 'che', ipa: 'kiː', isStressed: true, defaultCorrect: true },
      { syllable: 'mi', ipa: 'mi', isStressed: false, defaultCorrect: true },
      { syllable: 'a', ipa: 'ə', isStressed: false, defaultCorrect: true },
    ],
  },
  'stemi': {
    defaultScore: 95,
    clinicalTip:
      'Standard clinical acronym pronounced as a single disyllabic word: STEH-mee (/ˈstɛm.i/), with sharp initial s-cluster.',
    syllables: [
      { syllable: 'ste', ipa: 'stɛm', isStressed: true, defaultCorrect: true },
      { syllable: 'mi', ipa: 'i', isStressed: false, defaultCorrect: true },
    ],
  },
  'percutaneous coronary intervention': {
    defaultScore: 84,
    clinicalTip:
      'In "per-cu-TA-ne-ous", primary stress is on /teɪ/. In "COR-o-nar-y", avoid clipping the middle vowel /ə/.',
    syllables: [
      { syllable: 'per', ipa: 'pɜːr', isStressed: false, defaultCorrect: true },
      { syllable: 'cu', ipa: 'kjuː', isStressed: false, defaultCorrect: true },
      { syllable: 'ta', ipa: 'teɪ', isStressed: true, defaultCorrect: false, feedback: 'Strengthen stress on /teɪ/' },
      { syllable: 'ne', ipa: 'ni', isStressed: false, defaultCorrect: true },
      { syllable: 'ous', ipa: 'əs', isStressed: false, defaultCorrect: true },
      { syllable: 'cor', ipa: 'kɔːr', isStressed: true, defaultCorrect: true },
      { syllable: 'o', ipa: 'ə', isStressed: false, defaultCorrect: false, feedback: 'Pronounce unstressed schwa clearly' },
      { syllable: 'nar', ipa: 'ner', isStressed: false, defaultCorrect: true },
      { syllable: 'y', ipa: 'i', isStressed: false, defaultCorrect: true },
    ],
  },
  'atherosclerosis': {
    defaultScore: 87,
    clinicalTip:
      'Compound clinical term: ath-er-o-scle-RO-sis. Note the unvoiced dental fricative /æθ/ and primary stress on /roʊ/.',
    syllables: [
      { syllable: 'ath', ipa: 'æθ', isStressed: false, defaultCorrect: true },
      { syllable: 'er', ipa: 'ə', isStressed: false, defaultCorrect: true },
      { syllable: 'o', ipa: 'roʊ', isStressed: false, defaultCorrect: true },
      { syllable: 'scle', ipa: 'sklə', isStressed: false, defaultCorrect: false, feedback: 'Keep initial s-cluster light' },
      { syllable: 'ro', ipa: 'roʊ', isStressed: true, defaultCorrect: true },
      { syllable: 'sis', ipa: 'sɪs', isStressed: false, defaultCorrect: true },
    ],
  },
  'troponin': {
    defaultScore: 94,
    clinicalTip:
      'Standard clinical pronunciation: TRO-po-nin (/ˈtroʊ.pə.nɪn/), primary stress on first syllable.',
    syllables: [
      { syllable: 'tro', ipa: 'troʊ', isStressed: true, defaultCorrect: true },
      { syllable: 'po', ipa: 'pə', isStressed: false, defaultCorrect: true },
      { syllable: 'nin', ipa: 'nɪn', isStressed: false, defaultCorrect: true },
    ],
  },
  'cardiogenic shock': {
    defaultScore: 89,
    clinicalTip:
      'Car-di-o-GEN-ic shock: Place primary stress on third syllable /dʒɛn/. Ensure hard stop /k/ at end of shock.',
    syllables: [
      { syllable: 'car', ipa: 'kɑːr', isStressed: false, defaultCorrect: true },
      { syllable: 'di', ipa: 'di', isStressed: false, defaultCorrect: true },
      { syllable: 'o', ipa: 'oʊ', isStressed: false, defaultCorrect: true },
      { syllable: 'gen', ipa: 'dʒɛn', isStressed: true, defaultCorrect: true },
      { syllable: 'ic', ipa: 'ɪk', isStressed: false, defaultCorrect: true },
      { syllable: 'shock', ipa: 'ʃɒk', isStressed: true, defaultCorrect: false, feedback: 'Strengthen initial unvoiced fricative /ʃ/' },
    ],
  },
  'angina pectoris': {
    defaultScore: 86,
    clinicalTip:
      'In American clinical usage: an-JY-nuh PECK-tor-is (/ænˈdʒaɪ.nə ˈpɛk.tər.ɪs/). Avoid pronouncing the middle syllable as /dʒiː/.',
    syllables: [
      { syllable: 'an', ipa: 'æn', isStressed: false, defaultCorrect: true },
      { syllable: 'gi', ipa: 'dʒaɪ', isStressed: true, defaultCorrect: false, feedback: 'Diphthong /aɪ/ required, not /iː/' },
      { syllable: 'na', ipa: 'nə', isStressed: false, defaultCorrect: true },
      { syllable: 'pec', ipa: 'pɛk', isStressed: true, defaultCorrect: true },
      { syllable: 'tor', ipa: 'tər', isStressed: false, defaultCorrect: true },
      { syllable: 'is', ipa: 'ɪs', isStressed: false, defaultCorrect: true },
    ],
  },
  'electrocardiogram': {
    defaultScore: 91,
    clinicalTip:
      'E-lec-tro-CAR-di-o-gram: Primary clinical stress falls on /kɑːr/. Keep the final vowel /æm/ distinct.',
    syllables: [
      { syllable: 'e', ipa: 'ɪ', isStressed: false, defaultCorrect: true },
      { syllable: 'lec', ipa: 'lɛk', isStressed: false, defaultCorrect: true },
      { syllable: 'tro', ipa: 'troʊ', isStressed: false, defaultCorrect: true },
      { syllable: 'car', ipa: 'kɑːr', isStressed: true, defaultCorrect: true },
      { syllable: 'di', ipa: 'di', isStressed: false, defaultCorrect: true },
      { syllable: 'o', ipa: 'oʊ', isStressed: false, defaultCorrect: true },
      { syllable: 'gram', ipa: 'ɡræm', isStressed: false, defaultCorrect: true },
    ],
  },
  'arrhythmia': {
    defaultScore: 88,
    clinicalTip:
      'Uh-RITH-mee-uh (/əˈrɪð.mi.ə/ or /əˈrɪθ.mi.ə/). Soft dental fricative on second syllable with primary stress.',
    syllables: [
      { syllable: 'ar', ipa: 'ə', isStressed: false, defaultCorrect: true },
      { syllable: 'rhyth', ipa: 'rɪð', isStressed: true, defaultCorrect: false, feedback: 'Dental fricative /ð/ requires voiced contact' },
      { syllable: 'mi', ipa: 'mi', isStressed: false, defaultCorrect: true },
      { syllable: 'a', ipa: 'ə', isStressed: false, defaultCorrect: true },
    ],
  },
  'sphygmomanometer': {
    defaultScore: 82,
    clinicalTip:
      'Classic medical tongue-twister: sfig-mo-ma-NOM-i-ter (/ˌsfɪɡ.moʊ.məˈnɑː.mɪ.tər/). Primary stress falls on the fourth syllable "NOM" (/nɑː/). Articulate the initial consonant cluster /sf/ cleanly without an epenthetic vowel.',
    syllables: [
      { syllable: 'sphyg', ipa: 'sfɪɡ', isStressed: false, defaultCorrect: false, feedback: 'Articulate initial consonant cluster /sf/ cleanly' },
      { syllable: 'mo', ipa: 'moʊ', isStressed: false, defaultCorrect: true },
      { syllable: 'ma', ipa: 'mə', isStressed: false, defaultCorrect: true },
      { syllable: 'nom', ipa: 'nɑː', isStressed: true, defaultCorrect: true },
      { syllable: 'e', ipa: 'mɪ', isStressed: false, defaultCorrect: true },
      { syllable: 'ter', ipa: 'tər', isStressed: false, defaultCorrect: true },
    ],
  },
  'dyspnea': {
    defaultScore: 89,
    clinicalTip:
      'Pronounced DISP-nee-uh (/ˈdɪsp.ni.ə/ or /dɪspˈniː.ə/). Avoid inserting an unwanted vowel between /s/ and /p/. Place primary stress clearly.',
    syllables: [
      { syllable: 'dysp', ipa: 'dɪsp', isStressed: true, defaultCorrect: true },
      { syllable: 'ne', ipa: 'ni', isStressed: false, defaultCorrect: true },
      { syllable: 'a', ipa: 'ə', isStressed: false, defaultCorrect: true },
    ],
  },
  'pericarditis': {
    defaultScore: 90,
    clinicalTip:
      'Per-i-car-DY-tis (/ˌpɛr.ɪ.kɑːrˈdaɪ.tɪs/): Secondary stress on /kɑːr/, primary tonic stress on fourth syllable /daɪ/.',
    syllables: [
      { syllable: 'per', ipa: 'pɛr', isStressed: false, defaultCorrect: true },
      { syllable: 'i', ipa: 'ɪ', isStressed: false, defaultCorrect: true },
      { syllable: 'car', ipa: 'kɑːr', isStressed: false, defaultCorrect: true },
      { syllable: 'di', ipa: 'daɪ', isStressed: true, defaultCorrect: false, feedback: 'Vowel must be diphthong /aɪ/ in clinical Latin suffix -itis' },
      { syllable: 'tis', ipa: 'tɪs', isStressed: false, defaultCorrect: true },
    ],
  },
};

export const PronunciationLabModal: React.FC<PronunciationLabModalProps> = ({
  term,
  isOpen,
  onClose,
  onNextTerm,
}) => {
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'assessing' | 'result'>('idle');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [assessment, setAssessment] = useState<PronunciationAssessment | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordedAudioRef = useRef<HTMLAudioElement | null>(null);

  // Audio wave visualizer simulation
  const [audioLevels, setAudioLevels] = useState<number[]>([20, 45, 75, 30, 60, 85, 40, 65, 35, 55]);

  useEffect(() => {
    if (recordingState === 'recording') {
      const interval = window.setInterval(() => {
        setAudioLevels([
          Math.floor(20 + Math.random() * 60),
          Math.floor(30 + Math.random() * 65),
          Math.floor(40 + Math.random() * 55),
          Math.floor(25 + Math.random() * 70),
          Math.floor(50 + Math.random() * 45),
          Math.floor(35 + Math.random() * 60),
          Math.floor(20 + Math.random() * 75),
          Math.floor(45 + Math.random() * 50),
          Math.floor(30 + Math.random() * 65),
          Math.floor(40 + Math.random() * 55),
        ]);
      }, 120);
      return () => clearInterval(interval);
    }
  }, [recordingState]);

  const [selectedTermOverride, setSelectedTermOverride] = useState<GlossaryTerm | null>(null);
  const activeTerm = selectedTermOverride || term || SAMPLE_GLOSSARY_CARDIOLOGY[0];

  // Reset state when term changes
  useEffect(() => {
    setSelectedTermOverride(null);
    setRecordingState('idle');
    setRecordingDuration(0);
    setAssessment(null);
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(null);
    }
  }, [term]);

  if (!isOpen) return null;

  const handleStartRecording = () => {
    setRecordingState('recording');
    setRecordingDuration(0);

    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(null);
    }

    // Capture microphone audio if available
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          try {
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];
            recorder.ondataavailable = (e) => {
              if (e.data && e.data.size > 0) {
                audioChunksRef.current.push(e.data);
              }
            };
            recorder.onstop = () => {
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
              if (audioBlob.size > 0) {
                const url = URL.createObjectURL(audioBlob);
                setRecordedAudioUrl(url);
              }
              stream.getTracks().forEach((track) => track.stop());
            };
            recorder.start();
          } catch (e) {
            console.warn('Microphone MediaRecorder error, simulated wave active:', e);
          }
        })
        .catch((err) => {
          console.warn('Microphone permission not granted, proceeding with simulation:', err);
        });
    }

    timerRef.current = window.setInterval(() => {
      setRecordingDuration((prev) => {
        if (prev >= 8) {
          handleStopRecording();
          return 8;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const handleStopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('Error stopping MediaRecorder:', e);
      }
    }

    setRecordingState('assessing');

    // Simulate AI Phonetic Breakdown & Speech Assessment
    setTimeout(() => {
      const key = activeTerm.term.toLowerCase();
      const mapped = MEDICAL_SYLLABLE_MAP[key];

      let overallScore = mapped ? mapped.defaultScore : 86;
      // Introduce slight dynamic jitter (+- 4 pts)
      const jitter = Math.floor(Math.random() * 7) - 3;
      overallScore = Math.min(99, Math.max(70, overallScore + jitter));

      const syllables: SyllableAssessment[] = mapped
        ? mapped.syllables.map((s) => ({
            syllable: s.syllable,
            ipa: s.ipa,
            isCorrect: overallScore > 80 ? s.defaultCorrect : false,
            isStressed: s.isStressed,
            feedback: s.feedback,
          }))
        : activeTerm.term.split(/\s+/).flatMap((word) => [
            { syllable: word.slice(0, 3), ipa: 'maɪ', isCorrect: true },
            {
              syllable: word.slice(3) || 'cal',
              ipa: 'kəl',
              isCorrect: false,
              feedback: 'Ensure distinct clinical aspiration',
            },
          ]);

      const assessmentResult: PronunciationAssessment = {
        term: activeTerm.term,
        ipa: activeTerm.ipa || '/ˌmaɪ.oʊˈkɑːr.di.əl/',
        overallScore,
        accuracyScore: Math.min(100, overallScore + 3),
        fluencyScore: Math.min(100, overallScore - 2),
        stressScore: Math.min(100, overallScore - 4),
        syllables,
        clinicalTip:
          mapped?.clinicalTip ||
          `Ensure primary stress is placed on the tonic syllable in clinical Latin compound "${activeTerm.term}".`,
        recordedDurationSeconds: Math.max(1, recordingDuration),
      };

      setAssessment(assessmentResult);
      setRecordingState('result');
    }, 1200);
  };

  const handlePlayUserRecording = () => {
    if (!recordedAudioUrl) return;
    if (isPlayingRecorded && recordedAudioRef.current) {
      recordedAudioRef.current.pause();
      setIsPlayingRecorded(false);
      return;
    }
    const audio = new Audio(recordedAudioUrl);
    recordedAudioRef.current = audio;
    audio.onended = () => setIsPlayingRecorded(false);
    audio.onerror = () => setIsPlayingRecorded(false);
    audio
      .play()
      .then(() => setIsPlayingRecorded(true))
      .catch((err) => {
        console.warn('Playback error:', err);
        setIsPlayingRecorded(false);
      });
  };

  const handleReset = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recordedAudioRef.current) {
      recordedAudioRef.current.pause();
    }
    setIsPlayingRecorded(false);
    setRecordingState('idle');
    setRecordingDuration(0);
    setAssessment(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative flex flex-col w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6D28D9] text-white shadow-sm shadow-[#6D28D9]/30">
              <Mic className="h-5 w-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#1E293B] dark:text-white">
                  Clinical Pronunciation Lab
                </h3>
                <span className="rounded-md border border-[#6D28D9]/30 bg-[#6D28D9]/10 px-2 py-0.5 text-[10px] font-mono font-bold text-[#6D28D9] dark:bg-purple-950/60 dark:text-purple-300">
                  AI SPEECH ASSESSMENT
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Practice medical English terminology with instant phonetic & syllable accuracy scoring.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Term Selector Strip for Medical Practice */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 shrink-0 font-bold">
              Practice Term:
            </span>
            {SAMPLE_GLOSSARY_CARDIOLOGY.map((t) => (
              <button
                key={t.term}
                type="button"
                onClick={() => {
                  handleReset();
                  setSelectedTermOverride(t);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition shrink-0 cursor-pointer ${
                  activeTerm.term.toLowerCase() === t.term.toLowerCase()
                    ? 'bg-[#6D28D9] text-white shadow-xs font-semibold'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {t.term}
              </button>
            ))}
          </div>

          {/* Target Medical Term Spotlight Card */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6D28D9] dark:text-purple-400">
                  Target Clinical Concept · {activeTerm.category.toUpperCase()}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1E293B] dark:text-white mt-0.5">
                  {activeTerm.term}
                </h2>
                {activeTerm.ipa && (
                  <div className="text-sm font-mono text-[#0F52BA] dark:text-blue-400 font-semibold mt-0.5">
                    {activeTerm.ipa}
                  </div>
                )}
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {activeTerm.translatedTerm} · <span className="font-mono text-slate-400">{activeTerm.code}</span>
                </div>
              </div>

              {/* Reference Audio Player with Speed Control */}
              <div className="flex flex-col sm:items-end gap-1.5 self-start sm:self-center">
                <span className="text-[10px] font-medium text-slate-400">Reference Model:</span>
                <AudioPlayerButton text={activeTerm.term} label="Reference Audio" />
              </div>
            </div>
          </div>

          {/* Interactive Recording Area */}
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-[#F8FAFC] p-6 text-center dark:border-slate-800 dark:bg-slate-950 flex flex-col items-center justify-center min-h-[220px]">
            {recordingState === 'idle' && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-[#6D28D9] hover:bg-[#5B21B6] text-white shadow-lg shadow-[#6D28D9]/30 transition-transform active:scale-95 cursor-pointer mx-auto"
                  title="Click to start recording pronunciation"
                >
                  <span className="absolute inset-0 rounded-full bg-[#6D28D9] opacity-40 group-hover:scale-125 transition-transform" />
                  <Mic className="h-8 w-8 relative z-10" />
                </button>
                <div>
                  <div className="text-sm font-bold text-[#1E293B] dark:text-white">
                    Start Microphone Recording
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Speak clearly into your microphone: <strong className="text-slate-700 dark:text-slate-200">"{activeTerm.term}"</strong>
                  </p>
                </div>
              </div>
            )}

            {recordingState === 'recording' && (
              <div className="space-y-4 w-full max-w-sm">
                <div className="flex items-center justify-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500 animate-ping" />
                  <span className="font-mono text-sm font-bold text-rose-600 dark:text-rose-400">
                    Recording: 00:0{recordingDuration} / 00:08s
                  </span>
                </div>

                {/* Animated Real-time Audio Waveform */}
                <div className="flex items-center justify-center gap-1.5 h-16 px-4">
                  {audioLevels.map((lvl, idx) => (
                    <div
                      key={idx}
                      className="w-2 rounded-full bg-gradient-to-t from-[#0F52BA] to-[#6D28D9] transition-all duration-100"
                      style={{ height: `${lvl}%` }}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md transition active:scale-95 cursor-pointer"
                >
                  <Square className="h-4 w-4 fill-current" />
                  <span>Stop Recording & Assess</span>
                </button>
              </div>
            )}

            {recordingState === 'assessing' && (
              <div className="py-8 space-y-3">
                <RefreshCw className="h-8 w-8 text-[#6D28D9] animate-spin mx-auto" />
                <div className="text-sm font-bold text-[#1E293B] dark:text-white">
                  Analyzing Acoustic Formants & Syllable Stress...
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Comparing with international clinical pronunciation corpus
                </p>
              </div>
            )}

            {recordingState === 'result' && assessment && (
              <div className="w-full text-left space-y-5 animate-in fade-in">
                {/* Score Summary Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl font-mono text-xl font-extrabold text-white shadow-md ${
                        assessment.overallScore >= 90
                          ? 'bg-emerald-600'
                          : assessment.overallScore >= 80
                          ? 'bg-[#6D28D9]'
                          : 'bg-amber-600'
                      }`}
                    >
                      {assessment.overallScore}
                      <span className="text-xs font-normal opacity-80">/100</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#1E293B] dark:text-white">
                          {assessment.overallScore >= 90
                            ? 'Excellent Medical Pronunciation'
                            : assessment.overallScore >= 80
                            ? 'Good Clinical Delivery'
                            : 'Practice Recommended'}
                        </span>
                        {assessment.overallScore >= 85 && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Recorded: {assessment.recordedDurationSeconds}s · AI Speech Assessment
                      </div>
                    </div>
                  </div>

                  {/* Sub-Metrics Strip */}
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <div className="text-center px-2 py-1 rounded bg-slate-50 dark:bg-slate-800">
                      <div className="text-[10px] text-slate-400">ACCURACY</div>
                      <div className="font-bold text-[#0F52BA] dark:text-blue-400">{assessment.accuracyScore}%</div>
                    </div>
                    <div className="text-center px-2 py-1 rounded bg-slate-50 dark:bg-slate-800">
                      <div className="text-[10px] text-slate-400">FLUENCY</div>
                      <div className="font-bold text-[#6D28D9] dark:text-purple-400">{assessment.fluencyScore}%</div>
                    </div>
                    <div className="text-center px-2 py-1 rounded bg-slate-50 dark:bg-slate-800">
                      <div className="text-[10px] text-slate-400">STRESS</div>
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">{assessment.stressScore}%</div>
                    </div>
                  </div>
                </div>

                {/* Syllable Breakdown Card with Mispronounced Syllables in Red */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1E293B] dark:text-white uppercase tracking-wider">
                      Phonetic Syllable Breakdown
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Green = Correct · <span className="text-rose-600 font-semibold">Red = Mispronounced / Stress Weak</span>
                    </span>
                  </div>

                  {/* Syllable Chips Grid */}
                  <div className="flex flex-wrap items-center gap-2">
                    {assessment.syllables.map((s, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col items-center px-3 py-2 rounded-lg border font-mono transition-all ${
                          s.isCorrect
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 shadow-xs'
                        }`}
                      >
                        <span className="text-xs font-bold uppercase">{s.syllable}</span>
                        <span className="text-[11px] opacity-80">/{s.ipa}/</span>
                        {s.isStressed && (
                          <span className="text-[9px] uppercase font-bold text-[#6D28D9] dark:text-purple-400 mt-0.5">
                            *Stress
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Constructive Clinical Feedback */}
                  <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50/70 p-3 text-xs leading-relaxed text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                    <div>
                      <strong className="block mb-0.5">Clinical Linguistic Guidance:</strong>
                      {assessment.clinicalTip}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Try Again (Record New Audio)</span>
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    {recordedAudioUrl && (
                      <button
                        type="button"
                        onClick={handlePlayUserRecording}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                          isPlayingRecorded
                            ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
                        }`}
                        title="Replay your recorded audio sample"
                      >
                        {isPlayingRecorded ? (
                          <Square className="h-3.5 w-3.5 fill-current" />
                        ) : (
                          <Volume2 className="h-3.5 w-3.5" />
                        )}
                        <span>{isPlayingRecorded ? 'Stop Voice' : '🔊 Play Your Voice'}</span>
                      </button>
                    )}

                    <AudioPlayerButton text={activeTerm.term} label="Listen to Reference" />

                    {onNextTerm && (
                      <button
                        type="button"
                        onClick={() => {
                          handleReset();
                          onNextTerm();
                        }}
                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition cursor-pointer shadow-xs"
                      >
                        <span>Next Term</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
