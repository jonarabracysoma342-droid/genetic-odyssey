import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, '..');

// Directories to scan
const targetDirs = [
  path.join(projectRoot, 'public', 'assets'),
  path.join(projectRoot, 'src', 'assets')
];

async function convertPngToWebp(pngPath, webpPath) {
  try {
    // We use lossless: true for pixel art and graphics to keep them extremely sharp and pixel-perfect.
    // For general illustrations, we can also use quality: 100 or lossless: true.
    await sharp(pngPath)
      .webp({ lossless: true, quality: 100 })
      .toFile(webpPath);
    console.log(`Successfully converted: ${path.basename(pngPath)} -> ${path.basename(webpPath)}`);
  } catch (error) {
    console.error(`Failed to convert ${path.basename(pngPath)}:`, error);
  }
}

async function main() {
  for (const dir of targetDirs) {
    if (!fs.existsSync(dir)) continue;
    
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file.endsWith('.png')) {
        const pngPath = path.join(dir, file);
        const webpName = file.substring(0, file.length - 4) + '.webp';
        const webpPath = path.join(dir, webpName);
        
        await convertPngToWebp(pngPath, webpPath);
        
        // Remove the original PNG file
        try {
          fs.unlinkSync(pngPath);
          console.log(`Deleted original PNG: ${file}`);
        } catch (err) {
          console.error(`Failed to delete original PNG ${file}:`, err);
        }
      }
    }
  }
  console.log('Conversion complete!');
}

main();
