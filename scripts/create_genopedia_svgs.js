import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.join(__dirname, '..', 'public', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Helper for SVG wrapper
function wrapSvg(content, width = 400, height = 300) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <defs>
    <!-- Linear Gradients -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>
    <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#6366f1" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <linearGradient id="roseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="100%" stop-color="#e11d48" />
    </linearGradient>
    <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a855f7" />
      <stop offset="100%" stop-color="#7e22ce" />
    </linearGradient>
    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255, 255, 255, 0.15)" />
      <stop offset="100%" stop-color="rgba(255, 255, 255, 0.05)" />
    </linearGradient>
    
    <!-- Filters for 3D Glow & Shadow -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#000" flood-opacity="0.35" />
    </filter>
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000" flood-opacity="0.2" />
    </filter>
  </defs>

  <!-- Card Background -->
  <rect width="${width}" height="${height}" rx="24" fill="url(#bgGrad)" />
  
  <!-- Subtle Grid Lines -->
  <g opacity="0.05" stroke="#ffffff" stroke-width="1">
    <line x1="0" y1="50" x2="${width}" y2="50" />
    <line x1="0" y1="100" x2="${width}" y2="100" />
    <line x1="0" y1="150" x2="${width}" y2="150" />
    <line x1="0" y1="200" x2="${width}" y2="200" />
    <line x1="0" y1="250" x2="${width}" y2="250" />
    <line x1="100" y1="0" x2="100" y2="${height}" />
    <line x1="200" y1="0" x2="200" y2="${height}" />
    <line x1="300" y1="0" x2="300" y2="${height}" />
  </g>

  ${content}
</svg>`;
}

// 1. sub_punnett2x2_detail.svg
const punnett2x2DetailSvg = wrapSvg(`
  <!-- Title Badge -->
  <rect x="20" y="15" width="360" height="30" rx="10" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.2)" />
  <text x="200" y="35" fill="#f8fafc" font-family="Arial, sans-serif" font-weight="bold" font-size="13" text-anchor="middle">
    Tabel Punnett Monohibrid F2 (Aa × Aa)
  </text>

  <!-- Grid Table Container -->
  <g transform="translate(60, 60)" filter="url(#shadow)">
    <!-- Main Board -->
    <rect x="0" y="0" width="280" height="200" rx="16" fill="#1e293b" stroke="#334155" stroke-width="2" />
    
    <!-- Lines -->
    <line x1="90" y1="0" x2="90" y2="200" stroke="#475569" stroke-width="2" />
    <line x1="0" y1="65" x2="280" y2="65" stroke="#475569" stroke-width="2" />
    <line x1="185" y1="65" x2="185" y2="200" stroke="#475569" stroke-width="2" />
    <line x1="90" y1="132" x2="280" y2="132" stroke="#475569" stroke-width="2" />

    <!-- Headers -->
    <text x="45" y="40" fill="#94a3b8" font-family="Arial, sans-serif" font-weight="bold" font-size="14" text-anchor="middle">♀ \\ ♂</text>

    <!-- Male Gametes (Top) -->
    <circle cx="137" cy="35" r="18" fill="url(#primaryGrad)" />
    <text x="137" y="41" fill="#fff" font-family="Arial, sans-serif" font-weight="bold" font-size="16" text-anchor="middle">A</text>

    <circle cx="232" cy="35" r="18" fill="url(#cyanGrad)" />
    <text x="232" y="41" fill="#fff" font-family="Arial, sans-serif" font-weight="bold" font-size="16" text-anchor="middle">a</text>

    <!-- Female Gametes (Left) -->
    <circle cx="45" cy="98" r="18" fill="url(#primaryGrad)" />
    <text x="45" y="104" fill="#fff" font-family="Arial, sans-serif" font-weight="bold" font-size="16" text-anchor="middle">A</text>

    <circle cx="45" cy="166" r="18" fill="url(#cyanGrad)" />
    <text x="45" y="172" fill="#fff" font-family="Arial, sans-serif" font-weight="bold" font-size="16" text-anchor="middle">a</text>

    <!-- Box 1 (AA) -->
    <rect x="95" y="70" width="85" height="57" rx="8" fill="rgba(99, 102, 241, 0.2)" stroke="#6366f1" />
    <text x="137" y="93" fill="#a5b4fc" font-family="Arial, sans-serif" font-weight="bold" font-size="16" text-anchor="middle">AA</text>
    <text x="137" y="112" fill="#e2e8f0" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">🌸 Ungu</text>

    <!-- Box 2 (Aa) -->
    <rect x="190" y="70" width="85" height="57" rx="8" fill="rgba(99, 102, 241, 0.2)" stroke="#6366f1" />
    <text x="232" y="93" fill="#a5b4fc" font-family="Arial, sans-serif" font-weight="bold" font-size="16" text-anchor="middle">Aa</text>
    <text x="232" y="112" fill="#e2e8f0" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">🌸 Ungu</text>

    <!-- Box 3 (Aa) -->
    <rect x="95" y="137" width="85" height="57" rx="8" fill="rgba(99, 102, 241, 0.2)" stroke="#6366f1" />
    <text x="137" y="160" fill="#a5b4fc" font-family="Arial, sans-serif" font-weight="bold" font-size="16" text-anchor="middle">Aa</text>
    <text x="137" y="179" fill="#e2e8f0" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">🌸 Ungu</text>

    <!-- Box 4 (aa) -->
    <rect x="190" y="137" width="85" height="57" rx="8" fill="rgba(244, 63, 94, 0.2)" stroke="#f43f5e" />
    <text x="232" y="160" fill="#fca5a5" font-family="Arial, sans-serif" font-weight="bold" font-size="16" text-anchor="middle">aa</text>
    <text x="232" y="179" fill="#e2e8f0" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">⚪ Putih</text>
  </g>
