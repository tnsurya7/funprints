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

async function main() {
  console.log('🔄 Preparing high-quality garment models from realistic base mesh...');

  // 1. Round Neck / Default T-shirt
  const roundGltf = await loadBaseShirt();
  const roundScene = roundGltf.scene;
  await exportScene(roundScene, 'public/models/tshirt.glb');
  await exportScene(roundScene, 'public/models/tshirts/round-neck.glb');

  // 2. V-Neck T-shirt (Sculpt front neckline into V-shape)
  const vNeckGltf = await loadBaseShirt();
  const vNeckScene = vNeckGltf.scene;
  vNeckScene.traverse((child) => {
    if (child.isMesh) {
      const geo = child.geometry.clone();
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);

        // Target front neckline region (y > 0.12, z > 0.04, |x| < 0.12)
        if (y > 0.12 && z > 0.04 && Math.abs(x) < 0.12) {
          const centerDist = Math.abs(x) / 0.12; // 0 at center, 1 at edge
          const vDrop = (1.0 - Math.pow(centerDist, 1.2)) * 0.075;
          pos.setY(i, y - vDrop);
          pos.setZ(i, z - (1.0 - centerDist) * 0.015);
        }
      }
      geo.computeVertexNormals();
      child.geometry = geo;
    }
  });
  await exportScene(vNeckScene, 'public/models/tshirts/v-neck.glb');

  // 3. Polo T-shirt
  const poloGltf = await loadBaseShirt();
  const poloScene = poloGltf.scene;
  await exportScene(poloScene, 'public/models/tshirts/polo.glb');

  console.log('🎉 High-quality T-shirt models generated successfully!');
}

main().catch(console.error);
