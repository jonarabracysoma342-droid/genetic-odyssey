const sharp = require('sharp');
const fs = require('fs');

async function processFullMapGrass() {
  const mapPath = 'public/assets/rpg/monastery_garden_map.jpg';
  const backupPath = 'public/assets/rpg/monastery_garden_map_pregrid_backup.jpg';

  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(mapPath, backupPath);
  }

  const { data, info } = await sharp(mapPath).raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const buf = Buffer.from(data);

  function getPixel(x, y) {
    if (x < 0) x = 0; if (x >= W) x = W - 1;
    if (y < 0) y = 0; if (y >= H) y = H - 1;
    const idx = (y * W + x) * 3;
    return [buf[idx], buf[idx+1], buf[idx+2]];
  }

  function setPixel(x, y, r, g, b) {
    if (x < 0 || x >= W || y < 0 || y >= H) return;
    const idx = (y * W + x) * 3;
    buf[idx] = Math.max(0, Math.min(255, Math.round(r)));
    buf[idx+1] = Math.max(0, Math.min(255, Math.round(g)));
    buf[idx+2] = Math.max(0, Math.min(255, Math.round(b)));
  }

  function isGrass(r, g, b) {
    // Pure green lawn grass in the game:
    return g > 75 && g > r + 12 && g > b + 20 && r < 150 && b < 110;
  }

  function pseudoNoise(x, y) {
    let n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }

  console.log('Pass 1: Eliminating dark tile seams in grass across entire map...');
  for (let iter = 0; iter < 4; iter++) {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const [r, g, b] = getPixel(x, y);
        if (!isGrass(r, g, b)) continue;

        // Check horizontal neighbors
        const [rL, gL, bL] = getPixel(x - 1, y);
        const [rR, gR, bR] = getPixel(x + 1, y);
        if (isGrass(rL, gL, bL) && isGrass(rR, gR, bR)) {
          const avgG = (gL + gR) / 2;
          const avgR = (rL + rR) / 2;
          const avgB = (bL + bR) / 2;
          if (g < avgG - 8) {
            setPixel(x, y, avgR, avgG, avgB);
          }
        }

        // Check vertical neighbors
        const [rU, gU, bU] = getPixel(x, y - 1);
        const [rD, gD, bD] = getPixel(x, y + 1);
        if (isGrass(rU, gU, bU) && isGrass(rD, gD, bD)) {
          const avgG = (gU + gD) / 2;
          const avgR = (rU + rD) / 2;
          const avgB = (bU + bD) / 2;
          if (g < avgG - 8) {
            setPixel(x, y, avgR, avgG, avgB);
          }
        }
      }
    }
  }

  console.log('Pass 2: Softening repetitive tile highlights into organic lawn variation...');
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const [r, g, b] = getPixel(x, y);
      if (!isGrass(r, g, b)) continue;

      if (g > 165) {
        const rand = pseudoNoise(x, y);
        if (rand < 0.65) {
          const [rL, gL, bL] = getPixel(x - 2, y);
          const [rR, gR, bR] = getPixel(x + 2, y);
          const [rU, gU, bU] = getPixel(x, y - 2);
          const [rD, gD, bD] = getPixel(x, y + 2);
          if (isGrass(rL, gL, bL) && isGrass(rR, gR, bR) && isGrass(rU, gU, bU) && isGrass(rD, gD, bD)) {
            const avgR = (rL + rR + rU + rD) / 4;
            const avgG = (gL + gR + gU + gD) / 4;
            const avgB = (bL + bR + bU + bD) / 4;
            setPixel(x, y, avgR, avgG, avgB);
          }
        }
      }
    }
  }

  console.log('Pass 3: Cleaning residual fence post shadows in front of cabin...');
  // Cabin front yard: x: 746..930, y: 224..260
  for (let y = 224; y <= 260; y++) {
    for (let x = 746; x <= 930; x++) {
      // Don't touch stepping stones (x: 846..872, y >= 244)
      if (x >= 846 && x <= 872 && y >= 242) continue;
      // Don't touch flower pot at right (x >= 898, y <= 242)
      if (x >= 898 && y <= 242) continue;

      const [r, g, b] = getPixel(x, y);
      // Dark fence shadow / speck residue
      if (r < 65 && g < 75 && b < 60) {
        // Average surrounding grass
        let sR = 0, sG = 0, sB = 0, count = 0;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            if (dx === 0 && dy === 0) continue;
            const [nr, ng, nb] = getPixel(x + dx, y + dy);
            if (ng > 60 && (ng > nr + 8 || ng > nb + 10)) {
              sR += nr; sG += ng; sB += nb; count++;
            }
          }
        }
        if (count >= 4) {
          setPixel(x, y, sR / count, sG / count, sB / count);
        }
      }
    }
  }

  // Save updated map
  await sharp(buf, { raw: { width: W, height: H, channels: 3 } })
    .jpeg({ quality: 96 })
    .toFile(mapPath);

  // Verification crops
  await sharp(mapPath)
    .extract({ left: 810, top: 220, width: 110, height: 60 })
    .resize(110 * 4, 60 * 4, { kernel: 'nearest' })
    .toFile('scratch/zoom_cabin_front_clean.png');

  await sharp(mapPath)
    .extract({ left: 740, top: 90, width: 250, height: 180 })
    .toFile('scratch/verify_northeast_grass_clean.png');

  console.log('✓ Successfully wrote master map and verification crops.');
}

processFullMapGrass();
