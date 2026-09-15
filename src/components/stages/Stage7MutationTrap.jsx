import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { STAGES } from '../../data/geneticsData';
import { sound } from '../../services/sound';
import confetti from 'canvas-confetti';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Sparkles, 
  Star, 
  Zap, 
  ChevronLeft,
  Search,
  Dna,
  FlaskConical,
  Activity,
  RotateCcw,
  Check,
  AlertTriangle,
  HelpCircle,
  X,
  BookOpen,
  Info
} from 'lucide-react';

// SVG Flower Badge ensuring 100% cross-platform color accuracy (no emoji OS font glitches)
const FlowerBadge = ({ color = 'purple', size = 'md' }) => {
  const isWhite = color === 'white' || color === '#ffffff';
  const petalFill = isWhite ? '#ffffff' : '#c084fc';
  const petalStroke = isWhite ? '#64748b' : '#6b21a8';
  const centerFill = '#facc15';
  const centerStroke = '#ca8a04';
  const dim = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';

  return (
    <div className={`${dim} relative flex items-center justify-center flex-shrink-0`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
        <circle cx="50" cy="22" r="18" fill={petalFill} stroke={petalStroke} strokeWidth="4" />
        <circle cx="76" cy="42" r="18" fill={petalFill} stroke={petalStroke} strokeWidth="4" />
        <circle cx="66" cy="76" r="18" fill={petalFill} stroke={petalStroke} strokeWidth="4" />
        <circle cx="34" cy="76" r="18" fill={petalFill} stroke={petalStroke} strokeWidth="4" />
        <circle cx="24" cy="42" r="18" fill={petalFill} stroke={petalStroke} strokeWidth="4" />
        <circle cx="50" cy="50" r="14" fill={centerFill} stroke={centerStroke} strokeWidth="3" />
      </svg>
    </div>
  );
};

const PUZZLE_CASES = [
  {
    id: 1,
    caseNum: 'KASUS 01',
    title: 'Anomali Corong Meiosis (Gamet Ilegal)',
    subtitle: 'Hukum Segregasi Bebas (Mendel I) & Pembelahan Meiosis',
    dossier: 'Dr. Chaos meretas ruang pemisahan gamet dari sel induk diploid [AaBb]. Salah satu tabung mengalami peristiwa gagal berpisah (nondisjunction) dan membawa susunan alel terlarang yang melanggar Hukum Mendel I!',
    clue: 'Petunjuk Forensik: Gamet normal wajib bersifat HAPLOID (1n) dan hanya membawa SATU alel dari tiap pasangan gen (misal: 1 huruf A/a dan 1 huruf B/b).',
    type: 'chamber',
    parentGenotype: 'AaBb',
    tubes: [
      { id: 't1', label: 'Tabung α', alleles: ['A', 'B'], isMutant: false, status: 'NORMAL 1n', details: 'Haploid 1n: 1 alel A + 1 alel B. Meiosis sempurna.' },
      { id: 't2', label: 'Tabung β', alleles: ['a', 'b'], isMutant: false, status: 'NORMAL 1n', details: 'Haploid 1n: 1 alel a + 1 alel b. Meiosis sempurna.' },
      { id: 't3', label: 'Tabung γ', alleles: ['A', 'a', 'B'], isMutant: true, status: 'ANOMALI MUTAN!', details: 'GAGAL BERPISAH! Alel A dan a tidak terpisah ke kutub berbeda. Lokus A memiliki 2 alel!' },
      { id: 't4', label: 'Tabung δ', alleles: ['A', 'b'], isMutant: false, status: 'NORMAL 1n', details: 'Haploid 1n: 1 alel A + 1 alel b. Meiosis sempurna.' }
    ],
    explanation: 'Tabung γ terbukti sebagai anomali! Menurut Hukum Segregasi Mendel I, pasangan alel Aa wajib terpisah saat pembentukan gamet. Keberadaan alel [A, a] dalam satu gamet merupakan bukti kegagalan meiosis (nondisjunction)!'
  },
  {
    id: 2,
    caseNum: 'KASUS 02',
    title: 'Restorasi Papan Punnett (Punnett Glitch)',
    subtitle: 'Persilangan Monohibrid Bunga Ungu (Pp × Pp)',
    dossier: 'Dr. Chaos merusak satu kotak pada papan catur persilangan Pp × Pp! Tentukan dan pasang modul anakan yang tepat dari pertemuan gamet resesif p × p untuk menuntaskan tabel.',
    clue: 'Petunjuk: Alel gamet jantan (p) bertemu alel gamet betina (p) menghasilkan genotipe homozigot resesif pp (Bunga Putih). Bunga Ungu hanya muncul jika terdapat minimal satu alel dominan P!',
    type: 'punnett_repair',
    parentA: { label: 'Induk Jantan', genotype: 'Pp', phenotype: 'Bunga Ungu', gametes: ['P', 'p'] },
    parentB: { label: 'Induk Betina', genotype: 'Pp', phenotype: 'Bunga Ungu', gametes: ['P', 'p'] },
    options: [
      { 
        id: 'opt1', 
        genotype: 'pp', 
        phenotype: 'Bunga Putih', 
        flowerColor: 'white', 
        isCorrect: true, 
        tag: 'HOMOZIGOT RESESIF',
        reason: 'TEPAT SEKALI! Pertemuan gamet p × p menghasilkan genotipe homozigot resesif pp (Bunga Putih). Sifat resesif hanya berekspresi penuh jika tanpa alel dominan P.' 
      },
      { 
        id: 'opt2', 
        genotype: 'pp', 
        phenotype: 'Bunga Ungu', 
        flowerColor: 'purple', 
        isCorrect: false, 
        tag: 'MISKONSEPSI!',
        reason: 'SALAH! Genotipe pp adalah homozigot resesif tanpa alel dominan P. Mustahil menghasilkan pigmen Bunga Ungu!' 
      },
      { 
        id: 'opt3', 
        genotype: 'Pp', 
        phenotype: 'Bunga Putih', 
        flowerColor: 'white', 
        isCorrect: false, 
        tag: 'KONTRADIKSI!',
        reason: 'SALAH! Genotipe heterozigot Pp memiliki alel dominan P sehingga bunganya pasti Bunga Ungu, bukan Bunga Putih!' 
      },
      { 
        id: 'opt4', 
        genotype: 'PP', 
        phenotype: 'Bunga Ungu', 
        flowerColor: 'purple', 
        isCorrect: false, 
        tag: 'SALAH GABUNGAN!',
        reason: 'SALAH! Pertemuan gamet p × p tidak mungkin menghasilkan alel dominan P!' 
      }
    ],
    explanation: 'Analisis akurat! Kotak hasil persilangan gamet p × p berhasil dilengkapi dengan [pp • Bunga Putih]. Rasio fenotipe monohibrid 3 Ungu : 1 Putih kini terbukti sempurna!'
  },
  {
    id: 3,
    caseNum: 'KASUS 03',
    title: 'Reaktor Sintesis Intermediet & Kodominan',
    subtitle: 'Penyimpangan Semu Hukum Mendel',
    dossier: 'Reaktor persilangan Intermediet Bunga Merah (MM) × Bunga Putih (mm) terkontaminasi kristal pigmen oranye palsu. Pilih dan pasang kristal pigmen biologis yang tepat ke dalam inti reaktor untuk menstabilkan anakan F1!',
    clue: 'Petunjuk Forensik: Pada sifat Intermediet (kodominan semu), alel M dan m sama-sama kuat. Fenotipe anakan F1 (Mm) merupakan perpaduan warna kedua induknya!',
    type: 'reactor',
    parentA: 'MM (Merah)',
    parentB: 'mm (Putih)',
    f1Genotype: 'Mm',
    crystals: [
      { id: 'c1', name: 'Kristal Merah Pekat', color: '#ef4444', borderColor: '#b91c1c', desc: 'Miskonsepsi: Dominan Penuh biasa.', isCorrect: false },
      { id: 'c2', name: 'Kristal Merah Muda (Pink)', color: '#f472b6', borderColor: '#db2777', desc: 'Perpaduan seimbang pigmen Merah + Putih.', isCorrect: true },
      { id: 'c3', name: 'Kristal Oranye Sintetis', color: '#f97316', borderColor: '#c2410c', desc: 'Zat pewarna buatan rekayasa Dr. Chaos.', isCorrect: false }
    ],
    explanation: 'Luar biasa! Pada sifat intermediet, alel M dan m mengekspresikan sifat secara bersamaan sehingga menghasilkan warna Merah Muda (Pink).'
  },
  {
    id: 4,
    caseNum: 'KASUS 04',
    title: 'Anomali Lokus Dihibrid (Gamet Diploid Ilegal)',
    subtitle: 'Hukum Asortasi Bebas (Mendel II)',
    dossier: 'Dr. Chaos memanipulasi corong meiosis kedua pada persilangan dihibrid [BbKk] (Biji Bulat Kuning). Salah satu tabung membawa gamet mutan yang gagal memisahkan pasangan alel warna biji!',
    clue: 'Petunjuk Forensik: Gamet dihibrid normal wajib membawa tepat 1 huruf alel bentuk (B/b) dan 1 huruf alel warna (K/k). Tabung yang membawa 2 alel warna atau 2 alel bentuk adalah anomali!',
    type: 'chamber',
    parentGenotype: 'BbKk',
    tubes: [
      { id: 't1', label: 'Tabung 1', alleles: ['B', 'K'], isMutant: false, status: 'NORMAL 1n', details: 'Haploid 1n: 1 alel B + 1 alel K. Memenuhi Hukum Mendel II.' },
      { id: 't2', label: 'Tabung 2', alleles: ['b', 'k'], isMutant: false, status: 'NORMAL 1n', details: 'Haploid 1n: 1 alel b + 1 alel k. Memenuhi Hukum Mendel II.' },
      { id: 't3', label: 'Tabung 3', alleles: ['B', 'K', 'k'], isMutant: true, status: 'ANOMALI MUTAN!', details: 'GAGAL BERPISAH LOKUS WARNA! Alel K dan k berada dalam satu gamet. Melanggar pemisahan bebas meiosis!' },
      { id: 't4', label: 'Tabung 4', alleles: ['B', 'k'], isMutant: false, status: 'NORMAL 1n', details: 'Haploid 1n: 1 alel B + 1 alel k. Memenuhi Hukum Mendel II.' }
    ],
    explanation: 'Tabung 3 terbukti mutan! Pasangan alel Kk gagal berpisah saat meiosis sehingga gamet membawa kelebihan alel [K, k]. Kaidah segregasi dan asortasi bebas berhasil dipulihkan!'
  },
  {
    id: 5,
    caseNum: 'KASUS 05',
    title: 'Reaktor Kriptomeri & Komplementer Linier',
    subtitle: 'Interaksi Antar Gen (Penyimpangan Semu)',
    dossier: 'Dr. Chaos memblokir biosintesis pigmen bunga pada peristiwa kriptomeri. Persilangan bunga putih AAbb × aaBB menghasilkan anakan F1 AaBb. Masukkan kristal enzim aktivator antosianin yang benar ke inti reaktor!',
    clue: 'Petunjuk Forensik: Pada peristiwa gen komplementer/kriptomeri, warna ungu hanya muncul jika alel dominan A dan B hadir bersamaan. Pilih kristal enzim biosintesis antosianin sejati!',
    type: 'reactor',
    parentA: 'AAbb (Bunga Putih)',
    parentB: 'aaBB (Bunga Putih)',
    f1Genotype: 'AaBb (Kriptomeri Ungu)',
    crystals: [
      { id: 'c1', name: 'Kristal Antosianin Ungu Sejati', color: '#a855f7', borderColor: '#7e22ce', desc: 'Sinergi enzim A (antosianin) dan enzim B (suasana basa) menghasilkan pigmen ungu.', isCorrect: true },
      { id: 'c2', name: 'Kristal Asam Sitrat Kuning', color: '#eab308', borderColor: '#a16207', desc: 'Bahan kimia asing perusak sintesis antosianin.', isCorrect: false },
      { id: 'c3', name: 'Kristal Putih Albino Pasif', color: '#f8fafc', borderColor: '#94a3b8', desc: 'Zat inhibitor yang menghentikan pembentukan seluruh pigmen.', isCorrect: false }
    ],
    explanation: 'Hebat! Kristal Antosianin Ungu Sejati berhasil mengaktifkan sinergi kedua enzim dominan A dan B. Seluruh 5 perangkap mutasi Dr. Chaos di laboratorium Genetika resmi dihancurkan!'
  }
];

export const Stage7MutationTrap = () => {
  const { navigateTo, completeStage, sourceWorldView } = useGame();
  const [caseIdx, setCaseIdx] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [solvedCases, setSolvedCases] = useState([]);
  const [stageCompleted, setStageCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [scannedTubes, setScannedTubes] = useState([]);

  const currentCase = PUZZLE_CASES[caseIdx];
  const stageInfo = STAGES.find(s => s.id === 7);

  const handleSelectItem = (item) => {
    sound.playClick();
    setSelectedItem(item);
    if (item.id && !scannedTubes.includes(item.id)) {
      setScannedTubes(prev => [...prev, item.id]);
    }
  };

  const handleVerifySolution = () => {
    if (!selectedItem) return;

    const isCorrect = (currentCase.type === 'reactor' || currentCase.type === 'punnett_repair')
      ? selectedItem.isCorrect 
      : selectedItem.isMutant;

    if (isCorrect) {
      sound.playCorrect();
      setFeedback({
        type: 'success',
        title: 'ANOMALI BERHASIL DINETRALKAN!',
        message: currentCase.explanation
      });
      setScore(prev => prev + 150);
      setSolvedCases(prev => [...prev, currentCase.id]);

      setTimeout(() => {
        if (caseIdx < PUZZLE_CASES.length - 1) {
          setCaseIdx(prev => prev + 1);
          setSelectedItem(null);
          setFeedback(null);
        } else {
          setStageCompleted(true);
          sound.playFanfare();
          try { 
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } }); 
          } catch(e){}
          completeStage(7, 3, score + 150, 100, 45);
        }
      }, 2400);
    } else {
      sound.playWrong();
      setFeedback({
        type: 'error',
        title: 'ANALISIS BELUM TEPAT!',
        message: currentCase.type === 'reactor'
          ? `${selectedItem.name} tidak sesuai. Ingat prinsip persilangan intermediet: kedua warna induk berpadu seimbang!`
          : currentCase.type === 'punnett_repair'
          ? selectedItem.reason
          : `${selectedItem.label} memiliki struktur yang valid secara hukum genetika. Cari bagian yang melanggar aturan ilmiah!`
      });
    }
  };

  return (
    <div className="w-full min-h-screen relative overflow-y-auto bg-[#faf6ee] select-none flex flex-col p-2 sm:p-4 md:p-8 text-left text-slate-900 stage-main-wrapper">
      {/* Retro parchment paper lines overlay (identical to Stage 2-6) */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] z-0" />

      <div className="max-w-5xl w-full mx-auto space-y-2 sm:space-y-4 relative z-10 stage-workspace-compact">
        
        {/* Floating Header Banner HUD (Harmonized with Stage 2-6) */}
        <div className="w-full p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white border-2 border-slate-800 shadow-[3px_3px_0px_#1e293b] sm:shadow-[4px_4px_0px_#1e293b] flex items-center justify-between gap-2 z-30 relative mb-1.5 sm:mb-2 stage-header-hud">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo(sourceWorldView === 'rpg-world' ? 'rpg-world' : 'map')}
              className="p-1.5 rounded-xl bg-white border-2 border-slate-800 text-slate-700 hover:text-sky-600 transition shadow-3xs cursor-pointer flex-shrink-0 active:translate-y-0.5"
              title={sourceWorldView === 'rpg-world' ? "Kembali ke RPG Map" : "Kembali ke Peta"}
            >
              <ChevronLeft className="w-4 h-4 stroke-[3px]" />
            </button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-50 border-2 border-slate-800 p-0.5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img 
                  src="/assets/rumah_mendel_banner.webp" 
                  alt="Rumah Mendel Banner" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-[7px] font-black text-rose-700 uppercase tracking-widest font-sans block">
                  {stageInfo.location} &bull; STAGE 7
                </span>
                <h2 className="text-[11px] sm:text-xs font-black text-slate-900 leading-tight">
                  {stageInfo.title}
                </h2>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Case Progress Pills */}
            <div className="flex gap-1 bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-300">
              {PUZZLE_CASES.map((c, i) => (
                <div 
                  key={c.id} 
                  className={`px-1.5 sm:px-2 py-0.5 rounded text-[7.5px] sm:text-[8px] font-mono font-black transition ${
                    solvedCases.includes(c.id)
                      ? 'bg-emerald-600 text-white'
                      : i === caseIdx
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  KASUS 0{i + 1}
                </div>
              ))}
            </div>

            {/* Score (Exact Stage 2 retro pill) */}
            <div className="flex items-center gap-1 bg-amber-500/10 border-2 border-slate-800 px-2 sm:px-2.5 py-1 rounded-xl shadow-[2px_2px_0px_#1e293b]">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="text-[9.5px] sm:text-[10px] font-black text-slate-900 font-mono">Skor: {score}</span>
            </div>

            {/* Cara Bermain Button in Top Right */}
            <button
              onClick={() => {
                sound.playClick();
                setShowTutorial(true);
              }}
              className="flex items-center gap-1 sm:gap-1.5 bg-[#fef08a] hover:bg-[#fde047] text-slate-950 border-2 border-slate-800 px-2 sm:px-3 py-1 rounded-xl shadow-[2px_2px_0px_#1e293b] font-black text-[9px] sm:text-xs cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition ml-0.5"
              title="Buka Panduan Cara Bermain"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-900" />
              <span className="hidden sm:inline">Cara Bermain</span>
            </button>
          </div>
        </div>

        {!stageCompleted ? (
          <>
            {/* Case Dossier & Objective Box */}
            <div className="p-2.5 sm:p-5 rounded-2xl bg-white border-2 border-slate-800 shadow-[3px_3px_0px_#1e293b] sm:shadow-[4px_4px_0px_#1e293b] space-y-1.5 sm:space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 border-b-2 border-slate-100 pb-1.5 sm:pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 sm:px-2 py-0.5 rounded bg-rose-100 border border-rose-300 text-rose-800 font-mono text-[8.5px] sm:text-[9px] font-black uppercase">
                    {currentCase.caseNum}
                  </span>
                  <h3 className="text-xs sm:text-base font-black text-slate-900">
                    {currentCase.title}
                  </h3>
                </div>
                <span className="text-[9px] sm:text-[10px] text-indigo-700 font-mono font-black bg-indigo-50 px-2 sm:px-2.5 py-0.5 rounded-full border border-indigo-200">
                  {currentCase.subtitle}
                </span>
              </div>

              <p className="text-[11px] sm:text-xs text-slate-700 leading-relaxed font-sans line-clamp-3">
                {currentCase.dossier}
              </p>

              {/* Stage 2 Yellow Hint Box */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-[#fef9c3] border-2 border-slate-800 shadow-[2px_2px_0px_#1e293b] sm:shadow-[3px_3px_0px_#1e293b] flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-slate-900 font-bold">
                <Search className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                <span className="font-mono font-medium leading-tight">{currentCase.clue}</span>
              </div>
            </div>

            {/* PUZZLE INTERACTION AREA */}
            <div className="p-2.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border-2 border-slate-800 shadow-[3px_3px_0px_#1e293b] sm:shadow-[4px_4px_0px_#1e293b] space-y-2.5 sm:space-y-5">
              
              {/* --- PUZZLE 1: VINTAGE TEST TUBE RACK --- */}
              {currentCase.type === 'chamber' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-emerald-600" />
                      SEL INDUK: <strong className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 font-mono text-xs">{currentCase.parentGenotype}</strong> (Diploid 2n)
                    </span>
                    <span className="text-xs text-rose-600 font-mono font-bold">
                      *Klik tabung untuk memindai susunan alel
                    </span>
                  </div>

                  {/* 4 Test Tubes in Lab Rack (Stage 2 Parchment & Border Style) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#faf6ee] border-2 border-dashed border-slate-800">
                    {currentCase.tubes.map((tube) => {
                      const isSelected = selectedItem?.id === tube.id;
                      return (
                        <div
                          key={tube.id}
                          onClick={() => handleSelectItem(tube)}
                          className={`p-3.5 rounded-2xl cursor-pointer transition-all flex flex-col items-center border-2 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                            isSelected
                              ? 'bg-rose-50 border-rose-600 shadow-[3px_3px_0px_#be123c] scale-[1.02]'
                              : 'bg-white border-slate-800 hover:border-purple-500 shadow-[3px_3px_0px_#1e293b]'
                          }`}
                        >
                          <span className="text-xs font-mono font-black text-slate-800 mb-2">
                            {tube.label}
                          </span>

                          {/* Glass Tube */}
                          <div className={`w-14 h-28 rounded-b-full border-2 relative overflow-hidden flex flex-col justify-end p-1.5 transition ${
                            isSelected ? 'bg-rose-100/50 border-rose-500' : 'bg-sky-50/60 border-slate-700'
                          }`}>
                            <div className="absolute top-0 left-1 w-1 h-full bg-white/60 rounded-full" />

                            <div className="flex flex-col items-center gap-1.5 z-10 my-auto">
                              {tube.alleles.map((alel, aIdx) => {
                                const isDominant = alel === alel.toUpperCase();
                                return (
                                  <span
                                    key={aIdx}
                                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-black text-xs border-2 shadow-[1px_1px_0px_#1e293b] ${
                                      isDominant
                                        ? 'bg-[#c084fc] text-slate-950 border-slate-800'
                                        : 'bg-white text-slate-950 border-slate-800'
                                    }`}
                                  >
                                    {alel}
                                  </span>
                                );
                              })}
                            </div>

                            <div className={`h-8 w-full rounded-b-full border-t ${
                              isSelected ? 'bg-rose-400/30 border-rose-400' : 'bg-sky-400/20 border-sky-400'
                            }`} />
                          </div>

                          <div className="mt-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border ${
                              scannedTubes.includes(tube.id)
                                ? tube.isMutant
                                  ? 'bg-rose-100 border-rose-400 text-rose-800 font-black'
                                  : 'bg-emerald-50 border-emerald-400 text-emerald-800'
                                : 'bg-slate-100 border-slate-300 text-slate-500'
                            }`}>
                              {scannedTubes.includes(tube.id) ? tube.status : 'SIAP DIPINDAI'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected Tube Readout with Actionable Guidance */}
                  {selectedItem ? (
                    <div className={`p-3.5 rounded-2xl border-2 shadow-[2px_2px_0px_#1e293b] flex items-start gap-3 animate-fade-in ${
                      selectedItem.isMutant ? 'bg-rose-50 border-rose-500' : 'bg-sky-50 border-sky-400'
                    }`}>
                      <div className={`w-8 h-8 rounded-xl border-2 border-slate-800 flex items-center justify-center flex-shrink-0 shadow-xs ${
                        selectedItem.isMutant ? 'bg-rose-200 text-rose-800' : 'bg-sky-200 text-sky-800'
                      }`}>
                        {selectedItem.isMutant ? <AlertTriangle className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-black text-slate-900 uppercase">
                            Hasil Analisis Bio-Scanner: {selectedItem.label}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase border border-slate-800 ${
                            selectedItem.isMutant ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                          }`}>
                            {selectedItem.isMutant ? '⚠️ TERDUGA MUTAN' : '✅ NORMAL (1N)'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 font-sans">
                          {selectedItem.details}
                        </p>
                        {selectedItem.isMutant ? (
                          <div className="p-2 rounded-xl bg-rose-100 border border-rose-300 text-[11px] font-bold text-rose-950 flex items-center gap-2 mt-1">
                            <span>🎯</span>
                            <span>Tabung ini terbukti melanggar kaidah Mendel! Tekan tombol ungu <strong>"NETRALKAN ANOMALI MUTAN"</strong> di bawah untuk mengeksekusi!</span>
                          </div>
                        ) : (
                          <p className="text-[11px] text-sky-900 font-medium">
                            💡 Tabung ini normal (memenuhi kaidah Mendel 1n). Coba klik tabung lainnya untuk mencari yang ganjil!
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-[#fef9c3] border-2 border-slate-800 shadow-[2px_2px_0px_#1e293b] flex items-center gap-2 text-xs text-amber-950 font-bold">
                      <Search className="w-4 h-4 text-amber-700 flex-shrink-0" />
                      <span>Langkah 1: Klik salah satu tabung di atas untuk memindai susunan alelnya ke dalam Bio-Scanner.</span>
                    </div>
                  )}
                </div>
              )}

              {/* --- PUZZLE 2: RESTORASI PAPAN PUNNETT MONOHIBRID (UNAMBIGUOUS & VISUAL) --- */}
              {currentCase.type === 'punnett_repair' && (
                <div className="space-y-5">
                  {/* Induk Persilangan Header Banner */}
                  <div className="flex flex-wrap items-center justify-center gap-3 p-3 rounded-2xl bg-[#faf6ee] border-2 border-slate-800 shadow-[2px_2px_0px_#1e293b]">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-black flex items-center justify-center font-mono text-xs border border-slate-800">♂</span>
                      <span className="text-xs font-mono font-black text-purple-950">INDUK JANTAN: [Pp] &bull; Bunga Ungu</span>
                    </div>
                    <span className="font-black text-slate-400 font-mono text-base">&times;</span>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-black flex items-center justify-center font-mono text-xs border border-slate-800">♀</span>
                      <span className="text-xs font-mono font-black text-purple-950">INDUK BETINA: [Pp] &bull; Bunga Ungu</span>
                    </div>
                  </div>

                  {/* 2x2 Punnett Grid Table */}
                  <div className="max-w-md mx-auto p-4 rounded-2xl bg-white border-2 border-slate-800 shadow-[4px_4px_0px_#1e293b] space-y-2">
                    <div className="text-[10px] font-mono font-black text-slate-500 uppercase text-center tracking-wider mb-1">
                      PAPAN CATUR PERSILANGAN (PUNNETT MATRIX)
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center items-center">
                      {/* Top Left Header Corner */}
                      <div className="p-2 rounded-xl bg-slate-100 border-2 border-slate-800 font-mono font-black text-xs text-slate-700">
                        ♂ \ ♀
                      </div>
                      <div className="p-2 rounded-xl bg-purple-100 border-2 border-slate-800 font-mono font-black text-sm text-purple-950">
                        P
                      </div>
                      <div className="p-2 rounded-xl bg-purple-50 border-2 border-slate-800 font-mono font-black text-sm text-purple-950">
                        p
                      </div>

                      {/* Row 1: Gamet P */}
                      <div className="p-2 rounded-xl bg-purple-100 border-2 border-slate-800 font-mono font-black text-sm text-purple-950">
                        P
                      </div>
                      {/* Cell P x P */}
                      <div className="p-2.5 rounded-xl bg-[#faf6ee] border-2 border-slate-800 flex flex-col items-center justify-center space-y-1 shadow-[2px_2px_0px_#1e293b]">
                        <FlowerBadge color="purple" size="sm" />
                        <span className="font-mono font-black text-xs text-slate-900">PP</span>
                        <span className="text-[8px] font-bold text-purple-900 uppercase">Bunga Ungu</span>
                      </div>
                      {/* Cell P x p */}
                      <div className="p-2.5 rounded-xl bg-[#faf6ee] border-2 border-slate-800 flex flex-col items-center justify-center space-y-1 shadow-[2px_2px_0px_#1e293b]">
                        <FlowerBadge color="purple" size="sm" />
                        <span className="font-mono font-black text-xs text-slate-900">Pp</span>
                        <span className="text-[8px] font-bold text-purple-900 uppercase">Bunga Ungu</span>
                      </div>

                      {/* Row 2: Gamet p */}
                      <div className="p-2 rounded-xl bg-purple-50 border-2 border-slate-800 font-mono font-black text-sm text-purple-950">
                        p
                      </div>
                      {/* Cell p x P */}
                      <div className="p-2.5 rounded-xl bg-[#faf6ee] border-2 border-slate-800 flex flex-col items-center justify-center space-y-1 shadow-[2px_2px_0px_#1e293b]">
                        <FlowerBadge color="purple" size="sm" />
                        <span className="font-mono font-black text-xs text-slate-900">Pp</span>
                        <span className="text-[8px] font-bold text-purple-900 uppercase">Bunga Ungu</span>
                      </div>
                      {/* Cell p x p (THE BROKEN CELL!) */}
                      <div className={`p-2.5 rounded-xl border-2 flex flex-col items-center justify-center space-y-1 transition-all ${
                        selectedItem 
                          ? 'bg-rose-50 border-rose-600 shadow-[3px_3px_0px_#be123c] animate-scale-up' 
                          : 'bg-amber-50 border-dashed border-amber-500 shadow-inner'
                      }`}>
                        {selectedItem ? (
                          <>
                            <FlowerBadge color={selectedItem.flowerColor} size="sm" />
                            <span className="font-mono font-black text-xs text-slate-900">{selectedItem.genotype}</span>
                            <span className="text-[8px] font-bold text-slate-800 uppercase">{selectedItem.phenotype}</span>
                            <span className="text-[7px] font-mono font-black text-rose-700 bg-rose-200/80 px-1 rounded">TERPASANG</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-5 h-5 text-amber-600 animate-pulse" />
                            <span className="font-mono font-black text-[11px] text-amber-900">? ?</span>
                            <span className="text-[7px] font-mono font-bold text-amber-800 uppercase">KOTAK RUSAK</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 4 Opsi Modul Restorasi */}
                  <div className="space-y-2">
                    <div className="text-xs font-mono font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>Pilih Modul Anakan yang Benar untuk Kotak (p &times; p):</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {currentCase.options.map((opt) => {
                        const isSelected = selectedItem?.id === opt.id;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => handleSelectItem(opt)}
                            className={`p-3.5 rounded-2xl cursor-pointer border-2 transition-all flex flex-col items-center text-center space-y-2 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                              isSelected
                                ? 'bg-rose-50 border-rose-600 shadow-[3px_3px_0px_#be123c] scale-[1.02]'
                                : 'bg-white border-slate-800 hover:border-purple-500 shadow-[3px_3px_0px_#1e293b]'
                            }`}
                          >
                            <FlowerBadge color={opt.flowerColor} size="md" />
                            <div>
                              <div className="text-base font-black font-mono text-slate-900">
                                {opt.genotype}
                              </div>
                              <div className="text-xs font-bold text-slate-700">
                                {opt.phenotype}
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border ${
                              isSelected 
                                ? 'bg-rose-100 border-rose-400 text-rose-800' 
                                : 'bg-slate-100 border-slate-300 text-slate-600'
                            }`}>
                              {isSelected ? 'SIAP DIUJI' : opt.tag}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Live Validation Scanner Readout */}
                  {selectedItem ? (
                    <div className={`p-3.5 rounded-2xl border-2 shadow-[2px_2px_0px_#1e293b] flex items-start gap-3 animate-fade-in ${
                      selectedItem.isCorrect ? 'bg-emerald-50 border-emerald-500' : 'bg-rose-50 border-rose-500'
                    }`}>
                      <div className={`w-8 h-8 rounded-xl border-2 border-slate-800 flex items-center justify-center flex-shrink-0 shadow-xs ${
                        selectedItem.isCorrect ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
                      }`}>
                        {selectedItem.isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-black text-slate-900 uppercase">
                            Analisis Modul Terpilih: [{selectedItem.genotype} &bull; {selectedItem.phenotype}]
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase border border-slate-800 ${
                            selectedItem.isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                          }`}>
                            {selectedItem.isCorrect ? '✅ SESUAI HUKUM MENDEL' : '⚠️ RAWAN KESALAHAN'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 font-sans">
                          {selectedItem.reason}
                        </p>
                        {selectedItem.isCorrect && (
                          <div className="p-2 rounded-xl bg-emerald-100 border border-emerald-300 text-[11px] font-bold text-emerald-950 flex items-center gap-2 mt-1">
                            <span>🎯</span>
                            <span>Kotak tabel Punnett sudah terpasang sempurna! Tekan tombol ungu <strong>"NETRALKAN ANOMALI MUTAN"</strong> di bawah untuk melanjutkan!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-[#fef9c3] border-2 border-slate-800 shadow-[2px_2px_0px_#1e293b] flex items-center gap-2 text-xs text-amber-950 font-bold">
                      <Search className="w-4 h-4 text-amber-700 flex-shrink-0" />
                      <span>Langkah: Pilih salah satu dari 4 modul di atas untuk melengkapi kotak kosong hasil persilangan gamet p &times; p.</span>
                    </div>
                  )}
                </div>
              )}

              {/* --- PUZZLE 3: INTERMEDIATE RECEPTACLE CORE --- */}
              {currentCase.type === 'reactor' && (
                <div className="space-y-5">
                  <div className="p-5 rounded-2xl bg-amber-50 border-2 border-slate-800 shadow-xs flex flex-col items-center text-center space-y-3">
                    <div className="flex items-center gap-3 text-xs font-mono text-slate-700">
                      <span>INDUK: <strong className="text-rose-700">{currentCase.parentA}</strong></span>
                      <span className="text-slate-400">&times;</span>
                      <span><strong className="text-slate-800">{currentCase.parentB}</strong></span>
                    </div>

                    {/* Central Socket */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-dashed border-amber-600 bg-white flex flex-col items-center justify-center p-2 shadow-inner">
                      {selectedItem ? (
                        <div className="space-y-1 animate-scale-up">
                          <div 
                            className="w-10 h-10 rounded-xl mx-auto border-2 shadow-sm flex items-center justify-center"
                            style={{ backgroundColor: selectedItem.color, borderColor: selectedItem.borderColor }}
                          >
                            <Sparkles className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-[9px] font-mono font-black text-slate-800 block">
                            {selectedItem.name}
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1 text-slate-400 text-center">
                          <Dna className="w-6 h-6 mx-auto text-amber-500 animate-pulse" />
                          <span className="text-[8px] font-mono font-bold uppercase block">
                            Pasang Kristal Pigmen
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-xs font-mono text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                      Target Genotipe F1: <strong className="text-slate-900 text-sm font-black">{currentCase.f1Genotype}</strong> (Intermediet)
                    </div>
                  </div>

                  {/* 3 Crystals */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {currentCase.crystals.map((cryst) => {
                      const isSelected = selectedItem?.id === cryst.id;
                      return (
                        <div
                          key={cryst.id}
                          onClick={() => handleSelectItem(cryst)}
                          className={`p-3.5 rounded-xl cursor-pointer border-2 transition-all flex flex-col items-center text-center space-y-1.5 active:translate-y-0.5 ${
                            isSelected
                              ? 'bg-rose-50 border-rose-600 shadow-[3px_3px_0px_#be123c] scale-[1.02]'
                              : 'bg-white border-slate-800 hover:border-amber-500 shadow-[2px_2px_0px_#1e293b]'
                          }`}
                        >
                          <div 
                            className="w-8 h-8 rounded-lg border-2 flex items-center justify-center shadow-xs"
                            style={{ backgroundColor: cryst.color, borderColor: cryst.borderColor }}
                          >
                            <Sparkles className="w-4 h-4 text-white" />
                          </div>

                          <h4 className="text-xs font-black text-slate-900">
                            {cryst.name}
                          </h4>
                          <p className="text-[10px] text-slate-600 leading-tight">
                            {cryst.desc}
                          </p>

                          {isSelected && (
                            <span className="text-[8px] font-mono font-bold text-rose-700 bg-rose-100 border border-rose-300 px-1.5 py-0.5 rounded-full">
                              Siap Disintesis
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Tactical Feedback Banner */}
            {feedback && (
              <div className={`p-3.5 rounded-2xl border-2 shadow-[3px_3px_0px_#1e293b] flex items-start gap-3 animate-scale-up ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-950'
                  : 'bg-rose-50 border-rose-600 text-rose-950'
              }`}>
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <div className="font-mono font-black text-xs tracking-wider uppercase">
                    {feedback.title}
                  </div>
                  <p className="text-xs font-sans leading-relaxed">
                    {feedback.message}
                  </p>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex justify-between items-center pt-1">
              <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                *Pilih elemen tersangka lalu tekan tombol eksekusi
              </span>

              <button
                onClick={handleVerifySolution}
                disabled={!selectedItem}
                className={`px-7 py-3.5 rounded-2xl font-black text-xs sm:text-sm tracking-wider shadow-[4px_4px_0px_#1e293b] border-2 flex items-center gap-2 transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                  selectedItem
                    ? 'bg-[#c084fc] hover:bg-[#a855f7] text-slate-950 border-slate-800 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 border-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <span>
                  {currentCase.type === 'reactor' ? 'SINTESIS & STABILKAN REAKTOR' : 'NETRALKAN ANOMALI MUTAN'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          /* GRAND VICTORY VIEW */
          <div className="p-4 sm:p-8 rounded-3xl text-center space-y-3 sm:space-y-5 max-w-lg mx-auto bg-white border-2 border-slate-800 shadow-[4px_4px_0px_#1e293b] sm:shadow-[6px_6px_0px_#1e293b] max-h-[96vh] overflow-y-auto">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-emerald-100 border-2 border-emerald-600 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <Check className="w-6 h-6 sm:w-8 sm:h-8 stroke-[3px] animate-bounce" />
            </div>

            <div className="space-y-1.5">
              <div className="inline-block px-3 py-0.5 rounded-full bg-emerald-100 border border-emerald-400 text-emerald-800 font-mono text-[9px] font-black uppercase tracking-wider">
                SEMUA ANOMALI DINETRALKAN!
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-sans">
                STAGE 7 BERHASIL DISELESAIKAN!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hebat! Kamu berhasil mengungkap seluruh kebohongan, kegagalan meiosis, dan miskonsepsi pewarisan sifat. Lab sekarang aman dan kamu siap menghadapi pertarungan puncak melawan Dr. Chaos!
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border-2 border-amber-300 text-amber-900 space-y-0.5">
              <div className="text-[9px] text-slate-500 font-mono font-bold uppercase">Total Skor Investigasi:</div>
              <div className="text-2xl font-black font-mono text-amber-900">{score} PTS</div>
              <div className="text-[10px] font-black text-emerald-700 pt-0.5">
                Badge: Detektor Mutasi (Analitis Gen C5)
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
              {sourceWorldView === 'rpg-world' ? (
                <button
                  onClick={() => navigateTo('rpg-world')}
                  className="w-full px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-pixel text-xs tracking-wider uppercase flex items-center justify-center gap-2 border-2 border-slate-800 shadow-[3px_3px_0px_#1e293b] active:translate-y-0.5 transition cursor-pointer"
                >
                  <span>KEMBALI KE RPG WORLD</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigateTo('map')}
                    className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border-2 border-slate-800 shadow-[2px_2px_0px_#1e293b]"
                  >
                    PETA PETUALANGAN
                  </button>
                  <button
                    onClick={() => navigateTo('stage', 8)}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-black text-xs shadow-[3px_3px_0px_#1e293b] border-2 border-slate-800 flex items-center justify-center gap-2 animate-bounce"
                  >
                    <span>MASUK FINAL BOSS BATTLE (DR. CHAOS)!</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* MODAL PANDUAN CARA BERMAIN (STAGE 7)                     */}
      {/* ======================================================== */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fade-in text-left">
          <div className="w-full max-w-lg bg-[#faf6ee] border-3 sm:border-4 border-slate-800 shadow-[6px_6px_0px_#1e293b] sm:shadow-[8px_8px_0px_#1e293b] rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 space-y-3 sm:space-y-4 max-h-[96vh] overflow-y-auto text-slate-900 relative">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#fef08a] border-2 border-slate-800 flex items-center justify-center shadow-[2px_2px_0px_#1e293b]">
                  <BookOpen className="w-5 h-5 text-amber-900" />
                </div>
                <div>
                  <span className="text-[9px] font-black text-rose-700 uppercase tracking-widest font-mono block">
                    PANDUAN STAGE 7
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 font-sans">
                    Cara Bermain: Jebakan Mutasi
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

            {/* Target Misi */}
            <div className="p-3.5 rounded-2xl bg-white border-2 border-slate-800 shadow-[3px_3px_0px_#1e293b] space-y-1.5">
              <div className="flex items-center gap-2 text-rose-700 font-mono font-black text-xs">
                <ShieldAlert className="w-4 h-4" />
                <span>MISI UTAMA FORENSIK GENETIKA</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">
                Laboratorium disabotase oleh Dr. Chaos! Pecahkan <strong>3 Kasus</strong> berturut-turut untuk membongkar anomali biologis yang melanggar kaidah pewarisan sifat Mendel.
              </p>
            </div>

            {/* 3 Langkah Bermain Interaktif */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-black font-mono text-slate-900 uppercase tracking-wider">
                3 Langkah Cepat Menyelesaikan Kasus:
              </h4>

              {/* Step 1 */}
              <div className="p-3 rounded-xl bg-white border-2 border-slate-800 shadow-[2px_2px_0px_#1e293b] flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-sky-100 border-2 border-slate-800 flex items-center justify-center font-mono font-black text-xs text-sky-900 flex-shrink-0">
                  1
                </div>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-black text-slate-900 font-sans">
                    Baca Petunjuk Forensik (Kotak Kuning)
                  </h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Perhatikan susunan genotipe induk dan petunjuk ilmiah yang disediakan di bagian atas layar.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3 rounded-xl bg-white border-2 border-slate-800 shadow-[2px_2px_0px_#1e293b] flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-amber-100 border-2 border-slate-800 flex items-center justify-center font-mono font-black text-xs text-amber-900 flex-shrink-0">
                  2
                </div>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-black text-slate-900 font-sans">
                    Klik Objek untuk Memindai / Memilih Tersangka
                  </h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    • <strong>Kasus 1</strong>: Klik tabung gamet untuk melihat laporan alel di Bio-Scanner (gamet normal hanya bawa 1 alel per gen, jika ada A dan a dalam 1 gamet, itu gagal berpisah!).<br />
                    • <strong>Kasus 2</strong>: Lengkapi kotak kosong pada papan Punnett 2x2 hasil persilangan gamet <em>p &times; p</em> dengan modul [pp &bull; Bunga Putih].<br />
                    • <strong>Kasus 3</strong>: Pasang kristal pigmen yang tepat (persilangan intermediet merah &times; putih = merah muda/pink).
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3 rounded-xl bg-white border-2 border-slate-800 shadow-[2px_2px_0px_#1e293b] flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-[#c084fc] border-2 border-slate-800 flex items-center justify-center font-mono font-black text-xs text-slate-950 flex-shrink-0">
                  3
                </div>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-black text-slate-900 font-sans">
                    Eksekusi & Netralkan Anomali
                  </h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Setelah tersangka terpilih (ditandai bingkai merah), klik tombol ungu <strong>"NETRALKAN ANOMALI MUTAN"</strong> di pojok kanan bawah untuk menyelesaikan kasus!
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
              SAYA MENGERTI, AYO BERMAIN! 🚀
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
