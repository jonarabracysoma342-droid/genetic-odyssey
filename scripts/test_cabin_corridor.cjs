const sharp = require('sharp');
const origPath = 'C:/Users/ADVAN/.gemini/antigravity-ide/brain/4266137e-7a8a-4970-86bc-f00ce079a0ad/.user_uploaded/media_1789097509051.jpg';

async function testCabinCorridor() {
  const { data, info } = await sharp(origPath).raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const buf = Buffer.from(data);

  function getPixel(x, y) {
    const idx = (y * W + x) * 3;
    return [buf[idx], buf[idx + 1], buf[idx + 2]];
  }

  function setPixel(x, y, r, g, b) {
    const idx = (y * W + x) * 3;
    buf[idx] = r;
    buf[idx + 1] = g;
    buf[idx + 2] = b;
  }

  // 1. Repair stone wall at top post: x: 746..765, y: 96..104
  for (let y = 96; y <= 104; y++) {
    for (let x = 746; x <= 765; x++) {
      const [r, g, b] = getPixel(x - 34, y);
      setPixel(x, y, r, g, b);
    }
  }

  // 2. Rails near the well: x: 766..816, y: 105..136
  for (let y = 105; y <= 136; y++) {
    for (let x = 766; x <= 816; x++) {
      // sample from yard grass to the left: x - 68
      const [r, g, b] = getPixel(x - 68, y);
      setPixel(x, y, r, g, b);
    }
  }

  // 3. Vertical fence corridor: x: 746 to 765, y: 105 to 235
  // Replace the entire width with grass from x - 17 (open meadow beside the path)
  for (let y = 105; y <= 235; y++) {
    for (let x = 746; x <= 765; x++) {
      const [r, g, b] = getPixel(x - 17, y);
      setPixel(x, y, r, g, b);
    }
  }

  // 4. Horizontal fence corridor: x: 746 to 900, y: 236 to 258
  // Replace the entire height with grass from y - 22 (open yard grass above)
  for (let y = 236; y <= 258; y++) {
    for (let x = 746; x <= 900; x++) {
      const [r, g, b] = getPixel(x, y - 22);
      setPixel(x, y, r, g, b);
    }
  }

  // Also corner intersection: x: 746 to 765, y: 236 to 258
  for (let y = 236; y <= 258; y++) {
    for (let x = 746; x <= 765; x++) {
      const [r, g, b] = getPixel(x - 17, y - 22);
      setPixel(x, y, r, g, b);
    }
  }

  await sharp(buf, { raw: { width: W, height: H, channels: 3 } })
    .extract({ left: 710, top: 40, width: 260, height: 230 })
    .toFile('scratch/test_cabin_corridor.png');

  console.log('Saved scratch/test_cabin_corridor.png');
}

testCabinCorridor();
