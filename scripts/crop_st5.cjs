const sharp = require('sharp');
const orig = 'C:/Users/ADVAN/.gemini/antigravity-ide/brain/4266137e-7a8a-4970-86bc-f00ce079a0ad/.user_uploaded/media_1789097509051.jpg';

async function cropStage5Fence() {
  // Let's crop Stage 5 from orig:
  // x: 740 to 965, y: 290 to 495
  await sharp(orig)
    .extract({ left: 730, top: 290, width: 245, height: 210 })
    .toFile('scratch/st5_full_fence.png');
  console.log('Saved scratch/st5_full_fence.png');
}
cropStage5Fence();
