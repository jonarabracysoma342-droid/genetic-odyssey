const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputPath = 'C:/Users/ADVAN/.gemini/antigravity-ide/brain/4266137e-7a8a-4970-86bc-f00ce079a0ad/.user_uploaded/media_1789118755552.png';
const outDir = path.resolve('public/assets/rpg/npc');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function sliceNPCs() {
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;

  const characters = [
    { id: 'npc_1_monk', col: 0, row: 0, name: 'Bruder Thomas (Stage 1)' },
    { id: 'npc_2_geneticist', col: 1, row: 0, name: 'Prof. Rosalind (Stage 2)' },
    { id: 'npc_3_mechanic', col: 2, row: 0, name: 'Gigi Mekanik (Stage 3)' },
    { id: 'npc_4_mendel', col: 3, row: 0, name: 'Pater Mendel (Stage 4)' },
    { id: 'npc_5_farmer', col: 0, row: 1, name: 'Pak Barnaby (Stage 5)' },
    { id: 'npc_6_assistant', col: 1, row: 1, name: 'Kak Nisa (Stage 6)' },
    { id: 'npc_7_drone', col: 2, row: 1, name: 'Snooper Bot (Stage 7)' },
    { id: 'npc_8_chaos', col: 3, row: 1, name: 'Dr. Chaos (Stage 8)' },
  ];

  const colWidth = 256;
  const rowHeight = 279;

  for (const char of characters) {
    const startX = char.col * colWidth;
    const startY = char.row * rowHeight;
    const cellW = colWidth;
    const cellH = (char.row === 1) ? (H - startY) : rowHeight;

    // Create 4-channel buffer for this cell
    const cellBuf = Buffer.alloc(cellW * cellH * 4);

    for (let cy = 0; cy < cellH; cy++) {
      for (let cx = 0; cx < cellW; cx++) {
        const srcIdx = ((startY + cy) * W + (startX + cx)) * 4;
        const dstIdx = (cy * cellW + cx) * 4;
        cellBuf[dstIdx] = data[srcIdx];
        cellBuf[dstIdx + 1] = data[srcIdx + 1];
        cellBuf[dstIdx + 2] = data[srcIdx + 2];
        cellBuf[dstIdx + 3] = 255;
      }
    }

    // Helper: is this pixel part of the checkerboard background, divider lines, or top text label?
    const isBackground = (x, y) => {
      // Cell borders / divider lines
      if (x < 2 || x >= cellW - 2 || y < 2 || y >= cellH - 2) return true;
      // Top area containing title text (e.g. y < 45)
      if (y < 42) return true;

      const idx = (y * cellW + x) * 4;
      const r = cellBuf[idx];
      const g = cellBuf[idx + 1];
      const b = cellBuf[idx + 2];

      // Dark text labels on top
      if (y < 48 && (r < 60 && g < 60 && b < 60)) return true;

      // Checkerboard: near-neutral greys with r,g,b close to each other
      const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
      // Checkerboard is neutral grey between 95 and 200 with low saturation
      if (maxDiff <= 6 && r >= 95 && r <= 210) return true;

      // Black grid divider lines
      if (r <= 25 && g <= 25 && b <= 25 && (x <= 4 || x >= cellW - 5 || y <= 4 || y >= cellH - 5 || Math.abs(y - 279) <= 4)) return true;

      return false;
    };

    // BFS Flood Fill from edges to mark transparent pixels
    const visited = new Uint8Array(cellW * cellH);
    const queueX = [];
    const queueY = [];

    // Seed from borders
    for (let x = 0; x < cellW; x++) {
      queueX.push(x); queueY.push(0);
      queueX.push(x); queueY.push(cellH - 1);
      visited[0 * cellW + x] = 1;
      visited[(cellH - 1) * cellW + x] = 1;
    }
    for (let y = 0; y < cellH; y++) {
      queueX.push(0); queueY.push(y);
      queueX.push(cellW - 1); queueY.push(y);
      visited[y * cellW + 0] = 1;
      visited[y * cellW + (cellW - 1)] = 1;
    }

    let head = 0;
    while (head < queueX.length) {
      const qx = queueX[head];
      const qy = queueY[head];
      head++;

      // Set alpha to 0 for background
      const dstIdx = (qy * cellW + qx) * 4;
      cellBuf[dstIdx + 3] = 0;

      const neighbors = [
        [qx + 1, qy],
        [qx - 1, qy],
        [qx, qy + 1],
        [qx, qy - 1]
      ];

      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < cellW && ny >= 0 && ny < cellH) {
          const nIdx = ny * cellW + nx;
          if (!visited[nIdx]) {
            visited[nIdx] = 1;
            if (isBackground(nx, ny)) {
              queueX.push(nx);
              queueY.push(ny);
            }
          }
        }
      }
    }

    // Now find bounding box of remaining non-transparent pixels (the character)
    let minX = cellW, maxX = 0, minY = cellH, maxY = 0;
    let visibleCount = 0;

    for (let cy = 0; cy < cellH; cy++) {
      for (let cx = 0; cx < cellW; cx++) {
        const idx = (cy * cellW + cx) * 4;
        if (cellBuf[idx + 3] > 0) {
          visibleCount++;
          if (cx < minX) minX = cx;
          if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy;
          if (cy > maxY) maxY = cy;
        }
      }
    }

    console.log(`${char.name}: found ${visibleCount} pixels, bounds [${minX}, ${minY}] to [${maxX}, ${maxY}]`);

    // Add 2px padding
    minX = Math.max(0, minX - 2);
    minY = Math.max(0, minY - 2);
    maxX = Math.min(cellW - 1, maxX + 2);
    maxY = Math.min(cellH - 1, maxY + 2);

    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;

    const croppedBuf = Buffer.alloc(cropW * cropH * 4);
    for (let cy = 0; cy < cropH; cy++) {
      for (let cx = 0; cx < cropW; cx++) {
        const srcIdx = ((minY + cy) * cellW + (minX + cx)) * 4;
        const dstIdx = (cy * cropW + cx) * 4;
        croppedBuf[dstIdx] = cellBuf[srcIdx];
        croppedBuf[dstIdx + 1] = cellBuf[srcIdx + 1];
        croppedBuf[dstIdx + 2] = cellBuf[srcIdx + 2];
        croppedBuf[dstIdx + 3] = cellBuf[srcIdx + 3];
      }
    }

    const outPath = path.join(outDir, `${char.id}.png`);
    await sharp(croppedBuf, {
      raw: { width: cropW, height: cropH, channels: 4 }
    }).png().toFile(outPath);

    console.log(`Saved ${outPath} (${cropW}x${cropH})`);
  }
}

sliceNPCs().catch(console.error);
