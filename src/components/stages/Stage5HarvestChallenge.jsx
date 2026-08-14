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
    title: 'Misi 1: Panen Warna Bunga',
    traitName: 'Warna Bunga',
    ratioText: '3 : 1',
    ratioLabel: '(Ungu : Putih)',
    dominantType: 'PP',
    recessiveType: 'pp',
    plantPool: [
      { id: 'p1', type: 'PP' },
      { id: 'p2', type: 'PP' },
      { id: 'p3', type: 'PP' },
      { id: 'p4', type: 'pp' },
      { id: 'p5', type: 'PP' },
      { id: 'p6', type: 'PP' },
      { id: 'p7', type: 'pp' },
    ],
    hint: 'Pilih 3 tanaman bunga Ungu dan 1 tanaman bunga Putih untuk dimasukkan ke keranjang panen.'
  },
  {
    id: 2,
    title: 'Misi 2: Panen Bentuk Biji',
    traitName: 'Bentuk Biji',
    ratioText: '3 : 1',
    ratioLabel: '(Bulat : Keriput)',
    dominantType: 'RR',
    recessiveType: 'rr',
    plantPool: [
      { id: 's1', type: 'RR' },
      { id: 's2', type: 'rr' },
      { id: 's3', type: 'RR' },
      { id: 's4', type: 'RR' },
      { id: 's5', type: 'rr' },
      { id: 's6', type: 'RR' },
      { id: 's7', type: 'RR' },
    ],
    hint: 'Pilih 3 tanaman biji Bulat dan 1 tanaman biji Keriput untuk dimasukkan ke keranjang panen.'
  },
  {
    id: 3,
    title: 'Misi 3: Panen Tinggi Tanaman',
    traitName: 'Tinggi Tanaman',
    ratioText: '3 : 1',
    ratioLabel: '(Tinggi : Pendek)',
    dominantType: 'TT',
    recessiveType: 'tt',
    plantPool: [
      { id: 't1', type: 'TT' },
      { id: 't2', type: 'tt' },
      { id: 't3', type: 'tt' },
      { id: 't4', type: 'TT' },
      { id: 't5', type: 'TT' },
      { id: 't6', type: 'TT' },
      { id: 't7', type: 'TT' },
    ],
    hint: 'Pilih 3 tanaman batang Tinggi dan 1 tanaman batang Pendek untuk dimasukkan ke keranjang panen.'
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

  return null;
};

