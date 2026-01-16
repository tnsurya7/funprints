'use client';

import { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RotateCw, ZoomIn, ZoomOut, Maximize2, Upload, X } from 'lucide-react';
import * as THREE from 'three';

interface TShirtViewerProps {
  color?: string;
  onClose?: () => void;
}

// T-Shirt 3D Model Component
function TShirtModel({ color = '#ffffff', logoTexture }: { color: string; logoTexture?: THREE.Texture | null }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle idle animation
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      {/* T-Shirt Geometry - Simple box for now, replace with GLB model */}
      <boxGeometry args={[2, 2.5, 0.3]} />
      <meshStandardMaterial
        color={color}
        roughness={0.8}
        metalness={0.1}
      />
      
      {/* Logo on front */}
      {logoTexture && (
        <mesh position={[0, 0.3, 0.16]}>
          <planeGeometry args={[0.8, 0.8]} />
          <meshBasicMaterial map={logoTexture} transparent />
        </mesh>
      )}
    </mesh>
  );
}

// Scene Component
function Scene({ color, logoTexture }: { color: string; logoTexture?: THREE.Texture | null }) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  
  return (
    <>
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
      
      {/* Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow={!isMobile} />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} />
      <pointLight position={[0, 5, 0]} intensity={0.5} />
      
      {/* T-Shirt Model */}
      <TShirtModel color={color} logoTexture={logoTexture} />
      
      {/* Environment */}
      <Environment preset="studio" />
      
      {/* Shadow - Disabled on mobile for performance */}
      {!isMobile && (
        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.4}
          scale={10}
          blur={2}
          far={4}
        />
      )}
      
      {/* Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={8}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
}

export default function ThreeDTshirtViewer({ color = '#ffffff', onClose }: TShirtViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(color);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoTexture, setLogoTexture] = useState<THREE.Texture | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const colors = [
    { name: 'White', value: '#ffffff' },
    { name: 'Black', value: '#000000' },
    { name: 'Grey', value: '#6b7280' },
    { name: 'Navy', value: '#1e3a8a' },
    { name: 'Green', value: '#065f46' },
    { name: 'Maroon', value: '#7f1d1d' },
  ];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const texture = new THREE.Texture(img);
          texture.needsUpdate = true;
          setLogoTexture(texture);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-6xl h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white transition-colors"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        )}

        <div className="flex flex-col lg:flex-row h-full">
          {/* 3D Viewer */}
          <div className="flex-1 relative bg-gradient-to-br from-gray-50 to-gray-100">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Loading 3D Viewer...</p>
                </div>
              </div>
            )}
            
            <Canvas shadows dpr={[1, 1.5]}>
              <Suspense fallback={null}>
                <Scene color={selectedColor} logoTexture={logoTexture} />
              </Suspense>
            </Canvas>

            {/* Instructions */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg">
              <p className="text-sm text-gray-700 font-medium">
                🖱️ Drag to rotate • 🔍 Scroll to zoom
              </p>
            </div>
          </div>

          {/* Control Panel */}
          <div className="w-full lg:w-80 bg-white p-6 overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Customize
            </h3>

            {/* Color Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                T-Shirt Color
              </label>
              <div className="grid grid-cols-3 gap-3">
                {colors.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setSelectedColor(c.value)}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      selectedColor === c.value
                        ? 'border-purple-500 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className="w-full h-12 rounded-lg mb-2"
                      style={{ backgroundColor: c.value }}
                    />
                    <p className="text-xs font-medium text-gray-700">{c.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Logo Upload */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Upload Logo
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 transition-colors"
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {logoFile ? logoFile.name : 'Click to upload'}
                </p>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button className="w-full py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
                Add to Cart
              </button>
              <button className="w-full py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                Save Design
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
