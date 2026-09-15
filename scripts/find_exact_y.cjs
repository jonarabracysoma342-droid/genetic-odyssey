const sharp = require('sharp');
const origPath = 'C:/Users/ADVAN/.gemini/antigravity-ide/brain/4266137e-7a8a-4970-86bc-f00ce079a0ad/.user_uploaded/media_1789097509051.jpg';

async function findExactY() {
  const { data, info } = await sharp(origPath).raw().toBuffer({ resolveWithObject: true });
  // Find where the cabin fence is: scan vertically down x = 790 from y = 220 to 290
  console.log('Scanning x = 790 (cabin fence column):');
  for (let y = 230; y <= 285; y++) {
    const idx = (y * info.width + 790) * 3;
    const r = data[idx], g = data[idx+1], b = data[idx+2];
    // If wood: r > g + 15
    if (r > g + 10) {
      console.log(`Cabin fence wood at y=${y}: R=${r}, G=${g}, B=${b}`);
    }
  }

  // Find where Stage 5 fence is: scan vertically down x = 790 from y = 290 to 345
  console.log('\nScanning x = 790 (Stage 5 top fence column):');
  for (let y = 295; y <= 345; y++) {
    const idx = (y * info.width + 790) * 3;
    const r = data[idx], g = data[idx+1], b = data[idx+2];
    if (r > g + 10) {
      console.log(`Stage 5 top fence wood at y=${y}: R=${r}, G=${g}, B=${b}`);
    }
  }
}
findExactY();
