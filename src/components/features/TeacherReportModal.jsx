
import React from 'react';
import { useGame } from '../../context/GameContext';
import {
  FileText,
  BookOpen,
  GraduationCap,
  Dna,
  Clock,
  Monitor,
  Award,
  Target,
  Sparkles,
  Brain,
  User,
  Lightbulb,
  X
} from 'lucide-react';

export const TeacherReportModal = () => {
  const {
    isTeacherReportOpen,
    setIsTeacherReportOpen,
    teacherReportActiveTab,
    setTeacherReportActiveTab
  } = useGame();

  const activeTab = teacherReportActiveTab || 'identity';
  const setActiveTab = setTeacherReportActiveTab;

  if (!isTeacherReportOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
      <div className="travorra-card max-w-4xl w-full p-6 rounded-3xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto bg-white text-left shadow-2xl print:border-none print:shadow-none animate-fade-in">

        {/* Top Control Bar (Tabs on Left, Close on Right) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3 flex-shrink-0">

          {/* Tab Navigation (Serves as Header) */}
          <div className="flex gap-1.5 print:hidden overflow-x-auto">
            <button
              onClick={() => setActiveTab('identity')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'identity'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-2xs'
                : 'text-black/70 hover:text-black'
                }`}
            >
              Identitas Media
            </button>
            <button
              onClick={() => setActiveTab('cptp')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'cptp'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-2xs'
                : 'text-black/70 hover:text-black'
                }`}
            >
              Capaian & Tujuan (CP/TP)
            </button>
            <button
              onClick={() => setActiveTab('p5')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'p5'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-2xs'
                : 'text-black/70 hover:text-black'
                }`}
            >
              Penerapan P5
            </button>
          </div>

          {/* Close Button */}
          <div className="flex items-center justify-end gap-2 print:hidden">
            <button
              onClick={() => setIsTeacherReportOpen(false)}
              className="text-black/40 hover:text-black hover:bg-slate-100 p-2 rounded-full transition cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Content 1: Identitas Modul */}
        {activeTab === 'identity' && (
          <div className="space-y-4 py-1 animate-fade-in">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h4 className="font-extrabold text-sm text-black">Identitas Media Pembelajaran</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Card 1: Mata Pelajaran */}
              <div className="p-4 rounded-3xl bg-slate-50/50 border border-slate-100 flex items-center gap-4 hover:shadow-xs transition duration-300">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="space-y-0.5 text-left">
                  <span className="text-[10px] font-bold text-black/60 uppercase tracking-wider block">MATA PELAJARAN & MATERI</span>
                  <p className="text-black font-extrabold text-[11px] leading-tight">Biologi - Pewarisan Sifat (Monohibrid, Dihibrid, Intermediet, Letal)</p>
                </div>
              </div>

              {/* Card 2: Kelas/Fase */}
              <div className="p-4 rounded-3xl bg-slate-50/50 border border-slate-100 flex items-center gap-4 hover:shadow-xs transition duration-300">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="space-y-0.5 text-left">
                  <span className="text-[10px] font-bold text-black/60 uppercase tracking-wider block">KELAS / FASE</span>
                  <p className="text-black font-extrabold text-sm">XII / Fase F</p>
                </div>
              </div>

              {/* Card 3: Judul Modul */}
              <div className="p-4 rounded-3xl bg-slate-50/50 border border-slate-100 flex items-center gap-4 hover:shadow-xs transition duration-300">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center flex-shrink-0">
                  <Dna className="w-6 h-6" />
                </div>
                <div className="space-y-0.5 text-left">
                  <span className="text-[10px] font-bold text-black/60 uppercase tracking-wider block">JUDUL MEDIA PEMBELAJARAN</span>
                  <p className="text-black font-extrabold text-sm">Genetic Odyssey: Mendel's Legacy</p>
                </div>
              </div>

              {/* Card 4: Alokasi Waktu */}
              <div className="p-4 rounded-3xl bg-slate-50/50 border border-slate-100 flex items-center gap-4 hover:shadow-xs transition duration-300">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="space-y-0.5 text-left">
                  <span className="text-[10px] font-bold text-black/60 uppercase tracking-wider block">ALOKASI WAKTU</span>
                  <p className="text-black font-extrabold text-sm">2 JP (2 x 45 Menit)</p>
                </div>
              </div>

              {/* Card 5: Sarana Prasarana */}
              <div className="p-4 rounded-3xl bg-slate-50/50 border border-slate-100 flex items-center gap-4 hover:shadow-xs transition duration-300">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Monitor className="w-6 h-6" />
                </div>
                <div className="space-y-0.5 text-left">
                  <span className="text-[10px] font-bold text-black/60 uppercase tracking-wider block">SARANA & PRASARANA</span>
                  <p className="text-black font-extrabold text-xs">HP/Tablet/Laptop, Internet, Proyektor</p>
                </div>
              </div>

              {/* Card 6: Sasaran Pengguna */}
              <div className="p-4 rounded-3xl bg-slate-50/50 border border-slate-100 flex items-center gap-4 hover:shadow-xs transition duration-300">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div className="space-y-0.5 text-left">
                  <span className="text-[10px] font-bold text-black/60 uppercase tracking-wider block">SASARAN PENGGUNA</span>
                  <p className="text-black font-extrabold text-xs">Siswa Kelas XII SMA/MA Peminatan MIPA</p>
                </div>
              </div>

              {/* Card 7: Deklarasi AI (Full Width) */}
              <div className="p-4 rounded-3xl bg-slate-50/50 border border-slate-100 flex items-center gap-4 hover:shadow-xs transition duration-300 col-span-1 md:col-span-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-650 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1 text-left">
                  <span className="text-[10px] font-bold text-black/60 uppercase tracking-wider block">DEKLARASI PENGGUNAAN AI (ASSISTIVE TOOL)</span>
                  <p className="text-black font-bold text-[11px] leading-relaxed">
                    AI digunakan secara etis sebagai alat bantu pemrograman, penyusunan kuis, generator aset ilustrasi pendukung kuis HOTS, serta pengisi basis data asisten belajar pintar BioBot AI.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab Content 2: Capaian & Tujuan */}
        {activeTab === 'cptp' && (
          <div className="space-y-5 py-1 animate-fade-in">

            {/* Capaian Pembelajaran Box */}
            <div className="relative p-5 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/50 border border-indigo-100/80 shadow-xs flex flex-col md:flex-row gap-4 items-start">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/20">
                <Award className="w-6 h-6" />
              </div>
              <div className="space-y-1 text-left flex-1">
                <span className="text-[9px] font-extrabold text-indigo-700 tracking-widest uppercase">Capaian Pembelajaran (CP) - Fase F</span>
                <p className="text-xs text-black leading-relaxed font-bold">
                  "Peserta didik memiliki kemampuan menganalisis proses pewarisan sifat mendel (monohibrid dan dihibrid), memahami struktur DNA, gen, alel, serta menerapkan konsep segregasi dan asortasi bebas dalam memecahkan masalah genetika sederhana."
                </p>
              </div>
            </div>

            {/* Tujuan Pembelajaran List */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                <h4 className="font-extrabold text-sm text-black">Tujuan Pembelajaran (TP) Media</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { num: 'TP 1', text: 'Mengidentifikasi sifat fisik yang dapat diamati (fenotipe) dan sifat genetik (genotipe) makhluk hidup.' },
                  { num: 'TP 2', text: 'Menuliskan simbol alel dominan dan resesif secara tepat sesuai dengan kaidah ilmu genetika.' },
                  { num: 'TP 3', text: 'Menjelaskan pemisahan pasangan alel secara bebas pada saat pembentukan gamet berdasarkan Hukum Segregasi Mendel.' },
                  { num: 'TP 4', text: 'Menentukan hasil persilangan monohibrid dan dihibrid menggunakan diagram Punnett dengan benar.' },
                  { num: 'TP 5', text: 'Menganalisis data ilmiah pewarisan sifat dan membedakan informasi yang valid dari miskonsepsi genetik.' }
                ].map((tp, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border border-slate-100 flex gap-3 hover:shadow-xs transition duration-300 bg-white ${idx === 4 ? 'col-span-1 md:col-span-2' : ''
                      }`}
                  >
                    <span className="w-10 h-7 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-black text-[10px] flex-shrink-0">
                      {tp.num}
                    </span>
                    <p className="text-left text-[11px] sm:text-xs text-black font-bold leading-relaxed">
                      {tp.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab Content 3: Penerapan P5 */}
        {activeTab === 'p5' && (
          <div className="space-y-4 py-1 animate-fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h4 className="font-extrabold text-sm text-black">Projek Penguatan Profil Pelajar Pancasila (P5)</h4>
            </div>

            <p className="text-xs text-black/80 font-bold text-left">
              Aktivitas interaktif di Genetic Odyssey terintegrasi dengan pengembangan kompetensi karakter P5:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Card 1: Bernalar Kritis */}
              <div className="p-5 rounded-3xl bg-gradient-to-b from-sky-50/50 to-white border border-sky-100/70 shadow-2xs hover:shadow-xs hover:border-sky-200 transition duration-300 flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 border border-sky-200 flex items-center justify-center shadow-2xs flex-shrink-0 animate-bounce duration-[4s]">
                  <Brain className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h5 className="font-extrabold text-black text-xs sm:text-sm uppercase tracking-wide">1. Bernalar Kritis</h5>
                  <p className="text-[10px] sm:text-[11px] text-black leading-relaxed font-bold">
                    Siswa menganalisis persilangan dihibrid 4x4, memprediksi rasio panen F2, serta mengevaluasi data miskonsepsi ilmiah pada tantangan *Mutation Trap*.
                  </p>
                </div>
              </div>

              {/* Card 2: Mandiri */}
              <div className="p-5 rounded-3xl bg-gradient-to-b from-emerald-50/50 to-white border border-emerald-100/70 shadow-2xs hover:shadow-xs hover:border-emerald-200 transition duration-300 flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-2xs flex-shrink-0 animate-pulse">
                  <User className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h5 className="font-extrabold text-black text-xs sm:text-sm uppercase tracking-wide">2. Mandiri</h5>
                  <p className="text-[10px] sm:text-[11px] text-black leading-relaxed font-bold">
                    Siswa menguji pemahaman secara mandiri dengan menyelesaikan 8 stage level permainan, memantau kemajuan, dan mengevaluasi hasil belajar lewat kuis secara mandiri.
                  </p>
                </div>
              </div>

              {/* Card 3: Kreatif */}
              <div className="p-5 rounded-3xl bg-gradient-to-b from-amber-50/50 to-white border border-amber-100/70 shadow-2xs hover:shadow-xs hover:border-amber-200 transition duration-300 flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 border border-amber-200 flex items-center justify-center shadow-2xs flex-shrink-0 animate-pulse duration-[3s]">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h5 className="font-extrabold text-black text-xs sm:text-sm uppercase tracking-wide">3. Kreatif</h5>
                  <p className="text-[10px] sm:text-[11px] text-black leading-relaxed font-bold">
                    Siswa secara aktif menganalisis berbagai pola persilangan monohibrid dan dihibrid pada setiap stage petualangan untuk memecahkan masalah genetika secara kreatif.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
