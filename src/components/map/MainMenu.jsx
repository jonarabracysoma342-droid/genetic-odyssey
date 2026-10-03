import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../services/sound';
import { PixelValleyBackground } from '../common/PixelValleyBackground';
import { PlayModeModal } from '../common/PlayModeModal';
import { 
  Play, 
  BookOpen, 
  GraduationCap, 
  Brain, 
  FileText, 
  Bot, 
  Trophy, 
  Settings, 
  MessageSquare, 
  LogOut, 
  Volume2, 
  VolumeX, 
  Star, 
  Sparkles,
  X,
  ChevronRight,
  User,
  FlaskConical,
  HelpCircle,
  Info
} from 'lucide-react';

export const MainMenu = () => {
  const game = useGame() || {};
  const { 
    navigateTo = () => {}, 
    userName = '', 
    userRole = 'siswa', 
    totalStars = 0,
    bgmOn = true, 
    toggleBgm = () => {},
    setIsGenopediaOpen = () => {}, 
    setIsBioBotOpen = () => {}, 
    setIsLeaderboardOpen = () => {},
    setIsTeacherReportOpen = () => {},
    setTeacherReportActiveTab = () => {},
    setIsFeedbackOpen = () => {},
    setIsSettingsOpen = () => {},
    handleLogout = () => {},
    showAlert = (msg) => alert(msg),
    isLandscapeMobile = false
  } = game;

  // Sub-hub modal state (to display the consolidated features)
  const [activeHub, setActiveHub] = useState(null); // 'learn' | 'features' | null
  const [isPlayModeModalOpen, setIsPlayModeModalOpen] = useState(false);

  const handlePlayClick = () => {
    sound.playClick();
    setIsPlayModeModalOpen(true);
  };

  const handleSelectPlayMode = (mode) => {
    if (mode === 'rpg') {
      // Putar video sinematik sebelum masuk ke dunia RPG
      navigateTo('intro-video');
    } else {
      navigateTo('map');
    }
  };

  const handleLearnHubClick = () => {
    sound.playClick();
    setActiveHub('learn');
  };

  const handleLabClick = () => {
    sound.playClick();
    navigateTo('virtual-lab');
  };

  const handleFeaturesHubClick = () => {
    sound.playClick();
    setActiveHub('features');
  };

  const closeHub = () => {
    sound.playClick();
    setActiveHub(null);
  };

  return (
    <div className="relative w-full h-screen min-h-screen overflow-hidden flex flex-col justify-between select-none bg-[#74c2e8]">
      
      {/* ================= DETAILED STARDEW VALLEY MENDEL BACKGROUND ================= */}
      <PixelValleyBackground overlay="subtle" />


      {/* ================= TOP HUD & CONTROLS ================= */}
      <div className={`relative z-10 w-full ${isLandscapeMobile ? 'px-3 pt-1.5' : 'px-4 md:px-8 pt-3 md:pt-5'} flex items-center justify-between`}>
        
        {/* User Info Badge (Pixel Style) */}
        <div className={`flex items-center gap-2 bg-[#361706]/85 backdrop-blur-xs border-2 border-[#ca7c38] ${isLandscapeMobile ? 'px-2 py-1' : 'px-3 py-1.5'} rounded-lg shadow-[3px_3px_0_#1a0b03]`}>
          <div className={`${isLandscapeMobile ? 'w-6 h-6 text-[10px]' : 'w-7 h-7 md:w-8 md:h-8 text-xs'} bg-[#ca7c38] border border-[#fbe4c8] rounded flex items-center justify-center font-pixel text-[#2b1103]`}>
            {userName ? userName.charAt(0).toUpperCase() : '🧬'}
          </div>
          <div className="text-left">
            <span className={`font-pixel ${isLandscapeMobile ? 'text-[7.5px]' : 'text-[8px] md:text-[10px]'} text-[#ffd699] block truncate max-w-[110px] md:max-w-[180px]`}>
              {userName || 'SISWA'}
            </span>
            <span className={`font-pixel ${isLandscapeMobile ? 'text-[5.5px]' : 'text-[6px] md:text-[7px]'} text-[#86efac] block uppercase`}>
              {userRole === 'guru' ? '👨‍🏫 GURU' : '🧬 PENELITI'}
            </span>
          </div>
        </div>

        {/* Right Action Icons: Stars & Sound */}
        <div className="flex items-center gap-2">
          
          {/* Total Stars Counter */}
          <div className={`flex items-center gap-1.5 bg-[#361706]/85 border-2 border-[#ca7c38] ${isLandscapeMobile ? 'px-2 py-1' : 'px-3 py-1.5'} rounded-lg shadow-[3px_3px_0_#1a0b03]`}>
            <Star className={`${isLandscapeMobile ? 'w-3 h-3' : 'w-3.5 h-3.5 md:w-4 md:h-4'} text-[#facc15] fill-[#facc15]`} />
            <span className={`font-pixel ${isLandscapeMobile ? 'text-[8px]' : 'text-[9px] md:text-xs'} text-[#fef08a]`}>
              {totalStars} ★
            </span>
          </div>
        </div>

      </div>


      {/* ================= CENTER TITLE & 3 WOODEN PLANK BUTTONS ================= */}
      <div className={`relative z-10 w-full flex flex-col items-center justify-center px-4 ${isLandscapeMobile ? 'py-1 my-auto' : 'py-2 md:py-4 my-auto'}`}>
        
        {/* Animated Floating Title (No Box) */}
        <div className={`text-center ${isLandscapeMobile ? 'mb-2 sm:mb-2.5' : 'mb-5 md:mb-7'} animate-pixel-title select-none`}>
          <div className={`inline-flex items-center gap-1.5 ${isLandscapeMobile ? 'px-2 py-0.5 mb-1' : 'px-3 py-1 mb-1.5'} bg-[#361706]/85 border-2 border-[#ca7c38] rounded-full shadow-[2px_2px_0_#1a0b03]`}>
            <Sparkles className={`${isLandscapeMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'} text-[#fef08a] animate-pulse`} />
            <span className={`font-pixel ${isLandscapeMobile ? 'text-[6px]' : 'text-[7px] md:text-[8px]'} text-[#ffd699] tracking-wider uppercase`}>
              Laboratorium Persilangan Ercis
            </span>
          </div>
          
          <h1 className={`font-pixel ${isLandscapeMobile ? 'text-xl sm:text-2xl drop-shadow-[0_3px_0_#2b1103]' : 'text-2xl sm:text-3xl md:text-5xl drop-shadow-[0_5px_0_#2b1103]'} text-[#ffffff] tracking-wider uppercase filter leading-tight`}>
            GENETIC ODYSSEY
          </h1>
          <p className={`font-pixel ${isLandscapeMobile ? 'text-[8px] mt-0.5 drop-shadow-[0_2px_0_#361706]' : 'text-[9px] sm:text-xs md:text-sm mt-1 drop-shadow-[0_3px_0_#361706]'} text-[#facc15] tracking-widest uppercase font-bold`}>
            PETUALANGAN HUKUM MENDEL
          </p>
        </div>

        {/* 4 CONSOLIDATED SOLID WOODEN PLANK BUTTONS */}
        <div className={`w-full ${isLandscapeMobile ? 'max-w-3xl flex-row items-center justify-center gap-2 px-1' : 'max-w-[280px] sm:max-w-[320px] md:max-w-[360px] flex-col gap-2.5 sm:gap-3'} flex z-10`}>
          
          {/* BUTTON 1: MAIN (PETUALANGAN MENDEL) */}
          <div className="w-full animate-menu-slide-1 flex-1">
            <button
              onClick={handlePlayClick}
              className={`w-full ${isLandscapeMobile ? 'py-1.5 px-2 rounded-lg border-2 shadow-[0_3px_0_#1a0b03]' : 'py-2.5 sm:py-3 px-3.5 rounded-xl border-4 shadow-[0_5px_0_#1a0b03,0_8px_14px_rgba(0,0,0,0.5)]'} bg-gradient-to-b from-[#f3ad62] via-[#ca7c38] to-[#99491a] border-[#2b1103] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_2px_0_#1a0b03] transition-all cursor-pointer relative group flex items-center justify-center`}
            >
              {/* Left/Right Metal Rivet Studs */}
              <div className={`absolute ${isLandscapeMobile ? 'left-1.5 w-1.5 h-1.5' : 'left-3 w-2.5 h-2.5'} top-1/2 -translate-y-1/2 rounded-full bg-[#fde047] border border-[#2b1103] shadow-inner`} />
              <div className={`absolute ${isLandscapeMobile ? 'right-1.5 w-1.5 h-1.5' : 'right-3 w-2.5 h-2.5'} top-1/2 -translate-y-1/2 rounded-full bg-[#fde047] border border-[#2b1103] shadow-inner`} />

              <div className="flex items-center gap-1.5 sm:gap-2">
                <Play className={`${isLandscapeMobile ? 'w-3.5 h-3.5' : 'w-4 h-4 sm:w-4.5 sm:h-4.5'} fill-[#2b1103] text-[#2b1103] group-hover:scale-110 transition-transform`} />
                <span className={`font-pixel ${isLandscapeMobile ? 'text-[9px]' : 'text-xs sm:text-sm'} font-black tracking-widest uppercase text-[#2b1103] drop-shadow-[0_1px_0_rgba(255,240,200,0.7)]`}>
                  MAIN
                </span>
              </div>
            </button>
          </div>

          {/* BUTTON 2: MATERI & KELAS (LEARN HUB) */}
          <div className="w-full animate-menu-slide-2 flex-1">
            <button
              onClick={handleLearnHubClick}
              className={`w-full ${isLandscapeMobile ? 'py-1.5 px-2 rounded-lg border-2 shadow-[0_3px_0_#1a0b03]' : 'py-2.5 sm:py-3 px-3.5 rounded-xl border-4 shadow-[0_5px_0_#1a0b03,0_8px_14px_rgba(0,0,0,0.5)]'} bg-gradient-to-b from-[#f3ad62] via-[#ca7c38] to-[#99491a] border-[#2b1103] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_2px_0_#1a0b03] transition-all cursor-pointer relative group flex items-center justify-center`}
            >
              <div className={`absolute ${isLandscapeMobile ? 'left-1.5 w-1.5 h-1.5' : 'left-3 w-2.5 h-2.5'} top-1/2 -translate-y-1/2 rounded-full bg-[#fde047] border border-[#2b1103] shadow-inner`} />
              <div className={`absolute ${isLandscapeMobile ? 'right-1.5 w-1.5 h-1.5' : 'right-3 w-2.5 h-2.5'} top-1/2 -translate-y-1/2 rounded-full bg-[#fde047] border border-[#2b1103] shadow-inner`} />

              <div className="flex items-center gap-1.5 sm:gap-2">
                <BookOpen className={`${isLandscapeMobile ? 'w-3.5 h-3.5' : 'w-4 h-4 sm:w-4.5 sm:h-4.5'} text-[#2b1103] stroke-[2.5] group-hover:scale-110 transition-transform`} />
                <span className={`font-pixel ${isLandscapeMobile ? 'text-[9px]' : 'text-xs sm:text-sm'} font-black tracking-widest uppercase text-[#2b1103] drop-shadow-[0_1px_0_rgba(255,240,200,0.7)]`}>
                  MATERI
                </span>
              </div>
            </button>
          </div>

          {/* BUTTON 3: LAB VIRTUAL 3D (MIKROSKOP PRAKTIKUM) */}
          <div className="w-full animate-menu-slide-3 flex-1">
            <button
              onClick={handleLabClick}
              className={`w-full ${isLandscapeMobile ? 'py-1.5 px-2 rounded-lg border-2 shadow-[0_3px_0_#1a0b03]' : 'py-2.5 sm:py-3 px-3.5 rounded-xl border-4 shadow-[0_5px_0_#1a0b03,0_8px_14px_rgba(0,0,0,0.5)]'} bg-gradient-to-b from-[#f3ad62] via-[#ca7c38] to-[#99491a] border-[#2b1103] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_2px_0_#1a0b03] transition-all cursor-pointer relative group flex items-center justify-center`}
            >
              <div className={`absolute ${isLandscapeMobile ? 'left-1.5 w-1.5 h-1.5' : 'left-3 w-2.5 h-2.5'} top-1/2 -translate-y-1/2 rounded-full bg-[#fde047] border border-[#2b1103] shadow-inner`} />
              <div className={`absolute ${isLandscapeMobile ? 'right-1.5 w-1.5 h-1.5' : 'right-3 w-2.5 h-2.5'} top-1/2 -translate-y-1/2 rounded-full bg-[#fde047] border border-[#2b1103] shadow-inner`} />

              <div className="flex items-center gap-1.5 sm:gap-2">
                <FlaskConical className={`${isLandscapeMobile ? 'w-3.5 h-3.5' : 'w-4 h-4 sm:w-4.5 sm:h-4.5'} text-[#2b1103] stroke-[2.5] group-hover:scale-110 transition-transform`} />
                <span className={`font-pixel ${isLandscapeMobile ? 'text-[9px]' : 'text-xs sm:text-sm'} font-black tracking-widest uppercase text-[#2b1103] drop-shadow-[0_1px_0_rgba(255,240,200,0.7)]`}>
                  LAB
                </span>
              </div>
            </button>
          </div>

          {/* BUTTON 4: PENGATURAN & FITUR (OPTIONS & EXTRAS) */}
          <div className="w-full animate-menu-slide-4 flex-1">
            <button
              onClick={handleFeaturesHubClick}
              className={`w-full ${isLandscapeMobile ? 'py-1.5 px-2 rounded-lg border-2 shadow-[0_3px_0_#1a0b03]' : 'py-2.5 sm:py-3 px-3.5 rounded-xl border-4 shadow-[0_5px_0_#1a0b03,0_8px_14px_rgba(0,0,0,0.5)]'} bg-gradient-to-b from-[#f3ad62] via-[#ca7c38] to-[#99491a] border-[#2b1103] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_2px_0_#1a0b03] transition-all cursor-pointer relative group flex items-center justify-center`}
            >
              <div className={`absolute ${isLandscapeMobile ? 'left-1.5 w-1.5 h-1.5' : 'left-3 w-2.5 h-2.5'} top-1/2 -translate-y-1/2 rounded-full bg-[#fde047] border border-[#2b1103] shadow-inner`} />
              <div className={`absolute ${isLandscapeMobile ? 'right-1.5 w-1.5 h-1.5' : 'right-3 w-2.5 h-2.5'} top-1/2 -translate-y-1/2 rounded-full bg-[#fde047] border border-[#2b1103] shadow-inner`} />

              <div className="flex items-center gap-1.5 sm:gap-2">
                <Settings className={`${isLandscapeMobile ? 'w-3.5 h-3.5' : 'w-4 h-4 sm:w-4.5 sm:h-4.5'} text-[#2b1103] stroke-[2.5] group-hover:scale-110 transition-transform`} />
                <span className={`font-pixel ${isLandscapeMobile ? 'text-[9px]' : 'text-xs sm:text-sm'} font-black tracking-widest uppercase text-[#2b1103] drop-shadow-[0_1px_0_rgba(255,240,200,0.7)]`}>
                  PENGATURAN
                </span>
              </div>
            </button>
          </div>

        </div>

      </div>

      {/* ================= BOTTOM BAR CREDITS & FOOTER ================= */}
      <div className={`relative z-10 w-full ${isLandscapeMobile ? 'px-3 pb-1.5' : 'px-4 pb-2 md:pb-3'} flex items-center justify-between`}>
        <div className={`bg-[#2b1103]/85 border-2 border-[#ca7c38] ${isLandscapeMobile ? 'px-2 py-0.5 text-[6.5px]' : 'px-2.5 py-1 text-[7px] md:text-[8px]'} rounded-lg font-pixel text-[#fef08a] shadow-[2px_2px_0_#1a0b03]`}>
          GENETIC ODYSSEY v2.0
        </div>
        <div className={`bg-[#2b1103]/85 border-2 border-[#ca7c38] ${isLandscapeMobile ? 'px-2 py-0.5 text-[6.5px]' : 'px-2.5 py-1 text-[7px] md:text-[8px]'} rounded-lg font-pixel text-[#fef08a] shadow-[2px_2px_0_#1a0b03]`}>
          HUKUM PEWARISAN SIFAT MENDEL
        </div>
      </div>

      {/* ================= MODAL SUB-HUB 1: MENU MATERI & ZONA BELAJAR (LEARN) ================= */}
      {activeHub === 'learn' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-xl bg-[#fae8b6] border-4 border-[#361706] rounded-xl max-h-[88vh] overflow-y-auto p-3.5 sm:p-5 space-y-3.5 shadow-[6px_6px_0_#1a0b03] text-[#2b1103] modal-landscape-compact">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-[#361706] pb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#884318]" />
                <div>
                  <h3 className="font-pixel text-xs md:text-sm text-[#361706] font-black uppercase">
                    MENU MATERI & ZONA BELAJAR
                  </h3>
                  <span className="font-pixel text-[7.5px] text-[#884318] block">Materi, Asisten AI, Peringkat & Evaluasi</span>
                </div>
              </div>
              <button
                onClick={closeHub}
                className="p-1 bg-[#df9b52] hover:bg-[#ca7c38] border-2 border-[#361706] rounded text-[#2b1103] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hub Menu Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Option 1: Genopedia (Materi Pokok & Kamus) */}
              <button
                onClick={() => { closeHub(); navigateTo('genopedia'); }}
                className="flex items-start gap-3 p-3 bg-[#fff8e7] hover:bg-[#fde68a] border-2 border-[#361706] rounded-lg shadow-[2px_2px_0_#2b1103] text-left transition cursor-pointer group"
              >
                <div className="w-9 h-9 rounded bg-[#ca7c38] border border-[#361706] flex items-center justify-center text-white flex-shrink-0 text-base">
                  📖
                </div>
                <div>
                  <h4 className="font-pixel text-[9px] md:text-[10px] text-[#361706] uppercase font-bold group-hover:text-[#884318]">
                    Genopedia Mendel
                  </h4>
                  <p className="text-[10px] text-[#543319] leading-tight mt-0.5">
                    Ensiklopedia materi & kamus lengkap Hukum Mendel I & II.
                  </p>
                </div>
              </button>

              {/* Option 2: BioBot AI Companion (MOVED TO MATERI) */}
              <button
                onClick={() => { closeHub(); setIsBioBotOpen(true); }}
                className="flex items-start gap-3 p-3 bg-gradient-to-r from-[#eff6ff] to-[#dbeafe] hover:from-[#dbeafe] hover:to-[#bfdbfe] border-2 border-[#1e40af] rounded-lg shadow-[2px_2px_0_#1e3a8a] text-left transition cursor-pointer group"
              >
                <div className="w-9 h-9 rounded bg-blue-600 border border-[#1e3a8a] flex items-center justify-center text-white flex-shrink-0 text-base shadow-xs animate-pulse">
                  🤖
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-pixel text-[9px] md:text-[10px] text-blue-950 uppercase font-black group-hover:text-blue-700">
                      BioBot AI Companion
                    </h4>
                    <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-pixel text-[6.5px] uppercase">AI</span>
                  </div>
                  <p className="text-[10px] text-blue-900 leading-tight mt-0.5 font-sans font-medium">
                    Tanya asisten AI cerdas seputar konsep pewarisan sifat.
                  </p>
                </div>
              </button>

              {/* Option 3: Leaderboard (MOVED TO MATERI) */}
              <button
                onClick={() => { closeHub(); setIsLeaderboardOpen(true); }}
                className="flex items-start gap-3 p-3 bg-gradient-to-r from-[#fefce8] to-[#fef08a] hover:from-[#fef08a] hover:to-[#fde047] border-2 border-[#854d0e] rounded-lg shadow-[2px_2px_0_#713f12] text-left transition cursor-pointer group"
              >
                <div className="w-9 h-9 rounded bg-amber-500 border border-[#713f12] flex items-center justify-center text-white flex-shrink-0 text-base shadow-xs">
                  🏆
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-pixel text-[9px] md:text-[10px] text-amber-950 uppercase font-black group-hover:text-amber-800">
                      Leaderboard Siswa
                    </h4>
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-amber-950 font-pixel text-[6.5px] uppercase font-bold">TOP</span>
                  </div>
                  <p className="text-[10px] text-amber-900 leading-tight mt-0.5 font-sans font-medium">
                    Papan peringkat bintang dan skor belajar siswa.
                  </p>
                </div>
              </button>

              {/* Option 4: Kelas LMS */}
              <button
                onClick={() => { closeHub(); navigateTo('group-dashboard'); }}
                className="flex items-start gap-3 p-3 bg-[#fff8e7] hover:bg-[#fde68a] border-2 border-[#361706] rounded-lg shadow-[2px_2px_0_#2b1103] text-left transition cursor-pointer group"
              >
                <div className="w-9 h-9 rounded bg-[#ca7c38] border border-[#361706] flex items-center justify-center text-white flex-shrink-0">
                  🏫
                </div>
                <div>
                  <h4 className="font-pixel text-[9px] md:text-[10px] text-[#361706] uppercase font-bold group-hover:text-[#884318]">
                    {userRole === 'guru' ? 'Kelola Kelas' : 'Kelas Belajar'}
                  </h4>
                  <p className="text-[10px] text-[#543319] leading-tight mt-0.5">
                    Portal tugas, grup kelas, dan materi dari guru.
                  </p>
                </div>
              </button>

              {/* Option 5: Kuis HOTS */}
              <button
                onClick={() => { closeHub(); navigateTo('hots-quiz'); }}
                className="flex items-start gap-3 p-3 bg-[#fff8e7] hover:bg-[#fde68a] border-2 border-[#361706] rounded-lg shadow-[2px_2px_0_#2b1103] text-left transition cursor-pointer group"
              >
                <div className="w-9 h-9 rounded bg-[#ca7c38] border border-[#361706] flex items-center justify-center text-white flex-shrink-0">
                  🧠
                </div>
                <div>
                  <h4 className="font-pixel text-[9px] md:text-[10px] text-[#361706] uppercase font-bold group-hover:text-[#884318]">
                    Kuis Evaluasi HOTS
                  </h4>
                  <p className="text-[10px] text-[#543319] leading-tight mt-0.5">
                    Uji pemahaman persilangan sifat & analisis gen.
                  </p>
                </div>
              </button>

              {/* Option 6: Identitas Media Kurikulum */}
              <button
                onClick={() => {
                  closeHub();
                  setTeacherReportActiveTab('identity');
                  setIsTeacherReportOpen(true);
                }}
                className="flex items-start gap-3 p-3 bg-[#fff8e7] hover:bg-[#fde68a] border-2 border-[#361706] rounded-lg shadow-[2px_2px_0_#2b1103] text-left transition cursor-pointer group"
              >
                <div className="w-9 h-9 rounded bg-[#ca7c38] border border-[#361706] flex items-center justify-center text-white flex-shrink-0">
                  📜
                </div>
                <div>
                  <h4 className="font-pixel text-[9px] md:text-[10px] text-[#361706] uppercase font-bold group-hover:text-[#884318]">
                    Identitas Media
                  </h4>
                  <p className="text-[10px] text-[#543319] leading-tight mt-0.5">
                    Capaian Pembelajaran & Kurikulum Merdeka.
                  </p>
                </div>
              </button>

              {/* Option 7: Cerita Visual Novel Pengenalan */}
              <button
                onClick={() => {
                  closeHub();
                  navigateTo('intro-story');
                }}
                className="flex items-start gap-3 p-3 bg-[#fff8e7] hover:bg-[#fde68a] border-2 border-[#361706] rounded-lg shadow-[2px_2px_0_#2b1103] text-left transition cursor-pointer group"
              >
                <div className="w-9 h-9 rounded bg-[#16a34a] border border-[#361706] flex items-center justify-center text-white flex-shrink-0 text-base">
                  💬
                </div>
                <div>
                  <h4 className="font-pixel text-[9px] md:text-[10px] text-[#361706] uppercase font-bold group-hover:text-[#884318]">
                    Dialog Pengenalan (Kak Nisa)
                  </h4>
                  <p className="text-[10px] text-[#543319] leading-tight mt-0.5">
                    Pengantar materi dan penjelasan panduan permainan.
                  </p>
                </div>
              </button>

              {/* Option 8: Video Prolog Sinematik */}
              <button
                onClick={() => {
                  closeHub();
                  navigateTo('intro-video');
                }}
                className="flex items-start gap-3 p-3 bg-[#fff8e7] hover:bg-[#fde68a] border-2 border-[#361706] rounded-lg shadow-[2px_2px_0_#2b1103] text-left transition cursor-pointer group"
              >
                <div className="w-9 h-9 rounded bg-[#dc2626] border border-[#361706] flex items-center justify-center text-white flex-shrink-0 text-base">
                  🎬
                </div>
                <div>
                  <h4 className="font-pixel text-[9px] md:text-[10px] text-[#361706] uppercase font-bold group-hover:text-[#884318]">
                    Video Sinematik: Prolog 1865
                  </h4>
                  <p className="text-[10px] text-[#543319] leading-tight mt-0.5">
                    Tonton kembali animasi kisah Gregor Mendel di Kebun Biara.
                  </p>
                </div>
              </button>
            </div>

            <div className="text-center pt-1">
              <button
                onClick={closeHub}
                className="px-5 py-1.5 bg-[#ca7c38] hover:bg-[#df9b52] border-2 border-[#361706] rounded-md font-pixel text-[9px] text-[#2b1103] uppercase font-black cursor-pointer shadow-[2px_2px_0_#2b1103] active:translate-y-0.5"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}


      {/* ================= MODAL SUB-HUB 2: PENGATURAN & PREFERENSI (OPTIONS) ================= */}
      {activeHub === 'features' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#fae8b6] border-4 border-[#361706] rounded-xl max-h-[88vh] overflow-y-auto p-4 md:p-6 space-y-4 shadow-[6px_6px_0_#1a0b03] text-[#2b1103] modal-landscape-compact">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-[#361706] pb-2">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#884318]" />
                <div>
                  <h3 className="font-pixel text-xs md:text-sm text-[#361706] font-black uppercase">
                    PENGATURAN & PREFERENSI SISTEM
                  </h3>
                  <span className="font-pixel text-[7.5px] text-[#884318] block">Audio, Akun, Masukan & Panduan Aplikasi</span>
                </div>
              </div>
              <button
                onClick={closeHub}
                className="p-1 bg-[#df9b52] hover:bg-[#ca7c38] border-2 border-[#361706] rounded text-[#2b1103] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hub Menu Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Option A: Audio & Game Settings */}
              <button
                onClick={() => { closeHub(); setIsSettingsOpen(true); }}
                className="flex items-start gap-3 p-3 bg-[#fff8e7] hover:bg-[#fde68a] border-2 border-[#361706] rounded-lg shadow-[2px_2px_0_#2b1103] text-left transition cursor-pointer group"
              >
                <div className="w-9 h-9 rounded bg-[#ca7c38] border border-[#361706] flex items-center justify-center text-white flex-shrink-0 text-base">
                  🎛️
                </div>
                <div>
                  <h4 className="font-pixel text-[9px] md:text-[10px] text-[#361706] uppercase font-bold group-hover:text-[#884318]">
                    Pengaturan Game
                  </h4>
                  <p className="text-[10px] text-[#543319] leading-tight mt-0.5">
                    Atur audio, BGM, SFX, dan preferensi akun.
                  </p>
                </div>
              </button>

              {/* Option B: Feedback & Saran */}
              <button
                onClick={() => { closeHub(); setIsFeedbackOpen(true); }}
                className="flex items-start gap-3 p-3 bg-[#fff8e7] hover:bg-[#fde68a] border-2 border-[#361706] rounded-lg shadow-[2px_2px_0_#2b1103] text-left transition cursor-pointer group"
              >
                <div className="w-9 h-9 rounded bg-[#ca7c38] border border-[#361706] flex items-center justify-center text-white flex-shrink-0 text-base">
                  💬
                </div>
                <div>
                  <h4 className="font-pixel text-[9px] md:text-[10px] text-[#361706] uppercase font-bold group-hover:text-[#884318]">
                    Saran Pengembang
                  </h4>
                  <p className="text-[10px] text-[#543319] leading-tight mt-0.5">
                    Kirim kritik dan saran untuk perbaikan media.
                  </p>
                </div>
              </button>

              {/* Option C: Panduan Bermain & Kontrol */}
              <button
                onClick={() => {
                  sound.playClick();
                  showAlert(
                    "PANDUAN KONTROL & FITUR:\n\n" +
                    "1. MAIN: Jelajahi Peta 8 Stage atau Petualangan RPG Kebun Mendel.\n" +
                    "2. MATERI: Baca Genopedia, tanyakan AI BioBot, dan cek peringkat Leaderboard.\n" +
                    "3. LAB 3D: Praktikum mikroskop virtual 3D untuk mengamati alel & fenotipe.\n" +
                    "4. KUIS HOTS: Uji pemahaman materi pewarisan sifat hukum Mendel."
                  );
                }}
                className="flex items-start gap-3 p-3 bg-[#fff8e7] hover:bg-[#fde68a] border-2 border-[#361706] rounded-lg shadow-[2px_2px_0_#2b1103] text-left transition cursor-pointer group"
              >
                <div className="w-9 h-9 rounded bg-[#ca7c38] border border-[#361706] flex items-center justify-center text-white flex-shrink-0 text-base">
                  💡
                </div>
                <div>
                  <h4 className="font-pixel text-[9px] md:text-[10px] text-[#361706] uppercase font-bold group-hover:text-[#884318]">
                    Panduan Aplikasi
                  </h4>
                  <p className="text-[10px] text-[#543319] leading-tight mt-0.5">
                    Petunjuk eksplorasi RPG, lab mikroskop & kontrol.
                  </p>
                </div>
              </button>

              {/* Option D: Tentang Media v2.0 */}
              <button
                onClick={() => {
                  sound.playClick();
                  showAlert(
                    "GENETIC ODYSSEY v2.0\n\n" +
                    "Media Pembelajaran Interaktif Genetika Hukum Mendel I & II.\n" +
                    "Dikembangkan dengan kurikulum biologi SMA fase F / merdeka belajar.\n" +
                    "Fitur: RPG Adventure, Lab Mikroskop 3D, Genopedia TTS, Gemini AI BioBot, & Live Scientific Journals."
                  );
                }}
                className="flex items-start gap-3 p-3 bg-[#fff8e7] hover:bg-[#fde68a] border-2 border-[#361706] rounded-lg shadow-[2px_2px_0_#2b1103] text-left transition cursor-pointer group"
              >
                <div className="w-9 h-9 rounded bg-[#ca7c38] border border-[#361706] flex items-center justify-center text-white flex-shrink-0 text-base">
                  ℹ️
                </div>
                <div>
                  <h4 className="font-pixel text-[9px] md:text-[10px] text-[#361706] uppercase font-bold group-hover:text-[#884318]">
                    Tentang Media
                  </h4>
                  <p className="text-[10px] text-[#543319] leading-tight mt-0.5">
                    Informasi versi 2.0, kurikulum, dan pengembang.
                  </p>
                </div>
              </button>

            </div>

            {/* Logout Row */}
            <div className="pt-2 border-t border-[#361706]/20 flex items-center justify-between">
              <button
                onClick={() => { closeHub(); handleLogout(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-pixel text-[8px] uppercase border border-[#361706] shadow-xs cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar Akun</span>
              </button>

              <button
                onClick={closeHub}
                className="px-5 py-1.5 bg-[#ca7c38] hover:bg-[#df9b52] border-2 border-[#361706] rounded-md font-pixel text-[9px] text-[#2b1103] uppercase font-black cursor-pointer shadow-[2px_2px_0_#2b1103] active:translate-y-0.5"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Play Mode Selector Modal (Classic 8-Stage Map vs RPG Stardew Valley World) */}
      <PlayModeModal
        isOpen={isPlayModeModalOpen}
        onClose={() => setIsPlayModeModalOpen(false)}
        onSelectMode={handleSelectPlayMode}
      />

    </div>
  );
};

export default MainMenu;
