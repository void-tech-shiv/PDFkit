import React, { useState } from 'react';
import { ToolLayout } from '../../components/ToolLayout.js';
import { FileDropzone } from '../../components/FileDropzone.js';
import { PageThumbnailGrid } from '../../components/PageThumbnailGrid.js';
import { ResultCard } from '../../components/ResultCard.js';
import { ProgressBar } from '../../components/ProgressBar.js';
import { ApiClient } from '../../lib/api.js';
import { Trash2, AlertCircle } from 'lucide-react';

interface DeletePagesToolProps {
  onBack: () => void;
}

export const DeletePagesTool: React.FC<DeletePagesToolProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pagesToDelete, setPagesToDelete] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleDeleteToggle = (pageNum: number) => {
    if (pagesToDelete.includes(pageNum)) {
      setPagesToDelete(pagesToDelete.filter((p) => p !== pageNum));
    } else {
      setPagesToDelete([...pagesToDelete, pageNum]);
    }
  };

  const handleApply = async () => {
    if (!selectedFile || pagesToDelete.length === 0) {
      setErrorMsg('Please click trash icon on at least one page to delete.');
      return;
    }
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const blob = await ApiClient.deletePages(selectedFile, pagesToDelete);
      setResultBlob(blob);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete pages.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Delete Pages"
      subtitle="Remove unwanted pages from your document visually and download a clean rebuilt PDF."
      icon={<Trash2 className="w-7 h-7" />}
      onBack={onBack}
    >
      {resultBlob && selectedFile ? (
        <ResultCard
          title="Pages Removed Successfully"
          blob={resultBlob}
          downloadFileName={`${selectedFile.name.replace(/\.pdf$/i, '')}-pages-deleted.pdf`}
          onReset={() => {
            setSelectedFile(null);
            setPagesToDelete([]);
            setResultBlob(null);
          }}
          extraInfo={`Removed ${pagesToDelete.length} page${pagesToDelete.length > 1 ? 's' : ''} from the document.`}
        />
      ) : isProcessing ? (
        <ProgressBar
          statusText="Removing Pages..."
          subText="Reconstructing document page tree without omitted pages"
        />
      ) : !selectedFile ? (
        <div className="max-w-xl mx-auto">
          <FileDropzone
            accept=".pdf,application/pdf"
            title="Drop PDF here to remove pages"
            description="Supports PDF documents up to 100MB"
            selectedFiles={[]}
            onFilesSelected={(files) => {
              if (files.length > 0) setSelectedFile(files[0]);
            }}
          />
        </div>
      ) : (
        <div className="space-y-6 max-w-5xl mx-auto">
          <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                {selectedFile.name}
              </h4>
              <p className="text-xs text-slate-400">
                {pagesToDelete.length} Page(s) marked for deletion
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium"
              >
                Change PDF
              </button>

              <button
                type="button"
                onClick={handleApply}
                disabled={pagesToDelete.length === 0}
                className={`px-5 py-2.5 rounded-xl text-white font-semibold text-xs flex items-center gap-1.5 shadow-md transition-all ${
                  pagesToDelete.length > 0
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20 hover:scale-105'
                    : 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed text-slate-500'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Marked Pages</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
            <PageThumbnailGrid
              file={selectedFile}
              mode="delete"
              selectedPages={pagesToDelete}
              onDeletePage={handleDeleteToggle}
            />
          </div>
        </div>
      )}
    </ToolLayout>
  );
};
