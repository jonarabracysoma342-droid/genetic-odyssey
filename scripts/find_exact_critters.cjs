const sharp = require('sharp');
const path = require('path');

const inputPath = path.resolve('public/assets/rpg/cabin_interior_bg.jpg');

async function findExactCritters() {
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const buf = Buffer.from(data);

  // Let's define the 7 search windows based on visual layout
  // 1. Butterfly 1 (Orange, upper left): x: 30..100, y: 300..400
  // 2. Mouse 1 (Top right): x: 880..960, y: 270..350
  // 3. Mouse 2 (Mid left): x: 20..100, y: 500..600
  // 4. Butterfly 2 (Purple): x: 100..200, y: 600..700
  // 5. Butterfly 3 (Cyan): x: 50..150, y: 700..800
  // 6. Butterfly 4 (White): x: 860..940, y: 660..760
  // 7. Mouse 3 (Bottom right): x: 900..980, y: 730..806

  const critters = [
    { name: 'b1_orange', win: [30, 100, 300, 400], isTarget: (r,g,b) => r > 180 && g > 110 && b < 80 },
    { name: 'm1_topright', win: [870, 960, 260, 340], isTarget: (r,g,b) => Math.abs(r-g)<15 && Math.abs(r-b)<15 && r>110 && r<180 },
    { name: 'm2_midleft', win: [20, 100, 490, 580], isTarget: (r,g,b) => Math.abs(r-g)<15 && Math.abs(r-b)<15 && r>110 && r<180 },
    { name: 'b2_purple', win: [110, 190, 610, 690], isTarget: (r,g,b) => b > 120 && r > 90 && g < 110 },
    { name: 'b3_cyan', win: [50, 140, 710, 790], isTarget: (r,g,b) => b > 140 && g > 110 && r < 90 },
    { name: 'b4_white', win: [860, 950, 670, 750], isTarget: (r,g,b) => r > 200 && g > 190 && b > 150 },
    { name: 'm3_bottomright', win: [900, 980, 730, 804], isTarget: (r,g,b) => Math.abs(r-g)<15 && Math.abs(r-b)<15 && r>110 && r<180 }
  ];

  for (const c of critters) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    let count = 0;
    const [x1, x2, y1, y2] = c.win;
    for (let y = y1; y <= y2; y++) {
      for (let x = x1; x <= x2; x++) {
        const idx = (y * W + x) * 3;
        const r = buf[idx], g = buf[idx+1], b = buf[idx+2];
        if (c.isTarget(r, g, b)) {
          count++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    console.log(`${c.name}: count=${count}, bounds=[${minX}..${maxX}, ${minY}..${maxY}]`);
    if (count > 0) {
      const cx = Math.floor((minX + maxX) / 2);
      const cy = Math.floor((minY + maxY) / 2);
      await sharp(buf, { raw: { width: W, height: H, channels: 3 } })
        .extract({ left: cx - 40, top: cy - 40, width: 80, height: 80 })
        .toFile(`scratch/exact_${c.name}.png`);
    }
  }
}

findExactCritters();
