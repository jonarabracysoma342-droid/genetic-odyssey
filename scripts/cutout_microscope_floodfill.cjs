const sharp = require('sharp');
const fs = require('fs');

async function processImage() {
  const { data, info } = await sharp('public/microscope_ref.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const visited = new Uint8Array(width * height);
  const queue = [];

  // Helper to check if pixel is near pure background white
  function isBgColor(idx) {
    const r = data[idx * channels];
    const g = data[idx * channels + 1];
    const b = data[idx * channels + 2];
    // Background in studio render is near 255, 255, 255
    return r >= 242 && g >= 242 && b >= 242;
  }

  // Seed flood fill from image perimeter
  for (let x = 0; x < width; x++) {
    const topIdx = x;
    const bottomIdx = (height - 1) * width + x;
    if (isBgColor(topIdx)) { visited[topIdx] = 1; queue.push(topIdx); }
    if (isBgColor(bottomIdx)) { visited[bottomIdx] = 1; queue.push(bottomIdx); }
  }

  for (let y = 0; y < height; y++) {
    const leftIdx = y * width;
    const rightIdx = y * width + (width - 1);
    if (isBgColor(leftIdx) && !visited[leftIdx]) { visited[leftIdx] = 1; queue.push(leftIdx); }
    if (isBgColor(rightIdx) && !visited[rightIdx]) { visited[rightIdx] = 1; queue.push(rightIdx); }
  }

  // Also seed the opening inside the arm/neck area if it's connected or hollow
  // In a microscope, between the stage and arm, let's see if that connects or needs flood fill.
  // First run flood fill on external background
  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    const cx = curr % width;
    const cy = Math.floor(curr / width);

    const neighbors = [
      cx > 0 ? curr - 1 : -1,
      cx < width - 1 ? curr + 1 : -1,
      cy > 0 ? curr - width : -1,
      cy < height - 1 ? curr + width : -1
    ];

    for (const n of neighbors) {
      if (n !== -1 && !visited[n] && isBgColor(n)) {
        visited[n] = 1;
        queue.push(n);
      }
    }
  }

  // Also check interior hollow area behind the objective nosepiece & arm
  // Sample point around (x: 520, y: 380) in a 1024x1024 image
  const interiorSamples = [
    { x: Math.round(width * 0.52), y: Math.round(height * 0.36) },
    { x: Math.round(width * 0.54), y: Math.round(height * 0.40) }
  ];

  for (const pt of interiorSamples) {
    const idx = pt.y * width + pt.x;
    if (!visited[idx] && isBgColor(idx)) {
      visited[idx] = 1;
      queue.push(idx);
    }
  }

  while (head < queue.length) {
    const curr = queue[head++];
    const cx = curr % width;
    const cy = Math.floor(curr / width);

    const neighbors = [
      cx > 0 ? curr - 1 : -1,
      cx < width - 1 ? curr + 1 : -1,
      cy > 0 ? curr - width : -1,
      cy < height - 1 ? curr + width : -1
    ];

    for (const n of neighbors) {
      if (n !== -1 && !visited[n] && isBgColor(n)) {
        visited[n] = 1;
        queue.push(n);
      }
    }
  }

  // Construct RGBA output
  const out = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];
    
    out[i * 4] = r;
    out[i * 4 + 1] = g;
    out[i * 4 + 2] = b;

    if (visited[i]) {
      // It's background: feather edges slightly if bordering object
      out[i * 4 + 3] = 0;
    } else {
      // Solid microscope body
      out[i * 4 + 3] = 255;
    }
  }

  await sharp(out, { raw: { width, height, channels: 4 } })
    .png()
    .toFile('public/microscope_reference_cutout.png');

  console.log('Finished creating public/microscope_reference_cutout.png');
}

processImage().catch(console.error);
