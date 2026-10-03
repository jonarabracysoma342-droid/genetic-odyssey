import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Camera, 
  Printer, 
  Award, 
  HelpCircle, 
  Sparkles, 
  ChevronRight, 
  ArrowLeft,
  X
} from 'lucide-react';
import { sound } from '../../services/sound';
import confetti from 'canvas-confetti';

export const LKPD_QUESTIONS = [
  {
    specimenId: 'ercis_biji',
    title: '1. Sayatan Biji Ercis (Bulat vs Keriput)',
    category: 'Fenotipe Fisik: Butiran Pati Biji',
    concept: 'Enzim SBEI & Penentuan Fenotipe',
    question: 'Mengapa biji ercis bergenotipe homozigot resesif (bb) berbentuk keriput saat matang?',
    options: [
      { key: 'A', text: 'Enzim SBEI inaktif sehingga pati gagal bercabang dan kehilangan air merata.', isCorrect: true },
      { key: 'B', text: 'Tanaman kekurangan klorofil saat fotosintesis sehingga biji mengkerut.', isCorrect: false },
      { key: 'C', text: 'Terjadi mutasi pada ribosom yang menghentikan pembentukan dinding sel.', isCorrect: false }
    ],
    explanation: 'Gen R/B mengkode enzim percabangan pati (SBEI). Mutasi insersi pada alel resesif b membuat enzim tidak aktif, pati gagal bercabang, biji kehilangan air secara drastis saat mengering, menghasilkan fenotipe keriput.'
  },
  {
    specimenId: 'ercis_bunga',
    title: '2. Epidermis Bunga Ercis (Ungu vs Putih)',
    category: 'Monohibrid: Mahkota Bunga',
    concept: 'Dominansi Penuh & Biosintesis Pigmen',
    question: 'Pada persilangan monohibrid Pp × Pp, mengapa tanaman keturunan F1 (Pp) tetap berwarna ungu?',
    options: [
      { key: 'A', text: 'Alel dominan P mengaktifkan biosintesis antosianin di vakuola sel.', isCorrect: true },
      { key: 'B', text: 'Alel resesif p hancur dan lenyap saat fertilisasi.', isCorrect: false },
      { key: 'C', text: 'Kedua alel bercampur menghasilkan warna perantara ungu muda.', isCorrect: false }
    ],
    explanation: 'Alel dominan P mengkode faktor transkripsi yang memicu sintesis pigmen antosianin di vakuola. Satu alel dominan (Pp) sudah cukup menghasilkan pigmen ungu penuh (Dominansi Penuh Mendel).'
  },
  {
    specimenId: 'ercis_serbuk_sari',
    title: '3. Serbuk Sari Ercis (Haploid n - Segregasi)',
    category: 'Hukum Segregasi: Sel Gamet',
    concept: 'Pemisahan Pasangan Alel (Hukum I Mendel)',
    question: 'Hukum genetika manakah yang dibuktikan oleh pemisahan alel ke dalam butir serbuk sari haploid (n)?',
    options: [
      { key: 'A', text: 'Hukum I Mendel (Segregasi Bebas pasangan alel saat pembelahan meiosis).', isCorrect: true },
      { key: 'B', text: 'Hukum II Mendel (Asortasi Bebas dua pasang gen yang berbeda).', isCorrect: false },
      { key: 'C', text: 'Hukum Hardy-Weinberg tentang frekuensi alel populasi.', isCorrect: false }
    ],
    explanation: 'Hukum Segregasi menyatakan bahwa pasangan alel pada sel induk diploid (2n) akan memisah secara bebas saat meiosis, sehingga setiap sel gamet haploid (n) hanya membawa satu alel tunggal.'
  },
  {
    specimenId: 'meiosis',
    title: '4. Pembelahan Meiosis (Metafase I - Asortasi)',
    category: 'Hukum Asortasi: Meiosis Metafase I',
    concept: 'Orientasi Bebas Kromosom Homolog',
    question: 'Peristiwa apa pada Metafase I Meiosis yang menjadi dasar fisik pembuktian Hukum II Mendel?',
    options: [
      { key: 'A', text: 'Pasangan kromosom homolog berjejer dan mengelompok secara bebas di bidang ekuator.', isCorrect: true },
      { key: 'B', text: 'Pemisahan sitoplasma menjadi dua sel anak yang identik.', isCorrect: false },
      { key: 'C', text: 'Hilangnya membran nukleus secara permanen dari sel.', isCorrect: false }
    ],
    explanation: 'Penjajaran bebas pasangan kromosom tetrad di bidang ekuator pada Metafase I memungkinkan kombinasi alel dari gen-gen berbeda berpasangan secara acak dan bebas (Hukum II Mendel).'
  },
  {
    specimenId: 'sel_darah_mutasi',
    title: '5. Mutasi Sel Darah (Sickle Cell vs Normal)',
    category: 'Penyimpangan Genetik: Mutasi Sel Darah',
    concept: 'Mutasi Genetik & Perubahan Fenotipe',
    question: 'Perubahan bentuk eritrosit menjadi sel sabit (sickle cell) membuktikan konsep biologi bahwa:',
    options: [
      { key: 'A', text: 'Mutasi substitusi satu basa pada DNA dapat mengubah bentuk fisik (fenotipe) sel.', isCorrect: true },
      { key: 'B', text: 'Bentuk sel darah merah hanya dipengaruhi oleh asupan makanan harian.', isCorrect: false },
      { key: 'C', text: 'DNA tidak memiliki pengaruh terhadap struktur protein seluler.', isCorrect: false }
    ],
    explanation: 'Substitusi basa tunggal pada gen HBB mengubah asam amino glutamat menjadi valin, menyebabkan rantai hemoglobin membentuk serat kaku yang merubah bentuk sel menjadi sabit (Sickle Cell).'
  }
];

