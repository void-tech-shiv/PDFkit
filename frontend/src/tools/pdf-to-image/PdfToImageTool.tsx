import React, { useState } from 'react';
import { ToolLayout } from '../../components/ToolLayout.js';
import { FileDropzone } from '../../components/FileDropzone.js';
import { ProgressBar } from '../../components/ProgressBar.js';
import { renderPdfThumbnails, RenderedPageThumbnail } from '../../lib/pdf-utils.js';
import { triggerDownload } from '../../lib/utils.js';
import JSZip from 'jszip';
import { Images, Download, AlertCircle, FileArchive, CheckCircle2 } from 'lucide-react';

interface PdfToImageToolProps {
  onBack: () => void;
}

export const PdfToImageTool: React.FC<PdfToImageToolProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [format, setFormat] = useState<'jpeg' | 'png'>('png');
  const [quality, setQuality] = useState<number>(0.92);
  const [renderedPages, setRenderedPages] = useState<RenderedPageThumbnail[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRender = async (file: File) => {
    setSelectedFile(file);
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // Render at high resolution (1.5x scale)
      const thumbs = await renderPdfThumbnails(file, 50, 1.5);
      setRenderedPages(thumbs);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to render PDF pages.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSingle = (page: RenderedPageThumbnail) => {
    const baseName = selectedFile?.name.replace(/\.pdf$/i, '') || 'document';
    const a = document.createElement('a');
    a.href = page.dataUrl;
    a.download = `${baseName}-page-${page.pageNumber}.${format === 'jpeg' ? 'jpg' : 'png'}`;
    a.click();
  };

  const handleDownloadAllZip = async () => {
    if (renderedPages.length === 0) return;
    setIsZipping(true);

    try {
      const baseName = selectedFile?.name.replace(/\.pdf$/i, '') || 'document';
      const zip = new JSZip();
      for (const page of renderedPages) {
        const base64Data = page.dataUrl.replace(/^data:image\/\w+;base64,/, '');
        zip.file(
          `${baseName}-page-${page.pageNumber}.${format === 'jpeg' ? 'jpg' : 'png'}`,
          base64Data,
          { base64: true }
        );
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      triggerDownload(zipBlob, `${selectedFile?.name.replace(/\.pdf$/i, '') || 'pages'}-images.zip`);
    } catch (err: any) {
      setErrorMsg('Failed to create ZIP package: ' + err.message);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <ToolLayout
      title="PDF to JPG / PNG"
      subtitle="Render high-resolution raster images from every page of your PDF and download individually or in a ZIP archive."
      icon={<Images className="w-7 h-7" />}
      onBack={onBack}
    >
      {isProcessing && (
        <ProgressBar
          statusText="Rasterizing PDF Pages..."
          subText="Rendering high-DPI vector paths into crisp image canvases"
        />
      )}

      {!selectedFile && !isProcessing && (
        <div className="max-w-xl mx-auto">
          <FileDropzone
            accept=".pdf,application/pdf"
            title="Drop PDF file here"
            description="Supports PDF documents up to 100MB"
            selectedFiles={[]}
            onFilesSelected={(files) => {
              if (files.length > 0) handleRender(files[0]);
            }}
          />
        </div>
      )}

      {selectedFile && !isProcessing && (
        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Header Action Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                {selectedFile.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {renderedPages.length} Pages Extracted
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setRenderedPages([]);
                }}
                className="px-3 py-2 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium"
              >
                Change PDF
              </button>

              <button
                onClick={handleDownloadAllZip}
                disabled={isZipping}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all hover:scale-105"
              >
                <FileArchive className="w-4 h-4" />
                <span>{isZipping ? 'Generating ZIP...' : 'Download All as ZIP'}</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Rendered Pages Gallery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {renderedPages.map((page) => (
              <div
                key={page.pageNumber}
                className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3 flex flex-col justify-between"
              >
                <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center p-2">
                  <img
                    src={page.dataUrl}
                    alt={`Page ${page.pageNumber}`}
                    className="max-h-full max-w-full object-contain rounded shadow-xs"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Page {page.pageNumber}
                  </span>
                  <button
                    onClick={() => handleDownloadSingle(page)}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/60 text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  );
};
