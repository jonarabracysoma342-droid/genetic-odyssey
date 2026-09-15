import React from 'react';
import { useGame } from '../../context/GameContext';
import { Settings, Volume2, VolumeX, RotateCcw, LogOut, Unlock, MessageSquare, X } from 'lucide-react';
import { sound } from '../../services/sound';

export const SettingsModal = () => {
  const { 
    isSettingsOpen, 
    setIsSettingsOpen, 
    soundOn, 
    toggleSound, 
    unlockAllStages,
    resetProgress,
    userName,
    userRole,
    handleLogout,
    setIsFeedbackOpen
  } = useGame();

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-md w-full p-4 md:p-6 rounded-xl border-4 border-[#361706] space-y-4 bg-[#fae8b6] text-left shadow-[6px_6px_0_#1a0b03] text-[#2b1103] overflow-y-auto max-h-[85vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-[#361706] pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#ca7c38] text-[#2b1103] border-2 border-[#361706] shadow-xs">
              <Settings className="w-5 h-5 text-[#2b1103]" />
            </div>
            <div>
              <h3 className="text-xs md:text-sm font-pixel text-[#361706] uppercase font-bold">PENGATURAN</h3>
              <p className="text-[9px] text-[#884318] font-pixel mt-0.5">Preferensi & Akun</p>
            </div>
          </div>
          <button 
            onClick={() => {
              sound.playClick();
              setIsSettingsOpen(false);
            }} 
            className="p-1 bg-[#df9b52] hover:bg-[#ca7c38] border-2 border-[#361706] rounded text-[#2b1103] cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5px]" />
          </button>
        </div>

        <div className="space-y-3">
          {/* User profile info */}
          <div className="p-3 rounded-lg bg-[#fff8e7] border-2 border-[#361706] flex items-center justify-between">
            <div>
              <span className="font-pixel text-[8px] text-[#884318] uppercase block">Akun Pengguna</span>
              <span className="font-pixel text-[9px] text-[#361706] font-bold block mt-0.5">{userName || 'Siswa'}</span>
            </div>
            <span className="font-pixel text-[7px] px-2 py-0.5 rounded bg-[#ca7c38] text-[#2b1103] uppercase">
              {userRole === 'guru' ? 'GURU' : 'SISWA'}
            </span>
          </div>

          {/* Sound FX Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#fff8e7] border-2 border-[#361706]">
            <div className="flex items-center gap-2.5">
              {soundOn ? <Volume2 className="w-4 h-4 text-[#16a34a]" /> : <VolumeX className="w-4 h-4 text-[#991b1b]" />}
              <div>
                <h4 className="font-pixel text-[8px] md:text-[9px] text-[#361706] uppercase font-bold">Suara Efek (SFX)</h4>
                <p className="text-[9px] text-[#543319] leading-tight mt-0.5">Efek klik tombol & jawaban</p>
              </div>
            </div>
            <button
              onClick={toggleSound}
              className={`px-3 py-1 rounded font-pixel text-[8px] border-2 border-[#361706] uppercase cursor-pointer transition ${
                soundOn ? 'bg-[#16a34a] text-white' : 'bg-[#dc2626] text-white'
              }`}
            >
              {soundOn ? 'AKTIF' : 'MATI'}
            </button>
          </div>

          {/* Unlock All Stages */}
          <button
            onClick={() => {
              sound.playClick();
              unlockAllStages();
              setIsSettingsOpen(false);
            }}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-[#fff8e7] hover:bg-[#fde68a] border-2 border-[#361706] cursor-pointer transition text-left"
          >
            <div className="flex items-center gap-2.5">
              <Unlock className="w-4 h-4 text-[#16a34a]" />
              <div>
                <h4 className="font-pixel text-[8px] md:text-[9px] text-[#361706] uppercase font-bold">Buka Semua Level</h4>
                <p className="text-[9px] text-[#543319] leading-tight mt-0.5">Buka akses Stage 1-8 langsung</p>
              </div>
            </div>
            <span className="font-pixel text-[8px] text-[#884318]">➜</span>
          </button>

          {/* Developer Feedback */}
          <button
            onClick={() => {
              sound.playClick();
              setIsSettingsOpen(false);
              setIsFeedbackOpen(true);
            }}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-[#fff8e7] hover:bg-[#fde68a] border-2 border-[#361706] cursor-pointer transition text-left"
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-[#0284c7]" />
              <div>
                <h4 className="font-pixel text-[8px] md:text-[9px] text-[#361706] uppercase font-bold">Saran Pengembang</h4>
                <p className="text-[9px] text-[#543319] leading-tight mt-0.5">Kirim ulasan dan kritik fitur</p>
              </div>
            </div>
            <span className="font-pixel text-[8px] text-[#884318]">➜</span>
          </button>

          {/* Reset Progress */}
          <button
            onClick={() => {
              sound.playClick();
              resetProgress();
            }}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-[#fee2e2] hover:bg-[#fecaca] border-2 border-[#991b1b] cursor-pointer transition text-left text-[#991b1b]"
          >
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-[#991b1b]" />
              <div>
                <h4 className="font-pixel text-[8px] md:text-[9px] text-[#991b1b] uppercase font-bold">Reset Kemajuan</h4>
                <p className="text-[9px] text-[#7f1d1d] leading-tight mt-0.5">Kembalikan skor & bintang ke 0</p>
              </div>
            </div>
            <span className="font-pixel text-[8px] text-[#991b1b]">➜</span>
          </button>
        </div>

        {/* Footer Logout & Close */}
        <div className="pt-2 border-t border-[#361706]/20 flex items-center justify-between">
          <button
            onClick={() => {
              sound.playClick();
              setIsSettingsOpen(false);
              handleLogout();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded font-pixel text-[8px] uppercase border border-[#361706] shadow-xs cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Akun</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setIsSettingsOpen(false);
            }}
            className="px-5 py-1.5 bg-[#ca7c38] hover:bg-[#df9b52] border-2 border-[#361706] rounded-md font-pixel text-[8px] text-[#2b1103] uppercase font-bold cursor-pointer shadow-xs"
          >
            TUTUP
          </button>
        </div>

      </div>
    </div>
  );
};
