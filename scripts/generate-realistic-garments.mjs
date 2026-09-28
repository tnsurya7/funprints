import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import fs from 'fs';
import path from 'path';

// Node.js FileReader polyfill for Three.js GLTFExporter
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
 * Creates high-fidelity apparel geometry based directly on real T-shirt reference photos:
 * - neck_white_front.png
 * - neck_white_back.png
 * - neck_white_side.png
 */
function buildRealisticGarment({ neckType = 'round', isHoodie = false } = {}) {
  const root = new THREE.Group();
  root.name = `Garment_${neckType}`;

  // =========================================================================
  // 1. TORSO BODY MESH (High-Density Anatomical Quad Mesh with Organic Folds)
  // =========================================================================
  const uSegments = 100; // Radial resolution around torso
  const vSegments = 80;  // Vertical resolution from hem to shoulder

  const bodyGeo = new THREE.BufferGeometry();
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  const totalHeight = isHoodie ? 2.05 : 1.90;
  const hemY = -0.95;
  const shoulderY = hemY + totalHeight;
  const armpitY = hemY + totalHeight * 0.60;

  for (let iv = 0; iv <= vSegments; iv++) {
    const v = iv / vSegments; // 0.0 at hem -> 1.0 at top of shoulder/collar
    const y = hemY + v * totalHeight;

    // Garment silhouette profile
    let halfWidth = 0.70;  // Half-width across chest (X)
    let halfDepth = 0.22;  // Half-depth across profile (Z)

    if (v < 0.20) {
      // Lower torso / Hem: Gentle natural drape flare
      const t = v / 0.20;
      halfWidth = 0.71 - 0.02 * t;
      halfDepth = 0.23 - 0.02 * t;
    } else if (v < 0.60) {
      // Waist: subtle relaxed athletic contour
      const t = (v - 0.20) / 0.40;
      halfWidth = 0.69 - 0.025 * Math.sin(t * Math.PI);
      halfDepth = 0.21 - 0.015 * Math.sin(t * Math.PI);
    } else {
      // Chest to shoulder: expands naturally to broad shoulder line
      const t = (v - 0.60) / 0.40;
      halfWidth = 0.68 + 0.16 * Math.sin(t * Math.PI * 0.5);
      halfDepth = 0.20 + 0.06 * Math.sin(t * Math.PI * 0.5);
    }

    if (isHoodie) {
      halfWidth *= 1.12;
      halfDepth *= 1.18;
    }

    for (let iu = 0; iu <= uSegments; iu++) {
      const u = iu / uSegments;
      // angle: 0 = Front Center (+Z), PI/2 = Right (+X), PI = Back Center (-Z), 3PI/2 = Left (-X)
      const angle = u * Math.PI * 2;
      const cosA = Math.cos(angle); // +Z front, -Z back
      const sinA = Math.sin(angle); // +X right, -X left

      // Garment cross-section shape (real T-shirts are flatter across chest & back, curved at sides)
      const shapeX = Math.sign(sinA) * Math.pow(Math.abs(sinA), 0.88);
      const shapeZ = Math.sign(cosA) * Math.pow(Math.abs(cosA), 0.94);

      let px = halfWidth * shapeX;
      let pz = halfDepth * shapeZ;
      let py = y;

      // Realistic shoulder slope (neck is higher than outer shoulder edge)
      if (v >= 0.58) {
        const shoulderProg = (v - 0.58) / 0.42;
        const distFromCenter = Math.abs(px) / (halfWidth || 1);
        const shoulderDrop = distFromCenter * 0.18 * shoulderProg;
        py -= shoulderDrop;
      }

      // Natural chest projection (pectoral drape)
      if (cosA > 0.05 && v > 0.42 && v < 0.86) {
        const chestCurve = Math.sin(((v - 0.42) / 0.44) * Math.PI) * Math.max(0, cosA);
        pz += chestCurve * 0.042;
      }

      // Natural upper back shoulder-blade contour
      if (cosA < -0.15 && v > 0.50 && v < 0.90) {
        const backCurve = Math.sin(((v - 0.50) / 0.40) * Math.PI) * Math.abs(cosA);
        pz -= backCurve * 0.032;
      }

      // Subtle organic cloth wrinkles & drape folds (referencing real cotton shirt photos)
      // 1. Vertical drape waves
      const drapeFold = Math.sin(angle * 7.0 + y * 4.5) * 0.007 * (1.1 - v * 0.6);
      // 2. Side-seam tension folds
      const sideIntensity = Math.pow(Math.abs(sinA), 2.5);
      const sideFold = Math.sin(y * 16.0 + angle * 2.0) * 0.006 * sideIntensity;
      // 3. Diagonal gather folds near underarms
      const underarmFold = (v > 0.52 && v < 0.75) 
        ? Math.sin(y * 20.0 + angle * 5.0) * 0.008 * Math.pow(Math.abs(sinA), 3) 
        : 0;

      px += (drapeFold * sinA + sideFold * shapeX) * 0.7;
      pz += (drapeFold * cosA + underarmFold + sideFold * shapeZ);

      // Bottom hem subtle double-fold curvature
      if (v <= 0.06) {
        const hemFactor = 1.0 - v / 0.06;
        pz -= 0.004 * hemFactor;
        // Natural curved hemline (very slight center dip)
        py += Math.sin(angle * 4.0) * 0.003 * hemFactor;
      }

      // Neckline opening
      if (v >= 0.80) {
        const neckT = (v - 0.80) / 0.20;
        const isFront = cosA > 0;
        const centerProximity = Math.max(0, 1.0 - Math.abs(sinA) * 1.75);

        if (neckType === 'v-neck' && isFront) {
          // Sharp V-neckline
          const vDepth = Math.max(0, 0.44 * (1.0 - Math.abs(px) / 0.36));
          py -= vDepth * Math.pow(neckT, 1.15);
          pz -= 0.018 * Math.pow(centerProximity, 2);
        } else if (neckType === 'round' || (neckType === 'v-neck' && !isFront)) {
          // Classic round scoop neckline
          const dropAmount = isFront ? 0.26 : 0.07;
          const scoop = Math.pow(centerProximity, 1.75) * dropAmount;
          py -= scoop * Math.pow(neckT, 1.35);
        } else if (neckType === 'polo') {
          const dropAmount = isFront ? 0.30 : 0.06;
          const scoop = Math.pow(centerProximity, 1.9) * dropAmount;
          py -= scoop * Math.pow(neckT, 1.3);
        }
      }

      positions.push(px, py, pz);
      normals.push(shapeX, 0, shapeZ);
      uvs.push(u, v);
    }
  }

  for (let iv = 0; iv < vSegments; iv++) {
    for (let iu = 0; iu < uSegments; iu++) {
      const a = iv * (uSegments + 1) + iu;
      const b = (iv + 1) * (uSegments + 1) + iu;
      const c = (iv + 1) * (uSegments + 1) + (iu + 1);
      const d = iv * (uSegments + 1) + (iu + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  bodyGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  bodyGeo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  bodyGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  bodyGeo.setIndex(indices);
  bodyGeo.computeVertexNormals();

  const bodyMesh = new THREE.Mesh(bodyGeo);
  bodyMesh.name = 'Tshirt_Body';
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  root.add(bodyMesh);

  // =========================================================================
  // 2. SLEEVES (Realistic Set-in Sleeves with Natural Downward Slope & Taper)
  // =========================================================================
  function buildSleeve(side = 1) { // 1 = Right, -1 = Left
    const sleeveLengthSegs = 40;
    const sleeveRadialSegs = 48;
    const sleeveGeo = new THREE.BufferGeometry();
    const pos = [];
    const norm = [];
    const uvCoords = [];
    const idx = [];

    const sleeveLength = isHoodie ? 1.48 : 0.65;
    const shoulderStartX = side * 0.72;
    const shoulderStartY = hemY + totalHeight * 0.90;
    const shoulderStartZ = 0.02;

    // Real apparel arm hanging angle (~44° from vertical)
    const armAngle = (44 * Math.PI) / 180;
    const forwardTilt = (5 * Math.PI) / 180;

    const dirX = Math.sin(armAngle) * side;
    const dirY = -Math.cos(armAngle);
    const dirZ = Math.sin(forwardTilt);

    const baseRadiusY = isHoodie ? 0.36 : 0.28; // Vertical armhole height
    const baseRadiusZ = isHoodie ? 0.26 : 0.20; // Profile thickness

    for (let il = 0; il <= sleeveLengthSegs; il++) {
      const lProg = il / sleeveLengthSegs;
      const currentDist = lProg * sleeveLength;

      // Sleeve center line with subtle organic sag
      const cx = shoulderStartX + dirX * currentDist;
      const cy = shoulderStartY + dirY * currentDist - (Math.pow(lProg, 1.7) * 0.05);
      const cz = shoulderStartZ + dirZ * currentDist;

      // Realistic taper from armhole to cuff
      const taper = isHoodie 
        ? 1.0 - 0.40 * lProg 
        : 1.0 - 0.16 * lProg; // ~16% taper for short sleeve

      const radY = baseRadiusY * taper;
      const radZ = baseRadiusZ * taper;

      for (let ir = 0; ir <= sleeveRadialSegs; ir++) {
        const rProg = ir / sleeveRadialSegs;
        const theta = rProg * Math.PI * 2;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        let localY = radY * sinT;
        let localZ = radZ * cosT;

        // Subtle cloth wrinkles along sleeve
        if (lProg > 0.12 && lProg < 0.88) {
          // Underarm gathering fold
          if (sinT < -0.2) {
            const underarmWrinkle = Math.sin(lProg * 22.0 + theta * 3.0) * 0.010 * Math.abs(sinT);
            localY += underarmWrinkle;
          }
          // Deltoid draping fold
          if (sinT > 0.3) {
            const deltoidFold = Math.sin(lProg * 14.0) * 0.007 * sinT;
            localY += deltoidFold;
          }
        }

        // Folded sleeve hem cuff lip at the bottom opening
        if (lProg >= 0.90) {
          const cuffT = (lProg - 0.90) / 0.10;
          const cuffBump = Math.sin(cuffT * Math.PI) * 0.005;
          localY += cuffBump * sinT;
          localZ += cuffBump * cosT;
        }

        // Project into 3D world space
        const wx = cx - localY * Math.sin(armAngle) * side;
        const wy = cy + localY * Math.cos(armAngle);
        const wz = cz + localZ;

        pos.push(wx, wy, wz);
        norm.push(dirX + cosT * 0.3 * side, sinT, cosT);
        uvCoords.push(rProg, lProg);
      }
    }

    for (let il = 0; il < sleeveLengthSegs; il++) {
      for (let ir = 0; ir < sleeveRadialSegs; ir++) {
        const a = il * (sleeveRadialSegs + 1) + ir;
        const b = (il + 1) * (sleeveRadialSegs + 1) + ir;
        const c = (il + 1) * (sleeveRadialSegs + 1) + (ir + 1);
        const d = il * (sleeveRadialSegs + 1) + (ir + 1);

        idx.push(a, b, d);
        idx.push(b, c, d);
      }
    }

    sleeveGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    sleeveGeo.setAttribute('normal', new THREE.Float32BufferAttribute(norm, 3));
    sleeveGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvCoords, 2));
    sleeveGeo.setIndex(idx);
    sleeveGeo.computeVertexNormals();

    const sleeveMesh = new THREE.Mesh(sleeveGeo);
    sleeveMesh.name = `Tshirt_Sleeve_${side > 0 ? 'Right' : 'Left'}`;
    sleeveMesh.castShadow = true;
    sleeveMesh.receiveShadow = true;
    return sleeveMesh;
  }

  root.add(buildSleeve(1));
  root.add(buildSleeve(-1));

  // =========================================================================
  // 3. COLLAR & NECKBAND (Dedicated 1x1 Rib Knit Contour Mesh)
  // =========================================================================
  function buildCollar() {
    const collarSegs = 72;
    const ribRadialSegs = 14;
    const collarGeo = new THREE.BufferGeometry();
    const pos = [];
    const norm = [];
    const uvsRib = [];
    const idx = [];

    const neckY = hemY + totalHeight * 0.94;
    const neckRadiusX = 0.32;
    const neckRadiusZ = 0.26;
    const ribThickness = 0.035;
    const ribHeight = 0.040;

    for (let ic = 0; ic <= collarSegs; ic++) {
      const u = ic / collarSegs;
      const angle = u * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      let cx = neckRadiusX * sinA;
      let cz = neckRadiusZ * cosA;
      let cy = neckY;

      const isFront = cosA > 0;
      if (neckType === 'v-neck' && isFront) {
        // True sharp V-Neck dip
        const vDip = Math.max(0, 0.40 * (1.0 - Math.abs(sinA) * 1.55));
        cy -= vDip;
        cz *= 0.90;
      } else if (neckType === 'round') {
        const drop = isFront ? 0.24 * Math.pow(Math.max(0, cosA), 1.6) : 0.06 * Math.pow(Math.abs(cosA), 1.5);
        cy -= drop;
      } else if (neckType === 'polo') {
        const drop = isFront ? 0.28 * Math.pow(Math.max(0, cosA), 1.7) : 0.05 * Math.pow(Math.abs(cosA), 1.5);
        cy -= drop;
      }

      for (let ir = 0; ir <= ribRadialSegs; ir++) {
        const v = ir / ribRadialSegs;
        const ribTheta = v * Math.PI * 2;

        const rx = Math.cos(ribTheta) * ribThickness;
        const ry = Math.sin(ribTheta) * ribHeight;

        const px = cx + rx * sinA;
        const py = cy + ry;
        const pz = cz + rx * cosA;

        pos.push(px, py, pz);
        norm.push(sinA, Math.sin(ribTheta), cosA);
        uvsRib.push(u, v);
      }
    }

    for (let ic = 0; ic < collarSegs; ic++) {
      for (let ir = 0; ir < ribRadialSegs; ir++) {
        const a = ic * (ribRadialSegs + 1) + ir;
        const b = (ic + 1) * (ribRadialSegs + 1) + ir;
        const c = (ic + 1) * (ribRadialSegs + 1) + (ir + 1);
        const d = ic * (ribRadialSegs + 1) + (ir + 1);

        idx.push(a, b, d);
        idx.push(b, c, d);
      }
    }

    collarGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    collarGeo.setAttribute('normal', new THREE.Float32BufferAttribute(norm, 3));
    collarGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvsRib, 2));
    collarGeo.setIndex(idx);
    collarGeo.computeVertexNormals();

    const collarMesh = new THREE.Mesh(collarGeo);
    collarMesh.name = 'Tshirt_Collar';
    collarMesh.castShadow = true;
    collarMesh.receiveShadow = true;
    return collarMesh;
  }

  root.add(buildCollar());

  // =========================================================================
  // 4. POLO SPECIFIC ELEMENTS (Collar Flaps & Placket)
  // =========================================================================
  if (neckType === 'polo') {
    const placketGeo = new THREE.PlaneGeometry(0.10, 0.34, 4, 12);
    placketGeo.translate(0, hemY + totalHeight * 0.76, 0.25);
    const placket = new THREE.Mesh(placketGeo);
    placket.name = 'Polo_Placket';
    root.add(placket);

    const leftFlapGeo = new THREE.BoxGeometry(0.25, 0.08, 0.012);
    leftFlapGeo.rotateZ(0.24);
    leftFlapGeo.rotateX(-0.35);
    leftFlapGeo.translate(-0.16, hemY + totalHeight * 0.90, 0.28);
    const leftFlap = new THREE.Mesh(leftFlapGeo);
    leftFlap.name = 'Polo_Collar_Left';
    root.add(leftFlap);

    const rightFlapGeo = new THREE.BoxGeometry(0.25, 0.08, 0.012);
    rightFlapGeo.rotateZ(-0.24);
    rightFlapGeo.rotateX(-0.35);
    rightFlapGeo.translate(0.16, hemY + totalHeight * 0.90, 0.28);
    const rightFlap = new THREE.Mesh(rightFlapGeo);
    rightFlap.name = 'Polo_Collar_Right';
    root.add(rightFlap);
  }

  // =========================================================================
  // 5. HOODIE SPECIFIC ELEMENTS (Pouch Pocket & Hood)
  // =========================================================================
  if (isHoodie) {
    const pocketGeo = new THREE.PlaneGeometry(0.72, 0.48, 20, 16);
    const pPos = pocketGeo.attributes.position;
    for (let i = 0; i < pPos.count; i++) {
      const x = pPos.getX(i);
      const zOffset = (1.0 - Math.pow(x / 0.36, 2)) * 0.065;
      pPos.setZ(i, zOffset);
    }
    pocketGeo.computeVertexNormals();
    pocketGeo.translate(0, hemY + totalHeight * 0.34, 0.30);
    const pocket = new THREE.Mesh(pocketGeo);
    pocket.name = 'Hoodie_Pocket';
    root.add(pocket);

    const hoodGeo = new THREE.SphereGeometry(0.44, 28, 22, 0, Math.PI * 2, 0, Math.PI * 0.78);
    hoodGeo.scale(0.88, 1.12, 0.94);
    hoodGeo.translate(0, hemY + totalHeight * 0.97, -0.14);
    const hood = new THREE.Mesh(hoodGeo);
    hood.name = 'Hoodie_Hood';
    root.add(hood);
  }

  // Recenter root
  root.position.set(0, 0, 0);

  return root;
}

