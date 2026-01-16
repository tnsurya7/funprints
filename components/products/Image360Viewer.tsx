'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCw, Maximize2 } from 'lucide-react';
import Image from 'next/image';

interface Image360ViewerProps {
  productId: string;
  totalFrames?: number;
  fallbackImage?: string;
}

export default function Image360Viewer({ 
  productId, 
  totalFrames = 36,
  fallbackImage = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop'
}: Image360ViewerProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [usesFallback, setUsesFallback] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate frame URLs
  const frames = Array.from({ length: totalFrames }, (_, i) => 
    `/products/${productId}/360/frame_${i}.jpg`
  );

  // Check if 360 frames exist, otherwise use fallback
  useEffect(() => {
    const img = new window.Image();
    img.src = frames[0];
    img.onload = () => {
      setIsLoading(false);
      setUsesFallback(false);
    };
    img.onerror = () => {
      setIsLoading(false);
      setUsesFallback(true);
    };
  }, [frames]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startX;
    const sensitivity = 5;
    
    if (Math.abs(deltaX) > sensitivity) {
      const direction = deltaX > 0 ? 1 : -1;
      setCurrentFrame((prev) => (prev + direction + totalFrames) % totalFrames);
      setStartX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.touches[0].clientX - startX;
    const sensitivity = 5;
    
    if (Math.abs(deltaX) > sensitivity) {
      const direction = deltaX > 0 ? 1 : -1;
      setCurrentFrame((prev) => (prev + direction + totalFrames) % totalFrames);
      setStartX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const autoRotate = () => {
    setCurrentFrame((prev) => (prev + 1) % totalFrames);
  };

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="text-center">
              <RotateCw className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading 360° View...</p>
            </div>
          </div>
        ) : usesFallback ? (
          <div className="relative w-full h-full">
            <Image
              src={fallbackImage}
              alt="Product"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center p-6">
              <p className="text-white text-sm font-medium">
                360° view coming soon
              </p>
            </div>
          </div>
        ) : (
          <img
            src={frames[currentFrame]}
            alt={`360° view - frame ${currentFrame}`}
            draggable={false}
            className="w-full h-full object-cover"
          />
        )}

        {/* Frame indicator */}
        {!isLoading && !usesFallback && (
          <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-medium">
            Frame {currentFrame + 1} / {totalFrames}
          </div>
        )}

        {/* Instructions */}
        {!isLoading && !usesFallback && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium">
            🖱️ Drag to rotate
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={autoRotate}
          className="flex-1 px-4 py-2 bg-white border-2 border-gray-300 rounded-xl hover:border-purple-500 transition-colors flex items-center justify-center gap-2"
        >
          <RotateCw className="w-4 h-4" />
          Auto Rotate
        </button>
        <button
          onClick={() => setCurrentFrame(0)}
          className="px-4 py-2 bg-white border-2 border-gray-300 rounded-xl hover:border-purple-500 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
