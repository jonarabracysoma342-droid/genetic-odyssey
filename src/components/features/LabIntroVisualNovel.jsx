import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../services/sound';
import { FastForward, ChevronRight, Sparkles, Volume2, VolumeX } from 'lucide-react';

const FAFA_LAB_DIALOGUES = [
  {
    speaker: 'Kak Fafa',
    badge: 'Laboran & Mentor Sitogenetika',
    text: 'Halo, calon Peneliti Muda! Selamat datang di Laboratorium Mikroskop Sitogenetika 3D. Aku Kak Fafa, mentor riset yang akan mendampingi praktikum pengamatan genetika sel kamu hari ini!',
    audio: '/audio/voice/fafa_intro_1.mp3',
    typingDuration: 5500
  },
  {
    speaker: 'Kak Fafa',
    badge: 'Eksplorasi Spesimen Genetika',
    text: 'Di laboratorium ini kita akan mengamati langsung bukti pewarisan sifat Mendel pada berbagai preparat sel. Semua panduan SOP dan prosedur praktikum akan kupandu langsung langkah demi langkah saat kita mulai di meja mikroskop. Sudah siap? Yuk kita mulai!',
    audio: '/audio/voice/fafa_intro_2.mp3',
    typingDuration: 6500
  }
];

export const LabIntroVisualNovel = ({ onFinish }) => {
  const { soundOn, toggleSound, isLandscapeMobile } = useGame();
  const [currentStep, setCurrentStep] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  const typingTimerRef = useRef(null);
  const charIndexRef = useRef(0);
  const currentAudioRef = useRef(null);
  const audioTokenRef = useRef(0);
  const hasFinishedRef = useRef(false);

  const currentDialogue = FAFA_LAB_DIALOGUES[currentStep];

  // Stop voice cleanly, detach all listeners, and cancel pending play requests
  const stopVoice = () => {
    audioTokenRef.current++;
    if (currentAudioRef.current) {
      const a = currentAudioRef.current;
      currentAudioRef.current = null;
      a.onplay = null;
      a.onended = null;
      a.onerror = null;
      try {
        a.pause();
        a.currentTime = 0;
        a.removeAttribute('src');
        a.load();
      } catch (e) {}
    }
    setIsPlayingVoice(false);
    try {
      sound.unduckBgm();
    } catch (e) {}
  };

  const handleFinish = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;

    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    stopVoice();
    try {
      sound.playFanfare();
    } catch (e) {}
    onFinish?.();
  };

  // Play voice strictly for the given step with token validation
  const playVoice = (stepIndex) => {
    stopVoice();
    if (hasFinishedRef.current || !soundOn) return;

    const dialogue = FAFA_LAB_DIALOGUES[stepIndex];
    if (!dialogue?.audio) return;

    const token = ++audioTokenRef.current;
    const audio = new Audio(dialogue.audio);
    audio.loop = false;
    currentAudioRef.current = audio;

    audio.onplay = () => {
      if (audioTokenRef.current !== token) {
        try { audio.pause(); } catch (e) {}
        return;
      }
      setIsPlayingVoice(true);
      try { sound.duckBgm(); } catch (e) {}
    };

    audio.onended = () => {
      if (audioTokenRef.current !== token) return;
      setIsPlayingVoice(false);
      try { sound.unduckBgm(); } catch (e) {}
    };

    audio.onerror = () => {
      if (audioTokenRef.current !== token) return;
      setIsPlayingVoice(false);
      try { sound.unduckBgm(); } catch (e) {}
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        if (audioTokenRef.current === token) {
          setIsPlayingVoice(false);
        }
      });
    }
  };

  // Sound toggle button handler
  const handleToggleSound = (e) => {
    e.stopPropagation();
    toggleSound();
    if (soundOn) {
      stopVoice();
    } else {
      playVoice(currentStep);
    }
  };

  // Typewriter effect & Audio: triggers ONLY when currentStep changes
  useEffect(() => {
    if (hasFinishedRef.current) return;

    const fullText = FAFA_LAB_DIALOGUES[currentStep].text;
    const duration = FAFA_LAB_DIALOGUES[currentStep]?.typingDuration || (fullText.length * 45);
    const startTime = performance.now();

    setCharIndex(0);
    charIndexRef.current = 0;
    setIsTyping(true);

    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }

    // Play voice strictly for currentStep
    playVoice(currentStep);

    typingTimerRef.current = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      const targetChars = Math.floor(progress * fullText.length);

      charIndexRef.current = targetChars;
      setCharIndex(targetChars);

      if (progress >= 1 || targetChars >= fullText.length) {
        setIsTyping(false);
        if (typingTimerRef.current) {
          clearInterval(typingTimerRef.current);
          typingTimerRef.current = null;
        }
      }
    }, 18);

    return () => {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
      stopVoice();
    };
  }, [currentStep]);

  // Handle user progression (clicking anywhere or pressing Next)
  const handleNext = (e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    if (hasFinishedRef.current) return;

    const fullText = FAFA_LAB_DIALOGUES[currentStep]?.text || '';

    // Click 1: if still typing, immediately complete the text
    if (charIndexRef.current < fullText.length) {
      try { sound.playClick(); } catch (e) {}
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
      charIndexRef.current = fullText.length;
      setCharIndex(fullText.length);
      setIsTyping(false);
      return;
    }

    // Click 2: text is fully read, move to next step or finish
    try { sound.playClick(); } catch (e) {}
    stopVoice();

    if (currentStep < FAFA_LAB_DIALOGUES.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  // Keyboard navigation (Space / Enter)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep]);

  return (
    <div 
      onClick={handleNext}
      className="relative w-full h-screen min-h-screen overflow-hidden select-none bg-black flex flex-col justify-between cursor-pointer animate-in fade-in duration-300"
    >
      {/* 1. Fullscreen Detailed Pixel Lab Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <img
          src="/assets/vn_genetics_lab_bg.jpg"
          alt="Genetics Lab Background"
          className="w-full h-full object-cover object-center image-pixelated transform scale-[1.01]"
        />
        {/* Subtle Ambient Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.35)_100%)] pointer-events-none" />
      </div>

      {/* 2. Top Header Controls (Skip Button & Sound Toggle) */}
      <div className={`relative z-30 w-full ${isLandscapeMobile ? 'p-2' : 'p-3 sm:p-5 md:p-6'} flex items-center justify-between pointer-events-auto`}>
        {/* Left: Branding Tag */}
        <div className={`inline-flex items-center gap-1.5 ${isLandscapeMobile ? 'px-2 py-0.5' : 'px-3 py-1'} bg-[#1b4324]/90 border-2 border-[#4ade80] rounded-full shadow-md backdrop-blur-xs`}>
          <Sparkles className={`${isLandscapeMobile ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-[#facc15] animate-pulse`} />
          <span className={`font-pixel ${isLandscapeMobile ? 'text-[7px]' : 'text-[8px] sm:text-[9px]'} text-[#f0fdf4] uppercase tracking-wider font-bold`}>
            Laboratorium Sitogenetika 3D • Kak Fafa
          </span>
        </div>

        {/* Right: Sound & Red Skip Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSound}
            className={`${isLandscapeMobile ? 'p-1.5' : 'p-2'} bg-[#1b4324]/90 hover:bg-[#23582f] border-2 border-[#4ade80] rounded-lg text-white shadow-md cursor-pointer active:translate-y-0.5`}
            title="Toggle Audio"
          >
            {soundOn ? <Volume2 className={`${isLandscapeMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-[#4ade80]`} /> : <VolumeX className={`${isLandscapeMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-rose-400`} />}
          </button>

          {/* Red Skip Button with White Border */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFinish();
            }}
            className={`flex items-center gap-1.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white border-2 border-white ${isLandscapeMobile ? 'px-2.5 py-1 text-[8px]' : 'px-3.5 py-1.5 text-[9px] sm:text-xs'} rounded-lg shadow-[0_4px_10px_rgba(220,38,38,0.5)] font-pixel tracking-wider uppercase transition-all cursor-pointer active:translate-y-0.5`}
          >
            <span>LEWATI</span>
            <FastForward className={`${isLandscapeMobile ? 'w-3 h-3' : 'w-3.5 h-3.5'} fill-white stroke-none`} />
          </button>
        </div>
      </div>

      {/* 3. Center Character Sprite (Kak Fafa) */}
      <div className={`absolute ${isLandscapeMobile ? 'bottom-[105px]' : 'bottom-[170px] sm:bottom-[205px] md:bottom-[230px]'} left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-end justify-center`}>
        <div className={`relative ${isLandscapeMobile ? 'w-[150px] max-h-[35vh]' : 'w-[230px] sm:w-[285px] md:w-[340px] max-h-[52vh]'} flex items-end justify-center animate-fade-in ${isLandscapeMobile ? '-mb-3' : '-mb-6 sm:-mb-10'}`}>
          <img
            src="/assets/kak_fafa_sprite.png"
            alt="Kak Fafa"
            className="w-full h-auto object-contain image-pixelated drop-shadow-[0_10px_18px_rgba(0,0,0,0.65)] animate-gentle-bob"
          />
        </div>
      </div>

      {/* 4. Bottom Dialogue Box (Matching Green Retro Box) */}
      <div className={`relative z-30 w-full ${isLandscapeMobile ? 'p-1.5' : 'p-3 sm:p-5 md:p-6'} pointer-events-auto`}>
        <div className={`relative max-w-5xl mx-auto bg-[#175225]/95 sm:bg-[#195a28]/95 border-t-4 border-[#3ca956] rounded-t-2xl sm:rounded-2xl ${isLandscapeMobile ? 'p-3 pt-3.5' : 'p-5 sm:p-7 md:p-8'} shadow-[0_-10px_25px_rgba(0,0,0,0.65)] backdrop-blur-xs text-left`}>
          
          {/* Name Tag Pill Badge */}
          <div className={`absolute ${isLandscapeMobile ? '-top-3.5 left-4' : '-top-5 left-5 sm:left-8'}`}>
            <div className={`bg-[#dcfce7] border-2 border-[#15803d] ${isLandscapeMobile ? 'px-2.5 py-0.5' : 'px-4 py-1.5'} rounded-xl shadow-md flex items-center gap-1.5`}>
              <span className={`font-pixel ${isLandscapeMobile ? 'text-[8px]' : 'text-[10px] sm:text-xs md:text-sm'} font-black text-[#14532d] uppercase tracking-wide`}>
                {currentDialogue.speaker}
              </span>
              <div className="flex items-center gap-1 pl-1.5 border-l border-[#15803d]/30 text-[#15803d]">
                <Volume2 className={`${isLandscapeMobile ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-[#16a34a] ${isPlayingVoice ? 'animate-bounce text-emerald-600' : 'animate-pulse'}`} />
                <span className="text-[8px] font-sans font-bold text-[#15803d] hidden sm:inline">
                  {isPlayingVoice ? 'Bicara...' : 'Selesai'}
                </span>
              </div>
            </div>
          </div>

          {/* Dialogue Text Content with Blinking Cursor */}
          <div className={`pt-1 ${isLandscapeMobile ? 'min-h-[48px]' : 'min-h-[90px] sm:min-h-[110px] md:min-h-[120px]'} flex items-start`}>
            <p className={`text-white ${isLandscapeMobile ? 'text-xs leading-snug' : 'text-sm sm:text-base md:text-lg leading-relaxed sm:leading-loose'} font-medium font-sans drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]`}>
              <span>{currentDialogue.text.slice(0, charIndex)}</span>
              {isTyping && (
                <span className="inline-block w-2 h-4 bg-[#4ade80] ml-1 animate-pulse align-middle" />
              )}
              {/* Invisible pre-rendered tail locks line-wrapping completely */}
              <span className="opacity-0 select-none pointer-events-none">
                {currentDialogue.text.slice(charIndex)}
              </span>
            </p>
          </div>

          {/* Bottom Footer Indicators & Explicit Action Buttons */}
          <div className={`${isLandscapeMobile ? 'mt-1.5 pt-1 text-[8px]' : 'mt-3 pt-2.5 text-[9px] sm:text-[11px]'} border-t border-[#3ca956]/40 flex items-center justify-between text-[#bbf7d0] font-sans`}>
            <div className="flex items-center gap-2">
              <span className={`font-pixel ${isLandscapeMobile ? 'text-[7px] px-1.5 py-0.5' : 'text-[8px] sm:text-[9px] px-2.5 py-1'} bg-[#14532d] rounded-md text-[#86efac] border border-[#22c55e] font-bold`}>
                {currentStep + 1} / {FAFA_LAB_DIALOGUES.length}
              </span>
              <span className="hidden sm:inline opacity-90">Tekan Spasi atau Klik untuk lanjut</span>
            </div>

            <div>
              {currentStep === FAFA_LAB_DIALOGUES.length - 1 ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFinish();
                  }}
                  className={`flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-pixel ${isLandscapeMobile ? 'text-[8px] px-2.5 py-1' : 'text-[10px] sm:text-xs px-4 py-2'} rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.6)] border-2 border-emerald-300 animate-pulse cursor-pointer active:scale-95 transition-all font-bold`}
                >
                  <span>Mulai Praktikum 🔬</span>
                  <ChevronRight className={`${isLandscapeMobile ? 'w-3 h-3' : 'w-4 h-4'} stroke-[3px]`} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext(e);
                  }}
                  className={`flex items-center gap-1 sm:gap-1.5 bg-[#ca7c38] hover:bg-[#d98236] text-slate-950 font-pixel ${isLandscapeMobile ? 'text-[8px] px-2 py-1' : 'text-[9px] sm:text-xs px-3.5 py-1.5'} rounded-lg border border-amber-300 shadow-sm cursor-pointer active:scale-95 transition-all font-bold`}
                >
                  <span>Lanjutkan</span>
                  <ChevronRight className={`${isLandscapeMobile ? 'w-3 h-3' : 'w-3.5 h-3.5'} stroke-[3px]`} />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LabIntroVisualNovel;
