import React from 'react';
import { useGame } from '../../context/GameContext';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Settings, 
  Star 
} from 'lucide-react';

export const Header = () => {
  const { 
    totalStars, 
    setIsTeacherReportOpen, 
    setTeacherReportActiveTab,
    setIsSettingsOpen, 
    soundOn, 
    toggleSound 
  } = useGame();

  return (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-md border-b border-white/45 px-4 py-2.5 shadow-2xs md:hidden">
      <div className="flex items-center justify-between">
        
        {/* User Profile Avatar & Greeting */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-sky-400 p-0.5 shadow-md shadow-sky-500/20">
              <img 
                src="/assets/mendel_avatar.png" 
                alt="User Avatar" 
                className="w-full h-full object-contain rounded-full bg-white"
              />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
          </div>

          <div className="text-left">
            <span className="text-[10px] font-semibold text-slate-400 block leading-tight">
              Hello, 👋
            </span>
            <h2 className="text-xs font-black text-slate-900 leading-tight">
              Siswa Genetika
            </h2>
          </div>
        </div>

        {/* Right Action Icons & Notification Bell */}
        <div className="flex items-center gap-1.5">
          
          {/* Star Counter Badge */}
          <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-black text-amber-800 font-mono">{totalStars} ★</span>
          </div>

          {/* Audio FX Toggle */}
          <button
            onClick={toggleSound}
            className={`p-1.5 rounded-full text-xs transition ${soundOn ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-400'}`}
            title={soundOn ? "Mute SFX" : "Aktifkan SFX"}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => {
              setTeacherReportActiveTab('identity');
              setIsTeacherReportOpen(true);
            }}
            className="relative p-1.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-700 transition"
            title="Laporan & Notifikasi"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 border border-white animate-pulse" />
          </button>

          {/* Settings */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            title="Pengaturan"
          >
            <Settings className="w-4 h-4" />
          </button>

        </div>

      </div>
    </header>
  );
};
