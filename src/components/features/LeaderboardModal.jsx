import React from 'react';
import { useGame } from '../../context/GameContext';
import { Trophy, Star, X } from 'lucide-react';
import { sound } from '../../services/sound';

export const LeaderboardModal = () => {
  const { isLeaderboardOpen, setIsLeaderboardOpen, userProgress, totalStars } = useGame();

  if (!isLeaderboardOpen) return null;

  const mockLeaderboard = [
    { rank: 1, name: 'Siswa Anda (Anda)', score: userProgress.score, stars: totalStars, badge: userProgress.badges[userProgress.badges.length - 1] || 'Detektif Sifat', isUser: true },
    { rank: 2, name: 'Ahmad Genetics Pro', score: Math.max(800, userProgress.score - 100), stars: 21, badge: 'Penjelajah Dihibrid', isUser: false },
    { rank: 3, name: 'Siti Mendel Explorer', score: Math.max(650, userProgress.score - 250), stars: 18, badge: 'Raja Panen', isUser: false },
    { rank: 4, name: 'Budi Bio Master', score: 500, stars: 14, badge: 'Ahli Punnett', isUser: false },
    { rank: 5, name: 'Dewi Gen Master', score: 350, stars: 9, badge: 'Master Gamet', isUser: false }
  ].sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-md w-full p-4 md:p-6 rounded-xl border-4 border-[#361706] space-y-4 bg-[#fae8b6] text-left shadow-[6px_6px_0_#1a0b03] text-[#2b1103]">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-[#361706] pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#ca7c38] text-[#2b1103] border-2 border-[#361706] shadow-xs">
              <Trophy className="w-5 h-5 text-[#ffd699]" />
            </div>
            <div>
              <h3 className="text-xs md:text-sm font-pixel text-[#361706] uppercase font-bold">PAPAN PERINGKAT</h3>
              <p className="text-[9px] text-[#884318] font-pixel mt-0.5">Top Skor Siswa</p>
            </div>
          </div>
          <button 
            onClick={() => {
              sound.playClick();
              setIsLeaderboardOpen(false);
            }} 
            className="p-1 bg-[#df9b52] hover:bg-[#ca7c38] border-2 border-[#361706] rounded text-[#2b1103] cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5px]" />
          </button>
        </div>

        {/* List */}
        <div className="space-y-2">
          {mockLeaderboard.map((item, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-lg border-2 border-[#361706] flex items-center justify-between gap-2.5 transition ${
                item.isUser
                  ? 'bg-[#fde68a] text-[#2b1103] shadow-[2px_2px_0_#361706]'
                  : 'bg-[#fff8e7] text-[#361706]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-6 h-6 rounded-sm border border-[#361706] flex items-center justify-center font-pixel text-[8px] ${
                  idx === 0 ? 'bg-[#facc15] text-[#2b1103] font-black' :
                  idx === 1 ? 'bg-[#cbd5e1] text-[#2b1103]' :
                  idx === 2 ? 'bg-[#d97706] text-white' : 'bg-[#e2e8f0] text-slate-700'
                }`}>
                  {idx + 1}
                </div>
                <div>
                  <h4 className="font-pixel text-[8px] md:text-[9px] text-[#361706] flex items-center gap-1 uppercase truncate max-w-[150px]">
                    {item.name}
                  </h4>
                  <span className="text-[8px] text-[#884318] block">{item.badge}</span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="font-pixel text-[8px] text-[#361706]">{item.score} PTS</p>
                <div className="flex items-center justify-end gap-1 text-[8px] text-[#884318] font-bold">
                  <Star className="w-3 h-3 fill-[#facc15] text-[#facc15]" />
                  <span>{item.stars} ★</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-1 border-t border-[#361706]/20">
          <button
            onClick={() => {
              sound.playClick();
              setIsLeaderboardOpen(false);
            }}
            className="px-5 py-1.5 bg-[#ca7c38] hover:bg-[#df9b52] border-2 border-[#361706] rounded-md font-pixel text-[8px] text-[#2b1103] uppercase cursor-pointer shadow-xs"
          >
            TUTUP
          </button>
        </div>

      </div>
    </div>
  );
};
