import React, { useState } from 'react';
import { X, Copy, Check, Download, Code, Layers } from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';

export const LayoutJsonModal: React.FC = () => {
  const { jsonModalDocument, closeJsonModal } = useDocuments();
  const [copied, setCopied] = useState(false);

  if (!jsonModalDocument) return null;

  const jsonPayload = JSON.stringify(
    {
      module: 'MODULE_1_LAYOUT_PARSER',
      version: '2026.1-CLINICAL',
      document: {
        id: jsonModalDocument.id,
        title: jsonModalDocument.title,
        fileName: jsonModalDocument.fileName,
        format: jsonModalDocument.format,
        fileSizeBytes: jsonModalDocument.fileSizeBytes,
        estimatedPages: jsonModalDocument.estimatedPages,
        specialty: jsonModalDocument.specialty,
        sourceLanguage: jsonModalDocument.sourceLanguage,
        targetLanguage: jsonModalDocument.targetLanguage,
        dictionaryStandard: jsonModalDocument.dictionaryStandard,
      },
      extractionMetadata: {
        status: jsonModalDocument.status,
        overallProgress: jsonModalDocument.overallProgress,
        layoutBlocksCount: jsonModalDocument.layoutBlocksCount,
        glossaryTermsMapped: jsonModalDocument.glossaryCount,
        tablesDetected: jsonModalDocument.tablesCount,
        figuresDetected: jsonModalDocument.figuresCount,
        ocrEngineConfidence: 0.994,
      },
      pages: jsonModalDocument.pages || [],
    },
    null,
    2
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonPayload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${jsonModalDocument.fileName.replace(/\.(pdf|epub)$/i, '')}_layout_spec.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="relative flex flex-col w-full max-w-4xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F52BA]/10 text-[#0F52BA] dark:bg-blue-500/20 dark:text-blue-400">
              <Code className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Extracted Layout JSON Schema & Bounding Coordinates
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {jsonModalDocument.fileName} · Page Schema 1 of {jsonModalDocument.estimatedPages}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-[#0F52BA] hover:bg-[#0A3C8A] transition"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Schema</span>
            </button>
            <button
              type="button"
              onClick={closeJsonModal}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Code View */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950 font-mono text-xs text-emerald-400">
          <pre className="whitespace-pre-wrap leading-relaxed">{jsonPayload}</pre>
        </div>
      </div>
    </div>
  );
};
