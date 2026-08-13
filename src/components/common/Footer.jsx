import React from 'react';
import { Dna, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-200/80 bg-white/80 backdrop-blur-md py-6 px-4 text-center text-xs text-slate-500 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            <Dna className="w-3.5 h-3.5" />
          </div>
          <span className="font-extrabold text-slate-900">GENETIC ODYSSEY: MENDEL'S LEGACY</span>
          <span className="text-slate-400">| Media Pembelajaran Interaktif Genetika</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
          <span>Dibuat dengan</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline animate-pulse" />
          <span>untuk Pembelajaran Biologi SMA</span>
        </div>
      </div>
    </footer>
  );
};
