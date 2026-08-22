import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { STAGES } from '../../data/geneticsData';
import { sound } from '../../services/sound';
import confetti from 'canvas-confetti';
import { 
  Crown, 
  CheckCircle2, 
  XCircle, 
  Star, 
  Flame,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const BossBattleDrChaos = () => {
  const { navigateTo, completeStage } = useGame();
  const [bossHp, setBossHp] = useState(100);
  const [phase, setPhase] = useState(1); // 1, 2, 3
  const [phase1Selected, setPhase1Selected] = useState(null);
  const [phase2Selected, setPhase2Selected] = useState(null);
  const [phase3Selected, setPhase3Selected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [bossDefeated, setBossDefeated] = useState(false);
  const [score, setScore] = useState(0);

  const stageInfo = STAGES.find(s => s.id === 8);

  const handlePhase1 = (answer) => {
    sound.playClick();
    setPhase1Selected(answer);
  };

  const verifyPhase1 = () => {
    if (phase1Selected === 'Pp') {
      sound.playCorrect();
      setBossHp(66);
      setScore(prev => prev + 250);
      setFeedback({
        type: 'success',
        message: 'Serangan berhasil! Kombinasi gamet P + p menghasilkan F1 100% Pp (Bunga Ungu).'
      });
      setTimeout(() => {
        setPhase(2);
        setFeedback(null);
      }, 1500);
    } else {
      sound.playWrong();
      setFeedback({
        type: 'error',
        message: 'Dr. Chaos menangkis seranganmu! Induk PP × pp menghasilkan keturunan F1 100% Heterozigot (Pp).'
      });
    }
  };

  const handlePhase2 = (ans) => {
    sound.playClick();
    setPhase2Selected(ans);
  };

  const verifyPhase2 = () => {
    if (phase2Selected === '3 : 1') {
      sound.playCorrect();
      setBossHp(33);
      setScore(prev => prev + 250);
      setFeedback({
        type: 'success',
        message: 'Kritikal hit! Rasio fenotipe F2 persilangan Pp × Pp adalah 3 : 1 (75% Ungu : 25% Putih).'
      });
      setTimeout(() => {
        setPhase(3);
        setFeedback(null);
      }, 1500);
    } else {
      sound.playWrong();
      setFeedback({
        type: 'error',
        message: 'Tembakan salah! Rasio fenotipe monohibrid dominan penuh Pp × Pp adalah 3 : 1.'
      });
    }
  };

  const handlePhase3 = (ans) => {
    sound.playClick();
    setPhase3Selected(ans);
  };

  const verifyPhase3 = () => {
    if (phase3Selected === '9 : 3 : 3 : 1') {
      sound.playCorrect();
      setBossHp(0);
      setScore(prev => prev + 500);
      setBossDefeated(true);
      sound.playFanfare();
      try {
        confetti({ particleCount: 200, spread: 90, origin: { y: 0.5 } });
      } catch(e){}
      completeStage(8, 3, score + 1000, 100, 60);
    } else {
      sound.playWrong();
      setFeedback({
        type: 'error',
        message: 'Dr. Chaos bertahan! Rasio dihibrid F2 dua sifat beda (AaBb × AaBb) adalah 9 : 3 : 3 : 1.'
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Boss Stage Header */}
      <div className="glass-panel p-6 rounded-2xl border border-rose-500/50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-slate-950 via-rose-950/40 to-slate-950">
        <div>
          <div className="flex items-center gap-2 text-xs text-rose-400 font-mono uppercase tracking-wider mb-1">
            <Flame className="w-4 h-4 text-rose-500 animate-bounce" /> {stageInfo.location} • BOSS BATTLE
          </div>
          <h2 className="text-2xl font-extrabold text-rose-300">Pertarungan Dr. Chaos!</h2>
          <p className="text-xs text-slate-300 mt-1">Selesaikan 3 fase persilangan untuk mengalahkan Dr. Chaos</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/90 px-4 py-2 rounded-xl border border-rose-500/40">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          <span className="text-sm font-bold text-amber-300">Skor: {score}</span>
        </div>
      </div>

      {!bossDefeated ? (
        <>
          {/* Boss Health Bar */}
          <div className="glass-panel p-5 rounded-2xl border border-rose-500/40 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold font-mono">
              <span className="text-rose-400 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400" /> DR. CHAOS HP
              </span>
              <span className="text-rose-300">{bossHp} / 100 HP</span>
            </div>
            <div className="w-full h-4 rounded-full bg-slate-900 border border-rose-900 overflow-hidden p-0.5">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-rose-600 via-amber-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${bossHp}%` }}
              />
            </div>
          </div>

          {/* Dr. Chaos Dialogue Box with Character Illustration (Matching Storyboard Frame 10) */}
          <div className="glass-panel-glow p-6 rounded-3xl border-2 border-rose-500/60 space-y-3 relative overflow-hidden bg-slate-950/90">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              
              {/* Illustrated Dr. Chaos Avatar */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-br from-rose-600 via-purple-700 to-slate-900 p-1 flex-shrink-0 shadow-xl shadow-rose-500/30 border-2 border-rose-400">
                <img 
                  src="/assets/dr_chaos_avatar.webp" 
                  alt="Dr Chaos Avatar" 
                  className="w-full h-full object-contain drop-shadow-md"
                />
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <h4 className="font-bold text-rose-400 text-base font-mono">DR. CHAOS BERKATA:</h4>
                <p className="text-sm text-slate-200 leading-relaxed italic bg-slate-900/80 p-4 rounded-2xl border border-rose-500/30">
                  {phase === 1 && '"Aku telah merusak data persilangan monohibrid Bunga Ungu (PP) x Bunga Putih (pp)! Tahukah kamu genotipe F1 yang sebenarnya?"'}
                  {phase === 2 && '"Hahaha! Sekarang tentukan rasio fenotipe dari persilangan sesama F1 (Pp × Pp) jika kamu mengerti Hukum Mendel!"'}
                  {phase === 3 && '"Serangan terakhir! Berapa rasio fenotipe F2 pada persilangan dihibrid dua sifat beda (AaBb × AaBb)?"'}
                </p>
              </div>
            </div>
          </div>

          {/* Phase 1 Interaction */}
          {phase === 1 && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 text-center">
              <h4 className="text-sm font-bold text-cyan-300">Fase 1: Tentukan Genotipe Keturunan F1 dari Induk PP × pp</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {['PP', 'Pp', 'pp', 'Ppp'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handlePhase1(opt)}
                    className={`p-4 rounded-xl font-mono font-bold text-xl border transition ${
                      phase1Selected === opt ? 'neon-border bg-cyan-950 text-cyan-300' : 'border-slate-800 bg-slate-900/60 text-slate-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <button
                onClick={verifyPhase1}
                disabled={!phase1Selected}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-black text-sm shadow-xl hover:scale-105 transition"
              >
                SERANG DR. CHAOS!
              </button>
            </div>
          )}

          {/* Phase 2 Interaction */}
          {phase === 2 && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 text-center">
              <h4 className="text-sm font-bold text-cyan-300">Fase 2: Tentukan Rasio Fenotipe Keturunan F2 (Pp × Pp)</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {['3 : 1', '1 : 1', '9 : 3 : 3 : 1', '1 : 2 : 1'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handlePhase2(opt)}
                    className={`p-4 rounded-xl font-mono font-bold text-xl border transition ${
                      phase2Selected === opt ? 'neon-border bg-cyan-950 text-cyan-300' : 'border-slate-800 bg-slate-900/60 text-slate-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <button
                onClick={verifyPhase2}
                disabled={!phase2Selected}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-black text-sm shadow-xl hover:scale-105 transition"
              >
                LANCARKAN KRITIKAL HIT!
              </button>
            </div>
          )}

          {/* Phase 3 Interaction */}
          {phase === 3 && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 text-center">
              <h4 className="text-sm font-bold text-cyan-300">Fase 3: Rasio Fenotipe Persilangan Dihibrid (AaBb × AaBb)</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {['9 : 3 : 3 : 1', '3 : 1', '1 : 1 : 1 : 1', '15 : 1'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handlePhase3(opt)}
                    className={`p-4 rounded-xl font-mono font-bold text-xl border transition ${
                      phase3Selected === opt ? 'neon-border bg-cyan-950 text-cyan-300' : 'border-slate-800 bg-slate-900/60 text-slate-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <button
                onClick={verifyPhase3}
                disabled={!phase3Selected}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 text-slate-950 font-black text-sm shadow-2xl hover:scale-105 transition"
              >
                KIRIM JAWABAN PAMUNGKAS!
              </button>
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-semibold max-w-xl mx-auto ${
              feedback.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
            }`}>
              {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <XCircle className="w-5 h-5 flex-shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}
        </>
      ) : (
        /* Grand Victory View with Mendel Expert Medal PNG (Matching Storyboard Frame 11) */
        <div className="glass-panel-glow p-8 rounded-3xl text-center space-y-6 max-w-xl mx-auto border-2 border-amber-400 shadow-2xl shadow-amber-500/20 bg-slate-950/90">
          
          {/* Illustrated Mendel Expert Gold Medal Badge */}
          <div className="relative w-36 h-36 mx-auto">
            <img 
              src="/assets/mendel_expert_badge.webp" 
              alt="Mendel Expert Badge" 
              className="w-full h-full object-contain drop-shadow-2xl float-anim"
            />
          </div>

          <div className="space-y-2">
            <div className="inline-block px-6 py-1.5 rounded-full bg-purple-950/80 border-2 border-purple-400 text-purple-200 font-black text-lg tracking-widest uppercase">
              SELAMAT!
            </div>

            <h3 className="text-3xl font-black bg-gradient-to-r from-amber-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
              DR. CHAOS BERHASIL DIKALAHKAN!
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed">
              Kamu telah menyelesaikan seluruh misi genetika dan membuktikan penguasaan penuh ilmu pewarisan sifat Mendel!
            </p>
          </div>

          {/* 3 Stars & Final Score Display (Matching Frame 11) */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map(s => (
              <Star key={s} className="w-10 h-10 text-amber-400 fill-amber-400 animate-pulse" />
            ))}
          </div>

          <div className="p-4 bg-slate-900/90 rounded-2xl border border-amber-500/50 text-amber-300 space-y-1">
            <div className="text-xs text-slate-400 font-bold uppercase">Skor Anda:</div>
            <div className="text-3xl font-black font-mono text-amber-300">950 PTS</div>
            <div className="text-xs font-bold text-emerald-400 pt-1">
              Badge Diperoleh: Mendel Expert
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => navigateTo('main-menu')}
              className="px-6 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-lg"
            >
              MAIN LAGI
            </button>
            <button
              onClick={() => navigateTo('hots-quiz')}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-2 animate-pulse"
            >
              <Sparkles className="w-4 h-4" />
              <span>MULAI KUIS HOTS</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
