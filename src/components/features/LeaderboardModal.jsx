import React from 'react';
import { useGame } from '../../context/GameContext';
import { Trophy, Star } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
      <div className="travorra-card max-w-lg w-full p-6 rounded-3xl border border-slate-200 space-y-6 bg-white text-left shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-serif-display font-extrabold text-slate-900">Papan Peringkat Kelas</h3>
              <p className="text-xs text-slate-500 font-medium">Peringkat akumulasi skor teratas siswa</p>
            </div>
          </div>
          <button 
            onClick={() => setIsLeaderboardOpen(false)} 
            className="text-slate-400 hover:text-slate-900 p-2 rounded-full hover:bg-slate-100 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2.5">
          {mockLeaderboard.map((item, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition ${
                item.isUser
                  ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  idx === 0 ? 'bg-amber-400 text-slate-950 font-black' :
                  idx === 1 ? 'bg-slate-300 text-slate-900 font-extrabold' :
                  idx === 2 ? 'bg-amber-700 text-white font-extrabold' : 'bg-slate-200 text-slate-600'
                }`}>
                  {idx + 1}
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                    {item.name} {item.isUser && <span className="text-[10px] text-blue-600 font-mono font-bold">(ANDA)</span>}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-medium">Lencana: {item.badge}</span>
                </div>
              </div>

              <div className="text-right">
                <p className="font-mono font-black text-xs text-blue-700">{item.score} PTS</p>
                <div className="flex items-center justify-end gap-1 text-[10px] text-amber-600 font-bold">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span>{item.stars} ★</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
