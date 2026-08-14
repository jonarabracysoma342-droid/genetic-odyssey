import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../services/sound';
import { Play } from 'lucide-react';
import { Stage1MysteryGarden } from './Stage1MysteryGarden';
import { Stage2GeneBuilder } from './Stage2GeneBuilder';
import { Stage3GameteFactory } from './Stage3GameteFactory';
import { Stage4PunnettLab } from './Stage4PunnettLab';
import { Stage5HarvestChallenge } from './Stage5HarvestChallenge';
import { Stage6DihybridAdventure } from './Stage6DihybridAdventure';

const STAGE_TUTORIALS = {
  1: {
    title: 'Taman Misteri (C1 - Mengingat)',
    illustration: '/assets/stage1_garden_illustration.webp',
    topic: 'Pengenalan Sifat Fisik (Fenotipe)',
    instructions: [
      'Baca instruksi misi di bagian atas untuk mengetahui sifat tanaman yang dicari.',
      'Geser kebun tanaman ercis ke kiri dan kanan untuk mencari tanaman yang tepat.',
      'Klik pada tanaman ercis yang sesuai dengan kriteria misi (warna bunga, kulit biji, dll.).',
      'Klik tombol "Verifikasi Hasil" di bawah untuk mencocokkan jawaban Anda.'
    ]
  },
  2: {
    title: 'Penyusun Gen (C2 - Memahami)',
    illustration: '/assets/sub_mendel_peas.webp',
    topic: 'Genotipe & Alel Dominan/Resesif',
    instructions: [
      'Perhatikan deskripsi sifat fisik (fenotipe) yang diminta di kartu tengah.',
      'Pilih kartu alel (huruf besar untuk dominan, huruf kecil untuk resesif) di bagian bawah.',
      'Seret atau klik kartu alel untuk menyusun genotipe (homozigot dominan, heterozigot, atau homozigot resesif).',
      'Kombinasi huruf yang benar akan melengkapi DNA dan melanjutkan ke soal berikutnya.'
    ]
  },
  3: {
    title: 'Pabrik Gamet (C3 - Menerapkan)',
    illustration: '/assets/subtopic_process.webp',
    topic: 'Hukum Segregasi & Pembentukan Gamet',
    instructions: [
      'Amati genotipe induk diploid yang muncul di atas corong mesin segregasi.',
      'Terapkan Hukum Mendel I dengan memisahkan pasangan alel genotipe induk tersebut.',
      'Klik atau pilih alel tunggal (haploid) yang tepat untuk ditampung ke dalam tabung gamet.',
      'Pastikan rasio gamet yang terbentuk sesuai dengan hukum segregasi bebas.'
    ]
  },
  4: {
    title: 'Laboratorium Punnett (C4 - Menganalisis)',
    illustration: '/assets/genopedia_punnett2x2.webp',
    topic: 'Persilangan Monohibrid & Punnett Square',
    instructions: [
      'Perhatikan alel gamet jantan (atas) dan betina (samping) pada papan catur Punnett.',
      'Gabungkan alel dari kolom dan baris yang bersilangan untuk membentuk genotipe anakan.',
      'Ketik atau pilih kombinasi huruf gabungan (selalu tulis alel huruf besar terlebih dahulu, misal: Pp).',
      'Lengkapi seluruh tabel 2x2 untuk menganalisis sifat fisik hasil persilangan monohibrid.'
    ]
  },
  5: {
    title: 'Tantangan Panen (C5 - Evaluasi)',
    illustration: '/assets/subtopic_result.webp',
    topic: 'Prediksi Fenotipe & Rasio Persilangan',
    instructions: [
      'Analisis rasio teoritis Hukum Mendel (3:1) untuk persilangan monohibrid dominan penuh.',
      'Hitung jumlah tanaman di ladang yang memiliki fenotipe dominan dan resesif.',
      'Panen (klik) tanaman dengan perbandingan jumlah yang tepat sesuai target rasio.',
      'Pastikan jumlah panen Anda pas sebelum menekan tombol verifikasi keranjang.'
    ]
  },
  6: {
    title: 'Petualangan Dihibrid (C6 - Menciptakan)',
    illustration: '/assets/genopedia_punnett4x4.webp',
    topic: 'Persilangan Dihibrid (2 Sifat Beda)',
    instructions: [
      'Rancang persilangan dua sifat beda (dihibrid) dengan memadukan alel-alel gamet induk.',
      'Bentuk 4 kombinasi gamet dihibrid secara mandiri dari induk AaBb (AB, Ab, aB, ab).',
      'Posisikan gamet pada tabel Punnett 4x4, lalu isi 16 kotak kombinasi anakan secara tepat.',
      'Identifikasi rasio fenotipe hasil persilangan dihibrid untuk menyelesaikan misi akhir.'
    ]
  }
};

