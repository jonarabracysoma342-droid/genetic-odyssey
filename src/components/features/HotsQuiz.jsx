import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../services/sound';
import { db } from '../../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import confetti from 'canvas-confetti';
import { PixelValleyBackground } from '../common/PixelValleyBackground';
import { 
  Brain, 
  ChevronLeft, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  RotateCcw,
  Star,
  ClipboardList,
  AlertCircle,
  Trophy,
  Play
} from 'lucide-react';

// Tailored PNG illustrations component for all 20 questions
const QuestionIllustration = ({ id }) => {
  const images = {
    1: '/assets/hots_q1_mendel.webp',
    2: '/assets/hots_q2_hama.webp',
    3: '/assets/sub_punnett2x2_steps.webp',
    4: '/assets/sub_genotype_phenotype.webp',
    5: '/assets/hots_q5_chromosome.webp',
    6: '/assets/hots_q6_intermediet.webp',
    7: '/assets/sub_monohybrid_schema.webp',
    8: '/assets/genopedia_law2.webp',
    9: '/assets/sub_law1_concept.webp',
    10: '/assets/subtopic_theory.webp',
    11: '/assets/genopedia_concept.webp',
    12: '/assets/subtopic_result.webp',
    13: '/assets/subtopic_process.webp',
    14: '/assets/genopedia_punnett2x2.webp',
    15: '/assets/sub_mendel_goal.webp',
    16: '/assets/cat_curriculum_icon.webp',
    17: '/assets/hots_q17_letal.webp',
    18: '/assets/subtopic_theory.webp',
    19: '/assets/genopedia_punnett4x4.webp',
    20: '/assets/stage1_garden_illustration.webp'
  };

  const src = images[id];
  if (!src) return null;

  return (
    <div className="w-full flex justify-center items-center bg-slate-50 border border-slate-200 rounded-2xl p-2 md:p-3 h-28 md:h-40 overflow-hidden animate-scale-up">
      <img 
        src={src} 
        alt={"Ilustrasi Soal " + id} 
        className="h-full w-full object-contain"
      />
    </div>
  );
};

