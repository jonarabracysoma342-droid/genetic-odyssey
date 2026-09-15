const sharp = require('sharp');
const dir = 'C:/Users/ADVAN/.gemini/antigravity-ide/brain/4266137e-7a8a-4970-86bc-f00ce079a0ad/.user_uploaded/';
const list = [
  'media_1789141362907.jpg',
  'media_1789141461441.jpg',
  'media_1789141515755.png',
  'media_1789141577553.jpg',
  'media_1789141658890.png'
];

async function identify() {
  for (let i = 0; i < list.length; i++) {
    const f = list[i];
    await sharp(dir + f)
      .resize(100, 133)
      .toFile(`scratch/thumb_${i}.png`);
    console.log(`Saved scratch/thumb_${i}.png for ${f}`);
  }
}
identify();
