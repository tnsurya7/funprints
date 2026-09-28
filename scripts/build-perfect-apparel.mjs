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
// 1. PERFECT POLO SHIRT (Conformal Folded Wrap-Around Collar, Placket, Buttons)
// =========================================================================
async function buildPerfectPolo() {
  const gltf = await loadBaseShirt();
  const scene = gltf.scene;

  // 1. Front Button Placket (Center chest vertical strip)
  const placketGeo = new THREE.BoxGeometry(0.026, 0.10, 0.003, 4, 16, 1);
  placketGeo.rotateX(-0.12);
  placketGeo.translate(0, 0.140, 0.088);
  const placket = new THREE.Mesh(placketGeo);
  placket.name = 'Polo_Placket';
  scene.add(placket);

  // 2. Pearl Buttons
  for (let b = 0; b < 2; b++) {
    const btnGeo = new THREE.CylinderGeometry(0.0038, 0.0038, 0.002, 16);
    btnGeo.rotateX(Math.PI / 2 - 0.12);
    btnGeo.translate(0, 0.165 - b * 0.040, 0.091 + (b === 0 ? 0.005 : 0.0));
    const btn = new THREE.Mesh(btnGeo);
    btn.name = `Polo_Button_${b + 1}`;
    scene.add(btn);
  }

  // 3. Conformal Folded Collar (Ribbon following the natural neck contour)
  // Continuous path wrapping around the neckline
  const collarPath = [
    new THREE.Vector3(-0.018, 0.180, 0.085), // Left collar tip in front
    new THREE.Vector3(-0.048, 0.198, 0.075),
    new THREE.Vector3(-0.078, 0.222, 0.038),
    new THREE.Vector3(-0.076, 0.235, -0.020),
    new THREE.Vector3(-0.045, 0.244, -0.065),
    new THREE.Vector3(0.0, 0.246, -0.072),    // Center back
    new THREE.Vector3(0.045, 0.244, -0.065),
    new THREE.Vector3(0.076, 0.235, -0.020),
    new THREE.Vector3(0.078, 0.222, 0.038),
    new THREE.Vector3(0.048, 0.198, 0.075),
    new THREE.Vector3(0.018, 0.180, 0.085)  // Right collar tip in front
  ];

  const collarCurve = new THREE.CatmullRomCurve3(collarPath);
  const numSteps = 48;
  const collarGeo = new THREE.BufferGeometry();
  const cPositions = [];
  const cNormals = [];
  const cUvs = [];
  const cIndices = [];

  const collarWidth = 0.032; // Collar flap width

  for (let s = 0; s <= numSteps; s++) {
    const t = s / numSteps;
    const pt = collarCurve.getPoint(t);
    const tangent = collarCurve.getTangent(t);

    // Normal vector pointing outward and downward across chest/shoulders
    const outward = new THREE.Vector3(pt.x, -0.2, pt.z).normalize();
    if (pt.z > 0.02) {
      outward.y = -0.6; // drape down in front
      outward.z += 0.3;
    } else {
      outward.y = 0.2;  // rise slightly in back
    }
    outward.normalize();

    // Inner edge (at neck base)
    const pInner = pt.clone();
    // Outer folded edge (spreading onto shoulders / chest)
    const pOuter = pt.clone().addScaledVector(outward, collarWidth);

    cPositions.push(pInner.x, pInner.y, pInner.z);
    cPositions.push(pOuter.x, pOuter.y, pOuter.z);

    cNormals.push(0, 1, 0);
    cNormals.push(0, 1, 0);

    cUvs.push(t, 0);
    cUvs.push(t, 1);
  }

  for (let s = 0; s < numSteps; s++) {
    const a = s * 2;
    const b = s * 2 + 1;
    const c = (s + 1) * 2;
    const d = (s + 1) * 2 + 1;

    cIndices.push(a, b, d);
    cIndices.push(a, d, c);
  }

  collarGeo.setAttribute('position', new THREE.Float32BufferAttribute(cPositions, 3));
  collarGeo.setAttribute('normal', new THREE.Float32BufferAttribute(cNormals, 3));
  collarGeo.setAttribute('uv', new THREE.Float32BufferAttribute(cUvs, 2));
  collarGeo.setIndex(cIndices);
  collarGeo.computeVertexNormals();

  const collarMesh = new THREE.Mesh(collarGeo);
  collarMesh.name = 'Polo_Collar_Mesh';
  scene.add(collarMesh);

  await exportScene(scene, 'public/models/tshirts/polo.glb');
}

