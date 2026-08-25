import React, { useState } from 'react';
import { ToolLayout } from '../../components/ToolLayout.js';
import { FileDropzone } from '../../components/FileDropzone.js';
import { PageThumbnailGrid } from '../../components/PageThumbnailGrid.js';
import { ResultCard } from '../../components/ResultCard.js';
import { ProgressBar } from '../../components/ProgressBar.js';
import { ApiClient } from '../../lib/api.js';
import { Scissors, AlertCircle, FileArchive, CheckSquare } from 'lucide-react';

interface SplitPdfToolProps {
  onBack: () => void;
}

export const SplitPdfTool: React.FC<SplitPdfToolProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [rangeInput, setRangeInput] = useState<string>('');
  const [mode, setMode] = useState<'single' | 'zip'>('single');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleTogglePage = (pageNum: number) => {
    let updated: number[];
    if (selectedPages.includes(pageNum)) {
      updated = selectedPages.filter((p) => p !== pageNum);
    } else {
      updated = [...selectedPages, pageNum].sort((a, b) => a - b);
    }
    setSelectedPages(updated);
    setRangeInput(updated.join(', '));
  };

  const handleSplit = async () => {
    if (!selectedFile) return;
    const ranges = rangeInput.trim() || selectedPages.join(',');
    if (!ranges) {
      setErrorMsg('Please select at least one page or enter a page range.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const blob = await ApiClient.splitPdf(selectedFile, ranges, mode);
      setResultBlob(blob);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to split PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Split PDF"
      subtitle="Extract specific pages or page ranges from your document into a separate PDF or individual ZIP archive."
      icon={<Scissors className="w-7 h-7" />}
      onBack={onBack}
    >
      {resultBlob && selectedFile ? (
        <ResultCard
          title="PDF Split Complete"
          blob={resultBlob}
          downloadFileName={
            mode === 'zip'
              ? `${selectedFile.name.replace(/\.pdf$/i, '')}-pages.zip`
              : `${selectedFile.name.replace(/\.pdf$/i, '')}-split.pdf`
          }
          onReset={() => {
            setSelectedFile(null);
            setSelectedPages([]);
            setResultBlob(null);
          }}
          extraInfo={mode === 'zip' ? 'Pages extracted to separate PDFs in ZIP.' : 'Selected pages combined into new PDF.'}
        />
      ) : isProcessing ? (
        <ProgressBar
          statusText="Extracting Selected Pages..."
          subText="Separating content streams and re-encoding page dictionaries"
        />
      ) : !selectedFile ? (
        <div className="max-w-xl mx-auto">
          <FileDropzone
            accept=".pdf,application/pdf"
            title="Drop PDF here to split"
            description="Supports multi-page PDF documents up to 100MB"
            selectedFiles={[]}
            onFilesSelected={(files) => {
              if (files.length > 0) setSelectedFile(files[0]);
            }}
          />
        </div>
      ) : (
        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Options & Action Bar */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                  {selectedFile.name}
                </h4>
                <p className="text-xs text-slate-400">
                  Click page thumbnails below to select/unselect
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setMode('single')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    mode === 'single'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Single PDF
                </button>
                <button
                  type="button"
                  onClick={() => setMode('zip')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                    mode === 'zip'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  <FileArchive className="w-3.5 h-3.5" />
                  <span>Separate (ZIP)</span>
                </button>
              </div>
            </div>

            {/* Range Input Field */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                Page Range:
              </label>
              <input
                type="text"
                placeholder="e.g. 1-3, 5, 8-10"
                value={rangeInput}
                onChange={(e) => setRangeInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleSplit}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.01]"
            >
              Extract & Split Pages
            </button>
          </div>

          {/* Interactive Visual Thumbnail Grid */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
            <PageThumbnailGrid
              file={selectedFile}
              mode="select"
              selectedPages={selectedPages}
              onTogglePage={handleTogglePage}
            />
          </div>
        </div>
      )}
    </ToolLayout>
  );
};
