import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { STAGES } from '../../data/geneticsData';
import { sound } from '../../services/sound';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Sparkles, 
  Star,
  RefreshCw,
  ChevronLeft,
  Heart
} from 'lucide-react';

export const Stage2GeneBuilder = () => {
  const { navigateTo, completeStage } = useGame();
  const stageInfo = STAGES.find(s => s.id === 2);

  // Game States
  const [slot1, setSlot1] = useState(null);
  const [slot2, setSlot2] = useState(null);
  const [unlockedGenotypes, setUnlockedGenotypes] = useState([]); // e.g. ['AA', 'Aa', 'aA', 'aa']
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [stageCompleted, setStageCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // Initial birds chirping sound trigger
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      sound.playBirdChirp();
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, []);

  // Handle clicking on allele sources at the bottom
  const handleSelectAllele = (allele) => {
    sound.playClick();
    if (!slot1) {
      setSlot1(allele);
    } else if (!slot2) {
      setSlot2(allele);
    }
  };

  // Remove allele from slot when clicked
  const handleRemoveSlot = (slotNum) => {
    sound.playClick();
    if (slotNum === 1) {
      setSlot1(null);
    } else {
      setSlot2(null);
    }
    setFeedback(null);
  };

  const handleClearSlots = () => {
    sound.playClick();
    setSlot1(null);
    setSlot2(null);
    setFeedback(null);
  };

  // Check the constructed genotype combination
  const handleCheckGenotype = () => {
    if (!slot1 || !slot2) return;

    // Keep exact combination to distinguish A+a (Aa) and a+A (aA)
    const rawCombo = slot1 + slot2;

    // Check if it matches any of the targets
    const validTargets = ['AA', 'Aa', 'aA', 'aa'];
    const isValid = validTargets.includes(rawCombo);

    if (isValid) {
      // Check if already unlocked
      if (unlockedGenotypes.includes(rawCombo)) {
        sound.playWrong();
        setFeedback({
          type: 'warning',
          message: `Kamu sudah berhasil membuka genotipe ${rawCombo}! Coba susun kombinasi lain.`
        });
        return;
      }

      // Unlock new genotype!
      sound.playCorrect();
      const updatedGenotypes = [...unlockedGenotypes, rawCombo];
      setUnlockedGenotypes(updatedGenotypes);
      setScore(prev => prev + 150);
      setFeedback({
        type: 'success',
        message: `Hebat! Kombinasi ${rawCombo} berhasil dibentuk.`
      });

      // Clear slots for next attempt
      setSlot1(null);
      setSlot2(null);

      // Check if stage is complete (all 4 unlocked)
      if (updatedGenotypes.length === 4) {
        setTimeout(() => {
          setStageCompleted(true);
          sound.playFanfare();
          try { confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); } catch(e){}
          completeStage(2, 3, score + 150, 100, 40);
        }, 1500);
      }
    } else {
      // Lives decrement
      sound.playWrong();
      const nextLives = lives - 1;
      setLives(nextLives);

      if (nextLives <= 0) {
        setFeedback({
          type: 'error',
          message: 'Jawaban kurang tepat. Nyawa kamu telah habis!'
        });
        setTimeout(() => {
          setGameOver(true);
        }, 1500);
      } else {
        setFeedback({
          type: 'error',
          message: `Kombinasi salah! Nyawa berkurang. Sisa nyawa: ${nextLives} ❤️`
        });
      }
    }
  };

  return (
    <div className="w-full h-screen relative overflow-hidden bg-[#faf6ee] select-none flex flex-col p-4 text-left">
      
      {/* Retro parchment paper lines overlay for desk vibe */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] z-0" />

      {/* Floating Header Banner HUD */}
      <div className="w-full p-3 rounded-2xl bg-white/90 border-2 border-slate-800 shadow-[4px_4px_0px_#1e293b] flex items-center justify-between gap-2 z-30 relative mb-4">
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
                {stageInfo.location} &bull; STAGE 2
              </span>
              <h2 className="text-[11px] sm:text-xs font-black text-black leading-tight">
                {stageInfo.title}
              </h2>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Hearts / Lives indicator */}
          <div className="flex items-center gap-0.5 bg-rose-500/10 border-2 border-slate-800 px-2 py-1 rounded-xl shadow-3xs">
            {[1, 2, 3].map((heartIdx) => {
              const isAlive = heartIdx <= lives;
              return (
                <Heart 
                  key={heartIdx}
                  className={`w-3 h-3 ${
                    isAlive 
                      ? 'text-rose-500 fill-rose-500 animate-pulse' 
                      : 'text-slate-300 fill-slate-200'
                  }`}
                />
              );
            })}
          </div>

          {/* Score indicator */}
          <div className="flex items-center gap-1.5 bg-amber-500/10 border-2 border-slate-800 px-3 py-1 rounded-xl shadow-3xs">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-[10px] font-black text-amber-900 font-mono">Skor: {score}</span>
          </div>
        </div>
      </div>

      {!stageCompleted ? (
        <div className="flex-1 flex flex-col justify-between relative z-10 py-2">
          
          {/* Heading */}
          <div className="text-center space-y-1 my-1">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              Susun genotipe yang benar!
            </h3>
            <p className="text-[9px] text-slate-500 font-bold">
              Kombinasikan alel A dan a untuk melengkapi 4 target genotipe di bawah.
            </p>
          </div>

          {/* Top Row: Target Genotype Cards (AA, Aa, aA, aa) */}
          <div className="grid grid-cols-4 gap-2 max-w-md mx-auto w-full my-2">
            {['AA', 'Aa', 'aA', 'aa'].map((genotype) => {
              const isUnlocked = unlockedGenotypes.includes(genotype);
              let targetLabel = 'Homozigot Dominan';
              if (genotype === 'Aa' || genotype === 'aA') targetLabel = 'Heterozigot';
              if (genotype === 'aa') targetLabel = 'Homozigot Resesif';

              return (
                <div 
                  key={genotype}
                  className={`border-2 border-slate-800 rounded-2xl p-2.5 flex flex-col items-center justify-center gap-1 relative overflow-hidden transition-all duration-300 shadow-[3px_3px_0px_#1e293b] ${
                    isUnlocked 
                      ? 'bg-amber-100/90 text-slate-800 scale-[1.02]' 
                      : 'bg-white/40 text-slate-400 opacity-60'
                  }`}
                >
                  <span className="font-mono font-black text-lg leading-none">{isUnlocked ? genotype : '??'}</span>
                  <span className="text-[7.5px] font-black uppercase tracking-wider text-slate-500 text-center leading-tight whitespace-normal max-w-full">
                    {targetLabel}
                  </span>

                  {/* Checked Badge Overlay */}
                  {isUnlocked && (
                    <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-emerald-500 border border-slate-800 flex items-center justify-center text-[7px] text-white font-extrabold animate-bounce">
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Builder Dropzone Area */}
          <div className="max-w-xs mx-auto w-full p-4 border-2 border-dashed border-slate-400 rounded-3xl bg-white/70 shadow-sm flex items-center justify-between gap-3 relative my-3">
            
            {/* The slots container */}
            <div className="flex-1 flex items-center justify-center gap-2.5">
              {/* Slot 1 */}
              <button 
                onClick={() => slot1 && handleRemoveSlot(1)}
                className={`w-14 h-14 rounded-2xl border-2 border-slate-800 font-mono font-black text-2xl flex items-center justify-center shadow-[3px_3px_0px_#1e293b] transition-all cursor-pointer ${
                  slot1 
                    ? slot1 === 'A' 
                      ? 'bg-[#c084fc] text-slate-900 active:scale-95' 
                      : 'bg-white text-slate-900 active:scale-95'
                    : 'bg-slate-100/60 border-dashed border-slate-400 text-slate-400 shadow-none cursor-default'
                }`}
              >
                {slot1 || ''}
              </button>

              <span className="text-slate-400 font-bold text-lg">+</span>

              {/* Slot 2 */}
              <button 
                onClick={() => slot2 && handleRemoveSlot(2)}
                className={`w-14 h-14 rounded-2xl border-2 border-slate-800 font-mono font-black text-2xl flex items-center justify-center shadow-[3px_3px_0px_#1e293b] transition-all cursor-pointer ${
                  slot2 
                    ? slot2 === 'A' 
                      ? 'bg-[#c084fc] text-slate-900 active:scale-95' 
                      : 'bg-white text-slate-900 active:scale-95'
                    : 'bg-slate-100/60 border-dashed border-slate-400 text-slate-400 shadow-none cursor-default'
                }`}
              >
                {slot2 || ''}
              </button>
            </div>

            {/* Checkmark Action Button on the Right */}
            <button
              onClick={handleCheckGenotype}
              disabled={!slot1 || !slot2}
              className={`w-14 h-14 rounded-2xl border-2 border-slate-800 flex items-center justify-center cursor-pointer shadow-[3px_3px_0px_#1e293b] active:translate-y-0.5 active:shadow-[1px_1px_0px_#1e293b] transition-all ${
                slot1 && slot2 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-slate-200 text-slate-400 border-slate-400 shadow-none opacity-50 cursor-not-allowed'
              }`}
              title="Periksa Kombinasi"
            >
              <CheckCircle2 className="w-7 h-7 stroke-[2.5px]" />
            </button>
          </div>

          {/* Bottom Row: Source Cards (A and a) */}
          <div className="space-y-2 text-center my-2">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">
              Sumber Alel Tersedia
            </span>
            <div className="flex justify-center gap-6">
              {/* Card A (Purple) */}
              <button
                onClick={() => handleSelectAllele('A')}
                className="w-18 h-18 rounded-2xl bg-[#c084fc] hover:bg-[#d8b4fe] text-slate-900 border-2 border-slate-800 font-mono font-black text-2xl shadow-[4px_4px_0px_#1e293b] hover:scale-105 active:scale-95 active:translate-y-0.5 active:shadow-[2px_2px_0px_#1e293b] transition-all cursor-pointer flex items-center justify-center"
              >
                A
              </button>
              {/* Card a (White) */}
              <button
                onClick={() => handleSelectAllele('a')}
                className="w-18 h-18 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-800 font-mono font-black text-2xl shadow-[4px_4px_0px_#1e293b] hover:scale-105 active:scale-95 active:translate-y-0.5 active:shadow-[2px_2px_0px_#1e293b] transition-all cursor-pointer flex items-center justify-center"
              >
                a
              </button>
            </div>
          </div>

          {/* Feedback & Hint Row */}
          <div className="w-full max-w-xs mx-auto space-y-2.5 mt-2">
            {feedback && (
              <div className={`p-2.5 rounded-xl border-2 border-slate-800 flex items-center gap-2 text-[9px] font-black shadow-[3px_3px_0px_#1e293b] animate-fade-in ${
                feedback.type === 'success' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : feedback.type === 'warning'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
              }`}>
                {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
                <span>{feedback.message}</span>
              </div>
            )}

            {/* Hint Box matching reference */}
            <div className="p-2.5 bg-amber-100 border-2 border-slate-800 rounded-xl shadow-[3px_3px_0px_#1e293b] flex items-center gap-1.5 text-[8.5px] font-extrabold text-amber-900 leading-tight">
              <span>💡</span>
              <span>Alel Dominan (A) menutupi sifat Alel Resesif (a) dalam fenotipe.</span>
            </div>
          </div>

          {/* Reset slots action row */}
          <div className="text-center pt-2">
            <button
              onClick={handleClearSlots}
              className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-800 text-slate-700 font-black text-[9px] flex items-center gap-1 mx-auto cursor-pointer shadow-[2px_2px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all"
            >
              <RefreshCw className="w-3 h-3 stroke-[2.5px]" />
              <span>BERSIHKAN SLOT</span>
            </button>
          </div>

        </div>
      ) : (
        /* Victory View card */
        <div className="absolute inset-0 z-40 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="p-6 rounded-3xl text-center space-y-4 max-w-xs w-full border-2 border-slate-800 bg-white shadow-2xl relative z-50 animate-scale-up">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-slate-800 p-1 flex items-center justify-center mx-auto shadow-xs overflow-hidden">
              <img 
                src="/assets/rumah_mendel_banner.png" 
                alt="Victory Stage 2" 
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[8px] font-black text-indigo-700 uppercase tracking-widest font-sans">ROUND COMPLETED</span>
              <h3 className="text-base font-black text-black">STAGE 2 SELESAI!</h3>
              <p className="text-[10px] text-black/85 font-bold leading-relaxed px-1">
                Selamat! Kamu berhasil menyusun seluruh target genotipe Mendel. Kamu resmi menjadi <strong className="text-blue-600">Arsitek Gen</strong>!
              </p>
            </div>

            <div className="flex justify-center gap-1.5">
              {[1, 2, 3].map(s => (
                <Star key={s} className="w-6 h-6 text-amber-500 fill-amber-500 animate-bounce" style={{ animationDelay: `${s * 0.2}s` }} />
              ))}
            </div>

            <div className="p-2.5 bg-amber-500/10 border-2 border-slate-800 rounded-xl text-amber-900 text-[10px] font-black shadow-[3px_3px_0px_#1e293b]">
              🏆 Lencana Diperoleh: Arsitek Gen
            </div>

            <div className="flex gap-2 justify-center pt-1.5">
              <button
                onClick={() => navigateTo('map')}
                className="px-4 py-2 rounded-xl bg-white border-2 border-slate-800 hover:bg-slate-50 text-slate-700 font-bold text-[10px] shadow-3xs cursor-pointer flex-1"
              >
                PETA STAGE
              </button>
              <button
                onClick={() => navigateTo('stage', 3)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-[10px] flex items-center justify-center gap-1 shadow-3xs cursor-pointer flex-1"
              >
                <span>STAGE 3</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
      {gameOver && (
        <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
          <div className="p-6 rounded-3xl text-center space-y-4 max-w-xs w-full border-2 border-slate-800 bg-slate-900 shadow-2xl relative animate-scale-up text-white">
            <div className="w-16 h-16 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto shadow-md">
              <span className="text-3xl animate-bounce">💀</span>
            </div>

            <div className="space-y-1">
              <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest font-sans">GAME OVER</span>
              <h3 className="text-base font-black text-white">NYAWA KAMU HABIS!</h3>
              <p className="text-[10px] text-slate-300 font-bold leading-relaxed px-1">
                Kombinasi salah! Nyawa kamu habis. Coba pelajari hukum-hukum pewarisan sifat Mendel kembali di Genopedia!
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {/* Retry Button */}
              <button
                onClick={() => {
                  setLives(3);
                  setGameOver(false);
                  setUnlockedGenotypes([]);
                  setSlot1(null);
                  setSlot2(null);
                  setScore(0);
                  setFeedback(null);
                  sound.playClick();
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-[11px] shadow-md cursor-pointer flex items-center justify-center gap-1 border-2 border-slate-800 shadow-[3px_3px_0px_#1e293b]"
              >
                <span>COBA LAGI (RETRY)</span>
              </button>

              {/* Genopedia Button */}
              <button
                onClick={() => {
                  navigateTo('genopedia');
                  sound.playClick();
                }}
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] shadow-sm cursor-pointer flex-1 border-2 border-slate-800 shadow-[3px_3px_0px_#1e293b]"
              >
                <span>PELAJARI GENOPEDIA</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
