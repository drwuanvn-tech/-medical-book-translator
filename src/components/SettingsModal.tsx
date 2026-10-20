import React, { useState } from 'react';
import {
  Settings,
  X,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Volume2,
  BookOpen,
  Database,
  RefreshCw,
  Sparkles,
  Download,
  Trash2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { UserSettings, AudioPlaybackSpeed } from '../types';
import { useDocuments } from '../context/DocumentContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { userSettings, updateUserSettings, resetToSampleData } = useDocuments();

  const [activeTab, setActiveTab] = useState<'api' | 'audio' | 'medical' | 'data'>('api');
  const [apiKey, setApiKey] = useState(userSettings.customApiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<{
    tested: boolean;
    valid: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleSaveApiKey = () => {
    updateUserSettings({ customApiKey: apiKey.trim() });
  };

  const handleVerifyKey = async () => {
    setIsVerifying(true);
    setVerificationStatus(null);

    try {
      const response = await fetch('/api/verify-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          model: userSettings.selectedModel,
        }),
      });

      const data = await response.json();
      setVerificationStatus({
        tested: true,
        valid: data.valid,
        message: data.message,
        latencyMs: data.latencyMs,
      });

      if (data.valid) {
        updateUserSettings({ customApiKey: apiKey.trim() });
      }
    } catch (err: any) {
      setVerificationStatus({
        tested: true,
        valid: false,
        message: err.message || 'Unable to connect to verification server.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleExportBackup = () => {
    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      userSettings,
      platform: 'MED-TRANSLATE-AI',
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MedTranslate_Settings_Backup_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F52BA] text-white shadow-md shadow-[#0F52BA]/25">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 id="settings-modal-title" className="text-base font-bold text-[#1E293B] dark:text-white flex items-center gap-2">
                <span>Application Settings & Engine Configuration</span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#6D28D9]/10 text-[#6D28D9] border border-[#6D28D9]/20 dark:bg-purple-950 dark:text-purple-300">
                  Module 5
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage custom Gemini BYOK API keys, TTS voice speeds, and medical ontology standards.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 px-6 pt-2 bg-white dark:border-slate-800 dark:bg-slate-900 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('api')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'api'
                ? 'border-[#0F52BA] text-[#0F52BA] dark:border-blue-400 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>Gemini AI (BYOK)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audio')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'audio'
                ? 'border-[#0F52BA] text-[#0F52BA] dark:border-blue-400 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Volume2 className="h-3.5 w-3.5" />
            <span>Audio & Speech</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('medical')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'medical'
                ? 'border-[#0F52BA] text-[#0F52BA] dark:border-blue-400 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Medical Ontologies</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('data')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'data'
                ? 'border-[#0F52BA] text-[#0F52BA] dark:border-blue-400 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>Data & Storage</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: GEMINI AI & BYOK */}
          {activeTab === 'api' && (
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#6D28D9]" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Bring Your Own Key (BYOK)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-purple-100 text-[#6D28D9] dark:bg-purple-950 dark:text-purple-300">
                    AES Client-Side Safe
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Optionally provide your personal Google AI Studio Gemini API Key. If left blank, the app uses the built-in system key or clinical rule fallback.
                </p>

                {/* API Key Input */}
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy... (Paste Google Gemini API Key)"
                    className="w-full pl-3 pr-20 py-2 text-xs font-mono rounded-lg border border-slate-300 bg-white dark:bg-slate-900 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F52BA]/30"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title={showApiKey ? 'Hide Key' : 'Reveal Key'}
                    >
                      {showApiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                    {apiKey && (
                      <button
                        type="button"
                        onClick={() => {
                          setApiKey('');
                          updateUserSettings({ customApiKey: '' });
                          setVerificationStatus(null);
                        }}
                        className="text-[10px] text-rose-500 hover:underline px-1"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isVerifying}
                    onClick={handleVerifyKey}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#0F52BA] hover:bg-[#0A3C8A] active:scale-[0.98] disabled:opacity-60 transition cursor-pointer"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Pinging Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-3.5 w-3.5" />
                        <span>Verify & Test Connection</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveApiKey}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                  >
                    Save Key
                  </button>
                </div>

                {/* Verification result feedback */}
                {verificationStatus && (
                  <div
                    className={`mt-2 p-3 rounded-lg border text-xs flex items-start gap-2 ${
                      verificationStatus.valid
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                        : 'border-rose-200 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
                    }`}
                  >
                    {verificationStatus.valid ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold">
                        {verificationStatus.valid
                          ? `Connection Verified (${verificationStatus.latencyMs}ms ping)`
                          : 'Verification Failed'}
                      </div>
                      <div className="text-[11px] mt-0.5">{verificationStatus.message}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Model Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Target Gemini Model
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => updateUserSettings({ selectedModel: 'gemini-3.8-flash' })}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                      userSettings.selectedModel === 'gemini-3.8-flash'
                        ? 'border-[#0F52BA] bg-[#0F52BA]/5 dark:bg-blue-950/30 dark:border-blue-500 ring-1 ring-[#0F52BA]'
                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Cpu className="h-4 w-4 text-[#0F52BA]" />
                          <span>Gemini 3.8 Flash</span>
                        </span>
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          Recommended
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Ultra-low latency, high clinical throughput, and strict biomedical acronym preservation.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => updateUserSettings({ selectedModel: 'gemini-2.5-pro' })}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                      userSettings.selectedModel === 'gemini-2.5-pro'
                        ? 'border-[#0F52BA] bg-[#0F52BA]/5 dark:bg-blue-950/30 dark:border-blue-500 ring-1 ring-[#0F52BA]'
                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Cpu className="h-4 w-4 text-[#6D28D9]" />
                          <span>Gemini 2.5 Pro</span>
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">Deep Reasoning</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Advanced differential reasoning for complex sub-specialty pathophysiology passages.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Translation Tone */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Translation Tone & Register
                </label>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => updateUserSettings({ translationTone: 'academic_clinical' })}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      userSettings.translationTone === 'academic_clinical'
                        ? 'border-[#0F52BA] bg-[#0F52BA]/5 font-semibold text-[#0F52BA] dark:bg-blue-950/30 dark:border-blue-500 dark:text-blue-300'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold">Academic Clinical (Bác sĩ)</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                      Formal clinical register, standard ICD-11 & MeSH terminology.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateUserSettings({ translationTone: 'patient_friendly' })}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      userSettings.translationTone === 'patient_friendly'
                        ? 'border-[#0F52BA] bg-[#0F52BA]/5 font-semibold text-[#0F52BA] dark:bg-blue-950/30 dark:border-blue-500 dark:text-blue-300'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold">Patient Friendly (Giải thích)</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                      Accessible explanations designed for patient consultation and counseling.
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUDIO & SPEECH LAB */}
          {activeTab === 'audio' && (
            <div className="space-y-5">
              {/* Playback Speed */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Default TTS Playback Speed
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {([0.75, 1.0, 1.25] as const).map((speed) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => updateUserSettings({ ttsDefaultSpeed: speed })}
                      className={`p-3 rounded-xl border text-center font-bold text-xs transition cursor-pointer ${
                        userSettings.ttsDefaultSpeed === speed
                          ? 'border-[#0F52BA] bg-[#0F52BA]/5 text-[#0F52BA] dark:bg-blue-950/30 dark:border-blue-500 dark:text-blue-300 ring-1 ring-[#0F52BA]'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                      }`}
                    >
                      <div className="text-base font-mono">{speed}x</div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        {speed === 0.75 ? 'Slow Articulation' : speed === 1.0 ? 'Normal Clinical' : 'Fast Review'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Accent */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Preferred Medical Voice Accent
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['en-US', 'en-GB', 'bilingual'] as const).map((accent) => (
                    <button
                      key={accent}
                      type="button"
                      onClick={() => updateUserSettings({ ttsVoiceAccent: accent })}
                      className={`p-3 rounded-xl border text-center font-medium text-xs transition cursor-pointer ${
                        userSettings.ttsVoiceAccent === accent
                          ? 'border-[#6D28D9] bg-[#6D28D9]/5 text-[#6D28D9] dark:bg-purple-950/30 dark:border-purple-500 dark:text-purple-300 ring-1 ring-[#6D28D9]'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-bold">
                        {accent === 'en-US' ? 'US English' : accent === 'en-GB' ? 'UK English' : 'Bilingual'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        {accent === 'en-US' ? 'Standard American' : accent === 'en-GB' ? 'British Clinical' : 'Smart Switch'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 dark:border-slate-800 dark:bg-slate-900/60">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Auto-play pronunciation audio on hover
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Play term audio immediately when hovering highlighted glossary popover.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={userSettings.autoPlayOnHover}
                    onChange={(e) => updateUserSettings({ autoPlayOnHover: e.target.checked })}
                    className="h-4 w-4 rounded text-[#0F52BA] focus:ring-[#0F52BA] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Auto-bookmark looked-up terms to Vocabulary Deck
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Add terms automatically to your personal vocabulary notebook when clicked.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={userSettings.autoSaveLookups}
                    onChange={(e) => updateUserSettings({ autoSaveLookups: e.target.checked })}
                    className="h-4 w-4 rounded text-[#0F52BA] focus:ring-[#0F52BA] cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: MEDICAL ONTOLOGIES */}
          {activeTab === 'medical' && (
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Active Medical Thesaurus & Concept Ontology
              </label>

              <div className="space-y-2.5">
                {(
                  [
                    {
                      id: 'SNOMED-CT / MeSH 2026',
                      desc: 'Default for US/EU Board Exams, clinical trials, and pharmacology descriptors.',
                    },
                    {
                      id: 'ICD-11 / UMLS',
                      desc: 'World Health Organization standard diagnostic codes and unified medical language.',
                    },
                    {
                      id: 'WHO MeSH Core',
                      desc: 'Optimized subset for essential medicines, global health, and epidemiology.',
                    },
                  ] as const
                ).map((onto) => (
                  <div
                    key={onto.id}
                    onClick={() => updateUserSettings({ dictionaryStandard: onto.id })}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      userSettings.dictionaryStandard === onto.id
                        ? 'border-[#0F52BA] bg-[#0F52BA]/5 dark:bg-blue-950/30 dark:border-blue-500 ring-1 ring-[#0F52BA]'
                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-[#0F52BA]" />
                        <span>{onto.id}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {onto.desc}
                      </div>
                    </div>
                    {userSettings.dictionaryStandard === onto.id && (
                      <CheckCircle2 className="h-4 w-4 text-[#0F52BA]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DATA & STORAGE */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Configuration Backup & Export
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Save your personalized settings, vocabulary deck, and layout states to a local JSON file.
                </p>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#0F52BA] hover:bg-[#0A3C8A] transition cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Settings JSON Backup</span>
                </button>
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900/40 dark:bg-rose-950/20 space-y-3">
                <span className="text-xs font-bold text-rose-800 dark:text-rose-300 block">
                  Reset Application State
                </span>
                <p className="text-xs text-rose-700/80 dark:text-rose-400">
                  Restore all standard medical textbook presets (Harrison's, Gray's, Robbins, Guyton) and reset all reading progress.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    resetToSampleData();
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Reset All to Default Sample Data</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-white px-6 py-3.5 dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Current Engine: <span className="font-semibold text-slate-700 dark:text-slate-300">{userSettings.selectedModel}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#0F52BA] hover:bg-[#0A3C8A] rounded-lg transition shadow-xs cursor-pointer"
          >
            Done & Close
          </button>
        </div>
      </div>
    </div>
  );
};
