const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const CHARACTERS = [
  { key: 'monk', dir: 'public/assets/rpg/npc/monk' },
  { key: 'rosalind', dir: 'public/assets/rpg/npc/rosalind' },
  { key: 'mechanic', dir: 'public/assets/rpg/npc/mechanic' },
  { key: 'mendel', dir: 'public/assets/rpg/npc/mendel' },
  { key: 'barnaby', dir: 'public/assets/rpg/npc/barnaby' },
  { key: 'fafa', dir: 'public/assets/rpg/npc/fafa' },
  { key: 'chaos', dir: 'public/assets/rpg/npc/chaos' }
];

async function fillHolesInExisting() {
  let totalFilled = 0;

  for (const c of CHARACTERS) {
    if (!fs.existsSync(c.dir)) continue;
    const files = fs.readdirSync(c.dir).filter(f => f.endsWith('.png'));
    let charFilled = 0;

    for (const f of files) {
      const p = path.join(c.dir, f);
      const { data, info } = await sharp(p).raw().toBuffer({ resolveWithObject: true });
      const W = info.width, H = info.height;
      let holes = 0;

      // Repeat filling passes until convergence (handles multi-pixel holes)
      let changed = true;
      while (changed) {
        changed = false;
        for (let y = 1; y < H - 1; y++) {
          for (let x = 1; x < W - 1; x++) {
            const idx = (y * W + x) * 4;
            if (data[idx + 3] === 0) {
              let hasL = false, hasR = false, hasU = false, hasD = false;
              for (let xx = 0; xx < x; xx++) {
                if (data[(y * W + xx) * 4 + 3] > 0) { hasL = true; break; }
              }
              for (let xx = x + 1; xx < W; xx++) {
                if (data[(y * W + xx) * 4 + 3] > 0) { hasR = true; break; }
              }
              for (let yy = 0; yy < y; yy++) {
                if (data[(yy * W + x) * 4 + 3] > 0) { hasU = true; break; }
              }
              for (let yy = y + 1; yy < H; yy++) {
                if (data[(yy * W + x) * 4 + 3] > 0) { hasD = true; break; }
              }

              if (hasL && hasR && hasU && hasD) {
                // If RGB was cleared to 0, sample from neighboring solid pixel
                if (data[idx] === 0 && data[idx + 1] === 0 && data[idx + 2] === 0) {
                  // Find nearest solid neighbor
                  let found = false;
                  for (let r = 1; r <= 3 && !found; r++) {
                    for (let dy = -r; dy <= r && !found; dy++) {
                      for (let dx = -r; dx <= r && !found; dx++) {
                        const nx = x + dx, ny = y + dy;
                        if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
                          const nIdx = (ny * W + nx) * 4;
                          if (data[nIdx + 3] > 0) {
                            data[idx] = data[nIdx];
                            data[idx + 1] = data[nIdx + 1];
                            data[idx + 2] = data[nIdx + 2];
                            found = true;
                          }
                        }
                      }
                    }
                  }
                }
                data[idx + 3] = 255; // Solid opaque!
                holes++;
                charFilled++;
                changed = true;
              }
            }
          }
        }
      }

      if (holes > 0) {
        await sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toFile(p);
      }
    }
    console.log(`${c.key}: filled ${charFilled} hole pixels across all frames`);
    totalFilled += charFilled;
  }

  // Also sync root NPC portraits
  fs.copyFileSync('public/assets/rpg/npc/monk/idle_0.png', 'public/assets/rpg/npc/npc_1_monk.png');
  fs.copyFileSync('public/assets/rpg/npc/rosalind/idle_0.png', 'public/assets/rpg/npc/npc_2_geneticist.png');
  fs.copyFileSync('public/assets/rpg/npc/mechanic/idle_0.png', 'public/assets/rpg/npc/npc_3_mechanic.png');
  fs.copyFileSync('public/assets/rpg/npc/mendel/idle_0.png', 'public/assets/rpg/npc/npc_4_mendel.png');
  fs.copyFileSync('public/assets/rpg/npc/barnaby/idle_0.png', 'public/assets/rpg/npc/npc_5_farmer.png');
  fs.copyFileSync('public/assets/rpg/npc/fafa/idle_0.png', 'public/assets/rpg/npc/npc_6_assistant.png');
  fs.copyFileSync('public/assets/rpg/npc/chaos/idle_0.png', 'public/assets/rpg/npc/npc_8_chaos.png');
  console.log('Synced all root fallback portraits!');

  console.log(`\nSUCCESS: Total ${totalFilled} transparent hole pixels filled across all character bodies!`);
}

fillHolesInExisting().catch(console.error);
