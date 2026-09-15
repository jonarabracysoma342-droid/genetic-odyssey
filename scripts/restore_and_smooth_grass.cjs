const sharp = require('sharp');
const fs = require('fs');

async function restoreAndCleanGrass() {
  const srcPng = 'scratch/full_map_dirt_smoothed.png';
  const outJpg = 'public/assets/rpg/monastery_garden_map.jpg';

  const { data, info } = await sharp(srcPng).raw().toBuffer({ resolveWithObject: true });
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
    // Pure green open lawn grass:
    // Green is clearly dominant over Red and Blue
    // Not stone (r ~= g ~= b), not wood/dirt (r > g), not dark tree canopy/leaves (g < 80 or r < 40)
    return g > 80 && g > r + 15 && g > b + 25 && r < 140 && b < 100;
  }

  function pseudoNoise(x, y) {
    let n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }

  console.log('Pass 1: Eliminating dark tile seams in pure grass areas...');
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

  console.log('Pass 2: Breaking up repetitive wallpaper highlights in lawn...');
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

  // Save the master clean map
  await sharp(buf, { raw: { width: W, height: H, channels: 3 } })
    .jpeg({ quality: 96 })
    .toFile(outJpg);

  console.log('✓ Successfully wrote master public/assets/rpg/monastery_garden_map.jpg');

  // Verification crops:
  // 1. Top Area (y: 80..280, x: 200..850) - exactly where the user saw the glitch!
  await sharp(outJpg)
    .extract({ left: 200, top: 80, width: 650, height: 200 })
    .toFile('scratch/verify_fixed_top.png');

  // 2. Full Top Half (y: 0..280)
  await sharp(outJpg)
    .extract({ left: 0, top: 0, width: 1024, height: 280 })
    .toFile('scratch/verify_fixed_top_half.png');

  // 3. User exact zoom (170x50 at 760, 290 scaled 4x)
  await sharp(outJpg)
    .extract({ left: 760, top: 290, width: 170, height: 50 })
    .resize(170 * 4, 50 * 4, { kernel: 'nearest' })
    .toFile('scratch/verify_fixed_user_zoom.png');

  console.log('✓ Saved verification crops in scratch/');
}

restoreAndCleanGrass();
