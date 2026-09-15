import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../services/sound';
import { FastForward, ChevronRight, Sparkles, Volume2, VolumeX } from 'lucide-react';

const DIALOGUES = [
  {
    speaker: 'Kak Nisa',
    badge: 'Mentor Riset Genetika',
    text: 'Halo, calon Peneliti Muda! Selamat datang di Markas Besar Riset Genetika & Laboratorium Persilangan Ercis.',
    emotion: 'happy',
    audio: '/audio/voice/dialogue_1.mp3',
    typingDuration: 7500 // Selesai mulus tepat di 7.5 detik (sinkron dengan suara 9 detik)
  },
  {
    speaker: 'Kak Nisa',
    badge: 'Mentor Riset Genetika',
    text: 'Di media pembelajaran interaktif "Genetic Odyssey" ini, kamu akan diajak berpetualang menyingkap misteri pewarisan sifat makhluk hidup yang pertama kali ditemukan oleh Gregor Mendel.',
    emotion: 'excited',
    audio: '/audio/voice/dialogue_2.ogg',
    typingDuration: 10000 // 10 detik
  },
  {
    speaker: 'Kak Nisa',
    badge: 'Mentor Riset Genetika',
    text: 'Kamu akan mempelajari Hukum I Mendel (Segregasi Bebas), Hukum II Mendel (Asortasi Bebas), persilangan Monohibrid, Dihibrid, papan catur Punnett, hingga ragam penyimpangan semu dan aplikasinya di dunia nyata!',
    emotion: 'explaining',
    audio: '/audio/voice/dialogue_3.ogg',
    typingDuration: 13000 // 13 detik
  },
  {
    speaker: 'Kak Nisa',
    badge: 'Mentor Riset Genetika',
    text: 'Jelajahi 8 Stage Petualangan, pelajari materi lengkap di Genopedia, diskusikan pertanyaanmu dengan AI BioBot Companion, dan uji kecerdasanmu di Kuis Evaluasi HOTS.',
    emotion: 'happy',
    audio: '/audio/voice/dialogue_4.ogg',
    typingDuration: 11000 // 11 detik
  },
  {
    speaker: 'Kak Nisa',
    badge: 'Mentor Riset Genetika',
    text: 'Apakah kamu sudah siap membantu Mendel memecahkan teka-teki genetika? Ayo kita mulai perjalanan luar biasa ini sekarang!',
    emotion: 'excited',
    audio: '/audio/voice/dialogue_5.ogg',
    typingDuration: 7000 // 7 detik
  }
];

