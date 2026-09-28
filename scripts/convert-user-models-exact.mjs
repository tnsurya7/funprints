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

async function exportToGLB(scene, outputPath) {
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

// 1. CONVERT USER POLO OBJ
async function convertUserPolo() {
  console.log('🔄 Converting User Polo OBJ to GLB...');
  const objPath = path.resolve('public/products/all tshirts/360/aae47529d41e4fe3b84c0a9676afc2bc/963e96db5dc32e83cb2e03da7bbbb83b.obj');
  const objText = fs.readFileSync(objPath, 'utf8');

  const loader = new OBJLoader();
  const obj = loader.parse(objText);

  // Normalize scale and center
  const box = new THREE.Box3().setFromObject(obj);
  const size = new THREE.Vector3();
  box.getSize(size);
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
      child.name = 'Garment_Fabric';
    }
  });

  const scene = new THREE.Scene();
  scene.add(obj);

  await exportToGLB(scene, path.resolve('public/models/tshirts/polo.glb'));
  await exportToGLB(scene, path.resolve('public/models/polo.glb'));
}

// 2. CONVERT USER HOODIE OBJ
async function convertUserHoodie() {
  console.log('🔄 Converting User Hoodie OBJ to GLB...');
  const objPath = path.resolve('e426a301ed9b43818b3863d175224298/5b434aa12d335763a34f3f4ac88866b3.obj');
  const objText = fs.readFileSync(objPath, 'utf8');

  const loader = new OBJLoader();
  const obj = loader.parse(objText);

  // Normalize scale and center
  const box = new THREE.Box3().setFromObject(obj);
  const size = new THREE.Vector3();
  box.getSize(size);
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
      child.name = 'Garment_Fabric';
    }
  });

  const scene = new THREE.Scene();
  scene.add(obj);

  await exportToGLB(scene, path.resolve('public/models/tshirts/hoodie.glb'));
  await exportToGLB(scene, path.resolve('public/models/hoodie.glb'));
}

async function main() {
  await convertUserPolo();
  await convertUserHoodie();
  console.log('🎉 Both user OBJ models successfully converted to GLB!');
}

main().catch(console.error);
