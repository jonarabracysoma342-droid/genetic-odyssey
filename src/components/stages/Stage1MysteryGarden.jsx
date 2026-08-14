import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { STAGES } from '../../data/geneticsData';
import { sound } from '../../services/sound';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Sparkles, 
  Star,
  ChevronLeft,
  Heart
} from 'lucide-react';

const PLANT_CARDS = [
  { 
    id: 'p1', 
    name: 'Tanaman A', 
    flowerColor: 'Ungu', 
    seedShape: 'Bulat', 
    podColor: 'Hijau', 
    image: '/assets/pixel_plant_a.svg', 
    imageBg: 'from-purple-100 via-indigo-50 to-blue-100',
    flowerBadgeBg: 'bg-purple-600 text-white',
    seedBadgeBg: 'bg-emerald-600 text-white',
    podBadgeBg: 'bg-green-600 text-white'
  },
  { 
    id: 'p2', 
    name: 'Tanaman B', 
    flowerColor: 'Ungu', 
    seedShape: 'Bulat', 
    podColor: 'Hijau', 
    image: '/assets/pixel_plant_c.svg', 
    imageBg: 'from-purple-100 via-fuchsia-50 to-emerald-100',
    flowerBadgeBg: 'bg-purple-600 text-white',
    seedBadgeBg: 'bg-emerald-600 text-white',
    podBadgeBg: 'bg-green-600 text-white'
  },
  { 
    id: 'p3', 
    name: 'Tanaman C', 
    flowerColor: 'Ungu', 
    seedShape: 'Bulat', 
    podColor: 'Hijau', 
    image: '/assets/pixel_plant_a.svg', 
    imageBg: 'from-purple-100 via-indigo-50 to-blue-100',
    flowerBadgeBg: 'bg-purple-600 text-white',
    seedBadgeBg: 'bg-emerald-600 text-white',
    podBadgeBg: 'bg-green-600 text-white'
  },
  { 
    id: 'p4', 
    name: 'Tanaman D', 
    flowerColor: 'Ungu', 
    seedShape: 'Bulat', 
    podColor: 'Hijau', 
    image: '/assets/pixel_plant_c.svg', 
    imageBg: 'from-purple-100 via-fuchsia-50 to-emerald-100',
    flowerBadgeBg: 'bg-purple-600 text-white',
    seedBadgeBg: 'bg-emerald-600 text-white',
    podBadgeBg: 'bg-green-600 text-white'
  },
  { 
    id: 'p5', 
    name: 'Tanaman E', 
    flowerColor: 'Ungu', 
    seedShape: 'Keriput', 
    podColor: 'Kuning', 
    image: '/assets/pixel_plant_e.svg', 
    imageBg: 'from-purple-100 via-amber-50 to-yellow-100',
    flowerBadgeBg: 'bg-purple-600 text-white',
    seedBadgeBg: 'bg-amber-700 text-white',
    podBadgeBg: 'bg-amber-500 text-white'
  },
  { 
    id: 'p6', 
    name: 'Tanaman F', 
    flowerColor: 'Ungu', 
    seedShape: 'Keriput', 
    podColor: 'Hijau', 
    image: '/assets/pixel_plant_c.svg', 
    imageBg: 'from-purple-100 via-fuchsia-50 to-emerald-100',
    flowerBadgeBg: 'bg-purple-600 text-white',
    seedBadgeBg: 'bg-amber-700 text-white',
    podBadgeBg: 'bg-green-600 text-white'
  },
  { 
    id: 'p7', 
    name: 'Tanaman G', 
    flowerColor: 'Putih', 
    seedShape: 'Bulat', 
    podColor: 'Kuning', 
    image: '/assets/pixel_plant_b.svg', 
    imageBg: 'from-amber-100 via-yellow-50 to-orange-100',
    flowerBadgeBg: 'bg-slate-200 text-slate-800 border border-slate-300',
    seedBadgeBg: 'bg-emerald-600 text-white',
    podBadgeBg: 'bg-amber-500 text-white'
  },
  { 
    id: 'p8', 
    name: 'Tanaman H', 
    flowerColor: 'Putih', 
    seedShape: 'Bulat', 
    podColor: 'Hijau', 
    image: '/assets/pixel_plant_d.svg', 
    imageBg: 'from-emerald-100 via-teal-50 to-cyan-100',
    flowerBadgeBg: 'bg-slate-200 text-slate-800 border border-slate-300',
    seedBadgeBg: 'bg-emerald-600 text-white',
    podBadgeBg: 'bg-green-600 text-white'
  }
];

