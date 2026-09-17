import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../services/sound';
import { 
  Sparkles, 
  Target, 
  Gamepad2, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  X, 
  ChevronRight, 
  BookOpen, 
  Lightbulb, 
  Award,
  Zap,
  Layers
} from 'lucide-react';

export const KAK_NISA_STAGE_GUIDES = {
  1: {
    stageId: 1,
    title: 'Taman Misteri (Mystery Garden)',
    topic: 'Pengenalan Sifat Fisik & Fenotipe Dasar',
    bloomCode: 'C1',
    bloomName: 'Mengingat',
    badge: 'Detektif Sifat',
    storyContext: 'Selamat datang di Kebun Biara Santo Thomas! Kita baru saja berdiskusi dengan Bruder Thomas tentang keajaiban tanaman ercis (Pisum sativum) yang dibudidayakan di sini.',
    gameIntro: 'Di game Stage 1 ini, kamu bertindak sebagai Detektif Tanaman! Tugasmu adalah mengamati barisan tanaman ercis di kebun dan menemukan tanaman dengan kombinasi sifat fisik (fenotipe) yang sesuai dengan permintaan riset.',
    learningGoal: {
      headline: 'Target Capaian Pembelajaran (C1 - Mengingat)',
      description: 'Mampu mengenali dan mengidentifikasi 7 sifat beda fenotipe tanaman ercis yang diteliti Gregor Mendel, seperti warna mahkota bunga (ungu vs putih), bentuk biji (bulat vs keriput), dan warna polong (hijau vs kuning).',
      curriculumPoints: [
        'Membedakan sifat dominan yang tampak jelas vs sifat resesif.',
        'Mengenali variasi fenotipe pada tanaman ercis secara visual.',
        'Mencatat data observasi awal pewarisan sifat secara teliti.'
      ]
    },
    howToPlaySteps: [
      {
        step: 1,
        title: 'Periksa Target Misi',
        desc: 'Lihat kotak misi di bagian atas layar untuk mengetahui sifat tanaman yang dicari (misal: "Bunga Ungu & Biji Bulat").',
        tip: 'Baca teliti setiap kriteria warna bunga dan bentuk biji!'
      },
      {
        step: 2,
        title: 'Jelajahi Barisan Kebun',
        desc: 'Geser baris tanaman ercis ke kiri dan ke kanan untuk memeriksa tanaman-tanaman yang tumbuh di kebun.',
        tip: 'Gunakan tombol panah atau geser kebun secara horizontal.'
      },
      {
        step: 3,
        title: 'Pilih Tanaman yang Cocok',
        desc: 'Klik pada kartu tanaman ercis yang memiliki ciri-ciri fenotipe persis seperti yang diminta misi.',
        tip: 'Kartu yang kamu pilih akan ditandai dengan bingkai hijau menyala.'
      },
      {
        step: 4,
        title: 'Verifikasi & Raih Bintang',
        desc: 'Klik tombol "Verifikasi Hasil" di bawah. Jika benar, kamu akan mendapatkan poin riset dan 3 Bintang sempurna!',
        tip: 'Jangan terburu-buru, periksa kembali sebelum verifikasi!'
      }
    ],
    interactivePreview: {
      question: 'Contoh: Jika misi meminta "Bunga Ungu & Biji Bulat", tanaman mana yang kamu pilih?',
      options: [
        { text: '🌸 Bunga Putih & Biji Keriput', isCorrect: false },
        { text: '🌺 Bunga Ungu & Biji Bulat', isCorrect: true, reason: 'Tepat sekali! Warna bunga ungu dan bentuk biji bulat cocok dengan target.' },
        { text: '🌼 Bunga Ungu & Biji Keriput', isCorrect: false }
      ]
    }
  },
  2: {
    stageId: 2,
    title: 'Penyusun Gen (Gene Builder)',
    topic: 'Genotipe & Alel Dominan/Resesif',
    bloomCode: 'C2',
    bloomName: 'Memahami',
    badge: 'Arsitek Gen',
    storyContext: 'Prof. Rosalind di laboratorium genetika molekuler telah menyiapkan untai DNA kosong untuk tanaman ercis kita.',
    gameIntro: 'Di game Stage 2 ini, kamu bertugas sebagai Arsitek Gen! Kamu akan merangkai simbol-simbol alel huruf untuk menyusun genotipe yang mengendalikan sifat tanaman.',
    learningGoal: {
      headline: 'Target Capaian Pembelajaran (C2 - Memahami)',
      description: 'Mampu memahami konsep genotipe, membedakan alel dominan (huruf besar) dan alel resesif (huruf kecil), serta menyusun kombinasi homozigot dominan (AA), heterozigot (Aa), dan homozigot resesif (aa).',
      curriculumPoints: [
        'Alel dominan disimbolkan dengan HURUF BESAR (misal: P untuk warna ungu).',
        'Alel resesif disimbolkan dengan huruf kecil (misal: p untuk warna putih).',
        'Penulisan heterozigot selalu mendahulukan huruf besar (Pp, bukan pP).'
      ]
    },
    howToPlaySteps: [
      {
        step: 1,
        title: 'Amati Ciri Fenotipe Target',
        desc: 'Perhatikan deskripsi sifat fisik (fenotipe) dan petunjuk genotipe pada kartu tengah.',
        tip: 'Misal: "Bunga Ungu Heterozigot" berarti membawa alel dominan dan resesif.'
      },
      {
        step: 2,
        title: 'Pilih Kartu Alel Huruf',
        desc: 'Klik kartu alel di bawah (huruf besar atau huruf kecil) untuk mengisi slot untai DNA.',
        tip: 'Tersedia pilihan huruf besar (dominan) dan huruf kecil (resesif).'
      },
      {
        step: 3,
        title: 'Lengkapi Pasangan Alel',
        desc: 'Letakkan dua alel pada slot yang tersedia untuk membentuk sepasang genotipe diploid.',
        tip: 'Untuk heterozigot, pastikan huruf besar di urutan pertama!'
      },
      {
        step: 4,
        title: 'Sintesis DNA & Lanjut',
        desc: 'Jika kombinasi alel benar, untai DNA akan bersinar dan kamu dapat melanjutkan ke soal berikutnya.',
        tip: 'Selesaikan semua soal untuk membuka lencana Arsitek Gen!'
      }
    ],
    interactivePreview: {
      question: 'Kuis Singkat: Manakah penulisan genotipe heterozigot yang benar?',
      options: [
        { text: 'PP (Homozigot Dominan)', isCorrect: false },
        { text: 'Pp (Heterozigot)', isCorrect: true, reason: 'Benar! Heterozigot terdiri dari satu alel dominan (P) dan satu alel resesif (p).' },
        { text: 'pp (Homozigot Resesif)', isCorrect: false }
      ]
    }
  },
  3: {
    stageId: 3,
    title: 'Pabrik Gamet (Gamete Factory)',
    topic: 'Hukum Segregasi & Pembentukan Gamet',
    bloomCode: 'C3',
    bloomName: 'Menerapkan',
    badge: 'Master Gamet',
    storyContext: 'Asisten Gigi di laboratorium pemuliaan sedang mengoperasikan mesin segregasi sel untuk mempersiapkan persilangan induk.',
    gameIntro: 'Di game Stage 3 ini, kamu mengoperasikan Pabrik Gamet! Tugasmu adalah memisahkan pasangan gen diploid dari tanaman induk menjadi sel gamet haploid.',
    learningGoal: {
      headline: 'Target Capaian Pembelajaran (C3 - Menerapkan)',
      description: 'Mampu menerapkan Hukum I Mendel (Hukum Segregasi Bebas) bahwa pada saat pembentukan gamet (gametogenesis), pasangan alel akan memisah secara bebas sehingga setiap gamet hanya menerima satu alel.',
      curriculumPoints: [
        'Sel induk bersifat diploid (2n) membawa sepasang alel (misal: Bb).',
        'Sel gamet bersifat haploid (n) hanya membawa satu alel (B atau b).',
        'Induk heterozigot (Bb) menghasilkan 50% gamet B dan 50% gamet b.'
      ]
    },
    howToPlaySteps: [
      {
        step: 1,
        title: 'Periksa Genotipe Sel Induk',
        desc: 'Amati genotipe induk diploid yang muncul di atas corong mesin segregasi.',
        tip: 'Perhatikan apakah induk bersifat homozigot (BB/bb) atau heterozigot (Bb).'
      },
      {
        step: 2,
        title: 'Pisahkan Pasangan Alel',
        desc: 'Terapkan pemisahan bebas dengan memilih alel tunggal yang masuk ke dalam tabung gamet.',
        tip: 'Setiap tabung hanya boleh menampung 1 huruf alel (haploid).'
      },
      {
        step: 3,
        title: 'Pastikan Rasio Gamet Seimbang',
        desc: 'Kumpulkan kombinasi gamet sesuai prinsip segregasi bebas Mendel.',
        tip: 'Jika induk Bb, kamu harus menyiapkan wadah untuk gamet B dan gamet b.'
      },
      {
        step: 4,
        title: 'Kunci Tabung & Verifikasi',
        desc: 'Tekan tombol konfirmasi setelah gamet terpisah sempurna untuk mendapatkan skor tinggi!',
        tip: 'Kecepatan dan ketepatan akan melipatgandakan skormu!'
      }
    ],
    interactivePreview: {
      question: 'Kuis Singkat: Jika induk bergenotipe Bb, gamet apa saja yang dihasilkan?',
      options: [
        { text: 'Hanya gamet Bb', isCorrect: false },
        { text: 'Gamet B dan gamet b (proporsi 1:1)', isCorrect: true, reason: 'Hebat! Hukum Segregasi memisahkan pasangan Bb menjadi gamet B dan b.' },
        { text: 'Hanya gamet BB dan bb', isCorrect: false }
      ]
    }
  },
  4: {
    stageId: 4,
    title: 'Laboratorium Punnett (Punnett Lab)',
    topic: 'Persilangan Monohibrid & Kisi Punnett',
    bloomCode: 'C4',
    bloomName: 'Menganalisis',
    badge: 'Ahli Punnett',
    storyContext: 'Drone Mendel AI siap membantumu memproyeksikan diagram Punnett Square 2x2 di meja riset virtual.',
    gameIntro: 'Di game Stage 4 ini, kamu menganalisis persilangan monohibrid! Kamu akan mengisi papan catur Punnett untuk memprediksi persentase genotipe anakan.',
    learningGoal: {
      headline: 'Target Capaian Pembelajaran (C4 - Menganalisis)',
      description: 'Mampu menganalisis kombinasi genotipe dan fenotipe keturunan hasil persilangan monohibrid (satu sifat beda) menggunakan diagram kisi Punnett Square 2x2.',
      curriculumPoints: [
        'Menempatkan alel jantan di sumbu atas dan betina di sumbu samping.',
        'Menggabungkan huruf alel baris dan kolom untuk mengisi 4 kotak anakan.',
        'Menganalisis rasio genotipe 1 PP : 2 Pp : 1 pp dan rasio fenotipe 3 ungu : 1 putih.'
      ]
    },
    howToPlaySteps: [
      {
        step: 1,
        title: 'Lihat Gamet di Sumbu Kisi',
        desc: 'Perhatikan alel gamet jantan di atas dan gamet betina di samping papan Punnett.',
        tip: 'Alel-alel ini berasal dari hasil segregasi induk persilangan.'
      },
      {
        step: 2,
        title: 'Silangkan Baris dan Kolom',
        desc: 'Klik kotak kisi persilangan, lalu pilih atau ketik kombinasi huruf alel gabungan.',
        tip: 'Tulis selalu alel huruf besar terlebih dahulu (misal: Pp).'
      },
      {
        step: 3,
        title: 'Lengkapi Ke-4 Kotak Kisi',
        desc: 'Pastikan seluruh 4 kotak Punnett Square telah terisi kombinasi anakan yang tepat.',
        tip: 'Periksa kembali keselarasan alel dari setiap arah.'
      },
      {
        step: 4,
        title: 'Hitung Rasio & Verifikasi',
        desc: 'Jawab pertanyaan rasio genotipe/fenotipe yang ditanyakan lalu tekan Verifikasi.',
        tip: 'Rasio klasik persilangan monohibrid F2 adalah 3 : 1!'
      }
    ],
    interactivePreview: {
      question: 'Kuis Singkat: Persilangan Pp x Pp menghasilkan rasio fenotipe sebesar?',
      options: [
        { text: '1 : 1', isCorrect: false },
        { text: '3 Ungu : 1 Putih (3:1)', isCorrect: true, reason: 'Tepat! 1 PP (ungu) + 2 Pp (ungu) = 3 Ungu berbanding 1 pp (putih).' },
        { text: '9 : 3 : 3 : 1', isCorrect: false }
      ]
    }
  },
  5: {
    stageId: 5,
    title: 'Tantangan Panen (Harvest Challenge)',
    topic: 'Prediksi Fenotipe & Evaluasi Rasio Panen',
    bloomCode: 'C5',
    bloomName: 'Evaluasi',
    badge: 'Raja Panen',
    storyContext: 'Ladang percobaan biara sudah memasuki masa panen raya! Ribuan polong ercis hasil persilangan F2 siap dipetik.',
    gameIntro: 'Di game Stage 5 ini, kamu memimpin panen raya! Kamu harus memanen tanaman di ladang sesuai perbandingan rasio teoritis Hukum Mendel (3:1).',
    learningGoal: {
      headline: 'Target Capaian Pembelajaran (C5 - Evaluasi)',
      description: 'Mampu mengevaluasi kesesuaian data fenotipe di lapangan dengan rasio teoritis Hukum Mendel (3 sifat dominan : 1 sifat resesif) pada generasi F2 monohibrid.',
      curriculumPoints: [
        'Membuktikan bahwa sifat resesif muncul kembali pada generasi F2.',
        'Mengevaluasi rasio jumlah sampel tanaman dominan vs resesif.',
        'Memahami penerapan hukum probabilitas genetika dalam populasi.'
      ]
    },
    howToPlaySteps: [
      {
        step: 1,
        title: 'Cek Target Rasio Panen',
        desc: 'Periksa instruksi rasio yang diminta (misal: 6 tanaman dominan dan 2 tanaman resesif = rasio 3:1).',
        tip: 'Target rasio selalu mengacu pada perbandingan 3 bagian berbanding 1 bagian.'
      },
      {
        step: 2,
        title: 'Panen Tanaman di Ladang',
        desc: 'Klik tanaman ercis yang sesuai untuk memasukkannya ke dalam keranjang panen.',
        tip: 'Hitung dengan teliti jumlah tanaman dominan dan resesif yang kamu petik.'
      },
      {
        step: 3,
        title: 'Periksa Indikator Keranjang',
        desc: 'Pantau indikator kapasitas keranjang di layar untuk memastikan perbandingan sudah pas.',
        tip: 'Jika salah petik, kamu bisa klik kembali untuk mengembalikannya.'
      },
      {
        step: 4,
        title: 'Verifikasi Hasil Panen',
        desc: 'Klik tombol "Verifikasi Keranjang" untuk membuktikan bahwa data panenmu cocok dengan Hukum Mendel!',
        tip: 'Panen yang presisi akan memberimu skor bonus evaluasi!'
      }
    ],
    interactivePreview: {
      question: 'Kuis Singkat: Jika kamu memetik 9 tanaman bunga ungu, berapa tanaman bunga putih yang harus dipanen agar rasionya 3:1?',
      options: [
        { text: '1 tanaman', isCorrect: false },
        { text: '3 tanaman', isCorrect: true, reason: 'Pintar! 9 dibagi 3 adalah 3, sehingga perbandingannya tepat 9:3 atau 3:1.' },
        { text: '6 tanaman', isCorrect: false }
      ]
    }
  },
  6: {
    stageId: 6,
    title: 'Petualangan Dihibrid (Dihybrid Adventure)',
    topic: 'Persilangan Dihibrid & Hukum Asortasi Bebas',
    bloomCode: 'C6',
    bloomName: 'Menciptakan',
    badge: 'Penjelajah Dihibrid',
    storyContext: 'Kak Fafa di pusat penelitian pemuliaan telah menyiapkan eksperimen persilangan dua sifat beda sekaligus: bentuk biji dan warna biji!',
    gameIntro: 'Di game Stage 6 ini, kamu menciptakan kisi persilangan dihibrid 4x4 secara utuh! Ini adalah mahakarya Hukum II Mendel (Asortasi Bebas).',
    learningGoal: {
      headline: 'Target Capaian Pembelajaran (C6 - Menciptakan)',
      description: 'Mampu merancang persilangan dihibrid (dua sifat beda), merumuskan 4 jenis kombinasi gamet secara mandiri, menyusun kisi Punnett 4x4 (16 kombinasi), dan membuktikan rasio fenotipe 9:3:3:1.',
      curriculumPoints: [
        'Hukum II Mendel: Alel-alel dari gen yang berbeda mengelompok secara bebas.',
        'Induk heterozigot ganda (AaBb) menghasilkan 4 macam gamet: AB, Ab, aB, dan ab.',
        'Rasio fenotipe F2 dihibrid adalah 9 Bulat-Kuning : 3 Bulat-Hijau : 3 Keriput-Kuning : 1 Keriput-Hijau.'
      ]
    },
    howToPlaySteps: [
      {
        step: 1,
        title: 'Rumuskan 4 Macam Gamet',
        desc: 'Kombinasikan alel sifat 1 (A/a) dengan alel sifat 2 (B/b) untuk membentuk 4 gamet: AB, Ab, aB, ab.',
        tip: 'Gunakan metode perkalian silang (FOIL) agar tidak ada gamet yang terlewat.'
      },
      {
        step: 2,
        title: 'Tempatkan pada Sumbu Kisi 4x4',
        desc: 'Letakkan ke-4 gamet pada sumbu atas dan sumbu kiri tabel Punnett 16 kotak.',
        tip: 'Urutan gamet pada kedua sumbu harus sama persis!'
      },
      {
        step: 3,
        title: 'Isi 16 Kotak Kombinasi',
        desc: 'Lengkapi kotak-kotak persilangan dengan menyatukan huruf sejenis (A dengan A, B dengan B).',
        tip: 'Contoh: gamet Ab bertemu aB menghasilkan kombinasi AaBb.'
      },
      {
        step: 4,
        title: 'Verifikasi Rasio 9:3:3:1',
        desc: 'Identifikasi 4 kelompok fenotipe yang terbentuk dan buktikan kebenaran rasio 9:3:3:1!',
        tip: 'Rasio 9:3:3:1 adalah bukti keberhasilan Hukum Asortasi Bebas!'
      }
    ],
    interactivePreview: {
      question: 'Kuis Singkat: Berapa jumlah kotak kombinasi pada papan catur persilangan dihibrid?',
      options: [
        { text: '4 kotak', isCorrect: false },
        { text: '16 kotak', isCorrect: true, reason: 'Tepat sekali! 4 gamet jantan x 4 gamet betina = 16 kombinasi anakan.' },
        { text: '8 kotak', isCorrect: false }
      ]
    }
  },
  7: {
    stageId: 7,
    title: 'Jebakan Mutasi (Mutation Trap)',
    topic: 'Penyimpangan Semu & Evaluasi Miskonsepsi',
    bloomCode: 'C5',
    bloomName: 'Evaluasi',
    badge: 'Detektor Mutasi',
    storyContext: 'Sistem komputer laboratorium pusat mengalami serangan anomali! Ada data genetika palsu dan miskonsepsi yang merusak arsip penelitian.',
    gameIntro: 'Di game Stage 7 ini, kamu bertindak sebagai Detektif Forensik Genetika! Pecahkan 3 teka-teki sabotase: identifikasi tabung gamet mutan yang gagal berpisah, audit kontradiksi silsilah keluarga, dan stabilkan reaktor intermediet!',
    learningGoal: {
      headline: 'Target Capaian Pembelajaran (C5 - Evaluasi)',
      description: 'Mampu mengevaluasi miskonsepsi genetika, memvalidasi pernyataan hukum pewarisan sifat, serta memahami fenomena penyimpangan semu Hukum Mendel (kodominan, alel ganda, epistasis-hipostasis).',
      curriculumPoints: [
        'Mendeteksi kesalahan logika genetika (misal: gamet diploid akibat gagal berpisah / nondisjunction).',
        'Memahami kesesuaian biologis antara susunan genotipe dan ekspresi fenotipe.',
        'Memahami mekanisme pewarisan sifat intermediet di mana kedua alel mengekspresikan warna perpaduan.'
      ]
    },
    howToPlaySteps: [
      {
        step: 1,
        title: 'Kasus 1: Pindai Tabung Gamet',
        desc: 'Amati 4 tabung suspensi gamet dari induk AaBb. Klik tabung untuk melihat laporan scanner dan netralkan tabung yang membawa sepasang alel ilegal.',
        tip: 'Gamet normal bersifat haploid (1n) dan hanya membawa 1 alel dari masing-masing gen.'
      },
      {
        step: 2,
        title: 'Kasus 2: Audit Silsilah Pohon Keluarga',
        desc: 'Periksa silsilah persilangan monohibrid Pp × Pp. Cari anakan yang sifat fisiknya (fenotipe) bertentangan dengan rumus genetiknya.',
        tip: 'Homozigot resesif pp wajib berfenotipe bunga putih, bukan bunga ungu.'
      },
      {
        step: 3,
        title: 'Kasus 3: Pasang Kristal Intermediet',
        desc: 'Di ruang reaktor, pecahkan teka-teki perpaduan warna bunga merah (MM) × putih (mm) lalu pasang kristal pigmen yang benar ke soket inti.',
        tip: 'Pada sifat intermediet, kedua alel sama kuat sehingga menghasilkan warna perpaduan merah muda (pink).'
      },
      {
        step: 4,
        title: 'Netralkan Sabotase Lab',
        desc: 'Selesaikan ketiga kasus untuk mengamankan arsip sains genetika dan membuka akses ke Boss Battle Dr. Chaos!',
        tip: 'Setiap keberhasilan analisis akan memberimu skor forensik tambahan!'
      }
    ],
    interactivePreview: {
      question: 'Kuis Singkat: Manakah di bawah ini pernyataan yang merupakan MISKONSEPSI (SALAH)?',
      options: [
        { text: 'Alel dominan selalu memiliki jumlah populasi lebih banyak daripada alel resesif', isCorrect: true, reason: 'Tepat! Ini miskonsepsi besar. Dominansi gen tidak menentukan frekuensi gen dalam populasi.' },
        { text: 'Gamet hanya membawa satu alel dari setiap pasangan gen', isCorrect: false },
        { text: 'Persilangan monohibrid mengamati satu sifat beda', isCorrect: false }
      ]
    }
  },
  8: {
    stageId: 8,
    title: 'Pertarungan Bos Dr. Chaos (Final Boss)',
    topic: 'Master Evaluasi & Sintesis Genetika Mendelian',
    bloomCode: 'C6',
    bloomName: 'Kreasi & Evaluasi',
    badge: 'Pahlawan Genetika',
    storyContext: 'Dr. Chaos telah mengurung diri di Hall of Genetics! Dia menantangmu dalam ujian puncak 3 fase untuk membuktikan apakah kamu layak menjadi Ahli Genetika Sejati.',
    gameIntro: 'Di game Stage 8 ini, kamu menghadapi Duel Bos Terakhir! Kamu akan memecahkan tantangan genetika bertingkat 3 fase untuk meruntuhkan perisai Dr. Chaos.',
    learningGoal: {
      headline: 'Target Capaian Pembelajaran (C6 - Master Evaluasi & Sintesis)',
      description: 'Mampu mengintegrasikan seluruh pemahaman Hukum Mendel I dan II secara komprehensif untuk memecahkan persoalan pewarisan sifat bertingkat dalam situasi duel interaktif.',
      curriculumPoints: [
        'Fase 1: Sintesis kombinasi genotipe parental dan filial.',
        'Fase 2: Analisis rasio fenotipe monohibrid dalam batasan waktu.',
        'Fase 3: Serangan pamungkas rasio dihibrid 9:3:3:1 untuk mengalahkan Dr. Chaos!'
      ]
    },
    howToPlaySteps: [
      {
        step: 1,
        title: 'Fase 1: Tembus Perisai Pertama',
        desc: 'Pecahkan teka-teki persilangan parental F1 untuk melemahkan tameng energi Dr. Chaos.',
        tip: 'Jawab dengan tepat agar tidak terkena serangan balasan.'
      },
      {
        step: 2,
        title: 'Fase 2: Serangan Rasio Monohibrid',
        desc: 'Tentukan rasio fenotipe monohibrid dengan cepat dan akurat untuk menurunkan HP Dr. Chaos.',
        tip: 'Ingat rasio 3:1 dan analisis gen dominan-resesif.'
      },
      {
        step: 3,
        title: 'Fase 3: Jurus Pamungkas Dihibrid',
        desc: 'Luncurkan serangan pamungkas dengan menguraikan rasio dihibrid 9:3:3:1 secara sempurna!',
        tip: 'Pastikan fokus penuh saat memasukkan formula rasio dihibrid.'
      },
      {
        step: 4,
        title: 'Kemenangan & Tamatkan Game',
        desc: 'Kalahkan Dr. Chaos, selamatkan arsip Gregor Mendel, dan raih gelar Pahlawan Genetika!',
        tip: 'Piala emas dan rekapan nilai terbaikmu akan tersimpan di sistem!'
      }
    ],
    interactivePreview: {
      question: 'Kuis Singkat: Apa kombinasi rasio pamungkas untuk menembus pertahanan terakhir Dr. Chaos?',
      options: [
        { text: '1 : 2 : 1', isCorrect: false },
        { text: '9 : 3 : 3 : 1 (Rasio Dihibrid F2)', isCorrect: true, reason: 'Luar biasa! Rasio 9:3:3:1 adalah kunci pamungkas pembuktian Hukum Asortasi Bebas!' },
        { text: '3 : 1', isCorrect: false }
      ]
    }
  }
};

