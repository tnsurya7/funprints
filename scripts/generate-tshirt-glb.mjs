import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import fs from 'fs';
import path from 'path';

// Ensure public/models directory exists
const modelsDir = path.resolve(process.cwd(), 'public/models');
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

// Global polyfill for Node.js environment required by GLTFExporter
if (typeof window === 'undefined') {
  global.window = {};
}

if (typeof FileReader === 'undefined') {
  global.FileReader = class FileReader {
    readAsArrayBuffer(blob) {
      if (blob.arrayBuffer) {
        blob.arrayBuffer().then((buf) => {
          this.result = buf;
          if (this.onloadend) this.onloadend();
          if (this.onload) this.onload();
        });
      } else {
        this.result = new ArrayBuffer(0);
        if (this.onloadend) this.onloadend();
        if (this.onload) this.onload();
      }
    }
    readAsDataURL(blob) {
      this.result = '';
      if (this.onloadend) this.onloadend();
    }
  };
}

function createRealisticTshirtMesh() {
  const scene = new THREE.Scene();
  const tshirtGroup = new THREE.Group();
  tshirtGroup.name = 'TShirt_Root';

  // Base fabric material with cotton parameters
  const fabricMaterial = new THREE.MeshStandardMaterial({
    name: 'Fabric_Cotton',
    color: 0xffffff,
    roughness: 0.85,
    metalness: 0.02,
    side: THREE.DoubleSide
  });

  const collarMaterial = new THREE.MeshStandardMaterial({
    name: 'Fabric_CollarRib',
    color: 0xf5f5f5,
    roughness: 0.9,
    metalness: 0.02,
    side: THREE.DoubleSide
  });

  // --- 1. TORSO SURFACE GENERATION (Organic cross-sectional loft with wrinkles) ---
  const vSlices = 48; // vertical resolution
  const hSlices = 48; // radial resolution
  const torsoVertices = [];
  const torsoIndices = [];
  const torsoUVs = [];

  for (let i = 0; i <= vSlices; i++) {
    const v = i / vSlices; // 0 (bottom hem) to 1 (shoulders/neck)
    const y = -1.35 + v * 2.55; // Height from -1.35 to +1.20

    for (let j = 0; j <= hSlices; j++) {
      const u = j / hSlices;
      const angle = u * Math.PI * 2; // Around the torso (0 to 2pi)

      // Natural torso width & depth profile
      let width = 0.96;
      let depth = 0.38;

      if (v < 0.1) {
        // Bottom hem slight flare
        width = 0.98;
        depth = 0.40;
      } else if (v < 0.45) {
        // Waist taper
        width = 0.92 + (v - 0.1) * 0.05;
        depth = 0.36 + (v - 0.1) * 0.04;
      } else if (v < 0.8) {
        // Chest expansion & underarm
        const t = (v - 0.45) / 0.35;
        width = 0.94 + t * 0.18;
        depth = 0.38 + t * 0.06;
      } else {
        // Shoulder slope & yoke taper into neck
        const t = (v - 0.8) / 0.2;
        width = 1.12 - t * 0.55;
        depth = 0.44 - t * 0.12;
      }

      // Front vs back shaping
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle); // >0 is front, <0 is back

      // Neck scoop cutout at top (v > 0.85)
      let neckDrop = 0;
      if (v > 0.82 && sinA > 0) {
        // Front collar scoop
        const frontProximity = sinA * ((v - 0.82) / 0.18);
        neckDrop = Math.sin(frontProximity * Math.PI * 0.5) * 0.22;
      } else if (v > 0.92 && sinA < 0) {
        // Back collar slight drop
        const backProximity = -sinA * ((v - 0.92) / 0.08);
        neckDrop = Math.sin(backProximity * Math.PI * 0.5) * 0.06;
      }

      // Natural cloth wrinkles & drape deformation
      const foldNoise1 = Math.sin(angle * 3 + y * 4.5) * 0.022 * (1 - Math.abs(v - 0.5));
      const foldNoise2 = Math.cos(angle * 5 - y * 3.0) * 0.015 * (v < 0.7 ? 1 : 0.3);
      const chestCurve = (sinA > 0 ? Math.sin(sinA * Math.PI) * 0.04 * (v > 0.5 && v < 0.85 ? 1 : 0) : 0);

      const posX = cosA * (width + foldNoise1);
      const posZ = sinA * (depth + foldNoise2 + chestCurve);
      const posY = y - neckDrop;

      torsoVertices.push(posX, posY, posZ);
      torsoUVs.push(u, v);
    }
  }

  // Generate torso quad faces
  for (let i = 0; i < vSlices; i++) {
    for (let j = 0; j < hSlices; j++) {
      const a = i * (hSlices + 1) + j;
      const b = (i + 1) * (hSlices + 1) + j;
      const c = (i + 1) * (hSlices + 1) + (j + 1);
      const d = i * (hSlices + 1) + (j + 1);

      torsoIndices.push(a, b, d);
      torsoIndices.push(b, c, d);
    }
  }

  const torsoGeometry = new THREE.BufferGeometry();
  torsoGeometry.setAttribute('position', new THREE.Float32BufferAttribute(torsoVertices, 3));
  torsoGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(torsoUVs, 2));
  torsoGeometry.setIndex(torsoIndices);
  torsoGeometry.computeVertexNormals();

  const torsoMesh = new THREE.Mesh(torsoGeometry, fabricMaterial);
  torsoMesh.name = 'Torso';
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;
  tshirtGroup.add(torsoMesh);

  // --- 2. SLEEVES (Natural draped sleeves with fabric folds) ---
  function createSleeve(isLeft = true) {
    const sleeveLength = 0.95;
    const sleeveRadiusTop = 0.38;
    const sleeveRadiusBottom = 0.31;
    const radialSegs = 32;
    const lengthSegs = 24;

    const sleeveVertices = [];
    const sleeveIndices = [];
    const sleeveUVs = [];

    const sideMult = isLeft ? -1 : 1;

    for (let i = 0; i <= lengthSegs; i++) {
      const v = i / lengthSegs; // 0 at shoulder, 1 at cuff
      const curRadius = sleeveRadiusTop - v * (sleeveRadiusTop - sleeveRadiusBottom);

      for (let j = 0; j <= radialSegs; j++) {
        const u = j / radialSegs;
        const angle = u * Math.PI * 2;

        // Subtle fabric wrinkles along the sleeve bend
        const sleeveWrinkle = Math.sin(angle * 3 + v * 6) * 0.018 * Math.sin(v * Math.PI);

        const r = curRadius + sleeveWrinkle;
        const localX = Math.cos(angle) * r;
        const localZ = Math.sin(angle) * r;
        const localY = -v * sleeveLength;

        // Rotate sleeve downwards by ~38 deg and outward along shoulder
        const rotAngle = (38 * Math.PI) / 180;
        const rotatedX = localX * Math.cos(rotAngle) - localY * Math.sin(rotAngle) * sideMult;
        const rotatedY = localX * Math.sin(rotAngle) * sideMult + localY * Math.cos(rotAngle);
        const rotatedZ = localZ;

        // Position at shoulder/armhole joint
        const finalX = rotatedX + sideMult * 1.02;
        const finalY = rotatedY + 0.85;
        const finalZ = rotatedZ + 0.02;

        sleeveVertices.push(finalX, finalY, finalZ);
        sleeveUVs.push(u, v);
      }
    }

    for (let i = 0; i < lengthSegs; i++) {
      for (let j = 0; j < radialSegs; j++) {
        const a = i * (radialSegs + 1) + j;
        const b = (i + 1) * (radialSegs + 1) + j;
        const c = (i + 1) * (radialSegs + 1) + (j + 1);
        const d = i * (radialSegs + 1) + (j + 1);

        if (isLeft) {
          sleeveIndices.push(a, b, d);
          sleeveIndices.push(b, c, d);
        } else {
          sleeveIndices.push(a, d, b);
          sleeveIndices.push(b, d, c);
        }
      }
    }

    const sleeveGeom = new THREE.BufferGeometry();
    sleeveGeom.setAttribute('position', new THREE.Float32BufferAttribute(sleeveVertices, 3));
    sleeveGeom.setAttribute('uv', new THREE.Float32BufferAttribute(sleeveUVs, 2));
    sleeveGeom.setIndex(sleeveIndices);
    sleeveGeom.computeVertexNormals();

    const sleeveMesh = new THREE.Mesh(sleeveGeom, fabricMaterial);
    sleeveMesh.name = isLeft ? 'Sleeve_Left' : 'Sleeve_Right';
    sleeveMesh.castShadow = true;
    sleeveMesh.receiveShadow = true;
    return sleeveMesh;
  }

  tshirtGroup.add(createSleeve(true));
  tshirtGroup.add(createSleeve(false));

  // --- 3. COLLAR RIBBING (Double-contoured neckband) ---
  const collarCurve = new THREE.EllipseCurve(0, 1.15, 0.44, 0.38, 0, 2 * Math.PI, false, 0);
  const collarPoints = collarCurve.getPoints(48);
  const collarShape = new THREE.Shape(collarPoints);

  const collarGeom = new THREE.TorusGeometry(0.44, 0.062, 16, 48, Math.PI * 2);
  collarGeom.scale(1.0, 0.88, 0.65);
  collarGeom.rotateX(Math.PI / 2.3);
  collarGeom.translate(0, 1.12, 0.04);
  collarGeom.computeVertexNormals();

  const collarMesh = new THREE.Mesh(collarGeom, collarMaterial);
  collarMesh.name = 'Collar_Ribbing';
  collarMesh.castShadow = true;
  tshirtGroup.add(collarMesh);

  // --- 4. BOTTOM WAIST HEM ---
  const hemGeom = new THREE.TorusGeometry(0.98, 0.042, 12, 48, Math.PI * 2);
  hemGeom.scale(1.0, 0.42, 1.0);
  hemGeom.rotateX(Math.PI / 2);
  hemGeom.translate(0, -1.35, 0);
  hemGeom.computeVertexNormals();

  const hemMesh = new THREE.Mesh(hemGeom, collarMaterial);
  hemMesh.name = 'Hem_Waist';
  hemMesh.castShadow = true;
  tshirtGroup.add(hemMesh);

  // --- 5. CUFF HEMS ---
  function createCuff(isLeft = true) {
    const sideMult = isLeft ? -1 : 1;
    const cuffGeom = new THREE.TorusGeometry(0.31, 0.038, 12, 32);
    const rotAngle = (38 * Math.PI) / 180;
    cuffGeom.rotateZ(rotAngle * sideMult);
    cuffGeom.rotateX(0.1);
    cuffGeom.translate(sideMult * 1.62, 0.12, 0.02);
    cuffGeom.computeVertexNormals();

    const cuffMesh = new THREE.Mesh(cuffGeom, collarMaterial);
    cuffMesh.name = isLeft ? 'Cuff_Left' : 'Cuff_Right';
    return cuffMesh;
  }

  tshirtGroup.add(createCuff(true));
  tshirtGroup.add(createCuff(false));

  scene.add(tshirtGroup);
  return scene;
}

// Export to GLB binary
const scene = createRealisticTshirtMesh();
const exporter = new GLTFExporter();

exporter.parse(
  scene,
  (gltf) => {
    const outputPath = path.resolve(modelsDir, 'tshirt.glb');
    fs.writeFileSync(outputPath, Buffer.from(gltf));
    const stats = fs.statSync(outputPath);
    console.log(`✅ Successfully generated optimized production GLB: ${outputPath} (${(stats.size / 1024).toFixed(1)} KB)`);
  },
  (error) => {
    console.error('❌ Error exporting GLTF/GLB:', error);
  },
  { binary: true, embedImages: true }
);
