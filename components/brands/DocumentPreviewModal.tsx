'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Download, FileText, Layers } from 'lucide-react';
import { BrandItem, BrandFile } from '@/lib/brands-data';
import { BrandLogoRenderer } from './BrandLogos';

interface DocumentPreviewModalProps {
  brand: BrandItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectForEnquiry: (brandName: string) => void;
}

export default function DocumentPreviewModal({
  brand,
  isOpen,
  onClose,
  onSelectForEnquiry,
}: DocumentPreviewModalProps) {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Reset file selection when brand changes
  useEffect(() => {
    if (isOpen) {
      setSelectedFileIndex(0);
      setIsLoading(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, brand]);

  if (!isOpen || !brand) return null;

  const currentFile: BrandFile = brand.files[selectedFileIndex] || brand.files[0];
  const fileApiUrl = `/api/brands-file/${encodeURIComponent(currentFile.filename)}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-5xl h-[92vh] sm:h-[88vh] bg-stone-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/10 flex flex-col overflow-hidden z-10"
        >
          {/* Top Bar */}
          <div className="bg-stone-950/90 border-b border-white/10 px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between gap-2 shrink-0">
            {/* Brand Info */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white flex items-center justify-center p-1 shrink-0 shadow-xs overflow-hidden">
                {brand.imageSrc ? (
                  <img src={brand.imageSrc} alt={brand.name} className="max-h-full max-w-full object-contain" />
                ) : (
                  <BrandLogoRenderer brandId={brand.id} className="w-full h-full text-stone-900 object-contain" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-white text-xs sm:text-sm font-extrabold truncate font-serif">
                  {brand.name}
                </h3>
                <p className="text-stone-400 text-[10px] sm:text-xs truncate max-w-[220px] sm:max-w-md">
                  {currentFile.name}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Open in New Tab */}
              <a
                href={fileApiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Open in new window"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              {/* Direct Download */}
              <a
                href={fileApiUrl}
                download={currentFile.filename}
                className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Download file"
              >
                <Download className="w-4 h-4" />
              </a>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-red-500/80 text-white transition-colors ml-1"
                title="Close preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub-header: Multi-file tab selector if brand has >1 catalogue */}
          {brand.files.length > 1 && (
            <div className="bg-stone-900/90 border-b border-white/5 px-3 sm:px-5 py-1.5 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1 mr-1">
                <Layers className="w-3 h-3 text-amber-400" />
                Documents:
              </span>
              {brand.files.map((file, idx) => {
                const active = idx === selectedFileIndex;
                return (
                  <button
                    key={file.filename}
                    onClick={() => {
                      setSelectedFileIndex(idx);
                      setIsLoading(true);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                      active
                        ? 'bg-amber-400 text-stone-950 shadow-xs'
                        : 'bg-white/5 hover:bg-white/10 text-stone-300'
                    }`}
                  >
                    <FileText className="w-3 h-3" />
                    <span>{file.badge || file.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Main Viewer Area (Always renders PDF preview) */}
          <div className="relative flex-1 bg-stone-950 w-full h-full overflow-hidden flex flex-col">
            <div className="relative flex-1 w-full h-full">
              {isLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-stone-950 text-white space-y-3">
                  <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-medium text-stone-400">Loading {brand.name} Catalogue...</p>
                </div>
              )}
              <iframe
                key={`${brand.id}-${selectedFileIndex}`}
                src={`${fileApiUrl}#toolbar=1&navpanes=1&view=FitH`}
                className="w-full h-full border-0"
                onLoad={() => setIsLoading(false)}
                title={`${brand.name} - ${currentFile.name}`}
              />
            </div>
          </div>

          {/* Bottom Mobile Action Bar */}
          <div className="bg-stone-950 border-t border-white/10 p-2.5 sm:hidden flex items-center justify-between gap-2 shrink-0">
            <a
              href={fileApiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-[#FFC006] text-stone-950 text-xs font-bold rounded-xl"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in New Tab</span>
            </a>
            <a
              href={fileApiUrl}
              download={currentFile.filename}
              className="inline-flex items-center justify-center gap-1 py-2 px-3 bg-white/10 text-white text-xs font-bold rounded-xl"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
