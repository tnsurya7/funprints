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
// 1. REPRODUCE TRIPO STUDIO POLO T-SHIRT (Structured Collar, Open Placket, Ribbed Cuffs)
// =========================================================================
async function buildPoloModelFromReference() {
  const gltf = await loadBaseShirt();
  const scene = gltf.scene;

  // Open up the front neck on the base shirt slightly to accommodate the polo placket
  scene.traverse((child) => {
    if (child.isMesh) {
      child.geometry = child.geometry.clone();
      const pos = child.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);
        // Soften center neck rim so placket and collar blend in seamlessly
        if (y > 0.18 && y < 0.24 && z > 0.05 && Math.abs(x) < 0.035) {
          pos.setY(i, y - 0.025);
          pos.setZ(i, z - 0.008);
        }
      }
      child.geometry.computeVertexNormals();
    }
  });

  // 1. Center Placket (Structured double-fold fabric placket running down center chest)
  const placketGeo = new THREE.BoxGeometry(0.028, 0.11, 0.004, 4, 16, 1);
  placketGeo.rotateX(-0.16); // Conform to chest angle
  placketGeo.translate(0, 0.138, 0.088);
  const placketMesh = new THREE.Mesh(placketGeo);
  placketMesh.name = 'Polo_Placket';
  scene.add(placketMesh);

  // 2. Pearl Buttons (2 buttons matching reference photo)
  // Top button undone slightly, lower button fastened
  const btn1Geo = new THREE.CylinderGeometry(0.0035, 0.0035, 0.002, 16);
  btn1Geo.rotateX(Math.PI / 2 - 0.16);
  btn1Geo.translate(0.004, 0.168, 0.093);
  const btn1 = new THREE.Mesh(btn1Geo);
  btn1.name = 'Polo_Button_1';
  scene.add(btn1);

  const btn2Geo = new THREE.CylinderGeometry(0.0035, 0.0035, 0.002, 16);
  btn2Geo.rotateX(Math.PI / 2 - 0.16);
  btn2Geo.translate(0, 0.125, 0.085);
  const btn2 = new THREE.Mesh(btn2Geo);
  btn2.name = 'Polo_Button_2';
  scene.add(btn2);

  // 3. STRUCTURED TURN-DOWN POLO COLLAR (Modeled directly after Tripo Studio reference)
  // Left Collar Wing (Triangular folded collar leaf spreading over left collarbone)
  const leftWingGeo = new THREE.BufferGeometry();
  const lPos = [
    // Neck band root points
    0.0, 0.238, -0.065,      // 0: Center back
    -0.055, 0.232, -0.035,   // 1: Left back neck
    -0.078, 0.218, 0.025,    // 2: Left shoulder seam
    -0.052, 0.198, 0.072,    // 3: Left front neck
    -0.010, 0.185, 0.086,    // 4: Left front placket corner
    
    // Outer folded collar tip points (spreading outward & downward over chest)
    0.0, 0.248, -0.080,      // 5: Outer center back
    -0.070, 0.238, -0.045,   // 6: Outer left back
    -0.095, 0.216, 0.020,    // 7: Outer left shoulder fold
    -0.075, 0.178, 0.080,    // 8: Outer left spread
    -0.024, 0.150, 0.096     // 9: Outer left collar tip (sharp point over chest)
  ];

  const lIndices = [
    0, 5, 6,  0, 6, 1,
    1, 6, 7,  1, 7, 2,
    2, 7, 8,  2, 8, 3,
    3, 8, 9,  3, 9, 4
  ];

  const lUvs = [
    0.0, 0.0,  0.25, 0.0,  0.5, 0.0,  0.75, 0.0,  1.0, 0.0,
    0.0, 1.0,  0.25, 1.0,  0.5, 1.0,  0.75, 1.0,  1.0, 1.0
  ];

  leftWingGeo.setAttribute('position', new THREE.Float32BufferAttribute(lPos, 3));
  leftWingGeo.setAttribute('uv', new THREE.Float32BufferAttribute(lUvs, 2));
  leftWingGeo.setIndex(lIndices);
  leftWingGeo.computeVertexNormals();

  const leftWing = new THREE.Mesh(leftWingGeo);
  leftWing.name = 'Polo_Collar_Left';
  scene.add(leftWing);

  // Right Collar Wing (Mirror of left collar wing)
  const rightWingGeo = new THREE.BufferGeometry();
  const rPos = [
    // Neck band root points
    0.0, 0.238, -0.065,      // 0: Center back
    0.055, 0.232, -0.035,    // 1: Right back neck
    0.078, 0.218, 0.025,     // 2: Right shoulder seam
    0.052, 0.198, 0.072,     // 3: Right front neck
    0.010, 0.185, 0.086,     // 4: Right front placket corner
    
    // Outer folded collar tip points
    0.0, 0.248, -0.080,      // 5: Outer center back
    0.070, 0.238, -0.045,    // 6: Outer right back
    0.095, 0.216, 0.020,     // 7: Outer right shoulder fold
    0.075, 0.178, 0.080,     // 8: Outer right spread
    0.024, 0.150, 0.096      // 9: Outer right collar tip
  ];

  const rIndices = [
    0, 6, 5,  0, 1, 6,
    1, 7, 6,  1, 2, 7,
    2, 8, 7,  2, 3, 8,
    3, 9, 8,  3, 4, 9
  ];

  const rUvs = [
    0.0, 0.0,  0.25, 0.0,  0.5, 0.0,  0.75, 0.0,  1.0, 0.0,
    0.0, 1.0,  0.25, 1.0,  0.5, 1.0,  0.75, 1.0,  1.0, 1.0
  ];

  rightWingGeo.setAttribute('position', new THREE.Float32BufferAttribute(rPos, 3));
  rightWingGeo.setAttribute('uv', new THREE.Float32BufferAttribute(rUvs, 2));
  rightWingGeo.setIndex(rIndices);
  rightWingGeo.computeVertexNormals();

  const rightWing = new THREE.Mesh(rightWingGeo);
  rightWing.name = 'Polo_Collar_Right';
  scene.add(rightWing);

  // 4. Ribbed Sleeve Cuffs (Seamless knit cuff band at the end of each short sleeve)
  for (const side of [-1, 1]) {
    const cuffCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.222, 0.055, -0.018),
      new THREE.Vector3(side * 0.248, 0.038, 0.005)
    ]);
    const cuffGeo = new THREE.TubeGeometry(cuffCurve, 8, 0.056, 24, false);
    const cuffMesh = new THREE.Mesh(cuffGeo);
    cuffMesh.name = `Polo_Cuff_${side > 0 ? 'Right' : 'Left'}`;
    scene.add(cuffMesh);
  }

  await exportScene(scene, 'public/models/tshirts/polo.glb');
}

