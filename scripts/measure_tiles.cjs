const sharp = require('sharp');
const orig = 'C:/Users/ADVAN/.gemini/antigravity-ide/brain/4266137e-7a8a-4970-86bc-f00ce079a0ad/.user_uploaded/media_1789097509051.jpg';

async function measureTiles() {
  const { data, info } = await sharp(orig).raw().toBuffer({ resolveWithObject: true });
  
  // Let's sample across x in the grass area x: 80 to 200 at y = 320
  // Each tile has a subtle border
  console.log('Finding tile boundaries in x...');
  for (let x = 80; x < 150; x++) {
    // vertical line darkness at x
    let d = 0;
    for (let y = 310; y < 350; y++) {
      const idx = (y * info.width + x) * 3;
      d += (data[idx] + data[idx+1] + data[idx+2]);
    }
    console.log(`x=${x}: ${Math.round(d/40)}`);
  }
}
measureTiles();
