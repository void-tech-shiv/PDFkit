import React, { useState } from 'react';
import { TOOLS_REGISTRY } from '../lib/tools-registry.js';
import { ToolCategory, ToolDefinition } from '../lib/types.js';
import {
  FileText,
  Minimize2,
  Layers,
  Scissors,
  RotateCw,
  Trash2,
  ArrowUpDown,
  Lock,
  Unlock,
  Stamp,
  PenTool,
  Image as ImageIcon,
  Images,
  FileCode,
  Type,
  Search,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  UploadCloud,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Icon resolver map
  const getToolIcon = (iconName: string) => {
    switch (iconName) {
      case 'Minimize2':
        return <Minimize2 className="w-6 h-6 text-indigo-500" />;
      case 'FileText':
        return <FileText className="w-6 h-6 text-blue-500" />;
      case 'Type':
        return <Type className="w-6 h-6 text-cyan-500" />;
      case 'Image':
        return <ImageIcon className="w-6 h-6 text-emerald-500" />;
      case 'Images':
        return <Images className="w-6 h-6 text-teal-500" />;
      case 'FileCode':
        return <FileCode className="w-6 h-6 text-sky-500" />;
      case 'Layers':
        return <Layers className="w-6 h-6 text-amber-500" />;
      case 'Scissors':
        return <Scissors className="w-6 h-6 text-orange-500" />;
      case 'RotateCw':
        return <RotateCw className="w-6 h-6 text-rose-500" />;
      case 'Trash2':
        return <Trash2 className="w-6 h-6 text-red-500" />;
      case 'ArrowUpDown':
        return <ArrowUpDown className="w-6 h-6 text-violet-500" />;
      case 'Lock':
        return <Lock className="w-6 h-6 text-purple-500" />;
      case 'Unlock':
        return <Unlock className="w-6 h-6 text-fuchsia-500" />;
      case 'Stamp':
        return <Stamp className="w-6 h-6 text-pink-500" />;
      case 'PenTool':
        return <PenTool className="w-6 h-6 text-indigo-500" />;
      default:
        return <FileText className="w-6 h-6 text-indigo-500" />;
    }
  };

  const filteredTools = TOOLS_REGISTRY.filter((tool) => {
    const matchesCategory =
      selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const popularTools = TOOLS_REGISTRY.filter((t) => t.popular);

  const handleHeroDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.docx')) {
        onNavigate('/tools/word-to-pdf');
      } else if (file.type.startsWith('image/')) {
        onNavigate('/tools/image-to-pdf');
      } else {
        onNavigate('/tools/compress');
      }
    }
  };

  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* 1. Hero Section */}
      <section className="max-w-4xl mx-auto text-center px-4 space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Multi-Pass PDF Optimization</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Your PDFs.{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Simplified.
            </span>
          </h1>
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-normal">
            Convert • Compress • Manage. The all-in-one privacy-first PDF utility suite with zero permanent cloud storage.
          </p>
        </div>

        {/* Hero Interactive Drag & Drop Area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleHeroDrop}
          onClick={() => onNavigate('/tools/compress')}
          className="relative max-w-2xl mx-auto p-8 sm:p-10 rounded-3xl border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/40 shadow-xl hover:border-indigo-500 transition-all cursor-pointer group"
        >
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Drop your file here to get started
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                PDF, DOCX, JPG, PNG up to 100MB
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition-colors">
                Compress PDF
              </span>
              <span className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition-colors">
                Explore All Tools
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Popular Quick Tools Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Popular Tools
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => onNavigate(tool.path)}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-500 dark:hover:border-indigo-500/80 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    {getToolIcon(tool.iconName)}
                  </div>
                  {tool.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      {tool.badge}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                <span>Use tool</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Comprehensive All Tools Directory */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              All PDF Utilities
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select any tool to begin processing instantly
            </p>
          </div>

          {/* Category Tabs & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Category Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-medium overflow-x-auto">
              {[
                { id: 'all', label: 'All' },
                { id: 'optimize', label: 'Optimize' },
                { id: 'convert', label: 'Convert' },
                { id: 'organize', label: 'Organize' },
                { id: 'security', label: 'Security' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id as ToolCategory)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    selectedCategory === tab.id
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* In-Page Filter Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-48 pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* All Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => onNavigate(tool.path)}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-500 dark:hover:border-indigo-500/80 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {getToolIcon(tool.iconName)}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {tool.tagline}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between text-[11px] font-medium text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 border-t border-slate-100 dark:border-slate-800/60 mt-3">
                <span>{tool.category.toUpperCase()}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Privacy & Trust Guarantee Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-900/50 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Zero Permanent Storage</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Files are processed ephemerally and automatically scrubbed immediately after download.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Real PDF Optimization</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  No fake compression. Real stream deflation, MozJPEG resampling, and target-size iterative passes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">No Registration Required</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  100% free and instant access. No accounts, no subscriptions, no arbitrary watermarks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