export const DigitalLkpdModal = ({ 
  isOpen, 
  onClose, 
  capturedPhotos = {}, 
  specimens = [],
  onSelectSpecimenToView
}) => {
  const [answers, setAnswers] = useState({});
  const [reflectionNotes, setReflectionNotes] = useState('');

  if (!isOpen) return null;

  const totalPhotos = Object.keys(capturedPhotos).length;
  const totalCorrectAnswers = LKPD_QUESTIONS.filter(q => {
    const chosenKey = answers[q.specimenId];
    const opt = q.options.find(o => o.key === chosenKey);
    return opt && opt.isCorrect;
  }).length;

  const progressScore = Math.round(((totalPhotos * 10) + (totalCorrectAnswers * 10))); // Max 100

  const handleSelectOption = (specimenId, optionKey) => {
    sound.playClick();
    const question = LKPD_QUESTIONS.find(q => q.specimenId === specimenId);
    const chosenOpt = question?.options.find(o => o.key === optionKey);
    
    if (chosenOpt?.isCorrect) {
      sound.playCorrect();
      if (totalCorrectAnswers + 1 === LKPD_QUESTIONS.length) {
        try { confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } }); } catch(e){}
      }
    } else {
      sound.playWrong();
    }

    setAnswers(prev => ({ ...prev, [specimenId]: optionKey }));
  };

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-left text-white my-auto">
        
        {/* Modal Top Header (Screen Only) */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-pixel px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                  LKPD Digital
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Kurikulum Genetika Mendel</span>
              </div>
              <h2 className="text-sm sm:text-lg font-black text-white leading-tight mt-0.5">
                LEMBAR KERJA PESERTA DIDIK — PRAKTIKUM SITOGENETIKA
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition active:scale-95"
              title="Cetak atau simpan LKPD sebagai PDF"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Cetak / Simpan PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/50 cursor-pointer transition"
              title="Tutup LKPD"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Identitas Peserta Didik & Progress Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 sm:p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Peneliti Muda:</span>
              <span className="font-bold text-slate-100 text-sm">Peserta Didik / Tim Peneliti</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Topik: Pewarisan Sifat Mendel &amp; Sitogenetika</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Status Pengamatan:</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold text-emerald-300">{totalPhotos} dari 5 Foto Spesimen</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold text-amber-300">{totalCorrectAnswers} dari 5 Refleksi Tepat</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Skor Kelengkapan:</span>
                <span className="font-bold text-emerald-400 font-mono text-xs">{progressScore} / 100</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
                  style={{ width: `${progressScore}%` }}
                />
              </div>
              <span className="text-[9px] text-slate-400 block mt-1">
                {progressScore === 100 ? '🎉 LKPD Lengkap & Terverifikasi Sempurna!' : 'Lengkapi foto seluruh 5 preparat dan jawab analisis di bawah.'}
              </span>
            </div>
          </div>

          {/* 5 Specimen Cards */}
          <div className="space-y-4">
            <h3 className="text-xs font-pixel text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Daftar Pengamatan Preparat &amp; Analisis Ilmiah</span>
            </h3>

            {LKPD_QUESTIONS.map((q, idx) => {
              const photo = capturedPhotos[q.specimenId];
              const chosenKey = answers[q.specimenId];
              const chosenOpt = q.options.find(o => o.key === chosenKey);
              const isAnswered = Boolean(chosenKey);

              return (
                <div 
                  key={q.specimenId}
                  className={`rounded-2xl border p-3.5 sm:p-5 transition-all ${
                    photo 
                      ? 'bg-slate-950/60 border-slate-700/80 shadow-md' 
                      : 'bg-slate-950/30 border-slate-800/80 opacity-90'
                  }`}
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    
                    {/* Left Column: Specimen Micrograph Photo */}
                    <div className="w-full md:w-56 shrink-0 flex flex-col items-center">
                      <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full border-4 border-slate-800 overflow-hidden bg-black flex items-center justify-center shadow-lg group">
                        {photo ? (
                          <>
                            <img 
                              src={photo.image} 
                              alt={q.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center pb-2 pointer-events-none">
                              <span className="text-[9px] font-mono font-bold text-white bg-black/60 px-2 py-0.5 rounded-full border border-white/20">
                                {photo.totalMag}x • {photo.focusScore}% Fokus
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="p-4 text-center space-y-1.5">
                            <Camera className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
                            <span className="text-[10px] text-slate-400 block font-medium">Belum ada foto</span>
                            <button
                              onClick={() => {
                                onSelectSpecimenToView?.(q.specimenId);
                                onClose();
                              }}
                              className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[9px] font-pixel cursor-pointer transition"
                            >
                              Amati di Lab 🔬
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="mt-2 text-center">
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {photo ? `Waktu: ${photo.timestamp}` : 'Langkah: Putar mikrometer & klik [Foto]'}
                        </span>
                      </div>
                    </div>

                    {/* Right Column: Question & Concept Reflection */}
                    <div className="flex-1 space-y-2.5">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span className="text-[9px] font-pixel px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 uppercase">
                            {q.category}
                          </span>
                          <span className="text-[10px] text-amber-400 font-medium font-sans">
                            🧬 {q.concept}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                          {q.title}
                        </h4>
                      </div>

                      {/* Question Prompt */}
                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 font-medium leading-relaxed">
                        <span className="text-amber-400 font-bold mr-1">Pertanyaan Analisis:</span>
                        {q.question}
                      </div>

                      {/* Options */}
                      <div className="space-y-1.5">
                        {q.options.map(opt => {
                          const isSelected = chosenKey === opt.key;
                          let btnStyle = 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-300';
                          if (isSelected) {
                            btnStyle = opt.isCorrect 
                              ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-400' 
                              : 'bg-rose-950/60 border-rose-500 text-rose-200 ring-1 ring-rose-400';
                          }

                          return (
                            <button
                              key={opt.key}
                              onClick={() => handleSelectOption(q.specimenId, opt.key)}
                              className={`w-full p-2 rounded-xl border text-left text-xs font-medium transition cursor-pointer flex items-start gap-2 ${btnStyle}`}
                            >
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                                isSelected 
                                  ? opt.isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white' 
                                  : 'bg-slate-800 text-slate-300'
                              }`}>
                                {opt.key}
                              </span>
                              <span className="flex-1 leading-snug">{opt.text}</span>
                              {isSelected && opt.isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              )}
                              {isSelected && !opt.isCorrect && (
                                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Feedback Explanation */}
                      {isAnswered && (
                        <div className={`p-2.5 rounded-xl border text-[11px] leading-relaxed animate-in fade-in duration-200 ${
                          chosenOpt?.isCorrect 
                            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200' 
                            : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                        }`}>
                          <strong className="block mb-0.5">
                            {chosenOpt?.isCorrect ? '✓ Jawaban Tepat!' : '💡 Pembahasan Konsep:'}
                          </strong>
                          <span>{q.explanation}</span>
                        </div>
                      )}

                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Reflection & Conclusion Field */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>✍️ Kesimpulan Pengamatan Genetika Sel</span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Tuliskan kesimpulan analisismu mengenai bagaimana pengamatan sitogenetika pada mikroskop membuktikan pewarisan sifat Mendel:
            </p>
            <textarea
              value={reflectionNotes}
              onChange={(e) => setReflectionNotes(e.target.value)}
              placeholder="Contoh: Pengamatan mikroskop membuktikan bahwa genotipe diterjemahkan menjadi fenotipe fisik (seperti enzim SBEI pada biji ercis). Pemisahan alel terjadi secara fisik saat meiosis..."
              className="w-full h-24 p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 transition resize-none leading-relaxed"
            />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Skor: <strong className="text-emerald-400 font-mono">{progressScore}/100</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-bold cursor-pointer transition"
            >
              Cetak LKPD 🖨️
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer transition shadow-md"
            >
              Selesai &amp; Lanjut Lab 🔬
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DigitalLkpdModal;
