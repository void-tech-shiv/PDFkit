import React, { useState } from 'react';
import { ToolLayout } from '../../components/ToolLayout.js';
import { ResultCard } from '../../components/ResultCard.js';
import { ProgressBar } from '../../components/ProgressBar.js';
import { ApiClient } from '../../lib/api.js';
import { Type, AlertCircle, Sparkles } from 'lucide-react';

interface TextToPdfToolProps {
  onBack: () => void;
}

export const TextToPdfTool: React.FC<TextToPdfToolProps> = ({ onBack }) => {
  const [text, setText] = useState<string>(
    `PDFKit Document\n\nWelcome to PDFKit Text-to-PDF Generator.\n\nYou can easily type or paste your content here. Customize the typography, margins, and page sizes to generate a polished, publication-ready PDF document instantly.\n\nKey Highlights:\n• Fast server-side layout pagination\n• Clean font embedding\n• Zero permanent data storage`
  );
  const [fontFamily, setFontFamily] = useState<string>('Helvetica');
  const [fontSize, setFontSize] = useState<number>(11);
  const [lineSpacing, setLineSpacing] = useState<number>(1.3);
  const [pageSize, setPageSize] = useState<string>('a4');
  const [margin, setMargin] = useState<number>(50);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleGenerate = async () => {
    if (!text.trim()) {
      setErrorMsg('Please enter some text before generating PDF.');
      return;
    }
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const blob = await ApiClient.convertTextToPdf({
        text,
        fontSize,
        lineSpacing,
        margin,
        pageSize,
        fontFamily,
      });
      setResultBlob(blob);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate PDF from text.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Text to PDF"
      subtitle="Craft documents with rich typography controls and generate clean multi-page PDFs instantly."
      icon={<Type className="w-7 h-7" />}
      onBack={onBack}
    >
      {resultBlob ? (
        <ResultCard
          title="PDF Generated Successfully"
          blob={resultBlob}
          downloadFileName="generated-text.pdf"
          onReset={() => setResultBlob(null)}
          extraInfo="Your formatted text document is ready for download."
        />
      ) : isProcessing ? (
        <ProgressBar
          statusText="Paginating and Rendering PDF..."
          subText="Computing text dimensions and standard font embedding"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Main Text Editor Area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Document Text Content
                </label>
                <span className="text-[11px] text-slate-400">
                  {text.length} characters | {text.trim() ? text.trim().split(/\s+/).length : 0} words
                </span>
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste your text content here..."
                rows={14}
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-sans leading-relaxed text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-hidden resize-y"
              />
            </div>
          </div>

          {/* Typography & Layout Sidebar Controls */}
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                Formatting & Layout
              </h3>

              {/* Font Family */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Font Family
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="Helvetica">Helvetica (Sans-Serif)</option>
                  <option value="TimesRoman">Times Roman (Serif)</option>
                  <option value="Courier">Courier (Monospace)</option>
                </select>
              </div>

              {/* Font Size & Line Spacing */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Font Size ({fontSize}pt)
                  </label>
                  <input
                    type="range"
                    min="9"
                    max="20"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Line Height ({lineSpacing}x)
                  </label>
                  <input
                    type="range"
                    min="1.0"
                    max="2.0"
                    step="0.1"
                    value={lineSpacing}
                    onChange={(e) => setLineSpacing(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Page Size & Margins */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Page Size
                  </label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
                  >
                    <option value="a4">A4 Standard</option>
                    <option value="letter">US Letter</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Margin ({margin}pt)
                  </label>
                  <select
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
                  >
                    <option value="30">Compact (30pt)</option>
                    <option value="50">Standard (50pt)</option>
                    <option value="70">Wide (70pt)</option>
                  </select>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleGenerate}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.01]"
              >
                Generate PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
};
