const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = path.resolve('public/assets/rpg/cabin_interior_bg.jpg');

async function inspectCritters() {
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const buf = Buffer.from(data);

  // Let's search in specific expected zones:
  // 1. Orange Butterfly (upper left, x: 20..100, y: 200..350)
  // 2. Mouse 1 (upper right, x: 860..960, y: 200..320)
  // 3. Mouse 2 (mid left, x: 20..100, y: 380..500)
  // 4. Butterfly 2 (Purple, x: 100..200, y: 480..600)
  // 5. Butterfly 3 (Cyan, x: 50..150, y: 560..700)
  // 6. Butterfly 4 (White, x: 860..940, y: 520..640)
  // 7. Mouse 3 (bottom right, x: 890..980, y: 580..720)

  const candidateRegions = [
    { name: 'orange_butterfly', x: 40, y: 240, w: 90, h: 90 },
    { name: 'mouse_1', x: 870, y: 210, w: 90, h: 90 },
    { name: 'mouse_2', x: 20, y: 420, w: 90, h: 90 },
    { name: 'purple_butterfly', x: 120, y: 500, w: 90, h: 90 },
    { name: 'cyan_butterfly', x: 60, y: 580, w: 90, h: 90 },
    { name: 'white_butterfly', x: 860, y: 540, w: 90, h: 90 },
    { name: 'mouse_3', x: 890, y: 600, w: 100, h: 90 },
  ];

  for (const c of candidateRegions) {
    await sharp(buf, { raw: { width: W, height: H, channels: 3 } })
      .extract({ left: c.x, top: c.y, width: c.w, height: c.h })
      .toFile(`scratch/critter_${c.name}.png`);
    console.log(`Extracted scratch/critter_${c.name}.png`);
  }
}

inspectCritters();
