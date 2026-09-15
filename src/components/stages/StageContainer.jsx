import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../services/sound';
import { 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Lightbulb, 
  CheckCircle2, 
  Award, 
  Layers, 
  HelpCircle,
  Gamepad2
} from 'lucide-react';
import { Stage1MysteryGarden } from './Stage1MysteryGarden';
import { Stage2GeneBuilder } from './Stage2GeneBuilder';
import { Stage3GameteFactory } from './Stage3GameteFactory';
import { Stage4PunnettLab } from './Stage4PunnettLab';
import { Stage5HarvestChallenge } from './Stage5HarvestChallenge';
import { Stage6DihybridAdventure } from './Stage6DihybridAdventure';
import { Stage7MutationTrap } from './Stage7MutationTrap';
import { BossBattleDrChaos } from './BossBattleDrChaos';
import { KakNisaStageBriefing } from './KakNisaStageBriefing';

const STAGE_TUTORIALS = {
  1: {
    title: 'Taman Misteri (C1 - Mengingat)',
    illustration: '/assets/stage1_garden_illustration.webp',
    topic: 'Pengenalan Sifat Fisik (Fenotipe)',
    interactiveStepGuide: [
      {
        step: 1,
        title: 'Lihat Misi di Layar Atas',
        badge: 'Target Sifat',
        desc: 'Baca instruksi misi pada kartu atas. Kamu akan diminta mencari tanaman ercis dengan ciri fisik tertentu (misal: Bunga Ungu atau Biji Bulat).',
        tip: 'Warna bunga, bentuk biji, dan warna polong adalah contoh FENOTIPE (sifat fisik yang tampak).'
      },
      {
        step: 2,
        title: 'Jelajahi Barisan Kebun',
        badge: 'Eksplorasi',
        desc: 'Geser barisan kebun tanaman ercis ke kiri dan kanan menggunakan mouse atau sentuhan tangan untuk memeriksa seluruh tanaman.',
        tip: 'Ada 8 varietas tanaman ercis di kebun biara dengan kombinasi sifat yang unik.'
      },
      {
        step: 3,
        title: 'Klik Tanaman yang Cocok',
        badge: 'Seleksi Sifat',
        desc: 'Klik langsung kartu tanaman yang memenuhi kriteria misi. Tanaman terpilih akan ditandai dengan bingkai hijau menyala.',
        tip: 'Kamu bisa memilih lebih dari satu tanaman jika ada beberapa yang memiliki sifat target sama.'
      },
      {
        step: 4,
        title: 'Verifikasi & Lanjut Misi',
        badge: 'Evaluasi',
        desc: 'Tekan tombol "Verifikasi Hasil". Jika seluruh pilihanmu benar, kamu mendapatkan bintang dan melaju ke misi berikutnya!',
        tip: 'Hati-hati, jika salah nyawamu akan berkurang ❤️.'
      }
    ],
    interactivePreview: {
      question: 'Coba Latihan Cepat: Mana yang termasuk sifat fenotipe tanaman ercis?',
      options: [
        { text: '🌺 Warna Mahkota Bunga Ungu', isCorrect: true, reason: 'Tepat! Warna bunga ungu adalah sifat fisik (fenotipe) dominan.' },
        { text: '🧬 Simbol Genotipe Pp', isCorrect: false },
        { text: '🧪 Molekul Enzim Ribosom', isCorrect: false }
      ]
    }
  },
  2: {
    title: 'Penyusun Gen (C2 - Memahami)',
    illustration: '/assets/sub_mendel_peas.webp',
    topic: 'Genotipe & Alel Dominan/Resesif',
    interactiveStepGuide: [
      {
        step: 1,
        title: 'Pahami Deskripsi Sifat',
        badge: 'Analisis Gen',
        desc: 'Baca sifat target pada kartu tengah (misal: "Bunga Ungu Heterozigot" atau "Bunga Putih Homozigot Resesif").',
        tip: 'Homozigot = alel kembar sejenis (PP atau pp). Heterozigot = alel campuran berbeda (Pp).'
      },
      {
        step: 2,
        title: 'Pilih Huruf Alel',
        badge: 'Alel DNA',
        desc: 'Pilih kartu alel di slot bawah. Huruf BESAR melambangkan sifat dominan, huruf KECIL melambangkan sifat resesif.',
        tip: 'Huruf besar selalu ditulis di depan saat membentuk heterozigot (misal: Pp bukan pP).'
      },
      {
        step: 3,
        title: 'Rangkai Genotipe 2 Alel',
        badge: 'Sintesis',
        desc: 'Tempatkan 2 kartu alel ke dalam slot DNA untuk membentuk genotipe diploid yang lengkap.',
        tip: 'Organisme diploid selalu mewarisi 1 alel dari ayah dan 1 alel dari ibu.'
      },
      {
        step: 4,
        title: 'Buka Semua Koleksi Gen',
        badge: 'Koleksi',
        desc: 'Selesaikan 4 kombinasi genotipe untuk membuka seluruh peta genetik dan meraih 3 Bintang sempurna!',
        tip: 'Gunakan tombol Reset jika ingin mengatur ulang susunan alel.'
      }
    ],
    interactivePreview: {
      question: 'Coba Latihan Cepat: Manakah penulisan genotipe heterozigot yang benar?',
      options: [
        { text: 'Pp (Huruf kapital di depan)', isCorrect: true, reason: 'Sempurna! Penulisan heterozigot mendahulukan huruf kapital alel dominan.' },
        { text: 'pP', isCorrect: false },
        { text: 'PP (Homozigot Dominan)', isCorrect: false }
      ]
    }
  },
  3: {
    title: 'Pabrik Gamet (C3 - Menerapkan)',
    illustration: '/assets/subtopic_process.webp',
    topic: 'Hukum Segregasi & Pembentukan Gamet',
    interactiveStepGuide: [
      {
        step: 1,
        title: 'Periksa Genotipe Induk',
        badge: 'Induk Diploid',
        desc: 'Amati genotipe diploid induk (2n) yang tampil di corong atas mesin pemisah segregasi.',
        tip: 'Hukum Mendel I menyatakan pasangan alel berpisah secara bebas saat pembentukan sel kelamin.'
      },
      {
        step: 2,
        title: 'Pisahkan Pasangan Alel',
        badge: 'Hukum Mendel I',
        desc: 'Pilih alel tunggal (haploid) yang terpisah untuk dimasukkan ke dalam tabung gamet.',
        tip: 'Induk heterozigot Bb akan memisah menjadi gamet B dan gamet b.'
      },
      {
        step: 3,
        title: 'Jaga Keseimbangan Rasio',
        badge: 'Proporsi Gamet',
        desc: 'Pastikan rasio gamet yang kamu bentuk seimbang 50% : 50% sesuai hukum segregasi bebas.',
        tip: 'Kedua jenis gamet memiliki peluang sama besar untuk terbentuk (1 : 1).'
      },
      {
        step: 4,
        title: 'Kunci & Verifikasi Tabung',
        badge: 'Selesai',
        desc: 'Tekan tombol verifikasi jika tabung gamet telah terisi lengkap dan akurat.',
        tip: 'Konsistensi pemisahan alel adalah kunci meraih poin tertinggi!'
      }
    ],
    interactivePreview: {
      question: 'Coba Latihan Cepat: Induk dengan genotipe Bb akan menghasilkan jenis gamet apa saja?',
      options: [
        { text: 'Gamet B dan gamet b (perbandingan 1:1)', isCorrect: true, reason: 'Tepat! Pasangan alel Bb memisah menjadi 50% gamet B dan 50% gamet b.' },
        { text: 'Hanya gamet Bb', isCorrect: false },
        { text: 'Gamet BB dan gamet bb', isCorrect: false }
      ]
    }
  },
  4: {
    title: 'Laboratorium Punnett (C4 - Menganalisis)',
    illustration: '/assets/genopedia_punnett2x2.webp',
    topic: 'Persilangan Monohibrid & Punnett Square',
    interactiveStepGuide: [
      {
        step: 1,
        title: 'Amati Alel di Sumbu Papan',
        badge: 'Gamet Sumbu',
        desc: 'Perhatikan alel gamet jantan di baris atas dan alel gamet betina di kolom samping kiri papan Punnett 2x2.',
        tip: 'Papan Punnett adalah alat visual untuk menghitung probabilitas kombinasi genotipe anakan.'
      },
      {
        step: 2,
        title: 'Silangkan Baris & Kolom',
        badge: 'Persilangan',
        desc: 'Klik kotak persilangan, lalu masukkan kombinasi pertemuan alel dari kolom dan baris yang sesuai.',
        tip: 'Tulis selalu alel huruf kapital di awal (misal: P bertemu p menjadi Pp).'
      },
      {
        step: 3,
        title: 'Lengkapi 4 Kotak Anakan',
        badge: 'Kombinasi F1/F2',
        desc: 'Isi seluruh 4 kotak papan catur persilangan untuk melihat seluruh kemungkinan keturunan.',
        tip: 'Setiap kotak mewakili peluang 25% (1/4) dari total populasi keturunan.'
      },
      {
        step: 4,
        title: 'Analisis Rasio Fenotipe',
        badge: 'Rasio 3:1',
        desc: 'Setelah kotak terisi, buktikan rasio fenotipe klasik monohibrid dominan penuh yaitu 3 Ungu : 1 Putih.',
        tip: 'Genotipe PP dan Pp sama-sama menghasilkan fenotipe Bunga Ungu!'
      }
    ],
    interactivePreview: {
      question: 'Coba Latihan Cepat: Pada persilangan Pp × Pp, kotak pertemuan p × p menghasilkan fenotipe apa?',
      options: [
        { text: '🌸 Bunga Putih (Homozigot Resesif)', isCorrect: true, reason: 'Benar! Genotipe pp tidak membawa alel dominan P sehingga bunga berwarna putih.' },
        { text: '🌺 Bunga Ungu', isCorrect: false },
        { text: '🌼 Bunga Merah', isCorrect: false }
      ]
    }
  },
  5: {
    title: 'Tantangan Panen (C5 - Evaluasi)',
    illustration: '/assets/subtopic_result.webp',
    topic: 'Prediksi Fenotipe & Rasio Persilangan',
    interactiveStepGuide: [
      {
        step: 1,
        title: 'Pahami Target Rasio Panen',
        badge: 'Target Panen',
        desc: 'Perhatikan rasio panen yang diminta pada target misi (misal: rasio F2 monohibrid 3 Dominan : 1 Resesif).',
        tip: 'Di generasi F2, sifat resesif yang sempat tersembunyi di F1 akan muncul kembali.'
      },
      {
        step: 2,
        title: 'Petik Tanaman di Ladang',
        badge: 'Panen Selektif',
        desc: 'Klik tanaman ercis di kebun untuk memasukkannya ke dalam keranjang panen.',
        tip: 'Pilih tanaman bunga ungu (dominan) dan bunga putih (resesif) dengan perbandingan yang tepat.'
      },
      {
        step: 3,
        title: 'Atur Isi Keranjang Panen',
        badge: 'Penyeimbangan',
        desc: 'Jika salah petik, klik tanaman di dalam keranjang untuk mengembalikannya ke ladang.',
        tip: 'Keranjang menampung kombinasi 4 tanaman: 3 Dominan dan 1 Resesif (Rasio 3 : 1).'
      },
      {
        step: 4,
        title: 'Verifikasi Keranjang Panen',
        badge: 'Konfirmasi',
        desc: 'Tekan tombol "Verifikasi Hasil Panen" setelah komposisi keranjangmu pas dan sempurna!',
        tip: 'Kecepatan dan ketepatan perhitungan memberikan bonus skor maksimal.'
      }
    ],
    interactivePreview: {
      question: 'Coba Latihan Cepat: Berapa perbandingan tanaman dominan dan resesif pada panen F2 Mendel?',
      options: [
        { text: '3 Dominan : 1 Resesif (75% : 25%)', isCorrect: true, reason: 'Tepat sekali! Rasio fenotipe monohibrid Mendel klasik adalah 3:1.' },
        { text: '1 Dominan : 1 Resesif', isCorrect: false },
        { text: 'Semua 100% Dominan', isCorrect: false }
      ]
    }
  },
  6: {
    title: 'Petualangan Dihibrid (C6 - Menciptakan)',
    illustration: '/assets/genopedia_punnett4x4.webp',
    topic: 'Persilangan Dihibrid (2 Sifat Beda)',
    interactiveStepGuide: [
      {
        step: 1,
        title: 'Pahami 2 Sifat Beda',
        badge: 'Dihibrid AaBb',
        desc: 'Persilangan dihibrid mengamati 2 sifat sekaligus: bentuk biji (Bulat/Keriput) dan warna biji (Kuning/Hijau).',
        tip: 'Hukum Mendel II menyatakan gen untuk sifat berbeda memisah dan berpadu secara independen.'
      },
      {
        step: 2,
        title: 'Bentuk 4 Kombinasi Gamet',
        badge: 'Asortasi Bebas',
        desc: 'Rangkai 4 jenis gamet dari induk AaBb: AB, Ab, aB, dan ab ke sumbu atas dan kiri papan 4x4.',
        tip: 'Setiap gamet harus memuat 1 alel bentuk (A/a) dan 1 alel warna (B/b).'
      },
      {
        step: 3,
        title: 'Lengkapi Kisi Punnett 4x4',
        badge: '16 Kombinasi',
        desc: 'Silangkan gamet baris dan kolom untuk mengisi 16 kotak kombinasi anakan di papan Punnett.',
        tip: 'Tuliskan alel sejenis berdampingan: AABB, AaBb, AAbb, aaBB, aabb, dll.'
      },
      {
        step: 4,
        title: 'Buktikan Rasio 9:3:3:1',
        badge: 'Rasio Pamungkas',
        desc: 'Hitung 4 variasi fenotipe hasil persilangan untuk membuktikan rasio monumental 9:3:3:1!',
        tip: '9 Bulat-Kuning : 3 Bulat-Hijau : 3 Keriput-Kuning : 1 Keriput-Hijau.'
      }
    ],
    interactivePreview: {
      question: 'Coba Latihan Cepat: Berapa jumlah kotak papan Punnett pada persilangan dihibrid 2 sifat beda?',
      options: [
        { text: '16 Kotak Kombinasi (4 × 4 gamet)', isCorrect: true, reason: 'Tepat! 4 jenis gamet jantan × 4 jenis gamet betina = 16 kombinasi anakan.' },
        { text: '4 Kotak Kombinasi', isCorrect: false },
        { text: '8 Kotak Kombinasi', isCorrect: false }
      ]
    }
  },
  7: {
    title: 'Jebakan Mutasi (C5 - Evaluasi)',
    illustration: '/assets/genopedia_law1.webp',
    topic: 'Penyimpangan Semu & Evaluasi Forensik',
    interactiveStepGuide: [
      {
        step: 1,
        title: 'Kasus 1: Pindai Tabung Gamet',
        badge: 'Forensik Meiosis',
        desc: 'Klik tabung gamet untuk memindai muatan alelnya. Temukan tabung yang mengalami mutasi nondisjunction (gagal berpisah).',
        tip: 'Gamet normal adalah haploid (1 alel). Tabung mutan membawa alel ganda abnormal (misal: BB atau bb).'
      },
      {
        step: 2,
        title: 'Kasus 2: Restorasi Papan Punnett',
        badge: 'Monohibrid Glitch',
        desc: 'Amati papan persilangan Pp × Pp yang disabotase. Temukan slot p × p yang rusak dan pilih modul pengganti yang valid.',
        tip: 'Gamet p bertemu gamet p HANYA menghasilkan genotipe [pp] dengan fenotipe Bunga Putih!'
      },
      {
        step: 3,
        title: 'Kasus 3: Reaktor Intermediet',
        badge: 'Sifat Kodominan',
        desc: 'Netralkan reaktor persilangan Merah (MM) × Putih (mm) dengan memasang kristal pigmen yang tepat.',
        tip: 'Pada sifat intermediet, alel M dan m sama kuat sehingga menghasilkan warna Merah Muda (Pink).'
      },
      {
        step: 4,
        title: 'Raih Gelar Detektif Forensik',
        badge: 'Selesai Misi',
        desc: 'Selesaikan ketiga kasus sabotase untuk mengamankan laboratorium sebelum berhadapan dengan Dr. Chaos!',
        tip: 'Baca petunjuk scanner dengan seksama agar tidak salah memilih bukti forensik.'
      }
    ],
    interactivePreview: {
      question: 'Coba Latihan Cepat: Pada persilangan bunga Merah (MM) × Putih (mm) sifat intermediet, anakan F1 berwarna apa?',
      options: [
        { text: '🌸 Merah Muda / Pink (Perpaduan seimbang)', isCorrect: true, reason: 'Benar! Pada sifat intermediet kedua alel sama kuat sehingga mengekspresikan warna merah muda.' },
        { text: '🔴 Merah Pekat', isCorrect: false },
        { text: '⚪ Putih Polos', isCorrect: false }
      ]
    }
  },
  8: {
    title: 'Pertarungan Dr. Chaos (C6 - Master Evaluasi)',
    illustration: '/assets/stage8_boss_illustration.webp',
    topic: 'Duel RPG Master Genetika Mendelian',
    interactiveStepGuide: [
      {
        step: 1,
        title: 'Sistem Pertarungan Turn-Based',
        badge: 'Duel Bergantian',
        desc: 'Kamu dan Dr. Chaos saling bergantian giliran (Turn). Kalahkan Dr. Chaos (100 HP) sebelum Turn 15 berakhir!',
        tip: 'Perhatikan indikator darah, giliran, dan status perisai di bagian atas arena.'
      },
      {
        step: 2,
        title: 'Jurus 1: Tusukan Kilat (Instan)',
        badge: 'Tanpa Kuis (CD 3)',
        desc: 'Serangan instan tanpa menjawab soal! Mengurangi 10 HP Dr. Chaos dan mengurangi 5 HP darahmu (recoil). Memiliki Cooldown 3 ronde.',
        tip: 'Gunakan saat kamu butuh damage cepat atau sedang menyimpan taktik.'
      },
      {
        step: 3,
        title: 'Jurus 2: Hantaman Mendel',
        badge: 'Kuis Monohibrid',
        desc: 'Jawab pertanyaan hukum Mendel. Jika BENAR, Dr. Chaos terkena -25 HP. Jika SALAH, darahmu yang berkurang -15 HP!',
        tip: 'Pertanyaan seputar Hukum Mendel I, rasio monohibrid 3:1, dan pembentukan gamet.'
      },
      {
        step: 4,
        title: 'Jurus 3: Badai Dihibrid (Finisher)',
        badge: 'Khusus Sekarat ≤35 HP',
        desc: 'HANYA terbuka saat Dr. Chaos SEKARAT (HP ≤ 35). Jawab soal pamungkas dihibrid: Benar = -35 HP Finisher! Salah = -20 HP.',
        tip: 'Tombol akan menyala membara 🔥 saat Dr. Chaos sekarat. Gunakan ini untuk menumbangkannya!'
      }
    ],
    interactivePreview: {
      question: 'Coba Latihan Cepat: Kapan Jurus 3 (Badai Dihibrid Finisher) bisa digunakan?',
      options: [
        { text: '🔥 Hanya saat darah Dr. Chaos sekarat (≤ 35 HP)', isCorrect: true, reason: 'Tepat! Jurus 3 adalah finisher mematikan yang terkunci sampai Dr. Chaos sekarat.' },
        { text: 'Kapan saja sejak ronde pertama', isCorrect: false },
        { text: 'Hanya jika pemain memiliki 100 HP penuh', isCorrect: false }
      ]
    }
  }
};