`);

// 2. sub_monohybrid_ratio.svg
const monohybridRatioSvg = wrapSvg(`
  <text x="200" y="32" fill="#f8fafc" font-family="Arial, sans-serif" font-weight="bold" font-size="15" text-anchor="middle">
    Rasio Genotipe &amp; Fenotipe Monohibrid (F2)
  </text>

  <!-- Left Card: Genotype Ratio -->
  <g transform="translate(30, 55)" filter="url(#shadow)">
    <rect x="0" y="0" width="160" height="210" rx="16" fill="rgba(30, 41, 59, 0.9)" stroke="#3b82f6" stroke-width="2" />
    <rect x="15" y="15" width="130" height="28" rx="8" fill="url(#primaryGrad)" />
    <text x="80" y="34" fill="#fff" font-family="Arial, sans-serif" font-weight="bold" font-size="12" text-anchor="middle">RASIO GENOTIPE</text>
    
    <text x="80" y="85" fill="#60a5fa" font-family="Arial, sans-serif" font-weight="bold" font-size="22" text-anchor="middle">1 : 2 : 1</text>
    
    <!-- Details -->
    <g font-family="Arial, sans-serif" font-size="11" fill="#cbd5e1">
      <text x="20" y="125">• <tspan font-weight="bold" fill="#a5b4fc">1 AA</tspan> (Homozigot Dominan)</text>
      <text x="20" y="150">• <tspan font-weight="bold" fill="#a5b4fc">2 Aa</tspan> (Heterozigot)</text>
      <text x="20" y="175">• <tspan font-weight="bold" fill="#fca5a5">1 aa</tspan> (Homozigot Resesif)</text>
    </g>
  </g>

  <!-- Right Card: Phenotype Ratio -->
  <g transform="translate(210, 55)" filter="url(#shadow)">
    <rect x="0" y="0" width="160" height="210" rx="16" fill="rgba(30, 41, 59, 0.9)" stroke="#10b981" stroke-width="2" />
    <rect x="15" y="15" width="130" height="28" rx="8" fill="url(#emeraldGrad)" />
    <text x="80" y="34" fill="#fff" font-family="Arial, sans-serif" font-weight="bold" font-size="12" text-anchor="middle">RASIO FENOTIPE</text>
    
    <text x="80" y="85" fill="#34d399" font-family="Arial, sans-serif" font-weight="bold" font-size="26" text-anchor="middle">3 : 1</text>
    
    <!-- Details -->
    <g font-family="Arial, sans-serif" font-size="11" fill="#cbd5e1">
      <text x="20" y="130">🌸 <tspan font-weight="bold" fill="#a5b4fc">3 Bunga Ungu</tspan> (75%)</text>
      <text x="20" y="165">⚪ <tspan font-weight="bold" fill="#fca5a5">1 Bunga Putih</tspan> (25%)</text>
    </g>
  </g>
