import React, { useState, useRef, useEffect } from 'react';
import { ToolLayout } from '../../components/ToolLayout.js';
import { FileDropzone } from '../../components/FileDropzone.js';
import { ResultCard } from '../../components/ResultCard.js';
import { ProgressBar } from '../../components/ProgressBar.js';
import { ApiClient } from '../../lib/api.js';
import { PenTool, Upload, Eraser, AlertCircle, Check } from 'lucide-react';

interface SignatureToolProps {
  onBack: () => void;
}

export const SignatureTool: React.FC<SignatureToolProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sigMode, setSigMode] = useState<'draw' | 'upload'>('draw');
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [targetPage, setTargetPage] = useState<number>(1);
  const [posX, setPosX] = useState<number>(100);
  const [posY, setPosY] = useState<number>(100);
  const [sigWidth, setSigWidth] = useState<number>(160);
  const [sigHeight, setSigHeight] = useState<number>(60);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  useEffect(() => {
    if (sigMode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1e1b4b';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [sigMode, selectedFile]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) {
      setSignatureDataUrl(canvasRef.current.toDataURL('image/png'));
    }
  };

  const handleClearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      setSignatureDataUrl(null);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setSignatureDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSign = async () => {
    if (!selectedFile || !signatureDataUrl) {
      setErrorMsg('Please draw or upload your signature.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const blob = await ApiClient.signPdf(selectedFile, signatureDataUrl, [
        {
          page: targetPage,
          x: posX,
          y: posY,
          width: sigWidth,
          height: sigHeight,
        },
      ]);
      setResultBlob(blob);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to apply signature.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Sign PDF"
      subtitle="Draw your digital signature or upload an image and stamp it directly onto any page of your PDF document."
      icon={<PenTool className="w-7 h-7" />}
      onBack={onBack}
    >
      {resultBlob && selectedFile ? (
        <ResultCard
          title="Document Signed Successfully"
          blob={resultBlob}
          downloadFileName={`${selectedFile.name.replace(/\.pdf$/i, '')}-signed.pdf`}
          onReset={() => {
            setSelectedFile(null);
            setSignatureDataUrl(null);
            setResultBlob(null);
          }}
          extraInfo={`Signature stamped on page ${targetPage}.`}
        />
      ) : isProcessing ? (
        <ProgressBar
          statusText="Embedding Signature..."
          subText="Rendering transparent alpha layer and stamping onto document"
        />
      ) : !selectedFile ? (
        <div className="max-w-xl mx-auto">
          <FileDropzone
            accept=".pdf,application/pdf"
            title="Drop PDF here to sign"
            description="Supports PDF documents up to 100MB"
            selectedFiles={[]}
            onFilesSelected={(files) => {
              if (files.length > 0) setSelectedFile(files[0]);
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Signature Creation Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                Create Signature
              </h4>
              <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setSigMode('draw')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    sigMode === 'draw'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Draw
                </button>
                <button
                  type="button"
                  onClick={() => setSigMode('upload')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    sigMode === 'upload'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Upload
                </button>
              </div>
            </div>

            {sigMode === 'draw' ? (
              <div className="space-y-3">
                <div className="border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col items-center">
                  <canvas
                    ref={canvasRef}
                    width={440}
                    height={160}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="cursor-crosshair touch-none w-full max-w-[440px] h-[160px]"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Sign inside the box above
                  </span>
                  <button
                    type="button"
                    onClick={handleClearCanvas}
                    className="text-xs text-red-500 hover:underline flex items-center gap-1"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>Clear Canvas</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleSignatureUpload}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {signatureDataUrl && (
                  <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                    <img
                      src={signatureDataUrl}
                      alt="Signature"
                      className="max-h-24 object-contain"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Placement & Confirmation Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
            <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
              Stamp Placement Configuration
            </h4>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Page Number
                </label>
                <input
                  type="number"
                  min="1"
                  value={targetPage}
                  onChange={(e) => setTargetPage(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Horizontal (X: {posX}pt)
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="450"
                    value={posX}
                    onChange={(e) => setPosX(Number(e.target.value))}
                    className="w-full mt-1 accent-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Vertical (Y: {posY}pt)
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="700"
                    value={posY}
                    onChange={(e) => setPosY(Number(e.target.value))}
                    className="w-full mt-1 accent-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Width ({sigWidth}pt)
                  </label>
                  <input
                    type="range"
                    min="60"
                    max="300"
                    value={sigWidth}
                    onChange={(e) => setSigWidth(Number(e.target.value))}
                    className="w-full mt-1 accent-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Height ({sigHeight}pt)
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="150"
                    value={sigHeight}
                    onChange={(e) => setSigHeight(Number(e.target.value))}
                    className="w-full mt-1 accent-indigo-600"
                  />
                </div>
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
              onClick={handleSign}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.01]"
            >
              Sign & Finalize Document
            </button>
          </div>
        </div>
      )}
    </ToolLayout>
  );
};
