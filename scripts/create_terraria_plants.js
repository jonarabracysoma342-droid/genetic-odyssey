import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.join(__dirname, '..', 'public', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Helper to generate a detailed Terraria-style ercis plant SVG
function makeTerrariaPlantSvg(flowerColor, podColor, plantVar = 1) {
  // Flower colors
  const fColorMain = flowerColor === 'Ungu' ? '#a855f7' : '#ffffff';
  const fColorShadow = flowerColor === 'Ungu' ? '#7e22ce' : '#cbd5e1';
  const fColorHighlight = flowerColor === 'Ungu' ? '#c084fc' : '#f8fafc';
  
  // Pod colors
  const pColorMain = podColor === 'Hijau' ? '#22c55e' : '#eab308';
  const pColorShadow = podColor === 'Hijau' ? '#15803d' : '#ca8a04';
  const pColorHighlight = podColor === 'Hijau' ? '#86efac' : '#fef08a';

  // Different path offsets for layout variety
  const stemOffset = plantVar === 1 ? 'M 24 48 Q 20 30 24 16' : 'M 24 48 Q 28 32 22 16';
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100%" height="100%" shape-rendering="crispEdges">
  <!-- Terraria-style detailed Ercis Plant -->
  
  <!-- Stem Layer (Winding pixelated vines) -->
  <path d="${stemOffset}" fill="none" stroke="#15803d" stroke-width="2" />
  <path d="${stemOffset}" fill="none" stroke="#22c55e" stroke-width="1" stroke-dasharray="1,2" />

  <!-- Roots at base -->
  <rect x="22" y="46" width="4" height="2" fill="#14532d" />
  <rect x="20" y="47" width="8" height="1" fill="#166534" />

  <!-- Leaves (Pixel Clusters) -->
  <!-- Leaf 1 (Left Lower) -->
  <g transform="translate(12, 32)">
    <rect x="2" y="2" width="6" height="4" rx="1" fill="#166534" />
    <rect x="3" y="1" width="4" height="4" rx="1" fill="#22c55e" />
    <rect x="4" y="2" width="2" height="1" fill="#86efac" />
  </g>
  <!-- Leaf 2 (Right Mid) -->
  <g transform="translate(26, 24)">
    <rect x="1" y="2" width="6" height="4" rx="1" fill="#166534" />
    <rect x="2" y="1" width="4" height="4" rx="1" fill="#22c55e" />
    <rect x="3" y="2" width="2" height="1" fill="#86efac" />
  </g>
  <!-- Leaf 3 (Left Upper) -->
  <g transform="translate(14, 18)">
    <rect x="1" y="1" width="5" height="3" rx="1" fill="#166534" />
    <rect x="2" y="0" width="3" height="3" rx="1" fill="#22c55e" />
  </g>

  <!-- Hanging Pea Pod (Terraria style shape) -->
  <g transform="${plantVar === 1 ? 'translate(28, 28)' : 'translate(10, 26)'}">
    <!-- Stem connector -->
    <path d="M 0 0 Q -2 4 -1 6" fill="none" stroke="#15803d" stroke-width="1" />
    <!-- Pod Body -->
    <rect x="-3" y="6" width="5" height="10" rx="2" fill="${pColorShadow}" />
    <rect x="-2" y="7" width="3" height="8" rx="1" fill="${pColorMain}" />
    <!-- Pod Highlight -->
    <rect x="-2" y="8" width="1" height="6" fill="${pColorHighlight}" />
    <rect x="-1" y="14" width="1" height="1" fill="#ffffff" opacity="0.8" />
  </g>

  <!-- Top Flowers (Smooth layered pixel art look) -->
  <g transform="${plantVar === 1 ? 'translate(14, 6)' : 'translate(18, 4)'}">
    <!-- Sepal (green base) -->
    <rect x="8" y="9" width="4" height="2" fill="#166534" />
    <rect x="9" y="8" width="2" height="1" fill="#22c55e" />

    <!-- Flower Petals Group -->
    <!-- Left petal -->
    <rect x="4" y="5" width="4" height="4" fill="${fColorShadow}" />
    <rect x="5" y="6" width="3" height="2" fill="${fColorMain}" />
    <!-- Right petal -->
    <rect x="12" y="5" width="4" height="4" fill="${fColorShadow}" />
    <rect x="12" y="6" width="3" height="2" fill="${fColorMain}" />
    <!-- Main Center petal -->
    <rect x="6" y="2" width="8" height="7" rx="1" fill="${fColorShadow}" />
    <rect x="7" y="3" width="6" height="5" rx="1" fill="${fColorMain}" />
    <rect x="9" y="3" width="3" height="3" fill="${fColorHighlight}" />
    
    <!-- Flower core / pistil -->
    <rect x="9" y="6" width="2" height="1" fill="#eab308" />
  </g>
</svg>`;
}

const plantConfigs = {
  'pixel_plant_a.svg': { flower: 'Ungu', pod: 'Hijau', var: 1 },
  'pixel_plant_b.svg': { flower: 'Putih', pod: 'Kuning', var: 2 },
  'pixel_plant_c.svg': { flower: 'Ungu', pod: 'Hijau', var: 2 },
  'pixel_plant_d.svg': { flower: 'Putih', pod: 'Hijau', var: 1 },
  'pixel_plant_e.svg': { flower: 'Ungu', pod: 'Kuning', var: 1 },
  'pixel_plant_f.svg': { flower: 'Putih', pod: 'Hijau', var: 2 }
};

for (const [filename, config] of Object.entries(plantConfigs)) {
  const content = makeTerrariaPlantSvg(config.flower, config.pod, config.var);
  fs.writeFileSync(path.join(assetsDir, filename), content, 'utf8');
  console.log(`Generated Terraria-style plant: ${filename}`);
}
