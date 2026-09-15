const sharp = require('sharp');
const path = require('path');

const pristinePath = path.resolve('public/assets/rpg/cabin_interior_stage6.jpg');
const outputPath = path.resolve('public/assets/rpg/cabin_interior_bg.jpg');

async function patchPerfect() {
  const { data, info } = await sharp(pristinePath).raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const channels = info.channels;
  const buf = Buffer.from(data);

  function getPixel(x, y) {
    const idx = (y * W + x) * channels;
    return [buf[idx], buf[idx + 1], buf[idx + 2]];
  }

  function setPixel(x, y, r, g, b) {
    const idx = (y * W + x) * channels;
    buf[idx] = r;
    buf[idx + 1] = g;
    buf[idx + 2] = b;
  }

  // 1. Orange Butterfly (upper left): x: 78..125, y: 312..375
  for (let y = 312; y <= 375; y++) {
    for (let x = 78; x <= 125; x++) {
      const [r, g, b] = getPixel(x + 50, y);
      setPixel(x, y, r, g, b);
    }
  }

  // 2. Mouse 1 (upper right, near desk)
  for (let y = 288; y <= 330; y++) {
    for (let x = 885; x <= 932; x++) {
      const [r, g, b] = getPixel(x - 22, y);
      setPixel(x, y, r, g, b);
    }
  }
  for (let y = 295; y <= 325; y++) {
    for (let x = 933; x <= 942; x++) {
      const [r, g, b] = getPixel(x, y + 20);
      setPixel(x, y, r, g, b);
    }
  }
  for (let y = 280; y <= 294; y++) {
    for (let x = 933; x <= 942; x++) {
      const [r, g, b] = getPixel(x, y - 16);
      setPixel(x, y, r, g, b);
    }
  }

  // 3. Mouse 2 (mid left): x: 72..125, y: 418..472
  for (let y = 418; y <= 472; y++) {
    for (let x = 72; x <= 125; x++) {
      const [r, g, b] = getPixel(x + 55, y);
      setPixel(x, y, r, g, b);
    }
  }

  // 4. Purple Butterfly (mid left carpet): x: 165..215, y: 508..556
  for (let y = 508; y <= 556; y++) {
    for (let x = 165; x <= 215; x++) {
      const [r, g, b] = getPixel(x - 60, y);
      setPixel(x, y, r, g, b);
    }
  }

  // 5. Cyan Butterfly (bottom left): x: 105..155, y: 704..755
  for (let y = 704; y <= 755; y++) {
    for (let x = 105; x <= 155; x++) {
      const [r, g, b] = getPixel(x + 55, y);
      setPixel(x, y, r, g, b);
    }
  }

  // 6. White Butterfly (bottom right): x: 890..932, y: 672..715
  for (let y = 672; y <= 715; y++) {
    for (let x = 890; x <= 932; x++) {
      const [r, g, b] = getPixel(x - 65, y);
      setPixel(x, y, r, g, b);
    }
  }

  // 7. Mouse 3 (bottom right): x: 915..995, y: 712..765
  for (let y = 712; y <= 765; y++) {
    for (let x = 915; x <= 995; x++) {
      const [r, g, b] = getPixel(x - 80, y);
      setPixel(x, y, r, g, b);
    }
  }

  await sharp(buf, { raw: { width: W, height: H, channels } })
    .jpeg({ quality: 96 })
    .toFile(outputPath);

  console.log('Saved perfect clean cabin interior to', outputPath);
}

patchPerfect().catch(console.error);
