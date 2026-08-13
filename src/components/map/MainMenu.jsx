import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { 
  Search, 
  Sparkles,
  SlidersHorizontal,
  Play,
  ArrowRight,
  GraduationCap,
  Brain
} from 'lucide-react';

// ScrollReveal Component using Intersection Observer for fade-in/out on scroll
const ScrollReveal = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -30px 0px'
      }
    );

    const { current } = domRef;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-700 ease-out transform ${
        isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-8 scale-[0.97]'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export const MainMenu = () => {
  const { 
    navigateTo, 
    setIsGenopediaOpen, 
    setIsBioBotOpen, 
    setIsLeaderboardOpen,
    setIsTeacherReportOpen,
    setTeacherReportActiveTab
  } = useGame();
  
  const [searchQuery, setSearchQuery] = useState('');

  // 6 Categories in specific requested order (Curriculum -> Material -> Map -> Lab -> AI -> Leaderboard)
  const categories = [
    { 
      label: 'Kurikulum', 
      img: '/assets/cat_curriculum_icon.png', 
      action: () => { 
        setTeacherReportActiveTab('identity'); 
        setIsTeacherReportOpen(true); 
      } 
    },
    { 
      label: 'Kelas', 
      icon: GraduationCap, 
      action: () => navigateTo('group-dashboard') 
    },
    { 
      label: 'Genopedia', 
      img: '/assets/cat_genopedia_icon.png', 
      action: () => navigateTo('genopedia') 
    },
    { 
      label: 'Peta Stage', 
      img: '/assets/cat_map_icon.png', 
      action: () => navigateTo('map') 
    },
    { 
      label: 'Kuis HOTS', 
      icon: Brain,
      action: () => navigateTo('hots-quiz') 
    },
    { 
      label: 'BioBot AI', 
      img: '/assets/biobot_mascot.png', 
      action: () => setIsBioBotOpen(true) 
    },
    { 
      label: 'Leaderboard', 
      img: '/assets/cat_leaderboard_icon.png', 
      action: () => setIsLeaderboardOpen(true) 
    },
  ];

  // 7 Modules in Alternating MNTN Layout Style with new requested order
  const sections = [
    {
      id: 'kurikulum',
      num: '01',
      tag: 'KURIKULUM MERDEKA',
      title: 'Modul Ajar & Proyek P5',
      desc: 'Pelajari identitas modul, Capaian Pembelajaran (CP), Tujuan Pembelajaran (TP), serta proyek P5 yang diintegrasikan ke dalam game.',
      linkText: 'Buka Detail Kurikulum',
      img: '/assets/cat_curriculum_icon.png',
      action: () => { 
        setTeacherReportActiveTab('identity'); 
        setIsTeacherReportOpen(true); 
      },
      layout: 'left'
    },
    {
      id: 'group-dashboard',
      num: '02',
      tag: 'KELAS ONLINE',
      title: 'Dashboard Kelas & Guru',
      desc: 'Masuk ke ruang kelas Anda untuk mengakses materi pembelajaran khusus dari guru, mengerjakan kuis kelas, dan melihat papan peringkat kelas.',
      linkText: 'Buka Dashboard Kelas',
      img: '/assets/cat_curriculum_icon.png',
      action: () => navigateTo('group-dashboard'),
      layout: 'right'
    },
    {
      id: 'genopedia',
      num: '03',
      tag: 'GENOPEDIA (MATERI)',
      title: 'Kamus & Pewarisan Sifat',
      desc: 'Pelajari kamus lengkap istilah genetika mulai dari sifat dominan-resesif, genotipe, fenotipe, alel, hingga Hukum Mendel.',
      linkText: 'Buka Ensiklopedia',
      img: '/assets/cat_genopedia_icon.png',
      action: () => navigateTo('genopedia'),
      layout: 'left'
    },
    {
      id: 'map',
      num: '04',
      tag: 'PETA PERMAINAN',
      title: 'Petualangan Mendel',
      desc: 'Jelajahi alur cerita petualangan interaktif dari Rumah Mendel hingga Hall of Genetics. Selesaikan 6 stage belajar yang seru!',
      linkText: 'Jelajahi Peta Game',
      img: '/assets/cat_map_icon.png',
      action: () => navigateTo('map'),
      layout: 'right'
    },
    {
      id: 'hots-quiz',
      num: '05',
      tag: 'EVALUASI MANDIRI',
      title: 'Kuis Evaluasi HOTS',
      desc: 'Uji kemampuan analisis konsep persilangan dan Hukum Mendel kamu melalui pertanyaan HOTS tingkat tinggi.',
      linkText: 'Mulai Kuis HOTS',
      img: '/assets/cat_virtuallab_icon.png',
      action: () => navigateTo('hots-quiz'),
      layout: 'left'
    },
    {
      id: 'biobot',
      num: '06',
      tag: 'ASISTEN AI',
      title: 'Tanya BioBot Cerdas',
      desc: 'Butuh petunjuk menyelesaikan misi stage? Konsultasikan kesulitan belajarmu dengan asisten AI biologi pintar kapan saja.',
      linkText: 'Tanya BioBot',
      img: '/assets/biobot_mascot.png',
      action: () => setIsBioBotOpen(true),
      layout: 'right'
    },
    {
      id: 'leaderboard',
      num: '07',
      tag: 'LEADERBOARD',
      title: 'Papan Peringkat Siswa',
      desc: 'Lihat siapa saja siswa yang memuncaki papan skor dan memiliki koleksi bintang terbanyak di Genetic Odyssey.',
      linkText: 'Lihat Peringkat',
      img: '/assets/cat_leaderboard_icon.png',
      action: () => setIsLeaderboardOpen(true),
      layout: 'left'
    }
  ];

  const filteredSections = sections.filter(sec => 
    sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sec.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sec.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-5 text-left pb-24 bg-slate-50/40 relative overflow-hidden min-h-screen">
      
      {/* Aurora Background Blobs */}
      <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-sky-200/50 blur-3xl pointer-events-none float-anim z-0" />
      <div className="absolute top-1/2 -left-20 w-56 h-56 rounded-full bg-indigo-200/40 blur-3xl pointer-events-none float-anim z-0 animate-pulse duration-[8s]" />
      <div className="absolute -bottom-10 right-10 w-44 h-44 rounded-full bg-amber-100/60 blur-3xl pointer-events-none float-anim z-0" />

      {/* 1. SEARCH INPUT ROW */}
      <div className="flex items-center gap-2 relative z-10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari modul, kamus, fitur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/50 backdrop-blur-md border border-white/70 text-xs font-semibold text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white/80 transition shadow-2xs"
          />
        </div>

        <button 
          onClick={() => navigateTo('map')}
          className="w-11 h-11 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center shadow-md shadow-sky-500/20 flex-shrink-0 transition cursor-pointer hover:scale-105"
          title="Buka Peta Game"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* 2. CATEGORY QUICK ACTION 3D PNG ILLUSTRATIONS ROW (7 Columns Glassmorphic Grid) */}
      <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 pt-1 relative z-10">
        {categories.map((cat, idx) => (
          <button
            key={idx}
            onClick={cat.action}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60 flex items-center justify-center p-1.5 shadow-2xs group-hover:scale-105 group-hover:bg-white/60 transition-all duration-250 overflow-hidden">
              {cat.icon ? (
                <cat.icon className="w-6 h-6 text-sky-600 stroke-[2.5]" />
              ) : (
                <img 
                  src={cat.img} 
                  alt={cat.label} 
                  className="w-full h-full object-contain drop-shadow-xs"
                />
              )}
            </div>
            <span className="text-[9px] font-bold text-slate-700 tracking-tight text-center truncate w-full">
              {cat.label}
            </span>
          </button>
        ))}
      </div>

      {/* 3. HERO PROMOTIONAL BANNER CARD (Glassmorphic Banner) */}
      <div className="relative rounded-3xl bg-gradient-to-br from-sky-100/60 via-sky-50/45 to-blue-50/50 backdrop-blur-md border border-white/60 p-5 overflow-hidden shadow-2xs z-10">
        <div className="relative z-10 max-w-[65%] space-y-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-200/60 text-sky-800 text-[10px] font-black uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-sky-600" /> Game Edukasi
          </span>

          <h2 className="text-base font-black text-slate-900 leading-tight">
            Jelajahi Gen. <br />
            <span className="text-sky-600">Pecahkan Sifat.</span>
          </h2>

          <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
            Pelajari hukum Mendel & persilangan genetik secara interaktif.
          </p>

          <button
            onClick={() => navigateTo('map')}
            className="mt-1 px-4 py-2 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-md shadow-sky-500/30 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Mulai Petualangan</span>
          </button>
        </div>

        {/* Right Character PNG Graphic */}
        <img
          src="/assets/mendel_avatar.png"
          alt="Mendel Character"
          className="absolute -right-3 -bottom-4 w-36 h-36 object-contain pointer-events-none drop-shadow-md"
        />
      </div>

      {/* 4. MNTN ALTERNATING SECTIONS LIST (6 Cards with ScrollReveal) */}
      <div className="space-y-4 pt-2 relative z-10">
        <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1 border-l-3 border-sky-500">
          Modul Pembelajaran
        </h3>

        <div className="space-y-4">
          {filteredSections.map((sec, idx) => {
            const isLeft = sec.layout === 'left';
            return (
              <ScrollReveal key={sec.id} delay={idx * 50}>
                <div 
                  onClick={sec.action}
                  className="relative flex items-center justify-between gap-4 group cursor-pointer p-4 transition-all duration-350 rounded-3xl bg-white/75 backdrop-blur-md border border-sky-100 shadow-[0_8px_30px_rgba(2,132,199,0.06)] hover:bg-white/90 hover:shadow-[0_12px_36px_rgba(2,132,199,0.12)] hover:scale-[1.01]"
                >
                  {/* Giant low-opacity background number */}
                  <div className="absolute top-1 left-3 text-7xl font-serif-display font-black text-slate-200/40 select-none pointer-events-none transition-all group-hover:text-slate-300/60 group-hover:scale-105 duration-300">
                    {sec.num}
                  </div>

                  {isLeft ? (
                    <>
                      {/* Text Column (Left) */}
                      <div className="flex-1 text-left space-y-1.5 z-10 pl-1">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-[1.5px] bg-amber-400" />
                          <span className="text-[9px] font-bold text-amber-500 tracking-widest uppercase">
                            {sec.tag}
                          </span>
                        </div>

                        <h3 className="text-xs sm:text-sm font-bold font-serif-display text-slate-900 tracking-wide leading-snug group-hover:text-sky-600 transition duration-300">
                          {sec.title}
                        </h3>

                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                          {sec.desc}
                        </p>

                        <div className="inline-flex items-center gap-1 text-[10px] font-extrabold text-sky-600 group-hover:translate-x-1 transition-transform duration-300 pt-0.5">
                          <span>{sec.linkText}</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>

                      {/* Image Column (Right) */}
                      <div className="w-20 h-20 rounded-2xl bg-white border border-sky-100/75 flex items-center justify-center p-1.5 shadow-2xs overflow-hidden transition-transform duration-300 group-hover:scale-105 flex-shrink-0 z-10">
                        <img 
                          src={sec.img} 
                          alt={sec.title} 
                          className="w-[95%] h-[95%] object-contain float-anim"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Image Column (Left) */}
                      <div className="w-20 h-20 rounded-2xl bg-white border border-sky-100/75 flex items-center justify-center p-1.5 shadow-2xs overflow-hidden transition-transform duration-300 group-hover:scale-105 flex-shrink-0 z-10">
                        <img 
                          src={sec.img} 
                          alt={sec.title} 
                          className="w-[95%] h-[95%] object-contain float-anim"
                        />
                      </div>

                      {/* Text Column (Right) */}
                      <div className="flex-1 text-left space-y-1.5 z-10 pr-1">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-[1.5px] bg-amber-400" />
                          <span className="text-[9px] font-bold text-amber-500 tracking-widest uppercase">
                            {sec.tag}
                          </span>
                        </div>

                        <h3 className="text-xs sm:text-sm font-bold font-serif-display text-slate-900 tracking-wide leading-snug group-hover:text-sky-600 transition duration-300">
                          {sec.title}
                        </h3>

                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                          {sec.desc}
                        </p>

                        <div className="inline-flex items-center gap-1 text-[10px] font-extrabold text-sky-600 group-hover:translate-x-1 transition-transform duration-300 pt-0.5">
                          <span>{sec.linkText}</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>

    </div>
  );
};
