import React, { useState, useEffect } from 'react';
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

const HARVEST_MISSIONS = [
  {
    id: 1,
    title: 'Misi 1: Panen F2 Warna Bunga',
    traitName: 'Warna Bunga',
    ratioText: '3 : 1',
    ratioLabel: '(3 Ungu : 1 Putih)',
    targetDominant: 3,
    targetRecessive: 1,
    dominantType: 'PP',
    recessiveType: 'pp',
    plantPool: [
      { id: 'p1', type: 'PP' },
      { id: 'p2', type: 'Pp' },
      { id: 'p3', type: 'PP' },
      { id: 'p4', type: 'pp' },
      { id: 'p5', type: 'Pp' },
      { id: 'p6', type: 'PP' },
      { id: 'p7', type: 'pp' },
    ],
    hint: 'Pilih 3 tanaman bunga Ungu dominan dan 1 tanaman bunga Putih resesif untuk memenuhi rasio F2 monohibrid 3:1.'
  },
  {
    id: 2,
    title: 'Misi 2: Panen F2 Bentuk Biji',
    traitName: 'Bentuk Biji',
    ratioText: '3 : 1',
    ratioLabel: '(3 Bulat : 1 Keriput)',
    targetDominant: 3,
    targetRecessive: 1,
    dominantType: 'RR',
    recessiveType: 'rr',
    plantPool: [
      { id: 's1', type: 'RR' },
      { id: 's2', type: 'rr' },
      { id: 's3', type: 'Rr' },
      { id: 's4', type: 'RR' },
      { id: 's5', type: 'rr' },
      { id: 's6', type: 'Rr' },
      { id: 's7', type: 'RR' },
    ],
    hint: 'Pilih 3 tanaman biji Bulat dan 1 tanaman biji Keriput untuk dimasukkan ke keranjang panen.'
  },
  {
    id: 3,
    title: 'Misi 3: Panen Uji Silang Bentuk Polong',
    traitName: 'Bentuk Polong',
    ratioText: '2 : 2',
    ratioLabel: '(1 Rata : 1 Berkerut)',
    targetDominant: 2,
    targetRecessive: 2,
    dominantType: 'II',
    recessiveType: 'ii',
    plantPool: [
      { id: 'b1', type: 'Ii' },
      { id: 'b2', type: 'ii' },
      { id: 'b3', type: 'Ii' },
      { id: 'b4', type: 'ii' },
      { id: 'b5', type: 'Ii' },
      { id: 'b6', type: 'ii' },
      { id: 'b7', type: 'Ii' },
    ],
    hint: 'Hasil uji silang (test cross Ii × ii) menghasilkan rasio fenotipe 1:1 seimbang (pilih 2 Polong Rata dan 2 Polong Berkerut).'
  },
  {
    id: 4,
    title: 'Misi 4: Panen F2 Tinggi Tanaman',
    traitName: 'Tinggi Tanaman',
    ratioText: '3 : 1',
    ratioLabel: '(3 Tinggi : 1 Pendek)',
    targetDominant: 3,
    targetRecessive: 1,
    dominantType: 'TT',
    recessiveType: 'tt',
    plantPool: [
      { id: 't1', type: 'TT' },
      { id: 't2', type: 'tt' },
      { id: 't3', type: 'tt' },
      { id: 't4', type: 'Tt' },
      { id: 't5', type: 'TT' },
      { id: 't6', type: 'Tt' },
      { id: 't7', type: 'TT' },
    ],
    hint: 'Pilih 3 tanaman batang Tinggi dan 1 tanaman batang Pendek untuk membuktikan segregasi tinggi tanaman.'
  },
  {
    id: 5,
    title: 'Misi 5: Panen Galur Murni Parental F1',
    traitName: 'Warna Biji',
    ratioText: '4 : 0',
    ratioLabel: '(100% Biji Kuning)',
    targetDominant: 4,
    targetRecessive: 0,
    dominantType: 'YY',
    recessiveType: 'yy',
    plantPool: [
      { id: 'y1', type: 'Yy' },
      { id: 'y2', type: 'YY' },
      { id: 'y3', type: 'yy' },
      { id: 'y4', type: 'Yy' },
      { id: 'y5', type: 'YY' },
      { id: 'y6', type: 'yy' },
      { id: 'y7', type: 'Yy' },
    ],
    hint: 'Keturunan F1 dari parental galur murni (YY × yy) seragam 100% berfenotipe Biji Kuning dominan. Panen 4 tanaman kuning!'
  },
  {
    id: 6,
    title: 'Misi 6: Panen F2 Warna Polong',
    traitName: 'Warna Polong',
    ratioText: '3 : 1',
    ratioLabel: '(3 Hijau : 1 Kuning)',
    targetDominant: 3,
    targetRecessive: 1,
    dominantType: 'GG',
    recessiveType: 'gg',
    plantPool: [
      { id: 'g1', type: 'GG' },
      { id: 'g2', type: 'gg' },
      { id: 'g3', type: 'Gg' },
      { id: 'g4', type: 'GG' },
      { id: 'g5', type: 'gg' },
      { id: 'g6', type: 'Gg' },
      { id: 'g7', type: 'GG' },
    ],
    hint: 'Pilih 3 tanaman polong Hijau dominan dan 1 tanaman polong Kuning resesif untuk menyempurnakan panen akhir!'
  }
];

