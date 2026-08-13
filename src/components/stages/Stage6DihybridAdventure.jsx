import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { STAGES } from '../../data/geneticsData';
import { sound } from '../../services/sound';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Star,
  RefreshCw,
  ChevronLeft,
  Info
} from 'lucide-react';

// SeedIcon Component for phenotype visualization
const SeedIcon = ({ genotypeOrPhenotype, size = 20 }) => {
  let isRound = true;
  let isYellow = true;

  if (!genotypeOrPhenotype.includes(' ')) {
    // Genotype parsing (e.g. 'AaBb')
    isRound = genotypeOrPhenotype.includes('A');
    isYellow = genotypeOrPhenotype.includes('B');
  } else {
    // Phenotype label parsing (e.g. 'Bulat Kuning')
    isRound = genotypeOrPhenotype.includes('Bulat');
    isYellow = genotypeOrPhenotype.includes('Kuning');
  }
  
  const fill = isYellow ? '#facc15' : '#4ade80'; // Yellow vs Green
  const stroke = '#1e293b'; // Slate 800
  
  if (isRound) {
    // Smooth circle
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block flex-shrink-0 animate-scale-up">
        <circle cx="12" cy="12" r="8.5" fill={fill} stroke={stroke} strokeWidth="2" />
        <path d="M 9.5 9.5 Q 12 8 14.5 9.5" stroke="#ffffff" strokeWidth="1" opacity="0.6" strokeLinecap="round" />
      </svg>
    );
  } else {
    // Wrinkled path
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block flex-shrink-0 animate-scale-up">
        <path 
          d="M12,4 C14.5,3.5 16,5 17,6.5 C18,8 17.5,9.5 18.5,11 C19.5,12.5 20,14 19.5,15.5 C19,17 17.5,17.5 16.5,18.5 C15.5,19.5 13.5,20 12,19.5 C10.5,20 8.5,19.5 7.5,18.5 C6.5,17.5 5,17 4.5,15.5 C4,14 4.5,12.5 5.5,11 C6.5,9.5 6,8 7,6.5 C8,5 9.5,3.5 12,4 Z" 
          fill={fill} 
          stroke={stroke} 
          strokeWidth="2" 
          strokeLinejoin="round"
        />
        <path d="M9 10 Q 11 11 10 13" stroke={stroke} strokeWidth="1" opacity="0.4" strokeLinecap="round" />
        <path d="M14 9 Q 13 12 15 13" stroke={stroke} strokeWidth="1" opacity="0.4" strokeLinecap="round" />
      </svg>
    );
  }
};

