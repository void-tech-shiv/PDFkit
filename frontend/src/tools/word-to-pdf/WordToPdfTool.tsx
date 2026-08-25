import React, { useState } from 'react';
import { ToolLayout } from '../../components/ToolLayout.js';
import { FileDropzone } from '../../components/FileDropzone.js';
import { ResultCard } from '../../components/ResultCard.js';
import { ProgressBar } from '../../components/ProgressBar.js';
import { ApiClient } from '../../lib/api.js';
import { FileText, AlertCircle } from 'lucide-react';

interface WordToPdfToolProps {
  onBack: () => void;
}

export const WordToPdfTool: React.FC<WordToPdfToolProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleConvert = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const blob = await ApiClient.convertDocxToPdf(selectedFile);
      setResultBlob(blob);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to convert DOCX file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResultBlob(null);
    setErrorMsg(null);
  };

  return (
    <ToolLayout
      title="Word to PDF"
      subtitle="Convert your Microsoft Word DOCX documents into clean, standard PDF files with formatting preserved."
      icon={<FileText className="w-7 h-7" />}
      onBack={onBack}
    >
      {resultBlob && selectedFile && (
        <ResultCard
          title="Conversion Complete"
          blob={resultBlob}
          downloadFileName={selectedFile.name.replace(/\.docx$/i, '') + '.pdf'}
          onReset={handleReset}
          extraInfo="Your Word document has been converted to PDF."
        />
      )}

      {isProcessing && (
        <ProgressBar
          statusText="Converting DOCX to PDF..."
          subText="Parsing document AST, headings, tables, and embedding styles"
        />
      )}

      {!resultBlob && !isProcessing && (
        <div className="max-w-xl mx-auto space-y-6">
          {!selectedFile ? (
            <FileDropzone
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              title="Drop Word document here"
              description="Supports Microsoft Word (.docx) documents"
              selectedFiles={[]}
              onFilesSelected={(files) => {
                if (files.length > 0) setSelectedFile(files[0]);
              }}
            />
          ) : (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-sm">
                  {selectedFile.name}
                </span>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-xs text-slate-500 hover:text-red-500 font-medium"
                >
                  Change File
                </button>
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
                Convert to PDF
              </button>
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
};