`);

// 3. genopedia_law2.svg (Main Topic 5 - Law of Independent Assortment)
const genopediaLaw2Svg = wrapSvg(`
  <g filter="url(#shadow)">
    <!-- Header banner -->
    <rect x="30" y="20" width="340" height="40" rx="12" fill="url(#purpleGrad)" />
    <text x="200" y="45" fill="#fff" font-family="Arial, sans-serif" font-weight="bold" font-size="15" text-anchor="middle">
      HUKUM MENDEL II : ASORTASI BEBAS
    </text>
  </g>

  <!-- Central Diagram -->
  <g transform="translate(40, 80)" filter="url(#shadow)">
    <!-- Parent genotype card -->
    <rect x="90" y="0" width="140" height="45" rx="12" fill="#1e293b" stroke="#a855f7" stroke-width="2" />
    <text x="160" y="22" fill="#94a3b8" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">Genotipe Induk (Dihibrid)</text>
    <text x="160" y="38" fill="#e9d5ff" font-family="Arial, sans-serif" font-weight="bold" font-size="16" text-anchor="middle">AaBb</text>

    <!-- Arrows branching out to 4 gametes -->
    <path d="M 120 45 L 30 95" stroke="#a855f7" stroke-width="2" stroke-dasharray="4,4" />
    <path d="M 145 45 L 110 95" stroke="#a855f7" stroke-width="2" stroke-dasharray="4,4" />
    <path d="M 175 45 L 210 95" stroke="#a855f7" stroke-width="2" stroke-dasharray="4,4" />
    <path d="M 200 45 L 290 95" stroke="#a855f7" stroke-width="2" stroke-dasharray="4,4" />

    <!-- 4 Gametes -->
    <g transform="translate(10, 95)">
      <circle cx="20" cy="20" r="22" fill="url(#primaryGrad)" />
      <text x="20" y="26" fill="#fff" font-family="Arial, sans-serif" font-weight="bold" font-size="14" text-anchor="middle">AB</text>
    </g>
    <g transform="translate(90, 95)">
      <circle cx="20" cy="20" r="22" fill="url(#cyanGrad)" />
      <text x="20" y="26" fill="#fff" font-family="Arial, sans-serif" font-weight="bold" font-size="14" text-anchor="middle">Ab</text>
    </g>
    <g transform="translate(170, 95)">
      <circle cx="20" cy="20" r="22" fill="url(#accentGrad)" />
      <text x="20" y="26" fill="#fff" font-family="Arial, sans-serif" font-weight="bold" font-size="14" text-anchor="middle">aB</text>
    </g>
    <g transform="translate(250, 95)">
      <circle cx="20" cy="20" r="22" fill="url(#roseGrad)" />
      <text x="20" y="26" fill="#fff" font-family="Arial, sans-serif" font-weight="bold" font-size="14" text-anchor="middle">ab</text>
    </g>

    <!-- Bottom note -->
    <rect x="20" y="160" width="280" height="30" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
    <text x="160" y="179" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">
      Peluang Setiap Gamet Sama Rata (25% Masing-masing)
    </text>
  </g>
`);

// 4. sub_law2_concept.svg
const subLaw2ConceptSvg = wrapSvg(`
  <text x="200" y="32" fill="#f8fafc" font-family="Arial, sans-serif" font-weight="bold" font-size="15" text-anchor="middle">
    Prinsip Pengelompokan Bebas (Hukum Mendel II)
  </text>

  <g transform="translate(25, 55)" filter="url(#shadow)">
    <rect x="0" y="0" width="350" height="210" rx="16" fill="#1e293b" stroke="#8b5cf6" stroke-width="2" />
    
    <g font-family="Arial, sans-serif" font-size="12" fill="#e2e8f0">
      <text x="20" y="35" font-weight="bold" fill="#c084fc">1. Bebas Memisah &amp; Mengelompok</text>
      <text x="35" y="58" font-size="11" fill="#94a3b8">Alel gen warna biji tidak terikat dengan alel gen bentuk biji.</text>

      <text x="20" y="95" font-weight="bold" fill="#c084fc">2. Kombinasi Tanpa Syarat</text>
      <text x="35" y="118" font-size="11" fill="#94a3b8">Alel A dapat berpasangan dengan B maupun b secara acak.</text>

      <text x="20" y="155" font-weight="bold" fill="#c084fc">3. Gametogenesis Haploid</text>
      <text x="35" y="178" font-size="11" fill="#94a3b8">Membentuk 4 tipe kombinasi gamet jantan dan betina.</text>
    </g>
  </g>
`);

// 5. sub_dihybrid_traits.svg
const subDihybridTraitsSvg = wrapSvg(`
  <text x="200" y="32" fill="#f8fafc" font-family="Arial, sans-serif" font-weight="bold" font-size="15" text-anchor="middle">
    Kombinasi 2 Sifat Beda (Bentuk &amp; Warna Biji)
  </text>

  <g transform="translate(20, 55)">
    <!-- Trait 1: Shape -->
    <g transform="translate(0, 0)" filter="url(#shadow)">
      <rect x="0" y="0" width="170" height="210" rx="16" fill="#1e293b" stroke="#3b82f6" stroke-width="2" />
      <rect x="15" y="15" width="140" height="28" rx="8" fill="url(#primaryGrad)" />
      <text x="85" y="33" fill="#fff" font-family="Arial, sans-serif" font-weight="bold" font-size="11" text-anchor="middle">SIFAT 1: BENTUK BIJI</text>
      
      <!-- Dominant -->
      <circle cx="45" cy="85" r="18" fill="#f59e0b" />
      <text x="75" y="82" fill="#f8fafc" font-family="Arial, sans-serif" font-weight="bold" font-size="12">Bulat (B)</text>
      <text x="75" y="96" fill="#94a3b8" font-family="Arial, sans-serif" font-size="10">Dominan</text>

      <line x1="20" y1="120" x2="150" y2="120" stroke="#334155" />

      <!-- Recessive -->
      <path d="M 45 140 C 35 150 55 160 35 170 C 55 180 35 190 45 195" fill="none" stroke="#f59e0b" stroke-width="4" />
      <text x="75" y="157" fill="#f8fafc" font-family="Arial, sans-serif" font-weight="bold" font-size="12">Keriput (b)</text>
      <text x="75" y="171" fill="#94a3b8" font-family="Arial, sans-serif" font-size="10">Resesif</text>
    </g>

    <!-- Trait 2: Color -->
    <g transform="translate(190, 0)" filter="url(#shadow)">
      <rect x="0" y="0" width="170" height="210" rx="16" fill="#1e293b" stroke="#10b981" stroke-width="2" />
      <rect x="15" y="15" width="140" height="28" rx="8" fill="url(#emeraldGrad)" />
      <text x="85" y="33" fill="#fff" font-family="Arial, sans-serif" font-weight="bold" font-size="11" text-anchor="middle">SIFAT 2: WARNA BIJI</text>

      <!-- Dominant -->
      <circle cx="45" cy="85" r="18" fill="#fbbf24" />
      <text x="75" y="82" fill="#f8fafc" font-family="Arial, sans-serif" font-weight="bold" font-size="12">Kuning (K)</text>
      <text x="75" y="96" fill="#94a3b8" font-family="Arial, sans-serif" font-size="10">Dominan</text>

      <line x1="20" y1="120" x2="150" y2="120" stroke="#334155" />

      <!-- Recessive -->
      <circle cx="45" cy="160" r="18" fill="#10b981" />
      <text x="75" y="157" fill="#f8fafc" font-family="Arial, sans-serif" font-weight="bold" font-size="12">Hijau (k)</text>
      <text x="75" y="171" fill="#94a3b8" font-family="Arial, sans-serif" font-size="10">Resesif</text>
    </g>
  </g>
