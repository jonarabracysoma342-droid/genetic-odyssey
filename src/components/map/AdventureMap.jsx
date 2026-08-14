import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { STAGES } from '../../data/geneticsData';
import { sound } from '../../services/sound';
import { 
  Lock, 
  Unlock,
  Star, 
  Play, 
  ChevronLeft,
  Award,
  BookOpen,
  Sparkles,
  CheckCircle2,
  X,
  Zap
} from 'lucide-react';

const STAGE_ILLUSTRATIONS = {
  1: '/assets/stage1_garden_illustration.webp',
  2: '/assets/sub_mendel_peas.webp',
  3: '/assets/subtopic_process.webp',
  4: '/assets/genopedia_punnett2x2.webp',
  5: '/assets/subtopic_result.webp',
  6: '/assets/genopedia_punnett4x4.webp',
  7: '/assets/genopedia_law1.webp',
  8: '/assets/stage8_boss_illustration.webp'
};

export const AdventureMap = () => {
  const { navigateTo, userProgress, totalStars, showAlert, activePreviewStage, setActivePreviewStage, unlockAllStages } = useGame();
  const [showTutorial, setShowTutorial] = useState(false);

  const totalPossibleStars = STAGES.length * 3; // 18 stars max
  const progressPercent = Math.min(100, Math.round((totalStars / totalPossibleStars) * 100));

  return (
    <div className="max-w-2xl md:max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-6 md:space-y-8 text-left pb-24 bg-slate-50/40 relative overflow-hidden min-h-screen">
      
      {/* Background Decorator Mesh Blobs */}
      <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-sky-200/50 blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/3 -left-20 w-64 h-64 rounded-full bg-indigo-200/40 blur-3xl pointer-events-none z-0 animate-pulse duration-[8s]" />
      <div className="absolute -bottom-10 right-10 w-52 h-52 rounded-full bg-amber-100/60 blur-3xl pointer-events-none z-0" />

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 md:p-5 rounded-3xl bg-white/75 backdrop-blur-md border border-slate-200 shadow-2xs relative z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('main-menu')}
            className="p-2.5 md:p-3 rounded-2xl bg-white border-2 border-slate-800 text-slate-700 hover:text-sky-655 hover:bg-slate-55 transition shadow-3xs cursor-pointer flex-shrink-0 active:translate-y-0.5"
            title="Kembali ke Menu Utama"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 stroke-[2.5px]" />
          </button>
          <div>
            <span className="text-[9px] md:text-xs font-black text-indigo-700 uppercase tracking-widest block font-sans">
              PETUALANGAN MENDELIAN
            </span>
            <h2 className="text-base md:text-lg font-black text-black leading-tight">
              Peta Stage Petualangan
            </h2>
          </div>
        </div>

        {/* Global Progress Metrics & Unlock Button */}
        <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
          {/* Unlock All Stages Button */}
          <button
            onClick={unlockAllStages}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-slate-800 px-3 md:px-4 py-1.5 md:py-2 rounded-2xl shadow-3xs text-xs md:text-sm font-black transition cursor-pointer active:translate-y-0.5"
            title="Buka Seluruh Level (Stage 1-8)"
          >
            <Unlock className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span>Buka Semua</span>
          </button>

          {/* Total Stars Pill */}
          <div className="flex items-center gap-1.5 bg-amber-500/10 border-2 border-slate-800 px-3 md:px-4 py-1.5 md:py-2 rounded-2xl shadow-3xs">
            <Star className="w-4 h-4 md:w-5 md:h-5 text-amber-500 fill-amber-500" />
            <span className="text-xs md:text-sm font-black text-amber-900 font-mono">
              {totalStars} / {totalPossibleStars}
            </span>
          </div>

          {/* Badges Count Pill */}
          <div className="flex items-center gap-1.5 bg-blue-500/10 border-2 border-slate-800 px-3 md:px-4 py-1.5 md:py-2 rounded-2xl shadow-3xs">
            <Award className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            <span className="text-xs md:text-sm font-black text-blue-900 font-mono">
              {userProgress.badges.length} Lencana
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar & Gregor Mendel Mentor Guidance Card */}
      <div className="p-4 md:p-5 rounded-3xl bg-white border-2 border-slate-800 shadow-[4px_4px_0px_#1e293b] space-y-3.5 md:space-y-4 relative z-10">
        
        {/* Progress bar track */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] md:text-xs font-extrabold text-black/70">
            <span>Kemajuan Petualangan</span>
            <span className="text-indigo-700 font-mono">{progressPercent}% Selesai</span>
          </div>
          <div className="w-full h-3 md:h-4 rounded-full bg-slate-100 overflow-hidden p-0.5 border-2 border-slate-800">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-600 to-indigo-650 transition-all duration-700"
              style={{ width: (progressPercent + "%") }}
            />
          </div>
        </div>

        {/* Mendel Mentor Guidance */}
        <div className="flex items-center gap-3.5 md:gap-4 pt-2.5 border-t-2 border-slate-100">
          <div className="relative flex-shrink-0">
            <img 
              src="/assets/mendel_avatar.webp" 
              alt="Gregor Mendel" 
              className="w-14 h-14 md:w-18 md:h-18 object-contain drop-shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-2xs">
              <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5" />
            </div>
          </div>

          <div className="flex-1 space-y-1 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[10px] md:text-xs font-black text-indigo-700 uppercase tracking-wider font-sans">
                Panduan Gregor Mendel
              </span>
              <button 
                onClick={() => navigateTo('genopedia')}
                className="px-2.5 md:px-3 py-1 md:py-1.5 bg-white hover:bg-sky-50 text-sky-700 border-2 border-slate-800 rounded-xl text-[10px] md:text-xs font-bold flex items-center gap-1 transition shadow-3xs cursor-pointer active:translate-y-0.2"
              >
                <BookOpen className="w-3 h-3 md:w-4 md:h-4" /> Genopedia
              </button>
            </div>
            <p className="text-xs md:text-sm text-black/80 font-bold leading-snug">
              "Kumpulkan bintang di setiap misi untuk membuka area berikutnya! Pelajari teori genetika di Genopedia jika menemui kesulitan."
            </p>
          </div>
        </div>
      </div>

      {/* Collapsible Tutorial Banner */}
      <div className="p-4 rounded-3xl bg-white border-2 border-slate-800 shadow-[4px_4px_0px_#1e293b] relative z-10 space-y-3">
        <button
          onClick={() => {
            sound.playClick();
            setShowTutorial(!showTutorial);
          }}
          className="w-full flex items-center justify-between text-left cursor-pointer bg-transparent border-none p-0 outline-none"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border-2 border-slate-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-655 animate-pulse" />
            </div>
            <div>
              <span className="text-[7.5px] font-black text-indigo-700 uppercase tracking-widest block leading-none">Petunjuk Bermain</span>
              <h3 className="text-xs font-black text-slate-850">Cara Memulai & Menyelesaikan Level</h3>
            </div>
          </div>
          <span className="px-3 py-1 bg-slate-100 hover:bg-slate-200 border-2 border-slate-800 rounded-xl text-[9px] font-black tracking-wider uppercase text-slate-700 transition active:translate-y-0.2">
            {showTutorial ? 'TUTUP' : 'LIHAT'}
          </span>
        </button>

        {showTutorial && (
          <div className="pt-3 border-t-2 border-slate-100 space-y-2.5 animate-scale-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-bold text-slate-700 text-left">
              <div className="p-2.5 rounded-2xl bg-slate-50 border-2 border-slate-800 space-y-1 shadow-3xs">
                <div className="flex items-center gap-1.5 text-indigo-755 font-black text-[9px] uppercase tracking-wider">
                  <Play className="w-3.5 h-3.5 fill-indigo-755" /> 1. PILIH MISI AKTIF
                </div>
                <p className="leading-relaxed text-slate-600">
                  Cari level dengan penanda <span className="text-sky-655 font-extrabold">AKTIF</span>. Level yang belum terbuka digembok dan di-grayscale.
                </p>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-50 border-2 border-slate-800 space-y-1 shadow-3xs">
                <div className="flex items-center gap-1.5 text-indigo-755 font-black text-[9px] uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5" /> 2. TINGKAT BELAJAR (C1-C6)
                </div>
                <p className="leading-relaxed text-slate-600">
                  Setiap level mewakili tingkat kognitif Bloom dari dasar (C1) hingga penciptaan mandiri (C6) untuk pemahaman mendalam.
                </p>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-50 border-2 border-slate-800 space-y-1 shadow-3xs">
                <div className="flex items-center gap-1.5 text-indigo-755 font-black text-[9px] uppercase tracking-wider">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 border-none animate-none" /> 3. KUMPULKAN BINTANG
                </div>
                <p className="leading-relaxed text-slate-600">
                  Selesaikan permainan di setiap stage dengan skor tinggi dan sedikit kesalahan untuk mendapatkan maksimal 3 bintang.
                </p>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-50 border-2 border-slate-800 space-y-1 shadow-3xs">
                <div className="flex items-center gap-1.5 text-indigo-755 font-black text-[9px] uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5" /> 4. RUJUKAN GENOPEDIA
                </div>
                <p className="leading-relaxed text-slate-600">
                  Jika Anda kesulitan, klik tombol Genopedia untuk membaca glosarium teori genetika lengkap Gregor Mendel.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid of Stage Cards */}
      <div className="space-y-4 md:space-y-5 relative z-10">
        <h3 className="text-[10px] md:text-sm font-black text-slate-400 tracking-wider uppercase pl-2 border-l-4 border-sky-500 leading-none">
          PILIH MISI PETUALANGAN
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          {STAGES.map((stage) => {
            const unlockedList = Array.isArray(userProgress.unlockedStages) ? userProgress.unlockedStages : [1];
            const maxUnlockedNum = Math.max(userProgress.unlockedStage || 1, ...unlockedList);

            const isUnlocked = unlockedList.includes(stage.id) || stage.id <= maxUnlockedNum;
            const isCurrentActive = stage.id === maxUnlockedNum;
            const stageStars = (userProgress.stars && userProgress.stars[stage.id]) || 0;
            const isCompleted = stageStars > 0 || stage.id < maxUnlockedNum;

            return (
              <div
                key={stage.id}
                onClick={() => {
                  if (isUnlocked) {
                    sound.playClick();
                    setActivePreviewStage(stage);
                  } else {
                    sound.playWrong();
                    showAlert("Stage " + stage.id + " masih terkunci! Selesaikan stage sebelumnya untuk membukanya.");
                  }
                }}
                className={"p-4 md:p-5 rounded-3xl border-2 transition-all duration-300 relative text-left flex gap-3.5 md:gap-4 select-none shadow-3xs cursor-pointer " + (
                  isUnlocked
                    ? isCurrentActive
                      ? 'bg-white border-sky-500 ring-4 ring-sky-300/40 hover:scale-[1.01]'
                      : 'bg-white border-slate-800 hover:border-sky-500 hover:scale-[1.01]'
                    : 'bg-slate-55 border-slate-300 opacity-65 grayscale cursor-not-allowed'
                )}
              >
                {/* Active Pulsing Indicator Tag */}
                {isCurrentActive && (
                  <span className="absolute -top-3 left-4 px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-gradient-to-r from-sky-500 to-indigo-650 text-white font-mono text-[7px] md:text-[9px] font-black tracking-wider uppercase shadow-3xs animate-bounce flex items-center gap-0.5">
                    <Zap className="w-2 h-2 md:w-3 md:h-3 text-amber-300 fill-amber-300" />
                    AKTIF
                  </span>
                )}

                {/* Stage Illustration Box */}
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white border-2 border-slate-800 flex items-center justify-center p-1.5 md:p-2 flex-shrink-0 overflow-hidden shadow-3xs">
                  <img
                    src={STAGE_ILLUSTRATIONS[stage.id] || '/assets/cat_genopedia_icon.webp'}
                    alt={stage.title}
                    className="w-full h-full object-contain"
                    draggable="false"
                  />
                </div>

                {/* Stage Content */}
                <div className="flex-1 space-y-1 md:space-y-1.5 overflow-hidden">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[7.5px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none truncate">
                      STAGE 0{stage.id} &bull; {stage.location}
                    </span>
                    
                    {/* Status icon */}
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 flex-shrink-0" />
                    ) : !isUnlocked ? (
                      <Lock className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400 flex-shrink-0" />
                    ) : null}
                  </div>

                  <h4 className="text-[12px] md:text-sm font-black text-slate-855 leading-tight truncate">
                    {stage.title}
                  </h4>

                  <p className="text-[9.5px] md:text-xs font-bold text-slate-500 leading-tight truncate">
                    {stage.topic}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    {/* Stars count */}
                    <div className="flex items-center gap-0.5 md:gap-1">
                      {[1, 2, 3].map((starNum) => (
                        <Star
                          key={starNum}
                          className={"w-3 h-3 md:w-4 md:h-4 " + (
                            starNum <= stageStars
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-200 fill-slate-100'
                          )}
                        />
                      ))}
                    </div>

                    {/* Bloom cognitive level badge */}
                    <span className={"px-1.5 py-0.5 md:px-2 md:py-0.5 rounded border text-[7px] md:text-[9px] font-black uppercase tracking-wider " + stage.bloomStyle}>
                      {stage.bloomCode} - {stage.bloomName}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* ================= INTERACTIVE STAGE PREVIEW & LAUNCH MODAL ================= */}
      {activePreviewStage && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in text-left">
          <div className="w-full max-w-sm md:max-w-lg rounded-3xl bg-white border-3 border-slate-800 p-5 md:p-7 shadow-[6px_6px_0px_#1e293b] space-y-4 md:space-y-5 relative overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-155 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-800 p-1.5 flex items-center justify-center flex-shrink-0 shadow-3xs">
                  <img 
                    src={STAGE_ILLUSTRATIONS[activePreviewStage.id] || '/assets/cat_genopedia_icon.webp'} 
                    alt={activePreviewStage.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-[8px] font-black text-indigo-700 uppercase tracking-widest font-sans">
                    STAGE {activePreviewStage.id} &bull; {activePreviewStage.location}
                  </span>
                  <h3 className="text-sm font-black text-black leading-tight">
                    {activePreviewStage.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setActivePreviewStage(null);
                }}
                className="p-1.5 rounded-xl border-2 border-slate-800 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-black transition cursor-pointer active:translate-y-0.2"
              >
                <X className="w-4 h-4 stroke-[2.5px]" />
              </button>
            </div>

            {/* Mission Objective */}
            <div className="space-y-2 text-xs font-bold text-black">
              <div className="p-3 rounded-2xl bg-slate-50 border-2 border-slate-800 space-y-1 shadow-3xs">
                <span className="text-[9px] text-indigo-700 font-extrabold uppercase font-sans">Topik Pembelajaran</span>
                <p className="text-xs text-black font-extrabold">{activePreviewStage.topic}</p>
              </div>

              <div className="p-3 rounded-2xl bg-sky-50/60 border-2 border-slate-800 space-y-1 shadow-3xs">
                <span className="text-[9px] text-sky-800 font-extrabold uppercase font-sans">Tujuan Misi</span>
                <p className="text-xs text-black/85 leading-relaxed">{activePreviewStage.missionText}</p>
              </div>
            </div>

            {/* Star Achieved Status */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border-2 border-slate-800 shadow-3xs">
              <span className="text-xs font-black text-black font-sans uppercase text-[9px] tracking-wide text-slate-500">Capaian Bintang:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((starNum) => (
                  <Star
                    key={starNum}
                    className={"w-4 h-4 " + (
                      starNum <= (userProgress.stars[activePreviewStage.id] || 0)
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-slate-350 fill-slate-200'
                    )}
                  />
                ))}
              </div>
            </div>

            {/* CTA Launch Buttons */}
            <div className="flex gap-2.5 pt-1">
              <button
                onClick={() => {
                  sound.playClick();
                  setActivePreviewStage(null);
                }}
                className="flex-1 py-2.5 rounded-2xl border-2 border-slate-800 text-slate-700 font-black text-xs hover:bg-slate-55 transition cursor-pointer active:translate-y-0.2 shadow-3xs"
              >
                Nanti
              </button>

              <button
                onClick={() => {
                  const stageId = activePreviewStage.id;
                  setActivePreviewStage(null);
                  navigateTo('stage', stageId);
                }}
                className="flex-[2] py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer active:translate-y-0.2 shadow-3xs"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Mulai Misi Belajar</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
