import React, { useRef, useState } from 'react';
import { UploadCloud, File, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatBytes } from '../lib/utils.js';

interface FileDropzoneProps {
  accept: string;
  multiple?: boolean;
  maxSizeMB?: number;
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
  onRemoveFile?: (index: number) => void;
  onClearAll?: () => void;
  title?: string;
  description?: string;
  disabled?: boolean;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  accept,
  multiple = false,
  maxSizeMB = 100,
  onFilesSelected,
  selectedFiles,
  onRemoveFile,
  onClearAll,
  title = 'Drop files here or click to browse',
  description = 'Supports files up to 100MB',
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndAddFiles = (files: FileList | File[]) => {
    setErrorMsg(null);
    const validFiles: File[] = [];
    const maxBytes = maxSizeMB * 1024 * 1024;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > maxBytes) {
        setErrorMsg(`File "${file.name}" exceeds maximum allowed size of ${maxSizeMB}MB.`);
        return;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      if (multiple) {
        onFilesSelected([...selectedFiles, ...validFiles]);
      } else {
        onFilesSelected([validFiles[0]]);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Drop Target Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer select-none ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white/60 dark:bg-slate-900/60'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
            <UploadCloud className="w-8 h-8 animate-pulse-subtle" />
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {description}
            </p>
          </div>

          <button
            type="button"
            className="mt-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-md shadow-indigo-500/20 transition-all hover:scale-105"
          >
            Select {multiple ? 'Files' : 'File'}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
            <span>Selected Files ({selectedFiles.length})</span>
            {onClearAll && selectedFiles.length > 1 && (
              <button
                onClick={onClearAll}
                className="text-red-500 hover:underline cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
            {selectedFiles.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <File className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 dark:text-slate-200 truncate text-xs sm:text-sm">
                      {file.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {formatBytes(file.size)}
                    </p>
                  </div>
                </div>

                {onRemoveFile && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(idx);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
