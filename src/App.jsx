import React, { useEffect, lazy, Suspense } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { BioBotDrawer } from './components/features/BioBotDrawer';
import { TeacherReportModal } from './components/features/TeacherReportModal';
import { LeaderboardModal } from './components/features/LeaderboardModal';
import { SettingsModal } from './components/features/SettingsModal';
import { DeveloperFeedbackModal } from './components/features/DeveloperFeedbackModal';

// Firebase Auth & Group Dashboard imports
import { AuthScreen } from './components/features/AuthScreen';
import { MainMenu } from './components/map/MainMenu';

// Lazy load all secondary features to drastically reduce initial login bundle size (PageSpeed optimization)
const AdventureMap = lazy(() => import('./components/map/AdventureMap').then(module => ({ default: module.AdventureMap })));
const StageContainer = lazy(() => import('./components/stages/StageContainer').then(module => ({ default: module.StageContainer })));
const HotsQuiz = lazy(() => import('./components/features/HotsQuiz').then(module => ({ default: module.HotsQuiz })));
const GenopediaPage = lazy(() => import('./components/features/GenopediaPage').then(module => ({ default: module.GenopediaPage })));
const GroupDashboard = lazy(() => import('./components/features/GroupDashboard').then(module => ({ default: module.GroupDashboard })));
const PixelRpgWorld = lazy(() => import('./components/rpg/PixelRpgWorld').then(module => ({ default: module.PixelRpgWorld })));
import { IntroVisualNovel } from './components/features/IntroVisualNovel';
import { IntroCutsceneVideo } from './components/features/IntroCutsceneVideo';

