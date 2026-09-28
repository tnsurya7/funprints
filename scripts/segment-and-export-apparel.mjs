globalThis.self = globalThis;
globalThis.window = globalThis;
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
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

/**
 * Splits an OBJ mesh into two distinct named sub-meshes:
 * 1. "Garment_Fabric" (takes the active product color)
 * 2. "Mannequin_Skin" (keeps natural body / skin tone)
 */
function splitMeshIntoGarmentAndBody(obj, isBodyVertexFn) {
  let originalMesh;
  obj.traverse((c) => { if (c.isMesh) originalMesh = c; });

  const geo = originalMesh.geometry;
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  const norm = geo.attributes.normal;

  const garmentPositions = [];
  const garmentNormals = [];
  const garmentUvs = [];

  const bodyPositions = [];
  const bodyNormals = [];
  const bodyUvs = [];

  // Iterate over triangles (every 3 vertices)
  for (let i = 0; i < pos.count; i += 3) {
    const x0 = pos.getX(i), y0 = pos.getY(i), z0 = pos.getZ(i);
    const x1 = pos.getX(i + 1), y1 = pos.getY(i + 1), z1 = pos.getZ(i + 1);
    const x2 = pos.getX(i + 2), y2 = pos.getY(i + 2), z2 = pos.getZ(i + 2);

    const b0 = isBodyVertexFn(x0, y0, z0);
    const b1 = isBodyVertexFn(x1, y1, z1);
    const b2 = isBodyVertexFn(x2, y2, z2);

    // If majority vertices are skin/body, classify triangle as Mannequin_Skin
    const isBodyTriangle = (b0 ? 1 : 0) + (b1 ? 1 : 0) + (b2 ? 1 : 0) >= 2;

    const targetPos = isBodyTriangle ? bodyPositions : garmentPositions;
    const targetNorm = isBodyTriangle ? bodyNormals : garmentNormals;
    const targetUv = isBodyTriangle ? bodyUvs : garmentUvs;

    for (let v = 0; v < 3; v++) {
      targetPos.push(pos.getX(i + v), pos.getY(i + v), pos.getZ(i + v));
      if (norm) {
        targetNorm.push(norm.getX(i + v), norm.getY(i + v), norm.getZ(i + v));
      }
      if (uv) {
        targetUv.push(uv.getX(i + v), uv.getY(i + v));
      }
    }
  }

  const resultGroup = new THREE.Group();

  // 1. Garment Fabric Mesh
  const garmentGeo = new THREE.BufferGeometry();
  garmentGeo.setAttribute('position', new THREE.Float32BufferAttribute(garmentPositions, 3));
  if (garmentNormals.length > 0) garmentGeo.setAttribute('normal', new THREE.Float32BufferAttribute(garmentNormals, 3));
  if (garmentUvs.length > 0) garmentGeo.setAttribute('uv', new THREE.Float32BufferAttribute(garmentUvs, 2));
  garmentGeo.computeVertexNormals();
  const garmentMesh = new THREE.Mesh(garmentGeo);
  garmentMesh.name = 'Garment_Fabric';
  garmentMesh.castShadow = true;
  garmentMesh.receiveShadow = true;
  resultGroup.add(garmentMesh);

  // 2. Mannequin Body Skin Mesh
  if (bodyPositions.length > 0) {
    const bodyGeo = new THREE.BufferGeometry();
    bodyGeo.setAttribute('position', new THREE.Float32BufferAttribute(bodyPositions, 3));
    if (bodyNormals.length > 0) bodyGeo.setAttribute('normal', new THREE.Float32BufferAttribute(bodyNormals, 3));
    if (bodyUvs.length > 0) bodyGeo.setAttribute('uv', new THREE.Float32BufferAttribute(bodyUvs, 2));
    bodyGeo.computeVertexNormals();
    const bodyMesh = new THREE.Mesh(bodyGeo);
    bodyMesh.name = 'Mannequin_Skin';
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    resultGroup.add(bodyMesh);
  }

  return resultGroup;
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
        console.log(`✓ Saved ${outputPath} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
        resolve();
      },
      (err) => reject(err),
      { binary: true }
    );
  });
}

// =========================================================================
// 1. PROCESS POLO SHIRT (Segment Shirt vs Neck/Arms/Hands)
// =========================================================================
async function processPoloModel() {
  console.log('🔄 Segmenting Polo model into Garment_Fabric and Mannequin_Skin...');
  const objPath = 'public/products/all tshirts/360/aae47529d41e4fe3b84c0a9676afc2bc/963e96db5dc32e83cb2e03da7bbbb83b.obj';
  const objText = fs.readFileSync(objPath, 'utf8');
  const loader = new OBJLoader();
  const rawObj = loader.parse(objText);

  // Center and normalize geometry scale (~0.62)
  const box = new THREE.Box3().setFromObject(rawObj);
  const size = new THREE.Vector3();
  box.getSize(size);
  const scale = 0.62 / (size.y || 1);

  rawObj.traverse((c) => {
    if (c.isMesh) {
      c.geometry.center();
      c.geometry.scale(scale, scale, scale);
    }
  });

  // Body vertex classifier for Polo (scaled coordinates: y in [-0.31, 0.31])
  const isPoloBody = (x, y, z) => {
    // Head / Neck: above collar (y > 0.14)
    const isHeadNeck = y > 0.145 || (y > 0.125 && Math.hypot(x, z) < 0.045 && z < 0.02);
    // Forearms / Hands: below short sleeve hem (y < 0.02 && |x| > 0.10)
    const isArmHand = Math.abs(x) > 0.105 && y < 0.015;
    return isHeadNeck || isArmHand;
  };

  const segmentedGroup = splitMeshIntoGarmentAndBody(rawObj, isPoloBody);
  const scene = new THREE.Scene();
  scene.add(segmentedGroup);

  await exportScene(scene, 'public/models/tshirts/polo.glb');
}

// =========================================================================
// 2. PROCESS HOODIE (Segment Hoodie Fabric vs Head/Neck/Hands)
// =========================================================================
async function processHoodieModel() {
  console.log('🔄 Segmenting Hoodie model into Garment_Fabric and Mannequin_Skin...');
  const objPath = 'e426a301ed9b43818b3863d175224298/5b434aa12d335763a34f3f4ac88866b3.obj';
  const objText = fs.readFileSync(objPath, 'utf8');
  const loader = new OBJLoader();
  const rawObj = loader.parse(objText);

  const box = new THREE.Box3().setFromObject(rawObj);
  const size = new THREE.Vector3();
  box.getSize(size);
  const scale = 0.62 / (size.y || 1);

  rawObj.traverse((c) => {
    if (c.isMesh) {
      c.geometry.center();
      c.geometry.scale(scale, scale, scale);
    }
  });

  // Body vertex classifier for Hoodie
  const isHoodieBody = (x, y, z) => {
    // Face / Head visible in hood opening
    const isFace = y > 0.14 && z > 0.03 && Math.abs(x) < 0.055;
    // Hands extending below long wrist cuffs
    const isHands = y < -0.26 && Math.abs(x) > 0.11;
    return isFace || isHands;
  };

  const segmentedGroup = splitMeshIntoGarmentAndBody(rawObj, isHoodieBody);
  const scene = new THREE.Scene();
  scene.add(segmentedGroup);

  await exportScene(scene, 'public/models/tshirts/hoodie.glb');
}

async function main() {
  await processPoloModel();
  await processHoodieModel();
  console.log('🎉 Models successfully segmented and exported with distinct garment and body meshes!');
}

main().catch(console.error);
