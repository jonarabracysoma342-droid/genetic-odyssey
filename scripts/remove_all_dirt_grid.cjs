const sharp = require('sharp');
const fs = require('fs');

async function removeAllDirtGrid() {
  const mapPath = 'public/assets/rpg/monastery_garden_map.jpg';
  const backupPath = 'public/assets/rpg/monastery_garden_map_pregrid_backup.jpg';

  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(mapPath, backupPath);
    console.log('Created backup:', backupPath);
  }

  const { data, info } = await sharp(mapPath).raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
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
    buf[idx] = Math.round(r); buf[idx+1] = Math.round(g); buf[idx+2] = Math.round(b);
  }

  function isSoil(r, g, b) {
    const isBrown = r > 75 && g > 38 && b < 85 && (r > g + 15);
    const isPlant = (g > r) || (g > 95 && g > b + 22);
    const isStone = Math.abs(r - g) < 8 && Math.abs(g - b) < 8;
    return isBrown && !isPlant && !isStone;
  }

  // Regions containing soil plots
  const regions = [
    { x1: 310, x2: 720, y1: 120, y2: 480 }, // Central garden pea plots
    { x1: 740, x2: 965, y1: 310, y2: 495 }  // Southeast Stage 5 crop plots
  ];

  for (const reg of regions) {
    for (let iter = 0; iter < 4; iter++) {
      // 1. Vertical grooves
      for (let y = reg.y1; y <= reg.y2; y++) {
        for (let x = reg.x1 + 2; x <= reg.x2 - 2; x++) {
          const [r, g, b] = getPixel(x, y);
          if (!isSoil(r, g, b)) continue;

          const [rL, gL, bL] = getPixel(x - 2, y);
          const [rR, gR, bR] = getPixel(x + 2, y);

          if (isSoil(rL, gL, bL) && isSoil(rR, gR, bR)) {
            const avgR = (rL + rR) / 2;
            const avgG = (gL + gR) / 2;
            const avgB = (bL + bR) / 2;
            if (r < avgR - 5) {
              setPixel(x, y, avgR, avgG, avgB);
            }
          }
        }
      }

      // 2. Horizontal grooves
      for (let y = reg.y1 + 2; y <= reg.y2 - 2; y++) {
        for (let x = reg.x1; x <= reg.x2; x++) {
          const [r, g, b] = getPixel(x, y);
          if (!isSoil(r, g, b)) continue;

          const [rU, gU, bU] = getPixel(x, y - 2);
          const [rD, gD, bD] = getPixel(x, y + 2);

          if (isSoil(rU, gU, bU) && isSoil(rD, gD, bD)) {
            const avgR = (rU + rD) / 2;
            const avgG = (gU + gD) / 2;
            const avgB = (bU + bD) / 2;
            if (r < avgR - 5) {
              setPixel(x, y, avgR, avgG, avgB);
            }
          }
        }
      }
    }
  }

  // Save back to map file
  await sharp(buf, { raw: { width: W, height: H, channels: 3 } })
    .jpeg({ quality: 98 })
    .toFile(mapPath);

  console.log('Successfully updated', mapPath);

  // Generate full map preview for visual inspection
  await sharp(buf, { raw: { width: W, height: H, channels: 3 } })
    .toFile('scratch/full_map_dirt_smoothed.png');
  console.log('Saved scratch/full_map_dirt_smoothed.png');
}

removeAllDirtGrid();
