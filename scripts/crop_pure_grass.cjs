const sharp = require('sharp');
const origPath = 'C:/Users/ADVAN/.gemini/antigravity-ide/brain/4266137e-7a8a-4970-86bc-f00ce079a0ad/.user_uploaded/media_1789097509051.jpg';

async function cropPureGrass() {
  await sharp(origPath)
    .extract({ left: 85, top: 311, width: 34, height: 34 })
    .toFile('scratch/pure_grass_tile_2x2.png');
  console.log('Saved scratch/pure_grass_tile_2x2.png');
}
cropPureGrass();
