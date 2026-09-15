const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const origPath = 'C:/Users/ADVAN/.gemini/antigravity-ide/brain/4266137e-7a8a-4970-86bc-f00ce079a0ad/.user_uploaded/media_1789097509051.jpg';

async function processMap() {
  const { data, info } = await sharp(origPath).raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const buffer = Buffer.from(data);

  function getPixel(x, y) {
    const idx = (y * W + x) * 3;
    return [buffer[idx], buffer[idx + 1], buffer[idx + 2]];
  }

  function setPixel(x, y, r, g, b) {
    const idx = (y * W + x) * 3;
    buffer[idx] = r;
    buffer[idx + 1] = g;
    buffer[idx + 2] = b;
  }

  // Is a pixel part of the wooden fence? (Wood is reddish-brown / amber)
  function isWood(r, g, b) {
    // Wood in Stardew Valley tiles:
    // r is higher than g, and b is relatively low.
    // e.g., r: 120-180, g: 60-120, b: 20-70.
    // Notice grass is green: g > r + 15.
    // Stone is gray: |r - g| < 15 and |g - b| < 15.
    // Dirt is brown: r: 160-200, g: 110-150, b: 60-90.
    return (r > g + 10 && r > 90 && b < 100);
  }

  // Is a pixel fence shadow on grass?
  function isFenceShadow(r, g, b) {
    // Shadow on green grass has lower brightness, but g is still higher than r and b
    return (g > r && g > b && g < 80 && r < 60);
  }

  // Let's create a clean grass tile pattern sampled from the open grass field in the left pen
  // In the left pen: x: 90..140, y: 315..345 is open green grass
  const sampleX = 95;
  const sampleY = 320;
  const tileSize = 17; // 17x17

  function getSampleGrassPixel(targetX, targetY) {
    // Wrap target coordinates to the 17x17 tile phase
    const offsetX = ((targetX % tileSize) + tileSize) % tileSize;
    const offsetY = ((targetY % tileSize) + tileSize) % tileSize;
    const sx = sampleX + offsetX;
    const sy = sampleY + offsetY;
    return getPixel(sx, sy);
  }

  // 1. CLEAN STAGE 6 CABIN YARD (x: 746 to 805, y: 104 to 220)
  // Only remove wood pixels below the stone wall (y >= 105)
  // Stop before the well (well is at x >= 768, y >= 148)
  console.log('Cleaning Stage 6 Cabin Yard...');
  for (let y = 105; y <= 215; y++) {
    for (let x = 746; x <= 805; x++) {
      // Don't touch well: well is around x: 768..800, y: 148..205
      const isWell = (x >= 766 && x <= 805 && y >= 148 && y <= 208);
      // Don't touch wagon / cart at bottom: y >= 208
      const isCart = (y >= 206 && x >= 746 && x <= 770);
      
      if (!isWell && !isCart) {
        const [r, g, b] = getPixel(x, y);
        if (isWood(r, g, b) || (isFenceShadow(r, g, b) && y < 148)) {
          const [gr, gg, gb] = getSampleGrassPixel(x, y);
          setPixel(x, y, gr, gg, gb);
        }
      }
    }
  }

  // Also clean the vertical fence post that touched the stone wall at x: 746..762, y: 100..106
  for (let y = 98; y <= 106; y++) {
    for (let x = 746; x <= 762; x++) {
      const [r, g, b] = getPixel(x, y);
      if (isWood(r, g, b)) {
        // Below stone wall: grass
        if (y >= 104) {
          const [gr, gg, gb] = getSampleGrassPixel(x, y);
          setPixel(x, y, gr, gg, gb);
        } else {
          // Restore stone wall from adjacent stone wall column (e.g. x - 20)
          const [sr, sg, sb] = getPixel(x - 25, y);
          setPixel(x, y, sr, sg, sb);
        }
      }
    }
  }

  // 2. CLEAN STAGE 5 FENCE (Southeast Pen, x: 746 to 962, y: 300 to 482)
  console.log('Cleaning Stage 5 Fence...');
  // The fence surrounds the 4 plots.
  // The plots are at x: 765..935, y: 335..475.
  // Let's identify fence areas:
  // Top fence: y: 300..334, x: 746..960
  // Bottom fence: y: 446..482, x: 746..960
  // Left fence: x: 746..768, y: 300..482
  // Right fence: x: 938..962, y: 300..482

  for (let y = 300; y <= 485; y++) {
    for (let x = 746; x <= 962; x++) {
      const isFenceZone = (
        (y >= 300 && y <= 334) ||     // Top rail & posts
        (y >= 446 && y <= 485) ||     // Bottom rail & posts
        (x >= 746 && x <= 768) ||     // Left rail & posts
        (x >= 938 && x <= 962)        // Right rail & posts
      );

      if (isFenceZone) {
        const [r, g, b] = getPixel(x, y);
        // If it's wood or fence drop-shadow on grass
        if (isWood(r, g, b) || isFenceShadow(r, g, b)) {
          // Check if we are near the pea signpost (signpost is inside bottom-right plot at x: 865, y: 435, not in fence zone)
          const [gr, gg, gb] = getSampleGrassPixel(x, y);
          setPixel(x, y, gr, gg, gb);
        }
      }
    }
  }

  // Save the new clean map
  const outPath = 'public/assets/rpg/monastery_garden_map.jpg';
  await sharp(buffer, { raw: { width: W, height: H, channels: 3 } })
    .jpeg({ quality: 94 })
    .toFile(outPath);
  console.log('✓ Saved clean monastery_garden_map.jpg');

  // Extract test crops for visual verification
  await sharp(outPath)
    .extract({ left: 660, top: 40, width: 150, height: 180 })
    .toFile('scratch/test_clean_cabin_yard.png');

  await sharp(outPath)
    .extract({ left: 730, top: 290, width: 245, height: 210 })
    .toFile('scratch/test_clean_stage5.png');

  console.log('✓ Test crops saved in scratch/');
}

processMap();
