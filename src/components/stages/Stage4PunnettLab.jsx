import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { STAGES } from '../../data/geneticsData';
import { sound } from '../../services/sound';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Star, 
  RefreshCw, 
  ChevronLeft 
} from 'lucide-react';

const PUNNETT_MISSIONS = [
  {
    id: 1,
    title: 'Misi 1: Monohibrid F2 Bunga Ungu (Pp × Pp)',
    traitName: 'Warna Bunga',
    parentGenotype1: 'Pp',
    parentGenotype2: 'Pp',
    allele1: 'P', // Dominant
    allele2: 'p', // Recessive
    expectedGrid: {
      r1c1: 'PP',
      r1c2: 'Pp',
      r2c1: 'Pp',
      r2c2: 'pp'
    },
    guide: 'Persilangan sesama F1 heterozigot: Ungu (Pp) × Ungu (Pp). Menghasilkan rasio fenotipe klasik 3 Ungu : 1 Putih.',
    explanationRatio: 'Rasio Genotipe: 1 PP : 2 Pp : 1 pp | Rasio Fenotipe: 3 Ungu : 1 Putih (75% : 25%)'
  },
  {
    id: 2,
    title: 'Misi 2: Galur Murni Parental P1 (BB × bb)',
    traitName: 'Bentuk Biji',
    parentGenotype1: 'BB',
    parentGenotype2: 'bb',
    allele1: 'B', // Dominant
    allele2: 'b', // Recessive
    expectedGrid: {
      r1c1: 'Bb',
      r1c2: 'Bb',
      r2c1: 'Bb',
      r2c2: 'Bb'
    },
    guide: 'Persilangan Parental awal: Galur murni Bulat (BB) disilangkan dengan Keriput (bb). Seluruh anakan F1 seragam Bulat Heterozigot!',
    explanationRatio: 'Rasio Genotipe: 100% Bb | Rasio Fenotipe: 100% Biji Bulat (Keseragaman F1 Mendel)'
  },
  {
    id: 3,
    title: 'Misi 3: Uji Silang / Test Cross (Bb × bb)',
    traitName: 'Bentuk Biji',
    parentGenotype1: 'Bb',
    parentGenotype2: 'bb',
    allele1: 'B', // Dominant
    allele2: 'b', // Recessive
    expectedGrid: {
      r1c1: 'Bb',
      r1c2: 'bb',
      r2c1: 'Bb',
      r2c2: 'bb'
    },
    guide: 'Uji Silang (Test Cross): Tanaman bulat heterozigot (Bb) disilangkan dengan induk resesif (bb) untuk membuktikan kemurnian alel.',
    explanationRatio: 'Rasio Genotipe: 2 Bb : 2 bb (1 : 1) | Rasio Fenotipe: 50% Bulat : 50% Keriput'
  },
  {
    id: 4,
    title: 'Misi 4: Monohibrid F2 Tinggi Batang (Tt × Tt)',
    traitName: 'Tinggi Tanaman',
    parentGenotype1: 'Tt',
    parentGenotype2: 'Tt',
    allele1: 'T', // Dominant
    allele2: 't', // Recessive
    expectedGrid: {
      r1c1: 'TT',
      r1c2: 'Tt',
      r2c1: 'Tt',
      r2c2: 'tt'
    },
    guide: 'Persilangan monohibrid tinggi tanaman: Tinggi (Tt) × Tinggi (Tt) menghasilkan rasio 3 Tinggi : 1 Pendek.',
    explanationRatio: 'Rasio Genotipe: 1 TT : 2 Tt : 1 tt | Rasio Fenotipe: 3 Batang Tinggi : 1 Batang Pendek'
  },
  {
    id: 5,
    title: 'Misi 5: Silang Balik / Backcross (Tt × TT)',
    traitName: 'Tinggi Tanaman',
    parentGenotype1: 'Tt',
    parentGenotype2: 'TT',
    allele1: 'T', // Dominant
    allele2: 't', // Recessive
    expectedGrid: {
      r1c1: 'TT',
      r1c2: 'TT',
      r2c1: 'Tt',
      r2c2: 'Tt'
    },
    guide: 'Silang Balik (Backcross): Menyilangkan anakan F1 (Tt) kembali dengan induk homozigot dominan (TT). Seluruh keturunan berfenotipe tinggi!',
    explanationRatio: 'Rasio Genotipe: 2 TT : 2 Tt (1 : 1) | Rasio Fenotipe: 100% Batang Tinggi'
  },
  {
    id: 6,
    title: 'Misi 6: Monohibrid F2 Warna Polong (Gg × Gg)',
    traitName: 'Warna Polong',
    parentGenotype1: 'Gg',
    parentGenotype2: 'Gg',
    allele1: 'G', // Dominant (Hijau)
    allele2: 'g', // Recessive (Kuning)
    expectedGrid: {
      r1c1: 'GG',
      r1c2: 'Gg',
      r2c1: 'Gg',
      r2c2: 'gg'
    },
    guide: 'Persilangan warna polong: Hijau (Gg) disilangkan dengan sesamanya Hijau (Gg). Rasio fenotipe 3 Hijau : 1 Kuning.',
    explanationRatio: 'Rasio Genotipe: 1 GG : 2 Gg : 1 gg | Rasio Fenotipe: 3 Polong Hijau : 1 Polong Kuning'
  }
];