const WickerBasket = ({ size = 56 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-800">
      {/* Basket handle */}
      <path d="M4 10 Q12 1 20 10" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Basket body */}
      <path d="M3 10 H21 L18 20 H6 Z" fill="#d97706" stroke="#78350f" strokeWidth="2" strokeLinejoin="round" />
      {/* Woven lines */}
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
      {/* Soft glowing halo on hover */}
      {!isHarvested && (
        <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
      )}

      {/* Little green plant stem & leaves */}
      <div className="w-12 h-16 sm:w-14 sm:h-20 flex flex-col items-center justify-end relative z-10">
        <div className="w-1.5 h-11 sm:h-13 bg-emerald-600 rounded-full shadow-2xs group-hover:bg-emerald-500 transition-colors" />
        <div className="absolute left-2.5 bottom-6 w-3.5 h-1.5 bg-emerald-500 rounded-full rotate-30 shadow-3xs group-hover:rotate-45 transition-all" />
        <div className="absolute right-2.5 bottom-4.5 w-3.5 h-1.5 bg-emerald-500 rounded-full -rotate-30 shadow-3xs group-hover:-rotate-45 transition-all" />
        
        {/* Flower or trait on top with wiggle bounce */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-10 flex items-center justify-center filter drop-shadow-[1px_2px_1px_rgba(0,0,0,0.15)] group-hover:animate-bounce">
          <TraitIcon type={type} trait={trait} size={28} />
        </div>
      </div>
      
      {/* Plucked indicator badge when harvested */}
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
  const { navigateTo, completeStage } = useGame();
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

    // Add to harvested list
    setHarvested(prev => [...prev, plant]);
    
    // Set harvested state in garden pool
    setPlantPool(prev => prev.map(p => p.id === plant.id ? { ...p, isHarvested: true } : p));
    setFeedback(null);
  };

  const handleCancelHarvest = (plant) => {
    sound.playClick();
    if (roundCompleted) return;

    // Remove from harvested list
    setHarvested(prev => prev.filter(p => p.id !== plant.id));
    
    // Restore back in garden pool
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
        message: 'Keranjang belum penuh. Kamu harus memanen tepat 4 tanaman untuk memenuhi rasio 3:1.'
      });
      return;
    }

    const dominantCount = harvested.filter(p => /[A-Z]/.test(p.type)).length;
    const recessiveCount = harvested.filter(p => !/[A-Z]/.test(p.type)).length;

    if (dominantCount === 3 && recessiveCount === 1) {
      sound.playCorrect();
      setFeedback({
        type: 'success',
        message: `Luar biasa! Rasio panen ${mission.traitName} tepat 3:1 (3 Dominan : 1 Resesif).`
      });
      setScore(prev => prev + 150);
      setRoundCompleted(true);

      // Play fanfare on final round completion
      if (missionIdx === 2) {
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
        message: `Rasio panen kurang tepat! Kamu memanen ${dominantCount} Dominan dan ${recessiveCount} Resesif. Coba sesuaikan kembali!`
      });
    }
  };

  const handleNextMission = () => {
    sound.playClick();
    setMissionIdx(prev => prev + 1);
  };

  return (
    <div className="w-full h-screen relative overflow-hidden bg-[#faf6ee] select-none flex flex-col p-4 md:p-8 text-left justify-between">
      
      {/* Retro parchment paper lines overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] z-0" />

      {/* Floating Header Banner HUD */}
      <div className="w-full p-3 rounded-2xl bg-white/90 border-2 border-slate-800 shadow-[4px_4px_0px_#1e293b] flex items-center justify-between gap-2 z-30 relative mb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('map')}
            className="p-1.5 rounded-xl bg-white border-2 border-slate-800 text-slate-700 hover:text-sky-600 transition shadow-3xs cursor-pointer flex-shrink-0 active:translate-y-0.5"
            title="Kembali ke Peta"
          >
            <ChevronLeft className="w-4 h-4 stroke-[3px]" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-green-50 border-2 border-slate-800 p-0.5 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img 
                src="/assets/rumah_mendel_banner.png" 
                alt="Kebun Mendel Banner" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-[7px] font-black text-emerald-700 uppercase tracking-widest font-sans block">
                {stageInfo.location} &bull; STAGE 5
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
            {[0, 1, 2].map((idx) => (
              <div 
                key={idx}
                className={`w-2.5 h-2.5 rounded-full border border-slate-800 ${
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
        <div className="flex-1 flex flex-col justify-between relative z-10 py-1 overflow-hidden">
          
          {/* Header prompt */}
          <div className="text-center space-y-0.5 my-1">
            <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider">
              Panen tanaman sesuai rasio yang benar!
            </h3>
          </div>

          {/* Main Side-by-Side Area */}
          <div className="flex-1 flex flex-col md:flex-row items-stretch gap-4 my-2 w-full overflow-hidden">
            
            {/* Left Column: The Garden Soil Bed with Stage 1 Mountain Background */}
            <div className="flex-[3] border-2 border-slate-800 rounded-2xl relative shadow-inner flex flex-col justify-end items-center overflow-hidden min-h-[180px] md:min-h-0">
              
              {/* Pixel Art Mountain Background from Level 1 */}
              <img 
                src="/assets/pixel_garden_bg.svg" 
                alt="Pixel Art Garden Background" 
                className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
                draggable="false"
              />

              {/* Gentle overlay to adapt contrast */}
              <div className="absolute inset-0 bg-sky-950/10 pointer-events-none z-0" />

              {/* Horizontally scrollable row of plants growing directly from the background grass */}
              <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-800/40 z-20 pb-6 pt-10 px-6 flex flex-row flex-nowrap gap-5 justify-start md:justify-center items-end min-h-[120px]">
                {plantPool.map((plant) => (
                  <GardenPlant
                    key={plant.id}
                    type={plant.type}
                    trait={mission.traitName}
                    isHarvested={plant.isHarvested}
                    onClick={() => handlePlantClick(plant)}
                  />
                ))}
              </div>
            </div>

            {/* Right Column: Dashboard (Signpost, Basket, Slots, Buttons) */}
            <div className="flex-[2] flex flex-col justify-between gap-4 bg-white/90 border-2 border-slate-800 p-4 sm:p-5 rounded-2xl shadow-[4px_4px_0px_#1e293b] overflow-y-auto w-full md:max-w-sm min-w-[280px]">
              
              {/* Top of Dashboard: Signpost & Prompt */}
              <div className="flex items-center justify-between gap-4 border-b-2 border-slate-200 pb-3">
                <div>
                  <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-0.5">Target Panen</span>
                  <p className="text-[11px] sm:text-xs font-black text-slate-800 leading-normal">{mission.hint}</p>
                </div>
                
                {/* Sign Board */}
                <div className="bg-[#fde047] border-2 border-slate-800 px-3 py-1.5 rounded-xl shadow-xs text-center flex flex-col items-center justify-center flex-shrink-0 min-w-[70px]">
                  <span className="text-[8px] font-black text-slate-700 uppercase leading-none">Rasio</span>
                  <span className="text-sm sm:text-base font-black text-slate-900 font-mono leading-none my-1">{mission.ratioText}</span>
                  <span className="text-[7px] font-bold text-slate-600 leading-none">{mission.ratioLabel}</span>
                </div>
              </div>

              {/* Middle of Dashboard: Basket & Slots */}
              <div className="flex flex-col items-center gap-2.5 py-2">
                <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-0.5">Keranjang Panen</span>
                
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 animate-bounce" style={{ animationDuration: '3s' }}>
                    <WickerBasket size={56} />
                  </div>
                  
                  <div className="flex gap-2">
                    {[0, 1, 2, 3].map((idx) => {
                      const item = harvested[idx];
                      return (
                        <div
                          key={idx}
                          onClick={() => item && handleCancelHarvest(item)}
                          className={`w-12 h-16 sm:w-14 sm:h-18 rounded-xl border-2 flex items-center justify-center shadow-[2px_2px_0px_#1e293b] transition-all relative ${
                            item 
                              ? 'bg-white border-slate-800 hover:border-rose-500 cursor-pointer active:scale-95' 
                              : 'bg-slate-100/50 border-dashed border-slate-350 shadow-none'
                          }`}
                        >
                          {item ? (
                            <>
                              <TraitIcon type={item.type} trait={mission.traitName} size={26} />
                              <div className="absolute inset-0 bg-rose-500/0 hover:bg-rose-500/10 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-all">
                                <span className="text-[8px] font-black text-rose-700 bg-white px-1 py-0.5 rounded border border-rose-600 shadow-3xs leading-none">X</span>
                              </div>
                            </>
                          ) : (
                            <span className="text-slate-300 font-black text-base select-none">&mdash;</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom of Dashboard: Feedback & Actions */}
              <div className="space-y-3 border-t-2 border-slate-200 pt-3 flex flex-col items-center">
                {feedback && (
                  <div className={`w-full p-2.5 rounded-xl border-2 border-slate-800 flex items-center gap-2 text-[10px] sm:text-xs font-black shadow-[2px_2px_0px_#1e293b] animate-fade-in ${
                    feedback.type === 'success' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
                    <span className="leading-tight">{feedback.message}</span>
                  </div>
                )}

                {!roundCompleted ? (
                  <div className="flex gap-3 w-full justify-center">
                    <button
                      onClick={handleClearHarvest}
                      disabled={harvested.length === 0}
                      className={`flex-1 py-2.5 rounded-xl border-2 border-slate-800 font-black text-[10px] sm:text-[11px] flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all ${
                        harvested.length > 0 
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer' 
                          : 'bg-slate-50 text-slate-400 border-slate-400 shadow-none cursor-not-allowed'
                      }`}
                    >
                      <RefreshCw className="w-3.5 h-3.5 stroke-[2.5px]" />
                      <span>KOSONGKAN</span>
                    </button>

                    <button
                      onClick={handleVerifyHarvest}
                      disabled={harvested.length === 0}
                      className={`flex-1 py-2.5 rounded-xl border-2 border-slate-800 font-black text-[10px] sm:text-[11px] flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all ${
                        harvested.length > 0 
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer' 
                          : 'bg-slate-100 text-slate-400 border-slate-400 shadow-none cursor-not-allowed'
                      }`}
                    >
                      <span>VERIFIKASI</span>
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5px]" />
                    </button>
                  </div>
                ) : (
                  <div className="w-full flex justify-center py-1">
                    {missionIdx < 2 && (
                      <button
                        onClick={handleNextMission}
                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs shadow-[3px_3px_0px_#14532d] hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 border-2 border-slate-800"
                      >
                        <span>MISI BERIKUTNYA</span>
                        <ArrowRight className="w-4 h-4 stroke-[3px]" />
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      ) : (
        /* Victory Screen */
        <div className="absolute inset-0 z-40 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="p-6 rounded-3xl text-center space-y-4 max-w-xs w-full border-2 border-slate-800 bg-white shadow-2xl relative z-50 animate-scale-up">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border-2 border-slate-800 p-1 flex items-center justify-center mx-auto shadow-xs overflow-hidden">
              <img 
                src="/assets/rumah_mendel_banner.png" 
                alt="Victory Stage 5" 
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[8px] font-black text-emerald-700 uppercase tracking-widest font-sans">ROUND COMPLETED</span>
              <h3 className="text-base font-black text-black">STAGE 5 SELESAI!</h3>
              <p className="text-[10px] text-black/85 font-bold leading-relaxed px-1">
                Selamat! Kamu berhasil memprediksi rasio dan memanen tanaman dengan perbandingan yang tepat.
              </p>
            </div>

            <div className="flex justify-center gap-1.5">
              {[1, 2, 3].map(s => (
                <Star key={s} className="w-6 h-6 text-amber-500 fill-amber-500 animate-bounce" style={{ animationDelay: `${s * 0.2}s` }} />
              ))}
            </div>

            <div className="p-2.5 bg-amber-500/10 border-2 border-slate-800 rounded-xl text-amber-900 text-[10px] font-black shadow-[3px_3px_0px_#1e293b]">
              🏆 Lencana Diperoleh: Raja Panen
            </div>

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
          </div>
        </div>
      )}
    </div>
  );
};
