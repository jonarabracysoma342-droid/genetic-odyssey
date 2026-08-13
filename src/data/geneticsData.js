// Genetics Content & Game Configuration Data for Genetic Odyssey: Mendel's Legacy

export const MAP_LOCATIONS = [
  {
    id: 'ruma-mendel',
    name: 'Rumah Mendel',
    description: 'Tempat lahirnya ilmu genetika modern. Pelajari dasar-dasar pewarisan sifat.',
    stageId: 1,
    icon: 'Home',
    color: 'from-amber-500 to-yellow-600',
    starsRequired: 0,
  },
  {
    id: 'kebun-kacang',
    name: 'Kebun Kacang',
    description: 'Kebun percobaan persilangan tanaman ercis (Pisum sativum).',
    stageId: 2,
    icon: 'Sprout',
    color: 'from-emerald-500 to-green-600',
    starsRequired: 2,
  },
  {
    id: 'rumah-alica',
    name: 'Rumah Alica',
    description: 'Pusat penelitian variasi sifat makhluk hidup dan gametogenesis.',
    stageId: 3,
    icon: 'Dna',
    color: 'from-cyan-500 to-blue-600',
    starsRequired: 5,
  },
  {
    id: 'laboratorium',
    name: 'Laboratorium Punnett',
    description: 'Lab eksperimen persilangan monohibrid dan hukum segregasi.',
    stageId: 4,
    icon: 'FlaskConical',
    color: 'from-purple-500 to-indigo-600',
    starsRequired: 8,
  },
  {
    id: 'pusat-penelitian',
    name: 'Pusat Penelitian',
    description: 'Fasilitas canggih persilangan dihibrid dan evaluasi mutasi genetik.',
    stageId: 6,
    icon: 'Microscope',
    color: 'from-pink-500 to-rose-600',
    starsRequired: 12,
  },
  {
    id: 'hall-of-genetics',
    name: 'Hall of Genetics',
    description: 'Arena evaluasi akhir dan tantangan ilmuwan Dr. Chaos!',
    stageId: 8,
    icon: 'Crown',
    color: 'from-amber-400 via-rose-500 to-purple-600',
    starsRequired: 16,
  }
];

