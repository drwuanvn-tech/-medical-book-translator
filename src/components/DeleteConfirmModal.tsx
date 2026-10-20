import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';

export const DeleteConfirmModal: React.FC = () => {
  const { deleteTargetDocument, cancelDelete, executeDelete } = useDocuments();

  if (!deleteTargetDocument) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Delete Medical Document?
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to delete <strong className="text-slate-800 dark:text-slate-200">{deleteTargetDocument.title}</strong>? All extracted layout bounding boxes, tables, and mapped glossaries will be permanently removed.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={cancelDelete}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={executeDelete}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition shadow-sm"
          >
            Delete Document
          </button>
        </div>
      </div>
    </div>
  );
};
