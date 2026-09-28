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
// 1. REALISTIC POLO SHIRT (True Wrapped Collar, Center Placket, Pearl Buttons)
// =========================================================================
async function buildPoloModel() {
  const gltf = await loadBaseShirt();
  const scene = gltf.scene;

  // 1. Placket (Central rectangular button band embedded on the chest)
  const placketGeo = new THREE.BoxGeometry(0.024, 0.085, 0.003, 4, 12, 1);
  placketGeo.rotateX(-0.16); // Follow chest angle
  placketGeo.translate(0, 0.145, 0.088);
  const placketMesh = new THREE.Mesh(placketGeo);
  placketMesh.name = 'Polo_Placket';
  scene.add(placketMesh);

  // 2. Buttons
  for (let b = 0; b < 2; b++) {
    const btnGeo = new THREE.CylinderGeometry(0.0032, 0.0032, 0.002, 16);
    btnGeo.rotateX(Math.PI / 2 - 0.16);
    btnGeo.translate(0, 0.165 - b * 0.035, 0.091);
    const btnMesh = new THREE.Mesh(btnGeo);
    btnMesh.name = `Polo_Button_${b + 1}`;
    scene.add(btnMesh);
  }

  // 3. Real Polo Collar: Formed by an elliptical folded ring resting directly on collarbone/neck
  const collarCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.012, 0.190, 0.082), // Left front tip
    new THREE.Vector3(-0.045, 0.205, 0.072), // Left front spread
    new THREE.Vector3(-0.072, 0.222, 0.035), // Left shoulder fold
    new THREE.Vector3(-0.068, 0.235, -0.025),// Left back
    new THREE.Vector3(0.0, 0.240, -0.055),   // Center back neck
    new THREE.Vector3(0.068, 0.235, -0.025), // Right back
    new THREE.Vector3(0.072, 0.222, 0.035),  // Right shoulder fold
    new THREE.Vector3(0.045, 0.205, 0.072),  // Right front spread
    new THREE.Vector3(0.012, 0.190, 0.082)   // Right front tip
  ]);

  // Collar geometry with subtle thickness that lies flat against the body
  const collarGeo = new THREE.TubeGeometry(collarCurve, 40, 0.010, 10, false);
  collarGeo.scale(1.05, 0.65, 1.05); // Flattens the tube into a realistic folded fabric band
  const collarMesh = new THREE.Mesh(collarGeo);
  collarMesh.name = 'Polo_Collar_Mesh';
  scene.add(collarMesh);

  await exportScene(scene, 'public/models/tshirts/polo.glb');
}

// =========================================================================
// 2. REALISTIC FULL-HAND HOODIE (Full Sleeves, Real Hood, Pocket, Cords)
// =========================================================================
async function buildHoodieModel() {
  const gltf = await loadBaseShirt();
  const scene = gltf.scene;

  // 1. FULL-HAND (LONG) SLEEVES (Seamless extension from shoulder to wrists)
  for (const side of [-1, 1]) {
    // Continuous natural sleeve path from armhole down to wrist
    const sleeveCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.215, 0.060, -0.015),
      new THREE.Vector3(side * 0.240, -0.025, -0.005),
      new THREE.Vector3(side * 0.245, -0.115, 0.010),
      new THREE.Vector3(side * 0.230, -0.205, 0.022),
      new THREE.Vector3(side * 0.200, -0.285, 0.030)
    ]);

    const numSegs = 32;
    const numRadial = 24;
    const sGeo = new THREE.BufferGeometry();
    const pos = [];
    const norm = [];
    const uvs = [];
    const idx = [];

    for (let is = 0; is <= numSegs; is++) {
      const prog = is / numSegs;
      const pt = sleeveCurve.getPoint(prog);
      const tangent = sleeveCurve.getTangent(prog);

      // Taper radius from upper bicep (0.054) down to wrist (0.033)
      const radius = 0.054 - 0.021 * prog;

      const up = new THREE.Vector3(0, 0, 1);
      const normal = new THREE.Vector3().crossVectors(tangent, up).normalize();
      const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

      for (let ir = 0; ir <= numRadial; ir++) {
        const theta = (ir / numRadial) * Math.PI * 2;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        // Natural organic wrinkles
        let r = radius;
        if (prog > 0.25 && prog < 0.85) {
          const wrinkle = Math.sin(prog * 16.0 + theta * 2.0) * 0.0035;
          r += wrinkle;
        }

        const vx = pt.x + (normal.x * cosT + binormal.x * sinT) * r;
        const vy = pt.y + (normal.y * cosT + binormal.y * sinT) * r;
        const vz = pt.z + (normal.z * cosT + binormal.z * sinT) * r;

        pos.push(vx, vy, vz);
        norm.push(normal.x * cosT, normal.y * sinT, normal.z * cosT);
        uvs.push(ir / numRadial, prog);
      }
    }

    for (let is = 0; is < numSegs; is++) {
      for (let ir = 0; ir < numRadial; ir++) {
        const a = is * (numRadial + 1) + ir;
        const b = (is + 1) * (numRadial + 1) + ir;
        const c = (is + 1) * (numRadial + 1) + (ir + 1);
        const d = is * (numRadial + 1) + (ir + 1);

        idx.push(a, b, d);
        idx.push(b, c, d);
      }
    }

    sGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    sGeo.setAttribute('normal', new THREE.Float32BufferAttribute(norm, 3));
    sGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    sGeo.setIndex(idx);
    sGeo.computeVertexNormals();

    const sleeveMesh = new THREE.Mesh(sGeo);
    sleeveMesh.name = `Hoodie_LongSleeve_${side > 0 ? 'Right' : 'Left'}`;
    scene.add(sleeveMesh);

    // Ribbed Wrist Cuff
    const cuffCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.200, -0.285, 0.030),
      new THREE.Vector3(side * 0.190, -0.320, 0.035)
    ]);
    const cuffGeo = new THREE.TubeGeometry(cuffCurve, 6, 0.032, 20, false);
    const cuffMesh = new THREE.Mesh(cuffGeo);
    cuffMesh.name = `Hoodie_Cuff_${side > 0 ? 'Right' : 'Left'}`;
    scene.add(cuffMesh);
  }

  // 2. REALISTIC 3D HOOD (Smooth fabric draped cowl over shoulders & back of neck)
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
  console.log('🚀 Regenerating authentic, clean Polo and Full-Hand Hoodie models...');
  await buildPoloModel();
  await buildHoodieModel();
  console.log('🎉 Models exported successfully!');
}

main().catch(console.error);
