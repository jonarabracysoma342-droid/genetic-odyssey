const sharp = require('sharp');
const origPath = 'C:/Users/ADVAN/.gemini/antigravity-ide/brain/4266137e-7a8a-4970-86bc-f00ce079a0ad/.user_uploaded/media_1789097509051.jpg';

async function sampleStage5LocalGrass() {
  // In original Stage 5, the intersection of the horizontal and vertical aisles:
  // x: 837 to 854 (width 17px), y: 404 to 421 (height 17px)
  // This is a 100% pure, unblocked, authentic local Stage 5 grass tile!
  await sharp(origPath)
    .extract({ left: 837, top: 404, width: 17, height: 17 })
    .toFile('scratch/st5_local_tile.png');
  console.log('Saved scratch/st5_local_tile.png');
}
sampleStage5LocalGrass();
