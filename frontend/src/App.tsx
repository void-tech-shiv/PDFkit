import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { SearchModal } from './components/SearchModal.js';
import { TOOLS_REGISTRY } from './lib/tools-registry.js';

import { HomePage } from './pages/HomePage.js';
import { CompressTool } from './tools/compress/CompressTool.js';
import { WordToPdfTool } from './tools/word-to-pdf/WordToPdfTool.js';
import { TextToPdfTool } from './tools/text-to-pdf/TextToPdfTool.js';
import { ImageToPdfTool } from './tools/image-to-pdf/ImageToPdfTool.js';
import { PdfToImageTool } from './tools/pdf-to-image/PdfToImageTool.js';
import { PdfToTextTool } from './tools/pdf-to-text/PdfToTextTool.js';
import { MergePdfTool } from './tools/merge/MergePdfTool.js';
import { SplitPdfTool } from './tools/split/SplitPdfTool.js';
import { RotatePdfTool } from './tools/rotate/RotatePdfTool.js';
import { DeletePagesTool } from './tools/delete-pages/DeletePagesTool.js';
import { ReorderPagesTool } from './tools/reorder-pages/ReorderPagesTool.js';
import { ProtectPdfTool } from './tools/protect/ProtectPdfTool.js';
import { UnlockPdfTool } from './tools/unlock/UnlockPdfTool.js';
import { WatermarkTool } from './tools/watermark/WatermarkTool.js';
import { SignatureTool } from './tools/signature/SignatureTool.js';

export function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentTool = () => {
    switch (currentPath) {
      case '/tools/compress':
        return <CompressTool onBack={() => navigate('/')} />;
      case '/tools/word-to-pdf':
        return <WordToPdfTool onBack={() => navigate('/')} />;
      case '/tools/text-to-pdf':
        return <TextToPdfTool onBack={() => navigate('/')} />;
      case '/tools/image-to-pdf':
        return <ImageToPdfTool onBack={() => navigate('/')} />;
      case '/tools/pdf-to-image':
        return <PdfToImageTool onBack={() => navigate('/')} />;
      case '/tools/pdf-to-text':
        return <PdfToTextTool onBack={() => navigate('/')} />;
      case '/tools/merge':
        return <MergePdfTool onBack={() => navigate('/')} />;
      case '/tools/split':
        return <SplitPdfTool onBack={() => navigate('/')} />;
      case '/tools/rotate':
        return <RotatePdfTool onBack={() => navigate('/')} />;
      case '/tools/delete-pages':
        return <DeletePagesTool onBack={() => navigate('/')} />;
      case '/tools/reorder-pages':
        return <ReorderPagesTool onBack={() => navigate('/')} />;
      case '/tools/protect':
        return <ProtectPdfTool onBack={() => navigate('/')} />;
      case '/tools/unlock':
        return <UnlockPdfTool onBack={() => navigate('/')} />;
      case '/tools/watermark':
        return <WatermarkTool onBack={() => navigate('/')} />;
      case '/tools/signature':
        return <SignatureTool onBack={() => navigate('/')} />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <main className="flex-1">
        {renderCurrentTool()}
      </main>

      <Footer onNavigate={navigate} />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTool={navigate}
        tools={TOOLS_REGISTRY}
      />
    </div>
  );
}

export default App;
