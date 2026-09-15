const sharp = require('sharp');
const path = require('path');

const inputPath = path.resolve('public/assets/rpg/cabin_interior_bg.jpg');

async function extractLeftRegion() {
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  // Let's extract mid-left: x: 0..180, y: 400..650
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 3 } })
    .extract({ left: 0, top: 400, width: 220, height: 260 })
    .toFile('scratch/left_mid.png');
  console.log('Saved scratch/left_mid.png');
}

extractLeftRegion();
