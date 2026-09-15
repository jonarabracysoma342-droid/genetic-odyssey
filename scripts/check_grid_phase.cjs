const sharp = require('sharp');
const orig = 'C:/Users/ADVAN/.gemini/antigravity-ide/brain/4266137e-7a8a-4970-86bc-f00ce079a0ad/.user_uploaded/media_1789097509051.jpg';

async function checkStage5GridPhase() {
  const { data, info } = await sharp(orig).raw().toBuffer({ resolveWithObject: true });
  // Central grass pathway between 4 plots: x around 840..865, y around 395..420
  console.log('Horizontal scan in Stage 5 central grass at y = 405:');
  for (let x = 840; x <= 865; x++) {
    const idx = (405 * info.width + x) * 3;
    const r = data[idx], g = data[idx+1], b = data[idx+2];
    console.log(`x=${x}: R=${r}, G=${g}, B=${b}`);
  }

  console.log('Vertical scan in Stage 5 central grass at x = 852:');
  for (let y = 390; y <= 420; y++) {
    const idx = (y * info.width + 852) * 3;
    const r = data[idx], g = data[idx+1], b = data[idx+2];
    console.log(`y=${y}: R=${r}, G=${g}, B=${b}`);
  }
}
checkStage5GridPhase();
