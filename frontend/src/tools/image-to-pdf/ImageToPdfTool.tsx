import React, { useState } from 'react';
import { ToolLayout } from '../../components/ToolLayout.js';
import { FileDropzone } from '../../components/FileDropzone.js';
import { ResultCard } from '../../components/ResultCard.js';
import { ProgressBar } from '../../components/ProgressBar.js';
import { ApiClient } from '../../lib/api.js';
import { Image as ImageIcon, AlertCircle, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';

interface ImageToPdfToolProps {
  onBack: () => void;
}

export const ImageToPdfTool: React.FC<ImageToPdfToolProps> = ({ onBack }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [pageSize, setPageSize] = useState<string>('a4');
  const [fitMode, setFitMode] = useState<string>('contain');
  const [margin, setMargin] = useState<number>(20);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleConvert = async () => {
    if (selectedFiles.length === 0) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const blob = await ApiClient.convertImagesToPdf(selectedFiles, {
        pageSize,
        fitMode,
        margin,
      });
      setResultBlob(blob);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to convert images to PDF.');
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
      title="JPG / PNG to PDF"
      subtitle="Convert multiple image files into a single unified PDF document with layout and margin controls."
      icon={<ImageIcon className="w-7 h-7" />}
      onBack={onBack}
    >
      {resultBlob ? (
        <ResultCard
          title="Images Converted to PDF"
          blob={resultBlob}
          downloadFileName="images-combined.pdf"
          onReset={() => {
            setSelectedFiles([]);
            setResultBlob(null);
          }}
          extraInfo={`Successfully merged ${selectedFiles.length} image${selectedFiles.length > 1 ? 's' : ''} into PDF.`}
        />
      ) : isProcessing ? (
        <ProgressBar
          statusText="Packaging Images to PDF..."
          subText="Embedding color profiles and calculating coordinate layout"
        />
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          <FileDropzone
            accept="image/png,image/jpeg,image/webp,image/jpg"
            multiple={true}
            title="Drop JPG, PNG or WebP images here"
            description="Upload multiple images to combine into a multi-page PDF"
            selectedFiles={selectedFiles}
            onFilesSelected={setSelectedFiles}
            onRemoveFile={handleRemove}
            onClearAll={() => setSelectedFiles([])}
          />

          {selectedFiles.length > 0 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
              {/* Image Ordering Strip */}
              <div className="space-y-2">
                <h4 className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                  Page Order ({selectedFiles.length} pages)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {selectedFiles.map((file, idx) => (
                    <div
                      key={`${file.name}-${idx}`}
                      className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center space-y-1.5 group"
                    >
                      <div className="aspect-square bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <p className="text-[11px] font-medium truncate text-slate-700 dark:text-slate-300">
                        {idx + 1}. {file.name}
                      </p>

                      <div className="flex items-center justify-center gap-1">
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => handleMove(idx, idx - 1)}
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                            title="Move Left"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        )}
                        {idx < selectedFiles.length - 1 && (
                          <button
                            type="button"
                            onClick={() => handleMove(idx, idx + 1)}
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                            title="Move Right"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemove(idx)}
                          className="p-1 rounded hover:bg-red-100 text-red-500"
                          title="Remove"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Layout Config */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Page Format
                  </label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-white"
                  >
                    <option value="a4">A4 Page (Standard)</option>
                    <option value="letter">US Letter</option>
                    <option value="fit">Fit to Image Size</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Image Fit Mode
                  </label>
                  <select
                    value={fitMode}
                    onChange={(e) => setFitMode(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-white"
                  >
                    <option value="contain">Contain (Keep Margins)</option>
                    <option value="cover">Cover (Full Page)</option>
                    <option value="stretch">Fill Page</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Margins ({margin}pt)
                  </label>
                  <select
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-white"
                  >
                    <option value="0">No Margin (0pt)</option>
                    <option value="20">Small (20pt)</option>
                    <option value="40">Standard (40pt)</option>
                  </select>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleConvert}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.01]"
              >
                Generate Combined PDF
              </button>
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
};
