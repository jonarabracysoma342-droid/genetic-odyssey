import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../services/sound';
import { 
  X, 
  MapPin, 
  Gamepad2, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  Compass, 
  Footprints,
  Clock,
  RotateCcw,
  Check,
  User,
  ShieldAlert
} from 'lucide-react';

export const PlayModeModal = ({ isOpen, onClose, onSelectMode }) => {
  const { resetRpgData, showConfirm, showAlert, userName, isLandscapeMobile } = useGame();

  // Navigation steps: 'mode' | 'gender' | 'name'
  const [step, setStep] = useState('mode');
  
  // Player setup state
  const [selectedGender, setSelectedGender] = useState('female');
  const [playerNameInput, setPlayerNameInput] = useState('');

  // Load existing player preference on mount or modal open
  useEffect(() => {
    if (isOpen) {
      setStep('mode');
      try {
        const savedGender = localStorage.getItem('genetic_odyssey_rpg_player_gender') || 'female';
        const savedName = localStorage.getItem('genetic_odyssey_rpg_player_name') || userName || 'Jonara';
        setSelectedGender(savedGender);
        setPlayerNameInput(savedName);
      } catch (e) {
        setSelectedGender('female');
        setPlayerNameInput(userName || 'Jonara');
      }
    }
  }, [isOpen, userName]);

  if (!isOpen) return null;

  const handleSelectQuickMap = () => {
    sound.playClick();
    onSelectMode('map');
    onClose();
  };

  const handleEnterRpgSetup = () => {
    sound.playClick();
    setStep('gender');
  };

  const handleGenderNext = () => {
    sound.playClick();
    setStep('name');
  };

  const handleStartRpgAdventure = (e) => {
    if (e) e.preventDefault();
    sound.playFanfare();

    const finalName = playerNameInput.trim() || 'Jonara';
    try {
      localStorage.setItem('genetic_odyssey_rpg_player_gender', selectedGender);
      localStorage.setItem('genetic_odyssey_rpg_player_name', finalName);
    } catch (err) {
      console.error("Error saving player setup:", err);
    }

    onSelectMode('rpg');
    onClose();
  };

  const handleResetRpg = () => {
    sound.playClick();
    if (typeof showConfirm === 'function') {
      showConfirm(
        "Mulai ulang seluruh progres RPG? Seluruh item pencarian, misi NPC, dan posisi pemain di kebun Biara akan direset dari awal.",
        () => {
          if (typeof resetRpgData === 'function') {
            resetRpgData(false);
          }
        }
      );
    } else if (typeof resetRpgData === 'function') {
      resetRpgData(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fade-in select-none text-left">
      <div className={`w-full max-w-xl max-h-[94vh] overflow-y-auto rounded-2xl bg-[#fae8b6] border-4 border-[#361706] shadow-[8px_8px_0_#1a0b03] ${isLandscapeMobile ? 'p-3 space-y-2.5' : 'p-4 sm:p-6 space-y-4'} relative animate-scale-up text-[#2b1103] modal-landscape-compact`}>
        
        {/* ================= MODAL HEADER ================= */}
        <div className="flex items-center justify-between border-b-4 border-[#361706] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#ca7c38] border-2 border-[#361706] flex items-center justify-center text-[#fae8b6] shadow-[2px_2px_0_#1a0b03]">
              {step === 'mode' ? (
                <Compass className="w-5 h-5 animate-spin-slow" />
              ) : step === 'gender' ? (
                <User className="w-5 h-5" />
              ) : (
                <Sparkles className="w-5 h-5 text-amber-200" />
              )}
            </div>
            <div>
              <span className="font-pixel text-[8px] text-[#884318] uppercase tracking-wider block">
                {step === 'mode' 
                  ? 'PILIH GAYA PERMAINAN' 
                  : step === 'gender'
                  ? 'SESI 1 DARI 2 • PILIH KARAKTER'
                  : 'SESI 2 DARI 2 • IDENTITAS PENELITI'}
              </span>
              <h2 className="font-pixel text-xs sm:text-sm text-[#361706] uppercase font-black tracking-wide">
                {step === 'mode' 
                  ? 'MODE PETUALANGAN' 
                  : step === 'gender'
                  ? 'PILIH KARAKTER RPG'
                  : 'MASUKKAN NAMA PEMAIN'}
              </h2>
            </div>
          </div>

          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="w-8 h-8 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white border-2 border-[#361706] shadow-[2px_2px_0_#1a0b03] flex items-center justify-center cursor-pointer active:translate-y-0.5 transition"
            title="Tutup"
          >
            <X className="w-4 h-4 stroke-[3px]" />
          </button>
        </div>

        {/* ================= STEP 1: PILIH GAYA PERMAINAN ================= */}
        {step === 'mode' && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              
              {/* CARD 1: MODE CEPAT (PETA 8 STAGE) */}
              <div 
                onClick={handleSelectQuickMap}
                className="group relative rounded-xl bg-[#fff8e7] hover:bg-[#ffeed1] border-3 border-[#361706] p-3.5 sm:p-4 shadow-[4px_4px_0_#1a0b03] hover:-translate-y-1 hover:shadow-[6px_6px_0_#1a0b03] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-pixel text-[7px] bg-[#0284c7] text-white px-2 py-0.5 rounded border border-[#0369a1] uppercase">
                    ⚡ HEMAT WAKTU
                  </span>
                  <Clock className="w-4 h-4 text-[#0284c7]" />
                </div>

                <div className="space-y-1.5 my-2">
                  <h3 className="font-pixel text-xs font-black text-[#1e293b] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#e11d48]" />
                    <span>MODE CEPAT (PETA)</span>
                  </h3>
                  <p className="text-[11px] text-[#475569] leading-snug font-sans font-medium">
                    Pilih langsung dari <strong>Peta 8 Stage</strong> tanpa perlu berjalan. Sangat praktis untuk tugas kelas atau kuis kilat.
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t-2 border-[#361706]/20 flex items-center justify-between">
                  <span className="font-pixel text-[7.5px] text-[#0369a1] font-bold">
                    PILIH LEVEL LANGSUNG
                  </span>
                  <div className="w-6 h-6 rounded-md bg-[#0284c7] text-white flex items-center justify-center group-hover:translate-x-0.5 transition-transform border border-[#0369a1]">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* CARD 2: MODE RPG STARDEW VALLEY */}
              <div 
                onClick={handleEnterRpgSetup}
                className="group relative rounded-xl bg-[#e6f4ea] hover:bg-[#d5ecd9] border-3 border-[#15803d] p-3.5 sm:p-4 shadow-[4px_4px_0_#0f5132] hover:-translate-y-1 hover:shadow-[6px_6px_0_#0f5132] transition-all cursor-pointer flex flex-col justify-between ring-2 ring-[#16a34a]/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-pixel text-[7px] bg-[#16a34a] text-white px-2 py-0.5 rounded border border-[#14532d] uppercase flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-[#fde047]" />
                    <span>STARDEW STYLE</span>
                  </span>
                  <Gamepad2 className="w-4 h-4 text-[#16a34a]" />
                </div>

                <div className="space-y-1.5 my-2">
                  <h3 className="font-pixel text-xs font-black text-[#14532d] flex items-center gap-1.5">
                    <Footprints className="w-4 h-4 text-[#16a34a]" />
                    <span>PETUALANGAN RPG</span>
                  </h3>
                  <p className="text-[11px] text-[#2d5a3c] leading-snug font-sans font-medium">
                    Jelajahi kebun 2D pixel art biara Mendel! Bicara dengan 8 NPC, cari peralatan hilang, dan nikmati alur cerita interaktif.
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t-2 border-[#15803d]/20 flex items-center justify-between">
                  <span className="font-pixel text-[7.5px] text-[#15803d] font-bold">
                    PILIH KARAKTER & JALAN
                  </span>
                  <div className="w-6 h-6 rounded-md bg-[#16a34a] text-white flex items-center justify-center group-hover:translate-x-0.5 transition-transform border border-[#14532d]">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Options & Reset Button */}
            <div className="pt-2 border-t-2 border-[#361706]/20 flex items-center justify-between flex-wrap gap-2">
              <span className="font-pixel text-[7.5px] text-[#884318]">
                *Kedua mode berbagi bintang & kemajuan materi yang sama
              </span>
              <button
                type="button"
                onClick={handleResetRpg}
                className="font-pixel text-[8px] sm:text-[9px] text-red-700 hover:text-red-900 flex items-center gap-1.5 px-2.5 py-1 bg-red-100 hover:bg-red-200 rounded-lg border border-red-400 transition cursor-pointer active:translate-y-0.5"
                title="Reset seluruh progres misi RPG dari awal"
              >
                <RotateCcw className="w-3 h-3 text-red-600" />
                <span>Reset Progres RPG</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: SESI 1 (PILIH KARAKTER CEWE / COWO) ================= */}
        {step === 'gender' && (
          <div className="space-y-4">
            <p className="text-xs text-[#5c3317] font-medium leading-relaxed">
              Pilih karakter peneliti yang akan kamu kendalikan di Biara Mendel:
            </p>

            <div className="grid grid-cols-2 gap-3.5">
              
              {/* OPSI 1: CEWEK (PENELITI PUTRI) */}
              <div
                onClick={() => { sound.playClick(); setSelectedGender('female'); }}
                className={`relative rounded-xl border-3 p-3 flex flex-col items-center justify-between gap-2 cursor-pointer transition-all ${
                  selectedGender === 'female'
                    ? 'bg-[#ffe4e6] border-[#e11d48] shadow-[0_0_0_3px_#fb7185,4px_4px_0_#9f1239] -translate-y-0.5'
                    : 'bg-[#fff8e7] border-[#361706] hover:bg-[#fef2f2] shadow-[3px_3px_0_#1a0b03]'
                }`}
              >
                {selectedGender === 'female' && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#e11d48] text-white flex items-center justify-center shadow">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
                <div className="w-20 h-24 sm:w-24 sm:h-28 flex items-center justify-center overflow-hidden rounded-lg bg-rose-50/60 p-1 border border-rose-200">
                  <img 
                    src="/assets/portraits/player_female_portrait.webp" 
                    alt="Peneliti Putri" 
                    className="w-full h-full object-contain image-pixelated drop-shadow-md hover:scale-105 transition-transform" 
                  />
                </div>
                <div className="text-center">
                  <span className="font-pixel text-xs sm:text-sm font-black text-[#9f1239] block uppercase">
                    PENELITI PUTRI
                  </span>
                  <span className="text-[10px] text-rose-800/80 font-sans font-medium">
                    Karakter Perempuan
                  </span>
                </div>
              </div>

              {/* OPSI 2: COWOK (PENELITI PUTRA) */}
              <div
                onClick={() => { sound.playClick(); setSelectedGender('male'); }}
                className={`relative rounded-xl border-3 p-3 flex flex-col items-center justify-between gap-2 cursor-pointer transition-all ${
                  selectedGender === 'male'
                    ? 'bg-[#e0f2fe] border-[#0284c7] shadow-[0_0_0_3px_#38bdf8,4px_4px_0_#075985] -translate-y-0.5'
                    : 'bg-[#fff8e7] border-[#361706] hover:bg-[#f0f9ff] shadow-[3px_3px_0_#1a0b03]'
                }`}
              >
                {selectedGender === 'male' && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#0284c7] text-white flex items-center justify-center shadow">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
                <div className="w-20 h-24 sm:w-24 sm:h-28 flex items-center justify-center overflow-hidden rounded-lg bg-sky-50/60 p-1 border border-sky-200">
                  <img 
                    src="/assets/portraits/player_male_portrait.webp" 
                    alt="Peneliti Putra" 
                    className="w-full h-full object-contain image-pixelated drop-shadow-md hover:scale-105 transition-transform" 
                  />
                </div>
                <div className="text-center">
                  <span className="font-pixel text-xs sm:text-sm font-black text-[#0369a1] block uppercase">
                    PENELITI PUTRA
                  </span>
                  <span className="text-[10px] text-sky-800/80 font-sans font-medium">
                    Karakter Laki-laki
                  </span>
                </div>
              </div>

            </div>

            {/* Navigation Row */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => { sound.playClick(); setStep('mode'); }}
                className="stardew-wood-btn px-3 py-1.5 rounded-xl text-[#fef08a] font-stardew text-xs flex items-center gap-1 cursor-pointer active:translate-y-0.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>KEMBALI</span>
              </button>

              <button
                type="button"
                onClick={handleGenderNext}
                className="px-4 py-2 rounded-xl bg-gradient-to-b from-[#22c55e] to-[#15803d] hover:brightness-110 text-white font-stardew text-xs sm:text-sm tracking-wide flex items-center gap-1.5 border-2 border-[#14532d] shadow-[0_3px_0_#0d331b] active:translate-y-0.5 cursor-pointer transition-all"
              >
                <span>LANJUT KE NAMA</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: SESI 2 (MASUKKAN NAMA PEMAIN) ================= */}
        {step === 'name' && (
          <form onSubmit={handleStartRpgAdventure} className="space-y-4">
            <div className="bg-[#fff8e7] border-2 border-[#361706] rounded-xl p-3 flex items-center gap-3 shadow-inner">
              <div className="w-12 h-14 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 overflow-hidden">
                <img 
                  src={selectedGender === 'male' ? '/assets/portraits/player_male_portrait.webp' : '/assets/portraits/player_female_portrait.webp'} 
                  alt="Karakter Terpilih" 
                  className="w-full h-full object-contain image-pixelated" 
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-pixel text-[8px] text-[#884318] uppercase tracking-wider block">
                  Karakter: {selectedGender === 'male' ? 'Peneliti Putra (Cowok)' : 'Peneliti Putri (Cewek)'}
                </span>
                <p className="text-[11px] text-[#5c3317] font-sans font-medium">
                  Nama yang kamu masukkan akan dipanggil oleh Bruder Thomas, Rosalind Franklin, dan Gregor Mendel di dalam dialog!
                </p>
              </div>
            </div>

            {/* Name Input Box */}
            <div className="space-y-1.5">
              <label htmlFor="rpg-player-name" className="font-pixel text-[9px] sm:text-[10px] text-[#361706] uppercase font-bold tracking-wider block">
                NAMA PEMAIN / PENELITI:
              </label>
              <div className="relative">
                <input
                  id="rpg-player-name"
                  type="text"
                  maxLength={18}
                  value={playerNameInput}
                  onChange={(e) => setPlayerNameInput(e.target.value)}
                  placeholder="Contoh: Jonara"
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border-3 border-[#361706] text-[#2b1103] font-stardew text-base sm:text-lg tracking-wider placeholder-[#a87f5d]/60 focus:outline-none focus:border-[#ca8a04] shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-pixel text-[8px] text-[#884318]/70">
                  {playerNameInput.length}/18
                </span>
              </div>
              <p className="text-[10px] text-[#884318] italic">
                *Contoh jika kamu memasukkan <strong>"Jonara"</strong>, NPC akan menyapamu: <em>"Halo Jonara! Senang melihatmu berkunjung ke Biara Mendel."</em>
              </p>
            </div>

            {/* Navigation & Launch */}
            <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
              <button
                type="button"
                onClick={() => { sound.playClick(); setStep('gender'); }}
                className="stardew-wood-btn px-3 py-1.5 rounded-xl text-[#fef08a] font-stardew text-xs flex items-center gap-1 cursor-pointer active:translate-y-0.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>KEMBALI</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-b from-[#16a34a] via-[#15803d] to-[#0f5132] hover:brightness-110 text-[#fef08a] font-stardew text-sm sm:text-base tracking-wider flex items-center gap-2 border-2 border-[#14532d] shadow-[0_4px_0_#0a3622] active:translate-y-0.5 cursor-pointer transition-all font-bold"
              >
                <Sparkles className="w-4 h-4 text-[#fde047] animate-pulse" />
                <span>MULAI PETUALANGAN!</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

