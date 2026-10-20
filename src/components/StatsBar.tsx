import React from 'react';
import { BookOpen, Layers, BookmarkCheck, ShieldCheck } from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';

export const StatsBar: React.FC = () => {
  const { documents } = useDocuments();

  const totalPages = documents.reduce((acc, doc) => acc + (doc.estimatedPages || 0), 0);
  const totalGlossary = documents.reduce((acc, doc) => acc + (doc.glossaryCount || 0), 0);
  const completedDocs = documents.filter(d => d.status === 'completed').length;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
      <div className="flex items-center gap-3.5 rounded-lg border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#0F52BA]/10 text-[#0F52BA] dark:bg-[#0F52BA]/20">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Medical Books</div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {documents.length}
            <span className="ml-1.5 text-xs font-normal text-slate-500">({completedDocs} parsed)</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3.5 rounded-lg border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#2E8B57]/10 text-[#2E8B57] dark:bg-[#2E8B57]/20">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Pages Extracted</div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {totalPages.toLocaleString()}
            <span className="ml-1 text-xs font-mono text-slate-400">PGS</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3.5 rounded-lg border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
          <BookmarkCheck className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">MeSH / SNOMED Terms</div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {totalGlossary.toLocaleString()}
            <span className="ml-1 text-xs font-mono text-slate-400">TERMS</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3.5 rounded-lg border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Layout OCR Accuracy</div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            99.4 <span className="text-sm font-sans font-normal text-slate-500">%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
