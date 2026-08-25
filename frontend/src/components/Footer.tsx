import React from 'react';
import { FileText, Shield, Zap, Lock, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <FileText className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white">PDFKit</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Your PDFs. Simplified. High-speed, private, and secure document optimization and conversion right in your browser.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Files automatically cleaned within 15 minutes.</span>
            </div>
          </div>

          {/* Convert Links */}
          <div>
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Convert</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => onNavigate('/tools/word-to-pdf')} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Word to PDF
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/tools/text-to-pdf')} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Text to PDF
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/tools/image-to-pdf')} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Images to PDF
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/tools/pdf-to-image')} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  PDF to JPG/PNG
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/tools/pdf-to-text')} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  PDF to Text
                </button>
              </li>
            </ul>
          </div>

          {/* Organize & Optimize Links */}
          <div>
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Manage & Optimize</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => onNavigate('/tools/compress')} className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-indigo-600 dark:text-indigo-400">
                  Compress PDF
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/tools/merge')} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Merge PDF
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/tools/split')} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Split PDF
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/tools/rotate')} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Rotate PDF
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/tools/delete-pages')} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Delete Pages
                </button>
              </li>
            </ul>
          </div>

          {/* Security & Guarantees */}
          <div>
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Security</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => onNavigate('/tools/protect')} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Protect PDF
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/tools/unlock')} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Unlock PDF
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/tools/watermark')} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Watermark
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/tools/signature')} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Sign Document
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} PDFKit. All rights reserved. Zero Permanent Retention.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <Zap className="w-3.5 h-3.5" /> High Speed Local Engine
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
