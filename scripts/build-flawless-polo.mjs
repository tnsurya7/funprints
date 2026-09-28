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

/**
 * Creates a smooth, continuous 3D Polo Folded Collar mesh
 */
function createPoloCollar() {
  // We construct a parametric grid for the collar leaf (outer folded blade)
  // u goes from 0 (Left collar tip) -> 0.5 (Center back) -> 1.0 (Right collar tip)
  // v goes from 0 (Neck seam / fold line) -> 1.0 (Outer edge / tip)
  
  const segmentsU = 48;
  const segmentsV = 16;
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  // Curve defining the neck fold baseline from left placket around back to right placket
  const foldPoints = [
    new THREE.Vector3(-0.016, 0.175, 0.082), // Left front placket
    new THREE.Vector3(-0.048, 0.198, 0.065), // Left front curve
    new THREE.Vector3(-0.075, 0.222, 0.015), // Left shoulder
    new THREE.Vector3(-0.055, 0.234, -0.045),// Left back
    new THREE.Vector3(0.000, 0.238, -0.065), // Center back
    new THREE.Vector3(0.055, 0.234, -0.045), // Right back
    new THREE.Vector3(0.075, 0.222, 0.015),  // Right shoulder
    new THREE.Vector3(0.048, 0.198, 0.065),  // Right front curve
    new THREE.Vector3(0.016, 0.175, 0.082)   // Right front placket
  ];
  const foldCurve = new THREE.CatmullRomCurve3(foldPoints);

  // Curve defining the outer edge of the turned-down collar
  const outerPoints = [
    new THREE.Vector3(-0.035, 0.138, 0.092), // Left sharp collar tip
    new THREE.Vector3(-0.072, 0.168, 0.078), // Left outer front
    new THREE.Vector3(-0.098, 0.205, 0.018), // Left outer shoulder
    new THREE.Vector3(-0.072, 0.222, -0.058),// Left outer back
    new THREE.Vector3(0.000, 0.226, -0.082), // Center outer back
    new THREE.Vector3(0.072, 0.222, -0.058), // Right outer back
    new THREE.Vector3(0.098, 0.205, 0.018),  // Right outer shoulder
    new THREE.Vector3(0.072, 0.168, 0.078),  // Right outer front
    new THREE.Vector3(0.035, 0.138, 0.092)   // Right sharp collar tip
  ];
  const outerCurve = new THREE.CatmullRomCurve3(outerPoints);

  for (let iv = 0; iv <= segmentsV; iv++) {
    const v = iv / segmentsV;
    for (let iu = 0; iu <= segmentsU; iu++) {
      const u = iu / segmentsU;

      const pFold = foldCurve.getPoint(u);
      const pOuter = outerCurve.getPoint(u);

      // Lerp from fold line to outer edge with a natural cloth curve (slight outward bulge)
      const arch = Math.sin(v * Math.PI) * 0.004;
      const x = THREE.MathUtils.lerp(pFold.x, pOuter.x, v) + Math.sign(pFold.x || 1) * arch * 0.5;
      const y = THREE.MathUtils.lerp(pFold.y, pOuter.y, v);
      const z = THREE.MathUtils.lerp(pFold.z, pOuter.z, v) + arch;

      positions.push(x, y, z);
      uvs.push(u, v);
    }
  }

  for (let iv = 0; iv < segmentsV; iv++) {
    for (let iu = 0; iu < segmentsU; iu++) {
      const a = iv * (segmentsU + 1) + iu;
      const b = (iv + 1) * (segmentsU + 1) + iu;
      const c = (iv + 1) * (segmentsU + 1) + (iu + 1);
      const d = iv * (segmentsU + 1) + (iu + 1);

      // Top side
      indices.push(a, b, d);
      indices.push(b, c, d);
      // Under side (double-sided appearance with correct winding)
      indices.push(d, b, a);
      indices.push(d, c, b);
    }
  }

  const collarGeo = new THREE.BufferGeometry();
  collarGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  collarGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  collarGeo.setIndex(indices);
  collarGeo.computeVertexNormals();

  const collarMesh = new THREE.Mesh(collarGeo);
  collarMesh.name = 'Polo_Collar';
  collarMesh.castShadow = true;
  collarMesh.receiveShadow = true;

  return collarMesh;
}

/**
 * Creates the inner Collar Stand Band (the upright collar band inside the neck)
 */
