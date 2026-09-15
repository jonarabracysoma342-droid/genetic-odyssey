const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const origPath = 'C:/Users/ADVAN/.gemini/antigravity-ide/brain/4266137e-7a8a-4970-86bc-f00ce079a0ad/.user_uploaded/media_1789097509051.jpg';

async function inpaintFences() {
  const { data, info } = await sharp(origPath).raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const buf = Buffer.from(data);

  function getPixel(x, y) {
    if (x < 0) x = 0; if (x >= W) x = W - 1;
    if (y < 0) y = 0; if (y >= H) y = H - 1;
    const idx = (y * W + x) * 3;
    return [buf[idx], buf[idx + 1], buf[idx + 2]];
  }

  function setPixel(x, y, r, g, b) {
    if (x < 0 || x >= W || y < 0 || y >= H) return;
    const idx = (y * W + x) * 3;
    buf[idx] = r;
    buf[idx + 1] = g;
    buf[idx + 2] = b;
  }

  // Detect wood pixel (fence posts, rails, post caps, post shadows)
  // Wood in Stardew Valley: reddish-brown / amber
  // R is significantly higher than G, and B is low.
  // Grass in Stardew: G is significantly higher than R (e.g. G > R + 15).
  // Stone: R, G, B are roughly equal (|R-G| < 18, |G-B| < 18).
  // Dirt: R: 160-210, G: 115-155, B: 60-95.
  function isWood(r, g, b) {
    // Post highlight/body:
    const isBrightWood = (r > 100 && r > g + 12 && b < 95);
    // Post shadow/outline:
    const isDarkWood = (r > 45 && r < 105 && r > g + 8 && b < 60);
    // Deep post shadow on grass:
    const isPostShadow = (r < 55 && g < 65 && b < 45 && (r > g - 5));
    return isBrightWood || isDarkWood || isPostShadow;
  }

  // --- 1. CLEAN STAGE 6 CABIN YARD FENCE ---
  // In Cabin Yard:
  // We want to remove BOTH:
  // - The vertical fence post & railing: x: 744..766, y: 96..240
  // - The horizontal fence in front of the cabin: x: 744..936, y: 236..260
  // - And the top rails near the well: x: 760..822, y: 105..142
  console.log('Inpainting Stage 6 Cabin Yard Fences...');

  // A. Top fence post touching stone wall (y: 96..104, x: 744..764)
  for (let y = 96; y <= 104; y++) {
    for (let x = 744; x <= 764; x++) {
      const [r, g, b] = getPixel(x, y);
      if (isWood(r, g, b)) {
        // Sample clean stone wall from x - 34
        const [sr, sg, sb] = getPixel(x - 34, y);
        setPixel(x, y, sr, sg, sb);
      }
    }
  }

  // B. Upper fence rails near well (x: 746..822, y: 105..142)
  for (let y = 105; y <= 142; y++) {
    for (let x = 746; x <= 822; x++) {
      if (x >= 816 && y >= 135) continue; // Cabin wall
      const [r, g, b] = getPixel(x, y);
      if (isWood(r, g, b)) {
        // Replace with adjacent grass at x - 68 (open yard meadow)
        const [gr, gg, gb] = getPixel(x - 68, y);
        setPixel(x, y, gr, gg, gb);
      }
    }
  }

  // C. Vertical fence posts going down to the horizontal fence: x: 744..766, y: 142..238
  for (let y = 142; y <= 238; y++) {
    for (let x = 744; x <= 766; x++) {
      const [r, g, b] = getPixel(x, y);
      if (isWood(r, g, b)) {
        // Sample grass from x - 51 (open meadow beside the path)
        const [gr, gg, gb] = getPixel(x - 51, y);
        setPixel(x, y, gr, gg, gb);
      }
    }
  }

  // D. The horizontal fence below cabin (x: 744..936, y: 236..260)
  // Notice: The flower planter is at x: 900..936, y: 190..240
  // The fence is at y: 236..258, from x: 744 to x: 900 (left and right of the gap)
  for (let y = 236; y <= 260; y++) {
    for (let x = 744; x <= 905; x++) {
      const [r, g, b] = getPixel(x, y);
      if (isWood(r, g, b)) {
        // Replace with grass from 1 tile above: y - 17
        const [gr, gg, gb] = getPixel(x, y - 17);
        // Ensure the sampled pixel is grass, not wood
        if (!isWood(gr, gg, gb)) {
          setPixel(x, y, gr, gg, gb);
        } else {
          const [gr2, gg2, gb2] = getPixel(x, y - 34);
          setPixel(x, y, gr2, gg2, gb2);
        }
      }
    }
  }

  // --- 2. CLEAN STAGE 5 FENCE (SOUTHEAST PEN) ---
  console.log('Inpainting Stage 5 Fence...');
  // The fence is ONLY in the perimeter bands:
  // Top: y: 298..336, x: 746..962
  // Bottom: y: 446..485, x: 746..962
  // Left: x: 746..768, y: 300..485
  // Right: x: 938..962, y: 300..485

  // For each pixel in these perimeter bands:
  // IF and ONLY IF it is a wood pixel (post, rail, shadow):
  // Replace it with the nearest grass pixel (or dirt pixel if it's over a plot)!
  for (let y = 298; y <= 485; y++) {
    for (let x = 746; x <= 962; x++) {
      const inFenceZone = (
        (y >= 298 && y <= 336) ||
        (y >= 444 && y <= 485) ||
        (x >= 746 && x <= 768) ||
        (x >= 936 && x <= 962)
      );

      if (inFenceZone) {
        const [r, g, b] = getPixel(x, y);
        if (isWood(r, g, b)) {
          // Check if this wood pixel sits over a dirt plot:
          // Bottom-left plot: x: 768..836, y: 444..455
          // Bottom-right plot: x: 855..923, y: 444..455
          const inBLPlot = (x >= 768 && x <= 836 && y >= 442 && y <= 455);
          const inBRPlot = (x >= 855 && x <= 923 && y >= 442 && y <= 455);

          if (inBLPlot || inBRPlot) {
            // Restore dirt/plant from y - 17
            const [dr, dg, db] = getPixel(x, y - 17);
            setPixel(x, y, dr, dg, db);
          } else if (y <= 336) {
            // Top fence: sample grass from below it (y + 17) or above it
            let [gr, gg, gb] = getPixel(x, y + 17);
            if (isWood(gr, gg, gb)) {
              [gr, gg, gb] = getPixel(x, y + 25);
            }
            // If that hits a plot, sample from central aisle (x: 845, y)
            if (gr > gg) {
              [gr, gg, gb] = getPixel(845, y + 20);
            }
            setPixel(x, y, gr, gg, gb);
          } else if (y >= 444) {
            // Bottom fence (outside plots): sample grass from y - 17 or central grass
            let [gr, gg, gb] = getPixel(x, y - 17);
            if (isWood(gr, gg, gb) || gr > gg) {
              // sample from central horizontal aisle at y = 410
              [gr, gg, gb] = getPixel(x, 410);
            }
            setPixel(x, y, gr, gg, gb);
          } else if (x <= 768) {
            // Left fence: sample grass from x - 17 or x + 17
            let [gr, gg, gb] = getPixel(x - 10, y);
            if (isWood(gr, gg, gb) || gr > gg) {
              [gr, gg, gb] = getPixel(x + 17, y);
            }
            setPixel(x, y, gr, gg, gb);
          } else if (x >= 936) {
            // Right fence: sample grass from x - 17
            let [gr, gg, gb] = getPixel(x - 17, y);
            setPixel(x, y, gr, gg, gb);
          }
        }
      }
    }
  }

  const outJpg = 'public/assets/rpg/monastery_garden_map.jpg';
  await sharp(buf, { raw: { width: W, height: H, channels: 3 } })
    .jpeg({ quality: 95 })
    .toFile(outJpg);
  console.log('✓ Successfully generated inpaint monastery_garden_map.jpg');

  // Save verification crops
  await sharp(outJpg)
    .extract({ left: 720, top: 40, width: 230, height: 230 })
    .toFile('scratch/inpaint_cabin_crop.png');

  await sharp(outJpg)
    .extract({ left: 720, top: 280, width: 260, height: 230 })
    .toFile('scratch/inpaint_stage5_crop.png');

  console.log('✓ Saved inpaint verification crops in scratch/');
}

inpaintFences();
