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
  ChevronDown,
  Info
} from 'lucide-react';

// SeedIcon Component for phenotype visualization
const SeedIcon = ({ genotypeOrPhenotype, size = 20 }) => {
  if (!genotypeOrPhenotype) return null;
  const str = String(genotypeOrPhenotype);
  let isRound = true;
  let isYellow = true;

  if (!str.includes(' ')) {
    // Genotype parsing (e.g. 'AaBb')
    isRound = str.includes('A');
    isYellow = str.includes('B');
  } else {
    // Phenotype label parsing (e.g. 'Bulat Kuning')
    isRound = str.includes('Bulat');
    isYellow = str.includes('Kuning');
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

// --- Interactive Parental Gamete Line Formation Guide (AaBb -> AB, Ab, aB, ab) ---
// --- Interactive Parental Gamete Line Formation Guide (AaBb -> AB, Ab, aB, ab) ---
const ParentalGameteLineGuide = ({ highlightedGamete, onSelectGamete }) => {
  const gameteInfo = {
    AB: {
      gene1: 'A',
      gene2: 'B',
      label: 'A ➔ B',
      name: 'Gamet AB',
      desc: 'Bulat Kuning',
      text: 'Alel A (Bulat) berpasangan dengan alel B (Kuning)',
      color: '#2563eb',
      bgClass: 'bg-blue-50 border-blue-400 text-blue-900',
      activeClass: 'border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-400 shadow-sm'
    },
    Ab: {
      gene1: 'A',
      gene2: 'b',
      label: 'A ➔ b',
      name: 'Gamet Ab',
      desc: 'Bulat Hijau',
      text: 'Alel A (Bulat) berpasangan dengan alel b (Hijau)',
      color: '#7c3aed',
      bgClass: 'bg-purple-50 border-purple-400 text-purple-900',
      activeClass: 'border-purple-500 bg-purple-50 text-purple-900 ring-2 ring-purple-400 shadow-sm'
    },
    aB: {
      gene1: 'a',
      gene2: 'B',
      label: 'a ➔ B',
      name: 'Gamet aB',
      desc: 'Keriput Kuning',
      text: 'Alel a (Keriput) berpasangan dengan alel B (Kuning)',
      color: '#d97706',
      bgClass: 'bg-amber-50 border-amber-400 text-amber-900',
      activeClass: 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-400 shadow-sm'
    },
    ab: {
      gene1: 'a',
      gene2: 'b',
      label: 'a ➔ b',
      name: 'Gamet ab',
      desc: 'Keriput Hijau',
      text: 'Alel a (Keriput) berpasangan dengan alel b (Hijau)',
      color: '#059669',
      bgClass: 'bg-emerald-50 border-emerald-400 text-emerald-900',
      activeClass: 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-400 shadow-sm'
    }
  };

  const currentInfo = highlightedGamete ? gameteInfo[highlightedGamete] : null;

  // Check which alleles should be highlighted
  const isAActive = currentInfo ? currentInfo.gene1 === 'A' : false;
  const isaActive = currentInfo ? currentInfo.gene1 === 'a' : false;
  const isBActive = currentInfo ? currentInfo.gene2 === 'B' : false;
  const isbActive = currentInfo ? currentInfo.gene2 === 'b' : false;

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* SVG Diagram with curved connecting lines */}
      <div className="w-full relative py-0.5">
        <svg viewBox="0 0 380 155" className="w-full max-w-[340px] sm:max-w-[370px] h-auto mx-auto block overflow-visible">
          <defs>
            <marker id="arrow-blue" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563eb" />
            </marker>
            <marker id="arrow-purple" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#7c3aed" />
            </marker>
            <marker id="arrow-amber" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#d97706" />
            </marker>
            <marker id="arrow-emerald" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#059669" />
            </marker>
            <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#2563eb" floodOpacity="0.7" />
            </filter>
            <filter id="glow-purple" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#7c3aed" floodOpacity="0.7" />
            </filter>
            <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#d97706" floodOpacity="0.7" />
            </filter>
            <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#059669" floodOpacity="0.7" />
            </filter>
          </defs>

          {/* Background card container */}
          <rect width="100%" height="100%" fill="#fffdfa" rx="14" stroke="#cbd5e1" strokeWidth="1.2" />

          {/* Gene 1 & Gene 2 Header labels */}
          <text x="90" y="44" fontFamily="sans-serif" fontSize="8" fontWeight="700" fill="#64748b" textAnchor="middle">
            Gen 1 (Bentuk)
          </text>
          <text x="286" y="44" fontFamily="sans-serif" fontSize="8" fontWeight="700" fill="#64748b" textAnchor="middle">
            Gen 2 (Warna)
          </text>

          {/* Prompt when no gamete is selected */}
          {!highlightedGamete && (
            <g className="animate-pulse">
              <rect x="55" y="10" width="270" height="20" rx="6" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
              <text x="190" y="23" fontFamily="sans-serif" fontSize="8.5" fontWeight="700" fill="#475569" textAnchor="middle">
                👆 Klik salah satu kotak gamet untuk melihat garisnya
              </text>
            </g>
          )}

          {/* Line 2: A to b (High Top Arc) - ONLY VISIBLE WHEN 'Ab' IS SELECTED */}
          {highlightedGamete === 'Ab' && (
            <g className="animate-scale-up" filter="url(#glow-purple)">
              <path
                d="M 68 54 C 115 -6, 265 -6, 308 54"
                fill="none"
                stroke="#7c3aed"
                strokeWidth={3.5}
                strokeDasharray="6,3"
                strokeLinecap="round"
                markerEnd="url(#arrow-purple)"
              />
              <rect x="174" y="2" width="32" height="15" rx="4" fill="#7c3aed" />
              <text x="190" y="13.5" fontFamily="monospace" fontSize="9" fontWeight="900" fill="#ffffff" textAnchor="middle">Ab</text>
            </g>
          )}

          {/* Line 1: A to B (Inner Top Arc) - ONLY VISIBLE WHEN 'AB' IS SELECTED */}
          {highlightedGamete === 'AB' && (
            <g className="animate-scale-up" filter="url(#glow-blue)">
              <path
                d="M 68 56 C 110 20, 220 20, 264 56"
                fill="none"
                stroke="#2563eb"
                strokeWidth={3.5}
                strokeDasharray="6,3"
                strokeLinecap="round"
                markerEnd="url(#arrow-blue)"
              />
              <rect x="150" y="16" width="32" height="15" rx="4" fill="#2563eb" />
              <text x="166" y="27.5" fontFamily="monospace" fontSize="9" fontWeight="900" fill="#ffffff" textAnchor="middle">AB</text>
            </g>
          )}

          {/* Gene 1 Box: [A] [a] */}
          <rect x="42" y="53" width="96" height="42" rx="10" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1.5" />
          
          {/* Allele A */}
          <g style={{ opacity: !highlightedGamete || isAActive ? 1 : 0.35, transition: 'all 0.3s' }}>
            <circle
              cx="68"
              cy="74"
              r={isAActive ? 15.5 : 14}
              fill={isAActive ? '#dbeafe' : '#ffffff'}
              stroke={isAActive ? '#2563eb' : '#1d4ed8'}
              strokeWidth={isAActive ? 3 : 2}
            />
            <text x="68" y="79.5" fontFamily="monospace" fontSize={isAActive ? 16 : 15} fontWeight="900" fill="#1e40af" textAnchor="middle">A</text>
          </g>

          {/* Allele a */}
          <g style={{ opacity: !highlightedGamete || isaActive ? 1 : 0.35, transition: 'all 0.3s' }}>
            <circle
              cx="112"
              cy="74"
              r={isaActive ? 15.5 : 14}
              fill={isaActive ? '#ede9fe' : '#ffffff'}
              stroke={isaActive ? '#7c3aed' : '#6d28d9'}
              strokeWidth={isaActive ? 3 : 2}
            />
            <text x="112" y="79.5" fontFamily="monospace" fontSize={isaActive ? 16 : 15} fontWeight="900" fill="#5b21b6" textAnchor="middle">a</text>
          </g>

          {/* Cross Multiplication Sign */}
          <text x="190" y="78" fontFamily="sans-serif" fontSize="13" fontWeight="900" fill="#94a3b8" textAnchor="middle">✕</text>

          {/* Gene 2 Box: [B] [b] */}
          <rect x="238" y="53" width="96" height="42" rx="10" fill="#fefce8" stroke="#eab308" strokeWidth="1.5" />

          {/* Allele B */}
          <g style={{ opacity: !highlightedGamete || isBActive ? 1 : 0.35, transition: 'all 0.3s' }}>
            <circle
              cx="264"
              cy="74"
              r={isBActive ? 15.5 : 14}
              fill={isBActive ? '#fef3c7' : '#ffffff'}
              stroke={isBActive ? '#d97706' : '#b45309'}
              strokeWidth={isBActive ? 3 : 2}
            />
            <text x="264" y="79.5" fontFamily="monospace" fontSize={isBActive ? 16 : 15} fontWeight="900" fill="#92400e" textAnchor="middle">B</text>
          </g>

          {/* Allele b */}
          <g style={{ opacity: !highlightedGamete || isbActive ? 1 : 0.35, transition: 'all 0.3s' }}>
            <circle
              cx="308"
              cy="74"
              r={isbActive ? 15.5 : 14}
              fill={isbActive ? '#d1fae5' : '#ffffff'}
              stroke={isbActive ? '#059669' : '#047857'}
              strokeWidth={isbActive ? 3 : 2}
            />
            <text x="308" y="79.5" fontFamily="monospace" fontSize={isbActive ? 16 : 15} fontWeight="900" fill="#065f46" textAnchor="middle">b</text>
          </g>

          {/* Line 3: a to B (Inner Bottom Arc) - ONLY VISIBLE WHEN 'aB' IS SELECTED */}
          {highlightedGamete === 'aB' && (
            <g className="animate-scale-up" filter="url(#glow-amber)">
              <path
                d="M 112 94 C 135 130, 235 130, 264 94"
                fill="none"
                stroke="#d97706"
                strokeWidth={3.5}
                strokeDasharray="6,3"
                strokeLinecap="round"
                markerEnd="url(#arrow-amber)"
              />
              <rect x="174" y="112" width="32" height="15" rx="4" fill="#d97706" />
              <text x="190" y="123.5" fontFamily="monospace" fontSize="9" fontWeight="900" fill="#ffffff" textAnchor="middle">aB</text>
            </g>
          )}

          {/* Line 4: a to b (Low Bottom Arc) - ONLY VISIBLE WHEN 'ab' IS SELECTED */}
          {highlightedGamete === 'ab' && (
            <g className="animate-scale-up" filter="url(#glow-emerald)">
              <path
                d="M 112 94 C 145 154, 275 154, 308 94"
                fill="none"
                stroke="#059669"
                strokeWidth={3.5}
                strokeDasharray="6,3"
                strokeLinecap="round"
                markerEnd="url(#arrow-emerald)"
              />
              <rect x="196" y="128" width="32" height="15" rx="4" fill="#059669" />
              <text x="212" y="139.5" fontFamily="monospace" fontSize="9" fontWeight="900" fill="#ffffff" textAnchor="middle">ab</text>
            </g>
          )}
        </svg>
      </div>

      {/* Dynamic Explanation Callout when a Gamete is chosen */}
      {currentInfo && (
        <div className={`w-full mt-1 px-2 py-1 rounded-lg border text-[8.5px] font-bold text-center flex items-center justify-center gap-1.5 animate-scale-up ${currentInfo.bgClass}`}>
          <span className="font-mono font-black">{currentInfo.name}:</span>
          <span>{currentInfo.text}</span>
          <span className="px-1.5 py-0.2 rounded bg-white/70 text-[7.5px] font-extrabold border border-current">
            {currentInfo.label}
          </span>
        </div>
      )}

      {/* 4 Interactive Gamete Pills with Explanation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 w-full mt-1.5">
        {[
          { id: 'AB', line: 'A ➔ B', label: 'Gamet AB', desc: 'Bulat Kuning', activeClass: 'border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-400 shadow-sm' },
          { id: 'Ab', line: 'A ➔ b', label: 'Gamet Ab', desc: 'Bulat Hijau', activeClass: 'border-purple-500 bg-purple-50 text-purple-900 ring-2 ring-purple-400 shadow-sm' },
          { id: 'aB', line: 'a ➔ B', label: 'Gamet aB', desc: 'Keriput Kuning', activeClass: 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-400 shadow-sm' },
          { id: 'ab', line: 'a ➔ b', label: 'Gamet ab', desc: 'Keriput Hijau', activeClass: 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-400 shadow-sm' }
        ].map((item) => (
          <button
            key={`guide-${item.id}`}
            type="button"
            onClick={() => onSelectGamete(highlightedGamete === item.id ? null : item.id)}
            className={`p-1.5 rounded-xl border text-left cursor-pointer transition-all ${
              highlightedGamete === item.id
                ? item.activeClass
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-3xs'
            }`}
            title={`Klik kotak untuk melihat garis ${item.line}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-black text-[10px] sm:text-[11px]">{item.id}</span>
              <span className="text-[7.5px] font-bold text-slate-400 font-sans">{item.line}</span>
            </div>
            <div className="text-[7.5px] sm:text-[8px] text-slate-500 truncate mt-0.5 font-medium">{item.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Interactive Offspring Genotype Combination Guide (e.g. AB x AB -> AABB) ---
const OffspringGenotypeLineGuide = ({ 
  rowGamete = 'AB', 
  colGamete = 'AB',
  onSelectPreset
}) => {
  const g1Row = (rowGamete && rowGamete[0]) || 'A';
  const g2Row = (rowGamete && rowGamete[1]) || 'B';
  const g1Col = (colGamete && colGamete[0]) || 'A';
  const g2Col = (colGamete && colGamete[1]) || 'B';

  const sortPair = (c1, c2) => {
    const char1 = String(c1 || '');
    const char2 = String(c2 || '');
    if (char1 === char1.toUpperCase() && char2 === char2.toLowerCase()) return char1 + char2;
    if (char1 === char2.toLowerCase() && char2 === char1.toUpperCase()) return char2 + char1;
    return [char1, char2].sort().join('');
  };

  const pair1 = sortPair(g1Row, g1Col);
  const pair2 = sortPair(g2Row, g2Col);
  const fullGenotype = String(pair1 + pair2);

  const getPhenotype = (genotype) => {
    const str = String(genotype || '');
    const isRound = str.includes('A');
    const isYellow = str.includes('B');
    if (isRound && isYellow) return { label: 'Bulat Kuning', bg: '#fef3c7', text: '#92400e', color: '#eab308' };
    if (isRound && !isYellow) return { label: 'Bulat Hijau', bg: '#ecfccb', text: '#3f6212', color: '#84cc16' };
    if (!isRound && isYellow) return { label: 'Keriput Kuning', bg: '#ffedd5', text: '#9a3412', color: '#f97316' };
    return { label: 'Keriput Hijau', bg: '#d1fae5', text: '#065f46', color: '#10b981' };
  };

  const pheno = getPhenotype(fullGenotype);

  const getAlleleColor = (allele) => {
    if (allele === 'A') return { fill: '#dbeafe', stroke: '#2563eb', text: '#1e40af' };
    if (allele === 'a') return { fill: '#ede9fe', stroke: '#7c3aed', text: '#5b21b6' };
    if (allele === 'B') return { fill: '#fefce8', stroke: '#d97706', text: '#92400e' };
    return { fill: '#d1fae5', stroke: '#059669', text: '#065f46' };
  };

  const c_g1Row = getAlleleColor(g1Row);
  const c_g2Row = getAlleleColor(g2Row);
  const c_g1Col = getAlleleColor(g1Col);
  const c_g2Col = getAlleleColor(g2Col);

  return (
    <div className="w-full flex flex-col items-center select-none animate-scale-up">
      {/* SVG Diagram with curved connecting lines */}
      <div className="w-full relative py-0.5">
        <svg viewBox="0 0 380 180" className="w-full max-w-[340px] sm:max-w-[370px] h-auto mx-auto block overflow-visible">
          <defs>
            <marker id="arrow-gene1-offspring" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563eb" />
            </marker>
            <marker id="arrow-gene2-offspring" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#d97706" />
            </marker>
            <filter id="glow-gene1-offspring" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#2563eb" floodOpacity="0.5" />
            </filter>
            <filter id="glow-gene2-offspring" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#d97706" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Background card container */}
          <rect width="100%" height="100%" fill="#fffdfa" rx="14" stroke="#cbd5e1" strokeWidth="1.2" />

          {/* Header Titles */}
          <text x="95" y="18" fontFamily="sans-serif" fontSize="8" fontWeight="800" fill="#475569" textAnchor="middle">
            Gamet ♀ (Ibu / Baris)
          </text>
          <text x="285" y="18" fontFamily="sans-serif" fontSize="8" fontWeight="800" fill="#475569" textAnchor="middle">
            Gamet ♂ (Ayah / Kolom)
          </text>

          {/* Gamet ♀ Container */}
          <rect x="45" y="24" width="100" height="46" rx="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
          {/* Allele g1Row (Gen Bentuk) */}
          <circle cx="72" cy="43" r="13" fill={c_g1Row.fill} stroke={c_g1Row.stroke} strokeWidth="2.2" />
          <text x="72" y="48" fontFamily="monospace" fontSize="13.5" fontWeight="900" fill={c_g1Row.text} textAnchor="middle">{g1Row}</text>
          <text x="72" y="64" fontFamily="sans-serif" fontSize="6.5" fontWeight="700" fill="#64748b" textAnchor="middle">Bentuk</text>

          {/* Allele g2Row (Gen Warna) */}
          <circle cx="118" cy="43" r="13" fill={c_g2Row.fill} stroke={c_g2Row.stroke} strokeWidth="2.2" />
          <text x="118" y="48" fontFamily="monospace" fontSize="13.5" fontWeight="900" fill={c_g2Row.text} textAnchor="middle">{g2Row}</text>
          <text x="118" y="64" fontFamily="sans-serif" fontSize="6.5" fontWeight="700" fill="#64748b" textAnchor="middle">Warna</text>

          {/* Fertilization Sign */}
          <circle cx="190" cy="47" r="11" fill="#eff6ff" stroke="#93c5fd" strokeWidth="1.2" />
          <text x="190" y="51" fontFamily="sans-serif" fontSize="12" fontWeight="900" fill="#1d4ed8" textAnchor="middle">✕</text>

          {/* Gamet ♂ Container */}
          <rect x="235" y="24" width="100" height="46" rx="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
          {/* Allele g1Col (Gen Bentuk) */}
          <circle cx="262" cy="43" r="13" fill={c_g1Col.fill} stroke={c_g1Col.stroke} strokeWidth="2.2" />
          <text x="262" y="48" fontFamily="monospace" fontSize="13.5" fontWeight="900" fill={c_g1Col.text} textAnchor="middle">{g1Col}</text>
          <text x="262" y="64" fontFamily="sans-serif" fontSize="6.5" fontWeight="700" fill="#64748b" textAnchor="middle">Bentuk</text>

          {/* Allele g2Col (Gen Warna) */}
          <circle cx="308" cy="43" r="13" fill={c_g2Col.fill} stroke={c_g2Col.stroke} strokeWidth="2.2" />
          <text x="308" y="48" fontFamily="monospace" fontSize="13.5" fontWeight="900" fill={c_g2Col.text} textAnchor="middle">{g2Col}</text>
          <text x="308" y="64" fontFamily="sans-serif" fontSize="6.5" fontWeight="700" fill="#64748b" textAnchor="middle">Warna</text>

          {/* Connecting Arc 1: Gen Bentuk */}
          <g filter="url(#glow-gene1-offspring)">
            <path
              d="M 72 56 C 72 85, 82 92, 82 122"
              fill="none"
              stroke="#2563eb"
              strokeWidth={2.5}
              strokeDasharray="5 3"
              strokeLinecap="round"
              markerEnd="url(#arrow-gene1-offspring)"
            />
            <path
              d="M 262 56 C 262 92, 102 85, 102 122"
              fill="none"
              stroke="#2563eb"
              strokeWidth={2.5}
              strokeDasharray="5 3"
              strokeLinecap="round"
              markerEnd="url(#arrow-gene1-offspring)"
            />
          </g>

          {/* Connecting Arc 2: Gen Warna */}
          <g filter="url(#glow-gene2-offspring)">
            <path
              d="M 118 56 C 118 85, 170 92, 170 122"
              fill="none"
              stroke="#d97706"
              strokeWidth={2.5}
              strokeDasharray="5 3"
              strokeLinecap="round"
              markerEnd="url(#arrow-gene2-offspring)"
            />
            <path
              d="M 308 56 C 308 85, 190 92, 190 122"
              fill="none"
              stroke="#d97706"
              strokeWidth={2.5}
              strokeDasharray="5 3"
              strokeLinecap="round"
              markerEnd="url(#arrow-gene2-offspring)"
            />
          </g>

          {/* Result Box (Bottom) */}
          <rect x="45" y="124" width="290" height="48" rx="12" fill="#ffffff" stroke="#0f172a" strokeWidth="1.8" />

          {/* Label Pair 1 (Bentuk) */}
          <rect x="58" y="129" width="68" height="38" rx="8" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1.4" />
          <text x="92" y="140" fontFamily="sans-serif" fontSize="7" fontWeight="800" fill="#1d4ed8" textAnchor="middle">Alel Bentuk</text>
          <text x="92" y="157" fontFamily="monospace" fontSize="14" fontWeight="900" fill="#1e40af" textAnchor="middle">{pair1}</text>

          {/* Plus sign */}
          <text x="136" y="151" fontFamily="sans-serif" fontSize="13" fontWeight="900" fill="#64748b" textAnchor="middle">+</text>

          {/* Label Pair 2 (Warna) */}
          <rect x="146" y="129" width="68" height="38" rx="8" fill="#fefce8" stroke="#eab308" strokeWidth="1.4" />
          <text x="180" y="140" fontFamily="sans-serif" fontSize="7" fontWeight="800" fill="#b45309" textAnchor="middle">Alel Warna</text>
          <text x="180" y="157" fontFamily="monospace" fontSize="14" fontWeight="900" fill="#92400e" textAnchor="middle">{pair2}</text>

          {/* Arrow to full genotype */}
          <text x="224" y="151" fontFamily="sans-serif" fontSize="13" fontWeight="900" fill="#64748b" textAnchor="middle">➔</text>

          {/* Combined Genotype + Phenotype badge */}
          <rect 
            x="234" 
            y="129" 
            width="93" 
            height="38" 
            rx="8" 
            fill={pheno.color === '#eab308' ? '#fef3c7' : pheno.color === '#84cc16' ? '#ecfccb' : pheno.color === '#f97316' ? '#ffedd5' : '#d1fae5'} 
            stroke={pheno.color} 
            strokeWidth="1.4" 
          />
          <text x="280.5" y="144" fontFamily="monospace" fontSize="13" fontWeight="900" fill={pheno.text} textAnchor="middle">{fullGenotype}</text>
          <text x="280.5" y="158" fontFamily="sans-serif" fontSize="7.5" fontWeight="800" fill={pheno.text} textAnchor="middle">{pheno.label}</text>
        </svg>
      </div>

      {/* Dynamic Explanation Footer */}
      <div className="w-full mt-1.5 px-2 py-1 rounded-lg bg-white border border-slate-200 text-[8px] sm:text-[8.5px] font-bold text-slate-700 text-center flex flex-wrap items-center justify-center gap-1 shadow-3xs">
        <span className="text-slate-400 font-extrabold">Alur:</span>
        <span className="font-mono text-blue-700 font-black">{g1Row} + {g1Col} ➔ {pair1}</span>
        <span className="text-slate-300">&bull;</span>
        <span className="font-mono text-amber-700 font-black">{g2Row} + {g2Col} ➔ {pair2}</span>
        <span className="text-slate-300">&bull;</span>
        <span className="font-black text-slate-900 font-mono">Hasil: {fullGenotype}</span>
      </div>

      {/* 4 Quick Sample Genotype Presets */}
      <div className="grid grid-cols-4 gap-1 w-full mt-1.5">
        {[
          { label: 'AABB', row: 'AB', col: 'AB', desc: 'Bulat Kuning' },
          { label: 'AABb', row: 'AB', col: 'Ab', desc: 'Bulat Kuning' },
          { label: 'AaBb', row: 'Ab', col: 'aB', desc: 'Bulat Kuning' },
          { label: 'aabb', row: 'ab', col: 'ab', desc: 'Keriput Hijau' }
        ].map((preset) => {
          const isCurrent = fullGenotype === preset.label;
          return (
            <button
              key={`preset-${preset.label}`}
              type="button"
              onClick={() => onSelectPreset && onSelectPreset(preset.row, preset.col)}
              className={`p-1 rounded-lg border text-center cursor-pointer transition-all ${
                isCurrent
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-400 font-black shadow-3xs scale-[1.02]'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-3xs'
              }`}
              title={`Klik untuk melihat alur pembentukan ${preset.label}`}
            >
              <div className="font-mono font-black text-[9.5px] sm:text-[10.5px]">{preset.label}</div>
              <div className="text-[6.5px] text-slate-400 font-medium truncate">{preset.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const Stage6DihybridAdventure = () => {
  const { navigateTo, completeStage, sourceWorldView } = useGame();
  
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

  // Gamete line guide state (Hukum Asortasi Bebas visual guide)
  const [highlightedGamete, setHighlightedGamete] = useState(null);
  const [showGameteGuide, setShowGameteGuide] = useState(true);
  // Guide tab: 'parental' (Asortasi Bebas AaBb -> gamet) | 'offspring' (Fertilisasi gamet -> genotipe AABB, dll)
  const [guideTab, setGuideTab] = useState('parental');
  const [sampleCross, setSampleCross] = useState(null); // null | { row: 'AB', col: 'AB' }

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
    sound.playClick();
    
    // Determine the expected or current gamete for this column / row
    const currentVal = type === 'col' ? assignedCols[index] : assignedRows[index];
    const targetGamete = currentVal || expectedGametes[index];
    
    // Toggle active slot
    const isSameSlot = activeHeaderSlot && activeHeaderSlot.type === type && activeHeaderSlot.index === index;
    if (isSameSlot || (step !== 1 && highlightedGamete === targetGamete)) {
      if (step === 1) setActiveHeaderSlot(null);
      setHighlightedGamete(null);
    } else {
      if (step === 1) setActiveHeaderSlot({ type, index });
      setHighlightedGamete(targetGamete);
      setShowGameteGuide(true);
    }
    setFeedback(null);
  };

  const handleSelectHeaderGameteOption = (g) => {
    if (!activeHeaderSlot) return;
    sound.playClick();
    setHighlightedGamete(g);
    
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
        setGuideTab('offspring');
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
    setGuideTab('offspring');
    setShowGameteGuide(true);
    setSampleCross(null);

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
    <div className="w-full h-screen relative overflow-hidden bg-[#faf6ee] select-none flex flex-col p-2 sm:p-4 md:p-8 text-left overflow-y-auto stage-main-wrapper">
      {/* Parchment background effect */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] z-0" />

      {/* Floating HUD */}
      <div className="w-full p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white border-2 border-slate-800 shadow-[3px_3px_0px_#1e293b] sm:shadow-[4px_4px_0px_#1e293b] flex items-center justify-between gap-2 z-30 relative mb-1.5 sm:mb-3 flex-shrink-0 stage-header-hud">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo(sourceWorldView === 'rpg-world' ? 'rpg-world' : 'map')}
            className="p-1.5 rounded-xl bg-white border-2 border-slate-800 text-slate-700 hover:text-sky-600 transition shadow-3xs cursor-pointer flex-shrink-0 active:translate-y-0.5"
            title={sourceWorldView === 'rpg-world' ? "Kembali ke RPG Map" : "Kembali ke Peta"}
          >
            <ChevronLeft className="w-4 h-4 stroke-[3px]" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border-2 border-slate-800 p-0.5 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img 
                src="/assets/rumah_mendel_banner.webp" 
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
          <div className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl bg-indigo-500/10 border-2 border-slate-800 text-[8.5px] sm:text-[9px] font-black text-indigo-900">
            Bagian {round}/2
          </div>

          <div className="flex items-center gap-1.5 bg-amber-500/10 border-2 border-slate-800 px-2.5 sm:px-3 py-1 rounded-xl shadow-3xs">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-[9.5px] sm:text-[10px] font-black text-amber-900 font-mono font-bold">Skor: {score}</span>
          </div>
        </div>
      </div>

      {!stageCompleted ? (
        <div className="flex-1 flex flex-col justify-between relative z-10 py-0.5 sm:py-1 overflow-y-auto stage-workspace-compact">
          
          {step === 4 ? (
            /* Intermediate Round Transition Screen */
            <div className="bg-white border-2 border-slate-800 rounded-3xl p-4 sm:p-6 shadow-[4px_4px_0px_#1e293b] text-center space-y-3 sm:space-y-4 max-w-sm mx-auto my-auto animate-scale-up max-h-[96vh] overflow-y-auto">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-50 border-2 border-slate-800 flex items-center justify-center mx-auto shadow-3xs">
                <span className="text-lg sm:text-xl font-black text-indigo-700">2</span>
              </div>
              <div className="space-y-1 sm:space-y-1.5">
                <h3 className="text-sm sm:text-base font-black text-slate-800">BAGIAN 1 SELESAI!</h3>
                <p className="text-[9.5px] sm:text-[10.5px] text-slate-600 font-bold leading-relaxed px-1">
                  Luar biasa! Kamu berhasil menuntaskan persilangan dihibrid model huruf (genotipe).
                  Sekarang, tantangan berikutnya adalah melakukan persilangan secara visual menggunakan model gambar fenotipe biji ercis.
                </p>
              </div>
              <button
                onClick={handleTransitionToRound2}
                className="w-full py-2.5 sm:py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-black text-xs shadow-[3px_3px_0px_#1e293b] flex items-center justify-center gap-2 border-2 border-slate-800 cursor-pointer active:translate-y-0.5 active:shadow-none hover:scale-[1.02] transition-all"
              >
                <span>LANJUT KE BAGIAN 2</span>
                <ArrowRight className="w-4 h-4 stroke-[3px]" />
              </button>
            </div>
          ) : (
            /* Main Game Board Card */
            <div className="bg-[#faf6ee] border-2 border-slate-800 rounded-2xl sm:rounded-3xl p-2.5 sm:p-5 shadow-[3px_3px_0px_#1e293b] sm:shadow-[4px_4px_0px_#1e293b] flex flex-col gap-2 sm:gap-3.5 relative overflow-hidden flex-shrink-0">
              
              {/* Stage Title */}
              <div className="border-b-2 border-slate-800 pb-1.5 sm:pb-2 flex justify-between items-center">
                <div>
                  <h1 className="text-xs sm:text-sm font-black text-slate-800 tracking-wide uppercase">
                    8. STAGE 6 - DIHYBRID ADVENTURE
                  </h1>
                  <p className="text-[8.5px] sm:text-[9.5px] font-bold text-slate-500 mt-0.5">
                    Bagian {round}: {round === 1 ? 'Model Huruf (Genotipe)' : 'Model Gambar (Fenotipe)'} &bull; {' '}
                    {step === 1 && 'Susun kombinasi gamet dari masing-masing induk dihibrid!'}
                    {step === 2 && 'Tentukan hasil persilangan untuk setiap kotak Punnett!'}
                    {step === 3 && 'Pilih rasio fenotipe F2 yang terbentuk dari persilangan!'}
                  </p>
                </div>
              </div>

              {/* Board and interactive panels */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 items-start max-w-5xl mx-auto w-full">
                
                {/* Left controls column */}
                <div className="lg:col-span-6 space-y-2.5 sm:space-y-3.5 w-full flex flex-col items-center">
                  
                  {/* Induk display info & Dual Gamete/Offspring Line Guide */}
                  <div className="bg-amber-50/70 border border-slate-350 rounded-2xl p-2 sm:p-2.5 flex flex-col items-center shadow-3xs transition-all">
                    <div className="w-full flex items-center justify-between gap-1.5 pb-1.5 border-b border-amber-200/80">
                      {/* Tab selector between Gamet Induk (AaBb) and Keturunan F2 (AABB, dll) */}
                      <div className="flex items-center gap-1 bg-amber-100/80 p-0.5 rounded-lg border border-amber-300/60">
                        <button
                          type="button"
                          onClick={() => setGuideTab('parental')}
                          className={`px-1.5 sm:px-2 py-0.5 rounded-md text-[7.5px] sm:text-[8px] font-black transition-all cursor-pointer ${
                            guideTab === 'parental'
                              ? 'bg-white text-amber-950 shadow-3xs'
                              : 'text-amber-800 hover:text-amber-950'
                          }`}
                        >
                          🧬 Gamet Induk
                        </button>
                        <button
                          type="button"
                          onClick={() => setGuideTab('offspring')}
                          className={`px-1.5 sm:px-2 py-0.5 rounded-md text-[7.5px] sm:text-[8px] font-black transition-all cursor-pointer ${
                            guideTab === 'offspring'
                              ? 'bg-white text-indigo-950 shadow-3xs'
                              : 'text-amber-800 hover:text-amber-950'
                          }`}
                        >
                          🌱 Keturunan
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowGameteGuide(!showGameteGuide)}
                        className="flex items-center gap-1 text-[8px] sm:text-[8.5px] font-black text-indigo-700 hover:text-indigo-900 bg-white/90 hover:bg-white px-2 py-0.5 rounded-lg border border-indigo-200/80 shadow-3xs cursor-pointer transition-all"
                      >
                        <span>{showGameteGuide ? 'Tutup Garis' : 'Lihat Garis'}</span>
                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showGameteGuide ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {guideTab === 'parental' ? (
                      <>
                        <div className="flex items-center gap-2 sm:gap-2.5 my-1.5">
                          <div className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl border border-slate-800 bg-white font-mono font-black text-[10px] sm:text-[11px] shadow-3xs text-center">
                            <span className="text-[7px] font-sans font-extrabold text-slate-400 mr-1">Induk 1:</span>
                            <span>{parentGenotype}</span>
                          </div>
                          <span className="text-slate-800 font-extrabold text-xs">✕</span>
                          <div className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl border border-slate-800 bg-white font-mono font-black text-[10px] sm:text-[11px] shadow-3xs text-center">
                            <span className="text-[7px] font-sans font-extrabold text-slate-400 mr-1">Induk 2:</span>
                            <span>{parentGenotype}</span>
                          </div>
                        </div>

                        {showGameteGuide && (
                          <ParentalGameteLineGuide
                            highlightedGamete={highlightedGamete}
                            onSelectGamete={setHighlightedGamete}
                          />
                        )}
                      </>
                    ) : (
                      <>
                        {(() => {
                          const rIdx = activeCell ? activeCell[0] : 0;
                          const cIdx = activeCell ? activeCell[1] : 0;
                          const activeRowG = sampleCross ? sampleCross.row : (assignedRows[rIdx] || expectedGametes[rIdx] || 'AB');
                          const activeColG = sampleCross ? sampleCross.col : (assignedCols[cIdx] || expectedGametes[cIdx] || 'AB');

                          return (
                            <>
                              <div className="flex items-center gap-2 sm:gap-2.5 my-1.5">
                                <div className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl border border-blue-500 bg-blue-50 font-mono font-black text-[10px] sm:text-[11px] shadow-3xs text-center">
                                  <span className="text-[7px] font-sans font-extrabold text-blue-600 mr-1">Gamet ♀:</span>
                                  <span className="text-blue-900">{activeRowG}</span>
                                </div>
                                <span className="text-slate-800 font-extrabold text-xs">✕</span>
                                <div className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl border border-amber-500 bg-amber-50 font-mono font-black text-[10px] sm:text-[11px] shadow-3xs text-center">
                                  <span className="text-[7px] font-sans font-extrabold text-amber-600 mr-1">Gamet ♂:</span>
                                  <span className="text-amber-900">{activeColG}</span>
                                </div>
                              </div>

                              {showGameteGuide && (
                                <OffspringGenotypeLineGuide
                                  rowGamete={activeRowG}
                                  colGamete={activeColG}
                                  onSelectPreset={(rG, cG) => setSampleCross({ row: rG, col: cG })}
                                />
                              )}
                            </>
                          );
                        })()}
                      </>
                    )}
                  </div>

                  {/* Step 1 controls (Gamete headers selection) */}
                  {step === 1 && (
                    <div className="bg-white border border-slate-350 rounded-2xl p-2 sm:p-3 shadow-3xs space-y-1.5 sm:space-y-2 text-center">
                      <span className="text-[7.5px] sm:text-[8px] font-black text-indigo-700 uppercase tracking-widest block">
                        Susun Gamet
                      </span>
                      
                      {activeHeaderSlot ? (
                        <div className="space-y-1 sm:space-y-1.5 animate-scale-up">
                          <span className="text-[7px] sm:text-[7.5px] font-black text-slate-400 uppercase tracking-widest block">
                            Pilih gamet untuk slot aktif:
                          </span>
                          <div className="flex justify-center gap-1.5 sm:gap-2">
                            {expectedGametes.map((g) => (
                              <button
                                key={`opt-gamete-${g}`}
                                onClick={() => handleSelectHeaderGameteOption(g)}
                                onMouseEnter={() => setHighlightedGamete(g)}
                                className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border-2 font-mono font-black text-xs shadow-3xs cursor-pointer active:translate-y-0.5 hover:scale-105 transition-all flex items-center justify-center min-w-[40px] sm:min-w-[50px] min-h-[36px] sm:min-h-[44px] ${
                                  highlightedGamete === g
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-400'
                                    : 'border-slate-800'
                                }`}
                              >
                                {round === 1 ? g : <SeedIcon genotypeOrPhenotype={g} size={20} />}
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
                <div className="lg:col-span-6 flex justify-center w-full">
                  
                  {/* Punnett Table wrapper */}
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2 w-full max-w-[340px] sm:max-w-[420px] md:max-w-[460px] bg-slate-50 border-2 sm:border-3 border-slate-800 p-2 sm:p-3 rounded-2xl sm:rounded-3xl shadow-[4px_4px_0px_#1e293b] punnett-grid-compact">
                    
                    {/* Row 0 / Col 0 Spacer */}
                    <div className="aspect-square bg-slate-100 border-2 border-slate-800 rounded-xl flex items-center justify-center shadow-3xs">
                      <span className="text-[8px] sm:text-[9.5px] font-black text-slate-500">♀ \ ♂</span>
                    </div>

                    {/* Row 0 / Column gametes (Ayah) */}
                    {assignedCols.map((g, index) => {
                      const isActive = activeHeaderSlot && activeHeaderSlot.type === 'col' && activeHeaderSlot.index === index;
                      const expectedG = expectedGametes[index];
                      const isMatchingHighlight = highlightedGamete === (g || expectedG);
                      
                      return (
                        <div
                          key={`col-${index}`}
                          onClick={() => handleSelectHeaderSlot('col', index)}
                          className={`aspect-square rounded-xl flex items-center justify-center font-mono font-black text-xs sm:text-sm transition-all shadow-3xs cursor-pointer ${
                            isActive
                              ? 'bg-sky-100 border-2 sm:border-3 border-sky-600 scale-105 ring-2 ring-sky-350 font-black'
                              : isMatchingHighlight
                                ? 'bg-amber-100 border-2 sm:border-3 border-amber-500 scale-105 ring-2 ring-amber-300 text-amber-900 font-black'
                                : g
                                  ? 'bg-emerald-100 border-2 border-slate-800 text-emerald-800'
                                  : 'border-2 border-dashed border-slate-450 bg-white text-slate-400 hover:bg-slate-50'
                          }`}
                          title={`Kolom ${index + 1}: Gamet ${expectedG} (Klik untuk melihat alur garis alel)`}
                        >
                          {g ? (
                            round === 1 ? g : <SeedIcon genotypeOrPhenotype={g} size={26} />
                          ) : (
                            '?'
                          )}
                        </div>
                      );
                    })}

                    {/* Rows 1-4 */}
                    {[0, 1, 2, 3].map((rIndex) => {
                      const rowGamete = assignedRows[rIndex];
                      const isRowActive = activeHeaderSlot && activeHeaderSlot.type === 'row' && activeHeaderSlot.index === rIndex;
                      const expectedRowG = expectedGametes[rIndex];
                      const isRowMatchingHighlight = highlightedGamete === (rowGamete || expectedRowG);

                      return (
                        <React.Fragment key={`row-frag-${rIndex}`}>
                          
                          {/* Column 0: Row gametes (Ibu) */}
                          <div
                            onClick={() => handleSelectHeaderSlot('row', rIndex)}
                            className={`aspect-square rounded-xl flex items-center justify-center font-mono font-black text-xs sm:text-sm transition-all shadow-3xs cursor-pointer ${
                              isRowActive
                                ? 'bg-sky-100 border-2 sm:border-3 border-sky-600 scale-105 ring-2 ring-sky-350 font-black'
                                : isRowMatchingHighlight
                                  ? 'bg-amber-100 border-2 sm:border-3 border-amber-500 scale-105 ring-2 ring-amber-300 text-amber-900 font-black'
                                  : rowGamete
                                    ? 'bg-emerald-100 border-2 border-slate-800 text-emerald-800'
                                    : 'border-2 border-dashed border-slate-450 bg-white text-slate-400 hover:bg-slate-50'
                            }`}
                            title={`Baris ${rIndex + 1}: Gamet ${expectedRowG} (Klik untuk melihat alur garis alel)`}
                          >
                            {rowGamete ? (
                              round === 1 ? rowGamete : <SeedIcon genotypeOrPhenotype={rowGamete} size={26} />
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
                                className={`aspect-square rounded-xl flex items-center justify-center transition-all cursor-pointer border-2 ${
                                  isActive
                                    ? 'bg-sky-100 border-sky-600 scale-105 ring-2 sm:ring-3 ring-sky-350 font-black'
                                    : isWrong
                                      ? 'bg-rose-55 border-rose-500 text-rose-800 animate-shake'
                                      : cellValue
                                        ? round === 1
                                          ? showPhenotype
                                            ? `${getPhenotypeInfo(cellValue).bgClass} border-slate-800 font-mono font-black text-[10px] sm:text-xs shadow-3xs animate-scale-up`
                                            : 'bg-white border-slate-855 text-slate-850 font-mono font-black text-[10px] sm:text-xs shadow-3xs'
                                          : /* Round 2: phenotype SeedIcon display */
                                            `${getPhenotypeInfo(combineGametes(rowGamete, colGamete)).bgClass} border-slate-800 shadow-3xs flex items-center justify-center`
                                        : 'bg-white border-slate-250 text-slate-350 font-mono font-black text-xs sm:text-sm'
                                }`}
                              >
                                {cellValue ? (
                                  round === 1 ? (
                                    cellValue
                                  ) : (
                                    <SeedIcon genotypeOrPhenotype={cellValue} size={26} />
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
              <div className="flex flex-wrap gap-3 sm:gap-4 justify-center border-t-2 border-slate-800/15 pt-3 sm:pt-4 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleResetGrid}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border-2 border-slate-800 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-[2px_2px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5px]" />
                  <span>RESET GAMET</span>
                </button>

                <button
                  type="button"
                  onClick={handleVerifyGametes}
                  className="px-6 sm:px-8 py-2 sm:py-2.5 rounded-xl border-2 border-slate-800 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-[3px_3px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  <span>VERIFIKASI GAMET</span>
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5px]" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-wrap gap-3 sm:gap-4 justify-center border-t-2 border-slate-800/15 pt-3 sm:pt-4 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleResetGrid}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border-2 border-slate-800 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-[2px_2px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5px]" />
                  <span>RESET PERSILANGAN</span>
                </button>

                <button
                  type="button"
                  onClick={handleVerifyCells}
                  className="px-6 sm:px-8 py-2 sm:py-2.5 rounded-xl border-2 border-slate-800 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-[3px_3px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  <span>VERIFIKASI PUNNETT</span>
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5px]" />
                </button>
              </div>
            )}

            {step === 3 && (
              /* Step 3: Answer Ratio picker */
              <div className="border-t-2 border-slate-800/15 pt-3 sm:pt-4 space-y-3 flex-shrink-0 text-center">
                <span className="text-[9px] sm:text-xs font-black text-slate-600 uppercase tracking-widest block">
                  Pilih Rasio Fenotipe F2 Dihibrid yang Tepat
                </span>
                
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                  {['9:3:3:1', '3:1', '1:2:1', '1:1:1:1'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setRatioAnswer(r);
                      }}
                      className={`px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl font-mono font-black text-xs sm:text-sm border-2 shadow-[2px_2px_0px_#1e293b] active:translate-y-0.5 active:shadow-none cursor-pointer transition-all ${
                        ratioAnswer === r 
                          ? 'bg-sky-100 border-sky-600 text-sky-900 scale-105 ring-2 ring-sky-300' 
                          : 'bg-white border-slate-800 text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap justify-center pt-2 gap-3">
                  <button
                    type="button"
                    onClick={handleResetGrid}
                    className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border-2 border-slate-800 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-[2px_2px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5px]" />
                    <span>ULANG TAHAP</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleVerifyRatio}
                    disabled={!ratioAnswer}
                    className={`px-6 sm:px-8 py-2 sm:py-2.5 rounded-xl border-2 border-slate-800 font-black text-xs sm:text-sm shadow-[3px_3px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-2 ${
                      ratioAnswer 
                        ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white cursor-pointer hover:scale-105' 
                        : 'bg-slate-200 border-slate-400 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <span>SELESAIKAN DIHIBRID</span>
                    <ArrowRight className="w-4 h-4 stroke-[3px]" />
                  </button>
                </div>
              </div>
            )}

          </div>
          )}

          {/* Centered Feedback Notification Modal */}
          {feedback && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
              <div className={`p-6 sm:p-7 rounded-3xl border-3 border-slate-900 shadow-[8px_8px_0px_#0f172a] max-w-sm sm:max-w-md w-full text-center flex flex-col items-center gap-4 animate-scale-up ${
                feedback.type === 'success'
                  ? 'bg-gradient-to-b from-emerald-50 via-white to-emerald-100 text-emerald-950'
                  : 'bg-gradient-to-b from-rose-50 via-white to-rose-100 text-rose-950'
              }`}>
                <div className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center border-3 border-slate-900 shadow-[3px_3px_0px_#0f172a] ${
                  feedback.type === 'success' ? 'bg-emerald-500 text-white animate-bounce' : 'bg-rose-500 text-white'
                }`}>
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-10 h-10 sm:w-11 sm:h-11 stroke-[2.5px]" />
                  ) : (
                    <XCircle className="w-10 h-10 sm:w-11 sm:h-11 stroke-[2.5px]" />
                  )}
                </div>

                <div className="space-y-1.5 px-2">
                  <h3 className="text-base sm:text-xl font-black text-slate-900 tracking-wide font-sans">
                    {feedback.type === 'success' ? '🎉 Verifikasi Berhasil!' : '⚠️ Periksa Kembali!'}
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed">
                    {feedback.message}
                  </p>
                </div>

                {feedback.type !== 'success' ? (
                  <button
                    type="button"
                    onClick={() => setFeedback(null)}
                    className="mt-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm shadow-[3px_3px_0px_#0f172a] cursor-pointer active:translate-y-0.5 transition-all"
                  >
                    Tutup & Coba Lagi
                  </button>
                ) : (
                  <div className="mt-1 flex items-center gap-2 text-xs font-black text-emerald-800 bg-emerald-200/80 px-4 py-1.5 rounded-full border border-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
                    <span>Melanjutkan ke tahap berikutnya...</span>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      ) : (
        /* Victory Screen */
        <div className="absolute inset-0 z-40 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="p-4 sm:p-6 rounded-3xl text-center space-y-2.5 sm:space-y-4 max-w-xs w-full border-2 border-slate-800 bg-white shadow-2xl relative z-50 animate-scale-up max-h-[96vh] overflow-y-auto">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-slate-800 p-1 flex items-center justify-center mx-auto shadow-xs overflow-hidden">
              <img 
                src="/assets/rumah_mendel_banner.webp" 
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

            {sourceWorldView === 'rpg-world' ? (
              <div className="flex justify-center pt-1.5">
                <button
                  onClick={() => navigateTo('rpg-world')}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-pixel text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:translate-y-0.5 transition cursor-pointer border-2 border-slate-800"
                >
                  <span>LANJUTKAN</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      )}
    </div>
  );
};
