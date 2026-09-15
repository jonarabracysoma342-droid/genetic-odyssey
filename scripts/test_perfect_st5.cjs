const sharp = require('sharp');
const origPath = 'C:/Users/ADVAN/.gemini/antigravity-ide/brain/4266137e-7a8a-4970-86bc-f00ce079a0ad/.user_uploaded/media_1789097509051.jpg';

async function testPerfectStage5() {
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
    buf[idx] = Math.max(0, Math.min(255, r));
    buf[idx + 1] = Math.max(0, Math.min(255, g));
    buf[idx + 2] = Math.max(0, Math.min(255, b));
  }

  // Sample Stage 4 with exact Delta X = 680, with color match (+4, +4, -2)
  function getStage4Matched(stage5X, stage5Y) {
    let srcX = stage5X - 680;
    let srcY = stage5Y;
    // In Stage 4, avoid the chalkboard at x: 160..240, y: 300..335
    if (srcY >= 298 && srcY <= 335 && srcX >= 155 && srcX <= 245) {
      // Shift left by 68px (4 tiles) to open grass
      srcX -= 68;
    }
    // In Stage 4, avoid the tree stump at x: 70..105, y: 460..500
    if (srcY >= 450 && srcX <= 110) {
      // Shift right by 68px
      srcX += 68;
    }
    // Avoid the southern chair at x: 165..185, y: 450..500
    if (srcY >= 450 && srcX >= 162 && srcX <= 188) {
      srcX += 34;
    }

    const [r, g, b] = getPixel(srcX, srcY);
    // Apply Stage 5 color tone adjustment (+4, +4, -2)
    return [r + 4, g + 4, b - 2];
  }

  // 1. Top fence corridor: y: 298 to 336, x: 748 to 962
  for (let y = 298; y <= 336; y++) {
    for (let x = 748; x <= 962; x++) {
      const [r, g, b] = getStage4Matched(x, y);
      setPixel(x, y, r, g, b);
    }
  }

  // 2. Left fence corridor: x: 748 to 766, y: 336 to 455
  for (let y = 336; y <= 455; y++) {
    for (let x = 748; x <= 766; x++) {
      const [r, g, b] = getStage4Matched(x, y);
      setPixel(x, y, r, g, b);
    }
  }

  // 3. Right fence corridor: x: 938 to 962, y: 336 to 455
  for (let y = 336; y <= 455; y++) {
    for (let x = 938; x <= 962; x++) {
      const [r, g, b] = getStage4Matched(x, y);
      setPixel(x, y, r, g, b);
    }
  }

  // 4. Bottom fence corridor: y: 455 to 485, x: 748 to 962
  for (let y = 455; y <= 485; y++) {
    for (let x = 748; x <= 962; x++) {
      const [r, g, b] = getStage4Matched(x, y);
      setPixel(x, y, r, g, b);
    }
  }

  // 5. Bottom edge of bottom-left plot (x: 768..836, y: 442..454)
  // Restore dirt from y - 17
  for (let y = 442; y <= 454; y++) {
    for (let x = 768; x <= 836; x++) {
      const [r, g, b] = getPixel(x, y);
      if (r > g + 10 || (r < 75 && g < 75)) {
        const [dr, dg, db] = getPixel(x, y - 17);
        setPixel(x, y, dr, dg, db);
      }
    }
  }

  // 6. Bottom edge of bottom-right plot (x: 855..923, y: 442..454)
  for (let y = 442; y <= 454; y++) {
    for (let x = 855; x <= 923; x++) {
      const [r, g, b] = getPixel(x, y);
      if (r > g + 10 || (r < 75 && g < 75)) {
        const [dr, dg, db] = getPixel(x, y - 17);
        setPixel(x, y, dr, dg, db);
      }
    }
  }

  // 7. Central grass aisle between bottom plots (x: 837 to 854, y: 442 to 454)
  for (let y = 442; y <= 454; y++) {
    for (let x = 837; x <= 854; x++) {
      const [gr, gg, gb] = getStage4Matched(x, y);
      setPixel(x, y, gr, gg, gb);
    }
  }

  await sharp(buf, { raw: { width: W, height: H, channels: 3 } })
    .extract({ left: 720, top: 280, width: 260, height: 230 })
    .toFile('scratch/test_st5_matched.png');

  console.log('Saved scratch/test_st5_matched.png');
}

testPerfectStage5();
