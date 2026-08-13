import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { BIOBOT_HINTS, STAGES } from '../../data/geneticsData';
import { Bot, Sparkles, Lightbulb, ChevronRight } from 'lucide-react';

export const BioBotDrawer = () => {
  const { isBioBotOpen, setIsBioBotOpen, currentStageId } = useGame();
  const [hintIdx, setHintIdx] = useState(0);

  if (!isBioBotOpen) return null;

  const currentStage = STAGES.find(s => s.id === currentStageId) || STAGES[0];
  const hints = BIOBOT_HINTS[currentStageId] || [
    'BioBot siap membantu! Perhatikan pertanyaan dan konsep genetika di stage ini.',
    'Gunakan Kamus Genopedia jika kamu belum memahami istilah yang digunakan.'
  ];

  const handleNextHint = () => {
    setHintIdx((prev) => (prev + 1) % hints.length);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-end">
      <div className="travorra-card w-full max-w-md h-full p-6 border-l border-slate-200 flex flex-col justify-between space-y-6 rounded-none rounded-l-[2rem] bg-white text-left shadow-2xl">
        
        {/* Drawer Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display font-extrabold text-slate-900 text-lg">BioBot Assistant</h3>
              <p className="text-xs text-slate-500 font-medium">Asisten AI Tutor Genetika</p>
            </div>
          </div>
          <button 
            onClick={() => setIsBioBotOpen(false)} 
            className="text-slate-400 hover:text-slate-900 p-2 rounded-full hover:bg-slate-100 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* BioBot Stage Context */}
        <div className="space-y-4 flex-1 overflow-y-auto">
          <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-xs font-bold text-blue-900 flex items-center justify-between">
            <span>Stage Aktif: {currentStage.title}</span>
            <span className="text-[10px] bg-white px-2.5 py-0.5 rounded-full text-blue-700 border border-blue-200">
              {currentStage.location}
            </span>
          </div>

          {/* Hint Card Box */}
          <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/60 space-y-4">
            <div className="flex items-center gap-2 text-xs font-extrabold text-amber-800">
              <Lightbulb className="w-4 h-4 text-amber-600 animate-bounce" />
              <span>Petunjuk {hintIdx + 1} dari {hints.length}</span>
            </div>

            <p className="text-sm text-slate-800 leading-relaxed italic bg-white p-4 rounded-xl border border-amber-200 font-medium">
              "{hints[hintIdx]}"
            </p>

            <button
              onClick={handleNextHint}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center gap-2 border border-amber-300 transition"
            >
              <span>PETUNJUK BERIKUTNYA</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Theoretical Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
            <h4 className="font-bold text-blue-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" /> Ringkasan Teori Stage:
            </h4>
            <p className="text-slate-600 leading-relaxed font-medium">{currentStage.learningOutput}</p>
          </div>
        </div>

        {/* Bottom Close Button */}
        <button
          onClick={() => setIsBioBotOpen(false)}
          className="travorra-btn-primary w-full py-3.5 text-xs tracking-wider"
        >
          PAHAM, TERIMA KASIH BIOBOT!
        </button>

      </div>
    </div>
  );
};
