import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../services/sound';
import { db } from '../../services/firebase';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { 
  MessageSquare, 
  Star, 
  Send, 
  X, 
  Sparkles, 
  CheckCircle2, 
  ThumbsUp, 
  Bug, 
  Lightbulb, 
  BookOpen 
} from 'lucide-react';

const CATEGORIES = [
  { id: 'fitur', label: 'Saran Fitur Baru', icon: Lightbulb, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'materi', label: 'Usulan Materi Biologi', icon: BookOpen, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'bug', label: 'Laporan Kendala / Bug', icon: Bug, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  { id: 'apresiasi', label: 'Apresiasi & Ulasan', icon: ThumbsUp, color: 'text-sky-600 bg-sky-50 border-sky-200' },
];

export const DeveloperFeedbackModal = () => {
  const { isFeedbackOpen, setIsFeedbackOpen, currentUser, userName, userRole, showAlert } = useGame();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('fitur');
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [recentFeedbacks, setRecentFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  // Fetch recent feedback for community wall
  const fetchRecentFeedbacks = async () => {
    try {
      setLoadingFeedbacks(true);
      const q = query(collection(db, 'developer_feedback'), orderBy('createdAt', 'desc'), limit(5));
      const snapshot = await getDocs(q);
      const items = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      setRecentFeedbacks(items);
    } catch (err) {
      console.warn("Could not fetch feedback list from Firestore:", err);
      // Fallback local mock feedback if collection rules not opened yet
      setRecentFeedbacks([
        {
          id: 'demo_1',
          userName: 'Budi Santoso',
          userRole: 'guru',
          category: 'fitur',
          rating: 5,
          feedbackText: 'Game interaktif ini sangat membantu siswa memahami konsep segregasi Mendel dengan sangat visual dan menyenangkan!',
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
        },
        {
          id: 'demo_2',
          userName: 'Siti Rahma',
          userRole: 'siswa',
          category: 'materi',
          rating: 5,
          feedbackText: 'Kuis HOTS sangat menantang! Semoga nanti ditambah stage tentang sintesis protein dan mutasi DNA.',
          createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
        }
      ]);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  useEffect(() => {
    if (isFeedbackOpen) {
      setSubmitted(false);
      fetchRecentFeedbacks();
    }
  }, [isFeedbackOpen]);

  if (!isFeedbackOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      sound.playWrong();
      showAlert("Silakan tulis pesan masukan atau saran Anda terlebih dahulu.");
      return;
    }

    sound.playClick();
    setSubmitting(true);

    const feedbackPayload = {
      userId: currentUser?.uid || 'anon_' + Date.now(),
      userName: userName || currentUser?.displayName || 'Pengguna Odyssey',
      userRole: userRole || 'siswa',
      rating,
      category: selectedCategory,
      feedbackText: feedbackText.trim(),
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'developer_feedback'), feedbackPayload);
      sound.playCorrect();
      setSubmitted(true);
      setFeedbackText('');
      setRecentFeedbacks(prev => [feedbackPayload, ...prev.slice(0, 4)]);
    } catch (err) {
      console.warn("Error saving feedback to Firestore:", err);
      // Fallback: save to localStorage so user feedback is not lost
      try {
        const localList = JSON.parse(localStorage.getItem('genetic_odyssey_local_feedback') || '[]');
        localList.unshift(feedbackPayload);
        localStorage.setItem('genetic_odyssey_local_feedback', JSON.stringify(localList));
        sound.playCorrect();
        setSubmitted(true);
        setFeedbackText('');
        setRecentFeedbacks(prev => [feedbackPayload, ...prev.slice(0, 4)]);
      } catch (localErr) {
        sound.playWrong();
        showAlert("Terjadi kendala saat mengirim saran. Silakan coba kembali.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border-[3px] border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-[8px_8px_0px_#1e293b] flex flex-col max-h-[90vh] animate-scale-up text-left">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b-[3px] border-slate-800 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border-2 border-slate-800 flex items-center justify-center shadow-3xs">
              <Sparkles className="w-5 h-5 text-amber-600 fill-amber-500" />
            </div>
            <div>
              <span className="text-[7.5px] font-black text-amber-800 uppercase tracking-widest block font-sans">
                SUARA PENGGUNA ODYSSEY
              </span>
              <h3 className="text-sm font-black text-slate-900 leading-tight">
                Saran & Masukan untuk Pengembang
              </h3>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              setIsFeedbackOpen(false);
            }}
            className="p-1.5 rounded-xl border-2 border-slate-800 bg-white hover:bg-slate-100 text-slate-700 transition cursor-pointer"
            title="Tutup"
          >
            <X className="w-4 h-4 stroke-[3px]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-slate-800">
          
          {submitted ? (
            <div className="p-6 bg-emerald-50 border-2 border-emerald-500 rounded-3xl text-center space-y-3 animate-scale-up">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 border-2 border-emerald-600 flex items-center justify-center mx-auto shadow-3xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-emerald-950">Terima Kasih Banyak!</h4>
                <p className="text-xs font-bold text-emerald-800 leading-relaxed max-w-sm mx-auto">
                  Saran dan masukan Anda sangat berharga bagi tim pengembang untuk terus menyempurnakan media pembelajaran <em>Genetic Odyssey</em>!
                </p>
              </div>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-3xs cursor-pointer"
              >
                Kirim Saran Lainnya
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Rating Section */}
              <div className="space-y-1.5 p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl">
                <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">
                  Beri Penilaian untuk Media Ini
                </label>
                <div className="flex items-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => {
                        sound.playClick();
                        setRating(star);
                      }}
                      className="p-1 transition-transform hover:scale-125 cursor-pointer"
                    >
                      <Star 
                        className={`w-6 h-6 stroke-[2px] transition-colors ${
                          (hoverRating || rating) >= star 
                            ? 'text-amber-400 fill-amber-400 drop-shadow-xs' 
                            : 'text-slate-300'
                        }`} 
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-black text-amber-700 font-mono">
                    {rating} / 5 Bintang
                  </span>
                </div>
              </div>

              {/* Category Pills */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">
                  Kategori Masukan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => {
                          sound.playClick();
                          setSelectedCategory(cat.id);
                        }}
                        className={`p-2.5 rounded-2xl border-2 text-[10px] font-extrabold flex items-center gap-2 transition cursor-pointer ${
                          isSelected 
                            ? 'border-slate-800 bg-indigo-50 text-indigo-900 shadow-3xs' 
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feedback Textarea */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">
                    Pesan / Saran / Kritik Anda
                  </label>
                  <span className="text-[8px] font-bold text-slate-400">
                    {feedbackText.length}/500 karakter
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Contoh: Sangat suka animasinya! Saran saya tolong tambahkan fitur simulasi pembelahan sel meiosis agar materi makin lengkap..."
                  className="w-full p-3 bg-white border-2 border-slate-800 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-3xs leading-relaxed"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-2 border-slate-800 text-white font-black text-xs shadow-[3px_3px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'MENGIRIMKAN SARAN...' : 'KIRIMKAN SARAN & MASUKAN'}</span>
              </button>
            </form>
          )}

          {/* Community Feedback Wall */}
          <div className="border-t-2 border-slate-200 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" /> Masukan Terbaru dari Komunitas
              </h4>
              <span className="text-[8px] font-bold text-slate-400">
                {recentFeedbacks.length} masukan
              </span>
            </div>

            {loadingFeedbacks ? (
              <p className="text-xs text-slate-400 text-center py-3">Memuat masukan...</p>
            ) : recentFeedbacks.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-3">Jadilah yang pertama memberikan masukan!</p>
            ) : (
              <div className="space-y-2.5">
                {recentFeedbacks.map((fb, idx) => (
                  <div 
                    key={fb.id || idx} 
                    className="p-3 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-1.5 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-slate-900">{fb.userName || 'Anonim'}</span>
                        <span className={`px-1.5 py-0.2 rounded-md text-[7px] font-black uppercase tracking-wider ${
                          fb.userRole === 'guru' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {fb.userRole === 'guru' ? 'Guru' : 'Siswa'}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(fb.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-[9.5px] font-medium text-slate-700 leading-relaxed">
                      "{fb.feedbackText}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
