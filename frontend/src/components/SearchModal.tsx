import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Minimize2, FileArchive, Layers, Lock, ArrowRight } from 'lucide-react';
import { ToolDefinition } from '../lib/types.js';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (path: string) => void;
  tools: ToolDefinition[];
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTool,
  tools,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTools = tools.filter(
    (t) =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.description.toLowerCase().includes(query.toLowerCase()) ||
      t.tagline.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search PDF tools (e.g. compress, merge, split, word)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-4 text-sm bg-transparent outline-hidden text-slate-900 dark:text-white placeholder-slate-400"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredTools.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              No matching PDF tools found.
            </div>
          ) : (
            filteredTools.map((tool) => (
              <div
                key={tool.id}
                onClick={() => {
                  onSelectTool(tool.path);
                  onClose();
                }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {tool.name}
                    </h4>
                    <p className="text-xs text-slate-400 truncate max-w-sm">
                      {tool.tagline}
                    </p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
