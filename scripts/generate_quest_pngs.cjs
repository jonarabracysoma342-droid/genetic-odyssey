const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../public/assets/rpg/quests');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Crisp 64x64 pixel art / RPG style vector SVGs converted to PNG
const assets = {
  'quest_icon.png': `
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <defs>
        <linearGradient id="bookGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#b45309"/>
          <stop offset="50%" stop-color="#78350f"/>
          <stop offset="100%" stop-color="#451a03"/>
        </linearGradient>
        <linearGradient id="goldRim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="50%" stop-color="#eab308"/>
          <stop offset="100%" stop-color="#a16207"/>
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#facc15" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#facc15" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <!-- Ambient Outer Glow -->
      <circle cx="48" cy="48" r="44" fill="url(#glow)"/>
      <!-- Drop Shadow -->
      <rect x="16" y="20" width="64" height="64" rx="14" fill="#0c0a09" opacity="0.6"/>
      <!-- Gold Outer Frame -->
      <rect x="14" y="16" width="68" height="64" rx="14" fill="url(#goldRim)"/>
      <rect x="18" y="20" width="60" height="56" rx="10" fill="#291206"/>
      <!-- Leather Cover Body -->
      <rect x="22" y="24" width="52" height="48" rx="8" fill="url(#bookGrad)"/>
      <!-- Spine Band -->
      <rect x="22" y="24" width="12" height="48" rx="4" fill="#451a03"/>
      <rect x="24" y="30" width="8" height="3" fill="#fde047"/>
      <rect x="24" y="46" width="8" height="3" fill="#fde047"/>
      <rect x="24" y="62" width="8" height="3" fill="#fde047"/>
      <!-- Center Emblem: Golden Exclamation / Quest Scroll Compass -->
      <circle cx="52" cy="48" r="15" fill="#451a03" stroke="#facc15" stroke-width="2.5"/>
      <circle cx="52" cy="48" r="11" fill="#78350f"/>
      <!-- Golden '!' Mark in Center -->
      <rect x="50" y="41" width="4" height="9" rx="2" fill="#fef08a"/>
      <circle cx="52" cy="53" r="2.2" fill="#fef08a"/>
      <!-- Corner Studs -->
      <circle cx="38" cy="30" r="2" fill="#fef08a"/>
      <circle cx="68" cy="30" r="2" fill="#fef08a"/>
      <circle cx="68" cy="66" r="2" fill="#fef08a"/>
    </svg>
  `,

  'item_magnifying_glass.png': `
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <defs>
        <radialGradient id="glassGlow" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
          <stop offset="50%" stop-color="#67e8f9" stop-opacity="0.45"/>
          <stop offset="100%" stop-color="#0284c7" stop-opacity="0.2"/>
        </radialGradient>
        <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="50%" stop-color="#ca8a04"/>
          <stop offset="100%" stop-color="#78350f"/>
        </linearGradient>
      </defs>
      <!-- Shadow -->
      <ellipse cx="50" cy="54" rx="36" ry="16" fill="#000000" opacity="0.4"/>
      <!-- Wooden Handle with brass fittings -->
      <rect x="52" y="52" width="12" height="34" rx="4" transform="rotate(-45 52 52)" fill="#5c2c16" stroke="#2b1406" stroke-width="2"/>
      <rect x="53" y="53" width="6" height="30" rx="2" transform="rotate(-45 52 52)" fill="#854d0e"/>
      <circle cx="71" cy="71" r="5" fill="url(#brass)"/>
      <!-- Brass Connector Neck -->
      <rect x="42" y="44" width="8" height="10" transform="rotate(-45 42 44)" fill="url(#brass)"/>
      <!-- Outer Brass Rim -->
      <circle cx="38" cy="38" r="28" fill="url(#brass)" stroke="#451a03" stroke-width="3"/>
      <!-- Lens Glass Reflection -->
      <circle cx="38" cy="38" r="22" fill="url(#glassGlow)" stroke="#38bdf8" stroke-width="1.5"/>
      <!-- Diagonal Sheen -->
      <path d="M22 28 Q 38 18 52 28 Q 38 32 22 28 Z" fill="#ffffff" opacity="0.65"/>
      <!-- Pea leaf sprout reflected inside lens -->
      <path d="M35 44 C 32 36 40 32 44 34 C 44 42 38 46 35 44 Z" fill="#22c55e"/>
      <circle cx="43" cy="40" r="3" fill="#84cc16"/>
    </svg>
  `,

  'item_dna_vial.png': `
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <defs>
        <linearGradient id="vialFluid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#38bdf8"/>
          <stop offset="50%" stop-color="#818cf8"/>
          <stop offset="100%" stop-color="#c084fc"/>
        </linearGradient>
      </defs>
      <!-- Shadow -->
      <ellipse cx="48" cy="84" rx="20" ry="8" fill="#000000" opacity="0.45"/>
      <!-- Glass Tube Body -->
      <rect x="34" y="24" width="28" height="52" rx="14" fill="#082f49" opacity="0.3"/>
      <!-- Fluid Inside -->
      <rect x="36" y="40" width="24" height="34" rx="12" fill="url(#vialFluid)" opacity="0.85"/>
      <!-- DNA Helix Strands inside fluid -->
      <circle cx="42" cy="48" r="3" fill="#ffffff"/>
      <circle cx="54" cy="54" r="3" fill="#fde047"/>
      <line x1="42" y1="48" x2="54" y2="54" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="54" cy="62" r="3" fill="#ffffff"/>
      <circle cx="42" cy="68" r="3" fill="#fde047"/>
      <line x1="54" y1="62" x2="42" y2="68" stroke="#ffffff" stroke-width="1.5"/>
      <!-- Glass Highlights -->
      <rect x="34" y="24" width="28" height="52" rx="14" fill="none" stroke="#bae6fd" stroke-width="3"/>
      <path d="M38 28 L38 68" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.8"/>
      <!-- Cork Stopper -->
      <rect x="38" y="16" width="20" height="10" rx="3" fill="#a16207" stroke="#713f12" stroke-width="1.5"/>
      <rect x="40" y="13" width="16" height="5" rx="2" fill="#ca8a04"/>
    </svg>
  `,

  'item_gear_cog.png': `
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <defs>
        <linearGradient id="bronzeGear" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="35%" stop-color="#d97706"/>
          <stop offset="70%" stop-color="#b45309"/>
          <stop offset="100%" stop-color="#451a03"/>
        </linearGradient>
      </defs>
      <!-- Shadow -->
      <ellipse cx="48" cy="54" rx="34" ry="16" fill="#000000" opacity="0.45"/>
      <!-- Outer Gear Silhouette (8 Teeth) -->
      <g fill="url(#bronzeGear)" stroke="#2b1103" stroke-width="3" stroke-linejoin="round">
        <rect x="42" y="10" width="12" height="76" rx="3"/>
        <rect x="10" y="42" width="76" height="12" rx="3"/>
        <rect x="42" y="10" width="12" height="76" rx="3" transform="rotate(45 48 48)"/>
        <rect x="10" y="42" width="76" height="12" rx="3" transform="rotate(45 48 48)"/>
        <circle cx="48" cy="48" r="30"/>
      </g>
      <!-- Inner Rim & Recess -->
      <circle cx="48" cy="48" r="22" fill="#78350f" stroke="#fef08a" stroke-width="2"/>
      <circle cx="48" cy="48" r="15" fill="#451a03"/>
      <!-- Center Axle Hole -->
      <rect x="44" y="44" width="8" height="8" rx="2" fill="#fef08a"/>
      <circle cx="48" cy="48" r="2.5" fill="#1c0a02"/>
      <!-- Bolt Studs -->
      <circle cx="48" cy="32" r="2.5" fill="#fef08a"/>
      <circle cx="48" cy="64" r="2.5" fill="#fef08a"/>
      <circle cx="32" cy="48" r="2.5" fill="#fef08a"/>
      <circle cx="64" cy="48" r="2.5" fill="#fef08a"/>
    </svg>
  `,

  'item_punnett_chalk.png': `
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <!-- Shadow -->
      <ellipse cx="48" cy="58" rx="34" ry="14" fill="#000000" opacity="0.4"/>
      <!-- Wooden Slate Board Beneath -->
      <rect x="18" y="24" width="60" height="48" rx="8" fill="#1e293b" stroke="#78350f" stroke-width="4"/>
      <!-- 2x2 Grid drawn on board in chalk lines -->
      <line x1="48" y1="30" x2="48" y2="66" stroke="#94a3b8" stroke-width="2" stroke-dasharray="3,2"/>
      <line x1="24" y1="48" x2="72" y2="48" stroke="#94a3b8" stroke-width="2" stroke-dasharray="3,2"/>
      <!-- Pure White Chalk Stick Resting on Slate -->
      <g transform="rotate(-30 48 48)">
        <rect x="26" y="44" width="46" height="12" rx="4" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
        <rect x="28" y="46" width="42" height="4" rx="2" fill="#ffffff"/>
        <!-- Paper grip wrapper -->
        <rect x="42" y="44" width="22" height="12" fill="#eab308" stroke="#78350f" stroke-width="1.5"/>
        <line x1="46" y1="45" x2="46" y2="55" stroke="#78350f" stroke-width="1"/>
        <line x1="56" y1="45" x2="56" y2="55" stroke="#78350f" stroke-width="1"/>
      </g>
    </svg>
  `,

  'item_harvest_shears.png': `
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <defs>
        <linearGradient id="bladeSteel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="50%" stop-color="#94a3b8"/>
          <stop offset="100%" stop-color="#475569"/>
        </linearGradient>
      </defs>
      <!-- Shadow -->
      <ellipse cx="48" cy="56" rx="32" ry="14" fill="#000000" opacity="0.4"/>
      <!-- Blade 1 -->
      <path d="M48 44 C 44 32 30 20 22 18 C 24 28 36 42 48 48 Z" fill="url(#bladeSteel)" stroke="#1e293b" stroke-width="2.5"/>
      <!-- Blade 2 -->
      <path d="M48 44 C 52 32 66 20 74 18 C 72 28 60 42 48 48 Z" fill="url(#bladeSteel)" stroke="#1e293b" stroke-width="2.5"/>
      <!-- Central Golden Pivot Screw -->
      <circle cx="48" cy="46" r="5" fill="#facc15" stroke="#78350f" stroke-width="2"/>
      <!-- Left Red Handle -->
      <path d="M44 48 C 36 56 26 66 28 78 C 30 84 40 84 42 76 C 44 70 42 56 46 50 Z" fill="#b91c1c" stroke="#450a0a" stroke-width="2.5"/>
      <!-- Right Red Handle -->
      <path d="M52 48 C 60 56 70 66 68 78 C 66 84 56 84 54 76 C 52 70 54 56 50 50 Z" fill="#b91c1c" stroke="#450a0a" stroke-width="2.5"/>
      <!-- Grip wraps -->
      <line x1="32" y1="72" x2="38" y2="70" stroke="#fef08a" stroke-width="2"/>
      <line x1="58" y1="70" x2="64" y2="72" stroke="#fef08a" stroke-width="2"/>
    </svg>
  `,

  'item_dihybrid_ledger.png': `
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <defs>
        <linearGradient id="ledgerCover" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#15803d"/>
          <stop offset="60%" stop-color="#166534"/>
          <stop offset="100%" stop-color="#052e16"/>
        </linearGradient>
      </defs>
      <!-- Shadow -->
      <rect x="18" y="24" width="60" height="56" rx="10" fill="#000000" opacity="0.45"/>
      <!-- Parchment Pages Rim -->
      <rect x="22" y="18" width="56" height="58" rx="8" fill="#fef3c7" stroke="#b45309" stroke-width="2"/>
      <!-- Leather Green Hardcover -->
      <rect x="18" y="16" width="58" height="58" rx="8" fill="url(#ledgerCover)" stroke="#052e16" stroke-width="3"/>
      <!-- Spine -->
      <rect x="18" y="16" width="12" height="58" rx="3" fill="#14532d"/>
      <line x1="30" y1="16" x2="30" y2="74" stroke="#facc15" stroke-width="2"/>
      <!-- Golden Embossed 4x4 Dihybrid Grid on Cover -->
      <rect x="36" y="26" width="32" height="32" rx="4" fill="#052e16" stroke="#facc15" stroke-width="2"/>
      <line x1="44" y1="26" x2="44" y2="58" stroke="#facc15" stroke-width="1.2"/>
      <line x1="52" y1="26" x2="52" y2="58" stroke="#facc15" stroke-width="1.2"/>
      <line x1="60" y1="26" x2="60" y2="58" stroke="#facc15" stroke-width="1.2"/>
      <line x1="36" y1="34" x2="68" y2="34" stroke="#facc15" stroke-width="1.2"/>
      <line x1="36" y1="42" x2="68" y2="42" stroke="#facc15" stroke-width="1.2"/>
      <line x1="36" y1="50" x2="68" y2="50" stroke="#facc15" stroke-width="1.2"/>
      <!-- Red Silk Bookmark Ribbon Hanging Out -->
      <path d="M52 74 L52 86 L56 82 L60 86 L60 74 Z" fill="#dc2626"/>
    </svg>
  `,

  'item_bio_crystal.png': `
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <defs>
        <radialGradient id="crystalGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.9"/>
          <stop offset="60%" stop-color="#ec4899" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#0284c7" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <!-- Ambient Aura Glow -->
      <circle cx="48" cy="48" r="42" fill="url(#crystalGlow)"/>
      <!-- Shadow -->
      <ellipse cx="48" cy="80" rx="24" ry="8" fill="#000000" opacity="0.45"/>
      <!-- Multi-faceted Crystal Shard -->
      <!-- Center Facet -->
      <polygon points="48,12 66,34 58,74 48,84 38,74 30,34" fill="#0284c7" stroke="#082f49" stroke-width="2.5"/>
      <!-- Bright Front Highlight Facet -->
      <polygon points="48,12 58,36 48,76 38,36" fill="#38bdf8"/>
      <!-- Left Shading Facet -->
      <polygon points="48,12 30,34 38,74 48,76" fill="#0369a1" opacity="0.85"/>
      <!-- Right Vivid Violet/Pink Facet (Mutant Energy) -->
      <polygon points="48,12 66,34 58,74 48,76" fill="#f43f5e" opacity="0.75"/>
      <!-- Central Sparkling Core -->
      <polygon points="48,24 53,38 48,60 43,38" fill="#ffffff" opacity="0.9"/>
      <!-- Sparkle Stars -->
      <circle cx="68" cy="24" r="3" fill="#fde047"/>
      <circle cx="26" cy="62" r="2.5" fill="#67e8f9"/>
      <circle cx="72" cy="58" r="2" fill="#ffffff"/>
    </svg>
  `,

  'item_castle_insignia.png': `
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <defs>
        <linearGradient id="antiqueGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="50%" stop-color="#ca8a04"/>
          <stop offset="100%" stop-color="#78350f"/>
        </linearGradient>
      </defs>
      <!-- Shadow -->
      <ellipse cx="48" cy="80" rx="30" ry="10" fill="#000000" opacity="0.45"/>
      <!-- Ancient Medallion Seal -->
      <circle cx="48" cy="48" r="36" fill="url(#antiqueGold)" stroke="#2b1406" stroke-width="3"/>
      <circle cx="48" cy="48" r="28" fill="#451a03" stroke="#fef08a" stroke-width="2"/>
      <!-- Gothic Castle Gate Tower Crest -->
      <path d="M34 64 L34 40 L38 40 L38 34 L42 34 L42 40 L46 40 L46 32 L50 32 L50 40 L54 40 L54 34 L58 34 L58 40 L62 40 L62 64 Z" fill="url(#antiqueGold)" stroke="#1c0a02" stroke-width="1.5"/>
      <!-- Gate Portcullis Arch -->
      <path d="M42 64 L42 50 C 42 46 54 46 54 50 L54 64 Z" fill="#000000"/>
      <!-- DNA Helix Ribbon crossing through arch -->
      <path d="M30 48 Q 48 38 66 48" stroke="#ef4444" stroke-width="3" fill="none"/>
      <path d="M30 48 Q 48 58 66 48" stroke="#3b82f6" stroke-width="3" fill="none"/>
      <!-- Key Teeth Extension at bottom -->
      <rect x="45" y="74" width="6" height="12" fill="url(#antiqueGold)" stroke="#2b1406" stroke-width="1.5"/>
      <rect x="51" y="80" width="5" height="4" fill="url(#antiqueGold)"/>
    </svg>
  `
};

async function run() {
  for (const [filename, svg] of Object.entries(assets)) {
    const dest = path.join(outDir, filename);
    await sharp(Buffer.from(svg.trim()))
      .resize(96, 96)
      .png()
      .toFile(dest);
    console.log(`Generated: ${filename}`);
  }
  console.log('All quest PNG icons generated successfully!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