`);

// 6. sub_dihybrid_gametes.svg
const subDihybridGametesSvg = wrapSvg(`
  <text x="200" y="32" fill="#f8fafc" font-family="Arial, sans-serif" font-weight="bold" font-size="15" text-anchor="middle">
    Pembentukan 4 Gamet dari Genotipe AaBb
  </text>

  <g transform="translate(30, 60)" filter="url(#shadow)">
    <!-- Formula block -->
    <rect x="0" y="0" width="340" height="200" rx="16" fill="#1e293b" stroke="#6366f1" stroke-width="2" />
    
    <text x="170" y="30" fill="#a5b4fc" font-family="Arial, sans-serif" font-weight="bold" font-size="13" text-anchor="middle">
      Rumus Jumlah Gamet = 2ⁿ (n = pasangan heterozigot)
    </text>
    <text x="170" y="50" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">
      AaBb memiliki 2 pasang heterozigot → 2² = 4 Gamet
    </text>

    <!-- Gamete Cards -->
    <g transform="translate(20, 75)">
      <rect x="0" y="0" width="65" height="90" rx="12" fill="url(#primaryGrad)" />
      <text x="32" y="45" fill="#fff" font-family="Arial, sans-serif" font-weight="bold" font-size="20" text-anchor="middle">AB</text>
      <text x="32" y="70" fill="#e0e7ff" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">25%</text>
    </g>
    <g transform="translate(98, 75)">
      <rect x="0" y="0" width="65" height="90" rx="12" fill="url(#cyanGrad)" />
      <text x="32" y="45" fill="#fff" font-family="Arial, sans-serif" font-weight="bold" font-size="20" text-anchor="middle">Ab</text>
      <text x="32" y="70" fill="#e0f2fe" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">25%</text>
    </g>
    <g transform="translate(176, 75)">
      <rect x="0" y="0" width="65" height="90" rx="12" fill="url(#accentGrad)" />
      <text x="32" y="45" fill="#fff" font-family="Arial, sans-serif" font-weight="bold" font-size="20" text-anchor="middle">aB</text>
      <text x="32" y="70" fill="#fef3c7" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">25%</text>
    </g>
    <g transform="translate(254, 75)">
      <rect x="0" y="0" width="65" height="90" rx="12" fill="url(#roseGrad)" />
      <text x="32" y="45" fill="#fff" font-family="Arial, sans-serif" font-weight="bold" font-size="20" text-anchor="middle">ab</text>
      <text x="32" y="70" fill="#ffe4e6" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">25%</text>
    </g>
  </g>
