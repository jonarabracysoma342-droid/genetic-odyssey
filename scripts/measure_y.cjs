const sharp = require('sharp');
const orig = 'C:/Users/ADVAN/.gemini/antigravity-ide/brain/4266137e-7a8a-4970-86bc-f00ce079a0ad/.user_uploaded/media_1789097509051.jpg';

async function measureY() {
  const { data, info } = await sharp(orig).raw().toBuffer({ resolveWithObject: true });
  for (let y = 300; y < 370; y++) {
    let d = 0;
    for (let x = 86; x < 102; x++) {
      const idx = (y * info.width + x) * 3;
      d += (data[idx] + data[idx+1] + data[idx+2]);
    }
    console.log(`y=${y}: ${Math.round(d/16)}`);
  }
}
measureY();
