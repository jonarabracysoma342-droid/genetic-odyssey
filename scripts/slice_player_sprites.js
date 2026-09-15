import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const outPlayerDir = 'c:/Users/ADVAN/.gemini/antigravity-ide/scratch/genetic-odyssey/public/assets/rpg/player/';
if (!fs.existsSync(outPlayerDir)) {
  fs.mkdirSync(outPlayerDir, { recursive: true });
}

async function sliceSprites() {
  const sheetPath = 'public/assets/rpg/player_female_sheet.png';
  
  // Row 0: Down (0,1,2,3), Up (4,5,6), Right (7)
  const row0Y = 33;
  const row0H = 216;
  const row0Sprites = [
    { name: 'down_0.png', left: 25, width: 106 },
    { name: 'down_1.png', left: 146, width: 105 },
    { name: 'down_2.png', left: 266, width: 105 },
    { name: 'down_3.png', left: 386, width: 105 },
    { name: 'up_0.png', left: 531, width: 104 },
    { name: 'up_1.png', left: 650, width: 105 },
    { name: 'up_2.png', left: 771, width: 104 },
  ];

  for (const s of row0Sprites) {
    try {
      await sharp(sheetPath)
        .extract({ left: s.left, top: row0Y, width: s.width, height: row0H })
        .png()
        .toFile(path.join(outPlayerDir, s.name));
      console.log('Saved', s.name);
    } catch (e) {
      console.error('Failed on', s.name, e.message);
    }
  }

  // Row 1: Right walk cycle
  const row1Y = 322;
  const row1H = 214;
  const row1Sprites = [
    { name: 'right_0.png', left: 27, width: 91 },
    { name: 'right_1.png', left: 149, width: 101 },
    { name: 'right_2.png', left: 270, width: 91 },
    { name: 'right_3.png', left: 392, width: 104 },
  ];

  for (const s of row1Sprites) {
    const outPath = path.join(outPlayerDir, s.name);
    try {
      await sharp(sheetPath)
        .extract({ left: s.left, top: row1Y, width: s.width, height: row1H })
        .png()
        .toFile(outPath);
      console.log('Saved', s.name);

      // Create flipped left frame
      const leftName = s.name.replace('right_', 'left_');
      await sharp(outPath)
        .flop()
        .toFile(path.join(outPlayerDir, leftName));
      console.log('Saved', leftName);
    } catch (e) {
      console.error('Failed on', s.name, e.message);
    }
  }

  console.log('✓ Player sprite frames generated successfully!');
}

sliceSprites().catch(console.error);
