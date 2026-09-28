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
// 1. FLAWLESS POLO T-SHIRT (Flush Polo Collar, Front Placket, Pearl Buttons)
// =========================================================================
async function buildPoloModel() {
  const gltf = await loadBaseShirt();
  const scene = gltf.scene;

  // 1. Placket (Flush rectangular button strip on front center chest)
  const placketGeo = new THREE.BoxGeometry(0.024, 0.095, 0.003, 4, 12, 1);
  placketGeo.rotateX(-0.14); // Match chest slope
  placketGeo.translate(0, 0.145, 0.090);
  const placketMesh = new THREE.Mesh(placketGeo);
  placketMesh.name = 'Polo_Placket';
  scene.add(placketMesh);

  // 2. Pearl Buttons (2 tiny flush buttons)
  for (let b = 0; b < 2; b++) {
    const buttonGeo = new THREE.CylinderGeometry(0.0035, 0.0035, 0.002, 16);
    buttonGeo.rotateX(Math.PI / 2 - 0.14);
    buttonGeo.translate(0, 0.170 - b * 0.038, 0.093 + (b === 0 ? 0.005 : 0.0));
    const buttonMesh = new THREE.Mesh(buttonGeo);
    buttonMesh.name = `Polo_Button_${b + 1}`;
    scene.add(buttonMesh);
  }

  // 3. Crisp Folded Polo Collar Wings (Left and Right collar flaps resting flat against collarbone)
  // Left Collar Wing
  const leftWingShape = new THREE.Shape();
  leftWingShape.moveTo(0, 0);
  leftWingShape.lineTo(-0.065, -0.015);
  leftWingShape.lineTo(-0.055, 0.045);
  leftWingShape.lineTo(0, 0.040);
  leftWingShape.closePath();

  const leftWingGeo = new THREE.ShapeGeometry(leftWingShape);
  leftWingGeo.rotateX(-0.55);
  leftWingGeo.rotateZ(0.18);
  leftWingGeo.rotateY(0.20);
  leftWingGeo.translate(-0.025, 0.205, 0.075);
  const leftWingMesh = new THREE.Mesh(leftWingGeo);
  leftWingMesh.name = 'Polo_Collar_Left';
  scene.add(leftWingMesh);

  // Right Collar Wing
  const rightWingShape = new THREE.Shape();
  rightWingShape.moveTo(0, 0);
  rightWingShape.lineTo(0.065, -0.015);
  rightWingShape.lineTo(0.055, 0.045);
  rightWingShape.lineTo(0, 0.040);
  rightWingShape.closePath();

  const rightWingGeo = new THREE.ShapeGeometry(rightWingShape);
  rightWingGeo.rotateX(-0.55);
  rightWingGeo.rotateZ(-0.18);
  rightWingGeo.rotateY(-0.20);
  rightWingGeo.translate(0.025, 0.205, 0.075);
  const rightWingMesh = new THREE.Mesh(rightWingGeo);
  rightWingMesh.name = 'Polo_Collar_Right';
  scene.add(rightWingMesh);

  // 4. Wrap-around back neck collar stand
  const backCollarCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.075, 0.218, 0.035),
    new THREE.Vector3(-0.070, 0.228, -0.025),
    new THREE.Vector3(0.0, 0.232, -0.050),
    new THREE.Vector3(0.070, 0.228, -0.025),
    new THREE.Vector3(0.075, 0.218, 0.035)
  ]);
  const backCollarGeo = new THREE.TubeGeometry(backCollarCurve, 24, 0.008, 8, false);
  const backCollarMesh = new THREE.Mesh(backCollarGeo);
  backCollarMesh.name = 'Polo_Collar_Back';
  scene.add(backCollarMesh);

  await exportScene(scene, 'public/models/tshirts/polo.glb');
}

