const sharp = require('sharp');
const orig = 'C:/Users/ADVAN/.gemini/antigravity-ide/brain/4266137e-7a8a-4970-86bc-f00ce079a0ad/.user_uploaded/media_1789097509051.jpg';

async function findGrid() {
  const { data, info } = await sharp(orig).raw().toBuffer({ resolveWithObject: true });
  
  // Find vertical grid lines in grass
  console.log('--- Horizontal scan across grass at x=690..750 ---');
  for (let x = 690; x <= 750; x++) {
    let sum = 0;
    for (let y = 140; y < 170; y++) {
      const idx = (y * info.width + x) * 3;
      sum += data[idx] + data[idx + 1] + data[idx + 2];
    }
    const avg = Math.round(sum / 30);
    // Find dark grid lines
    if (x % 2 === 0) console.log(`x=${x}: ${avg}`);
  }
}
findGrid();
