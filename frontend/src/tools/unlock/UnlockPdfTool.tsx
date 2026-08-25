import React, { useState } from 'react';
import { ToolLayout } from '../../components/ToolLayout.js';
import { FileDropzone } from '../../components/FileDropzone.js';
import { ResultCard } from '../../components/ResultCard.js';
import { ProgressBar } from '../../components/ProgressBar.js';
import { ApiClient } from '../../lib/api.js';
import { Unlock, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface UnlockPdfToolProps {
  onBack: () => void;
}

export const UnlockPdfTool: React.FC<UnlockPdfToolProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleUnlock = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const blob = await ApiClient.unlockPdf(selectedFile, password || undefined);
      setResultBlob(blob);
    } catch (err: any) {
      setErrorMsg(err.message || 'Incorrect password or document decryption failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Unlock PDF"
      subtitle="Remove password protection and editing restrictions from authorized encrypted PDF documents."
      icon={<Unlock className="w-7 h-7" />}
      onBack={onBack}
    >
      {resultBlob && selectedFile ? (
        <ResultCard
          title="PDF Decrypted Successfully"
          blob={resultBlob}
          downloadFileName={`${selectedFile.name.replace(/\.pdf$/i, '')}-unlocked.pdf`}
          onReset={() => {
            setSelectedFile(null);
            setPassword('');
            setResultBlob(null);
          }}
          extraInfo="All restrictions and encryption removed."
        />
      ) : isProcessing ? (
        <ProgressBar
          statusText="Decrypting PDF..."
          subText="Verifying encryption key and stripping protection restrictions"
        />
      ) : !selectedFile ? (
        <div className="max-w-xl mx-auto">
          <FileDropzone
            accept=".pdf,application/pdf"
            title="Drop protected PDF here to unlock"
            description="Supports encrypted PDF documents up to 100MB"
            selectedFiles={[]}
            onFilesSelected={(files) => {
              if (files.length > 0) setSelectedFile(files[0]);
            }}
          />
        </div>
      ) : (
        <div className="max-w-md mx-auto p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">
              {selectedFile.name}
            </span>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-xs text-slate-400 hover:text-red-500 font-medium"
            >
              Change
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Enter Document Password
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password to decrypt"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white pr-10 focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleUnlock}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.01]"
          >
            Unlock & Decrypt PDF
          </button>
        </div>
      )}
    </ToolLayout>
  );
};