import { 
  Brain, 
  AlertCircle, 
  Home, 
  Map, 
  GraduationCap, 
  BookOpen, 
  Trophy, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { sound } from './services/sound';

const DesktopSidebar = () => {
  const { 
    activeView, 
    navigateTo, 
    userName, 
    userRole, 
    setIsLeaderboardOpen, 
    setIsSettingsOpen, 
    handleLogout 
  } = useGame();

  const menuItems = [
    { id: 'main-menu', label: 'Menu Utama', icon: Home, action: () => navigateTo('main-menu') },
    { id: 'map', label: 'Play / Peta Game', icon: Map, action: () => navigateTo('map') },
    { id: 'genopedia', label: 'Zona Belajar & Kelas', icon: BookOpen, action: () => navigateTo('genopedia') },
  ];

  return (
    <aside className="w-68 bg-[#221208] border-r-4 border-[#361706] flex flex-col h-screen text-[#ffd699] p-4 justify-between z-30 select-none flex-shrink-0 shadow-[4px_0_12px_rgba(0,0,0,0.4)]">
      <div className="space-y-5">
        
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 p-2.5 bg-[#361706] rounded-xl border-2 border-[#ca7c38] shadow-[2px_2px_0_#1a0b03]">
          <div className="w-9 h-9 rounded-lg bg-[#ca7c38] flex items-center justify-center font-pixel text-lg text-[#2b1103]">
            🧬
          </div>
          <div className="text-left">
            <h1 className="text-[10px] font-pixel text-[#ffffff] uppercase tracking-wider leading-none">GENETIC</h1>
            <span className="text-[8px] font-pixel text-[#facc15] tracking-widest block mt-1">ODYSSEY</span>
          </div>
        </div>

        {/* User Profile Info Card */}
        <div className="p-3 border-2 border-[#361706] bg-[#2d180a] rounded-xl flex items-center gap-2.5 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-[#ca7c38] border border-[#fbe4c8] flex items-center justify-center font-pixel text-[#2b1103] text-sm">
            {userName ? userName.charAt(0).toUpperCase() : '🧬'}
          </div>
          <div className="text-left truncate max-w-[140px]">
            <span className="text-[9px] font-pixel text-[#ffd699] block truncate">{userName || 'Siswa'}</span>
            <span className="text-[7px] font-pixel text-[#86efac] mt-0.5 block leading-none uppercase">
              {userRole === 'guru' ? '👨‍🏫 GURU' : '🧬 PENELITI'}
            </span>
          </div>
        </div>

        {/* Navigation Link List (3 Consolidated Main Choices) */}
        <nav className="space-y-2 text-left">
          <span className="text-[8px] font-pixel text-[#ffd699]/60 uppercase tracking-widest block px-1 mb-1">3 Menu Utama</span>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id || (item.id === 'genopedia' && ['group-dashboard', 'hots-quiz', 'genopedia'].includes(activeView));
            return (
              <button
                key={item.id}
                onClick={() => { sound.playClick(); item.action(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 cursor-pointer transition text-[9px] font-pixel uppercase ${
                  isActive
                    ? 'bg-[#ca7c38] border-[#361706] text-[#2b1103] shadow-[2px_2px_0_#1a0b03]'
                    : 'bg-transparent border-transparent text-[#ffd699]/80 hover:text-white hover:bg-[#361706]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#2b1103]' : 'text-[#ffd699]'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / System Utilities */}
      <div className="space-y-1.5 border-t-2 border-[#361706] pt-3">
        <span className="text-[8px] font-pixel text-[#ffd699]/60 uppercase tracking-widest block px-1 mb-1 text-left">Utilitas</span>
        
        <button
          onClick={() => { sound.playClick(); setIsLeaderboardOpen(true); }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[8px] font-pixel uppercase text-[#ffd699]/80 hover:text-[#facc15] hover:bg-[#361706] transition cursor-pointer text-left"
        >
          <Trophy className="w-4 h-4 text-[#facc15]" />
          <span>LEADERBOARD</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setIsSettingsOpen(true); }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[8px] font-pixel uppercase text-[#ffd699]/80 hover:text-white hover:bg-[#361706] transition cursor-pointer text-left"
        >
          <Settings className="w-4 h-4 text-[#ffd699]" />
          <span>PENGATURAN</span>
        </button>

        <button
          onClick={() => { sound.playClick(); handleLogout(); }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[8px] font-pixel uppercase text-rose-400 hover:text-rose-300 hover:bg-[#361706] transition cursor-pointer text-left"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>KELUAR AKUN</span>
        </button>
      </div>
    </aside>
  );
};

const DesktopHeader = () => {
  const { activeView } = useGame();
  
  const getViewTitle = () => {
    switch (activeView) {
      case 'main-menu': return 'Dashboard Utama';
      case 'map': return 'Peta Petualangan';
      case 'group-dashboard': return 'Portal Kelas Belajar';
      case 'hots-quiz': return 'Ujian Evaluasi Kuis HOTS';
      case 'genopedia': return 'Ensiklopedia Genetika';
      default: return 'Genetic Odyssey';
    }
  };

  return (
    <header className="bg-white border-b-2 border-slate-200 px-8 py-5 flex items-center justify-between shadow-2xs select-none">
      <div className="text-left">
        <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest leading-none">PORTAL BELAJAR DIGITAL</span>
        <h2 className="text-base font-black text-slate-850 mt-1 uppercase tracking-wide leading-none">{getViewTitle()}</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="px-4 py-2 bg-sky-50 border border-sky-200 rounded-xl text-xs font-bold text-sky-800 flex items-center gap-2">
          <span className="animate-pulse">✨</span>
          <span>BioBot Companion Aktif</span>
        </div>
      </div>
    </header>
  );
};

const GameMainContent = () => {
  const { activeView, isTransitioning } = useGame();

  return (
    <main className="w-full min-h-screen h-screen p-0 m-0 overflow-y-auto relative bg-[#74c2e8]">
      {/* 1.5s Pure Black Fade Transition Overlay */}
      <div 
        className={`fixed inset-0 pointer-events-none z-50 bg-black transition-opacity duration-750 ease-in-out ${
          isTransitioning ? 'opacity-100' : 'opacity-0'
        }`} 
      />

      {/* View Container */}
      <div 
        key={activeView} 
        className={`w-full min-h-screen ${
          isTransitioning ? 'opacity-0 transition-opacity duration-750' : 'opacity-100'
        }`}
      >
        {activeView === 'intro-video' && <IntroCutsceneVideo />}
        {activeView === 'intro-story' && <IntroVisualNovel />}
        {activeView === 'main-menu' && <MainMenu />}
        {activeView === 'map' && (
          <Suspense fallback={<div className="w-full min-h-screen bg-[#74c2e8]" />}>
            <AdventureMap />
          </Suspense>
        )}
        {activeView === 'rpg-world' && (
          <Suspense fallback={<div className="w-full min-h-screen bg-[#74c2e8]" />}>
            <PixelRpgWorld />
          </Suspense>
        )}
        {activeView === 'stage' && (
          <Suspense fallback={<div className="w-full min-h-screen bg-[#74c2e8]" />}>
            <StageContainer />
          </Suspense>
        )}
        {activeView === 'group-dashboard' && (
          <Suspense fallback={<div className="w-full min-h-screen bg-[#74c2e8]" />}>
            <GroupDashboard />
          </Suspense>
        )}
        {activeView === 'hots-quiz' && (
          <Suspense fallback={<div className="w-full min-h-screen bg-[#74c2e8]" />}>
            <HotsQuiz />
          </Suspense>
        )}
        {activeView === 'genopedia' && (
          <Suspense fallback={<div className="w-full min-h-screen bg-[#74c2e8]" />}>
            <GenopediaPage />
          </Suspense>
        )}
      </div>
    </main>
  );
};

const AppShell = () => {
  const { 
    activeView, 
    currentUser, 
    authLoading,
    isGenopediaOpen,
    isBioBotOpen,
    isTeacherReportOpen,
    isLeaderboardOpen,
    isSettingsOpen,
    customModal,
    activePreviewStage,
    activeStudentModal,
    activeReviewQuiz
  } = useGame();

  const isAnyModalOpen = isGenopediaOpen || 
                         isBioBotOpen || 
                         isTeacherReportOpen || 
                         isLeaderboardOpen || 
                         isSettingsOpen || 
                         (customModal && customModal.isOpen) ||
                         activePreviewStage !== null ||
                         activeStudentModal !== null ||
                         activeReviewQuiz !== null;

  useEffect(() => {
    const shell = document.getElementById('app-shell-container');
    if (shell) {
      if (isAnyModalOpen) {
        shell.classList.remove('overflow-y-auto');
        shell.classList.add('overflow-hidden');
      } else {
        shell.classList.remove('overflow-hidden');
        shell.classList.add('overflow-y-auto');
      }
    }
  }, [isAnyModalOpen]);

  // Loading screen during auth status check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#74c2e8] flex items-center justify-center font-pixel text-[#2b1103]">
        <div className="text-center space-y-3 bg-[#fae8b6] border-4 border-[#361706] p-6 rounded-xl shadow-[4px_4px_0_#1a0b03]">
          <div className="w-12 h-12 rounded-lg bg-[#ca7c38] border-2 border-[#361706] flex items-center justify-center mx-auto text-2xl animate-bounce">
            🧬
          </div>
          <span className="text-[10px] font-pixel text-[#361706] uppercase tracking-widest block">
            Memuat Data...
          </span>
        </div>
      </div>
    );
  }

  // Enforce login screen if user is not authenticated
  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <div id="app-shell-container" className="w-full min-h-screen h-screen bg-[#74c2e8] overflow-hidden overflow-y-auto flex flex-col font-sans select-none relative">
      <GameMainContent />

      {/* Global Modals in Pixel Theme */}
      <BioBotDrawer />
      <TeacherReportModal />
      <LeaderboardModal />
      <SettingsModal />
      <DeveloperFeedbackModal />
      <CustomGlobalModal />
    </div>
  );
};

const CustomGlobalModal = () => {
  const { customModal } = useGame();
  
  if (!customModal?.isOpen) return null;
  
  const isConfirm = customModal.type === 'confirm';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-left">
      <div className="bg-white border-3 border-slate-800 rounded-3xl w-full max-w-xs p-5 shadow-[6px_6px_0px_#1e293b] text-center space-y-4 animate-scale-up">
        
        {/* Warning Icon Header */}
        <div className="w-11 h-11 rounded-2xl bg-amber-50 border-2 border-slate-800 flex items-center justify-center mx-auto shadow-3xs flex-shrink-0">
          <AlertCircle className="w-6 h-6 text-amber-600 animate-bounce" />
        </div>

        {/* Message */}
        <div className="space-y-1.5 text-center">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">KONFIRMASI SISTEM</h4>
          <p className="text-[10.5px] font-bold text-slate-700 leading-relaxed pt-1.5 whitespace-pre-wrap">
            {customModal.message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 justify-center pt-1">
          {isConfirm ? (
            <>
              <button
                onClick={() => {
                  sound.playClick();
                  if (customModal.onCancel) customModal.onCancel();
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-slate-800 rounded-xl font-black text-[9px] cursor-pointer active:translate-y-0.2"
              >
                BATAL
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  if (customModal.onConfirm) customModal.onConfirm();
                }}
                className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white border-2 border-slate-800 rounded-xl font-black text-[9px] cursor-pointer active:translate-y-0.2"
              >
                OKE
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                if (customModal.onConfirm) customModal.onConfirm();
              }}
              className="px-6 py-2 bg-indigo-650 hover:bg-indigo-700 text-white border-2 border-slate-800 rounded-xl font-black text-[9px] cursor-pointer active:translate-y-0.2"
            >
              OKE
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <AppShell />
    </GameProvider>
  );
}