const MISSIONS = [
  {
    id: 1,
    title: 'Misi 1: Tanaman Bunga Ungu',
    promptText: 'Pilih semua tanaman yang memiliki fenotipe Bunga Berwarna Ungu!',
    targetTrait: { key: 'flowerColor', value: 'Ungu' },
    explanation: 'Warna bunga (Ungu/Putih) adalah contoh fenotipe, yaitu sifat fisik yang tampak pada makhluk hidup.'
  },
  {
    id: 2,
    title: 'Misi 2: Tanaman Biji Bulat',
    promptText: 'Pilih semua tanaman yang memiliki fenotipe Biji berbentuk Bulat!',
    targetTrait: { key: 'seedShape', value: 'Bulat' },
    explanation: 'Bentuk biji bulat merupakan fenotipe dominan pada percobaan persilangan Gregor Mendel.'
  },
  {
    id: 3,
    title: 'Misi 3: Kombinasi Sifat Fenotipe',
    promptText: 'Pilih tanaman yang memiliki Bunga Ungu DAN Biji Keriput!',
    targetTraitCombo: { flowerColor: 'Ungu', seedShape: 'Keriput' },
    explanation: 'Organisme dapat memiliki kombinasi dari beberapa sifat fenotipe yang berbeda secara bersamaan!'
  }
];