function createCollarStand() {
  const standPoints = [
    new THREE.Vector3(-0.016, 0.175, 0.082),
    new THREE.Vector3(-0.048, 0.198, 0.065),
    new THREE.Vector3(-0.075, 0.222, 0.015),
    new THREE.Vector3(-0.055, 0.234, -0.045),
    new THREE.Vector3(0.000, 0.238, -0.065),
    new THREE.Vector3(0.055, 0.234, -0.045),
    new THREE.Vector3(0.075, 0.222, 0.015),
    new THREE.Vector3(0.048, 0.198, 0.065),
    new THREE.Vector3(0.016, 0.175, 0.082)
  ];
  const curve = new THREE.CatmullRomCurve3(standPoints);
  const standGeo = new THREE.TubeGeometry(curve, 32, 0.006, 12, false);
  standGeo.scale(1.0, 1.3, 1.0);
  const standMesh = new THREE.Mesh(standGeo);
  standMesh.name = 'Polo_Collar_Stand';
  return standMesh;
}

/**
 * Creates the 3-button front Polo Placket
 */
function createPoloPlacket() {
  const group = new THREE.Group();

  // 1. Placket Fabric Strip (double layer fabric with slight bevel)
  const placketWidth = 0.026;
  const placketHeight = 0.115;
  const placketGeo = new THREE.BoxGeometry(placketWidth, placketHeight, 0.004, 4, 16, 1);
  // Conform to chest slope
  placketGeo.rotateX(-0.15);
  placketGeo.translate(0, 0.125, 0.086);
  const placketMesh = new THREE.Mesh(placketGeo);
  placketMesh.name = 'Polo_Placket';
  group.add(placketMesh);

  // 2. Pearl Buttons (2 fastened, 1 top open or 2 classic buttons)
  const btnPositions = [
    { y: 0.160, z: 0.091, name: 'Polo_Button_1' },
    { y: 0.125, z: 0.086, name: 'Polo_Button_2' },
    { y: 0.090, z: 0.081, name: 'Polo_Button_3' }
  ];

  for (const btn of btnPositions) {
    const btnGeo = new THREE.CylinderGeometry(0.0036, 0.0036, 0.002, 18);
    btnGeo.rotateX(Math.PI / 2 - 0.15);
    btnGeo.translate(0, btn.y, btn.z + 0.002);
    const btnMesh = new THREE.Mesh(btnGeo);
    btnMesh.name = btn.name;
    group.add(btnMesh);
  }

  return group;
}

/**
 * Creates ribbed knit sleeve cuffs
 */
function createSleeveCuffs() {
  const group = new THREE.Group();
  for (const side of [-1, 1]) {
    const cuffCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.220, 0.052, -0.016),
      new THREE.Vector3(side * 0.246, 0.035, 0.006)
    ]);
    const cuffGeo = new THREE.TubeGeometry(cuffCurve, 12, 0.054, 24, false);
    const cuffMesh = new THREE.Mesh(cuffGeo);
    cuffMesh.name = `Polo_Cuff_${side > 0 ? 'Right' : 'Left'}`;
    group.add(cuffMesh);
  }
  return group;
}

async function buildFlawlessPolo() {
  console.log('🌟 Building photorealistic Polo T-Shirt 3D model...');
  const gltf = await loadBaseShirt();
  const scene = gltf.scene;

  // Modify base shirt geometry neck line slightly to fit polo placket and collar perfectly
  scene.traverse((child) => {
    if (child.isMesh) {
      child.name = 'Garment_Fabric';
      child.geometry = child.geometry.clone();
      const pos = child.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);

        // Lower the center front neck rim so the placket sits flush into the chest
        if (y > 0.17 && y < 0.23 && z > 0.05 && Math.abs(x) < 0.03) {
          pos.setY(i, y - 0.022);
          pos.setZ(i, z - 0.005);
        }
      }
      child.geometry.computeVertexNormals();
    }
  });

  // Add the polo elements
  scene.add(createPoloCollar());
  scene.add(createCollarStand());
  scene.add(createPoloPlacket());
  scene.add(createSleeveCuffs());

  await exportScene(scene, 'public/models/tshirts/polo.glb');
  console.log('✅ Flawless Polo T-Shirt model exported successfully to public/models/tshirts/polo.glb');
}

buildFlawlessPolo().catch(console.error);
