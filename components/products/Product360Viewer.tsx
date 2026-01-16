'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

export default function Product360Viewer({ color }: { color: string }) {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Gyroscope support for mobile
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma !== null) {
        const newRotation = Math.floor((event.gamma + 90) * 2);
        setRotation(newRotation % 360);
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
      return () => window.removeEventListener('deviceorientation', handleOrientation);
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - startX;
    setRotation((prev) => (prev + delta) % 360);
    setStartX(e.clientX);
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
    const delta = e.touches[0].clientX - startX;
    setRotation((prev) => (prev + delta) % 360);
    setStartX(e.touches[0].clientX);
  };

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setIsDragging(false)}
      >
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `rotate(${rotation}deg) scale(${zoom})`,
          }}
        >
          <div className="w-64 h-64 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center">
            <p className="text-white font-semibold text-center">
              360° T-Shirt View
              <br />
              <span className="text-sm">{color}</span>
            </p>
          </div>
        </motion.div>

        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg text-sm font-medium">
          Drag to rotate
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 mt-4 justify-center">
        <button
          onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
          className="p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={() => setRotation((prev) => (prev + 45) % 360)}
          className="p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <RotateCw className="w-5 h-5" />
        </button>
        <button
          onClick={() => setZoom(Math.min(2, zoom + 0.1))}
          className="p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
