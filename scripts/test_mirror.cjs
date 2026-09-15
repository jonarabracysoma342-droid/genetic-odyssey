const sharp = require('sharp');
const origPath = 'C:/Users/ADVAN/.gemini/antigravity-ide/brain/4266137e-7a8a-4970-86bc-f00ce079a0ad/.user_uploaded/media_1789097509051.jpg';

async function testBorderCloning() {
  const { data, info } = await sharp(origPath).raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const buf = Buffer.from(data);

  function getPixel(x, y) {
    const idx = (y * W + x) * 3;
    return [buf[idx], buf[idx+1], buf[idx+2]];
  }

  function setPixel(x, y, r, g, b) {
    const idx = (y * W + x) * 3;
    buf[idx] = r;
    buf[idx+1] = g;
    buf[idx+2] = b;
  }

  // Let's check coordinates:
  // Left pen (Stage 4) inner grass bounds:
  // Top curb grass: y around 300 to 335
  // Left curb grass: x around 70 to 105
  // Right curb grass: x around 285 to 320
  // Bottom curb grass: y around 475 to 505

  // Right pen (Stage 5) coordinates:
  // Top fence is at y: 298 to 330, x: 748 to 956
  // In the left pen, y: 298 to 330, x: 748 - 750 + 70... let's check corresponding x!
  // Left pen starts at x = 70. Right pen starts at x = 750.
  // Delta X = 750 - 70 = 680!
  // Width of left pen: 316 - 70 = 246px.
  // Width of right pen: 996 - 750 = 246px!
  // THEY ARE EXACTLY 246px WIDE EACH!
  // AND EXACTLY 680px APART! (x_right = x_left + 680!)
  console.log('Testing Delta X = 680 between Stage 4 and Stage 5...');

  // In the left pen:
  // x: 70..316, y: 300..500
  // Where in the left pen is open grass?
  // Top strip: y: 300..330, x: 70..210 (above tables) -> matches Stage 5 top fence!
  // Bottom strip: y: 465..505, x: 70..316 (below tables) -> matches Stage 5 bottom fence!
  // Left strip: x: 70..95, y: 300..500 -> matches Stage 5 left fence!
  // Right strip: x: 290..316, y: 300..500 -> matches Stage 5 right fence!

  // Let's test copying the clean grass from Stage 4 to replace the fence in Stage 5:
  // 1. Top fence of Stage 5: y = 298..332, x = 748..956
  for (let y = 298; y <= 332; y++) {
    for (let x = 748; x <= 956; x++) {
      // In left pen, x - 680. But tables in left pen are at x: 120..210, y: 340..420 (below y: 335!)
      // So at y: 298..332, left pen is 100% pure open grass!
      const srcX = x - 680;
      const srcY = y;
      const [r, g, b] = getPixel(srcX, srcY);
      setPixel(x, y, r, g, b);
    }
  }

  // 2. Bottom fence of Stage 5: y = 448..482, x = 748..956
  for (let y = 448; y <= 482; y++) {
    for (let x = 748; x <= 956; x++) {
      // In left pen, at y: 448..482, x: 70..170 and 220..316 is open grass
      // Let's sample from bottom grass row:
      let srcX = x - 680;
      let srcY = y;
      // If srcX falls on the southern chair (x: 165..185 in left pen), shift sample x
      if (srcX >= 160 && srcX <= 190) {
        srcX -= 34; // shift 2 tiles left to open grass
      }
      const [r, g, b] = getPixel(srcX, srcY);
      setPixel(x, y, r, g, b);
    }
  }

  // 3. Left fence of Stage 5: x = 748..768, y = 330..450
  for (let y = 330; y <= 450; y++) {
    for (let x = 748; x <= 768; x++) {
      let srcX = x - 680;
      let srcY = y;
      // Left strip in left pen is open grass
      const [r, g, b] = getPixel(srcX, srcY);
      setPixel(x, y, r, g, b);
    }
  }

  // 4. Right fence of Stage 5: x = 936..958, y = 330..450
  for (let y = 330; y <= 450; y++) {
    for (let x = 936; x <= 958; x++) {
      let srcX = x - 680;
      let srcY = y;
      const [r, g, b] = getPixel(srcX, srcY);
      setPixel(x, y, r, g, b);
    }
  }

  // STAGE 6 CABIN YARD FENCE:
  // Vertical fence: x: 746..766, y: 104..208
  // Horizontal fence: x: 760..805, y: 104..142
  // We can sample open grass from the northern orchard meadow (e.g. x: 685..730, y: 104..142)
  for (let y = 104; y <= 142; y++) {
    for (let x = 746; x <= 805; x++) {
      // sample from x - 68 (which is in the open yard meadow at x: 678..737)
      const srcX = x - 68;
      const srcY = y;
      const [r, g, b] = getPixel(srcX, srcY);
      setPixel(x, y, r, g, b);
    }
  }

  for (let y = 142; y <= 208; y++) {
    for (let x = 746; x <= 766; x++) {
      // sample from x - 34 or x - 68
      const srcX = x - 51;
      const srcY = y;
      const [r, g, b] = getPixel(srcX, srcY);
      setPixel(x, y, r, g, b);
    }
  }

  // Clean the post touching the stone wall at x: 746..762, y: 96..104
  for (let y = 96; y <= 104; y++) {
    for (let x = 746; x <= 762; x++) {
      // sample stone wall from x - 34
      const [r, g, b] = getPixel(x - 34, y);
      setPixel(x, y, r, g, b);
    }
  }

  await sharp(buf, { raw: { width: W, height: H, channels: 3 } })
    .jpeg({ quality: 95 })
    .toFile('scratch/test_mirror_fences.jpg');

  await sharp('scratch/test_mirror_fences.jpg')
    .extract({ left: 660, top: 40, width: 160, height: 190 })
    .toFile('scratch/test_mirror_cabin.png');

  await sharp('scratch/test_mirror_fences.jpg')
    .extract({ left: 730, top: 280, width: 250, height: 230 })
    .toFile('scratch/test_mirror_stage5.png');

  console.log('✓ Created test crops with Delta X matching!');
}

testBorderCloning();
