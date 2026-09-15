import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { STAGES } from '../../data/geneticsData';
import { sound } from '../../services/sound';
import confetti from 'canvas-confetti';
import { 
  Crown, 
  CheckCircle2, 
  XCircle, 
  Star, 
  Flame,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  Shield,
  Swords,
  PlusCircle,
  RotateCcw,
  Zap,
  Activity,
  Award,
  HelpCircle,
  X,
  BookOpen
} from 'lucide-react';

const JURUS_2_QUESTIONS = [
  {
    id: 'j2_1',
    prompt: 'Induk PP (Bunga Ungu) disilangkan dengan pp (Bunga Putih). Genotipe anakan F1 adalah...',
    options: ['Pp (Heterozigot)', 'PP (Homozigot Dominan)', 'pp (Homozigot Resesif)', 'Ppp (Triploid)'],
    correct: 'Pp (Heterozigot)',
    concept: 'Semua anakan F1 menerima alel dominan P dan alel resesif p.'
  },
  {
    id: 'j2_2',
    prompt: 'Pada persilangan F1 heterozigot (Pp × Pp), rasio fenotipe dominan : resesif pada F2 adalah...',
    options: ['3 : 1', '1 : 1', '9 : 3 : 3 : 1', '1 : 2 : 1'],
    correct: '3 : 1',
    concept: 'Rasio fenotipe monohibrid dominan penuh adalah 75% Bunga Ungu : 25% Bunga Putih (3:1).'
  },
  {
    id: 'j2_3',
    prompt: 'Individu bergenotipe Bb (biji bulat heterozigot) menghasilkan gamet...',
    options: ['B dan b (1 : 1)', 'Hanya B', 'Hanya b', 'Bb (diploid)'],
    correct: 'B dan b (1 : 1)',
    concept: 'Hukum Segregasi memisahkan pasangan alel heterozigot Bb menjadi 50% gamet B dan 50% gamet b.'
  },
  {
    id: 'j2_4',
    prompt: 'Hukum Segregasi Bebas (Hukum Mendel I) menyatakan bahwa pasangan alel akan terpisah pada saat...',
    options: ['Pembentukan gamet (Meiosis)', 'Pertumbuhan sel tubuh (Mitosis)', 'Fertilisasi zigot', 'Replikasi DNA'],
    correct: 'Pembentukan gamet (Meiosis)',
    concept: 'Segregasi adalah pemisahan pasangan alel homolog ke kutub gamet berbeda.'
  },
  {
    id: 'j2_5',
    prompt: 'Persilangan uji (Test Cross) dilakukan dengan menyilangkan individu uji dengan individu bergenotipe...',
    options: ['Homozigot resesif (pp)', 'Homozigot dominan (PP)', 'Heterozigot (Pp)', 'Induk jantan saja'],
    correct: 'Homozigot resesif (pp)',
    concept: 'Test cross menyilangkan dengan homozigot resesif untuk mengetahui kemurnian genotipe.'
  },
  {
    id: 'j2_6',
    prompt: 'Genotipe yang memiliki dua alel identik (misal: TT atau tt) disebut...',
    options: ['Homozigot', 'Heterozigot', 'Intermediet', 'Poligenik'],
    correct: 'Homozigot',
    concept: 'Homozigot membawa pasangan alel sejenis (dominan homozigot atau resesif homozigot).'
  },
  {
    id: 'j2_7',
    prompt: 'Jika tanaman batang tinggi heterozigot (Tt) disilangkan dengan batang pendek (tt), persentase anakan pendek adalah...',
    options: ['50%', '25%', '75%', '100%'],
    correct: '50%',
    concept: 'Persilangan Tt × tt menghasilkan anakan 50% Tt (tinggi) dan 50% tt (pendek).'
  },
  {
    id: 'j2_8',
    prompt: 'Sifat fisik organisme yang tampak dan dapat diamati secara langsung disebut...',
    options: ['Fenotipe', 'Genotipe', 'Kariotipe', 'Genom'],
    correct: 'Fenotipe',
    concept: 'Fenotipe adalah perwujudan fisik atau morfologi dari interaksi genotipe dengan lingkungan.'
  },
  {
    id: 'j2_9',
    prompt: 'Pada persilangan monohibrid Pp × Pp, rasio genotipe PP : Pp : pp yang terbentuk adalah...',
    options: ['1 : 2 : 1', '3 : 1', '9 : 3 : 3 : 1', '2 : 1 : 1'],
    correct: '1 : 2 : 1',
    concept: 'Kombinasi papan Punnett menghasilkan 1 PP (25%), 2 Pp (50%), dan 1 pp (25%).'
  },
  {
    id: 'j2_10',
    prompt: 'Alel yang tertutupi ekspresinya oleh alel lain dan hanya muncul saat kondisi homozigot disebut alel...',
    options: ['Resesif', 'Dominan', 'Kodominan', 'Letal'],
    correct: 'Resesif',
    concept: 'Alel resesif dilambangkan dengan huruf kecil dan hanya berekspresi jika berpasangan dengan sesama alel resesif.'
  }
];

const JURUS_3_QUESTIONS = [
  {
    id: 'j3_1',
    prompt: 'SERANGAN PAMUNGKAS: Tentukan perbandingan fenotipe F2 persilangan dihibrid heterozigot ganda (AaBb × AaBb)!',
    options: ['9 : 3 : 3 : 1', '3 : 1', '1 : 2 : 1', '12 : 3 : 1'],
    correct: '9 : 3 : 3 : 1',
    concept: 'Rasio fenotipe klasik dihibrid Mendel adalah 9 Dominan-Dominan : 3 Dominan-Resesif : 3 Resesif-Dominan : 1 Resesif-Resesif.'
  },
  {
    id: 'j3_2',
    prompt: 'SERANGAN PAMUNGKAS: Dari 16 kotak papan Punnett dihibrid AaBb × AaBb, berapa kotak yang bergenotipe homozigot resesif ganda (aabb)?',
    options: ['1 dari 16 kotak (1/16)', '3 dari 16 kotak', '9 dari 16 kotak', '4 dari 16 kotak'],
    correct: '1 dari 16 kotak (1/16)',
    concept: 'Genotipe aabb hanya terbentuk dari pertemuan gamet ab × ab, yaitu 1 kombinasi dari 16 total kotak.'
  },
  {
    id: 'j3_3',
    prompt: 'SERANGAN PAMUNGKAS: Hukum Asortasi Bebas (Mendel II) membuktikan bahwa...',
    options: ['Gen untuk sifat berbeda memisah & berpadu secara bebas', 'Alel dominan selalu memusnahkan alel resesif', 'Gamet selalu diploid 2n', 'Semua keturunan pasti mirip induk betina'],
    correct: 'Gen untuk sifat berbeda memisah & berpadu secara bebas',
    concept: 'Hukum Mendel II menyatakan alel dari lokus berbeda mengelompok secara bebas pada pembentukan gamet.'
  },
  {
    id: 'j3_4',
    prompt: 'SERANGAN PAMUNGKAS: Tanaman berbiji bulat kuning (BbKk) saat meiosis menghasilkan jenis gamet...',
    options: ['4 jenis: BK, Bk, bK, bk', '2 jenis: BK dan bk', '3 jenis: B, K, b', '1 jenis: BbKk'],
    correct: '4 jenis: BK, Bk, bK, bk',
    concept: 'Sesuai Hukum Mendel II (2^n = 2^2 = 4 jenis gamet) dengan proporsi masing-masing 25%.'
  },
  {
    id: 'j3_5',
    prompt: 'SERANGAN PAMUNGKAS: Berapakah peluang anakan bergenotipe homozigot dominan ganda (AABB) dari persilangan AaBb × AaBb?',
    options: ['1/16 (6,25%)', '3/16 (18,75%)', '9/16 (56,25%)', '4/16 (25%)'],
    correct: '1/16 (6,25%)',
    concept: 'Peluang AA adalah 1/4 dan peluang BB adalah 1/4. Maka peluang AABB = 1/4 × 1/4 = 1/16.'
  },
  {
    id: 'j3_6',
    prompt: 'SERANGAN PAMUNGKAS: Pada persilangan dihibrid AaBb × aabb (Test Cross Dihibrid), rasio fenotipe anakannya adalah...',
    options: ['1 : 1 : 1 : 1', '9 : 3 : 3 : 1', '3 : 1', '1 : 2 : 1'],
    correct: '1 : 1 : 1 : 1',
    concept: 'Test cross dihibrid menghasilkan 4 macam kombinasi fenotipe dengan perbandingan setara 1:1:1:1 (25% masing-masing).'
  }
];

