const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dir = path.resolve('public/assets/rpg/npc');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));

async function clean() {
  for (const file of files) {
    const filePath = path.join(dir, file);
    const { data, info } = await sharp(filePath).raw().toBuffer({ resolveWithObject: true });
    const W = info.width;
    const H = info.height;

    // 1. Remove lone/island stray pixels (pixels with few non-transparent neighbors)
    for (let pass = 0; pass < 2; pass++) {
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const idx = (y * W + x) * 4;
          if (data[idx + 3] === 0) continue;

          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));

          // Check how many neighbors are solid
          let solidNeighbors = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
                const nIdx = (ny * W + nx) * 4;
                if (data[nIdx + 3] > 0) solidNeighbors++;
              }
            }
          }

          // If it's a lone grey pixel or isolated pixel, remove it
          if (maxDiff <= 8 && r >= 90 && r <= 220 && solidNeighbors <= 3) {
            data[idx + 3] = 0;
          } else if (solidNeighbors <= 1) {
            data[idx + 3] = 0;
          }
        }
      }
    }

    await sharp(data, {
      raw: { width: W, height: H, channels: 4 }
    }).png().toFile(filePath);

    console.log('Cleaned', file);
  }
}

clean().catch(console.error);