export const STAGES = [
  {
    id: 1,
    name: 'Stage 1 – Mystery Garden',
    title: 'Taman Misteri',
    location: 'Rumah Mendel',
    topic: 'Pengenalan Sifat & Fenotipe Dasar',
    missionText: 'Identifikasi dan temukan tanaman ercis di kebun berdasarkan karakteristik fisik (fenotipe) seperti warna mahkota bunga dan kehalusan kulit biji.',
    guideText: 'Perhatikan ciri-ciri yang tampak (fenotipe) seperti warna bunga dan bentuk biji.',
    learningOutput: 'Pemain memahami bahwa setiap organisme memiliki sifat fisik yang dapat diamati (fenotipe).',
    badge: 'Detektif Sifat',
    bloomCode: 'C1',
    bloomName: 'Mengingat',
    bloomStyle: 'bg-sky-50 border-sky-200 text-sky-700'
  },
  {
    id: 2,
    name: 'Stage 2 – Gene Builder',
    title: 'Penyusun Gen',
    location: 'Kebun Kacang',
    topic: 'Genotipe & Alel Dominan/Resesif',
    missionText: 'Susunlah kombinasi huruf simbol genotipe (homozigot dominan, heterozigot, atau homozigot resesif) untuk merepresentasikan kode genetik tanaman.',
    guideText: 'Alel Dominan ditulis dengan HURUF BESAR (AA/A), Alel Resesif dengan huruf kecil (aa/a).',
    learningOutput: 'Pemain memahami penulisan genotipe homozigot dominan (AA), heterozigot (Aa), dan homozigot resesif (aa).',
    badge: 'Arsitek Gen',
    bloomCode: 'C2',
    bloomName: 'Memahami',
    bloomStyle: 'bg-indigo-50 border-indigo-200 text-indigo-700'
  },
  {
    id: 3,
    name: 'Stage 3 – Gamete Factory',
    title: 'Pabrik Gamet',
    location: 'Rumah Alica',
    topic: 'Pembentukan Gamet & Hukum Segregasi',
    missionText: 'Terapkan Hukum Mendel I untuk memisahkan alel berpasangan dari sel diploid induk menjadi sel gamet haploid yang siap untuk persilangan.',
    guideText: 'Hukum Segregasi: Setiap pasangan alel akan berpisah secara bebas saat pembentukan gamet.',
    learningOutput: 'Pemain memahami bahwa setiap gamet hanya membawa SATU alel dari setiap pasangan gen.',
    badge: 'Master Gamet',
    bloomCode: 'C3',
    bloomName: 'Menerapkan',
    bloomStyle: 'bg-purple-50 border-purple-200 text-purple-700'
  },
  {
    id: 4,
    name: 'Stage 4 – Punnett Laboratory',
    title: 'Laboratorium Punnett',
    location: 'Laboratorium Punnett',
    topic: 'Persilangan Monohibrid & Kisi Punnett',
    missionText: 'Analisis persilangan satu sifat beda (monohibrid) dengan memasukkan alel gamet ke dalam kisi Punnett Square dan memprediksi genotipe keturunan.',
    guideText: 'Gabungkan alel baris dan kolom untuk mempredikasi genotipe keturunan (F1 & F2).',
    learningOutput: 'Pemain menguasai pembuatan Punnett Square monohibrid (1 sifat beda).',
    badge: 'Ahli Punnett',
    bloomCode: 'C4',
    bloomName: 'Menganalisis',
    bloomStyle: 'bg-emerald-50 border-emerald-200 text-emerald-700'
  },
  {
    id: 5,
    name: 'Stage 5 – Harvest Challenge',
    title: 'Tantangan Panen',
    location: 'Laboratorium Punnett',
    topic: 'Prediksi Fenotipe & Evaluasi Rasio',
    missionText: 'Evaluasi kesesuaian fisik hasil persilangan tanaman ercis di kebun, lalu panen buahnya sesuai rasio fenotipe teoritis Hukum Mendel (3:1).',
    guideText: 'Pada persilangan monohibrid dominan penuh (Pp x Pp), rasio fenotipe keturunan adalah 3 : 1.',
    learningOutput: 'Pemain memahami hubungan genotipe dengan rasio fenotipe fisik yang dihasilkan.',
    badge: 'Raja Panen',
    bloomCode: 'C5',
    bloomName: 'Evaluasi',
    bloomStyle: 'bg-rose-50 border-rose-200 text-rose-700'
  },
  {
    id: 6,
    name: 'Stage 6 – Dihybrid Adventure',
    title: 'Petualangan Dihibrid',
    location: 'Pusat Penelitian',
    topic: 'Persilangan Dihibrid & Hukum Asortasi',
    missionText: 'Ciptakan papan persilangan dihibrid (dua sifat beda) 4x4 secara utuh dengan merumuskan gamet mandiri dan memetakan 16 kombinasi anakan.',
    guideText: 'Induk AaBb menghasilkan 4 jenis gamet: AB, Ab, aB, ab. Rasio fenotipe F2 adalah 9 : 3 : 3 : 1.',
    learningOutput: 'Pemain menguasai Hukum Asortasi Bebas Mendel pada persilangan dua sifat beda.',
    badge: 'Penjelajah Dihibrid',
    bloomCode: 'C6',
    bloomName: 'Menciptakan',
    bloomStyle: 'bg-amber-50 border-amber-200 text-amber-700 font-extrabold'
  }
];