const StageTutorialModal = ({ stageId, onClose }) => {
  const tutorial = STAGE_TUTORIALS[stageId];
  if (!tutorial) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in text-left">
      <div className="w-full max-w-sm md:max-w-lg rounded-3xl bg-white border-3 border-slate-800 p-5 md:p-7 shadow-[6px_6px_0px_#1e293b] space-y-4 md:space-y-5 relative overflow-hidden animate-scale-up">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-155 pb-2.5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white border-2 border-slate-800 p-1.5 md:p-2 flex items-center justify-center flex-shrink-0 shadow-3xs">
              <img 
                src={tutorial.illustration || '/assets/cat_genopedia_icon.webp'} 
                alt={tutorial.title}
                className="w-full h-full object-contain animate-pulse"
              />
            </div>
            <div>
              <span className="text-[7.5px] md:text-[10px] font-black text-indigo-700 uppercase tracking-widest font-sans">
                TUTORIAL BERMAIN &bull; STAGE 0{stageId}
              </span>
              <h3 className="text-xs md:text-sm font-black text-black leading-tight">
                {tutorial.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Learning Topic */}
        <div className="p-3 md:p-4 rounded-2xl bg-indigo-50 border-2 border-slate-800 shadow-3xs space-y-0.5">
          <span className="text-[8px] md:text-[10px] text-indigo-700 font-extrabold uppercase font-sans">Fokus Pembelajaran</span>
          <p className="text-xs md:text-sm text-slate-850 font-extrabold leading-tight">{tutorial.topic}</p>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-2">
          <span className="text-[8px] md:text-[10px] text-slate-400 font-black uppercase tracking-wider block font-sans">LANGKAH BERMAIN</span>
          <div className="space-y-2 md:space-y-3 text-[10.5px] md:text-xs font-bold text-slate-700 leading-relaxed max-h-56 md:max-h-72 overflow-y-auto pr-1">
            {tutorial.instructions.map((step, idx) => (
              <div key={idx} className="flex gap-2.5 md:gap-3 items-start">
                <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-slate-800 text-white font-mono text-[9px] md:text-[11px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="flex-1 pt-0.5 text-slate-650">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full py-2.5 md:py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs md:text-sm flex items-center justify-center gap-2 cursor-pointer active:translate-y-0.2 shadow-3xs"
        >
          <Play className="w-4 h-4 md:w-5 md:h-5 fill-white" />
          <span>PAHAM & MULAI BERMAIN</span>
        </button>

      </div>
    </div>
  );
};

export const StageContainer = () => {
  const { currentStageId } = useGame();
  const [showStageTutorial, setShowStageTutorial] = useState(true);

  // Show tutorial popup every time the level starts or changes
  useEffect(() => {
    setShowStageTutorial(true);
  }, [currentStageId]);

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
      default:
        return <Stage1MysteryGarden />;
    }
  };

  return (
    <div className="relative w-full h-full">
      {renderStage()}
      {showStageTutorial && (
        <StageTutorialModal 
          stageId={currentStageId} 
          onClose={() => setShowStageTutorial(false)} 
        />
      )}
    </div>
  );
};
