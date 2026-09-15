const sharp = require('sharp');

async function testCenterSmooth() {
  const { data, info } = await sharp('scratch/crop_center_plots_curr.png').raw().toBuffer({ resolveWithObject: true });
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
    buf[idx] = r; buf[idx+1] = g; buf[idx+2] = b;
  }

  function isSoil(r, g, b) {
    // Soil tones: brown (red > green + 8, red > blue + 15)
    // Avoid green plant leaves (g > r or strong green)
    // Avoid grey stone (r ~ g ~ b)
    const isBrown = r > 60 && g > 30 && b < 100 && (r > g + 8) && (r > b + 15);
    const isPlant = (g > r) || (g > 85 && g > b + 20);
    const isStone = Math.abs(r - g) < 8 && Math.abs(g - b) < 8;
    return isBrown && !isPlant && !isStone;
  }

  // Run 3 iterations
  for (let iter = 0; iter < 3; iter++) {
    // Vertical grooves
    for (let y = 0; y < H; y++) {
      for (let x = 2; x < W - 2; x++) {
        const [r, g, b] = getPixel(x, y);
        if (!isSoil(r, g, b)) continue;

        const [rL, gL, bL] = getPixel(x - 2, y);
        const [rR, gR, bR] = getPixel(x + 2, y);

        if (isSoil(rL, gL, bL) && isSoil(rR, gR, bR)) {
          const avgR = (rL + rR) / 2;
          const avgG = (gL + gR) / 2;
          const avgB = (bL + bR) / 2;
          if (r < avgR - 5) {
            setPixel(x, y, Math.round(avgR), Math.round(avgG), Math.round(avgB));
          }
        }
      }
    }

    // Horizontal grooves
    for (let y = 2; y < H - 2; y++) {
      for (let x = 0; x < W; x++) {
        const [r, g, b] = getPixel(x, y);
        if (!isSoil(r, g, b)) continue;

        const [rU, gU, bU] = getPixel(x, y - 2);
        const [rD, gD, bD] = getPixel(x, y + 2);

        if (isSoil(rU, gU, bU) && isSoil(rD, gD, bD)) {
          const avgR = (rU + rD) / 2;
          const avgG = (gU + gD) / 2;
          const avgB = (bU + bD) / 2;
          if (r < avgR - 5) {
            setPixel(x, y, Math.round(avgR), Math.round(avgG), Math.round(avgB));
          }
        }
      }
    }
  }

  await sharp(buf, { raw: { width: W, height: H, channels: 3 } })
    .toFile('scratch/test_smooth_center.png');

  console.log('Saved scratch/test_smooth_center.png');
}

testCenterSmooth();
