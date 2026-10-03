import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Settings, Volume2, VolumeX, RotateCcw, LogOut, Unlock, MessageSquare, X, Key, Check } from 'lucide-react';
import { sound } from '../../services/sound';
import { getGeminiApiKey, setGeminiApiKey } from '../../services/gemini';

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

  const [geminiKeyInput, setGeminiKeyInput] = useState(getGeminiApiKey());
  const [showKeyField, setShowKeyField] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

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

          {/* Gemini AI Key Settings */}
          <div className="p-3 rounded-lg bg-[#fff8e7] border-2 border-[#361706] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 border border-[#361706] flex items-center justify-center text-white text-sm flex-shrink-0">
                  🤖
                </div>
                <div>
                  <h4 className="font-pixel text-[8px] md:text-[9px] text-[#361706] uppercase font-bold flex items-center gap-1.5">
                    API Key BioBot Gemini
                    {getGeminiApiKey() ? (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[6.5px]">AKTIF</span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[6.5px]">OFFLINE</span>
                    )}
                  </h4>
                  <p className="text-[9px] text-[#543319] leading-tight mt-0.5">
                    {getGeminiApiKey() ? 'Terhubung ke Google Gemini AI' : 'Mode offline aktif (opsional diisi)'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  setShowKeyField(!showKeyField);
                }}
                className="px-2.5 py-1 rounded bg-[#ca7c38] hover:bg-[#df9b52] border border-[#361706] font-pixel text-[7.5px] uppercase text-[#2b1103] cursor-pointer active:translate-y-0.5"
              >
                {showKeyField ? 'Tutup' : 'Atur Key'}
              </button>
            </div>

            {showKeyField && (
              <div className="pt-2 border-t border-[#361706]/20 space-y-2">
                <input
                  type="password"
                  placeholder="Paste Gemini API Key (AIzaSy...)"
                  value={geminiKeyInput}
                  onChange={(e) => setGeminiKeyInput(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border-2 border-[#361706] rounded-lg text-xs font-mono text-[#361706] placeholder-slate-400 focus:outline-none"
                />
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[7.5px] text-[#884318]">Dapatkan gratis di aistudio.google.com</span>
                  <div className="flex gap-1.5">
                    {getGeminiApiKey() && (
                      <button
                        onClick={() => {
                          sound.playClick();
                          setGeminiApiKey('');
                          setGeminiKeyInput('');
                          setKeySaved(true);
                          setTimeout(() => setKeySaved(false), 2000);
                        }}
                        className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded font-pixel text-[7px] uppercase border border-rose-300 cursor-pointer"
                      >
                        Hapus
                      </button>
                    )}
                    <button
                      onClick={() => {
                        sound.playClick();
                        setGeminiApiKey(geminiKeyInput);
                        setKeySaved(true);
                        setTimeout(() => setKeySaved(false), 2000);
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-pixel text-[7.5px] uppercase border border-[#361706] cursor-pointer"
                    >
                      {keySaved ? 'Tersimpan! ✓' : 'Simpan'}
                    </button>
                  </div>
                </div>
              </div>
            )}
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
