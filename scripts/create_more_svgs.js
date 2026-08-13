import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.join(__dirname, '..', 'public', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

function wrapSvg(content, width = 360, height = 180) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#6366f1" />
    </linearGradient>
    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <linearGradient id="roseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="100%" stop-color="#e11d48" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000" flood-opacity="0.3" />
    </filter>
  </defs>
  <rect width="${width}" height="${height}" rx="16" fill="url(#bgGrad)" />
  ${content}
</svg>`;
}

// 1. sub_gen_detail.svg
const subGenDetailSvg = wrapSvg(`
  <!-- Chromosome / DNA Segment -->
  <g transform="translate(20, 25)" filter="url(#shadow)">
    <!-- DNA strands helix simulation -->
    <path d="M 10 60 Q 40 10 70 60 T 130 60 T 190 60" fill="none" stroke="#475569" stroke-width="3" />
    <path d="M 10 60 Q 40 110 70 60 T 130 60 T 190 60" fill="none" stroke="#64748b" stroke-dasharray="3,3" stroke-width="2" />
    
    <!-- Highlighted Gene Segment (GEN) -->
    <path d="M 70 60 Q 100 10 130 60" fill="none" stroke="#3b82f6" stroke-width="6" />
    <path d="M 70 60 Q 100 110 130 60" fill="none" stroke="#6366f1" stroke-width="6" />
    
    <!-- Connector Lines -->
    <line x1="80" y1="35" x2="80" y2="85" stroke="#3b82f6" stroke-width="2" />
    <line x1="100" y1="20" x2="100" y2="100" stroke="#6366f1" stroke-width="2" />
    <line x1="120" y1="35" x2="120" y2="85" stroke="#3b82f6" stroke-width="2" />
    
    <!-- Labeling -->
    <rect x="60" y="105" width="80" height="24" rx="6" fill="#1d4ed8" />
    <text x="100" y="121" fill="#ffffff" font-family="Arial, sans-serif" font-weight="bold" font-size="10" text-anchor="middle">SEGMEN GEN</text>
  </g>
  
  <!-- Right Explanatory Text Box -->
  <g transform="translate(200, 30)">
    <rect x="0" y="0" width="140" height="120" rx="12" fill="rgba(255, 255, 255, 0.03)" stroke="rgba(255, 255, 255, 0.1)" />
    <text x="70" y="25" fill="#60a5fa" font-family="Arial, sans-serif" font-weight="bold" font-size="12" text-anchor="middle">GEN</text>
    <text x="70" y="45" fill="#94a3b8" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">Materi Genetik</text>
    <text x="70" y="70" fill="#e2e8f0" font-family="Arial, sans-serif" font-weight="bold" font-size="10" text-anchor="middle">Pembawa Sifat</text>
    <text x="70" y="85" fill="#e2e8f0" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">Induk → Keturunan</text>
    <text x="70" y="105" fill="#38bdf8" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">Lokasi: Kromosom</text>
  </g>
`, 360, 170);

// 2. sub_alel_detail.svg
const subAlelelDetailSvg = wrapSvg(`
  <!-- Homologous Chromosome Pair -->
  <g transform="translate(20, 20)" filter="url(#shadow)">
    <!-- Chromosome 1 -->
    <rect x="30" y="20" width="16" height="100" rx="8" fill="url(#primaryGrad)" />
    <circle cx="38" cy="70" r="10" fill="#1e1b4b" />
    
    <!-- Chromosome 2 -->
    <rect x="75" y="20" width="16" height="100" rx="8" fill="url(#cyanGrad)" />
    <circle cx="83" cy="70" r="10" fill="#1e1b4b" />
    
    <!-- Locus Highlights -->
    <!-- Allele T (Dominant) -->
    <rect x="28" y="40" width="20" height="8" rx="2" fill="#fbbf24" stroke="#ffffff" stroke-width="1" />
    <text x="18" y="47" fill="#fbbf24" font-family="Arial, sans-serif" font-weight="bold" font-size="10" text-anchor="end">T</text>
    
    <!-- Allele t (Recessive) -->
    <rect x="73" y="40" width="20" height="8" rx="2" fill="#fbbf24" stroke="#ffffff" stroke-width="1" />
    <text x="103" y="47" fill="#cbd5e1" font-family="Arial, sans-serif" font-weight="bold" font-size="10" text-anchor="start">t</text>
    
    <text x="60" y="135" fill="#94a3b8" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">Pasangan Locus Bersesuaian</text>
  </g>
  
  <!-- Right Explanatory Text Box -->
  <g transform="translate(200, 30)">
    <rect x="0" y="0" width="140" height="120" rx="12" fill="rgba(255, 255, 255, 0.03)" stroke="rgba(255, 255, 255, 0.1)" />
    <text x="70" y="25" fill="#38bdf8" font-family="Arial, sans-serif" font-weight="bold" font-size="12" text-anchor="middle">ALEL</text>
    <text x="70" y="45" fill="#94a3b8" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">Variasi Sifat Gen</text>
    <text x="70" y="70" fill="#e2e8f0" font-family="Arial, sans-serif" font-weight="bold" font-size="10" text-anchor="middle">Bentuk Alternatif</text>
    <text x="70" y="85" fill="#e2e8f0" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">T (Tinggi) vs t (Pendek)</text>
    <text x="70" y="105" fill="#a7f3d0" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">Lokus Homolog</text>
  </g>
`, 360, 170);

// 3. sub_genotype_detail.svg
const subGenotypeDetailSvg = wrapSvg(`
  <g transform="translate(20, 20)">
    <!-- Genotype Boxes -->
    <g transform="translate(10, 20)">
      <rect x="0" y="0" width="45" height="45" rx="8" fill="#1e293b" stroke="#3b82f6" stroke-width="2"/>
      <text x="22.5" y="28" fill="#fff" font-family="Arial, sans-serif" font-weight="bold" font-size="16" text-anchor="middle">AA</text>
      <text x="22.5" y="58" fill="#94a3b8" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">Homozigot</text>
    </g>
    <g transform="translate(65, 20)">
      <rect x="0" y="0" width="45" height="45" rx="8" fill="#1e293b" stroke="#8b5cf6" stroke-width="2"/>
      <text x="22.5" y="28" fill="#fff" font-family="Arial, sans-serif" font-weight="bold" font-size="16" text-anchor="middle">Aa</text>
      <text x="22.5" y="58" fill="#94a3b8" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">Heterozigot</text>
    </g>
    <g transform="translate(120, 20)">
      <rect x="0" y="0" width="45" height="45" rx="8" fill="#1e293b" stroke="#f43f5e" stroke-width="2"/>
      <text x="22.5" y="28" fill="#fff" font-family="Arial, sans-serif" font-weight="bold" font-size="16" text-anchor="middle">aa</text>
      <text x="22.5" y="58" fill="#94a3b8" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">Homozigot</text>
    </g>
  </g>
  <g transform="translate(200, 30)">
    <rect x="0" y="0" width="140" height="120" rx="12" fill="rgba(255, 255, 255, 0.03)" stroke="rgba(255, 255, 255, 0.1)" />
    <text x="70" y="25" fill="#8b5cf6" font-family="Arial, sans-serif" font-weight="bold" font-size="12" text-anchor="middle">GENOTIPE</text>
    <text x="70" y="50" fill="#cbd5e1" font-family="Arial, sans-serif" font-weight="bold" font-size="10" text-anchor="middle">Komposisi Gen</text>
    <text x="70" y="70" fill="#94a3b8" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">Disimbolkan Huruf</text>
    <text x="70" y="95" fill="#f3f4f6" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">Tidak Tampak Fisik</text>
  </g>
`, 360, 170);

// 4. sub_phenotype_detail.svg
const subPhenotypeDetailSvg = wrapSvg(`
  <g transform="translate(30, 25)">
    <!-- Phenotype flower illustration -->
    <circle cx="50" cy="50" r="16" fill="#a855f7" />
    <!-- Flower Petals -->
    <circle cx="50" cy="24" r="14" fill="#a855f7" />
    <circle cx="50" cy="76" r="14" fill="#a855f7" />
    <circle cx="24" cy="50" r="14" fill="#a855f7" />
    <circle cx="76" cy="50" r="14" fill="#a855f7" />
    <!-- Center yellow -->
    <circle cx="50" cy="50" r="10" fill="#eab308" />
    
    <text x="50" y="110" fill="#cbd5e1" font-family="Arial, sans-serif" font-weight="bold" font-size="11" text-anchor="middle">Warna Bunga Ungu</text>
  </g>
  <g transform="translate(200, 30)">
    <rect x="0" y="0" width="140" height="120" rx="12" fill="rgba(255, 255, 255, 0.03)" stroke="rgba(255, 255, 255, 0.1)" />
    <text x="70" y="25" fill="#eab308" font-family="Arial, sans-serif" font-weight="bold" font-size="12" text-anchor="middle">FENOTIPE</text>
    <text x="70" y="50" fill="#cbd5e1" font-family="Arial, sans-serif" font-weight="bold" font-size="10" text-anchor="middle">Karakter Fisik</text>
    <text x="70" y="70" fill="#94a3b8" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">Bisa Diamati Indra</text>
    <text x="70" y="95" fill="#f3f4f6" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">Warna, Bentuk, dll</text>
  </g>
`, 360, 170);

const files = {
  'sub_gen_detail.svg': subGenDetailSvg,
  'sub_alel_detail.svg': subAlelelDetailSvg,
  'sub_genotype_detail.svg': subGenotypeDetailSvg,
  'sub_phenotype_detail.svg': subPhenotypeDetailSvg
};

for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(assetsDir, filename), content, 'utf8');
  console.log(`Created new subtopic detail visual: ${filename}`);
}
