import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Trash2,
  RefreshCw,
  Code,
  FileText,
  Book,
  AlertCircle,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List,
  Filter,
  ExternalLink,
  ChevronDown,
  FileDown,
} from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';
import { MedicalDocument, DocumentStatus, DocumentFormat } from '../types';

export const DocumentDashboard: React.FC = () => {
  const {
    documents,
    openReader,
    openJsonModal,
    confirmDelete,
    reprocessDocument,
    openExportPdf,
  } = useDocuments();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | DocumentStatus>('all');
  const [formatFilter, setFormatFilter] = useState<'all' | DocumentFormat>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'pages' | 'size'>('date');
  const [sortAsc, setSortAsc] = useState(false);

  // Filtered and sorted documents
  const filteredDocs = useMemo(() => {
    return documents
      .filter((doc) => {
        const matchesQuery =
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
        const matchesFormat = formatFilter === 'all' || doc.format === formatFilter;
        return matchesQuery && matchesStatus && matchesFormat;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'date') {
          comp = new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        } else if (sortBy === 'title') {
          comp = a.title.localeCompare(b.title);
        } else if (sortBy === 'pages') {
          comp = (b.estimatedPages || 0) - (a.estimatedPages || 0);
        } else if (sortBy === 'size') {
          comp = (b.fileSizeBytes || 0) - (a.fileSizeBytes || 0);
        }
        return sortAsc ? -comp : comp;
      });
  }, [documents, searchQuery, statusFilter, formatFilter, sortBy, sortAsc]);

  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const formatDate = (isoString: string): string => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const renderStatusBadge = (doc: MedicalDocument) => {
    switch (doc.status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Completed</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F52BA] dark:text-blue-400">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Parsing ({doc.overallProgress}%)</span>
          </span>
        );
      case 'failed':
        return (
          <span
            className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400 cursor-help"
            title={doc.errorMessage || 'Parsing failed'}
          >
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Failed</span>
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            <span>Draft</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search medical books, authors, specialties..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-9 pr-4 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#0F52BA] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:focus:bg-slate-800"
          />
        </div>

        {/* Filter segment buttons & view toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            {(['all', 'completed', 'processing', 'failed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Format selector */}
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value as any)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-[#0F52BA] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="all">All Formats</option>
            <option value="PDF">PDF</option>
            <option value="EPUB">ePub</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1 rounded transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="Table view"
              aria-label="Table view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1 rounded transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="Card view"
              aria-label="Card view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Table or Card List */}
      {filteredDocs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <BookOpen className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            No medical documents match your filter
          </h4>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            Try adjusting your search query, clearing filters, or upload a new medical book above.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setFormatFilter('all');
            }}
            className="mt-4 px-3 py-1.5 text-xs font-medium text-[#0F52BA] hover:underline dark:text-blue-400"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/70 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                <tr>
                  <th scope="col" className="px-4 py-3">Medical Book Title & File</th>
                  <th scope="col" className="px-3 py-3">Specialty</th>
                  <th scope="col" className="px-3 py-3">Format</th>
                  <th scope="col" className="px-3 py-3">Size & Pages</th>
                  <th scope="col" className="px-3 py-3">Status</th>
                  <th scope="col" className="px-3 py-3">Extracted Layout</th>
                  <th scope="col" className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/60">
                {filteredDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Title & File */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded ${
                            doc.format === 'PDF'
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                              : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                          }`}
                        >
                          {doc.format === 'PDF' ? <FileText className="h-4 w-4" /> : <Book className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0 max-w-md">
                          <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                            {doc.title}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 truncate">
                            {doc.fileName}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Specialty */}
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span className="capitalize text-slate-700 dark:text-slate-300 font-medium">
                        {doc.specialty.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Format */}
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        {doc.format}
                      </span>
                    </td>

                    {/* Size & Pages */}
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <div className="font-mono text-slate-600 dark:text-slate-300">
                        {formatFileSize(doc.fileSizeBytes)}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {doc.estimatedPages} pages
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      {renderStatusBadge(doc)}
                      {doc.errorMessage && (
                        <div className="text-[10px] text-rose-500 max-w-xs truncate" title={doc.errorMessage}>
                          {doc.errorMessage}
                        </div>
                      )}
                    </td>

                    {/* Layout Extraction Counts */}
                    <td className="px-3 py-3.5 whitespace-nowrap font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {doc.status === 'completed' ? (
                        <div>
                          <span className="text-slate-800 dark:text-slate-200 font-semibold">{doc.layoutBlocksCount}</span> blocks
                          <span className="mx-1">·</span>
                          <span className="text-[#0F52BA] dark:text-blue-400 font-semibold">{doc.glossaryCount}</span> terms
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {doc.status === 'completed' ? (
                          <button
                            type="button"
                            onClick={() => openReader(doc)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold text-white bg-[#0F52BA] hover:bg-[#0A3C8A] active:scale-[0.98] transition cursor-pointer shadow-xs"
                            title="Open interactive dual-pane translation reader"
                          >
                            <BookOpen className="h-3.5 w-3.5" />
                            <span>Open Reader</span>
                          </button>
                        ) : doc.status === 'failed' ? (
                          <button
                            type="button"
                            onClick={() => reprocessDocument(doc)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 transition cursor-pointer"
                            title="Retry parsing pipeline"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span>Retry</span>
                          </button>
                        ) : null}

                        {doc.status === 'completed' && (
                          <>
                            <button
                              type="button"
                              onClick={() => openExportPdf(doc)}
                              className="p-1.5 rounded-md text-[#0F52BA] hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-800 transition"
                              title="Export Translated Document (PDF / Bilingual Dossier)"
                              aria-label="Export Translated Document"
                            >
                              <FileDown className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => openJsonModal(doc)}
                              className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition"
                              title="Inspect layout JSON schema"
                              aria-label="Inspect layout JSON schema"
                            >
                              <Code className="h-4 w-4" />
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => confirmDelete(doc)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                          title="Delete document"
                          aria-label="Delete document"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD VIEW */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded ${
                        doc.format === 'PDF'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      {doc.format}
                    </span>
                    <span className="text-[11px] capitalize text-slate-500 font-medium">
                      {doc.specialty.replace('_', ' ')}
                    </span>
                  </div>
                  {renderStatusBadge(doc)}
                </div>

                <h3 className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-2">
                  {doc.title}
                </h3>
                <p className="mt-0.5 text-[11px] font-mono text-slate-400 truncate">
                  {doc.fileName}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono text-slate-500 border-t border-slate-100 pt-2.5 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block">FILE SIZE</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {formatFileSize(doc.fileSizeBytes)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">PAGE COUNT</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {doc.estimatedPages} pages
                    </span>
                  </div>
                </div>

                {doc.status === 'completed' && (
                  <div className="mt-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    Extracted: <strong className="text-slate-800 dark:text-slate-200">{doc.layoutBlocksCount} blocks</strong> · <strong className="text-[#0F52BA] dark:text-blue-400">{doc.glossaryCount} terms</strong>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  {formatDate(doc.uploadedAt)}
                </div>

                <div className="flex items-center gap-1.5">
                  {doc.status === 'completed' ? (
                    <button
                      type="button"
                      onClick={() => openReader(doc)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-[#0F52BA] hover:bg-[#0A3C8A] active:scale-[0.98] transition cursor-pointer"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Open Reader</span>
                    </button>
                  ) : doc.status === 'failed' ? (
                    <button
                      type="button"
                      onClick={() => reprocessDocument(doc)}
                      className="px-2.5 py-1 rounded text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition"
                    >
                      Retry
                    </button>
                  ) : null}

                  {doc.status === 'completed' && (
                    <>
                      <button
                        type="button"
                        onClick={() => openExportPdf(doc)}
                        className="p-1.5 rounded text-[#0F52BA] hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-800 transition"
                        title="Export Translated Document (PDF)"
                        aria-label="Export Translated Document"
                      >
                        <FileDown className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => openJsonModal(doc)}
                        className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                        title="Inspect layout JSON"
                        aria-label="Inspect layout JSON"
                      >
                        <Code className="h-4 w-4" />
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => confirmDelete(doc)}
                    className="p-1.5 rounded text-slate-400 hover:text-rose-600 transition"
                    title="Delete"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
