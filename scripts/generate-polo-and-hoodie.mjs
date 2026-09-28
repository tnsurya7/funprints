globalThis.self = globalThis;
globalThis.window = globalThis;
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import fs from 'fs';
import path from 'path';

class NodeFileReader {
  async readAsArrayBuffer(blob) {
    const arrayBuf = await blob.arrayBuffer();
    this.result = arrayBuf;
    if (this.onload) this.onload();
    if (this.onloadend) this.onloadend();
  }
  async readAsDataURL(blob) {
    const arrayBuf = await blob.arrayBuffer();
    const base64 = Buffer.from(arrayBuf).toString('base64');
    this.result = 'data:' + (blob.type || 'application/octet-stream') + ';base64,' + base64;
    if (this.onload) this.onload();
    if (this.onloadend) this.onloadend();
  }
}
globalThis.FileReader = NodeFileReader;

async function loadBaseShirt() {
  const buf = fs.readFileSync('public/models/shirt_baked.glb');
  const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  const loader = new GLTFLoader();
  return new Promise((resolve, reject) => {
    loader.parse(arrayBuffer, '', (gltf) => resolve(gltf), (err) => reject(err));
  });
}

async function exportScene(scene, outputPath) {
  const exporter = new GLTFExporter();
  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (gltf) => {
        const buffer = Buffer.from(gltf);
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, buffer);
        console.log(`✓ Saved ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
        resolve();
      },
      (err) => reject(err),
      { binary: true }
    );
  });
}

// =========================================================================
// 1. BUILD REALISTIC POLO SHIRT (Collar Wings, Placket, Pearl Buttons, Cuffs)
// =========================================================================
async function buildPoloModel() {
  const gltf = await loadBaseShirt();
  const scene = gltf.scene;

  // 1. Placket (Central rectangular button band in front)
  const placketGeo = new THREE.BoxGeometry(0.038, 0.12, 0.008, 4, 12, 2);
  placketGeo.translate(0, 0.145, 0.095);
  const placketMesh = new THREE.Mesh(placketGeo);
  placketMesh.name = 'Polo_Placket';
  scene.add(placketMesh);

  // 2. Pearl Buttons (2 distinct small circular buttons on placket)
  for (let b = 0; b < 2; b++) {
    const buttonGeo = new THREE.CylinderGeometry(0.0055, 0.0055, 0.003, 16);
    buttonGeo.rotateX(Math.PI / 2);
    buttonGeo.translate(0, 0.175 - b * 0.045, 0.101);
    const buttonMesh = new THREE.Mesh(buttonGeo);
    buttonMesh.name = `Polo_Button_${b + 1}`;
    scene.add(buttonMesh);
  }

  // 3. Folded Polo Collar Wings (Left and Right wrap-around collar flaps)
  // Left Collar Wing
  const leftCollarCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.01, 0.228, 0.085),
    new THREE.Vector3(-0.05, 0.232, 0.075),
    new THREE.Vector3(-0.08, 0.222, 0.040),
    new THREE.Vector3(-0.085, 0.210, -0.010),
    new THREE.Vector3(-0.065, 0.220, -0.055),
    new THREE.Vector3(0.0, 0.230, -0.065)
  ]);

  // Collar profile cross section (tapered turnover flap)
  const leftCollarGeo = new THREE.TubeGeometry(leftCollarCurve, 32, 0.016, 12, false);
  leftCollarGeo.scale(1.0, 0.75, 1.1);
  const leftCollarMesh = new THREE.Mesh(leftCollarGeo);
  leftCollarMesh.name = 'Polo_Collar_Left';
  scene.add(leftCollarMesh);

  // Right Collar Wing
  const rightCollarCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.01, 0.228, 0.085),
    new THREE.Vector3(0.05, 0.232, 0.075),
    new THREE.Vector3(0.08, 0.222, 0.040),
    new THREE.Vector3(0.085, 0.210, -0.010),
    new THREE.Vector3(0.065, 0.220, -0.055),
    new THREE.Vector3(0.0, 0.230, -0.065)
  ]);

  const rightCollarGeo = new THREE.TubeGeometry(rightCollarCurve, 32, 0.016, 12, false);
  rightCollarGeo.scale(1.0, 0.75, 1.1);
  const rightCollarMesh = new THREE.Mesh(rightCollarGeo);
  rightCollarMesh.name = 'Polo_Collar_Right';
  scene.add(rightCollarMesh);

  // 4. Ribbed Sleeve Cuffs
  for (const side of [-1, 1]) {
    const cuffGeo = new THREE.CylinderGeometry(0.062, 0.060, 0.024, 24);
    cuffGeo.rotateZ(side * 0.55);
    cuffGeo.rotateX(0.1);
    cuffGeo.translate(side * 0.225, 0.055, 0.015);
    const cuffMesh = new THREE.Mesh(cuffGeo);
    cuffMesh.name = `Polo_Cuff_${side > 0 ? 'Right' : 'Left'}`;
    scene.add(cuffMesh);
  }

  await exportScene(scene, 'public/models/tshirts/polo.glb');
}

// =========================================================================
// 2. BUILD REALISTIC HOODIE (Long Draped Sleeves, 3D Hood, Kangaroo Pocket, Drawstrings)
// =========================================================================
async function buildHoodieModel() {
  const gltf = await loadBaseShirt();
  const scene = gltf.scene;

  // Scale torso slightly for relaxed hoodie fit
  scene.traverse((child) => {
    if (child.isMesh) {
      child.geometry = child.geometry.clone();
      const pos = child.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        // Expand waist and chest slightly
        pos.setX(i, pos.getX(i) * 1.05);
        pos.setZ(i, pos.getZ(i) * 1.08);
      }
      child.geometry.computeVertexNormals();
    }
  });

  // 1. Long Sleeves extending to wrists (Left & Right)
  for (const side of [-1, 1]) {
    const sleeveCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.21, 0.08, 0.01),
      new THREE.Vector3(side * 0.26, 0.00, 0.02),
      new THREE.Vector3(side * 0.28, -0.10, 0.03),
      new THREE.Vector3(side * 0.27, -0.22, 0.04),
      new THREE.Vector3(side * 0.24, -0.32, 0.05)
    ]);

    const longSleeveGeo = new THREE.TubeGeometry(sleeveCurve, 36, 0.058, 20, false);
    // Taper towards wrist
    const pos = longSleeveGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const prog = (0.08 - y) / 0.40; // 0 at shoulder, 1 at wrist
      if (prog > 0) {
        const taper = 1.0 - 0.32 * Math.min(1.0, prog);
        const curX = pos.getX(i);
        const curZ = pos.getZ(i);
        const center = sleeveCurve.getPointAt(Math.min(1.0, Math.max(0, prog)));
        pos.setX(i, center.x + (curX - center.x) * taper);
        pos.setZ(i, center.z + (curZ - center.z) * taper);
      }
    }
    longSleeveGeo.computeVertexNormals();
    const sleeveMesh = new THREE.Mesh(longSleeveGeo);
    sleeveMesh.name = `Hoodie_Sleeve_${side > 0 ? 'Right' : 'Left'}`;
    scene.add(sleeveMesh);

    // Ribbed wrist cuff
    const wristCuffGeo = new THREE.CylinderGeometry(0.040, 0.038, 0.035, 24);
    wristCuffGeo.rotateZ(side * 0.2);
    wristCuffGeo.translate(side * 0.24, -0.33, 0.05);
    const wristCuff = new THREE.Mesh(wristCuffGeo);
    wristCuff.name = `Hoodie_WristCuff_${side > 0 ? 'Right' : 'Left'}`;
    scene.add(wristCuff);
  }

  // 2. Front Kangaroo Pouch Pocket
  const pocketGeo = new THREE.BufferGeometry();
  const pocketCols = 24;
  const pocketRows = 16;
  const pPositions = [];
  const pIndices = [];
  const pUvs = [];

  const pocketWidth = 0.24;
  const pocketHeight = 0.16;
  const pocketYMin = -0.28;
  const pocketYMax = pocketYMin + pocketHeight;

  for (let r = 0; r <= pocketRows; r++) {
    const v = r / pocketRows;
    const y = pocketYMin + v * pocketHeight;

    for (let c = 0; c <= pocketCols; c++) {
      const u = c / pocketCols;
      // Trapeze shape: narrower at top, wider at bottom
      const widthFactor = 1.0 - 0.25 * v;
      const x = (u - 0.5) * pocketWidth * widthFactor;

      // Curved surface contour over belly
      const zCurv = (1.0 - Math.pow((u - 0.5) * 2, 2)) * 0.022;
      const z = 0.105 + zCurv;

      pPositions.push(x, y, z);
      pUvs.push(u, v);
    }
  }

  for (let r = 0; r < pocketRows; r++) {
    for (let c = 0; c < pocketCols; c++) {
      const a = r * (pocketCols + 1) + c;
      const b = (r + 1) * (pocketCols + 1) + c;
      const d = (r + 1) * (pocketCols + 1) + (c + 1);
      const e = r * (pocketCols + 1) + (c + 1);

      pIndices.push(a, b, e);
      pIndices.push(b, d, e);
    }
  }

  pocketGeo.setAttribute('position', new THREE.Float32BufferAttribute(pPositions, 3));
  pocketGeo.setAttribute('uv', new THREE.Float32BufferAttribute(pUvs, 2));
  pocketGeo.setIndex(pIndices);
  pocketGeo.computeVertexNormals();

  const pocketMesh = new THREE.Mesh(pocketGeo);
  pocketMesh.name = 'Hoodie_Pocket';
  scene.add(pocketMesh);

  // 3. 3D Hood draped behind neck and shoulders
  const hoodShape = new THREE.SphereGeometry(0.145, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.85);
  hoodShape.scale(0.85, 1.15, 0.95);
  hoodShape.rotateX(0.22);
  hoodShape.translate(0, 0.26, -0.06);
  const hoodMesh = new THREE.Mesh(hoodShape);
  hoodMesh.name = 'Hoodie_Hood';
  scene.add(hoodMesh);

  // 4. Hood Drawstrings (Left & Right)
  for (const side of [-1, 1]) {
    const stringCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.032, 0.21, 0.088),
      new THREE.Vector3(side * 0.038, 0.16, 0.095),
      new THREE.Vector3(side * 0.034, 0.10, 0.098),
      new THREE.Vector3(side * 0.030, 0.05, 0.096)
    ]);
    const stringGeo = new THREE.TubeGeometry(stringCurve, 20, 0.0028, 8, false);
    const stringMesh = new THREE.Mesh(stringGeo);
    stringMesh.name = `Hoodie_Drawstring_${side > 0 ? 'Right' : 'Left'}`;
    scene.add(stringMesh);

    // Silver Aglet at the tip of the string
    const agletGeo = new THREE.CylinderGeometry(0.0035, 0.0035, 0.012, 12);
    agletGeo.translate(side * 0.030, 0.045, 0.096);
    const agletMesh = new THREE.Mesh(agletGeo);
    agletMesh.name = `Hoodie_Aglet_${side > 0 ? 'Right' : 'Left'}`;
    scene.add(agletMesh);
  }

  // 5. Ribbed Bottom Waistband
  const waistbandGeo = new THREE.CylinderGeometry(0.215, 0.215, 0.045, 32);
  waistbandGeo.scale(1.0, 1.0, 0.58);
  waistbandGeo.translate(0, -0.345, 0.005);
  const waistbandMesh = new THREE.Mesh(waistbandGeo);
  waistbandMesh.name = 'Hoodie_Waistband';
  scene.add(waistbandMesh);

  await exportScene(scene, 'public/models/tshirts/hoodie.glb');
}

async function main() {
  console.log('🚀 Building authentic Polo and Hoodie 3D models with high-fidelity garment geometry...');
  await buildPoloModel();
  await buildHoodieModel();
  console.log('🎉 Polo and Hoodie 3D models generated and exported successfully!');
}

main().catch(console.error);