export const BossBattleDrChaos = () => {
  const { navigateTo, completeStage, sourceWorldView } = useGame();
  
  // Battle States
  const [bossHp, setBossHp] = useState(100);
  const [playerHp, setPlayerHp] = useState(100);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [maxTurns] = useState(15);
  const [turnOwner, setTurnOwner] = useState('player'); // 'player' | 'enemy' | 'animating'
  const [skill1Cd, setSkill1Cd] = useState(0);
  const [q2Idx, setQ2Idx] = useState(0);
  const [q3Idx, setQ3Idx] = useState(0);
  
  // Combat Actions & Slash Banner States
  const [activeSkill, setActiveSkill] = useState(null); // 's2' | 's3'
  const [showSlashBanner, setShowSlashBanner] = useState(false);
  const [bannerText, setBannerText] = useState('CRITICAL!');
  const [isEnemyHit, setIsEnemyHit] = useState(false);
  const [isPlayerHit, setIsPlayerHit] = useState(false);
  const [projectileAnim, setProjectileAnim] = useState(false);
  const [isDefending, setIsDefending] = useState(false);
  const [potionCount, setPotionCount] = useState(2);
  
  // Battle Outcome
  const [bossDefeated, setBossDefeated] = useState(false);
  const [playerDefeated, setPlayerDefeated] = useState(false);
  const [score, setScore] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);

  // Sekarat condition (Boss HP <= 35)
  const isBossSekarat = bossHp <= 35;

  // Idle Animation: Blinking, Stance Shifts & Boss Taunting
  const [isBlinking, setIsBlinking] = useState(false);
  const [playerStanceShift, setPlayerStanceShift] = useState(false);
  const [bossTaunt, setBossTaunt] = useState(false);

  // Periodic natural eye blink for Peneliti Muda
  useEffect(() => {
    const blinkTimer = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 3800);
    return () => clearInterval(blinkTimer);
  }, []);

  // Periodic ready stance shift for Peneliti Muda (every 6.4s, shifts posture for 800ms)
  useEffect(() => {
    const stanceTimer = setInterval(() => {
      setPlayerStanceShift(true);
      setTimeout(() => setPlayerStanceShift(false), 800);
    }, 6400);
    return () => clearInterval(stanceTimer);
  }, []);

  // Periodic menacing point / taunt pose for Dr. Chaos (every 5.2s, points for 1400ms)
  useEffect(() => {
    const tauntTimer = setInterval(() => {
      setBossTaunt(true);
      setTimeout(() => setBossTaunt(false), 1400);
    }, 5200);
    return () => clearInterval(tauntTimer);
  }, []);

  // Player custom profile from RPG menu
  const [playerGender] = useState(() => {
    try {
      return localStorage.getItem('genetic_odyssey_rpg_player_gender') || 'female';
    } catch (e) {
      return 'female';
    }
  });

  const [playerName] = useState(() => {
    try {
      return localStorage.getItem('genetic_odyssey_rpg_player_name') || 'Jonara';
    } catch (e) {
      return 'Jonara';
    }
  });

  // Dynamic RPG Sprite resolution based on battle actions, gender & idle states
  const playerFolder = playerGender === 'male' ? '/assets/rpg/player_male' : '/assets/rpg/player';
  const playerSpriteSrc = projectileAnim
    ? `${playerFolder}/right_2.png`
    : (isBlinking && playerGender !== 'male')
    ? `${playerFolder}/idle_right_blink.png`
    : playerStanceShift
    ? `${playerFolder}/right_1.png`
    : `${playerFolder}/right_0.png`;

  const bossSpriteSrc = (turnOwner === 'enemy' || bossTaunt)
    ? '/assets/rpg/npc/chaos/point_0.png'
    : '/assets/rpg/npc/chaos/potion_0.png';

  const stageInfo = STAGES.find(s => s.id === 8);

  // Advance turn and decrement round cooldowns
  const advanceTurn = () => {
    setCurrentTurn(prev => {
      const next = prev + 1;
      if (next > maxTurns) {
        setTimeout(() => setPlayerDefeated(true), 600);
      }
      return Math.min(maxTurns, next);
    });
    setSkill1Cd(prev => Math.max(0, prev - 1));
    setIsDefending(false);
    setActiveSkill(null);
    setTurnOwner('player');
  };

  const handleVictory = () => {
    setBossDefeated(true);
    sound.playFanfare();
    try {
      confetti({ particleCount: 220, spread: 90, origin: { y: 0.5 } });
    } catch(e){}
    completeStage(8, 3, score + 1000, 100, 60);
  };

  // JURUS 1: Skip pertanyaan! Darah musuh -10, darah pemain -5, CD 3 ronde
  const handleExecuteSkill1 = () => {
    if (turnOwner !== 'player' || skill1Cd > 0) return;
    sound.playClick();
    setTurnOwner('animating');

    // Cooldown 3 ronde
    setSkill1Cd(3);

    sound.playCorrect();
    setProjectileAnim(true);

    setTimeout(() => {
      setProjectileAnim(false);
      setIsEnemyHit(true);
      setIsPlayerHit(true);
      setBannerText('-10 HP (Musuh) / -5 HP (Diri)');
      setShowSlashBanner(true);

      const nextBossHp = Math.max(0, bossHp - 10);
      const nextPlayerHp = Math.max(0, playerHp - 5);
      setBossHp(nextBossHp);
      setPlayerHp(nextPlayerHp);
      setScore(prev => prev + 100);

      setTimeout(() => {
        setIsEnemyHit(false);
        setIsPlayerHit(false);
        setShowSlashBanner(false);

        if (nextBossHp <= 0) {
          handleVictory();
        } else if (nextPlayerHp <= 0) {
          setTimeout(() => setPlayerDefeated(true), 500);
        } else {
          advanceTurn();
        }
      }, 1200);
    }, 600);
  };

  // JURUS 2 & JURUS 3: Berdasarkan Pertanyaan
  // Benar = Darah musuh berkurang
  // Salah = Darah pemain berkurang
  const handleAnswerSelection = (answer) => {
    if (turnOwner !== 'player') return;
    sound.playClick();
    setTurnOwner('animating');

    const currentQ = activeSkill === 's3' 
      ? JURUS_3_QUESTIONS[q3Idx % JURUS_3_QUESTIONS.length] 
      : JURUS_2_QUESTIONS[q2Idx % JURUS_2_QUESTIONS.length];

    if (answer === currentQ.correct) {
      // JAWABAN BENAR: DARAH MUSUH BERKURANG!
      sound.playCorrect();
      setProjectileAnim(true);

      setTimeout(() => {
        setProjectileAnim(false);
        setIsEnemyHit(true);
        const dmg = activeSkill === 's3' ? 35 : 25;
        const nextBossHp = Math.max(0, bossHp - dmg);
        setBossHp(nextBossHp);
        setBannerText(`CRITICAL -${dmg} HP!`);
        setShowSlashBanner(true);
        setScore(prev => prev + (activeSkill === 's3' ? 500 : 250));

        setTimeout(() => {
          setIsEnemyHit(false);
          setShowSlashBanner(false);
          if (activeSkill === 's3') {
            setQ3Idx(prev => prev + 1);
          } else {
            setQ2Idx(prev => prev + 1);
          }

          if (nextBossHp <= 0) {
            handleVictory();
          } else {
            advanceTurn();
          }
        }, 1300);
      }, 600);

    } else {
      // JAWABAN SALAH: DARAH PEMAIN YANG BERKURANG!
      sound.playWrong();
      setIsPlayerHit(true);
      const playerDmg = activeSkill === 's3' ? 20 : 15;
      const nextPlayerHp = Math.max(0, playerHp - playerDmg);
      setPlayerHp(nextPlayerHp);
      setBannerText(`JAWABAN SALAH! -${playerDmg} HP`);
      setShowSlashBanner(true);

      setTimeout(() => {
        setIsPlayerHit(false);
        setShowSlashBanner(false);
        if (activeSkill === 's3') {
          setQ3Idx(prev => prev + 1);
        } else {
          setQ2Idx(prev => prev + 1);
        }

        if (nextPlayerHp <= 0) {
          setTimeout(() => setPlayerDefeated(true), 500);
        } else {
          advanceTurn();
        }
      }, 1300);
    }
  };

  // Player Guard
  const handleGuard = () => {
    if (turnOwner !== 'player') return;
    sound.playClick();
    setIsDefending(true);
    setTurnOwner('animating');

    setTimeout(() => {
      const actualDmg = 8;
      setIsPlayerHit(true);
      setBannerText(`BERTAHAN! -${actualDmg} HP`);
      setShowSlashBanner(true);

      setPlayerHp(prev => {
        const next = Math.max(0, prev - actualDmg);
        if (next <= 0) setTimeout(() => setPlayerDefeated(true), 500);
        return next;
      });

      setTimeout(() => {
        setIsPlayerHit(false);
        setShowSlashBanner(false);
        advanceTurn();
      }, 1000);
    }, 600);
  };

  // Player Heal
  const handleHeal = () => {
    if (turnOwner !== 'player' || potionCount <= 0 || playerHp >= 100) return;
    sound.playClick();
    setPotionCount(prev => prev - 1);
    setTurnOwner('animating');
    setPlayerHp(prev => Math.min(100, prev + 35));

    setTimeout(() => {
      const actualDmg = 14;
      setIsPlayerHit(true);
      setBannerText(`+35 HP HEAL / -${actualDmg} HP`);
      setShowSlashBanner(true);

      setPlayerHp(prev => {
        const next = Math.max(0, prev - actualDmg);
        if (next <= 0) setTimeout(() => setPlayerDefeated(true), 500);
        return next;
      });

      setTimeout(() => {
        setIsPlayerHit(false);
        setShowSlashBanner(false);
        advanceTurn();
      }, 1000);
    }, 600);
  };

  // Restart Battle
  const handleRestart = () => {
    sound.playClick();
    setBossHp(100);
    setPlayerHp(100);
    setCurrentTurn(1);
    setSkill1Cd(0);
    setQ2Idx(0);
    setQ3Idx(0);
    setTurnOwner('player');
    setActiveSkill(null);
    setIsDefending(false);
    setPotionCount(2);
    setPlayerDefeated(false);
    setShowSlashBanner(false);
  };

  return (
    <div className="w-full min-h-screen relative overflow-x-hidden bg-[#faf6ee] select-none flex flex-col justify-between text-slate-900 font-sans p-2 sm:p-5 overflow-y-auto stage-main-wrapper">
      
      {/* Retro parchment paper lines overlay (identical to Stage 2-6) */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] z-0" />

      {/* ======================================================== */}
      {/* 1. TOP HEADER HUD (MATCHING STAGE 2 PALETTE)             */}
      {/* ======================================================== */}
      <div className="w-full p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white border-2 border-slate-800 shadow-[3px_3px_0px_#1e293b] sm:shadow-[4px_4px_0px_#1e293b] flex items-center justify-between gap-2 z-30 relative mb-1.5 sm:mb-3 stage-header-hud">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo(sourceWorldView === 'rpg-world' ? 'rpg-world' : 'map')}
            className="p-1.5 rounded-xl bg-white border-2 border-slate-800 text-slate-700 hover:text-sky-600 transition shadow-[2px_2px_0px_#1e293b] cursor-pointer flex-shrink-0 active:translate-y-0.5"
            title={sourceWorldView === 'rpg-world' ? "Kembali ke RPG Map" : "Kembali ke Peta"}
          >
            <ChevronLeft className="w-4 h-4 stroke-[3px]" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 border-2 border-slate-800 p-0.5 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <Flame className="w-5 h-5 text-rose-600 animate-bounce" />
            </div>
            <div>
              <span className="text-[7px] font-black text-rose-700 uppercase tracking-widest font-sans block">
                KASTIL DR. CHAOS &bull; STAGE 8 FINAL BOSS
              </span>
              <h2 className="text-[11px] sm:text-xs font-black text-slate-900 leading-tight">
                Pertarungan Dr. Chaos
              </h2>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Turn Pill (Stage 2 retro badge style) */}
          <div className="flex items-center bg-rose-500/10 border-2 border-slate-800 px-2 sm:px-2.5 py-1 rounded-xl shadow-[2px_2px_0px_#1e293b]">
            <span className="text-[9px] sm:text-[10px] font-mono font-black text-rose-700 uppercase tracking-wider mr-1">
              {String(currentTurn).padStart(2, '0')}/ {maxTurns}
            </span>
            <span className="text-[9px] sm:text-[10px] font-mono font-black text-slate-800 uppercase">
              TURN
            </span>
          </div>

          {/* Score Pill */}
          <div className="flex items-center gap-1 bg-amber-500/10 border-2 border-slate-800 px-2 sm:px-2.5 py-1 rounded-xl shadow-[2px_2px_0px_#1e293b]">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="font-mono font-black text-[9.5px] sm:text-[10px] text-slate-900">Skor: {score}</span>
          </div>

          {/* Cara Bermain Button in Top Right */}
          <button
            onClick={() => {
              sound.playClick();
              setShowTutorial(true);
            }}
            className="flex items-center gap-1 sm:gap-1.5 bg-[#fef08a] hover:bg-[#fde047] text-slate-950 border-2 border-slate-800 px-2 sm:px-3 py-1 rounded-xl shadow-[2px_2px_0px_#1e293b] font-black text-[9px] sm:text-xs cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition ml-0.5"
            title="Buka Panduan Cara Bertarung"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-900" />
            <span className="hidden sm:inline">Cara Bermain</span>
          </button>
        </div>
      </div>

      {!bossDefeated && !playerDefeated ? (
        <>
          {/* ======================================================== */}
          {/* 2. DR. CHAOS GOTHIC CASTLE BATTLE ARENA                  */}
          {/* ======================================================== */}
          <div className="relative flex-1 w-full flex flex-col justify-end items-center overflow-hidden min-h-[200px] sm:min-h-[480px] boss-arena-compact">
            
            {/* Background Dr. Chaos Castle Artwork (Anchored to Floor) */}
            <div 
              className="absolute inset-0 bg-cover bg-bottom filter brightness-95 image-pixelated"
              style={{ backgroundImage: `url('/assets/dr_chaos_castle_bg.jpg')` }}
            >
              {/* Soft atmospheric combat lighting and vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/30" />
            </div>

            {/* Custom RPG Battle Idle Keyframe Animations */}
            <style>{`
              @keyframes rpgPlayerBreath {
                0%, 100% { transform: scale(1, 1); }
                50% { transform: scale(0.985, 1.026); }
              }
              @keyframes rpgBossBreath {
                0%, 100% { transform: scale(-1, 1); }
                50% { transform: scale(-0.98, 1.03); }
              }
              @keyframes rpgShadowPulse {
                0%, 100% { transform: translateX(-50%) scale(1, 1); opacity: 0.85; }
                50% { transform: translateX(-50%) scale(1.05, 0.94); opacity: 0.95; }
              }
              @keyframes mutagenMistFloat {
                0%, 100% { opacity: 0.3; transform: scale(0.95); }
                50% { opacity: 0.7; transform: scale(1.15); }
              }
              @keyframes bubbleDrift {
                0% { transform: translateY(0px) scale(0.7); opacity: 0; }
                30% { opacity: 0.7; }
                80% { opacity: 0.5; }
                100% { transform: translateY(-70px) scale(1.1); opacity: 0; }
              }
            `}</style>

            {/* Ambient Mutagen Tank Bubbles Rising Behind Characters */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-5">
              {/* Left Green Mutagen Bubbles */}
              <div className="absolute left-[24%] sm:left-[28%] bottom-[32%] w-2 h-2 rounded-full bg-emerald-400/70 blur-[0.5px] shadow-[0_0_8px_#34d399]" style={{ animation: 'bubbleDrift 3.5s ease-in-out infinite' }} />
              <div className="absolute left-[26%] sm:left-[30%] bottom-[35%] w-1.5 h-1.5 rounded-full bg-emerald-300/60 blur-[0.5px] shadow-[0_0_6px_#34d399]" style={{ animation: 'bubbleDrift 4.2s ease-in-out infinite 1.2s' }} />
              {/* Right Purple Mutagen Bubbles */}
              <div className="absolute right-[24%] sm:right-[28%] bottom-[32%] w-2 h-2 rounded-full bg-purple-400/70 blur-[0.5px] shadow-[0_0_8px_#c084fc]" style={{ animation: 'bubbleDrift 3.8s ease-in-out infinite 0.6s' }} />
              <div className="absolute right-[26%] sm:right-[30%] bottom-[35%] w-1.5 h-1.5 rounded-full bg-purple-300/60 blur-[0.5px] shadow-[0_0_6px_#c084fc]" style={{ animation: 'bubbleDrift 4.5s ease-in-out infinite 1.8s' }} />
            </div>

            {/* Dynamic Battle Field Container (2.5D Left-Right Perspective, Firmly Grounded on Floor) */}
            <div className="relative w-full max-w-5xl px-4 sm:px-12 flex items-end justify-between pb-2 sm:pb-5 z-10">
              
              {/* ------------------------------------------------------ */}
              {/* LEFT TEAM: PENELITI MUDA & RESEARCH DRONE              */}
              {/* ------------------------------------------------------ */}
              <div className="flex flex-col items-start relative select-none">
                
                {/* Floating Pocket Revo Status HUD (Over Player - Stage 2 Retro Theme) */}
                <div className="mb-1.5 sm:mb-3 p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white border-2 border-slate-800 shadow-[2px_2px_0px_#1e293b] sm:shadow-[4px_4px_0px_#1e293b] space-y-0.5 sm:space-y-1 w-36 sm:w-52 animate-fade-in text-slate-900">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      {/* Level Badge Circle */}
                      <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-300 text-slate-950 font-black font-mono text-[8px] sm:text-[9px] flex items-center justify-center border border-slate-800 shadow-xs">
                        25
                      </span>
                      <span className="text-[9.5px] sm:text-[11px] font-black text-slate-900 font-sans">
                        {playerName}
                      </span>
                    </div>

                    {/* Speed / Turn Buff Indicator */}
                    <span className="px-1 sm:px-1.5 py-0.5 rounded-md bg-amber-200 border border-slate-800 text-slate-900 font-mono font-black text-[7px] sm:text-[8px] uppercase tracking-wider flex items-center gap-0.5">
                      3 SPD &uarr;
                    </span>
                  </div>

                  {/* Player Health Bar */}
                  <div className="w-full h-2.5 sm:h-3 rounded-full bg-slate-100 border border-slate-800 overflow-hidden p-0.5 shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        playerHp > 50 ? 'bg-emerald-500' : playerHp > 25 ? 'bg-amber-400' : 'bg-rose-500'
                      }`}
                      style={{ width: `${playerHp}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[8px] sm:text-[9px] font-mono text-slate-600">
                    <span>{isDefending ? "🛡️ PERISAI" : "SIAP"}</span>
                    <span className="font-bold text-emerald-700">{playerHp}/100 HP</span>
                  </div>
                </div>

                {/* Player Character & Companion Stance (Facing Right, Firmly Grounded with Idle Breath) */}
                <div className={`relative flex items-end gap-2 sm:gap-3 transition-transform duration-200 ${
                  isPlayerHit ? 'animate-shake' : ''
                }`}>
                  {/* Dynamic Castle Floor Contact Shadow (Syncs with Breathing) */}
                  <div 
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-24 sm:w-36 h-3 sm:h-4 bg-black/85 rounded-[100%] blur-[2px] pointer-events-none" 
                    style={{ animation: 'rpgShadowPulse 2.8s ease-in-out infinite' }}
                  />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-28 sm:w-44 h-4 sm:h-5 rounded-[100%] bg-emerald-500/20 blur-[4px] pointer-events-none" />

                  {/* Peneliti Muda Full Body Pixel RPG Stance (Grounded Breathing) */}
                  <div className="relative z-10 h-36 sm:h-64 w-auto flex items-end justify-center boss-sprite-compact">
                    <img 
                      src={playerSpriteSrc} 
                      alt={`${playerName} (RPG)`} 
                      className={`h-full w-auto object-contain object-bottom image-pixelated drop-shadow-[0_8px_12px_rgba(0,0,0,0.9)] transition-all duration-150 select-none ${
                        isPlayerHit 
                          ? 'brightness-200 filter invert contrast-150' 
                          : projectileAnim 
                          ? 'translate-x-3 scale-105' 
                          : ''
                      }`}
                      style={{
                        transformOrigin: 'bottom center',
                        animation: isPlayerHit || projectileAnim ? 'none' : 'rpgPlayerBreath 2.8s ease-in-out infinite'
                      }}
                    />
                  </div>

                  {/* Companion: Research Scanner Drone hovering with optical scanner pulse */}
                  <div className="relative z-10 h-14 sm:h-18 w-auto flex items-end -ml-2 mb-14 sm:mb-20">
                    <div className="relative">
                      <img 
                        src="/assets/rpg/npc/npc_7_drone.png" 
                        alt="Bio-Scanner Drone" 
                        className="h-full w-auto object-contain image-pixelated drop-shadow-[0_8px_12px_rgba(0,0,0,0.8)] animate-bounce"
                        style={{ animationDuration: '2.4s' }}
                        title="Bio-Scanner Drone"
                      />
                      {/* Drone Holographic Scanning Light Cone */}
                      <div className="absolute top-1/2 left-full w-12 sm:w-16 h-8 -translate-y-1/2 bg-gradient-to-r from-cyan-400/40 via-cyan-300/20 to-transparent blur-[1px] pointer-events-none rounded-r-full transform rotate-12 animate-pulse" />
                    </div>
                  </div>
                </div>

              </div>

              {/* ------------------------------------------------------ */}
              {/* CENTER: DYNAMIC RED COMIC SLASH BANNER ("Total DMG")   */}
              {/* ------------------------------------------------------ */}
              {showSlashBanner && (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none animate-scale-up">
                  <div className="relative px-6 sm:px-10 py-2 sm:py-3.5 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white font-black tracking-tight rounded-2xl border-4 border-yellow-300 shadow-[0_0_35px_rgba(239,68,68,0.9)] transform -rotate-3 flex items-center gap-3">
                    <span className="text-xs sm:text-base uppercase tracking-widest text-yellow-200 drop-shadow-md">
                      Total DMG:
                    </span>
                    <span className="text-3xl sm:text-5xl font-black font-mono text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] animate-pulse">
                      {bannerText}
                    </span>
                  </div>
                </div>
              )}

              {/* Projectile Energy Beam from Player to Boss */}
              {projectileAnim && (
                <div className="absolute top-1/2 left-1/4 right-1/4 h-3 bg-gradient-to-r from-cyan-400 via-amber-300 to-rose-500 rounded-full blur-[1px] z-30 shadow-[0_0_20px_#38bdf8] animate-pulse pointer-events-none" />
              )}

              {/* ------------------------------------------------------ */}
              {/* RIGHT TEAM: DR. CHAOS FINAL BOSS                       */}
              {/* ------------------------------------------------------ */}
              <div className="flex flex-col items-end relative select-none">
                
                {/* Floating Pocket Revo Status HUD (Over Dr. Chaos - Stage 2 Retro Theme) */}
                <div className="mb-3 p-2.5 rounded-2xl bg-white border-2 border-slate-800 shadow-[4px_4px_0px_#1e293b] space-y-1 w-44 sm:w-56 animate-fade-in text-slate-900">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {/* Level Badge Circle */}
                      <span className="w-5 h-5 rounded-full bg-rose-400 text-slate-950 font-black font-mono text-[9px] flex items-center justify-center border border-slate-800 shadow-xs">
                        99
                      </span>
                      <span className="text-[11px] font-black text-slate-900 font-sans">
                        Dr. Chaos (Boss)
                      </span>
                    </div>

                    {isBossSekarat ? (
                      <span className="px-1.5 py-0.5 rounded-md bg-rose-600 text-white font-mono font-black text-[8px] uppercase tracking-wider animate-pulse flex items-center gap-1 border border-slate-800">
                        🔥 SEKARAT!
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-md bg-purple-200 border border-slate-800 text-purple-950 font-mono font-black text-[8px] uppercase tracking-wider">
                        MUTAGEN SHIELD
                      </span>
                    )}
                  </div>

                  {/* Boss Health Bar */}
                  <div className="w-full h-3 rounded-full bg-slate-100 border border-slate-800 overflow-hidden p-0.5 shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        bossHp > 50 ? 'bg-emerald-500' : bossHp > 35 ? 'bg-amber-400' : 'bg-rose-600 animate-pulse'
                      }`}
                      style={{ width: `${bossHp}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-600">
                    <span className={isBossSekarat ? "text-rose-700 font-black animate-pulse flex items-center gap-1" : "text-amber-800 font-bold"}>
                      {isBossSekarat ? "⚠️ KONDISI SEKARAT (≤35 HP)" : "STATUS NORMAL"}
                    </span>
                    <span className="font-black text-rose-600">{bossHp} / 100 HP</span>
                  </div>
                </div>

                {/* Dr. Chaos Boss Stance (Facing Left, Firmly Grounded with Idle Breath) */}
                <div className={`relative flex items-end justify-center transition-transform duration-200 ${
                  isEnemyHit ? 'animate-shake' : ''
                }`}>
                  {/* Dynamic Castle Floor Contact Shadow (Syncs with Boss Breathing) */}
                  <div 
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-28 sm:w-36 h-4 bg-black/85 rounded-[100%] blur-[2px] pointer-events-none" 
                    style={{ animation: 'rpgShadowPulse 3.2s ease-in-out infinite' }}
                  />
                  {/* Mutagen Vapor Aura on Castle Floor */}
                  <div 
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-36 sm:w-48 h-6 rounded-[100%] bg-purple-600/30 blur-[5px] pointer-events-none" 
                    style={{ animation: 'mutagenMistFloat 3s ease-in-out infinite' }}
                  />

                  {/* Main Boss: Dr. Chaos Full Body Pixel RPG Sprite (Flipped horizontally so he faces and points to the LEFT towards the player) */}
                  <div className="relative z-10 h-48 sm:h-64 w-auto flex items-end justify-center">
                    <img 
                      src={bossSpriteSrc} 
                      alt="Dr. Chaos (RPG Boss)" 
                      className={`h-full w-auto object-contain object-bottom image-pixelated drop-shadow-[0_8px_12px_rgba(0,0,0,0.9)] transition-all duration-150 select-none ${
                        isEnemyHit 
                          ? 'filter brightness-200 contrast-150 saturate-200' 
                          : turnOwner === 'enemy' 
                          ? 'translate-x-3 scale-105' 
                          : ''
                      }`}
                      style={{
                        transformOrigin: 'bottom center',
                        transform: 'scaleX(-1)',
                        animation: isEnemyHit || turnOwner === 'enemy' ? 'none' : 'rpgBossBreath 3.2s ease-in-out infinite'
                      }}
                    />
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* ======================================================== */}
          {/* 3. POCKET REVO TACTICAL COMMAND BAR AT BOTTOM           */}
          {/* ======================================================== */}
          <div className="w-full bg-white border-2 border-slate-800 shadow-[4px_4px_0px_#1e293b] rounded-2xl p-3 sm:p-4 z-30 space-y-3 mt-3">
            
            {/* Tactical Action Choice Capsules (When a move is active) */}
            {activeSkill && turnOwner === 'player' && (
              <div className="max-w-4xl mx-auto p-3.5 sm:p-4 rounded-2xl bg-[#faf6ee] border-2 border-slate-800 shadow-[4px_4px_0px_#1e293b] space-y-2.5 animate-scale-up text-slate-900">
                <div className="flex items-center justify-between border-b-2 border-slate-300 pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md font-mono text-[9px] font-black uppercase text-white ${
                      activeSkill === 's3' ? 'bg-rose-600' : 'bg-purple-600'
                    }`}>
                      {activeSkill === 's3' ? 'JURUS 3 &bull; ULTIMATE FINISHER' : 'JURUS 2 &bull; SOAL MENDEL'}
                    </span>
                    <span className="text-xs font-black text-slate-900 font-sans">
                      {activeSkill === 's3' ? 'Badai Dihibrid (-35 HP Musuh jika Benar)' : 'Hantaman Mendel (-25 HP Musuh jika Benar)'}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveSkill(null)}
                    className="text-[10px] font-mono font-bold text-slate-500 hover:text-slate-900 underline cursor-pointer"
                  >
                    Batal
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-white border-2 border-slate-800 shadow-[2px_2px_0px_#1e293b] space-y-1">
                  <span className="text-[10px] font-mono font-bold text-rose-700 block">
                    ⚠️ Aturan: Jawab BENAR kurangi darah musuh, Jawab SALAH darahmu yang berkurang!
                  </span>
                  <p className="text-xs sm:text-sm text-slate-900 font-sans font-black leading-relaxed">
                    {activeSkill === 's3' 
                      ? JURUS_3_QUESTIONS[q3Idx % JURUS_3_QUESTIONS.length].prompt 
                      : JURUS_2_QUESTIONS[q2Idx % JURUS_2_QUESTIONS.length].prompt}
                  </p>
                </div>

                {/* 4 Rapid Action Capsules (Exact Stage 2 Allele Buttons Theme!) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {(activeSkill === 's3' 
                    ? JURUS_3_QUESTIONS[q3Idx % JURUS_3_QUESTIONS.length].options 
                    : JURUS_2_QUESTIONS[q2Idx % JURUS_2_QUESTIONS.length].options
                  ).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleAnswerSelection(opt)}
                      className="p-3 rounded-xl bg-white hover:bg-purple-100 text-slate-900 font-mono font-black text-xs sm:text-sm border-2 border-slate-800 shadow-[3px_3px_0px_#1e293b] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer transition text-left flex items-center justify-between"
                    >
                      <span>{opt}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Turn-Based Command Dock Buttons (Harmonized with Stage 2 Colors) */}
            <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
              
              {/* Skill 1: Instant Quick Attack (Skip Soal, -10 Musuh, -5 Diri, CD 3 Ronde) */}
              <button
                onClick={handleExecuteSkill1}
                disabled={turnOwner !== 'player' || skill1Cd > 0}
                className={`flex-1 min-w-[140px] p-2.5 sm:p-3 rounded-2xl border-2 transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-left ${
                  skill1Cd === 0 && turnOwner === 'player'
                    ? 'bg-[#fef08a] hover:bg-[#fde047] text-slate-950 border-slate-800 shadow-[3px_3px_0px_#1e293b] cursor-pointer'
                    : 'bg-slate-100 border-slate-300 text-slate-400 opacity-60 cursor-not-allowed shadow-none'
                }`}
                title={skill1Cd === 0 ? "Langsung serang tanpa soal! -10 HP Musuh, -5 HP Diri. Cooldown 3 Ronde." : `Jurus 1 Cooldown! Tunggu ${skill1Cd} ronde.`}
              >
                <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-mono font-bold uppercase">
                  <span className={skill1Cd === 0 ? "text-amber-950 font-black" : "text-slate-400"}>JURUS 1</span>
                  <span className={skill1Cd === 0 ? "text-rose-700 font-black" : "text-slate-400"}>
                    {skill1Cd === 0 ? "SKIP SOAL ⚡" : `CD: ${skill1Cd} RONDE`}
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-black font-sans truncate text-slate-900 mt-0.5">
                  Tusukan Kilat
                </div>
                <div className="text-[9px] font-mono text-slate-600 mt-0.5 font-bold">
                  {skill1Cd === 0 ? "-10 HP Musuh | -5 HP Diri" : `Tersedia dalam ${skill1Cd} ronde`}
                </div>
              </button>

              {/* Skill 2: Soal Genetika Monohibrid (Benar: -25 Musuh, Salah: -15 Diri) */}
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveSkill('s2');
                }}
                disabled={turnOwner !== 'player'}
                className={`flex-1 min-w-[140px] p-2.5 sm:p-3 rounded-2xl border-2 transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-left cursor-pointer ${
                  turnOwner === 'player'
                    ? 'bg-[#c084fc] hover:bg-[#a855f7] text-slate-950 border-slate-800 shadow-[3px_3px_0px_#1e293b]'
                    : 'bg-slate-100 border-slate-300 text-slate-400 opacity-60 cursor-not-allowed'
                }`}
                title="Serangan berbasis soal: Jawab benar kurangi 25 HP musuh, salah kurangi 15 HP diri!"
              >
                <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-mono font-bold uppercase text-purple-950">
                  <span>JURUS 2</span>
                  <span className="font-black">SOAL MENDEL 🧠</span>
                </div>
                <div className="text-xs sm:text-sm font-black font-sans truncate text-slate-950 mt-0.5">
                  Hantaman Mendel
                </div>
                <div className="text-[9px] font-mono text-purple-900 mt-0.5 font-bold">
                  Benar: -25 HP | Salah: -15 HP
                </div>
              </button>

              {/* Skill 3: Ultimate Dihybrid (Hanya saat musuh sekarat <= 35 HP!) */}
              <button
                onClick={() => {
                  if (!isBossSekarat) return;
                  sound.playClick();
                  setActiveSkill('s3');
                }}
                disabled={turnOwner !== 'player' || !isBossSekarat}
                className={`flex-1 min-w-[140px] p-2.5 sm:p-3 rounded-2xl border-2 transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-left ${
                  isBossSekarat && turnOwner === 'player'
                    ? 'bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 text-slate-950 font-black border-slate-800 shadow-[4px_4px_0px_#1e293b] animate-bounce cursor-pointer ring-2 ring-amber-400'
                    : 'bg-slate-100 border-slate-300 text-slate-400 opacity-60 cursor-not-allowed shadow-none'
                }`}
                title={isBossSekarat ? "Jurus Pamungkas Siap! Jawab benar -35 HP Dr. Chaos!" : "Terkunci! Hanya bisa diakses saat musuh sekarat (≤ 35 HP)."}
              >
                <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-mono font-bold uppercase">
                  <span className={isBossSekarat ? "text-white font-black" : "text-slate-400"}>JURUS 3</span>
                  <span className={isBossSekarat ? "text-amber-200 font-black animate-pulse" : "text-slate-400"}>
                    {isBossSekarat ? "🔥 SIAP EKSEKUSI!" : "🔒 TERKUNCI"}
                  </span>
                </div>
                <div className={`text-xs sm:text-sm font-black font-sans truncate mt-0.5 ${
                  isBossSekarat ? "text-white" : "text-slate-400"
                }`}>
                  Badai Dihibrid
                </div>
                <div className={`text-[9px] font-mono mt-0.5 font-bold ${
                  isBossSekarat ? "text-amber-100" : "text-slate-400"
                }`}>
                  {isBossSekarat ? "Finisher: -35 HP | Salah: -20 HP" : "Hanya aktif saat HP Musuh ≤ 35%"}
                </div>
              </button>

              {/* Utility: Guard Button */}
              <button
                onClick={handleGuard}
                disabled={turnOwner !== 'player'}
                className="px-3.5 py-2.5 sm:py-3 rounded-2xl bg-white hover:bg-sky-50 text-slate-800 font-bold text-xs border-2 border-slate-800 shadow-[3px_3px_0px_#1e293b] flex items-center gap-1.5 cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition"
                title="Tangkis 60% damage musuh"
              >
                <Shield className="w-4 h-4 text-sky-600" />
                <span className="hidden sm:inline">Bertahan</span>
              </button>

              {/* Utility: Potion Button */}
              <button
                onClick={handleHeal}
                disabled={turnOwner !== 'player' || potionCount <= 0 || playerHp >= 100}
                className={`px-3.5 py-2.5 sm:py-3 rounded-2xl font-bold text-xs border-2 flex items-center gap-1.5 transition ${
                  potionCount > 0 && playerHp < 100
                    ? 'bg-white hover:bg-emerald-50 text-slate-800 border-slate-800 shadow-[3px_3px_0px_#1e293b] cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
                    : 'bg-slate-100 text-slate-400 border-slate-300 cursor-not-allowed'
                }`}
                title="Pulihkan +35 HP"
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Ramuan ({potionCount})</span>
              </button>

            </div>

            {/* Stage 2 Yellow Hint Box at Bottom */}
            <div className="max-w-4xl mx-auto p-2.5 rounded-xl bg-[#fef9c3] border-2 border-slate-800 shadow-[2px_2px_0px_#1e293b] flex items-center justify-between text-[11px] text-slate-900 font-bold">
              <div className="flex items-center gap-2">
                <span className="text-amber-600">💡</span>
                <span>
                  Jurus 1 instan skip soal (-10 Musuh, -5 Diri, CD 3 ronde). Jurus 2 &amp; 3 berbasis soal (Benar kurangi musuh, Salah kurangi diri). Jurus 3 aktif saat musuh sekarat (&le;35 HP)!
                </span>
              </div>
              <span className="font-mono text-[9px] text-slate-600 uppercase hidden sm:inline">Tactical Duel</span>
            </div>
          </div>
        </>
      ) : bossDefeated ? (
        /* ======================================================== */
        /* 4. VICTORY SCREEN WITH MENDEL EXPERT MEDAL BADGE         */
        /* ======================================================== */
        <div className="p-8 sm:p-12 rounded-3xl text-center space-y-6 max-w-lg mx-auto my-auto bg-white border-2 border-slate-800 shadow-[6px_6px_0px_#1e293b] z-40 text-slate-900">
          
          <div className="relative w-36 h-36 mx-auto">
            <img 
              src="/assets/mendel_expert_badge.webp" 
              alt="Mendel Expert Medal" 
              className="w-full h-full object-contain drop-shadow-2xl float-anim"
            />
          </div>

          <div className="space-y-2">
            <div className="inline-block px-4 py-1 rounded-full bg-amber-100 border border-amber-400 text-amber-900 font-black text-xs uppercase tracking-widest">
              VICTORY &bull; BOSS DEFEATED!
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-sans">
              DR. CHAOS BERHASIL DITUMBANGKAN!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              Selamat {playerName}! Kamu berhasil menuntaskan seluruh duel sains hukum genetika. Pengetahuan pewarisan sifat Mendel telah sepenuhnya kamu kuasai!
            </p>
          </div>

          {/* 3 Stars */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map(s => (
              <Star key={s} className="w-8 h-8 text-amber-400 fill-amber-400 animate-pulse" />
            ))}
          </div>

          <div className="p-4 bg-[#fef9c3] rounded-2xl border-2 border-slate-800 shadow-[3px_3px_0px_#1e293b] text-slate-900 space-y-1">
            <div className="text-[10px] text-slate-700 font-mono font-bold uppercase tracking-wider">Total Skor Pertarungan:</div>
            <div className="text-3xl font-black font-mono text-amber-900">{score + 1000} PTS</div>
            <div className="text-xs font-bold text-emerald-800 pt-0.5">
              Lencana Emas: Mendel Expert Badge
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            {sourceWorldView === 'rpg-world' ? (
              <button
                onClick={() => navigateTo('rpg-world')}
                className="w-full px-6 py-3.5 rounded-2xl bg-[#c084fc] hover:bg-[#a855f7] text-slate-950 font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-[4px_4px_0px_#1e293b] border-2 border-slate-800 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition cursor-pointer"
              >
                <span>KEMBALI KE RPG WORLD</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigateTo('main-menu')}
                  className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border-2 border-slate-800 shadow-[3px_3px_0px_#1e293b]"
                >
                  MENU UTAMA
                </button>
                <button
                  onClick={() => navigateTo('hots-quiz')}
                  className="px-6 py-3.5 rounded-2xl bg-[#c084fc] hover:bg-[#a855f7] text-slate-950 font-black text-xs shadow-[3px_3px_0px_#1e293b] border-2 border-slate-800 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>MULAI KUIS HOTS</span>
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* 5. PLAYER DEFEATED SCREEN (RETRY)                        */
        /* ======================================================== */
        <div className="p-8 rounded-3xl text-center space-y-6 max-w-md mx-auto my-auto bg-white border-2 border-slate-800 shadow-[6px_6px_0px_#1e293b] z-40 text-slate-900">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 border-2 border-slate-800 text-rose-600 flex items-center justify-center mx-auto shadow-[3px_3px_0px_#1e293b]">
            <XCircle className="w-8 h-8 stroke-[2.5px]" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-2xl font-black text-slate-900 font-sans">
              HP KARAKTER HABIS!
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Serangan mutagen Dr. Chaos menumbangkanmu. Jangan menyerah! Pasang strategi bertahan atau minum ramuan pemulih sebelum melancarkan serangan berikutnya!
            </p>
          </div>

          <button
            onClick={handleRestart}
            className="w-full py-3.5 rounded-2xl bg-[#fef08a] hover:bg-[#fde047] text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-slate-800 shadow-[4px_4px_0px_#1e293b] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>COBA LAGI PERTARUNGAN (RETRY)</span>
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL PANDUAN CARA BERTARUNG (STAGE 8 BOSS BATTLE)      */}
      {/* ======================================================== */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in text-left">
          <div className="w-full max-w-lg bg-[#faf6ee] border-4 border-slate-800 shadow-[8px_8px_0px_#1e293b] rounded-3xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto text-slate-900 relative">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#fef08a] border-2 border-slate-800 flex items-center justify-center shadow-[2px_2px_0px_#1e293b]">
                  <BookOpen className="w-5 h-5 text-amber-900" />
                </div>
                <div>
                  <span className="text-[9px] font-black text-rose-700 uppercase tracking-widest font-mono block">
                    PANDUAN STAGE 8 &bull; FINAL BOSS
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 font-sans">
                    Cara Bertarung: Duel Dr. Chaos
                  </h3>
                </div>
              </div>
              
              <button
                onClick={() => {
                  sound.playClick();
                  setShowTutorial(false);
                }}
                className="p-1.5 rounded-xl bg-white hover:bg-rose-50 border-2 border-slate-800 text-slate-700 hover:text-rose-600 shadow-[2px_2px_0px_#1e293b] cursor-pointer active:translate-y-0.5"
              >
                <X className="w-4 h-4 stroke-[3px]" />
              </button>
            </div>

            {/* Misi & Sistem Duel */}
            <div className="p-3.5 rounded-2xl bg-white border-2 border-slate-800 shadow-[3px_3px_0px_#1e293b] space-y-1.5">
              <div className="flex items-center gap-2 text-rose-700 font-mono font-black text-xs">
                <Flame className="w-4 h-4 text-rose-600" />
                <span>SISTEM PERTARUNGAN TURN-BASED RPG</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">
                Kamu dan Dr. Chaos saling menyerang secara bergantian (Turn). Tumbangkan HP Dr. Chaos (100 HP) menjadi 0 sebelum batas <strong>15 Turn</strong> berakhir!
              </p>
            </div>

            {/* Pilihan Aksi di Giliranmu */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-black font-mono text-slate-900 uppercase tracking-wider">
                Aturan &amp; Mekanisme Jurus Pertarungan:
              </h4>

              {/* Jurus 1 */}
              <div className="p-3 rounded-xl bg-white border-2 border-slate-800 shadow-[2px_2px_0px_#1e293b] flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#fef08a] border-2 border-slate-800 flex items-center justify-center font-mono font-black text-xs text-amber-950 flex-shrink-0 shadow-xs">
                  ⚡
                </div>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-black text-slate-900 font-sans">
                    Jurus 1: Tusukan Kilat (Skip Pertanyaan)
                  </h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Serangan instan tanpa menjawab soal! <strong>Mengurangi 10 HP Dr. Chaos</strong> dan <strong>mengurangi 5 HP dirimu</strong> (recoil). Memiliki <strong>Cooldown (CD) 3 Ronde</strong>.
                  </p>
                </div>
              </div>

              {/* Jurus 2 */}
              <div className="p-3 rounded-xl bg-white border-2 border-slate-800 shadow-[2px_2px_0px_#1e293b] flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#c084fc] border-2 border-slate-800 flex items-center justify-center font-mono font-black text-xs text-slate-950 flex-shrink-0 shadow-xs">
                  🧠
                </div>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-black text-slate-900 font-sans">
                    Jurus 2: Hantaman Mendel (Berbasis Soal)
                  </h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Jawab pertanyaan hukum pewarisan sifat. Jika <strong>BENAR</strong>, Dr. Chaos terkena <strong>-25 HP</strong>. Jika <strong>SALAH</strong>, darahmu yang berkurang <strong>-15 HP</strong>!
                  </p>
                </div>
              </div>

              {/* Jurus 3 */}
              <div className="p-3 rounded-xl bg-white border-2 border-slate-800 shadow-[2px_2px_0px_#1e293b] flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-amber-400 to-rose-500 border-2 border-slate-800 flex items-center justify-center font-mono font-black text-xs text-slate-950 flex-shrink-0 shadow-xs">
                  🔥
                </div>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-black text-slate-900 font-sans">
                    Jurus 3: Badai Dihibrid (Hanya Saat Musuh Sekarat!)
                  </h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Hanya bisa diakses ketika darah Dr. Chaos sedang <strong>SEKARAT (&le; 35 HP)</strong>! Jika <strong>BENAR</strong>, mengeksekusi Finisher <strong>-35 HP</strong> penumbang Dr. Chaos! Jika <strong>SALAH</strong>, kamu terkena serangan balik <strong>-20 HP</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Tombol Mengerti */}
            <button
              onClick={() => {
                sound.playClick();
                setShowTutorial(false);
              }}
              className="w-full py-3 rounded-2xl bg-[#c084fc] hover:bg-[#a855f7] text-slate-950 font-black text-xs sm:text-sm border-2 border-slate-800 shadow-[4px_4px_0px_#1e293b] cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition text-center font-sans tracking-wide"
            >
              SIAP BERTARUNG, KALAHKAN DR. CHAOS! ⚔️
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