`);

// 7. genopedia_punnett4x4.png -> Let's make `genopedia_punnett4x4.svg`
const genopediaPunnett4x4Svg = wrapSvg(`
  <text x="200" y="30" fill="#f8fafc" font-family="Arial, sans-serif" font-weight="bold" font-size="15" text-anchor="middle">
    Punnett Square Dihibrid 4x4 (16 Kotak Combinations)
  </text>

  <g transform="translate(35, 50)" filter="url(#shadow)">
    <rect x="0" y="0" width="330" height="225" rx="16" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />

    <!-- 4x4 Grid preview -->
    <g stroke="#334155" stroke-width="1.5">
      <line x1="66" y1="0" x2="66" y2="225" />
      <line x1="132" y1="0" x2="132" y2="225" />
      <line x1="198" y1="0" x2="198" y2="225" />
      <line x1="264" y1="0" x2="264" y2="225" />
      
      <line x1="0" y1="45" x2="330" y2="45" />
      <line x1="0" y1="90" x2="330" y2="90" />
      <line x1="0" y1="135" x2="330" y2="135" />
      <line x1="0" y1="180" x2="330" y2="180" />
    </g>

    <!-- Top Headers -->
    <text x="33" y="28" fill="#94a3b8" font-family="Arial, sans-serif" font-weight="bold" font-size="11" text-anchor="middle">♀ \ ♂</text>
    <text x="99" y="28" fill="#38bdf8" font-family="Arial, sans-serif" font-weight="bold" font-size="12" text-anchor="middle">AB</text>
    <text x="165" y="28" fill="#38bdf8" font-family="Arial, sans-serif" font-weight="bold" font-size="12" text-anchor="middle">Ab</text>
    <text x="231" y="28" fill="#38bdf8" font-family="Arial, sans-serif" font-weight="bold" font-size="12" text-anchor="middle">aB</text>
    <text x="297" y="28" fill="#38bdf8" font-family="Arial, sans-serif" font-weight="bold" font-size="12" text-anchor="middle">ab</text>

    <!-- Left Headers -->
    <text x="33" y="73" fill="#38bdf8" font-family="Arial, sans-serif" font-weight="bold" font-size="12" text-anchor="middle">AB</text>
    <text x="33" y="118" fill="#38bdf8" font-family="Arial, sans-serif" font-weight="bold" font-size="12" text-anchor="middle">Ab</text>
    <text x="33" y="163" fill="#38bdf8" font-family="Arial, sans-serif" font-weight="bold" font-size="12" text-anchor="middle">aB</text>
    <text x="33" y="208" fill="#38bdf8" font-family="Arial, sans-serif" font-weight="bold" font-size="12" text-anchor="middle">ab</text>

    <!-- Cells Highlight Samples -->
    <!-- Row 1 -->
    <rect x="68" y="47" width="62" height="41" rx="4" fill="rgba(56, 189, 248, 0.2)" />
    <text x="99" y="72" fill="#7dd3fc" font-family="Arial, sans-serif" font-weight="bold" font-size="11" text-anchor="middle">AABB</text>

    <rect x="134" y="47" width="62" height="41" rx="4" fill="rgba(56, 189, 248, 0.2)" />
    <text x="165" y="72" fill="#7dd3fc" font-family="Arial, sans-serif" font-weight="bold" font-size="11" text-anchor="middle">AABb</text>

    <rect x="200" y="47" width="62" height="41" rx="4" fill="rgba(56, 189, 248, 0.2)" />
    <text x="231" y="72" fill="#7dd3fc" font-family="Arial, sans-serif" font-weight="bold" font-size="11" text-anchor="middle">AaBB</text>

    <rect x="266" y="47" width="62" height="41" rx="4" fill="rgba(56, 189, 248, 0.2)" />
    <text x="297" y="72" fill="#7dd3fc" font-family="Arial, sans-serif" font-weight="bold" font-size="11" text-anchor="middle">AaBb</text>

    <!-- Row 2 sample -->
    <rect x="134" y="92" width="62" height="41" rx="4" fill="rgba(16, 185, 129, 0.2)" />
    <text x="165" y="117" fill="#6ee7b7" font-family="Arial, sans-serif" font-weight="bold" font-size="11" text-anchor="middle">AAbb</text>

    <!-- Row 3 sample -->
    <rect x="200" y="137" width="62" height="41" rx="4" fill="rgba(245, 158, 11, 0.2)" />
    <text x="231" y="162" fill="#fde047" font-family="Arial, sans-serif" font-weight="bold" font-size="11" text-anchor="middle">aaBB</text>

    <!-- Row 4 sample (aabb) -->
    <rect x="266" y="182" width="62" height="41" rx="4" fill="rgba(244, 63, 94, 0.2)" />
    <text x="297" y="207" fill="#fca5a5" font-family="Arial, sans-serif" font-weight="bold" font-size="11" text-anchor="middle">aabb</text>
  </g>
