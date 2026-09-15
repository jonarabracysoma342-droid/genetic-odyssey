import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { STAGES } from '../../data/geneticsData';
import { sound } from '../../services/sound';
import { PixelValleyBackground } from '../common/PixelValleyBackground';
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
  const { navigateTo, userProgress, totalStars, showAlert, activePreviewStage, setActivePreviewStage, unlockAllStages, isLandscapeMobile } = useGame();
  const [showTutorial, setShowTutorial] = useState(false);

  const totalPossibleStars = STAGES.length * 3; // 18 stars max
  const progressPercent = Math.min(100, Math.round((totalStars / totalPossibleStars) * 100));

  return (
    <div className={`w-full min-h-screen ${isLandscapeMobile ? 'px-2 py-2 pb-16' : 'px-2 sm:px-4 md:px-6 py-3 md:py-6 pb-28'} space-y-3 md:space-y-4 text-left bg-[#74c2e8] relative overflow-x-hidden`}>
      
      {/* Detailed Stardew Valley Background */}
      <PixelValleyBackground overlay="medium" />

      {/* Solid Master Wooden Panel Container */}
      <div className={`max-w-6xl mx-auto w-full relative z-10 rounded-2xl md:rounded-3xl border-4 md:border-8 border-[#241005] bg-[#3a1d0b] ${isLandscapeMobile ? 'p-2 sm:p-3 space-y-2.5' : 'p-3 sm:p-5 md:p-6 space-y-4'} shadow-[0_10px_0_#150802,0_16px_24px_rgba(0,0,0,0.6)] text-left`}>

        {/* Top Header Bar (Pixel Wooden Plank) */}
        <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 md:gap-3 ${isLandscapeMobile ? 'p-2' : 'p-3 md:p-4'} rounded-xl bg-[#fae8b6] border-4 border-[#361706] shadow-[4px_4px_0_#1a0b03] relative z-10`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('main-menu')}
              className="px-3 py-2 rounded-lg bg-[#ca7c38] hover:bg-[#df9b52] border-2 border-[#361706] text-[#2b1103] font-pixel text-[9px] uppercase transition shadow-[2px_2px_0_#2b1103] cursor-pointer flex-shrink-0 active:translate-y-0.5 flex items-center gap-1.5"
              title="Kembali ke Menu Utama"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3px]" />
              <span>MENU</span>
            </button>
            <div>
              <span className="text-[7px] md:text-[8px] font-pixel text-[#884318] uppercase tracking-widest block">
                PETUALANGAN MENDELIAN
              </span>
              <h2 className="text-xs md:text-sm font-pixel text-[#361706] leading-tight mt-0.5">
                PETA STAGE GAME
              </h2>
            </div>
          </div>

          {/* Global Progress Metrics & Unlock Button */}
          <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
            {/* Unlock All Stages Button */}
            <button
              onClick={unlockAllStages}
              className="flex items-center gap-1 bg-[#16a34a] hover:bg-[#22c55e] text-white border-2 border-[#361706] px-2.5 py-1.5 rounded-lg shadow-[2px_2px_0_#1a0b03] font-pixel text-[8px] transition cursor-pointer active:translate-y-0.5"
              title="Buka Seluruh Level (Stage 1-8)"
            >
              <Unlock className="w-3 h-3" />
              <span>BUKA SEMUA</span>
            </button>

            {/* Total Stars Pill */}
            <div className="flex items-center gap-1 bg-[#361706] border-2 border-[#ca7c38] px-2.5 py-1.5 rounded-lg shadow-[2px_2px_0_#1a0b03]">
              <Star className="w-3.5 h-3.5 text-[#facc15] fill-[#facc15]" />
              <span className="font-pixel text-[8px] md:text-[9px] text-[#fef08a]">
                {totalStars} / {totalPossibleStars}
              </span>
            </div>

            {/* Badges Count Pill */}
            <div className="flex items-center gap-1 bg-[#361706] border-2 border-[#ca7c38] px-2.5 py-1.5 rounded-lg shadow-[2px_2px_0_#1a0b03]">
              <Award className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span className="font-pixel text-[8px] md:text-[9px] text-[#bae6fd]">
                {userProgress.badges.length} LENCANA
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar & Gregor Mendel Mentor Guidance Card */}
        <div className="p-3 md:p-4 rounded-xl bg-[#fae8b6] border-4 border-[#361706] shadow-[4px_4px_0_#1a0b03] space-y-3 relative z-10 text-[#2b1103]">
          
          {/* Progress bar track */}
          <div className="space-y-1">
            <div className="flex justify-between font-pixel text-[8px] md:text-[9px] text-[#361706]">
              <span>KEMAJUAN PETUALANGAN</span>
              <span className="text-[#884318]">{progressPercent}% SELESAI</span>
            </div>
            <div className="w-full h-3 md:h-4 rounded-md bg-[#361706] p-0.5 border-2 border-[#361706] overflow-hidden">
              <div 
                className="h-full rounded-xs bg-gradient-to-r from-[#84cc16] to-[#22c55e] transition-all duration-700"
                style={{ width: (progressPercent + "%") }}
              />
            </div>
          </div>

          {/* Mendel Mentor Guidance */}
          <div className="flex items-center gap-3 pt-2 border-t-2 border-[#361706]/20">
            <div className="relative flex-shrink-0">
              <img 
                src="/assets/mendel_avatar.webp" 
                alt="Gregor Mendel" 
                className="w-12 h-12 md:w-14 md:h-14 object-contain bg-white rounded-lg border-2 border-[#361706]"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#16a34a] text-white flex items-center justify-center border border-[#361706]">
                <Sparkles className="w-2.5 h-2.5" />
              </div>
            </div>

            <div className="flex-1 space-y-1 text-left">
              <div className="flex items-center justify-between">
                <span className="font-pixel text-[8px] md:text-[9px] text-[#884318] uppercase">
                  PANDUAN GREGOR MENDEL
                </span>
                <button 
                  onClick={() => setShowTutorial(true)}
                  className="px-2 py-0.5 rounded bg-[#ca7c38] hover:bg-[#df9b52] text-[#2b1103] font-pixel text-[7px] uppercase border border-[#361706] cursor-pointer"
                >
                  CARA MAIN
                </button>
              </div>
              <p className="text-[9px] md:text-[10px] text-[#361706] leading-snug">
                "Selamat datang di kebun riset biara! Selesaikan setiap stage dari dasar monohibrid hingga pertempuran boss melawan Dr. Chaos untuk mengumpulkan seluruh bintang dan lencana kehormatan."
              </p>
            </div>
          </div>
        </div>

        {/* 8 Stages Grid */}
        <div className={`grid ${isLandscapeMobile ? 'grid-cols-2 sm:grid-cols-4 gap-2' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4'}`}>
          {STAGES.map((stage) => {
            const unlockedList = Array.isArray(userProgress.unlockedStages) ? userProgress.unlockedStages : [1];
            const maxUnlockedNum = Math.max(userProgress.unlockedStage || 1, ...unlockedList);

            const isUnlocked = unlockedList.includes(stage.id) || stage.id <= maxUnlockedNum;
            const stageStars = (userProgress.stars && userProgress.stars[stage.id]) || 0;

            return (
              <div
                key={stage.id}
                onClick={() => {
                  if (isUnlocked) {
                    sound.playClick();
                    setActivePreviewStage(stage);
                  } else {
                    sound.playWrong();
                    showAlert("Stage " + stage.id + " masih terkunci! Selesaikan stage sebelumnya.");
                  }
                }}
                className={`relative rounded-xl border-4 ${isLandscapeMobile ? 'p-2' : 'p-3'} transition-all cursor-pointer flex flex-col justify-between select-none ${
                  isUnlocked
                    ? 'bg-[#fae8b6] border-[#361706] shadow-[3px_3px_0_#1a0b03] hover:-translate-y-0.5 hover:brightness-105'
                    : 'bg-[#94775d] border-[#361706] shadow-[2px_2px_0_#1a0b03] cursor-not-allowed'
                }`}
              >
                {/* Stage Header Badge */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className={`font-pixel ${isLandscapeMobile ? 'text-[7px] px-1.5 py-0.5' : 'text-[8px] px-2 py-0.5'} bg-[#361706] text-[#facc15] rounded border border-[#ca7c38]`}>
                    STAGE {stage.id}
                  </span>
                  
                  {isUnlocked ? (
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star 
                          key={s} 
                          className={`${isLandscapeMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'} ${s <= stageStars ? 'text-[#facc15] fill-[#facc15]' : 'text-[#361706]/30'}`} 
                        />
                      ))}
                    </div>
                  ) : (
                    <Lock className={`${isLandscapeMobile ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-[#361706]`} />
                  )}
                </div>

                {/* Stage Thumbnail Illustration */}
                <div className={`w-full ${isLandscapeMobile ? 'h-14' : 'h-24'} bg-[#fff8e7] border-2 border-[#361706] rounded-lg overflow-hidden flex items-center justify-center p-1 my-1`}>
                  <img
                    src={STAGE_ILLUSTRATIONS[stage.id] || '/assets/mendel_avatar.webp'}
                    alt={stage.title}
                    className="w-full h-full object-contain image-pixelated"
                  />
                </div>

                {/* Stage Title */}
                <div className="text-left mt-0.5">
                  <h4 className={`font-pixel ${isLandscapeMobile ? 'text-[7px]' : 'text-[8px] md:text-[9px]'} text-[#361706] uppercase truncate font-bold`}>
                    {stage.title}
                  </h4>
                  <p className={`text-[8px] md:text-[9px] text-[#543319] line-clamp-1 mt-0.5 font-medium leading-tight`}>
                    {stage.subtitle || stage.description}
                  </p>
                </div>

                {/* Bottom Action Button */}
                <div className={`mt-1.5 pt-1.5 border-t border-[#361706]/20 flex items-center justify-between`}>
                  <span className="text-[7px] md:text-[8px] font-pixel text-[#884318]">
                    STAGE 0{stage.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[7px] md:text-[8px] font-pixel uppercase ${
                    isUnlocked ? 'bg-[#ca7c38] text-[#2b1103]' : 'bg-[#5a3a24] text-[#d1c29e]'
                  }`}>
                    {isUnlocked ? 'MAIN ➜' : 'KUNCI'}
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* ================= INTERACTIVE STAGE PREVIEW & LAUNCH MODAL ================= */}
      {activePreviewStage && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fade-in text-left">
          <div className={`w-full max-w-md rounded-xl bg-[#fae8b6] border-4 border-[#361706] ${isLandscapeMobile ? 'p-3 space-y-2.5 max-h-[94vh] overflow-y-auto' : 'p-4 md:p-6 space-y-4'} shadow-[6px_6px_0_#1a0b03] relative overflow-hidden animate-scale-up text-[#2b1103]`}>
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b-2 border-[#361706] pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-lg bg-[#fff8e7] border-2 border-[#361706] p-1 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <img 
                    src={STAGE_ILLUSTRATIONS[activePreviewStage.id] || '/assets/mendel_avatar.webp'} 
                    alt={activePreviewStage.title}
                    className="w-full h-full object-contain image-pixelated"
                  />
                </div>
                <div>
                  <span className="font-pixel text-[8px] bg-[#361706] text-[#facc15] px-1.5 py-0.5 rounded uppercase">
                    STAGE {activePreviewStage.id}
                  </span>
                  <h3 className="font-pixel text-[10px] md:text-xs text-[#361706] uppercase mt-1 leading-tight font-bold">
                    {activePreviewStage.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setActivePreviewStage(null);
                }}
                className="p-1 bg-[#df9b52] hover:bg-[#ca7c38] border-2 border-[#361706] rounded text-[#2b1103] cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5px]" />
              </button>
            </div>

            {/* Mission Objective */}
            <div className="space-y-2 text-left">
              <div className="p-2.5 rounded-lg bg-[#fff8e7] border-2 border-[#361706] space-y-0.5">
                <span className="font-pixel text-[7px] text-[#884318] uppercase block">Topik Pembelajaran</span>
                <p className="text-[11px] text-[#361706] font-bold">{activePreviewStage.topic}</p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#fff8e7] border-2 border-[#361706] space-y-0.5">
                <span className="font-pixel text-[7px] text-[#884318] uppercase block">Tujuan Misi</span>
                <p className="text-[11px] text-[#361706] leading-snug">{activePreviewStage.missionText}</p>
              </div>
            </div>

            {/* Star Achieved Status */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#fff8e7] border-2 border-[#361706]">
              <span className="font-pixel text-[8px] text-[#884318] uppercase">Bintang:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((starNum) => (
                  <Star
                    key={starNum}
                    className={`w-4 h-4 ${
                      starNum <= (userProgress.stars[activePreviewStage.id] || 0)
                        ? 'text-[#facc15] fill-[#facc15]'
                        : 'text-[#361706]/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* CTA Launch Buttons */}
            <div className="flex gap-2 pt-1 border-t border-[#361706]/20">
              <button
                onClick={() => {
                  sound.playClick();
                  setActivePreviewStage(null);
                }}
                className="flex-1 py-2 rounded-lg bg-[#df9b52] hover:bg-[#ca7c38] border-2 border-[#361706] text-[#2b1103] font-pixel text-[8px] uppercase cursor-pointer"
              >
                NANTI
              </button>

              <button
                onClick={() => {
                  const stageId = activePreviewStage.id;
                  setActivePreviewStage(null);
                  navigateTo('stage', stageId);
                }}
                className="flex-[2] py-2 rounded-lg bg-[#16a34a] hover:bg-[#22c55e] text-white font-pixel text-[9px] uppercase flex items-center justify-center gap-1.5 border-2 border-[#361706] shadow-[2px_2px_0_#1a0b03] active:translate-y-0.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>MULAI MISI</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
