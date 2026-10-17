'use client';

import { motion } from 'framer-motion';
import { RotateCw, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ProductViewerControlsProps {
  onSetAngle: (angle: 'front' | 'side' | 'back' | 'threeQuarter') => void;
  isAutoRotating: boolean;
  onToggleAutoRotate: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  activeAngle?: string;
  isInteracting?: boolean;
  color?: string;
  colorHex?: string;
}

export default function ProductViewerControls({
  onSetAngle,
  isAutoRotating,
  onToggleAutoRotate,
  onZoomIn,
  onZoomOut,
  onReset,
  activeAngle,
  isInteracting = false,
  color,
  colorHex
}: ProductViewerControlsProps) {
  return (
    <>
      {/* Top Left: Quick View Angle Presets (Yellowish active background) */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20 flex items-center gap-0.5 sm:gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-xl sm:rounded-2xl shadow-md border border-gray-200/80">
        <button
          type="button"
          onClick={() => onSetAngle('front')}
          className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs transition-all ${
            activeAngle === 'front'
              ? 'bg-[#FFC006] text-gray-950 font-bold border border-amber-400/80 shadow-xs'
              : 'text-gray-700 font-semibold hover:bg-gray-100/80 hover:text-gray-950'
          }`}
          aria-label="View front of T-shirt"
        >
          Front
        </button>

        <button
          type="button"
          onClick={() => onSetAngle('side')}
          className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs transition-all ${
            activeAngle === 'side'
              ? 'bg-[#FFC006] text-gray-950 font-bold border border-amber-400/80 shadow-xs'
              : 'text-gray-700 font-semibold hover:bg-gray-100/80 hover:text-gray-950'
          }`}
          aria-label="View side of T-shirt"
        >
          Side
        </button>

        <button
          type="button"
          onClick={() => onSetAngle('back')}
          className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs transition-all ${
            activeAngle === 'back'
              ? 'bg-[#FFC006] text-gray-950 font-bold border border-amber-400/80 shadow-xs'
              : 'text-gray-700 font-semibold hover:bg-gray-100/80 hover:text-gray-950'
          }`}
          aria-label="View back of T-shirt"
        >
          Back
        </button>

        <button
          type="button"
          onClick={() => onSetAngle('threeQuarter')}
          className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs transition-all ${
            activeAngle === 'threeQuarter'
              ? 'bg-[#FFC006] text-gray-950 font-bold border border-amber-400/80 shadow-xs'
              : 'text-gray-700 font-semibold hover:bg-gray-100/80 hover:text-gray-950'
          }`}
          aria-label="View perspective 3/4 angle"
        >
          3D
        </button>
      </div>

      {/* Top Right: 3D Badge Indicator (Yellowish brand background) */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-20 flex items-center gap-1.5 bg-[#FFC006] text-gray-950 text-[10px] sm:text-[11px] font-black tracking-wider uppercase px-2.5 sm:px-3 py-1 rounded-full shadow-xs border border-amber-400/80 backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse" />
        <span className="hidden sm:inline">Interactive</span> 3D
      </div>

      {/* Bottom Left: Color and Color Name Alone */}
      {color && (
        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-20 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 sm:px-3.5 py-1.5 rounded-full border border-gray-200/90 shadow-sm text-xs font-bold text-gray-950 select-none">
          <span
            className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border border-gray-300 shadow-xs flex-shrink-0"
            style={{ backgroundColor: colorHex || '#111827' }}
          />
          <span>{color}</span>
        </div>
      )}

      {/* Bottom Right: Interactive Action Controls */}
      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 z-20 flex items-center gap-0.5 sm:gap-1 bg-white/95 backdrop-blur-md p-1 sm:p-1.5 rounded-lg sm:rounded-2xl shadow-lg border border-gray-200/80">
        <button
          type="button"
          onClick={onToggleAutoRotate}
          title={isAutoRotating ? 'Pause auto-rotation' : 'Start auto-rotation'}
          aria-label="Toggle auto rotation"
          className={`p-1.5 sm:p-2 rounded-md sm:rounded-xl transition-all ${
            isAutoRotating
              ? 'bg-[#FFC006] text-gray-950 border border-amber-400/80 shadow-xs font-bold'
              : 'text-gray-700 hover:bg-gray-100 hover:text-amber-800'
          }`}
        >
          <RotateCw className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${isAutoRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
        </button>

        <div className="w-px h-3.5 sm:h-5 bg-gray-200" />

        <button
          type="button"
          onClick={onZoomIn}
          title="Zoom In"
          aria-label="Zoom in"
          className="p-1.5 sm:p-2 text-gray-700 hover:bg-gray-100 hover:text-amber-800 rounded-md sm:rounded-xl transition-all"
        >
          <ZoomIn className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
        </button>

        <button
          type="button"
          onClick={onZoomOut}
          title="Zoom Out"
          aria-label="Zoom out"
          className="p-1.5 sm:p-2 text-gray-700 hover:bg-gray-100 hover:text-amber-800 rounded-md sm:rounded-xl transition-all"
        >
          <ZoomOut className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
        </button>

        <div className="w-px h-3.5 sm:h-5 bg-gray-200" />

        <button
          type="button"
          onClick={onReset}
          title="Reset View"
          aria-label="Reset view position"
          className="p-1.5 sm:p-2 text-gray-700 hover:bg-gray-100 hover:text-amber-800 rounded-md sm:rounded-xl transition-all"
        >
          <RotateCcw className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
        </button>
      </div>
    </>
  );
}
