'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCw, Maximize2, Upload, X } from 'lucide-react';
import Image from 'next/image';

export default function Advanced360Viewer() {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);
  const totalFrames = 36; // 360° / 10° = 36 frames

  // Simulate 360° images (in production, load actual images)
  const frames = Array.from({ length: totalFrames }, (_, i) => ({
    id: i,
    angle: (i * 10),
    // In production: `/products/tshirt_${String(i).padStart(2, '0')}.png`
  }));

  // Gyroscope support for mobile
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma !== null) {
        const frame = Math.floor(((event.gamma + 90) / 180) * totalFrames) % totalFrames;
        setCurrentFrame(frame);
      }
    };

    if (window.DeviceOrientationEvent && /Mobi|Android/i.test(navigator.userAgent)) {
      window.addEventListener('deviceorientation', handleOrientation);
      return () => window.removeEventListener('deviceorientation', handleOrientation);
    }
  }, [totalFrames]);

  const handleDrag = (event: any, info: any) => {
    const sensitivity = 0.5;
    const delta = info.offset.x * sensitivity;
    const newFrame = Math.floor((currentFrame + delta / 10) % totalFrames);
    setCurrentFrame(newFrame < 0 ? totalFrames + newFrame : newFrame);
  };


  return (
    <div className="relative">
      {/* Main 360° Viewer */}
      <div
        ref={containerRef}
        className={`relative ${
          isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'aspect-square'
        } bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing`}
      >
        {/* T-shirt Display */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDrag={handleDrag}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            scale: zoom,
          }}
        >
          {/* T-shirt placeholder (replace with actual 360° images) */}
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="w-64 h-80 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center relative">
              <p className="text-white font-bold text-center">
                360° Frame {currentFrame}
                <br />
                <span className="text-sm">{frames[currentFrame]?.angle}°</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Instructions */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium shadow-lg">
          <p className="text-gray-700">
            {isDragging ? '↔ Rotating...' : '👆 Drag to rotate 360°'}
          </p>
        </div>

        {/* Frame indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-semibold shadow-lg">
          {frames[currentFrame]?.angle}° / 360°
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mt-6 justify-center flex-wrap">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setZoom(Math.max(1, zoom - 0.2))}
          className="p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <ZoomOut className="w-5 h-5 text-gray-700" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentFrame((currentFrame + 1) % totalFrames)}
          className="p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <RotateCw className="w-5 h-5 text-gray-700" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setZoom(Math.min(3, zoom + 0.2))}
          className="p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <ZoomIn className="w-5 h-5 text-gray-700" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <Maximize2 className="w-5 h-5 text-gray-700" />
        </motion.button>
      </div>
    </div>
  );
}