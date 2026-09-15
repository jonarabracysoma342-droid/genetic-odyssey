const sharp = require('sharp');
const origPath = 'C:/Users/ADVAN/.gemini/antigravity-ide/brain/4266137e-7a8a-4970-86bc-f00ce079a0ad/.user_uploaded/media_1789097509051.jpg';

async function generateFlawlessMap() {
  const { data, info } = await sharp(origPath).raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const buf = Buffer.from(data);

  function getPixel(x, y) {
    if (x < 0) x = 0; if (x >= W) x = W - 1;
    if (y < 0) y = 0; if (y >= H) y = H - 1;
    const idx = (y * W + x) * 3;
    return [buf[idx], buf[idx + 1], buf[idx + 2]];
  }

  function setPixel(x, y, r, g, b) {
    if (x < 0 || x >= W || y < 0 || y >= H) return;
    const idx = (y * W + x) * 3;
    buf[idx] = Math.max(0, Math.min(255, r));
    buf[idx + 1] = Math.max(0, Math.min(255, g));
    buf[idx + 2] = Math.max(0, Math.min(255, b));
  }

  function isWood(r, g, b) {
    return (r > g + 10 && r > 70 && b < 100) || (r < 75 && g < 75 && b < 60);
  }

  console.log('1. Cleaning Stage 6 Cabin Yard...');

  // A. Top stone wall repair: x: 744..766, y: 96..104
  for (let y = 96; y <= 104; y++) {
    for (let x = 744; x <= 766; x++) {
      const [r, g, b] = getPixel(x - 34, y);
      setPixel(x, y, r, g, b);
    }
  }

  // B. Upper rails near well: x: 766..820, y: 105..136
  for (let y = 105; y <= 136; y++) {
    for (let x = 766; x <= 820; x++) {
      const [r, g, b] = getPixel(x - 68, y);
      setPixel(x, y, r, g, b);
    }
  }

  // C. Vertical fence corridor: x: 744 to 766, y: 105 to 246
  for (let y = 105; y <= 246; y++) {
    for (let x = 744; x <= 766; x++) {
      const [r, g, b] = getPixel(x - 17, y);
      setPixel(x, y, r, g, b);
    }
  }

  // D. Full horizontal fence corridor below cabin: x: 742 to 948, y: 247 to 276
  for (let y = 247; y <= 276; y++) {
    for (let x = 742; x <= 948; x++) {
      let srcX = x;
      let srcY = y - 34;

      if (srcX >= 890) {
        srcX -= 51;
      }
      if (srcX >= 766 && srcX <= 806 && srcY >= 148 && srcY <= 198) {
        srcY -= 34;
      }

      const [r, g, b] = getPixel(srcX, srcY);
      setPixel(x, y, r, g, b);
    }
  }

  console.log('2. Cleaning Stage 5 Kandang Panen...');

  function getPureStage4TopGrass(st5X, st5Y) {
    const span = 34;
    const srcX = 85 + (((st5X - 748) % span + span) % span);
    const [r, g, b] = getPixel(srcX, st5Y);
    return [r + 4, g + 4, b - 2];
  }

  function getCleanStage4Grass(st5X, st5Y) {
    let srcX = st5X - 680;
    let srcY = st5Y;

    if (srcY >= 450 && srcX <= 112) {
      srcX = 118 + ((srcX - 70) % 40);
    }
    if (srcY >= 450 && srcX >= 160 && srcX <= 192) {
      srcX = 196 + ((srcX - 160) % 30);
    }

    const [r, g, b] = getPixel(srcX, srcY);
    return [r + 4, g + 4, b - 2];
  }

  // A. Top Fence Corridor: y: 298 to 336, x: 748 to 956 (respect curb at 956)
  for (let y = 298; y <= 336; y++) {
    for (let x = 748; x <= 956; x++) {
      const [r, g, b] = getPureStage4TopGrass(x, y);
      setPixel(x, y, r, g, b);
    }
  }

  // B. Left Fence Corridor: x: 748 to 766, y: 336 to 455
  for (let y = 336; y <= 455; y++) {
    for (let x = 748; x <= 766; x++) {
      const [r, g, b] = getCleanStage4Grass(x, y);
      setPixel(x, y, r, g, b);
    }
  }

  // C. Right Fence Corridor: x: 938 to 956, y: 336 to 455
  for (let y = 336; y <= 455; y++) {
    for (let x = 938; x <= 956; x++) {
      const [r, g, b] = getCleanStage4Grass(x, y);
      setPixel(x, y, r, g, b);
    }
  }

  // D. Bottom Fence Corridor: y: 455 to 486, x: 748 to 956
  for (let y = 455; y <= 486; y++) {
    for (let x = 748; x <= 956; x++) {
      const [r, g, b] = getCleanStage4Grass(x, y);
      setPixel(x, y, r, g, b);
    }
  }

  // E. Central grass aisle between bottom plots (x: 837 to 854, y: 440 to 455)
  for (let y = 440; y <= 455; y++) {
    for (let x = 837; x <= 854; x++) {
      const [r, g, b] = getCleanStage4Grass(x, y);
      setPixel(x, y, r, g, b);
    }
  }

  // F. Bottom-left plot bottom edge: restore tilled dirt at x: 766..836, y: 440..454
  for (let y = 440; y <= 454; y++) {
    for (let x = 766; x <= 836; x++) {
      const [r, g, b] = getPixel(x, y);
      if (isWood(r, g, b)) {
        const [dr, dg, db] = getPixel(x, y - 17);
        setPixel(x, y, dr, dg, db);
      }
    }
  }

  // G. Bottom-right plot bottom edge: restore pea plants & dirt at x: 855..936, y: 440..454
  for (let y = 440; y <= 454; y++) {
    for (let x = 855; x <= 936; x++) {
      const [r, g, b] = getPixel(x, y);
      if (isWood(r, g, b)) {
        const [dr, dg, db] = getPixel(x, y - 17);
        setPixel(x, y, dr, dg, db);
      }
    }
  }

  // Save to public assets
  const outJpg = 'public/assets/rpg/monastery_garden_map.jpg';
  await sharp(buf, { raw: { width: W, height: H, channels: 3 } })
    .jpeg({ quality: 95 })
    .toFile(outJpg);
  console.log('✓ Successfully wrote master clean map: public/assets/rpg/monastery_garden_map.jpg');
}

generateFlawlessMap();
