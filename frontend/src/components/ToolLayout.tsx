import React from 'react';
import { ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';

interface ToolLayoutProps {
  title: string;
  subtitle: string;
  badge?: string;
  icon: React.ReactNode;
  onBack: () => void;
  children: React.ReactNode;
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({
  title,
  subtitle,
  badge,
  icon,
  onBack,
  children,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in">
      {/* Top Breadcrumb / Back Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Tools</span>
        </button>

        <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Ephemeral Processing</span>
        </div>
      </div>

      {/* Header Info */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-md shadow-indigo-500/10 mb-1">
          {icon}
        </div>

        <div className="flex items-center justify-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
          {badge && (
            <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {badge}
            </span>
          )}
        </div>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Main Tool Content Container */}
      <main className="w-full">{children}</main>
    </div>
  );
};
