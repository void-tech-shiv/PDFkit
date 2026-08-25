import React, { useState } from 'react';
import { ToolLayout } from '../../components/ToolLayout.js';
import { FileDropzone } from '../../components/FileDropzone.js';
import { ResultCard } from '../../components/ResultCard.js';
import { ProgressBar } from '../../components/ProgressBar.js';
import { ApiClient } from '../../lib/api.js';
import { Layers, ArrowUp, ArrowDown, Trash2, AlertCircle } from 'lucide-react';
import { formatBytes } from '../../lib/utils.js';

interface MergePdfToolProps {
  onBack: () => void;
}

export const MergePdfTool: React.FC<MergePdfToolProps> = ({ onBack }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleMerge = async () => {
    if (selectedFiles.length < 2) {
      setErrorMsg('Please upload at least 2 PDF files to merge.');
      return;
    }
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const blob = await ApiClient.mergePdfs(selectedFiles);
      setResultBlob(blob);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to merge PDF files.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMove = (fromIdx: number, toIdx: number) => {
    const updated = [...selectedFiles];
    const item = updated.splice(fromIdx, 1)[0];
    updated.splice(toIdx, 0, item);
    setSelectedFiles(updated);
  };

  const handleRemove = (idx: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== idx));
  };

  return (
    <ToolLayout
      title="Merge PDF"
      subtitle="Combine multiple PDF files into a single unified document in your exact preferred sequence."
      icon={<Layers className="w-7 h-7" />}
      onBack={onBack}
    >
      {resultBlob ? (
        <ResultCard
          downloadFileName={
            selectedFiles[0]
              ? `${selectedFiles[0].name.replace(/\.pdf$/i, '')}-merged.pdf`
              : 'merged-document.pdf'
          }
          onReset={() => {
            setSelectedFiles([]);
            setResultBlob(null);
          }}
          extraInfo={`Successfully merged ${selectedFiles.length} documents.`}
        />
      ) : isProcessing ? (
        <ProgressBar
          statusText="Merging Documents..."
          subText="Copying page streams and reconstructing cross-reference catalogs"
        />
      ) : (
        <div className="max-w-3xl mx-auto space-y-6">
          <FileDropzone
            accept=".pdf,application/pdf"
            multiple={true}
            title="Drop PDF files here to merge"
            description="Select 2 or more PDF documents to sequence and merge"
            selectedFiles={selectedFiles}
            onFilesSelected={setSelectedFiles}
            onRemoveFile={handleRemove}
            onClearAll={() => setSelectedFiles([])}
          />

          {selectedFiles.length > 0 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                  Merge Order ({selectedFiles.length} documents)
                </h4>
                <span className="text-xs text-slate-400">
                  Total Size: {formatBytes(selectedFiles.reduce((acc, f) => acc + f.size, 0))}
                </span>
              </div>

              <div className="space-y-2">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate">
                          {file.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {formatBytes(file.size)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMove(idx, idx - 1)}
                          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                          title="Move Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                      )}
                      {idx < selectedFiles.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMove(idx, idx + 1)}
                          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                          title="Move Down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        className="p-1.5 rounded-lg hover:bg-red-100 text-red-500"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleMerge}
                disabled={selectedFiles.length < 2}
                className={`w-full py-3.5 rounded-xl text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all ${
                  selectedFiles.length >= 2
                    ? 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.01]'
                    : 'bg-indigo-400 cursor-not-allowed opacity-60'
                }`}
              >
                Merge {selectedFiles.length} PDFs
              </button>
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
};