// =========================================================================
// 2. FLAWLESS HOODIE (Draped Flat Hood, Kangaroo Pocket, Drawstrings)
// =========================================================================
async function buildHoodieModel() {
  const gltf = await loadBaseShirt();
  const scene = gltf.scene;

  // 1. Natural Draped Fabric Hood (Lying back naturally over the shoulders & upper back)
  const hoodGeo = new THREE.SphereGeometry(0.125, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.72);
  hoodGeo.scale(0.92, 0.78, 1.12);
  hoodGeo.rotateX(0.75); // Tilts back over upper back
  hoodGeo.translate(0, 0.175, -0.080);
  const hoodMesh = new THREE.Mesh(hoodGeo);
  hoodMesh.name = 'Hoodie_Hood';
  scene.add(hoodMesh);

  // 2. Hood Neckline Draped Collar Rim (Covers the neck seam where the hood attaches)
  const hoodRimCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.065, 0.210, 0.065),
    new THREE.Vector3(-0.085, 0.218, 0.000),
    new THREE.Vector3(0.0, 0.224, -0.060),
    new THREE.Vector3(0.085, 0.218, 0.000),
    new THREE.Vector3(0.065, 0.210, 0.065)
  ]);
  const hoodRimGeo = new THREE.TubeGeometry(hoodRimCurve, 28, 0.012, 10, false);
  const hoodRimMesh = new THREE.Mesh(hoodRimGeo);
  hoodRimMesh.name = 'Hoodie_CollarRim';
  scene.add(hoodRimMesh);

  // 3. Hanging Hood Drawstrings with Aglets
  for (const side of [-1, 1]) {
    const stringCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.026, 0.198, 0.085),
      new THREE.Vector3(side * 0.030, 0.145, 0.092),
      new THREE.Vector3(side * 0.028, 0.090, 0.094),
      new THREE.Vector3(side * 0.024, 0.040, 0.091)
    ]);
    const stringGeo = new THREE.TubeGeometry(stringCurve, 18, 0.0024, 8, false);
    const stringMesh = new THREE.Mesh(stringGeo);
    stringMesh.name = `Hoodie_Drawstring_${side > 0 ? 'Right' : 'Left'}`;
    scene.add(stringMesh);

    // Silver Aglet
    const agletGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.010, 12);
    agletGeo.translate(side * 0.024, 0.035, 0.091);
    const agletMesh = new THREE.Mesh(agletGeo);
    agletMesh.name = `Hoodie_Aglet_${side > 0 ? 'Right' : 'Left'}`;
    scene.add(agletMesh);
  }

  // 4. Front Kangaroo Pouch Pocket (Smooth contoured patch flush against abdomen)
  const pocketGeo = new THREE.BufferGeometry();
  const cols = 20;
  const rows = 14;
  const positions = [];
  const uvs = [];
  const indices = [];

  const pocketYMin = -0.28;
  const pocketYMax = -0.12;

  for (let r = 0; r <= rows; r++) {
    const v = r / rows;
    const y = pocketYMin + v * (pocketYMax - pocketYMin);

    for (let c = 0; c <= cols; c++) {
      const u = c / cols;
      // Kangaroo pocket trapezoid shape
      const widthFactor = 0.22 * (1.0 - 0.22 * v);
      const x = (u - 0.5) * widthFactor;

      // Abdomen curvature
      const zCurve = (1.0 - Math.pow((u - 0.5) * 2, 2)) * 0.018;
      const z = 0.095 + zCurve;

      positions.push(x, y, z);
      uvs.push(u, v);
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const a = r * (cols + 1) + c;
      const b = (r + 1) * (cols + 1) + c;
      const d = (r + 1) * (cols + 1) + (c + 1);
      const e = r * (cols + 1) + (c + 1);

      indices.push(a, b, e);
      indices.push(b, d, e);
    }
  }

  pocketGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  pocketGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  pocketGeo.setIndex(indices);
  pocketGeo.computeVertexNormals();

  const pocketMesh = new THREE.Mesh(pocketGeo);
  pocketMesh.name = 'Hoodie_Pocket';
  scene.add(pocketMesh);

  await exportScene(scene, 'public/models/tshirts/hoodie.glb');
}

async function main() {
  console.log('🔄 Building completely refined, flush Polo and Hoodie models...');
  await buildPoloModel();
  await buildHoodieModel();
  console.log('🎉 Refined Polo and Hoodie 3D models exported successfully!');
}

main().catch(console.error);
