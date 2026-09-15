const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputPath = 'C:/Users/ADVAN/.gemini/antigravity-ide/brain/4266137e-7a8a-4970-86bc-f00ce079a0ad/.user_uploaded/media_1789133537893.jpg';
const outDir = path.resolve('public/assets/rpg/npc/mendel');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function sliceMendel() {
  await sharp(inputPath).jpeg({ quality: 92 }).toFile('public/assets/rpg/npc/gregor_mendel_spritesheet.jpg');
  console.log('Saved backup gregor_mendel_spritesheet.jpg');

  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const channels = info.channels;

  // Exact cells based on our verified coordinate dump
  const slices = [
    // Walk Down (Front facing)
    { name: 'down_0', x: 20, y: 0, w: 125, h: 174 },
    { name: 'down_1', x: 190, y: 0, w: 130, h: 174 },
    { name: 'down_2', x: 365, y: 0, w: 125, h: 174 },

    // Walk Right (Profile)
    { name: 'right_0', x: 530, y: 0, w: 120, h: 174 },
    { name: 'right_1', x: 690, y: 0, w: 125, h: 174 },
    { name: 'right_2', x: 865, y: 0, w: 125, h: 174 },
    { name: 'right_3', x: 20, y: 175, w: 125, h: 185 },

    // Walk Up (Back facing)
    { name: 'up_0', x: 30, y: 362, w: 130, h: 195 },
    { name: 'up_1', x: 190, y: 362, w: 130, h: 195 },
    { name: 'up_2', x: 355, y: 362, w: 130, h: 195 },

    // Special Actions
    { name: 'idle_0',  x: 20, y: 0, w: 125, h: 174 }, // Front peaceful breathing
    { name: 'plant_0', x: 535, y: 362, w: 150, h: 195 }, // Magnifying glass + pea plant
    { name: 'book_0',  x: 700, y: 362, w: 140, h: 195 }, // Reading open genetics journal
    { name: 'book_1',  x: 875, y: 362, w: 130, h: 195 }, // Studying book notes
  ];

  for (const s of slices) {
    const cellBuf = Buffer.alloc(s.w * s.h * 4);

    for (let cy = 0; cy < s.h; cy++) {
      for (let cx = 0; cx < s.w; cx++) {
        const srcX = Math.min(W - 1, s.x + cx);
        const srcY = Math.min(H - 1, s.y + cy);
        const srcIdx = (srcY * W + srcX) * channels;
        const dstIdx = (cy * s.w + cx) * 4;
        cellBuf[dstIdx] = data[srcIdx];
        cellBuf[dstIdx + 1] = data[srcIdx + 1];
        cellBuf[dstIdx + 2] = data[srcIdx + 2];
        cellBuf[dstIdx + 3] = 255;
      }
    }

    // Is pixel background checkerboard or black divider line?
    const isBg = (x, y) => {
      // Out of bounds or outermost 1px edge
      if (x === 0 || x === s.w - 1 || y === 0 || y === s.h - 1) return true;
      const idx = (y * s.w + x) * 4;
      const r = cellBuf[idx];
      const g = cellBuf[idx + 1];
      const b = cellBuf[idx + 2];

      // Black dividers / borders
      if (r <= 32 && g <= 32 && b <= 32) return true;

      // Checkerboard greys (low saturation grey squares)
      const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
      if (maxDiff <= 12 && ((r >= 85 && r <= 145) || (r >= 180 && r <= 255))) return true;

      return false;
    };

    // BFS Flood Fill from edges
    const visited = new Uint8Array(s.w * s.h);
    const queueX = [];
    const queueY = [];

    for (let x = 0; x < s.w; x++) {
      queueX.push(x); queueY.push(0); visited[0 * s.w + x] = 1;
      queueX.push(x); queueY.push(s.h - 1); visited[(s.h - 1) * s.w + x] = 1;
    }
    for (let y = 0; y < s.h; y++) {
      queueX.push(0); queueY.push(y); visited[y * s.w + 0] = 1;
      queueX.push(s.w - 1); queueY.push(y); visited[y * s.w + (s.w - 1)] = 1;
    }

    let head = 0;
    while (head < queueX.length) {
      const qx = queueX[head];
      const qy = queueY[head];
      head++;

      const dstIdx = (qy * s.w + qx) * 4;
      cellBuf[dstIdx + 3] = 0; // Set to Transparent

      const neighbors = [
        [qx + 1, qy],
        [qx - 1, qy],
        [qx, qy + 1],
        [qx, qy - 1]
      ];

      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < s.w && ny >= 0 && ny < s.h) {
          const nIdx = ny * s.w + nx;
          if (!visited[nIdx]) {
            visited[nIdx] = 1;
            if (isBg(nx, ny)) {
              queueX.push(nx);
              queueY.push(ny);
            }
          }
        }
      }
    }

    // Clean stray isolated noise pixels
    for (let y = 0; y < s.h; y++) {
      for (let x = 0; x < s.w; x++) {
        const idx = (y * s.w + x) * 4;
        if (cellBuf[idx + 3] === 0) continue;
        const r = cellBuf[idx];
        const g = cellBuf[idx + 1];
        const b = cellBuf[idx + 2];
        const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));

        let solidNeighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < s.w && ny >= 0 && ny < s.h) {
              if (cellBuf[(ny * s.w + nx) * 4 + 3] > 0) solidNeighbors++;
            }
          }
        }

        if ((maxDiff <= 12 && ((r >= 85 && r <= 145) || (r >= 180 && r <= 255)) && solidNeighbors <= 3) || solidNeighbors <= 1) {
          cellBuf[idx + 3] = 0;
        }
      }
    }

    // Find tight bounding box of remaining solid pixels
    let minX = s.w, maxX = 0, minY = s.h, maxY = 0;
    for (let cy = 0; cy < s.h; cy++) {
      for (let cx = 0; cx < s.w; cx++) {
        if (cellBuf[(cy * s.w + cx) * 4 + 3] > 0) {
          if (cx < minX) minX = cx;
          if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy;
          if (cy > maxY) maxY = cy;
        }
      }
    }

    if (minX > maxX) {
      console.warn('Warning: no pixels found for ' + s.name);
      continue;
    }

    minX = Math.max(0, minX - 1);
    minY = Math.max(0, minY - 1);
    maxX = Math.min(s.w - 1, maxX + 1);
    maxY = Math.min(s.h - 1, maxY + 1);

    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;

    const croppedBuf = Buffer.alloc(cropW * cropH * 4);
    for (let cy = 0; cy < cropH; cy++) {
      for (let cx = 0; cx < cropW; cx++) {
        const srcIdx = ((minY + cy) * s.w + (minX + cx)) * 4;
        const dstIdx = (cy * cropW + cx) * 4;
        croppedBuf[dstIdx] = cellBuf[srcIdx];
        croppedBuf[dstIdx + 1] = cellBuf[srcIdx + 1];
        croppedBuf[dstIdx + 2] = cellBuf[srcIdx + 2];
        croppedBuf[dstIdx + 3] = cellBuf[srcIdx + 3];
      }
    }

    const outPath = path.join(outDir, `${s.name}.png`);
    await sharp(croppedBuf, {
      raw: { width: cropW, height: cropH, channels: 4 }
    }).png().toFile(outPath);

    console.log(`Saved ${outPath} (${cropW}x${cropH})`);
  }
}

sliceMendel().catch(console.error);
