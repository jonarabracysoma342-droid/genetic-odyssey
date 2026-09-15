const sharp = require('sharp');
const origPath = 'C:/Users/ADVAN/.gemini/antigravity-ide/brain/4266137e-7a8a-4970-86bc-f00ce079a0ad/.user_uploaded/media_1789097509051.jpg';

async function generateMasterMap() {
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

  // =========================================================================
  // 1. AREA 1: STAGE 6 CABIN YARD (NORTHEAST) - REMOVE ALL FENCES & RESTORE
  // =========================================================================
  console.log('1. Processing Stage 6 Cabin Yard...');

  // A. Stone wall repair at top post: x: 746..765, y: 96..104
  for (let y = 96; y <= 104; y++) {
    for (let x = 746; x <= 765; x++) {
      const [r, g, b] = getPixel(x - 34, y);
      setPixel(x, y, r, g, b);
    }
  }

  // B. Upper rails near well: x: 766..816, y: 105..136
  for (let y = 105; y <= 136; y++) {
    for (let x = 766; x <= 816; x++) {
      const [r, g, b] = getPixel(x - 68, y);
      setPixel(x, y, r, g, b);
    }
  }

  // C. Vertical fence corridor: x: 746 to 765, y: 105 to 235
  for (let y = 105; y <= 235; y++) {
    for (let x = 746; x <= 765; x++) {
      const [r, g, b] = getPixel(x - 17, y);
      setPixel(x, y, r, g, b);
    }
  }

  // D. Full horizontal fence corridor below cabin: x: 746 to 936, y: 236 to 258
  // Below the flower box (x >= 890, y <= 242) don't touch flower box
  for (let y = 236; y <= 258; y++) {
    for (let x = 746; x <= 936; x++) {
      // Avoid flower box at x >= 898, y <= 242
      if (x >= 898 && y <= 242) continue;

      let [r, g, b] = getPixel(x, y - 34);
      // If sampling touches well (x: 768..804, y: 148..195):
      if (x >= 766 && x <= 806) {
        [r, g, b] = getPixel(x, y - 51);
      }
      setPixel(x, y, r, g, b);
    }
  }

  // E. Corner intersection: x: 746 to 765, y: 236 to 258
  for (let y = 236; y <= 258; y++) {
    for (let x = 746; x <= 765; x++) {
      const [r, g, b] = getPixel(x - 17, y - 34);
      setPixel(x, y, r, g, b);
    }
  }

  // =========================================================================
  // 2. AREA 2: STAGE 5 KANDANG PANEN (SOUTHEAST) - REMOVE FENCE & COLOR MATCH
  // =========================================================================
  console.log('2. Processing Stage 5 Kandang Panen...');

  function getStage4Matched(stage5X, stage5Y) {
    let srcX = stage5X - 680;
    let srcY = stage5Y;

    // Chalkboard avoidance in Stage 4: chalkboard is at x: 132..218, y: 300..338
    if (srcY >= 298 && srcY <= 338 && srcX >= 130 && srcX <= 222) {
      // Map to open grass on the right side of Stage 4 (x: 230 to 298)
      srcX = 238 + ((srcX - 130) % 60);
    }

    // Tree stump avoidance in Stage 4: stump is at x: 70..106, y: 450..500
    if (srcY >= 450 && srcX <= 112) {
      srcX = 118 + ((srcX - 70) % 40);
    }

    // Chair avoidance in Stage 4: chair is at x: 165..188, y: 450..500
    if (srcY >= 450 && srcX >= 162 && srcX <= 190) {
      srcX = 196 + ((srcX - 162) % 30);
    }

    const [r, g, b] = getPixel(srcX, srcY);
    // Apply Stage 5 color tone adjustment (+4, +4, -2)
    return [r + 4, g + 4, b - 2];
  }

  // A. Top fence corridor: y: 298 to 336, x: 748 to 962
  for (let y = 298; y <= 336; y++) {
    for (let x = 748; x <= 962; x++) {
      const [r, g, b] = getStage4Matched(x, y);
      setPixel(x, y, r, g, b);
    }
  }

  // B. Left fence corridor: x: 748 to 766, y: 336 to 455
  for (let y = 336; y <= 455; y++) {
    for (let x = 748; x <= 766; x++) {
      const [r, g, b] = getStage4Matched(x, y);
      setPixel(x, y, r, g, b);
    }
  }

  // C. Right fence corridor: x: 938 to 962, y: 336 to 455
  for (let y = 336; y <= 455; y++) {
    for (let x = 938; x <= 962; x++) {
      const [r, g, b] = getStage4Matched(x, y);
      setPixel(x, y, r, g, b);
    }
  }

  // D. Bottom fence corridor: y: 455 to 485, x: 748 to 962
  for (let y = 455; y <= 485; y++) {
    for (let x = 748; x <= 962; x++) {
      const [r, g, b] = getStage4Matched(x, y);
      setPixel(x, y, r, g, b);
    }
  }

  // E. Central grass aisle between bottom plots (x: 837 to 854, y: 442 to 454)
  for (let y = 442; y <= 454; y++) {
    for (let x = 837; x <= 854; x++) {
      const [r, g, b] = getStage4Matched(x, y);
      setPixel(x, y, r, g, b);
    }
  }

  // F. Bottom edge of bottom-left plot (x: 768..836, y: 438..454)
  // Restore tilled dirt from clean row above (y - 17)
  for (let y = 438; y <= 454; y++) {
    for (let x = 768; x <= 836; x++) {
      const [r, g, b] = getPixel(x, y);
      if (isWood(r, g, b)) {
        const [dr, dg, db] = getPixel(x, y - 17);
        setPixel(x, y, dr, dg, db);
      }
    }
  }

  // G. Bottom edge of bottom-right plot (x: 855..936, y: 438..454)
  // Restore plants/dirt from clean row above (y - 17)
  for (let y = 438; y <= 454; y++) {
    for (let x = 855; x <= 936; x++) {
      const [r, g, b] = getPixel(x, y);
      if (isWood(r, g, b)) {
        const [dr, dg, db] = getPixel(x, y - 17);
        setPixel(x, y, dr, dg, db);
      }
    }
  }

  // Write directly to public/assets/rpg/monastery_garden_map.jpg
  const outJpg = 'public/assets/rpg/monastery_garden_map.jpg';
  await sharp(buf, { raw: { width: W, height: H, channels: 3 } })
    .jpeg({ quality: 95 })
    .toFile(outJpg);
  console.log('✓ Successfully wrote master public/assets/rpg/monastery_garden_map.jpg');

  // Also save verification crop matching user view
  await sharp(outJpg)
    .extract({ left: 710, top: 40, width: 260, height: 470 })
    .toFile('scratch/final_user_view.png');

  console.log('✓ Saved scratch/final_user_view.png');
}

generateMasterMap();
