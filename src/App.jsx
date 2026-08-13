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
import { Brain, AlertCircle } from 'lucide-react';
import { sound } from './services/sound';

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

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans selection:bg-sky-500 selection:text-white w-full">
      {/* Mobile Device Container Shell (Pixel-Perfect Responsive App Wrapper) */}
      <div id="app-shell-container" className="w-full sm:max-w-md min-h-screen sm:min-h-[840px] sm:max-h-[920px] bg-white sm:rounded-[2.5rem] sm:border-[6px] sm:border-slate-800 sm:shadow-[0_25px_60px_-15px_rgba(2,132,199,0.25)] flex flex-col relative overflow-hidden overflow-y-auto">
        
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

        {/* Modals & Overlay Drawers */}
        <BioBotDrawer />
        <TeacherReportModal />
        <LeaderboardModal />
        <SettingsModal />
        <CustomGlobalModal />

      </div>
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
