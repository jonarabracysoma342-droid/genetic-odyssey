import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { STAGES } from '../../data/geneticsData';
import { sound } from '../../services/sound';
import confetti from 'canvas-confetti';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Sparkles, 
  Star,
  Zap
} from 'lucide-react';

const MUTATION_QUESTIONS = [
  {
    id: 1,
    title: 'Deteksi Miskonsepsi 1: Pembentukan Gamet',
    prompt: 'Temukan SATU pernyataan yang SALAH / SESAT tentang pembentukan gamet!',
    statements: [
      { text: 'AA menghasilkan gamet A', isFalseStatement: false },
      { text: 'Aa menghasilkan gamet A dan a', isFalseStatement: false },
      { text: 'aa menghasilkan gamet a', isFalseStatement: false },
      { text: 'AA menghasilkan gamet AA', isFalseStatement: true } // WRONG STATEMENT! Gametes are haploid!
    ],
    explanation: 'Pernyataan "AA menghasilkan gamet AA" SALAH karena gamet bersifat haploid (hanya membawa 1 alel tunggal "A", bukan pasangan "AA").'
  },
  {
    id: 2,
    title: 'Deteksi Miskonsepsi 2: Hukum Segregasi & Alel',
    prompt: 'Manakah pernyataan yang TIDAK SESUAI dengan konsep genetika?',
    statements: [
      { text: 'Alel dominan disimbolkan dengan huruf KAPITAL.', isFalseStatement: false },
      { text: 'Fenotipe adalah susunan genetik yang tidak terlihat fisik.', isFalseStatement: true }, // WRONG! Fenotipe IS visible!
      { text: 'Homozigot resesif hanya muncul bila kedua alel berhuruf kecil (aa).', isFalseStatement: false },
      { text: 'Hukum Segregasi memisahkan pasangan alel saat meiosis.', isFalseStatement: false }
    ],
    explanation: 'Fenotipe adalah sifat FISIK yang tampak dari luar, sedangkan susunan genetik yang tidak terlihat adalah GENOTIPE.'
  }
];

