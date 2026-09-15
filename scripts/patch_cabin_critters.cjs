const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = path.resolve('public/assets/rpg/cabin_interior_bg.jpg');

async function run() {
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const channels = info.channels;
  const buf = Buffer.from(data);

  console.log(`Loaded cabin bg: ${W}x${H}, channels: ${channels}`);

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

  // Define critter patch regions [x1, x2, y1, y2, sampleDx]
  const patches = [
    // 1. Butterfly 1 (Orange, upper left: ~35..85, 370..420) -> sample from x + 70
    { name: 'b1_orange', x1: 30, x2: 90, y1: 365, y2: 425, dx: 70 },
    // 2. Mouse 1 (Top right: ~880..940, 315..370) -> sample from x - 80
    { name: 'm1_topright', x1: 875, x2: 940, y1: 315, y2: 370, dx: -80 },
    // 3. Mouse 2 (Middle left: ~25..85, 540..590) -> sample from x + 75
    { name: 'm2_midleft', x1: 25, x2: 85, y1: 535, y2: 595, dx: 75 },
    // 4. Butterfly 2 (Purple: ~130..180, 650..700) -> sample from x - 70
    { name: 'b2_purple', x1: 125, x2: 185, y1: 645, y2: 705, dx: -70 },
    // 5. Butterfly 3 (Cyan: ~70..125, 725..775) -> sample from x + 75
    { name: 'b3_cyan', x1: 65, x2: 125, y1: 720, y2: 780, dx: 75 },
    // 6. Butterfly 4 (White: ~870..925, 685..735) -> sample from x - 75
    { name: 'b4_white', x1: 865, x2: 925, y1: 685, y2: 740, dx: -75 },
    // 7. Mouse 3 (Bottom right: ~910..980, 745..800) -> sample from x - 80
    { name: 'm3_bottomright', x1: 910, x2: 980, y1: 745, y2: 800, dx: -80 }
  ];

  // Apply horizontal wood patch
  for (const p of patches) {
    for (let y = p.y1; y <= p.y2; y++) {
      for (let x = p.x1; x <= p.x2; x++) {
        const [r, g, b] = getPixel(x + p.dx, y);
        setPixel(x, y, r, g, b);
      }
    }
  }

  // Save patched full image
  const outPath = path.resolve('public/assets/rpg/cabin_interior_bg_clean.jpg');
  await sharp(buf, { raw: { width: W, height: H, channels } })
    .jpeg({ quality: 95 })
    .toFile(outPath);

  console.log(`Saved clean background to ${outPath}`);

  // Also extract test preview crops to scratch
  if (!fs.existsSync('scratch')) fs.mkdirSync('scratch');
  for (const p of patches) {
    const cropW = p.x2 - p.x1 + 40;
    const cropH = p.y2 - p.y1 + 40;
    const cropX = Math.max(0, p.x1 - 20);
    const cropY = Math.max(0, p.y1 - 20);
    await sharp(buf, { raw: { width: W, height: H, channels } })
      .extract({ left: cropX, top: cropY, width: Math.min(cropW, W - cropX), height: Math.min(cropH, H - cropY) })
      .toFile(`scratch/patch_${p.name}.png`);
  }
  console.log('Saved test preview crops to scratch/');
}

run().catch(console.error);