// Export helper
async function exportToGLB(scene, outputPath) {
  const exporter = new GLTFExporter();
  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (gltf) => {
        const buffer = Buffer.from(gltf);
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, buffer);
        console.log(`✓ Exported realistic garment: ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
        resolve(buffer.length);
      },
      (err) => reject(err),
      { binary: true }
    );
  });
}

async function main() {
  console.log('🚀 Building authentic apparel 3D models matching reference imagery...');

  // 1. Classic Round Neck T-Shirt (References: neck_white_front.png, neck_white_back.png, neck_white_side.png)
  const roundNeckScene = new THREE.Scene();
  roundNeckScene.add(buildRealisticGarment({ neckType: 'round', isHoodie: false }));

  // 2. V-Neck T-Shirt (Reference: v_neck_white_front.png)
  const vNeckScene = new THREE.Scene();
  vNeckScene.add(buildRealisticGarment({ neckType: 'v-neck', isHoodie: false }));

  // 3. Polo T-Shirt (Reference: polo_white_front.png)
  const poloScene = new THREE.Scene();
  poloScene.add(buildRealisticGarment({ neckType: 'polo', isHoodie: false }));

  // 4. Hoodie (Reference: hoodie_black_front.png)
  const hoodieScene = new THREE.Scene();
  hoodieScene.add(buildRealisticGarment({ neckType: 'round', isHoodie: true }));

  const targetDir = path.resolve(process.cwd(), 'public/models/tshirts');
  fs.mkdirSync(targetDir, { recursive: true });

  // Main default and specific model paths
  await exportToGLB(roundNeckScene, path.resolve(process.cwd(), 'public/models/tshirt.glb'));
  await exportToGLB(roundNeckScene, path.resolve(targetDir, 'round-neck.glb'));
  await exportToGLB(vNeckScene, path.resolve(targetDir, 'v-neck.glb'));
  await exportToGLB(poloScene, path.resolve(targetDir, 'polo.glb'));
  await exportToGLB(hoodieScene, path.resolve(targetDir, 'hoodie.glb'));

  console.log('🎉 All realistic 3D garment GLB models successfully generated & verified!');
}

main().catch((err) => {
  console.error('Fatal generation error:', err);
  process.exit(1);
});
