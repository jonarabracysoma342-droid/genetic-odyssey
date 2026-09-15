// src/components/rpg/questData.js
// Alur Cerita RPG: Quest Item, Dialog Persiapan, dan Progresi Dunia Mendel

export const QUEST_ITEMS = [
  {
    id: 'magnifying_glass',
    name: 'Kaca Pembesar Presisi',
    stageId: 1,
    icon: '🔍',
    iconSrc: '/assets/rpg/quests/item_magnifying_glass.png',
    x: 488,
    y: 130, // Di dekat papan nama / gerbang utara
    scene: 'outdoor',
    description: 'Kaca pembesar untuk mengamati fenotipe polong dan bunga ercis.',
    hint: 'Cari di dekat papan selamat datang jalan masuk utara.'
  },
  {
    id: 'dna_vial',
    name: 'Tabung Sampel DNA Kosong',
    stageId: 2,
    icon: '🧪',
    iconSrc: '/assets/rpg/quests/item_dna_vial.png',
    x: 140,
    y: 450, // Di rumput dekat tunggul pohon barat daya
    scene: 'outdoor',
    description: 'Tabung steril kaca untuk menampung molekul alel Prof. Rosalind.',
    hint: 'Tergeletak di dekat tunggul pohon dan semak barat daya biara.'
  },
  {
    id: 'gear_cog',
    name: 'Roda Gigi Mesin Pemilah',
    stageId: 3,
    icon: '⚙️',
    iconSrc: '/assets/rpg/quests/item_gear_cog.png',
    x: 772,
    y: 195, // Di dekat sumur batu timur laut
    scene: 'outdoor',
    description: 'Roda gigi kuningan untuk menghidupkan mesin pemisah gamet Gigi.',
    hint: 'Tercecer di dekat sumur batu biara di timur laut.'
  },
  {
    id: 'punnett_chalk',
    name: 'Kapur Hitung Mendel',
    stageId: 4,
    icon: '✏️',
    iconSrc: '/assets/rpg/quests/item_punnett_chalk.png',
    x: 440,
    y: 315, // Di undakan batu dekat air mancur tengah
    scene: 'outdoor',
    description: 'Kapur murni yang digunakan Pater Mendel untuk menulis di papan catur.',
    hint: 'Tertinggal di undakan batu dekat air mancur pusat biara.'
  },
  {
    id: 'harvest_shears',
    name: 'Gunting Panen Emas',
    stageId: 5,
    icon: '✂️',
    iconSrc: '/assets/rpg/quests/item_harvest_shears.png',
    x: 720,
    y: 280, // Di pagar pembatas timur
    scene: 'outdoor',
    description: 'Gunting tajam untuk memetik polong ercis kuning dan hijau Pak Barnaby.',
    hint: 'Tergantung di tiang kayu promenade timur.'
  },
  {
    id: 'dihybrid_ledger',
    name: 'Buku Catatan Dihibrid',
    stageId: 6,
    icon: '📖',
    iconSrc: '/assets/rpg/quests/item_dihybrid_ledger.png',
    x: 640,
    y: 360, // Di meja perapian kabin dalam
    scene: 'cabin_interior',
    description: 'Buku jurnal 16 kombinasi sifat milik Kak Fafa.',
    hint: 'Cari di atas meja riset di dalam Kabin Riset Dihibrid.'
  },
  {
    id: 'bio_crystal',
    name: 'Kristal Stabilisator Scanner',
    stageId: 7,
    icon: '💎',
    iconSrc: '/assets/rpg/quests/item_bio_crystal.png',
    x: 885,
    y: 470, // Di semak bunga tenggara
    scene: 'outdoor',
    description: 'Kristal pemancar frekuensi untuk mereparasi sensor Snooper Drone.',
    hint: 'Terjatuh di hamparan bunga liar tenggara biara.'
  },
  {
    id: 'castle_insignia',
    name: 'Segel Kunci Kastil Dr. Chaos',
    stageId: 8,
    icon: '🗝️',
    iconSrc: '/assets/rpg/quests/item_castle_insignia.png',
    x: 512,
    y: 180, // Di tengah boulevard utara
    scene: 'outdoor',
    description: 'Segel kuno biara untuk membuka gerbang besi dan menantang Dr. Chaos.',
    hint: 'Muncul di jalan utama setelah seluruh 7 stage berhasil dituntaskan.'
  }
];

