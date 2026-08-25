import React, { useState, useEffect } from 'react';
import { ToolLayout } from '../../components/ToolLayout.js';
import { FileDropzone } from '../../components/FileDropzone.js';
import { PageThumbnailGrid } from '../../components/PageThumbnailGrid.js';
import { ResultCard } from '../../components/ResultCard.js';
import { ProgressBar } from '../../components/ProgressBar.js';
import { ApiClient } from '../../lib/api.js';
import { getPdfPageCount } from '../../lib/pdf-utils.js';
import { ArrowUpDown, AlertCircle } from 'lucide-react';

interface ReorderPagesToolProps {
  onBack: () => void;
}

export const ReorderPagesTool: React.FC<ReorderPagesToolProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  useEffect(() => {
    if (selectedFile) {
      getPdfPageCount(selectedFile).then((count) => {
        const order = Array.from({ length: count }, (_, i) => i + 1);
        setPageOrder(order);
      });
    }
  }, [selectedFile]);

  const handleMovePage = (fromIdx: number, toIdx: number) => {
    const next = [...pageOrder];
    const item = next.splice(fromIdx, 1)[0];
    next.splice(toIdx, 0, item);
    setPageOrder(next);
  };

  const handleApply = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const blob = await ApiClient.reorderPages(selectedFile, pageOrder);
      setResultBlob(blob);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reorder pages.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Reorder Pages"
      subtitle="Rearrange the page sequence in your PDF document visually and export a newly ordered PDF."
      icon={<ArrowUpDown className="w-7 h-7" />}
      onBack={onBack}
    >
      {resultBlob && selectedFile ? (
        <ResultCard
          title="PDF Reordered Successfully"
          blob={resultBlob}
          downloadFileName={`${selectedFile.name.replace(/\.pdf$/i, '')}-reordered.pdf`}
          onReset={() => {
            setSelectedFile(null);
            setPageOrder([]);
            setResultBlob(null);
          }}
          extraInfo="Page sequence reorganized as requested."
        />
      ) : isProcessing ? (
        <ProgressBar
          statusText="Reordering Document..."
          subText="Rebuilding catalog page indices"
        />
      ) : !selectedFile ? (
        <div className="max-w-xl mx-auto">
          <FileDropzone
            accept=".pdf,application/pdf"
            title="Drop PDF here to reorder pages"
            description="Supports multi-page PDF documents up to 100MB"
            selectedFiles={[]}
            onFilesSelected={(files) => {
              if (files.length > 0) setSelectedFile(files[0]);
            }}
          />
        </div>
      ) : (
        <div className="space-y-6 max-w-5xl mx-auto">
          <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                {selectedFile.name}
              </h4>
              <p className="text-xs text-slate-400">
                Use the left/right arrows on page tiles to resequence pages
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium"
              >
                Change PDF
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all hover:scale-105"
              >
                Save Reordered PDF
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
            <PageThumbnailGrid
              file={selectedFile}
              mode="reorder"
              onMovePage={handleMovePage}
            />
          </div>
        </div>
      )}
    </ToolLayout>
  );
};
