import React, { useState } from 'react';
import { ToolLayout } from '../../components/ToolLayout.js';
import { FileDropzone } from '../../components/FileDropzone.js';
import { ResultCard } from '../../components/ResultCard.js';
import { ProgressBar } from '../../components/ProgressBar.js';
import { ApiClient } from '../../lib/api.js';
import { Stamp, AlertCircle } from 'lucide-react';

interface WatermarkToolProps {
  onBack: () => void;
}

export const WatermarkTool: React.FC<WatermarkToolProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [text, setText] = useState<string>('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState<number>(48);
  const [opacity, setOpacity] = useState<number>(0.3);
  const [rotation, setRotation] = useState<number>(45);
  const [color, setColor] = useState<string>('#64748b');
  const [pages, setPages] = useState<'all' | 'odd' | 'even'>('all');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleApply = async () => {
    if (!selectedFile) return;
    if (!text.trim()) {
      setErrorMsg('Please enter watermark text.');
      return;
    }
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const blob = await ApiClient.watermarkPdf(selectedFile, {
        text,
        fontSize,
        opacity,
        rotation,
        color,
        pages,
      });
      setResultBlob(blob);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to apply watermark.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Watermark PDF"
      subtitle="Add customizable semi-transparent text watermarks with angle and opacity controls across all or selected pages."
      icon={<Stamp className="w-7 h-7" />}
      onBack={onBack}
    >
      {resultBlob && selectedFile ? (
        <ResultCard
          title="Watermark Applied Successfully"
          blob={resultBlob}
          downloadFileName={`${selectedFile.name.replace(/\.pdf$/i, '')}-watermarked.pdf`}
          onReset={() => {
            setSelectedFile(null);
            setResultBlob(null);
          }}
          extraInfo={`Stamped "${text}" across ${pages} pages.`}
        />
      ) : isProcessing ? (
        <ProgressBar
          statusText="Applying Watermark..."
          subText="Embedding vector typography and alpha transparency layers"
        />
      ) : !selectedFile ? (
        <div className="max-w-xl mx-auto">
          <FileDropzone
            accept=".pdf,application/pdf"
            title="Drop PDF here to watermark"
            description="Supports PDF documents up to 100MB"
            selectedFiles={[]}
            onFilesSelected={(files) => {
              if (files.length > 0) setSelectedFile(files[0]);
            }}
          />
        </div>
      ) : (
        <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">
              {selectedFile.name}
            </span>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-xs text-slate-400 hover:text-red-500 font-medium"
            >
              Change
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Watermark Text
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. CONFIDENTIAL, DRAFT, SAMPLE"
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Font Size ({fontSize}pt)
                </label>
                <input
                  type="range"
                  min="16"
                  max="96"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full mt-2 accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Opacity ({Math.round(opacity * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.05"
                  max="1.0"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full mt-2 accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Rotation ({rotation}°)
                </label>
                <input
                  type="range"
                  min="-90"
                  max="90"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full mt-2 accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Pages
                </label>
                <select
                  value={pages}
                  onChange={(e) => setPages(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-white"
                >
                  <option value="all">All Pages</option>
                  <option value="odd">Odd Pages Only</option>
                  <option value="even">Even Pages Only</option>
                </select>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleApply}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.01]"
          >
            Apply Watermark
          </button>
        </div>
      )}
    </ToolLayout>
  );
};
