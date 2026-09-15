const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = path.resolve('public/assets/rpg/cabin_interior_bg.jpg');

async function patchAllCritters() {
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
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

  const patchDefs = [
    // 1. Orange Butterfly (upper left)
    { name: 'b1_orange', x1: 78, x2: 125, y1: 330, y2: 375, dx: 48 },
    // 2. Mouse 1 (upper right, near desk)
    { name: 'm1_topright', x1: 885, x2: 942, y1: 292, y2: 345, dx: -70 },
    // 3. Mouse 2 (mid left)
    { name: 'm2_midleft', x1: 72, x2: 125, y1: 420, y2: 472, dx: 55 },
    // 4. Purple Butterfly (mid-left of carpet)
    { name: 'b2_purple', x1: 165, x2: 215, y1: 508, y2: 556, dx: -60 },
    // 5. Cyan Butterfly (bottom left)
    { name: 'b3_cyan', x1: 105, x2: 155, y1: 704, y2: 755, dx: 55 },
    // 6. White Butterfly (bottom right)
    { name: 'b4_white', x1: 885, x2: 935, y1: 670, y2: 722, dx: -65 },
    // 7. Mouse 3 (bottom right floor)
    { name: 'm3_bottomright', x1: 915, x2: 990, y1: 735, y2: 788, dx: -80 }
  ];

  for (const p of patchDefs) {
    for (let y = p.y1; y <= p.y2; y++) {
      for (let x = p.x1; x <= p.x2; x++) {
        const [r, g, b] = getPixel(x + p.dx, y);
        setPixel(x, y, r, g, b);
      }
    }
  }

  // Overwrite public/assets/rpg/cabin_interior_bg.jpg
  await sharp(buf, { raw: { width: W, height: H, channels } })
    .jpeg({ quality: 96 })
    .toFile(inputPath);

  console.log('Successfully patched public/assets/rpg/cabin_interior_bg.jpg');

  // Also extract verification crops around each patched location
  for (const p of patchDefs) {
    const cropX = Math.max(0, p.x1 - 15);
    const cropY = Math.max(0, p.y1 - 15);
    const cropW = p.x2 - p.x1 + 30;
    const cropH = p.y2 - p.y1 + 30;
    await sharp(buf, { raw: { width: W, height: H, channels } })
      .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
      .toFile(`scratch/cleaned_${p.name}.png`);
  }
  console.log('Saved all scratch/cleaned_*.png verification crops');
}

patchAllCritters().catch(console.error);
