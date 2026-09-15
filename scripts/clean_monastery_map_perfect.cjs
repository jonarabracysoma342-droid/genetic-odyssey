const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const origPath = 'C:/Users/ADVAN/.gemini/antigravity-ide/brain/4266137e-7a8a-4970-86bc-f00ce079a0ad/.user_uploaded/media_1789097509051.jpg';

async function generatePerfectMap() {
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
    // Post/rail wood: brown/amber (R significantly higher than G)
    const isWoodTone = (r > g + 10 && r > 75 && b < 100);
    // Dark post outline/shadow:
    const isDarkWood = (r > 40 && r < 95 && r > g + 5 && b < 60);
    const isDeepShadow = (r < 60 && g < 70 && b < 50 && r > g - 8);
    return isWoodTone || isDarkWood || isDeepShadow;
  }

  console.log('=== 1. PERFECT CLEANING OF STAGE 6 CABIN YARD FENCES ===');
  // In the cabin yard, remove:
  // A. The vertical fence post & railing: x: 746..766, y: 104..235
  // B. The horizontal fence below the cabin: x: 744..905, y: 236..260
  // C. The top post touching the stone wall: x: 746..764, y: 96..104
  // D. The upper rails near the well: x: 766..816, y: 105..142

  // Top stone wall repair at x: 746..764, y: 96..104
  for (let y = 96; y <= 104; y++) {
    for (let x = 746; x <= 764; x++) {
      const [r, g, b] = getPixel(x, y);
      if (isWoodOrPost(r, g, b)) {
        const [sr, sg, sb] = getPixel(x - 17, y);
        setPixel(x, y, sr, sg, sb);
      }
    }
  }

  // Upper rails near well: x: 766..816, y: 105..142
  for (let y = 105; y <= 142; y++) {
    for (let x = 766; x <= 816; x++) {
      const [r, g, b] = getPixel(x, y);
      if (isWoodOrPost(r, g, b)) {
        // Sample from open grass meadow to the left: x - 68
        const [gr, gg, gb] = getPixel(x - 68, y);
        setPixel(x, y, gr, gg, gb);
      }
    }
  }

  // Vertical fence: x: 746..766, y: 105..235
  for (let y = 105; y <= 235; y++) {
    for (let x = 746; x <= 766; x++) {
      const [r, g, b] = getPixel(x, y);
      if (isWoodOrPost(r, g, b)) {
        // Sample from meadow strip 1 tile left: x - 17
        const [gr, gg, gb] = getPixel(x - 17, y);
        setPixel(x, y, gr, gg, gb);
      }
    }
  }

  // Horizontal fence below cabin: x: 744..905, y: 236..260
  // Stop before flower box (x >= 900, y <= 242)
  for (let y = 236; y <= 260; y++) {
    for (let x = 744; x <= 905; x++) {
      const [r, g, b] = getPixel(x, y);
      if (isWoodOrPost(r, g, b)) {
        // Sample from open grass yard 1 tile above: y - 17
        let [gr, gg, gb] = getPixel(x, y - 17);
        if (isWoodOrPost(gr, gg, gb)) {
          [gr, gg, gb] = getPixel(x, y - 34);
        }
        setPixel(x, y, gr, gg, gb);
      }
    }
  }

  console.log('=== 2. PERFECT CLEANING OF STAGE 5 FENCE (SOUTHEAST PEN) ===');
  // Exact fence bands:
  // Top: y: 298..335, x: 748..956
  // Bottom: y: 444..480, x: 748..956
  // Left: x: 748..766, y: 330..455
  // Right: x: 938..958, y: 330..455

  // A. Top Fence (y: 298..335, x: 748..956)
  // Only replace wood pixels!
  for (let y = 298; y <= 335; y++) {
    for (let x = 748; x <= 956; x++) {
      const [r, g, b] = getPixel(x, y);
      if (isWoodOrPost(r, g, b)) {
        // Sample from the central horizontal aisle at y = 404 + ((y - 302) % 17)
        const targetY = 404 + ((y - 302) % 17 + 17) % 17;
        let sampleX = x;
        // Keep sampleX inside the valid central grass aisle (x: 768..923)
        if (sampleX < 768) sampleX = 768 + (x % 17);
        if (sampleX > 923) sampleX = 906 + (x % 17);
        const [gr, gg, gb] = getPixel(sampleX, targetY);
        setPixel(x, y, gr, gg, gb);
      }
    }
  }

  // B. Bottom Fence (y: 444..480, x: 748..956)
  for (let y = 444; y <= 480; y++) {
    for (let x = 748; x <= 956; x++) {
      const [r, g, b] = getPixel(x, y);
      if (isWoodOrPost(r, g, b)) {
        // If it overlaps the dirt plots at y <= 455:
        const inBLPlot = (x >= 768 && x <= 836 && y <= 455);
        const inBRPlot = (x >= 855 && x <= 923 && y <= 455);

        if (inBLPlot || inBRPlot) {
          // Restore dirt/plant from 1 tile above: y - 17
          const [dr, dg, db] = getPixel(x, y - 17);
          setPixel(x, y, dr, dg, db);
        } else {
          // Outside dirt: sample from central horizontal aisle at y = 404 + ((y - 455) % 17)
          const targetY = 404 + ((y - 455) % 17 + 17) % 17;
          let sampleX = x;
          if (sampleX < 768) sampleX = 768 + (x % 17);
          if (sampleX > 923) sampleX = 906 + (x % 17);
          const [gr, gg, gb] = getPixel(sampleX, targetY);
          setPixel(x, y, gr, gg, gb);
        }
      }
    }
  }

  // C. Left Fence (x: 748..766, y: 330..455)
  for (let y = 330; y <= 455; y++) {
    for (let x = 748; x <= 766; x++) {
      const [r, g, b] = getPixel(x, y);
      if (isWoodOrPost(r, g, b)) {
        // Sample from the central vertical grass aisle at x: 837 + (x - 748) % 17
        const sampleX = 837 + (x - 748) % 17;
        const [gr, gg, gb] = getPixel(sampleX, y);
        setPixel(x, y, gr, gg, gb);
      }
    }
  }

  // D. Right Fence (x: 938..958, y: 330..455)
  for (let y = 330; y <= 455; y++) {
    for (let x = 938; x <= 958; x++) {
      const [r, g, b] = getPixel(x, y);
      if (isWoodOrPost(r, g, b)) {
        // Sample from the central vertical grass aisle at x: 837 + (x - 938) % 17
        const sampleX = 837 + (x - 938) % 17;
        const [gr, gg, gb] = getPixel(sampleX, y);
        setPixel(x, y, gr, gg, gb);
      }
    }
  }

  // Save the master clean map
  const outJpg = 'public/assets/rpg/monastery_garden_map.jpg';
  await sharp(buf, { raw: { width: W, height: H, channels: 3 } })
    .jpeg({ quality: 95 })
    .toFile(outJpg);
  console.log('✓ Successfully saved public/assets/rpg/monastery_garden_map.jpg');

  // Generate verification crops matching the exact framing of the user screenshot
  // User screenshot shows x: 700..980, y: 40..510
  await sharp(outJpg)
    .extract({ left: 710, top: 40, width: 260, height: 470 })
    .toFile('scratch/user_view_verification.png');

  console.log('✓ Saved scratch/user_view_verification.png');
}

generatePerfectMap();
