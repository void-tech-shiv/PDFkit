import React, { useState } from 'react';
import { ToolLayout } from '../../components/ToolLayout.js';
import { FileDropzone } from '../../components/FileDropzone.js';
import { PageThumbnailGrid } from '../../components/PageThumbnailGrid.js';
import { ResultCard } from '../../components/ResultCard.js';
import { ProgressBar } from '../../components/ProgressBar.js';
import { ApiClient } from '../../lib/api.js';
import { RotateCw, RotateCcw, AlertCircle } from 'lucide-react';

interface RotatePdfToolProps {
  onBack: () => void;
}

export const RotatePdfTool: React.FC<RotatePdfToolProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rotations, setRotations] = useState<Record<number, number>>({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleRotatePage = (pageIdx: number, angleDelta: number) => {
    setRotations((prev) => ({
      ...prev,
      [pageIdx]: ((prev[pageIdx] || 0) + angleDelta) % 360,
    }));
  };

  const handleRotateAll = (angleDelta: number) => {
    // Apply angle to all or global
    setRotations((prev) => {
      const next: Record<number, number> = {};
      for (let i = 0; i < 100; i++) {
        next[i] = ((prev[i] || 0) + angleDelta) % 360;
      }
      return next;
    });
  };

  const handleApply = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const blob = await ApiClient.rotatePdf(selectedFile, rotations);
      setResultBlob(blob);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to rotate PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Rotate PDF"
      subtitle="Rotate specific pages or your entire document by 90°, 180°, or 270° with instant visual preview."
      icon={<RotateCw className="w-7 h-7" />}
      onBack={onBack}
    >
      {resultBlob && selectedFile ? (
        <ResultCard
          title="PDF Rotated Successfully"
          blob={resultBlob}
          downloadFileName={`${selectedFile.name.replace(/\.pdf$/i, '')}-rotated.pdf`}
          onReset={() => {
            setSelectedFile(null);
            setRotations({});
            setResultBlob(null);
          }}
          extraInfo="All page rotation matrices updated."
        />
      ) : isProcessing ? (
        <ProgressBar
          statusText="Rotating Document..."
          subText="Updating transformation metadata and page orientation flags"
        />
      ) : !selectedFile ? (
        <div className="max-w-xl mx-auto">
          <FileDropzone
            accept=".pdf,application/pdf"
            title="Drop PDF here to rotate"
            description="Supports PDF documents up to 100MB"
            selectedFiles={[]}
            onFilesSelected={(files) => {
              if (files.length > 0) setSelectedFile(files[0]);
            }}
          />
        </div>
      ) : (
        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Controls Bar */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                {selectedFile.name}
              </h4>
              <p className="text-xs text-slate-400">
                Rotate individual pages or use bulk rotation below
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleRotateAll(90)}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate All 90°</span>
              </button>

              <button
                type="button"
                onClick={() => handleRotateAll(180)}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate All 180°</span>
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all hover:scale-105"
              >
                Apply & Save PDF
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Visual Thumbnails */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
            <PageThumbnailGrid
              file={selectedFile}
              mode="rotate"
              rotations={rotations}
              onRotatePage={handleRotatePage}
            />
          </div>
        </div>
      )}
    </ToolLayout>
  );
};