export const Stage7MutationTrap = () => {
  const { navigateTo, completeStage } = useGame();
  const [qIdx, setQIdx] = useState(0);
  const [selectedStatement, setSelectedStatement] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [stageCompleted, setStageCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const question = MUTATION_QUESTIONS[qIdx];
  const stageInfo = STAGES.find(s => s.id === 7);

  const handleSelectStatement = (st) => {
    sound.playClick();
    setSelectedStatement(st);
  };

  const handleVerifyStatement = () => {
    if (!selectedStatement) return;

    if (selectedStatement.isFalseStatement) {
      sound.playCorrect();
      setFeedback({
        type: 'success',
        message: 'Bagus! Kamu berhasil menemukan data genetik yang salah/sesat!'
      });
      setScore(prev => prev + 200);

      setTimeout(() => {
        if (qIdx < MUTATION_QUESTIONS.length - 1) {
          setQIdx(prev => prev + 1);
          setSelectedStatement(null);
          setFeedback(null);
        } else {
          setStageCompleted(true);
          sound.playFanfare();
          try { confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); } catch(e){}
          completeStage(7, 3, score + 200, 100, 45);
        }
      }, 1800);
    } else {
      sound.playWrong();
      setFeedback({
        type: 'error',
        message: 'Pernyataan tersebut sebenarnya BENAR. Periksa kembali data mana yang melanggar hukum genetika!'
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-rose-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-rose-400 font-mono uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> {stageInfo.location} • Stage 7
          </div>
          <h2 className="text-2xl font-extrabold text-cyan-200">{stageInfo.title}</h2>
          <p className="text-xs text-slate-300 mt-1">{stageInfo.topic}</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-xl border border-rose-500/30">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          <span className="text-sm font-bold text-amber-300">Skor: {score}</span>
        </div>
      </div>

      {!stageCompleted ? (
        <>
          {/* Main Layout Grid with Mutation Monster Mascot (Matching Storyboard Frame 9) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            
            {/* Left Side Statements Checklist (3 Columns) */}
            <div className="md:col-span-3 space-y-4">
              {/* Question Card */}
              <div className="glass-panel-glow p-6 rounded-2xl border border-cyan-500/40 space-y-3">
                <span className="text-xs font-bold text-rose-400 tracking-widest uppercase flex items-center gap-1.5">
                  <Zap className="w-4 h-4" /> Deteksi Miskonsepsi {qIdx + 1} dari {MUTATION_QUESTIONS.length}
                </span>
                <h3 className="text-lg font-bold text-white leading-relaxed flex items-center gap-2">
                  <ShieldAlert className="w-6 h-6 text-rose-400 flex-shrink-0" />
                  {question.prompt}
                </h3>
              </div>

              {/* Statements Selection List */}
              <div className="space-y-3">
                {question.statements.map((st, idx) => {
                  const isSelected = selectedStatement === st;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectStatement(st)}
                      className={`p-4 rounded-xl glass-panel transition-all cursor-pointer border flex items-center justify-between gap-4 ${
                        isSelected 
                          ? 'neon-border bg-rose-950/80 scale-[1.01]' 
                          : 'border-slate-800 hover:border-cyan-500/40 bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center ${
                          isSelected ? 'bg-rose-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {st.isFalseStatement && isSelected ? '✕' : '✓'}
                        </div>
                        <span className="font-semibold text-sm text-slate-200">{st.text}</span>
                      </div>

                      {isSelected && (
                        <span className="text-xs font-bold text-rose-400 border border-rose-500/40 px-3 py-1 rounded-full bg-rose-950">
                          Dipilih sebagai Pernyataan Salah
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Side Mutation Monster Graphic (Matching Frame 9 Monster Mascot) */}
            <div className="glass-panel p-5 rounded-3xl border-2 border-emerald-500/40 bg-slate-900/90 text-center space-y-3">
              <img 
                src="/assets/mutation_monster.png" 
                alt="Mutation Monster Mascot" 
                className="w-32 h-32 sm:w-40 sm:h-40 object-contain mx-auto drop-shadow-lg float-anim"
              />
              <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-xs font-bold text-emerald-300">
                ⚠️ Hati-hati! Beberapa data salah dan akan menyesatkanmu!
              </div>
            </div>

          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-semibold ${
              feedback.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
            }`}>
              {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <XCircle className="w-5 h-5 flex-shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={handleVerifyStatement}
              disabled={!selectedStatement}
              className={`px-8 py-3 rounded-xl font-bold text-sm tracking-wide shadow-lg flex items-center gap-2 transition ${
                selectedStatement 
                  ? 'bg-gradient-to-r from-rose-500 via-purple-500 to-cyan-500 text-slate-950 cursor-pointer hover:scale-105' 
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <span>LAPORKAN PERNYATAAN SESAT</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </>
      ) : (
        /* Stage Victory View */
        <div className="glass-panel-glow p-8 rounded-2xl text-center space-y-6 max-w-lg mx-auto border border-rose-500/50">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-400 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-emerald-300">STAGE 7 SELESAI!</h3>
            <p className="text-sm text-slate-300">
              Hebat! Kamu berhasil mengeliminasi seluruh jebakan mutasi dan miskonsepsi. Kamu siap bertarung di Boss Battle!
            </p>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-amber-500/30 text-amber-300 text-xs font-bold">
            🏆 Lencana Diperoleh: Analitis Gen
          </div>

          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => navigateTo('map')}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
            >
              PETA PETUALANGAN
            </button>
            <button
              onClick={() => navigateTo('stage', 8)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 text-slate-950 font-extrabold text-xs shadow-xl flex items-center gap-2 animate-bounce"
            >
              <span>MASUK BOSS BATTLE: DR. CHAOS!</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
