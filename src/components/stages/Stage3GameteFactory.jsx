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

const FlowerIcon = ({ type, size = 20 }) => {
  // Check if type represents dominant trait (contains uppercase)
  const isDominant = /[A-Z]/.test(type);
  const petalColor = isDominant ? '#c084fc' : '#ffffff'; // purple-400 or white
  const strokeColor = isDominant ? '#7e22ce' : '#475569'; // purple-700 or slate-600

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block flex-shrink-0">
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
};

const GAMETE_MISSIONS = [
  {
    id: 1,
    title: 'Misi 1: Induk Heterozigot (Aa)',
    parentGenotype: 'Aa',
    prompt: 'Tarik alel yang akan masuk ke gamet dari induk Heterozigot (Aa)!',
    expectedGametes: ['A', 'a'],
    hint: 'Ingat! Setiap gamet hanya membawa satu alel (Hukum Segregasi).'
  },
  {
    id: 2,
    title: 'Misi 2: Induk Homozigot Dominan (QQ)',
    parentGenotype: 'QQ',
    prompt: 'Tarik alel yang akan masuk ke gamet dari induk Homozigot Dominan (QQ)!',
    expectedGametes: ['Q', 'Q'],
    hint: 'Induk QQ memproduksi gamet yang semuanya membawa alel Q.'
  },
  {
    id: 3,
    title: 'Misi 3: Induk Homozigot Resesif (bb)',
    parentGenotype: 'bb',
    prompt: 'Tarik alel yang akan masuk ke gamet dari induk Homozigot Resesif (bb)!',
    expectedGametes: ['b', 'b'],
    hint: 'Induk bb memproduksi gamet yang semuanya membawa alel b.'
  }
];

