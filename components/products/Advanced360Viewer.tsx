'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCw, Maximize2, Upload, X } from 'lucide-react';
import Image from 'next/image';

interface LogoCustomization {
  file: File | null;
  preview: string;
  position: { x: number; y: number };
  size: number;
  rotation: number;
  placement: 'chest' | 'back' | 'sleeve';
}

export default function Advanced360Viewer() {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [logoCustomization, setLogoCustomization] = useState<LogoCustomization>({
    file: null,
    preview: '',
    position: { x: 50, y: 40 },
    size: 20,
    rotation: 0,
    placement: 'chest',
  });
  const [showCustomizer, setShowCustomizer] = useState(false);

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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoCustomization({
          ...logoCustomization,
          file,
          preview: reader.result as string,
        });
        setShowCustomizer(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetCustomization = () => {
    setLogoCustomization({
      file: null,
      preview: '',
      position: { x: 50, y: 40 },
      size: 20,
      rotation: 0,
      placement: 'chest',
    });
    setShowCustomizer(false);
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

              {/* Logo Overlay */}
              {logoCustomization.preview && (
                <motion.div
                  drag
                  dragMomentum={false}
                  className="absolute cursor-move"
                  style={{
                    left: `${logoCustomization.position.x}%`,
                    top: `${logoCustomization.position.y}%`,
                    width: `${logoCustomization.size}%`,
                    rotate: logoCustomization.rotation,
                  }}
                  onDragEnd={(e, info) => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (rect) {
                      setLogoCustomization({
                        ...logoCustomization,
                        position: {
                          x: ((info.point.x - rect.left) / rect.width) * 100,
                          y: ((info.point.y - rect.top) / rect.height) * 100,
                        },
                      });
                    }
                  }}
                >
                  <Image
                    src={logoCustomization.preview}
                    alt="Custom logo"
                    width={100}
                    height={100}
                    className="w-full h-auto drop-shadow-lg"
                  />
                </motion.div>
              )}
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

        {/* Upload Logo Button */}
        <label className="cursor-pointer">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Upload className="w-5 h-5 text-white" />
          </motion.div>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Logo Customizer Panel */}
      {showCustomizer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 card-gradient p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gradient">Customize Logo</h3>
            <button
              onClick={resetCustomization}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Placement */}
            <div>
              <label className="block text-sm font-semibold mb-2">Placement</label>
              <div className="flex gap-2">
                {['chest', 'back', 'sleeve'].map((place) => (
                  <button
                    key={place}
                    onClick={() =>
                      setLogoCustomization({ ...logoCustomization, placement: place as any })
                    }
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      logoCustomization.placement === place
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {place.charAt(0).toUpperCase() + place.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Size: {logoCustomization.size}%
              </label>
              <input
                type="range"
                min="10"
                max="50"
                value={logoCustomization.size}
                onChange={(e) =>
                  setLogoCustomization({ ...logoCustomization, size: Number(e.target.value) })
                }
                className="w-full"
              />
            </div>

            {/* Rotation */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Rotation: {logoCustomization.rotation}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={logoCustomization.rotation}
                onChange={(e) =>
                  setLogoCustomization({ ...logoCustomization, rotation: Number(e.target.value) })
                }
                className="w-full"
              />
            </div>

            <p className="text-sm text-gray-600">
              💡 Drag the logo on the t-shirt to reposition it
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}