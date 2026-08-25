import React, { useState } from 'react';
import { ToolLayout } from '../../components/ToolLayout.js';
import { FileDropzone } from '../../components/FileDropzone.js';
import { ResultCard } from '../../components/ResultCard.js';
import { ProgressBar } from '../../components/ProgressBar.js';
import { ApiClient } from '../../lib/api.js';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface ProtectPdfToolProps {
  onBack: () => void;
}

export const ProtectPdfTool: React.FC<ProtectPdfToolProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleProtect = async () => {
    if (!selectedFile) return;
    if (!password || password.trim().length === 0) {
      setErrorMsg('Password is required to protect the document.');
      return;
    }
    if (password.length < 3) {
      setErrorMsg('Password must be at least 3 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please retype password.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const blob = await ApiClient.protectPdf(selectedFile, password);
      setResultBlob(blob);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to protect PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Protect PDF"
      subtitle="Encrypt your PDF document with strong password protection to prevent unauthorized opening."
      icon={<Lock className="w-7 h-7" />}
      onBack={onBack}
    >
      {resultBlob && selectedFile ? (
        <ResultCard
          title="PDF Protected Successfully"
          blob={resultBlob}
          downloadFileName={`${selectedFile.name.replace(/\.pdf$/i, '')}-protected.pdf`}
          onReset={() => {
            setSelectedFile(null);
            setPassword('');
            setConfirmPassword('');
            setResultBlob(null);
          }}
          extraInfo="Your document is now secured with password encryption."
        />
      ) : isProcessing ? (
        <ProgressBar
          statusText="Encrypting Document..."
          subText="Generating security dictionary and encrypting object streams"
        />
      ) : !selectedFile ? (
        <div className="max-w-xl mx-auto">
          <FileDropzone
            accept=".pdf,application/pdf"
            title="Drop PDF here to protect"
            description="Supports PDF documents up to 100MB"
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

          {/* Password Inputs */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Set Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter secure password"
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

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
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
            onClick={handleProtect}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.01]"
          >
            Protect PDF
          </button>
        </div>
      )}
    </ToolLayout>
  );
};