const StageTutorialModal = ({ stageId, onClose }) => {
  const tutorial = STAGE_TUTORIALS[stageId] || STAGE_TUTORIALS[1];
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [miniQuizAnswer, setMiniQuizAnswer] = useState(null);

  const steps = tutorial.interactiveStepGuide || [];
  const activeStep = steps[currentStepIdx] || steps[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fade-in text-left">
      <div className="w-full max-w-lg sm:max-w-xl max-h-[96vh] overflow-y-auto rounded-2xl bg-[#fae8b6] border-4 border-[#361706] p-3 sm:p-5 shadow-[6px_6px_0_#1a0b03] space-y-2.5 sm:space-y-3.5 relative animate-scale-up text-[#2b1103]">
        
        {/* Modal Header HUD */}
        <div className="flex items-start justify-between border-b-2 border-[#361706] pb-2.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#fff8e7] border-2 border-[#361706] p-1 flex items-center justify-center flex-shrink-0 shadow-xs">
              <img 
                src={tutorial.illustration || '/assets/mendel_avatar.webp'} 
                alt={tutorial.title}
                className="w-full h-full object-contain image-pixelated"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-pixel text-[8px] bg-[#361706] text-[#facc15] px-1.5 py-0.5 rounded uppercase">
                  TUTORIAL INTERAKTIF &bull; STAGE 0{stageId}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-700 text-white font-sans">
                  Langkah {currentStepIdx + 1} dari {steps.length}
                </span>
              </div>
              <h3 className="font-pixel text-[11px] sm:text-xs text-[#361706] uppercase mt-1 leading-tight font-black">
                {tutorial.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Step Progress Pills Navigation */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-[#884318] font-bold">
            <span className="flex items-center gap-1">
              <Gamepad2 className="w-3.5 h-3.5 text-[#15803d]" />
              PILIH LANGKAH UNTUK MEMPELAJARI:
            </span>
            <span className="text-[9px] text-[#361706] italic">
              Klik kotak di bawah untuk berpindah langkah
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {steps.map((s, idx) => {
              const isSelected = currentStepIdx === idx;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    sound.playClick();
                    setCurrentStepIdx(idx);
                  }}
                  className={`p-1.5 sm:p-2 rounded-xl border-2 text-left cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#15803d] border-[#14532d] text-white shadow-[2px_2px_0_#0f5132] -translate-y-0.5'
                      : 'bg-[#fff8e7] border-[#361706]/30 text-[#361706] hover:bg-[#ffeed1]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`w-4 h-4 rounded font-pixel text-[8px] flex items-center justify-center font-bold ${
                      isSelected ? 'bg-white text-[#15803d]' : 'bg-[#ca7c38] text-[#2b1103]'
                    }`}>
                      {s.step}
                    </span>
                    {isSelected && <Sparkles className="w-3 h-3 text-yellow-300" />}
                  </div>
                  <span className="text-[9px] font-bold leading-tight line-clamp-1 mt-1 font-sans">
                    {s.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Highlighted Step Spotlight Card */}
        {activeStep && (
          <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-3 border-emerald-600 rounded-xl p-3.5 sm:p-4 space-y-2 shadow-md relative overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-[8px] bg-emerald-700 text-white px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                LANGKAH 0{activeStep.step} &bull; {activeStep.badge}
              </span>
              <span className="text-xs text-emerald-800 font-bold font-sans flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                Panduan Praktis
              </span>
            </div>

            <h4 className="font-pixel text-xs sm:text-sm text-[#14532d] uppercase font-black leading-snug">
              {activeStep.title}
            </h4>

            <p className="text-slate-900 text-xs sm:text-[13px] font-medium leading-relaxed">
              {activeStep.desc}
            </p>

            {/* Pro-Tip Box */}
            <div className="p-2 sm:p-2.5 bg-white/85 border border-emerald-300 rounded-lg flex items-start gap-2 shadow-2xs">
              <span className="text-sm">💡</span>
              <p className="text-[11px] text-emerald-900 font-medium italic leading-snug">
                <strong>Tips Penting:</strong> {activeStep.tip}
              </p>
            </div>
          </div>
        )}

        {/* Step Navigation Controls (Prev / Next Step) */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#361706]/20">
          <button
            onClick={() => {
              sound.playClick();
              setCurrentStepIdx(prev => Math.max(0, prev - 1));
            }}
            disabled={currentStepIdx === 0}
            className={`px-3 py-1.5 rounded-lg border-2 border-[#361706] font-pixel text-[8px] uppercase flex items-center gap-1 transition ${
              currentStepIdx === 0
                ? 'opacity-40 cursor-not-allowed bg-slate-200 text-slate-500'
                : 'bg-[#fff8e7] hover:bg-[#ffeed1] text-[#361706] cursor-pointer active:translate-y-0.5'
            }`}
          >
            <ChevronLeft className="w-3 h-3 stroke-[3px]" />
            <span>Langkah Sebelumnya</span>
          </button>

          {currentStepIdx < steps.length - 1 ? (
            <button
              onClick={() => {
                sound.playClick();
                setCurrentStepIdx(prev => Math.min(steps.length - 1, prev + 1));
              }}
              className="px-3.5 py-1.5 rounded-lg bg-[#361706] hover:bg-[#4a2008] text-[#facc15] font-pixel text-[8px] uppercase flex items-center gap-1 cursor-pointer active:translate-y-0.5 shadow-[2px_2px_0_#1a0b03]"
            >
              <span>Langkah Berikutnya</span>
              <ChevronRight className="w-3 h-3 stroke-[3px]" />
            </button>
          ) : (
            <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded border border-emerald-600">
              ✓ Semua Langkah Siap!
            </span>
          )}
        </div>

        {/* Optional Mini-Practice Quiz Box */}
        {tutorial.interactivePreview && (
          <div className="p-3 bg-[#fff8e7] border-2 border-[#361706] rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-[#884318]">
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-pixel text-[7.5px] uppercase font-bold tracking-wider">
                Uji Pemahaman Singkat (Opsional)
              </span>
            </div>

            <p className="font-semibold text-[#361706] text-[11px] leading-snug">
              {tutorial.interactivePreview.question}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-0.5">
              {tutorial.interactivePreview.options.map((opt, optIdx) => {
                const isSelected = miniQuizAnswer === optIdx;
                const isCorrect = isSelected && opt.isCorrect;
                const isWrong = isSelected && !opt.isCorrect;

                return (
                  <button
                    key={optIdx}
                    onClick={() => {
                      setMiniQuizAnswer(optIdx);
                      if (opt.isCorrect) {
                        sound.playCorrect();
                      } else {
                        sound.playWrong();
                      }
                    }}
                    className={`p-2 rounded-lg border text-left text-[10px] font-medium transition cursor-pointer flex flex-col justify-between ${
                      isCorrect
                        ? 'bg-emerald-100 border-emerald-600 text-emerald-950 ring-2 ring-emerald-500 font-bold'
                        : isWrong
                        ? 'bg-rose-100 border-rose-500 text-rose-900 line-through'
                        : 'bg-white border-[#361706]/30 hover:bg-amber-50 text-[#361706]'
                    }`}
                  >
                    <span>{opt.text}</span>
                    {isCorrect && (
                      <span className="text-[8.5px] text-emerald-700 font-bold block mt-1">
                        ✓ {opt.reason}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Button: Start Playing */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full py-3 rounded-xl bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-700 hover:brightness-110 text-white font-pixel text-[9px] sm:text-xs uppercase flex items-center justify-center gap-2 border-2 border-[#14532d] shadow-[3px_3px_0_#0f5132] active:translate-y-0.5 cursor-pointer font-black transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>SAYA SUDAH PAHAM & MULAI BERMAIN 🚀</span>
        </button>

      </div>
    </div>
  );
};

export const StageContainer = () => {
  const { currentStageId, sourceWorldView } = useGame();
  const [showStageTutorial, setShowStageTutorial] = useState(true);
  const [showKakNisaBriefing, setShowKakNisaBriefing] = useState(true);

  // Show tutorial or Kak Nisa briefing every time the level starts or changes
  useEffect(() => {
    if (sourceWorldView === 'rpg-world') {
      setShowKakNisaBriefing(true);
    } else {
      setShowStageTutorial(true);
    }
  }, [currentStageId, sourceWorldView]);

  const renderStage = () => {
    switch (currentStageId) {
      case 1:
        return <Stage1MysteryGarden />;
      case 2:
        return <Stage2GeneBuilder />;
      case 3:
        return <Stage3GameteFactory />;
      case 4:
        return <Stage4PunnettLab />;
      case 5:
        return <Stage5HarvestChallenge />;
      case 6:
        return <Stage6DihybridAdventure />;
      case 7:
        return <Stage7MutationTrap />;
      case 8:
        return <BossBattleDrChaos />;
      default:
        return <Stage1MysteryGarden />;
    }
  };

  return (
    <div className="relative w-full h-full">
      {renderStage()}

      {/* 1. Khusus Mode RPG: Dialog Interaktif Kak Nisa (Latar Misi, Tujuan Belajar C1-C6, Cara Bermain & Bantuan Awal) */}
      {sourceWorldView === 'rpg-world' && showKakNisaBriefing && (
        <KakNisaStageBriefing 
          stageId={currentStageId} 
          onClose={() => setShowKakNisaBriefing(false)} 
        />
      )}

      {/* 2. Mode Cepat / Peta Biasa: Tutorial Ringkas Standar */}
      {sourceWorldView !== 'rpg-world' && showStageTutorial && (
        <StageTutorialModal 
          stageId={currentStageId} 
          onClose={() => setShowStageTutorial(false)} 
        />
      )}

      {/* 3. Tombol Bantuan Interaktif Mengambang Kak Nisa di Mode RPG */}
      {sourceWorldView === 'rpg-world' && !showKakNisaBriefing && (
        <button
          onClick={() => {
            sound.playClick();
            setShowKakNisaBriefing(true);
          }}
          className="fixed top-2 sm:top-3.5 left-1/2 -translate-x-1/2 z-40 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#15803d] hover:bg-[#16a34a] text-white border-2 border-[#4ade80] shadow-[0_4px_12px_rgba(21,128,61,0.55)] flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-all active:scale-95 group font-pixel text-[7.5px] sm:text-[9px] uppercase tracking-wider whitespace-nowrap"
          title="Buka Kembali Bantuan & Panduan Interaktif Kak Nisa"
        >
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full overflow-hidden border border-white flex-shrink-0 bg-emerald-100">
            <img 
              src="/assets/kak_nisa_sprite.png?v=2" 
              alt="Kak Nisa" 
              className="w-full h-full object-cover object-top"
            />
          </div>
          <span className="font-bold text-emerald-100 group-hover:text-white">
            Bantuan Kak Nisa
          </span>
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#4ade80] animate-ping" />
        </button>
      )}
    </div>
  );
};
