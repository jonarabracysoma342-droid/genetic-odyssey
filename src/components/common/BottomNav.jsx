import React from 'react';
import { useGame } from '../../context/GameContext';
import { Home, Map, Brain, BookOpen, GraduationCap } from 'lucide-react';

export const BottomNav = () => {
  const { activeView, navigateTo } = useGame();

  const navItems = [
    { id: 'main-menu', label: 'Home', icon: Home, action: () => navigateTo('main-menu') },
    { id: 'map', label: 'Peta', icon: Map, action: () => navigateTo('map') },
    { id: 'group-dashboard', label: 'Kelas', icon: GraduationCap, action: () => navigateTo('group-dashboard') },
    { id: 'hots-quiz', label: 'Kuis HOTS', icon: Brain, action: () => navigateTo('hots-quiz') },
    { id: 'genopedia', label: 'Genopedia', icon: BookOpen, action: () => navigateTo('genopedia') },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 bg-white/70 backdrop-blur-md border-t border-white/45 px-2 py-1.5 shadow-[0_-4px_24px_rgba(2,132,199,0.04)] md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-2xl transition-all cursor-pointer ${
                isActive 
                  ? 'text-sky-600 font-extrabold scale-105' 
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div className={`p-1 rounded-xl transition ${isActive ? 'bg-sky-100 text-sky-600' : 'bg-transparent'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[9px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
