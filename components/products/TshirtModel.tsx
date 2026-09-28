'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

interface TshirtModelProps {
  color: string;
  modelPath?: string;
  isAutoRotating?: boolean;
}

// Generate realistic fine organic cotton weave bump texture
function createFabricBumpTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as any);

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);

    // Fine organic cotton knit weave matrix
    for (let x = 0; x < 512; x += 4) {
      for (let y = 0; y < 512; y += 4) {
        const noise = (Math.random() - 0.5) * 18;
        const shade = Math.floor(128 + noise);
        ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
        ctx.fillRect(x, y, 2, 2);

        // Interlocking warp & weft rib
        const weaveShade = Math.floor(140 + noise);
        ctx.fillStyle = `rgb(${weaveShade}, ${weaveShade}, ${weaveShade})`;
        ctx.fillRect(x + 2, y + 2, 2, 2);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(24, 24);
  texture.needsUpdate = true;
  return texture;
}

export default function TshirtModel({
  color,
  modelPath = '/models/tshirt.glb',
  isAutoRotating = false
}: TshirtModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Load realistic GLB garment model
  const activePath = modelPath || '/models/tshirt.glb';
  const { scene } = useGLTF(activePath);

  // Clone scene to avoid shared mutation across renders
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  // Generate fabric micro texture once
  const bumpTexture = useMemo(() => createFabricBumpTexture(), []);

  // Keep model at stable centered height for perfectly smooth rotation
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.y = -0.04;
    }
  });

  // Apply custom cotton material with color synchronization to all meshes in the GLB
  useMemo(() => {
    const isWhite = color.toLowerCase() === '#ffffff' || color.toLowerCase() === 'white';
    const isBlack = color.toLowerCase() === '#000000' || color.toLowerCase() === '#171717' || color.toLowerCase() === 'black';

    const threeColor = new THREE.Color(color);

    // Cotton fabric body material (metalness: 0, high roughness, realistic cloth sheen)
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: threeColor,
      roughness: isWhite ? 0.82 : isBlack ? 0.90 : 0.85,
      metalness: 0.0,
      bumpMap: bumpTexture,
      bumpScale: 0.006,
      side: THREE.DoubleSide,
    });

    // Ribbed collar & cuff material (subtly deeper tone with distinct rib texture)
    const collarMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color).multiplyScalar(0.96),
      roughness: 0.92,
      metalness: 0.0,
      bumpMap: bumpTexture,
      bumpScale: 0.012,
      side: THREE.DoubleSide,
    });

    // Pearl button material
    const buttonMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#f8fafc'),
      roughness: 0.25,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    // Metallic silver aglet material
    const agletMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#cbd5e1'),
      roughness: 0.3,
      metalness: 0.85,
      side: THREE.DoubleSide
    });

    // Cotton cord drawstring material
    const drawstringMaterial = new THREE.MeshStandardMaterial({
      color: isWhite ? new THREE.Color('#e2e8f0') : new THREE.Color('#f8fafc'),
      roughness: 0.88,
      metalness: 0.0,
      side: THREE.DoubleSide
    });

    // Natural skin / mannequin body material (preserves authentic skin tone for hands, neck, and head)
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#edd7c2'),
      roughness: 0.58,
      metalness: 0.04,
      side: THREE.DoubleSide
    });

    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (
          mesh.name.includes('Skin') ||
          mesh.name.includes('Mannequin') ||
          mesh.name.includes('Body_Skin')
        ) {
          mesh.material = skinMaterial;
        } else if (mesh.name.includes('Button')) {
          mesh.material = buttonMaterial;
        } else if (mesh.name.includes('Aglet')) {
          mesh.material = agletMaterial;
        } else if (mesh.name.includes('Drawstring')) {
          mesh.material = drawstringMaterial;
        } else if (
          mesh.name.includes('Collar') ||
          mesh.name.includes('Hem') ||
          mesh.name.includes('Cuff') ||
          mesh.name.includes('Placket') ||
          mesh.name.includes('Waistband')
        ) {
          mesh.material = collarMaterial;
        } else {
          mesh.material = bodyMaterial;
        }
      }
    });
  }, [clonedScene, color, bumpTexture]);

  return (
    <group ref={groupRef} position={[0, 0.15, 0]} scale={[3.6, 3.6, 3.6]}>
      <primitive object={clonedScene} />
    </group>
  );
}

// Preload all garment model assets for instant switching
useGLTF.preload('/models/tshirt.glb');
useGLTF.preload('/models/tshirts/round-neck.glb');
useGLTF.preload('/models/tshirts/v-neck.glb');
useGLTF.preload('/models/tshirts/polo.glb');
useGLTF.preload('/models/tshirts/hoodie.glb');