export const QUESTIONS = [
  {
    id: 1,
    category: 'C1 – Mengingat',
    question: "Siapakah tokoh ilmuwan biologi yang dikenal sebagai 'Bapak Genetika Modern' berkat jasanya merumuskan prinsip-prinsip pewarisan sifat pada tanaman ercis (Pisum sativum)?",
    options: [
      { key: 'A', text: 'Charles Darwin' },
      { key: 'B', text: 'Gregor Mendel' },
      { key: 'C', text: 'Thomas Hunt Morgan' },
      { key: 'D', text: 'Watson dan Crick' }
    ],
    answer: 'B',
    explanation: "Gregor Mendel dinobatkan sebagai Bapak Genetika atas jasanya melakukan penelitian persilangan kacang ercis secara terstruktur dan merumuskan hukum pewarisan sifat dasar."
  },
  {
    id: 2,
    category: 'C1 – Mengingat',
    question: "Hukum Mendel I yang mengatur tentang pemisahan pasangan alel secara bebas pada saat pembentukan gamet secara spesifik disebut dengan...",
    options: [
      { key: 'A', text: 'Hukum Asortasi Bebas' },
      { key: 'B', text: 'Hukum Segregasi Bebas' },
      { key: 'C', text: 'Hukum Dominansi Penuh' },
      { key: 'D', text: 'Hukum Pautan Kromosom' }
    ],
    answer: 'B',
    explanation: "Hukum Mendel I adalah Hukum Segregasi Bebas, yang menyatakan bahwa pada pembentukan sel gamet, pasangan alel suatu gen memisah (segregasi) secara bebas."
  },
  {
    id: 3,
    category: 'C1 – Mengingat',
    question: "Struktur berbentuk padat di dalam inti sel yang tersusun atas benang DNA serta protein histon pembawa materi genetik disebut dengan...",
    options: [
      { key: 'A', text: 'Ribosom' },
      { key: 'B', text: 'Kromosom' },
      { key: 'C', text: 'Vakuola' },
      { key: 'D', text: 'Lisosom' }
    ],
    answer: 'B',
    explanation: "Kromosom adalah badan padat pembawa informasi genetik (DNA) yang terletak di dalam nukleus (inti sel)."
  },
  {
    id: 4,
    category: 'C2 – Memahami',
    question: "Manakah pernyataan di bawah ini yang paling tepat dalam menjelaskan perbedaan mendasar antara konsep fenotipe dan genotipe?",
    options: [
      { key: 'A', text: 'Fenotipe tidak dipengaruhi faktor lingkungan, sedangkan genotipe sangat dipengaruhi lingkungan.' },
      { key: 'B', text: 'Fenotipe adalah sifat luar/karakteristik fisik yang dapat diamati langsung, sedangkan genotipe adalah komposisi genetik makhluk hidup.' },
      { key: 'C', text: 'Fenotipe dilambangkan dengan kode huruf kapital, sedangkan genotipe dengan gambar simbol tanaman.' },
      { key: 'D', text: 'Kedua istilah tersebut memiliki definisi yang sepenuhnya sama dalam teori persilangan.' }
    ],
    answer: 'B',
    explanation: "Fenotipe merupakan perpaduan genotipe dan lingkungan yang berwujud karakteristik fisik tampak (bulat, keriput, ungu). Genotipe adalah susunan kode alel/genetik (AA, Aa, aa)."
  },
  {
    id: 5,
    category: 'C2 – Memahami',
    question: "Organisme yang memiliki kondisi genotipe heterozigot ditandai dengan ciri genetik berupa...",
    options: [
      { key: 'A', text: 'Memiliki pasangan alel yang identik untuk gen tertentu (misal AA atau aa).' },
      { key: 'B', text: 'Memiliki sepasang alel yang berbeda untuk gen tertentu (misal Aa atau Bb).' },
      { key: 'C', text: 'Hanya memiliki alel dominan murni tanpa membawa sifat resesif sama sekali.' },
      { key: 'D', text: 'Kehilangan kemampuan memproduksi gamet selama reproduksi seksual.' }
    ],
    answer: 'B',
    explanation: "Heterozigot artinya pasangan alelnya berbeda (satu dominan dan satu resesif, contohnya Aa)."
  },
  {
    id: 6,
    category: 'C2 – Memahami',
    question: "Penyimpangan semu dominansi tidak penuh (kodominansi/intermediet) dapat didefinisikan sebagai peristiwa di mana...",
    options: [
      { key: 'A', text: 'Alel dominan menutupi alel resesif secara mutlak.' },
      { key: 'B', text: 'Keturunan memiliki fenotipe perpaduan sifat antara kedua induknya.' },
      { key: 'C', text: 'Kromosom induk mengalami delesi ganda saat fertilisasi.' },
      { key: 'D', text: 'Kedua induk tidak mampu menghasilkan keturunan yang subur (fertil).' }
    ],
    answer: 'B',
    explanation: "Pada kodominansi atau intermediet, alel dominan tidak menutupi resesif secara penuh, sehingga anakan heterozigot menunjukkan fenotipe campuran (merah ✕ putih menghasilkan merah muda)."
  },
  {
    id: 7,
    category: 'C3 – Menerapkan',
    question: "Jika tanaman ercis berbunga merah homozigot dominan (MM) disilangkan dengan ercis berbunga putih homozigot resesif (mm), bagaimanakah fenotipe keturunan pertama (F1) jika sifat merah dominan penuh?",
    options: [
      { key: 'A', text: '100% Berbunga Merah' },
      { key: 'B', text: '50% Merah : 50% Putih' },
      { key: 'C', text: '100% Berbunga Merah Muda' },
      { key: 'D', text: '75% Merah : 25% Putih' }
    ],
    answer: 'A',
    explanation: "Persilangan MM ✕ mm menghasilkan 100% keturunan Mm. Karena alel M bersifat dominan penuh terhadap m, seluruh F1 berfenotipe merah."
  },
  {
    id: 8,
    category: 'C3 – Menerapkan',
    question: "Tanaman ercis memiliki genotipe AaBb. Tentukan jenis gamet yang dihasilkan oleh tanaman tersebut sesuai dengan Hukum Asortasi Bebas Mendel!",
    options: [
      { key: 'A', text: 'AB dan ab' },
      { key: 'B', text: 'Aa dan Bb' },
      { key: 'C', text: 'AB, Ab, aB, dan ab' },
      { key: 'D', text: 'AA, BB, aa, dan bb' }
    ],
    answer: 'C',
    explanation: "Genotipe AaBb (dihibrid) memisah secara bebas memproduksi 4 jenis kombinasi gamet yaitu: AB, Ab, aB, dan ab."
  },
  {
    id: 9,
    category: 'C3 – Menerapkan',
    question: "Dilakukan persilangan sesama tanaman ercis berbatang tinggi heterozigot (Tt ✕ Tt). Dari 400 keturunan F2 yang dihasilkan, berapa perkiraan jumlah tanaman yang berbatang tinggi?",
    options: [
      { key: 'A', text: '100 tanaman' },
      { key: 'B', text: '200 tanaman' },
      { key: 'C', text: '300 tanaman' },
      { key: 'D', text: '400 tanaman' }
    ],
    answer: 'C',
    explanation: "Persilangan Tt ✕ Tt menghasilkan rasio fenotipe F2 berbanding 3 tinggi (T_) : 1 pendek (tt). Jumlah batang tinggi = 3/4 ✕ 400 = 300 tanaman."
  },
  {
    id: 10,
    category: 'C4 – Menganalisis',
    question: "Persilangan buah bulat manis dengan keriput masam menghasilkan F1 bulat manis. Saat F1 disilangkan dengan resesif ganda (test cross), keturunan berasio: 45% bulat manis, 45% keriput masam, 5% bulat masam, dan 5% keriput manis. Analisis manakah yang tepat?",
    options: [
      { key: 'A', text: 'Gen-gen tersebut terletak pada kromosom berbeda dan memisah secara bebas.' },
      { key: 'B', text: 'Terjadi peristiwa pautan gen (linkage) yang disertai dengan pindah silang.' },
      { key: 'C', text: 'Sifat bulat manis mengalami kematian (letal ganda).' },
      { key: 'D', text: 'Terjadi penyimpangan gen resesif mutlak yang memotong kromosom.' }
    ],
    answer: 'B',
    explanation: "Rasio keturunan tipe parental sangat tinggi (90%) sedangkan tipe rekombinan sangat rendah (10%). Hal ini menganalisis adanya pautan gen (linkage) dengan pindah silang (crossing over) sebagian."
  },
  {
    id: 11,
    category: 'C4 – Menganalisis',
    question: "Analisis silsilah menunjukkan sifat botak dominan pada laki-laki dan resesif pada perempuan. Jika seorang pria tidak botak menikah dengan wanita heterozigot botak, bagaimanakah kemungkinan keturunan anak laki-laki mereka?",
    options: [
      { key: 'A', text: 'Semua anak laki-laki botak.' },
      { key: 'B', text: '50% anak laki-laki botak, 50% tidak botak.' },
      { key: 'C', text: 'Semua anak laki-laki tidak botak.' },
      { key: 'D', text: 'Peluang sifat botak diwariskan adalah 0%.' }
    ],
    answer: 'B',
    explanation: "Pria tidak botak bergenotipe bb. Wanita heterozigot botak bergenotipe Bb. Persilangan menghasilkan anak Bb dan bb. Bagi anak laki-laki, genotipe Bb berfenotipe botak, dan bb tidak botak, menghasilkan rasio 50% : 50%."
  },
  {
    id: 12,
    category: 'C4 – Menganalisis',
    question: "Pada penyimpangan semu Epistasis Resesif, gen resesif homozigot menutupi gen lain sehingga mengubah rasio F2 dihibrid menjadi 9 : 3 : 4. Analisis manakah yang tepat mengenai kelompok 4 bagian tersebut?",
    options: [
      { key: 'A', text: 'Merupakan akumulasi sifat dominan ganda yang bergabung.' },
      { key: 'B', text: 'Terjadi peleburan ekspresi antara individu bergenotipe dominan-resesif dengan resesif ganda akibat tertutup gen epistasis resesif.' },
      { key: 'C', text: 'Mengindikasikan adanya tikus atau tumbuhan yang mati di kandungan.' },
      { key: 'D', text: 'Genotipe tersebut merupakan hasil mutasi radiasi.' }
    ],
    answer: 'B',
    explanation: "Rasio 9:3:4 terbentuk karena gen resesif homozigot (misal ee) menutupi gen lain, sehingga individu A_ee (3 bagian) and aaee (1 bagian) memiliki fenotipe yang sama (3+1=4 bagian)."
  },
  {
    id: 13,
    category: 'C4 – Menganalisis',
    question: "Dari analisis persilangan lalat buah kelabu-panjang (heterozigot ganda) dengan lalat hitam-pendek diperoleh keturunan: Kelabu-panjang = 965; Hitam-pendek = 944; Kelabu-pendek = 185; Hitam-panjang = 206. Berapakah Nilai Pindah Silang (NPS) pada persilangan tersebut?",
    options: [
      { key: 'A', text: '17%' },
      { key: 'B', text: '83%' },
      { key: 'C', text: '39%' },
      { key: 'D', text: '5%' }
    ],
    answer: 'A',
    explanation: "NPS = (Jumlah Rekombinan / Total Keturunan) ✕ 100%. Tipe Rekombinan = 185 + 206 = 391. Total = 965 + 944 + 185 + 206 = 2300. NPS = (391 / 2300) ✕ 100% ≈ 17%."
  },
  {
    id: 14,
    category: 'C5 – Mengevaluasi',
    question: "Siswa menyilangkan ercis bulat (Aa) ✕ bulat (Aa) dan memperoleh 200 anakan bulat serta 0 keriput. Siswa menyimpulkan Hukum Segregasi Mendel salah karena tidak ada keriput. Bagaimana evaluasi Anda terhadap simpulan tersebut?",
    options: [
      { key: 'A', text: 'Simpulan siswa benar karena data nyata lapangan menunjukkan demikian.' },
      { key: 'B', text: 'Simpulan siswa salah karena jumlah sampel kurang mewakili dan ada kemungkinan kontaminasi benih dominan homozigot (AA).' },
      { key: 'C', text: 'Simpulan siswa benar karena ercis bulat tidak mematuhi hukum segregasi.' },
      { key: 'D', text: 'Simpulan siswa salah karena biji keriput tidak bisa hidup.' }
    ],
    answer: 'B',
    explanation: "Hukum Mendel bersifat probabilistik. Jika diperoleh 200 bulat tanpa ada keriput sama sekali dari induk Aa ✕ Aa, kemungkinan besar terjadi kesalahan pemilihan induk (induk bergenotipe AA) atau kegagalan penanaman benih resesif."
  },
  {
    id: 15,
    category: 'C5 – Mengevaluasi',
    question: "Bandingkan Teori Blending (sifat melebur permanen) dan Teori Partikulat Mendel. Bukti eksperimen manakah di bawah ini yang paling valid untuk meruntuhkan Teori Blending?",
    options: [
      { key: 'A', text: 'Munculnya kembali sifat resesif (bunga putih) pada generasi F2 hasil persilangan sesama F1 yang heterozigot.' },
      { key: 'B', text: 'Hilangnya sifat resesif secara mutlak pada F1.' },
      { key: 'C', text: 'Rasio F2 monohibrid yang selalu menghasilkan angka 100% identik.' },
      { key: 'D', text: 'Terbentuknya variasi tinggi tanaman yang sangat luas di alam.' }
    ],
    answer: 'A',
    explanation: "Jika sifat melebur permanen (Blending), sifat bunga putih yang hilang di F1 tidak akan pernah bisa diekspresikan kembali pada F2. Kemunculan kembali sifat resesif membuktikan unit pewaris sifat bersifat partikulat (terpisah)."
  },
  {
    id: 16,
    category: 'C5 – Mengevaluasi',
    question: "Peneliti mengevaluasi laju segregasi bebas pada tanaman dengan 7 kromosom (selike ercis) terhadap tanaman dengan 2 kromosom. Kesimpulan manakah yang paling logis?",
    options: [
      { key: 'A', text: 'Tanaman dengan 2 kromosom akan menunjukkan laju asortasi bebas yang lebih tinggi.' },
      { key: 'B', text: 'Tanaman dengan 7 kromosom lebih konsisten dengan Hukum Mendel II karena peluang terjadinya pautan gen antar-sifat acak lebih kecil.' },
      { key: 'C', text: 'Jumlah kromosom sama sekali tidak memengaruhi asortasi bebas maupun pautan.' },
      { key: 'D', text: 'Hukum Mendel II tidak dapat dipelajari pada tanaman dengan kromosom ganjil.' }
    ],
    answer: 'B',
    explanation: "Jumlah kromosom yang lebih banyak menurunkan probabilitas dua gen acak terletak berdekatan pada kromosom yang sama (pautan). Ercis dengan 7 kromosom memiliki peluang asortasi bebas yang lebih baik."
  },
  {
    id: 17,
    category: 'C5 – Mengevaluasi',
    question: "Gen letal dominan homozigot (YY) menyebabkan kematian embrio kuning pada tikus. Tikus kuning hidup bergenotipe Yy. Tikus kelabu hidup bergenotipe yy. Evaluasi rasio keturunan tikus hidup hasil persilangan sesama tikus kuning!",
    options: [
      { key: 'A', text: '3 Kuning : 1 Kelabu' },
      { key: 'B', text: '2 Kuning : 1 Kelabu' },
      { key: 'C', text: 'Semua anak tikus mengalami kematian.' },
      { key: 'D', text: '1 Kuning : 1 Kelabu' }
    ],
    answer: 'B',
    explanation: "Persilangan Yy ✕ Yy menghasilkan YY (letal), Yy (kuning), Yy (kuning), dan yy (kelabu). Karena tikus homozigot dominan YY mati di kandungan, perbandingan tikus hidup yang lahir adalah 2 Kuning : 1 Kelabu."
  },
  {
    id: 18,
    category: 'C6 – Menciptakan',
    question: "Anda ingin memproduksi massal tanaman ercis murni bulat-hijau (AAbb) dari induk heterozigot ganda (AaBb). Rancanglah langkah paling efisien untuk memperoleh galur murni tersebut!",
    options: [
      { key: 'A', text: 'Silangkan AaBb dengan sesamanya, pilih anakan bulat-hijau, lalu lakukan penyerbukan sendiri (selfing) hingga diperoleh galur murni AAbb.' },
      { key: 'B', text: 'Silangkan AaBb dengan resesif aabb, lalu pilih seluruh tanaman kuning saja.' },
      { key: 'C', text: 'Lakukan kloning sel daun induk AaBb secara kultur jaringan vegetatif.' },
      { key: 'D', text: 'Beri radiasi sinar gamma pada tanaman AaBb agar gen dominan langsung hancur.' }
    ],
    answer: 'A',
    explanation: "Persilangan sesama AaBb menghasilkan anakan bulat-hijau bergenotipe AAbb and Aabb. Melakukan seleksi mandiri anakan bulat-hijau dilanjutkan dengan penyerbukan sendiri akan memisahkan galur murni AAbb yang stabil."
  },
  {
    id: 19,
    category: 'C6 – Menciptakan',
    question: "Anda memiliki tanaman ercis bunga merah-biji bulat (dominan) yang genotipenya tidak diketahui. Desainlah prosedur genetik tercepat untuk membuktikan tanaman tersebut adalah galur murni homozigot dominan ganda!",
    options: [
      { key: 'A', text: 'Silangkan tanaman dengan sesamanya lalu amati variasi anakan yang lahir.' },
      { key: 'B', text: 'Lakukan persilangan uji (test cross) dengan tanaman putih-keriput (resesif ganda). Jika 100% anakan seragam merah-bulat tanpa variasi sifat resesif, tanaman terbukti galur murni.' },
      { key: 'C', text: 'Potong DNA tanaman menggunakan enzim restriksi dan lakukan elektroforesis.' },
      { key: 'D', text: 'Biarkan tanaman mati secara alami dan hitung jumlah polongnya.' }
    ],
    answer: 'B',
    explanation: "Persilangan uji (test cross) dengan resesif ganda (aabb) adalah cara tercepat mendeteksi heterozigotitas. Jika tanaman misterius homozigot dominan (AABB), seluruh F1 pasti seragam dominan (AaBb, merah-bulat)."
  },
  {
    id: 20,
    category: 'C6 – Menciptakan',
    question: "Pada kriptomeri bunga Linaria maroccana merah (Aabb) ✕ putih (aaBb) menghasilkan F1 ungu (AaBb). Rancanglah persilangan terbaik untuk memperoleh keturunan bunga putih dalam persentase tertinggi (100% putih)!",
    options: [
      { key: 'A', text: 'Silangkan AaBb (ungu) dengan Aabb (merah).' },
      { key: 'B', text: 'Silangkan Aabb (merah) dengan Aabb (merah).' },
      { key: 'C', text: 'Silangkan aaBb (putih) dengan aabb (putih).' },
      { key: 'D', text: 'Silangkan AaBb (ungu) with AaBb (ungu).' }
    ],
    answer: 'C',
    explanation: "Linaria maroccana berwarna putih apabila bergenotipe resesif homozigot aa_ _. Menyilangkan aaBb (putih) ✕ aabb (putih) akan menghasilkan 100% anakan bergenotipe aa_ _ yang semuanya berwarna putih."
  }
];