const TraitIcon = ({ type, trait, size = 20 }) => {
  const isDominant = /[A-Z]/.test(type);

  if (trait === 'Warna Bunga') {
    const petalColor = isDominant ? '#c084fc' : '#ffffff';
    const strokeColor = isDominant ? '#7e22ce' : '#475569';
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block flex-shrink-0 animate-scale-up">
        {/* Top Petal */}
        <circle cx="12" cy="7" r="4.5" fill={petalColor} stroke={strokeColor} strokeWidth="1.5" />
        {/* Bottom Petal */}
        <circle cx="12" cy="17" r="4.5" fill={petalColor} stroke={strokeColor} strokeWidth="1.5" />
        {/* Left Petal */}
        <circle cx="7" cy="12" r="4.5" fill={petalColor} stroke={strokeColor} strokeWidth="1.5" />
        {/* Right Petal */}
        <circle cx="17" cy="12" r="4.5" fill={petalColor} stroke={strokeColor} strokeWidth="1.5" />
        {/* Center Pollen */}
        <circle cx="12" cy="12" r="3.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
      </svg>
    );
  }

  if (trait === 'Bentuk Biji') {
    const seedColor = isDominant ? '#facc15' : '#86efac';
    const strokeColor = isDominant ? '#ca8a04' : '#166534';
    if (isDominant) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block flex-shrink-0 animate-scale-up">
          <circle cx="12" cy="12" r="8" fill={seedColor} stroke={strokeColor} strokeWidth="2" />
          <path d="M 9 9 Q 12 7 15 9" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
        </svg>
      );
    } else {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block flex-shrink-0 animate-scale-up">
          <path 
            d="M12,4 C14,4 15,5 16.5,5.5 C18,6 19.5,7 20,8.5 C20.5,10 20,12 20,13.5 C20,15 19,17 17.5,18.5 C16,20 14,20 12,20 C10,20 8,20 6.5,18.5 C5,17 4,15 4,13.5 C4,12 3.5,10 4,8.5 C4.5,7 6,6 7.5,5.5 C9,5 10,4 12,4 Z" 
            fill={seedColor} 
            stroke={strokeColor} 
            strokeWidth="2" 
          />
          <path d="M9 10 Q 11 11 10 13" stroke={strokeColor} strokeWidth="1" opacity="0.5" />
          <path d="M14 9 Q 13 12 15 13" stroke={strokeColor} strokeWidth="1" opacity="0.5" />
        </svg>
      );
    }
  }

  if (trait === 'Tinggi Tanaman') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block flex-shrink-0 animate-scale-up">
        {/* Stem */}
        <path d={isDominant ? "M12 22 V6" : "M12 22 V14"} stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" />
        {/* Lower Leaf */}
        <path d="M12 16 Q16 14 17 12 Q14 12 12 15" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
        {isDominant && (
          <>
            {/* Middle Leaf */}
            <path d="M12 11 Q8 9 7 7 Q10 7 12 10" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
            {/* Top Leaf */}
            <path d="M12 6 Q14 2 12 2 Q10 2 12 6" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
          </>
        )}
      </svg>
    );
  }

  if (trait === 'Warna Polong') {
    const podColor = isDominant ? '#22c55e' : '#facc15';
    const strokeColor = isDominant ? '#15803d' : '#ca8a04';
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block flex-shrink-0 animate-scale-up">
        <path d="M4 14 C7 7 17 6 20 8 C18 14 9 17 4 14 Z" fill={podColor} stroke={strokeColor} strokeWidth="1.5" />
        <circle cx="9" cy="11.5" r="1.5" fill={isDominant ? "#15803d" : "#ca8a04"} opacity="0.6" />
        <circle cx="14" cy="10.5" r="1.5" fill={isDominant ? "#15803d" : "#ca8a04"} opacity="0.6" />
      </svg>
    );
  }

  return null;
};

