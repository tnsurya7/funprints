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

async function convertUserHoodie() {
  console.log('🔄 Loading user AI-sculpted hoodie OBJ from e426a301ed9b43818b3863d175224298...');
  const objPath = path.resolve('e426a301ed9b43818b3863d175224298/5b434aa12d335763a34f3f4ac88866b3.obj');
  const objText = fs.readFileSync(objPath, 'utf8');

  const loader = new OBJLoader();
  const obj = loader.parse(objText);

  // Center and normalize geometry
  const box = new THREE.Box3().setFromObject(obj);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);

  console.log('Original size:', size);
  console.log('Original center:', center);

  // Normalize scale to standard garment height (~0.62 to match base shirt coordinate system)
  const targetHeight = 0.62;
  const scale = targetHeight / (size.y || 1);

  obj.traverse((child) => {
    if (child.isMesh) {
      child.geometry = child.geometry.clone();
      child.geometry.center();
      child.geometry.scale(scale, scale, scale);
      child.geometry.computeVertexNormals();
      child.castShadow = true;
      child.receiveShadow = true;
      child.name = 'Hoodie_Body';
    }
  });

  const scene = new THREE.Scene();
  scene.add(obj);

  const exporter = new GLTFExporter();
  const outputPath = path.resolve('public/models/tshirts/hoodie.glb');

  await new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (gltf) => {
        const buffer = Buffer.from(gltf);
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, buffer);
        console.log(`✓ Successfully exported user AI hoodie model: ${outputPath} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
        resolve();
      },
      (err) => reject(err),
      { binary: true }
    );
  });
}

convertUserHoodie().catch(console.error);