`);

// 8. sub_punnett4x4_steps.svg
const subPunnett4x4StepsSvg = wrapSvg(`
  <text x="200" y="32" fill="#f8fafc" font-family="Arial, sans-serif" font-weight="bold" font-size="15" text-anchor="middle">
    Langkah Mengisi Tabel Punnett 4x4
  </text>

  <g transform="translate(25, 55)" filter="url(#shadow)">
    <rect x="0" y="0" width="350" height="210" rx="16" fill="#1e293b" stroke="#0ea5e9" stroke-width="2" />
    
    <g font-family="Arial, sans-serif" font-size="11" fill="#e2e8f0">
      <text x="20" y="32" font-weight="bold" fill="#38bdf8">Langkah 1:</text>
      <text x="90" y="32" fill="#cbd5e1">Tentukan 4 jenis gamet induk jantan (AB, Ab, aB, ab)</text>

      <text x="20" y="72" font-weight="bold" fill="#38bdf8">Langkah 2:</text>
      <text x="90" y="72" fill="#cbd5e1">Tentukan 4 jenis gamet induk betina (AB, Ab, aB, ab)</text>

      <text x="20" y="112" font-weight="bold" fill="#38bdf8">Langkah 3:</text>
      <text x="90" y="112" fill="#cbd5e1">Silangkan tiap baris &amp; kolom di 16 kotak perpotongan</text>

      <text x="20" y="152" font-weight="bold" fill="#38bdf8">Langkah 4:</text>
      <text x="90" y="152" fill="#cbd5e1">Kelompokkan genotipe &amp; hitung rasio fenotipe F2</text>
    </g>

    <!-- Bottom highlights bar -->
    <rect x="15" y="170" width="320" height="28" rx="8" fill="url(#primaryGrad)" />
    <text x="175" y="188" fill="#fff" font-family="Arial, sans-serif" font-weight="bold" font-size="11" text-anchor="middle">
      Target Akhir: Menguasai Persilangan Dihibrid 16 Kombinasi
    </text>
  </g>
`);

// 9. genopedia_punnett4x4_detail.svg
const genopediaPunnett4x4DetailSvg = genopediaPunnett4x4Svg; // re-use rich 4x4 diagram

// 10. sub_dihybrid_ratio.svg (Rasio 9:3:3:1)
const subDihybridRatioSvg = wrapSvg(`
  <text x="200" y="30" fill="#f8fafc" font-family="Arial, sans-serif" font-weight="bold" font-size="15" text-anchor="middle">
    Rasio Fenotipe F2 Dihibrid (9 : 3 : 3 : 1)
  </text>

  <g transform="translate(20, 50)" filter="url(#shadow)">
    <!-- 9 Bulat Kuning -->
    <g transform="translate(0, 0)">
      <rect x="0" y="0" width="175" height="100" rx="14" fill="#1e293b" stroke="#f59e0b" stroke-width="2" />
      <circle cx="35" cy="50" r="22" fill="#fbbf24" filter="url(#glow)" />
      <text x="75" y="42" fill="#fef08a" font-family="Arial, sans-serif" font-weight="bold" font-size="18">9 bagian</text>
      <text x="75" y="62" fill="#cbd5e1" font-family="Arial, sans-serif" font-weight="bold" font-size="11">🟡 Bulat Kuning</text>
      <text x="75" y="78" fill="#94a3b8" font-family="Arial, sans-serif" font-size="10">(B- K-)</text>
    </g>

    <!-- 3 Bulat Hijau -->
    <g transform="translate(185, 0)">
      <rect x="0" y="0" width="175" height="100" rx="14" fill="#1e293b" stroke="#10b981" stroke-width="2" />
      <circle cx="35" cy="50" r="22" fill="#10b981" filter="url(#glow)" />
      <text x="75" y="42" fill="#a7f3d0" font-family="Arial, sans-serif" font-weight="bold" font-size="18">3 bagian</text>
      <text x="75" y="62" fill="#cbd5e1" font-family="Arial, sans-serif" font-weight="bold" font-size="11">🟢 Bulat Hijau</text>
      <text x="75" y="78" fill="#94a3b8" font-family="Arial, sans-serif" font-size="10">(B- kk)</text>
    </g>

    <!-- 3 Keriput Kuning -->
    <g transform="translate(0, 115)">
      <rect x="0" y="0" width="175" height="100" rx="14" fill="#1e293b" stroke="#3b82f6" stroke-width="2" />
      <path d="M 35 32 C 25 42 45 52 25 62 C 45 72 25 82 35 85" fill="none" stroke="#fbbf24" stroke-width="5" />
      <text x="75" y="42" fill="#93c5fd" font-family="Arial, sans-serif" font-weight="bold" font-size="18">3 bagian</text>
      <text x="75" y="62" fill="#cbd5e1" font-family="Arial, sans-serif" font-weight="bold" font-size="11">🟡 Keriput Kuning</text>
      <text x="75" y="78" fill="#94a3b8" font-family="Arial, sans-serif" font-size="10">(bb K-)</text>
    </g>

    <!-- 1 Keriput Hijau -->
    <g transform="translate(185, 115)">
      <rect x="0" y="0" width="175" height="100" rx="14" fill="#1e293b" stroke="#f43f5e" stroke-width="2" />
      <path d="M 35 32 C 25 42 45 52 25 62 C 45 72 25 82 35 85" fill="none" stroke="#10b981" stroke-width="5" />
      <text x="75" y="42" fill="#fca5a5" font-family="Arial, sans-serif" font-weight="bold" font-size="18">1 bagian</text>
      <text x="75" y="62" fill="#cbd5e1" font-family="Arial, sans-serif" font-weight="bold" font-size="11">🟢 Keriput Hijau</text>
      <text x="75" y="78" fill="#94a3b8" font-family="Arial, sans-serif" font-size="10">(bb kk)</text>
    </g>
  </g>
