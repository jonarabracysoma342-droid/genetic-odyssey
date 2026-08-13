import React, { useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { MainMenu } from './components/map/MainMenu';
import { AdventureMap } from './components/map/AdventureMap';
import { StageContainer } from './components/stages/StageContainer';
import { HotsQuiz } from './components/features/HotsQuiz';
import { GenopediaPage } from './components/features/GenopediaPage';
import { BioBotDrawer } from './components/features/BioBotDrawer';
import { TeacherReportModal } from './components/features/TeacherReportModal';
import { LeaderboardModal } from './components/features/LeaderboardModal';
import { SettingsModal } from './components/features/SettingsModal';

// Firebase Auth & Group Dashboard imports
import { AuthScreen } from './components/features/AuthScreen';
import { GroupDashboard } from './components/features/GroupDashboard';
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
    { id: 'main-menu', label: 'Dashboard Utama', icon: Home, action: () => navigateTo('main-menu') },
    { id: 'map', label: 'Peta Petualangan', icon: Map, action: () => navigateTo('map') },
    { id: 'group-dashboard', label: userRole === 'guru' ? 'Kelola Kelas (LMS)' : 'Kelas Saya', icon: GraduationCap, action: () => navigateTo('group-dashboard') },
    { id: 'hots-quiz', label: 'Evaluasi Kuis HOTS', icon: Brain, action: () => navigateTo('hots-quiz') },
    { id: 'genopedia', label: 'Ensiklopedia Genopedia', icon: BookOpen, action: () => navigateTo('genopedia') },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r-3 border-slate-950 flex flex-col h-screen text-slate-100 p-4 justify-between z-30 select-none flex-shrink-0">
      <div className="space-y-6">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3 p-2 bg-gradient-to-r from-sky-600 to-indigo-650 rounded-2xl border-2 border-slate-950 shadow-3xs">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-white text-base">
            🧬
          </div>
          <div className="text-left">
            <h1 className="text-xs font-black uppercase tracking-widest leading-none text-white">GENETIC</h1>
            <span className="text-[10px] font-bold text-sky-200 tracking-wider">ODYSSEY</span>
          </div>
        </div>

        {/* User Profile Info Card */}
        <div className="p-3.5 border-2 border-slate-950 bg-slate-950/40 rounded-2xl flex items-center gap-3 shadow-3xs">
          <div className="w-9 h-9 rounded-xl bg-indigo-900 border border-slate-800 flex items-center justify-center font-black text-indigo-200">
            {userName ? userName.charAt(0).toUpperCase() : 'G'}
          </div>
          <div className="text-left truncate max-w-[130px]">
            <span className="text-[10px] font-black text-slate-100 block truncate">{userName}</span>
            <span className="text-[7.5px] font-bold uppercase tracking-wider text-sky-400 mt-0.5 block leading-none">
              {userRole === 'guru' ? '👨‍🏫 GURU' : '🧬 SISWA'}
            </span>
          </div>
        </div>

        {/* Navigation Link List */}
        <nav className="space-y-1 text-left">
          <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest block px-2 mb-2 font-sans">Menu Navigasi</span>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { sound.playClick(); item.action(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 cursor-pointer transition text-[9px] font-black uppercase ${
                  isActive
                    ? 'bg-sky-600 border-slate-950 text-white shadow-3xs'
                    : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-505'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / System Utilities */}
      <div className="space-y-1.5 border-t border-slate-800 pt-3">
        <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest block px-2 mb-2 font-sans text-left">Utilitas Game</span>
        
        <button
          onClick={() => { sound.playClick(); setIsLeaderboardOpen(true); }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:text-slate-200 hover:bg-slate-850 border border-transparent hover:border-slate-800 transition cursor-pointer text-left"
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>LEADERBOARD</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setIsSettingsOpen(true); }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:text-slate-200 hover:bg-slate-850 border border-transparent hover:border-slate-800 transition cursor-pointer text-left"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>PENGATURAN</span>
        </button>

        <button
          onClick={() => { sound.playClick(); handleLogout(); }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[9px] font-black uppercase text-rose-400 hover:text-rose-300 hover:bg-slate-850 border border-transparent transition cursor-pointer text-left"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
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
    <header className="bg-white border-b-2 border-slate-200 px-6 py-4 flex items-center justify-between shadow-2xs select-none">
      <div className="text-left">
        <span className="text-[8px] font-black text-sky-600 uppercase tracking-widest leading-none">PORTAL BELAJAR DIGITAL</span>
        <h2 className="text-sm font-black text-slate-850 mt-0.5 uppercase tracking-wide leading-none">{getViewTitle()}</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="px-3 py-1.5 bg-sky-50 border border-sky-200 rounded-xl text-[9px] font-bold text-sky-800 flex items-center gap-1.5">
          <span className="animate-pulse">✨</span>
          <span>BioBot Companion Aktif</span>
        </div>
      </div>
    </header>
  );
};

const GameMainContent = () => {
  const { activeView } = useGame();

  return (
    <main className="w-full pb-20">
      {activeView === 'main-menu' && <MainMenu />}
      {activeView === 'map' && <AdventureMap />}
      {activeView === 'stage' && <StageContainer />}
      {activeView === 'group-dashboard' && <GroupDashboard />}
      {activeView === 'hots-quiz' && <HotsQuiz />}
      {activeView === 'genopedia' && <GenopediaPage />}
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
      <div className="min-h-screen bg-[#faf6ee] flex items-center justify-center">
        <div className="text-center space-y-3 animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border-2 border-slate-800 p-2.5 flex items-center justify-center mx-auto">
            <Brain className="w-6 h-6 text-indigo-650 animate-bounce" />
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
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

  const getContainerMaxWidth = () => {
    if (activeView === 'group-dashboard' || activeView === 'genopedia') {
      return 'w-full max-w-6xl';
    }
    return 'w-full max-w-md';
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 md:p-0 font-sans selection:bg-sky-500 selection:text-white w-full overflow-hidden">
      
      {/* 1. DESKTOP TATA LETAK SHELL (Visible only on md and above) */}
      <div className="hidden md:flex w-full h-screen bg-slate-100 overflow-hidden relative">
        <DesktopSidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {activeView !== 'stage' && <DesktopHeader />}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
            <div className="flex justify-center w-full min-h-full">
              <div className={getContainerMaxWidth()}>
                <GameMainContent />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MOBILE TATA LETAK SHELL (Visible only below md) */}
      <div id="app-shell-container" className="w-full md:hidden min-h-screen bg-white flex flex-col relative overflow-hidden overflow-y-auto">
        {/* Top Notch / Status Bar simulator for Desktop view */}
        <div className="hidden sm:flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-bold text-slate-400 select-none bg-white z-50">
          <span>9:41</span>
          <div className="w-20 h-4 rounded-full bg-slate-900 mx-auto" />
          <div className="flex items-center gap-1.5">
            <span>5G</span>
            <div className="w-4 h-2.5 rounded-xs border border-slate-400 p-0.5 flex items-center">
              <div className="w-full h-full bg-slate-700 rounded-2xs" />
            </div>
          </div>
        </div>

        {activeView !== 'stage' && <Header />}
        <GameMainContent />
        {activeView !== 'stage' && <BottomNav />}
      </div>

      {/* Modals & Overlay Drawers (Always rendered globally for both layouts) */}
      <BioBotDrawer />
      <TeacherReportModal />
      <LeaderboardModal />
      <SettingsModal />
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