export const HotsQuiz = () => {
  const { currentUser, groupId, userProgress, navigateTo, showAlert, showConfirm } = useGame();
  
  // Selection vs Playing views: activeQuizType can be null | 'system' | 'class'
  const [activeQuizType, setActiveQuizType] = useState(null);
  const [classQuizzes, setClassQuizzes] = useState([]);
  const [selectedClassQuiz, setSelectedClassQuiz] = useState(null);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedKey, setSelectedKey] = useState(null); // 'A', 'B', 'C', 'D'
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [score, setScore] = useState(0);

  // Map of student's custom choices: { [questionId]: optionKey }
  const [userAnswers, setUserAnswers] = useState({});
  
  const [loading, setLoading] = useState(false);

  // Fetch Class quizzes if joined class
  const fetchClassQuizzes = async () => {
    if (!groupId) return;
    try {
      setLoading(true);
      const groupDoc = await getDoc(doc(db, 'groups', groupId));
      if (groupDoc.exists()) {
        setClassQuizzes(groupDoc.data().quizzes || []);
      }
    } catch (err) {
      console.error("Error loading class quizzes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchClassQuizzes();
    }
  }, [groupId]);

  // Determine current active questions list
  const getQuestions = () => {
    if (activeQuizType === 'system') return QUESTIONS;
    if (activeQuizType === 'class' && selectedClassQuiz) return selectedClassQuiz.questions || [];
    return [];
  };

  const questionsList = getQuestions();
  const currentQuestion = questionsList[currentIdx];

  const handleStartSystemQuiz = () => {
    sound.playClick();
    setActiveQuizType('system');
    setSelectedClassQuiz(null);
    setCurrentIdx(0);
    setSelectedKey(null);
    setCorrectCount(0);
    setScore(0);
    setUserAnswers({});
    setQuizCompleted(false);
  };

  const handleStartClassQuiz = (quiz) => {
    sound.playClick();
    setActiveQuizType('class');
    setSelectedClassQuiz(quiz);
    setCurrentIdx(0);
    setSelectedKey(null);
    setCorrectCount(0);
    setScore(0);
    setUserAnswers({});
    setQuizCompleted(false);
  };

  const handleSelectOption = (key) => {
    if (selectedKey) return; // Answer locked
    setSelectedKey(key);
    
    // Save response
    const qId = currentQuestion.id;
    setUserAnswers(prev => ({ ...prev, [qId]: key }));

    if (key === currentQuestion.answer) {
      sound.playCorrect();
      setCorrectCount(prev => prev + 1);
      if (activeQuizType === 'system') {
        setScore(prev => prev + 100);
      } else {
        // Class kuis points (calculated as percentage out of 100 later, but keep running tally)
        setScore(prev => prev + 1);
      }
    } else {
      sound.playWrong();
    }
  };

  const handleNext = () => {
    sound.playClick();
    if (currentIdx < questionsList.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedKey(null);
    } else {
      setQuizCompleted(true);
      sound.playFanfare();
      try {
        confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
      } catch(e){}
    }
  };

  const handleReset = () => {
    sound.playClick();
    setCurrentIdx(0);
    setSelectedKey(null);
    setCorrectCount(0);
    setScore(0);
    setUserAnswers({});
    setQuizCompleted(false);
  };

  // Submit and save quiz details to Firestore
  const handleSubmitQuizResults = async () => {
    if (!currentUser) {
      setActiveQuizType(null);
      return;
    }

    sound.playClick();
    setLoading(true);

    try {
      const totalQ = questionsList.length;
      const finalPercentage = Math.round((correctCount / totalQ) * 100);

      const userRef = doc(db, 'users', currentUser.uid);

      if (activeQuizType === 'system') {
        const payload = {
          score: score, // points (2000 max)
          correctCount: correctCount,
          totalQuestions: totalQ,
          answers: userAnswers,
          completedAt: new Date().toISOString()
        };
        await updateDoc(userRef, {
          'progress.hotsQuiz': payload,
          'progress.score': (userProgress.score || 0) + score
        });
      } else if (activeQuizType === 'class' && selectedClassQuiz) {
        const payload = {
          score: finalPercentage, // percentage points (100 max)
          correctCount: correctCount,
          totalQuestions: totalQ,
          answers: userAnswers,
          completedAt: new Date().toISOString()
        };

        const existingCustomQuizzes = userProgress.customQuizzes || {};
        await updateDoc(userRef, {
          [`progress.customQuizzes.${selectedClassQuiz.id}`]: payload,
          'progress.score': (userProgress.score || 0) + finalPercentage
        });
      }
      
      setActiveQuizType(null);
      // Force page-level navigation refresh
      navigateTo('hots-quiz');
    } catch (err) {
      console.error("Error saving quiz results:", err);
      showAlert("Gagal menyimpan hasil kuis.");
    } finally {
      setLoading(false);
    }
  };

  const getQuizGrade = () => {
    const accuracy = (correctCount / questionsList.length) * 100;
    if (accuracy === 100) return { title: 'Mendel Master (C1-C6)', desc: 'Luar biasa sempurna! Kamu menguasai seluruh tingkatan kognitif Taksonomi Bloom dalam genetika Mendel.' };
    if (accuracy >= 70) return { title: 'Genetics Scholar (C1-C6)', desc: 'Hebat! Pemahaman konsep kognitif dasar hingga tingkat evaluasi dan kreasi kamu sudah sangat baik.' };
    return { title: 'Novice Breeder', desc: 'Ayo tingkatkan belajarmu! Pelajari materi Hukum Mendel lebih mendalam di menu Genopedia.' };
  };

  // --- RENDERING VIEWS ---

  // VIEW 1: QUIZ SELECTOR SCREEN
  if (activeQuizType === null) {
    return (
      <div className="w-full min-h-screen relative overflow-x-hidden bg-[#74c2e8] select-none flex flex-col p-4 md:p-8 text-left">
        
        {/* Detailed Stardew Valley Background */}
        <PixelValleyBackground overlay="medium" />
        
        {/* Header HUD (Pixel Wooden Plank) */}
        <div className="w-full p-3 md:p-4 rounded-xl bg-[#fae8b6] border-4 border-[#361706] shadow-[4px_4px_0_#1a0b03] flex items-center justify-between gap-3 z-30 relative mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('main-menu')}
              className="px-3 py-2 rounded-lg bg-[#ca7c38] hover:bg-[#df9b52] border-2 border-[#361706] text-[#2b1103] font-pixel text-[8px] md:text-[9px] uppercase transition shadow-[2px_2px_0_#2b1103] cursor-pointer flex-shrink-0 active:translate-y-0.5 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3px]" />
              <span>MENU</span>
            </button>
            <div>
              <span className="text-[7px] md:text-[8px] font-pixel text-[#884318] uppercase tracking-widest block">EVALUASI MANDIRI</span>
              <h2 className="text-xs md:text-sm font-pixel text-[#361706] leading-tight mt-0.5 uppercase">Kuis Evaluasi HOTS</h2>
            </div>
          </div>
        </div>

        <div className="space-y-4 z-10 relative overflow-y-auto max-h-[78vh] pr-1 pb-6">
          
          {/* Card Option 1: System Quiz */}
          <div className="bg-[#fae8b6] border-4 border-[#361706] rounded-xl p-4 md:p-5 shadow-[4px_4px_0_#1a0b03] space-y-3 hover:brightness-105 transition-all text-[#2b1103]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-[#ca7c38] border-2 border-[#361706] flex items-center justify-center p-1.5 flex-shrink-0 text-xl">
                  🧠
                </div>
                <div>
                  <h3 className="text-xs md:text-sm font-pixel text-[#361706] uppercase font-bold">1. KUIS EVALUASI HOTS</h3>
                  <span className="text-[8px] font-pixel text-[#884318] uppercase tracking-wide block mt-0.5">Kuis Sistem Mandiri</span>
                </div>
              </div>
              {userProgress?.hotsQuiz && (
                <span className="text-[8px] md:text-[10px] font-black px-2 md:px-3 py-0.5 md:py-1 bg-emerald-100 border border-emerald-500 rounded text-emerald-800">SELESAI (Skor: {userProgress.hotsQuiz.score})</span>
              )}
            </div>

            <p className="text-[9.5px] md:text-xs font-medium text-slate-600 leading-relaxed">
              Uji pemahaman kognitif teori persilangan dan Hukum Mendel Anda secara menyeluruh dengan kuis HOTS 20 soal Taksonomi Bloom (C1-C6).
            </p>

            <button
              onClick={handleStartSystemQuiz}
              className="w-full py-2.5 md:py-3 bg-indigo-650 hover:bg-indigo-700 text-white font-black text-[9.5px] md:text-xs border-2 border-slate-800 rounded-xl shadow-[2px_2px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 md:w-4 md:h-4 fill-white stroke-none" />
              <span>MULAI KUIS SISTEM</span>
            </button>
          </div>

          {/* Card Option 2: Class Quizzes */}
          <div className="bg-[#fae8b6] border-4 border-[#361706] rounded-xl p-4 md:p-5 shadow-[4px_4px_0_#1a0b03] space-y-3 hover:brightness-105 transition-all text-[#2b1103]">
            <div className="flex items-center gap-2.5 md:gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#ca7c38] border-2 border-[#361706] flex items-center justify-center p-1.5 flex-shrink-0 text-xl">
                📋
              </div>
              <div>
                <h3 className="text-xs md:text-sm font-pixel text-[#361706] uppercase font-bold">2. KUIS KUSTOM KELAS</h3>
                <span className="text-[8px] font-pixel text-[#884318] uppercase tracking-wide block mt-0.5">Tugas Khusus Guru</span>
              </div>
            </div>

            {!groupId ? (
              <div className="p-4 border-2 border-[#361706] rounded-xl bg-[#fff8e7] space-y-2 text-center">
                <AlertCircle className="w-6 h-6 text-[#884318] mx-auto" />
                <p className="text-[9.5px] font-bold text-[#543319] leading-normal max-w-[280px] mx-auto">
                  Anda belum bergabung ke kelompok kelas manapun. Bergabunglah terlebih dahulu di tab "Kelas" agar dapat mengakses kuis khusus dari guru Anda.
                </p>
                <button
                  onClick={() => navigateTo('group-dashboard')}
                  className="px-4 py-1.5 bg-[#ca7c38] hover:bg-[#df9b52] text-[#2b1103] border-2 border-[#361706] rounded-lg text-[8.5px] font-pixel uppercase font-bold shadow-xs cursor-pointer active:translate-y-0.5"
                >
                  GABUNG KELAS SEKARANG
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[9.5px] font-bold text-[#543319] leading-relaxed">
                  Kerjakan lembar kerja kuis yang dibuat dan dibagikan secara instan oleh guru kelas Anda di ruang kelas online.
                </p>

                {loading ? (
                  <p className="text-[9px] font-pixel text-[#884318] text-center animate-pulse py-2">Memuat daftar kuis kelas...</p>
                ) : classQuizzes.length === 0 ? (
                  <p className="text-[9.5px] font-pixel text-[#884318] py-4 text-center">Belum ada kuis kustom yang aktif di kelas Anda saat ini.</p>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {classQuizzes.map((quiz) => {
                      const completed = userProgress?.customQuizzes?.[quiz.id];

                      return (
                        <div key={quiz.id} className="p-3 border-2 border-[#361706] rounded-xl bg-[#fff8e7] flex items-center justify-between gap-3 shadow-xs hover:brightness-105 transition text-[#2b1103]">
                          <div>
                            <span className="text-[9.5px] font-pixel text-[#361706] font-bold block leading-tight">{quiz.title}</span>
                            <span className="text-[8px] font-pixel text-[#884318] block mt-1">📝 Soal: {quiz.questions?.length || 0} butir</span>
                          </div>

                          {completed ? (
                            <div className="text-center px-3 py-1 bg-[#86efac] border-2 border-[#166534] rounded-lg min-w-[68px]">
                              <span className="text-[6.5px] font-pixel text-[#14532d] uppercase block font-bold">SELESAI</span>
                              <span className="text-[9.5px] font-pixel text-[#14532d] font-bold mt-0.5 block leading-none">Skor: {completed.score || 0}</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartClassQuiz(quiz)}
                              className="px-3 py-1.5 bg-[#ca7c38] hover:bg-[#df9b52] text-[#2b1103] font-pixel text-[8px] font-bold border-2 border-[#361706] rounded-lg shadow-xs active:translate-y-0.5 cursor-pointer transition flex items-center gap-1"
                            >
                              <span>KERJAKAN</span>
                              <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // VIEW 2: QUIZ RUNNER INTERACTIVE SCREEN
  const qListSize = questionsList.length;
  const accuracyPercentage = qListSize > 0 ? Math.round((correctCount / qListSize) * 100) : 0;

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden flex flex-col justify-between select-none bg-[#74c2e8] p-3 md:p-6 pb-28 text-left">
      {/* Detailed Stardew Valley Background */}
      <PixelValleyBackground overlay="medium" />

      {/* Header HUD (Pixel Wooden Plank) */}
      <div className="w-full p-3 md:p-4 rounded-xl bg-[#fae8b6] border-4 border-[#361706] shadow-[4px_4px_0_#1a0b03] flex items-center justify-between gap-2 z-30 relative mb-4 flex-shrink-0 text-[#2b1103]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              showConfirm("Apakah Anda yakin ingin membatalkan kuis? Seluruh progres saat ini akan hilang.", () => {
                setActiveQuizType(null);
              });
            }}
            className="px-3 py-2 rounded-lg bg-[#ca7c38] hover:bg-[#df9b52] border-2 border-[#361706] text-[#2b1103] font-pixel text-[8px] md:text-[9px] uppercase transition shadow-[2px_2px_0_#2b1103] cursor-pointer flex-shrink-0 active:translate-y-0.5 flex items-center gap-1.5"
            title="Kembali ke Pemilihan Kuis"
          >
            <ChevronLeft className="w-4 h-4 stroke-[3px]" />
            <span>KEMBALI</span>
          </button>
          
          <div>
            <span className="text-[7px] md:text-[8px] font-pixel text-[#884318] uppercase tracking-widest block leading-none">
              {activeQuizType === 'system' ? 'Kuis HOTS Sistem' : 'Kuis Kustom Guru'}
            </span>
            <h2 className="text-[10px] md:text-xs font-pixel text-[#361706] leading-tight mt-1 max-w-[160px] md:max-w-[280px] truncate uppercase">
              {activeQuizType === 'system' ? 'Evaluasi Mandiri' : selectedClassQuiz?.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-[#361706] border-2 border-[#ca7c38] px-3 py-1.5 rounded-lg shadow-xs">
          <Star className="w-3.5 h-3.5 text-[#facc15] fill-[#facc15]" />
          <span className="text-[8px] md:text-[9px] font-pixel text-[#facc15]">
            {activeQuizType === 'system' ? 'SKOR: ' + score : 'BENAR: ' + correctCount}
          </span>
        </div>
      </div>

      {!quizCompleted ? (
        <div className="flex-1 flex flex-col justify-between relative z-10 py-1 space-y-4 max-w-2xl mx-auto w-full">
          
          {/* Question Card */}
          <div className="bg-[#fae8b6] border-4 border-[#361706] rounded-xl p-4 md:p-6 shadow-[5px_5px_0_#1a0b03] flex flex-col gap-3 relative text-[#2b1103]">
            
            {/* Header info */}
            <div className="border-b-2 border-[#361706] pb-2 flex justify-between items-center">
              <div>
                <span className="text-[7.5px] md:text-[8px] font-pixel text-[#884318] uppercase tracking-widest block">
                  {currentQuestion.category || 'Evaluasi Pembelajaran'}
                </span>
                <h1 className="text-[9px] md:text-xs font-pixel text-[#361706] tracking-wide uppercase mt-0.5">
                  SOAL {currentIdx + 1} / {questionsList.length}
                </h1>
              </div>
              <div className="text-[8px] font-pixel text-[#facc15] bg-[#361706] px-2 py-0.5 rounded border border-[#ca7c38]">
                PILIHAN GANDA
              </div>
            </div>

            {/* Question Text */}
            <div className="p-3 bg-[#fff8e7] border-2 border-[#361706] rounded-lg text-xs font-bold text-[#361706] leading-relaxed text-left flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-[#884318] flex-shrink-0 mt-0.5" />
              <p>{currentQuestion.question}</p>
            </div>

            {/* ILLUSTRATION AREA */}
            {activeQuizType === 'system' && (
              <div className="w-full flex justify-center bg-[#fff8e7] border-2 border-[#361706] rounded-lg p-2">
                <QuestionIllustration id={currentQuestion.id} />
              </div>
            )}

            {/* Multiple choices */}
            <div className="flex flex-col gap-2">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedKey === opt.key;
                const isCorrect = opt.key === currentQuestion.answer;
                const isLocked = selectedKey !== null;

                let btnStyle = "bg-[#fff8e7] border-[#361706] hover:bg-[#fae8b6] text-[#361706]";
                
                if (isLocked) {
                  if (isSelected) {
                    btnStyle = isCorrect
                      ? "bg-[#86efac] border-[#166534] text-[#14532d] font-bold"
                      : "bg-[#fca5a5] border-[#991b1b] text-[#7f1d1d] font-bold animate-shake";
                  } else if (isCorrect) {
                    btnStyle = "bg-[#bbf7d0] border-[#166534] text-[#14532d] font-bold";
                  } else {
                    btnStyle = "bg-[#fff8e7]/50 border-[#361706]/40 text-[#361706]/40";
                  }
                }

                return (
                  <button
                    key={opt.key}
                    onClick={() => handleSelectOption(opt.key)}
                    disabled={isLocked}
                    className={`w-full p-2.5 md:p-3 rounded-lg border-2 text-[10px] md:text-xs font-bold text-left shadow-xs cursor-pointer flex items-start gap-2.5 transition active:translate-y-0.5 ${btnStyle}`}
                  >
                    <span className="w-5 h-5 rounded border border-[#361706] flex items-center justify-center flex-shrink-0 font-pixel text-[8px] bg-[#ca7c38] text-[#2b1103]">
                      {opt.key}
                    </span>
                    <p className="flex-1 leading-normal">{opt.text}</p>
                  </button>
                );
              })}
            </div>

            {/* Feedback / Next action */}
            {selectedKey && (
              <div className="space-y-3 border-t-2 border-[#361706]/20 pt-3 animate-scale-up">
                <div className={`p-3 rounded-lg border-2 flex items-start gap-2 text-[10px] ${
                  selectedKey === currentQuestion.answer
                    ? 'bg-[#bbf7d0] border-[#166534] text-[#14532d]'
                    : 'bg-[#fecaca] border-[#991b1b] text-[#7f1d1d]'
                }`}>
                  {selectedKey === currentQuestion.answer ? (
                    <CheckCircle2 className="w-4 h-4 text-[#166534] flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#991b1b] flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <strong className="block font-pixel text-[8px] uppercase">
                      {selectedKey === currentQuestion.answer ? 'BENAR! JAWABAN TEPAT' : 'KURANG TEPAT'}
                    </strong>
                    <p className="mt-0.5">{currentQuestion.explanation || 'Pelajari materi ini kembali di Genopedia.'}</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleNext}
                    className="px-5 py-2.5 rounded-lg border-2 border-[#361706] bg-[#16a34a] hover:bg-[#22c55e] text-white font-pixel text-[8px] md:text-[9px] uppercase shadow-[2px_2px_0_#1a0b03] active:translate-y-0.5 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{currentIdx < questionsList.length - 1 ? 'SOAL BERIKUTNYA' : 'LIHAT HASIL'}</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[3.5px]" />
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      ) : (
        /* Summary / Score screen */
        <div className="flex-1 flex items-center justify-center py-2 relative z-20">
          <div className="p-5 md:p-6 rounded-xl text-center space-y-4 max-w-sm w-full border-4 border-[#361706] bg-[#fae8b6] shadow-[6px_6px_0_#1a0b03] text-[#2b1103] animate-scale-up">
            <div className="w-14 h-14 rounded-lg bg-[#ca7c38] border-2 border-[#361706] p-2 flex items-center justify-center mx-auto shadow-xs text-2xl">
              🏆
            </div>

            <div className="space-y-1">
              <span className="font-pixel text-[8px] text-[#884318] uppercase tracking-widest block">EVALUASI SELESAI</span>
              <h3 className="font-pixel text-xs md:text-sm text-[#361706] uppercase font-bold">
                {activeQuizType === 'system' ? 'HASIL KUIS HOTS' : 'HASIL KUIS KELAS'}
              </h3>
              <p className="text-[9.5px] text-[#543319] leading-relaxed">
                {activeQuizType === 'system'
                  ? 'Kamu telah menyelesaikan pertanyaan evaluasi kognitif teori genetika Mendel dengan sukses!'
                  : 'Kamu telah menyelesaikan kuis tugas kustom dari guru kelas Anda dengan sukses!'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-[#fff8e7] border-2 border-[#361706] p-2.5 rounded-lg">
              <div className="border-r border-[#361706]/30 py-1">
                <span className="block font-pixel text-xs text-[#361706]">{correctCount} / {questionsList.length}</span>
                <span className="block font-pixel text-[7px] text-[#884318] uppercase">BENAR</span>
              </div>
              <div className="py-1">
                <span className="block font-pixel text-xs text-[#16a34a]">
                  {activeQuizType === 'system' ? score : accuracyPercentage + '%'}
                </span>
                <span className="block font-pixel text-[7px] text-[#884318] uppercase">
                  {activeQuizType === 'system' ? 'SKOR AKHIR' : 'NILAI PERSEN'}
                </span>
              </div>
            </div>

            <div className="flex gap-2 justify-center pt-1 border-t border-[#361706]/20">
              <button
                onClick={handleReset}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-[#ca7c38] hover:bg-[#df9b52] border-2 border-[#361706] text-[#2b1103] font-pixel text-[8px] uppercase shadow-xs cursor-pointer flex-1 flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ULANGI</span>
              </button>
              
              <button
                onClick={handleSubmitQuizResults}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-[#16a34a] hover:bg-[#22c55e] text-white border-2 border-[#361706] font-pixel text-[8px] uppercase shadow-xs cursor-pointer flex-1 flex items-center justify-center gap-1 disabled:opacity-50"
              >
                <span>{loading ? 'MENYIMPAN...' : 'SIMPAN'}</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
