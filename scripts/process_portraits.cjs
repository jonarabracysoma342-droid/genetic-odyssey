const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outDir = path.resolve(__dirname, '../public/assets/portraits');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const userDir = 'C:/Users/ADVAN/.gemini/antigravity-ide/brain/4266137e-7a8a-4970-86bc-f00ce079a0ad/.user_uploaded/';

const configs = [
  {
    id: 'player_female',
    file: 'media_1789141362907.jpg',
    outName: 'player_female_portrait.png',
    isBg: (r, g, b) => {
      const min = Math.min(r, g, b);
      const diff = Math.max(r, g, b) - min;
      return min > 210 && diff < 30;
    }
  },
  {
    id: 'npc_thomas',
    file: 'media_1789141461441.jpg',
    outName: 'npc_thomas_portrait.png',
    isBg: (r, g, b) => {
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const diff = Math.max(r, g, b) - Math.min(r, g, b);
      if (lum > 155 && diff < 40) return true;
      if (r > 205 && g > 185 && b > 160 && diff < 55) return true;
      return false;
    }
  },
  {
    id: 'npc_rosalind',
    file: 'media_1789141515755.png',
    outName: 'npc_rosalind_portrait.png',
    isBg: (r, g, b) => {
      return r > 245 && g > 245 && b > 245;
    }
  },
  {
    id: 'npc_gigi',
    file: 'media_1789141577553.jpg',
    outName: 'npc_gigi_portrait.png',
    isBg: (r, g, b) => {
      const dist = Math.sqrt((r - 186)**2 + (g - 186)**2 + (b - 186)**2);
      return dist < 30;
    }
  },
  {
    id: 'npc_mendel',
    file: 'media_1789141658890.png',
    outName: 'npc_mendel_portrait.png',
    isBg: (r, g, b) => {
      const dist = Math.sqrt((r - 187)**2 + (g - 187)**2 + (b - 185)**2);
      return dist < 30;
    }
  }
];

async function processAll() {
  for (const cfg of configs) {
    const inputPath = path.join(userDir, cfg.file);
    const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { width, height } = info;
    const outData = Buffer.from(data);

    const visited = new Uint8Array(width * height);
    const queue = [];

    function pushCoord(x, y) {
      if (x < 0 || x >= width || y < 0 || y >= height) return;
      const idx = y * width + x;
      if (visited[idx]) return;
      visited[idx] = 1;
      queue.push(x, y);
    }

    // Seed border pixels
    for (let x = 0; x < width; x++) { pushCoord(x, 0); pushCoord(x, height - 1); }
    for (let y = 0; y < height; y++) { pushCoord(0, y); pushCoord(width - 1, y); }

    let head = 0;
    while (head < queue.length) {
      const x = queue[head++];
      const y = queue[head++];
      const pIdx = (y * width + x) * 4;
      const r = data[pIdx];
      const g = data[pIdx + 1];
      const b = data[pIdx + 2];

      if (cfg.isBg(r, g, b)) {
        outData[pIdx + 3] = 0; // Set transparent
        pushCoord(x + 1, y);
        pushCoord(x - 1, y);
        pushCoord(x, y + 1);
        pushCoord(x, y - 1);
      }
    }

    // Filter connected components to remove stray pixel specks
    const solidVisited = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (solidVisited[idx] || outData[idx * 4 + 3] === 0) continue;

        let compSize = 0;
        const q = [x, y];
        solidVisited[idx] = 1;
        const pixels = [idx];

        let h = 0;
        while (h < q.length) {
          const cx = q[h++];
          const cy = q[h++];
          compSize++;

          const nbs = [[cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1]];
          for (const [nx, ny] of nbs) {
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = ny * width + nx;
              if (!solidVisited[nIdx] && outData[nIdx * 4 + 3] > 0) {
                solidVisited[nIdx] = 1;
                q.push(nx, ny);
                pixels.push(nIdx);
              }
            }
          }
        }

        // If it is a tiny stray speck (< 500 pixels), erase it
        if (compSize < 500) {
          for (const p of pixels) {
            outData[p * 4 + 3] = 0;
          }
        }
      }
    }

    // Find bounding box to trim excess transparent margin
    let minX = width, maxX = 0, minY = height, maxY = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (outData[(y * width + x) * 4 + 3] > 0) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // Trim with 16px padding on sides and top, and anchor bottom
    const pad = 16;
    const cropX = Math.max(0, minX - pad);
    const cropY = Math.max(0, minY - pad);
    const cropW = Math.min(width - cropX, (maxX - cropX) + pad + 1);
    const cropH = height - cropY; // keep bottom anchored

    const trimmed = await sharp(outData, { raw: { width, height, channels: 4 } })
      .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
      .png({ compressionLevel: 9 })
      .toBuffer();

    const destPath = path.join(outDir, cfg.outName);
    fs.writeFileSync(destPath, trimmed);
    const meta = await sharp(destPath).metadata();
    console.log(`Exported ${cfg.outName}: ${meta.width}x${meta.height}, size: ${(trimmed.length/1024).toFixed(1)} KB`);
  }
}

processAll();
