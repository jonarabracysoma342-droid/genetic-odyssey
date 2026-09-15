import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../services/sound';
import { FastForward, Volume2, VolumeX, Play, RotateCcw } from 'lucide-react';

export const IntroCutsceneVideo = ({ onFinish }) => {
  const { navigateTo, soundOn, toggleSound, isLandscapeMobile } = useGame();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [progress, setProgress] = useState(0);

  const videoSrc = '/videos/intro_cutscene.mp4';

  const handleComplete = useCallback(() => {
    sound.playFanfare();
    try {
      localStorage.setItem('has_seen_intro_video', 'true');
    } catch (e) {}

    if (onFinish) {
      onFinish();
    } else {
      // Masuk langsung ke Petualangan RPG Kebun Biara 1865
      navigateTo('rpg-world');
    }
  }, [onFinish, navigateTo]);

  // Handle Autoplay & Unmute handling
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !soundOn;
    video.playsInline = true;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          sound.duckBgm();
        })
        .catch(() => {
          // Autoplay with audio was prevented, fallback to muted play with unmute gesture
          video.muted = true;
          video.play().then(() => {
            setIsPlaying(true);
          }).catch(() => {
            setIsPlaying(false);
          });
        });
    }

    return () => {
      sound.unduckBgm();
    };
  }, [soundOn]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && video.duration) {
      setProgress((video.currentTime / video.duration) * 100);
    }
  };

  const handleVideoEnded = () => {
    setVideoEnded(true);
    handleComplete();
  };

  const handleManualPlay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !soundOn;
    video.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    toggleSound();
    if (videoRef.current) {
      videoRef.current.muted = soundOn; // will toggle
    }
  };

  const handleSkip = (e) => {
    e.stopPropagation();
    sound.playClick();
    if (videoRef.current) {
      videoRef.current.pause();
    }
    handleComplete();
  };

  return (
    <div className="fixed inset-0 z-50 w-full h-full bg-black flex flex-col items-center justify-center select-none overflow-hidden text-white">
      {/* 1. Main HTML5 Video Player */}
      {!videoError ? (
        <video
          ref={videoRef}
          src={videoSrc}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnded}
          onError={() => setVideoError(true)}
          className="w-full h-full object-contain cursor-pointer"
          onClick={() => {
            if (videoRef.current) {
              if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPlaying(true);
              } else {
                videoRef.current.pause();
                setIsPlaying(false);
              }
            }
          }}
        />
      ) : (
        /* Fallback if video fails to decode */
        <div className="text-center p-6 space-y-3 bg-[#1e1b4b] border-2 border-indigo-500 rounded-2xl max-w-md">
          <p className="font-pixel text-xs text-amber-300">Format video tidak didukung atau sedang dimuat...</p>
          <button
            onClick={handleComplete}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-pixel text-xs font-bold uppercase cursor-pointer"
          >
            Masuk ke Kebun RPG ➜
          </button>
        </div>
      )}

      {/* 2. Top Header Bar (Controls Overlay) */}
      <div className={`absolute top-0 inset-x-0 z-20 ${isLandscapeMobile ? 'p-2' : 'p-4 sm:p-6'} flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto`}>
        {/* Left: Tag Badge */}
        <div className={`inline-flex items-center gap-1.5 ${isLandscapeMobile ? 'px-2 py-0.5' : 'px-3 py-1'} bg-[#175225]/90 border-2 border-[#4ade80] rounded-full shadow-md backdrop-blur-xs`}>
          <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
          <span className={`font-pixel ${isLandscapeMobile ? 'text-[7.5px]' : 'text-[8.5px] sm:text-[9.5px]'} text-[#f0fdf4] uppercase tracking-wider font-bold`}>
            Prolog RPG: Terlempar ke 1865
          </span>
        </div>

        {/* Right: Audio Toggle & Skip Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className={`${isLandscapeMobile ? 'p-1.5' : 'p-2'} bg-[#1b4324]/90 hover:bg-[#23582f] border-2 border-[#4ade80] rounded-lg text-white shadow-md cursor-pointer active:translate-y-0.5`}
            title={soundOn ? 'Matikan Suara' : 'Nyalakan Suara'}
          >
            {soundOn ? (
              <Volume2 className={`${isLandscapeMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-[#4ade80]`} />
            ) : (
              <VolumeX className={`${isLandscapeMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-rose-400`} />
            )}
          </button>

          {/* Red Skip Button */}
          <button
            onClick={handleSkip}
            className={`flex items-center gap-1.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white border-2 border-white ${
              isLandscapeMobile ? 'px-2.5 py-1 text-[8px]' : 'px-3.5 py-1.5 text-[9.5px] sm:text-xs'
            } rounded-lg shadow-[0_4px_10px_rgba(220,38,38,0.5)] font-pixel tracking-wider uppercase transition-all cursor-pointer active:translate-y-0.5`}
          >
            <span>Lewati</span>
            <FastForward className={`${isLandscapeMobile ? 'w-3 h-3' : 'w-3.5 h-3.5'} fill-white stroke-none`} />
          </button>
        </div>
      </div>

      {/* 3. Center Play Button if Paused / Blocked by browser gesture */}
      {!isPlaying && !videoEnded && !videoError && (
        <button
          onClick={handleManualPlay}
          className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-600/90 hover:bg-emerald-500 border-4 border-white text-white flex items-center justify-center shadow-2xl z-30 cursor-pointer active:scale-95 transition-transform"
        >
          <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white ml-1" />
        </button>
      )}

      {/* 4. Bottom Progress Bar */}
      <div className="absolute bottom-0 inset-x-0 z-20 w-full h-1.5 bg-black/60">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-[#4ade80] transition-all duration-150 ease-linear shadow-[0_0_8px_rgba(74,222,128,0.8)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default IntroCutsceneVideo;
