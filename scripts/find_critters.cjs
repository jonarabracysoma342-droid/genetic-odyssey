const sharp = require('sharp');
const path = require('path');

const inputPath = path.resolve('public/assets/rpg/cabin_interior_bg.jpg');

async function findCritters() {
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const buf = Buffer.from(data);

  // Let's find:
  // 1. Orange butterfly: high R, medium G, low B (R > 200, G > 100, B < 70)
  const orange = [];
  // 2. Purple butterfly: R > 110, B > 140, G < 100
  const purple = [];
  // 3. Cyan butterfly: B > 160, G > 120, R < 90
  const cyan = [];
  // 4. White butterfly: R > 210, G > 200, B > 160 near bottom right (x > 800, y > 500)
  const white = [];
  // 5. Grey mouse: R, G, B within 15 of each other, 100 < R < 190, but wood floor has R >> G >> B.
  // Wood floor typically has R around 100-150, G around 50-80, B around 20-50 (R - B > 50).
  // Mouse has grey: |R - B| < 25 and |R - G| < 25 and R > 80.
  const grey = [];

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 3;
      const r = buf[idx];
      const g = buf[idx + 1];
      const b = buf[idx + 2];

      if (r > 200 && g > 110 && g < 180 && b < 70 && x < 200) {
        orange.push({ x, y });
      }
      if (r > 100 && b > 130 && g < 110 && x < 300) {
        purple.push({ x, y });
      }
      if (b > 150 && g > 110 && r < 90 && x < 300) {
        cyan.push({ x, y });
      }
      if (r > 210 && g > 200 && b > 160 && x > 800 && y > 500) {
        white.push({ x, y });
      }
      if (Math.abs(r - b) < 20 && Math.abs(r - g) < 20 && r > 90 && r < 200) {
        // Exclude chalkboard (top right chalkboard has greyish tones? Chalkboard is at y < 60)
        // Exclude microscope (metal is grey, around x: 280-700, y: 150-250)
        // We only care about mice outside the desk
        if (y > 150 && (x < 150 || x > 800)) {
          grey.push({ x, y });
        }
      }
    }
  }

  function getBounds(arr, label) {
    if (arr.length === 0) {
      console.log(`${label}: NONE FOUND`);
      return;
    }
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of arr) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    console.log(`${label} (count ${arr.length}): x: [${minX}, ${maxX}], y: [${minY}, ${maxY}]`);
  }

  getBounds(orange, 'Orange Butterfly');
  getBounds(purple, 'Purple Butterfly');
  getBounds(cyan, 'Cyan Butterfly');
  getBounds(white, 'White Butterfly');
  
  // Cluster grey points into top-right, mid-left, bottom-right
  const m1 = grey.filter(p => p.x > 800 && p.y < 450);
  const m2 = grey.filter(p => p.x < 150);
  const m3 = grey.filter(p => p.x > 800 && p.y >= 450);

  getBounds(m1, 'Mouse 1 (top right)');
  getBounds(m2, 'Mouse 2 (mid left)');
  getBounds(m3, 'Mouse 3 (bottom right)');
}

findCritters();
