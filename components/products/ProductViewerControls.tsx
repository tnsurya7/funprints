'use client';

import { motion } from 'framer-motion';
import { RotateCw, ZoomIn, ZoomOut, RotateCcw, Eye } from 'lucide-react';

interface ProductViewerControlsProps {
  onSetAngle: (angle: 'front' | 'side' | 'back' | 'threeQuarter') => void;
  isAutoRotating: boolean;
  onToggleAutoRotate: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  activeAngle?: string;
  isInteracting?: boolean;
}

export default function ProductViewerControls({
  onSetAngle,
  isAutoRotating,
  onToggleAutoRotate,
  onZoomIn,
  onZoomOut,
  onReset,
  activeAngle,
  isInteracting = false
}: ProductViewerControlsProps) {
  return (
    <>
      {/* Top Left: Quick View Angle Presets */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20 flex flex-wrap gap-1 sm:gap-1.5 bg-white/90 backdrop-blur-md p-1 rounded-xl sm:rounded-2xl shadow-md border border-white/70">
        <button
          type="button"
          onClick={() => onSetAngle('front')}
          className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition-all ${
            activeAngle === 'front'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-100/80'
          }`}
          aria-label="View front of T-shirt"
        >
          Front
        </button>
        <button
          type="button"
          onClick={() => onSetAngle('side')}
          className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition-all ${
            activeAngle === 'side'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-100/80'
          }`}
          aria-label="View side of T-shirt"
        >
          Side
        </button>
        <button
          type="button"
          onClick={() => onSetAngle('back')}
          className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition-all ${
            activeAngle === 'back'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-100/80'
          }`}
          aria-label="View back of T-shirt"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => onSetAngle('threeQuarter')}
          className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition-all ${
            activeAngle === 'threeQuarter'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-100/80'
          }`}
          aria-label="View perspective 3/4 angle"
        >
          3D
        </button>
      </div>

      {/* Top Right: 3D Badge Indicator */}
      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20 flex items-center gap-1.5 bg-purple-600/90 text-white text-[10px] sm:text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md">
        <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="hidden sm:inline">Interactive</span> 3D
      </div>

      {/* Bottom Center / Left: Interactive Hint Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isInteracting ? 0 : 1, y: isInteracting ? 10 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 z-10 pointer-events-none hidden md:block bg-black/60 text-white/90 text-[11px] font-medium px-3 py-1.5 rounded-full backdrop-blur-md shadow-sm"
      >
        🖱️ Drag to rotate 360° • 🔍 Scroll to zoom
      </motion.div>

      {/* Bottom Right: Interactive Action Controls */}
      <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 z-20 flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 sm:p-1.5 rounded-xl sm:rounded-2xl shadow-lg border border-white/60">
        <button
          type="button"
          onClick={onToggleAutoRotate}
          title={isAutoRotating ? 'Pause auto-rotation' : 'Start auto-rotation'}
          aria-label="Toggle auto rotation"
          className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all ${
            isAutoRotating
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-gray-700 hover:bg-gray-100 hover:text-purple-600'
          }`}
        >
          <RotateCw className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${isAutoRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
        </button>

        <div className="w-px h-4 sm:h-5 bg-gray-200" />

        <button
          type="button"
          onClick={onZoomIn}
          title="Zoom In"
          aria-label="Zoom in"
          className="p-1.5 sm:p-2 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg sm:rounded-xl transition-all"
        >
          <ZoomIn className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
        </button>

        <button
          type="button"
          onClick={onZoomOut}
          title="Zoom Out"
          aria-label="Zoom out"
          className="p-1.5 sm:p-2 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg sm:rounded-xl transition-all"
        >
          <ZoomOut className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
        </button>

        <div className="w-px h-4 sm:h-5 bg-gray-200" />

        <button
          type="button"
          onClick={onReset}
          title="Reset View"
          aria-label="Reset view position"
          className="p-1.5 sm:p-2 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg sm:rounded-xl transition-all"
        >
          <RotateCcw className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
        </button>
      </div>
    </>
  );
}