export const Stage3GameteFactory = () => {
  const { navigateTo, completeStage } = useGame();
  const [missionIdx, setMissionIdx] = useState(0);
  const [selectedGametes, setSelectedGametes] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [stageCompleted, setStageCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const mission = GAMETE_MISSIONS[missionIdx];
  const stageInfo = STAGES.find(s => s.id === 3);

  // Dynamically generate allele source cards based on the parental genotype
  const getAlleleOptions = (genotype) => {
    const a1 = genotype[0];
    const a2 = genotype[1];
    
    if (a1 === a2) {
      // Homozygous parent (e.g. PP or bb)
      const oppositeCase = a1 === a1.toUpperCase() ? a1.toLowerCase() : a1.toUpperCase();
      const mixed = a1 === a1.toUpperCase() ? a1 + oppositeCase : oppositeCase + a1;
      return [a1, oppositeCase, genotype, mixed];
    } else {
      // Heterozygous parent (e.g. Aa)
      return [a1, a2, genotype, a1 + a1];
    }
  };

  const alleleOptions = getAlleleOptions(mission.parentGenotype);

  const handlePickAllele = (allele) => {
    sound.playClick();
    if (selectedGametes.length < 2) {
      setSelectedGametes([...selectedGametes, allele]);
    }
  };

  const handleClearGametes = () => {
    sound.playClick();
    setSelectedGametes([]);
    setFeedback(null);
  };

  const handleVerifyGametes = () => {
    if (selectedGametes.length < 2) return;

    const sortedSelected = [...selectedGametes].sort().join('');
    const sortedExpected = [...mission.expectedGametes].sort().join('');

    const isCorrect = sortedSelected === sortedExpected;

    if (isCorrect) {
      sound.playCorrect();
      setFeedback({
        type: 'success',
        message: `Sempurna! Terbentuk gamet [${selectedGametes.join('] dan [')}] dari induk ${mission.parentGenotype}.`
      });
      setScore(prev => prev + 100);

      setTimeout(() => {
        if (missionIdx < GAMETE_MISSIONS.length - 1) {
          setMissionIdx(prev => prev + 1);
          setSelectedGametes([]);
          setFeedback(null);
        } else {
          setStageCompleted(true);
          sound.playFanfare();
          try { confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); } catch(e){}
          completeStage(3, 3, score + 100, 100, 40);
        }
      }, 1800);
    } else {
      sound.playWrong();
      setFeedback({
        type: 'error',
        message: 'Kombinasi gamet belum tepat. Ingat: Hukum Segregasi memisahkan pasangan alel menjadi gamet tunggal.'
      });
    }
  };

  return (
    <div className="w-full h-screen relative overflow-hidden bg-[#faf6ee] select-none flex flex-col p-4 text-left justify-between">
      
      {/* Retro parchment paper lines overlay for desk vibe */}
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
            <div className="w-8 h-8 rounded-xl bg-blue-50 border-2 border-slate-800 p-0.5 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img 
                src="/assets/rumah_mendel_banner.png" 
                alt="Rumah Mendel Banner" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-[7px] font-black text-indigo-700 uppercase tracking-widest font-sans block">
                {stageInfo.location} &bull; STAGE 3
              </span>
              <h2 className="text-[11px] sm:text-xs font-black text-black leading-tight">
                {stageInfo.title}
              </h2>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Score indicator */}
          <div className="flex items-center gap-1.5 bg-amber-500/10 border-2 border-slate-800 px-3 py-1 rounded-xl shadow-3xs">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-[10px] font-black text-amber-900 font-mono">Skor: {score}</span>
          </div>
        </div>
      </div>

      {!stageCompleted ? (
        <div className="flex-1 flex flex-col justify-between relative z-10 py-1">
          
          {/* Heading */}
          <div className="text-center space-y-0.5 my-1">
            <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider">
              Tarik alel yang akan masuk ke gamet!
            </h3>
            <span className="text-[8px] font-black text-indigo-700 uppercase tracking-widest block">
              Tantangan {missionIdx + 1} dari {GAMETE_MISSIONS.length}
            </span>
          </div>

          {/* Steampunk Gamete Factory Machine Container - Always Horizontal Row */}
          <div className="flex flex-row items-center justify-center gap-2 sm:gap-4 my-1 w-full max-w-2xl mx-auto px-2">
            
            {/* Left: Retro Machine Graphic */}
            <div className="flex flex-col items-center flex-shrink-0">
              {/* Induk : Genotype Sign */}
              <div className="px-2.5 py-1 bg-[#fef3c7] border-2 border-slate-800 rounded-lg font-black text-[8.5px] text-slate-800 shadow-[1.5px_1.5px_0px_#1e293b] mb-1 z-10">
                Induk : {mission.parentGenotype}
              </div>

              {/* Steampunk Machine Body */}
              <div className="w-28 h-22 bg-[#cbd5e1] border-[2.5px] border-slate-800 rounded-xl shadow-[3px_3px_0px_#1e293b] flex items-center justify-center p-1.5 relative overflow-hidden">
                {/* Screen Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,6px_100%] pointer-events-none opacity-45" />
                
                {/* Screen Inner */}
                <div className="w-full h-full bg-[#f8fafc] border-2 border-slate-800 rounded-lg flex items-center justify-center shadow-inner gap-1.5 px-1">
                  <FlowerIcon type={mission.parentGenotype} size={24} />
                  <span className="font-mono font-black text-2xl text-slate-800 tracking-tight select-none">
                    {mission.parentGenotype}
                  </span>
                </div>

                {/* Left/Right small lights */}
                <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-2.5 rounded-full bg-emerald-500 border border-slate-800 animate-pulse" />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-500 border border-slate-800" />
              </div>
            </div>

            {/* Middle: Arrow */}
            <div className="flex items-center justify-center text-slate-700 text-lg font-black animate-pulse select-none flex-shrink-0">
              <span className="text-slate-800 font-extrabold">➔</span>
            </div>

            {/* Center: Gamete Slots */}
            <div className="flex flex-col items-center flex-shrink-0">
              <span className="text-[8.5px] font-black text-slate-800 uppercase tracking-widest mb-1">Gamet</span>
              
              <div className="flex gap-2">
                {[0, 1].map((idx) => {
                  const val = selectedGametes[idx];
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1">
                      {/* Dashed Target Box */}
                      <div className="w-11 h-11 rounded-lg border-1.5 border-dashed border-slate-400 bg-white/40 flex items-center justify-center font-mono text-slate-350 font-black text-sm select-none">
                        ?
                      </div>

                      {/* Cream Card Underneath */}
                      <div className={`w-11 h-12 rounded-lg border-2 border-slate-800 flex flex-col items-center justify-center shadow-[2px_2px_0px_#1e293b] transition-all gap-0.5 ${
                        val 
                          ? 'bg-[#fef08a] text-slate-900' 
                          : 'bg-[#faf6ee] text-slate-400 opacity-60'
                      }`}>
                        {val && <FlowerIcon type={val} size={12} />}
                        <span className="font-mono font-black text-[10px] leading-none">{val || '?'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Middle: Faint Arrow pointing to tip box */}
            <div className="hidden md:flex items-center justify-center text-slate-400 text-lg font-black select-none flex-shrink-0">
              <span>➔</span>
            </div>

            {/* Right: Post-It / Sticky Note Hint Card */}
            <div className="w-32 p-2 bg-[#fef3c7] border-2 border-slate-800 rounded-lg shadow-[2px_2px_0px_#1e293b] flex flex-col gap-0.5 text-left relative overflow-hidden transform rotate-1 hover:rotate-0 transition duration-300 flex-shrink-0">
              {/* Pin design */}
              <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-rose-500 border border-slate-800 shadow-xs" />
              
              <div className="flex items-center gap-0.5 mt-1">
                <span className="text-[8px]">💡</span>
                <span className="text-[7.5px] font-black text-amber-950 uppercase tracking-wider">Ingat!</span>
              </div>
              <p className="text-[7.5px] font-bold text-amber-900 leading-normal">
                {mission.hint.replace('Ingat! ', '')}
              </p>
            </div>

          </div>

          {/* Bottom Row: Source Cards */}
          <div className="space-y-1 text-center my-1">
            <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block">
              Klik Alel Induk untuk Dimasukkan ke Mesin Gamet
            </span>
            <div className="flex justify-center gap-3 flex-wrap">
              {alleleOptions.map((al, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePickAllele(al)}
                  className="w-12 h-14 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-800 flex flex-col items-center justify-center p-1 shadow-[3px_3px_0px_#1e293b] hover:scale-105 active:scale-95 active:translate-y-0.5 active:shadow-[1.5px_1.5px_0px_#1e293b] transition-all cursor-pointer gap-1"
                >
                  <FlowerIcon type={al} size={16} />
                  <span className="font-mono font-black text-xs leading-none">{al}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Feedback & Actions Row */}
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

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleClearGametes}
                className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-800 text-slate-700 font-black text-[9px] flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all"
              >
                <RefreshCw className="w-3 h-3 stroke-[2.5px]" />
                <span>RESET MESIN</span>
              </button>

              <button
                onClick={handleVerifyGametes}
                disabled={selectedGametes.length < 2}
                className={`px-6 py-1.5 rounded-xl border-2 border-slate-800 font-black text-[9px] flex items-center gap-1.5 shadow-[2px_2px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all ${
                  selectedGametes.length >= 2
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 border-slate-400 shadow-none opacity-50 cursor-not-allowed'
                }`}
              >
                <span>VERIFIKASI GAMET</span>
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5px]" />
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* Victory Screen */
        <div className="absolute inset-0 z-40 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="p-6 rounded-3xl text-center space-y-4 max-w-xs w-full border-2 border-slate-800 bg-white shadow-2xl relative z-50 animate-scale-up">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-slate-800 p-1 flex items-center justify-center mx-auto shadow-xs overflow-hidden">
              <img 
                src="/assets/rumah_mendel_banner.png" 
                alt="Victory Stage 3" 
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[8px] font-black text-indigo-700 uppercase tracking-widest font-sans">ROUND COMPLETED</span>
              <h3 className="text-base font-black text-black">STAGE 3 SELESAI!</h3>
              <p className="text-[10px] text-black/85 font-bold leading-relaxed px-1">
                Selamat! Kamu berhasil memahami <strong className="text-blue-600">Hukum Segregasi Mendel I</strong> dan prinsip pembentukan gamet.
              </p>
            </div>

            <div className="flex justify-center gap-1.5">
              {[1, 2, 3].map(s => (
                <Star key={s} className="w-6 h-6 text-amber-500 fill-amber-500 animate-bounce" style={{ animationDelay: `${s * 0.2}s` }} />
              ))}
            </div>

            <div className="p-2.5 bg-amber-500/10 border-2 border-slate-800 rounded-xl text-amber-900 text-[10px] font-black shadow-[3px_3px_0px_#1e293b]">
              🏆 Lencana Diperoleh: Master Gamet
            </div>

            <div className="flex gap-2 justify-center pt-1.5">
              <button
                onClick={() => navigateTo('map')}
                className="px-4 py-2 rounded-xl bg-white border-2 border-slate-800 hover:bg-slate-50 text-slate-700 font-bold text-[10px] shadow-3xs cursor-pointer flex-1"
              >
                PETA STAGE
              </button>
              <button
                onClick={() => navigateTo('stage', 4)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-[10px] flex items-center justify-center gap-1 shadow-3xs cursor-pointer flex-1"
              >
                <span>STAGE 4</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
