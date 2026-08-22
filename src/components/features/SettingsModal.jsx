import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Settings, Volume2, VolumeX, Music, RotateCcw, LogOut, Check, Unlock, MessageSquare } from 'lucide-react';
import { sound } from '../../services/sound';

const OFFICIAL_TRACKS = [
  { id: 'ambient_calm', name: 'Lullaby of Pea Ercis (Kalem & Pelan)', desc: 'Generative ambient synth instrumental (Relaxing & Peaceful)' },
  { id: 'spring_in_my_step', name: 'Spring In My Step - Silent Partner', desc: 'Ukulele & siulan ceria santai (Relaxed & Happy)' },
  { id: 'monody', name: 'TheFatRat - Monody (feat. Laura Brehm)', desc: 'Energetic gaming EDM track (High Energy)' }
];

export const SettingsModal = () => {
  const { 
    isSettingsOpen, 
    setIsSettingsOpen, 
    soundOn, 
    toggleSound, 
    bgmOn, 
    toggleBgm, 
    unlockAllStages,
    resetProgress,
    currentUser,
    userRole,
    userName,
    handleLogout,
    setIsFeedbackOpen
  } = useGame();

  const [activeTrack, setActiveTrack] = useState(
    localStorage.getItem('genetic_odyssey_bgm_track') || 'ambient_calm'
  );

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
      <div className="travorra-card max-w-md w-full p-6 rounded-3xl border border-slate-200 space-y-6 bg-white text-left shadow-2xl overflow-y-auto max-h-[85vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-slate-100 text-slate-700">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-serif-display font-extrabold text-slate-900">Pengaturan Game</h3>
              <p className="text-xs text-slate-500 font-medium">Audio, visual, dan kelola akun</p>
            </div>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(false)} 
            className="text-slate-400 hover:text-slate-900 p-2 rounded-full hover:bg-slate-100 text-xl font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Sound FX Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              {soundOn ? <Volume2 className="w-5 h-5 text-blue-600" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
              <div>
                <h4 className="font-extrabold text-xs text-slate-900">Suara Efek (SFX)</h4>
                <p className="text-[10px] text-slate-500 font-medium">Efek klik, jawaban benar, & selebrasi</p>
              </div>
            </div>
            <button
              onClick={toggleSound}
              className={"w-12 h-6 rounded-full transition p-1 flex items-center cursor-pointer " + (soundOn ? "bg-blue-600 justify-end" : "bg-slate-300 justify-start")}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* BGM Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <Music className={"w-5 h-5 " + (bgmOn ? "text-emerald-600" : "text-slate-400")} />
              <div>
                <h4 className="font-extrabold text-xs text-slate-900">Musik Latar (BGM)</h4>
                <p className="text-[10px] text-slate-500 font-medium font-bold">Mainkan musik latar resmi game</p>
              </div>
            </div>
            <button
              onClick={toggleBgm}
              className={"w-12 h-6 rounded-full transition p-1 flex items-center cursor-pointer " + (bgmOn ? "bg-emerald-600 justify-end" : "bg-slate-300 justify-start")}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* Track Selector List */}
          {bgmOn && (
            <div className="p-4 rounded-2xl bg-emerald-50/40 border-2 border-emerald-100 space-y-3 animate-scale-up text-left">
              <span className="text-[8.5px] font-black text-emerald-800 uppercase tracking-widest block font-sans">
                PILIH LAGU LATAR RESMI &bull; OFFICIAL TRACKS
              </span>

              <div className="grid grid-cols-1 gap-2">
                {OFFICIAL_TRACKS.map((track) => {
                  const isActive = activeTrack === track.id;
                  return (
                    <button
                      key={track.id}
                      onClick={() => {
                        sound.playClick();
                        sound.changeTrack(track.id);
                        setActiveTrack(track.id);
                      }}
                      className={"w-full p-3 rounded-xl border-2 flex items-center justify-between transition cursor-pointer text-left " + (
                        isActive 
                          ? "bg-white border-emerald-500 shadow-3xs" 
                          : "bg-white/70 border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <div className="overflow-hidden pr-2">
                        <div className="flex items-center gap-1.5">
                          <h5 className="text-[11px] font-extrabold text-slate-900 truncate">{track.name}</h5>
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 truncate mt-0.5">{track.desc}</p>
                      </div>
                      {isActive && (
                        <div className="p-1 rounded-full bg-emerald-100 text-emerald-700 flex-shrink-0">
                          <Check className="w-4 h-4 text-emerald-600" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* User Identity & Logout */}
          {currentUser && (
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-150 flex items-center justify-between">
              <div>
                <span className="text-[8px] font-black text-indigo-700 uppercase tracking-widest block font-sans">Akun Masuk ({userRole === 'guru' ? 'Guru' : 'Siswa'})</span>
                <span className="text-xs font-black text-slate-800 block truncate max-w-[180px]">{userName}</span>
                <span className="text-[9px] font-bold text-slate-400 block truncate max-w-[180px]">{currentUser.email}</span>
              </div>
              <button
                onClick={() => {
                  setIsSettingsOpen(false);
                  handleLogout();
                }}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-800 text-slate-850 hover:text-slate-900 transition flex items-center justify-center cursor-pointer shadow-3xs"
                title="Keluar Akun"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Feedback & Suggestions Button */}
          <div className="pt-2">
            <button
              onClick={() => {
                sound.playClick();
                setIsSettingsOpen(false);
                setIsFeedbackOpen(true);
              }}
              className="w-full py-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 text-amber-900 font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-3xs"
            >
              <MessageSquare className="w-4 h-4 text-amber-600" />
              <span>BERI KRITIK & SARAN UNTUK PENGEMBANG</span>
            </button>
          </div>

          {/* Unlock All Stages Button */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              onClick={() => {
                unlockAllStages();
                setIsSettingsOpen(false);
              }}
              className="w-full py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-3xs"
            >
              <Unlock className="w-4 h-4 text-emerald-600" />
              <span>BUKA SELURUH LEVEL (UNLOCK ALL STAGES 1-8)</span>
            </button>

            <button
              onClick={resetProgress}
              className="w-full py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RESET KEMAJUAN & HAPUS DATA GAME</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