// Dialog berantai:
// 1. not_started: NPC meminta tolong mencari item persiapan
// 2. has_item: Pemain menyerahkan item ke NPC, NPC berterima kasih & membuka Stage
// 3. completed: Stage sudah diselesaikan, NPC memberi apresiasi & membimbing ke stage berikutnya
export const NPC_QUEST_STORIES = {
  npc_1_monk: {
    stageId: 1,
    requiredItemId: 'magnifying_glass',
    greetingDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Halo Bruder Thomas! Bagaimana kabar kebun ercis hari ini?' },
      { speaker: 'npc', speakerName: 'Bruder Thomas', text: 'Salam berkah, Peneliti Muda! Tanaman ercis sedang berbunga indah di bawah mentari.' },
      { speaker: 'npc', speakerName: 'Bruder Thomas', text: 'Senang melihatmu berkunjung ke Biara Santo Thomas! Semoga risetmu membawa banyak ilmu bermanfaat.' }
    ],
    notStartedDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Halo Bruder Thomas! Sedang sibuk apa di petak kebun ercis ini?' },
      { speaker: 'npc', speakerName: 'Bruder Thomas', text: 'Salam berkah, Peneliti Muda! Aku sedang mencatat keajaiban tanaman ercis biara ini. Coba perhatikan polong dan bunga di sekelilingmu!' },
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Wah, benar! Ada yang bunganya ungu pekat, ada yang putih... bijinya juga ada yang bulat licin dan keriput!' },
      { speaker: 'npc', speakerName: 'Bruder Thomas', text: 'Mata yang jeli! Tapi gawat, Kaca Pembesar Presisi milikku terjatuh di jalan masuk dekat papan gerbang utara. Bisakah kamu mencarikannya agar riset fenotipe ercis bisa kita mulai?' }
    ],
    searchingDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Bruder Thomas, saya masih mencari Kaca Pembesar Presisi milik Bruder.' },
      { speaker: 'npc', speakerName: 'Bruder Thomas', text: 'Terima kasih atas bantuanmu, anak muda! Kaca pembesar itu berbingkai kuningan antik.' },
      { speaker: 'npc', speakerName: 'Bruder Thomas', text: 'Coba telusuri jalan setapak di dekat papan nama selamat datang di gerbang utara biara.' }
    ],
    turnInDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Bruder Thomas! Aku menemukan Kaca Pembesar Presisi di dekat papan gerbang utara!' },
      { speaker: 'npc', speakerName: 'Bruder Thomas', text: 'Puji syukur! Sekarang kita bisa mengamati 7 sifat beda fenotipe ercis dengan sangat jernih!' },
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Bunga ungu vs putih, biji bulat vs keriput, dan warna kuning vs hijau... semua tampak jelas!' },
      { speaker: 'npc', speakerName: 'Bruder Thomas', text: 'Bagus sekali! Ambil catatanmu, mari kita mulai observasi di Stage 1: Taman Misteri!' }
    ],
    completedDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Bruder Thomas! Saya telah selesai mencatat seluruh 7 sifat fisik tanaman ercis di kebun biara!' },
      { speaker: 'npc', speakerName: 'Bruder Thomas', text: 'Puji syukur! Kerja observasi yang sangat cermat, Peneliti Muda! Kamu berhasil mendeteksi fenotipe bunga ungu vs putih, biji bulat vs keriput, dan warna kuning vs hijau dengan sangat jernih!' },
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Lalu ke mana saya harus melangkah selanjutnya agar bisa memahami asal-usul kode sifat-sifat ini, Bruder?' },
      { speaker: 'npc', speakerName: 'Bruder Thomas', text: 'Panduan alurmu: berjalanlah ke arah BARAT (kiri) melewati jalan setapak di samping air mancur biara. Temuilah Prof. Rosalind di Meja Laboratorium Genetika Barat. Beliau akan memandumu merangkai gen dan alel DNA di Stage 2!' }
    ]
  },
  npc_2_geneticist: {
    stageId: 2,
    requiredItemId: 'dna_vial',
    greetingDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Halo Prof. Rosalind! Sedang sibuk apa di laboratorium barat?' },
      { speaker: 'npc', speakerName: 'Prof. Rosalind', text: 'Halo Peneliti Muda! Senang melihatmu berkunjung ke lab kami.' },
      { speaker: 'npc', speakerName: 'Prof. Rosalind', text: 'Selesaikan dulu observasi tanaman bersama Bruder Thomas di kebun ya!' }
    ],
    notStartedDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Selamat siang Prof. Rosalind! Sedang mengamati preparat apa di mikroskop?' },
      { speaker: 'npc', speakerName: 'Prof. Rosalind', text: 'Ah, pas sekali kamu datang! Aku sedang mengekstrak materi pembawa sifat di dalam inti sel tanaman ercis.' },
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Apakah itu gen dan pasangan alel dominan-resesif di dalam untaian DNA, Prof?' },
      { speaker: 'npc', speakerName: 'Prof. Rosalind', text: 'Tepat seratus! Tapi gawat, Tabung Sampel DNA Kosong kita tertinggal di dekat tunggul pohon barat daya. Tolong ambilkan agar kita bisa merangkai genotipe!' }
    ],
    searchingDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Prof. Rosalind, saya masih mencari Tabung Sampel DNA Kosong.' },
      { speaker: 'npc', speakerName: 'Prof. Rosalind', text: 'Tabung itu terbuat dari kaca bening dengan segel biru steril.' },
      { speaker: 'npc', speakerName: 'Prof. Rosalind', text: 'Coba telusuri rumput di dekat tunggul pohon dan semak di bagian barat daya biara.' }
    ],
    turnInDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Profesor, ini Tabung Sampel DNA yang steril dari dekat tunggul pohon!' },
      { speaker: 'npc', speakerName: 'Prof. Rosalind', text: 'Hebat! Sampel alel bisa segera dimasukkan. Ingat: alel dominan bersimbol huruf BESAR dan resesif huruf kecil.' },
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Saya siap merangkai genotipe homozigot dan heterozigot!' },
      { speaker: 'npc', speakerName: 'Prof. Rosalind', text: 'Bagus! Buka meja riset dan selesaikan Stage 2: Penyusun Gen!' }
    ],
    completedDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Prof. Rosalind! Saya berhasil merangkai pasangan alel dominan dan resesif di meja laboratorium!' },
      { speaker: 'npc', speakerName: 'Prof. Rosalind', text: 'Luar biasa, Peneliti Muda! Kamu telah memahami perbedaan genotipe homozigot dominan (BB), homozigot resesif (bb), dan heterozigot (Bb) secara presisi!' },
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Ketika sel tanaman ini bereproduksi, bagaimana cara pasangan alel ini diteruskan ke keturunannya, Prof? Ke mana saya harus pergi?' },
      { speaker: 'npc', speakerName: 'Prof. Rosalind', text: 'Panduan alurmu: berjalanlah ke arah SELATAN (bawah) menuju mesin uap beroda gigi di pelataran selatan. Di sana ada Gigi si Mekanik! Dia butuh bantuanmu memilah sel gamet untuk membuktikan Hukum Segregasi Bebas Mendel I di Stage 3!' }
    ]
  },
  npc_3_mechanic: {
    stageId: 3,
    requiredItemId: 'gear_cog',
    greetingDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Hai Gigi! Mesin uapnya keren sekali!' },
      { speaker: 'npc', speakerName: 'Gigi si Mekanik', text: 'Hai hai! Suara mesin biara merdu sekali hari ini kan?' },
      { speaker: 'npc', speakerName: 'Gigi si Mekanik', text: 'Pelajari dulu dasar genotipe bersama Prof. Rosalind di lab barat, nanti kita oprek mesin pemilah gamet bersama!' }
    ],
    notStartedDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Hai Gigi! Mesin apa ini, berputar-putar dengan tabung kaca bercahaya?' },
      { speaker: 'npc', speakerName: 'Gigi si Mekanik', text: 'Hehe, keren kan? Ini mesin pemisah gamet ciptaanku untuk membuktikan Hukum Mendel I (Hukum Segregasi Bebas)!' },
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Hukum Segregasi? Maksudnya pemisahan pasangan alel saat pembentukan sel kelamin ya?' },
      { speaker: 'npc', speakerName: 'Gigi si Mekanik', text: 'Yap, pintar! Tapi Roda Gigi Pemilah kuningan mesin ini copot dan menggelinding ke dekat sumur batu timur laut. Tolong carikan roda giginya ya!' }
    ],
    searchingDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Gigi, di mana tadi roda giginya tercecer?' },
      { speaker: 'npc', speakerName: 'Gigi si Mekanik', text: 'Di dekat sumur batu biara sebelah timur laut!' },
      { speaker: 'npc', speakerName: 'Gigi si Mekanik', text: 'Roda gigi kuningan itu berkilau keemasan kalau kena pantulan air dan cahaya.' }
    ],
    turnInDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Gigi! Aku menemukan Roda Gigi Pemilah di dekat dinding sumur batu!' },
      { speaker: 'npc', speakerName: 'Gigi si Mekanik', text: 'WAAAH MANTAP! *KLIK-KLAK* Pas banget! Dengarkan dengungan turbinnya, mesin segregasi aktif kembali!' },
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Wah, tabung vakumnya siap memisahkan pasangan alel induk menjadi gamet haploid!' },
      { speaker: 'npc', speakerName: 'Gigi si Mekanik', text: 'Tancap gas! Tarik tuasnya dan mainkan Stage 3: Pabrik Gamet!' }
    ],
    completedDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Gigi! Mesin pemilah gametnya berhasil memisahkan pasangan alel dengan sempurna!' },
      { speaker: 'npc', speakerName: 'Gigi si Mekanik', text: 'WUHUUU! Keren abis! Induk heterozigot Aa terbukti membelah adil menjadi 50% gamet A dan 50% gamet a! Hukum Segregasi Bebas Mendel I sukses kita buktikan!' },
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Lalu setelah gamet jantan dan betina terpisah, bagaimana cara kita menghitung kemungkinan kombinasinya, Gigi? Ke mana arah selanjutnya?' },
      { speaker: 'npc', speakerName: 'Gigi si Mekanik', text: 'Panduan alurmu: berjalanlah ke arah BARAT LAUT (kiri-atas) menuju meja papan catur biara. Pater Gregor Mendel sendiri telah menunggumu di sana untuk mengombinasikan gamet di papan Punnett 2×2 di Stage 4!' }
    ]
  },
  npc_4_mendel: {
    stageId: 4,
    requiredItemId: 'punnett_chalk',
    greetingDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Salam hormat Pater Gregor Mendel!' },
      { speaker: 'npc', speakerName: 'Pater Gregor Mendel', text: 'Damai sejahtera untukmu, anakku. Rahasia penciptaan tersembunyi di dalam keteraturan alam semesta.' },
      { speaker: 'npc', speakerName: 'Pater Gregor Mendel', text: 'Bicaralah dengan rekan-rekanmu di kebun sebelum kita mulai menghitung di papan catur!' }
    ],
    notStartedDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Suatu kehormatan besar bisa bertemu langsung dengan Pater Gregor Mendel!' },
      { speaker: 'npc', speakerName: 'Pater Gregor Mendel', text: 'Selamat datang anak muda! Di hadapanku ini ada papan catur Punnett 2×2 untuk memprediksi probabilitas keturunan monohibrid.' },
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Diagram Punnett untuk persilangan monohibrid Bb × Bb ya, Pater?' },
      { speaker: 'npc', speakerName: 'Pater Gregor Mendel', text: 'Benar sekali! Tapi Kapur Hitung khususku tertinggal saat aku merenung di undakan air mancur pusat biara. Tolong bawakan kapur itu ke mari ya!' }
    ],
    searchingDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Pater Mendel, di mana Kapur Hitung itu berada?' },
      { speaker: 'npc', speakerName: 'Pater Gregor Mendel', text: 'Kapur Hitung murni itu berwarna putih bersih dalam wadah kayu kecil.' },
      { speaker: 'npc', speakerName: 'Pater Gregor Mendel', text: 'Coba cari di sekitar undakan batu kolam air mancur tengah biara.' }
    ],
    turnInDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Pater Mendel, ini Kapur Hitung yang tertinggal di undakan batu air mancur!' },
      { speaker: 'npc', speakerName: 'Pater Gregor Mendel', text: 'Luar biasa! Kapur ini akan menorehkan bukti ilmiah rasio genotipe 1:2:1 dan rasio fenotipe 3:1.' },
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Saya siap mengawinkan alel baris dan kolom di papan Punnett!' },
      { speaker: 'npc', speakerName: 'Pater Gregor Mendel', text: 'Mari kita mulai kalkulasi di Stage 4: Laboratorium Punnett!' }
    ],
    completedDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Pater Gregor Mendel! Seluruh kotak diagram Punnett 2×2 telah saya isi dengan benar!' },
      { speaker: 'npc', speakerName: 'Pater Gregor Mendel', text: 'Puji Tuhan, sungguh analitis yang tajam! Kamu telah membuktikan secara matematis rasio genotipe 1 BB : 2 Bb : 1 bb dan rasio fenotipe klasik 3 ungu : 1 putih!' },
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Apakah perbandingan rasio 3 banding 1 di papan tulis ini benar-benar terbukti pada ribuan biji ercis di kebun nyata, Pater? Ke mana saya harus membuktikannya?' },
      { speaker: 'npc', speakerName: 'Pater Gregor Mendel', text: 'Panduan alurmu: berjalanlah melintasi air mancur ke arah TIMUR (kanan) menuju promenade kebun biara. Temuilah Pak Barnaby si Petani. Beliau sedang bersiap memanen ribuan polong ercis untuk kamu uji di Stage 5!' }
    ]
  },
  npc_5_farmer: {
    stageId: 5,
    requiredItemId: 'harvest_shears',
    greetingDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Halo Pak Barnaby! Tanaman ercisnya segar sekali!' },
      { speaker: 'npc', speakerName: 'Pak Barnaby', text: 'Halo nak! Ercis-ercis ini baru bertunas dan disiram air embun segar.' },
      { speaker: 'npc', speakerName: 'Pak Barnaby', text: 'Kuasai dulu dasar papan catur bersama Pater Mendel sebelum musim panen tiba ya!' }
    ],
    notStartedDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Wah, banyak sekali karung ercisnya, Pak Barnaby! Kelihatannya kewalahan?' },
      { speaker: 'npc', speakerName: 'Pak Barnaby', text: 'Aduh, syukurlah kamu lewat! Hasil panen raya kebun kita melimpah ruah, tapi biji kuning dan biji hijaunya masih tercampur aduk di bak!' },
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Bagaimana aturan pemilahannya agar sesuai standar biara, Pak?' },
      { speaker: 'npc', speakerName: 'Pak Barnaby', text: 'Pisahkan biji kuning dominan dan hijau resesif! Tapi Gunting Panen Emas milik biara hilang tersangkut di tiang kayu pagar timur. Tolong ambilkan ya nak!' }
    ],
    searchingDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Pak Barnaby, di mana Gunting Panen Emas itu tergantung?' },
      { speaker: 'npc', speakerName: 'Pak Barnaby', text: 'Gunting itu berkilau keemasan dengan pegangan kayu.' },
      { speaker: 'npc', speakerName: 'Pak Barnaby', text: 'Tersangkut di tiang kayu pagar promenade sebelah timur biara. Ayo periksa pagar timur ya nak!' }
    ],
    turnInDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Pak Barnaby, Gunting Panen Emas tergantung di tiang pagar timur, ini guntingnya!' },
      { speaker: 'npc', speakerName: 'Pak Barnaby', text: 'Horeee! Tajam dan berkilau! Sekarang kita bisa memetik polong F2 tanpa merusak batangnya.' },
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Keranjang panen sudah siap menampung perbandingan rasio 3 dominan : 1 resesif!' },
      { speaker: 'npc', speakerName: 'Pak Barnaby', text: 'Ayo ke ladang dan mulai Stage 5: Tantangan Panen Raya!' }
    ],
    completedDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Pak Barnaby! Seluruh biji panen raya sudah saya sortir dan hitung perbandingannya!' },
      { speaker: 'npc', speakerName: 'Pak Barnaby', text: 'Aduh senangnya hatiku, nak! Dari ribuan biji ercis yang kita petik, perbandingannya pas mendekati 3 biji kuning : 1 biji hijau! Teori Pater Mendel terbukti di tanah nyata!' },
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Pengamatan satu sifat beda sudah terbukti kokoh, Pak. Bagaimana jika kita meneliti dua sifat beda sekaligus? Ke mana saya harus melangkah?' },
      { speaker: 'npc', speakerName: 'Pak Barnaby', text: 'Panduan alurmu: berjalanlah ke arah TIMUR LAUT (kanan-atas) menuju pintu Kabin Kayu Riset Dihibrid. Temuilah Kak Fafa di sana! Dia sedang menyiapkan analisis persilangan dua sifat beda sekaligus di Stage 6!' }
    ]
  },
  npc_6_assistant: {
    stageId: 6,
    requiredItemId: 'dihybrid_ledger',
    greetingDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Halo Kak Fafa! Kabin risetnya hangat dan nyaman ya!' },
      { speaker: 'npc', speakerName: 'Kak Fafa', text: 'Hai peneliti cilik! Kabin riset dihibrid selalu terbuka untuk peneliti rajin.' },
      { speaker: 'npc', speakerName: 'Kak Fafa', text: 'Selesaikan dulu panen raya bersama Pak Barnaby sebelum kita meneliti kombinasi 16 kotak Punnett!' }
    ],
    notStartedDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Halo Kak Fafa! Hangat sekali kabin riset ini. Sedang menyiapkan apa di papan tulis perapian?' },
      { speaker: 'npc', speakerName: 'Kak Fafa', text: 'Hai Peneliti Muda! Sekarang kita naik level ke Hukum Mendel II: Asortasi Bebas dengan mengamati DUA sifat beda sekaligus!' },
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Dua sifat sekaligus? Maksudnya seperti bentuk biji (bulat/keriput) sekaligus warna biji (kuning/hijau) ya, Kak?' },
      { speaker: 'npc', speakerName: 'Kak Fafa', text: 'Tepat seratus! Tapi Buku Catatan Dihibrid 16 kotak Punnett milikku tertinggal di atas meja di dalam kabin perapian. Masuklah dan ambil bukunya ya!' }
    ],
    searchingDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Kak Fafa, di mana letak persis Buku Catatan Dihibrid itu?' },
      { speaker: 'npc', speakerName: 'Kak Fafa', text: 'Buku bersampul kulit tebal dengan pita penanda hijau.' },
      { speaker: 'npc', speakerName: 'Kak Fafa', text: 'Masuklah ke dalam kabin lewat pintu kayu di sebelahku, bukunya ada di atas meja perapian kabin!' }
    ],
    turnInDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Kak Fafa, ini Buku Catatan Dihibrid dari meja perapian di dalam kabin!' },
      { speaker: 'npc', speakerName: 'Kak Fafa', text: 'Keren banget! Matriks 16 kotak Punnett Square siap diisi dengan 4 macam gamet: AB, Ab, aB, dan ab!' },
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Hukum Mendel II: Asortasi Bebas dua sifat beda akan segera terbukti!' },
      { speaker: 'npc', speakerName: 'Kak Fafa', text: 'Ayo mulai Stage 6: Petualangan Dihibrid!' }
    ],
    completedDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Kak Fafa! Matriks dihibrid 16 kotak Punnett Square berhasil saya pecahkan tuntas!' },
      { speaker: 'npc', speakerName: 'Kak Fafa', text: 'HEBAT BANGET! Rasio agung Hukum Mendel II (Asortasi Bebas) yaitu 9 bulat kuning : 3 bulat hijau : 3 keriput kuning : 1 keriput hijau terbukti tanpa cela!' },
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Tapi Kak Fafa, ada suara dengungan sensor darurat dari arah semak bunga... ke mana saya harus mencari sumber masalah ini?' },
      { speaker: 'npc', speakerName: 'Kak Fafa', text: 'Panduan alurmu: segera lari ke arah TENGGARA (kanan-bawah) di hamparan semak bunga liar. Temuilah Snooper Drone! Sensornya mendeteksi adanya mutasi liar dan penyimpangan genetik aneh buatan Dr. Chaos di Stage 7!' }
    ]
  },
  npc_7_drone: {
    stageId: 7,
    requiredItemId: 'bio_crystal',
    greetingDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Hai Snooper Drone! Sedang memindai apa?' },
      { speaker: 'npc', speakerName: 'Snooper Drone', text: 'BZZT... PATROLI RUTIN AKTIF. Sensor memantau stabilitas biara.' },
      { speaker: 'npc', speakerName: 'Snooper Drone', text: 'Selesaikan seluruh riset hukum Mendel sebelum membantu kalibrasi mutasi!' }
    ],
    notStartedDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Snooper Drone, apa yang sedang dideteksi oleh sensor optikmu di kebun tenggara ini?' },
      { speaker: 'npc', speakerName: 'Snooper Drone', text: 'BZZT... PERINGATAN ANOMALI! Tanaman di petak ini mengalami penyimpangan semu dan mutasi genetik buatan Dr. Chaos!' },
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Penyimpangan semu seperti kriptomeri dan intermediet ya, Drone?' },
      { speaker: 'npc', speakerName: 'Snooper Drone', text: 'BENAR! Tapi Kristal Stabilisator sensor saya pecah disabotase dan jatuh di semak bunga tenggara. Tolong ambilkan agar sistem audit aktif!' }
    ],
    searchingDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Snooper Drone, di mana sinyal Kristal Stabilisator terdeteksi?' },
      { speaker: 'npc', speakerName: 'Snooper Drone', text: 'BZZT-KLIK... Kristal memancarkan gelombang optik ungu berpendar.' },
      { speaker: 'npc', speakerName: 'Snooper Drone', text: 'Sinyal optik berasal dari hamparan semak bunga liar di sudut tenggara biara!' }
    ],
    turnInDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Snooper Drone, pasang Kristal Stabilisator baru ini ke soket optikmu!' },
      { speaker: 'npc', speakerName: 'Snooper Drone', text: 'BZZT-PING! KALIBRASI 100%! Sensor forensik mendeteksi virus data dan anomali mutasi di 3 kasus sabotase!' },
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Kita akan audit tabung gamet, perbaiki papan catur monohibrid, dan stabilkan kristal intermediet!' },
      { speaker: 'npc', speakerName: 'Snooper Drone', text: 'SISTEM SIAP! Masuki Stage 7: Jebakan Mutasi sekarang juga!' }
    ],
    completedDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Snooper Drone! Seluruh manipulasi mutasi genetik dan penyimpangan semu telah dinetralkan!' },
      { speaker: 'npc', speakerName: 'Snooper Drone', text: 'BZZT-KLIK! STATUS OPERASIONAL: 100% STERIL! Data genotipe intermediet, kriptomeri, dan polimeri telah diamankan kembali ke basis data biara!' },
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Di mana lokasi dalang sabotase ini bersembunyi sekarang, Drone? Tunjukkan arahnya!' },
      { speaker: 'npc', speakerName: 'Snooper Drone', text: 'Panduan alurmu: SINYAL DILACAK! Berjalanlah lurus ke arah UTARA (atas) menyusuri boulevard utama menuju Gerbang Besi Kastil. Dr. Chaos menunggumu di sana! Hadapi dia dalam duel sains pamungkas di Stage 8!' }
    ]
  },
  npc_8_chaos: {
    stageId: 8,
    requiredItemId: 'castle_insignia',
    greetingDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Dr. Chaos! Mengapa kau mengurung diri di balik gerbang besi itu?' },
      { speaker: 'npc', speakerName: 'Dr. Chaos', text: 'Hahaha! Peneliti ingusan seperti dirimu tak punya hak bicara denganku.' },
      { speaker: 'npc', speakerName: 'Dr. Chaos', text: 'Tuntaskan dulu seluruh riset Mendel di seluruh biara jika berniat menantangku!' }
    ],
    notStartedDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Buka gerbang ini, Dr. Chaos! Kami datang untuk menuntut jawaban atas kekacauan genetik di biara ini!' },
      { speaker: 'npc', speakerName: 'Dr. Chaos', text: 'Hahaha! Kau pikir hukum Mendel kuno itu bisa menjelaskan keacakan mutasi hebat ciptaanku?' },
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Hukum Pewarisan Sifat Gregor Mendel adalah hukum alam yang valid dan kokoh!' },
      { speaker: 'npc', speakerName: 'Dr. Chaos', text: 'Buktikan jika kau mampu! Tapi gerbang kastil ini terkunci oleh Segel Kuno Biara di jalan utama utara. Bawa segel itu kemari jika kau berani menantangku dalam duel sains!' }
    ],
    searchingDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Dr. Chaos, gerbang ini akan segera kubuka!' },
      { speaker: 'npc', speakerName: 'Dr. Chaos', text: 'Omong kosong! Segel itu terbuat dari batu obsidian berukir lambang kastil.' },
      { speaker: 'npc', speakerName: 'Dr. Chaos', text: 'Cari Segel Kunci Kastil di jalan utama utara biara jika kau benar-benar berani!' }
    ],
    turnInDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Ini Segel Kunci Kastilmu, Dr. Chaos! Pertahankan teori kotormu di hadapan sains sejati!' },
      { speaker: 'npc', speakerName: 'Dr. Chaos', text: 'Hahaha! Berani sekali kau membuka gerbang kastilku! Masuklah ke arena, Peneliti Muda!' },
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Hukum Pewarisan Sifat Gregor Mendel akan meruntuhkan seluruh manipulasi genetikamu!' },
      { speaker: 'npc', speakerName: 'Dr. Chaos', text: 'Buktikan di Stage 8: Duel Terakhir Dr. Chaos!' }
    ],
    completedDialogues: [
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Dr. Chaos! Kebenaran Hukum Pewarisan Sifat Gregor Mendel telah membungkam seluruh manipulasi mutasimu!' },
      { speaker: 'npc', speakerName: 'Dr. Chaos', text: 'Ugh... tidak mungkin! Argumen ilmiah kalian begitu kokoh dan tak terbantahkan... sains murni telah mengalahkan keangkuhanku!' },
      { speaker: 'player', speakerName: 'Peneliti Muda', text: 'Hukum Mendel adalah hukum keteraturan alam semesta yang indah untuk kebaikan dan kemajuan peradaban!' },
      { speaker: 'npc', speakerName: 'Pater Mendel & Tim', text: 'Panduan alurmu: SELAMAT, Peneliti Muda! Seluruh ekspedisi riset genetika Biara Mendel telah kamu tuntaskan dengan nilai sempurna! Kamu bebas menjelajahi kebun, membaca arsip Genopedia, atau menguji keahlianmu di Kuis HOTS!' }
    ]
  }
};
