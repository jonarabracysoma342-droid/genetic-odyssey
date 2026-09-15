import React from 'react';
import { useGame } from '../../context/GameContext';
import { Play, BookOpen, Menu } from 'lucide-react';

export const BottomNav = () => {
  const { activeView, navigateTo, setIsSettingsOpen } = useGame();

  const navItems = [
    { 
      id: 'main-menu', 
      label: 'Menu Utama', 
      icon: Menu, 
      action: () => navigateTo('main-menu') 
    },
    { 
      id: 'map', 
      label: 'Main / Peta', 
      icon: Play, 
      action: () => navigateTo('map') 
    },
    { 
      id: 'genopedia', 
      label: 'Zona Belajar', 
      icon: BookOpen, 
      action: () => navigateTo('genopedia') 
    },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 bg-[#361706]/95 backdrop-blur-md border-t-2 border-[#ca7c38] px-4 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.3)] md:hidden">
      <div className="flex items-center justify-around max-w-sm mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id || (item.id === 'genopedia' && ['group-dashboard', 'hots-quiz', 'genopedia'].includes(activeView));

          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all cursor-pointer ${
                isActive 
                  ? 'text-[#facc15] font-black scale-105' 
                  : 'text-[#ffd699]/70 hover:text-[#ffd699] font-medium'
              }`}
            >
              <div className={`p-1 rounded-lg transition ${isActive ? 'bg-[#ca7c38] text-[#2b1103]' : 'bg-transparent'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="font-pixel text-[8px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