export const IntroVisualNovel = () => {
  const { navigateTo, soundOn, toggleSound, isLandscapeMobile } = useGame();
  const [currentStep, setCurrentStep] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  const typingTimerRef = useRef(null);
  const charIndexRef = useRef(0);
  const currentStepRef = useRef(0);
  currentStepRef.current = currentStep;
  const isTypingRef = useRef(true);
  isTypingRef.current = isTyping;
  const voiceAudioRef = useRef(null);
  const unlockGestureListenerRef = useRef(null);

  const currentDialogue = DIALOGUES[currentStep];

  // Stop voice cleanly without asynchronous muting bugs
  const stopVoice = useCallback(() => {
    if (unlockGestureListenerRef.current) {
      window.removeEventListener('pointerdown', unlockGestureListenerRef.current);
      window.removeEventListener('keydown', unlockGestureListenerRef.current);
      unlockGestureListenerRef.current = null;
    }
    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
      voiceAudioRef.current.currentTime = 0;
      setIsPlayingVoice(false);
    }
    sound.unduckBgm(); // Kembalikan backsound ke 50% saat suara bicara berhenti
  }, []);

  // Play voice cleanly and reliably as soon as dialogue appears
  const playVoice = useCallback((stepIndex) => {
    if (!soundOn) {
      stopVoice();
      return;
    }

    const dialogue = DIALOGUES[stepIndex];
    if (!dialogue?.audio) {
      stopVoice();
      return;
    }

    try {
      if (!voiceAudioRef.current) {
        voiceAudioRef.current = new Audio();
      }
      const audio = voiceAudioRef.current;
      audio.pause();
      audio.src = dialogue.audio;
      audio.currentTime = 0;
      audio.volume = 1.0;

      audio.onplay = () => {
        setIsPlayingVoice(true);
        sound.duckBgm(); // Kecilkan backsound ke 30% saat karakter bicara
      };
      audio.onended = () => {
        setIsPlayingVoice(false);
        sound.unduckBgm(); // Kembalikan backsound ke 50% saat karakter selesai bicara
      };
      audio.onerror = () => {
        setIsPlayingVoice(false);
        sound.unduckBgm();
      };

      const promise = audio.play();
      if (promise !== undefined) {
        promise.then(() => {
          setIsPlayingVoice(true);
          sound.duckBgm();
        }).catch((err) => {
          setIsPlayingVoice(false);
          sound.unduckBgm();
          // Browser blocks autoplay if no user gesture yet on fresh page load:
          if (err.name === 'NotAllowedError') {
            const onGesture = () => {
              unlockGestureListenerRef.current = null;
              if (currentStepRef.current === stepIndex && soundOn && isTypingRef.current) {
                audio.play().then(() => {
                  setIsPlayingVoice(true);
                  sound.duckBgm();
                }).catch(() => {});
              }
              window.removeEventListener('pointerdown', onGesture);
              window.removeEventListener('keydown', onGesture);
            };
            unlockGestureListenerRef.current = onGesture;
            window.addEventListener('pointerdown', onGesture, { once: true });
            window.addEventListener('keydown', onGesture, { once: true });
          }
        });
      }
    } catch (err) {
      // Safe fallback
      sound.unduckBgm();
    }
  }, [soundOn, stopVoice]);

  // Play voice whenever currentStep changes or sound toggles
  useEffect(() => {
    if (soundOn) {
      playVoice(currentStep);
    } else {
      stopVoice();
    }
  }, [currentStep, soundOn, playVoice, stopVoice]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopVoice();
      sound.unduckBgm();
    };
  }, [stopVoice]);

  // Silky-smooth Typewriter effect (18ms high-frequency stream)
  useEffect(() => {
    const fullText = DIALOGUES[currentStep].text;
    const duration = DIALOGUES[currentStep]?.typingDuration || (fullText.length * 52);
    const startTime = performance.now();

    setCharIndex(0);
    charIndexRef.current = 0;
    setIsTyping(true);

    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }

    typingTimerRef.current = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      const targetChars = Math.floor(progress * fullText.length);

      if (targetChars > charIndexRef.current && targetChars % 2 === 0) {
        const ch = fullText[targetChars - 1];
        if (ch && ch.trim() !== '') {
          sound.playDialogueBlip('npc');
        }
      }

      charIndexRef.current = targetChars;
      setCharIndex(targetChars);

      if (progress >= 1 || targetChars >= fullText.length) {
        setIsTyping(false);
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    }, 18);

    return () => {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    };
  }, [currentStep]);

  const handleFinish = useCallback(() => {
    stopVoice();
    sound.playFanfare();
    localStorage.setItem('has_seen_intro_v2', 'true');
    navigateTo('main-menu');
  }, [navigateTo, stopVoice]);

  const handleNext = useCallback(() => {
    const step = currentStepRef.current;
    const fullText = DIALOGUES[step].text;

    // JIKA TEKS MASIH BERJALAN: Langsung selesaikan seluruh teks DAN langsung hentikan suara (tidak ngplay ulang)!
    if (charIndexRef.current < fullText.length) {
      sound.playClick();
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
      charIndexRef.current = fullText.length;
      setCharIndex(fullText.length);
      setIsTyping(false);
      
      // Hentikan suara seketika agar tidak terus bersuara atau terulang
      stopVoice();
      return;
    }

    // JIKA TEKS SUDAH SELESAI: Klik berikutnya baru pindah ke teks selanjutnya!
    sound.playClick();
    if (step < DIALOGUES.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinish();
    }
  }, [handleFinish, stopVoice]);

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
  }, [handleNext]);

  return (
    <div 
      onClick={handleNext}
      className="relative w-full h-screen min-h-screen overflow-hidden select-none bg-black flex flex-col justify-between cursor-pointer"
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
      <div className={`relative z-30 w-full ${isLandscapeMobile ? 'p-2' : 'p-4 sm:p-6'} flex items-center justify-between pointer-events-auto`}>
        {/* Left: Branding Tag */}
        <div className={`inline-flex items-center gap-1.5 ${isLandscapeMobile ? 'px-2 py-0.5' : 'px-3 py-1'} bg-[#1b4324]/90 border-2 border-[#4ade80] rounded-full shadow-md backdrop-blur-xs`}>
          <Sparkles className={`${isLandscapeMobile ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-[#facc15] animate-pulse`} />
          <span className={`font-pixel ${isLandscapeMobile ? 'text-[7px]' : 'text-[8px] sm:text-[9px]'} text-[#f0fdf4] uppercase tracking-wider font-bold`}>
            Pengenalan Genetic Odyssey
          </span>
        </div>

        {/* Right: Sound & Red Skip Button Matching Reference */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); toggleSound(); }}
            className={`${isLandscapeMobile ? 'p-1.5' : 'p-2'} bg-[#1b4324]/90 hover:bg-[#23582f] border-2 border-[#4ade80] rounded-lg text-white shadow-md cursor-pointer active:translate-y-0.5`}
            title="Toggle Audio"
          >
            {soundOn ? <Volume2 className={`${isLandscapeMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-[#4ade80]`} /> : <VolumeX className={`${isLandscapeMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-rose-400`} />}
          </button>

          {/* Red Skip Button with White Border (Matching Screenshot) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFinish();
            }}
            className={`flex items-center gap-1.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white border-2 border-white ${isLandscapeMobile ? 'px-2.5 py-1 text-[8px]' : 'px-3.5 py-1.5 text-[9px] sm:text-xs'} rounded-lg shadow-[0_4px_10px_rgba(220,38,38,0.5)] font-pixel tracking-wider uppercase transition-all cursor-pointer active:translate-y-0.5`}
          >
            <span>Lewati</span>
            <FastForward className={`${isLandscapeMobile ? 'w-3 h-3' : 'w-3.5 h-3.5'} fill-white stroke-none`} />
          </button>
        </div>
      </div>

      {/* 3. Center Character Sprite (Anchored seamlessly behind the larger text box, centered in upper viewport) */}
      <div className={`absolute ${isLandscapeMobile ? 'bottom-[105px]' : 'bottom-[170px] sm:bottom-[205px] md:bottom-[230px]'} left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-end justify-center`}>
        <div className={`relative ${isLandscapeMobile ? 'w-[150px] max-h-[35vh]' : 'w-[240px] sm:w-[295px] md:w-[350px] max-h-[52vh]'} flex items-end justify-center animate-fade-in ${isLandscapeMobile ? '-mb-3' : '-mb-6 sm:-mb-10'}`}>
          <img
            src="/assets/kak_nisa_sprite.png?v=2"
            alt="Kak Nisa"
            className="w-full h-auto object-contain image-pixelated drop-shadow-[0_10px_18px_rgba(0,0,0,0.65)] animate-gentle-bob"
          />
        </div>
      </div>

      {/* 4. Larger Bottom Dialogue Box (Spacious, high-legibility Visual Novel Box) */}
      <div className={`relative z-30 w-full ${isLandscapeMobile ? 'p-1.5' : 'p-3 sm:p-5 md:p-6'} pointer-events-auto`}>
        <div className={`relative max-w-5xl mx-auto bg-[#175225]/95 sm:bg-[#195a28]/95 border-t-4 border-[#3ca956] rounded-t-2xl sm:rounded-2xl ${isLandscapeMobile ? 'p-3 pt-3.5' : 'p-5 sm:p-7 md:p-8'} shadow-[0_-10px_25px_rgba(0,0,0,0.65)] backdrop-blur-xs text-left`}>
          
          {/* Name Tag Pill Badge (Top-Left of Box) */}
          <div className={`absolute ${isLandscapeMobile ? '-top-3.5 left-4' : '-top-5 left-5 sm:left-8'}`}>
            <div className={`bg-[#dcfce7] border-2 border-[#15803d] ${isLandscapeMobile ? 'px-2.5 py-0.5' : 'px-4 py-1.5'} rounded-xl shadow-md flex items-center gap-1.5`}>
              <span className={`font-pixel ${isLandscapeMobile ? 'text-[8px]' : 'text-[10px] sm:text-xs md:text-sm'} font-black text-[#14532d] uppercase tracking-wide`}>
                {currentDialogue.speaker}
              </span>
              {/* Voice Indicator / Replay Button */}
              {currentDialogue.audio && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playVoice(currentStep);
                  }}
                  className="hover:scale-110 active:scale-95 transition cursor-pointer text-[#15803d] flex items-center gap-1 pl-1 border-l border-[#15803d]/30"
                  title="Putar Ulang Suara"
                >
                  <Volume2 className={`${isLandscapeMobile ? 'w-3 h-3' : 'w-3.5 h-3.5'} ${isPlayingVoice ? 'text-[#16a34a] animate-pulse' : 'text-[#15803d]/70'}`} />
                  <span className="text-[8px] font-sans font-bold text-[#15803d] hidden sm:inline">
                    {isPlayingVoice ? 'Bicara...' : 'Putar'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Dialogue Text Content (Pre-rendered layout prevents word jumping / line reflow jitter) */}
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

          {/* Bottom Footer Indicators */}
          <div className={`${isLandscapeMobile ? 'mt-1.5 pt-1 text-[8px]' : 'mt-3 pt-2.5 text-[9px] sm:text-[11px]'} border-t border-[#3ca956]/40 flex items-center justify-between text-[#bbf7d0] font-sans`}>
            <div className="flex items-center gap-2">
              <span className={`font-pixel ${isLandscapeMobile ? 'text-[7px] px-1.5 py-0.5' : 'text-[8px] sm:text-[9px] px-2.5 py-1'} bg-[#14532d] rounded-md text-[#86efac] border border-[#22c55e] font-bold`}>
                {currentStep + 1} / {DIALOGUES.length}
              </span>
              <span className="hidden sm:inline opacity-90">Tekan Spasi atau Klik untuk lanjut</span>
            </div>

            <div className={`flex items-center gap-1 text-[#facc15] font-pixel ${isLandscapeMobile ? 'text-[8px]' : 'text-[9px] sm:text-xs'} animate-bounce font-bold`}>
              <span>{currentStep === DIALOGUES.length - 1 ? 'Mulai Petualangan' : 'Klik untuk lanjut'}</span>
              <ChevronRight className={`${isLandscapeMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} stroke-[3px]`} />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default IntroVisualNovel;