const TraitIcon = ({ type, trait, size = 20 }) => {
  const isDominant = /[A-Z]/.test(type);

  if (trait === 'Warna Bunga') {
    const petalColor = isDominant ? '#c084fc' : '#ffffff';
    const strokeColor = isDominant ? '#7e22ce' : '#475569';
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block flex-shrink-0 animate-scale-up">
        <circle cx="12" cy="7" r="4.5" fill={petalColor} stroke={strokeColor} strokeWidth="1.5" />
        <circle cx="12" cy="17" r="4.5" fill={petalColor} stroke={strokeColor} strokeWidth="1.5" />
        <circle cx="7" cy="12" r="4.5" fill={petalColor} stroke={strokeColor} strokeWidth="1.5" />
        <circle cx="17" cy="12" r="4.5" fill={petalColor} stroke={strokeColor} strokeWidth="1.5" />
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

  if (trait === 'Warna Biji') {
    const seedColor = isDominant ? '#facc15' : '#86efac'; // Yellow vs Green
    const strokeColor = isDominant ? '#ca8a04' : '#166534';
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block flex-shrink-0 animate-scale-up">
        <circle cx="12" cy="12" r="8" fill={seedColor} stroke={strokeColor} strokeWidth="2" />
        <path d="M 9 9 Q 12 7 15 9" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
      </svg>
    );
  }

  if (trait === 'Tinggi Tanaman') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block flex-shrink-0 animate-scale-up">
        <path d={isDominant ? "M12 22 V6" : "M12 22 V14"} stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M12 16 Q16 14 17 12 Q14 12 12 15" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
        {isDominant && (
          <>
            <path d="M12 11 Q8 9 7 7 Q10 7 12 10" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
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

  if (trait === 'Bentuk Polong') {
    const podColor = '#22c55e';
    const strokeColor = '#15803d';
    if (isDominant) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block flex-shrink-0 animate-scale-up">
          <path d="M4 14 C7 7 17 6 20 8 C18 14 9 17 4 14 Z" fill={podColor} stroke={strokeColor} strokeWidth="1.5" />
        </svg>
      );
    } else {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block flex-shrink-0 animate-scale-up">
          <path d="M4 14 C6 9 9 10 12 8 C15 10 18 8 20 9 C18 14 14 13 12 15 C10 13 6 15 4 14 Z" fill={podColor} stroke={strokeColor} strokeWidth="1.5" />
        </svg>
      );
    }
  }

  return null;
};