export const Stage6DihybridAdventure = () => {
  const { navigateTo, completeStage } = useGame();
  
  // Game round state: 1 = Genotypes (Letters), 2 = Phenotypes (Images)
  const [round, setRound] = useState(1);
  // Steps: 1 = placing gametes, 2 = crossing cells, 3 = ratio selection, 4 = intermediate round transition
  const [step, setStep] = useState(1);

  // Parents and gametes are fixed for the classic AaBb x AaBb cross
  const parentGenotype = 'AaBb';
  const expectedGametes = ['AB', 'Ab', 'aB', 'ab'];

  // State management for gamete headers assignment
  const [assignedCols, setAssignedCols] = useState([null, null, null, null]);
  const [assignedRows, setAssignedRows] = useState([null, null, null, null]);
  const [activeHeaderSlot, setActiveHeaderSlot] = useState(null); // null | { type: 'col' | 'row', index: number }

  // Offspring grid cells state (either contains genotype code like 'AaBb' or phenotype label like 'Bulat Kuning')
  const [gridCells, setGridCells] = useState([
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', '']
  ]);
  const [activeCell, setActiveCell] = useState(null); // [r, c]
  const [activeOptions, setActiveOptions] = useState([]);
  const [incorrectCells, setIncorrectCells] = useState([]);
  
  // Ratio state states
  const [ratioAnswer, setRatioAnswer] = useState('');
  
  // Feedback and progress
  const [feedback, setFeedback] = useState(null);
  const [stageCompleted, setStageCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const stageInfo = STAGES.find(s => s.id === 6);

  // Helper to sort alleles of the same gene (uppercase first, then lowercase)
  const combineGametes = (g1, g2) => {
    if (!g1 || !g2) return '????';
    const sortAlleles = (char1, char2) => {
      if (char1 === char1.toUpperCase() && char2 === char2.toLowerCase()) return -1;
      if (char1 === char2.toLowerCase() && char2 === char1.toUpperCase()) return 1;
      return char1.localeCompare(char2);
    };
    const sortedA = [g1[0], g2[0]].sort(sortAlleles).join('');
    const sortedB = [g1[1], g2[1]].sort(sortAlleles).join('');
    return sortedA + sortedB;
  };

  // Phenotype identification and color coding
  const getPhenotypeInfo = (genotype) => {
    const isRound = genotype.includes('A');
    const isYellow = genotype.includes('B');
    
    if (isRound && isYellow) {
      return {
        label: 'Bulat Kuning',
        bgClass: 'bg-amber-100 border-amber-400 text-amber-900',
        badgeClass: 'bg-amber-500 text-white'
      };
    } else if (isRound && !isYellow) {
      return {
        label: 'Bulat Hijau',
        bgClass: 'bg-lime-100 border-lime-400 text-lime-900',
        badgeClass: 'bg-lime-500 text-white'
      };
    } else if (!isRound && isYellow) {
      return {
        label: 'Keriput Kuning',
        bgClass: 'bg-orange-100 border-orange-400 text-orange-950',
        badgeClass: 'bg-orange-500 text-white'
      };
    } else {
      return {
        label: 'Keriput Hijau',
        bgClass: 'bg-emerald-100 border-emerald-400 text-emerald-900',
        badgeClass: 'bg-emerald-500 text-white'
      };
    }
  };

  const handleSelectHeaderSlot = (type, index) => {
    if (step !== 1) return;
    sound.playClick();
    
    // Toggle active slot
    if (activeHeaderSlot && activeHeaderSlot.type === type && activeHeaderSlot.index === index) {
      setActiveHeaderSlot(null);
    } else {
      setActiveHeaderSlot({ type, index });
    }
    setFeedback(null);
  };

  const handleSelectHeaderGameteOption = (g) => {
    if (!activeHeaderSlot) return;
    sound.playClick();
    
    const { type, index } = activeHeaderSlot;
    if (type === 'col') {
      const nextCols = [...assignedCols];
      // Clear duplicate gamete if already placed
      const existingIdx = nextCols.indexOf(g);
      if (existingIdx !== -1) {
        nextCols[existingIdx] = null;
      }
      nextCols[index] = g;
      setAssignedCols(nextCols);
    } else {
      const nextRows = [...assignedRows];
      const existingIdx = nextRows.indexOf(g);
      if (existingIdx !== -1) {
        nextRows[existingIdx] = null;
      }
      nextRows[index] = g;
      setAssignedRows(nextRows);
    }
    
    setActiveHeaderSlot(null);
    setFeedback(null);
  };

  const checkGametesMatch = (assigned, expected) => {
    const sortedAssigned = [...assigned].sort();
    const sortedExpected = [...expected].sort();
    return sortedAssigned.every((val, idx) => val === sortedExpected[idx]);
  };

  const handleVerifyGametes = () => {
    const colsComplete = assignedCols.every(c => c !== null);
    const rowsComplete = assignedRows.every(r => r !== null);
    
    if (!colsComplete || !rowsComplete) {
      sound.playWrong();
      setFeedback({
        type: 'error',
        message: 'Lengkapi semua baris dan kolom gamet terlebih dahulu!'
      });
      return;
    }

    const colsMatch = checkGametesMatch(assignedCols, expectedGametes);
    const rowsMatch = checkGametesMatch(assignedRows, expectedGametes);

    if (colsMatch && rowsMatch) {
      sound.playCorrect();
      setScore(prev => prev + 100);
      setFeedback({
        type: 'success',
        message: 'Luar biasa! Kombinasi gamet kolom & baris dihibrid telah disusun secara tepat.'
      });
      
      setTimeout(() => {
        setStep(2);
        setFeedback(null);
      }, 2000);
    } else {
      sound.playWrong();
      setFeedback({
        type: 'error',
        message: 'Susunan gamet ada yang keliru. Perhatikan alel yang dimiliki oleh masing-masing induk!'
      });
    }
  };

  // Generate cell options (either genotype candidates or the 4 phenotype icons)
  const handleCellSelect = (r, c) => {
    if (step !== 2) return;
    sound.playClick();
    setActiveCell([r, c]);

    if (round === 1) {
      // Round 1 options: Correct genotype + 2 distractors
      const correct = combineGametes(assignedRows[r], assignedCols[c]);
      const allPossible = [
        'AABB', 'AABb', 'Aabb', 'AaBB', 'AaBb', 'Aabb', 'aaBB', 'aaBb', 'aabb'
      ];
      const distractors = allPossible.filter(g => g !== correct);
      const shuffledDistractors = distractors.sort(() => 0.5 - Math.random());
      const opts = [correct, shuffledDistractors[0], shuffledDistractors[1]].sort();
      setActiveOptions(opts);
    } else {
      // Round 2 options: All 4 phenotype options
      setActiveOptions(['Bulat Kuning', 'Bulat Hijau', 'Keriput Kuning', 'Keriput Hijau']);
    }
  };

  const handleSelectCellOption = (option) => {
    if (!activeCell) return;
    sound.playClick();
    const [r, c] = activeCell;
    const nextCells = [...gridCells];
    nextCells[r][c] = option;
    setGridCells(nextCells);
    
    // Clear incorrect flag for this cell
    setIncorrectCells(incorrectCells.filter(cell => cell[0] !== r || cell[1] !== c));
    setActiveCell(null);
  };

  const handleVerifyCells = () => {
    const allFilled = gridCells.every(row => row.every(val => val !== ''));
    if (!allFilled) {
      sound.playWrong();
      setFeedback({
        type: 'error',
        message: 'Isi seluruh 16 kotak Punnett terlebih dahulu!'
      });
      return;
    }

    const wrong = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const correctGenotype = combineGametes(assignedRows[r], assignedCols[c]);
        
        if (round === 1) {
          // Verify genotype letter matches
          if (gridCells[r][c] !== correctGenotype) {
            wrong.push([r, c]);
          }
        } else {
          // Verify phenotype label matches
          const expectedPhenotype = getPhenotypeInfo(correctGenotype).label;
          if (gridCells[r][c] !== expectedPhenotype) {
            wrong.push([r, c]);
          }
        }
      }
    }

    if (wrong.length === 0) {
      sound.playCorrect();
      setScore(prev => prev + 150);
      setFeedback({
        type: 'success',
        message: 'Tepat sekali! Seluruh 16 kotak Punnett telah disilangkan dengan benar.'
      });

      setTimeout(() => {
        setStep(3);
        setFeedback(null);
      }, 2000);
    } else {
      sound.playWrong();
      setIncorrectCells(wrong);
      setFeedback({
        type: 'error',
        message: `Ada ${wrong.length} kotak hasil persilangan yang kurang tepat. Periksa sel bertanda merah!`
      });
    }
  };

  const handleVerifyRatio = () => {
    if (ratioAnswer === '9:3:3:1' || ratioAnswer === '9 : 3 : 3 : 1') {
      sound.playCorrect();
      setScore(prev => prev + 250);
      
      if (round === 1) {
        // Complete Round 1 -> show transition
        setFeedback({
          type: 'success',
          message: 'Benar! Rasio fenotipe F2 Dihibrid adalah 9:3:3:1. Bagian 1 Selesai! Klik tombol di bawah untuk lanjut ke Bagian 2 (Model Gambar).'
        });
        setTimeout(() => {
          setStep(4); // intermediate transition step
          setFeedback(null);
        }, 2000);
      } else {
        // Complete Round 2 -> Victory screen!
        setFeedback({
          type: 'success',
          message: 'Benar! Rasio fenotipe F2 Dihibrid adalah 9:3:3:1. Stage 6 sepenuhnya selesai!'
        });
        setTimeout(() => {
          setStageCompleted(true);
          sound.playFanfare();
          try { confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } }); } catch(e){}
          completeStage(6, 3, score + 250, 100, 60);
        }, 2000);
      }
    } else {
      sound.playWrong();
      setFeedback({
        type: 'error',
        message: 'Rasio fenotipe yang dipilih kurang tepat. Hitung perbandingan fenotipe secara teliti!'
      });
    }
  };

  const handleTransitionToRound2 = () => {
    sound.playClick();
    setRound(2);
    setStep(1);
    setAssignedCols([null, null, null, null]);
    setAssignedRows([null, null, null, null]);
    setGridCells([
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', '']
    ]);
    setActiveCell(null);
    setIncorrectCells([]);
    setRatioAnswer('');
    setFeedback(null);
  };

  const handleResetGrid = () => {
    sound.playClick();
    setAssignedCols([null, null, null, null]);
    setAssignedRows([null, null, null, null]);
    setActiveHeaderSlot(null);
    setGridCells([
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', '']
    ]);
    setActiveCell(null);
    setIncorrectCells([]);
    setRatioAnswer('');
    setFeedback(null);
    setStep(1);
  };

  return (
    <div className="w-full h-screen relative overflow-hidden bg-[#faf6ee] select-none flex flex-col p-4 text-left">
      {/* Parchment background effect */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] z-0" />

      {/* Floating HUD */}
      <div className="w-full p-3 rounded-2xl bg-white border-2 border-slate-800 shadow-[4px_4px_0px_#1e293b] flex items-center justify-between gap-2 z-30 relative mb-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('map')}
            className="p-1.5 rounded-xl bg-white border-2 border-slate-800 text-slate-700 hover:text-sky-600 transition shadow-3xs cursor-pointer flex-shrink-0 active:translate-y-0.5"
            title="Kembali ke Peta"
          >
            <ChevronLeft className="w-4 h-4 stroke-[3px]" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border-2 border-slate-800 p-0.5 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img 
                src="/assets/rumah_mendel_banner.png" 
                alt="Genetics Lab Banner" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-[7px] font-black text-indigo-700 uppercase tracking-widest font-sans block">
                {stageInfo?.location || 'Pusat Penelitian'} &bull; STAGE 6
              </span>
              <h2 className="text-[11px] sm:text-xs font-black text-black leading-tight">
                {stageInfo?.title || 'Petualangan Dihibrid'}
              </h2>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Active Round indicator */}
          <div className="px-2.5 py-1 rounded-xl bg-indigo-500/10 border-2 border-slate-800 text-[9px] font-black text-indigo-900">
            Bagian {round}/2
          </div>

          <div className="flex items-center gap-1.5 bg-amber-500/10 border-2 border-slate-800 px-3 py-1 rounded-xl shadow-3xs">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-[10px] font-black text-amber-900 font-mono font-bold">Skor: {score}</span>
          </div>
        </div>
      </div>

      {!stageCompleted ? (
        <div className="flex-1 flex flex-col justify-between relative z-10 py-1 overflow-y-auto">
          
          {step === 4 ? (
            /* Intermediate Round Transition Screen */
            <div className="bg-white border-2 border-slate-800 rounded-3xl p-6 shadow-[4px_4px_0px_#1e293b] text-center space-y-4 max-w-sm mx-auto my-auto animate-scale-up">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border-2 border-slate-800 flex items-center justify-center mx-auto shadow-3xs">
                <span className="text-xl font-black text-indigo-700">2</span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-black text-slate-800">BAGIAN 1 SELESAI!</h3>
                <p className="text-[10.5px] text-slate-600 font-bold leading-relaxed px-1">
                  Luar biasa! Kamu berhasil menuntaskan persilangan dihibrid model huruf (genotipe).
                  Sekarang, tantangan berikutnya adalah melakukan persilangan secara visual menggunakan model gambar fenotipe biji ercis.
                </p>
              </div>
              <button
                onClick={handleTransitionToRound2}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-black text-xs shadow-[3px_3px_0px_#1e293b] flex items-center justify-center gap-2 border-2 border-slate-800 cursor-pointer active:translate-y-0.5 active:shadow-none hover:scale-[1.02] transition-all"
              >
                <span>LANJUT KE BAGIAN 2</span>
                <ArrowRight className="w-4 h-4 stroke-[3px]" />
              </button>
            </div>
          ) : (
            /* Main Game Board Card */
            <div className="bg-[#faf6ee] border-2 border-slate-800 rounded-3xl p-4 sm:p-5 shadow-[4px_4px_0px_#1e293b] flex flex-col gap-3.5 relative overflow-hidden flex-shrink-0">
              
              {/* Stage Title */}
              <div className="border-b-2 border-slate-800 pb-2 flex justify-between items-center">
                <div>
                  <h1 className="text-sm font-black text-slate-800 tracking-wide uppercase">
                    8. STAGE 6 - DIHYBRID ADVENTURE
                  </h1>
                  <p className="text-[9.5px] font-bold text-slate-500 mt-0.5">
                    Bagian {round}: {round === 1 ? 'Model Huruf (Genotipe)' : 'Model Gambar (Fenotipe)'} &bull; {' '}
                    {step === 1 && 'Susun kombinasi gamet dari masing-masing induk dihibrid!'}
                    {step === 2 && 'Tentukan hasil persilangan untuk setiap kotak Punnett!'}
                    {step === 3 && 'Pilih rasio fenotipe F2 yang terbentuk dari persilangan!'}
                  </p>
                </div>
              </div>

              {/* Board and interactive panels */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                
                {/* Left controls column */}
                <div className="sm:col-span-5 space-y-3 w-full">
                  
                  {/* Induk display info */}
                  <div className="bg-amber-50/60 border border-slate-350 rounded-2xl p-3 flex flex-col items-center shadow-3xs">
                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
                      Parental Cross
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1.5 rounded-xl border border-slate-800 bg-white font-mono font-black text-xs shadow-3xs">
                        Induk : {parentGenotype}
                      </div>
                      <span className="text-slate-800 font-extrabold text-sm">✕</span>
                      <div className="px-3 py-1.5 rounded-xl border border-slate-800 bg-white font-mono font-black text-xs shadow-3xs">
                        {parentGenotype}
                      </div>
                    </div>
                  </div>

                  {/* Step 1 controls (Gamete headers selection) */}
                  {step === 1 && (
                    <div className="bg-white border border-slate-350 rounded-2xl p-3 shadow-3xs space-y-2 text-center">
                      <span className="text-[8px] font-black text-indigo-700 uppercase tracking-widest block">
                        Susun Gamet
                      </span>
                      
                      {activeHeaderSlot ? (
                        <div className="space-y-1.5 animate-scale-up">
                          <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block">
                            Pilih gamet untuk slot aktif:
                          </span>
                          <div className="flex justify-center gap-2">
                            {expectedGametes.map((g) => (
                              <button
                                key={`opt-gamete-${g}`}
                                onClick={() => handleSelectHeaderGameteOption(g)}
                                className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-800 font-mono font-black text-xs shadow-3xs cursor-pointer active:translate-y-0.5 hover:scale-105 transition-all flex items-center justify-center min-w-[50px] min-h-[44px]"
                              >
                                {round === 1 ? g : <SeedIcon genotypeOrPhenotype={g} size={22} />}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-50 border border-dashed border-slate-350 rounded-xl text-[9px] font-bold text-slate-500 flex items-center gap-1.5 justify-center leading-normal">
                          <Info className="w-4 h-4 text-indigo-650 flex-shrink-0" />
                          <span>Ketuk salah satu slot tanda tanya (?) di kolom atas atau baris kiri untuk memilih gametnya.</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2 controls (Offspring cell filling) */}
                  {step === 2 && (
                    <div className="bg-white border border-slate-350 rounded-2xl p-3 shadow-3xs space-y-2 text-center">
                      <span className="text-[8px] font-black text-indigo-700 uppercase tracking-widest block">
                        Isi Genotipe Keturunan
                      </span>
                      
                      {activeCell ? (
                        <div className="space-y-1.5 animate-scale-up">
                          <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block">
                            Pilih hasil persilangan untuk slot terpilih:
                          </span>
                          
                          {round === 1 ? (
                            /* Genotype letters buttons */
                            <div className="flex justify-center gap-2">
                              {activeOptions.map((opt) => (
                                <button
                                  key={`opt-${opt}`}
                                  onClick={() => handleSelectCellOption(opt)}
                                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-800 font-mono font-black text-xs shadow-3xs cursor-pointer active:translate-y-0.5 hover:scale-105 transition-all"
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          ) : (
                            /* Phenotype images/text buttons */
                            <div className="grid grid-cols-2 gap-2">
                              {activeOptions.map((opt) => (
                                <button
                                  key={`opt-${opt}`}
                                  onClick={() => handleSelectCellOption(opt)}
                                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-800 font-sans font-bold text-[9px] shadow-3xs cursor-pointer active:translate-y-0.5 hover:scale-[1.02] flex items-center justify-center gap-1.5"
                                >
                                  <SeedIcon genotypeOrPhenotype={opt} size={15} />
                                  <span>{opt}</span>
                                </button>
                              ))}
                            </div>
                          )}

                        </div>
                      ) : (
                        <div className="p-3 bg-slate-50 border border-dashed border-slate-350 rounded-xl text-[9px] font-bold text-slate-500 flex items-center gap-1.5 justify-center leading-normal">
                          <Info className="w-4 h-4 text-indigo-650 flex-shrink-0" />
                          <span>Ketuk salah satu kotak bertanda tanya (?) di dalam tabel Punnett untuk mengisi genotipenya.</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3 controls (Phenotype ratio verification) */}
                  {step === 3 && (
                    <div className="bg-white border border-slate-350 rounded-2xl p-3 shadow-3xs space-y-2">
                      <span className="text-[7.5px] font-black text-slate-455 uppercase tracking-widest block text-center">
                        Daftar Phenotype Terbentuk
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 text-[8.5px] font-bold text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <SeedIcon genotypeOrPhenotype="Bulat Kuning" size={14} />
                          <span>Bulat Kuning (9)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <SeedIcon genotypeOrPhenotype="Bulat Hijau" size={14} />
                          <span>Bulat Hijau (3)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <SeedIcon genotypeOrPhenotype="Keriput Kuning" size={14} />
                          <span>Keriput Kuning (3)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <SeedIcon genotypeOrPhenotype="Keriput Hijau" size={14} />
                          <span>Keriput Hijau (1)</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Right Punnett grid column */}
                <div className="sm:col-span-7 flex justify-center w-full">
                  
                  {/* Punnett Table wrapper */}
                  <div className="grid grid-cols-5 gap-1.5 w-full max-w-[280px] sm:max-w-[310px] bg-slate-50 border-2 border-slate-800 p-2 rounded-2xl shadow-3xs">
                    
                    {/* Row 0 / Col 0 Spacer */}
                    <div className="aspect-square bg-slate-100 border-2 border-slate-800 rounded-lg flex items-center justify-center">
                      <span className="text-[7px] font-black text-slate-400">♀ \ ♂</span>
                    </div>

                    {/* Row 0 / Column gametes (Ayah) */}
                    {assignedCols.map((g, index) => {
                      const isLocked = step !== 1;
                      const isActive = activeHeaderSlot && activeHeaderSlot.type === 'col' && activeHeaderSlot.index === index;
                      
                      return (
                        <div
                          key={`col-${index}`}
                          onClick={() => !isLocked && handleSelectHeaderSlot('col', index)}
                          className={`aspect-square rounded-lg flex items-center justify-center font-mono font-black text-xs transition-all shadow-3xs cursor-pointer ${
                            isActive
                              ? 'bg-sky-100 border-2 border-sky-600 scale-105 ring-2 ring-sky-350 font-black'
                              : g
                                ? 'bg-emerald-100 border-2 border-slate-800 text-emerald-800'
                                : 'border-2 border-dashed border-slate-450 bg-white text-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          {g ? (
                            round === 1 ? g : <SeedIcon genotypeOrPhenotype={g} size={22} />
                          ) : (
                            '?'
                          )}
                        </div>
                      );
                    })}

                    {/* Rows 1-4 */}
                    {[0, 1, 2, 3].map((rIndex) => {
                      const rowGamete = assignedRows[rIndex];
                      const isLocked = step !== 1;
                      const isRowActive = activeHeaderSlot && activeHeaderSlot.type === 'row' && activeHeaderSlot.index === rIndex;

                      return (
                        <React.Fragment key={`row-frag-${rIndex}`}>
                          
                          {/* Column 0: Row gametes (Ibu) */}
                          <div
                            onClick={() => !isLocked && handleSelectHeaderSlot('row', rIndex)}
                            className={`aspect-square rounded-lg flex items-center justify-center font-mono font-black text-xs transition-all shadow-3xs cursor-pointer ${
                              isRowActive
                                ? 'bg-sky-100 border-2 border-sky-600 scale-105 ring-2 ring-sky-350 font-black'
                                : rowGamete
                                  ? 'bg-emerald-100 border-2 border-slate-800 text-emerald-800'
                                  : 'border-2 border-dashed border-slate-450 bg-white text-slate-400 hover:bg-slate-50'
                            }`}
                          >
                            {rowGamete ? (
                              round === 1 ? rowGamete : <SeedIcon genotypeOrPhenotype={rowGamete} size={22} />
                            ) : (
                              '?'
                            )}
                          </div>

                          {/* Column 1-4: Cross Cells */}
                          {assignedCols.map((colGamete, cIndex) => {
                            const isCellInteractive = step === 2;
                            const cellValue = gridCells[rIndex][cIndex];
                            
                            const isWrong = incorrectCells.some(
                              cell => cell[0] === rIndex && cell[1] === cIndex
                            );
                            const isActive = activeCell && activeCell[0] === rIndex && activeCell[1] === cIndex;
                            const showPhenotype = step === 3 || stageCompleted;

                            return (
                              <div
                                key={`cell-${rIndex}-${cIndex}`}
                                onClick={() => isCellInteractive && handleCellSelect(rIndex, cIndex)}
                                className={`aspect-square rounded-lg flex items-center justify-center transition-all cursor-pointer border-2 ${
                                  isActive
                                    ? 'bg-sky-100 border-sky-600 scale-105 ring-2 ring-sky-350'
                                    : isWrong
                                      ? 'bg-rose-55 border-rose-500 text-rose-800 animate-shake'
                                      : cellValue
                                        ? round === 1
                                          ? showPhenotype
                                            ? `${getPhenotypeInfo(cellValue).bgClass} border-slate-800 font-mono font-black text-[9px] shadow-3xs animate-scale-up`
                                            : 'bg-white border-slate-855 text-slate-850 font-mono font-black text-[9px] shadow-3xs'
                                          : /* Round 2: phenotype SeedIcon display */
                                            `${getPhenotypeInfo(combineGametes(rowGamete, colGamete)).bgClass} border-slate-800 shadow-3xs flex items-center justify-center`
                                        : 'bg-white border-slate-200 text-slate-300 font-mono font-black text-[9px]'
                                }`}
                              >
                                {cellValue ? (
                                  round === 1 ? (
                                    cellValue
                                  ) : (
                                    <SeedIcon genotypeOrPhenotype={cellValue} size={22} />
                                  )
                                ) : (
                                  '?'
                                )}
                              </div>
                            );
                          })}

                        </React.Fragment>
                      );
                    })}

                  </div>

                </div>

              </div>

            {/* Bottom action controls */}
            {step === 1 && (
              <div className="flex gap-4 justify-center border-t border-slate-800 pt-3 flex-shrink-0">
                <button
                  onClick={handleResetGrid}
                  className="px-4 py-2 rounded-xl border-2 border-slate-800 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[9px] flex items-center gap-1.5 shadow-[2px_2px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 stroke-[2.5px]" />
                  <span>RESET GAMET</span>
                </button>

                <button
                  onClick={handleVerifyGametes}
                  className="px-6 py-2 rounded-xl border-2 border-slate-800 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[9px] flex items-center gap-1.5 shadow-[2px_2px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  <span>VERIFIKASI GAMET</span>
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5px]" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="flex gap-4 justify-center border-t border-slate-800 pt-3 flex-shrink-0">
                <button
                  onClick={handleResetGrid}
                  className="px-4 py-2 rounded-xl border-2 border-slate-800 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[9px] flex items-center gap-1.5 shadow-[2px_2px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 stroke-[2.5px]" />
                  <span>RESET PERSILANGAN</span>
                </button>

                <button
                  onClick={handleVerifyCells}
                  className="px-6 py-2 rounded-xl border-2 border-slate-800 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[9px] flex items-center gap-1.5 shadow-[2px_2px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  <span>VERIFIKASI PUNNETT</span>
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5px]" />
                </button>
              </div>
            )}

            {step === 3 && (
              /* Step 3: Answer Ratio picker */
              <div className="border-t border-slate-800 pt-3 space-y-3 flex-shrink-0 text-center">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">
                  Pilih Rasio Fenotipe F2 Dihibrid yang Tepat
                </span>
                
                <div className="flex justify-center gap-3">
                  {['9:3:3:1', '3:1', '1:2:1', '1:1:1:1'].map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        sound.playClick();
                        setRatioAnswer(r);
                      }}
                      className={`px-5 py-2.5 rounded-xl font-mono font-black text-xs border-2 shadow-[2px_2px_0px_#1e293b] active:translate-y-0.5 active:shadow-none cursor-pointer transition-all ${
                        ratioAnswer === r 
                          ? 'bg-sky-100 border-sky-600 text-sky-900 scale-105' 
                          : 'bg-white border-slate-850 text-slate-855 hover:bg-slate-50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <div className="flex justify-center pt-2 gap-3">
                  <button
                    onClick={handleResetGrid}
                    className="px-4 py-2 rounded-xl border-2 border-slate-800 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[9px] flex items-center gap-1.5 shadow-[2px_2px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3 stroke-[2.5px]" />
                    <span>ULANG TAHAP</span>
                  </button>

                  <button
                    onClick={handleVerifyRatio}
                    disabled={!ratioAnswer}
                    className={`px-6 py-2 rounded-xl border-2 border-slate-855 font-black text-[9px] shadow-[2px_2px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5 ${
                      ratioAnswer 
                        ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-650 text-white cursor-pointer hover:scale-103' 
                        : 'bg-slate-100 border-slate-400 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <span>SELESAIKAN DIHIBRID</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[3.5px]" />
                  </button>
                </div>
              </div>
            )}

          </div>
          )}

          {/* Feedback Alerts */}
          {feedback && (
            <div className={`w-full p-2 border-2 border-slate-800 rounded-xl flex items-center gap-2 text-[9px] font-black shadow-[3px_3px_0px_#1e293b] animate-fade-in my-1.5 flex-shrink-0 ${
              feedback.type === 'success' 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-rose-100 text-rose-800'
            }`}>
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

        </div>
      ) : (
        /* Victory Screen */
        <div className="absolute inset-0 z-40 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="p-6 rounded-3xl text-center space-y-4 max-w-xs w-full border-2 border-slate-800 bg-white shadow-2xl relative z-50 animate-scale-up">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-slate-800 p-1 flex items-center justify-center mx-auto shadow-xs overflow-hidden">
              <img 
                src="/assets/rumah_mendel_banner.png" 
                alt="Victory Stage 6" 
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[8px] font-black text-indigo-700 uppercase tracking-widest font-sans">ROUND COMPLETED</span>
              <h3 className="text-base font-black text-black">STAGE 6 SELESAI!</h3>
              <p className="text-[10px] text-black/85 font-bold leading-relaxed px-1">
                Luar biasa! Kamu berhasil menaklukkan <strong className="text-indigo-650">Persilangan Dihibrid</strong> dan Hukum Asortasi Bebas.
              </p>
            </div>

            <div className="flex justify-center gap-1.5">
              {[1, 2, 3].map(s => (
                <Star key={s} className="w-6 h-6 text-amber-500 fill-amber-500 animate-bounce" style={{ animationDelay: `${s * 0.2}s` }} />
              ))}
            </div>

            <div className="p-2.5 bg-amber-500/10 border-2 border-slate-800 rounded-xl text-amber-900 text-[10px] font-black shadow-[3px_3px_0px_#1e293b]">
              🏆 Lencana Diperoleh: Penjelajah Dihibrid
            </div>

            <div className="flex gap-2 justify-center pt-1.5">
              <button
                onClick={() => navigateTo('map')}
                className="px-4 py-2 rounded-xl bg-white border-2 border-slate-800 hover:bg-slate-50 text-slate-700 font-bold text-[10px] shadow-3xs cursor-pointer flex-1"
              >
                PETA STAGE
              </button>
              <button
                onClick={() => navigateTo('map')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-550 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-[10px] flex items-center justify-center gap-1 shadow-3xs cursor-pointer flex-1"
              >
                <span>SELESAI GAME</span>
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5px]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
