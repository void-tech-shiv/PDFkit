import React, { useState } from 'react';
import { ToolLayout } from '../../components/ToolLayout.js';
import { FileDropzone } from '../../components/FileDropzone.js';
import { ResultCard } from '../../components/ResultCard.js';
import { ProgressBar } from '../../components/ProgressBar.js';
import { ApiClient } from '../../lib/api.js';
import { formatBytes } from '../../lib/utils.js';
import { Minimize2, Sparkles, Target, Layers, AlertCircle } from 'lucide-react';

interface CompressToolProps {
  onBack: () => void;
}

export const CompressTool: React.FC<CompressToolProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'preset' | 'target'>('preset');
  const [level, setLevel] = useState<'low' | 'medium' | 'high' | 'extreme'>('medium');
  const [targetSizeMB, setTargetSizeMB] = useState<string>('2.0');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<{
    originalSize: number;
    compressedSize: number;
    reductionPercent: number;
    passes: number;
    blob: Blob;
  } | null>(null);

  const handleCompress = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const targetMB = mode === 'target' ? parseFloat(targetSizeMB) : undefined;
      const res = await ApiClient.compressPdf(selectedFile, level, targetMB);
      setResult({
        originalSize: res.originalSizeBytes,
        compressedSize: res.compressedSizeBytes,
        reductionPercent: res.reductionPercent,
        passes: res.passes,
        blob: res.blob,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Compression failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setErrorMsg(null);
  };

  return (
    <ToolLayout
      title="Compress PDF"
      subtitle="Reduce PDF file size while preserving crisp typography and image clarity using multi-pass stream optimization."
      badge="High Speed"
      icon={<Minimize2 className="w-7 h-7" />}
      onBack={onBack}
    >
      {/* State 1: Success Results Card */}
      {result && selectedFile && (
        <ResultCard
          title="PDF Compression Complete"
          originalSizeBytes={result.originalSize}
          compressedSizeBytes={result.compressedSize}
          reductionPercent={result.reductionPercent}
          passes={result.passes}
          blob={result.blob}
          downloadFileName={`${selectedFile.name.replace(/\.pdf$/i, '')}-compressed.pdf`}
          onReset={handleReset}
          extraInfo={`Optimized from ${formatBytes(result.originalSize)} to ${formatBytes(result.compressedSize)}.`}
        />
      )}

      {/* State 2: Processing Progress */}
      {isProcessing && (
        <ProgressBar
          statusText="Optimizing PDF Streams..."
          subText={
            mode === 'target'
              ? `Executing multi-pass adaptive downsampling towards ${targetSizeMB} MB target`
              : `Applying ${level} compression matrix with Lanczos image resampling`
          }
        />
      )}

      {/* State 3: Upload & Options Config */}
      {!result && !isProcessing && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {!selectedFile ? (
            <FileDropzone
              accept=".pdf,application/pdf"
              title="Drop your PDF here"
              description="Supports PDF documents up to 100MB"
              selectedFiles={[]}
              onFilesSelected={(files) => {
                if (files.length > 0) setSelectedFile(files[0]);
              }}
            />
          ) : (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
              {/* Selected File Summary Card */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate max-w-sm">
                    {selectedFile.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Original Size: {formatBytes(selectedFile.size)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-xs font-medium text-slate-500 hover:text-red-500"
                >
                  Change File
                </button>
              </div>

              {/* Compression Mode Selector Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setMode('preset')}
                  className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    mode === 'preset'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Compression Presets
                </button>
                <button
                  type="button"
                  onClick={() => setMode('target')}
                  className={`py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                    mode === 'target'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Target className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Target Size (MB)</span>
                </button>
              </div>

              {/* Mode A: Preset Selection Cards */}
              {mode === 'preset' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'low', label: 'Low Compression', desc: 'Highest image quality (220 DPI)' },
                    { id: 'medium', label: 'Medium (Recommended)', desc: 'Balanced reduction & quality (150 DPI)' },
                    { id: 'high', label: 'High Compression', desc: 'Strong reduction for email (100 DPI)' },
                    { id: 'extreme', label: 'Extreme Compression', desc: 'Smallest file size (72 DPI)' },
                  ].map((p) => (
                    <label
                      key={p.id}
                      className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
                        level === p.id
                          ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">
                          {p.label}
                        </span>
                        <input
                          type="radio"
                          name="compressionLevel"
                          value={p.id}
                          checked={level === p.id}
                          onChange={() => setLevel(p.id as any)}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {p.desc}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                /* Mode B: Target Size Multi-Pass Configuration */
                <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-semibold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Target Size Compression Engine</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    The backend will execute up to 5 iterative optimization passes, progressively adjusting image DPI and compression tables until your target size is reached.
                  </p>

                  <div className="flex items-center gap-3 pt-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Target File Size:
                    </label>
                    <div className="relative w-32">
                      <input
                        type="number"
                        min="0.1"
                        max="50"
                        step="0.1"
                        value={targetSizeMB}
                        onChange={(e) => setTargetSizeMB(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white pr-10 focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="absolute right-3 top-1.5 text-xs font-medium text-slate-400">
                        MB
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Action CTA */}
              <button
                type="button"
                onClick={handleCompress}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.01]"
              >
                Compress PDF Now
              </button>
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
};
