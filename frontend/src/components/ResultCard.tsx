import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Download, RotateCcw, CheckCircle2, TrendingDown, Sparkles } from 'lucide-react';
import { formatBytes, triggerDownload } from '../lib/utils.js';

interface ResultCardProps {
  title?: string;
  originalSizeBytes?: number;
  compressedSizeBytes?: number;
  reductionPercent?: number;
  passes?: number;
  blob?: Blob;
  downloadFileName?: string;
  onReset: () => void;
  extraInfo?: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  title = 'Processing Complete',
  originalSizeBytes,
  compressedSizeBytes,
  reductionPercent,
  passes,
  blob,
  downloadFileName = 'document.pdf',
  onReset,
  extraInfo,
}) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#6366f1', '#10b981', '#3b82f6'],
      });
    } catch {
      // Confetti graceful fallback
    }
  }, []);

  const handleDownload = () => {
    if (blob) {
      triggerDownload(blob, downloadFileName);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6 animate-slide-up">
      {/* Icon Badge */}
      <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/10">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          {title}
        </h3>
        {extraInfo && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{extraInfo}</p>
        )}
      </div>

      {/* Stats Comparison Panel (if compression or resize metrics available) */}
      {originalSizeBytes !== undefined && compressedSizeBytes !== undefined && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-around gap-2 text-center">
          <div>
            <p className="text-xs text-slate-400 font-medium">Original</p>
            <p className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
              {formatBytes(originalSizeBytes)}
            </p>
          </div>

          <div className="text-slate-300 dark:text-slate-600 text-lg">→</div>

          <div>
            <p className="text-xs text-slate-400 font-medium">Optimized</p>
            <p className="text-sm sm:text-base font-semibold text-emerald-600 dark:text-emerald-400">
              {formatBytes(compressedSizeBytes)}
            </p>
          </div>

          {reductionPercent !== undefined && reductionPercent > 0 && (
            <div className="border-l border-slate-200 dark:border-slate-700 pl-4">
              <p className="text-xs text-slate-400 font-medium">Saved</p>
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-sm sm:text-base">
                <TrendingDown className="w-4 h-4" />
                <span>{reductionPercent}%</span>
              </div>
            </div>
          )}
        </div>
      )}

      {passes && passes > 1 && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Target converged across {passes} adaptive passes</span>
        </div>
      )}

      {/* Action CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={handleDownload}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
        >
          <Download className="w-4 h-4" />
          <span>Download File</span>
        </button>

        <button
          onClick={onReset}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Start Over</span>
        </button>
      </div>
    </div>
  );
};
