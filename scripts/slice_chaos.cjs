const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputPath = 'C:/Users/ADVAN/.gemini/antigravity-ide/brain/4266137e-7a8a-4970-86bc-f00ce079a0ad/.user_uploaded/media_1789133537893.jpg';
const outDir = path.resolve('public/assets/rpg/npc/chaos');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function sliceChaos() {
  await sharp(inputPath).jpeg({ quality: 92 }).toFile('public/assets/rpg/npc/dr_chaos_spritesheet.jpg');
  console.log('Saved backup dr_chaos_spritesheet.jpg');

  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const channels = info.channels;

  const slices = [
    // Row 0: Walk Down (Front facing)
    { name: 'down_0', x: 0,   y: 0,   w: 170, h: 174 },
    { name: 'down_1', x: 171, y: 0,   w: 170, h: 174 },
    { name: 'down_2', x: 342, y: 0,   w: 170, h: 174 },

    // Row 0 & 1: Walk Right (Side profile walk cycle)
    { name: 'right_0', x: 512, y: 0,   w: 170, h: 174 },
    { name: 'right_1', x: 683, y: 0,   w: 170, h: 174 },
    { name: 'right_2', x: 854, y: 0,   w: 170, h: 174 },
    { name: 'right_3', x: 0,   y: 175, w: 170, h: 187 },
    { name: 'right_4', x: 171, y: 175, w: 170, h: 187 },
    { name: 'right_5', x: 342, y: 175, w: 170, h: 187 },

    // Row 2: Walk Up (Back view)
    { name: 'up_0', x: 0,   y: 363, w: 170, h: 196 },
    { name: 'up_1', x: 171, y: 363, w: 170, h: 196 },
    { name: 'up_2', x: 342, y: 363, w: 170, h: 196 },

    // Row 2: Iconic Villain Actions
    { name: 'potion_0', x: 512, y: 363, w: 170, h: 196 }, // Evil laugh with bubbling green mutagen beaker
    { name: 'point_0',  x: 683, y: 363, w: 170, h: 196 }, // Menacing commanding finger pointing
    { name: 'idle_0',   x: 854, y: 363, w: 170, h: 196 }, // Arms crossed arrogant smirk
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

    // Is pixel background checkerboard or black divider?
    const isBg = (x, y) => {
      if (x <= 4 || x >= s.w - 5 || y <= 1 || y >= s.h - 2) return true;
      const idx = (y * s.w + x) * 4;
      const r = cellBuf[idx];
      const g = cellBuf[idx + 1];
      const b = cellBuf[idx + 2];

      // Grid dividers
      if (r <= 35 && g <= 35 && b <= 35) return true;

      // Checkerboard white & grey
      const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
      if (maxDiff <= 14 && r >= 190 && g >= 190 && b >= 190) return true;

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
      cellBuf[dstIdx + 3] = 0; // Transparent

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

    // Discard tiny stray components (< 25 px) near borders
    const compVisited = new Uint8Array(s.w * s.h);
    for (let cy = 0; cy < s.h; cy++) {
      for (let cx = 0; cx < s.w; cx++) {
        const cIdx = cy * s.w + cx;
        if (cellBuf[cIdx * 4 + 3] > 0 && !compVisited[cIdx]) {
          let count = 0;
          const q = [cx, cy];
          compVisited[cIdx] = 1;
          let h = 0;
          let minX = cx, maxX = cx;
          const compPixels = [];

          while (h < q.length) {
            const px = q[h++];
            const py = q[h++];
            compPixels.push(py * s.w + px);
            count++;
            if (px < minX) minX = px;
            if (px > maxX) maxX = px;

            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const nx = px + dx;
                const ny = py + dy;
                if (nx >= 0 && nx < s.w && ny >= 0 && ny < s.h) {
                  const nIdx = ny * s.w + nx;
                  if (!compVisited[nIdx] && cellBuf[nIdx * 4 + 3] > 0) {
                    compVisited[nIdx] = 1;
                    q.push(nx, ny);
                  }
                }
              }
            }
          }

          if (count < 25 && (minX < 25 || maxX > s.w - 25)) {
            for (const pIdx of compPixels) {
              cellBuf[pIdx * 4 + 3] = 0;
            }
          }
        }
      }
    }

    // Find tight bounding box
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

sliceChaos().catch(console.error);
