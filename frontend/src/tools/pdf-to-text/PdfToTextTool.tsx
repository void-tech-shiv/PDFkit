import React, { useState } from 'react';
import { ToolLayout } from '../../components/ToolLayout.js';
import { FileDropzone } from '../../components/FileDropzone.js';
import { ProgressBar } from '../../components/ProgressBar.js';
import { ApiClient } from '../../lib/api.js';
import { triggerDownload } from '../../lib/utils.js';
import { FileCode, Copy, Check, Download, AlertCircle } from 'lucide-react';

interface PdfToTextToolProps {
  onBack: () => void;
}

export const PdfToTextTool: React.FC<PdfToTextToolProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<{
    text: string;
    pageCount: number;
    wordCount: number;
    characterCount: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleExtract = async (file: File) => {
    setSelectedFile(file);
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const data = await ApiClient.extractPdfText(file);
      setExtractedData(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to extract text from PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (extractedData?.text) {
      navigator.clipboard.writeText(extractedData.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadTxt = () => {
    if (extractedData?.text) {
      const blob = new Blob([extractedData.text], { type: 'text/plain;charset=utf-8' });
      triggerDownload(blob, `${selectedFile?.name.replace(/\.pdf$/i, '') || 'extracted'}-text.txt`);
    }
  };

  return (
    <ToolLayout
      title="PDF to Text"
      subtitle="Extract raw selectable text from your PDF files with character and word analytics, ready to copy or download as TXT."
      icon={<FileCode className="w-7 h-7" />}
      onBack={onBack}
    >
      {isProcessing && (
        <ProgressBar
          statusText="Extracting Document Text..."
          subText="Parsing text streams and standardizing paragraph breaks"
        />
      )}

      {!selectedFile && !isProcessing && (
        <div className="max-w-xl mx-auto">
          <FileDropzone
            accept=".pdf,application/pdf"
            title="Drop PDF here to extract text"
            description="Supports text-based PDF documents up to 100MB"
            selectedFiles={[]}
            onFilesSelected={(files) => {
              if (files.length > 0) handleExtract(files[0]);
            }}
          />
        </div>
      )}

      {extractedData && selectedFile && !isProcessing && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Stats Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                {selectedFile.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {extractedData.pageCount} Pages • {extractedData.wordCount.toLocaleString()} Words • {extractedData.characterCount.toLocaleString()} Characters
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>

              <button
                onClick={handleDownloadTxt}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all hover:scale-105"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download TXT</span>
              </button>

              <button
                onClick={() => {
                  setSelectedFile(null);
                  setExtractedData(null);
                }}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-2"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Text Content Area */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
            <textarea
              readOnly
              value={extractedData.text || 'No selectable text found in this PDF document.'}
              rows={16}
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-mono leading-relaxed text-slate-900 dark:text-white focus:outline-hidden resize-y"
            />
          </div>
        </div>
      )}
    </ToolLayout>
  );
};