`);

// 11. genopedia_application.svg (Topic 7 Main)
const genopediaApplicationSvg = wrapSvg(`
  <g filter="url(#shadow)">
    <rect x="30" y="20" width="340" height="40" rx="12" fill="url(#emeraldGrad)" />
    <text x="200" y="45" fill="#fff" font-family="Arial, sans-serif" font-weight="bold" font-size="15" text-anchor="middle">
      APLIKASI NYATA HUKUM GENETIKA MENDEL
    </text>
  </g>

  <g transform="translate(30, 75)" filter="url(#shadow)">
    <rect x="0" y="0" width="340" height="190" rx="16" fill="#1e293b" stroke="#059669" stroke-width="2" />
    
    <g transform="translate(20, 20)">
      <circle cx="25" cy="25" r="20" fill="url(#emeraldGrad)" />
      <text x="25" y="30" fill="#fff" font-size="16" text-anchor="middle">🌾</text>
      <text x="60" y="22" fill="#6ee7b7" font-family="Arial, sans-serif" font-weight="bold" font-size="13">Pemuliaan Tanaman</text>
      <text x="60" y="40" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11">Padi bibit unggul tahan hama &amp; berproduksi tinggi.</text>
    </g>

    <line x1="20" y1="75" x2="320" y2="75" stroke="#334155" />

    <g transform="translate(20, 85)">
      <circle cx="25" cy="25" r="20" fill="url(#accentGrad)" />
      <text x="25" y="30" fill="#fff" font-size="16" text-anchor="middle">🐄</text>
      <text x="60" y="22" fill="#fcd34d" font-family="Arial, sans-serif" font-weight="bold" font-size="13">Pemuliaan Hewan</text>
      <text x="60" y="40" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11">Persilangan sapi perah unggul adaptif cuaca tropis.</text>
    </g>

    <line x1="20" y1="135" x2="320" y2="135" stroke="#334155" />

    <g transform="translate(20, 145)">
      <circle cx="25" cy="25" r="20" fill="url(#cyanGrad)" />
      <text x="25" y="20" fill="#fff" font-size="16" text-anchor="middle">🧬</text>
      <text x="60" y="12" fill="#7dd3fc" font-family="Arial, sans-serif" font-weight="bold" font-size="13">Genetika Medis Manusia</text>
      <text x="60" y="28" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11">Analisis silsilah penyakit keturunan &amp; rhesus darah.</text>
    </g>
  </g>
`);

// 12. sub_plant_breeding.svg
const subPlantBreedingSvg = wrapSvg(`
  <text x="200" y="32" fill="#f8fafc" font-family="Arial, sans-serif" font-weight="bold" font-size="15" text-anchor="middle">
    Penerapan: Pemuliaan Tanaman Unggul
  </text>

  <g transform="translate(25, 55)" filter="url(#shadow)">
    <rect x="0" y="0" width="350" height="210" rx="16" fill="#1e293b" stroke="#10b981" stroke-width="2" />
    
    <g transform="translate(20, 20)">
      <rect x="0" y="0" width="145" height="75" rx="10" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" />
      <text x="72" y="28" fill="#a7f3d0" font-family="Arial, sans-serif" font-weight="bold" font-size="11" text-anchor="middle">Induk A: Padi Tahan Hama</text>
      <text x="72" y="50" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">Genotipe HH (Dominan)</text>
    </g>

    <text x="175" y="60" fill="#fbbf24" font-family="Arial, sans-serif" font-weight="bold" font-size="18" text-anchor="middle">×</text>

    <g transform="translate(185, 20)">
      <rect x="0" y="0" width="145" height="75" rx="10" fill="rgba(59, 130, 246, 0.15)" stroke="#3b82f6" />
      <text x="72" y="28" fill="#93c5fd" font-family="Arial, sans-serif" font-weight="bold" font-size="11" text-anchor="middle">Induk B: Bulir Lebat</text>
      <text x="72" y="50" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">Genotipe LL (Dominan)</text>
    </g>

    <!-- Result -->
    <g transform="translate(20, 115)">
      <rect x="0" y="0" width="310" height="75" rx="12" fill="url(#emeraldGrad)" />
      <text x="155" y="32" fill="#fff" font-family="Arial, sans-serif" font-weight="bold" font-size="13" text-anchor="middle">
        🌾 Keturunan Unggul (F1 / F2)
      </text>
      <text x="155" y="54" fill="#ecfdf5" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">
        Padi Tahan Hama Sekaligus Berproduksi Bulir Lebat
      </text>
    </g>
  </g>