export const GENOPEDIA_TERMS = [
  {
    term: 'Gen',
    category: 'Dasar',
    definition: 'Unit pewarisan sifat bagi organisme hidup yang terdapat dalam DNA kromosom.',
    example: 'Gen penentu warna bunga, gen penentu bentuk biji.'
  },
  {
    term: 'Alel',
    category: 'Dasar',
    definition: 'Bentuk alternatif dari suatu gen yang mengendalikan sifat yang sama.',
    example: 'Alel B (biji bulat) dan alel b (biji keriput).'
  },
  {
    term: 'Genotipe',
    category: 'Dasar',
    definition: 'Susunan genetik sebenarnya dari suatu individu yang dinyatakan dengan simbol huruf.',
    example: 'BB (homozigot dominan), Bb (heterozigot), bb (homozigot resesif).'
  },
  {
    term: 'Fenotipe',
    category: 'Dasar',
    definition: 'Sifat fisik atau karakteristik yang dapat diamati dari suatu organisme hasil ekspresi genotipe dan lingkungan.',
    example: 'Bunga berwarna ungu, biji berbentuk keriput, batang tinggi.'
  },
  {
    term: 'Dominan',
    category: 'Dasar',
    definition: 'Sifat alel yang menutupi ekspresi alel resesif pada kondisi heterozigot. Diberi simbol huruf KAPITAL.',
    example: 'Alel P (Warna Ungu) dominan terhadap alel p (Warna Putih).'
  },
  {
    term: 'Resesif',
    category: 'Dasar',
    definition: 'Sifat alel yang tertutupi oleh alel dominan dan hanya tampak jika berpasangan dengan alel resesif sejenis (homozigot resesif). Diberi simbol huruf kecil.',
    example: 'Sifat biji keriput (k) hanya muncul pada genotipe kk.'
  },
  {
    term: 'Homozigot',
    category: 'Dasar',
    definition: 'Pasangan alel yang identik untuk suatu sifat tertentu.',
    example: 'AA (homozigot dominan) atau aa (homozigot resesif).'
  },
  {
    term: 'Heterozigot',
    category: 'Dasar',
    definition: 'Pasangan alel yang berbeda untuk suatu sifat tertentu.',
    example: 'Aa (satu alel dominan A dan satu alel resesif a).'
  },
  {
    term: 'Gamet',
    category: 'Hukum Mendel',
    definition: 'Sel kelamin (sperma atau ovum) yang bersifat haploid (n) dan membawa 1 alel dari setiap pasangan gen.',
    example: 'Induk AaBb membentuk gamet AB, Ab, aB, dan ab.'
  },
  {
    term: 'Hukum Segregasi (Hukum Mendel I)',
    category: 'Hukum Mendel',
    definition: 'Hukum pemisahan bebas: Pada pembentukan gamet, pasangan alel berpisah secara bebas sehingga setiap gamet hanya menerima satu alel.',
    example: 'Genotipe Aa berpisah menjadi gamet A dan gamet a.'
  },
  {
    term: 'Hukum Asortasi (Hukum Mendel II)',
    category: 'Hukum Mendel',
    definition: 'Hukum pengelompokan bebas: Alel dari gen yang berbeda mengelompok secara bebas saat pembentukan gamet pada persilangan dihibrid.',
    example: 'Pasangan sifat tinggi/pendek mengelompok bebas dengan warna bunga.'
  },
  {
    term: 'Persilangan Monohibrid',
    category: 'Persilangan',
    definition: 'Persilangan antara dua individu yang memfokuskan pada SATU sifat beda.',
    example: 'Bunga ungu (PP) x Bunga putih (pp).'
  },
  {
    term: 'Persilangan Dihibrid',
    category: 'Persilangan',
    definition: 'Persilangan antara dua individu yang memfokuskan pada DUA sifat beda sekaligus.',
    example: 'Biji Bulat Kuning (BBKK) x Biji Keriput Hijau (bbkk).'
  },
  {
    term: 'Punnett Square (Tabel Punnett)',
    category: 'Persilangan',
    definition: 'Diagram berbentuk kisi yang digunakan untuk memprediksi kemungkinan genotipe dan fenotipe hasil persilangan.',
    example: 'Tabel 2x2 untuk monohibrid, Tabel 4x4 untuk dihibrid.'
  },
  {
    term: 'Rasio Genotipe',
    category: 'Persilangan',
    definition: 'Perbandingan jumlah kombinasi alel keturunan F2 pada persilangan.',
    example: 'Pada monohibrid Pp x Pp -> Rasio Genotipe PP : Pp : pp = 1 : 2 : 1.'
  },
  {
    term: 'Rasio Fenotipe',
    category: 'Persilangan',
    definition: 'Perbandingan wujud fisik keturunan F2 hasil persilangan.',
    example: 'Monohibrid dominan penuh -> 3 Ungu : 1 Putih (3 : 1). Dihibrid -> 9 : 3 : 3 : 1.'
  },
  {
    term: 'Intermediet',
    category: 'Persilangan',
    definition: 'Sifat keturunan heterozigot yang merupakan gabungan/campuran dari kedua sifat induk karena tidak ada alel yang benar-benar dominan.',
    example: 'Merah (MM) x Putih (mm) menghasilkan Merah Muda (Mm).'
  },
  {
    term: 'Mutasi Genetik',
    category: 'Evaluasi',
    definition: 'Perubahan pada urutan DNA atau struktur gen yang dapat menghasilkan variasi baru.',
    example: 'Perubahan susunan basa nitrogen yang memicu perubahan fenotipe.'
  }
];