export const KakNisaStageBriefing = ({ stageId, onClose }) => {
  const guide = KAK_NISA_STAGE_GUIDES[stageId] || KAK_NISA_STAGE_GUIDES[1];
  const [activeTab, setActiveTab] = useState('mission'); // 'mission' | 'curriculum' | 'howtoplay'
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [quizAnsweredIndex, setQuizAnsweredIndex] = useState(null);
  // Fix 6: Gate PAHAM button until user reads Cara Bermain
  const [hasReadHowToPlay, setHasReadHowToPlay] = useState(false);
  // Fix 7: Countdown 5 detik di tab Cara Bermain
  const [howToPlayCountdown, setHowToPlayCountdown] = useState(null); // null | number
  const countdownRef = React.useRef(null);

  const { isLandscapeMobile } = useGame();

  // Local detector for landscape or short height (typical mobile landscape)
  const [isLocalLandscape, setIsLocalLandscape] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (window.innerWidth > window.innerHeight && window.innerHeight <= 640) ||
      Boolean(window.matchMedia?.('(orientation: landscape) and (max-height: 640px)')?.matches);
  });

  useEffect(() => {
    const handleCheck = () => {
      const match = (window.innerWidth > window.innerHeight && window.innerHeight <= 640) ||
        Boolean(window.matchMedia?.('(orientation: landscape) and (max-height: 640px)')?.matches);
      setIsLocalLandscape(match);
    };
    handleCheck();
    window.addEventListener('resize', handleCheck);
    window.addEventListener('orientationchange', handleCheck);
    return () => {
      window.removeEventListener('resize', handleCheck);
      window.removeEventListener('orientationchange', handleCheck);
    };
  }, []);

  const isCompact = Boolean(isLandscapeMobile || isLocalLandscape);

  const handleSelectTab = (tab) => {
    sound.playClick();
    setActiveTab(tab);
    // Fix 6+7: When user opens Cara Bermain, start 5-second countdown
    if (tab === 'howtoplay' && !hasReadHowToPlay) {
      setHowToPlayCountdown(5);
      if (countdownRef.current) clearInterval(countdownRef.current);
      countdownRef.current = setInterval(() => {
        setHowToPlayCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            setHasReadHowToPlay(true);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  // Cleanup countdown on unmount
  React.useEffect(() => {
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, []);

  return (
    <div className={`fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center ${isCompact ? 'p-1.5' : 'p-2 sm:p-4'} animate-fade-in select-none text-left`}>
      <div className={`w-full ${isCompact ? 'max-w-2xl max-h-[96vh]' : 'max-w-3xl max-h-[92vh]'} rounded-xl sm:rounded-2xl bg-[#fae8b6] ${isCompact ? 'border-3 shadow-[6px_6px_0_#1a0b03]' : 'border-4 shadow-[10px_10px_0_#1a0b03]'} border-[#361706] flex flex-col overflow-hidden relative text-[#2b1103]`}>
        
        {/* Top Header Plank */}
        <div className={`bg-[#ca7c38] ${isCompact ? 'border-b-3 px-3 py-1.5' : 'border-b-4 px-4 py-3'} border-[#361706] flex items-center justify-between shadow-xs`}>
          <div className="flex items-center gap-2">
            <div className={`${isCompact ? 'w-7 h-7 rounded-md' : 'w-9 h-9 rounded-lg'} bg-[#361706] text-[#facc15] flex items-center justify-center shadow-xs flex-shrink-0`}>
              <Sparkles className={`${isCompact ? 'w-4 h-4' : 'w-5 h-5'} animate-pulse`} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`font-pixel ${isCompact ? 'text-[7px] px-1.5 py-0.2' : 'text-[8px] sm:text-[9px] px-2 py-0.5'} bg-[#14532d] text-[#86efac] border border-[#22c55e] rounded uppercase font-bold tracking-wider`}>
                  BRIEFING RISET &bull; KAK NISA
                </span>
                <span className={`font-pixel ${isCompact ? 'text-[7px] px-1.5 py-0.2' : 'text-[8px] sm:text-[9px] px-2 py-0.5'} bg-[#1e3a8a] text-[#bfdbfe] border border-[#3b82f6] rounded uppercase font-bold`}>
                  STAGE 0{stageId}
                </span>
              </div>
              <h2 className={`font-pixel ${isCompact ? 'text-[10.5px] sm:text-xs' : 'text-xs sm:text-sm'} text-[#fae8b6] uppercase font-black tracking-wide ${isCompact ? 'mt-0 leading-tight' : 'mt-0.5'}`}>
                {guide.title}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className={`${isCompact ? 'px-2.5 py-1 rounded-lg text-[7.5px]' : 'px-3 py-1.5 rounded-xl text-[8px] sm:text-[9px]'} bg-red-600 hover:bg-red-700 text-white border-2 border-[#361706] shadow-[2px_2px_0_#1a0b03] flex items-center gap-1 font-pixel uppercase cursor-pointer active:translate-y-0.5 transition`}
            title="Lewati dan langsung main [Esc]"
          >
            <X className={isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
            <span>LEWATI</span>
          </button>
        </div>

        {/* Mentor Visual Row & 3 Navigation Tabs */}
        <div className={`bg-[#f0d99c] border-b-2 border-[#361706]/30 ${isCompact ? 'px-3 py-1' : 'px-4 py-2.5'} flex flex-wrap items-center justify-between gap-1.5 sm:gap-2`}>
          {/* Mentor Persona Avatar Tag */}
          <div className="flex items-center gap-2">
            <div className={`${isCompact ? 'w-7 h-7 sm:w-8 sm:h-8' : 'w-10 h-10 sm:w-11 sm:h-11'} rounded-full bg-emerald-100 border-2 border-[#361706] overflow-hidden flex-shrink-0 shadow-xs flex items-center justify-center`}>
              <img 
                src="/assets/kak_nisa_sprite.png?v=2" 
                alt="Kak Nisa" 
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`font-pixel ${isCompact ? 'text-[9px]' : 'text-[10px] sm:text-xs'} font-black text-[#14532d] uppercase`}>
                  Kak Nisa
                </span>
                <span className={`${isCompact ? 'text-[7.5px] px-1 py-0' : 'text-[9px] px-1.5 py-0.2'} rounded bg-emerald-600 text-white font-sans font-bold`}>
                  Mentor Riset
                </span>
              </div>
              {!isCompact && (
                <p className="text-[10px] text-[#884318] font-sans italic">
                  "Siap menuntunmu menuntaskan riset genetika ini!"
                </p>
              )}
            </div>
          </div>

          {/* 3 Action Tabs */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => handleSelectTab('mission')}
              className={`${isCompact ? 'px-2 py-0.5 rounded-md text-[7.5px]' : 'px-3 py-1.5 rounded-lg text-[8px] sm:text-[9px]'} border-2 font-pixel uppercase cursor-pointer transition-all flex items-center gap-1 ${
                activeTab === 'mission'
                  ? 'bg-[#361706] text-[#facc15] border-[#361706] shadow-[2px_2px_0_#1a0b03]'
                  : 'bg-[#fff8e7] text-[#361706] border-[#361706]/40 hover:bg-[#ffeed1]'
              }`}
            >
              <Gamepad2 className={isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
              <span>1. Tentang Game</span>
            </button>

            <button
              onClick={() => handleSelectTab('curriculum')}
              className={`${isCompact ? 'px-2 py-0.5 rounded-md text-[7.5px]' : 'px-3 py-1.5 rounded-lg text-[8px] sm:text-[9px]'} border-2 font-pixel uppercase cursor-pointer transition-all flex items-center gap-1 ${
                activeTab === 'curriculum'
                  ? 'bg-[#361706] text-[#facc15] border-[#361706] shadow-[2px_2px_0_#1a0b03]'
                  : 'bg-[#fff8e7] text-[#361706] border-[#361706]/40 hover:bg-[#ffeed1]'
              }`}
            >
              <Target className={isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
              <span>2. Tujuan ({guide.bloomCode})</span>
            </button>

            <button
              onClick={() => handleSelectTab('howtoplay')}
              className={`${isCompact ? 'px-2 py-0.5 rounded-md text-[7.5px]' : 'px-3 py-1.5 rounded-lg text-[8px] sm:text-[9px]'} border-2 font-pixel uppercase cursor-pointer transition-all flex items-center gap-1 ${
                activeTab === 'howtoplay'
                  ? 'bg-[#15803d] text-white border-[#14532d] shadow-[2px_2px_0_#0f5132] ring-2 ring-emerald-400/60 animate-pulse'
                  : 'bg-[#fff8e7] text-[#361706] border-[#361706]/40 hover:bg-[#ffeed1]'
              }`}
            >
              <Lightbulb className={`${isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-amber-500`} />
              <span>3. Cara Bermain</span>
            </button>
          </div>
        </div>

        {/* Content Scrollable Body */}
        <div className={`${isCompact ? 'p-2.5 sm:p-3 space-y-2 text-[10.5px]' : 'p-4 sm:p-6 space-y-4 text-xs'} overflow-y-auto flex-1 font-sans`}>
          
          {/* TAB 1: TENTANG GAME & LATAR MISI */}
          {activeTab === 'mission' && (
            <div className={`space-y-${isCompact ? '2' : '4'} animate-fade-in`}>
              <div className={`bg-[#fff8e7] border-2 border-[#361706] rounded-xl ${isCompact ? 'p-2.5 space-y-1' : 'p-4 space-y-2.5'} shadow-sm`}>
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <BookOpen className={isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
                  <span className={`font-pixel ${isCompact ? 'text-[8px]' : 'text-[9px]'} uppercase tracking-wider font-bold`}>
                    Konteks Petualangan Riset
                  </span>
                </div>
                <p className={`text-[#361706] ${isCompact ? 'text-[10px] leading-snug' : 'leading-relaxed'} font-medium`}>
                  {guide.storyContext}
                </p>
              </div>

              <div className={`bg-gradient-to-br from-amber-100 via-amber-50 to-orange-100 border-2 border-amber-800/40 rounded-xl ${isCompact ? 'p-2.5 space-y-1' : 'p-4 space-y-2'} shadow-sm`}>
                <div className="flex items-center gap-1.5 text-amber-900">
                  <Gamepad2 className={isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
                  <span className={`font-pixel ${isCompact ? 'text-[8px]' : 'text-[9px]'} uppercase tracking-wider font-bold`}>
                    Apa yang Kamu Lakukan di Stage Ini?
                  </span>
                </div>
                <p className={`text-[#451a03] ${isCompact ? 'text-[10.5px] leading-snug' : 'leading-relaxed text-xs sm:text-sm'} font-semibold`}>
                  {guide.gameIntro}
                </p>
              </div>

              <div className={`grid grid-cols-1 sm:grid-cols-2 ${isCompact ? 'gap-2 pt-0' : 'gap-3 pt-1'}`}>
                <div className={`${isCompact ? 'p-2' : 'p-3'} bg-[#e6f4ea] border-2 border-[#15803d] rounded-xl flex items-center gap-2.5`}>
                  <Award className={`${isCompact ? 'w-6 h-6' : 'w-8 h-8'} text-emerald-600 flex-shrink-0`} />
                  <div>
                    <span className={`font-pixel ${isCompact ? 'text-[7px]' : 'text-[7.5px]'} text-emerald-800 uppercase block`}>Lencana Penghargaan</span>
                    <h4 className={`font-pixel ${isCompact ? 'text-[10px]' : 'text-xs'} text-emerald-950 font-bold`}>{guide.badge}</h4>
                  </div>
                </div>

                <div className={`${isCompact ? 'p-2' : 'p-3'} bg-[#f0f9ff] border-2 border-[#0284c7] rounded-xl flex items-center gap-2.5`}>
                  <Zap className={`${isCompact ? 'w-6 h-6' : 'w-8 h-8'} text-sky-600 flex-shrink-0`} />
                  <div>
                    <span className={`font-pixel ${isCompact ? 'text-[7px]' : 'text-[7.5px]'} text-sky-800 uppercase block`}>Fokus Topik Genetika</span>
                    <h4 className={`text-xs text-sky-950 font-bold ${isCompact ? 'text-[10px]' : ''}`}>{guide.topic}</h4>
                  </div>
                </div>
              </div>

              <div className={`text-right ${isCompact ? 'pt-1' : 'pt-2'}`}>
                <button
                  onClick={() => handleSelectTab('curriculum')}
                  className={`${isCompact ? 'px-3 py-1 rounded-lg text-[8px]' : 'px-4 py-2 rounded-xl text-[8px] sm:text-[9px]'} bg-[#ca7c38] hover:bg-[#df9b52] text-[#2b1103] border-2 border-[#361706] shadow-[2px_2px_0_#1a0b03] font-pixel uppercase cursor-pointer active:translate-y-0.5 inline-flex items-center gap-1.5 transition`}
                >
                  <span>Lanjut: Lihat Tujuan Pembelajaran</span>
                  <ChevronRight className={isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: TUJUAN PEMBELAJARAN (BLOOM TAXONOMY C1-C6) */}
          {activeTab === 'curriculum' && (
            <div className={`space-y-${isCompact ? '2' : '4'} animate-fade-in`}>
              <div className={`bg-[#eef2ff] border-2 border-[#4338ca] rounded-xl ${isCompact ? 'p-2.5 space-y-1' : 'p-4 space-y-2'} shadow-sm`}>
                <div className="flex items-center justify-between">
                  <span className={`font-pixel ${isCompact ? 'text-[7.5px] px-1.5 py-0.2' : 'text-[8px] sm:text-[9px] px-2 py-0.5'} bg-[#312e81] text-white rounded uppercase font-bold`}>
                    Level Kognitif &bull; {guide.bloomCode} ({guide.bloomName})
                  </span>
                  <Target className={`${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-[#4338ca]`} />
                </div>
                <h3 className={`font-pixel ${isCompact ? 'text-[10.5px] mt-0.5' : 'text-xs sm:text-sm mt-1'} text-[#1e1b4b] uppercase font-bold`}>
                  {guide.learningGoal.headline}
                </h3>
                <p className={`text-[#312e81] ${isCompact ? 'text-[10px] leading-snug' : 'leading-relaxed'} font-medium`}>
                  {guide.learningGoal.description}
                </p>
              </div>

              <div className={`bg-[#fff8e7] border-2 border-[#361706] rounded-xl ${isCompact ? 'p-2.5 space-y-1.5' : 'p-4 space-y-2.5'} shadow-sm`}>
                <span className={`font-pixel ${isCompact ? 'text-[7.5px]' : 'text-[8.5px]'} text-[#884318] uppercase tracking-wide block font-bold`}>
                  🎯 Indikator Capaian Belajar Kamu:
                </span>
                <ul className={`${isCompact ? 'space-y-1 text-[10px]' : 'space-y-2 text-[#361706]'}`}>
                  {guide.learningGoal.curriculumPoints.map((pt, idx) => (
                    <li key={idx} className={`flex items-start gap-2 bg-white/70 ${isCompact ? 'p-1.5 rounded-md' : 'p-2 rounded-lg'} border border-[#361706]/20`}>
                      <CheckCircle2 className={`${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-emerald-600 flex-shrink-0 mt-0.5`} />
                      <span className="leading-snug font-medium">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`flex items-center justify-between ${isCompact ? 'pt-1' : 'pt-2'}`}>
                <button
                  onClick={() => handleSelectTab('mission')}
                  className={`${isCompact ? 'px-2.5 py-1 text-[7.5px]' : 'px-3.5 py-1.5 text-[8px]'} rounded-lg bg-[#fff8e7] hover:bg-[#ffeed1] text-[#361706] border-2 border-[#361706] font-pixel uppercase cursor-pointer`}
                >
                  &larr; Kembali
                </button>
                <button
                  onClick={() => handleSelectTab('howtoplay')}
                  className={`${isCompact ? 'px-3 py-1.5 text-[8px]' : 'px-4 py-2 text-[8px] sm:text-[9px]'} rounded-xl bg-[#16a34a] hover:bg-[#22c55e] text-white border-2 border-[#14532d] shadow-[2px_2px_0_#0f5132] font-pixel uppercase cursor-pointer active:translate-y-0.5 inline-flex items-center gap-1.5 transition`}
                >
                  <span>Lanjut: Cara Bermain & Bantuan Interaktif</span>
                  <ChevronRight className={isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CARA BERMAIN & BANTUAN INTERAKTIF AWAL */}
          {activeTab === 'howtoplay' && (
            <div className={`space-y-${isCompact ? '2' : '4'} animate-fade-in`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className={`font-pixel ${isCompact ? 'text-[7px]' : 'text-[8px]'} text-emerald-800 uppercase block font-bold`}>
                    PANDUAN PRAKTIK LANGSUNG
                  </span>
                  <h3 className={`font-pixel ${isCompact ? 'text-[10px]' : 'text-xs sm:text-sm'} text-[#361706] uppercase font-black`}>
                    Langkah Bermain Interaktif (Step-by-Step)
                  </h3>
                </div>
                <span className={`${isCompact ? 'text-[8.5px] px-1.5 py-0.2' : 'text-[10px] px-2 py-0.5'} text-[#884318] bg-[#fff8e7] border border-[#361706]/30 rounded font-sans font-semibold`}>
                  Pilih langkah untuk panduan
                </span>
              </div>

              {/* 4 Interactive Step Selector Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                {guide.howToPlaySteps.map((step, idx) => {
                  const isSelected = selectedStepIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        sound.playClick();
                        setSelectedStepIndex(idx);
                      }}
                      className={`${isCompact ? 'p-1.5 rounded-lg' : 'p-2.5 rounded-xl'} border-2 cursor-pointer transition-all flex flex-col justify-between select-none ${
                        isSelected
                          ? 'bg-[#15803d] border-[#14532d] text-white shadow-[2px_2px_0_#0f5132] -translate-y-0.5 ring-2 ring-emerald-300'
                          : 'bg-[#fff8e7] border-[#361706]/40 hover:bg-[#ffeed1] text-[#361706]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                        <span className={`${isCompact ? 'w-4 h-4 text-[8px]' : 'w-5 h-5 text-[9px]'} rounded font-pixel flex items-center justify-center font-bold ${
                          isSelected ? 'bg-white text-emerald-800' : 'bg-[#ca7c38] text-[#2b1103]'
                        }`}>
                          {step.step}
                        </span>
                        {isSelected && <Sparkles className={`${isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-yellow-300`} />}
                      </div>
                      <span className={`font-pixel ${isCompact ? 'text-[7.5px]' : 'text-[8px]'} leading-tight line-clamp-2`}>
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Spotlighted Step Detail Card */}
              {(() => {
                const currentStep = guide.howToPlaySteps[selectedStepIndex] || guide.howToPlaySteps[0];
                return (
                  <div className={`bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border-3 border-emerald-600 rounded-xl ${isCompact ? 'p-2.5 space-y-1.5' : 'p-4 space-y-2'} shadow-md relative overflow-hidden animate-scale-up`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-pixel ${isCompact ? 'text-[7px]' : 'text-[8px]'} bg-emerald-700 text-white px-2 py-0.5 rounded uppercase font-bold`}>
                        BANTUAN LANGKAH 0{currentStep.step} &bull; {currentStep.title}
                      </span>
                      <Lightbulb className={`${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-amber-500`} />
                    </div>

                    <p className={`text-emerald-950 ${isCompact ? 'text-[10.5px] leading-snug' : 'text-xs sm:text-sm leading-relaxed'} font-semibold`}>
                      {currentStep.desc}
                    </p>

                    <div className={`${isCompact ? 'p-1.5 text-[9.5px]' : 'p-2.5 text-xs'} bg-white/80 border border-emerald-300 rounded-lg flex items-center gap-1.5`}>
                      <span className={isCompact ? 'text-sm' : 'text-base'}>💡</span>
                      <p className="text-emerald-800 font-medium italic">
                        <strong>Tips Kak Nisa:</strong> {currentStep.tip}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Interactive Preview Mini-Practice */}
              {guide.interactivePreview && (
                <div className={`bg-[#fff8e7] border-2 border-[#361706] rounded-xl ${isCompact ? 'p-2 space-y-1.5' : 'p-3.5 space-y-2'}`}>
                  <div className="flex items-center gap-1.5 text-[#884318]">
                    <Layers className={isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
                    <span className={`font-pixel ${isCompact ? 'text-[7.5px]' : 'text-[8px]'} uppercase tracking-wider font-bold`}>
                      Uji Pemahaman Cepat Sebelum Bermain
                    </span>
                  </div>
                  <p className={`font-semibold text-[#361706] ${isCompact ? 'text-[10px]' : 'text-xs'}`}>
                    {guide.interactivePreview.question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-0.5">
                    {guide.interactivePreview.options.map((opt, optIdx) => {
                      const isAnswered = quizAnsweredIndex === optIdx;
                      const isSuccess = isAnswered && opt.isCorrect;
                      const isWrong = isAnswered && !opt.isCorrect;

                      return (
                        <button
                          key={optIdx}
                          onClick={() => {
                            setQuizAnsweredIndex(optIdx);
                            if (opt.isCorrect) {
                              sound.playSuccess();
                            } else {
                              sound.playWrong();
                            }
                          }}
                          className={`${isCompact ? 'p-1.5 text-[9.5px] rounded-lg' : 'p-2 rounded-lg text-[11px]'} border text-left font-medium transition cursor-pointer flex flex-col justify-between ${
                            isSuccess
                              ? 'bg-emerald-100 border-emerald-600 text-emerald-900 ring-2 ring-emerald-500 font-bold'
                              : isWrong
                              ? 'bg-red-100 border-red-500 text-red-900 line-through'
                              : 'bg-white border-[#361706]/30 hover:bg-amber-50 text-[#361706]'
                          }`}
                        >
                          <span>{opt.text}</span>
                          {isSuccess && (
                            <span className={`text-emerald-700 font-bold block ${isCompact ? 'text-[8px] mt-0.5' : 'text-[9px] mt-1'}`}>
                              ✓ {opt.reason}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Bottom Action Footer */}
        <div className={`bg-[#fff8e7] ${isCompact ? 'border-t-2 px-3 py-1.5' : 'border-t-3 p-3 sm:p-4'} border-[#361706] flex items-center justify-between gap-2`}>
          <div className="flex items-center gap-1.5 text-[#884318] font-sans">
            <span className={`${isCompact ? 'text-[8.5px]' : 'text-[10px]'} hidden sm:inline`}>
              💡 Selama bermain di Stage, kamu bisa memanggil Kak Nisa kapan saja!
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Fix 6+7: PAHAM button gated behind Cara Bermain tab + 5s countdown */}
            {!hasReadHowToPlay ? (
              <div className="flex flex-col items-end gap-1">
                {/* Prompt to go to Cara Bermain if not yet visited */}
                {activeTab !== 'howtoplay' ? (
                  <button
                    onClick={() => handleSelectTab('howtoplay')}
                    className={`${isCompact ? 'px-4 py-1.5 rounded-lg text-[8.5px]' : 'px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[9px] sm:text-xs'} bg-gradient-to-b from-amber-400 to-amber-600 hover:brightness-110 text-white font-pixel uppercase flex items-center justify-center gap-1.5 border-2 border-amber-700 shadow-[2px_2px_0_#92400e] active:translate-y-0.5 cursor-pointer font-bold transition-all`}
                  >
                    <Lightbulb className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} fill-current`} />
                    <span>BACA CARA BERMAIN DULU 📖</span>
                  </button>
                ) : howToPlayCountdown !== null ? (
                  /* Countdown timer visible */
                  <div className={`${isCompact ? 'px-4 py-1.5 rounded-lg text-[8.5px]' : 'px-5 py-2.5 rounded-xl text-[9px] sm:text-xs'} bg-slate-200 text-slate-600 font-pixel uppercase flex items-center gap-2 border-2 border-slate-300 select-none`}>
                    <span className="text-lg font-black text-slate-800 tabular-nums w-5 text-center">{howToPlayCountdown}</span>
                    <span>detik... baca dulu!</span>
                  </div>
                ) : null}
              </div>
            ) : (
              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className={`${isCompact ? 'px-4 py-1.5 rounded-lg text-[8.5px]' : 'px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl text-[9px] sm:text-xs'} bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-700 hover:brightness-110 text-white font-pixel uppercase flex items-center justify-center gap-1.5 border-2 border-[#14532d] shadow-[2px_2px_0_#0f5132] active:translate-y-0.5 cursor-pointer font-bold transition-all animate-scale-up`}
              >
                <Play className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} fill-current`} />
                <span>PAHAM & MULAI MAIN SEKARANG! 🚀</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