`);

// 13. sub_animal_breeding.svg
const subAnimalBreedingSvg = wrapSvg(`
  <text x="200" y="32" fill="#f8fafc" font-family="Arial, sans-serif" font-weight="bold" font-size="15" text-anchor="middle">
    Penerapan: Pemuliaan Hewan Ternak
  </text>

  <g transform="translate(25, 55)" filter="url(#shadow)">
    <rect x="0" y="0" width="350" height="210" rx="16" fill="#1e293b" stroke="#f59e0b" stroke-width="2" />
    
    <g transform="translate(20, 20)">
      <rect x="0" y="0" width="145" height="75" rx="10" fill="rgba(245, 158, 11, 0.15)" stroke="#f59e0b" />
      <text x="72" y="28" fill="#fde047" font-family="Arial, sans-serif" font-weight="bold" font-size="11" text-anchor="middle">🐄 Ras Susu Melimpah</text>
      <text x="72" y="50" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">Produksi Tinggi</text>
    </g>

    <text x="175" y="60" fill="#f59e0b" font-family="Arial, sans-serif" font-weight="bold" font-size="18" text-anchor="middle">×</text>

    <g transform="translate(185, 20)">
      <rect x="0" y="0" width="145" height="75" rx="10" fill="rgba(6, 182, 212, 0.15)" stroke="#06b6d4" />
      <text x="72" y="28" fill="#67e8f9" font-family="Arial, sans-serif" font-weight="bold" font-size="11" text-anchor="middle">🐂 Ras Sapi Lokal</text>
      <text x="72" y="50" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">Tahan Panas Tropis</text>
    </g>

    <g transform="translate(20, 115)">
      <rect x="0" y="0" width="310" height="75" rx="12" fill="url(#accentGrad)" />
      <text x="155" y="32" fill="#fff" font-family="Arial, sans-serif" font-weight="bold" font-size="13" text-anchor="middle">
        ✨ Sapi Ternak Hibrida Super
      </text>
      <text x="155" y="54" fill="#fef3c7" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">
        Produksi Susu Melimpah &amp; Kuat di Iklim Iklim Tropis
      </text>
    </g>
  </g>
`);

// 14. sub_human_genetics.svg
const subHumanGeneticsSvg = wrapSvg(`
  <text x="200" y="32" fill="#f8fafc" font-family="Arial, sans-serif" font-weight="bold" font-size="15" text-anchor="middle">
    Penerapan: Pewarisan Sifat Pada Manusia
  </text>

  <g transform="translate(25, 55)" filter="url(#shadow)">
    <rect x="0" y="0" width="350" height="210" rx="16" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
    
    <g font-family="Arial, sans-serif" font-size="11" fill="#e2e8f0">
      <g transform="translate(20, 20)">
        <rect x="0" y="0" width="310" height="42" rx="8" fill="rgba(56, 189, 248, 0.15)" />
        <text x="15" y="25" font-weight="bold" fill="#7dd3fc">👤 Karakter Fisik:</text>
        <text x="130" y="25" fill="#cbd5e1">Rambut Keriting/Lurus, Lesung Pipit</text>
      </g>

      <g transform="translate(20, 75)">
        <rect x="0" y="0" width="310" height="42" rx="8" fill="rgba(168, 85, 247, 0.15)" />
        <text x="15" y="25" font-weight="bold" fill="#c084fc">🩸 Golongan Darah:</text>
        <text x="130" y="25" fill="#cbd5e1">Sistem ABO (A, B, AB, O) &amp; Rhesus</text>
      </g>

      <g transform="translate(20, 130)">
        <rect x="0" y="0" width="310" height="60" rx="8" fill="rgba(244, 63, 94, 0.15)" stroke="#f43f5e" />
        <text x="15" y="25" font-weight="bold" fill="#fca5a5">🏥 Genetika Medis:</text>
        <text x="15" y="45" fill="#cbd5e1" font-size="10">Analisis Silsilah Pedigree Penyakit Bawaan (Hemofilia &amp; Buta Warna)</text>
      </g>
    </g>
  </g>
`);

// Map of SVG files to write
const files = {
  'sub_punnett2x2_detail.svg': punnett2x2DetailSvg,
  'sub_monohybrid_ratio.svg': monohybridRatioSvg,
  'genopedia_law2.svg': genopediaLaw2Svg,
  'sub_law2_concept.svg': subLaw2ConceptSvg,
  'sub_dihybrid_traits.svg': subDihybridTraitsSvg,
  'sub_dihybrid_gametes.svg': subDihybridGametesSvg,
  'genopedia_punnett4x4.svg': genopediaPunnett4x4Svg,
  'sub_punnett4x4_steps.svg': subPunnett4x4StepsSvg,
  'genopedia_punnett4x4_detail.svg': genopediaPunnett4x4DetailSvg,
  'sub_dihybrid_ratio.svg': subDihybridRatioSvg,
  'genopedia_application.svg': genopediaApplicationSvg,
  'sub_plant_breeding.svg': subPlantBreedingSvg,
  'sub_animal_breeding.svg': subAnimalBreedingSvg,
  'sub_human_genetics.svg': subHumanGeneticsSvg,
};

let count = 0;
for (const [filename, content] of Object.entries(files)) {
  const filePath = path.join(assetsDir, filename);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Created ${filename}`);
  count++;
}

console.log(`Successfully created ${count} bespoke SVG visuals!`);