// =========================================================================
// 2. PERFECT FULL HAND HOODIE (Full Long Sleeves, Real Hood, Kangaroo Pocket, Drawstrings)
// =========================================================================
async function buildPerfectHoodie() {
  const gltf = await loadBaseShirt();
  const scene = gltf.scene;

  // 1. FULL HAND LONG SLEEVES (Seamless continuous sleeve extension to wrists)
  for (const side of [-1, 1]) {
    // Sleeve center line from short-sleeve opening down to wrist
    const sleeveCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.22, 0.055, -0.015), // Seamless connection at arm opening
      new THREE.Vector3(side * 0.24, -0.030, -0.005), // Mid bicep
      new THREE.Vector3(side * 0.25, -0.120, 0.010),  // Elbow
      new THREE.Vector3(side * 0.23, -0.210, 0.025),  // Forearm
      new THREE.Vector3(side * 0.20, -0.290, 0.035)   // Wrist
    ]);

    const numLongSegs = 36;
    const numRadial = 24;
    const longGeo = new THREE.BufferGeometry();
    const lPos = [];
    const lNorm = [];
    const lUvs = [];
    const lIdx = [];

    for (let is = 0; is <= numLongSegs; is++) {
      const prog = is / numLongSegs;
      const pt = sleeveCurve.getPoint(prog);
      const tangent = sleeveCurve.getTangent(prog);

      // Taper radius from upper arm (0.055) down to wrist (0.034)
      const radius = 0.055 - 0.021 * prog;

      // Coordinate frame along tangent
      const up = new THREE.Vector3(0, 0, 1);
      const normal = new THREE.Vector3().crossVectors(tangent, up).normalize();
      const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

      for (let ir = 0; ir <= numRadial; ir++) {
        const theta = (ir / numRadial) * Math.PI * 2;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        // Organic cloth folds along forearm and elbow
        let rOffset = radius;
        if (prog > 0.3 && prog < 0.85) {
          const wrinkle = Math.sin(prog * 18.0 + theta * 2.0) * 0.004;
          rOffset += wrinkle;
        }

        const vx = pt.x + (normal.x * cosT + binormal.x * sinT) * rOffset;
        const vy = pt.y + (normal.y * cosT + binormal.y * sinT) * rOffset;
        const vz = pt.z + (normal.z * cosT + binormal.z * sinT) * rOffset;

        lPos.push(vx, vy, vz);
        lNorm.push(normal.x * cosT, normal.y * sinT, normal.z * cosT);
        lUvs.push(ir / numRadial, prog);
      }
    }

    for (let is = 0; is < numLongSegs; is++) {
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
      new THREE.Vector3(side * 0.20, -0.290, 0.035),
      new THREE.Vector3(side * 0.19, -0.325, 0.040)
    ]);
    const wristCuffGeo = new THREE.TubeGeometry(cuffCurve, 6, 0.033, 20, false);
    const wristCuff = new THREE.Mesh(wristCuffGeo);
    wristCuff.name = `Hoodie_Cuff_${side > 0 ? 'Right' : 'Left'}`;
    scene.add(wristCuff);
  }

  // 2. REALISTIC DRAPED 3D HOOD (Over upper shoulders & around neck)
  // Parametric open hood cavity
  const hoodGeo = new THREE.BufferGeometry();
  const hCols = 28;
  const hRows = 20;
  const hPos = [];
  const hUvs = [];
  const hIdx = [];

  for (let r = 0; r <= hRows; r++) {
    const v = r / hRows; // 0 at neck rim, 1 at hood peak
    const y = 0.215 + v * 0.12;
    const zBack = -0.06 - v * 0.08;
    const width = 0.075 + 0.035 * Math.sin(v * Math.PI);

    for (let c = 0; c <= hCols; c++) {
      const u = c / hCols;
      // Arc around back of head/neck from left cheek (-X) around back (-Z) to right cheek (+X)
      const phi = (u - 0.5) * Math.PI * 1.35;
      const x = Math.sin(phi) * width;
      const z = zBack + Math.cos(phi) * width * 0.85;

      hPos.push(x, y, z);
      hUvs.push(u, v);
    }
  }

  for (let r = 0; r < hRows; r++) {
    for (let c = 0; c < hCols; c++) {
      const a = r * (hCols + 1) + c;
      const b = (r + 1) * (hCols + 1) + c;
      const d = (r + 1) * (hCols + 1) + (c + 1);
      const e = r * (hCols + 1) + (c + 1);

      hIdx.push(a, b, e);
      hIdx.push(b, d, e);
    }
  }

  hoodGeo.setAttribute('position', new THREE.Float32BufferAttribute(hPos, 3));
  hoodGeo.setAttribute('uv', new THREE.Float32BufferAttribute(hUvs, 2));
  hoodGeo.setIndex(hIdx);
  hoodGeo.computeVertexNormals();

  const hoodMesh = new THREE.Mesh(hoodGeo);
  hoodMesh.name = 'Hoodie_Hood';
  scene.add(hoodMesh);

  // 3. Hanging Braided Drawstrings & Metallic Aglets
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

    // Aglet
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
  console.log('🚀 Building authentic Full-Hand Hoodie and Conformal Polo models...');
  await buildPerfectPolo();
  await buildPerfectHoodie();
  console.log('🎉 Perfect Polo and Full-Hand Hoodie models exported successfully!');
}

main().catch(console.error);