export const Stage1MysteryGarden = () => {
  const { navigateTo, completeStage } = useGame();
  const [currentMissionIdx, setCurrentMissionIdx] = useState(0);
  const [selectedCards, setSelectedCards] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [stageCompleted, setStageCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [isMissionExpanded, setIsMissionExpanded] = useState(true);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  const gardenRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.clientX - gardenRef.current.offsetLeft);
    setScrollLeft(gardenRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.clientX - gardenRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    if (Math.abs(walk) > 3) {
      setHasMoved(true);
    }
    gardenRef.current.scrollLeft = scrollLeft - walk;
  };

  // Ambient birds chirping nature sounds loop while playing
  useEffect(() => {
    // Initial chirp on load after short delay
    const initialChirpTimeout = setTimeout(() => {
      sound.playBirdChirp();
    }, 1200);

    // Dynamic nature sound loop repeating every 6 to 12 seconds
    const intervalId = setInterval(() => {
      sound.playBirdChirp();
    }, 7000 + Math.random() * 6000);

    return () => {
      clearTimeout(initialChirpTimeout);
      clearInterval(intervalId);
    };
  }, []);

  const mission = MISSIONS[currentMissionIdx];
  const stageInfo = STAGES.find(s => s.id === 1);

  const handleCardClick = (cardId) => {
    sound.playClick();
    if (selectedCards.includes(cardId)) {
      setSelectedCards(selectedCards.filter(id => id !== cardId));
    } else {
      setSelectedCards([...selectedCards, cardId]);
    }
  };

  const handleVerifyMission = () => {
    let isCorrect = false;
    
    if (mission.targetTrait) {
      const correctCardIds = PLANT_CARDS.filter(p => p[mission.targetTrait.key] === mission.targetTrait.value).map(p => p.id);
      const isMatch = correctCardIds.length === selectedCards.length && 
                      correctCardIds.every(id => selectedCards.includes(id));
      isCorrect = isMatch;
    } else if (mission.targetTraitCombo) {
      const correctCardIds = PLANT_CARDS.filter(p => 
        p.flowerColor === mission.targetTraitCombo.flowerColor && 
        p.seedShape === mission.targetTraitCombo.seedShape
      ).map(p => p.id);
      const isMatch = correctCardIds.length === selectedCards.length && 
                      correctCardIds.every(id => selectedCards.includes(id));
      isCorrect = isMatch;
    }

    if (isCorrect) {
      sound.playCorrect();
      setFeedback({
        type: 'success',
        message: 'Tepat sekali! Kamu berhasil mengenali fenotipe tanaman yang diminta.'
      });
      setScore(prev => prev + 100);

      setTimeout(() => {
        if (currentMissionIdx < MISSIONS.length - 1) {
          setCurrentMissionIdx(prev => prev + 1);
          setSelectedCards([]);
          setFeedback(null);
        } else {
          setStageCompleted(true);
          sound.playFanfare();
          try { confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); } catch(e){}
          completeStage(1, 3, score + 100, 100, 45);
        }
      }, 1800);
    } else {
      sound.playWrong();
      const nextLives = lives - 1;
      setLives(nextLives);
      
      if (nextLives <= 0) {
        setFeedback({
          type: 'error',
          message: 'Waduh! Jawaban kamu kurang tepat dan nyawa kamu telah habis.'
        });
        // Short delay to let player see the feedback before showing game over overlay
        setTimeout(() => {
          setGameOver(true);
        }, 1600);
      } else {
        setFeedback({
          type: 'error',
          message: `Kurang tepat. Kamu kehilangan 1 nyawa! Sisa nyawa kamu: ${nextLives} ❤️`
        });
      }
    }
  };

  return (
    <div className="w-full h-screen relative overflow-hidden bg-slate-900 select-none p-0 md:p-8">
      
      {/* Dynamic swaying animation for GBA-style organic garden aesthetic */}
      <style>{`
        @keyframes sway {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        .sway-plant {
          transform-origin: bottom center;
          animation: sway 4s ease-in-out infinite;
        }
        .sway-delay-0 { animation-delay: 0s; animation-duration: 4.5s; }
        .sway-delay-1 { animation-delay: -0.7s; animation-duration: 3.9s; }
        .sway-delay-2 { animation-delay: -1.5s; animation-duration: 4.7s; }
        .sway-delay-3 { animation-delay: -2.3s; animation-duration: 4.1s; }
        .sway-delay-4 { animation-delay: -3.0s; animation-duration: 3.7s; }
        .sway-delay-5 { animation-delay: -3.8s; animation-duration: 4.4s; }
      `}</style>

      {/* Floating Header Banner HUD */}
      <div className="absolute top-4 left-4 right-4 p-3 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200 shadow-lg flex items-center justify-between gap-2 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('map')}
            className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-sky-600 transition shadow-3xs cursor-pointer flex-shrink-0"
            title="Kembali ke Peta"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 p-0.5 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img 
                src="/assets/rumah_mendel_banner.webp" 
                alt="Rumah Mendel Banner PNG" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-[7px] font-black text-indigo-700 uppercase tracking-widest font-sans block">
                {stageInfo.location} &bull; STAGE 1
              </span>
              <h2 className="text-[11px] sm:text-xs font-black text-black leading-tight">
                {stageInfo.title}
              </h2>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Hearts / Lives indicator */}
          <div className="flex items-center gap-0.5 bg-rose-500/10 border border-rose-300/60 px-2 py-1 rounded-xl shadow-3xs">
            {[1, 2, 3].map((heartIdx) => {
              const isAlive = heartIdx <= lives;
              return (
                <Heart 
                  key={heartIdx}
                  className={`w-3 h-3 ${
                    isAlive 
                      ? 'text-rose-500 fill-rose-500 animate-pulse' 
                      : 'text-slate-300 fill-slate-200'
                  }`}
                />
              );
            })}
          </div>

          {/* Score indicator */}
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-300/60 px-3 py-1 rounded-xl shadow-3xs">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-[10px] font-black text-amber-900 font-mono">Skor: {score}</span>
          </div>
        </div>
      </div>

      {!stageCompleted ? (
        <>
          {/* Retractable Floating Quest Card in Top Right (Compact edition) */}
          {!isMissionExpanded ? (
            <button 
              onClick={() => setIsMissionExpanded(true)}
              className="absolute top-20 right-4 w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md flex items-center justify-center cursor-pointer text-indigo-700 hover:text-indigo-800 transition z-30 font-black text-sm"
              title="Tampilkan Misi"
            >
              📋
            </button>
          ) : (
            <div className="absolute top-20 right-4 w-56 bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl shadow-md z-30 transition-all duration-300 overflow-hidden select-none">
              {/* Card Header */}
              <div 
                onClick={() => setIsMissionExpanded(false)}
                className="flex items-center justify-between px-2.5 py-2 bg-slate-50/80 border-b border-slate-100 cursor-pointer hover:bg-slate-100/80 transition"
              >
                <div className="flex items-center gap-1">
                  <span className="text-[8px] font-black text-indigo-700 tracking-wider font-sans uppercase">
                    📋 MISI ({currentMissionIdx + 1}/{MISSIONS.length})
                  </span>
                </div>
                <button className="text-slate-500 hover:text-indigo-600 font-extrabold text-[7.5px] focus:outline-none">
                  Sembunyikan
                </button>
              </div>

              {/* Card Body */}
              <div className="p-2.5 space-y-2 text-left animate-fade-in">
                <div className="flex items-start gap-1.5">
                  <img 
                    src="/assets/mendel_avatar.webp" 
                    alt="Gregor Mendel" 
                    className="w-7 h-7 object-contain flex-shrink-0 drop-shadow-3xs"
                  />
                  <div className="space-y-0.5">
                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest block truncate max-w-[120px]">{mission.title}</span>
                    <h3 className="text-[8.5px] font-black text-slate-800 leading-tight">
                      {mission.promptText}
                    </h3>
                  </div>
                </div>

                <p className="text-[8px] font-bold text-indigo-900 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/50 leading-normal">
                  💡 {mission.explanation}
                </p>
              </div>
            </div>
          )}

          {/* Scrollable/Draggable Viewport Container for the Garden Landscape */}
          <div 
            ref={gardenRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onDragStart={(e) => e.preventDefault()}
            className={`absolute inset-0 overflow-x-auto scrollbar-hide z-0 cursor-grab ${
              isDragging ? 'cursor-grabbing' : ''
            }`}
          >
            {/* The Actual Wider Garden Field (1800px wide for less zoom / more panoramas) */}
            <div className="w-[1800px] h-full relative">
              
              {/* Pixel Art SVG Background stretched across the 1800px wide garden */}
              <img 
                src="/assets/pixel_garden_bg.svg" 
                alt="Pixel Art Garden Background" 
                className="absolute inset-0 w-full h-full object-cover z-0"
                draggable="false"
              />

              {/* Plants Scattered in the 1800px Wide Garden (Anchored to the soil base) */}
              <div className="absolute inset-x-0 bottom-0 h-[220px] z-20">
                {PLANT_CARDS.map((card, idx) => {
                  const isSelected = selectedCards.includes(card.id);
                  const isRowBack = idx % 2 === 0;
                  // Vertical alignment values matching the background's grass line
                  const verticalOffset = isRowBack ? 'bottom-[92px]' : 'bottom-[76px]';
                  const leftPosition = 100 + idx * 220;

                  return (
                    <div
                      key={card.id}
                      onClick={(e) => {
                        if (hasMoved) {
                          e.preventDefault();
                          return;
                        }
                        handleCardClick(card.id);
                      }}
                      className={`absolute ${verticalOffset} transition-all duration-300 cursor-pointer flex flex-col items-center group`}
                      style={{
                        left: `${leftPosition}px`,
                        width: '110px',
                        height: '110px'
                      }}
                    >
                      {/* Tooltip on hover / selection */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute bottom-[calc(100%-8px)] mb-2 bg-slate-900/90 text-white text-[9px] font-bold py-1 px-2.5 rounded-xl border border-slate-700 shadow-lg whitespace-nowrap z-30 pointer-events-none flex flex-col gap-0.5 text-center">
                        <span className="text-amber-300 font-black">{card.name}</span>
                        <span className="text-slate-200">🌸 {card.flowerColor} &bull; 🟢 {card.seedShape} &bull; 🫛 {card.podColor}</span>
                      </div>

                      {/* Selection indicator ring at the base of the plant */}
                      <div className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-14 h-3.5 rounded-full transition-all duration-300 ${
                        isSelected 
                          ? 'bg-blue-500/50 border-2 border-blue-400 scale-110 blur-[1px]' 
                          : 'bg-black/15 group-hover:bg-black/25'
                      }`} />

                      {/* Plant Image container anchored exactly to the ground */}
                      <div className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-24 flex items-end justify-center transition-transform duration-300 group-hover:scale-105 pointer-events-none sway-plant sway-delay-${idx}`}>
                        <img 
                          src={card.image} 
                          alt={card.name} 
                          className="w-full h-full object-contain"
                          style={{ 
                            imageRendering: 'pixelated',
                            filter: isSelected
                              ? 'drop-shadow(0 0 10px rgba(59,130,246,0.9)) drop-shadow(1.5px 1.5px 0px #0f172a) drop-shadow(-1.5px -1.5px 0px #0f172a)'
                              : 'drop-shadow(1.5px 1.5px 0px #0f172a) drop-shadow(-1.5px -1.5px 0px #0f172a) drop-shadow(1.5px -1.5px 0px #0f172a) drop-shadow(-1.5px 1.5px 0px #0f172a)'
                          }}
                          draggable="false"
                        />

                        {/* Checkmark overlay */}
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 p-0.5 rounded-full bg-blue-600 text-white shadow-md animate-bounce z-10 border border-white">
                            <CheckCircle2 className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      {/* Label below the base */}
                      <span className={`absolute bottom-[-14px] left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-lg text-[8px] font-black tracking-wider transition whitespace-nowrap ${
                        isSelected 
                          ? 'bg-blue-600 text-white shadow-xs' 
                          : 'bg-white/85 text-slate-800 border border-slate-200'
                      }`}>
                        {card.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Feedback & Verify Section */}
          {feedback && (
            <div className={`absolute bottom-20 left-4 right-4 max-w-sm mx-auto p-3 rounded-2xl border flex items-center gap-2.5 text-[10px] font-extrabold shadow-md z-30 animate-fade-in ${
              feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="absolute bottom-4 right-4 z-30">
            <button
              onClick={handleVerifyMission}
              disabled={selectedCards.length === 0}
              className={`px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-[11px] flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span>PERIKSA JAWABAN</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      ) : (
        /* Stage Victory Card with Brand New PNG Asset */
        <div className="absolute inset-0 z-40 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="p-6 rounded-3xl text-center space-y-5 max-w-xs w-full border border-sky-100 bg-white shadow-2xl relative z-50 animate-scale-up">
            <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-100 p-1 flex items-center justify-center mx-auto shadow-xs overflow-hidden">
              <img 
                src="/assets/rumah_mendel_banner.webp" 
                alt="Victory Rumah Mendel PNG" 
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[8px] font-black text-indigo-700 uppercase tracking-widest font-sans">CONGRATULATIONS</span>
              <h3 className="text-lg font-black text-black">STAGE 1 SELESAI!</h3>
              <p className="text-[10px] text-black/80 font-bold leading-relaxed">
                Selamat! Kamu berhasil menguasai konsep <strong className="text-blue-600">Fenotipe</strong> dan ciri-ciri fisik makhluk hidup.
              </p>
            </div>

            <div className="flex justify-center gap-1.5">
              {[1, 2, 3].map(s => (
                <Star key={s} className="w-6 h-6 text-amber-500 fill-amber-500 animate-bounce" style={{ animationDelay: `${s * 0.2}s` }} />
              ))}
            </div>

            <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-300/60 text-amber-900 text-[10px] font-black">
              🏆 Lencana Diperoleh: Detektif Sifat
            </div>

            <div className="flex gap-2 justify-center pt-1.5">
              <button
                onClick={() => navigateTo('map')}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[10px] shadow-3xs cursor-pointer flex-1"
              >
                PETA STAGE
              </button>
              <button
                onClick={() => navigateTo('stage', 2)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-[10px] flex items-center justify-center gap-1 shadow-3xs cursor-pointer flex-1"
              >
                <span>STAGE 2</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
      {gameOver && (
        <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
          <div className="p-6 rounded-3xl text-center space-y-4 max-w-xs w-full border border-rose-900/50 bg-slate-900 shadow-2xl relative animate-scale-up text-white">
            <div className="w-16 h-16 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto shadow-md">
              <span className="text-3xl animate-bounce">💀</span>
            </div>

            <div className="space-y-1">
              <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest font-sans">GAME OVER</span>
              <h3 className="text-base font-black text-white">NYAWA KAMU HABIS!</h3>
              <p className="text-[10px] text-slate-300 font-bold leading-relaxed px-1">
                Waduh! Kamu melakukan terlalu banyak kesalahan. Jangan menyerah, pelajari materi di Genopedia dan coba lagi!
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {/* Retry Button */}
              <button
                onClick={() => {
                  setLives(3);
                  setGameOver(false);
                  setCurrentMissionIdx(0);
                  setSelectedCards([]);
                  setScore(0);
                  setFeedback(null);
                  sound.playClick();
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-[11px] shadow-md cursor-pointer flex items-center justify-center gap-1"
              >
                <span>COBA LAGI (RETRY)</span>
              </button>

              {/* Genopedia Button */}
              <button
                onClick={() => {
                  navigateTo('genopedia');
                  sound.playClick();
                }}
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] shadow-sm cursor-pointer flex items-center justify-center gap-1"
              >
                <span>PELAJARI GENOPEDIA</span>
              </button>

              {/* Back to Map Button */}
              <button
                onClick={() => {
                  navigateTo('map');
                  sound.playClick();
                }}
                className="w-full py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white font-extrabold text-[9px] cursor-pointer"
              >
                <span>KEMBALI KE PETA</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