const WickerBasket = ({ size = 56 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[2px_3px_2px_rgba(0,0,0,0.2)]">
      <path d="M6 10 C6 5 18 5 18 10" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 10 H21 L18 20 H6 Z" fill="#d97706" stroke="#78350f" strokeWidth="2" strokeLinejoin="round" />
      <path d="M6 10 L8 20 M12 10 V20 M18 10 L16 20" stroke="#78350f" strokeWidth="1.5" />
      <path d="M4 14 H20 M5 17 H19" stroke="#78350f" strokeWidth="1.5" />
    </svg>
  );
};

const GardenPlant = ({ type, trait, isHarvested, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`relative flex flex-col items-center select-none transition-all duration-300 flex-shrink-0 ${
        isHarvested 
          ? 'opacity-20 scale-90 pointer-events-none filter grayscale' 
          : 'hover:scale-115 hover:-translate-y-2 cursor-pointer active:scale-95 group'
      }`}
    >
      {!isHarvested && (
        <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
      )}

      <div className="w-12 h-16 sm:w-14 sm:h-20 flex flex-col items-center justify-end relative z-10">
        <div className="w-1.5 h-11 sm:h-13 bg-emerald-600 rounded-full shadow-2xs group-hover:bg-emerald-500 transition-colors" />
        <div className="absolute left-2.5 bottom-6 w-3.5 h-1.5 bg-emerald-500 rounded-full rotate-30 shadow-3xs group-hover:rotate-45 transition-all" />
        <div className="absolute right-2.5 bottom-4.5 w-3.5 h-1.5 bg-emerald-500 rounded-full -rotate-30 shadow-3xs group-hover:-rotate-45 transition-all" />
        
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-10 flex items-center justify-center filter drop-shadow-[1px_2px_1px_rgba(0,0,0,0.15)] group-hover:animate-bounce">
          <TraitIcon type={type} trait={trait} size={28} />
        </div>
      </div>
      
      {isHarvested && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[6.5px] font-black uppercase bg-slate-800 text-white px-1 py-0.5 rounded border border-slate-700 shadow-3xs z-30 leading-none">
            Dipanen
          </span>
        </div>
      )}
    </div>
  );
};