// =========================================================================
// 2. REALISTIC FULL-HAND HOODIE (Full Long Sleeves, Draped Hood, Kangaroo Pocket, Cords)
// =========================================================================
async function buildHoodieModelFromReference() {
  const gltf = await loadBaseShirt();
  const scene = gltf.scene;

  // 1. FULL LONG SLEEVES (Seamless anatomically curved full-length sleeves to wrists)
  for (const side of [-1, 1]) {
    const sleeveCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.218, 0.058, -0.015), // Seamless armhole connection
      new THREE.Vector3(side * 0.245, -0.028, -0.005), // Mid bicep
      new THREE.Vector3(side * 0.252, -0.118, 0.010),  // Elbow
      new THREE.Vector3(side * 0.235, -0.210, 0.025),  // Forearm
      new THREE.Vector3(side * 0.200, -0.290, 0.032)   // Wrist
    ]);

    const numSegs = 36;
    const numRadial = 24;
    const longGeo = new THREE.BufferGeometry();
    const lPos = [];
    const lNorm = [];
    const lUvs = [];
    const lIdx = [];

    for (let is = 0; is <= numSegs; is++) {
      const prog = is / numSegs;
      const pt = sleeveCurve.getPoint(prog);
      const tangent = sleeveCurve.getTangent(prog);

      // Natural taper from upper arm (0.055) down to wrist (0.033)
      const radius = 0.055 - 0.022 * prog;

      const up = new THREE.Vector3(0, 0, 1);
      const normal = new THREE.Vector3().crossVectors(tangent, up).normalize();
      const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

      for (let ir = 0; ir <= numRadial; ir++) {
        const theta = (ir / numRadial) * Math.PI * 2;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        // Organic cloth folds along forearm and elbow
        let r = radius;
        if (prog > 0.25 && prog < 0.85) {
          const fold = Math.sin(prog * 18.0 + theta * 2.0) * 0.0038;
          r += fold;
        }

        const vx = pt.x + (normal.x * cosT + binormal.x * sinT) * r;
        const vy = pt.y + (normal.y * cosT + binormal.y * sinT) * r;
        const vz = pt.z + (normal.z * cosT + binormal.z * sinT) * r;

        lPos.push(vx, vy, vz);
        lNorm.push(normal.x * cosT, normal.y * sinT, normal.z * cosT);
        lUvs.push(ir / numRadial, prog);
      }
    }

    for (let is = 0; is < numSegs; is++) {
      for (let ir = 0; ir < numRadial; ir++) {
        const a = is * (numRadial + 1) + ir;
        const b = (is + 1) * (numRadial + 1) + ir;
        const c = (is + 1) * (numRadial + 1) + (ir + 1);
        const d = is * (numRadial + 1) + (ir + 1);

        lIdx.push(a, b, d);
        lIdx.push(b, c, d);
      }
    }

    longGeo.setAttribute('position', new THREE.Float32BufferAttribute(lPos, 3));
    longGeo.setAttribute('normal', new THREE.Float32BufferAttribute(lNorm, 3));
    longGeo.setAttribute('uv', new THREE.Float32BufferAttribute(lUvs, 2));
    longGeo.setIndex(lIdx);
    longGeo.computeVertexNormals();

    const longMesh = new THREE.Mesh(longGeo);
    longMesh.name = `Hoodie_LongSleeve_${side > 0 ? 'Right' : 'Left'}`;
    scene.add(longMesh);

    // Ribbed Wrist Cuff (Double-stitched thick knit cuff at wrist)
    const cuffCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.200, -0.290, 0.032),
      new THREE.Vector3(side * 0.190, -0.325, 0.038)
    ]);
    const wristCuffGeo = new THREE.TubeGeometry(cuffCurve, 6, 0.032, 20, false);
    const wristCuff = new THREE.Mesh(wristCuffGeo);
    wristCuff.name = `Hoodie_Cuff_${side > 0 ? 'Right' : 'Left'}`;
    scene.add(wristCuff);
  }

  // 2. REALISTIC 3D DRAPED HOOD (Smooth organic cowl that drapes over upper back and shoulders)
  const hoodCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.065, 0.205, 0.065),
    new THREE.Vector3(-0.082, 0.218, 0.010),
    new THREE.Vector3(-0.065, 0.228, -0.055),
    new THREE.Vector3(0.0, 0.232, -0.075),
    new THREE.Vector3(0.065, 0.228, -0.055),
    new THREE.Vector3(0.082, 0.218, 0.010),
    new THREE.Vector3(0.065, 0.205, 0.065)
  ]);
  const hoodCowlGeo = new THREE.TubeGeometry(hoodCurve, 32, 0.024, 16, false);
  hoodCowlGeo.scale(1.05, 0.85, 1.15);
  const hoodCowlMesh = new THREE.Mesh(hoodCowlGeo);
  hoodCowlMesh.name = 'Hoodie_Hood';
  scene.add(hoodCowlMesh);

  // 3. Hanging Braided Drawstrings & Silver Aglets
  for (const side of [-1, 1]) {
    const strCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.024, 0.205, 0.082),
      new THREE.Vector3(side * 0.028, 0.150, 0.090),
      new THREE.Vector3(side * 0.026, 0.090, 0.093),
      new THREE.Vector3(side * 0.022, 0.035, 0.090)
    ]);
    const strGeo = new THREE.TubeGeometry(strCurve, 16, 0.0022, 8, false);
    const strMesh = new THREE.Mesh(strGeo);
    strMesh.name = `Hoodie_Drawstring_${side > 0 ? 'Right' : 'Left'}`;
    scene.add(strMesh);

    const agletGeo = new THREE.CylinderGeometry(0.0028, 0.0028, 0.010, 12);
    agletGeo.translate(side * 0.022, 0.030, 0.090);
    const aglet = new THREE.Mesh(agletGeo);
    aglet.name = `Hoodie_Aglet_${side > 0 ? 'Right' : 'Left'}`;
    scene.add(aglet);
  }

  // 4. Front Kangaroo Pouch Pocket
  const pocketGeo = new THREE.BufferGeometry();
  const pCols = 24;
  const pRows = 16;
  const pPos = [];
  const pUvs = [];
  const pIdx = [];

  const pYMin = -0.28;
  const pYMax = -0.12;

  for (let r = 0; r <= pRows; r++) {
    const v = r / pRows;
    const y = pYMin + v * (pYMax - pYMin);

    for (let c = 0; c <= pCols; c++) {
      const u = c / pCols;
      const widthFactor = 0.20 * (1.0 - 0.20 * v);
      const x = (u - 0.5) * widthFactor;
      const zCurv = (1.0 - Math.pow((u - 0.5) * 2, 2)) * 0.016;
      const z = 0.096 + zCurv;

      pPos.push(x, y, z);
      pUvs.push(u, v);
    }
  }

  for (let r = 0; r < pRows; r++) {
    for (let c = 0; c < pCols; c++) {
      const a = r * (pCols + 1) + c;
      const b = (r + 1) * (pCols + 1) + c;
      const d = (r + 1) * (pCols + 1) + (c + 1);
      const e = r * (pCols + 1) + (c + 1);

      pIdx.push(a, b, e);
      pIdx.push(b, d, e);
    }
  }

  pocketGeo.setAttribute('position', new THREE.Float32BufferAttribute(pPos, 3));
  pocketGeo.setAttribute('uv', new THREE.Float32BufferAttribute(pUvs, 2));
  pocketGeo.setIndex(pIdx);
  pocketGeo.computeVertexNormals();

  const pocketMesh = new THREE.Mesh(pocketGeo);
  pocketMesh.name = 'Hoodie_Pocket';
  scene.add(pocketMesh);

  await exportScene(scene, 'public/models/tshirts/hoodie.glb');
}

async function main() {
  console.log('🚀 Building Tripo Studio-matched Polo and Full-Hand Hoodie models...');
  await buildPoloModelFromReference();
  await buildHoodieModelFromReference();
  console.log('🎉 Models exported successfully!');
}

main().catch(console.error);
