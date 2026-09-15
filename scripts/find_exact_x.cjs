const sharp = require('sharp');
const origPath = 'C:/Users/ADVAN/.gemini/antigravity-ide/brain/4266137e-7a8a-4970-86bc-f00ce079a0ad/.user_uploaded/media_1789097509051.jpg';

async function findExactX() {
  const { data, info } = await sharp(origPath).raw().toBuffer({ resolveWithObject: true });
  // Cabin fence at y = 260 across x = 740 to 950
  console.log('Scanning cabin fence at y = 260 across x:');
  let firstX = null, lastX = null;
  for (let x = 740; x <= 950; x++) {
    const idx = (260 * info.width + x) * 3;
    const r = data[idx], g = data[idx+1], b = data[idx+2];
    if (r > g + 10) {
      if (firstX === null) firstX = x;
      lastX = x;
    }
  }
  console.log('Cabin fence span at y=260: x =', firstX, 'to', lastX);

  // Stage 5 top fence at y = 310 across x = 740 to 960
  firstX = null; lastX = null;
  for (let x = 740; x <= 960; x++) {
    const idx = (310 * info.width + x) * 3;
    const r = data[idx], g = data[idx+1], b = data[idx+2];
    if (r > g + 10) {
      if (firstX === null) firstX = x;
      lastX = x;
    }
  }
  console.log('Stage 5 top fence span at y=310: x =', firstX, 'to', lastX);
}
findExactX();
