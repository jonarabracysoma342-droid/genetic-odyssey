const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ASSETS_DIR = path.resolve('public/assets/microscope');

// Generates an authentic 4x scanning objective view (seamless circular field with low-power optics)
async function createScanning4x(inputPath, outputPath, options = {}) {
  const { scale = 0.70, brightness = 1.05 } = options;
  const scaledSize = Math.round(1024 * scale);

  // Soft circular mask for the inner specimen to blend seamlessly
  const circleMask = Buffer.from(`
    <svg width="${scaledSize}" height="${scaledSize}" viewBox="0 0 ${scaledSize} ${scaledSize}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="softMask" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fff" stop-opacity="1" />
          <stop offset="78%" stop-color="#fff" stop-opacity="1" />
          <stop offset="96%" stop-color="#fff" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#fff" stop-opacity="0" />
        </radialGradient>
      </defs>
      <circle cx="${scaledSize / 2}" cy="${scaledSize / 2}" r="${scaledSize / 2}" fill="url(#softMask)" />
    </svg>
  `);

  // Resize the main specimen and apply the smooth circular alpha mask
  const innerSpecimen = await sharp(inputPath)
    .resize(scaledSize, scaledSize, { fit: 'cover' })
    .modulate({ brightness })
    .composite([{ input: circleMask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Create authentic brightfield condenser aperture background
  const bgAperture = Buffer.from(`
    <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="condenserField" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
          <stop offset="70%" stop-color="#f8fafc" stop-opacity="1" />
          <stop offset="86%" stop-color="#cbd5e1" stop-opacity="0.95" />
          <stop offset="95%" stop-color="#475569" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#020617" stop-opacity="1" />
        </radialGradient>
      </defs>
      <rect width="1024" height="1024" fill="#020617" />
      <circle cx="512" cy="512" r="495" fill="url(#condenserField)" />
    </svg>
  `);

  const offset = Math.round((1024 - scaledSize) / 2);

  await sharp(bgAperture)
    .composite([
      {
        input: innerSpecimen,
        left: offset,
        top: offset,
        blend: 'over'
      }
    ])
    .jpeg({ quality: 93 })
    .toFile(outputPath);

  console.log('Created seamless 4x scanning view:', outputPath);
}

// Generates an authentic 40x high-power zoom view focusing into fine cellular ultrastructure
async function createHighPower40x(inputPath, outputPath, cropBox) {
  await sharp(inputPath)
    .extract(cropBox)
    .resize(1024, 1024, {
      kernel: sharp.kernel.lanczos3,
      fit: 'cover'
    })
    .sharpen({ sigma: 1.1, m1: 0.9, m2: 2.2 })
    .jpeg({ quality: 93 })
    .toFile(outputPath);

  console.log('Created authentic 40x high-power view:', outputPath);
}

async function run() {
  console.log('Regenerating seamless progressive magnification views...');

  // 1. Ercis Biji
  await createScanning4x(
    path.join(ASSETS_DIR, 'ercis_biji.jpg'),
    path.join(ASSETS_DIR, 'ercis_biji_4x.jpg'),
    { scale: 0.72 }
  );
  await createHighPower40x(
    path.join(ASSETS_DIR, 'ercis_biji.jpg'),
    path.join(ASSETS_DIR, 'ercis_biji_40x.jpg'),
    { left: 240, top: 220, width: 520, height: 520 }
  );

  // 2. Ercis Bunga
  await createScanning4x(
    path.join(ASSETS_DIR, 'ercis_bunga.jpg'),
    path.join(ASSETS_DIR, 'ercis_bunga_4x.jpg'),
    { scale: 0.72 }
  );
  await createHighPower40x(
    path.join(ASSETS_DIR, 'ercis_bunga.jpg'),
    path.join(ASSETS_DIR, 'ercis_bunga_40x.jpg'),
    { left: 220, top: 180, width: 500, height: 500 }
  );

  // 3. Ercis Serbuk Sari
  await createScanning4x(
    path.join(ASSETS_DIR, 'ercis_serbuk_sari.jpg'),
    path.join(ASSETS_DIR, 'ercis_serbuk_sari_4x.jpg'),
    { scale: 0.72 }
  );
  await createHighPower40x(
    path.join(ASSETS_DIR, 'ercis_serbuk_sari.jpg'),
    path.join(ASSETS_DIR, 'ercis_serbuk_sari_40x.jpg'),
    { left: 340, top: 320, width: 380, height: 420 }
  );

  // 4. Meiosis
  await createScanning4x(
    path.join(ASSETS_DIR, 'meiosis.jpg'),
    path.join(ASSETS_DIR, 'meiosis_4x.jpg'),
    { scale: 0.72 }
  );
  await createHighPower40x(
    path.join(ASSETS_DIR, 'meiosis.jpg'),
    path.join(ASSETS_DIR, 'meiosis_40x.jpg'),
    { left: 220, top: 340, width: 580, height: 380 }
  );

  // 5. Mutasi Sel Darah
  await createScanning4x(
    path.join(ASSETS_DIR, 'sickle_cell.jpg'),
    path.join(ASSETS_DIR, 'sickle_cell_4x.jpg'),
    { scale: 0.72 }
  );
  await createHighPower40x(
    path.join(ASSETS_DIR, 'sickle_cell.jpg'),
    path.join(ASSETS_DIR, 'sickle_cell_40x.jpg'),
    { left: 160, top: 120, width: 450, height: 450 }
  );

  console.log('All seamless magnification assets ready!');
}

run().catch(console.error);
