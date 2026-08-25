import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Moon,
  Sun,
  ShieldCheck,
  ChevronDown,
  Minimize2,
  FileArchive,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, onOpenSearch }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('/')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                PDFKit
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Your PDFs. Simplified.
            </p>
          </div>
        </div>

        {/* Navigation Dropdowns */}
        <nav className="hidden md:flex items-center gap-1">
          {/* Optimize Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown('optimize')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              onClick={() => onNavigate('/tools/compress')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPath.includes('compress')
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Minimize2 className="w-4 h-4 text-indigo-500" />
              <span>Compress</span>
            </button>
          </div>

          {/* Convert Menu */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown('convert')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <FileArchive className="w-4 h-4 text-emerald-500" />
              <span>Convert</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            {activeDropdown === 'convert' && (
              <div className="absolute top-full left-0 w-56 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl animate-fade-in">
                <div
                  onClick={() => onNavigate('/tools/word-to-pdf')}
                  className="px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between"
                >
                  <span>Word → PDF</span>
                  <span className="text-[10px] text-slate-400">DOCX</span>
                </div>
                <div
                  onClick={() => onNavigate('/tools/text-to-pdf')}
                  className="px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between"
                >
                  <span>Text → PDF</span>
                  <span className="text-[10px] text-slate-400">Editor</span>
                </div>
                <div
                  onClick={() => onNavigate('/tools/image-to-pdf')}
                  className="px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between"
                >
                  <span>JPG/PNG → PDF</span>
                  <span className="text-[10px] text-slate-400">Images</span>
                </div>
                <div
                  onClick={() => onNavigate('/tools/pdf-to-image')}
                  className="px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between"
                >
                  <span>PDF → JPG/PNG</span>
                  <span className="text-[10px] text-slate-400">Raster</span>
                </div>
                <div
                  onClick={() => onNavigate('/tools/pdf-to-text')}
                  className="px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between"
                >
                  <span>PDF → Text</span>
                  <span className="text-[10px] text-slate-400">TXT</span>
                </div>
              </div>
            )}
          </div>

          {/* Organize Menu */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown('organize')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Layers className="w-4 h-4 text-blue-500" />
              <span>Organize</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            {activeDropdown === 'organize' && (
              <div className="absolute top-full left-0 w-52 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl animate-fade-in">
                <div
                  onClick={() => onNavigate('/tools/merge')}
                  className="px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Merge PDF
                </div>
                <div
                  onClick={() => onNavigate('/tools/split')}
                  className="px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Split PDF
                </div>
                <div
                  onClick={() => onNavigate('/tools/rotate')}
                  className="px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Rotate PDF
                </div>
                <div
                  onClick={() => onNavigate('/tools/delete-pages')}
                  className="px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Delete Pages
                </div>
                <div
                  onClick={() => onNavigate('/tools/reorder-pages')}
                  className="px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Reorder Pages
                </div>
              </div>
            )}
          </div>

          {/* Security Menu */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown('security')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Lock className="w-4 h-4 text-purple-500" />
              <span>Security</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            {activeDropdown === 'security' && (
              <div className="absolute top-full right-0 w-52 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl animate-fade-in">
                <div
                  onClick={() => onNavigate('/tools/protect')}
                  className="px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Protect PDF
                </div>
                <div
                  onClick={() => onNavigate('/tools/unlock')}
                  className="px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Unlock PDF
                </div>
                <div
                  onClick={() => onNavigate('/tools/watermark')}
                  className="px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Watermark
                </div>
                <div
                  onClick={() => onNavigate('/tools/signature')}
                  className="px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Sign Document
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-xs"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search tools...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-xs">
              ⌘K
            </kbd>
          </button>

          {/* Privacy Guarantee Pill */}
          <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero Retention</span>
          </div>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
