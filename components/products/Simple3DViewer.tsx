'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { RotateCw, Maximize2 } from 'lucide-react';

interface Simple3DViewerProps {
  productId: string;
  frontImage: string;
  backImage: string;
  sideImage: string;
}

type View = 'front' | 'side' | 'back';

export default function Simple3DViewer({ 
  productId, 
  frontImage, 
  backImage, 
  sideImage 
}: Simple3DViewerProps) {
  const [currentView, setCurrentView] = useState<View>('front');
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [rotation, setRotation] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const views: Record<View, string> = {
    front: frontImage,
    side: sideImage,
    back: backImage,
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startX;
    const newRotation = rotation + deltaX * 0.5;
    setRotation(newRotation);
    
    // Determine view based on rotation
    const normalizedRotation = ((newRotation % 360) + 360) % 360;
    
    if (normalizedRotation < 60 || normalizedRotation >= 300) {
      setCurrentView('front');
    } else if (normalizedRotation >= 60 && normalizedRotation < 150) {
      setCurrentView('side');
    } else {
      setCurrentView('back');
    }
    
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
    
    const deltaX = e.touches[0].clientX - startX;
    const newRotation = rotation + deltaX * 0.5;
    setRotation(newRotation);
    
    const normalizedRotation = ((newRotation % 360) + 360) % 360;
    
    if (normalizedRotation < 60 || normalizedRotation >= 300) {
      setCurrentView('front');
    } else if (normalizedRotation >= 60 && normalizedRotation < 150) {
      setCurrentView('side');
    } else {
      setCurrentView('back');
    }
    
    setStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const autoRotate = () => {
    const views: View[] = ['front', 'side', 'back', 'side'];
    let index = 0;
    
    const interval = setInterval(() => {
      setCurrentView(views[index]);
      index++;
      if (index >= views.length) {
        clearInterval(interval);
        setCurrentView('front');
      }
    }, 800);
  };

  const getViewLabel = () => {
    switch (currentView) {
      case 'front': return 'Front View';
      case 'side': return 'Side View';
      case 'back': return 'Back View';
    }
  };

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Image with smooth transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, scale: 0.95, rotateY: -10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.95, rotateY: 10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <Image
              src={views[currentView]}
              alt={`${productId} - ${currentView}`}
              fill
              className="object-contain p-8"
              priority
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        {/* View indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium"
        >
          {getViewLabel()}
        </motion.div>

        {/* Drag instruction */}
        {!isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-gray-700 shadow-lg"
          >
            🖱️ Drag to rotate
          </motion.div>
        )}

        {/* Rotation indicator dots */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          {(['front', 'side', 'back'] as View[]).map((view) => (
            <button
              key={view}
              onClick={() => setCurrentView(view)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentView === view 
                  ? 'bg-purple-600 w-6' 
                  : 'bg-gray-400 hover:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex gap-2">
        <button
          onClick={autoRotate}
          className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 rounded-xl hover:border-purple-500 transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <RotateCw className="w-4 h-4" />
          Auto Rotate
        </button>
        <button
          onClick={() => setCurrentView('front')}
          className="px-4 py-3 bg-white border-2 border-gray-300 rounded-xl hover:border-purple-500 transition-colors font-medium"
        >
          Reset
        </button>
      </div>

      {/* View selector buttons */}
      <div className="grid grid-cols-3 gap-2">
        {(['front', 'side', 'back'] as View[]).map((view) => (
          <button
            key={view}
            onClick={() => setCurrentView(view)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              currentView === view
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white border-2 border-gray-300 hover:border-purple-500'
            }`}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