export const Stage5HarvestChallenge = () => {
  const { navigateTo, completeStage, sourceWorldView } = useGame();
  const [missionIdx, setMissionIdx] = useState(0);
  const mission = HARVEST_MISSIONS[missionIdx];
  const stageInfo = STAGES.find(s => s.id === 5);

  const [plantPool, setPlantPool] = useState([]);
  const [harvested, setHarvested] = useState([]); 
  const [feedback, setFeedback] = useState(null);
  const [stageCompleted, setStageCompleted] = useState(false);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // Sync state whenever the mission changes
  useEffect(() => {
    setPlantPool(mission.plantPool.map(p => ({ ...p, isHarvested: false })));
    setHarvested([]);
    setRoundCompleted(false);
    setFeedback(null);
  }, [missionIdx]);

  const handlePlantClick = (plant) => {
    sound.playClick();
    if (harvested.length >= 4) {
      setFeedback({
        type: 'error',
        message: 'Keranjang sudah penuh! Silakan keluarkan tanaman dari keranjang terlebih dahulu.'
      });
      return;
    }

    setHarvested(prev => [...prev, plant]);
    setPlantPool(prev => prev.map(p => p.id === plant.id ? { ...p, isHarvested: true } : p));
    setFeedback(null);
  };

  const handleCancelHarvest = (plant) => {
    sound.playClick();
    if (roundCompleted) return;

    setHarvested(prev => prev.filter(p => p.id !== plant.id));
    setPlantPool(prev => prev.map(p => p.id === plant.id ? { ...p, isHarvested: false } : p));
    setFeedback(null);
  };

  const handleClearHarvest = () => {
    sound.playClick();
    setHarvested([]);
    setPlantPool(mission.plantPool.map(p => ({ ...p, isHarvested: false })));
    setFeedback(null);
  };

  const handleVerifyHarvest = () => {
    if (harvested.length < 4) {
      sound.playWrong();
      setFeedback({
        type: 'error',
        message: `Keranjang belum penuh. Kamu harus memanen tepat 4 tanaman untuk memenuhi rasio target ${mission.ratioText}.`
      });
      return;
    }

    const dominantCount = harvested.filter(p => /[A-Z]/.test(p.type)).length;
    const recessiveCount = harvested.filter(p => !/[A-Z]/.test(p.type)).length;

    const targetDom = mission.targetDominant ?? 3;
    const targetRec = mission.targetRecessive ?? 1;

    if (dominantCount === targetDom && recessiveCount === targetRec) {
      sound.playCorrect();
      setFeedback({
        type: 'success',
        message: `Luar biasa! Rasio panen ${mission.traitName} tepat ${mission.ratioText} (${dominantCount} Dominan : ${recessiveCount} Resesif).`
      });
      setScore(prev => prev + 150);
      setRoundCompleted(true);

      // Play fanfare on final round completion
      if (missionIdx === HARVEST_MISSIONS.length - 1) {
        setTimeout(() => {
          setStageCompleted(true);
          sound.playFanfare();
          try { confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } }); } catch(e){}
          completeStage(5, 3, score + 150, 100, 45);
        }, 1800);
      }
    } else {
      sound.playWrong();
      setFeedback({
        type: 'error',
        message: `Rasio panen kurang tepat! Kamu memanen ${dominantCount} Dominan dan ${recessiveCount} Resesif (Target: ${targetDom} Dominan : ${targetRec} Resesif). Coba sesuaikan kembali!`
      });
    }
  };

  const handleNextMission = () => {
    sound.playClick();
    setMissionIdx(prev => prev + 1);
  };

  return (
    <div className="w-full h-screen relative overflow-hidden bg-[#faf6ee] select-none flex flex-col p-2 sm:p-4 md:p-8 text-left justify-between overflow-y-auto stage-main-wrapper">
      
      {/* Retro parchment paper lines overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] z-0" />

      {/* Floating Header Banner HUD */}
      <div className="w-full p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/90 border-2 border-slate-800 shadow-[3px_3px_0px_#1e293b] sm:shadow-[4px_4px_0px_#1e293b] flex items-center justify-between gap-2 z-30 relative mb-1.5 sm:mb-2 stage-header-hud">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo(sourceWorldView === 'rpg-world' ? 'rpg-world' : 'map')}
            className="p-1.5 rounded-xl bg-white border-2 border-slate-800 text-slate-700 hover:text-sky-600 transition shadow-3xs cursor-pointer flex-shrink-0 active:translate-y-0.5"
            title={sourceWorldView === 'rpg-world' ? "Kembali ke RPG Map" : "Kembali ke Peta"}
          >
            <ChevronLeft className="w-4 h-4 stroke-[3px]" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-green-50 border-2 border-slate-800 p-0.5 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img 
                src="/assets/rumah_mendel_banner.webp" 
                alt="Rumah Mendel Banner" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-[7px] font-black text-indigo-700 uppercase tracking-widest font-sans block">
                {stageInfo.location} &bull; STAGE 5 (Misi {missionIdx + 1}/{HARVEST_MISSIONS.length})
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
            {HARVEST_MISSIONS.map((m, idx) => (
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
        <div className="flex-1 flex flex-col justify-between relative z-10 py-0.5 sm:py-1 gap-1.5 sm:gap-2 stage-workspace-compact">
          
          {/* Garden Plot (Soil Area) */}
          <div className="w-full max-w-2xl mx-auto rounded-2xl sm:rounded-3xl border-2 border-amber-900/60 bg-[#9a6435]/20 p-2 sm:p-4 shadow-inner relative flex flex-col justify-between min-h-[120px] sm:min-h-[190px]">
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-[radial-gradient(#78350f_1.5px,transparent_1.5px)] [background-size:12px_12px] opacity-15 pointer-events-none" />
            
            <div className="flex items-center justify-between z-10 mb-1 px-1 sm:px-2">
              <span className="text-[8px] sm:text-[10px] font-black uppercase text-amber-950 tracking-wider flex items-center gap-1">
                <span>🌱</span> KEBUN ERCIS BIARA (KLIK UNTUK MEMANEN)
              </span>
              <span className="text-[7.5px] sm:text-[9px] font-bold text-amber-900 bg-amber-200/60 px-1.5 sm:px-2 py-0.5 rounded-full border border-amber-800/30">
                Tersedia: {plantPool.filter(p => !p.isHarvested).length} Tanaman
              </span>
            </div>

            {/* Plants Grid */}
            <div className="flex flex-wrap items-end justify-around gap-1.5 sm:gap-4 z-10 py-1 sm:py-2">
              {plantPool.map((plant) => (
                <GardenPlant 
                  key={plant.id} 
                  type={plant.type} 
                  trait={mission.traitName}
                  isHarvested={plant.isHarvested}
                  onClick={() => !plant.isHarvested && handlePlantClick(plant)}
                />
              ))}
            </div>

            {/* Hint bar at bottom of garden */}
            <div className="z-10 text-center">
              <p className="text-[8px] sm:text-[9.5px] font-bold text-amber-950/80 bg-white/40 rounded-lg py-0.5 sm:py-1 px-2 border border-amber-900/20 inline-block line-clamp-2">
                💡 {mission.hint}
              </p>
            </div>
          </div>

          {/* Lower Section: Basket & Verification Area */}
          <div className="w-full max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-6 bg-white/80 border-2 border-slate-800 rounded-2xl sm:rounded-3xl p-2 sm:p-4 shadow-[3px_3px_0px_#1e293b] sm:shadow-[4px_4px_0px_#1e293b] relative z-20">
            
            {/* Left: Basket Visual & Counter */}
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-center sm:justify-start">
              <div className="relative flex-shrink-0">
                <WickerBasket size={44} />
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white font-mono font-black text-[8.5px] w-4.5 h-4.5 rounded-full border-2 border-slate-800 flex items-center justify-center shadow-3xs">
                  {harvested.length}/4
                </span>
              </div>
              <div>
                <span className="text-[7.5px] sm:text-[9px] font-black uppercase text-slate-500 tracking-wider block">
                  TARGET RASIO PANEN
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm sm:text-lg font-black text-amber-900 font-mono">
                    {mission.ratioText}
                  </span>
                  <span className="text-[8.5px] sm:text-[10px] font-bold text-slate-700">
                    {mission.ratioLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Middle: Harvested Items Slots */}
            <div className="flex-1 w-full sm:w-auto flex flex-col items-center">
              <span className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Isi Keranjang (Klik untuk Membatalkan)
              </span>
              <div className="flex gap-1.5 sm:gap-3 justify-center">
                {[0, 1, 2, 3].map((slotIdx) => {
                  const plant = harvested[slotIdx];
                  return (
                    <div 
                      key={slotIdx}
                      onClick={() => plant && handleCancelHarvest(plant)}
                      className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                        plant 
                          ? 'border-slate-800 bg-amber-100/70 shadow-[2px_2px_0px_#1e293b] cursor-pointer hover:scale-105 active:scale-95' 
                          : 'border-dashed border-slate-300 bg-slate-50 text-slate-300'
                      }`}
                    >
                      {plant ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <TraitIcon type={plant.type} trait={mission.traitName} size={16} />
                          <span className="text-[6.5px] sm:text-[7px] font-mono font-black text-slate-700">{plant.type}</span>
                        </div>
                      ) : (
                        <span className="text-xs font-mono font-black select-none">+</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Actions and Feedback */}
            <div className="w-full sm:w-52 flex flex-col gap-1.5 sm:gap-2 items-center">
              {feedback && (
                <div className={`w-full p-1.5 sm:p-2 rounded-xl border-2 border-slate-800 text-[8px] sm:text-[8.5px] font-black flex items-center gap-1.5 animate-fade-in ${
                  feedback.type === 'success' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {feedback.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> : <XCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                  <span className="leading-tight">{feedback.message}</span>
                </div>
              )}

              {!roundCompleted ? (
                <div className="flex gap-2 w-full">
                  <button
                    onClick={handleClearHarvest}
                    disabled={harvested.length === 0}
                    className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border-2 border-slate-800 font-black text-[8.5px] sm:text-[9px] flex items-center justify-center gap-1 shadow-[2px_2px_0px_#1e293b] active:translate-y-0.5 transition-all ${
                      harvested.length > 0 
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer' 
                        : 'bg-slate-50 text-slate-300 border-slate-300 shadow-none cursor-not-allowed'
                    }`}
                  >
                    <RefreshCw className="w-3 h-3 stroke-[2.5px]" />
                    <span>RESET</span>
                  </button>

                  <button
                    onClick={handleVerifyHarvest}
                    disabled={harvested.length === 0}
                    className={`flex-1 py-1.5 sm:py-2 rounded-xl border-2 border-slate-800 font-black text-[8.5px] sm:text-[9px] flex items-center justify-center gap-1 shadow-[2px_2px_0px_#1e293b] active:translate-y-0.5 transition-all ${
                      harvested.length > 0 
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer' 
                        : 'bg-slate-100 text-slate-300 border-slate-300 shadow-none cursor-not-allowed'
                    }`}
                  >
                    <span>VERIFIKASI</span>
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5px]" />
                  </button>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center gap-1">
                  {missionIdx < HARVEST_MISSIONS.length - 1 && (
                    <button
                      onClick={handleNextMission}
                      className="w-full py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-black text-[9px] sm:text-[10px] shadow-[3px_3px_0px_#1e293b] active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1.5 border-2 border-slate-800"
                    >
                      <span>LANJUT MISI {missionIdx + 2}/{HARVEST_MISSIONS.length}</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5px]" />
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>
      ) : (
        /* Victory Screen */
        <div className="absolute inset-0 z-40 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
          <div className="p-4 sm:p-6 rounded-3xl text-center space-y-2.5 sm:space-y-4 max-w-xs w-full border-2 border-slate-800 bg-white shadow-2xl relative z-50 animate-scale-up max-h-[96vh] overflow-y-auto">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border-2 border-slate-800 p-1 flex items-center justify-center mx-auto shadow-xs overflow-hidden">
              <img 
                src="/assets/rumah_mendel_banner.webp" 
                alt="Victory Stage 5" 
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[8px] font-black text-emerald-700 uppercase tracking-widest font-sans">ALL MISSIONS COMPLETED</span>
              <h3 className="text-base font-black text-black">STAGE 5 SELESAI!</h3>
              <p className="text-[10px] text-black/85 font-bold leading-relaxed px-1">
                Selamat! Kamu berhasil menuntaskan seluruh 6 misi panen rasio F2 (3:1), uji silang test cross (1:1), dan galur murni F1 (100%). Kamu resmi menjadi <strong className="text-emerald-700">Raja Panen Biara</strong>!
              </p>
            </div>

            <div className="flex justify-center gap-1.5">
              {[1, 2, 3].map(s => (
                <Star key={s} className="w-6 h-6 text-amber-500 fill-amber-500 animate-bounce" style={{ animationDelay: `${s * 0.2}s` }} />
              ))}
            </div>

            <div className="p-2.5 bg-amber-500/10 border-2 border-slate-800 rounded-xl text-amber-900 text-[10px] font-black shadow-[3px_3px_0px_#1e293b]">
              🏆 Lencana Diperoleh: Raja Panen Biara
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
                  onClick={() => navigateTo('stage', 6)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-[10px] flex items-center justify-center gap-1 shadow-3xs cursor-pointer flex-1"
                >
                  <span>STAGE 6</span>
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
