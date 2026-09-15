const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const origPath = 'C:/Users/ADVAN/.gemini/antigravity-ide/brain/4266137e-7a8a-4970-86bc-f00ce079a0ad/.user_uploaded/media_1789097509051.jpg';

async function generateCleanMap() {
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
    buf[idx] = r;
    buf[idx + 1] = g;
    buf[idx + 2] = b;
  }

  function isWoodOrPost(r, g, b) {
    // Wood posts: reddish brown or post shadow outline
    return (r > g + 12 && r > 80 && b < 100) || (r < 75 && g < 75 && b < 60);
  }

  // Pure grass sampler from Stage 4 (open grass at x: 85..153, y: 311..345)
  function getPureGrassPixel(targetX, targetY) {
    const tileW = 68; // 4 tiles
    const tileH = 34; // 2 tiles
    const offX = ((targetX - 85) % tileW + tileW) % tileW;
    const offY = ((targetY - 311) % tileH + tileH) % tileH;
    return getPixel(85 + offX, 311 + offY);
  }

  console.log('--- 1. RESTORING & CLEANING STAGE 6 CABIN YARD ---');
  // A. Stone wall above cabin yard: y <= 104
  for (let y = 94; y <= 104; y++) {
    for (let x = 744; x <= 764; x++) {
      const [sr, sg, sb] = getPixel(x - 34, y);
      setPixel(x, y, sr, sg, sb);
    }
  }

  // B. Horizontal fence rails & posts: x: 746 to 822, y: 105 to 142
  for (let y = 105; y <= 142; y++) {
    for (let x = 746; x <= 822; x++) {
      if (x >= 816 && y >= 135) continue; // Cabin wall
      const [gr, gg, gb] = getPixel(x - 68, y);
      setPixel(x, y, gr, gg, gb);
    }
  }

  // C. Vertical fence posts all the way down: x: 744 to 766, y: 142 to 240
  for (let y = 142; y <= 240; y++) {
    for (let x = 744; x <= 766; x++) {
      const [gr, gg, gb] = getPixel(x - 51, y);
      setPixel(x, y, gr, gg, gb);
    }
  }

  console.log('--- 2. REMOVING STAGE 5 WOODEN FENCE (SOUTHEAST PEN) ---');
  // Exact boundaries from analysis:
  // Plots:
  // Top-Left: x: 768..836, y: 337..404
  // Top-Right: x: 855..923, y: 337..404
  // Bottom-Left: x: 768..836, y: 416..455
  // Bottom-Right: x: 855..923, y: 416..455
  // Central grass aisle: x: 837..854

  // A. Top fence (y: 298 to 336, x: 748 to 962) -> pure grass
  for (let y = 298; y <= 336; y++) {
    for (let x = 748; x <= 962; x++) {
      const [gr, gg, gb] = getPureGrassPixel(x, y);
      setPixel(x, y, gr, gg, gb);
    }
  }

  // B. Left fence strip (x: 748 to 767, y: 336 to 455) -> pure grass with curb
  for (let y = 336; y <= 455; y++) {
    for (let x = 748; x <= 767; x++) {
      const [gr, gg, gb] = getPixel(x - 680, y);
      setPixel(x, y, gr, gg, gb);
    }
  }

  // C. Right fence strip (x: 924 to 962, y: 336 to 455) -> pure grass
  for (let y = 336; y <= 455; y++) {
    for (let x = 924; x <= 962; x++) {
      const [gr, gg, gb] = getPixel(x - 680, y);
      setPixel(x, y, gr, gg, gb);
    }
  }

  // D. Bottom fence area (y: 456 to 485, x: 748 to 962) -> pure grass
  for (let y = 456; y <= 485; y++) {
    for (let x = 748; x <= 962; x++) {
      const [gr, gg, gb] = getPureGrassPixel(x, y);
      setPixel(x, y, gr, gg, gb);
    }
  }

  // E. Central grass pathway between bottom plots (x: 837 to 854, y: 438 to 455)
  for (let y = 438; y <= 455; y++) {
    for (let x = 837; x <= 854; x++) {
      const [gr, gg, gb] = getPureGrassPixel(x, y);
      setPixel(x, y, gr, gg, gb);
    }
  }

  // F. Bottom edge of bottom-left plot (x: 768..836, y: 438..455)
  // Restore dirt from the clean row above (y - 17)
  for (let y = 438; y <= 455; y++) {
    for (let x = 768; x <= 836; x++) {
      const [r, g, b] = getPixel(x, y);
      if (isWoodOrPost(r, g, b)) {
        const [dr, dg, db] = getPixel(x, y - 17);
        setPixel(x, y, dr, dg, db);
      }
    }
  }

  // G. Bottom edge of bottom-right plot (x: 855..923, y: 438..455)
  // Restore plants/dirt from clean row above (y - 17)
  for (let y = 438; y <= 455; y++) {
    for (let x = 855; x <= 923; x++) {
      const [r, g, b] = getPixel(x, y);
      if (isWoodOrPost(r, g, b)) {
        const [dr, dg, db] = getPixel(x, y - 17);
        setPixel(x, y, dr, dg, db);
      }
    }
  }

  // Save clean map
  const outJpg = 'public/assets/rpg/monastery_garden_map.jpg';
  await sharp(buf, { raw: { width: W, height: H, channels: 3 } })
    .jpeg({ quality: 95 })
    .toFile(outJpg);
  console.log('✓ Successfully saved updated public/assets/rpg/monastery_garden_map.jpg');

  // Also save crops for visual verification
  await sharp(outJpg)
    .extract({ left: 730, top: 280, width: 250, height: 230 })
    .toFile('scratch/verify_stage5_clean5.png');

  console.log('✓ Saved verification crop in scratch/');
}

generateCleanMap();
