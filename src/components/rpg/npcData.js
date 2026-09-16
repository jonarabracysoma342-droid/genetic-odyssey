// src/components/rpg/npcData.js
// 8 Thematic NPCs corresponding to each stage in Genetic Odyssey
// Includes multi-turn conversational dialogue between Player (Peneliti Muda) and NPC

export const PLAYER_PORTRAIT = '/assets/portraits/player_female_portrait.webp';
export const PLAYER_MALE_PORTRAIT = '/assets/portraits/player_male_portrait.webp';

export const NPCS = [
  {
    id: 'npc_1_monk',
    name: 'Bruder Thomas',
    role: 'Biarawan Perawat Kebun',
    avatar: '👨‍🌾',
    spriteSrc: '/assets/rpg/npc/npc_1_monk.png',
    portraitSrc: '/assets/portraits/npc_thomas_portrait.webp',
    stageId: 1,
    homeX: 356,
    homeY: 175,
    wanderRadius: 28,
    width: 22,
    height: 38,
    direction: 'down',
    dialogue: {
      title: 'Kebun Ercis Biara',
      text: 'Mata yang jeli! Pada Stage 1 ini, tugasmu adalah mengamati tanaman ercis di kebun, mendeteksi 7 sifat fisik (fenotipe) seperti warna bunga (ungu/putih), bentuk biji (bulat/keriput), dan warna biji (kuning/hijau), lalu mencocokkan kartunya. Siap memulai riset?',
      tip: 'Amati baik-baik perbedaan bentuk biji bulat vs keriput dan warna kuning vs hijau.',
      dialogues: [
        {
          speaker: 'player',
          speakerName: 'Peneliti Muda',
          text: 'Halo Bruder Thomas! Sedang sibuk apa di petak kebun ercis ini?'
        },
        {
          speaker: 'npc',
          speakerName: 'Bruder Thomas',
          text: 'Salam berkah, Peneliti Muda! Aku sedang mencatat keajaiban tanaman ercis biara ini. Coba perhatikan polong dan bunga di sekelilingmu!'
        },
        {
          speaker: 'player',
          speakerName: 'Peneliti Muda',
          text: 'Wah, benar! Ada yang bunganya ungu pekat, ada yang putih... bijinya juga ada yang bulat licin dan keriput!'
        },
        {
          speaker: 'npc',
          speakerName: 'Bruder Thomas',
          text: 'Mata yang jeli! Pada Stage 1 ini, tugasmu adalah mengamati tanaman ercis di kebun biara, mencari sifat fisik (fenotipe) seperti bunga ungu vs putih dan biji bulat vs keriput, lalu mencocokkan kartu tanaman sesuai petunjuk misi. Siap memulai riset?'
        }
      ]
    }
  },
  {
    id: 'npc_2_geneticist',
    name: 'Prof. Rosalind',
    role: 'Ahli Genetika Molekuler',
    avatar: '👩‍🔬',
    spriteSrc: '/assets/rpg/npc/npc_2_geneticist.png',
    portraitSrc: '/assets/portraits/npc_rosalind_portrait.webp',
    stageId: 2,
    homeX: 170,
    homeY: 215,
    wanderRadius: 22,
    width: 20,
    height: 38,
    direction: 'right',
    dialogue: {
      title: 'Laboratorium Alel & DNA',
      text: 'Tepat seratus! Pada Stage 2 ini, kamu akan meneliti materi genetik di meja lab, menyusun pasangan alel (dominan dan resesif) menjadi genotipe homozigot atau heterozigot untuk memprediksi sifat tanaman ercis!',
      tip: 'Huruf kapital melambangkan alel dominan, huruf kecil untuk alel resesif.',
      dialogues: [
        {
          speaker: 'player',
          speakerName: 'Peneliti Muda',
          text: 'Selamat siang Prof. Rosalind! Sedang mengamati preparat apa di mikroskop?'
        },
        {
          speaker: 'npc',
          speakerName: 'Prof. Rosalind',
          text: 'Ah, pas sekali kamu datang! Aku sedang mengekstrak materi pembawa sifat di dalam inti sel. Kamu tahu apa yang menentukan wujud tanaman ercis tadi?'
        },
        {
          speaker: 'player',
          speakerName: 'Peneliti Muda',
          text: 'Apakah itu gen dan pasangan alel di dalam untaian DNA, Prof?'
        },
        {
          speaker: 'npc',
          speakerName: 'Prof. Rosalind',
          text: 'Tepat seratus! Pada Stage 2 ini, kamu akan meneliti materi genetik di meja lab, menyusun pasangan alel (huruf kapital dominan & huruf kecil resesif) menjadi genotipe homozigot atau heterozigot untuk memprediksi sifat tanaman!'
        }
      ]
    }
  },
  {
    id: 'npc_3_mechanic',
    name: 'Gigi si Mekanik',
    role: 'Montir Mesin Pemilah Gen',
    avatar: '🔧',
    spriteSrc: '/assets/rpg/npc/npc_3_mechanic.png',
    portraitSrc: '/assets/portraits/npc_gigi_portrait.webp',
    stageId: 3,
    homeX: 320,
    homeY: 410,
    wanderRadius: 20,
    width: 20,
    height: 38,
    direction: 'up',
    dialogue: {
      title: 'Pabrik Gamet Mendel',
      text: 'Yap, pintar! Pada Stage 3 ini, tugasmu membuktikan Hukum Mendel I (Hukum Segregasi Bebas). Kalibrasi dan operasikan mesin pemilah gamet untuk memisahkan pasangan alel induk (misal: sel Aa jadi 50% gamet A dan 50% gamet a) secara adil!',
      tip: 'Genotipe heterozigot Aa akan menghasilkan 50% gamet A dan 50% gamet a.',
      dialogues: [
        {
          speaker: 'player',
          speakerName: 'Peneliti Muda',
          text: 'Hai Gigi! Mesin apa ini, berputar-putar dengan tabung kaca bercahaya?'
        },
        {
          speaker: 'npc',
          speakerName: 'Gigi si Mekanik',
          text: 'Hehe, keren kan? Ini mesin pemisah gamet ciptaanku! Fungsinya untuk membuktikan Hukum Mendel I, yaitu Hukum Segregasi Bebas.'
        },
        {
          speaker: 'player',
          speakerName: 'Peneliti Muda',
          text: 'Hukum Segregasi? Maksudnya pemisahan pasangan alel saat pembentukan sel kelamin ya?'
        },
        {
          speaker: 'npc',
          speakerName: 'Gigi si Mekanik',
          text: 'Yap, pintar! Pada Stage 3 ini, tugasmu membuktikan Hukum Segregasi Bebas. Kalibrasi dan operasikan mesin pemilah gamet untuk memisahkan pasangan alel induk (seperti Aa jadi 50% A dan 50% a) secara adil!'
        }
      ]
    }
  },
  {
    id: 'npc_4_mendel',
    name: 'Pater Gregor Mendel',
    role: 'Bapak Genetika Modern',
    avatar: '🌿',
    spriteSrc: '/assets/rpg/npc/npc_4_mendel.png',
    portraitSrc: '/assets/portraits/npc_mendel_portrait.webp',
    stageId: 4,
    homeX: 195,
    homeY: 375,
    wanderRadius: 24,
    width: 24,
    height: 38,
    direction: 'left',
    dialogue: {
      title: 'Lab Persilangan Punnett',
      text: 'Tepat sekali! Pada Stage 4 ini, kamu akan melengkapi diagram papan catur Punnett 2×2 dari persilangan monohibrid (Bb × Bb) untuk membuktikan rasio genotipe 1:2:1 dan rasio fenotipe 3:1! Ayo kita buktikan hitungannya!',
      tip: 'Persilangan monohibrid heterozigot Bb x Bb selalu menghasilkan rasio genotipe 1:2:1 dan rasio fenotipe 3:1.',
      dialogues: [
        {
          speaker: 'player',
          speakerName: 'Peneliti Muda',
          text: 'Suatu kehormatan besar bisa bertemu langsung dengan Pater Gregor Mendel!'
        },
        {
          speaker: 'npc',
          speakerName: 'Pater Gregor Mendel',
          text: 'Hahaha, selamat datang di biara kami, anak muda! Di hadapanku ini ada papan hitung probabilitas persilangan monohibrid.'
        },
        {
          speaker: 'player',
          speakerName: 'Peneliti Muda',
          text: 'Papan kotak-kotak catur ini... apakah ini diagram Punnett untuk memprediksi keturunan F2?'
        },
        {
          speaker: 'npc',
          speakerName: 'Pater Gregor Mendel',
          text: 'Tepat sekali! Pada Stage 4 ini, kamu akan melengkapi diagram papan catur Punnett 2×2 dari persilangan monohibrid (Bb × Bb) untuk membuktikan rasio genotipe 1:2:1 dan rasio fenotipe 3:1! Ayo kita buktikan!'
        }
      ]
    }
  },
  {
    id: 'npc_5_farmer',
    name: 'Pak Barnaby',
    role: 'Petani Senior Biara',
    avatar: '🌾',
    spriteSrc: '/assets/rpg/npc/npc_5_farmer.png',
    portraitSrc: '/assets/portraits/npc_barnaby_portrait.webp',
    stageId: 5,
    homeX: 800,
    homeY: 395,
    wanderRadius: 26,
    width: 24,
    height: 38,
    direction: 'right',
    dialogue: {
      title: 'Kandang Panen Raya',
      text: 'Pisahkan biji kuning dominan dan hijau resesif! Pada Stage 5 ini, kamu akan menyortir hasil panen raya ke bak penampungan, lalu menghitungnya agar jumlahnya pas mendekati perbandingan rasio klasik 3 banding 1! Siap bantu aku?',
      tip: 'Hitung total biji yang didapat, lalu kelompokkan berdasarkan fenotipe dominan dan resesif.',
      dialogues: [
        {
          speaker: 'player',
          speakerName: 'Peneliti Muda',
          text: 'Wah, banyak sekali karung ercisnya, Pak Barnaby! Kelihatannya kewalahan?'
        },
        {
          speaker: 'npc',
          speakerName: 'Pak Barnaby',
          text: 'Aduh, syukurlah kamu lewat! Hasil panen raya kebun kita melimpah ruah, tapi biji kuning dan biji hijaunya masih tercampur aduk di bak!'
        },
        {
          speaker: 'player',
          speakerName: 'Peneliti Muda',
          text: 'Bagaimana aturan pemilahannya agar sesuai standar biara, Pak?'
        },
        {
          speaker: 'npc',
          speakerName: 'Pak Barnaby',
          text: 'Pisahkan biji kuning dominan dan hijau resesif! Pada Stage 5 ini, tugasmu adalah menyortir hasil panen ke bak penampungan dan menghitungnya agar perbandingannya pas mendekati rasio klasik 3 banding 1! Siap bantu aku?'
        }
      ]
    }
  },
  {
    id: 'npc_6_assistant',
    name: 'Kak Fafa',
    role: 'Asisten Riset Dihibrid',
    avatar: '🏡',
    spriteSrc: '/assets/rpg/npc/npc_6_assistant.png',
    portraitSrc: '/assets/portraits/npc_fafa_portrait.webp',
    stageId: 6,
    homeX: 825,
    homeY: 236,
    wanderRadius: 10,
    width: 26,
    height: 38,
    direction: 'right',
    dialogue: {
      title: 'Kabin Riset Dihibrid',
      text: 'Betul banget! Pada Stage 6 ini, kita akan membuktikan Hukum Mendel II (Asortasi Bebas). Kita silangkan dua sifat beda sekaligus (bentuk dan warna biji) ke dalam matriks Punnett 4×4 hingga menemukan rasio klasik 9:3:3:1! Yuk selesaikan misinya!',
      tip: 'Persilangan 2 sifat beda (misal: bentuk dan warna biji) menghasilkan rasio fenotipe klasik 9:3:3:1.',
      dialogues: [
        {
          speaker: 'player',
          speakerName: 'Peneliti Muda',
          text: 'Halo Kak Fafa! Hangat sekali kabin riset ini. Sedang menyiapkan apa di papan tulis perapian?'
        },
        {
          speaker: 'npc',
          speakerName: 'Kak Fafa',
          text: 'Hai Peneliti Muda! Senang melihatmu sampai di sini. Sekarang kita naik level ke Hukum Mendel II: Asortasi Bebas dengan mengamati DUA sifat beda sekaligus!'
        },
        {
          speaker: 'player',
          speakerName: 'Peneliti Muda',
          text: 'Dua sifat sekaligus? Maksudnya seperti mengamati bentuk biji sekaligus warna bijinya ya, Kak?'
        },
        {
          speaker: 'npc',
          speakerName: 'Kak Fafa',
          text: 'Betul banget! Pada Stage 6 ini, tugasmu adalah menyilangkan dua sifat beda sekaligus (bentuk dan warna biji) di papan Punnett 4×4 sampai membuktikan rasio fenotipe klasik 9:3:3:1! Yuk masuk kabin dan mulai misinya!'
        }
      ]
    }
  },
  {
    id: 'npc_7_drone',
    name: 'Snooper Drone',
    role: 'Detektor Anomali Genetik',
    avatar: '🤖',
    spriteSrc: '/assets/rpg/npc/npc_7_drone.png',
    portraitSrc: '/assets/portraits/npc_drone_portrait.webp',
    stageId: 7,
    homeX: 635,
    homeY: 390,
    wanderRadius: 30,
    width: 28,
    height: 34,
    isFlying: true,
    direction: 'right',
    dialogue: {
      title: 'Petak Peringatan Mutasi',
      text: 'ANALISIS TEPAT! Dr. Chaos telah menyuntikkan virus data ke petak tanaman! Pada Stage 7 ini, kamu harus memindai dan menetralkan data yang terdistorsi, mengungkap fenomena penyimpangan semu seperti kriptomeri dan epistasis!',
      tip: 'Jangan terkecoh dengan miskonsepsi genetik yang dipasang oleh Dr. Chaos!',
      dialogues: [
        {
          speaker: 'player',
          speakerName: 'Peneliti Muda',
          text: 'Hei drone kecil, kenapa kamu berkedip-kedip merah dan melayang panik begini?'
        },
        {
          speaker: 'npc',
          speakerName: 'Snooper Drone',
          text: 'BZZZT... KRIPTIK ALERT! Sensor mendeteksi anomali di petak mutasi! Rasio Mendel klasik 9:3:3:1 tiba-tiba berubah menjadi 9:7 dan 12:3:1!'
        },
        {
          speaker: 'player',
          speakerName: 'Peneliti Muda',
          text: 'Tunggu... bukankah itu fenomena Penyimpangan Semu Hukum Mendel, seperti kriptomeri dan epistasis?'
        },
        {
          speaker: 'npc',
          speakerName: 'Snooper Drone',
          text: 'ANALISIS TEPAT! Dr. Chaos menyuntikkan virus data untuk mengaburkan konsep pewarisan sifat! Pada Stage 7 ini, tugasmu memindai dan menetralkan distorsi data serta mengungkap fenomena penyimpangan semu. Ayo cepat!'
        }
      ]
    }
  },
  {
    id: 'npc_8_chaos',
    name: 'Dr. Chaos',
    role: 'Rival Master Genetika',
    avatar: '👑',
    spriteSrc: '/assets/rpg/npc/npc_8_chaos.png',
    portraitSrc: '/assets/portraits/npc_chaos_portrait.webp',
    stageId: 8,
    homeX: 512,
    homeY: 78,
    wanderRadius: 15,
    width: 20,
    height: 40,
    direction: 'down',
    dialogue: {
      title: 'Gerbang Tantangan Terakhir',
      text: 'Bagus, tunjukkan kemampuan analisismu kalau begitu! Pada Stage 8 ini, kau harus menembus Duel Pertanyaan Genetika Tingkat Tinggi (HOTS) melawanku untuk merebut kembali kunci master biara. Bersiaplah kalah!',
      tip: 'Kuasai seluruh konsep dari Stage 1 hingga 7 untuk menangkis pertanyaan-pertanyaan mematikan Dr. Chaos!',
      dialogues: [
        {
          speaker: 'player',
          speakerName: 'Peneliti Muda',
          text: 'Berhenti di sana, Dr. Chaos! Seluruh misteri genetika di biara ini sudah berhasil kami pecahkan!'
        },
        {
          speaker: 'npc',
          speakerName: 'Dr. Chaos',
          text: 'Hahaha! Nyalimu besar juga, Peneliti Muda! Kau pikir sedikit hafalan tentang kacang polong sudah cukup untuk melawanku?'
        },
        {
          speaker: 'player',
          speakerName: 'Peneliti Muda',
          text: 'Ini bukan sekadar hafalan! Hukum pewarisan sifat Mendel adalah logika sains nyata yang terbukti secara matematis!'
        },
        {
          speaker: 'npc',
          speakerName: 'Dr. Chaos',
          text: 'Bagus, tunjukkan kemampuan analisismu kalau begitu! Pada Stage 8 ini, kau harus menembus Duel Pertanyaan Genetika Tingkat Tinggi (HOTS) melawanku untuk membuktikan kemampuanmu. Bersiaplah kalah!'
        }
      ]
    }
  }
];
