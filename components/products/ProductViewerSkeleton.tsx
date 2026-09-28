'use client';

import { Sparkles } from 'lucide-react';

export default function ProductViewerSkeleton() {
  return (
    <div className="w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden border border-gray-100 shadow-inner">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-pink-500/5 to-blue-500/5 animate-pulse" />
      
      {/* Central loading indicator */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
          {/* Animated concentric rings */}
          <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 border-t-purple-600 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-pink-500/20 border-b-pink-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
        </div>
        
        <p className="text-sm font-semibold text-gray-700">Loading 3D Product View...</p>
        <p className="text-xs text-gray-400 mt-1">Interactive 360° Model</p>
      </div>

      {/* Shimmer bar */}
      <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-shimmer" />
    </div>
  );
}