const getGenotypeLabel = (gen) => {
  if (!gen) return 'Keturunan';
  const a = gen[0];
  const b = gen[1];
  if (a === b) {
    return a === a.toUpperCase() ? 'Homo Dominan' : 'Homo Resesif';
  }
  return 'Heterozigot';
};

const TestTube = ({ genotype, labelFormula, traitName, isActive, onClick }) => {
  const hasFlower = genotype !== '';

  return (
    <div 
      onClick={onClick}
      className={`flex flex-col items-center p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer ${
        isActive 
          ? 'bg-amber-100/70 border-amber-500 scale-[1.03] shadow-md' 
          : 'bg-white/40 border-slate-200 hover:border-slate-400'
      }`}
    >
      <span className="text-[7px] sm:text-[7.5px] font-black text-slate-700 tracking-wider mb-1 sm:mb-2 text-center whitespace-normal leading-tight max-w-full min-h-4 sm:min-h-6 flex items-center justify-center">
        {labelFormula}
      </span>

      {/* Test Tube Glass Graphic */}
      <div className="w-9 sm:w-11 h-14 sm:h-22 border-2 border-slate-700 bg-white/30 rounded-b-full flex flex-col justify-end p-0.5 sm:p-1 relative shadow-inner overflow-hidden mb-1 sm:mb-2 test-tube-compact">
        {/* Tube Lip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-350 border-b border-slate-700 rounded-full" />
        
        {/* Flower or Content inside tube */}
        {hasFlower ? (
          <div className="w-full h-9 sm:h-14 flex items-center justify-center">
            <TraitIcon type={genotype} trait={traitName} size={18} />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 font-mono font-black text-sm sm:text-lg select-none">
            ?
          </div>
        )}
      </div>

      {/* Genotype Slot Label */}
      <div className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border-2 font-mono font-black text-[9px] sm:text-[10px] min-w-8 sm:min-w-10 text-center shadow-[1.5px_1.5px_0px_#1e293b] ${
        genotype 
          ? 'bg-white border-slate-800 text-slate-900' 
          : 'bg-slate-100 border-dashed border-slate-400 text-slate-400 shadow-none'
      }`}>
        {genotype || '?'}
      </div>
    </div>
  );
};

export const Stage4PunnettLab = () => {
  const { navigateTo, completeStage, sourceWorldView } = useGame();
  const [missionIdx, setMissionIdx] = useState(0);
  const [grid, setGrid] = useState({
    r1c1: '',
    r1c2: '',
    r2c1: '',
    r2c2: ''
  });
  const [activeSlot, setActiveSlot] = useState('r1c1'); 
  const [feedback, setFeedback] = useState(null);
  const [stageCompleted, setStageCompleted] = useState(false);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const mission = PUNNETT_MISSIONS[missionIdx];
  const stageInfo = STAGES.find(s => s.id === 4);

  const handleSelectOption = (value) => {
    sound.playClick();
    if (activeSlot) {
      setGrid(prev => ({ ...prev, [activeSlot]: value }));
      
      const slots = ['r1c1', 'r1c2', 'r2c1', 'r2c2'];
      const currentIdx = slots.indexOf(activeSlot);
      
      const nextEmpty = slots.find((s, idx) => idx > currentIdx && !grid[s]);
      if (nextEmpty) {
        setActiveSlot(nextEmpty);
      } else {
        setActiveSlot(null);
      }
      setFeedback(null);
    }
  };

  const handleClearGrid = () => {
    sound.playClick();
    setGrid({ r1c1: '', r1c2: '', r2c1: '', r2c2: '' });
    setActiveSlot('r1c1');
    setFeedback(null);
  };

  const handleVerifyGrid = () => {
    // Normalize user entries (e.g. 'pP' -> 'Pp')
    const normalizeCell = (v) => {
      if (!v) return '';
      const a = v[0];
      const b = v[1];
      if (a === a.toLowerCase() && b === b.toUpperCase()) {
        return b + a;
      }
      return v;
    };

    const isMatch = 
      normalizeCell(grid.r1c1) === mission.expectedGrid.r1c1 &&
      normalizeCell(grid.r1c2) === mission.expectedGrid.r1c2 &&
      normalizeCell(grid.r2c1) === mission.expectedGrid.r2c1 &&
      normalizeCell(grid.r2c2) === mission.expectedGrid.r2c2;

    if (isMatch) {
      sound.playCorrect();
      setFeedback({
        type: 'success',
        message: `Misi ${missionIdx + 1} berhasil! Semua keturunan persilangan ${mission.traitName} tepat. ${mission.explanationRatio}`
      });
      setScore(prev => prev + 100);
      setRoundCompleted(true);

      // Play fanfare on final mission completion
      if (missionIdx === PUNNETT_MISSIONS.length - 1) {
        setTimeout(() => {
          setStageCompleted(true);
          sound.playFanfare();
          try { confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } }); } catch(e){}
          completeStage(4, 3, score + 100, 100, 50);
        }, 1800);
      }
    } else {
      sound.playWrong();
      setFeedback({
        type: 'error',
        message: 'Kombinasi persilangan belum tepat. Perhatikan alel pada masing-masing jalur baris dan kolom!'
      });
    }
  };

  const handleNextMission = () => {
    sound.playClick();
    setMissionIdx(prev => prev + 1);
    setGrid({ r1c1: '', r1c2: '', r2c1: '', r2c2: '' });
    setActiveSlot('r1c1');
    setFeedback(null);
    setRoundCompleted(false);
  };

  // Option cards for the current mission (Homozigot Dominan, Heterozigot, Homozigot Resesif)
  const optionCards = [
    `${mission.allele1}${mission.allele1}`,
    `${mission.allele1}${mission.allele2}`,
    `${mission.allele2}${mission.allele2}`
  ];

  return (
    <div className="w-full h-screen relative overflow-hidden bg-[#faf6ee] select-none flex flex-col p-2 sm:p-4 md:p-8 text-left justify-between overflow-y-auto stage-main-wrapper">
      
      {/* Retro parchment paper lines overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] z-0" />

      {/* Floating Header Banner HUD */}
      <div className="w-full p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/90 border-2 border-slate-800 shadow-[3px_3px_0px_#1e293b] sm:shadow-[4px_4px_0px_#1e293b] flex items-center justify-between gap-2 z-30 relative mb-1 sm:mb-2 stage-header-hud">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo(sourceWorldView === 'rpg-world' ? 'rpg-world' : 'map')}
            className="p-1.5 rounded-xl bg-white border-2 border-slate-800 text-slate-700 hover:text-sky-600 transition shadow-3xs cursor-pointer flex-shrink-0 active:translate-y-0.5"
            title={sourceWorldView === 'rpg-world' ? "Kembali ke RPG Map" : "Kembali ke Peta"}
          >
            <ChevronLeft className="w-4 h-4 stroke-[3px]" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border-2 border-slate-800 p-0.5 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img 
                src="/assets/rumah_mendel_banner.webp" 
                alt="Rumah Mendel Banner" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-[7px] font-black text-indigo-700 uppercase tracking-widest font-sans block">
                {stageInfo.location} &bull; STAGE 4 (Misi {missionIdx + 1}/{PUNNETT_MISSIONS.length})
              </span>
              <h2 className="text-[11px] sm:text-xs font-black text-black leading-tight">
                {stageInfo.title} &mdash; {mission.traitName}
              </h2>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mission Progress Badges */}
          <div className="flex gap-1 mr-1">
            {PUNNETT_MISSIONS.map((m, idx) => (
              <div 
                key={m.id}
                title={m.title}
                className={`w-2.5 h-2.5 rounded-full border border-slate-800 transition-colors ${
                  idx === missionIdx 
                    ? 'bg-amber-400' 
                    : idx < missionIdx 
                      ? 'bg-emerald-400' 
                      : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-amber-500/10 border-2 border-slate-800 px-3 py-1 rounded-xl shadow-3xs">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-[10px] font-black text-amber-900 font-mono">Skor: {score}</span>
          </div>
        </div>
      </div>

      {!stageCompleted ? (
        <div className="flex-1 flex flex-col justify-between relative z-10 py-0.5 sm:py-1 stage-workspace-compact">
          
          {/* Heading prompt */}
          <div className="text-center space-y-0.5 my-0.5 sm:my-1">
            <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider">
              {mission.title}
            </h3>
            <p className="text-[8.5px] sm:text-[9.5px] font-bold text-slate-600 max-w-xl mx-auto line-clamp-2">
              {mission.guide}
            </p>
          </div>

          {/* Induk Gametes Crossing Header Row */}
          <div className="flex flex-row items-center justify-center gap-2 sm:gap-8 my-1 sm:my-2 max-w-xl mx-auto w-full px-2 sm:px-4">
            {/* Induk 1 */}
            <div className="p-1.5 sm:p-3 bg-white border-2 border-slate-800 rounded-xl shadow-[2px_2px_0px_#1e293b] sm:shadow-[3px_3px_0px_#1e293b] flex flex-col items-center flex-1">
              <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
                <span className="text-[7.5px] sm:text-[9px] font-black text-slate-800">
                  Induk 1 ({mission.parentGenotype1})
                </span>
                <TraitIcon type={mission.parentGenotype1} trait={mission.traitName} size={11} />
              </div>
              <div className="flex gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full border-2 border-slate-800 flex items-center justify-center relative shadow-3xs bg-white">
                  <TraitIcon type={mission.parentGenotype1[0]} trait={mission.traitName} size={14} />
                  <span className="font-mono font-black text-[7px] sm:text-[8px] text-slate-900 absolute -bottom-1 -right-1 bg-white border border-slate-800 rounded-full w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center shadow-3xs">
                    {mission.parentGenotype1[0]}
                  </span>
                </div>
                <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full border-2 border-slate-800 flex items-center justify-center relative shadow-3xs bg-white">
                  <TraitIcon type={mission.parentGenotype1[1]} trait={mission.traitName} size={14} />
                  <span className="font-mono font-black text-[7px] sm:text-[8px] text-slate-900 absolute -bottom-1 -right-1 bg-white border border-slate-800 rounded-full w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center shadow-3xs">
                    {mission.parentGenotype1[1]}
                  </span>
                </div>
              </div>
            </div>

            {/* Wooden/Metallic Crossing X Symbol */}
            <div className="text-slate-800 font-black text-base sm:text-xl select-none flex-shrink-0">
              ✕
            </div>

            {/* Induk 2 */}
            <div className="p-1.5 sm:p-3 bg-white border-2 border-slate-800 rounded-xl shadow-[2px_2px_0px_#1e293b] sm:shadow-[3px_3px_0px_#1e293b] flex flex-col items-center flex-1">
              <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
                <span className="text-[7.5px] sm:text-[9px] font-black text-slate-800">
                  Induk 2 ({mission.parentGenotype2})
                </span>
                <TraitIcon type={mission.parentGenotype2} trait={mission.traitName} size={11} />
              </div>
              <div className="flex gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full border-2 border-slate-800 flex items-center justify-center relative shadow-3xs bg-white">
                  <TraitIcon type={mission.parentGenotype2[0]} trait={mission.traitName} size={14} />
                  <span className="font-mono font-black text-[7px] sm:text-[8px] text-slate-900 absolute -bottom-1 -right-1 bg-white border border-slate-800 rounded-full w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center shadow-3xs">
                    {mission.parentGenotype2[0]}
                  </span>
                </div>
                <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full border-2 border-slate-800 flex items-center justify-center relative shadow-3xs bg-white">
                  <TraitIcon type={mission.parentGenotype2[1]} trait={mission.traitName} size={14} />
                  <span className="font-mono font-black text-[7px] sm:text-[8px] text-slate-900 absolute -bottom-1 -right-1 bg-white border border-slate-800 rounded-full w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center shadow-3xs">
                    {mission.parentGenotype2[1]}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Test Tubes Container (Hasil Keturunan) */}
          <div className="my-1 sm:my-2 text-center">
            <span className="text-[7.5px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5 sm:mb-1">
              Hasil Keturunan Tabung Reaksi (Papan Punnett)
            </span>
            <div className="grid grid-cols-4 gap-1.5 sm:gap-4 max-w-xl mx-auto w-full px-1 sm:px-2">
              <TestTube 
                genotype={grid.r1c1} 
                labelFormula={getGenotypeLabel(mission.expectedGrid.r1c1)} 
                traitName={mission.traitName}
                isActive={activeSlot === 'r1c1'}
                onClick={() => { sound.playClick(); if (!roundCompleted) setActiveSlot('r1c1'); }}
              />
              <TestTube 
                genotype={grid.r1c2} 
                labelFormula={getGenotypeLabel(mission.expectedGrid.r1c2)} 
                traitName={mission.traitName}
                isActive={activeSlot === 'r1c2'}
                onClick={() => { sound.playClick(); if (!roundCompleted) setActiveSlot('r1c2'); }}
              />
              <TestTube 
                genotype={grid.r2c1} 
                labelFormula={getGenotypeLabel(mission.expectedGrid.r2c1)} 
                traitName={mission.traitName}
                isActive={activeSlot === 'r2c1'}
                onClick={() => { sound.playClick(); if (!roundCompleted) setActiveSlot('r2c1'); }}
              />
              <TestTube 
                genotype={grid.r2c2} 
                labelFormula={getGenotypeLabel(mission.expectedGrid.r2c2)} 
                traitName={mission.traitName}
                isActive={activeSlot === 'r2c2'}
                onClick={() => { sound.playClick(); if (!roundCompleted) setActiveSlot('r2c2'); }}
              />
            </div>
          </div>

          {/* Bottom Row: Option Selection Cards */}
          {!roundCompleted ? (
            <div className="space-y-1 sm:space-y-1.5 text-center my-1 sm:my-1.5">
              <span className="text-[7px] sm:text-[7.5px] font-black text-slate-400 uppercase tracking-widest block">
                Pilih Genotipe Hasil Persilangan untuk Kotak Aktif
              </span>
              <div className="flex justify-center gap-2 sm:gap-3">
                {optionCards.map((gen) => (
                  <button
                    key={gen}
                    onClick={() => handleSelectOption(gen)}
                    className="w-11 sm:w-14 h-11 sm:h-14 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-800 flex flex-col items-center justify-center p-1 shadow-[2px_2px_0px_#1e293b] sm:shadow-[3px_3px_0px_#1e293b] hover:scale-105 active:scale-95 active:translate-y-0.5 transition-all cursor-pointer gap-0.5 sm:gap-1"
                  >
                    <TraitIcon type={gen} trait={mission.traitName} size={14} />
                    <span className="font-mono font-black text-[11px] sm:text-xs leading-none">{gen}</span>
                  </button>
                ))}

                {/* Hapus button */}
                <button
                  onClick={() => {
                    sound.playClick();
                    if (activeSlot) {
                      setGrid(prev => ({ ...prev, [activeSlot]: '' }));
                      setFeedback(null);
                    }
                  }}
                  className="w-11 sm:w-14 h-11 sm:h-14 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-slate-800 flex flex-col items-center justify-center p-1 shadow-[2px_2px_0px_#1e293b] sm:shadow-[3px_3px_0px_#1e293b] hover:scale-105 active:scale-95 active:translate-y-0.5 transition-all cursor-pointer gap-0.5"
                  title="Kosongkan Kotak Terpilih"
                >
                  <RefreshCw className="w-3.5 h-3.5 stroke-[2.5px]" />
                  <span className="text-[7.5px] sm:text-[8px] font-black">HAPUS</span>
                </button>
              </div>
            </div>
          ) : (
            /* Round Completed banner */
            <div className="text-center my-2 animate-fade-in flex flex-col items-center gap-2">
              <div className="px-4 py-2 bg-emerald-100 border-2 border-slate-800 rounded-xl shadow-[3px_3px_0px_#1e293b] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-[10px] font-black text-emerald-900">
                  Misi {missionIdx + 1} Berhasil Dituntaskan!
                </span>
              </div>

              {missionIdx < PUNNETT_MISSIONS.length - 1 && (
                <button
                  onClick={handleNextMission}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-[11px] flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_#1e293b] active:translate-y-0.5 transition-all cursor-pointer border-2 border-slate-800"
                >
                  <span>MISI SELANJUTNYA ({missionIdx + 2}/{PUNNETT_MISSIONS.length})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Feedback & Action Buttons Row */}
          <div className="w-full max-w-md mx-auto space-y-2 mt-1 flex flex-col items-center">
            {feedback && (
              <div className={`w-full p-2 rounded-xl border-2 border-slate-800 flex items-center gap-2 text-[9px] font-black shadow-[3px_3px_0px_#1e293b] animate-fade-in ${
                feedback.type === 'success' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
                <span>{feedback.message}</span>
              </div>
            )}

            {!roundCompleted && (
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleClearGrid}
                  className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-800 text-slate-700 font-black text-[9px] flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all"
                >
                  <RefreshCw className="w-3 h-3 stroke-[2.5px]" />
                  <span>RESET KOTAK</span>
                </button>

                <button
                  onClick={handleVerifyGrid}
                  className="px-6 py-1.5 rounded-xl border-2 border-slate-800 font-black text-[9px] flex items-center gap-1.5 shadow-[2px_2px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer"
                >
                  <span>VERIFIKASI PUNNETT</span>
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5px]" />
                </button>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Victory Screen */
        <div className="absolute inset-0 z-40 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
          <div className="p-4 sm:p-6 rounded-3xl text-center space-y-2.5 sm:space-y-4 max-w-xs w-full border-2 border-slate-800 bg-white shadow-2xl relative z-50 animate-scale-up max-h-[96vh] overflow-y-auto">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-slate-800 p-1 flex items-center justify-center mx-auto shadow-xs overflow-hidden">
              <img 
                src="/assets/rumah_mendel_banner.webp" 
                alt="Victory Stage 4" 
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[8px] font-black text-indigo-700 uppercase tracking-widest font-sans">ALL MISSIONS COMPLETED</span>
              <h3 className="text-base font-black text-black">STAGE 4 SELESAI!</h3>
              <p className="text-[10px] text-black/85 font-bold leading-relaxed px-1">
                Selamat! Kamu berhasil menuntaskan seluruh 6 persilangan monohibrid, galur murni P1, uji silang (test cross), dan silang balik (backcross). Kamu resmi menjadi <strong className="text-blue-600">Master Analis Punnett</strong>!
              </p>
            </div>

            <div className="flex justify-center gap-1.5">
              {[1, 2, 3].map(s => (
                <Star key={s} className="w-6 h-6 text-amber-500 fill-amber-500 animate-bounce" style={{ animationDelay: `${s * 0.2}s` }} />
              ))}
            </div>

            <div className="p-2.5 bg-amber-500/10 border-2 border-slate-800 rounded-xl text-amber-900 text-[10px] font-black shadow-[3px_3px_0px_#1e293b]">
              🏆 Lencana Diperoleh: Master Analis Punnett
            </div>

            {sourceWorldView === 'rpg-world' ? (
              <div className="flex justify-center pt-1.5">
                <button
                  onClick={() => navigateTo('rpg-world')}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-pixel text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:translate-y-0.5 transition cursor-pointer border-2 border-slate-800"
                >
                  <span>LANJUTKAN</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2 justify-center pt-1.5">
                <button
                  onClick={() => navigateTo('map')}
                  className="px-4 py-2 rounded-xl bg-white border-2 border-slate-800 hover:bg-slate-50 text-slate-700 font-bold text-[10px] shadow-3xs cursor-pointer flex-1"
                >
                  PETA STAGE
                </button>
                <button
                  onClick={() => navigateTo('stage', 5)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-[10px] flex items-center justify-center gap-1 shadow-3xs cursor-pointer flex-1"
                >
                  <span>STAGE 5</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
