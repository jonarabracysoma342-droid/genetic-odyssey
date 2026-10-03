import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Volume2, 
  X, 
  Minimize2, 
  Maximize2, 
  CheckCircle2, 
  Lightbulb, 
  Eye, 
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { sound } from '../../services/sound';

export const KakFafaDialogueGuide = ({
  currentStep = 1,
  selectedSpecimen,
  lightPower,
  objectiveLens,
  stagePosX,
  stagePosY,
  isStageCentered,
  coarseFocus,
  fineFocus,
  focusScore,
  isOptimalFocus,
  showEyepieceView,
  onOpenEyepiece,
  onViewAllSop,
  docked = false,
  isOpen = true,
  onToggleOpen,
  onCloseRack,
  onReplayIntro,
  capturedPhotos = {},
  onOpenLkpd
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [dialogueIndex, setDialogueIndex] = useState(0);

  const hasPhotoForCurrent = Boolean(selectedSpecimen && capturedPhotos[selectedSpecimen.id]);

  // Dynamic dialogue calculation based on live simulator state (Action-First)
  const getFafaGuidance = () => {
    // ─── TAHAP 1: PERSIAPAN AWAL & CAHAYA ───
    if (!selectedSpecimen) {
      return {
        step: 1,
        title: '🎯 1. Pilih Kaca Preparat',
        badge: 'Tahap 1 • Persiapan',
        text: 'Klik salah satu kaca preparat di rak sebelah kiri untuk dipasang ke meja mikroskop!',
        highlightTarget: 'specimen_rack',
        isComplete: false,
        tip: 'Tersedia 5 preparat pewarisan sifat Mendel & mutasi genetik.'
      };
    }

    if (!lightPower) {
      return {
        step: 1,
        title: '💡 1. Nyalakan Lampu LED',
        badge: 'Tahap 1 • Sumber Cahaya',
        text: `Preparat ${selectedSpecimen.badge} terpasang! Sekarang klik tombol [LED OFF] di kanan bawah agar lampu menyala.`,
        highlightTarget: 'led_button',
        isComplete: false,
        tip: 'Tanpa lampu menyala, bayangan sel akan gelap gulita.'
      };
    }

    if (objectiveLens > 10) {
      return {
        step: 1,
        title: '🔄 1. Pasang Lensa Lemah (4x/10x)',
        badge: 'Tahap 1 • Aturan SOP',
        text: 'Awali pengamatan dengan lensa perbesaran terlemah (4x atau 10x) agar bidang pandang luas.',
        highlightTarget: 'revolver',
        isComplete: false,
        tip: 'Jangan langsung memakai 40x sebelum objek ditemukan di 10x.'
      };
    }

    // ─── TAHAP 2: PENEMPATAN & PENJEPITAN PREPARAT ───
    if (!isStageCentered && (Math.abs(stagePosX) > 15 || Math.abs(stagePosY) > 15)) {
      return {
        step: 2,
        title: '🎯 2. Pusatkan Meja Objek',
        badge: 'Tahap 2 • Posisi Meja',
        text: 'Klik tombol [Pusat] atau gunakan kenop geser meja agar objek berada tepat di tengah bawah lensa.',
        highlightTarget: 'stage_knobs',
        isComplete: false,
        tip: 'Objek di tengah akan langsung terlihat saat lensa diintip.'
      };
    }

    // ─── TAHAP 3: FOKUS & PENGAMATAN (MAKROMETER & MIKROMETER) ───
    if (coarseFocus < 20) {
      return {
        step: 3,
        title: '⬆️ 3. Naikkan Meja (Makrometer)',
        badge: 'Tahap 3 • Fokus Kasar',
        text: 'Gunakan Makrometer [▲ Naik] perlahan sambil dilihat dari samping meja mikroskop.',
        highlightTarget: 'coarse_knob',
        isComplete: false,
        tip: 'Lihat dari samping agar lensa objektif tidak menabrak kaca preparat!'
      };
    }

    if (!showEyepieceView) {
      return {
        step: 3,
        title: '👁️ 3. Intip Lensa Okuler',
        badge: 'Tahap 3 • Buka Okuler',
        text: 'Meja siap! Klik tabung lensa 3D atau tombol [INTIP OKULER] di pojok atas untuk melihat sel.',
        highlightTarget: 'eyepiece_lens',
        isComplete: false,
        tip: 'Kamu juga bisa klik langsung kedua lensa okuler pada mikroskop 3D.'
      };
    }

    if (!isOptimalFocus || focusScore < 85) {
      return {
        step: 3,
        title: '🔍 3. Putar Mikrometer (Fokus Kristal)',
        badge: `Tahap 3 • Ketajaman (${focusScore}%)`,
        text: `Bayangan mulai tampak (${focusScore}%)! Putar Mikrometer [▲ +2 / ▼ -2] sampai fokus kristal 100%.`,
        highlightTarget: 'fine_knob',
        isComplete: false,
        tip: `Target ideal preparat ini: Makro ~${selectedSpecimen.idealFocus.coarse}%, Mikro ~${selectedSpecimen.idealFocus.fine}%.`
      };
    }

    // ─── TAHAP 4: OBSERVASI STRUKTUR & FOTO PREPARAT / LKPD ───
    if (!hasPhotoForCurrent) {
      return {
        step: 4,
        title: '📸 4. Jepret Foto ke LKPD!',
        badge: 'Tahap 4 • Foto Riset',
        text: 'Fokus kristal 100% tercapai! Klik tombol [📸 Ambil Foto Preparat] di jendela okuler untuk dimasukkan ke LKPD.',
        highlightTarget: 'capture_photo_btn',
        isComplete: false,
        tip: 'Kumpulkan foto 5 preparat dan tuntaskan analisis konsep Mendel di menu [📋 LKPD]!'
      };
    }

    if (objectiveLens < 40) {
      return {
        step: 4,
        title: '🧬 4. Coba Perbesaran 40x (Ultrastruktur)',
        badge: 'Tahap 4 • Analisis Genetik',
        text: 'Foto tersimpan! Buka [📋 LKPD] untuk menjawab refleksi, atau klik [40x] pada Revolver untuk melihat detail kromosom!',
        highlightTarget: 'revolver_40x',
        isComplete: true,
        tip: 'PERINGATAN SOP: Saat di perbesaran 40x, HANYA gunakan Mikrometer halus!'
      };
    }

    return {
      step: 4,
      title: '🏆 4. Pengamatan 400x Selesai!',
      badge: 'Tahap 4 • Terverifikasi ✓',
      text: 'Luar biasa! Pengamatan ultrastruktur sel tuntas. Periksa LKPD di pojok atas untuk melengkapi laporan praktikummu!',
      highlightTarget: null,
      isComplete: true,
      tip: 'Ganti preparat lain di rak kiri untuk mengamati objek pewarisan sifat berikutnya.'
    };
  };

  const guidance = getFafaGuidance();

  if (!isOpen) return null;

  if (docked) {
    return (
      <div className="pt-2 border-t border-slate-800 flex flex-col gap-2 w-full text-left">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full border border-emerald-400 overflow-hidden bg-slate-950 shrink-0">
              <img 
                src="/assets/kak_fafa_sprite.png" 
                alt="Kak Fafa" 
                className="w-full h-full object-cover object-top" 
              />
            </div>
            <span className="text-[10px] font-pixel text-emerald-300 uppercase tracking-wide">
              Panduan Kak Fafa
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onReplayIntro && (
              <button
                onClick={() => { sound.playClick(); onReplayIntro(); }}
                className="text-[9px] font-pixel text-emerald-400 hover:text-emerald-300 transition cursor-pointer flex items-center gap-0.5"
                title="Tonton ulang cerita pengenalan Kak Fafa"
              >
                <span>🎬 Intro</span>
              </button>
            )}
            <button
              onClick={() => { sound.playClick(); onViewAllSop?.(); }}
              className="text-[9px] font-pixel text-amber-400 hover:text-amber-300 transition cursor-pointer flex items-center gap-0.5"
              title="Lihat teks panduan SOP lengkap"
            >
              <span>SOP</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Content Box */}
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-950 via-[#062419]/90 to-slate-950 border border-emerald-500/40 text-[10px] shadow-lg flex flex-col gap-1.5 relative overflow-hidden">
          {/* Step Pill & Status */}
          <div className="flex items-center justify-between gap-1 border-b border-emerald-500/20 pb-1">
            <span className="font-bold text-amber-300 font-pixel text-[9px] uppercase">
              {guidance.badge}
            </span>
            <span className={guidance.isComplete ? 'text-emerald-400 font-bold text-[9px]' : 'text-amber-400 text-[9px]'}>
              {guidance.isComplete ? 'Selesai ✓' : 'Sedang Aktif'}
            </span>
          </div>

          {/* Avatar + Dialogue Text */}
          <div className="flex items-start gap-2 pt-0.5">
            <div className="w-10 h-12 rounded-lg bg-slate-900 border border-emerald-400/50 overflow-hidden shrink-0 shadow-inner">
              <img 
                src="/assets/kak_fafa_sprite.png" 
                alt="Kak Fafa" 
                className="w-full h-full object-cover object-top" 
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold text-emerald-200 font-sans leading-tight">
                {guidance.title}
              </div>
              <div className="text-[9.5px] text-slate-300 leading-snug font-sans mt-0.5">
                {guidance.text}
              </div>
            </div>
          </div>

          {/* Contextual Tip */}
          {guidance.tip && (
            <div className="text-[8.5px] font-mono text-emerald-300/80 italic flex items-start gap-1 pt-1 border-t border-emerald-500/15">
              <Lightbulb className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
              <span>{guidance.tip}</span>
            </div>
          )}

          {/* Shortcut Action button if eyepiece needs to be opened */}
          {guidance.highlightTarget === 'eyepiece_lens' && !showEyepieceView && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenEyepiece?.();
              }}
              className="mt-1 w-full py-1 bg-sky-500/25 hover:bg-sky-500/40 text-sky-200 border border-sky-400/50 rounded-lg text-[9px] font-pixel flex items-center justify-center gap-1 cursor-pointer transition active:scale-95 animate-pulse"
            >
              <Eye className="w-3 h-3 text-sky-300" />
              <span>Buka Okuler Sekarang →</span>
            </button>
          )}

          {/* Quick Return to 3D Microscope for Mobile */}
          {onCloseRack && (
            <button
              onClick={() => {
                sound.playClick();
                onCloseRack();
              }}
              className="lg:hidden mt-1.5 w-full py-1.5 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-lg text-[9.5px] font-pixel flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition active:scale-95"
            >
              <span>🔬 Ke Meja Mikroskop 3D</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed sm:absolute bottom-3 left-3 sm:left-4 z-40 max-w-[calc(100vw-24px)] sm:max-w-md select-none pointer-events-auto transition-all duration-300">
      {isMinimized ? (
        /* MINIMIZED FLOATING BADGE (TIDAK MENGHALANGI LAYAR) */
        <button
          onClick={() => {
            sound.playClick();
            setIsMinimized(false);
          }}
          className="bg-emerald-950/95 hover:bg-emerald-900 border-2 border-emerald-400 text-white px-3 py-2 rounded-2xl shadow-2xl flex items-center gap-2.5 cursor-pointer transition hover:scale-105 active:scale-95 group backdrop-blur-md"
          title="Buka Panduan Kak Fafa"
        >
          <div className="w-8 h-8 rounded-full border border-emerald-400 overflow-hidden bg-slate-900 shrink-0">
            <img 
              src="/assets/kak_fafa_sprite.png" 
              alt="Kak Fafa" 
              className="w-full h-full object-cover object-top" 
            />
          </div>
          <div className="text-left">
            <div className="text-[10px] font-pixel text-emerald-300 uppercase flex items-center gap-1">
              <span>Bantuan Kak Fafa</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[9px] text-slate-300 font-mono truncate max-w-[150px]">
              {guidance.title}
            </div>
          </div>
          <Maximize2 className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition shrink-0 ml-1" />
        </button>
      ) : (
        /* FULL INTERACTIVE DIALOGUE BOX KAK FAFA */
        <div className="relative bg-gradient-to-br from-slate-900/98 via-[#062419]/95 to-slate-950/98 border-2 border-emerald-500/70 rounded-2xl p-3 sm:p-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.8)] backdrop-blur-md text-left flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          
          {/* Top Bar Header with Badge, Step Tracker & Controls */}
          <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-pixel px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 uppercase tracking-wider font-bold">
                {guidance.badge}
              </span>
              {guidance.isComplete && (
                <span className="text-[8px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-400/40 flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3 text-amber-400" />
                  <span>SOP Valid!</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  sound.playClick();
                  setIsMinimized(true);
                }}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                title="Kecilkan Panduan (Minimize)"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  onToggleOpen?.(false);
                }}
                className="p-1 hover:bg-rose-950/60 rounded-lg text-slate-400 hover:text-rose-300 transition cursor-pointer"
                title="Tutup Panduan Dialog"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Dialogue Core: Avatar + Speech Content */}
          <div className="flex items-start gap-2.5 sm:gap-3">
            {/* Kak Fafa Portrait Avatar with Gentle Floating Animation */}
            <div className="relative shrink-0 pt-0.5">
              <div className="w-13 h-15 sm:w-15 sm:h-18 rounded-xl bg-slate-950/80 border-2 border-emerald-400/60 overflow-hidden shadow-inner flex items-center justify-center relative">
                <img 
                  src="/assets/kak_fafa_sprite.png" 
                  alt="Kak Fafa" 
                  className="w-full h-full object-cover object-top drop-shadow-md hover:scale-105 transition-transform"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-0.5 rounded-full border border-white shadow">
                <Sparkles className="w-2.5 h-2.5" />
              </div>
            </div>

            {/* Speech Text & Instructions */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] sm:text-[11px] font-pixel font-black text-emerald-300 tracking-wide">
                  KAK FAFA
                </span>
                <span className="text-[8px] font-mono text-slate-400">
                  • Asisten Lab Sitogenetika
                </span>
              </div>

              {/* Step Sub-heading */}
              <div className="text-[11px] font-bold text-amber-300 font-sans leading-tight mb-1">
                {guidance.title}
              </div>

              {/* Dialogue Bubble Text */}
              <div className="text-[10.5px] sm:text-xs text-slate-200 font-sans leading-relaxed bg-slate-950/60 p-2 sm:p-2.5 rounded-xl border border-emerald-500/20 shadow-inner">
                {guidance.text}
              </div>

              {/* Contextual Tip Footer */}
              {guidance.tip && (
                <div className="mt-1.5 text-[9px] font-mono text-emerald-300/80 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="italic">{guidance.tip}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1 border-t border-emerald-500/20 text-[9px] font-mono text-slate-400">
            <span>💡 Praktikum Mandiri Siswa</span>
            {guidance.highlightTarget === 'eyepiece_lens' && !showEyepieceView && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenEyepiece?.();
                }}
                className="bg-sky-500/25 hover:bg-sky-500/40 text-sky-200 border border-sky-400/50 px-2 py-0.5 rounded-lg text-[9px] font-pixel flex items-center gap-1 cursor-pointer transition active:scale-95 animate-pulse"
              >
                <Eye className="w-3 h-3 text-sky-300" />
                <span>Buka Okuler Sekarang →</span>
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default KakFafaDialogueGuide;
