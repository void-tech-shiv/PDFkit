import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProgressBarProps {
  statusText?: string;
  subText?: string;
  progressPercent?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  statusText = 'Processing document...',
  subText = 'Optimizing streams and verifying integrity',
  progressPercent,
}) => {
  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4 animate-fade-in">
      <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>

      <div>
        <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          {statusText}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {subText}
        </p>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
        {progressPercent !== undefined ? (
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        ) : (
          <div className="h-full w-1/3 bg-indigo-600 rounded-full animate-[slide_1.5s_infinite_linear] transform -translate-x-full" />
        )}
      </div>
    </div>
  );
};
