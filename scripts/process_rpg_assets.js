import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const userDir = 'C:/Users/ADVAN/.gemini/antigravity-ide/brain/4266137e-7a8a-4970-86bc-f00ce079a0ad/.user_uploaded/';
const outputDir = 'c:/Users/ADVAN/.gemini/antigravity-ide/scratch/genetic-odyssey/public/assets/rpg/';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to make white/near-white pixels transparent
async function removeWhiteBackground(inputPath, threshold = 238) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const buffer = Buffer.from(data);

  for (let i = 0; i < buffer.length; i += channels) {
    const r = buffer[i];
    const g = buffer[i + 1];
    const b = buffer[i + 2];

    // Check if pixel is near white / light gray background
    if (r >= threshold && g >= threshold && b >= threshold) {
      buffer[i + 3] = 0; // Alpha = 0 (fully transparent)
    }
  }

  return { buffer, width, height, channels };
}

// Trim bounding box of non-transparent pixels
function findBoundingBox(buffer, width, height, channels) {
  let minX = width, minY = height, maxX = 0, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const a = buffer[idx + 3];
      if (a > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { minX, minY, maxX, maxY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

async function processAssets() {
  console.log('Processing RPG Assets...');

  // 1. World Map
  const mapInput = path.join(userDir, 'media_1789097509051.jpg');
  const mapOutput = path.join(outputDir, 'monastery_garden_map.jpg');
  await sharp(mapInput)
    .jpeg({ quality: 92 })
    .toFile(mapOutput);
  console.log('✓ Created monastery_garden_map.jpg');

  // 2. Gamete Machine (Stage 3 Prop)
  const gameteInput = path.join(userDir, 'media_1789097553391.png');
  const { buffer: gBuf, width: gW, height: gH, channels: gCh } = await removeWhiteBackground(gameteInput, 240);
  const gBox = findBoundingBox(gBuf, gW, gH, gCh);
  
  await sharp(gBuf, { raw: { width: gW, height: gH, channels: gCh } })
    .extract({ left: Math.max(0, gBox.minX - 4), top: Math.max(0, gBox.minY - 4), width: Math.min(gW, gBox.w + 8), height: Math.min(gH, gBox.h + 8) })
    .png()
    .toFile(path.join(outputDir, 'prop_gamete_machine.png'));
  console.log('✓ Created prop_gamete_machine.png (transparent & cropped)');

  // 3. Punnett Blackboard (Stage 4 Prop)
  const punnettInput = path.join(userDir, 'media_1789097568488.png');
  const { buffer: pBuf, width: pW, height: pH, channels: pCh } = await removeWhiteBackground(punnettInput, 240);
  const pBox = findBoundingBox(pBuf, pW, pH, pCh);

  await sharp(pBuf, { raw: { width: pW, height: pH, channels: pCh } })
    .extract({ left: Math.max(0, pBox.minX - 4), top: Math.max(0, pBox.minY - 4), width: Math.min(pW, pBox.w + 8), height: Math.min(pH, pBox.h + 8) })
    .png()
    .toFile(path.join(outputDir, 'prop_punnett_board.png'));
  console.log('✓ Created prop_punnett_board.png (transparent & cropped)');

  // 4. Player Spritesheets (Male & Female)
  for (const [name, filename] of [
    ['female', 'media_1789097488499.png'],
    ['male', 'media_1789097495240.png']
  ]) {
    const pInput = path.join(userDir, filename);
    const { buffer, width, height, channels } = await removeWhiteBackground(pInput, 245);
    
    // Save full transparent sheet
    await sharp(buffer, { raw: { width, height, channels } })
      .png()
      .toFile(path.join(outputDir, `player_${name}_sheet.png`));
    console.log(`✓ Created player_${name}_sheet.png`);
  }

  console.log('All RPG assets processed successfully!');
}

processAssets().catch(console.error);
