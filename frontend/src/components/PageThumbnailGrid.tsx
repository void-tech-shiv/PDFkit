import React, { useEffect, useState } from 'react';
import { renderPdfThumbnails, RenderedPageThumbnail } from '../lib/pdf-utils.js';
import { RotateCw, RotateCcw, Trash2, CheckCircle2, Circle, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

interface PageThumbnailGridProps {
  file: File;
  mode?: 'view' | 'select' | 'rotate' | 'delete' | 'reorder';
  selectedPages?: number[]; // 1-indexed
  onTogglePage?: (pageNum: number) => void;
  rotations?: Record<number, number>; // 0-indexed page => angle
  onRotatePage?: (pageIdx: number, angleDelta: number) => void;
  onMovePage?: (fromIdx: number, toIdx: number) => void;
  onDeletePage?: (pageNum: number) => void;
}

export const PageThumbnailGrid: React.FC<PageThumbnailGridProps> = ({
  file,
  mode = 'view',
  selectedPages = [],
  onTogglePage,
  rotations = {},
  onRotatePage,
  onMovePage,
  onDeletePage,
}) => {
  const [thumbnails, setThumbnails] = useState<RenderedPageThumbnail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    renderPdfThumbnails(file, 60, 0.4)
      .then((thumbs) => {
        if (!isCancelled) {
          setThumbnails(thumbs);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError('Failed to render PDF page thumbnails.');
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [file]);

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Generating page previews...
        </p>
      </div>
    );
  }

  if (error || thumbnails.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
        {error || 'No pages found in this document.'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>Total Pages: {thumbnails.length}</span>
        {mode === 'select' && <span>Selected: {selectedPages.length}</span>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {thumbnails.map((thumb, idx) => {
          const pageNum = thumb.pageNumber;
          const isSelected = selectedPages.includes(pageNum);
          const currentRotation = rotations[idx] || 0;

          return (
            <div
              key={pageNum}
              onClick={() => {
                if (mode === 'select' && onTogglePage) onTogglePage(pageNum);
              }}
              className={`group relative rounded-xl border p-2 bg-white dark:bg-slate-900 transition-all ${
                isSelected
                  ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
              } ${mode === 'select' ? 'cursor-pointer' : ''}`}
            >
              {/* Thumbnail Container with live Rotation */}
              <div className="relative aspect-[3/4] bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src={thumb.dataUrl}
                  alt={`Page ${pageNum}`}
                  style={{
                    transform: `rotate(${currentRotation}deg)`,
                    transition: 'transform 0.2s ease',
                  }}
                  className="max-h-full max-w-full object-contain pointer-events-none"
                />

                {/* Selection Checkmark Overlay */}
                {mode === 'select' && (
                  <div className="absolute top-2 left-2 z-10">
                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 bg-white dark:bg-slate-900 rounded-full shadow-xs" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400 bg-white/80 dark:bg-slate-900/80 rounded-full group-hover:text-indigo-500" />
                    )}
                  </div>
                )}
              </div>

              {/* Page Number & Action Row */}
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Page {pageNum}
                </span>

                {/* Mode: Rotate Controls */}
                {mode === 'rotate' && onRotatePage && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRotatePage(idx, 90);
                      }}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                      title="Rotate 90°"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Mode: Delete Control */}
                {mode === 'delete' && onDeletePage && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePage(pageNum);
                    }}
                    className={`p-1 rounded text-xs transition-colors ${
                      isSelected
                        ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 font-medium'
                        : 'text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title={isSelected ? 'Marked for deletion' : 'Delete page'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Mode: Reorder Move Controls */}
                {mode === 'reorder' && onMovePage && (
                  <div className="flex items-center gap-0.5">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMovePage(idx, idx - 1);
                        }}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                        title="Move Left"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                    )}
                    {idx < thumbnails.length - 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMovePage(idx, idx + 1);
                        }}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                        title="Move Right"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
