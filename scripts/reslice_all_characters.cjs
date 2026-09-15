const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const CHARACTERS = [
  {
    key: 'mechanic',
    name: 'Gigi si Mekanik',
    inputPath: 'C:/Users/ADVAN/.gemini/antigravity-ide/brain/4266137e-7a8a-4970-86bc-f00ce079a0ad/.user_uploaded/media_1789133057381.jpg',
    outDir: path.resolve('public/assets/rpg/npc/mechanic'),
    actions: ['idle_0', 'wipe_0', 'wrench_0', 'goggles_0']
  },
  {
    key: 'mendel',
    name: 'Pater Gregor Mendel',
    inputPath: 'C:/Users/ADVAN/.gemini/antigravity-ide/brain/4266137e-7a8a-4970-86bc-f00ce079a0ad/.user_uploaded/media_1789133129130.jpg',
    outDir: path.resolve('public/assets/rpg/npc/mendel'),
    actions: ['idle_0', 'book_1', 'plant_0', 'book_0']
  },
  {
    key: 'barnaby',
    name: 'Pak Barnaby',
    inputPath: 'C:/Users/ADVAN/.gemini/antigravity-ide/brain/4266137e-7a8a-4970-86bc-f00ce079a0ad/.user_uploaded/media_1789133238429.jpg',
    outDir: path.resolve('public/assets/rpg/npc/barnaby'),
    actions: ['idle_0', 'pod_0', 'sweat_0', 'cheer_0']
  },
  {
    key: 'fafa',
    name: 'Kak Fafa',
    inputPath: 'C:/Users/ADVAN/.gemini/antigravity-ide/brain/4266137e-7a8a-4970-86bc-f00ce079a0ad/.user_uploaded/media_1789133382759.jpg',
    outDir: path.resolve('public/assets/rpg/npc/fafa'),
    actions: ['idle_0', 'wave_0', 'clipboard_0', 'point_0']
  }
];

async function sliceCharacter(char) {
  console.log(`\n========================================`);
  console.log(`Processing: ${char.name} (${char.key})`);
  console.log(`Source: ${char.inputPath}`);

  if (!fs.existsSync(char.outDir)) {
    fs.mkdirSync(char.outDir, { recursive: true });
  }

  const { data, info } = await sharp(char.inputPath).raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const channels = info.channels;

  const slices = [
    // Row 0: Walk Down (4 frames)
    { name: 'down_0', x: 0 * 128, y: 0, w: 128, h: 177 },
    { name: 'down_1', x: 1 * 128, y: 0, w: 128, h: 177 },
    { name: 'down_2', x: 2 * 128, y: 0, w: 128, h: 177 },
    { name: 'down_3', x: 3 * 128, y: 0, w: 128, h: 177 },

    // Row 1 left: Walk Right profile (4 frames)
    { name: 'right_0', x: 0 * 128, y: 178, w: 128, h: 177 },
    { name: 'right_1', x: 1 * 128, y: 178, w: 128, h: 177 },
    { name: 'right_2', x: 2 * 128, y: 178, w: 128, h: 177 },
    { name: 'right_3', x: 3 * 128, y: 178, w: 128, h: 177 },

    // Row 1 right: Walk Up / Back (4 frames)
    { name: 'up_0', x: 4 * 128, y: 178, w: 128, h: 177 },
    { name: 'up_1', x: 5 * 128, y: 178, w: 128, h: 177 },
    { name: 'up_2', x: 6 * 128, y: 178, w: 128, h: 177 },
    { name: 'up_3', x: 7 * 128, y: 178, w: 128, h: 177 },

    // Row 2: 4 actions, each 256px wide
    { name: char.actions[0], x: 0 * 256, y: 357, w: 256, h: 202 },
    { name: char.actions[1], x: 1 * 256, y: 357, w: 256, h: 202 },
    { name: char.actions[2], x: 2 * 256, y: 357, w: 256, h: 202 },
    { name: char.actions[3], x: 3 * 256, y: 357, w: 256, h: 202 }
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

    // Helper: is this pixel background checkerboard / black divider lines?
    const isBg = (x, y) => {
      // Outer 2 border pixels
      if (x <= 1 || x >= s.w - 2 || y <= 1 || y >= s.h - 2) return true;
      const idx = (y * s.w + x) * 4;
      const r = cellBuf[idx];
      const g = cellBuf[idx + 1];
      const b = cellBuf[idx + 2];

      // Black dividers / grid lines
      if (r <= 25 && g <= 25 && b <= 25) return true;

      // Checkerboard greys (strictly low saturation, neutral grey or white)
      const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
      if (maxDiff <= 12 && ((r >= 85 && r <= 195) || (r >= 225 && g >= 225 && b >= 225))) {
        return true;
      }

      return false;
    };

    // BFS Flood Fill from edges inwards
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
      cellBuf[dstIdx + 3] = 0; // Set alpha transparent

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

    // Connected Component Filter: Discard stray islands < 45 px
    const compVisited = new Uint8Array(s.w * s.h);
    for (let cy = 0; cy < s.h; cy++) {
      for (let cx = 0; cx < s.w; cx++) {
        const cIdx = cy * s.w + cx;
        if (cellBuf[cIdx * 4 + 3] > 0 && !compVisited[cIdx]) {
          let count = 0;
          const q = [cx, cy];
          compVisited[cIdx] = 1;
          let h = 0;
          const pixels = [];

          while (h < q.length) {
            const px = q[h++];
            const py = q[h++];
            pixels.push(py * s.w + px);
            count++;

            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = px + dx;
                const ny = py + dy;
                if (nx >= 0 && nx < s.w && ny >= 0 && ny < s.h) {
                  const nIdx = ny * s.w + nx;
                  if (cellBuf[nIdx * 4 + 3] > 0 && !compVisited[nIdx]) {
                    compVisited[nIdx] = 1;
                    q.push(nx, ny);
                  }
                }
              }
            }
          }

          if (count < 45) {
            for (const p of pixels) {
              cellBuf[p * 4 + 3] = 0;
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

    if (minX > maxX || minY > maxY) {
      console.warn(`Empty frame for ${s.name}!`);
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

    const outPath = path.join(char.outDir, `${s.name}.png`);
    await sharp(croppedBuf, {
      raw: { width: cropW, height: cropH, channels: 4 }
    }).png().toFile(outPath);

    console.log(`Saved ${s.name}.png (${cropW}x${cropH})`);
  }
}

async function main() {
  for (const c of CHARACTERS) {
    await sliceCharacter(c);
  }
  console.log('\nAll 4 characters sliced successfully!');
}

main().catch(console.error);
