import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../../context/GameContext';
import { STAGES } from '../../data/geneticsData';
import { NPCS, PLAYER_PORTRAIT, PLAYER_MALE_PORTRAIT } from './npcData';
import { QUEST_ITEMS, NPC_QUEST_STORIES } from './questData';
import { sound } from '../../services/sound';
import { 
  ChevronLeft, 
  ChevronRight,
  Star, 
  Award, 
  MapPin, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Gamepad2, 
  X,
  Compass,
  CheckCircle2,
  Lock,
  Flame,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  MessageSquare,
  Play,
  HelpCircle,
  AlertCircle,
  RotateCcw,
  Smartphone,
  Monitor,
  Package
} from 'lucide-react';

// World dimensions (User's authentic pixel ground terrain map 1024x559)
const WORLD_WIDTH = 1024;
const WORLD_HEIGHT = 559;

// Quest item icons PNG cache for crisp canvas rendering without emojis
const questItemImagesCache = {};
if (typeof window !== 'undefined') {
  QUEST_ITEMS.forEach(it => {
    if (it.iconSrc) {
      const img = new Image();
      img.src = it.iconSrc;
      questItemImagesCache[it.id] = img;
    }
  });
}

// Surface detection: check if player coordinate is on stone / cobblestone / paved paths
const isStoneSurface = (x, y) => {
  // 1. Central Fountain Stone Pedestal & Surrounding Masonry Plaza
  if (Math.hypot(x - 512, y - 280) <= 95) return true;
  if (x >= 450 && x <= 574 && y >= 230 && y <= 330) return true;

  // 2. Central North-South Boulevard (from North gate to South exit)
  if (x >= 472 && x <= 552) return true;

  // 3. East-West Cross Promenade (across the map center)
  if (y >= 262 && y <= 300 && x >= 220 && x <= 800) return true;

  // 4. Horizontal Paved Walkways around Garden Plots
  if (y >= 218 && y <= 248 && x >= 270 && x <= 754) return true;
  if (y >= 322 && y <= 352 && x >= 270 && x <= 754) return true;

  // 5. Mendel's Research Cabin Porch, Stone Well & Entrance Steps (Northeast)
  if (x >= 755 && x <= 920 && y >= 170 && y <= 255) return true;

  // 6. ST-2 Research Lab & ST-4 Punnett Lab Stone Thresholds (West)
  if (x >= 120 && x <= 240 && y >= 190 && y <= 240) return true;
  if (x >= 145 && x <= 205 && y >= 295 && y <= 320) return true;
  if (x >= 115 && x <= 235 && y >= 335 && y <= 380) return true;

  return false;
};

// Solid World Colliders (Obstacles the player cannot pass through)
const COLLIDERS = [
  // 1. Perimeter Stone Walls & Dense Forest Trees (North)
  { x: 0, y: 0, w: 486, h: 96 },
  { x: 538, y: 0, w: 486, h: 96 },
  { x: 486, y: 0, w: 52, h: 44 }, // North iron gate border

  // 2. Perimeter Stone Walls & Dense Forest Trees (South)
  { x: 0, y: 494, w: 442, h: 65 },
  { x: 584, y: 494, w: 440, h: 65 },
  { x: 486, y: 538, w: 52, h: 25 }, // South exit border

  // 3. Perimeter Stone Walls & Dense Forest Trees (West & East)
  { x: 0, y: 0, w: 72, h: 559 },
  { x: 952, y: 0, w: 72, h: 559 },

  // 4. Central Raised Stone Pedestal / Fountain Base (Full Masonry Dimensions)
  { x: 462, y: 240, w: 100, h: 80 },


  // 6. North Entrance Wooden Signboard (Papan Nama Kayu)
  { x: 462, y: 96, w: 24, h: 14 },

  // 7. South Path Flanking Green Bushes / Trees
  { x: 442, y: 490, w: 40, h: 52 },
  { x: 544, y: 490, w: 40, h: 52 },

  // 8. Southwest Tree Stump with Book & Shrub
  { x: 80, y: 454, w: 34, h: 38 },
  { x: 110, y: 462, w: 28, h: 34 },

  // 9. ST-2 Research Lab Workbenches & Shelves (Fully Uncropped Bounds)
  { x: 102, y: 136, w: 22, h: 102 }, // Left shelves
  { x: 124, y: 136, w: 112, h: 20 }, // Top workbenches
  { x: 234, y: 136, w: 22, h: 102 }, // Right shelves
  { x: 168, y: 180, w: 28, h: 18 },  // Center study table

  // 10. ST-4 Punnett Lab Desks, Boards & Chairs (Clean bounds, no ghost fence)
  { x: 135, y: 312, w: 80, h: 22 }, // Top bulletin boards
  { x: 120, y: 342, w: 98, h: 16 }, // Top desks
  { x: 106, y: 342, w: 18, h: 54 },  // Left desk
  { x: 124, y: 402, w: 86, h: 18 },  // Bottom desks
  { x: 170, y: 422, w: 16, h: 18 },  // South chair

  // 11. ST-3 Gamete Factory Machine (Compact machine footprint, open walking path)
  { x: 324, y: 350, w: 42, h: 36 },

  // 12. ST-5 Harvest Crate & Pea Baskets
  { x: 814, y: 382, w: 34, h: 26 },

  // 13. ST-6 Dihybrid Research Cabin, Stone Well & Flowerbed
  { x: 816, y: 50, w: 104, h: 88 },   // Cabin roof & upper wall
  { x: 816, y: 138, w: 36, h: 66 },   // Cabin front wall left (x: 816-852)
  { x: 884, y: 138, w: 36, h: 66 },   // Cabin front wall right (x: 884-920, doorway perfectly open at x: 852-884)
  { x: 760, y: 146, w: 34, h: 36 },   // Stone well
  { x: 910, y: 210, w: 32, h: 32 },   // Flowerbed box

  // 14. ST-7 Anomaly Hazard Stake & Bell Jar Table
  { x: 654, y: 382, w: 30, h: 24 },

  // 15. ST-8 Dr. Chaos Gothic Gate Pillars & Threshold
  { x: 432, y: 20, w: 160, h: 52 }
];

// Solid Colliders for the Stage 6 Dihybrid Cabin Interior (1024 x 806 room)
const CABIN_COLLIDERS = [
  // North wall, fireplace, blackboard & window
  { x: 0, y: 0, w: 1024, h: 250 },
  // West wall & left bookshelf
  { x: 0, y: 0, w: 76, h: 806 },
  // East wall & right bookshelf
  { x: 948, y: 0, w: 76, h: 806 },
  // South wall left of exit
  { x: 0, y: 760, w: 450, h: 46 },
  // South wall right of exit (exit door opening at x: 450-574)
  { x: 574, y: 760, w: 450, h: 46 },
  // Central Dihybrid Study Table with Microscope & Books
  { x: 310, y: 280, w: 404, h: 120 }
];

// Stardew Valley Organic Environment Data (Tall Grass, Wildflowers, Moss, Pebbles)
const ORGANIC_GRASS_TUFTS = [
  // Northwest Meadow & Orchard area
  { x: 95, y: 110 }, { x: 132, y: 135 }, { x: 168, y: 115 }, { x: 212, y: 140 },
  { x: 238, y: 122 }, { x: 108, y: 175 }, { x: 182, y: 185 }, { x: 248, y: 172 },
  // Around Left Wooden Pen
  { x: 86, y: 288 }, { x: 122, y: 292 }, { x: 172, y: 289 }, { x: 218, y: 293 }, { x: 256, y: 289 },
  // Northeast Meadow
  { x: 775, y: 115 }, { x: 822, y: 132 }, { x: 868, y: 112 }, { x: 914, y: 146 },
  { x: 792, y: 182 }, { x: 842, y: 176 }, { x: 894, y: 186 },
  // Around Right Wooden Pen
  { x: 766, y: 290 }, { x: 812, y: 292 }, { x: 862, y: 289 }, { x: 902, y: 292 },
  // Garden Plot Intersections & Field Edges
  { x: 338, y: 210 }, { x: 392, y: 212 }, { x: 442, y: 208 },
  { x: 582, y: 210 }, { x: 632, y: 208 }, { x: 682, y: 212 },
  { x: 392, y: 432 }, { x: 442, y: 430 },
  { x: 582, y: 432 }, { x: 632, y: 430 }, { x: 682, y: 432 },
  // South Garden Pen Borders
  { x: 112, y: 476 }, { x: 172, y: 478 }, { x: 232, y: 475 },
  { x: 782, y: 476 }, { x: 842, y: 478 }, { x: 912, y: 475 }
];

const WILDFLOWERS = [
  // Yellow Buttercups (cheerful golden blooms)
  { x: 104, y: 126, petal: '#facc15', center: '#b45309' },
  { x: 152, y: 172, petal: '#facc15', center: '#b45309' },
  { x: 226, y: 136, petal: '#facc15', center: '#b45309' },
  { x: 802, y: 122, petal: '#facc15', center: '#b45309' },
  { x: 862, y: 166, petal: '#facc15', center: '#b45309' },
  { x: 912, y: 132, petal: '#facc15', center: '#b45309' },
  { x: 346, y: 214, petal: '#facc15', center: '#b45309' },
  { x: 622, y: 214, petal: '#facc15', center: '#b45309' },

  // White Daisies (clean bright petals with yellow core)
  { x: 122, y: 146, petal: '#ffffff', center: '#eab308' },
  { x: 182, y: 122, petal: '#ffffff', center: '#eab308' },
  { x: 242, y: 182, petal: '#ffffff', center: '#eab308' },
  { x: 782, y: 162, petal: '#ffffff', center: '#eab308' },
  { x: 836, y: 116, petal: '#ffffff', center: '#eab308' },
  { x: 886, y: 176, petal: '#ffffff', center: '#eab308' },
  { x: 412, y: 214, petal: '#ffffff', center: '#eab308' },
  { x: 662, y: 214, petal: '#ffffff', center: '#eab308' },

  // Bluebells (gentle Stardew forest bells)
  { x: 96, y: 166, petal: '#60a5fa', center: '#1d4ed8' },
  { x: 196, y: 166, petal: '#60a5fa', center: '#1d4ed8' },
  { x: 816, y: 146, petal: '#60a5fa', center: '#1d4ed8' },
  { x: 892, y: 142, petal: '#60a5fa', center: '#1d4ed8' },
  { x: 652, y: 426, petal: '#60a5fa', center: '#1d4ed8' },

  // Pink Clovers & Sweet Peas
  { x: 142, y: 116, petal: '#f472b6', center: '#9d174d' },
  { x: 216, y: 172, petal: '#f472b6', center: '#9d174d' },
  { x: 766, y: 136, petal: '#f472b6', center: '#9d174d' },
  { x: 852, y: 182, petal: '#f472b6', center: '#9d174d' },
  { x: 432, y: 426, petal: '#f472b6', center: '#9d174d' },
  { x: 596, y: 426, petal: '#f472b6', center: '#9d174d' },

  // Little Red Wood Blossoms
  { x: 172, y: 142, petal: '#f87171', center: '#7f1d1d' },
  { x: 876, y: 132, petal: '#f87171', center: '#7f1d1d' },
  { x: 386, y: 214, petal: '#f87171', center: '#7f1d1d' },
  { x: 606, y: 426, petal: '#f87171', center: '#7f1d1d' }
];

const PATH_MOSS_PATCHES = [
  // North entrance corridor
  { x: 486, y: 45, rx: 5.5, ry: 3.5, rot: 0.2 },
  { x: 532, y: 65, rx: 6, ry: 4, rot: -0.3 },
  { x: 488, y: 110, rx: 5, ry: 3, rot: 0.1 },
  { x: 534, y: 145, rx: 6.5, ry: 4, rot: 0.4 },
  { x: 487, y: 180, rx: 5, ry: 3.5, rot: -0.2 },
  // Central crossroads & fountain base
  { x: 462, y: 242, rx: 7, ry: 4.5, rot: 0.1 },
  { x: 558, y: 244, rx: 6.5, ry: 4, rot: -0.2 },
  { x: 463, y: 318, rx: 7, ry: 4.5, rot: -0.3 },
  { x: 556, y: 320, rx: 6, ry: 4, rot: 0.2 },
  { x: 452, y: 275, rx: 5, ry: 6, rot: 0.1 },
  { x: 572, y: 275, rx: 5.5, ry: 6, rot: -0.1 },
  // Path junctions & corners
  { x: 272, y: 220, rx: 6, ry: 4, rot: 0.2 },
  { x: 318, y: 224, rx: 5.5, ry: 3.5, rot: -0.1 },
  { x: 270, y: 260, rx: 6, ry: 4.5, rot: 0.3 },
  { x: 320, y: 262, rx: 5, ry: 3.5, rot: -0.2 },
  { x: 702, y: 220, rx: 6, ry: 4, rot: -0.2 },
  { x: 748, y: 224, rx: 5.5, ry: 3.5, rot: 0.1 },
  { x: 704, y: 262, rx: 6, ry: 4.5, rot: -0.3 },
  { x: 750, y: 260, rx: 5, ry: 3.5, rot: 0.2 },
  { x: 272, y: 465, rx: 6, ry: 4, rot: 0.2 },
  { x: 318, y: 468, rx: 5.5, ry: 3.5, rot: -0.1 },
  { x: 702, y: 465, rx: 6, ry: 4, rot: -0.2 },
  { x: 748, y: 468, rx: 5.5, ry: 3.5, rot: 0.1 },
  // South exit path
  { x: 488, y: 475, rx: 6, ry: 4, rot: 0.2 },
  { x: 533, y: 490, rx: 5.5, ry: 3.5, rot: -0.2 },
  { x: 489, y: 520, rx: 6, ry: 4, rot: 0.1 },
  { x: 532, y: 535, rx: 5, ry: 3.5, rot: -0.1 }
];

const PATH_PEBBLES = [
  // North path
  { x: 495, y: 75, w: 3, h: 2, c: '#78716c' },
  { x: 520, y: 95, w: 2.5, h: 2, c: '#a8a29e' },
  { x: 505, y: 135, w: 3, h: 2.5, c: '#64748b' },
  { x: 528, y: 160, w: 2.5, h: 2, c: '#78716c' },
  // East-west ring walkway
  { x: 350, y: 235, w: 3, h: 2, c: '#78716c' },
  { x: 420, y: 242, w: 2.5, h: 2, c: '#a8a29e' },
  { x: 600, y: 240, w: 3, h: 2, c: '#64748b' },
  { x: 660, y: 236, w: 2.5, h: 2, c: '#78716c' },
  { x: 285, y: 245, w: 3, h: 2.5, c: '#78716c' },
  { x: 730, y: 248, w: 2.5, h: 2, c: '#a8a29e' },
  { x: 295, y: 350, w: 3, h: 2, c: '#64748b' },
  { x: 725, y: 360, w: 2.5, h: 2, c: '#78716c' },
  { x: 440, y: 295, w: 3, h: 2, c: '#a8a29e' },
  { x: 580, y: 292, w: 2.5, h: 2, c: '#78716c' },
  { x: 500, y: 360, w: 3, h: 2.5, c: '#64748b' },
  { x: 525, y: 395, w: 2.5, h: 2, c: '#78716c' },
  { x: 380, y: 485, w: 3, h: 2, c: '#78716c' },
  { x: 450, y: 488, w: 2.5, h: 2, c: '#a8a29e' },
  { x: 570, y: 486, w: 3, h: 2, c: '#64748b' },
  { x: 640, y: 484, w: 2.5, h: 2, c: '#78716c' },
  // South path
  { x: 502, y: 450, w: 3, h: 2.5, c: '#78716c' },
  { x: 518, y: 510, w: 2.5, h: 2, c: '#a8a29e' }
];

// 8 Thematic Minigame Stations (Kept defined for future, hidden while focusing on map visuals)
const STATIONS = [
  {
    id: 1,
    name: 'Kebun Ercis Barat Laut',
    stageName: 'Stage 1 – Mystery Garden',
    topic: 'Deteksi Sifat Fisik (Fenotipe)',
    x: 350,
    y: 175,
    radius: 65,
    icon: '🌸',
    color: '#e11d48',
    bg: 'bg-rose-500',
    prompt: 'Tekan [SPASI] Periksa Tanaman Ercis'
  },
  {
    id: 2,
    name: 'Meja Riset Genetika',
    stageName: 'Stage 2 – Gene Builder',
    topic: 'Susun Genotipe & Pasangan Alel',
    x: 178,
    y: 175,
    radius: 78,
    icon: '🧬',
    color: '#6366f1',
    bg: 'bg-indigo-500',
    prompt: 'Tekan [SPASI] Buka Meja Riset Gen'
  },
  {
    id: 3,
    name: 'Kebun Gamet Barat Daya',
    stageName: 'Stage 3 – Gamete Factory',
    topic: 'Hukum Segregasi & Pembentukan Gamet',
    x: 350,
    y: 395,
    radius: 65,
    icon: '⚙️',
    color: '#8b5cf6',
    bg: 'bg-purple-500',
    prompt: 'Tekan [SPASI] Operasikan Mesin Gamet'
  },
  {
    id: 4,
    name: 'Lab Persilangan Punnett',
    stageName: 'Stage 4 – Punnett Lab',
    topic: 'Persilangan Monohibrid 2x2',
    x: 176,
    y: 382,
    radius: 78,
    icon: '🔬',
    color: '#10b981',
    bg: 'bg-emerald-500',
    prompt: 'Tekan [SPASI] Buka Lab Punnett'
  },
  {
    id: 5,
    name: 'Kandang Panen Tenggara',
    stageName: 'Stage 5 – Harvest Challenge',
    topic: 'Prediksi Fenotipe & Rasio Panen 3:1',
    x: 830,
    y: 395,
    radius: 70,
    icon: '🌾',
    color: '#f59e0b',
    bg: 'bg-amber-500',
    prompt: 'Tekan [SPASI] Panen Sesuai Rasio'
  },
  {
    id: 6,
    name: 'Area Riset Timur Laut',
    stageName: 'Stage 6 – Dihybrid Adventure',
    topic: 'Persilangan 2 Sifat Beda (4x4)',
    x: 830,
    y: 175,
    radius: 70,
    icon: '🏡',
    color: '#0284c7',
    bg: 'bg-sky-500',
    prompt: 'Tekan [SPASI] Masuk Lab Dihibrid'
  },
  {
    id: 7,
    name: 'Petak Anomali Genetik',
    stageName: 'Stage 7 – Mutation Trap',
    topic: 'Penyimpangan Semu & Miskonsepsi',
    x: 670,
    y: 395,
    radius: 65,
    icon: '⚠️',
    color: '#f43f5e',
    bg: 'bg-rose-500',
    prompt: 'Tekan [SPASI] Deteksi Anomali Gen'
  },
  {
    id: 8,
    name: 'Gerbang Utara Biara',
    stageName: 'Stage 8 – Final Boss Battle',
    topic: 'Pertarungan Terakhir Master Genetika',
    x: 512,
    y: 55,
    radius: 75,
    icon: '👑',
    color: '#dc2626',
    bg: 'bg-red-600',
    prompt: 'Tekan [SPASI] Duel Lawan Dr. Chaos!'
  }
];

// 5 Landmark Research Conclusions (Kesimpulan Pembelajaran Interaktif Kebun Biara)
export const RESEARCH_CONCLUSIONS = [
  {
    id: 'area_atas',
    key: 'area_atas',
    title: 'Gerbang Utara Biara',
    shortTitle: 'GERBANG ATAS',
    subtitle: 'Puncak Sintesis Hukum Pewarisan Sifat Mendelian',
    badge: '👑 KESIMPULAN AKHIR',
    badgeColor: '#dc2626',
    x: 512,
    y: 78,
    radius: 46,
    prompt: 'Tekan [E] Baca Kesimpulan Gerbang Utara',
    points: [
      {
        icon: '🎲',
        title: 'Hukum Asortasi Bebas (Hukum Mendel II)',
        desc: 'Alel dari gen-gen berbeda mengelompok secara bebas satu sama lain saat pembentukan gamet, menghasilkan keanekaragaman kombinasi sifat pada keturunan.'
      },
      {
        icon: '📊',
        title: 'Rasio Teoritis Klasik Mendel',
        desc: 'Monohibrid F2 menghasilkan rasio fenotipe 3:1 (genotipe 1:2:1). Dihibrid heterozigot ganda menghasilkan rasio fenotipe klasik 9:3:3:1.'
      },
      {
        icon: '✨',
        title: 'Prinsip Pewarisan Partikulat',
        desc: 'Gen diwariskan sebagai unit diskret yang utuh (tidak saling melarutkan atau mencemari), sehingga sifat resesif dapat muncul kembali secara murni pada generasi berikutnya.'
      },
      {
        icon: '🌐',
        title: 'Universalitas Hukum Hereditas',
        desc: 'Prinsip matematika segregasi dan asortasi bebas yang ditemukan Mendel berlaku universal pada seluruh makhluk hidup eukariotik bereproduksi seksual.'
      }
    ],
    formula: 'F2 Monohibrid: 3 Dominan : 1 Resesif | F2 Dihibrid: 9 : 3 : 3 : 1',
    quote: 'Gregor Mendel: "Faktor pembawa sifat melintasi berbagai generasi dengan identitas dan kemurnian yang tetap utuh."'
  },
  {
    id: 'mesin_gamet',
    key: 'mesin_gamet',
    title: 'Mesin Pemilah Gamet Biara',
    shortTitle: 'MESIN GAMET',
    subtitle: 'Hukum Mendel I: Hukum Segregasi Bebas (The Law of Segregation)',
    badge: '⚙️ KESIMPULAN HUKUM MENDEL I',
    badgeColor: '#8b5cf6',
    x: 352,
    y: 352,
    radius: 48,
    prompt: 'Tekan [E] Baca Kesimpulan Mesin Gamet',
    points: [
      {
        icon: '⚙️',
        title: 'Hukum Segregasi Bebas (Hukum Mendel I)',
        desc: 'Sepasang alel yang mengontrol satu sifat akan memisah (bersegregasi) secara bebas dan acak saat pembentukan sel kelamin (gametogenesis / meiosis), sehingga tiap sel gamet haploid hanya membawa satu alel tunggal.'
      },
      {
        icon: '🧬',
        title: 'Pemisahan Pasangan Alel Heterozigot (Aa)',
        desc: 'Induk dengan genotipe heterozigot Aa akan membelah secara adil menjadi dua macam gamet dengan proporsi seimbang 1 : 1, yaitu 50% gamet pembawa alel A dan 50% gamet pembawa alel a.'
      },
      {
        icon: '✨',
        title: 'Prinsip Kemurnian Gamet (Purity of Gametes)',
        desc: 'Alel tidak pernah saling mencampur, melebur, atau mencemari satu sama lain di dalam sel kelamin. Alel resesif (a) tetap murni 100% dan siap diwariskan seutuhnya ke generasi keturunan.'
      },
      {
        icon: '🎯',
        title: 'Pondasi Menuju Diagram Punnett',
        desc: 'Pemisahan gamet secara independen ini menjadi kunci mutlak agar kombinasi acak sel sperma dan sel telur pada fertilisasi menghasilkan rasio genotipe 1:2:1 dan rasio fenotipe 3:1 di Stage 4.'
      }
    ],
    formula: 'Induk Diploid (Aa) ➔ 50% Gamet (A) : 50% Gamet (a) | Rasio Pemisahan Gamet 1 : 1',
    quote: 'Hukum Mendel I: "Faktor-faktor keturunan yang berpasangan akan memisah secara bebas pada saat pembentukan gamet."'
  },

  {
    id: 'area_papan_tulis',
    key: 'area_papan_tulis',
    title: 'Papan Tulis Diagram Punnett',
    shortTitle: 'PAPAN TULIS',
    subtitle: 'Pemetaan Matriks Probabilitas Persilangan',
    badge: '📐 KESIMPULAN ANALISIS',
    badgeColor: '#10b981',
    x: 148,
    y: 395,
    radius: 40,
    prompt: 'Tekan [E] Baca Kesimpulan Papan Tulis',
    points: [
      {
        icon: '♟️',
        title: 'Fungsi Matriks Kisi Punnett',
        desc: 'Diagram Punnett Square memvisualisasikan seluruh kemungkinan kombinasi acak peleburan gamet jantan (baris) dan gamet betina (kolom) saat fertilisasi.'
      },
      {
        icon: '🔢',
        title: 'Matriks Monohibrid 2×2 (Bb × Bb)',
        desc: 'Membentuk 4 kotak probabilitas: 1 BB (Homozigot Dominan), 2 Bb (Heterozigot), dan 1 bb (Homozigot Resesif).'
      },
      {
        icon: '⚖️',
        title: 'Rasio Genotipe vs Fenotipe',
        desc: 'Rasio Genotipe adalah 1 BB : 2 Bb : 1 bb (1:2:1). Rasio Fenotipe adalah 3 Bunga Ungu : 1 Bunga Putih (3:1) akibat dominansi alel B terhadap alel b.'
      }
    ],
    formula: 'Rasio Genotipe: 1 BB : 2 Bb : 1 bb (1:2:1) | Rasio Fenotipe: 3 Dominan : 1 Resesif (3:1)',
    quote: 'Prinsip Probabilitas: "Diagram Punnett membuktikan bahwa fertilisasi bekerja mengikuti hukum peluang matematika."'
  },
  {
    id: 'meja_st4',
    key: 'meja_st4',
    title: 'Meja Riset Lab ST-4',
    shortTitle: 'MEJA LAB ST-4',
    subtitle: 'Tabulasi Data Empiris & Bukti Non-Blending',
    badge: '🔬 KESIMPULAN RISET LAB',
    badgeColor: '#8b5cf6',
    x: 185,
    y: 345,
    radius: 40,
    prompt: 'Tekan [E] Baca Kesimpulan Meja Lab',
    points: [
      {
        icon: '📝',
        title: 'Kekuatan Sampel Statistik Masif',
        desc: 'Mendel mencatat ribuan tanaman ercis di meja lab (rasio riil: 5.474 bulat : 1.850 keriput = 2,96 : 1), membuktikan deviasi kecil tetap berkonvergensi ke rasio 3:1.'
      },
      {
        icon: '💎',
        title: 'Bukti Penolakan Blending Inheritance',
        desc: 'Sifat keriput atau bunga putih yang tertutup pada F1 muncul kembali seutuhnya tanpa cacat pada F2, menyangkal teori bahwa sifat orang tua bercampur seperti cat.'
      },
      {
        icon: '🔍',
        title: 'Alel Dominan Menutupi, Bukan Menghapus',
        desc: 'Individu heterozigot (Bb) tetap mewariskan alel resesif (b) secara independen ke generasi berikutnya dengan probabilitas 50% per gamet.'
      }
    ],
    formula: 'Sampel Nyata Mendel: 5.474 Bulat : 1.850 Keriput ≈ 2,96 : 1 (Mendekati Presisi 3 : 1)',
    quote: 'Prinsip Empiris: "Hanya lewat pencatatan kuantitatif yang cermat di meja riset, keteraturan hukum alam dapat terkuak."'
  }
];

// =============================================================================
// AUTHENTIC 16-BIT STARDEW VALLEY SPRITES FOR ST-2 & ST-4
// (Rendered using high-fidelity transparent pixel-art PNG sprites)
// =============================================================================

// --- Open Gate at Left Wooden Fence (x: 148-200, y: 298-318) ---
const drawOpenPenGate = (ctx) => {
  const gx = 148;
  const gy = 298;
  const gw = 52;

  // Cobblestone / Dirt threshold entrance
  ctx.fillStyle = '#8b6f4e';
  ctx.fillRect(gx + 2, gy - 2, gw - 4, 18);

  // Stepping stones
  ctx.fillStyle = '#a89078';
  ctx.fillRect(gx + 6, gy + 1, 8, 4);
  ctx.fillRect(gx + 20, gy + 5, 10, 5);
  ctx.fillRect(gx + 36, gy + 2, 9, 4);
  ctx.fillRect(gx + 12, gy + 9, 11, 4);
  ctx.fillRect(gx + 28, gy + 10, 10, 4);

  // Gateposts
  ctx.fillStyle = '#2b1103';
  ctx.fillRect(gx - 2, gy - 6, 6, 24);
  ctx.fillRect(gx + gw - 4, gy - 6, 6, 24);
  ctx.fillStyle = '#633917';
  ctx.fillRect(gx - 1, gy - 5, 4, 22);
  ctx.fillRect(gx + gw - 3, gy - 5, 4, 22);
  // Post caps
  ctx.fillStyle = '#ca8a04';
  ctx.fillRect(gx - 2, gy - 7, 6, 2);
  ctx.fillRect(gx + gw - 4, gy - 7, 6, 2);

  // Open wooden gate doors swung into pen
  ctx.fillStyle = '#542508';
  ctx.fillRect(gx + 3, gy + 1, 2, 14);
  ctx.fillRect(gx + 4, gy + 3, 6, 2);
  ctx.fillRect(gx + 4, gy + 11, 6, 2);

  ctx.fillRect(gx + gw - 5, gy + 1, 2, 14);
  ctx.fillRect(gx + gw - 10, gy + 3, 6, 2);
  ctx.fillRect(gx + gw - 10, gy + 11, 6, 2);
};

// =============================================================================
// GARDEN MAP (Tanaman dan petak canvas dihapus - menggunakan pixel art map asli)
// =============================================================================

// =============================================================================
// THEMATIC STAGE PROPS (MATCHING GAME DATA & USER UPLOADED IMAGES)
// =============================================================================

// --- Stage 1: Mystery Garden Props (Observation stake, magnifying glass, phenotype notes) ---
const drawStage1_MysteryGardenProps = (ctx, animTimer) => {
  const sx = 328;
  const sy = 182;

  // Ground shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(sx + 8, sy + 14, 10, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wooden stake with observation clipboard
  ctx.fillStyle = '#542508';
  ctx.fillRect(sx + 6, sy - 4, 3, 18);
  // Clipboard back
  ctx.fillStyle = '#78350f';
  ctx.fillRect(sx, sy - 14, 15, 12);
  ctx.fillStyle = '#ca8a04'; // Clip
  ctx.fillRect(sx + 5, sy - 15, 5, 2);
  // Paper
  ctx.fillStyle = '#fefce8';
  ctx.fillRect(sx + 2, sy - 12, 11, 9);
  // Written lines
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(sx + 4, sy - 10, 7, 1);
  ctx.fillRect(sx + 4, sy - 8, 6, 1);
  ctx.fillRect(sx + 4, sy - 6, 7, 1);

  // Brass magnifying glass observing purple blossom
  const magBob = Math.sin(animTimer * 0.08) * 1.5;
  ctx.fillStyle = '#d97706';
  ctx.fillRect(sx + 14, sy - 6 + magBob, 1, 8); // Handle
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(sx + 14, sy - 9 + magBob, 3.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(186, 230, 253, 0.45)';
  ctx.fill();
};

// --- Stage 3: Gamete Factory Machine (User's Uploaded Image 2) ---
const drawStage3_GameteMachine = (ctx, animTimer, propGameteRef) => {
  const mx = 326;
  const my = 352;
  const mw = 52;
  const mh = 73;



  // Ground contact shadow beneath heavy brass & timber machine
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.beginPath();
  ctx.ellipse(mx + mw / 2, my + mh - 2, 26, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  const img = propGameteRef.current;
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, mx, my, mw, mh);
  }

  // Animated steam puff from top hopper
  const steamPhase = (animTimer * 0.04) % 1;
  ctx.fillStyle = `rgba(240, 249, 255, ${0.45 * (1 - steamPhase)})`;
  ctx.beginPath();
  ctx.arc(mx + mw / 2, my - 4 - steamPhase * 10, 3 + steamPhase * 4, 0, Math.PI * 2);
  ctx.fill();
};

// --- Stage 5: Harvest Challenge Props (Crates & baskets of green/yellow peas, 3:1 ratio sign) ---
const drawStage5_HarvestProps = (ctx, animTimer) => {
  const hx = 814;
  const hy = 380;

  // Ground shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.40)';
  ctx.beginPath();
  ctx.ellipse(hx + 16, hy + 22, 18, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wooden harvest crate with pea pods
  ctx.fillStyle = '#451a03';
  ctx.fillRect(hx, hy + 6, 18, 14);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(hx + 1, hy + 7, 16, 12);
  // Slat highlights
  ctx.fillStyle = '#9a3412';
  ctx.fillRect(hx + 1, hy + 10, 16, 1);
  ctx.fillRect(hx + 1, hy + 14, 16, 1);
  // Green pea pods inside crate
  ctx.fillStyle = '#16a34a';
  ctx.fillRect(hx + 3, hy + 4, 12, 4);
  ctx.fillStyle = '#4ade80';
  ctx.fillRect(hx + 4, hy + 3, 10, 2);

  // Woven bushel basket with round yellow seeds
  ctx.fillStyle = '#92400e';
  ctx.beginPath();
  ctx.ellipse(hx + 24, hy + 14, 6, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#eab308'; // Golden yellow seeds
  ctx.beginPath();
  ctx.ellipse(hx + 24, hy + 12, 5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Small carved ratio signboard "3 : 1"
  ctx.fillStyle = '#542508';
  ctx.fillRect(hx + 8, hy - 8, 2, 8);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(hx + 2, hy - 14, 14, 7);
  ctx.fillStyle = '#fde68a';
  ctx.font = 'bold 5px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('3 : 1', hx + 9, hy - 9);
};

// --- Water Animation: Stone Well (Outdoor Northeast, next to Cabin) ---
const drawStoneWellWater = (ctx, animTimer) => {
  // Real stone well center in background map is at x: 782, y: 156
  // No fake vector ovals that float in the grass
  const wx = 782;
  const wy = 158;

  // Tiny subtle pixel droplet dripping from bucket rope into the well
  const dropCycle = (animTimer * 0.05) % 1;
  if (dropCycle < 0.85) {
    const dropY = wy - 10 + dropCycle * 10;
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(wx - 1, Math.round(dropY), 2, 2);
  } else {
    // Subtle pixel ripple glint at impact
    ctx.fillStyle = 'rgba(224, 242, 254, 0.6)';
    ctx.fillRect(wx - 3, wy, 2, 1);
    ctx.fillRect(wx + 2, wy, 2, 1);
  }
};

// --- Water Animation: Central Monastery Fountain / Pedestal Pool ---
const drawFountainWater = (ctx, animTimer) => {
  const fx = 512;
  const topY = 241; // Top spout nozzle coordinate
  const basinY = 276; // Basin pool level

  // 1. Center Top Spout (Air memancar ke atas lalu turun)
  const spoutFrame = Math.floor(animTimer * 0.25) % 4;
  const topPixels = [
    // [dx, dy, color, size]
    [0, -4, '#ffffff', 2],
    [-1, -2, '#e0f2fe', 2],
    [1, -2, '#e0f2fe', 2],
    [0, -1, '#bae6fd', 2],
    [-2, 0, '#7dd3fc', 2],
    [2, 0, '#7dd3fc', 2],
  ];
  topPixels.forEach(([dx, dy, color, size], idx) => {
    const pulse = (spoutFrame + idx) % 3 === 0 ? 1 : 0;
    ctx.fillStyle = color;
    ctx.fillRect(fx + dx, topY + dy - pulse, size, size);
  });

  // 2. Left and Right Cascading Streams (Aliran air lengkung berpiksel yang mengalir turun)
  // Left stream path points (from top nozzle down along the left arch)
  const leftStream = [
    { x: fx - 2, y: 242 },
    { x: fx - 5, y: 244 },
    { x: fx - 8, y: 248 },
    { x: fx - 11, y: 254 },
    { x: fx - 13, y: 261 },
    { x: fx - 14, y: 268 },
    { x: fx - 13, y: 274 },
  ];

  // Right stream path points (from top nozzle down along the right arch)
  const rightStream = [
    { x: fx + 2, y: 242 },
    { x: fx + 5, y: 244 },
    { x: fx + 8, y: 248 },
    { x: fx + 11, y: 254 },
    { x: fx + 13, y: 261 },
    { x: fx + 14, y: 268 },
    { x: fx + 13, y: 274 },
  ];

  // Center vertical stream
  const centerStream = [
    { x: fx, y: 244 },
    { x: fx - 1, y: 250 },
    { x: fx + 1, y: 256 },
    { x: fx, y: 263 },
    { x: fx - 1, y: 270 },
  ];

  // Render streams with cycling pixel beads
  const streamCycle = (animTimer * 0.3) % 1;
  const drawStreamBeads = (points) => {
    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      const phase = (streamCycle + i / points.length) % 1;
      const isLead = phase > 0.6;
      ctx.fillStyle = isLead ? '#ffffff' : (i % 2 === 0 ? '#bae6fd' : '#38bdf8');
      ctx.fillRect(Math.round(pt.x), Math.round(pt.y), 2, 2);
    }
  };

  drawStreamBeads(leftStream);
  drawStreamBeads(rightStream);
  drawStreamBeads(centerStream);

  // 3. Splash Droplets at Left & Right Impact Zones (Percikan busa air jatuh)
  const splashTime = animTimer * 0.35;
  const splashPoints = [
    { bx: fx - 13, by: basinY },
    { bx: fx + 13, by: basinY },
    { bx: fx, by: basinY - 2 }
  ];

  splashPoints.forEach(({ bx, by }, sIdx) => {
    for (let p = 0; p < 3; p++) {
      const pPhase = (splashTime + sIdx * 0.33 + p * 0.3) % 1;
      const pUp = Math.sin(pPhase * Math.PI) * 4;
      const pOut = (p - 1) * (pPhase * 3.5);
      
      ctx.fillStyle = pPhase < 0.5 ? '#ffffff' : '#bae6fd';
      ctx.fillRect(Math.round(bx + pOut), Math.round(by - pUp), 2, 2);
    }

    // Expanding pixel foam ring on water surface
    const ringPhase = (splashTime + sIdx * 0.4) % 1;
    const ringR = Math.round(1 + ringPhase * 4);
    ctx.fillStyle = `rgba(255, 255, 255, ${0.7 * (1 - ringPhase)})`;
    ctx.fillRect(bx - ringR, by, 2, 1);
    ctx.fillRect(bx + ringR, by, 2, 1);
    ctx.fillRect(bx, by - Math.round(ringR * 0.5), 2, 1);
    ctx.fillRect(bx, by + Math.round(ringR * 0.5), 2, 1);
  });

  // 4. Subtle Shimmer Glints across the natural pool water (Tanpa menutup kolam batu)
  const glintPositions = [
    { x: fx - 16, y: basinY + 4, phase: 0 },
    { x: fx + 14, y: basinY + 5, phase: 0.25 },
    { x: fx - 6, y: basinY + 8, phase: 0.5 },
    { x: fx + 8, y: basinY + 7, phase: 0.75 },
    { x: fx, y: basinY + 11, phase: 0.4 }
  ];

  glintPositions.forEach(({ x, y, phase }) => {
    const glintCycle = (animTimer * 0.08 + phase) % 1;
    if (glintCycle < 0.35) {
      const sparkleType = Math.floor(glintCycle / 0.12);
      ctx.fillStyle = sparkleType === 1 ? '#ffffff' : '#bae6fd';
      ctx.fillRect(x, y, 2, 2);
      if (sparkleType === 1) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 1, y, 1, 1);
        ctx.fillRect(x + 2, y, 1, 1);
      }
    }
  });
};

// --- Stage 6 Outdoor: Cabin Doorway Interaction ---
const drawStage6_OutdoorCabinDoor = (ctx, p, animTimer) => {
  const doorX = 868;
  const doorY = 204;
  const dist = Math.hypot(p.x - doorX, p.y - doorY);
  const isNear = dist <= 28;

  // Warm brass wall lantern above cabin doorway
  ctx.fillStyle = '#78350f';
  ctx.fillRect(doorX + 16, doorY - 32, 2, 8);
  ctx.fillStyle = '#ca8a04';
  ctx.fillRect(doorX + 15, doorY - 35, 4, 4);

  // Lantern warm light glow
  const flicker = (Math.sin(animTimer * 0.18) + 1) * 0.5;
  const lanternGlow = ctx.createRadialGradient(doorX + 17, doorY - 33, 1, doorX + 17, doorY - 33, 22);
  lanternGlow.addColorStop(0, `rgba(254, 240, 138, ${0.45 + flicker * 0.2})`);
  lanternGlow.addColorStop(0.6, `rgba(245, 158, 11, ${0.15 + flicker * 0.1})`);
  lanternGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = lanternGlow;
  ctx.beginPath();
  ctx.arc(doorX + 17, doorY - 33, 22, 0, Math.PI * 2);
  ctx.fill();

  // Stone doorstep
  ctx.fillStyle = '#78716c';
  ctx.fillRect(doorX - 14, doorY - 1, 28, 4);
  ctx.fillStyle = '#a8a29e';
  ctx.fillRect(doorX - 13, doorY - 1, 26, 1.5);

  // Interactive Door Badge: [E] Masuk Lab Dihibrid
  if (isNear) {
    const bob = Math.sin(animTimer * 0.12) * 2.5;
    const promptY = doorY - 36 + bob;
    const badgeW = 106;
    const badgeH = 17;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.50)';
    ctx.beginPath();
    ctx.roundRect(doorX - badgeW / 2 + 1.5, promptY + 1.5, badgeW, badgeH, 8);
    ctx.fill();

    ctx.fillStyle = '#240e03';
    ctx.beginPath();
    ctx.roundRect(doorX - badgeW / 2, promptY, badgeW, badgeH, 8);
    ctx.fill();

    const pillGrad = ctx.createLinearGradient(0, promptY, 0, promptY + badgeH);
    pillGrad.addColorStop(0, '#0284c7');
    pillGrad.addColorStop(1, '#0369a1');
    ctx.fillStyle = pillGrad;
    ctx.beginPath();
    ctx.roundRect(doorX - badgeW / 2 + 1.2, promptY + 1.2, badgeW - 2.4, badgeH - 2.4, 7);
    ctx.fill();

    // Golden [E] Keycap
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.roundRect(doorX - badgeW / 2 + 3.5, promptY + 2.5, 12, 12, 2.5);
    ctx.fill();

    ctx.fillStyle = '#1c0a02';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('E', doorX - badgeW / 2 + 9.5, promptY + 8.5);

    // Text: MASUK LAB DIHIBRID
    ctx.fillStyle = '#0f172a';
    ctx.font = '700 8.5px "Pixelify Sans", "Jersey 10", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('MASUK LAB DIHIBRID', doorX - badgeW / 2 + 19, promptY + 9.5);
    ctx.fillStyle = '#f0f9ff';
    ctx.fillText('MASUK LAB DIHIBRID', doorX - badgeW / 2 + 18, promptY + 8.5);

    // Pointer notch
    ctx.fillStyle = '#240e03';
    ctx.beginPath();
    ctx.moveTo(doorX - 3.5, promptY + badgeH);
    ctx.lineTo(doorX + 3.5, promptY + badgeH);
    ctx.lineTo(doorX, promptY + badgeH + 4);
    ctx.closePath();
    ctx.fill();
  }
};

// --- 8 Thematic NPCs: Rendering & Overhead Interaction Badge ---
const drawSingleNpc = (ctx, npc, animTimer, p, npcImagesRef, thomasFramesRef, rosalindFramesRef, gigiFramesRef, mendelFramesRef, barnabyFramesRef, fafaFramesRef, droneFramesRef, chaosFramesRef, greetedNpcsRef) => {
  const x = Math.round(npc.currentX);
  const y = Math.round(npc.currentY);
  const isDrone = npc.id === 'npc_7_drone';
  const isThomas = npc.id === 'npc_1_monk';
  const isRosalind = npc.id === 'npc_2_geneticist';
  const isGigi = npc.id === 'npc_3_mechanic';
  const isMendel = npc.id === 'npc_4_mendel';
  const isBarnaby = npc.id === 'npc_5_farmer';
  const isFafa = npc.id === 'npc_6_assistant';
  const isChaos = npc.id === 'npc_8_chaos';

  // 1. Ground Drop Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
  ctx.beginPath();
  ctx.ellipse(x, y - 1, isDrone ? 5 : (isChaos ? 9 : 8), isDrone ? 2 : 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Drone specific hovering height
  let hoverY = 0;
  if (isDrone) {
    hoverY = Math.sin(animTimer * 0.08) * 3 - 11;
  }

  // 3. Bruder Thomas: Custom Authentic Sliced Sprite Sheet Animation
  if (isThomas && thomasFramesRef?.current) {
    const tf = thomasFramesRef.current;
    let frame = null;
    let flipX = false;
    let frameW = 23;
    let frameH = 42;
    let animBob = 0;

    if (npc.isNearPlayer) {
      // Near player: stop, face player warmly, breathe & blink
      const dir = npc.currentDirection || 'down';
      if (dir === 'down') {
        const isBlink = (Math.floor(animTimer) % 200 >= 0 && Math.floor(animTimer) % 200 <= 10);
        frame = isBlink && tf.idle?.[1] ? tf.idle[1] : (tf.idle?.[0] || tf.down?.[0]);
      } else if (dir === 'up') {
        frame = tf.up?.[0] || tf.down?.[0];
      } else if (dir === 'left') {
        frame = tf.right?.[0] || tf.idle?.[0];
        flipX = true;
      } else {
        frame = tf.right?.[0] || tf.idle?.[0];
      }
      // Gentle breathing
      const breath = Math.sin(animTimer * 0.06);
      animBob = breath > 0.4 ? -0.8 : 0;
    } else if (npc.isWalking) {
      // Walking: cycle directional walk frames
      const dir = npc.currentDirection || 'down';
      const frameIdx = Math.floor(npc.stepTimer * 0.16) % 4;
      if (dir === 'down') {
        frame = tf.down?.[frameIdx];
      } else if (dir === 'up') {
        frame = tf.up?.[frameIdx];
      } else if (dir === 'left') {
        frame = tf.right?.[frameIdx];
        flipX = true;
      } else {
        frame = tf.right?.[frameIdx];
      }
      animBob = (frameIdx % 2 === 1 ? -1 : 0);
    } else {
      // Autonomous idle actions in the garden: digging soil, wiping sweat, or peaceful standing
      const act = npc.action || 'idle';
      if (act === 'dig' && tf.dig) {
        frame = tf.dig;
        frameH = 34;
        frameW = Math.round(frameH * (frame.naturalWidth / (frame.naturalHeight || 1))) || 32;
        // Subtle soil digging particles
        if (Math.sin(animTimer * 0.25) > 0.4) {
          ctx.fillStyle = '#78350f';
          ctx.fillRect(x + 10, y - 6, 2, 2);
          ctx.fillRect(x + 14, y - 9, 1.5, 1.5);
        }
      } else if (act === 'sweat' && tf.sweat) {
        frame = tf.sweat;
        frameH = 42;
        frameW = Math.round(frameH * (frame.naturalWidth / (frame.naturalHeight || 1))) || 24;
        // Water drops wiping forehead
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + 8, y - 36, 1.5, 2.5);
      } else {
        // Peaceful idle standing & blinking
        const isBlink = (Math.floor(animTimer) % 220 >= 0 && Math.floor(animTimer) % 220 <= 10);
        frame = isBlink && tf.idle?.[1] ? tf.idle[1] : (tf.idle?.[0] || tf.down?.[0]);
        const breath = Math.sin(animTimer * 0.05);
        animBob = breath > 0.45 ? -0.8 : 0;
      }
    }

    if (frame && frame.complete && frame.naturalWidth > 0) {
      if (frameW === 23 && frameH === 42) {
        frameW = Math.round(frameH * (frame.naturalWidth / frame.naturalHeight)) || 23;
      }
      ctx.save();
      ctx.translate(x, Math.round(y + animBob));
      if (flipX) ctx.scale(-1, 1);
      ctx.drawImage(frame, -frameW / 2, -frameH, frameW, frameH);
      ctx.restore();
    } else {
      // Fallback
      ctx.fillStyle = '#542508';
      ctx.fillRect(x - 6, y - 24, 12, 24);
    }
  } else if (isRosalind && rosalindFramesRef?.current) {
    // 3b. Prof. Rosalind: Custom Authentic Sliced Sprite Sheet Animation
    const rf = rosalindFramesRef.current;
    let frame = null;
    let flipX = false;
    let frameW = 21;
    let frameH = 41;
    let animBob = 0;

    if (npc.isNearPlayer) {
      // Near player: stop, face player warmly, hold clipboard, push glasses up every ~3.5s
      const dir = npc.currentDirection || 'right';
      if (dir === 'up') {
        frame = rf.up?.[0] || rf.idle;
      } else if (dir === 'left') {
        frame = rf.right?.[0] || rf.idle;
        flipX = true;
      } else if (dir === 'right') {
        frame = rf.right?.[0] || rf.idle;
      } else {
        // Facing down / front: adjust glasses occasionally
        const isAdjusting = (Math.floor(animTimer) % 200 >= 0 && Math.floor(animTimer) % 200 <= 14);
        frame = isAdjusting && rf.glasses ? rf.glasses : (rf.idle || rf.down?.[0]);
      }
      const breath = Math.sin(animTimer * 0.06);
      animBob = breath > 0.4 ? -0.8 : 0;
    } else if (npc.isWalking) {
      // Walking: cycle directional walk frames
      const dir = npc.currentDirection || 'right';
      const frameIdx = Math.floor(npc.stepTimer * 0.16) % 4;
      if (dir === 'down') {
        frame = rf.down?.[frameIdx];
      } else if (dir === 'up') {
        frame = rf.up?.[frameIdx];
      } else if (dir === 'left') {
        frame = rf.right?.[frameIdx];
        flipX = true;
      } else {
        frame = rf.right?.[frameIdx];
      }
      animBob = (frameIdx % 2 === 1 ? -1 : 0);
    } else {
      // Autonomous idle actions near Stage 2 Lab: reading clipboard notes, inspecting purple test tube, adjusting glasses
      const act = npc.action || 'idle';
      if (act === 'clipboard' && rf.clipboard) {
        frame = rf.clipboard;
      } else if (act === 'test_tube' && rf.test_tube) {
        frame = rf.test_tube;
        // Subtle purple test tube chemical sparkle glint
        if (Math.sin(animTimer * 0.25) > 0.4) {
          ctx.fillStyle = '#c084fc';
          ctx.fillRect(x + 10, y - 36, 2, 2);
          ctx.fillStyle = '#fdf4ff';
          ctx.fillRect(x + 11, y - 35, 1, 1);
        }
      } else if (act === 'glasses' && rf.glasses) {
        frame = rf.glasses;
      } else {
        // Peaceful idle standing with clipboard
        const isAdjusting = (Math.floor(animTimer) % 240 >= 0 && Math.floor(animTimer) % 240 <= 14);
        frame = isAdjusting && rf.glasses ? rf.glasses : (rf.idle || rf.down?.[0]);
        const breath = Math.sin(animTimer * 0.05);
        animBob = breath > 0.45 ? -0.8 : 0;
      }
    }

    if (frame && frame.complete && frame.naturalWidth > 0) {
      frameW = Math.round(frameH * (frame.naturalWidth / frame.naturalHeight)) || 21;
      ctx.save();
      ctx.translate(x, Math.round(y + animBob));
      if (flipX) ctx.scale(-1, 1);
      ctx.drawImage(frame, -frameW / 2, -frameH, frameW, frameH);
      ctx.restore();
    } else {
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(x - 5, y - 24, 10, 24);
    }
  } else if (isGigi && gigiFramesRef?.current) {
    // 3c. Gigi si Mekanik: Custom Authentic Sliced Sprite Sheet Animation
    const gf = gigiFramesRef.current;
    let frame = null;
    let flipX = false;
    let frameW = 22;
    let frameH = 41;
    let animBob = 0;

    if (npc.isNearPlayer) {
      // Near player: stop, face player enthusiastically with wrench
      const dir = npc.currentDirection || 'up';
      if (dir === 'up') {
        frame = gf.up?.[0] || gf.idle;
      } else if (dir === 'left') {
        frame = gf.right?.[0] || gf.idle;
        flipX = true;
      } else if (dir === 'right') {
        frame = gf.right?.[0] || gf.idle;
      } else {
        // Facing down: playful wink or wrench wave
        const isWrenchWave = (Math.floor(animTimer) % 180 >= 0 && Math.floor(animTimer) % 180 <= 16);
        frame = isWrenchWave && gf.wrench ? gf.wrench : (gf.idle || gf.down?.[0]);
      }
      const breath = Math.sin(animTimer * 0.06);
      animBob = breath > 0.4 ? -0.8 : 0;
    } else if (npc.isWalking) {
      // Walking: cycle directional walk frames
      const dir = npc.currentDirection || 'up';
      const frameIdx = Math.floor(npc.stepTimer * 0.16) % 4;
      if (dir === 'down') {
        frame = gf.down?.[frameIdx];
      } else if (dir === 'up') {
        frame = gf.up?.[frameIdx];
      } else if (dir === 'left') {
        frame = gf.right?.[frameIdx];
        flipX = true;
      } else {
        frame = gf.right?.[frameIdx];
      }
      animBob = (frameIdx % 2 === 1 ? -1 : 0);
    } else {
      // Autonomous idle actions near Stage 3 Gamete Factory: raising wrench, wiping grease cheek, pulling down goggles
      const act = npc.action || 'idle';
      if (act === 'wrench' && gf.wrench) {
        frame = gf.wrench;
        // Metallic wrench silver glint
        if (Math.sin(animTimer * 0.25) > 0.35) {
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(x + 12, y - 37, 2, 2);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(x + 13, y - 36, 1, 1);
        }
      } else if (act === 'wipe' && gf.wipe) {
        frame = gf.wipe;
      } else if (act === 'goggles' && gf.goggles) {
        frame = gf.goggles;
      } else {
        // Peaceful idle standing with wrench
        const isWaving = (Math.floor(animTimer) % 220 >= 0 && Math.floor(animTimer) % 220 <= 14);
        frame = isWaving && gf.wipe ? gf.wipe : (gf.idle || gf.down?.[0]);
        const breath = Math.sin(animTimer * 0.05);
        animBob = breath > 0.45 ? -0.8 : 0;
      }
    }

    if (frame && frame.complete && frame.naturalWidth > 0) {
      frameW = Math.round(frameH * (frame.naturalWidth / frame.naturalHeight)) || 22;
      ctx.save();
      ctx.translate(x, Math.round(y + animBob));
      if (flipX) ctx.scale(-1, 1);
      ctx.drawImage(frame, -frameW / 2, -frameH, frameW, frameH);
      ctx.restore();
    } else {
      ctx.fillStyle = '#b45309';
      ctx.fillRect(x - 5, y - 24, 10, 24);
    }
  } else if (isMendel && mendelFramesRef?.current) {
    // 3d. Pater Gregor Mendel: Custom Authentic Sliced Sprite Sheet Animation
    const mf = mendelFramesRef.current;
    let frame = null;
    let flipX = false;
    let frameW = 23;
    let frameH = 43;
    let animBob = 0;

    if (npc.isNearPlayer) {
      // Near player: stop, face player warmly with peaceful monastic presence
      const dir = npc.currentDirection || 'down';
      if (dir === 'up') {
        frame = mf.up?.[0] || mf.idle;
      } else if (dir === 'left') {
        frame = mf.right?.[0] || mf.idle;
        flipX = true;
      } else if (dir === 'right') {
        frame = mf.right?.[0] || mf.idle;
      } else {
        // Facing down: calm monk smile or spectacle shine
        const isBlink = (Math.floor(animTimer) % 200 >= 0 && Math.floor(animTimer) % 200 <= 12);
        frame = isBlink && mf.plant ? mf.plant : (mf.idle || mf.down?.[0]);
      }
      const breath = Math.sin(animTimer * 0.05);
      animBob = breath > 0.45 ? -0.8 : 0;
    } else if (npc.isWalking) {
      // Walking: cycle directional walk frames
      const dir = npc.currentDirection || 'down';
      const frameIdx = Math.floor(npc.stepTimer * 0.16) % 4;
      if (dir === 'down') {
        frame = mf.down?.[frameIdx];
      } else if (dir === 'up') {
        frame = mf.up?.[frameIdx];
      } else if (dir === 'left') {
        frame = mf.right?.[frameIdx];
        flipX = true;
      } else {
        frame = mf.right?.[frameIdx];
      }
      animBob = (frameIdx % 2 === 1 ? -1 : 0);
    } else {
      // Autonomous idle actions near Stage 4 Punnett Square:
      // 1. Inspecting pea sprout with magnifying glass ('plant')
      // 2. Reading open red genetics journal ('book')
      // 3. Contemplative monk standing ('idle')
      const act = npc.action || 'idle';
      if (act === 'plant' && mf.plant) {
        frame = mf.plant;
        // Magnifying glass lens light reflection glint
        if (Math.sin(animTimer * 0.22) > 0.35) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + 11, y - 32, 2, 2);
          ctx.fillStyle = '#86efac'; // Pale green plant glint
          ctx.fillRect(x + 12, y - 31, 1, 1);
        }
      } else if (act === 'book' && mf.book) {
        frame = mf.book;
        // Soft golden manuscript illumination glint
        if (Math.sin(animTimer * 0.28) > 0.4) {
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(x + 13, y - 27, 2, 1);
        }
      } else {
        // Peaceful idle standing with glasses
        const isStudyingNotes = (Math.floor(animTimer) % 240 >= 0 && Math.floor(animTimer) % 240 <= 16);
        frame = isStudyingNotes && mf.book_alt ? mf.book_alt : (mf.idle || mf.down?.[0]);
        const breath = Math.sin(animTimer * 0.05);
        animBob = breath > 0.45 ? -0.8 : 0;
      }
    }

    if (frame && frame.complete && frame.naturalWidth > 0) {
      frameW = Math.round(frameH * (frame.naturalWidth / frame.naturalHeight)) || 23;
      ctx.save();
      ctx.translate(x, Math.round(y + animBob));
      if (flipX) ctx.scale(-1, 1);
      ctx.drawImage(frame, -frameW / 2, -frameH, frameW, frameH);
      ctx.restore();
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x - 5, y - 24, 10, 24);
    }
  } else if (isBarnaby && barnabyFramesRef?.current) {
    // 3e. Pak Barnaby: Senior Farm Harvester Sprite Sheet Animation
    const bf = barnabyFramesRef.current;
    let frame = null;
    let flipX = false;
    let frameW = 22;
    let frameH = 42;
    let animBob = 0;

    if (npc.isNearPlayer) {
      // Near player: stop, face player enthusiastically holding green pea harvest basket
      const dir = npc.currentDirection || 'right';
      if (dir === 'up') {
        frame = bf.up?.[0] || bf.idle;
      } else if (dir === 'left') {
        frame = bf.right?.[0] || bf.idle;
        flipX = true;
      } else if (dir === 'right') {
        frame = bf.right?.[0] || bf.idle;
      } else {
        // Facing down: proud harvest smile or showing fresh pea pod
        const isShowingPod = (Math.floor(animTimer) % 200 >= 0 && Math.floor(animTimer) % 200 <= 14);
        frame = isShowingPod && bf.pod ? bf.pod : (bf.idle || bf.down?.[0]);
      }
      const breath = Math.sin(animTimer * 0.055);
      animBob = breath > 0.45 ? -0.8 : 0;
    } else if (npc.isWalking) {
      // Walking: cycle directional walk frames carrying basket
      const dir = npc.currentDirection || 'right';
      const frameIdx = Math.floor(npc.stepTimer * 0.16) % 4;
      if (dir === 'down') {
        frame = bf.down?.[frameIdx];
      } else if (dir === 'up') {
        frame = bf.up?.[frameIdx];
      } else if (dir === 'left') {
        frame = bf.right?.[frameIdx];
        flipX = true;
      } else {
        frame = bf.right?.[frameIdx];
      }
      animBob = (frameIdx % 2 === 1 ? -1 : 0);
    } else {
      // Autonomous idle actions near Stage 5 Kandang Panen:
      // 1. Inspecting freshly plucked pea pod ('pod')
      // 2. Wiping honest farm sweat from brow ('sweat')
      // 3. Cheerful laughing / harvest celebration ('cheer')
      // 4. Cheerful idle holding harvest basket ('idle')
      const act = npc.action || 'idle';
      if (act === 'pod' && bf.pod) {
        frame = bf.pod;
        // Fresh green pea pod sparkle
        if (Math.sin(animTimer * 0.22) > 0.35) {
          ctx.fillStyle = '#86efac';
          ctx.fillRect(x + 11, y - 34, 2, 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + 12, y - 33, 1, 1);
        }
      } else if (act === 'sweat' && bf.sweat) {
        frame = bf.sweat;
        // Sweat droplet animation
        if (Math.sin(animTimer * 0.2) > 0.3) {
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(x + 12, y - 39, 2, 2);
        }
      } else if (act === 'cheer' && bf.cheer) {
        frame = bf.cheer;
        // Laughing bob
        animBob = Math.sin(animTimer * 0.25) > 0.2 ? -1.2 : 0;
      } else {
        // Peaceful idle holding basket with rhythmic breathing
        const isCheering = (Math.floor(animTimer) % 250 >= 0 && Math.floor(animTimer) % 250 <= 16);
        frame = isCheering && bf.cheer ? bf.cheer : (bf.idle || bf.down?.[0]);
        const breath = Math.sin(animTimer * 0.05);
        animBob = breath > 0.45 ? -0.8 : 0;
      }
    }

    if (frame && frame.complete && frame.naturalWidth > 0) {
      frameW = Math.round(frameH * (frame.naturalWidth / frame.naturalHeight)) || 22;
      ctx.save();
      ctx.translate(x, Math.round(y + animBob));
      if (flipX) ctx.scale(-1, 1);
      ctx.drawImage(frame, -frameW / 2, -frameH, frameW, frameH);
      ctx.restore();
    } else {
      ctx.fillStyle = '#15803d';
      ctx.fillRect(x - 5, y - 24, 10, 24);
    }
  } else if (isFafa && fafaFramesRef?.current) {
    // 3f. Kak Fafa: Research Assistant & Guide Sprite Sheet Animation
    const ff = fafaFramesRef.current;
    let frame = null;
    let flipX = false;
    let frameW = 22;
    let frameH = 41;
    let animBob = 0;

    if (npc.isNearPlayer) {
      // Near player: stop, face player warmly and wave cheerfully
      const dir = npc.currentDirection || 'left';
      if (dir === 'up') {
        frame = ff.up?.[0] || ff.idle;
      } else if (dir === 'right') {
        frame = ff.right?.[0] || ff.idle;
      } else if (dir === 'left') {
        frame = ff.right?.[0] || ff.idle;
        flipX = true;
      } else {
        // Facing down: cheerful wave or friendly smile
        const isWaving = (Math.floor(animTimer) % 180 >= 0 && Math.floor(animTimer) % 180 <= 16);
        frame = isWaving && ff.wave ? ff.wave : (ff.idle || ff.down?.[0]);
      }
      const breath = Math.sin(animTimer * 0.06);
      animBob = breath > 0.4 ? -0.8 : 0;
    } else if (npc.isWalking) {
      // Walking: cycle directional walk frames
      const dir = npc.currentDirection || 'left';
      const frameIdx = Math.floor(npc.stepTimer * 0.16) % 4;
      if (dir === 'down') {
        frame = ff.down?.[frameIdx];
      } else if (dir === 'up') {
        frame = ff.up?.[frameIdx];
      } else if (dir === 'left') {
        frame = ff.right?.[frameIdx];
        flipX = true;
      } else {
        frame = ff.right?.[frameIdx];
      }
      animBob = (frameIdx % 2 === 1 ? -1 : 0);
    } else {
      // Autonomous idle actions near Stage 6 Cabin:
      // 1. Pointing towards the cozy cabin door ('point')
      // 2. Checking dihybrid research checklist ('clipboard')
      // 3. Waving greeting to players ('wave')
      // 4. Relaxed 3/4 pose with gentle breathing ('idle')
      const act = npc.action || 'idle';
      if (act === 'point' && ff.point) {
        frame = ff.point;
        // Directional guide sparkle
        if (Math.sin(animTimer * 0.22) > 0.35) {
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(x + (flipX ? -14 : 14), y - 30, 2, 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + (flipX ? -13 : 15), y - 29, 1, 1);
        }
      } else if (act === 'clipboard' && ff.clipboard) {
        frame = ff.clipboard;
        // Pen writing sparkle
        if (Math.sin(animTimer * 0.25) > 0.38) {
          ctx.fillStyle = '#4ade80'; // Green checkmark glint
          ctx.fillRect(x + 11, y - 28, 2, 2);
        }
      } else if (act === 'wave' && ff.wave) {
        frame = ff.wave;
      } else {
        // Peaceful idle standing with gentle breathing
        const isChecking = (Math.floor(animTimer) % 240 >= 0 && Math.floor(animTimer) % 240 <= 16);
        frame = isChecking && ff.clipboard ? ff.clipboard : (ff.idle || ff.down?.[0]);
        const breath = Math.sin(animTimer * 0.05);
        animBob = breath > 0.45 ? -0.8 : 0;
      }
    }

    if (frame && frame.complete && frame.naturalWidth > 0) {
      frameW = Math.round(frameH * (frame.naturalWidth / frame.naturalHeight)) || 22;
      ctx.save();
      ctx.translate(x, Math.round(y + animBob));
      if (flipX) ctx.scale(-1, 1);
      ctx.drawImage(frame, -frameW / 2, -frameH, frameW, frameH);
      ctx.restore();
    } else {
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(x - 5, y - 24, 10, 24);
    }
  } else if (isDrone && droneFramesRef?.current) {
    // 3g. Snooper Drone: Autonomous Mutation Scanner Sprite Sheet Animation (Compact Scout Size)
    const df = droneFramesRef.current;
    let frame = null;
    let flipX = false;
    const scale = 22 / 96; // Scaled down to compact scout size (~22px height)

    if (npc.isNearPlayer) {
      // Near player: lock target onto player, sound alert or inspect closely!
      const dir = npc.currentDirection || 'down';
      const isAlerting = (Math.floor(animTimer) % 180 >= 0 && Math.floor(animTimer) % 180 <= 20);
      if (isAlerting && df.alert) {
        frame = df.alert;
      } else if (df.notice) {
        frame = df.notice;
      } else {
        frame = df.idle || df.down?.[0];
      }
      if (dir === 'left') flipX = true;
    } else if (npc.isWalking) {
      // High-speed cruising across the mutation area
      const dir = npc.currentDirection || 'down';
      const frameIdx = Math.floor(npc.stepTimer * 0.18) % 4;
      const isDash = (Math.floor(npc.stepTimer * 0.1) % 6 === 0);

      if (isDash && df.dash) {
        frame = df.dash;
        if (dir === 'left') flipX = true;
      } else if (dir === 'down') {
        frame = df.down?.[frameIdx] || df.idle;
      } else if (dir === 'up') {
        frame = df.up?.[frameIdx] || df.down?.[frameIdx];
      } else if (dir === 'left') {
        frame = df.right?.[frameIdx] || df.idle;
        flipX = true;
      } else {
        frame = df.right?.[frameIdx] || df.idle;
      }
    } else {
      // Autonomous idle routines near Petak Peringatan Mutasi:
      // 1. 'scan': Project clean neon-red conical mutation scanner beam downwards (NO checkerboard effect!)
      // 2. 'alert': High-priority red ALERT broadcast
      // 3. 'notice': Anomaly detection exclamation bubble
      // 4. 'dash': Micro-thruster speed burst test
      // 5. 'idle': Gentle optical sensor pulse & hover
      const act = npc.action || 'idle';
      if (act === 'scan') {
        frame = df.scan || df.down?.[0];

        // Clean High-Tech Neon Red Scanning Laser Beam (Completely free of checkerboard artifacts!)
        ctx.save();
        const laserTopY = Math.round(y + hoverY - 2);
        const laserBottomY = Math.round(y - 1); // Touches ground shadow level
        const laserH = Math.max(8, laserBottomY - laserTopY);
        const laserSpread = 16;

        // Smooth luminous gradient
        const beamGrad = ctx.createLinearGradient(x, laserTopY, x, laserBottomY);
        beamGrad.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
        beamGrad.addColorStop(0.25, 'rgba(239, 68, 68, 0.45)');
        beamGrad.addColorStop(0.75, 'rgba(248, 113, 113, 0.2)');
        beamGrad.addColorStop(1, 'rgba(239, 68, 68, 0.05)');

        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(x, laserTopY);
        ctx.lineTo(x - laserSpread, laserBottomY);
        ctx.lineTo(x + laserSpread, laserBottomY);
        ctx.closePath();
        ctx.fill();

        // Animated laser sweep pulse line
        const scanProgress = (animTimer * 0.14) % 1;
        const waveY = laserTopY + scanProgress * laserH;
        const waveHalfW = (waveY - laserTopY) * (laserSpread / laserH);
        ctx.strokeStyle = 'rgba(254, 202, 202, 0.85)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - waveHalfW, waveY);
        ctx.lineTo(x + waveHalfW, waveY);
        ctx.stroke();

        // Red laser ground footprint ellipse
        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.beginPath();
        ctx.ellipse(x, laserBottomY, laserSpread, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(254, 202, 202, 0.6)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();
      } else if (act === 'alert' && df.alert) {
        frame = df.alert;
      } else if (act === 'notice' && df.notice) {
        frame = df.notice;
      } else if (act === 'dash' && df.dash) {
        frame = df.dash;
      } else {
        // Idle hover with pulsing optical eye
        const frameIdx = Math.floor(animTimer * 0.08) % 4;
        frame = df.down?.[frameIdx] || df.idle;
      }
    }

    if (frame && frame.complete && frame.naturalWidth > 0) {
      const frameW = Math.round(frame.naturalWidth * scale);
      const frameH = Math.round(frame.naturalHeight * scale);

      ctx.save();
      ctx.translate(x, Math.round(y + hoverY));
      if (flipX) ctx.scale(-1, 1);
      ctx.drawImage(frame, -frameW / 2, -frameH, frameW, frameH);
      ctx.restore();
    } else {
      ctx.fillStyle = '#64748b';
      ctx.fillRect(x - 6, y - 16, 12, 12);
    }
  } else if (isChaos && chaosFramesRef?.current) {
    // 3h. Dr. Chaos: Final Boss & Genetic Rival Sprite Sheet Animation
    const cf = chaosFramesRef.current;
    let frame = null;
    let flipX = false;
    let frameW = 24;
    let frameH = 43;
    let animBob = 0;

    if (npc.isNearPlayer) {
      // Near player: stand arrogant, point menacingly at player or taunt with mutagen potion
      const dir = npc.currentDirection || 'down';
      const isTaunting = (Math.floor(animTimer) % 180 >= 0 && Math.floor(animTimer) % 180 <= 24);
      if (isTaunting && cf.point) {
        frame = cf.point;
        if (dir === 'left') flipX = true;
      } else {
        frame = cf.idle || cf.down?.[0];
      }
      const breath = Math.sin(animTimer * 0.055);
      animBob = breath > 0.45 ? -0.8 : 0;
    } else if (npc.isWalking) {
      // Walking patrol near Stage 8 Boss Gate
      const dir = npc.currentDirection || 'down';
      if (dir === 'down') {
        const frameIdx = Math.floor(npc.stepTimer * 0.16) % 4;
        const downMap = [cf.down?.[0], cf.down?.[1], cf.down?.[0], cf.down?.[2]];
        frame = downMap[frameIdx] || cf.down?.[0];
        animBob = (frameIdx % 2 === 1 ? -1 : 0);
      } else if (dir === 'up') {
        const frameIdx = Math.floor(npc.stepTimer * 0.16) % 4;
        const upMap = [cf.up?.[0], cf.up?.[1], cf.up?.[0], cf.up?.[2]];
        frame = upMap[frameIdx] || cf.up?.[0];
        animBob = (frameIdx % 2 === 1 ? -1 : 0);
      } else if (dir === 'left') {
        const frameIdx = Math.floor(npc.stepTimer * 0.14) % 6;
        frame = cf.right?.[frameIdx] || cf.right?.[0];
        flipX = true;
        animBob = (frameIdx % 2 === 1 ? -1 : 0);
      } else {
        const frameIdx = Math.floor(npc.stepTimer * 0.14) % 6;
        frame = cf.right?.[frameIdx] || cf.right?.[0];
        animBob = (frameIdx % 2 === 1 ? -1 : 0);
      }
    } else {
      // Autonomous idle routines guarding the Gate:
      // 1. 'potion': Inspecting glowing mutagen potion beaker with green smoke
      // 2. 'point': Menacing outstretched pointing challenge
      // 3. 'idle': Arms crossed villain smirk with deep breathing
      const act = npc.action || 'idle';
      if (act === 'potion' && cf.potion) {
        frame = cf.potion;
        // Green mutagen bubbles / vapor sparkles
        if (Math.sin(animTimer * 0.22) > 0.3) {
          ctx.fillStyle = '#4ade80';
          ctx.fillRect(x + 13, y - 38, 2, 2);
          ctx.fillStyle = '#86efac';
          ctx.fillRect(x + 14, y - 41, 1, 1);
        }
      } else if (act === 'point' && cf.point) {
        frame = cf.point;
        // Dramatic purple cloak flare bob
        animBob = Math.sin(animTimer * 0.2) > 0.3 ? -0.8 : 0;
      } else {
        // Arrogant crossed-arms stance with evil breathing
        const isPotionLook = (Math.floor(animTimer) % 240 >= 0 && Math.floor(animTimer) % 240 <= 20);
        frame = isPotionLook && cf.potion ? cf.potion : (cf.idle || cf.down?.[0]);
        const breath = Math.sin(animTimer * 0.05);
        animBob = breath > 0.45 ? -0.8 : 0;
      }
    }

    if (frame && frame.complete && frame.naturalWidth > 0) {
      frameW = Math.round(frameH * (frame.naturalWidth / frame.naturalHeight)) || 24;
      ctx.save();
      ctx.translate(x, Math.round(y + animBob));
      if (flipX) ctx.scale(-1, 1);
      ctx.drawImage(frame, -frameW / 2, -frameH, frameW, frameH);
      ctx.restore();
    } else {
      ctx.fillStyle = '#581c87';
      ctx.fillRect(x - 6, y - 26, 12, 26);
    }
  } else {
    // 4. Generic NPC Drawing (Dr. Hesper, etc.)
    let bob = 0;
    let tilt = 0;
    if (npc.isWalking && !isDrone) {
      bob = Math.abs(Math.sin(npc.stepTimer * 0.22)) * 1.8;
      tilt = Math.sin(npc.stepTimer * 0.22) * 0.05;
    } else if (!isDrone) {
      bob = (Math.sin(animTimer * 0.05 + npc.stageId) > 0.4 ? 0.7 : 0);
    }

    const img = npcImagesRef.current[npc.id];
    const w = npc.width || 22;
    const h = npc.height || 38;

    if (img && img.complete && img.naturalWidth > 0) {
      ctx.save();
      ctx.translate(x, Math.round(y + hoverY - bob));
      if (npc.currentDirection === 'left') {
        ctx.scale(-1, 1);
      }
      if (tilt !== 0) {
        ctx.rotate(tilt);
      }
      ctx.drawImage(img, -w / 2, -h, w, h);
      ctx.restore();
    } else {
      // Fallback chibi silhouette
      ctx.fillStyle = '#475569';
      ctx.fillRect(x - 6, y - 22, 12, 22);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(x - 4, y - 18, 8, 8);
    }
  }

  // 4b. Floating Quest Marker above NPC head (When player is exploring / not in near talk range)
  // Clean RPG Quest Design: ONLY show '?' for ready turn-in, '!' for active quest target, '✓' for completed
  const showTurnIn = npc.questStatus === 'turn_in';
  const showExclamation = (npc.questStatus === 'need_item' || npc.questStatus === 'searching');
  const showCompleted = npc.questStatus === 'completed';

  if (!npc.isNearPlayer && (showTurnIn || showExclamation || showCompleted)) {
    const qBob = Math.sin(animTimer * 0.15 + (npc.stageId || 1) * 1.5) * 2.5;
    const qY = y + hoverY - (isDrone ? 28 : ((isThomas || isRosalind || isGigi || isMendel || isBarnaby || isFafa || isChaos) ? 46 : (npc.height || 38))) - 12 + qBob;
    const qX = x;

    ctx.save();
    if (showTurnIn) {
      // Golden pulsating circle with '?' (Player has item, ready to turn in!)
      const pulse = (Math.sin(animTimer * 0.2) + 1) * 0.5;
      ctx.fillStyle = `rgba(250, 204, 21, ${0.4 + pulse * 0.4})`;
      ctx.beginPath();
      ctx.arc(qX, qY, 9 + pulse * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(qX, qY, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(qX, qY, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1c0a02';
      ctx.font = '900 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', qX, qY + 0.5);
    } else if (showExclamation) {
      // Amber/Golden pulsating circle with '!' (Active Quest Target Giver)
      const pulse = (Math.sin(animTimer * 0.18) + 1) * 0.5;
      ctx.fillStyle = `rgba(250, 204, 21, ${0.4 + pulse * 0.45})`;
      ctx.beginPath();
      ctx.arc(qX, qY, 9 + pulse * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(qX, qY, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fb923c';
      ctx.beginPath();
      ctx.arc(qX, qY, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1c0a02';
      ctx.font = '900 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', qX, qY);
    } else if (showCompleted) {
      // Subtle green circle with '✓'
      ctx.fillStyle = '#14532d';
      ctx.beginPath();
      ctx.arc(qX, qY, 6.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(qX, qY, 5.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 7px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✓', qX, qY);
    }
    ctx.restore();
  }

  // 5. Overhead interactive Speech Balloon when player is near
  if (npc.isNearPlayer) {
    const floatBob = Math.sin(animTimer * 0.14) * 2;
    const badgeY = y + hoverY - (isDrone ? 26 : ((isThomas || isRosalind || isGigi || isMendel || isBarnaby || isFafa || isChaos) ? 44 : (npc.height || 38))) - 16 + floatBob;
    
    let label = `Bicara • ${npc.name}`;
    let badgeBorder = '#14532d';
    let keycapBg = '#22c55e';
    let keycapText = '#052e16';

    if (npc.questStatus === 'turn_in') {
      label = `Serahkan Item • ${npc.name}`;
      badgeBorder = '#b45309';
      keycapBg = '#facc15';
      keycapText = '#1c0a02';
    } else if (npc.questStatus === 'need_item') {
      label = `Misi • ${npc.name}`;
      badgeBorder = '#c2410c';
      keycapBg = '#fb923c';
      keycapText = '#431407';
    } else if (npc.questStatus === 'completed') {
      label = `Bicara • ${npc.name} ✓`;
    }

    ctx.font = 'bold 8px "Pixelify Sans", "Jersey 10", sans-serif';
    const textW = ctx.measureText(label).width;
    const padX = 6;
    const badgeW = textW + 19 + padX * 2;
    const badgeH = 14;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.roundRect(x - badgeW / 2 + 1, badgeY + 1, badgeW, badgeH, 6);
    ctx.fill();

    // Wood / Parchment container
    ctx.fillStyle = badgeBorder;
    ctx.beginPath();
    ctx.roundRect(x - badgeW / 2, badgeY, badgeW, badgeH, 6);
    ctx.fill();

    ctx.fillStyle = '#f0fdf4';
    ctx.beginPath();
    ctx.roundRect(x - badgeW / 2 + 1, badgeY + 1, badgeW - 2, badgeH - 2, 5);
    ctx.fill();

    // Keycap [E]
    ctx.fillStyle = keycapBg;
    ctx.beginPath();
    ctx.roundRect(x - badgeW / 2 + 2.5, badgeY + 2, 11, 10, 2);
    ctx.fill();

    ctx.fillStyle = keycapText;
    ctx.font = 'bold 7.5px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('E', x - badgeW / 2 + 8, badgeY + 7);

    // Name text
    ctx.fillStyle = badgeBorder;
    ctx.font = 'bold 8px "Pixelify Sans", "Jersey 10", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(label, x - badgeW / 2 + 16, badgeY + 7.5);

    // Pointer notch
    ctx.fillStyle = badgeBorder;
    ctx.beginPath();
    ctx.moveTo(x - 3, badgeY + badgeH);
    ctx.lineTo(x + 3, badgeY + badgeH);
    ctx.lineTo(x, badgeY + badgeH + 3.5);
    ctx.closePath();
    ctx.fill();
  }
};

// --- Draw Quest Items On Ground (With Bobbing, Sparkles & [E] Pickup Prompt) ---
const drawQuestGroundItem = (ctx, item, p, animTimer, isNearby) => {
  const bob = Math.sin(animTimer * 0.12 + item.x) * 3.5;
  const ix = item.x;
  const iy = item.y + bob;

  ctx.save();
  // 1. Radiant pulsing ground aura
  const pulse = (Math.sin(animTimer * 0.14 + item.y) + 1) * 0.5;
  const auraGrad = ctx.createRadialGradient(ix, item.y + 4, 3, ix, item.y + 4, 18);
  auraGrad.addColorStop(0, `rgba(250, 204, 21, ${0.45 + pulse * 0.35})`);
  auraGrad.addColorStop(0.6, `rgba(245, 158, 11, ${0.2 + pulse * 0.15})`);
  auraGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(ix, item.y + 4, 16, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Ground drop shadow beneath item (scales inversely with bob)
  const shadowW = Math.max(5, 9 - bob * 0.6);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(ix, item.y + 2, shadowW, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 3. Floating Item Sparkles
  for (let s = 0; s < 3; s++) {
    const sAngle = animTimer * 0.08 + s * (Math.PI * 2 / 3);
    const sx = ix + Math.cos(sAngle) * 11;
    const sy = iy - 6 + Math.sin(sAngle) * 5;
    ctx.fillStyle = s % 2 === 0 ? '#fef08a' : '#4ade80';
    ctx.fillRect(sx, sy, 1.5, 1.5);
  }

  // 4. Item Medallion / Pedestal Token
  const tokenR = 9;
  // Outer gold rim
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.arc(ix, iy - 6, tokenR + 1.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(ix, iy - 6, tokenR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#14532d';
  ctx.beginPath();
  ctx.arc(ix, iy - 6, tokenR - 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Item PNG icon centered in medallion (NO emoji!)
  const itemImg = questItemImagesCache[item.id];
  if (itemImg && itemImg.complete && itemImg.naturalWidth > 0) {
    ctx.drawImage(itemImg, ix - 7, iy - 13, 14, 14);
  } else {
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(ix, iy - 6, tokenR - 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Floating Interactive Action Pill when player is nearby
  if (isNearby) {
    const promptBob = Math.sin(animTimer * 0.15) * 2;
    const badgeY = iy - 26 + promptBob;
    const label = `Ambil • ${item.name}`;
    ctx.font = 'bold 8px "Pixelify Sans", "Jersey 10", sans-serif';
    const textW = ctx.measureText(label).width; // ← FIX: hitung lebar teks dulu
    const badgeH = 15;                           // ← FIX: deklarasikan tinggi badge
    // Keycap [SPASI / E]
    const keyCapW = 38;
    const badgeW = textW + keyCapW + 16;

    // Drop Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.roundRect(ix - badgeW / 2 + 1.5, badgeY + 1.5, badgeW, badgeH, 6);
    ctx.fill();

    // Golden border & background
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.roundRect(ix - badgeW / 2, badgeY, badgeW, badgeH, 6);
    ctx.fill();

    const pillGrad = ctx.createLinearGradient(0, badgeY, 0, badgeY + badgeH);
    pillGrad.addColorStop(0, '#f59e0b');
    pillGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = pillGrad;
    ctx.beginPath();
    ctx.roundRect(ix - badgeW / 2 + 1, badgeY + 1, badgeW - 2, badgeH - 2, 5);
    ctx.fill();

    // Keycap [SPASI/E]
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.roundRect(ix - badgeW / 2 + 2.5, badgeY + 2, keyCapW, 11, 2.5);
    ctx.fill();

    ctx.fillStyle = '#1c0a02';
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SPASI/E', ix - badgeW / 2 + 2.5 + keyCapW / 2, badgeY + 7.5);

    // Label
    ctx.fillStyle = '#1c0a02';
    ctx.font = 'bold 8px "Pixelify Sans", "Jersey 10", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(label, ix - badgeW / 2 + keyCapW + 6, badgeY + 8.5);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, ix - badgeW / 2 + keyCapW + 5.5, badgeY + 7.5);

    // Pointer notch
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.moveTo(ix - 3, badgeY + badgeH);
    ctx.lineTo(ix + 3, badgeY + badgeH);
    ctx.lineTo(ix, badgeY + badgeH + 3.5);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
};

// --- Animated Cabin Mice (Tikus yang beraktivitas & berjalan di lantai kabin) ---
const drawCabinMice = (ctx, mice, animTimer) => {
  if (!mice) return;
  mice.forEach((m) => {
    ctx.save();
    ctx.translate(Math.round(m.x), Math.round(m.y));

    // 1. Soft ground drop shadow beneath mouse
    ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
    ctx.beginPath();
    ctx.ellipse(0, 3, 13, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Facing direction (-1: left, 1: right)
    ctx.scale(m.dir, 1);

    const isWalking = m.state === 'walk';
    const isSniffing = m.state === 'sniff';
    const walkBob = isWalking ? Math.sin(m.walkCycle * 2) * 1.3 : (Math.sin(animTimer * 0.08) * 0.5);
    const legOffset = isWalking ? Math.sin(m.walkCycle) * 3 : 0;
    const sniffBob = isSniffing ? Math.sin(animTimer * 0.35) * 1.8 : 0;

    // 2. Curled Pink Rat Tail (realistic sinusoidal swishing)
    ctx.save();
    ctx.strokeStyle = '#27272a'; // dark tail outline
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    const tailWag = Math.sin(animTimer * 0.16 + (isWalking ? m.walkCycle : 0)) * 3.8;
    ctx.moveTo(-11, -1 + walkBob);
    ctx.bezierCurveTo(
      -17, -2 + tailWag * 0.5,
      -22, -10 + tailWag,
      -17 + tailWag * 0.8, -16 + tailWag
    );
    ctx.stroke();

    ctx.strokeStyle = '#f472b6'; // pink inner tail
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.restore();

    // 3. Scampering Paws
    ctx.fillStyle = '#fce7f3'; // pale paws
    // Back legs
    ctx.fillRect(-7 - legOffset * 0.6, 2, 3, 3);
    ctx.fillRect(-4 + legOffset * 0.6, 2, 3, 3);
    // Front paws
    ctx.fillRect(5 + legOffset, 2, 3, 3);
    ctx.fillRect(8 - legOffset, 2, 3, 3);

    // 4. Mouse Body
    ctx.save();
    ctx.translate(0, walkBob - sniffBob * 0.4);

    // Dark body outline
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(-1, -4, 12, 7.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Grey fur body
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.ellipse(-1, -4, 10.5, 6.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Highlight on back
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.ellipse(-2, -7, 7, 2.5, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Belly tone
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.ellipse(1, -2, 6, 3, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // 5. Snout & Cute Face
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(8, -4 - sniffBob * 0.3, 5.5, 4.5, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.ellipse(8, -4 - sniffBob * 0.3, 4.5, 3.5, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Pink nose
    ctx.fillStyle = '#fb7185';
    ctx.fillRect(12, -5 - sniffBob * 0.3, 2, 2);

    // Whiskers
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 0.8;
    const whiskerTwitch = isSniffing ? Math.sin(animTimer * 0.4) * 1.5 : 0;
    ctx.beginPath();
    ctx.moveTo(11, -4);
    ctx.lineTo(17, -7 + whiskerTwitch);
    ctx.moveTo(11, -3);
    ctx.lineTo(17, -2 - whiskerTwitch);
    ctx.stroke();

    // Dark twinkle eye
    ctx.fillStyle = '#09090b';
    ctx.fillRect(7, -7 - sniffBob * 0.3, 2, 2.2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7.5, -7 - sniffBob * 0.3, 0.8, 0.8);

    // 6. Cute Rounded Ears
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.ellipse(2, -10 + (isSniffing ? Math.sin(animTimer * 0.3) : 0), 3.2, 4.2, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.ellipse(2, -10 + (isSniffing ? Math.sin(animTimer * 0.3) : 0), 2.2, 3, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.restore();
  });
};

// --- Animated Cabin Butterflies (Kupu-kupu yang terbang mengepakkan sayap) ---
const drawCabinButterflies = (ctx, butterflies, animTimer) => {
  if (!butterflies) return;
  butterflies.forEach((b) => {
    ctx.save();

    // Altitude oscillation (fluttering vertically above the floor)
    const altitude = 16 + Math.sin(b.flutterTimer * 1.8) * 5 + Math.cos(b.flutterTimer * 0.7) * 3;
    const floorY = b.y + altitude;

    // 1. Soft Ground Drop Shadow directly underneath
    const shadowScale = Math.max(0.35, 1 - (altitude / 45));
    ctx.fillStyle = `rgba(0, 0, 0, ${0.22 * shadowScale})`;
    ctx.beginPath();
    ctx.ellipse(b.x, floorY, 8 * shadowScale, 3.5 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Butterfly Position
    ctx.translate(Math.round(b.x), Math.round(b.y));

    // Dynamic bank angle when turning
    const bankAngle = Math.sin(b.flutterTimer * 0.9) * 0.22;
    ctx.rotate(bankAngle);

    // Flapping perspective scaling (flaps inward & outward)
    const flapCos = Math.cos(b.wingPhase);
    const wingSpan = Math.abs(flapCos) * 0.85 + 0.15;

    // 3. Delicate Butterfly Wings
    [-1, 1].forEach((side) => {
      ctx.save();
      ctx.scale(side * wingSpan, 1);

      // Forewing (Upper Wing)
      ctx.fillStyle = b.edgeColor || '#1c1917';
      ctx.beginPath();
      ctx.moveTo(0, -2);
      ctx.bezierCurveTo(4, -14, 14, -16, 15, -6);
      ctx.bezierCurveTo(15, -1, 8, 2, 0, 1);
      ctx.closePath();
      ctx.fill();

      // Forewing Main Color
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.moveTo(1, -2);
      ctx.bezierCurveTo(4, -12, 12, -14, 13, -6);
      ctx.bezierCurveTo(13, -2, 7, 1, 1, 0);
      ctx.closePath();
      ctx.fill();

      // Forewing Inner Eyespot Accent
      ctx.fillStyle = b.secondaryColor || '#fef08a';
      ctx.beginPath();
      ctx.ellipse(8, -7, 2.5, 3.5, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(7, -8, 1.2, 1.2);

      // Hindwing (Lower Wing)
      ctx.fillStyle = b.edgeColor || '#1c1917';
      ctx.beginPath();
      ctx.moveTo(0, 1);
      ctx.bezierCurveTo(5, 2, 12, 5, 10, 11);
      ctx.bezierCurveTo(8, 14, 2, 10, 0, 4);
      ctx.closePath();
      ctx.fill();

      // Hindwing Main Color
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.moveTo(1, 2);
      ctx.bezierCurveTo(5, 3, 10, 5, 9, 10);
      ctx.bezierCurveTo(7, 12, 2, 9, 1, 4);
      ctx.closePath();
      ctx.fill();

      // Hindwing Pattern Accent
      ctx.fillStyle = b.secondaryColor || '#fef08a';
      ctx.fillRect(4, 6, 2, 2);

      ctx.restore();
    });

    // 4. Center Slender Body & Antennae
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(0, 0, 1.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Antennae
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(-3, -9);
    ctx.moveTo(0, -4);
    ctx.lineTo(3, -9);
    ctx.stroke();

    ctx.restore();
  });
};

// --- Autonomous AI Simulator for Cabin Critters ---
const updateCabinCritters = (crittersRef, playerPos) => {
  if (!crittersRef?.current) return;
  const { mice, butterflies } = crittersRef.current;

  // 1. Update Mice Scampering & Idle Behaviors
  if (mice) {
    mice.forEach((m) => {
      m.stateTimer--;

      // React to player: if player walks too close, scamper away!
      if (playerPos) {
        const distToPlayer = Math.hypot(m.x - playerPos.x, m.y - playerPos.y);
        if (distToPlayer < 48) {
          m.state = 'walk';
          m.speed = 3.0; // sprint away
          const awayX = m.x + (m.x - playerPos.x);
          const awayY = m.y + (m.y - playerPos.y);
          m.targetX = Math.max(m.minX, Math.min(m.maxX, awayX));
          m.targetY = Math.max(m.minY, Math.min(m.maxY, awayY));
          m.stateTimer = 40;
        }
      }

      if (m.state === 'walk') {
        const dx = m.targetX - m.x;
        const dy = m.targetY - m.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 4 || m.stateTimer <= 0) {
          m.state = Math.random() > 0.4 ? 'sniff' : 'idle';
          m.stateTimer = 50 + Math.floor(Math.random() * 70);
          m.speed = 1.7; // reset normal walk speed
        } else {
          m.dir = dx >= 0 ? 1 : -1;
          m.x += (dx / dist) * m.speed;
          m.y += (dy / dist) * (m.speed * 0.65);
          m.walkCycle += 0.22;
        }
      } else {
        // Idle or Sniff state
        if (m.stateTimer <= 0) {
          m.targetX = m.minX + Math.random() * (m.maxX - m.minX);
          m.targetY = m.minY + Math.random() * (m.maxY - m.minY);
          m.state = 'walk';
          m.speed = 1.6 + Math.random() * 0.4;
          m.stateTimer = 70 + Math.floor(Math.random() * 110);
        }
      }
    });
  }

  // 2. Update Butterflies Fluttering & Gliding
  if (butterflies) {
    butterflies.forEach((b) => {
      b.flutterTimer += 0.045;
      b.wingPhase += b.wingSpeed;

      const wanderX = Math.sin(b.flutterTimer * 0.8 + b.driftAngle) * 35 + Math.cos(b.flutterTimer * 0.35) * 18;
      const wanderY = Math.cos(b.flutterTimer * 0.6 + b.driftAngle) * 25 + Math.sin(b.flutterTimer * 1.1) * 10;

      b.baseX += Math.sin(b.flutterTimer * 0.15) * 0.4;
      b.baseY += Math.cos(b.flutterTimer * 0.12) * 0.3;

      if (b.baseX < b.rangeX[0]) b.baseX = b.rangeX[0] + 4;
      if (b.baseX > b.rangeX[1]) b.baseX = b.rangeX[1] - 4;
      if (b.baseY < b.rangeY[0]) b.baseY = b.rangeY[0] + 4;
      if (b.baseY > b.rangeY[1]) b.baseY = b.rangeY[1] - 4;

      b.x = b.baseX + wanderX;
      b.y = b.baseY + wanderY;
    });
  }
};

// --- Stage 6: Cozy Dihybrid Research Cabin Interior (1024 x 806 Authentic Pixel Art) ---
const drawCabinInterior = (ctx, screenWidth, screenHeight, p, animTimer, playerSpritesRef, cabinBgRef, cabinCrittersRef, inventory, turnedInStages, isStageUnlocked, nearbyQuestItem, startedQuests) => {
  const CABIN_W = 1024;
  const CABIN_H = 806;
  // Fit cabin in viewport with crisp aspect ratio
  const scale = Math.min(screenWidth / CABIN_W, screenHeight / CABIN_H);
  const camX = (screenWidth - CABIN_W * scale) / 2;
  const camY = (screenHeight - CABIN_H * scale) / 2;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(camX, camY);
  ctx.scale(scale, scale);

  // Black Void surrounding cabin
  ctx.fillStyle = '#060201';
  ctx.fillRect(-400, -400, CABIN_W + 800, CABIN_H + 800);

  // 1. Pixel Art Cabin Interior Image (1024 x 806)
  const cabinImg = cabinBgRef?.current;
  if (cabinImg && cabinImg.complete && cabinImg.naturalWidth > 0) {
    ctx.drawImage(cabinImg, 0, 0, CABIN_W, CABIN_H);
  } else {
    // Fallback warm floor and walls
    ctx.fillStyle = '#451a03';
    ctx.fillRect(0, 0, CABIN_W, 250);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 250, CABIN_W, CABIN_H - 250);
  }

  // 2. Animated Stone Fireplace Hearth (Northwest Corner at x: 188, y: 195)
  // Radiant warm hearth ambient glow
  const firePulse = 0.28 + Math.sin(animTimer * 0.18) * 0.08 + Math.cos(animTimer * 0.29) * 0.05;
  const fireGrad = ctx.createRadialGradient(188, 202, 6, 188, 202, 90);
  fireGrad.addColorStop(0, `rgba(251, 146, 60, ${firePulse})`);
  fireGrad.addColorStop(0.5, `rgba(234, 88, 12, ${firePulse * 0.45})`);
  fireGrad.addColorStop(1, 'rgba(124, 45, 18, 0)');
  ctx.fillStyle = fireGrad;
  ctx.beginPath();
  ctx.ellipse(188, 202, 90, 65, 0, 0, Math.PI * 2);
  ctx.fill();

  // Crackling pixel flame tongues inside firebox
  for (let f = 0; f < 6; f++) {
    const fx = 176 + f * 4;
    const fHeight = 8 + Math.sin(animTimer * 0.28 + f * 1.5) * 5;
    ctx.fillStyle = f % 2 === 0 ? '#ea580c' : '#dc2626';
    ctx.fillRect(fx, 206 - fHeight, 3.5, fHeight);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(fx + 0.5, 206 - fHeight * 0.6, 2, fHeight * 0.6);
  }

  // Floating hearth embers
  for (let e = 0; e < 4; e++) {
    const ex = 178 + (Math.sin(animTimer * 0.1 + e * 2.3) + 1) * 10;
    const ey = 198 - (Math.abs(Math.sin(animTimer * 0.15 + e * 1.7))) * 14;
    ctx.fillStyle = e % 2 === 0 ? '#fbbf24' : '#f97316';
    ctx.fillRect(ex, ey, 1.5, 1.5);
  }

  // 3. Subtle Window Light Shaft (x: 620 to 760)
  ctx.save();
  ctx.fillStyle = 'rgba(254, 240, 138, 0.04)';
  ctx.beginPath();
  ctx.moveTo(630, 160);
  ctx.lineTo(750, 160);
  ctx.lineTo(840, 520);
  ctx.lineTo(600, 520);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 4. Welcome Mat at South Exit Doorway (x: 512, y: 760)
  ctx.fillStyle = '#2e190d';
  ctx.beginPath();
  ctx.roundRect(476, 756, 72, 22, 4);
  ctx.fill();
  ctx.fillStyle = '#5c3317';
  ctx.beginPath();
  ctx.roundRect(478, 758, 68, 18, 3);
  ctx.fill();
  // Golden woven stitched text
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 8px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('KELUAR', 512, 767);

  // 4b. Animated Living Floor Mice (Scurrying & Sniffing along wooden planks)
  drawCabinMice(ctx, cabinCrittersRef?.current?.mice, animTimer);

  // 5. Player Drop Shadow & 16-bit Sprite in Cabin (Grand & Prominent Scale)
  const spriteW = 72;
  const spriteH = 146;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y - 2, 26, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  let playerSpriteDrawn = false;
  const sprites = playerSpritesRef?.current || playerSpritesRef || {};
  const dirFrames = sprites[p.direction] || [];
  let animBob = 0;

  if (p.isMoving) {
    if (dirFrames.length > 0) {
      const frameIdx = Math.floor(p.walkFrame) % dirFrames.length;
      const activeFrame = dirFrames[frameIdx];
      animBob = (p.walkFrame % 2 === 1 ? -2.5 : 0);
      if (activeFrame && activeFrame.complete && activeFrame.naturalWidth > 0) {
        ctx.drawImage(activeFrame, p.x - spriteW / 2, p.y - spriteH + animBob, spriteW, spriteH);
        playerSpriteDrawn = true;
      }
    }
  } else {
    // Idle breathing & blink
    const idleFrames = sprites.idle?.[p.direction] || [];
    const isBlinking = (p.idleTimer % 220 >= 0 && p.idleTimer % 220 <= 8);
    const activeFrame = isBlinking && idleFrames[1] ? idleFrames[1] : (idleFrames[0] || dirFrames[0]);
    const breath = Math.sin(p.idleTimer * 0.055);
    animBob = breath > 0.45 ? -2.8 : 0;
    if (activeFrame && activeFrame.complete && activeFrame.naturalWidth > 0) {
      ctx.drawImage(activeFrame, p.x - spriteW / 2, p.y - spriteH + animBob, spriteW, spriteH);
      playerSpriteDrawn = true;
    }
  }

  if (!playerSpriteDrawn) {
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(p.x - 14, p.y - 62, 28, 62);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(p.x - 11, p.y - 52, 22, 31);
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(p.x - 13, p.y - 96, 26, 34);
  }

  // 5b. Animated Living Butterflies (Fluttering gracefully in 3D cabin airspace)
  drawCabinButterflies(ctx, cabinCrittersRef?.current?.butterflies, animTimer);

  // 5c. Active Cabin Quest Items (Buku Catatan Dihibrid on research table)
  const curCabinInventory = inventory || [];
  const curCabinTurnedIn = turnedInStages || [];
  const curCabinStarted = startedQuests || [];
  const activeCabinItems = QUEST_ITEMS.filter(it => 
    it.scene === 'cabin_interior' &&
    curCabinStarted.includes(it.stageId) &&
    !curCabinInventory.includes(it.id) &&
    !curCabinTurnedIn.includes(it.stageId) &&
    (typeof isStageUnlocked === 'function' ? isStageUnlocked(it.stageId) : true)
  );

  activeCabinItems.forEach(item => {
    const isNearby = nearbyQuestItem?.id === item.id;
    drawQuestGroundItem(ctx, item, p, animTimer, isNearby);
  });

  // 6. Interactive Prompts in Cabin
  // Central Dihybrid Research Table (Center: x: 512, bottom: y: 400)
  const distToTable = Math.hypot(p.x - 512, p.y - 400);
  const isNearTable = distToTable <= 95;
  const isNearExit = p.y >= 700 && Math.abs(p.x - 512) <= 75;

  // Prompt at Table: [SPASI] BUKA RISET DIHIBRID
  if (isNearTable) {
    const bob = Math.sin(animTimer * 0.12) * 2.5;
    const promptX = 512;
    const promptY = 265 + bob;
    const badgeW = 146;
    const badgeH = 20;

    // Outer Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.roundRect(promptX - badgeW / 2 + 1.5, promptY + 1.5, badgeW, badgeH, 8);
    ctx.fill();

    // Dark Wood Border
    ctx.fillStyle = '#240e03';
    ctx.beginPath();
    ctx.roundRect(promptX - badgeW / 2, promptY, badgeW, badgeH, 8);
    ctx.fill();

    // Vibrant Blue Gradient
    const pillGrad = ctx.createLinearGradient(0, promptY, 0, promptY + badgeH);
    pillGrad.addColorStop(0, '#0284c7');
    pillGrad.addColorStop(1, '#0369a1');
    ctx.fillStyle = pillGrad;
    ctx.beginPath();
    ctx.roundRect(promptX - badgeW / 2 + 1.2, promptY + 1.2, badgeW - 2.4, badgeH - 2.4, 7);
    ctx.fill();

    // Golden [SPASI] Keycap
    const keyCapW = 34;
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.roundRect(promptX - badgeW / 2 + 3.5, promptY + 3.5, keyCapW, 13, 3);
    ctx.fill();

    ctx.fillStyle = '#1c0a02';
    ctx.font = 'bold 7.5px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SPASI', promptX - badgeW / 2 + 3.5 + keyCapW / 2, promptY + 10);

    // Prompt Text
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 9px "Pixelify Sans", "Jersey 10", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('BUKA RISET DIHIBRID', promptX - badgeW / 2 + keyCapW + 6, promptY + 11);
    ctx.fillStyle = '#f0f9ff';
    ctx.fillText('BUKA RISET DIHIBRID', promptX - badgeW / 2 + keyCapW + 5, promptY + 10);

    // Pointer notch
    ctx.fillStyle = '#240e03';
    ctx.beginPath();
    ctx.moveTo(promptX - 4, promptY + badgeH);
    ctx.lineTo(promptX + 4, promptY + badgeH);
    ctx.lineTo(promptX, promptY + badgeH + 4.5);
    ctx.closePath();
    ctx.fill();
  }

  // Prompt at Exit Door: [SPASI] KELUAR KE KEBUN
  if (isNearExit) {
    const bob = Math.sin(animTimer * 0.12) * 2;
    const promptX = 512;
    const promptY = 705 + bob;
    const badgeW = 142;
    const badgeH = 20;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.roundRect(promptX - badgeW / 2 + 1.5, promptY + 1.5, badgeW, badgeH, 8);
    ctx.fill();

    ctx.fillStyle = '#240e03';
    ctx.beginPath();
    ctx.roundRect(promptX - badgeW / 2, promptY, badgeW, badgeH, 8);
    ctx.fill();

    const pillGrad = ctx.createLinearGradient(0, promptY, 0, promptY + badgeH);
    pillGrad.addColorStop(0, '#b45309');
    pillGrad.addColorStop(1, '#78350f');
    ctx.fillStyle = pillGrad;
    ctx.beginPath();
    ctx.roundRect(promptX - badgeW / 2 + 1.2, promptY + 1.2, badgeW - 2.4, badgeH - 2.4, 7);
    ctx.fill();

    const keyCapW = 34;
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.roundRect(promptX - badgeW / 2 + 3.5, promptY + 3.5, keyCapW, 13, 3);
    ctx.fill();

    ctx.fillStyle = '#1c0a02';
    ctx.font = 'bold 7.5px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SPASI', promptX - badgeW / 2 + 3.5 + keyCapW / 2, promptY + 10);

    ctx.fillStyle = '#0f0501';
    ctx.font = 'bold 9px "Pixelify Sans", "Jersey 10", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('KELUAR KE KEBUN', promptX - badgeW / 2 + keyCapW + 6, promptY + 11);
    ctx.fillStyle = '#fffbeb';
    ctx.fillText('KELUAR KE KEBUN', promptX - badgeW / 2 + keyCapW + 5, promptY + 10);

    // Pointer notch pointing down to exit door
    ctx.fillStyle = '#240e03';
    ctx.beginPath();
    ctx.moveTo(promptX - 4, promptY + badgeH);
    ctx.lineTo(promptX + 4, promptY + badgeH);
    ctx.lineTo(promptX, promptY + badgeH + 4.5);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
};

// --- Stage 7: Mutation Trap Props (Hazard warning stake, glowing mutant bell jar) ---
const drawStage7_MutationProps = (ctx, animTimer) => {
  const mx = 654;
  const my = 382;

  // Ground shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.40)';
  ctx.beginPath();
  ctx.ellipse(mx + 14, my + 20, 15, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Stone pedestal
  ctx.fillStyle = '#334155';
  ctx.fillRect(mx + 4, my + 8, 14, 10);
  ctx.fillStyle = '#475569';
  ctx.fillRect(mx + 3, my + 6, 16, 3);

  // Glass Bell Jar with glowing mutant DNA helix inside
  const glow = (Math.sin(animTimer * 0.12) + 1) * 0.5;
  ctx.fillStyle = `rgba(244, 63, 94, ${0.25 + glow * 0.35})`;
  ctx.beginPath();
  ctx.arc(mx + 11, my + 1, 8, 0, Math.PI * 2);
  ctx.fill();

  // Glass bell jar dome
  ctx.fillStyle = 'rgba(224, 242, 254, 0.45)';
  ctx.beginPath();
  ctx.arc(mx + 11, my + 2, 6, Math.PI, 0);
  ctx.lineTo(mx + 17, my + 7);
  ctx.lineTo(mx + 5, my + 7);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Glowing mutant allele inside
  ctx.fillStyle = '#ec4899';
  ctx.fillRect(mx + 10, my + 1, 2, 4);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(mx + 9, my + 2, 4, 1.5);

  // Hazard warning diamond stake
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(mx + 22, my - 2, 2, 18);
  ctx.fillStyle = '#f59e0b'; // Amber warning diamond
  ctx.beginPath();
  ctx.moveTo(mx + 23, my - 9);
  ctx.lineTo(mx + 28, my - 4);
  ctx.lineTo(mx + 23, my + 1);
  ctx.lineTo(mx + 18, my - 4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#000000'; // Exclamation point
  ctx.fillRect(mx + 22.5, my - 7, 1, 3);
  ctx.fillRect(mx + 22.5, my - 3, 1, 1);
};

// --- Stage 8: Dr. Chaos Gothic Gate (User's Uploaded Image 3) ---
const drawStage8_DrChaosGate = (ctx, animTimer, propChaosGateRef) => {
  const gx = 432;
  const gy = 0;
  const gw = 160;
  const gh = 91;

  // Ground shadow across north gate threshold
  ctx.fillStyle = 'rgba(0, 0, 0, 0.60)';
  ctx.beginPath();
  ctx.ellipse(gx + gw / 2, gy + gh - 4, 60, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  const img = propChaosGateRef.current;
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, gx, gy, gw, gh);
  }

  // 1. Animated Flickering Torch Flames on Left & Right Gargoyles
  const drawTorchFlame = (tx, ty) => {
    const flicker = Math.sin(animTimer * 0.25 + tx) * 1.5;
    const flameH = 7 + flicker;

    // Ground & wall torch glow
    const torchGlow = ctx.createRadialGradient(tx, ty, 2, tx, ty, 18);
    torchGlow.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
    torchGlow.addColorStop(0.5, 'rgba(249, 115, 22, 0.20)');
    torchGlow.addColorStop(1, 'rgba(249, 115, 22, 0.0)');
    ctx.fillStyle = torchGlow;
    ctx.beginPath();
    ctx.arc(tx, ty, 18, 0, Math.PI * 2);
    ctx.fill();

    // Outer orange flame
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.ellipse(tx, ty - flameH / 2, 3, flameH / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright yellow flame core
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.ellipse(tx, ty - flameH / 2 + 1, 1.8, (flameH - 2) / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rising smoke/spark ember
    const emberY = (animTimer * 0.08 + tx) % 14;
    ctx.fillStyle = 'rgba(254, 240, 138, 0.75)';
    ctx.fillRect(tx - 0.5 + Math.sin(emberY) * 1.5, ty - flameH - emberY, 1, 1);
  };

  // Left gargoyle torch flame (approx x: 444, y: 44)
  drawTorchFlame(gx + 12, gy + 44);
  // Right gargoyle torch flame (approx x: 580, y: 44)
  drawTorchFlame(gx + gw - 12, gy + 44);

  // 2. Pulsing Red Ominous DNA Sigil Aura at Gate Center
  const sigilGlow = (Math.sin(animTimer * 0.08) + 1) * 0.5;
  const sigilGrad = ctx.createRadialGradient(gx + gw / 2, gy + 46, 6, gx + gw / 2, gy + 46, 26);
  sigilGrad.addColorStop(0, `rgba(239, 68, 68, ${0.40 + sigilGlow * 0.35})`);
  sigilGrad.addColorStop(0.6, `rgba(185, 28, 28, ${0.18 + sigilGlow * 0.15})`);
  sigilGrad.addColorStop(1, 'rgba(127, 29, 29, 0)');
  ctx.fillStyle = sigilGrad;
  ctx.beginPath();
  ctx.arc(gx + gw / 2, gy + 46, 26, 0, Math.PI * 2);
  ctx.fill();
};

// =============================================================================
// UNIFIED STATION SIGNBOARDS & INTERACTIVE PROMPTS (FOR ALL 8 STAGES)
// =============================================================================
const STATION_PLAQUE_LABELS = {
  1: 'ST-1: KEBUN ERCIS',
  2: 'ST-2: RISET GEN',
  3: 'ST-3: MESIN GAMET',
  4: 'ST-4: LAB PUNNETT',
  5: 'ST-5: KANDANG PANEN',
  6: 'ST-6: RISET DIHIBRID',
  7: 'ST-7: ANOMALI GEN',
  8: 'ST-8: GERBANG DR. CHAOS'
};

const STATION_ACTION_LABELS = {
  1: 'PERIKSA ERCIS',
  2: 'BUKA RISET GEN',
  3: 'MESIN GAMET',
  4: 'LAB PUNNETT',
  5: 'PANEN ERCIS',
  6: 'LAB DIHIBRID',
  7: 'DETEKSI ANOMALI',
  8: 'DUEL DR. CHAOS'
};

// --- Station Marker, Plaque & Floating Interactive Prompt ---
const drawStationMarker = (ctx, st, p, animTimer) => {
  const dist = Math.hypot(p.x - st.x, p.y - st.y);
  const isNearby = dist <= st.radius;

  // 1. Soft Amber Ring on floor
  const pulse = Math.sin(animTimer * 0.08);
  const groundAlpha = isNearby ? 0.35 + pulse * 0.12 : 0.16 + pulse * 0.05;
  const groundGrad = ctx.createRadialGradient(st.x, st.y, 8, st.x, st.y, st.radius * 0.75);
  groundGrad.addColorStop(0, `rgba(250, 204, 21, ${groundAlpha * 1.5})`);
  groundGrad.addColorStop(0.6, `rgba(217, 119, 6, ${groundAlpha * 0.8})`);
  groundGrad.addColorStop(1, 'rgba(180, 83, 9, 0)');
  ctx.fillStyle = groundGrad;
  ctx.beginPath();
  ctx.arc(st.x, st.y, st.radius * 0.75, 0, Math.PI * 2);
  ctx.fill();

  // Only show station header plaque and interactive pill when player is in proximity
  if (!isNearby) return;

  // 2. Station Header Plaque (Authentic Carved Wooden Signboard with Crisp Typography)
  let plaqueY = st.y - 48;
  if (st.id === 2) plaqueY = 88;
  else if (st.id === 3) plaqueY = 326;
  else if (st.id === 4) plaqueY = 288;
  else if (st.id === 8) plaqueY = 72;

  const plaqueX = st.x;
  const pw = 88;
  const ph = 16;

  // Outer Ground/Drop Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.roundRect(plaqueX - pw / 2 + 1.5, plaqueY + 1.5, pw, ph, 4);
  ctx.fill();

  // Dark Stardew Wood Outer Frame
  ctx.fillStyle = '#240e03';
  ctx.fillRect(plaqueX - pw / 2, plaqueY, pw, ph);

  // Inner Carved Timber Plaque
  const plaqueGrad = ctx.createLinearGradient(0, plaqueY, 0, plaqueY + ph);
  plaqueGrad.addColorStop(0, '#78350f');
  plaqueGrad.addColorStop(1, '#451a03');
  ctx.fillStyle = plaqueGrad;
  ctx.fillRect(plaqueX - pw / 2 + 1.5, plaqueY + 1.5, pw - 3, ph - 3);

  // Top Edge Bevel Highlight
  ctx.fillStyle = '#b45309';
  ctx.fillRect(plaqueX - pw / 2 + 1.5, plaqueY + 1.5, pw - 3, 1.2);

  // Four Brass Corner Studs
  ctx.fillStyle = '#fde68a';
  ctx.fillRect(plaqueX - pw / 2 + 2, plaqueY + 2.5, 1.5, 1.5);
  ctx.fillRect(plaqueX + pw / 2 - 3.5, plaqueY + 2.5, 1.5, 1.5);
  ctx.fillRect(plaqueX - pw / 2 + 2, plaqueY + ph - 4, 1.5, 1.5);
  ctx.fillRect(plaqueX + pw / 2 - 3.5, plaqueY + ph - 4, 1.5, 1.5);

  // Crisp High-Contrast Typography
  ctx.save();
  ctx.font = '700 8.5px "Pixelify Sans", "Jersey 10", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const stationLabel = STATION_PLAQUE_LABELS[st.id] || st.name.toUpperCase();
  
  // Deep Drop Shadow for 100% Readability
  ctx.fillStyle = '#0f0501';
  ctx.fillText(stationLabel, plaqueX + 0.8, plaqueY + ph / 2 + 1.2);
  
  // Bright Cream/Gold Pixel Text
  ctx.fillStyle = '#fffbeb';
  ctx.fillText(stationLabel, plaqueX, plaqueY + ph / 2 + 0.4);
  ctx.restore();

  // 3. Floating Interactive Action Pill (When in range)
  if (isNearby) {
    const bob = Math.sin(animTimer * 0.12) * 3;
    const promptY = plaqueY - 21 + bob;
    const badgeW = 122;
    const badgeH = 17;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.50)';
    ctx.beginPath();
    ctx.roundRect(st.x - badgeW / 2 + 1.5, promptY + 1.5, badgeW, badgeH, 8);
    ctx.fill();

    ctx.fillStyle = '#240e03';
    ctx.beginPath();
    ctx.roundRect(st.x - badgeW / 2, promptY, badgeW, badgeH, 8);
    ctx.fill();

    const pillGrad = ctx.createLinearGradient(0, promptY, 0, promptY + badgeH);
    pillGrad.addColorStop(0, '#b45309');
    pillGrad.addColorStop(1, '#542508');
    ctx.fillStyle = pillGrad;
    ctx.beginPath();
    ctx.roundRect(st.x - badgeW / 2 + 1.2, promptY + 1.2, badgeW - 2.4, badgeH - 2.4, 7);
    ctx.fill();

    // Golden [SPASI] Keycap
    const keyCapW = 28;
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.roundRect(st.x - badgeW / 2 + 3, promptY + 2.5, keyCapW, 12, 2.5);
    ctx.fill();

    ctx.fillStyle = '#1c0a02';
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SPASI', st.x - badgeW / 2 + 3 + keyCapW / 2, promptY + 8.5);

    // High-Contrast Action Prompt Text
    ctx.fillStyle = '#0f0501';
    ctx.font = '700 8.5px "Pixelify Sans", "Jersey 10", sans-serif';
    ctx.textAlign = 'left';
    const actionTxt = STATION_ACTION_LABELS[st.id] || 'MAIN STAGE';
    ctx.fillText(actionTxt, st.x - badgeW / 2 + keyCapW + 6, promptY + 9.5);
    ctx.fillStyle = '#fffbeb';
    ctx.fillText(actionTxt, st.x - badgeW / 2 + keyCapW + 5, promptY + 8.5);

    // Bottom pointer notch
    ctx.fillStyle = '#240e03';
    ctx.beginPath();
    ctx.moveTo(st.x - 3.5, promptY + badgeH);
    ctx.lineTo(st.x + 3.5, promptY + badgeH);
    ctx.lineTo(st.x, promptY + badgeH + 4);
    ctx.closePath();
    ctx.fill();
  }
};

// --- Research Conclusion Marker & In-World Prompt ---
const drawConclusionMarker = (ctx, c, p, animTimer) => {
  const dist = Math.hypot(p.x - c.x, p.y - c.y);
  const isNearby = dist <= c.radius;

  // 1. Soft glowing beacon on ground when player is in the vicinity (within 85px)
  if (dist <= 85) {
    const pulse = Math.sin(animTimer * 0.1);
    const alpha = isNearby ? 0.35 + pulse * 0.12 : 0.14 + pulse * 0.05;
    ctx.save();
    ctx.fillStyle = `rgba(245, 158, 11, ${alpha})`;
    ctx.beginPath();
    ctx.ellipse(c.x, c.y + 4, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 2. Animated floating scroll badge
  const bob = Math.sin(animTimer * 0.12 + c.x * 0.05) * 2.5;
  const badgeY = c.y - 30 + bob;
  const badgeW = isNearby ? 104 : 76;
  const badgeH = 15;

  ctx.save();
  // Drop Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.beginPath();
  ctx.roundRect(c.x - badgeW / 2 + 1.5, badgeY + 1.5, badgeW, badgeH, 6);
  ctx.fill();

  // Outer Border
  ctx.fillStyle = isNearby ? '#ca8a04' : '#3e2009';
  ctx.beginPath();
  ctx.roundRect(c.x - badgeW / 2, badgeY, badgeW, badgeH, 6);
  ctx.fill();

  // Inner Fill
  ctx.fillStyle = isNearby ? '#78350f' : '#271004';
  ctx.beginPath();
  ctx.roundRect(c.x - badgeW / 2 + 1, badgeY + 1, badgeW - 2, badgeH - 2, 5);
  ctx.fill();

  // Highlight bar
  ctx.fillStyle = isNearby ? '#facc15' : '#78350f';
  ctx.fillRect(c.x - badgeW / 2 + 2, badgeY + 1, badgeW - 4, 1);

  // Text
  ctx.font = '700 8px "Pixelify Sans", "Jersey 10", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fef08a';
  const label = isNearby ? `[E] ${c.shortTitle}` : `📜 ${c.shortTitle}`;
  ctx.fillText(label, c.x, badgeY + badgeH / 2 + 0.5);

  // Small pointer notch
  if (isNearby) {
    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.moveTo(c.x - 3, badgeY + badgeH);
    ctx.lineTo(c.x + 3, badgeY + badgeH);
    ctx.lineTo(c.x, badgeY + badgeH + 3.5);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
};

// Helper: Get high-resolution character sprite for Visual Novel Dialogue Scene
const getNpcVnSprite = (npc) => {
  if (!npc) return '/assets/rpg/npc/fafa/wave_0.png';
  if (npc.portraitSrc) return npc.portraitSrc;
  switch (npc.id) {
    case 'npc_1_monk':
      return '/assets/portraits/npc_thomas_portrait.webp';
    case 'npc_2_geneticist':
      return '/assets/portraits/npc_rosalind_portrait.webp';
    case 'npc_3_mechanic':
      return '/assets/portraits/npc_gigi_portrait.webp';
    case 'npc_4_mendel':
      return '/assets/portraits/npc_mendel_portrait.webp';
    case 'npc_5_farmer':
      return '/assets/portraits/npc_barnaby_portrait.webp';
    case 'npc_6_assistant':
      return '/assets/portraits/npc_fafa_portrait.webp';
    case 'npc_7_drone':
      return '/assets/portraits/npc_drone_portrait.webp';
    case 'npc_8_chaos':
      return '/assets/portraits/npc_chaos_portrait.webp';
    default:
      return npc.spriteSrc || '/assets/rpg/npc/fafa/wave_0.png';
  }
};

// --- VIRTUAL ANALOG JOYSTICK (Khusus Pengguna HP / Layar Sentuh) ---
const VirtualAnalogJoystick = ({ touchInputRef, isLandscape = false, isForcedLandscape = false }) => {
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const containerRef = useRef(null);
  const pointerIdRef = useRef(null);

  const updateKnob = useCallback((clientX, clientY) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = clientX - centerX;
    let dy = clientY - centerY;

    if (isForcedLandscape) {
      // In 90deg clockwise rotated container:
      // Physical +X on screen (drag right) is Visual UP (-Y)
      // Physical -X on screen (drag left) is Visual DOWN (+Y)
      // Physical +Y on screen (drag down) is Visual RIGHT (+X)
      // Physical -Y on screen (drag up) is Visual LEFT (-X)
      const tempDx = dy;
      const tempDy = -dx;
      dx = tempDx;
      dy = tempDy;
    }

    const dist = Math.hypot(dx, dy);
    const maxRadius = isLandscape ? 22 : 38;

    let clampedX = dx;
    let clampedY = dy;
    if (dist > maxRadius) {
      clampedX = (dx / dist) * maxRadius;
      clampedY = (dy / dist) * maxRadius;
    }

    setKnobPos({ x: clampedX, y: clampedY });

    // Deadzone check (4px in landscape, 8px in portrait)
    const deadzone = isLandscape ? 4 : 8;
    touchInputRef.current.left = clampedX < -deadzone;
    touchInputRef.current.right = clampedX > deadzone;
    touchInputRef.current.up = clampedY < -deadzone;
    touchInputRef.current.down = clampedY > deadzone;
  }, [touchInputRef, isLandscape, isForcedLandscape]);

  const handlePointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    pointerIdRef.current = e.pointerId;
    try { containerRef.current?.setPointerCapture?.(e.pointerId); } catch (err) {}
    setIsActive(true);
    updateKnob(e.clientX, e.clientY);
  };

  const handlePointerMove = (e) => {
    if (!isActive || e.pointerId !== pointerIdRef.current) return;
    updateKnob(e.clientX, e.clientY);
  };

  const handlePointerUp = (e) => {
    if (e.pointerId !== pointerIdRef.current) return;
    pointerIdRef.current = null;
    try { containerRef.current?.releasePointerCapture?.(e.pointerId); } catch (err) {}
    setIsActive(false);
    setKnobPos({ x: 0, y: 0 });
    touchInputRef.current.up = false;
    touchInputRef.current.down = false;
    touchInputRef.current.left = false;
    touchInputRef.current.right = false;
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative rpg-joystick-box ${
        isLandscape ? 'w-[70px] h-[70px] border-2' : 'w-28 h-28 sm:w-32 sm:h-32 border-4'
      } rounded-full border-[#3e1f0b] bg-[#1e293b]/85 backdrop-blur-sm shadow-[0_6px_16px_rgba(0,0,0,0.65)] flex items-center justify-center select-none touch-none cursor-pointer transition-transform ${
        isActive ? 'scale-105 border-amber-400' : 'opacity-90'
      }`}
      style={{ touchAction: 'none' }}
    >
      {/* Direction indicators */}
      <div className={`absolute top-0.5 text-amber-300 font-pixel ${isLandscape ? 'text-[7px]' : 'text-[10px]'} select-none pointer-events-none`}>▲</div>
      <div className={`absolute bottom-0.5 text-amber-300 font-pixel ${isLandscape ? 'text-[7px]' : 'text-[10px]'} select-none pointer-events-none`}>▼</div>
      <div className={`absolute left-0.5 text-amber-300 font-pixel ${isLandscape ? 'text-[7px]' : 'text-[10px]'} select-none pointer-events-none`}>◀</div>
      <div className={`absolute right-0.5 text-amber-300 font-pixel ${isLandscape ? 'text-[7px]' : 'text-[10px]'} select-none pointer-events-none`}>▶</div>
      
      {/* Inner guide ring */}
      <div className={`${isLandscape ? 'w-8 h-8' : 'w-16 h-16'} rounded-full border border-dashed border-amber-400/35 pointer-events-none`} />

      {/* Floating Center Thumb Knob */}
      <div
        className={`absolute rpg-joystick-knob ${
          isLandscape ? 'w-8 h-8' : 'w-13 h-13 sm:w-14 sm:h-14'
        } rounded-full border-2 border-amber-200 bg-gradient-to-b from-amber-400 via-amber-600 to-amber-800 shadow-[0_4px_8px_rgba(0,0,0,0.5)] flex items-center justify-center pointer-events-none transition-transform duration-75`}
        style={{
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`
        }}
      >
        <div className={`${isLandscape ? 'w-3.5 h-3.5' : 'w-6 h-6'} rounded-full border border-amber-200/60 bg-amber-300/30 flex items-center justify-center`}>
          <div className={`${isLandscape ? 'w-1 h-1' : 'w-2 h-2'} rounded-full bg-amber-100`} />
        </div>
      </div>
    </div>
  );
};

export const PixelRpgWorld = () => {
  const { 
    navigateTo, 
    userProgress, 
    totalStars, 
    currentStageId,
    setCurrentStageId, 
    isTransitioning,
    soundOn, 
    toggleSound, 
    showAlert,
    showConfirm,
    unlockAllStages,
    resetRpgData,
    lastCompletedStageId,
    setLastCompletedStageId,
    isLandscapeMobile
  } = useGame();

  // 1. Portrait vs Landscape Orientation Detection
  const [isPortrait, setIsPortrait] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerHeight > window.innerWidth;
  });

  // 2. Robust local landscape detector (height <= 620 and landscape)
  const [isLocalLandscape, setIsLocalLandscape] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (window.innerWidth > window.innerHeight && window.innerHeight <= 620) || Boolean(window.matchMedia?.('(orientation: landscape) and (max-height: 620px)')?.matches);
  });

  useEffect(() => {
    const handleCheck = () => {
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);
      const match = (window.innerWidth > window.innerHeight && window.innerHeight <= 620) || Boolean(window.matchMedia?.('(orientation: landscape) and (max-height: 620px)')?.matches);
      setIsLocalLandscape(match);
    };
    handleCheck();
    window.addEventListener('resize', handleCheck);
    window.addEventListener('orientationchange', handleCheck);
    const t1 = setTimeout(handleCheck, 100);
    const t2 = setTimeout(handleCheck, 300);
    return () => {
      window.removeEventListener('resize', handleCheck);
      window.removeEventListener('orientationchange', handleCheck);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Orientation state:
  // - isPortrait = true: upright phone/narrow viewport -> 16:9 landscape video frame in portrait layout
  // - !isPortrait: horizontal phone or desktop -> fullscreen canvas with compact or desktop UI
  const isForcedLandscape = false;
  const isCompactLandscape = Boolean(isLandscapeMobile || isLocalLandscape);

  const isTransitioningRef = useRef(false);
  isTransitioningRef.current = isTransitioning;

  const canvasRef = useRef(null);

  // Loaded Asset Image References
  const mapImageRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerSpritesRef = useRef({ down: [], up: [], left: [], right: [] });

  // Foreground Depth Overlay References (Y-Sorting)
  const overlayCenterStoneRef = useRef(null);
  const overlayFenceLeftRef = useRef(null);
  const overlayFenceRightRef = useRef(null);
  const overlayWallTopRef = useRef(null);

  // Authentic 16-bit Stardew Valley Station Sprites
  const stationSt2Ref = useRef(null);
  const stationSt4Ref = useRef(null);
  const propPunnettRef = useRef(null);
  const propGameteRef = useRef(null);
  const propChaosGateRef = useRef(null);
  const cabinBgRef = useRef(null);
  const cabinCrittersRef = useRef({
    mice: [
      // Mouse 1: Upper right (near desk leg & blackboard)
      {
        id: 'mouse_1',
        x: 900,
        y: 318,
        targetX: 860,
        targetY: 318,
        state: 'idle',
        stateTimer: 60,
        dir: -1,
        walkCycle: 0,
        speed: 1.6,
        minX: 790,
        maxX: 940,
        minY: 285,
        maxY: 365
      },
      // Mouse 2: Mid-left (beside lower-left bookshelf & red carpet)
      {
        id: 'mouse_2',
        x: 95,
        y: 445,
        targetX: 150,
        targetY: 445,
        state: 'idle',
        stateTimer: 90,
        dir: 1,
        walkCycle: 0,
        speed: 1.7,
        minX: 68,
        maxX: 240,
        minY: 380,
        maxY: 560
      },
      // Mouse 3: Bottom-right floor (below right bookshelf)
      {
        id: 'mouse_3',
        x: 925,
        y: 740,
        targetX: 850,
        targetY: 740,
        state: 'idle',
        stateTimer: 45,
        dir: -1,
        walkCycle: 0,
        speed: 1.65,
        minX: 780,
        maxX: 950,
        minY: 690,
        maxY: 765
      }
    ],
    butterflies: [
      // Butterfly 1: Monarch Amber Orange (upper left)
      {
        id: 'orange',
        x: 95,
        y: 345,
        baseX: 115,
        baseY: 345,
        color: '#ea580c',
        secondaryColor: '#fef08a',
        edgeColor: '#18181b',
        wingPhase: 0,
        wingSpeed: 0.28,
        flutterTimer: 0,
        driftAngle: 0.4,
        rangeX: [70, 240],
        rangeY: [280, 420]
      },
      // Butterfly 2: Mystic Violet Purple (center-left near carpet)
      {
        id: 'purple',
        x: 185,
        y: 535,
        baseX: 185,
        baseY: 535,
        color: '#9333ea',
        secondaryColor: '#e9d5ff',
        edgeColor: '#3b0764',
        wingPhase: 1.5,
        wingSpeed: 0.25,
        flutterTimer: 50,
        driftAngle: 2.1,
        rangeX: [110, 260],
        rangeY: [470, 640]
      },
      // Butterfly 3: Morpho Cyan / Azure Blue (bottom-left floor)
      {
        id: 'cyan',
        x: 125,
        y: 725,
        baseX: 125,
        baseY: 725,
        color: '#0284c7',
        secondaryColor: '#bae6fd',
        edgeColor: '#082f49',
        wingPhase: 3.2,
        wingSpeed: 0.27,
        flutterTimer: 120,
        driftAngle: 4.3,
        rangeX: [80, 280],
        rangeY: [660, 770]
      },
      // Butterfly 4: Silky Cream / White (bottom-right floor)
      {
        id: 'white',
        x: 905,
        y: 695,
        baseX: 905,
        baseY: 695,
        color: '#fef3c7',
        secondaryColor: '#ffffff',
        edgeColor: '#451a03',
        wingPhase: 4.8,
        wingSpeed: 0.24,
        flutterTimer: 80,
        driftAngle: 1.2,
        rangeX: [780, 940],
        rangeY: [630, 750]
      }
    ]
  });
  const thomasFramesRef = useRef({
    down: [],
    right: [],
    up: [],
    idle: [],
    dig: null,
    sweat: null
  });
  const rosalindFramesRef = useRef({
    down: [],
    right: [],
    up: [],
    idle: null,
    glasses: null,
    clipboard: null,
    test_tube: null
  });
  const gigiFramesRef = useRef({
    down: [],
    right: [],
    up: [],
    idle: null,
    wipe: null,
    wrench: null,
    goggles: null
  });
  const mendelFramesRef = useRef({
    down: [],
    right: [],
    up: [],
    idle: null,
    plant: null,
    book: null,
    book_alt: null
  });
  const barnabyFramesRef = useRef({
    down: [],
    right: [],
    up: [],
    idle: null,
    pod: null,
    sweat: null,
    cheer: null
  });
  const fafaFramesRef = useRef({
    down: [],
    right: [],
    up: [],
    idle: null,
    wave: null,
    clipboard: null,
    point: null
  });
  const droneFramesRef = useRef({
    down: [],
    right: [],
    up: [],
    idle: null,
    scan: null,
    dash: null,
    notice: null,
    alert: null
  });
  const chaosFramesRef = useRef({
    down: [],
    right: [],
    up: [],
    idle: null,
    potion: null,
    point: null
  });

  // Scene Navigation & Screen Black Fade Transition
  const currentSceneRef = useRef('outdoor'); // 'outdoor' | 'cabin_interior'
  const [currentScene, setCurrentScene] = useState('outdoor');
  const fadeAlphaRef = useRef(0);
  const fadeStateRef = useRef('idle'); // 'idle' | 'fade_out' | 'fade_in'
  const fadeTargetRef = useRef(null); // { scene, x, y, direction }

  // Scene Door Transition Trigger
  const triggerDoorTransition = useCallback((targetScene, targetX, targetY, targetDir) => {
    if (fadeStateRef.current !== 'idle') return;
    sound.playClick();
    fadeStateRef.current = 'fade_out';
    fadeTargetRef.current = { scene: targetScene, x: targetX, y: targetY, direction: targetDir };
  }, []);

  // Floating Golden Sun Motes (Stardew Valley Ambient Atmosphere)
  const sunMotesRef = useRef(
    Array.from({ length: 32 }, () => ({
      x: 100 + Math.random() * 824,
      y: 80 + Math.random() * 400,
      size: 1 + Math.random() * 1.6,
      speedX: 0.12 + Math.random() * 0.22,
      speedY: -0.08 - Math.random() * 0.14,
      baseAlpha: 0.25 + Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2
    }))
  );

  // 1. Ambient Particle System: Falling & Swirling Wind Leaves (Falling Leaves Particle Effect / Wind Leaf VFX)
  const fallingLeavesRef = useRef(
    Array.from({ length: 38 }, (_, i) => {
      const isForeground = i < 12; // ~30% in camera foreground overlay layer
      return {
        x: Math.random() * WORLD_WIDTH,
        y: Math.random() * WORLD_HEIGHT,
        speedX: 1.1 + Math.random() * 1.4,
        speedY: 0.55 + Math.random() * 0.85,
        sizeW: isForeground ? 7 + Math.random() * 4 : 3.5 + Math.random() * 2.5,
        sizeH: isForeground ? 4.5 + Math.random() * 3 : 2.2 + Math.random() * 1.8,
        angle: Math.random() * Math.PI * 2,
        angularSpeed: (Math.random() - 0.5) * 0.09,
        flipPhase: Math.random() * Math.PI * 2,
        flipSpeed: 0.05 + Math.random() * 0.07,
        color: [
          '#4ade80', '#22c55e', '#16a34a', // Fresh green leaves
          '#f59e0b', '#d97706', '#b45309', // Autumn amber & copper leaves
          '#f472b6', '#ec4899',            // Spring blossom petals
          '#84cc16'                        // Lime sprout leaf
        ][Math.floor(Math.random() * 9)],
        isForeground,
        alpha: isForeground ? 0.85 : 0.75
      };
    })
  );

  // 2. Ambient Critters / Wildlife System (Butterflies, Flying Birds, Hopping Frog, Wild Rabbit)
  const ambientWildlifeRef = useRef({
    // A. Fluttering Butterflies (Autonomous wandering over flower fields)
    butterflies: [
      { id: 1, originX: 180, originY: 150, x: 180, y: 150, radiusX: 42, radiusY: 28, color: '#f97316', wingColor: '#ea580c', phase: 0, wingSpeed: 0.28, altitude: 10 },
      { id: 2, originX: 830, originY: 140, x: 830, y: 140, radiusX: 46, radiusY: 30, color: '#facc15', wingColor: '#ca8a04', phase: 1.5, wingSpeed: 0.32, altitude: 11 },
      { id: 3, originX: 390, originY: 220, x: 390, y: 220, radiusX: 36, radiusY: 22, color: '#38bdf8', wingColor: '#0284c7', phase: 3.1, wingSpeed: 0.26, altitude: 9 },
      { id: 4, originX: 620, originY: 420, x: 620, y: 420, radiusX: 38, radiusY: 24, color: '#f472b6', wingColor: '#db2777', phase: 4.2, wingSpeed: 0.30, altitude: 12 }
    ],
    // B. Flying Birds / Sparrows (Flock flyover across the farm canopy with projected ground shadows)
    birds: [
      { x: 120, y: 150, speedX: 2.3, speedY: 0.45, altitude: 58, wingPhase: 0 },
      { x: 85, y: 180, speedX: 2.2, speedY: 0.42, altitude: 62, wingPhase: 0.8 },
      { x: 50, y: 165, speedX: 2.4, speedY: 0.48, altitude: 55, wingPhase: 1.6 }
    ],
    // C. Hopping Frog (Near center fountain / wet cobblestone)
    frog: {
      x: 442,
      groundY: 332,
      startX: 442,
      startY: 332,
      targetX: 442,
      targetY: 332,
      z: 0,
      state: 'idle',
      idleTimer: 120,
      hopProgress: 0,
      facing: 1
    },
    // D. Wild Rabbit (Near north-west meadow orchard trees)
    rabbit: {
      x: 175,
      groundY: 98,
      startX: 175,
      targetX: 175,
      z: 0,
      state: 'sniff',
      timer: 140,
      hopProgress: 0,
      facing: -1
    }
  });

  // Preload map, overlays, and sprite frames
  useEffect(() => {
    // 1. World Map (User's second image: 1024x559)
    const mapImg = new Image();
    mapImg.src = '/assets/rpg/monastery_garden_map.jpg?t=' + Date.now();
    mapImg.onload = () => {
      mapImageRef.current = mapImg;
      setMapLoaded(true);
    };
    if (mapImg.complete && mapImg.naturalWidth > 0) {
      mapImageRef.current = mapImg;
      setMapLoaded(true);
    }
    mapImageRef.current = mapImg;

    // 2. Depth Foreground Overlays
    const loadOverlay = (src, ref) => {
      const img = new Image();
      img.src = src;
      ref.current = img;
    };
    loadOverlay('/assets/rpg/overlay_center_stone.png', overlayCenterStoneRef);
    loadOverlay('/assets/rpg/overlay_fence_left.png', overlayFenceLeftRef);
    loadOverlay('/assets/rpg/overlay_fence_right.png', overlayFenceRightRef);
    loadOverlay('/assets/rpg/overlay_wall_top.png', overlayWallTopRef);

    // 2b. Authentic 16-bit Stardew Valley Station Sprites
    const loadStationSprite = (src, ref) => {
      const img = new Image();
      img.src = src;
      ref.current = img;
    };
    loadStationSprite('/assets/rpg/station_st2_deck.png', stationSt2Ref);
    loadStationSprite('/assets/rpg/station_st4_lab.png', stationSt4Ref);
    loadStationSprite('/assets/rpg/prop_punnett_board.png', propPunnettRef);
    loadStationSprite('/assets/rpg/prop_gamete_machine.png', propGameteRef);
    loadStationSprite('/assets/rpg/prop_dr_chaos_gate.png', propChaosGateRef);

    // 2b. Preload 8 Thematic NPC sprites
    NPCS.forEach(npc => {
      const img = new Image();
      img.src = `${npc.spriteSrc}?t=1789118800`;
      npcImagesRef.current[npc.id] = img;
      if (npc.portraitSrc) {
        const pImg = new Image();
        pImg.src = npc.portraitSrc;
      }
    });

    // Preload Player Portrait
    const playerPortraitImg = new Image();
    playerPortraitImg.src = PLAYER_PORTRAIT;

    // 2c. Preload Cabin Interior Background (1024 x 806)
    const cabinImg = new Image();
    cabinImg.src = '/assets/rpg/cabin_interior_bg.jpg?t=' + Date.now();
    cabinBgRef.current = cabinImg;

    // 2d. Preload Bruder Thomas Full Directional & Action Sprite Frames
    const loadNpcFrame = (src) => {
      const img = new Image();
      img.src = `${src}?t=1789123000`;
      return img;
    };
    thomasFramesRef.current = {
      down: [
        loadNpcFrame('/assets/rpg/npc/monk/down_0.png'),
        loadNpcFrame('/assets/rpg/npc/monk/down_1.png'),
        loadNpcFrame('/assets/rpg/npc/monk/down_2.png'),
        loadNpcFrame('/assets/rpg/npc/monk/down_3.png')
      ],
      right: [
        loadNpcFrame('/assets/rpg/npc/monk/right_0.png'),
        loadNpcFrame('/assets/rpg/npc/monk/right_1.png'),
        loadNpcFrame('/assets/rpg/npc/monk/right_2.png'),
        loadNpcFrame('/assets/rpg/npc/monk/right_3.png')
      ],
      up: [
        loadNpcFrame('/assets/rpg/npc/monk/up_0.png'),
        loadNpcFrame('/assets/rpg/npc/monk/up_1.png'),
        loadNpcFrame('/assets/rpg/npc/monk/up_2.png'),
        loadNpcFrame('/assets/rpg/npc/monk/up_3.png')
      ],
      idle: [
        loadNpcFrame('/assets/rpg/npc/monk/idle_0.png'),
        loadNpcFrame('/assets/rpg/npc/monk/idle_1.png')
      ],
      dig: loadNpcFrame('/assets/rpg/npc/monk/dig_0.png'),
      sweat: loadNpcFrame('/assets/rpg/npc/monk/sweat_0.png')
    };

    // 2e. Preload Prof. Rosalind Full Directional & Action Sprite Frames
    rosalindFramesRef.current = {
      down: [
        loadNpcFrame('/assets/rpg/npc/rosalind/down_0.png'),
        loadNpcFrame('/assets/rpg/npc/rosalind/down_1.png'),
        loadNpcFrame('/assets/rpg/npc/rosalind/down_2.png'),
        loadNpcFrame('/assets/rpg/npc/rosalind/down_3.png')
      ],
      right: [
        loadNpcFrame('/assets/rpg/npc/rosalind/right_0.png'),
        loadNpcFrame('/assets/rpg/npc/rosalind/right_1.png'),
        loadNpcFrame('/assets/rpg/npc/rosalind/right_2.png'),
        loadNpcFrame('/assets/rpg/npc/rosalind/right_3.png')
      ],
      up: [
        loadNpcFrame('/assets/rpg/npc/rosalind/up_0.png'),
        loadNpcFrame('/assets/rpg/npc/rosalind/up_1.png'),
        loadNpcFrame('/assets/rpg/npc/rosalind/up_2.png'),
        loadNpcFrame('/assets/rpg/npc/rosalind/up_3.png')
      ],
      idle: loadNpcFrame('/assets/rpg/npc/rosalind/idle_0.png'),
      glasses: loadNpcFrame('/assets/rpg/npc/rosalind/glasses_0.png'),
      clipboard: loadNpcFrame('/assets/rpg/npc/rosalind/clipboard_0.png'),
      test_tube: loadNpcFrame('/assets/rpg/npc/rosalind/test_tube_0.png')
    };

    // 2f. Preload Gigi si Mekanik Full Directional & Action Sprite Frames
    gigiFramesRef.current = {
      down: [
        loadNpcFrame('/assets/rpg/npc/mechanic/down_0.png'),
        loadNpcFrame('/assets/rpg/npc/mechanic/down_1.png'),
        loadNpcFrame('/assets/rpg/npc/mechanic/down_2.png'),
        loadNpcFrame('/assets/rpg/npc/mechanic/down_3.png')
      ],
      right: [
        loadNpcFrame('/assets/rpg/npc/mechanic/right_0.png'),
        loadNpcFrame('/assets/rpg/npc/mechanic/right_1.png'),
        loadNpcFrame('/assets/rpg/npc/mechanic/right_2.png'),
        loadNpcFrame('/assets/rpg/npc/mechanic/right_3.png')
      ],
      up: [
        loadNpcFrame('/assets/rpg/npc/mechanic/up_0.png'),
        loadNpcFrame('/assets/rpg/npc/mechanic/up_1.png'),
        loadNpcFrame('/assets/rpg/npc/mechanic/up_2.png'),
        loadNpcFrame('/assets/rpg/npc/mechanic/up_3.png')
      ],
      idle: loadNpcFrame('/assets/rpg/npc/mechanic/idle_0.png'),
      wipe: loadNpcFrame('/assets/rpg/npc/mechanic/wipe_0.png'),
      wrench: loadNpcFrame('/assets/rpg/npc/mechanic/wrench_0.png'),
      goggles: loadNpcFrame('/assets/rpg/npc/mechanic/goggles_0.png')
    };

    // 2g. Preload Pater Gregor Mendel Full Directional & Action Sprite Frames
    mendelFramesRef.current = {
      down: [
        loadNpcFrame('/assets/rpg/npc/mendel/down_0.png'),
        loadNpcFrame('/assets/rpg/npc/mendel/down_1.png'),
        loadNpcFrame('/assets/rpg/npc/mendel/down_2.png'),
        loadNpcFrame('/assets/rpg/npc/mendel/down_3.png')
      ],
      right: [
        loadNpcFrame('/assets/rpg/npc/mendel/right_0.png'),
        loadNpcFrame('/assets/rpg/npc/mendel/right_1.png'),
        loadNpcFrame('/assets/rpg/npc/mendel/right_2.png'),
        loadNpcFrame('/assets/rpg/npc/mendel/right_3.png')
      ],
      up: [
        loadNpcFrame('/assets/rpg/npc/mendel/up_0.png'),
        loadNpcFrame('/assets/rpg/npc/mendel/up_1.png'),
        loadNpcFrame('/assets/rpg/npc/mendel/up_2.png'),
        loadNpcFrame('/assets/rpg/npc/mendel/up_3.png')
      ],
      idle: loadNpcFrame('/assets/rpg/npc/mendel/idle_0.png'),
      plant: loadNpcFrame('/assets/rpg/npc/mendel/plant_0.png'),
      book: loadNpcFrame('/assets/rpg/npc/mendel/book_0.png'),
      book_alt: loadNpcFrame('/assets/rpg/npc/mendel/book_1.png')
    };

    // 2h. Preload Pak Barnaby Full Directional & Action Sprite Frames
    barnabyFramesRef.current = {
      down: [
        loadNpcFrame('/assets/rpg/npc/barnaby/down_0.png'),
        loadNpcFrame('/assets/rpg/npc/barnaby/down_1.png'),
        loadNpcFrame('/assets/rpg/npc/barnaby/down_2.png'),
        loadNpcFrame('/assets/rpg/npc/barnaby/down_3.png')
      ],
      right: [
        loadNpcFrame('/assets/rpg/npc/barnaby/right_0.png'),
        loadNpcFrame('/assets/rpg/npc/barnaby/right_1.png'),
        loadNpcFrame('/assets/rpg/npc/barnaby/right_2.png'),
        loadNpcFrame('/assets/rpg/npc/barnaby/right_3.png')
      ],
      up: [
        loadNpcFrame('/assets/rpg/npc/barnaby/up_0.png'),
        loadNpcFrame('/assets/rpg/npc/barnaby/up_1.png'),
        loadNpcFrame('/assets/rpg/npc/barnaby/up_2.png'),
        loadNpcFrame('/assets/rpg/npc/barnaby/up_3.png')
      ],
      idle: loadNpcFrame('/assets/rpg/npc/barnaby/idle_0.png'),
      pod: loadNpcFrame('/assets/rpg/npc/barnaby/pod_0.png'),
      sweat: loadNpcFrame('/assets/rpg/npc/barnaby/sweat_0.png'),
      cheer: loadNpcFrame('/assets/rpg/npc/barnaby/cheer_0.png')
    };

    // 2i. Preload Kak Fafa Full Directional & Action Sprite Frames
    fafaFramesRef.current = {
      down: [
        loadNpcFrame('/assets/rpg/npc/fafa/down_0.png'),
        loadNpcFrame('/assets/rpg/npc/fafa/down_1.png'),
        loadNpcFrame('/assets/rpg/npc/fafa/down_2.png'),
        loadNpcFrame('/assets/rpg/npc/fafa/down_3.png')
      ],
      right: [
        loadNpcFrame('/assets/rpg/npc/fafa/right_0.png'),
        loadNpcFrame('/assets/rpg/npc/fafa/right_1.png'),
        loadNpcFrame('/assets/rpg/npc/fafa/right_2.png'),
        loadNpcFrame('/assets/rpg/npc/fafa/right_3.png')
      ],
      up: [
        loadNpcFrame('/assets/rpg/npc/fafa/up_0.png'),
        loadNpcFrame('/assets/rpg/npc/fafa/up_1.png'),
        loadNpcFrame('/assets/rpg/npc/fafa/up_2.png'),
        loadNpcFrame('/assets/rpg/npc/fafa/up_3.png')
      ],
      idle: loadNpcFrame('/assets/rpg/npc/fafa/idle_0.png'),
      wave: loadNpcFrame('/assets/rpg/npc/fafa/wave_0.png'),
      clipboard: loadNpcFrame('/assets/rpg/npc/fafa/clipboard_0.png'),
      point: loadNpcFrame('/assets/rpg/npc/fafa/point_0.png')
    };

    // 2j. Preload Snooper Drone Full Directional & Action Sprite Frames
    droneFramesRef.current = {
      down: [
        loadNpcFrame('/assets/rpg/npc/drone/down_0.png'),
        loadNpcFrame('/assets/rpg/npc/drone/down_1.png'),
        loadNpcFrame('/assets/rpg/npc/drone/down_2.png'),
        loadNpcFrame('/assets/rpg/npc/drone/down_3.png')
      ],
      right: [
        loadNpcFrame('/assets/rpg/npc/drone/right_0.png'),
        loadNpcFrame('/assets/rpg/npc/drone/right_1.png'),
        loadNpcFrame('/assets/rpg/npc/drone/right_2.png'),
        loadNpcFrame('/assets/rpg/npc/drone/right_3.png')
      ],
      up: [
        loadNpcFrame('/assets/rpg/npc/drone/up_0.png'),
        loadNpcFrame('/assets/rpg/npc/drone/up_1.png'),
        loadNpcFrame('/assets/rpg/npc/drone/up_2.png'),
        loadNpcFrame('/assets/rpg/npc/drone/up_3.png')
      ],
      idle: loadNpcFrame('/assets/rpg/npc/drone/idle_0.png'),
      scan: loadNpcFrame('/assets/rpg/npc/drone/scan_0.png'),
      dash: loadNpcFrame('/assets/rpg/npc/drone/dash_0.png'),
      notice: loadNpcFrame('/assets/rpg/npc/drone/notice_0.png'),
      alert: loadNpcFrame('/assets/rpg/npc/drone/alert_0.png')
    };

    // 2k. Preload Dr. Chaos Full Directional & Villain Action Sprite Frames
    chaosFramesRef.current = {
      down: [
        loadNpcFrame('/assets/rpg/npc/chaos/down_0.png'),
        loadNpcFrame('/assets/rpg/npc/chaos/down_1.png'),
        loadNpcFrame('/assets/rpg/npc/chaos/down_2.png')
      ],
      right: [
        loadNpcFrame('/assets/rpg/npc/chaos/right_0.png'),
        loadNpcFrame('/assets/rpg/npc/chaos/right_1.png'),
        loadNpcFrame('/assets/rpg/npc/chaos/right_2.png'),
        loadNpcFrame('/assets/rpg/npc/chaos/right_3.png'),
        loadNpcFrame('/assets/rpg/npc/chaos/right_4.png'),
        loadNpcFrame('/assets/rpg/npc/chaos/right_5.png')
      ],
      up: [
        loadNpcFrame('/assets/rpg/npc/chaos/up_0.png'),
        loadNpcFrame('/assets/rpg/npc/chaos/up_1.png'),
        loadNpcFrame('/assets/rpg/npc/chaos/up_2.png')
      ],
      idle: loadNpcFrame('/assets/rpg/npc/chaos/idle_0.png'),
      potion: loadNpcFrame('/assets/rpg/npc/chaos/potion_0.png'),
      point: loadNpcFrame('/assets/rpg/npc/chaos/point_0.png')
    };

    // 3. Player Sprite Frames (Supports Male & Female Characters)
    const gender = (typeof window !== 'undefined' ? localStorage.getItem('genetic_odyssey_rpg_player_gender') : 'female') || 'female';
    const spriteFolder = gender === 'male' ? 'player_male' : 'player';

    const loadFrames = (dir, count) => {
      const frames = [];
      for (let i = 0; i < count; i++) {
        const img = new Image();
        img.src = `/assets/rpg/${spriteFolder}/${dir}_${i}.png?t=1789104000`;
        frames.push(img);
      }
      return frames;
    };

    // Stardew Valley Expressive Idle Frames
    const loadImg = (src) => {
      const img = new Image();
      img.src = `${src}?t=1789104000`;
      return img;
    };

    playerSpritesRef.current = {
      down: loadFrames('down', 4),
      up: loadFrames('up', 3),
      left: loadFrames('left', 4),
      right: loadFrames('right', 4),
      idle: {
        down: [
          loadImg(gender === 'male' ? '/assets/rpg/player_male/down_0.png' : '/assets/rpg/player/idle_down_0.png'),
          loadImg(gender === 'male' ? '/assets/rpg/player_male/down_0.png' : '/assets/rpg/player/idle_down_blink.png')
        ],
        right: [
          loadImg(gender === 'male' ? '/assets/rpg/player_male/right_0.png' : '/assets/rpg/player/right_0.png'),
          loadImg(gender === 'male' ? '/assets/rpg/player_male/right_0.png' : '/assets/rpg/player/idle_right_blink.png')
        ],
        left: [
          loadImg(gender === 'male' ? '/assets/rpg/player_male/left_0.png' : '/assets/rpg/player/left_0.png'),
          loadImg(gender === 'male' ? '/assets/rpg/player_male/left_0.png' : '/assets/rpg/player/idle_left_blink.png')
        ],
        up: [
          loadImg(gender === 'male' ? '/assets/rpg/player_male/up_0.png' : '/assets/rpg/player/up_0.png'),
          loadImg(gender === 'male' ? '/assets/rpg/player_male/up_0.png' : '/assets/rpg/player/up_0.png')
        ]
      }
    };
  }, []);

  // Listen to browser fullscreen change
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Ambient natural environment sounds (birds chirping, leaves/wind rustle, fountain water)
  useEffect(() => {
    let birdTimer = null;
    let windTimer = null;
    let fountainInterval = null;

    const scheduleBird = () => {
      const delay = 6000 + Math.random() * 6000;
      birdTimer = setTimeout(() => {
        if (currentSceneRef.current === 'outdoor' && !activeNpcDialogueRef.current) {
          sound.playBirdChirp();
        }
        scheduleBird();
      }, delay);
    };

    const scheduleWind = () => {
      const delay = 12000 + Math.random() * 8000;
      windTimer = setTimeout(() => {
        if (currentSceneRef.current === 'outdoor' && !activeNpcDialogueRef.current) {
          sound.playWindRustle();
        }
        scheduleWind();
      }, delay);
    };

    // Central Fountain Water Trickle (Fountain centered around x: 512, y: 280)
    fountainInterval = setInterval(() => {
      if (currentSceneRef.current === 'outdoor' && !activeNpcDialogueRef.current) {
        const p = playerRef.current;
        const dist = Math.hypot(p.x - 512, p.y - 280);
        if (dist < 260) {
          const proximity = Math.max(0, 1 - dist / 260);
          sound.playFountainWater(proximity);
        }
      }
    }, 1800);

    scheduleBird();
    scheduleWind();

    return () => {
      if (birdTimer) clearTimeout(birdTimer);
      if (windTimer) clearTimeout(windTimer);
      if (fountainInterval) clearInterval(fountainInterval);
    };
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // Player state (start in front of central pedestal/fountain, or in front of completed stage NPC)
  const getInitialPlayerPos = () => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem('genetic_odyssey_rpg_full_reset_v2026_09') !== 'done') {
        sessionStorage.removeItem('rpg_last_completed_stage');
        sessionStorage.removeItem('rpg_last_player_pos');
        return { x: 512, y: 340, direction: 'down' };
      }
      const rawStage = sessionStorage.getItem('rpg_last_completed_stage') || lastCompletedStageId;
      if (rawStage) {
        const stageNum = parseInt(rawStage, 10);
        const stageNpc = NPCS.find(n => n.stageId === stageNum);
        if (stageNpc) {
          return {
            x: stageNpc.homeX,
            y: stageNpc.homeY + 26,
            direction: 'up'
          };
        }
      }
      const savedPos = sessionStorage.getItem('rpg_last_player_pos');
      if (savedPos) {
        const parsed = JSON.parse(savedPos);
        // Ensure saved position is well within open, playable pathways
        if (parsed?.x >= 120 && parsed?.x <= 900 && parsed?.y >= 120 && parsed?.y <= 480) {
          return {
            x: parsed.x,
            y: parsed.y,
            direction: parsed.direction || 'down'
          };
        }
      }
    } catch (e) {}
    return { x: 512, y: 340, direction: 'down' };
  };

  const initialPlayerPos = getInitialPlayerPos();
  const playerRef = useRef({
    x: initialPlayerPos.x,
    y: initialPlayerPos.y,
    speed: 2.8,
    direction: initialPlayerPos.direction,
    isMoving: false,
    walkFrame: 0,
    walkTimer: 0,
    idleTimer: 0,
    isClickMoving: false,
    targetMoveX: null,
    targetMoveY: null
  });

  // Controls input tracking
  const keysRef = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    ArrowUp: false,
    ArrowLeft: false,
    ArrowDown: false,
    ArrowRight: false,
    shift: false,
    Shift: false,
    e: false,
    ' ': false
  });

  // Touch virtual controls
  const touchInputRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false
  });

  // Automatic Device Detection: PC/Laptop (Keyboard WASD) vs Mobile/HP (Virtual Analog)
  const [isMobileDevice, setIsMobileDevice] = useState(() => {
    if (typeof window === 'undefined') return false;
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isSmallScreen = window.innerWidth <= 768;
    return isMobileUA || (isTouch && isSmallScreen);
  });

  // Welcome & First Quest Onboarding Modal:
  // Step 1: Sambutan Datang di 1865 & Misi Pertama (Berkenalan dengan semua orang)
  // Step 2: Petunjuk Penting (Cari tanda seru ! di atas kepala NPC)
  const [welcomeStep, setWelcomeStep] = useState(1);

  // Controls Tutorial Popup (Shown via button or secondary view)
  const [showControlsTutorial, setShowControlsTutorial] = useState(false);

  // Keep device detection responsive to screen resize / orientation change
  useEffect(() => {
    const handleResize = () => {
      const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isSmallScreen = window.innerWidth <= 820 || (window.innerHeight <= 520 && window.innerWidth <= 1024);
      setIsMobileDevice(isMobileUA || (isTouch && isSmallScreen));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Active station nearby player (kept null for now to prioritize map visual testing)
  const [nearbyStation, setNearbyStation] = useState(null);
  const nearbyStationRef = useRef(null);
  nearbyStationRef.current = nearbyStation;

  // Active research conclusion (Area Atas, Sumur, Papan Tulis, Meja ST-4)
  const [activeConclusion, setActiveConclusion] = useState(null);
  const activeConclusionRef = useRef(null);
  activeConclusionRef.current = activeConclusion;

  const [nearbyConclusion, setNearbyConclusion] = useState(null);
  const nearbyConclusionRef = useRef(null);
  nearbyConclusionRef.current = nearbyConclusion;

  const userProgressRef = useRef(userProgress);
  userProgressRef.current = userProgress;

  // Quest & Inventory System (Synced with local persistence)
  const [inventory, setInventory] = useState(() => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem('genetic_odyssey_rpg_full_reset_v2026_09') !== 'done') {
        localStorage.removeItem('genetic_odyssey_rpg_inventory');
        return [];
      }
      const saved = localStorage.getItem('genetic_odyssey_rpg_inventory');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const inventoryRef = useRef(inventory);
  inventoryRef.current = inventory;

  const [turnedInStages, setTurnedInStages] = useState(() => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem('genetic_odyssey_rpg_full_reset_v2026_09') !== 'done') {
        localStorage.removeItem('genetic_odyssey_rpg_turned_in');
        return [];
      }
      const saved = localStorage.getItem('genetic_odyssey_rpg_turned_in');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const turnedInStagesRef = useRef(turnedInStages);
  turnedInStagesRef.current = turnedInStages;

  // Active Started Quests (Quest only activates after speaking to that stage's NPC!)
  const [startedQuests, setStartedQuests] = useState(() => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem('genetic_odyssey_rpg_full_reset_v2026_09') !== 'done') {
        localStorage.removeItem('genetic_odyssey_rpg_started_quests');
        return [];
      }
      const saved = localStorage.getItem('genetic_odyssey_rpg_started_quests');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const startedQuestsRef = useRef(startedQuests);
  startedQuestsRef.current = startedQuests;

  // Custom Player Profile (Selected from RPG Menu: Gender 'female'|'male' & Custom Name)
  const [playerGender] = useState(() => {
    try {
      return localStorage.getItem('genetic_odyssey_rpg_player_gender') || 'female';
    } catch (e) {
      return 'female';
    }
  });

  const [playerName] = useState(() => {
    try {
      return localStorage.getItem('genetic_odyssey_rpg_player_name') || userName || 'Jonara';
    } catch (e) {
      return userName || 'Jonara';
    }
  });

  // Active ground quest item in pickup proximity
  const [nearbyQuestItem, setNearbyQuestItem] = useState(null);
  const nearbyQuestItemRef = useRef(null);
  nearbyQuestItemRef.current = nearbyQuestItem;

  // Quest Notifications & Inventory Drawer
  const [pickupToast, setPickupToast] = useState(null);
  const pickupToastTimerRef = useRef(null);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isQuestHintOpen, setIsQuestHintOpen] = useState(false);

  // Track greeted NPCs for the 'Perkenalan di Biara' (Introductions) quest
  const [greetedNpcs, setGreetedNpcs] = useState(() => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem('genetic_odyssey_rpg_full_reset_v2026_09') !== 'done') {
        localStorage.removeItem('genetic_odyssey_rpg_greeted_npcs');
        return [];
      }
      const saved = localStorage.getItem('genetic_odyssey_rpg_greeted_npcs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const greetedNpcsRef = useRef(greetedNpcs);
  greetedNpcsRef.current = greetedNpcs;

  // Selected quest in Journal modal for detail view (null = show quest list)
  const [selectedJournalQuestId, setSelectedJournalQuestId] = useState(null);

  // Dynamic Quest Guidance Banner (Auto-dismisses after 7 seconds, re-triggers on quest events)
  const [showGuidanceBanner, setShowGuidanceBanner] = useState(true);
  const guidanceBannerTimerRef = useRef(null);

  const triggerGuidanceBanner = useCallback((duration = 7000) => {
    setShowGuidanceBanner(true);
    if (guidanceBannerTimerRef.current) clearTimeout(guidanceBannerTimerRef.current);
    guidanceBannerTimerRef.current = setTimeout(() => {
      setShowGuidanceBanner(false);
    }, duration);
  }, []);

  useEffect(() => {
    triggerGuidanceBanner(7000);
    return () => {
      if (guidanceBannerTimerRef.current) clearTimeout(guidanceBannerTimerRef.current);
    };
  }, [triggerGuidanceBanner]);

  // 8 Thematic NPCs Management
  const [activeNpcDialogue, setActiveNpcDialogue] = useState(null);
  const activeNpcDialogueRef = useRef(null);
  activeNpcDialogueRef.current = activeNpcDialogue;

  // Handle reset event triggered externally or internally
  useEffect(() => {
    const handleResetEvent = () => {
      setInventory([]);
      setTurnedInStages([]);
      setStartedQuests([]);
      setGreetedNpcs([]);
      setSelectedJournalQuestId('introductions');
      setActiveNpcDialogue(null);
      setActiveConclusion(null);
      setIsInventoryOpen(false);
      setIsQuestHintOpen(false);
      setPickupToast(null);
      if (playerRef.current) {
        playerRef.current.x = 512;
        playerRef.current.y = 340;
        playerRef.current.direction = 'down';
        playerRef.current.isMoving = false;
        playerRef.current.isClickMoving = false;
        playerRef.current.targetMoveX = null;
        playerRef.current.targetMoveY = null;
      }
      currentSceneRef.current = 'outdoor';
      setCurrentScene('outdoor');
    };
    window.addEventListener('genetic_odyssey_reset_rpg', handleResetEvent);
    return () => window.removeEventListener('genetic_odyssey_reset_rpg', handleResetEvent);
  }, []);

  const handleResetRpgData = () => {
    sound.playClick();
    if (showConfirm) {
      showConfirm(
        "Apakah Anda yakin ingin mereset seluruh data petualangan RPG (misi quest NPC, barang inventori, dan posisi karakter) kembali ke awal?",
        () => {
          resetRpgData?.();
        }
      );
    } else {
      resetRpgData?.();
    }
  };

  // Visual Novel Dialogue Typewriter & Step States
  const [dialogueStep, setDialogueStep] = useState(0);
  const dialogueStepRef = useRef(0);
  dialogueStepRef.current = dialogueStep;
  const [dialogueCharIndex, setDialogueCharIndex] = useState(0);
  const dialogueCharIndexRef = useRef(0);
  const [isDialogueTyping, setIsDialogueTyping] = useState(false);
  const dialogueTypingTimerRef = useRef(null);

  // Reset dialogueStep when activeNpcDialogue changes
  useEffect(() => {
    setDialogueStep(0);
    dialogueStepRef.current = 0;
  }, [activeNpcDialogue]);

  // Typewriter cadence effect for active dialogue step
  useEffect(() => {
    if (!activeNpcDialogue) {
      if (dialogueTypingTimerRef.current) {
        clearInterval(dialogueTypingTimerRef.current);
        dialogueTypingTimerRef.current = null;
      }
      setDialogueCharIndex(0);
      dialogueCharIndexRef.current = 0;
      setIsDialogueTyping(false);
      return;
    }

    const dialogues = activeNpcDialogue.dialogue?.dialogues || [
      { speaker: 'npc', speakerName: activeNpcDialogue.name, text: activeNpcDialogue.dialogue?.text || '' }
    ];
    const currentLine = dialogues[dialogueStep] || dialogues[0];
    const activePlayerName = playerName || 'Jonara';
    const fullText = (currentLine?.text || '').replace(/peneliti muda/gi, activePlayerName);
    const duration = fullText.length * 28; // ~28ms per character for silky reading cadence
    const startTime = performance.now();

    setDialogueCharIndex(0);
    dialogueCharIndexRef.current = 0;
    setIsDialogueTyping(true);

    if (dialogueTypingTimerRef.current) {
      clearInterval(dialogueTypingTimerRef.current);
      dialogueTypingTimerRef.current = null;
    }

    dialogueTypingTimerRef.current = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      const targetChars = Math.floor(progress * fullText.length);

      if (targetChars > dialogueCharIndexRef.current && targetChars % 2 === 0) {
        const ch = fullText[targetChars - 1];
        if (ch && ch.trim() !== '') {
          sound.playDialogueBlip(currentLine?.speaker === 'player' ? 'player' : 'npc');
        }
      }

      dialogueCharIndexRef.current = targetChars;
      setDialogueCharIndex(targetChars);

      if (progress >= 1 || targetChars >= fullText.length) {
        setIsDialogueTyping(false);
        clearInterval(dialogueTypingTimerRef.current);
        dialogueTypingTimerRef.current = null;
      }
    }, 18);

    return () => {
      if (dialogueTypingTimerRef.current) {
        clearInterval(dialogueTypingTimerRef.current);
        dialogueTypingTimerRef.current = null;
      }
    };
  }, [activeNpcDialogue, dialogueStep]);

  // Helper to test if a stage is unlocked
  const isStageUnlocked = useCallback((stageId) => {
    const unlockedList = Array.isArray(userProgress?.unlockedStages) ? userProgress.unlockedStages : [1];
    const maxUnlockedNum = Math.max(userProgress?.unlockedStage || 1, ...unlockedList);
    return unlockedList.includes(stageId) || stageId <= maxUnlockedNum;
  }, [userProgress]);

  // Dynamic Quest Objective Helper based on user progress & stage completion
  const getNextObjectiveInfo = useCallback(() => {
    const stars = userProgress?.stars || {};

    if ((stars[8] || 0) > 0) {
      return {
        stageId: 8,
        title: 'Ekspedisi Genetika Selesai!',
        npcName: 'Pater Gregor Mendel & Tim',
        direction: 'Pusat Biara',
        instruction: 'Selamat! Kamu telah menuntaskan seluruh 8 stage riset biara. Jelajahi kebun atau uji di Kuis HOTS!',
        badge: '🏆 Tamat'
      };
    }

    let targetStage = 1;
    for (let s = 1; s <= 8; s++) {
      if ((stars[s] || 0) === 0) {
        targetStage = s;
        break;
      }
    }

    const OBJECTIVE_GUIDES = {
      1: {
        stageId: 1,
        title: 'Stage 1: Observasi 7 Sifat Ercis',
        npcName: 'Bruder Thomas',
        direction: 'Kebun Barat Laut (Kiri-Atas)',
        instruction: 'Temui Bruder Thomas di kebun barat laut untuk mengamati 7 fenotipe fisik tanaman ercis.',
        badge: 'Stage 1'
      },
      2: {
        stageId: 2,
        title: 'Stage 2: Rangkai Gen & Pasangan Alel',
        npcName: 'Prof. Rosalind',
        direction: 'Laboratorium Barat (Kiri)',
        instruction: 'Jalan ke BARAT melintasi air mancur. Temui Prof. Rosalind di Meja Lab untuk merangkai alel DNA!',
        badge: 'Stage 2'
      },
      3: {
        stageId: 3,
        title: 'Stage 3: Hukum Segregasi Bebas',
        npcName: 'Gigi si Mekanik',
        direction: 'Mesin Uap Selatan (Bawah)',
        instruction: 'Jalan ke SELATAN (bawah). Temui Gigi si Mekanik di mesin uap untuk memilah gamet haploid!',
        badge: 'Stage 3'
      },
      4: {
        stageId: 4,
        title: 'Stage 4: Kalkulasi Papan Punnett',
        npcName: 'Pater Gregor Mendel',
        direction: 'Teras Barat Laut (Kiri-Atas)',
        instruction: 'Jalan ke BARAT LAUT (kiri-atas). Temui Pater Gregor Mendel di meja papan catur Punnett 2×2!',
        badge: 'Stage 4'
      },
      5: {
        stageId: 5,
        title: 'Stage 5: Verifikasi Panen Raya',
        npcName: 'Pak Barnaby',
        direction: 'Promenade Panen Timur (Kanan)',
        instruction: 'Jalan ke TIMUR melintasi air mancur. Temui Pak Barnaby untuk memilah ribuan biji panen raya!',
        badge: 'Stage 5'
      },
      6: {
        stageId: 6,
        title: 'Stage 6: Hukum Asortasi Bebas (Dihibrid)',
        npcName: 'Kak Fafa',
        direction: 'Kabin Riset Timur Laut (Kanan-Atas)',
        instruction: 'Jalan ke TIMUR LAUT. Masuk ke Kabin Riset dan temui Kak Fafa untuk meneliti dihibrid 16 kotak!',
        badge: 'Stage 6'
      },
      7: {
        stageId: 7,
        title: 'Stage 7: Netralkan Anomali Mutasi',
        npcName: 'Snooper Drone',
        direction: 'Semak Bunga Tenggara (Kanan-Bawah)',
        instruction: 'Jalan ke TENGGARA. Temui Snooper Drone di semak bunga untuk mengaudit anomali mutasi Dr. Chaos!',
        badge: 'Stage 7'
      },
      8: {
        stageId: 8,
        title: 'Stage 8: Duel Terakhir Dr. Chaos',
        npcName: 'Dr. Chaos',
        direction: 'Gerbang Kastil Utara (Atas)',
        instruction: 'Jalan lurus ke UTARA menuju gerbang besi kastil. Hadapi Dr. Chaos dalam duel sains pamungkas!',
        badge: 'Stage 8'
      }
    };

    return OBJECTIVE_GUIDES[targetStage] || OBJECTIVE_GUIDES[1];
  }, [userProgress]);

  // Pick up quest item from map
  const triggerItemPickup = useCallback((item) => {
    if (!item) return;
    sound.playCorrect();
    setInventory(prev => {
      if (prev.includes(item.id)) return prev;
      const next = [...prev, item.id];
      try { localStorage.setItem('genetic_odyssey_rpg_inventory', JSON.stringify(next)); } catch (e) {}
      return next;
    });

    const targetNpc = NPCS.find(n => n.stageId === item.stageId);
    if (pickupToastTimerRef.current) clearTimeout(pickupToastTimerRef.current);
    setPickupToast({
      item,
      text: `Bawa item ini ke ${targetNpc?.name || 'NPC terkait'} untuk memulai riset stage!`
    });
    pickupToastTimerRef.current = setTimeout(() => {
      setPickupToast(null);
    }, 5000);
  }, []);

  const triggerItemPickupRef = useRef();
  triggerItemPickupRef.current = triggerItemPickup;

  // Launch stage gameplay
  const launchStageGame = useCallback((stageId) => {
    if (!stageId) return;
    if (!isStageUnlocked(stageId)) {
      sound.playWrong();
      showAlert(`🔒 Stage ${stageId} masih terkunci! Selesaikan stage sebelumnya terlebih dahulu.`);
      return;
    }

    // Save player's exact coordinates and direction before entering the stage
    try {
      sessionStorage.setItem('rpg_last_player_pos', JSON.stringify({
        x: playerRef.current?.x || 512,
        y: playerRef.current?.y || 340,
        direction: playerRef.current?.direction || 'up',
        stageId
      }));
    } catch (e) {}

    sound.playClick();
    if (typeof setCurrentStageId === 'function') {
      setCurrentStageId(stageId);
    }
    navigateTo('stage', stageId);
  }, [isStageUnlocked, setCurrentStageId, showAlert, navigateTo]);

  const launchStageGameRef = useRef();
  launchStageGameRef.current = launchStageGame;

  // Open NPC dialogue with full branching narrative (greeting, not_started, searching, turn_in, ready_to_play, completed)
  const openNpcDialogue = useCallback((npc, forcePhase = null) => {
    if (!npc) return;

    const activePlayerName = playerName || 'Jonara';
    const isFirstTimeMeeting = !greetedNpcsRef.current.includes(npc.id);

    // Track Introductions / Perkenalan Quest
    if (isFirstTimeMeeting) {
      const updatedGreeted = [...greetedNpcsRef.current, npc.id];
      setGreetedNpcs(updatedGreeted);
      try {
        localStorage.setItem('genetic_odyssey_rpg_greeted_npcs', JSON.stringify(updatedGreeted));
      } catch (e) {}

      if (updatedGreeted.length === 5) {
        setTimeout(() => {
          sound.playFanfare();
          if (pickupToastTimerRef.current) clearTimeout(pickupToastTimerRef.current);
          setPickupToast({
            item: { name: 'Misi Selesai: Perkenalan di Biara!', iconSrc: '/assets/rpg/quests/quest_icon.png' },
            text: `Hebat ${activePlayerName}! Kamu telah berkenalan dengan seluruh 5 rekan di Biara Mendel.`
          });
          pickupToastTimerRef.current = setTimeout(() => setPickupToast(null), 6000);
        }, 600);
      }
    }

    const story = NPC_QUEST_STORIES[npc.id];
    const isUnlocked = isStageUnlocked(npc.stageId);

    // If stage is not yet unlocked, NPC simply exchanges warm friendly greeting without error/lock alert
    if (!isUnlocked && forcePhase !== 'completed') {
      sound.playClick();
      const dialogues = isFirstTimeMeeting ? [
        {
          speaker: 'player',
          speakerName: activePlayerName,
          text: `Halo ${npc.name}! Saya ${activePlayerName}, salam kenal!`
        },
        {
          speaker: 'npc',
          speakerName: npc.name,
          text: `Salam kenal, ${activePlayerName}! Senang melihatmu berkunjung ke Biara Mendel. Selesaikan dulu riset bersama rekan-rekanmu di kebun ya!`
        }
      ] : (story?.greetingDialogues || [
        {
          speaker: 'npc',
          speakerName: npc.name,
          text: `Halo ${activePlayerName}! Senang melihatmu berkunjung ke Biara Mendel. Selesaikan dulu riset bersama rekan-rekanmu di kebun ya!`
        }
      ]);

      setActiveNpcDialogue({
        ...npc,
        activePhase: 'greeting',
        dialogue: {
          ...npc.dialogue,
          dialogues
        }
      });
      return;
    }

    const isCompleted = forcePhase === 'completed' || (userProgress?.stars?.[npc.stageId] || 0) > 0 || (userProgress?.unlockedStage || 1) > npc.stageId;
    const hasTurnedIn = turnedInStagesRef.current.includes(npc.stageId);
    const hasItem = story?.requiredItemId && inventoryRef.current.includes(story.requiredItemId);
    const isStarted = startedQuestsRef.current.includes(npc.stageId);

    let phase = 'not_started';
    let dialogues = npc.dialogue?.dialogues || [];

    if (story) {
      if (isCompleted) {
        phase = 'completed';
        dialogues = story.completedDialogues;
      } else if (hasTurnedIn) {
        phase = 'ready_to_play';
        dialogues = (npc.dialogue?.dialogues && npc.dialogue.dialogues.length > 1) 
          ? npc.dialogue.dialogues 
          : (story.turnInDialogues || story.notStartedDialogues);
      } else if (hasItem) {
        phase = 'turn_in';
        dialogues = story.turnInDialogues;
      } else if (isStarted) {
        phase = 'searching';
        dialogues = story.searchingDialogues || story.notStartedDialogues;
      } else {
        phase = 'not_started';
        dialogues = story.notStartedDialogues;
        // Interacted with NPC: register quest as started so it enters Journal
        if (npc.stageId) {
          setStartedQuests(prev => {
            if (prev.includes(npc.stageId)) return prev;
            const next = [...prev, npc.stageId];
            try { localStorage.setItem('genetic_odyssey_rpg_started_quests', JSON.stringify(next)); } catch (e) {}
            return next;
          });
        }
      }
    }

    sound.playClick();
    setActiveNpcDialogue({
      ...npc,
      activePhase: phase,
      dialogue: {
        ...npc.dialogue,
        dialogues
      }
    });
  }, [userProgress, isStageUnlocked, playerName]);

  const openNpcDialogueRef = useRef();
  openNpcDialogueRef.current = openNpcDialogue;

  // Auto-greet player with Visual Novel Dialogue upon returning from a completed stage
  const handledStageReturnRef = useRef(null);

  useEffect(() => {
    const rawStage = sessionStorage.getItem('rpg_last_completed_stage') || lastCompletedStageId;
    if (!rawStage) return;

    const stageNum = parseInt(rawStage, 10);
    try {
      sessionStorage.removeItem('rpg_last_completed_stage');
      sessionStorage.removeItem('rpg_last_player_pos');
    } catch (e) {}

    const completedNpc = NPCS.find(n => n.stageId === stageNum);
    if (completedNpc) {
      handledStageReturnRef.current = stageNum;
      // Place player right in front of the NPC facing up towards them
      if (playerRef.current) {
        playerRef.current.x = completedNpc.homeX;
        playerRef.current.y = completedNpc.homeY + 22;
        playerRef.current.direction = 'up';
        playerRef.current.isMoving = false;
        playerRef.current.targetMoveX = null;
        playerRef.current.targetMoveY = null;
      }

      // Auto trigger NPC Visual Novel dialogue celebrating stage completion & guiding to next stage
      const timer = setTimeout(() => {
        if (openNpcDialogueRef.current) {
          openNpcDialogueRef.current(completedNpc, 'completed');
        }
        if (typeof setLastCompletedStageId === 'function') {
          setLastCompletedStageId(null);
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, []);

  // Also support dynamic updates if PixelRpgWorld was kept mounted
  useEffect(() => {
    if (lastCompletedStageId && handledStageReturnRef.current !== lastCompletedStageId) {
      handledStageReturnRef.current = lastCompletedStageId;
      const stageNum = parseInt(lastCompletedStageId, 10);
      const completedNpc = NPCS.find(n => n.stageId === stageNum);
      if (completedNpc) {
        if (playerRef.current) {
          playerRef.current.x = completedNpc.homeX;
          playerRef.current.y = completedNpc.homeY + 22;
          playerRef.current.direction = 'up';
        }
        const timer = setTimeout(() => {
          if (openNpcDialogueRef.current) {
            openNpcDialogueRef.current(completedNpc, 'completed');
          }
          if (typeof setLastCompletedStageId === 'function') {
            setLastCompletedStageId(null);
          }
        }, 350);
        return () => clearTimeout(timer);
      }
    }
  }, [lastCompletedStageId, setLastCompletedStageId]);

  // When approaching a station or pressing [SPASI]:
  // Enforce rule: talk with NPC first, then play stage!
  const triggerStation = useCallback((station) => {
    if (!station) return;
    
    if (!isStageUnlocked(station.id)) {
      sound.playWrong();
      showAlert(`🔒 ${station.name} (${station.stageName}) masih terkunci! Selesaikan stage sebelumnya terlebih dahulu.`);
      return;
    }

    // Find the NPC for this stage to converse and brief first
    const stageNpc = npcsStateRef.current?.find(n => n.stageId === station.id) || NPCS.find(n => n.stageId === station.id);
    if (stageNpc) {
      openNpcDialogue(stageNpc);
    } else {
      launchStageGame(station.id);
    }
  }, [isStageUnlocked, showAlert, openNpcDialogue, launchStageGame]);

  const triggerStationRef = useRef();
  triggerStationRef.current = triggerStation;

  const handleDialogueNext = useCallback(() => {
    if (!activeNpcDialogueRef.current) return;
    const dialogues = activeNpcDialogueRef.current.dialogue?.dialogues || [
      { speaker: 'npc', speakerName: activeNpcDialogueRef.current.name, text: activeNpcDialogueRef.current.dialogue?.text || '' }
    ];
    const step = dialogueStepRef.current;
    const currentLine = dialogues[step] || dialogues[0];
    const fullText = currentLine?.text || '';

    // If still typing, fast forward to complete text immediately
    if (dialogueCharIndexRef.current < fullText.length) {
      sound.playClick();
      if (dialogueTypingTimerRef.current) {
        clearInterval(dialogueTypingTimerRef.current);
        dialogueTypingTimerRef.current = null;
      }
      dialogueCharIndexRef.current = fullText.length;
      setDialogueCharIndex(fullText.length);
      setIsDialogueTyping(false);
      return;
    }

    // If text finished, proceed to next step in dialogue or transition to stage if finished
    sound.playClick();
    if (step < dialogues.length - 1) {
      const nextStep = step + 1;
      dialogueStepRef.current = nextStep;
      setDialogueStep(nextStep);
    } else {
      // Finished speaking with NPC!
      const finishedNpc = activeNpcDialogueRef.current;
      const phase = finishedNpc?.activePhase;
      activeNpcDialogueRef.current = null;
      setActiveNpcDialogue(null);

      if (phase === 'turn_in') {
        // Player handed in the required item! Record quest stage completion & launch!
        if (finishedNpc?.stageId) {
          setTurnedInStages(prev => {
            const next = prev.includes(finishedNpc.stageId) ? prev : [...prev, finishedNpc.stageId];
            try { localStorage.setItem('genetic_odyssey_rpg_turned_in', JSON.stringify(next)); } catch (e) {}
            return next;
          });
          launchStageGame(finishedNpc.stageId);
        }
      } else if (phase === 'ready_to_play') {
        if (finishedNpc?.stageId) {
          launchStageGame(finishedNpc.stageId);
        }
      } else if (phase === 'completed') {
        // Stage completed conversation finished! Player stays in RPG world to explore next stage!
        sound.playFanfare();
        triggerGuidanceBanner(7000);
        const nextGuide = getNextObjectiveInfo();
        if (pickupToastTimerRef.current) clearTimeout(pickupToastTimerRef.current);
        setPickupToast({
          item: { name: nextGuide.badge, icon: '🎯' },
          text: `Panduan Alur: ${nextGuide.instruction}`
        });
        pickupToastTimerRef.current = setTimeout(() => {
          setPickupToast(null);
        }, 7000);
      } else if (phase === 'not_started') {
        // Phase not_started: Player was assigned the fetch quest!
        if (finishedNpc?.stageId) {
          setStartedQuests(prev => {
            const next = prev.includes(finishedNpc.stageId) ? prev : [...prev, finishedNpc.stageId];
            try { localStorage.setItem('genetic_odyssey_rpg_started_quests', JSON.stringify(next)); } catch (e) {}
            return next;
          });
          const story = NPC_QUEST_STORIES[finishedNpc?.id];
          const qItem = QUEST_ITEMS.find(i => i.id === story?.requiredItemId);
          if (qItem) {
            showAlert(`💡 Misi Dimulai: Temukan ${qItem.name}! ${qItem.hint}`);
          }
        }
      } else if (phase === 'searching') {
        const story = NPC_QUEST_STORIES[finishedNpc?.id];
        const qItem = QUEST_ITEMS.find(i => i.id === story?.requiredItemId);
        if (qItem) {
          showAlert(`🔍 Petunjuk: ${qItem.hint}`);
        }
      }
    }
  }, [launchStageGame, showAlert, getNextObjectiveInfo]);

  const handleDialogueNextRef = useRef();
  handleDialogueNextRef.current = handleDialogueNext;

  const [nearbyNpc, setNearbyNpc] = useState(null);
  const nearbyNpcRef = useRef(null);
  nearbyNpcRef.current = nearbyNpc;

  const npcImagesRef = useRef({});
  const npcsStateRef = useRef(
    NPCS.map((npc, idx) => ({
      ...npc,
      currentX: npc.homeX,
      currentY: npc.homeY,
      targetX: npc.homeX,
      targetY: npc.homeY,
      currentDirection: npc.direction || 'down',
      isWalking: false,
      stepTimer: 0,
      waitTimer: 25 + idx * 40,
      isNearPlayer: false
    }))
  );

  // Interactive Canvas Clicking (Click NPC, Click Station, Click Cabin, or Click Ground to Walk)
  const handleCanvasClick = useCallback((e) => {
    sound.init();
    const canvas = canvasRef.current;
    if (!canvas || activeNpcDialogueRef.current || fadeStateRef.current !== 'idle' || isTransitioningRef.current) return;

    const rect = canvas.getBoundingClientRect();
    let clickX = e.clientX - rect.left;
    let clickY = e.clientY - rect.top;

    if (isForcedLandscape) {
      // Screen to 90deg rotated canvas coordinate mapping
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const sDx = e.clientX - centerX;
      const sDy = e.clientY - centerY;
      clickX = sDy + canvas.width / 2;
      clickY = -sDx + canvas.height / 2;
    }

    const screenWidth = canvas.width;
    const screenHeight = canvas.height;
    const p = playerRef.current;

    let worldX = 0;
    let worldY = 0;

    if (currentSceneRef.current === 'cabin_interior') {
      const CABIN_W = 1024;
      const CABIN_H = 806;
      const scale = Math.min(screenWidth / CABIN_W, screenHeight / CABIN_H);
      const camX = (screenWidth - CABIN_W * scale) / 2;
      const camY = (screenHeight - CABIN_H * scale) / 2;
      worldX = (clickX - camX) / scale;
      worldY = (clickY - camY) / scale;

      // 1. Check if clicking on Cabin Quest Item (Buku Catatan Dihibrid on research table)
      const cabinItem = QUEST_ITEMS.find(it => it.id === 'dihybrid_ledger');
      if (cabinItem && startedQuestsRef.current.includes(6) && !inventoryRef.current.includes(cabinItem.id) && !turnedInStagesRef.current.includes(6) && isStageUnlocked(6)) {
        const distToItem = Math.hypot(worldX - cabinItem.x, worldY - cabinItem.y);
        if (distToItem <= 34) {
          const playerDistToItem = Math.hypot(p.x - cabinItem.x, p.y - cabinItem.y);
          if (playerDistToItem <= 55) {
            triggerItemPickupRef.current?.(cabinItem);
            p.isClickMoving = false;
          } else {
            sound.playClick();
            p.targetMoveX = cabinItem.x;
            p.targetMoveY = cabinItem.y;
            p.isClickMoving = true;
          }
          return;
        }
      }

      // 2. Check if clicking central study research table (Stage 6)
      if (worldX >= 290 && worldX <= 730 && worldY >= 260 && worldY <= 420) {
        const playerDistToBench = Math.hypot(p.x - 512, p.y - 400);
        if (playerDistToBench <= 90) {
          sound.playClick();
          const fafaNpc = NPCS.find(n => n.stageId === 6);
          if (fafaNpc) {
            openNpcDialogue(fafaNpc);
          } else {
            const st6 = STATIONS.find(s => s.id === 6);
            if (st6) triggerStation(st6);
          }
        } else {
          sound.playClick();
          p.targetMoveX = 512;
          p.targetMoveY = 400;
          p.isClickMoving = true;
        }
        return;
      }

      // 3. Check if clicking south exit door mat
      if (worldY >= 720 && Math.abs(worldX - 512) <= 80) {
        triggerDoorTransition('outdoor', 868, 222, 'down');
        return;
      }

      // 4. Click-to-move inside cabin
      p.targetMoveX = Math.max(86, Math.min(1024 - 86, worldX));
      p.targetMoveY = Math.max(250, Math.min(806 - 32, worldY));
      p.isClickMoving = true;
    } else {
      // Outdoor Map - Authentic Stardew Valley Fullscreen Exploration Zoom
      const baseScale = Math.max(screenWidth / WORLD_WIDTH, screenHeight / WORLD_HEIGHT);
      const STARDEW_ZOOM = 1.52;
      const scale = baseScale * STARDEW_ZOOM;
      const displayW = WORLD_WIDTH * scale;
      const displayH = WORLD_HEIGHT * scale;

      const targetCamX = (screenWidth / 2) - (p.x * scale);
      const targetCamY = (screenHeight / 2) - (p.y * scale);
      const camOffsetX = Math.min(0, Math.max(screenWidth - displayW, targetCamX));
      const camOffsetY = Math.min(0, Math.max(screenHeight - displayH, targetCamY));

      worldX = (clickX - camOffsetX) / scale;
      worldY = (clickY - camOffsetY) / scale;

      // 0. Check if clicking directly on any active Ground Quest Item
      const activeOutdoorItems = QUEST_ITEMS.filter(it => 
        it.scene === 'outdoor' &&
        startedQuestsRef.current.includes(it.stageId) &&
        !inventoryRef.current.includes(it.id) &&
        !turnedInStagesRef.current.includes(it.stageId) &&
        isStageUnlocked(it.stageId)
      );
      for (let i = 0; i < activeOutdoorItems.length; i++) {
        const item = activeOutdoorItems[i];
        const distToItem = Math.hypot(worldX - item.x, worldY - item.y);
        if (distToItem <= 28) {
          const playerDistToItem = Math.hypot(p.x - item.x, p.y - item.y);
          if (playerDistToItem <= 45) {
            triggerItemPickupRef.current?.(item);
            p.isClickMoving = false;
          } else {
            sound.playClick();
            p.targetMoveX = item.x;
            p.targetMoveY = item.y;
            p.isClickMoving = true;
          }
          return;
        }
      }

      // 1. Check if clicking directly on any NPC (ONLY access if player is already nearby!)
      if (npcsStateRef.current) {
        for (let i = 0; i < npcsStateRef.current.length; i++) {
          const npc = npcsStateRef.current[i];
          const distToNpc = Math.hypot(worldX - npc.currentX, worldY - (npc.currentY - 12));
          if (distToNpc <= 36) {
            const playerDistToNpc = Math.hypot(p.x - npc.currentX, p.y - npc.currentY);
            if (playerDistToNpc <= 45) {
              // Player is right next to NPC: talk!
              openNpcDialogue(npc);
              p.isClickMoving = false;
            } else {
              // Player is far away: walk toward NPC, don't open dialogue until close!
              sound.playClick();
              p.targetMoveX = npc.currentX;
              p.targetMoveY = Math.min(WORLD_HEIGHT - 32, npc.currentY + 22);
              p.isClickMoving = true;
            }
            return;
          }
        }
      }

      // 2. Check if clicking on any Station Signboard or Field (ONLY access if player is nearby!)
      for (let i = 0; i < STATIONS.length; i++) {
        const st = STATIONS[i];
        const distToSt = Math.hypot(worldX - st.x, worldY - st.y);
        if (distToSt <= st.radius + 15) {
          const playerDistToSt = Math.hypot(p.x - st.x, p.y - st.y);
          if (playerDistToSt <= st.radius + 15) {
            // Player is nearby: trigger station or talk to stage NPC!
            const stageNpc = npcsStateRef.current?.find(n => n.stageId === st.id) || NPCS.find(n => n.stageId === st.id);
            if (stageNpc) {
              openNpcDialogue(stageNpc);
            } else {
              triggerStation(st);
            }
            p.isClickMoving = false;
          } else {
            // Player is far away: walk toward station!
            sound.playClick();
            p.targetMoveX = st.x;
            p.targetMoveY = st.y;
            p.isClickMoving = true;
          }
          return;
        }
      }

      // 3. Check if clicking on any Research Conclusion Hotspot (ONLY open if player is nearby!)
      for (let i = 0; i < RESEARCH_CONCLUSIONS.length; i++) {
        const c = RESEARCH_CONCLUSIONS[i];
        const distToC = Math.hypot(worldX - c.x, worldY - c.y);
        if (distToC <= c.radius + 12) {
          const playerDistToC = Math.hypot(p.x - c.x, p.y - c.y);
          if (playerDistToC <= c.radius + 15) {
            sound.playClick();
            setActiveConclusion(c);
            p.isClickMoving = false;
          } else {
            sound.playClick();
            p.targetMoveX = c.x;
            p.targetMoveY = Math.min(WORLD_HEIGHT - 32, c.y + 16);
            p.isClickMoving = true;
          }
          return;
        }
      }

      // 4. Check if clicking on Cabin Door
      const distToDoor = Math.hypot(worldX - 868, worldY - 204);
      if (distToDoor <= 38) {
        const playerDistToDoor = Math.hypot(p.x - 868, p.y - 204);
        if (playerDistToDoor <= 32) {
          triggerDoorTransition('cabin_interior', 512, 700, 'up');
          p.isClickMoving = false;
        } else {
          sound.playClick();
          p.targetMoveX = 868;
          p.targetMoveY = 208;
          p.isClickMoving = true;
        }
        return;
      }

      // 4. Otherwise, click-to-move player on ground
      p.targetMoveX = Math.max(72, Math.min(WORLD_WIDTH - 74, worldX));
      p.targetMoveY = Math.max(48, Math.min(WORLD_HEIGHT - 32, worldY));
      p.isClickMoving = true;
    }
  }, [triggerStation, triggerDoorTransition]);

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      sound.init();
      if (isTransitioningRef.current) return;

      const key = e.key.toLowerCase();
      if (keysRef.current.hasOwnProperty(key)) {
        keysRef.current[key] = true;
      }
      if (keysRef.current.hasOwnProperty(e.key)) {
        keysRef.current[e.key] = true;
      }

      if (activeConclusionRef.current) {
        if (e.key === 'Escape' || key === 'e' || e.key === ' ' || e.code === 'Space' || e.key === 'Enter') {
          e.preventDefault();
          sound.playClick();
          activeConclusionRef.current = null;
          setActiveConclusion(null);
          return;
        }
      }

      // Toggle / Close Stardew Journal [J] or [ESC]
      if (key === 'j') {
        e.preventDefault();
        sound.playClick();
        setIsInventoryOpen(prev => {
          if (prev) {
            setSelectedJournalQuestId(null);
            return false;
          }
          return true;
        });
        return;
      }

      if (e.key === 'Escape') {
        if (isInventoryOpen) {
          e.preventDefault();
          sound.playClick();
          if (selectedJournalQuestId) {
            setSelectedJournalQuestId(null);
            return;
          }
          setIsInventoryOpen(false);
          return;
        }
        if (activeNpcDialogueRef.current) {
          e.preventDefault();
          sound.playClick();
          activeNpcDialogueRef.current = null;
          setActiveNpcDialogue(null);
          return;
        }
      }

      if (activeNpcDialogueRef.current) {
        if (key === 'e' || e.key === ' ' || e.code === 'Space' || e.key === 'Enter') {
          e.preventDefault();
          handleDialogueNextRef.current?.();
          return;
        }
      }

      // 1. TALK TO NPC / PICK UP QUEST ITEM / READ CONCLUSION / OPEN DOOR: Triggered by [E]
      if (key === 'e') {
        // Prioritize picking up nearby ground quest item
        if (nearbyQuestItemRef.current) {
          e.preventDefault();
          triggerItemPickupRef.current?.(nearbyQuestItemRef.current);
          return;
        }

        if (currentSceneRef.current === 'outdoor') {
          // Talk with nearby NPC
          if (nearbyNpcRef.current) {
            e.preventDefault();
            openNpcDialogueRef.current?.(nearbyNpcRef.current);
            return;
          }
          // Read research conclusion if nearby
          if (nearbyConclusionRef.current) {
            e.preventDefault();
            sound.playClick();
            setActiveConclusion(nearbyConclusionRef.current);
            return;
          }
          // Door to cabin
          const distToDoor = Math.hypot(playerRef.current.x - 868, playerRef.current.y - 204);
          if (distToDoor <= 28) {
            e.preventDefault();
            triggerDoorTransition('cabin_interior', 512, 700, 'up');
            return;
          }
        } else if (currentSceneRef.current === 'cabin_interior') {
          const p = playerRef.current;
          const distToBench = Math.hypot(p.x - 512, p.y - 400);
          if (distToBench <= 95) {
            e.preventDefault();
            sound.playClick();
            const st6 = STATIONS.find(s => s.id === 6);
            if (st6) triggerStationRef.current?.(st6);
            return;
          }
          if (p.y >= 700 && Math.abs(p.x - 512) <= 75) {
            e.preventDefault();
            triggerDoorTransition('outdoor', 868, 222, 'down');
            return;
          }
        }
      }

      // 2. PLAY STAGE / STATION MINIGAME OR PICK UP ITEM: Triggered by [SPASI], [ENTER], or [F]
      if (e.key === ' ' || e.code === 'Space' || e.key === 'Enter' || key === 'f') {
        // Also allow picking up ground quest item via Space / Enter
        if (nearbyQuestItemRef.current) {
          e.preventDefault();
          triggerItemPickupRef.current?.(nearbyQuestItemRef.current);
          return;
        }

        if (currentSceneRef.current === 'outdoor') {
          if (nearbyStationRef.current) {
            e.preventDefault();
            sound.playClick();
            triggerStationRef.current?.(nearbyStationRef.current);
            return;
          }
          const distToDoor = Math.hypot(playerRef.current.x - 868, playerRef.current.y - 204);
          if (distToDoor <= 28) {
            e.preventDefault();
            triggerDoorTransition('cabin_interior', 512, 700, 'up');
            return;
          }
        } else if (currentSceneRef.current === 'cabin_interior') {
          const p = playerRef.current;
          const distToBench = Math.hypot(p.x - 512, p.y - 400);
          if (distToBench <= 95) {
            e.preventDefault();
            sound.playClick();
            const st6 = STATIONS.find(s => s.id === 6);
            if (st6) triggerStationRef.current?.(st6);
            return;
          }
          if (p.y >= 700 && Math.abs(p.x - 512) <= 75) {
            e.preventDefault();
            triggerDoorTransition('outdoor', 868, 222, 'down');
            return;
          }
        }
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (keysRef.current.hasOwnProperty(key)) {
        keysRef.current[key] = false;
      }
      if (keysRef.current.hasOwnProperty(e.key)) {
        keysRef.current[e.key] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [triggerStation, triggerDoorTransition]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const loop = () => {
      // 1. Dynamic Fullscreen Canvas Resize
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      const screenWidth = canvas.width;
      const screenHeight = canvas.height;
      const p = playerRef.current;

      // Clean canvas buffer on every frame to eliminate edge graphical glitches / buffer smearing
      ctx.fillStyle = '#1b3211';
      ctx.fillRect(0, 0, screenWidth, screenHeight);

      // 1b. Scene Transition Fade State Progression
      if (fadeStateRef.current === 'fade_out') {
        fadeAlphaRef.current += 0.08;
        if (fadeAlphaRef.current >= 1) {
          fadeAlphaRef.current = 1;
          const t = fadeTargetRef.current;
          if (t) {
            currentSceneRef.current = t.scene;
            setCurrentScene(t.scene);
            p.x = t.x;
            p.y = t.y;
            p.direction = t.direction || 'down';
            p.walkFrame = 0;
            p.isMoving = false;
          }
          fadeStateRef.current = 'fade_in';
        }
      } else if (fadeStateRef.current === 'fade_in') {
        fadeAlphaRef.current -= 0.08;
        if (fadeAlphaRef.current <= 0) {
          fadeAlphaRef.current = 0;
          fadeStateRef.current = 'idle';
        }
      }

      // 2. Compute movement input
      let dx = 0;
      let dy = 0;

      if (!activeNpcDialogueRef.current && fadeStateRef.current === 'idle') {
        const hasKeyInput = keysRef.current.w || keysRef.current.ArrowUp || touchInputRef.current.up ||
                            keysRef.current.s || keysRef.current.ArrowDown || touchInputRef.current.down ||
                            keysRef.current.a || keysRef.current.ArrowLeft || touchInputRef.current.left ||
                            keysRef.current.d || keysRef.current.ArrowRight || touchInputRef.current.right;

        if (hasKeyInput) {
          p.isClickMoving = false;
          p.targetMoveX = null;
          p.targetMoveY = null;
          if (keysRef.current.w || keysRef.current.ArrowUp || touchInputRef.current.up) dy -= 1;
          if (keysRef.current.s || keysRef.current.ArrowDown || touchInputRef.current.down) dy += 1;
          if (keysRef.current.a || keysRef.current.ArrowLeft || touchInputRef.current.left) dx -= 1;
          if (keysRef.current.d || keysRef.current.ArrowRight || touchInputRef.current.right) dx += 1;
        } else if (p.isClickMoving && p.targetMoveX != null && p.targetMoveY != null) {
          const toTargetX = p.targetMoveX - p.x;
          const toTargetY = p.targetMoveY - p.y;
          const targetDist = Math.hypot(toTargetX, toTargetY);
          if (targetDist < 6) {
            p.isClickMoving = false;
            p.targetMoveX = null;
            p.targetMoveY = null;
          } else {
            dx = toTargetX / targetDist;
            dy = toTargetY / targetDist;
          }
        }
      }

      p.isMoving = dx !== 0 || dy !== 0;

      if (p.isMoving) {
        const isSprinting = keysRef.current.shift || keysRef.current.Shift;
        const currentSpeed = isSprinting ? p.speed * 1.35 : p.speed;

        const length = Math.hypot(dx, dy);
        dx = (dx / length) * currentSpeed;
        dy = (dy / length) * currentSpeed;

        if (Math.abs(dy) > Math.abs(dx)) {
          p.direction = dy > 0 ? 'down' : 'up';
        } else {
          p.direction = dx > 0 ? 'right' : 'left';
        }

        // Foot-level Collision Detection with Smooth Wall Sliding & NPC Obstacle Collision
        const activeColliders = currentSceneRef.current === 'cabin_interior' ? CABIN_COLLIDERS : COLLIDERS;
        const checkCollision = (cx, cy) => {
          const footLeft = cx - 5;
          const footRight = cx + 5;
          const footTop = cy - 3;
          const footBottom = cy + 2;

          // 1. Static environment colliders (walls, fences, props, workbenches)
          for (let i = 0; i < activeColliders.length; i++) {
            const col = activeColliders[i];
            if (
              footRight > col.x &&
              footLeft < col.x + col.w &&
              footBottom > col.y &&
              footTop < col.y + col.h
            ) {
              return true;
            }
          }

          // 2. Solid Hitbox Collision for all NPC Characters (Player cannot walk through NPCs, but can always walk away)
          if (currentSceneRef.current === 'outdoor' && npcsStateRef.current) {
            for (let i = 0; i < npcsStateRef.current.length; i++) {
              const npc = npcsStateRef.current[i];
              // Solid NPC foot collision box: ~16px wide, ~10px deep
              const npcHalfW = 8;
              const npcTop = npc.currentY - 7;
              const npcBottom = npc.currentY + 4;
              if (
                footRight > npc.currentX - npcHalfW &&
                footLeft < npc.currentX + npcHalfW &&
                footBottom > npcTop &&
                footTop < npcBottom
              ) {
                // Only block if trying to move closer to the NPC; allow walking away
                const curDist = Math.hypot(p.x - npc.currentX, p.y - npc.currentY);
                const nextDist = Math.hypot(cx - npc.currentX, cy - npc.currentY);
                if (nextDist < curDist) {
                  return true;
                }
              }
            }
          }

          return false;
        };

        // Try step with anti-stuck safeguard
        let nextX = p.x;
        let nextY = p.y;

        const isCurrentlyStuck = checkCollision(p.x, p.y);
        if (isCurrentlyStuck) {
          // If player is overlapping an obstacle/NPC, allow movement to immediately escape!
          nextX += dx;
          nextY += dy;
        } else if (!checkCollision(p.x + dx, p.y + dy)) {
          nextX += dx;
          nextY += dy;
        } else {
          // Slide along obstacles horizontally
          if (dx !== 0 && !checkCollision(p.x + dx, p.y)) {
            nextX += dx;
          }
          // Slide along obstacles vertically
          if (dy !== 0 && !checkCollision(p.x, p.y + dy)) {
            nextY += dy;
          }
        }

        // If click-moving and blocked by collision obstacles, cancel click-moving
        if (p.isClickMoving && nextX === p.x && nextY === p.y) {
          p.isClickMoving = false;
          p.targetMoveX = null;
          p.targetMoveY = null;
        }

        if (currentSceneRef.current === 'cabin_interior') {
          p.x = Math.max(86, Math.min(1024 - 86, nextX));
          p.y = Math.max(250, Math.min(806 - 32, nextY));

          // Stepping onto south exit doorway
          if (p.direction === 'down' && p.y >= 755 && Math.abs(p.x - 512) <= 55) {
            triggerDoorTransition('outdoor', 868, 222, 'down');
          }
        } else {
          p.x = Math.max(72, Math.min(WORLD_WIDTH - 74, nextX));
          p.y = Math.max(48, Math.min(WORLD_HEIGHT - 32, nextY));

          // Walking directly into cabin door opening
          if (p.direction === 'up' && p.y <= 205 && Math.abs(p.x - 868) <= 16) {
            triggerDoorTransition('cabin_interior', 512, 700, 'up');
          }
        }

        p.idleTimer = 0;
        p.walkTimer++;
        const cadence = isSprinting ? 6 : 8;
        if (p.walkTimer % cadence === 0) {
          const nextFrame = (p.walkFrame + 1) % 4;
          p.walkFrame = nextFrame;
          if (nextFrame === 1 || nextFrame === 3) {
            let surface = 'grass';
            if (currentSceneRef.current === 'cabin_interior') {
              surface = 'wood';
            } else if (isStoneSurface(p.x, p.y)) {
              surface = 'stone';
            }
            sound.playFootstep(surface);
          }
        }
      } else {
        p.walkFrame = 0;
        p.idleTimer++;
      }

      // Station proximity detection (ST-2 and ST-4, plus any other defined stations)
      let closestStation = null;
      let minDistance = Infinity;

      for (let i = 0; i < STATIONS.length; i++) {
        const st = STATIONS[i];
        const dist = Math.hypot(p.x - st.x, p.y - st.y);
        if (dist <= st.radius && dist < minDistance) {
          minDistance = dist;
          closestStation = st;
        }
      }

      if (nearbyStationRef.current?.id !== closestStation?.id) {
        nearbyStationRef.current = closestStation;
        setNearbyStation(closestStation);
      }

      // Conclusion proximity detection (Area Atas, Sumur, Papan Tulis, Meja ST-4)
      let closestConclusion = null;
      let minConclusionDist = Infinity;
      if (currentSceneRef.current === 'outdoor') {
        for (let i = 0; i < RESEARCH_CONCLUSIONS.length; i++) {
          const c = RESEARCH_CONCLUSIONS[i];
          const dist = Math.hypot(p.x - c.x, p.y - c.y);
          if (dist <= c.radius && dist < minConclusionDist) {
            minConclusionDist = dist;
            closestConclusion = c;
          }
        }
      }

      if (nearbyConclusionRef.current?.id !== closestConclusion?.id) {
        nearbyConclusionRef.current = closestConclusion;
        setNearbyConclusion(closestConclusion);
      }

      // 2b2. Ground Quest Items Proximity Detection
      let closestQuestItem = null;
      let minQuestItemDist = Infinity;
      const curScene = currentSceneRef.current;
      const curInventory = inventoryRef.current || [];
      const curTurnedIn = turnedInStagesRef.current || [];
      const curProgress = userProgressRef.current;

      const curStartedQuests = startedQuestsRef.current || [];
      const activeQuestItems = QUEST_ITEMS.filter(it => 
        it.scene === curScene &&
        curStartedQuests.includes(it.stageId) &&
        !curInventory.includes(it.id) &&
        !curTurnedIn.includes(it.stageId) &&
        isStageUnlocked(it.stageId)
      );

      for (let i = 0; i < activeQuestItems.length; i++) {
        const item = activeQuestItems[i];
        const dist = Math.hypot(p.x - item.x, p.y - item.y);
        if (dist <= 38 && dist < minQuestItemDist) {
          minQuestItemDist = dist;
          closestQuestItem = item;
        }
      }

      if (nearbyQuestItemRef.current?.id !== closestQuestItem?.id) {
        nearbyQuestItemRef.current = closestQuestItem;
        setNearbyQuestItem(closestQuestItem);
      }

      // 2c. Update 8 Thematic NPCs Autonomous Movement & Proximity
      let closestNpc = null;
      let minNpcDist = Infinity;

      if (currentSceneRef.current === 'outdoor') {
        npcsStateRef.current.forEach(npc => {
          const distToPlayer = Math.hypot(p.x - npc.currentX, p.y - npc.currentY);
          npc.isNearPlayer = distToPlayer <= 38;

          // Compute active quest status for overhead indicators
          const story = NPC_QUEST_STORIES[npc.id];
          const isCompleted = (curProgress?.stars?.[npc.stageId] || 0) > 0;
          const hasTurnedIn = curTurnedIn.includes(npc.stageId);
          const hasItem = story?.requiredItemId && curInventory.includes(story.requiredItemId);
          const isUnlocked = isStageUnlocked(npc.stageId);
          const isQuestStarted = curStartedQuests.includes(npc.stageId);

          // Find current active story target stage (the first uncompleted stage)
          let currentTargetStage = 1;
          for (let s = 1; s <= 8; s++) {
            if ((curProgress?.stars?.[s] || 0) === 0) {
              currentTargetStage = s;
              break;
            }
          }
          const isCurrentTarget = npc.stageId === currentTargetStage;
          npc.isCurrentTarget = isCurrentTarget;

          if (isCompleted) {
            npc.questStatus = 'completed';
          } else if (hasTurnedIn) {
            npc.questStatus = 'ready_to_play';
          } else if (hasItem && isCurrentTarget) {
            npc.questStatus = 'turn_in';
          } else if (isUnlocked && isCurrentTarget) {
            npc.questStatus = isQuestStarted ? 'searching' : 'need_item';
          } else if (isUnlocked) {
            npc.questStatus = 'unlocked';
          } else {
            npc.questStatus = 'locked';
          }

          const reqItem = QUEST_ITEMS.find(i => i.id === story?.requiredItemId);
          npc.requiredItemName = reqItem?.name || '';
          npc.requiredItemIcon = reqItem?.icon || '';

          if (npc.isNearPlayer) {
            // Face player in 4 directions & stop to talk
            const dx = p.x - npc.currentX;
            const dy = p.y - npc.currentY;
            if (Math.abs(dx) > Math.abs(dy)) {
              npc.currentDirection = dx < 0 ? 'left' : 'right';
            } else {
              npc.currentDirection = dy < 0 ? 'up' : 'down';
            }
            npc.isWalking = false;
            npc.action = 'idle';
            if (distToPlayer < minNpcDist) {
              minNpcDist = distToPlayer;
              closestNpc = npc;
            }
          } else if (!activeNpcDialogueRef.current) {
            // Autonomous wander routine
            if (npc.isWalking) {
              const dx = npc.targetX - npc.currentX;
              const dy = npc.targetY - npc.currentY;
              const dist = Math.hypot(dx, dy);
              if (dist < 1.2) {
                npc.currentX = npc.targetX;
                npc.currentY = npc.targetY;
                npc.isWalking = false;
                npc.waitTimer = Math.random() * 180 + 120; // 2 to 5 seconds pause
                // Choose idle action for Bruder Thomas, Prof. Rosalind, and Gigi
                if (npc.id === 'npc_1_monk') {
                  const randA = Math.random();
                  if (randA < 0.42) {
                    npc.action = 'dig';
                  } else if (randA < 0.72) {
                    npc.action = 'sweat';
                  } else {
                    npc.action = 'idle';
                  }
                } else if (npc.id === 'npc_2_geneticist') {
                  const randR = Math.random();
                  if (randR < 0.35) {
                    npc.action = 'clipboard';
                  } else if (randR < 0.68) {
                    npc.action = 'test_tube';
                  } else if (randR < 0.85) {
                    npc.action = 'glasses';
                  } else {
                    npc.action = 'idle';
                  }
                } else if (npc.id === 'npc_3_mechanic') {
                  const randG = Math.random();
                  if (randG < 0.35) {
                    npc.action = 'wrench';
                  } else if (randG < 0.65) {
                    npc.action = 'wipe';
                  } else if (randG < 0.85) {
                    npc.action = 'goggles';
                  } else {
                    npc.action = 'idle';
                  }
                } else if (npc.id === 'npc_4_mendel') {
                  const randM = Math.random();
                  if (randM < 0.40) {
                    npc.action = 'plant'; // Inspect pea sprout with magnifying glass
                  } else if (randM < 0.75) {
                    npc.action = 'book';  // Study open genetics journal
                  } else {
                    npc.action = 'idle';  // Peaceful contemplative monk
                  }
                } else if (npc.id === 'npc_5_farmer') {
                  const randB = Math.random();
                  if (randB < 0.35) {
                    npc.action = 'pod';   // Inspect fresh pea pod
                  } else if (randB < 0.65) {
                    npc.action = 'sweat'; // Wipe forehead sweat
                  } else if (randB < 0.85) {
                    npc.action = 'cheer'; // Laugh / cheer harvest
                  } else {
                    npc.action = 'idle';  // Hold basket proudly
                  }
                } else if (npc.id === 'npc_6_assistant') {
                  const randF = Math.random();
                  if (randF < 0.35) {
                    npc.action = 'point';     // Point towards cabin door
                  } else if (randF < 0.65) {
                    npc.action = 'clipboard'; // Check research list
                  } else if (randF < 0.85) {
                    npc.action = 'wave';      // Wave greeting
                  } else {
                    npc.action = 'idle';      // Friendly idle
                  }
                } else if (npc.id === 'npc_7_drone') {
                  const randD = Math.random();
                  if (randD < 0.35) {
                    npc.action = 'scan';   // Red conical mutation scanner beam
                  } else if (randD < 0.60) {
                    npc.action = 'alert';  // High-priority red ALERT broadcast
                  } else if (randD < 0.80) {
                    npc.action = 'notice'; // Anomaly detection exclamation bubble
                  } else if (randD < 0.90) {
                    npc.action = 'dash';   // Micro-thruster speed burst
                  } else {
                    npc.action = 'idle';   // High-tech hovering
                  }
                } else if (npc.id === 'npc_8_chaos') {
                  const randC = Math.random();
                  if (randC < 0.40) {
                    npc.action = 'potion'; // Evil laugh inspecting mutagen flask
                  } else if (randC < 0.70) {
                    npc.action = 'point';  // Menacing commanding finger pointing
                  } else {
                    npc.action = 'idle';   // Arrogant arms crossed stance
                  }
                }
              } else {
                const moveSpeed = 0.45;
                const nextNpcX = npc.currentX + (dx / dist) * moveSpeed;
                const nextNpcY = npc.currentY + (dy / dist) * moveSpeed;
                const distToPlayer = Math.hypot(p.x - nextNpcX, p.y - nextNpcY);

                // Prevent NPC from walking through the player
                if (distToPlayer < 18) {
                  npc.isWalking = false;
                  npc.action = 'idle';
                  npc.waitTimer = Math.random() * 80 + 40;
                } else {
                  // Prevent NPC from walking into environment colliders/fences/props
                  let hitObstacle = false;
                  for (let i = 0; i < COLLIDERS.length; i++) {
                    const col = COLLIDERS[i];
                    if (
                      nextNpcX + 7 > col.x &&
                      nextNpcX - 7 < col.x + col.w &&
                      nextNpcY + 3 > col.y &&
                      nextNpcY - 6 < col.y + col.h
                    ) {
                      hitObstacle = true;
                      break;
                    }
                  }
                  if (hitObstacle) {
                    npc.isWalking = false;
                    npc.action = 'idle';
                    npc.waitTimer = Math.random() * 60 + 30;
                  } else {
                    npc.currentX = nextNpcX;
                    npc.currentY = nextNpcY;
                    if (Math.abs(dx) > Math.abs(dy)) {
                      npc.currentDirection = dx < 0 ? 'left' : 'right';
                    } else {
                      npc.currentDirection = dy < 0 ? 'up' : 'down';
                    }
                    npc.stepTimer++;
                  }
                }
              }
            } else {
              npc.waitTimer--;
              if (npc.waitTimer <= 0) {
                const r = npc.wanderRadius || 20;
                let tX = npc.homeX + (Math.random() * 2 - 1) * r;
                let tY = npc.homeY + (Math.random() * 2 - 1) * (r * 0.55);
                if (npc.id === 'npc_6_assistant') {
                  tX = Math.min(838, tX); // Keep doorway corridor (x: 852-884) completely clear!
                }
                npc.targetX = tX;
                npc.targetY = tY;
                npc.isWalking = true;
                npc.action = 'walk';
              }
            }
          }
        });
      }

      if (closestNpc?.id !== nearbyNpcRef.current?.id) {
        nearbyNpcRef.current = closestNpc;
        setNearbyNpc(closestNpc);
      }

      const animTimer = performance.now() * 0.05;

      if (currentSceneRef.current === 'cabin_interior') {
        // Draw 16-bit Cozy Dihybrid Research Cabin Interior with living critters
        updateCabinCritters(cabinCrittersRef, p);
        try {
          drawCabinInterior(ctx, screenWidth, screenHeight, p, animTimer, playerSpritesRef, cabinBgRef, cabinCrittersRef, inventoryRef.current, turnedInStagesRef.current, isStageUnlocked, nearbyQuestItemRef.current, startedQuestsRef.current);
        } catch (cabinErr) {
          console.error("Error rendering cabin interior:", cabinErr);
        }
      } else {
        // 3. EXPLORATION CAMERA PROJECTION: AUTHENTIC STARDEW VALLEY FULLSCREEN ZOOM
        // Scale is calculated from base cover scale multiplied by cozy 1.52x immersion factor.
        // Guarantees map ALWAYS fills 100% of the screen (no margins or void glitches)
        // while centering and following the player dynamically.
        const baseScale = Math.max(screenWidth / WORLD_WIDTH, screenHeight / WORLD_HEIGHT);
        const STARDEW_ZOOM = 1.52;
        const scale = baseScale * STARDEW_ZOOM;
        const displayW = WORLD_WIDTH * scale;
        const displayH = WORLD_HEIGHT * scale;

        // Camera pan centered on player, clamped so screen is 100% covered without edges pulling inward:
        const targetX = (screenWidth / 2) - (p.x * scale);
        const targetY = (screenHeight / 2) - (p.y * scale);

        const camOffsetX = Math.min(0, Math.max(screenWidth - displayW, targetX));
        const camOffsetY = Math.min(0, Math.max(screenHeight - displayH, targetY));

      // 4. RENDER TO CANVAS
      ctx.save();
      ctx.imageSmoothingEnabled = false; // Crisp pixel art

      // Apply camera transform
      ctx.translate(camOffsetX, camOffsetY);
      ctx.scale(scale, scale);

      // --- Background: User Ground Terrain Map (2nd uploaded image) ---
      const mapImg = mapImageRef.current;
      if (mapImg && mapImg.complete && mapImg.naturalWidth > 0) {
        ctx.drawImage(mapImg, 0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      } else {
        ctx.fillStyle = '#457d2b';
        ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      }



      // --- 4c. Crisp Ground Contact Shadows (Tanpa kabut gelap / vignette yang menutupi warna map) ---
      // Central Structure Ground Contact Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(512, 326, 52, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      // Additional Fence Ground Contact Shadows (Left Pen)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.20)';
      ctx.fillRect(70, 467, 195, 6);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
      ctx.fillRect(70, 318, 195, 4);

      // --- 4c. Stardew Valley Organic Environment Details & Full Shadow System ---
      const animTimer = performance.now() * 0.05;
      const critters = ambientWildlifeRef.current;
      const leaves = fallingLeavesRef.current;

      // 1. Moss Patches in Cobblestone Crevices & Margins
      for (let i = 0; i < PATH_MOSS_PATCHES.length; i++) {
        const m = PATH_MOSS_PATCHES[i];
        ctx.fillStyle = 'rgba(38, 70, 24, 0.65)';
        ctx.beginPath();
        ctx.ellipse(m.x, m.y, m.rx, m.ry, m.rot || 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(65, 115, 38, 0.45)';
        ctx.beginPath();
        ctx.ellipse(m.x - 0.8, m.y - 0.4, m.rx * 0.6, m.ry * 0.6, m.rot || 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Weathered Cobblestone Pebbles & Gravel (With Micro Drop-Shadows)
      for (let i = 0; i < PATH_PEBBLES.length; i++) {
        const pb = PATH_PEBBLES[i];
        ctx.fillStyle = 'rgba(0, 0, 0, 0.40)';
        ctx.fillRect(pb.x, pb.y + 1, pb.w, pb.h);
        ctx.fillStyle = pb.c;
        ctx.fillRect(pb.x, pb.y, pb.w, pb.h);
        ctx.fillStyle = '#d6d3d1';
        ctx.fillRect(pb.x, pb.y, Math.max(1, pb.w - 1), 1);
      }

      // 3. Stardew Tall Grass Tufts (With Ground Drop Shadows & Living Sinusoidal Wind Sway)
      for (let i = 0; i < ORGANIC_GRASS_TUFTS.length; i++) {
        const g = ORGANIC_GRASS_TUFTS[i];
        const sway = Math.sin(animTimer * 0.05 + g.x * 0.07) * 1.2;
        const gx = g.x;
        const gy = g.y;

        // Ground Drop Shadow beneath grass tuft
        ctx.fillStyle = 'rgba(8, 24, 6, 0.32)';
        ctx.beginPath();
        ctx.ellipse(gx, gy + 1, 5, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Left blade
        ctx.fillStyle = '#224711';
        ctx.fillRect(gx - 3, gy - 2, 2, 4);
        ctx.fillStyle = '#417d20';
        ctx.fillRect(gx - 3 + sway * 0.8, gy - 6, 2, 5);
        ctx.fillStyle = '#73bb3a';
        ctx.fillRect(gx - 2 + sway * 0.8, gy - 7, 1, 2);

        // Center blade (tallest)
        ctx.fillStyle = '#224711';
        ctx.fillRect(gx, gy - 1, 2, 4);
        ctx.fillStyle = '#4c8e26';
        ctx.fillRect(gx + sway, gy - 8, 2, 7);
        ctx.fillStyle = '#83cf43';
        ctx.fillRect(gx + 1 + sway, gy - 9, 1, 2);

        // Right blade
        ctx.fillStyle = '#224711';
        ctx.fillRect(gx + 3, gy - 2, 2, 4);
        ctx.fillStyle = '#417d20';
        ctx.fillRect(gx + 3 + sway * 0.7, gy - 5, 2, 4);
        ctx.fillStyle = '#73bb3a';
        ctx.fillRect(gx + 4 + sway * 0.7, gy - 6, 1, 2);
      }

      // 4. Stardew Wildflowers (With Ground Drop Shadows & Gentle Breeze)
      for (let i = 0; i < WILDFLOWERS.length; i++) {
        const wf = WILDFLOWERS[i];
        const sway = Math.sin(animTimer * 0.045 + wf.x * 0.06) * 0.7;
        const fx = wf.x + sway;
        const fy = wf.y;

        // Ground Drop Shadow beneath blossom
        ctx.fillStyle = 'rgba(8, 24, 6, 0.28)';
        ctx.beginPath();
        ctx.ellipse(wf.x, fy + 2, 3.5, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Stem
        ctx.fillStyle = '#2d5c19';
        ctx.fillRect(wf.x, fy - 1, 1, 3);

        // Blossom petals
        ctx.fillStyle = wf.petal;
        ctx.fillRect(fx - 1, fy - 4, 3, 3);

        // Flower center
        ctx.fillStyle = wf.center;
        ctx.fillRect(fx, fy - 3, 1, 1);
      }

      // 5. In-World Entrance Wooden Signboard (Papan Nama Kayu Pintu Masuk)
      const sx = 462;
      const sy = 96;

      // Signboard Ground Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
      ctx.beginPath();
      ctx.ellipse(sx + 12, sy + 18, 14, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wooden Post Legs
      ctx.fillStyle = '#2b1103';
      ctx.fillRect(sx + 3, sy + 8, 4, 10);
      ctx.fillRect(sx + 17, sy + 8, 4, 10);
      ctx.fillStyle = '#542508';
      ctx.fillRect(sx + 4, sy + 8, 2, 9);
      ctx.fillRect(sx + 18, sy + 8, 2, 9);

      // Signboard Board Base
      ctx.fillStyle = '#2b1103';
      ctx.fillRect(sx, sy, 24, 12);
      // Carved timber inner face
      ctx.fillStyle = '#853706';
      ctx.fillRect(sx + 1, sy + 1, 22, 10);
      // Bevel highlight
      ctx.fillStyle = '#b45309';
      ctx.fillRect(sx + 1, sy + 1, 22, 1.5);
      // Wood grain slit
      ctx.fillStyle = '#542508';
      ctx.fillRect(sx + 3, sy + 6, 18, 0.8);

      // Brass corner nails
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(sx + 2, sy + 2, 1, 1);
      ctx.fillRect(sx + 21, sy + 2, 1, 1);
      ctx.fillRect(sx + 2, sy + 9, 1, 1);
      ctx.fillRect(sx + 21, sy + 9, 1, 1);

      // Carved Signboard Title
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(sx + 4.5, sy + 3, 2, 2); // Tiny pea sprout icon
      ctx.fillStyle = '#1c0a02';
      ctx.font = 'bold 5.5px "Jersey 10", "Pixelify Sans", cursive, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BIARA', sx + 14.5, sy + 5.8);
      ctx.fillText('MENDEL', sx + 12.5, sy + 9.8);
      ctx.fillStyle = '#fef08a';
      ctx.fillText('BIARA', sx + 14, sy + 5.2);
      ctx.fillText('MENDEL', sx + 12, sy + 9.2);

      // --- 4d. Complete Shadows for Airborne Elements & Critters on Ground ---
      // A. Flying Birds Projected Flight Ground Shadows (Drifting across ground terrain)
      critters.birds.forEach(bird => {
        bird.x += bird.speedX;
        bird.y += bird.speedY;
        bird.wingPhase += 0.28;

        if (bird.x > WORLD_WIDTH + 60) {
          bird.x = -60 - Math.random() * 80;
          bird.y = 70 + Math.random() * 160;
          bird.altitude = 48 + Math.random() * 20;
        }

        // Projected Flight Shadow on ground
        ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
        ctx.beginPath();
        ctx.ellipse(bird.x - 14, bird.y + bird.altitude, 6.5, 2.5, 0.15, 0, Math.PI * 2);
        ctx.fill();
      });

      // B. Butterflies Ground Drop Shadows & Simulation
      critters.butterflies.forEach(b => {
        b.phase += 0.035;
        b.x = b.originX + Math.sin(b.phase * 0.7) * b.radiusX;
        b.y = b.originY + Math.cos(b.phase * 0.9) * b.radiusY + Math.sin(b.phase * 2.2) * 4;
        const wingScale = Math.abs(Math.sin(b.phase * 11));

        // Ground Drop Shadow beneath fluttering butterfly
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(b.x, b.y + b.altitude, 3.2 * Math.max(0.4, wingScale), 1.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Butterfly Sprite (left & right wings flapping)
        // Left wing
        ctx.fillStyle = b.wingColor;
        ctx.fillRect(b.x - 2.5 * wingScale, b.y - 2, 2.5 * wingScale, 3);
        // Right wing
        ctx.fillRect(b.x, b.y - 2, 2.5 * wingScale, 3);
        // Wing interior spots
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x - 1.5 * wingScale, b.y - 1.5, 1.5 * wingScale, 2);
        ctx.fillRect(b.x, b.y - 1.5, 1.5 * wingScale, 2);
        // Body
        ctx.fillStyle = '#1c0a02';
        ctx.fillRect(b.x - 0.5, b.y - 2.5, 1, 4);
      });

      // C. Hopping Frog (Ground shadow & state machine)
      const frog = critters.frog;
      if (frog.state === 'idle') {
        frog.idleTimer--;
        frog.z = 0;
        if (frog.idleTimer <= 0) {
          frog.state = 'hopping';
          frog.hopProgress = 0;
          const jumpDistX = (Math.random() - 0.5) * 40;
          const jumpDistY = (Math.random() - 0.5) * 22;
          frog.targetX = Math.max(410, Math.min(480, frog.x + jumpDistX));
          frog.targetY = Math.max(318, Math.min(352, frog.groundY + jumpDistY));
          frog.startX = frog.x;
          frog.startY = frog.groundY;
          frog.facing = frog.targetX > frog.startX ? 1 : -1;
        }
      } else if (frog.state === 'hopping') {
        frog.hopProgress += 0.045;
        if (frog.hopProgress >= 1) {
          frog.hopProgress = 1;
          frog.state = 'idle';
          frog.idleTimer = 130 + Math.floor(Math.random() * 120);
          frog.x = frog.targetX;
          frog.groundY = frog.targetY;
          frog.z = 0;
        } else {
          frog.x = frog.startX + (frog.targetX - frog.startX) * frog.hopProgress;
          frog.groundY = frog.startY + (frog.targetY - frog.startY) * frog.hopProgress;
          frog.z = Math.sin(frog.hopProgress * Math.PI) * 14;
        }
      }

      // Frog Ground Shadow (stays grounded while frog arches in the air)
      const frogShadowScale = Math.max(0.4, 1 - (frog.z / 22));
      ctx.fillStyle = `rgba(0, 0, 0, ${0.35 * frogShadowScale})`;
      ctx.beginPath();
      ctx.ellipse(frog.x, frog.groundY + 1, 4 * frogShadowScale, 2 * frogShadowScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Frog Body
      const fy = frog.groundY - frog.z;
      const fx = frog.x;
      const isHopping = frog.z > 2;

      ctx.fillStyle = '#15803d'; // Moss green frog body
      ctx.fillRect(fx - 2.5, fy - 3, 5, 3.5);
      ctx.fillStyle = '#4ade80'; // Bright back speckles
      ctx.fillRect(fx - 1.5, fy - 2.5, 3, 2);
      ctx.fillStyle = '#fef08a'; // Belly
      ctx.fillRect(fx - 1, fy - 0.5, 2, 1);
      // Frog eyes
      ctx.fillStyle = '#000000';
      ctx.fillRect(fx + (frog.facing > 0 ? 1 : -2), fy - 3.5, 1.5, 1.5);
      // Frog legs
      ctx.fillStyle = '#166534';
      if (isHopping) {
        ctx.fillRect(fx - (frog.facing > 0 ? 4.5 : -2.5), fy - 1, 3, 1.5);
      } else {
        ctx.fillRect(fx - 3.5, fy - 1, 1.5, 2);
        ctx.fillRect(fx + 2, fy - 1, 1.5, 2);
      }

      // D. Wild Rabbit (Ground shadow & state machine)
      const rabbit = critters.rabbit;
      rabbit.timer--;
      if (rabbit.timer <= 0) {
        if (rabbit.state === 'sniff') {
          rabbit.state = 'nibble';
          rabbit.timer = 80 + Math.floor(Math.random() * 60);
        } else if (rabbit.state === 'nibble') {
          rabbit.state = 'hop';
          rabbit.timer = 30;
          rabbit.hopProgress = 0;
          rabbit.facing = Math.random() > 0.5 ? 1 : -1;
          rabbit.targetX = Math.max(120, Math.min(240, rabbit.x + rabbit.facing * 18));
          rabbit.startX = rabbit.x;
        } else if (rabbit.state === 'hop') {
          rabbit.state = 'sniff';
          rabbit.timer = 120 + Math.floor(Math.random() * 90);
        }
      }

      if (rabbit.state === 'hop') {
        rabbit.hopProgress += 0.07;
        if (rabbit.hopProgress >= 1) {
          rabbit.hopProgress = 1;
          rabbit.x = rabbit.targetX;
          rabbit.z = 0;
        } else {
          rabbit.x = rabbit.startX + (rabbit.targetX - rabbit.startX) * rabbit.hopProgress;
          rabbit.z = Math.sin(rabbit.hopProgress * Math.PI) * 5;
        }
      } else {
        rabbit.z = 0;
      }

      // Rabbit Ground Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
      ctx.beginPath();
      ctx.ellipse(rabbit.x, rabbit.groundY + 1, 5, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rabbit Body
      const rx = rabbit.x;
      const ry = rabbit.groundY - rabbit.z;
      ctx.fillStyle = '#d6d3d1'; // Light warm gray fur
      ctx.fillRect(rx - 3, ry - 3.5, 6, 4);
      ctx.fillStyle = '#f5f5f4'; // Fluffy tail
      ctx.fillRect(rx - (rabbit.facing > 0 ? 4 : -3), ry - 2.5, 2, 2);
      // Head
      ctx.fillStyle = '#e7e5e4';
      ctx.fillRect(rx + (rabbit.facing > 0 ? 1 : -3), ry - 4.5, 3.5, 3.5);
      // Ears (twitching during sniff)
      const earTwitch = rabbit.state === 'sniff' ? Math.sin(animTimer * 0.2) * 1 : 0;
      ctx.fillStyle = '#fbcfe8'; // Pink inner ear
      ctx.fillRect(rx + (rabbit.facing > 0 ? 1.5 : -2) + earTwitch, ry - 7.5, 1.2, 3.5);
      ctx.fillStyle = '#a8a29e'; // Outer ear rim
      ctx.fillRect(rx + (rabbit.facing > 0 ? 2.5 : -3) + earTwitch, ry - 7.5, 1, 3.5);
      // Eye
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(rx + (rabbit.facing > 0 ? 3 : -2.5), ry - 3.5, 1, 1);

      // --- 4e. Ambient Particles: Falling Leaves (Midground Layer) ---
      for (let i = 0; i < leaves.length; i++) {
        const lf = leaves[i];
        lf.x += lf.speedX;
        lf.y += lf.speedY;
        lf.angle += lf.angularSpeed;
        lf.flipPhase += lf.flipSpeed;

        if (lf.x > WORLD_WIDTH + 30) {
          lf.x = -20;
          lf.y = Math.random() * (WORLD_HEIGHT - 40);
        }
        if (lf.y > WORLD_HEIGHT + 30) {
          lf.y = -20;
          lf.x = Math.random() * (WORLD_WIDTH - 40);
        }

        // Draw midground falling leaves with individual ground shadows
        if (!lf.isForeground) {
          // Leaf ground shadow
          ctx.save();
          ctx.translate(lf.x, lf.y + 10);
          ctx.rotate(lf.angle);
          ctx.scale(Math.cos(lf.flipPhase), 1);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.20)';
          ctx.fillRect(-lf.sizeW / 2, -lf.sizeH / 2, lf.sizeW, lf.sizeH);
          ctx.restore();

          // Leaf body
          ctx.save();
          ctx.translate(lf.x, lf.y);
          ctx.rotate(lf.angle);
          ctx.scale(Math.cos(lf.flipPhase), 1);
          ctx.fillStyle = lf.color;
          ctx.fillRect(-lf.sizeW / 2, -lf.sizeH / 2, lf.sizeW, lf.sizeH);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.fillRect(-lf.sizeW / 2, 0, lf.sizeW * 0.7, 0.8);
          ctx.restore();
        }
      }



      // --- 4g. Thematic Stage Props Pass ---
      // Stage 1: Mystery Garden Props (Observation stake, clipboard, magnifying glass)
      drawStage1_MysteryGardenProps(ctx, animTimer);

      // Open wooden gate leading into southwest pen (x: 148-200, y: 298-318)
      drawOpenPenGate(ctx);

      // Stage 2: Meja Riset Genetika (Authentic 16-bit Stardew Valley Deck & Workbenches)
      const st2Img = stationSt2Ref.current;
      if (st2Img && st2Img.complete && st2Img.naturalWidth > 0) {
        ctx.drawImage(st2Img, 102, 110, 154, 130);
      }

      // Stage 3: Gamete Factory Machine (Image 2 - User Uploaded)
      drawStage3_GameteMachine(ctx, animTimer, propGameteRef);

      // Stage 4: Lab Persilangan Punnett (Authentic 16-bit Stardew Valley Lab Desks & Chairs)
      const st4Img = stationSt4Ref.current;
      if (st4Img && st4Img.complete && st4Img.naturalWidth > 0) {
        ctx.drawImage(st4Img, 102, 310, 148, 144);
      }

      // Punnett Square Chalkboard on Easel (Drawn behind player if player is standing south of easel)
      const punnettImg = propPunnettRef.current;
      if (punnettImg && punnettImg.complete && punnettImg.naturalWidth > 0) {
        if (p.y >= 395) {
          ctx.drawImage(punnettImg, 148, 360, 24, 43);
        }
      }

      // Stage 5: Kandang Panen Tenggara (Harvest crates, bushel baskets, 3:1 ratio marker)
      drawStage5_HarvestProps(ctx, animTimer);

      // Animated Stone Well Water (caustic reflections, ripples, falling bucket drops)
      drawStoneWellWater(ctx, animTimer);

      // Animated Central Monastery Fountain / Pedestal Pool (shimmering & dancing splash droplets)
      drawFountainWater(ctx, animTimer);

      // Stage 6 Outdoor: Cabin Doorway Interaction & Wall Lantern
      drawStage6_OutdoorCabinDoor(ctx, p, animTimer);

      // Stage 7: Petak Anomali Genetik (Hazard stake & glowing mutant bell jar)
      drawStage7_MutationProps(ctx, animTimer);

      // Stage 8: Gerbang Utara Biara / Dr. Chaos Gothic Gate (Image 3 - User Uploaded)
      drawStage8_DrChaosGate(ctx, animTimer, propChaosGateRef);

      // --- 4h. Interactive Signboards & Prompts for All 8 Stages ---
      for (let i = 0; i < STATIONS.length; i++) {
        if (STATIONS[i].id !== 6) {
          drawStationMarker(ctx, STATIONS[i], p, animTimer);
        }
      }

      // --- 4h2. Interactive Research Conclusion Markers (Area Atas, Sumur, Papan Tulis, Meja ST-4) ---
      for (let i = 0; i < RESEARCH_CONCLUSIONS.length; i++) {
        drawConclusionMarker(ctx, RESEARCH_CONCLUSIONS[i], p, animTimer);
      }

      // --- 4h3. Draw Active Ground Quest Items on Outdoor Map ---
      const curOutdoorInventory = inventoryRef.current || [];
      const curOutdoorTurnedIn = turnedInStagesRef.current || [];
      const curOutdoorStarted = startedQuestsRef.current || [];
      const activeOutdoorItems = QUEST_ITEMS.filter(it => 
        it.scene === 'outdoor' &&
        curOutdoorStarted.includes(it.stageId) &&
        !curOutdoorInventory.includes(it.id) &&
        !curOutdoorTurnedIn.includes(it.stageId) &&
        isStageUnlocked(it.stageId)
      );

      activeOutdoorItems.forEach(item => {
        const isNearby = nearbyQuestItemRef.current?.id === item.id;
        drawQuestGroundItem(ctx, item, p, animTimer, isNearby);
      });

      // --- 4i. Draw 8 Thematic NPCs (Behind Player: currentY <= p.y) ---
      npcsStateRef.current
        .filter(npc => npc.currentY <= p.y)
        .forEach(npc => drawSingleNpc(ctx, npc, animTimer, p, npcImagesRef, thomasFramesRef, rosalindFramesRef, gigiFramesRef, mendelFramesRef, barnabyFramesRef, fafaFramesRef, droneFramesRef, chaosFramesRef, greetedNpcsRef));

      // --- 5. Player Character (Authentic 16-bit Stardew Valley Walk Cycle) ---
      // Ground Drop Shadow (Directly beneath soles of feet, eliminating floating appearance)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y - 1.5, 8, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Retrieve loaded directional frames
      let playerSpriteDrawn = false;
      const spriteW = 20;
      const spriteH = 41;
      let activeFrame = null;
      let animBob = 0;

      if (p.isMoving) {
        // Active directional walk cycle
        const dirFrames = playerSpritesRef.current[p.direction] || [];
        if (dirFrames.length > 0) {
          const frameIdx = Math.floor(p.walkFrame) % dirFrames.length;
          activeFrame = dirFrames[frameIdx];
          animBob = (p.walkFrame % 2 === 1 ? -1 : 0);
        }
      } else {
        // Stardew Valley Expressive Idle Animation:
        // 1. Relaxed 3/4 stance with hands tucked in pockets (when facing down)
        // 2. Natural directional profiles for left, right, and up
        // 3. Rhythmic breathing rise-and-fall cycle (subtle chest rise every ~1.8s)
        // 4. Natural occasional eye blinking every ~3.5s for 120ms
        const idleFrames = playerSpritesRef.current.idle?.[p.direction] || [];
        const isBlinking = (p.idleTimer % 220 >= 0 && p.idleTimer % 220 <= 8);

        activeFrame = isBlinking && idleFrames[1] ? idleFrames[1] : (idleFrames[0] || playerSpritesRef.current[p.direction]?.[0]);

        // Gentle breathing bobbing (feet remain planted on shadow)
        const breath = Math.sin(p.idleTimer * 0.055);
        animBob = breath > 0.45 ? -0.8 : 0;
      }

      if (activeFrame && activeFrame.complete && activeFrame.naturalWidth > 0) {
        // Bottom of sprite (feet) planted directly on p.y
        ctx.drawImage(activeFrame, p.x - spriteW / 2, p.y - spriteH + animBob, spriteW, spriteH);
        playerSpriteDrawn = true;
      }

      // Fallback researcher sprite if image is still loading
      if (!playerSpriteDrawn) {
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(p.x - 5, p.y - 18, 10, 18);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(p.x - 3, p.y - 15, 6, 9);
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(p.x - 4.5, p.y - 28, 9, 10);
      }

      // --- 5b. Draw 8 Thematic NPCs (In Front of Player: currentY > p.y) ---
      npcsStateRef.current
        .filter(npc => npc.currentY > p.y)
        .forEach(npc => drawSingleNpc(ctx, npc, animTimer, p, npcImagesRef, thomasFramesRef, rosalindFramesRef, gigiFramesRef, mendelFramesRef, barnabyFramesRef, fafaFramesRef, droneFramesRef, chaosFramesRef, greetedNpcsRef));

      // --- 6. Foreground Depth Layers (Y-Sorting) ---
      // Objects located south of the player are rendered in front of the player's body
      // Station foreground props (Punnett chalkboard on easel in front of player when standing behind it)
      if (punnettImg && punnettImg.complete && punnettImg.naturalWidth > 0) {
        if (p.y < 395) {
          ctx.drawImage(punnettImg, 148, 360, 24, 43);
        }
      }

      // --- 6b. Flying Birds Sprite (High Altitude above trees & player) ---
      critters.birds.forEach(bird => {
        const bx = bird.x;
        const by = bird.y;
        const flapCycle = Math.sin(bird.wingPhase);
        const wingYOffset = flapCycle > 0.25 ? -2.5 : flapCycle < -0.25 ? 2.5 : 0;

        // Dark charcoal/brown sparrow body
        ctx.fillStyle = '#2d1808';
        ctx.fillRect(bx - 3, by - 1, 6, 2.5); // Body
        ctx.fillStyle = '#78350f';
        ctx.fillRect(bx - 1, by - 0.5, 3, 1.5); // Mantle
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(bx + 3, by - 0.5, 1.5, 1); // Yellow beak

        // Wings (flapping up/down)
        ctx.fillStyle = '#1c0a02';
        ctx.fillRect(bx - 1, by - 1 + wingYOffset, 3, 1.5);
        ctx.fillRect(bx - 0.5, by - 2 + wingYOffset * 1.3, 2, 1.5);
        // Tail
        ctx.fillStyle = '#1c0a02';
        ctx.fillRect(bx - 4.5, by - 0.5, 2, 1.5);
      });

      // --- 7. Foreground / Environmental Overlay & Wind VFX ---
      // 1. Foreground Cinematic Falling Leaves (Wind/Leaf VFX drifting across camera lens)
      leaves.forEach(lf => {
        if (lf.isForeground) {
          ctx.save();
          ctx.translate(lf.x, lf.y);
          ctx.rotate(lf.angle);
          ctx.scale(Math.cos(lf.flipPhase), 1);
          ctx.globalAlpha = lf.alpha;

          // Main leaf
          ctx.fillStyle = lf.color;
          ctx.fillRect(-lf.sizeW / 2, -lf.sizeH / 2, lf.sizeW, lf.sizeH);

          // Leaf vein
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.fillRect(-lf.sizeW / 2, 0, lf.sizeW * 0.75, 1);
          ctx.restore();
        }
      });

      // 2. Corner Canopy Vignette (Overhanging ancient tree branches swaying gently at viewport top)
      const branchSway = Math.sin(animTimer * 0.03) * 2;

      // Top-Left Overhanging Canopy Foliage
      ctx.fillStyle = 'rgba(18, 42, 14, 0.50)';
      ctx.beginPath();
      ctx.ellipse(35 + branchSway, 0, 75, 38, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(32, 74, 24, 0.35)';
      ctx.beginPath();
      ctx.ellipse(50 + branchSway * 1.2, 5, 55, 28, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Top-Right Overhanging Canopy Foliage
      ctx.fillStyle = 'rgba(18, 42, 14, 0.50)';
      ctx.beginPath();
      ctx.ellipse(WORLD_WIDTH - 35 - branchSway, 0, 75, 38, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(32, 74, 24, 0.35)';
      ctx.beginPath();
      ctx.ellipse(WORLD_WIDTH - 50 - branchSway * 1.2, 5, 55, 28, -0.15, 0, Math.PI * 2);
      ctx.fill();

      // 3. Cinematic Morning God Rays (Sinar Matahari Melalui Dedaunan)
      const ray1 = ctx.createLinearGradient(120, 0, 360, WORLD_HEIGHT);
      ray1.addColorStop(0, 'rgba(254, 240, 138, 0.075)');
      ray1.addColorStop(0.5, 'rgba(254, 240, 138, 0.035)');
      ray1.addColorStop(1, 'rgba(254, 240, 138, 0.0)');
      ctx.fillStyle = ray1;
      ctx.beginPath();
      ctx.moveTo(80, 0);
      ctx.lineTo(240, 0);
      ctx.lineTo(480, WORLD_HEIGHT);
      ctx.lineTo(260, WORLD_HEIGHT);
      ctx.closePath();
      ctx.fill();

      const ray2 = ctx.createLinearGradient(350, 0, 620, WORLD_HEIGHT);
      ray2.addColorStop(0, 'rgba(254, 240, 138, 0.06)');
      ray2.addColorStop(0.5, 'rgba(254, 240, 138, 0.025)');
      ray2.addColorStop(1, 'rgba(254, 240, 138, 0.0)');
      ctx.fillStyle = ray2;
      ctx.beginPath();
      ctx.moveTo(320, 0);
      ctx.lineTo(460, 0);
      ctx.lineTo(720, WORLD_HEIGHT);
      ctx.lineTo(540, WORLD_HEIGHT);
      ctx.closePath();
      ctx.fill();

      // --- 8. Global Cozy Ambient Warmth (Stardew Valley Atmosphere) ---
      // 1. Warm Golden Sunlight Radial Wash (Focused warmth on central farm)
      const sunGrad = ctx.createRadialGradient(512, 280, 70, 512, 280, 530);
      sunGrad.addColorStop(0, 'rgba(255, 215, 120, 0.16)');
      sunGrad.addColorStop(0.5, 'rgba(245, 175, 65, 0.09)');
      sunGrad.addColorStop(1, 'rgba(180, 100, 20, 0.02)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

      // 2. Soft Amber Tone Grade across entire viewport
      ctx.fillStyle = 'rgba(245, 158, 11, 0.055)';
      ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

      // 3. Floating Sunlit Golden Dust Motes
      const motes = sunMotesRef.current;
      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        m.x += m.speedX;
        m.y += m.speedY;
        m.phase += 0.03;
        if (m.x > 920) m.x = 80;
        if (m.y < 60) m.y = 510;

        const alpha = Math.max(0.1, m.baseAlpha + Math.sin(m.phase) * 0.22);
        ctx.fillStyle = `rgba(254, 240, 138, ${alpha})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
        ctx.fill();
      }

        ctx.restore();
      }

      // Fullscreen Black Screen Fade In / Fade Out Transition Overlay
      if (fadeAlphaRef.current > 0) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform to screen pixels
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, Math.max(0, fadeAlphaRef.current))})`;
        ctx.fillRect(0, 0, screenWidth, screenHeight);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    return () => cancelAnimationFrame(animationFrameId);
  }, [isStageUnlocked, mapLoaded]);

  // Unified Action Button Handlers (used by both Portrait Handheld and Landscape/Desktop controls)
  const handleActionE = useCallback(() => {
    if (activeNpcDialogue) {
      handleDialogueNext();
    } else if (nearbyQuestItemRef.current) {
      triggerItemPickup(nearbyQuestItemRef.current);
    } else if (nearbyNpcRef.current) {
      openNpcDialogue(nearbyNpcRef.current);
    } else if (nearbyConclusionRef.current) {
      sound.playClick();
      setActiveConclusion(nearbyConclusionRef.current);
    } else if (currentSceneRef.current === 'cabin_interior') {
      const p = playerRef.current;
      if (p.y >= 710 && Math.abs(p.x - 512) <= 65) {
        triggerDoorTransition('outdoor', 868, 222, 'down');
      } else {
        sound.playClick();
      }
    } else {
      const distToDoor = Math.hypot(playerRef.current.x - 868, playerRef.current.y - 204);
      if (distToDoor <= 28) {
        triggerDoorTransition('cabin_interior', 512, 700, 'up');
      } else {
        sound.playClick();
      }
    }
  }, [activeNpcDialogue, handleDialogueNext, triggerItemPickup, openNpcDialogue, triggerDoorTransition]);

  const handleActionSpace = useCallback(() => {
    if (currentSceneRef.current === 'cabin_interior') {
      const p = playerRef.current;
      if (Math.hypot(p.x - 512, p.y - 400) <= 85) {
        const st6 = STATIONS.find(s => s.id === 6);
        if (st6) triggerStation(st6);
      } else {
        sound.playClick();
      }
    } else if (nearbyStationRef.current) {
      triggerStation(nearbyStationRef.current);
    } else {
      sound.playClick();
    }
  }, [triggerStation]);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden select-none bg-[#090704] flex flex-col justify-between z-30">

      {/* 1. Top RPG HUD Bar */}
      <div className={`relative z-20 w-full rpg-hud-top ${isCompactLandscape ? 'p-1 px-2.5' : isPortrait ? 'p-1.5 px-2.5' : 'p-2.5 sm:p-4'} flex items-center justify-between pointer-events-auto bg-gradient-to-b from-black/80 via-black/40 to-transparent`}>
        
        {/* Left: Back to Main Menu & Fast Map Switch */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => { sound.playClick(); navigateTo('main-menu'); }}
            className={`stardew-wood-btn rpg-wood-button ${isCompactLandscape || isPortrait ? 'px-2 py-0.5 text-[10px] rounded-lg' : 'px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm'} text-[#fffbeb] font-stardew tracking-wider cursor-pointer flex items-center gap-1 active:translate-y-0.5 border-2 border-[#361706] shadow-[0_2px_0_#1c0a02]`}
            title="Kembali ke Menu Utama"
          >
            <ChevronLeft className={`${isCompactLandscape || isPortrait ? 'w-3 h-3' : 'w-4 h-4'} text-[#fef08a] stroke-[2.5]`} />
            <span className="stardew-gold-title">MENU</span>
          </button>

          {/* Quick Switch Button to Classic Map Mode */}
          <button
            onClick={() => { sound.playClick(); navigateTo('map'); }}
            className={`rpg-wood-button ${isCompactLandscape || isPortrait ? 'px-2 py-0.5 text-[10px] rounded-lg' : 'px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm'} bg-gradient-to-b from-[#1e4d3a] via-[#143729] to-[#0c2219] hover:brightness-110 border-2 border-[#091811] text-[#bbf7d0] font-stardew tracking-wider cursor-pointer flex items-center gap-1 shadow-[0_2px_0_#06100c] active:translate-y-0.5 transition-all`}
            title="Buka Peta Stage Cepat"
          >
            <MapPin className={`${isCompactLandscape || isPortrait ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-[#86efac]`} />
            <span className={isCompactLandscape || isPortrait ? "inline text-[9.5px]" : "hidden sm:inline"}>PETA CEPAT</span>
          </button>
        </div>

        {/* Right: Corner HUD Widget */}
        {(isCompactLandscape || isPortrait) ? (
          /* Sleek Single-Line Mobile Layout (Landscape or Portrait) */
          <div className="flex items-center gap-1 sm:gap-1.5 pointer-events-auto">
            {/* Quick Utility Buttons */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              <button
                onClick={() => { sound.playClick(); setWelcomeStep(1); }}
                className="stardew-wood-btn rpg-utility-btn w-6.5 h-6.5 rounded-lg text-[#fef08a] cursor-pointer active:translate-y-0.5 flex items-center justify-center border-2 border-[#361706]"
                title="Panduan Misi & Kontrol [?]"
              >
                <HelpCircle className="w-3 h-3 text-amber-300" />
              </button>
              <button
                onClick={toggleFullScreen}
                className="stardew-wood-btn rpg-utility-btn w-6.5 h-6.5 rounded-lg text-[#fef08a] cursor-pointer active:translate-y-0.5 flex items-center justify-center border-2 border-[#361706]"
                title={isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh'}
              >
                {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
              </button>
              <button
                onClick={toggleSound}
                className="stardew-wood-btn rpg-utility-btn w-6.5 h-6.5 rounded-lg text-white cursor-pointer active:translate-y-0.5 flex items-center justify-center border-2 border-[#361706]"
                title={soundOn ? 'Mute' : 'Audio'}
              >
                {soundOn ? <Volume2 className="w-3 h-3 text-[#86efac]" /> : <VolumeX className="w-3 h-3 text-rose-400" />}
              </button>
            </div>

            {/* Compact 1-Line Stardew Plaque (Location + Stars) */}
            <div className="stardew-hud-plaque rpg-location-plaque px-1.5 sm:px-2 py-0.5 rounded-lg flex items-center gap-1 sm:gap-1.5 shadow-xs">
              <div className="flex items-center gap-1 text-[#fffbeb] font-stardew text-[9px] font-bold">
                <span className="text-amber-300 text-[10px]">{currentScene === 'cabin_interior' ? '🏡' : '⚜'}</span>
                <span className="stardew-gold-title truncate max-w-[50px] sm:max-w-[70px]">
                  {currentScene === 'cabin_interior' ? 'KABIN' : 'BIARA'}
                </span>
              </div>
              <span className="text-[#361706]/40">•</span>
              <div className="flex items-center gap-1">
                <Star className="w-2.5 h-2.5 fill-[#fef08a] text-[#78350f]" />
                <span className="font-stardew text-[9px] sm:text-[9.5px] font-bold text-[#facc15]">{totalStars}/24</span>
              </div>
            </div>

            {/* Compact BUKU MISI Button */}
            <button
              onClick={() => {
                sound.playClick();
                setIsInventoryOpen(true);
                triggerGuidanceBanner(7000);
              }}
              className="stardew-journal-btn rpg-journal-btn px-2 py-0.5 rounded-lg flex items-center gap-1 border-2 border-[#ca8a04]/90 text-[#fef08a] cursor-pointer active:translate-y-0.5"
              title="Buku Misi & Jurnal [J]"
            >
              <img src="/assets/rpg/quests/quest_icon.png" alt="Misi" className="w-3.5 h-3.5 object-contain" />
              <span className="stardew-gold-title font-bold text-[9px] tracking-wide whitespace-nowrap">BUKU MISI</span>
            </button>
          </div>
        ) : (
          /* Standard Desktop Two-Tier Layout */
          <div className="flex flex-col items-end gap-1 sm:gap-2 pointer-events-auto">
            <div className="flex items-start gap-1 sm:gap-2">
              <div className="flex items-center gap-1 sm:gap-1.5 pt-0.5">
                <button
                  onClick={() => { sound.playClick(); setWelcomeStep(1); }}
                  className="stardew-wood-btn px-1.5 h-8 sm:h-8.5 rounded-xl text-[#fef08a] cursor-pointer active:translate-y-0.5 flex items-center justify-center gap-1 border-2 border-[#361706]"
                  title="Buka Panduan Misi & Tanda Seru [?]"
                >
                  <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
                  <span className="hidden md:inline font-pixel text-[8px] font-bold text-amber-200">PANDUAN</span>
                </button>

                <button
                  onClick={() => { sound.playClick(); setIsMobileDevice(prev => !prev); }}
                  className="stardew-wood-btn px-1.5 h-8 sm:h-8.5 rounded-xl text-amber-200 cursor-pointer active:translate-y-0.5 flex items-center justify-center gap-1 border-2 border-[#361706]"
                  title={isMobileDevice ? "Mode PC" : "Mode HP"}
                >
                  {isMobileDevice ? (
                    <>
                      <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="hidden lg:inline font-pixel text-[8px] text-emerald-300">HP</span>
                    </>
                  ) : (
                    <>
                      <Monitor className="w-3.5 h-3.5 text-sky-400" />
                      <span className="hidden lg:inline font-pixel text-[8px] text-sky-300">PC</span>
                    </>
                  )}
                </button>

                <button
                  onClick={toggleFullScreen}
                  className="stardew-wood-btn w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-xl text-[#fef08a] cursor-pointer active:translate-y-0.5 flex items-center justify-center border-2 border-[#361706]"
                  title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh'}
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                </button>

                <button
                  onClick={toggleSound}
                  className="stardew-wood-btn w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-xl text-white cursor-pointer active:translate-y-0.5 flex items-center justify-center border-2 border-[#361706]"
                  title={soundOn ? 'Matikan Suara' : 'Nyalakan Suara'}
                >
                  {soundOn ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#86efac]" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />}
                </button>
              </div>

              {/* Stardew Valley Corner Plaque */}
              <div className="flex flex-col items-stretch drop-shadow-md">
                <div className="stardew-hud-plaque px-2.5 sm:px-3 py-1 min-w-[125px] sm:min-w-[155px] rounded-t-xl border-b-0 flex flex-col items-center justify-center text-center">
                  <div className="flex items-center gap-1 text-[#fffbeb] font-stardew text-[11px] sm:text-xs tracking-wider font-bold">
                    <span className="text-amber-300 text-xs">{currentScene === 'cabin_interior' ? '🏡' : '⚜'}</span>
                    <span className="stardew-gold-title truncate">
                      {currentScene === 'cabin_interior' ? 'KABIN RISET' : 'BIARA MENDEL'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[8px] sm:text-[9px] text-amber-200/80 font-pixel">
                    <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                    <span>Tahun 1865 · Era Mendel</span>
                  </div>
                </div>

                <div className="stardew-hud-plaque px-2 py-1 rounded-b-xl flex items-center justify-between border-t-2 border-[#2e1204]">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 border border-[#361706] flex items-center justify-center shadow-xs">
                    <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-[#fef08a] text-[#78350f] drop-shadow-xs" />
                  </div>
                  <div className="stardew-recessed-slot px-2.5 py-0.5 min-w-[65px] sm:min-w-[78px] rounded-lg flex items-center justify-end">
                    <span className="font-stardew text-xs sm:text-sm font-bold text-[#facc15] tracking-widest leading-none">
                      {totalStars} <span className="text-amber-500/75 text-[9px] sm:text-xs">/ 24</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* BUKU MISI */}
            <div className="flex items-center justify-end">
              <button
                onClick={() => {
                  sound.playClick();
                  setIsInventoryOpen(true);
                  triggerGuidanceBanner(7000);
                }}
                className="stardew-journal-btn px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl gap-2 flex items-center border-2 border-[#ca8a04]/90 hover:border-[#facc15] text-[#fef08a] cursor-pointer group relative"
                title="Buka Buku Misi & Jurnal Penelitian [J]"
              >
                <div className="relative flex items-center justify-center">
                  <img src="/assets/rpg/quests/quest_icon.png" alt="Misi" className="w-4.5 h-4.5 sm:w-5 sm:h-5 object-contain drop-shadow-md group-hover:scale-110 transition-transform" />
                  {(() => {
                    const hasTurnInReady = QUEST_ITEMS.some(q => inventory.includes(q.id) && !turnedInStages.includes(q.stageId));
                    const hasActiveSearching = QUEST_ITEMS.some(q => startedQuests.includes(q.stageId) && !inventory.includes(q.id) && !turnedInStages.includes(q.stageId));
                    if (hasTurnInReady) {
                      return (
                        <span className="absolute -top-2 -right-2.5 flex items-center justify-center w-4 h-4 rounded-full bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 border border-[#240e03] shadow-md animate-stardew-bounce">
                          <span className="font-pixel font-black text-[9px] text-amber-950 leading-none">!</span>
                        </span>
                      );
                    }
                    if (hasActiveSearching) {
                      return (
                        <span className="absolute -top-1.5 -right-2 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-amber-400 border border-[#240e03] shadow-xs">
                          <span className="font-pixel font-bold text-[8px] text-amber-950 leading-none">!</span>
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>
                
                <div className="flex flex-col text-left leading-tight pr-0.5">
                  <span className="stardew-gold-title font-bold text-[11px] sm:text-xs tracking-wider whitespace-nowrap">BUKU MISI</span>
                  <span className="text-[8px] sm:text-[9px] text-amber-200/75 font-pixel">JURNAL RISET</span>
                </div>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 2. Middle Interactive 2D World Canvas Viewport */}
      {/* In Portrait: Fixed 16:9 landscape aspect ratio (video-like) in the center */}
      {/* In Landscape / Desktop: Fullscreen inset-0 */}
      <div className={`relative ${isPortrait ? 'w-full max-w-2xl mx-auto aspect-video max-h-[46vh] my-auto bg-black border-y-2 border-amber-600/40 shadow-[0_8px_32px_rgba(0,0,0,0.9)] overflow-hidden flex items-center justify-center' : 'absolute inset-0 w-full h-full'} z-0`}>
        <canvas 
          ref={canvasRef} 
          onClick={handleCanvasClick}
          className="w-full h-full cursor-pointer select-none"
        />

        {/* 16:9 Landscape Video Indicator Tag in Portrait Mode */}
        {isPortrait && (
          <div className="absolute top-2 right-2 pointer-events-none z-10 flex items-center gap-1.5 bg-black/65 backdrop-blur-xs border border-amber-500/35 rounded-full px-2 py-0.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-pixel text-[7.5px] text-amber-200 uppercase tracking-widest font-bold">16:9 Landskap</span>
          </div>
        )}
      </div>

      {/* 3. Bottom Controls & Objective Area */}
      {isPortrait ? (
        /* ===== PORTRAIT HANDHELD CONSOLE DASHBOARD ===== */
        <div className="relative z-20 w-full flex-1 max-w-md mx-auto px-4 py-2 flex flex-col justify-between pointer-events-auto">
          {/* Objective Guide Card */}
          <div className="w-full">
            {(() => {
              const guide = getNextObjectiveInfo();
              return (
                <div 
                  onClick={() => { sound.playClick(); setIsInventoryOpen(true); }}
                  className="bg-[#241206]/92 hover:bg-[#341a09]/96 backdrop-blur-xs border-2 border-[#ca8a04]/80 text-[#fef08a] px-3 py-1.5 rounded-xl shadow-md flex items-center justify-between gap-2 transition-all cursor-pointer group"
                  title="Buku Misi & Petunjuk Lokasi"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-b from-amber-500 to-amber-700 flex items-center justify-center shrink-0 border border-amber-300">
                      <Compass className="w-3.5 h-3.5 text-white animate-spin-slow" />
                    </div>
                    <div className="min-w-0 flex flex-col text-left">
                      <div className="flex items-center gap-1">
                        <span className="font-pixel text-[7.5px] bg-amber-950/80 px-1.5 py-0.2 rounded text-amber-300 border border-amber-500/40 uppercase font-bold">
                          {guide.badge}
                        </span>
                        <span className="font-pixel text-[7.5px] text-[#86efac] font-bold">
                          📍 {guide.direction}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/95 font-sans font-medium truncate">
                        {guide.instruction}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 text-[8px] font-pixel text-amber-300/80 uppercase shrink-0">
                    <span>MISI</span>
                    <ChevronRight className="w-3 h-3 text-amber-400" />
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Dual-Thumb Handheld Controls (Analog Left, Action Buttons Right) */}
          <div className="w-full flex items-center justify-between px-2 my-auto">
            {/* Left Thumb: Virtual Analog Joystick */}
            <div className="flex items-center justify-center">
              <VirtualAnalogJoystick 
                touchInputRef={touchInputRef} 
                isLandscape={false} 
                isForcedLandscape={false} 
              />
            </div>

            {/* Right Thumb: [E] and [SPASI] Action Buttons */}
            <div className="flex items-center gap-3">
              {/* [E] BICARA / AMBIL Button */}
              <button
                onClick={handleActionE}
                className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center cursor-pointer active:scale-95 shadow-xl relative transition-all duration-200 border-2 ${
                  nearbyQuestItem
                    ? 'bg-gradient-to-b from-amber-500 to-amber-700 border-yellow-300 ring-4 ring-yellow-400/80 shadow-[0_0_26px_rgba(250,204,21,0.95)] scale-105 animate-bounce text-white'
                    : nearbyNpc
                      ? (nearbyNpc.questStatus === 'turn_in'
                          ? 'bg-gradient-to-b from-amber-600 to-amber-800 border-amber-300 ring-4 ring-amber-400/75 shadow-[0_0_24px_rgba(251,191,36,0.9)] scale-105 animate-pulse text-white'
                          : 'bg-[#15803d] border-[#4ade80] ring-4 ring-[#4ade80]/70 shadow-[0_0_24px_rgba(74,222,128,0.85)] scale-105 animate-pulse text-white')
                      : nearbyConclusion
                        ? 'bg-[#b45309] border-[#fde047] ring-4 ring-[#fde047]/75 shadow-[0_0_24px_rgba(253,224,71,0.9)] scale-105 animate-pulse text-white'
                        : 'bg-[#14532d]/90 border-[#22c55e]/60 hover:bg-[#15803d] text-[#bbf7d0]'
                }`}
                title={nearbyQuestItem ? `Ambil ${nearbyQuestItem.name} [E]` : (nearbyConclusion && !nearbyNpc ? "Baca Kesimpulan [E]" : "Bicara dengan Karakter [E]")}
              >
                {nearbyQuestItem ? (
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-200 mb-0.5 animate-pulse" />
                ) : (
                  <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#86efac] mb-0.5" />
                )}
                <span className="font-pixel text-[9px] sm:text-[9.5px] font-black leading-none text-white">
                  [E]
                </span>
                <span className="font-pixel text-[6px] sm:text-[6.5px] text-[#fde047] uppercase tracking-wider leading-none mt-0.5">
                  {nearbyQuestItem 
                    ? 'AMBIL' 
                    : (nearbyNpc 
                        ? (nearbyNpc.questStatus === 'turn_in' ? 'SERAHKAN' : 'BICARA') 
                        : (nearbyConclusion ? 'SIMPULAN' : 'BICARA'))}
                </span>
              </button>

              {/* [SPASI] MAIN STAGE Button */}
              <button
                onClick={handleActionSpace}
                className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center cursor-pointer active:scale-95 shadow-xl relative transition-all duration-200 border-2 ${
                  nearbyStation
                    ? 'bg-gradient-to-b from-amber-500 to-amber-700 border-amber-300 ring-4 ring-amber-400/75 shadow-[0_0_24px_rgba(251,191,36,0.9)] scale-105 animate-pulse text-white'
                    : 'bg-gradient-to-b from-amber-800/90 to-amber-950/90 border-amber-500/50 hover:brightness-110 text-amber-200'
                }`}
                title="Mainkan Stage Stasiun [SPASI]"
              >
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-300 text-amber-300 ml-0.5 mb-0.5" />
                <span className="font-pixel text-[9px] sm:text-[9.5px] font-black leading-none text-[#fef08a]">
                  [SPASI]
                </span>
                <span className="font-pixel text-[6px] sm:text-[6.5px] text-amber-200 uppercase tracking-wider leading-none mt-0.5">
                  MAIN
                </span>
              </button>
            </div>
          </div>

          {/* Bottom Landscape Hint */}
          <div className="w-full flex items-center justify-center gap-1.5 py-1 text-center opacity-70">
            <span className="text-xs">📱</span>
            <span className="font-pixel text-[8px] text-amber-200/80 uppercase tracking-wider">
              Miringkan HP ke landscape untuk layar penuh
            </span>
          </div>
        </div>
      ) : (
        /* ===== LANDSCAPE & DESKTOP BOTTOM BAR ===== */
        <>
          {/* 2b. Interactive Dynamic Quest Guidance Banner */}
          {!activeNpcDialogue && (
            <div 
              className={`absolute ${isCompactLandscape ? 'top-10 max-w-md px-2' : 'top-16 sm:top-20 max-w-xl px-3.5'} left-1/2 -translate-x-1/2 z-20 w-full transition-all duration-1000 ease-out ${
                showGuidanceBanner ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-3 pointer-events-none'
              }`}
            >
              {(() => {
                const guide = getNextObjectiveInfo();
                return (
                  <div 
                    onClick={() => { sound.playClick(); setIsInventoryOpen(true); }}
                    className="bg-[#241206]/92 hover:bg-[#341a09]/96 backdrop-blur-xs border-2 border-[#ca8a04]/80 hover:border-[#facc15] text-[#fef08a] px-3.5 py-2 rounded-2xl shadow-[0_6px_16px_rgba(0,0,0,0.65)] flex items-center justify-between gap-2.5 transition-all cursor-pointer group"
                    title="Klik untuk membuka Buku Misi & Petunjuk Lokasi Lengkap"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-b from-amber-500 to-amber-700 flex items-center justify-center shrink-0 border border-amber-300 shadow-xs">
                        <Compass className="w-4 h-4 text-white animate-spin-slow" />
                      </div>
                      <div className="min-w-0 flex flex-col text-left">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-pixel text-[8px] sm:text-[9px] bg-amber-950/80 px-2 py-0.5 rounded text-amber-300 border border-amber-500/40 uppercase font-bold tracking-wider">
                            {guide.badge}
                          </span>
                          <span className="font-pixel text-[8px] sm:text-[9px] text-[#86efac] font-bold tracking-wide">
                            📍 {guide.direction}
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-white/95 font-sans font-medium truncate mt-0.5">
                          {guide.instruction}
                        </p>
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-1 text-[8px] font-pixel text-amber-300/80 uppercase shrink-0 group-hover:text-amber-200">
                      <span>BUKU MISI</span>
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* 3. Bottom In-World Controls: Virtual Analog for Mobile, Minimalist Badge for Desktop */}
          <div className={`relative z-20 w-full rpg-bottom-bar ${isCompactLandscape ? 'p-1 px-2.5 pb-1.5' : 'p-3 sm:p-6'} flex items-end justify-between pointer-events-none select-none`}>
            
            {/* Left Control: Virtual Analog Joystick on Mobile / Clean Keycap Legend on Desktop */}
            {isMobileDevice ? (
              <div className="pointer-events-auto flex items-center justify-center p-0.5">
                <VirtualAnalogJoystick 
                  touchInputRef={touchInputRef} 
                  isLandscape={isCompactLandscape} 
                  isForcedLandscape={false} 
                />
              </div>
            ) : (
              <div className="pointer-events-auto hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#241206]/85 border-2 border-[#854d0e]/60 text-amber-200 font-pixel text-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.5)] backdrop-blur-xs">
                <span className="text-sm">⌨️</span>
                <span className="text-white font-bold bg-[#3e1f0b] px-1.5 py-0.5 rounded border border-[#854d0e]/50">WASD / Panah</span>
                <span>Jalan</span>
                <span className="text-amber-400 mx-0.5">•</span>
                <span className="text-white font-bold bg-[#3e1f0b] px-1.5 py-0.5 rounded border border-[#854d0e]/50">[E]</span>
                <span>Bicara/Ambil</span>
                <span className="text-amber-400 mx-0.5">•</span>
                <span className="text-white font-bold bg-[#3e1f0b] px-1.5 py-0.5 rounded border border-[#854d0e]/50">[SPASI]</span>
                <span>Aksi Lab</span>
              </div>
            )}

            {/* Distinct Controls: [E] BICARA and [SPASI] MAIN STAGE */}
            <div className="pointer-events-auto flex items-center gap-1 sm:gap-2.5">
              {/* 1. BICARA / AMBIL ITEM Button ([E]) */}
              <button
                onClick={handleActionE}
                className={`rpg-action-button ${isCompactLandscape ? 'w-10 h-10 rounded-xl' : 'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl'} flex flex-col items-center justify-center cursor-pointer active:scale-95 shadow-lg relative transition-all duration-200 border-2 ${
                  nearbyQuestItem
                    ? 'bg-gradient-to-b from-amber-500 to-amber-700 border-yellow-300 ring-4 ring-yellow-400/80 shadow-[0_0_26px_rgba(250,204,21,0.95)] scale-110 animate-bounce text-white'
                    : nearbyNpc
                      ? (nearbyNpc.questStatus === 'turn_in'
                          ? 'bg-gradient-to-b from-amber-600 to-amber-800 border-amber-300 ring-4 ring-amber-400/75 shadow-[0_0_24px_rgba(251,191,36,0.9)] scale-105 animate-pulse text-white'
                          : 'bg-[#15803d] border-[#4ade80] ring-4 ring-[#4ade80]/70 shadow-[0_0_24px_rgba(74,222,128,0.85)] scale-105 animate-pulse text-white')
                      : nearbyConclusion
                        ? 'bg-[#b45309] border-[#fde047] ring-4 ring-[#fde047]/75 shadow-[0_0_24px_rgba(253,224,71,0.9)] scale-105 animate-pulse text-white'
                        : 'bg-[#14532d]/85 border-[#22c55e]/50 hover:bg-[#15803d]/90 text-[#bbf7d0] opacity-85 hover:opacity-100'
                }`}
                title={nearbyQuestItem ? `Ambil ${nearbyQuestItem.name} [E]` : (nearbyConclusion && !nearbyNpc ? "Baca Kesimpulan [E]" : "Bicara dengan Karakter [E]")}
              >
                {nearbyQuestItem ? (
                  <Package className={`${isCompactLandscape ? 'w-3.5 h-3.5' : 'w-5 h-5'} text-yellow-200 mb-0.5 animate-pulse`} />
                ) : (
                  <MessageSquare className={`${isCompactLandscape ? 'w-3 h-3' : 'w-4 h-4 sm:w-5 sm:h-5'} text-[#86efac] mb-0.5`} />
                )}
                <span className={`font-pixel ${isCompactLandscape ? 'text-[7.5px]' : 'text-[9px] sm:text-[10px]'} font-black leading-none text-white`}>
                  [E]
                </span>
                <span className={`font-pixel ${isCompactLandscape ? 'text-[5.5px]' : 'text-[7px] sm:text-[8px]'} text-[#fde047] uppercase tracking-wider leading-none mt-0.5`}>
                  {nearbyQuestItem 
                    ? 'AMBIL' 
                    : (nearbyNpc 
                        ? (nearbyNpc.questStatus === 'turn_in' ? 'SERAHKAN' : 'BICARA') 
                        : (nearbyConclusion ? 'SIMPULAN' : 'BICARA'))}
                </span>
              </button>

              {/* 2. MAIN STAGE Button ([SPASI]) */}
              <button
                onClick={handleActionSpace}
                className={`rpg-action-button ${isCompactLandscape ? 'w-10 h-10 rounded-xl' : 'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl'} flex flex-col items-center justify-center cursor-pointer active:scale-95 shadow-lg relative transition-all duration-200 border-2 ${
                  nearbyStation
                    ? 'bg-gradient-to-b from-amber-500 to-amber-700 border-amber-300 ring-4 ring-amber-400/75 shadow-[0_0_24px_rgba(251,191,36,0.9)] scale-105 animate-pulse text-white'
                    : 'bg-gradient-to-b from-amber-800/85 to-amber-950/85 border-amber-500/40 hover:brightness-110 text-amber-200 opacity-85 hover:opacity-100'
                }`}
                title="Mainkan Stage Stasiun [SPASI]"
              >
                <Play className={`${isCompactLandscape ? 'w-3 h-3' : 'w-4 h-4 sm:w-5 sm:h-5'} fill-amber-300 text-amber-300 ml-0.5 mb-0.5`} />
                <span className={`font-pixel ${isCompactLandscape ? 'text-[7.5px]' : 'text-[9px] sm:text-[10px]'} font-black leading-none text-[#fef08a]`}>
                  [SPASI]
                </span>
                <span className={`font-pixel ${isCompactLandscape ? 'text-[5.5px]' : 'text-[7px] sm:text-[8px]'} text-amber-200 uppercase tracking-wider leading-none mt-0.5`}>
                  MAIN
                </span>
              </button>
            </div>

          </div>
        </>
      )}

      {/* 3b. Visual Novel Character Interaction Scene (Dynamic 2-Way Conversation) */}
      {activeNpcDialogue && (() => {
        const dialogues = activeNpcDialogue.dialogue?.dialogues || [
          { speaker: 'npc', speakerName: activeNpcDialogue.name, text: activeNpcDialogue.dialogue?.text || '' }
        ];
        const currentLine = dialogues[dialogueStep] || dialogues[0];
        const activePlayerName = playerName || 'Jonara';
        const isPlayerSpeaking = currentLine?.speaker === 'player';
        const rawSpeakerName = currentLine?.speakerName || (isPlayerSpeaking ? activePlayerName : activeNpcDialogue.name);
        const speakerName = rawSpeakerName.replace(/peneliti muda/gi, activePlayerName);
        const currentFullText = (currentLine?.text || '').replace(/peneliti muda/gi, activePlayerName);
        const activePlayerPortrait = playerGender === 'male'
          ? PLAYER_MALE_PORTRAIT
          : PLAYER_PORTRAIT;

        return (
          <div 
            onClick={handleDialogueNext}
            className="fixed inset-0 z-50 overflow-hidden select-none bg-black/45 backdrop-blur-[1px] flex flex-col justify-between cursor-pointer animate-fade-in pointer-events-auto"
          >
            {/* 1. Subtle Dark Vignette over live paused RPG world */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_100%)]" />

            {/* 2. Top Header Bar: Stage Info & Close Button */}
            <div className={`relative z-30 w-full ${isCompactLandscape ? 'p-2 px-3' : 'p-3 sm:p-5'} flex items-center justify-between pointer-events-auto`}>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#175225]/90 border-2 border-[#4ade80] rounded-full shadow-md backdrop-blur-xs">
                <Sparkles className="w-3 h-3 text-[#facc15] animate-pulse" />
                <span className="font-pixel text-[7.5px] sm:text-[9px] text-[#f0fdf4] uppercase tracking-wider font-bold">
                  {activeNpcDialogue.activePhase === 'completed'
                    ? `Misi Selesai • Stage ${activeNpcDialogue.stageId}`
                    : `Percakapan Riset • Stage ${activeNpcDialogue.stageId}`}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playClick();
                  activeNpcDialogueRef.current = null;
                  setActiveNpcDialogue(null);
                }}
                className={`flex items-center gap-1 bg-red-600/90 hover:bg-red-700 text-white border-2 border-white ${isCompactLandscape ? 'px-2 py-0.5 text-[7.5px] rounded-lg' : 'px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-xl text-[8px] sm:text-[10px]'} shadow-[0_4px_10px_rgba(220,38,38,0.5)] font-pixel tracking-wider uppercase transition-all cursor-pointer active:translate-y-0.5`}
                title="Tutup Percakapan [Esc]"
              >
                <span>Tutup</span>
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* 3. Center Character Stage: Player on LEFT, NPC on RIGHT (Lower body covered seamlessly by Dialogue Box) */}
            <div className="relative z-20 w-full flex-1 max-w-5xl mx-auto px-3 sm:px-10 flex items-end justify-between pointer-events-none">
              
              {/* LEFT: Player Character (Facing Right toward NPC) */}
              <div className={`flex flex-col items-center transition-all duration-300 pointer-events-none ${isCompactLandscape ? '-mb-4 sm:-mb-6' : '-mb-8 sm:-mb-12 md:-mb-14'} ${
                isPlayerSpeaking 
                  ? 'scale-105 drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] brightness-105 z-10' 
                  : 'scale-95 brightness-[0.7] saturate-[0.85] z-0'
              }`}>
                <div className={`${isCompactLandscape ? 'w-[95px] sm:w-[130px] max-h-[34vh]' : 'w-[140px] sm:w-[185px] md:w-[225px] lg:w-[250px] max-h-[46vh]'} flex items-end justify-center`}>
                  <img
                    src={activePlayerPortrait}
                    alt={`${activePlayerName} (Player)`}
                    className={`w-full h-auto object-contain image-pixelated drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)] ${
                      isPlayerSpeaking ? 'animate-gentle-bob' : ''
                    }`}
                  />
                </div>
              </div>

              {/* RIGHT: NPC Character (Facing Left toward Player) */}
              <div className={`flex flex-col items-center transition-all duration-300 pointer-events-none ${isCompactLandscape ? '-mb-4 sm:-mb-6' : '-mb-8 sm:-mb-12 md:-mb-14'} ${
                !isPlayerSpeaking 
                  ? 'scale-105 drop-shadow-[0_0_20px_rgba(74,222,128,0.8)] brightness-105 z-10' 
                  : 'scale-95 brightness-[0.7] saturate-[0.85] z-0'
              }`}>
                <div className={`${isCompactLandscape ? 'w-[95px] sm:w-[130px] max-h-[34vh]' : 'w-[140px] sm:w-[185px] md:w-[225px] lg:w-[250px] max-h-[46vh]'} flex items-end justify-center`}>
                  <img
                    src={getNpcVnSprite(activeNpcDialogue)}
                    alt={activeNpcDialogue.name}
                    className={`w-full h-auto object-contain image-pixelated drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)] ${
                      !isPlayerSpeaking ? 'animate-gentle-bob' : ''
                    } ${activeNpcDialogue.portraitSrc ? '' : 'scale-x-[-1]'}`}
                  />
                </div>
              </div>

            </div>

            {/* 4. Bottom: Visual Novel Dialogue Box (Matching Reference Screenshot) */}
            <div className={`relative z-30 w-full ${isCompactLandscape ? 'p-1.5 sm:p-3 pb-2' : 'p-3 sm:p-5 md:p-6'} pointer-events-auto`}>
              <div className={`relative max-w-5xl mx-auto bg-[#175225]/95 sm:bg-[#195a28]/95 border-t-4 border-[#3ca956] ${isCompactLandscape ? 'rounded-xl p-3 sm:p-4 shadow-[0_-6px_16px_rgba(0,0,0,0.65)]' : 'rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 md:p-7 shadow-[0_-10px_25px_rgba(0,0,0,0.65)]'} backdrop-blur-xs text-left`}>
                
                {/* Name Tag Pill Badge (Top-Left of Box) - Dynamically indicates who is speaking */}
                <div className={`absolute ${isCompactLandscape ? '-top-3.5 left-4' : '-top-5 left-5 sm:left-8'}`}>
                  <div className={`border-2 ${isCompactLandscape ? 'px-2.5 py-0.5 rounded-lg' : 'px-4 py-1.5 rounded-xl'} shadow-md flex items-center gap-1.5 transition-all ${
                    isPlayerSpeaking 
                      ? 'bg-[#d1fae5] border-[#059669]' 
                      : 'bg-[#dcfce7] border-[#15803d]'
                  }`}>
                    <span className={`font-pixel ${isCompactLandscape ? 'text-[9px] sm:text-[10px]' : 'text-[10px] sm:text-xs md:text-sm'} font-black uppercase tracking-wide ${
                      isPlayerSpeaking ? 'text-[#065f46]' : 'text-[#14532d]'
                    }`}>
                      {speakerName}
                    </span>
                    <span className={`font-pixel ${isCompactLandscape ? 'text-[7px]' : 'text-[8px] sm:text-[9px]'} px-1.5 py-0.2 rounded uppercase font-bold text-white ${
                      isPlayerSpeaking ? 'bg-[#059669]' : 'bg-[#15803d]'
                    }`}>
                      {isPlayerSpeaking ? 'KAMU' : `STAGE ${activeNpcDialogue.stageId}`}
                    </span>
                  </div>
                </div>

                {/* Dialogue Text Content with Smooth Typewriter */}
                <div className={`${isCompactLandscape ? 'pt-1 min-h-[48px]' : 'pt-2 min-h-[75px] sm:min-h-[90px] md:min-h-[105px]'} flex flex-col justify-center`}>
                  <p className={`text-white ${isCompactLandscape ? 'text-[11px] sm:text-xs leading-snug' : 'text-xs sm:text-sm md:text-base leading-relaxed sm:leading-loose'} font-medium font-sans drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]`}>
                    <span>{currentFullText.slice(0, dialogueCharIndex)}</span>
                    {isDialogueTyping && (
                      <span className="inline-block w-2 h-3.5 bg-[#4ade80] ml-1 animate-pulse align-middle" />
                    )}
                    {/* Invisible pre-rendered tail locks line-wrapping completely */}
                    <span className="opacity-0 select-none pointer-events-none">
                      {currentFullText.slice(dialogueCharIndex)}
                    </span>
                  </p>
                </div>

                {/* Bottom Footer Indicators & Action Button */}
                <div className={`${isCompactLandscape ? 'mt-1.5 pt-1.5' : 'mt-3 pt-2.5'} border-t border-[#3ca956]/40 flex flex-wrap items-center justify-between gap-2 text-[9px] sm:text-[11px] text-[#bbf7d0] font-sans`}>
                  <div className="flex items-center gap-2">
                    <span className="font-pixel text-[7.5px] sm:text-[9px] bg-[#14532d] px-2 py-0.5 rounded text-[#86efac] border border-[#22c55e] font-bold">
                      {dialogueStep + 1} / {dialogues.length}
                    </span>
                    <span className="hidden sm:inline opacity-90">Tekan [E] / Spasi / Klik untuk lanjut</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Quick Skip & Play Button (only shown on earlier dialogue steps when NOT in completed phase) */}
                    {activeNpcDialogue.stageId && activeNpcDialogue.activePhase !== 'completed' && dialogueStep < dialogues.length - 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playClick();
                          const stId = activeNpcDialogue.stageId;
                          activeNpcDialogueRef.current = null;
                          setActiveNpcDialogue(null);
                          launchStageGame(stId);
                        }}
                        className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-amber-600/80 hover:bg-amber-600 border border-amber-300 text-amber-100 font-pixel text-[8px] sm:text-[10px] tracking-wider cursor-pointer active:translate-y-0.5 flex items-center gap-1.5 uppercase font-bold transition-all"
                        title="Lewati percakapan & langsung mainkan stage"
                      >
                        <Play className="w-3 h-3 fill-current text-amber-300" />
                        <span>Lewati & Main</span>
                      </button>
                    )}

                    {/* Next Dialogue / Final Play Stage / Finish Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDialogueNext();
                      }}
                      className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl border-2 font-pixel text-[9px] sm:text-xs tracking-wider cursor-pointer shadow-md active:translate-y-0.5 flex items-center gap-1.5 transition-all uppercase font-bold ${
                        !isDialogueTyping && dialogueStep >= dialogues.length - 1
                          ? (activeNpcDialogue.activePhase === 'completed'
                              ? 'bg-gradient-to-b from-emerald-500 to-green-700 hover:brightness-110 border-emerald-300 text-white shadow-[0_0_20px_rgba(16,185,129,0.85)]'
                              : 'bg-gradient-to-b from-amber-500 via-amber-600 to-amber-700 hover:brightness-110 border-amber-300 text-white shadow-[0_0_20px_rgba(245,158,11,0.85)] animate-pulse')
                          : 'bg-[#15803d] hover:bg-[#16a34a] border-[#4ade80] text-[#f0fdf4]'
                      }`}
                    >
                      <span>
                        {isDialogueTyping 
                          ? 'Tampilkan Semua' 
                          : (dialogueStep < dialogues.length - 1 
                              ? 'Lanjut Bicara' 
                              : (activeNpcDialogue.activePhase === 'completed'
                                  ? 'Selesai & Lanjut Petualangan'
                                  : `[E] MULAI STAGE ${activeNpcDialogue.stageId || ''}`))}
                      </span>
                      {!isDialogueTyping && dialogueStep >= dialogues.length - 1 ? (
                        activeNpcDialogue.activePhase === 'completed' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current text-amber-200" />
                        )
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        );
      })()}

      {/* 3c. Interactive Research Conclusion Modal (Area Atas, Sumur, Papan Tulis, Meja ST-4) */}
      {activeConclusion && (
        <div
          onClick={() => {
            sound.playClick();
            setActiveConclusion(null);
          }}
          className="fixed inset-0 z-50 overflow-y-auto select-none bg-black/65 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-5 pointer-events-auto animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl bg-[#241206] border-4 border-[#ca8a04] rounded-2xl p-5 sm:p-7 shadow-[0_0_35px_rgba(202,138,4,0.45)] text-amber-100 flex flex-col gap-4 font-sans text-left max-h-[92vh] overflow-y-auto"
          >
            {/* Corner Decorative Studs */}
            <div className="absolute top-2.5 left-2.5 w-3 h-3 rounded-full bg-[#fde047] border border-[#78350f] shadow-xs" />
            <div className="absolute top-2.5 right-2.5 w-3 h-3 rounded-full bg-[#fde047] border border-[#78350f] shadow-xs" />
            <div className="absolute bottom-2.5 left-2.5 w-3 h-3 rounded-full bg-[#fde047] border border-[#78350f] shadow-xs" />
            <div className="absolute bottom-2.5 right-2.5 w-3 h-3 rounded-full bg-[#fde047] border border-[#78350f] shadow-xs" />

            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b-2 border-amber-800/60 pb-3">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/90 border border-amber-500/50 text-[10px] sm:text-xs font-pixel font-bold uppercase tracking-wider text-amber-300 shadow-xs mb-1.5">
                  <span>{activeConclusion.badge}</span>
                </div>
                <h2 className="font-pixel text-xl sm:text-2xl text-[#fef08a] font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide">
                  {activeConclusion.title}
                </h2>
                <p className="text-xs sm:text-sm text-amber-200/90 font-medium">
                  {activeConclusion.subtitle}
                </p>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveConclusion(null);
                }}
                className="p-1.5 sm:p-2 rounded-xl bg-red-900/80 hover:bg-red-700 text-white border border-red-400 cursor-pointer active:scale-95 transition-all"
                title="Tutup [ESC]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Points List */}
            <div className="flex flex-col gap-2.5">
              {activeConclusion.points?.map((pt, idx) => (
                <div
                  key={idx}
                  className="bg-[#361a0a]/80 border border-amber-700/50 rounded-xl p-3 sm:p-3.5 flex items-start gap-3 shadow-inner"
                >
                  <span className="text-xl sm:text-2xl p-1.5 bg-[#200e04] rounded-lg border border-amber-900/60 shrink-0">
                    {pt.icon}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-pixel text-xs sm:text-sm text-[#fef08a] font-bold tracking-wide mb-0.5">
                      {pt.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-amber-100/90 leading-relaxed font-sans">
                      {pt.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Formula / Highlight Box */}
            {activeConclusion.formula && (
              <div className="bg-gradient-to-r from-emerald-950/80 via-[#1a381f]/80 to-emerald-950/80 border-2 border-emerald-500/60 rounded-xl p-3 sm:p-3.5 text-center shadow-md">
                <span className="font-pixel text-[9px] sm:text-[10px] text-emerald-300 font-bold uppercase tracking-wider block mb-1">
                  ⚡ RANGKUMAN KUNCI / FORMULA
                </span>
                <p className="font-pixel text-xs sm:text-sm text-white font-bold tracking-wide">
                  {activeConclusion.formula}
                </p>
              </div>
            )}

            {/* Quote */}
            {activeConclusion.quote && (
              <div className="bg-[#2a1306]/70 border-l-4 border-amber-500 pl-3 py-1.5 text-[11px] sm:text-xs text-amber-200/80 italic font-serif">
                "{activeConclusion.quote}"
              </div>
            )}

            {/* Close Action Button */}
            <button
              onClick={() => {
                sound.playClick();
                setActiveConclusion(null);
              }}
              className="mt-1 w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-b from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 border-2 border-amber-300 text-white font-pixel text-xs sm:text-sm tracking-wider uppercase font-bold shadow-[0_4px_0_#451a03] active:translate-y-1 cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>SAYA PAHAM KESIMPULAN INI</span>
            </button>
          </div>
        </div>
      )}

      {/* 3d. Celebratory Quest Item Pickup Notification Toast */}
      {pickupToast && (
        <div className="fixed top-28 sm:top-32 left-1/2 -translate-x-1/2 z-50 animate-bounce pointer-events-none px-3 w-full max-w-md">
          <div className="bg-[#1c0a02]/95 border-2 border-[#facc15] text-[#fef08a] px-4 py-3 rounded-2xl shadow-[0_0_30px_rgba(250,204,21,0.7)] flex items-center gap-3.5 backdrop-blur-md text-left">
            <div className="w-12 h-12 shrink-0 p-1.5 bg-[#361706] rounded-xl border-2 border-amber-500/50 shadow-inner flex items-center justify-center">
              <img src={pickupToast.item.iconSrc} alt={pickupToast.item.name} className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-pixel text-[9px] sm:text-[10px] text-[#4ade80] font-bold uppercase tracking-wider">
                Item Quest Berhasil Diambil!
              </div>
              <div className="font-pixel text-xs sm:text-sm text-white font-black truncate">
                {pickupToast.item.name}
              </div>
              <div className="text-[10px] sm:text-[11px] text-amber-200 font-sans mt-0.5 leading-tight">
                {pickupToast.text}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3e. Full Quest Inventory Modal Drawer */}
      {/* 3e. Authentic Stardew Valley Journal Modal (Introductions & Discovered Quests) */}
      {isInventoryOpen && (() => {
        const activePlayerName = playerName || 'Jonara';

        // 1. Introductions Quest (Always present from the start)
        const INTRO_TARGETS = [
          { id: 'npc_1_monk', name: 'Bruder Thomas', role: 'Biarawan Kebun Ercis' },
          { id: 'npc_2_geneticist', name: 'Prof. Rosalind', role: 'Lab Genetika Molekuler Barat' },
          { id: 'npc_3_mechanic', name: 'Gigi si Teknisi', role: 'Mesin Pemilah Gamet' },
          { id: 'npc_4_mendel', name: 'Pater Gregor Mendel', role: 'Taman Biara Pusat' },
          { id: 'npc_5_farmer', name: 'Pak Barnaby', role: 'Perkebunan Sayur Timur' }
        ];

        const greetedCount = Math.min(INTRO_TARGETS.length, (greetedNpcs || []).length);
        const isIntroDone = (greetedNpcs || []).length >= INTRO_TARGETS.length;

        const introductionsQuest = {
          id: 'introductions',
          title: 'Perkenalan di Biara',
          subtitle: 'Introductions',
          giver: 'Biara Santo Thomas Mendel',
          giverRole: 'Orientasi Peneliti Baru',
          giverPortrait: '/assets/portraits/npc_thomas_portrait.webp',
          description: `Selamat datang di Biara Santo Thomas! Sebelum larut dalam eksperimen mendalam, berjalanlah mengelilingi biara untuk menyapa dan memperkenalkan dirimu (${activePlayerName}) kepada 5 rekan peneliti dan biarawan di sini.`,
          isCompleted: isIntroDone,
          isTurnedIn: false,
          isCollected: false,
          badge: `${greetedCount} / ${INTRO_TARGETS.length}`,
          checklist: INTRO_TARGETS.map(t => ({
            name: `Sapa ${t.name} (${t.role})`,
            done: (greetedNpcs || []).includes(t.id)
          }))
        };

        // 2. Stage Quests: ONLY show if the quest has been assigned / interacted with!
        // As requested: "bukan misi contoh misi mencari kacamata pembesar maka akan masuk kesitu ketika sudah disuruh atau interaksi dengan bruther kalau belum engga usah"
        const stageQuests = [];
        QUEST_ITEMS.forEach(item => {
          const isStarted = startedQuests.includes(item.stageId);
          const hasItem = inventory.includes(item.id);
          const isTurnedIn = turnedInStages.includes(item.stageId);
          const isStageDone = (userProgress?.stars?.[item.stageId] || 0) > 0;
          const stageNpc = NPCS.find(n => n.stageId === item.stageId);

          if (isStarted || hasItem || isTurnedIn || isStageDone) {
            stageQuests.push({
              id: `quest_stage_${item.stageId}`,
              stageId: item.stageId,
              title: `${item.name}`,
              giver: stageNpc?.name || 'Rekan Biara',
              giverRole: stageNpc?.role || 'Peneliti Biara',
              giverPortrait: stageNpc?.portraitSrc || stageNpc?.spriteSrc,
              targetItem: item,
              description: `Bantu ${stageNpc?.name || 'rekan'} menyelesaikan riset Stage ${item.stageId}. Cari dan temukan ${item.name} yang hilang di kebun, lalu serahkan kembali ke ${stageNpc?.name}.`,
              hint: item.hint,
              isCompleted: isStageDone,
              isTurnedIn: isTurnedIn,
              isCollected: hasItem,
              checklist: [
                {
                  name: `Bicara dengan ${stageNpc?.name} di ${stageNpc?.role || 'pos riset'}`,
                  done: true
                },
                {
                  name: `Ambil ${item.name} (${item.hint})`,
                  done: hasItem || isTurnedIn || isStageDone
                },
                {
                  name: `Serahkan ${item.name} kembali ke ${stageNpc?.name}`,
                  done: isTurnedIn || isStageDone
                },
                {
                  name: `Tuntaskan eksperimen Stage ${item.stageId}`,
                  done: isStageDone
                }
              ]
            });
          }
        });

        // Combined quest list: Introductions first, followed by active stage quests
        const allQuests = [introductionsQuest, ...stageQuests];
        const selectedQuest = allQuests.find(q => q.id === selectedJournalQuestId);

        return (
          <div
            onClick={() => {
              setIsInventoryOpen(false);
              setSelectedJournalQuestId(null);
            }}
            className="fixed inset-0 z-50 select-none bg-black/70 backdrop-blur-[3px] flex items-center justify-center p-6 sm:p-8 md:p-10 pointer-events-auto animate-fade-in overflow-y-auto"
          >
            {/* Main Stardew Journal Board (overflow-visible ensures ribbon & close button are NEVER clipped) */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg sm:max-w-xl md:max-w-2xl stardew-journal-board rounded-2xl p-5 sm:p-7 text-[#3b1704] flex flex-col font-sans text-left shadow-2xl overflow-visible my-auto"
            >
              {/* Top Parchment Ribbon Scroll: "Journal" (Matching Stardew Valley) - z-30 & overflow-visible prevents cut-off */}
              <div className="absolute -top-5 sm:-top-5.5 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none z-30">
                <div className="stardew-scroll-banner px-8 sm:px-12 py-1 sm:py-1.5 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.5)] flex items-center gap-2">
                  <span className="font-stardew font-black text-base sm:text-xl text-[#4a1d04] tracking-widest uppercase drop-shadow-xs">
                    Journal
                  </span>
                </div>
              </div>

              {/* Close Button: Red Rounded Square Button with Wood Outline - z-30 prevents cut-off */}
              <button
                onClick={() => {
                  sound.playClick();
                  setIsInventoryOpen(false);
                  setSelectedJournalQuestId(null);
                }}
                className="absolute -top-3.5 -right-3.5 w-9 h-9 sm:w-10 sm:h-10 rounded-xl stardew-close-btn flex items-center justify-center cursor-pointer text-[#fffbeb] shadow-[0_4px_8px_rgba(0,0,0,0.6)] z-30 hover:scale-105 active:scale-95 transition-transform"
                title="Tutup Jurnal [ESC / J]"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
              </button>

              {/* Left Back Arrow Tab: Displayed when viewing Quest Detail Pop-Up (Matching Stardew Valley Screenshot) */}
              {selectedQuest && (
                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedJournalQuestId(null);
                  }}
                  className="absolute top-1/2 -left-3.5 sm:-left-4.5 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-lg stardew-back-btn flex items-center justify-center cursor-pointer text-[#fffbeb] shadow-[0_4px_8px_rgba(0,0,0,0.6)] z-30 group hover:scale-110 active:scale-95 transition-transform"
                  title="Kembali ke Daftar Misi"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3] group-hover:-translate-x-0.5 transition-transform" />
                </button>
              )}

              {/* Inner Content Area (Scrolls nicely if tall without clipping outer decorations) */}
              <div className="overflow-y-auto max-h-[68vh] sm:max-h-[72vh] pr-1 space-y-3 custom-scrollbar mt-1">
                {!selectedQuest ? (
                  /* ================= 1. QUEST LIST VIEW (Clean Stardew Bars, No Overcrowding) ================= */
                  <>
                    {/* Sub-header text */}
                    <div className="pt-2 text-center">
                      <p className="font-stardew text-xs sm:text-sm text-[#4a1d04] font-bold tracking-wide">
                        Buku Catatan Misi & Jurnal Biara ({allQuests.filter(q => q.isCompleted).length} / {allQuests.length} Selesai)
                      </p>
                    </div>

                    {/* Stack of Stardew Wooden Quest Bars */}
                    <div className="flex flex-col gap-2.5 mt-1">
                      {allQuests.map((quest) => (
                        <button
                          key={quest.id}
                          onClick={() => {
                            sound.playClick();
                            setSelectedJournalQuestId(quest.id);
                          }}
                          className="w-full stardew-quest-bar rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between cursor-pointer group text-left transition-transform hover:scale-[1.01] active:scale-[0.99]"
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            {/* Dark Brown Exclamation Mark in Left Slot */}
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center bg-[#fdf0d5] border-2 border-[#5c2a08] shrink-0 shadow-xs">
                              <span className="font-serif font-black text-[#4a1d04] text-sm sm:text-base leading-none">!</span>
                            </div>

                            {/* Quest Title */}
                            <span className="font-stardew font-bold text-xs sm:text-sm md:text-base text-[#3b1704] truncate tracking-wide">
                              {quest.title}
                            </span>
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center gap-2 shrink-0">
                            {quest.isCompleted ? (
                              <span className="font-pixel text-[8px] sm:text-[9px] px-2 py-0.5 rounded-md bg-emerald-800 border border-[#2b1003] text-emerald-100 font-bold uppercase shadow-xs">
                                Selesai ✓
                              </span>
                            ) : quest.isTurnedIn ? (
                              <span className="font-pixel text-[8px] sm:text-[9px] px-2 py-0.5 rounded-md bg-teal-800 border border-[#2b1003] text-teal-100 font-bold uppercase shadow-xs">
                                Diserahkan
                              </span>
                            ) : quest.isCollected ? (
                              <span className="font-pixel text-[8px] sm:text-[9px] px-2 py-0.5 rounded-md bg-amber-600 border border-[#2b1003] text-amber-100 font-bold uppercase animate-pulse shadow-xs">
                                Item di Tas!
                              </span>
                            ) : (
                              <span className="font-pixel text-[8px] sm:text-[9px] px-2 py-0.5 rounded-md bg-[#8d4715] border border-[#2b1003] text-amber-100 font-bold uppercase shadow-xs">
                                {quest.badge || 'Sedang Dicari'}
                              </span>
                            )}
                            <ChevronRight className="w-4 h-4 text-[#5c2a08] group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </button>
                      ))}

                      {/* Empty slot placeholder bars to match Stardew Valley screenshot */}
                      {Array.from({ length: Math.max(0, 5 - allQuests.length) }).map((_, idx) => (
                        <div
                          key={`empty_${idx}`}
                          className="w-full h-11 sm:h-12 rounded-xl stardew-empty-slot flex items-center px-4 opacity-50"
                        >
                          <span className="font-serif font-bold text-[#6d3512] text-sm opacity-60">!</span>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Close Bar */}
                    <div className="mt-2 pt-2 border-t-2 border-[#5c2a08]/30 flex items-center justify-between text-[10px] sm:text-xs text-[#4a1d04] font-stardew">
                      <span>Tekan [ESC] atau [J] untuk kembali ke kebun biara</span>
                      <button
                        onClick={() => {
                          sound.playClick();
                          setIsInventoryOpen(false);
                          setSelectedJournalQuestId(null);
                        }}
                        className="px-4 py-1.5 rounded-lg bg-[#b45309] hover:bg-[#853706] text-[#fffbeb] font-stardew font-bold cursor-pointer active:translate-y-0.5 border border-[#3b1704]"
                      >
                        Tutup
                      </button>
                    </div>
                  </>
                ) : (
                  /* ================= 2. POPUP DETAIL VIEW (Exact Stardew Valley Layout) ================= */
                  <div className="stardew-quest-parchment rounded-xl p-4 sm:p-6 text-[#3b1704] flex flex-col justify-between min-h-[320px] sm:min-h-[360px] animate-fade-in">
                    <div className="space-y-4">
                      {/* Centered Quest Title (Stardew Style) */}
                      <div className="text-center border-b border-[#a85817]/30 pb-2">
                        <h2 className="font-stardew font-bold text-lg sm:text-xl md:text-2xl text-[#3b1704] tracking-wide">
                          {selectedQuest.title}
                        </h2>
                        {selectedQuest.subtitle && (
                          <p className="font-serif italic text-xs text-[#78350f] mt-0.5">
                            {selectedQuest.subtitle}
                          </p>
                        )}
                      </div>

                      {/* Story / Narrative Description (Clean, warm, readable, matching Stardew body text) */}
                      <p className="text-xs sm:text-sm md:text-base text-[#3b1704] leading-relaxed font-serif text-justify sm:text-left px-1">
                        {selectedQuest.description}
                      </p>

                      {/* Quest Giver & Target Item Card */}
                      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-[#f5dfb8]/70 border border-[#a85817]/40 text-xs">
                        <div className="flex items-center gap-2.5">
                          {selectedQuest.giverPortrait && (
                            <img
                              src={selectedQuest.giverPortrait}
                              alt={selectedQuest.giver}
                              className="w-9 h-9 rounded-lg object-contain bg-[#e8be89] border border-[#5c2a08] shrink-0 p-0.5"
                            />
                          )}
                          <div>
                            <div className="font-stardew font-bold text-[#4a1d04] text-xs sm:text-sm">
                              Pemberi Misi: {selectedQuest.giver}
                            </div>
                            <div className="text-[10px] sm:text-[11px] text-[#78350f] font-pixel">
                              {selectedQuest.giverRole}
                            </div>
                          </div>
                        </div>

                        {selectedQuest.targetItem && (
                          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#fff3db] border border-[#8a4313]/60 shadow-xs">
                            <img
                              src={selectedQuest.targetItem.iconSrc}
                              alt={selectedQuest.targetItem.name}
                              className="w-5 h-5 object-contain"
                            />
                            <div className="text-left">
                              <span className="font-stardew font-bold text-[11px] text-[#4a1d04] block leading-tight">
                                {selectedQuest.targetItem.name}
                              </span>
                              <span className="font-pixel text-[8px] text-[#78350f]">
                                {selectedQuest.isCollected || selectedQuest.isTurnedIn || selectedQuest.isCompleted ? '✓ Ditemukan' : 'Hilang di Kebun'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Objectives Checklist with Stardew Valley Golden Arrowheads ▶ */}
                      <div className="space-y-2.5 pt-1 px-1">
                        <div className="font-stardew text-xs sm:text-sm text-[#4a1d04] font-bold uppercase tracking-wider mb-2">
                          Sasaran Misi:
                        </div>
                        {selectedQuest.checklist.map((chk, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm md:text-base leading-snug">
                            {chk.done ? (
                              <span className="text-emerald-700 font-bold shrink-0 text-base leading-none">✓</span>
                            ) : (
                              <span className="text-[#b45309] font-black shrink-0 text-xs sm:text-sm leading-none mt-0.5">▶</span>
                            )}
                            <span className={chk.done ? 'line-through text-emerald-950/65 font-sans font-medium' : 'text-[#3b1704] font-sans font-semibold'}>
                              {chk.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Navigation & Status Bar */}
                    <div className="mt-5 pt-3 border-t border-[#a85817]/30 flex items-center justify-between">
                      {/* Left: Back to Journal List button */}
                      <button
                        onClick={() => {
                          sound.playClick();
                          setSelectedJournalQuestId(null);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e2ad71]/50 hover:bg-[#e2ad71]/80 text-[#3b1704] font-stardew font-bold text-xs sm:text-sm border border-[#8a4313]/60 cursor-pointer active:translate-y-0.5 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 stroke-[3]" />
                        Kembali ke Daftar
                      </button>

                      {/* Right: Quest Status Badge */}
                      <div>
                        {selectedQuest.isCompleted ? (
                          <span className="font-pixel text-[9px] sm:text-[10px] px-3 py-1 rounded-md bg-emerald-800 border border-[#2b1003] text-emerald-100 font-bold uppercase shadow-xs">
                            Misi Selesai ✓
                          </span>
                        ) : selectedQuest.isTurnedIn ? (
                          <span className="font-pixel text-[9px] sm:text-[10px] px-3 py-1 rounded-md bg-teal-800 border border-[#2b1003] text-teal-100 font-bold uppercase shadow-xs">
                            Diserahkan ke Pemberi
                          </span>
                        ) : selectedQuest.isCollected ? (
                          <span className="font-pixel text-[9px] sm:text-[10px] px-3 py-1 rounded-md bg-amber-600 border border-[#2b1003] text-amber-100 font-bold uppercase animate-pulse shadow-xs">
                            Item Siap Diserahkan!
                          </span>
                        ) : (
                          <span className="font-pixel text-[9px] sm:text-[10px] px-3 py-1 rounded-md bg-[#8d4715] border border-[#2b1003] text-amber-100 font-bold uppercase shadow-xs">
                            {selectedQuest.badge || 'Sedang Berjalan'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 4a. Welcome & First Quest Onboarding Modal (Step 1: Sambutan Datang di 1865 & Misi Pertama, Step 2: Petunjuk Tanda Seru ! di Kepala NPC) */}
      {welcomeStep && (
        <div 
          className={`fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center ${isCompactLandscape ? 'p-1.5 overflow-y-auto' : 'p-3 sm:p-4'} animate-fade-in select-none`}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`w-full ${isCompactLandscape ? 'max-w-md max-h-[96vh] overflow-y-auto p-1.5' : 'max-w-lg p-2 sm:p-2.5'} rounded-2xl sm:rounded-3xl border-4 border-[#3e1f0b] bg-[#b07844] shadow-[0_16px_40px_rgba(0,0,0,0.8)] relative animate-scale-up modal-landscape-compact`}
          >
            <div className={`w-full rounded-xl sm:rounded-2xl bg-[#fae8b6] border-2 border-[#834f24] ${isCompactLandscape ? 'p-2.5 sm:p-3' : 'p-4 sm:p-6'} text-center text-[#2a1306] flex flex-col items-center`}>
              
              {/* Wooden [X] Close Button */}
              <button
                onClick={() => {
                  sound.playClick();
                  setWelcomeStep(null);
                  try {
                    sessionStorage.setItem('genetic_odyssey_rpg_welcome_seen', 'true');
                  } catch (e) {}
                }}
                className={`absolute ${isCompactLandscape ? 'top-2 right-2 w-6 h-6 text-xs' : 'top-4 sm:top-5 right-4 sm:right-5 w-7 h-7 sm:w-8 sm:h-8 text-sm sm:text-base'} rounded-lg bg-[#b07844] hover:bg-[#c98e57] active:bg-[#976435] border-2 border-[#3e1f0b] shadow-[2px_2px_0px_#3e1f0b] text-[#2a1306] font-mono font-black flex items-center justify-center cursor-pointer transition-all z-10`}
                title="Tutup Sambutan"
              >
                ✕
              </button>

              {welcomeStep === 1 ? (
                /* ================= STEP 1: SAMBUTAN & MISI PERTAMA ================= */
                <div className="w-full flex flex-col items-center">
                  {/* Top Badge: 1865 */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#361706] border border-[#ca7c38] text-[8px] sm:text-[9.5px] font-pixel text-[#fef08a] uppercase tracking-wider mb-2 font-bold shadow-xs">
                    <span>⏳</span>
                    <span>TAHUN 1865 • KEBUN BIARA BRNO</span>
                  </div>

                  {/* Main Title */}
                  <h2 className={`font-pixel ${isCompactLandscape ? 'text-sm sm:text-base' : 'text-base sm:text-xl md:text-2xl'} font-black text-[#2b1103] leading-tight mb-1`}>
                    SELAMAT DATANG DI TAHUN 1865!
                  </h2>
                  <p className={`font-pixel ${isCompactLandscape ? 'text-[8px] mb-2' : 'text-[9px] sm:text-[10.5px] mb-3'} text-[#78350f] font-bold`}>
                    Kamu telah terlempar ke masa lalu di Kebun Biara Santo Thomas!
                  </p>

                  {/* Hero Icons Row */}
                  <div className={`flex items-center justify-center gap-2.5 ${isCompactLandscape ? 'mb-2' : 'mb-3.5'}`}>
                    <div className={`${isCompactLandscape ? 'w-9 h-9 text-lg' : 'w-11 h-11 sm:w-12 sm:h-12 text-2xl'} rounded-xl bg-[#ecd8b0] border-2 border-[#834f24] flex items-center justify-center shadow-xs`}>
                      🌱
                    </div>
                    <div className={`${isCompactLandscape ? 'w-9 h-9 text-lg' : 'w-11 h-11 sm:w-12 sm:h-12 text-2xl'} rounded-xl bg-[#ecd8b0] border-2 border-[#834f24] flex items-center justify-center shadow-xs`}>
                      📜
                    </div>
                    <div className={`${isCompactLandscape ? 'w-9 h-9 text-lg' : 'w-11 h-11 sm:w-12 sm:h-12 text-2xl'} rounded-xl bg-[#ecd8b0] border-2 border-[#834f24] flex items-center justify-center shadow-xs`}>
                      🔬
                    </div>
                  </div>

                  {/* Mission 1 Golden Box */}
                  <div className={`w-full rounded-xl bg-gradient-to-b from-[#fffbeb] to-[#fef3c7] border-2 border-[#d97706] ${isCompactLandscape ? 'p-2 mb-2' : 'p-3 sm:p-4 mb-3'} text-left shadow-xs`}>
                    <div className="flex items-center gap-2 mb-1.5 border-b border-[#d97706]/30 pb-1.5">
                      <div className="w-5 h-5 rounded bg-[#d97706] text-white flex items-center justify-center font-pixel font-black text-[10px]">
                        ★
                      </div>
                      <div>
                        <span className="font-pixel text-[7px] sm:text-[8px] text-[#92400e] uppercase tracking-wider block font-bold">
                          ORIENTASI RISET AWAL
                        </span>
                        <h3 className={`font-pixel ${isCompactLandscape ? 'text-[10px]' : 'text-xs sm:text-sm'} font-black text-[#78350f] uppercase`}>
                          MISI PERTAMA: BERKENALAN DENGAN SEMUA ORANG
                        </h3>
                      </div>
                    </div>

                    <p className={`font-pixel ${isCompactLandscape ? 'text-[8px] leading-snug mb-1.5' : 'text-[9px] sm:text-[10.5px] leading-relaxed mb-2'} text-[#451a03]`}>
                      Sebelum memulai eksperimen persilangan genetika, berjalanlah mengelilingi kebun biara dan berkenalan dengan seluruh warga & rekan peneliti di sini.
                    </p>

                    {/* Target NPCs Chips */}
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {[
                        { name: 'Bruder Thomas', role: 'Kebun Ercis' },
                        { name: 'Prof. Rosalind', role: 'Lab DNA' },
                        { name: 'Gigi si Mekanik', role: 'Mesin Gamet' },
                        { name: 'Pater Mendel', role: 'Lab Punnett' },
                        { name: 'Pak Barnaby', role: 'Panen Sayur' }
                      ].map((t, idx) => {
                        const isDone = (greetedNpcs || []).some(id => id.includes(t.name.split(' ')[0].toLowerCase()) || (idx === 0 && id === 'npc_1_monk') || (idx === 1 && id === 'npc_2_geneticist') || (idx === 2 && id === 'npc_3_mechanic') || (idx === 3 && id === 'npc_4_mendel') || (idx === 4 && id === 'npc_5_farmer'));
                        return (
                          <span 
                            key={idx} 
                            className={`font-pixel text-[7.5px] sm:text-[8.5px] px-1.5 py-0.5 rounded border ${
                              isDone 
                                ? 'bg-emerald-100 border-emerald-500 text-emerald-800' 
                                : 'bg-[#fae8b6] border-[#d97706]/50 text-[#78350f]'
                            } font-bold flex items-center gap-1`}
                          >
                            <span>{isDone ? '✓' : '👤'}</span>
                            <span>{t.name}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Progress Status */}
                  <div className={`w-full flex items-center justify-between font-pixel ${isCompactLandscape ? 'text-[8px] mb-2' : 'text-[9px] sm:text-[10px] mb-3'} text-[#78350f] font-bold px-1`}>
                    <span>Status Perkenalan:</span>
                    <span className="text-[#052e16] bg-[#86efac] px-2 py-0.5 rounded border border-[#16a34a]">
                      {Math.min(5, (greetedNpcs || []).length)} / 5 Orang Ditemui
                    </span>
                  </div>

                  {/* Action Button: Lanjut ke Petunjuk Tanda Seru */}
                  <button
                    onClick={() => {
                      sound.playClick();
                      setWelcomeStep(2);
                    }}
                    className={`w-full ${isCompactLandscape ? 'py-2 px-3 text-[10px]' : 'py-2.5 sm:py-3 px-5 text-xs sm:text-sm'} bg-gradient-to-b from-[#ca7c38] to-[#9a531b] hover:brightness-110 active:translate-y-0.5 text-white font-pixel font-black uppercase tracking-wider rounded-xl border-2 border-[#361706] shadow-[0_3px_0_#2b1103] flex items-center justify-center gap-2 cursor-pointer transition`}
                  >
                    <span>LANJUT: LIHAT PETUNJUK TANDA SERU</span>
                    <span>➜</span>
                  </button>
                </div>
              ) : (
                /* ================= STEP 2: CARI TANDA SERU (!) DI ATAS KEPALA NPC ================= */
                <div className="w-full flex flex-col items-center">
                  {/* Top Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fef3c7] border border-[#d97706] text-[8px] sm:text-[9.5px] font-pixel text-[#b45309] uppercase tracking-wider mb-2 font-bold shadow-xs">
                    <Sparkles className="w-3 h-3 text-[#d97706] animate-pulse" />
                    <span>PETUNJUK EKSPLORASI PENTING</span>
                  </div>

                  {/* Main Title */}
                  <h2 className={`font-pixel ${isCompactLandscape ? 'text-sm sm:text-base' : 'text-base sm:text-xl md:text-2xl'} font-black text-[#2b1103] leading-tight mb-1`}>
                    CARI TANDA SERU (!) DI ATAS KEPALA NPC!
                  </h2>
                  <p className={`font-pixel ${isCompactLandscape ? 'text-[8px] mb-2' : 'text-[9px] sm:text-[10.5px] mb-3'} text-[#78350f] font-bold`}>
                    Karakter yang memiliki misi atau belum kamu ajak bicara ditandai tanda seru melayang.
                  </p>

                  {/* Big Animated Graphic: Floating Exclamation Mark Indicator */}
                  <div className={`w-full rounded-2xl bg-[#dfc597]/80 border-2 border-[#834f24]/50 ${isCompactLandscape ? 'p-2 my-1' : 'p-3 sm:p-4 my-2'} flex flex-col items-center justify-center relative overflow-hidden`}>
                    
                    {/* Overhead Animated Exclamation Point Mockup */}
                    <div className="flex flex-col items-center my-1 animate-bounce">
                      <div className="relative flex items-center justify-center">
                        {/* Glowing outer aura */}
                        <div className="w-10 h-10 rounded-full bg-amber-400/40 animate-ping absolute inset-0 m-auto" />
                        
                        {/* Golden Circle Bubble */}
                        <div className={`${isCompactLandscape ? 'w-8 h-8' : 'w-10 h-10 sm:w-11 sm:h-11'} rounded-full bg-gradient-to-b from-[#fef08a] to-[#facc15] border-3 border-[#78350f] shadow-[0_4px_12px_rgba(250,204,21,0.6)] flex items-center justify-center relative z-10`}>
                          <span className={`font-mono font-black ${isCompactLandscape ? 'text-xl' : 'text-2xl sm:text-3xl'} text-[#451a03] leading-none`}>!</span>
                        </div>
                      </div>
                      
                      {/* Mock Character Icon below it */}
                      <div className="mt-1 flex flex-col items-center">
                        <span className={isCompactLandscape ? "text-2xl" : "text-3xl"}>👨‍🌾</span>
                        <div className="mt-0.5 px-2 py-0.5 rounded bg-[#361706] text-[#fef08a] font-pixel text-[7.5px] sm:text-[8.5px] font-bold shadow-xs">
                          [E] Bicara • Bruder Thomas
                        </div>
                      </div>
                    </div>

                    <span className="font-pixel text-[8px] sm:text-[9.5px] text-[#78350f] font-black uppercase tracking-wider mt-1">
                      Tanda Seru Emas (!) Melayang di Atas Kepala Karakter
                    </span>
                  </div>

                  {/* 3 Step Interactive Instructions */}
                  <div className={`w-full space-y-1.5 text-left ${isCompactLandscape ? 'mb-2' : 'mb-3.5'}`}>
                    <div className="flex items-start gap-2 bg-[#ecd8b0] p-1.5 sm:p-2 rounded-xl border border-[#834f24]/30">
                      <div className="w-4.5 h-4.5 rounded-full bg-[#ca7c38] text-white flex items-center justify-center font-pixel font-bold text-[8.5px] flex-shrink-0 mt-0.5">
                        1
                      </div>
                      <p className="font-pixel text-[8px] sm:text-[9.5px] text-[#2b1103]">
                        <strong>Cari Tanda Seru (!):</strong> Berkelilinglah di kebun dan cari karakter dengan tanda seru melayang di atas kepalanya.
                      </p>
                    </div>

                    <div className="flex items-start gap-2 bg-[#ecd8b0] p-1.5 sm:p-2 rounded-xl border border-[#834f24]/30">
                      <div className="w-4.5 h-4.5 rounded-full bg-[#ca7c38] text-white flex items-center justify-center font-pixel font-bold text-[8.5px] flex-shrink-0 mt-0.5">
                        2
                      </div>
                      <p className="font-pixel text-[8px] sm:text-[9.5px] text-[#2b1103]">
                        <strong>Dekati Karakter:</strong> Dekati mereka hingga muncul balon interaksi bicara hijau/emas di atas karakternya.
                      </p>
                    </div>

                    <div className="flex items-start gap-2 bg-[#ecd8b0] p-1.5 sm:p-2 rounded-xl border border-[#834f24]/30">
                      <div className="w-4.5 h-4.5 rounded-full bg-[#ca7c38] text-white flex items-center justify-center font-pixel font-bold text-[8.5px] flex-shrink-0 mt-0.5">
                        3
                      </div>
                      <p className="font-pixel text-[8px] sm:text-[9.5px] text-[#2b1103]">
                        <strong>Tekan Bicara:</strong> Tekan tombol <span className="px-1 py-0.2 bg-[#596073] text-white rounded font-mono text-[8px]">E</span> / <span className="px-1 py-0.2 bg-[#596073] text-white rounded font-mono text-[8px]">SPASI</span> di Laptop, atau sentuh tombol <span className="px-1 py-0.2 bg-emerald-700 text-white rounded text-[8px]">[BICARA]</span> di HP untuk berdialog!
                      </p>
                    </div>
                  </div>

                  {/* Buttons Row */}
                  <div className="w-full flex items-center gap-2">
                    <button
                      onClick={() => {
                        sound.playClick();
                        setWelcomeStep(1);
                      }}
                      className={`px-3 py-2 bg-[#ecd8b0] hover:bg-[#dfc597] active:translate-y-0.5 text-[#361706] font-pixel ${isCompactLandscape ? 'text-[9px]' : 'text-xs'} font-bold uppercase rounded-xl border-2 border-[#834f24] cursor-pointer`}
                    >
                      Kembali
                    </button>

                    <button
                      onClick={() => {
                        sound.playFanfare();
                        setWelcomeStep(null);
                        try {
                          sessionStorage.setItem('genetic_odyssey_rpg_welcome_seen', 'true');
                          localStorage.setItem('genetic_odyssey_rpg_controls_tutorial_seen', 'true');
                        } catch (e) {}
                        triggerGuidanceBanner(7000);
                      }}
                      className={`flex-1 py-2 sm:py-2.5 px-4 bg-gradient-to-b from-[#15803d] to-[#14532d] hover:brightness-110 active:translate-y-0.5 text-[#bbf7d0] font-pixel ${isCompactLandscape ? 'text-[10px]' : 'text-xs sm:text-sm'} font-black uppercase tracking-wider rounded-xl border-2 border-[#092213] shadow-[0_2.5px_0_#06150c] flex items-center justify-center gap-1.5 cursor-pointer transition`}
                    >
                      <span>SIAP, MULAI JELAJAH KEBUN! 🌿</span>
                    </button>
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* 4. Controls Tutorial Popup Modal (Auto-detect PC / Laptop WASD vs HP / Mobile Analog) */}
      {showControlsTutorial && (
        <div 
          onClick={() => {
            setShowControlsTutorial(false);
            try { localStorage.setItem('genetic_odyssey_rpg_controls_tutorial_seen', 'true'); } catch(e) {}
          }}
          className={`fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center ${isCompactLandscape ? 'p-1.5 overflow-y-auto' : 'p-3 sm:p-4'} animate-fade-in select-none`}
        >
          {/* Retro Pixel Wooden Frame (Replicating user screenshot) */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`w-full ${isCompactLandscape ? 'max-w-lg max-h-[95vh] overflow-y-auto p-1.5' : 'max-w-sm sm:max-w-md md:max-w-lg p-2 sm:p-2.5'} rounded-2xl sm:rounded-3xl border-4 border-[#3e1f0b] bg-[#b07844] shadow-[0_12px_32px_rgba(0,0,0,0.75)] relative animate-scale-up modal-landscape-compact`}
          >
            {/* Inner Parchment Card */}
            <div className={`w-full rounded-xl sm:rounded-2xl bg-[#ecd8b0] border-2 border-[#834f24] ${isCompactLandscape ? 'p-2.5 sm:p-3' : 'p-4 sm:p-6'} text-center text-[#2a1306] flex flex-col items-center`}>
              
              {/* Wooden [X] Close Button at Top-Right */}
              <button
                onClick={() => {
                  sound.playClick();
                  setShowControlsTutorial(false);
                  try { localStorage.setItem('genetic_odyssey_rpg_controls_tutorial_seen', 'true'); } catch(e) {}
                }}
                className={`absolute ${isCompactLandscape ? 'top-2 right-2 w-6 h-6 text-xs' : 'top-4 sm:top-5 right-4 sm:right-5 w-7 h-7 sm:w-8 sm:h-8 text-sm sm:text-base'} rounded-lg bg-[#b07844] hover:bg-[#c98e57] active:bg-[#976435] border-2 border-[#3e1f0b] shadow-[2px_2px_0px_#3e1f0b] text-[#2a1306] font-mono font-black flex items-center justify-center cursor-pointer transition-all z-10`}
                title="Tutup Panduan"
              >
                ✕
              </button>

              {/* Title based on Device */}
              <div className={`${isCompactLandscape ? 'mb-1.5 pr-6' : 'mb-3 sm:mb-4 pr-6 sm:pr-8'}`}>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#834f24]/15 border border-[#834f24]/30 text-[8px] sm:text-[9px] font-pixel text-[#5c3010] uppercase tracking-wider mb-1 font-bold">
                  {isMobileDevice ? '📱 Terdeteksi: Ponsel / Layar Sentuh (Mobile)' : '💻 Terdeteksi: Laptop / Komputer (PC)'}
                </div>
                <h2 className={`font-pixel ${isCompactLandscape ? 'text-xs sm:text-sm' : 'text-sm sm:text-base md:text-lg'} font-black text-[#2a1306] leading-tight`}>
                  {isMobileDevice 
                    ? 'Gunakan Analog di Layar untuk menggerakkan Karaktermu'
                    : 'Gunakan WASD di Keyboard untuk menggerakkan Karaktermu'}
                </h2>
              </div>

              {/* Center Graphic Illustration */}
              {!isMobileDevice ? (
                /* DESKTOP KEYBOARD DIAGRAM (WASD 3D Pixel Style matching user screenshot) */
                <div className={`${isCompactLandscape ? 'my-1 p-2' : 'my-1.5 p-3 sm:p-4'} rounded-2xl bg-[#dfc597]/75 border-2 border-[#834f24]/40 w-full flex flex-col items-center`}>
                  
                  {/* WASD Cluster */}
                  <div className={`flex flex-col items-center gap-1 ${isCompactLandscape ? 'my-1' : 'my-2'}`}>
                    {/* W Key */}
                    <div className="relative flex flex-col items-center">
                      <span className={`${isCompactLandscape ? 'text-[8px] mb-0.5' : 'text-[9px] sm:text-[10px] mb-1'} font-pixel text-[#4a2408] font-bold flex items-center gap-0.5`}>
                        ↑ Atas
                      </span>
                      <div className={`${isCompactLandscape ? 'w-8 h-8 sm:w-9 sm:h-9 text-sm' : 'w-11 h-11 sm:w-13 sm:h-13 text-lg sm:text-xl'} rounded-xl bg-[#596073] border-2 border-[#2b2e38] shadow-[0_3px_0_#1e2027] text-white font-mono font-black flex items-center justify-center`}>
                        W
                      </div>
                    </div>

                    {/* A, S, D Row */}
                    <div className="flex items-center gap-1.5 sm:gap-2.5 mt-0.5">
                      {/* A Key */}
                      <div className="relative flex flex-col items-center">
                        <div className={`${isCompactLandscape ? 'w-8 h-8 sm:w-9 sm:h-9 text-sm' : 'w-11 h-11 sm:w-13 sm:h-13 text-lg sm:text-xl'} rounded-xl bg-[#596073] border-2 border-[#2b2e38] shadow-[0_3px_0_#1e2027] text-white font-mono font-black flex items-center justify-center`}>
                          A
                        </div>
                        <span className={`${isCompactLandscape ? 'text-[7.5px]' : 'text-[8.5px] sm:text-[9.5px]'} font-pixel text-[#4a2408] font-bold mt-0.5`}>
                          ← Kiri
                        </span>
                      </div>

                      {/* S Key */}
                      <div className="relative flex flex-col items-center">
                        <div className={`${isCompactLandscape ? 'w-8 h-8 sm:w-9 sm:h-9 text-sm' : 'w-11 h-11 sm:w-13 sm:h-13 text-lg sm:text-xl'} rounded-xl bg-[#596073] border-2 border-[#2b2e38] shadow-[0_3px_0_#1e2027] text-white font-mono font-black flex items-center justify-center`}>
                          S
                        </div>
                        <span className={`${isCompactLandscape ? 'text-[7.5px]' : 'text-[8.5px] sm:text-[9.5px]'} font-pixel text-[#4a2408] font-bold mt-0.5`}>
                          ↓ Bawah
                        </span>
                      </div>

                      {/* D Key */}
                      <div className="relative flex flex-col items-center">
                        <div className={`${isCompactLandscape ? 'w-8 h-8 sm:w-9 sm:h-9 text-sm' : 'w-11 h-11 sm:w-13 sm:h-13 text-lg sm:text-xl'} rounded-xl bg-[#596073] border-2 border-[#2b2e38] shadow-[0_3px_0_#1e2027] text-white font-mono font-black flex items-center justify-center`}>
                          D
                        </div>
                        <span className={`${isCompactLandscape ? 'text-[7.5px]' : 'text-[8.5px] sm:text-[9.5px]'} font-pixel text-[#4a2408] font-bold mt-0.5`}>
                          → Kanan
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Interaction Keys */}
                  <div className={`${isCompactLandscape ? 'mt-2 pt-1.5' : 'mt-4 pt-3'} border-t border-[#834f24]/30 w-full flex flex-wrap justify-center sm:justify-around gap-2 text-left`}>
                    <div className="flex items-center gap-1.5 bg-[#ecd8b0] px-2 py-0.5 rounded-lg border border-[#834f24]/30">
                      <span className="px-1.5 py-0.2 rounded bg-[#596073] border border-[#2b2e38] text-white font-mono font-black text-[9px]">
                        E
                      </span>
                      <span className="font-pixel text-[8px] sm:text-[9px] text-[#4a2408] font-bold">
                        Bicara & Ambil
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#ecd8b0] px-2 py-0.5 rounded-lg border border-[#834f24]/30">
                      <span className="px-1.5 py-0.2 rounded bg-[#596073] border border-[#2b2e38] text-white font-mono font-black text-[9px]">
                        SPASI
                      </span>
                      <span className="font-pixel text-[8px] sm:text-[9px] text-[#4a2408] font-bold">
                        Aksi / Lab
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* MOBILE ANALOG DIAGRAM */
                <div className={`${isCompactLandscape ? 'my-1 p-2' : 'my-1.5 p-3 sm:p-4'} rounded-2xl bg-[#dfc597]/75 border-2 border-[#834f24]/40 w-full flex flex-col items-center`}>
                  
                  {/* Visual Analog Diagram */}
                  <div className={`relative ${isCompactLandscape ? 'w-20 h-20 my-1' : 'w-28 h-28 sm:w-32 sm:h-32 my-2'} rounded-full border-3 border-[#3e1f0b] bg-[#1e293b]/85 shadow-inner flex items-center justify-center`}>
                    <div className="absolute top-1 text-amber-300 font-pixel text-[8px] font-bold">▲ Atas</div>
                    <div className="absolute bottom-1 text-amber-300 font-pixel text-[8px] font-bold">▼ Bawah</div>
                    <div className="absolute left-1 text-amber-300 font-pixel text-[8px] font-bold">◀ Kiri</div>
                    <div className="absolute right-1 text-amber-300 font-pixel text-[8px] font-bold">▶ Kanan</div>
                    <div className={`${isCompactLandscape ? 'w-9 h-9' : 'w-13 h-13'} rounded-full border-2 border-amber-200 bg-gradient-to-b from-amber-400 to-amber-700 shadow-md flex items-center justify-center animate-pulse`}>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-100" />
                    </div>
                  </div>

                  <p className={`font-pixel ${isCompactLandscape ? 'text-[8px]' : 'text-[9px] sm:text-[10px]'} text-[#4a2408] font-bold mt-1`}>
                    Sentuh dan geser Analog di kiri bawah layar untuk menggerakkan karakter
                  </p>

                  {/* Mobile Action Buttons */}
                  <div className={`${isCompactLandscape ? 'mt-1.5 pt-1.5' : 'mt-3 pt-3'} border-t border-[#834f24]/30 w-full flex justify-around gap-2`}>
                    <div className="flex items-center gap-1.5 bg-[#ecd8b0] px-2 py-0.5 rounded-lg border border-[#834f24]/30">
                      <span className="w-6 h-6 rounded-md bg-emerald-700 border border-emerald-950 text-white font-pixel font-black text-[8px] flex items-center justify-center shadow-xs">
                        [E]
                      </span>
                      <span className="font-pixel text-[8px] text-[#4a2408] font-bold">
                        Bicara & Ambil
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#ecd8b0] px-2 py-0.5 rounded-lg border border-[#834f24]/30">
                      <span className="w-6 h-6 rounded-md bg-amber-600 border border-amber-950 text-white font-pixel font-black text-[8px] flex items-center justify-center shadow-xs">
                        [▶]
                      </span>
                      <span className="font-pixel text-[8px] text-[#4a2408] font-bold">
                        Aksi / Lab
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Subtitle / Objective Text (matching screenshot style) */}
              <p className={`font-pixel ${isCompactLandscape ? 'text-[8px] mt-1' : 'text-[10px] sm:text-xs mt-2'} text-[#5c3010] font-bold`}>
                {isMobileDevice 
                  ? 'Cobalah dengan menggeser analog virtual di kiri bawah layar ke arah rekan terdekat!' 
                  : 'Cobalah dengan bergerak ke arah rekan atau meja riset terdekat!'}
              </p>

              {/* Switch Mode & Start Button */}
              <div className={`${isCompactLandscape ? 'mt-2 pt-1.5' : 'mt-3.5 pt-2'} flex flex-col sm:flex-row items-center gap-2 w-full justify-between border-t border-[#834f24]/30`}>
                <button
                  onClick={() => {
                    sound.playClick();
                    setIsMobileDevice(prev => !prev);
                  }}
                  className={`font-pixel ${isCompactLandscape ? 'text-[8px]' : 'text-[9px] sm:text-[10px]'} text-[#6e3913] hover:text-[#2a1306] underline cursor-pointer`}
                >
                  {isMobileDevice 
                    ? 'Lihat Panduan Keyboard Laptop (WASD) 💻' 
                    : 'Lihat Panduan Analog Layar HP 📱'}
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setShowControlsTutorial(false);
                    try { localStorage.setItem('genetic_odyssey_rpg_controls_tutorial_seen', 'true'); } catch(e) {}
                  }}
                  className={`w-full sm:w-auto ${isCompactLandscape ? 'px-3.5 py-1.5 text-[10px] rounded-lg' : 'px-5 py-2.5 text-xs sm:text-sm rounded-xl'} bg-gradient-to-b from-[#15803d] to-[#14532d] hover:brightness-110 active:translate-y-0.5 text-[#bbf7d0] font-pixel font-black tracking-wider border-2 border-[#092213] shadow-[0_2px_0_#06150c] cursor-pointer`}
                >
                  MENGERTI & MULAI BERPETUALANG!
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PixelRpgWorld;
