const sharp = require('sharp');
const orig = 'C:/Users/ADVAN/.gemini/antigravity-ide/brain/4266137e-7a8a-4970-86bc-f00ce079a0ad/.user_uploaded/media_1789097509051.jpg';

async function checkSymmetry() {
  const { data, info } = await sharp(orig).raw().toBuffer({ resolveWithObject: true });
  // Find cobblestone path edges for left pen:
  // Left pen stone border: y around 300 to 500, x around 60..80 and 300..330
  // Right pen stone border: y around 300 to 500, x around 730..755 and 970..995
  console.log('Map width:', info.width, 'height:', info.height);
  
  // Crop empty grass from left pen (e.g. bottom-left corner or top-left corner where there are no tables)
  // Look at scratch/orig_stage4_pen.png:
  // Around x: 70..140, y: 300..340 is open grass!
  // And around x: 230..300, y: 440..500 is open grass!
  await sharp(orig)
    .extract({ left: 80, top: 310, width: 100, height: 100 })
    .toFile('scratch/open_grass_sample.png');
  console.log('Saved open_grass_sample.png');
}
checkSymmetry();
