import React from 'react';
import { X, Maximize2 } from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';
import { DualPaneReaderView } from './DualPaneReaderView';

export const DualPaneReaderModal: React.FC = () => {
  const { readerDocument, closeReader } = useDocuments();

  if (!readerDocument) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-2 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full h-[95vh] max-w-7xl overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <DualPaneReaderView
          document={readerDocument}
          onClose={closeReader}
          isModal={true}
        />
      </div>
    </div>
  );
};
