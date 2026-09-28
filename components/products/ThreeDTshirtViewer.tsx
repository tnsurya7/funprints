'use client';

import { Suspense, useState, useRef, useEffect, Component, ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { X } from 'lucide-react';

import TshirtModel from './TshirtModel';
import ProductViewerControls from './ProductViewerControls';
import ProductViewerSkeleton from './ProductViewerSkeleton';
import ProductViewerFallback from './ProductViewerFallback';

// Error Boundary for WebGL / Canvas errors
interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class WebGLErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn('3D Viewer WebGL Error, falling back to 2D image:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface ThreeDTshirtViewerProps {
  color?: string;
  modelPath?: string;
  productName?: string;
  images?: {
    front?: string;
    back?: string;
    side?: string;
  };
  fallbackImageUrl?: string;
  onClose?: () => void;
  className?: string;
  initialAutoRotate?: boolean;
}

// Internal 3D Scene
function SceneContent({
  color,
  modelPath,
  isAutoRotating,
  controlsRef,
  onStartInteraction,
  onEndInteraction
}: {
  color: string;
  modelPath?: string;
  isAutoRotating: boolean;
  controlsRef: React.RefObject<OrbitControlsImpl>;
  onStartInteraction: () => void;
  onEndInteraction: () => void;
}) {
  return (
    <>
      {/* Studio Camera */}
      <PerspectiveCamera makeDefault position={[0, -0.05, 3.8]} fov={42} near={0.1} far={100} />

      {/* Professional Studio 3-Point Lighting */}
      {/* 1. Soft Ambient fill */}
      <ambientLight intensity={0.75} />

      {/* 2. Key Light (Front-Right high) */}
      <directionalLight
        position={[4, 5, 4]}
        intensity={1.3}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={15}
        shadow-bias={-0.0001}
      />

      {/* 3. Fill Light (Front-Left mid) */}
      <directionalLight position={[-4, 2.5, 3]} intensity={0.65} />

      {/* 4. Rim / Silhouette Backlight (Top-Back) to highlight fabric shoulders */}
      <directionalLight position={[0, 4, -4]} intensity={0.9} color="#f8fafc" />

      {/* 5. Subtle warm under-bounce */}
      <directionalLight position={[0, -3, 2]} intensity={0.25} color="#ffffff" />

      {/* 3D T-Shirt Model */}
      <TshirtModel color={color} modelPath={modelPath} isAutoRotating={isAutoRotating} />

      {/* Ground Contact Shadow */}
      <ContactShadows
        position={[0, -1.65, 0]}
        opacity={0.45}
        scale={6}
        blur={2}
        far={3.5}
        color="#1f2937"
      />

      {/* Damped 360° Orbit Controls */}
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        enableDamping={true}
        dampingFactor={0.06}
        rotateSpeed={0.8}
        zoomSpeed={0.7}
        minDistance={2.4}
        maxDistance={6.0}
        minPolarAngle={Math.PI / 3.4}
        maxPolarAngle={Math.PI / 1.75}
        autoRotate={isAutoRotating}
        autoRotateSpeed={1.8}
        onStart={onStartInteraction}
        onEnd={onEndInteraction}
      />
    </>
  );
}

// Color map helper
const COLOR_HEX_MAP: Record<string, string> = {
  white: '#FFFFFF',
  black: '#171717',
  grey: '#6B7280',
  gray: '#6B7280',
  'navy blue': '#1E3A8A',
  navy: '#1E3A8A',
  maroon: '#7F1D1D',
  red: '#DC2626',
  blue: '#2563EB',
  green: '#16A34A',
  yellow: '#EAB308',
  orange: '#EA580C',
  purple: '#7C3AED',
  pink: '#DB2777'
};

function resolveColorHex(colorInput: string = 'White'): string {
  if (colorInput.startsWith('#')) return colorInput;
  const normalized = colorInput.trim().toLowerCase();
  return COLOR_HEX_MAP[normalized] || '#FFFFFF';
}

export default function ThreeDTshirtViewer({
  color = 'White',
  modelPath,
  productName = 'T-Shirt',
  images,
  fallbackImageUrl,
  onClose,
  className,
  initialAutoRotate = false
}: ThreeDTshirtViewerProps) {
  const [isAutoRotating, setIsAutoRotating] = useState(initialAutoRotate);
  const [isInteracting, setIsInteracting] = useState(false);
  const [activeAngle, setActiveAngle] = useState<string>('threeQuarter');
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);

  const controlsRef = useRef<OrbitControlsImpl>(null);

  // Check WebGL availability on mount
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setHasWebGL(Boolean(gl));
    } catch {
      setHasWebGL(false);
    }
  }, []);

  const resolvedHex = resolveColorHex(color);

  // Handle Preset Angle Setting
  const handleSetAngle = (angle: 'front' | 'side' | 'back' | 'threeQuarter') => {
    setActiveAngle(angle);
    setIsAutoRotating(false);

    if (!controlsRef.current) return;

    const controls = controlsRef.current;
    const distance = 4.2;

    switch (angle) {
      case 'front':
        controls.object.position.set(0, 0, distance);
        break;
      case 'side':
        controls.object.position.set(distance, 0, 0);
        break;
      case 'back':
        controls.object.position.set(0, 0, -distance);
        break;
      case 'threeQuarter':
        controls.object.position.set(distance * 0.7, distance * 0.2, distance * 0.7);
        break;
    }

    controls.target.set(0, 0, 0);
    controls.update();
  };

  const handleZoomIn = () => {
    if (!controlsRef.current) return;
    const camera = controlsRef.current.object;
    const dir = new THREE.Vector3().subVectors(controlsRef.current.target, camera.position).normalize();
    if (camera.position.length() > 2.6) {
      camera.position.addScaledVector(dir, 0.4);
      controlsRef.current.update();
    }
  };

  const handleZoomOut = () => {
    if (!controlsRef.current) return;
    const camera = controlsRef.current.object;
    const dir = new THREE.Vector3().subVectors(camera.position, controlsRef.current.target).normalize();
    if (camera.position.length() < 5.8) {
      camera.position.addScaledVector(dir, 0.4);
      controlsRef.current.update();
    }
  };

  const handleReset = () => {
    handleSetAngle('front');
  };

  const fallbackView = (
    <ProductViewerFallback
      productName={productName}
      selectedColor={color}
      images={images}
      fallbackImageUrl={fallbackImageUrl}
    />
  );

  if (hasWebGL === false) {
    return fallbackView;
  }

  return (
    <WebGLErrorBoundary fallback={fallbackView}>
      <div className={`relative w-full ${className || 'aspect-square'} bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-3xl overflow-hidden shadow-sm border border-gray-200/80 select-none group`}>
        {/* Interactive Overlay Controls */}
        <ProductViewerControls
          onSetAngle={handleSetAngle}
          isAutoRotating={isAutoRotating}
          onToggleAutoRotate={() => setIsAutoRotating((prev) => !prev)}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
          activeAngle={activeAngle}
          isInteracting={isInteracting}
        />

        {/* Close Button if rendered as modal */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close 3D Viewer"
            className="absolute top-4 right-4 z-30 p-2 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow-md transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* 3D Canvas */}
        <Suspense fallback={<ProductViewerSkeleton />}>
          <Canvas
            shadows
            dpr={[1, 2]}
            gl={{
              antialias: true,
              powerPreference: 'high-performance',
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.05
            }}
            className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
          >
            <SceneContent
              color={resolvedHex}
              modelPath={modelPath}
              isAutoRotating={isAutoRotating}
              controlsRef={controlsRef}
              onStartInteraction={() => setIsInteracting(true)}
              onEndInteraction={() => setIsInteracting(false)}
            />
          </Canvas>
        </Suspense>
      </div>
    </WebGLErrorBoundary>
  );
}