export const BIOBOT_HINTS = {
  1: [
    'Fenotipe adalah sifat fisik yang bisa kamu lihat langsung!',
    'Klik tanaman yang memiliki warna bunga atau bentuk biji sesuai instruksi misi.',
    'Ingat: Bunga Ungu (U) dan Biji Bulat (B) biasanya merupakan sifat yang menonjol.'
  ],
  2: [
    'Alel Dominan selalu ditulis dengan HURUF BESAR (misal: A, P, B).',
    'Alel Resesif selalu ditulis dengan huruf kecil (misal: a, p, b).',
    'Induk Homozigot Dominan = AA, Heterozigot = Aa, Homozigot Resesif = aa.'
  ],
  3: [
    'Setiap sel gamet HANYA membawa 1 alel dari pasangan gen induk.',
    'Jika induk bergenotipe Aa, maka gamet yang terbentuk ada 2 jenis: Gamet A dan Gamet a.',
    'Hukum Mendel I menyatakan bahwa pasangan alel terpisah (segregasi) saat pembentukan sel kelamin.'
  ],
  4: [
    'Untuk mengisi kotak Punnett Square, gabungkan alel pada kolom atas dengan baris samping.',
    'Tuliskan alel dominan (huruf besar) terlebih dahulu di dalam kotak. Misal: P + p = Pp.',
    'Jika induk Pp x Pp, isi kotak adalah: PP, Pp, Pp, pp.'
  ],
  5: [
    'Perhatikan perbandingan 3 : 1 pada persilangan monohibrid dominan penuh.',
    '3 bagian menunjukkan fenotipe dominan (bunga ungu), 1 bagian menunjukkan fenotipe resesif (bunga putih).',
    'Hitung jumlah tanaman di ladang panen sesuai perbandingan tersebut!'
  ],
  6: [
    'Persilangan dihibrid memperhatikan 2 sifat beda sekaligus (misal AaBb).',
    'Gamet untuk AaBb dibentuk dengan memasangkan tiap alel: A+B=AB, A+b=Ab, a+B=aB, a+b=ab (total 4 gamet).',
    'Rasio fenotipe klasik F2 persilangan Dihibrid adalah 9 : 3 : 3 : 1.'
  ],
  7: [
    'Jebakan mutasi berisi miskonsepsi genetik yang sengaja disebar!',
    'Contoh salah: "AA menghasilkan gamet AA" -> SALAH, karena gamet bersifat haploid (hanya bawa A).',
    'Pilih pernyataan yang TIDAK SESUAI dengan hukum genetika.'
  ],
  8: [
    'Dr. Chaos sedang mengacak data persilangan!',
    'Periksa persilangan induk, kombinasi gamet, dan jawab pertanyaan rasio fenotipe dengan cepat.',
    'Gunakan tombol BioBot jika kamu butuh rumus darurat!'
  ]
};
