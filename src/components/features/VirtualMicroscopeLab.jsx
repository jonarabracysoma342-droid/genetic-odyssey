import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../services/sound';
import confetti from 'canvas-confetti';

// Lazy-load the heavy Three.js 3D viewer to keep initial bundle small
const Microscope3DViewer = lazy(() => import('./Microscope3DViewer').then(m => ({ default: m.Microscope3DViewer })));
import { KakFafaDialogueGuide } from './KakFafaDialogueGuide';
import { LabIntroVisualNovel } from './LabIntroVisualNovel';
import { DigitalLkpdModal } from './DigitalLkpdModal';
import { 
  ArrowLeft, 
  Lightbulb, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Eye, 
  Layers, 
  Sliders, 
  Crosshair, 
  HelpCircle,
  Award,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  Maximize2,
  Box,
  Move,
  ListOrdered,
  ShieldAlert,
  Camera,
  FileText,
  Printer
} from 'lucide-react';

// 5 Curated Specimens with Distinct Micrographs per Magnification (4x, 10x, 40x) & Pure Biological Inheritance
const SPECIMENS = [
  {
    id: 'ercis_biji',
    name: 'Sayatan Biji Ercis (Bulat vs Keriput)',
    badge: 'Biji Ercis',
    category: 'Fenotipe Fisik: Butiran Pati Biji',
    difficulty: 'Normal',
    description: 'Kotiledon biji ercis (Pisum sativum) dengan pewarnaan iodin Lugol. Menampilkan butiran pati amilosa bulat utuh pada varietas dominan (B_) dan butiran pati berlekuk/fissur pada homozigot resesif (bb).',
    bioFact: 'Gen R (Round/Bulat) mengkode enzim percabangan pati SBEI. Mutasi gen ini menyebabkan pati gagal bercabang sehingga biji kehilangan air dan mengerut (wrinkled).',
    idealFocus: { coarse: 55, fine: 45 },
    stainColor: '#3b82f6', // Iodine starch blue
    inheritanceRole: 'Ekspresi Alel Dominan B (Bulat) vs Resesif b (Keriput)',
    inheritanceShort: 'Alel Bulat vs Keriput (Enzim SBEI)',
    inheritanceDetail: 'Butiran pati amilosa kotiledon ini membuktikan bagaimana genotipe menentukan sifat fisik (fenotipe). Alel dominan B menyandikan enzim percabangan pati (SBEI) fungsional yang membentuk butir pati bulat sempurna sehingga biji menyerap air merata (fenotipe Bulat). Pada genotipe homozigot resesif bb, mutasi insersi menyebabkan enzim inaktif sehingga pati gagal bercabang, berfissur/berlekuk, kehilangan air saat matang, dan menghasilkan fenotipe biji keriput (wrinkled).',
    images: {
      4: '/assets/microscope/ercis_biji_4x.jpg',
      10: '/assets/microscope/ercis_biji.jpg',
      40: '/assets/microscope/ercis_biji_40x.jpg'
    },
    imageSrc: '/assets/microscope/ercis_biji.jpg',
    structures: [
      { name: 'Butiran Pati Bulat (Alel B - SBEI Aktif)', x: 35, y: 32, note: 'Amilosa utuh penyusun biji bulat' },
      { name: 'Butiran Pati Keriput (Alel b - Mengerut)', x: 54, y: 46, note: 'Kekurangan amilopektin bercabang' },
      { name: 'Dinding Sel Parenkim Kotiledon', x: 48, y: 70, note: 'Jaringan penyimpan cadangan makanan' }
    ]
  },
  {
    id: 'ercis_bunga',
    name: 'Epidermis Bunga Ercis (Ungu vs Putih)',
    badge: 'Bunga Ercis',
    category: 'Monohibrid: Mahkota Bunga',
    difficulty: 'Normal',
    description: 'Lapisan sel epidermis mahkota bunga ercis (Pisum sativum). Sel varietas dominan (PP/Pp) terisi pigmen antosianin ungu cerah di vakuola, sedangkan varietas putih (pp) memiliki vakuola jernih tanpa pigmen.',
    bioFact: 'Mendel menemukan rasio fenotipe monohibrid 3 Ungu : 1 Putih pada generasi F2. Warna ungu dihasilkan dari sintesis pigmen antosianin oleh faktor transkripsi alel A/P.',
    idealFocus: { coarse: 65, fine: 40 },
    stainColor: '#a855f7', // Anthocyanin purple
    inheritanceRole: 'Pewarisan Monohibrid Warna Antosianin Ungu (P) vs Putih (p)',
    inheritanceShort: 'Monohibrid Rasio 3:1 (Pigmen Antosianin)',
    inheritanceDetail: 'Menjelaskan prinsip pewarisan monohibrid dominan penuh Mendel. Warna ungu mahkota bunga dikendalikan oleh alel dominan P yang mengaktifkan biosintesis pigmen antosianin di dalam vakuola sel epidermis. Pada persilangan monohibrid (Pp × Pp), generasi F2 menghasilkan rasio fenotipe 3 Ungu (genotipe PP atau Pp) : 1 Putih (genotipe pp tanpa pigmen antosianin). Pengamatan seluler ini membuktikan bahwa sifat resesif tidak hilang, melainkan tertutupi oleh sifat dominan.',
    images: {
      4: '/assets/microscope/ercis_bunga_4x.jpg',
      10: '/assets/microscope/ercis_bunga.jpg',
      40: '/assets/microscope/ercis_bunga_40x.jpg'
    },
    imageSrc: '/assets/microscope/ercis_bunga.jpg',
    structures: [
      { name: 'Vakuola Antosianin Ungu (Alel P Dominan)', x: 32, y: 35, note: 'Pigmen flavonoid penentu bunga ungu' },
      { name: 'Vakuola Jernih (Alel p Resesif)', x: 70, y: 28, note: 'Vakuola jernih tanpa pigmen antosianin' },
      { name: 'Dinding Sel Epidermis Bergelombang', x: 52, y: 55, note: 'Batas sel epidermis mahkota bunga' }
    ]
  },
  {
    id: 'ercis_serbuk_sari',
    name: 'Serbuk Sari Ercis (Haploid n - Segregasi)',
    badge: 'Gamet Polen',
    category: 'Hukum Segregasi: Sel Gamet',
    difficulty: 'Menengah',
    description: 'Butir serbuk sari (pollen grains) antera bunga. Sel kelamin jantan ini bersifat haploid (n) dan membawa tepat satu alel dari setiap pasangan gen sesuai Hukum Segregasi Mendel.',
    bioFact: 'Pada Hukum Segregasi (Hukum Mendel I), pasangan alel diploid dipisahkan saat meiosis sehingga setiap butir serbuk sari hanya mewarisi satu alel (misal alel B atau b).',
    idealFocus: { coarse: 48, fine: 58 },
    stainColor: '#eab308', // Pollen golden amber
    inheritanceRole: 'Segregasi Bebas Pasangan Alel ke Sel Gamet Haploid (n)',
    inheritanceShort: 'Hukum Segregasi I (Pemisahan Alel Bebas)',
    inheritanceDetail: 'Membuktikan Hukum Segregasi Mendel (Hukum Mendel I) pada tingkat sel gamet. Tanaman induk bersifat diploid (2n) memiliki pasangan alel berpasangan, namun saat mikrosporogenesis (meiosis), pasangan alel tersebut dipisahkan secara bebas ke dalam butir-butir serbuk sari haploid (n). Setiap butir serbuk sari hanya membawa tepat satu alel tunggal (misal hanya alel B atau hanya b) untuk diwariskan ke generasi berikutnya.',
    images: {
      4: '/assets/microscope/ercis_serbuk_sari_4x.jpg',
      10: '/assets/microscope/ercis_serbuk_sari.jpg',
      40: '/assets/microscope/ercis_serbuk_sari_40x.jpg'
    },
    imageSrc: '/assets/microscope/ercis_serbuk_sari.jpg',
    structures: [
      { name: 'Dinding Eksin Berornamen/Berduri', x: 55, y: 25, note: 'Lapisan sporopolenin pelindung pollen' },
      { name: 'Inti Gamet Polen (Haploid n)', x: 50, y: 50, note: 'Membawa 1 alel tunggal (B atau b)' },
      { name: 'Pori Perkecambahan (Apertur)', x: 32, y: 65, note: 'Tempat keluarnya buluh serbuk sari' }
    ]
  },
  {
    id: 'meiosis',
    name: 'Pembelahan Meiosis (Metafase I - Asortasi)',
    badge: 'Kromosom Tetrad',
    category: 'Hukum Asortasi: Meiosis Metafase I',
    difficulty: 'Menengah',
    description: 'Sel induk sporogen antera pada tahap Metafase I Meiosis. Pasangan kromosom homolog (Tetrad) berjejer bebas di pelat ekuator, memperlihatkan peristiwa pindah silang dan pengelompokan bebas.',
    bioFact: 'Penjajaran acak pasangan kromosom homolog pada bidang ekuator meiosis adalah mekanisme seluler di balik Hukum Asortasi Bebas (rasio 9:3:3:1 pada dihibrid).',
    idealFocus: { coarse: 60, fine: 48 },
    stainColor: '#ec4899', // Acetocarmine pink
    inheritanceRole: 'Asortasi Bebas Kromosom Homolog Penentu Rasio 9:3:3:1',
    inheritanceShort: 'Hukum Asortasi II (Rasio Dihibrid 9:3:3:1)',
    inheritanceDetail: 'Memperlihatkan dasar seluler dari Hukum Asortasi Bebas (Hukum Mendel II). Pada tahap Metafase I meiosis, pasangan-pasangan kromosom homolog (tetrad) berjejer secara acak dan bebas di sepanjang bidang ekuator spindel. Penjajaran mandiri dua pasang gen pada kromosom berbeda inilah yang memungkinkan terbentuknya 4 kombinasi gamet (AB, Ab, aB, ab) dan menghasilkan rasio fenotipe klasik 9:3:3:1 pada persilangan dihibrid.',
    images: {
      4: '/assets/microscope/meiosis_4x.jpg',
      10: '/assets/microscope/meiosis.jpg',
      40: '/assets/microscope/meiosis_40x.jpg'
    },
    imageSrc: '/assets/microscope/meiosis.jpg',
    structures: [
      { name: 'Kromosom Homolog Tetrad (Metafase I)', x: 50, y: 48, note: 'Pasangan kromosom berjajar di ekuator' },
      { name: 'Gelendong Spindel Pembelahan', x: 32, y: 40, note: 'Mikrotubulus penarik kinetokor' },
      { name: 'Sitoplasma Sel Induk Gamet', x: 68, y: 58, note: 'Cairan sel tempat organel berada' }
    ]
  },
  {
    id: 'sickle_cell',
    name: 'Mutasi Sel Darah (Anemia Sel Sabit)',
    badge: 'Mutasi Sel Darah',
    category: 'Mutasi Genetik: Rantai Hemoglobin',
    difficulty: 'Tinggi',
    description: 'Apusan darah tepi pasien anemia sel sabit (HbS). Menampilkan eritrosit normal bikonkaf bercampur dengan eritrosit berbentuk bulan sabit rapuh akibat mutasi titik rantai beta-globin.',
    bioFact: 'Mutasi terjadi akibat substitusi satu basa nitrogen (GAG -> GTG) yang mengubah asam amino glutamat menjadi valin. Dipelajari untuk mengevaluasi dampak mutasi genetik.',
    idealFocus: { coarse: 72, fine: 35 },
    stainColor: '#ef4444', // Wright-Giemsa blood red
    inheritanceRole: 'Dampak Mutasi Titik DNA terhadap Bentuk Sel & Fenotipe',
    inheritanceShort: 'Mutasi DNA (Substitusi Basa GAG -> GTG)',
    inheritanceDetail: 'Menunjukkan dampak nyata perubahan materi genetik (mutasi titik DNA) terhadap pewarisan sifat dan fungsi organ. Substitusi tunggal basa nitrogen adenin menjadi timin (GAG → GTG) mengkode asam amino valin menggantikan glutamat pada rantai beta-globin hemoglobin. Hal ini menyebabkan molekul hemoglobin terpolimerisasi saat deoksigenasi, mendistorsi eritrosit menjadi bentuk sabit yang kaku, mudah pecah, dan memicu anemia sel sabit.',
    images: {
      4: '/assets/microscope/sickle_cell_4x.jpg',
      10: '/assets/microscope/sickle_cell.jpg',
      40: '/assets/microscope/sickle_cell_40x.jpg'
    },
    imageSrc: '/assets/microscope/sickle_cell.jpg',
    structures: [
      { name: 'Eritrosit Bikonkaf Normal (HbA)', x: 38, y: 40, note: 'Bentuk cakram lentur pengangkut O2' },
      { name: 'Eritrosit Bulan Sabit Mutan (HbS)', x: 62, y: 52, note: 'Kaku, rapuh, menyumbat kapiler' },
      { name: 'Plasma Darah & Trombosit', x: 50, y: 70, note: 'Medium cairan darah tepi' }
    ]
  }
];

export const VirtualMicroscopeLab = () => {
  const { navigateTo } = useGame();

  // Active state
  const [selectedSpecimen, setSelectedSpecimen] = useState(SPECIMENS[0]);
  const [lightPower, setLightPower] = useState(true);
  const [diaphragm, setDiaphragm] = useState(75); // 0 - 100%
  const [objectiveLens, setObjectiveLens] = useState(10); // 4, 10, 40
  const [coarseFocus, setCoarseFocus] = useState(25); // 0 - 100 (Makrometer)
  const [fineFocus, setFineFocus] = useState(15); // 0 - 100 (Mikrometer)
  const [stagePosX, setStagePosX] = useState(0); // -40 to 40
  const [stagePosY, setStagePosY] = useState(0); // -40 to 40
  const [showReticle, setShowReticle] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [showEyepieceView, setShowEyepieceView] = useState(false);
  const [activeTab, setActiveTab] = useState('microscope'); // 'microscope' | 'sop' | 'anatomy' | 'model3d'
  const [infoTab, setInfoTab] = useState('bio'); // 'bio' | 'stage' | 'focus'
  const [completedChecklist, setCompletedChecklist] = useState({
    light: false,
    slide: false,
    coarse: false,
    fine: false,
    allSpecimens: false
  });
  const [observedSpecimens, setObservedSpecimens] = useState(new Set([SPECIMENS[0].id]));

  // Audio & focus tracking refs to eliminate infinite repeating sound loops
  const soundedSpecimensRef = useRef(new Set());
  const prevOptimalRef = useRef(false);
  const lastSoundTimeRef = useRef(0);

  // SOP 40x safety violation alert state
  const [coarseWarning40x, setCoarseWarning40x] = useState(false);
  const warningTimeoutRef = useRef(null);

  // Interactive Kak Fafa Dialogue Guide & Collapsible Specimen Rack State
  const [showFafaGuide, setShowFafaGuide] = useState(true);
  const [isRackCollapsed, setIsRackCollapsed] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
  const [mobileControlTab, setMobileControlTab] = useState('macro'); // 'macro' | 'micro' | 'stage'
  const [isControlsMinimized, setIsControlsMinimized] = useState(false);
  const [showLabIntro, setShowLabIntro] = useState(true);

  const handleLabIntroFinish = useCallback(() => {
    setShowLabIntro(false);
  }, []);

  // LKPD & Captured Photos State
  const [capturedPhotos, setCapturedPhotos] = useState({});
  const [showLkpdModal, setShowLkpdModal] = useState(false);
  const [photoFlash, setPhotoFlash] = useState(false);
  const [photoToast, setPhotoToast] = useState(null);

  const handleCapturePhoto = () => {
    if (!lightPower) {
      sound.playWrong();
      setPhotoToast({ type: 'error', message: '⚠️ Nyalakan lampu LED mikroskop sebelum memotret!' });
      setTimeout(() => setPhotoToast(null), 3000);
      return;
    }
    if (focusScore < 75) {
      sound.playWrong();
      setPhotoToast({ type: 'error', message: '⚠️ Gambar masih buram! Putar mikrometer hingga fokus minimal 80% sebelum difoto.' });
      setTimeout(() => setPhotoToast(null), 3000);
      return;
    }

    sound.playClick();
    try { sound.playFanfare(); } catch(e){}

    setPhotoFlash(true);
    setTimeout(() => setPhotoFlash(false), 250);

    const newPhoto = {
      id: selectedSpecimen.id,
      name: selectedSpecimen.name,
      badge: selectedSpecimen.badge,
      image: selectedSpecimen.images?.[objectiveLens] || selectedSpecimen.imageSrc,
      lens: objectiveLens,
      totalMag: totalMagnification,
      focusScore: focusScore,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: selectedSpecimen.category
    };

    setCapturedPhotos(prev => ({
      ...prev,
      [selectedSpecimen.id]: newPhoto
    }));

    const count = Object.keys(capturedPhotos).includes(selectedSpecimen.id) 
      ? Object.keys(capturedPhotos).length 
      : Object.keys(capturedPhotos).length + 1;

    setPhotoToast({
      type: 'success',
      message: `📸 Foto ${selectedSpecimen.badge} (${totalMagnification}x) berhasil disimpan ke LKPD! (${count}/5 Spesimen)`
    });
    setTimeout(() => setPhotoToast(null), 3500);
  };

  const triggerCoarseWarning = () => {
    sound.playWrong();
    setCoarseWarning40x(true);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    warningTimeoutRef.current = setTimeout(() => {
      setCoarseWarning40x(false);
    }, 4500);
  };

  // Depth of field tolerance:
  // 4x objective has wider depth of field (3.5), 10x is balanced (2.0), 40x requires high precision (1.0)
  const depthTolerance = objectiveLens === 4 ? 3.5 : objectiveLens === 10 ? 2.0 : 1.0;
  const coarseDistance = Math.abs(coarseFocus - selectedSpecimen.idealFocus.coarse);
  const fineDistance = Math.abs(fineFocus - selectedSpecimen.idealFocus.fine);
  
  // Combined focal distance: makrometer is coarse vertical, mikrometer is fine vertical
  const combinedDistance = (coarseDistance * 0.65) + (fineDistance * 0.35);
  
  // Strict optical focus:
  // Inside tolerance -> exactly 0px blur and exactly 100% crystal focus
  // Outside tolerance -> blur increases progressively, score accurately reflects percentage
  const isOptimalFocus = combinedDistance <= depthTolerance;
  const blurAmount = isOptimalFocus 
    ? 0 
    : Math.min(22, (combinedDistance - depthTolerance) * 0.6);
  
  const focusScore = isOptimalFocus 
    ? 100 
    : Math.max(5, Math.min(99, Math.round(100 - ((combinedDistance - depthTolerance) * 4.2))));

  // ================= PROSEDUR PENGGUNAAN MIKROSKOP BERTAHAP (SOP) =================
  const isStep1Done = Boolean(selectedSpecimen && lightPower && diaphragm >= 40 && (objectiveLens === 4 || objectiveLens === 10));
  const isStageCentered = Math.abs(stagePosX) <= 15 && Math.abs(stagePosY) <= 15;
  const isStep2Done = Boolean(selectedSpecimen && isStageCentered);
  const isStep3Done = Boolean(isOptimalFocus && focusScore === 100);
  const isStep4Done = Boolean(objectiveLens === 40 && isOptimalFocus && focusScore === 100);

  const completedStepsCount = (isStep1Done ? 1 : 0) + (isStep2Done ? 1 : 0) + (isStep3Done ? 1 : 0) + (isStep4Done ? 1 : 0);
  const defaultActiveStep = !isStep1Done ? 1 : !isStep2Done ? 2 : !isStep3Done ? 3 : !isStep4Done ? 4 : 4;
  const [inspectedStep, setInspectedStep] = useState(null);
  const currentStepView = inspectedStep || defaultActiveStep;

  const SOP_STEPS = [
    {
      step: 1,
      title: 'Persiapan awal & Cahaya',
      shortDesc: 'Siapkan preparat, hidupkan lampu LED, atur diafragma & pilih lensa 4x/10x.',
      bullets: [
        'Siapkan preparat yang akan diamati.',
        'Hidupkan lampu mikroskop (atau atur cermin jika mikroskop konvensional).',
        'Atur diafragma dan klik lensa objektif perbesaran paling lemah (biasanya 4x atau 10x) menggunakan revolver sampai bunyi klik. Ini penting untuk membuka bidang pandang yang luas di awal.'
      ],
      isCompleted: isStep1Done,
      liveStatus: !selectedSpecimen 
        ? 'Pilih preparat di rak' 
        : !lightPower 
          ? 'Saklar Lampu OFF' 
          : diaphragm < 40 
            ? `Diafragma redup (${diaphragm}%)` 
            : objectiveLens > 10 
              ? `Lensa ${objectiveLens}x (Harus 4x/10x)` 
              : 'SOP Langkah 1 Terpenuhi ✓',
      actionHint: 'Pilih preparat di rak atas, klik saklar LED ke ON, atur diafragma (≥40%), dan pasang lensa objektif 4x atau 10x pada revolver.'
    },
    {
      step: 2,
      title: 'Penempatan Preparat',
      shortDesc: 'Letakkan preparat di meja kerja, jepit aman, dan geser meja ke tengah lensa.',
      bullets: [
        'Letakkan preparat di atas meja kerja (meja preparat) dan jepit dengan aman.',
        'Geser meja kerja (menggunakan sekrup penggeser) agar posisi objek pas berada di tengah bawah lensa objektif.'
      ],
      isCompleted: isStep2Done,
      liveStatus: isStageCentered 
        ? 'Objek tepat di tengah meja kerja ✓' 
        : `Posisi (${stagePosX}, ${stagePosY}) - Geser mendekati pusat`,
      actionHint: 'Preparat telah dijepit pada meja. Gunakan tombol sekrup penggeser Meja Objek (◀ ▲ ▶ ▼) atau klik tombol "Tengah" agar objek preparat berada tepat di tengah bawah lensa.'
    },
    {
      step: 3,
      title: 'Fokus dan Pengamatan',
      shortDesc: 'Makrometer kasar dilihat dari samping hingga bayangan tampak, lalu mikrometer halus.',
      bullets: [
        'Naikkan meja kerja menggunakan makrometer (pemutar kasar) sambil dilihat dari samping (jangan dari lensa okuler) hingga posisi paling atas atau mendekati lensa. Langkah ini untuk memastikan lensa tidak menabrak preparat.',
        'Intip melalui lensa okuler, lalu turunkan meja kerja perlahan menggunakan makrometer sampai bayangan objek mulai terlihat.',
        'Gunakan mikrometer (pemutar halus) untuk memperjelas dan menajamkan fokus objek pengamatan.'
      ],
      isCompleted: isStep3Done,
      liveStatus: isStep3Done 
        ? 'Fokus Kristal 100% Tercapai ✓' 
        : `Ketajaman: ${focusScore}% (Makro ~${selectedSpecimen.idealFocus.coarse}%, Mikro ~${selectedSpecimen.idealFocus.fine}%)`,
      actionHint: `Naikkan makrometer mendekati target ~${selectedSpecimen.idealFocus.coarse}% hingga bayangan sel mulai tampak, lalu intip okuler dan putar mikrometer halus mendekati ~${selectedSpecimen.idealFocus.fine}% hingga mencapai 100% kristal!`
    },
    {
      step: 4,
      title: 'Perbesaran Lebih Kuat (Opsional)',
      shortDesc: 'Putar revolver ke 40x dan cukup gunakan mikrometer saja untuk menajamkan.',
      bullets: [
        'Jika ingin melihat lebih dekat, putar revolver ke perbesaran lensa objektif yang lebih tinggi (misal 40x).',
        'Cukup gunakan mikrometer saja untuk menajamkan gambar (jangan gunakan makrometer lagi pada perbesaran tinggi).'
      ],
      isCompleted: isStep4Done,
      liveStatus: objectiveLens !== 40 
        ? `Lensa saat ini ${objectiveLens}x (Klik 40x jika ingin perbesaran kuat)` 
        : isOptimalFocus 
          ? 'Ultrastruktur 40x Tajam 100% ✓' 
          : `Lensa 40x aktif (${focusScore}%). Putar mikrometer halus saja!`,
      actionHint: 'Putar revolver ke lensa 40x untuk pengamatan ultrastruktur. PENTING: Gunakan HANYA mikrometer (pemutar halus) untuk menajamkan fokus. Jangan gunakan makrometer lagi agar lensa tidak menabrak preparat.'
    }
  ];

  // Track checklist progress (state updates only, NO sound played here)
  useEffect(() => {
    setCompletedChecklist(prev => {
      const next = { ...prev };
      if (lightPower && diaphragm >= 40) next.light = true;
      if (coarseDistance < 15) next.coarse = true;
      if (isOptimalFocus) {
        next.fine = true;
        next.slide = true;
      }
      if (observedSpecimens.size === SPECIMENS.length && isOptimalFocus) {
        next.allSpecimens = true;
      }
      return next;
    });

    if (isOptimalFocus) {
      setObservedSpecimens(prev => new Set([...prev, selectedSpecimen.id]));
    }
  }, [isOptimalFocus, lightPower, diaphragm, coarseDistance, selectedSpecimen.id, observedSpecimens.size]);

  // Audio trigger: ONLY play ONCE on rising edge (0 -> 100%) per specimen, never loops or repeats!
  useEffect(() => {
    if (isOptimalFocus && !prevOptimalRef.current) {
      const now = Date.now();
      // Ensure sound only plays once for this specimen, with a minimum 3.5s cooldown guard
      if (!soundedSpecimensRef.current.has(selectedSpecimen.id) && (now - lastSoundTimeRef.current > 3500)) {
        sound.playCorrect();
        soundedSpecimensRef.current.add(selectedSpecimen.id);
        lastSoundTimeRef.current = now;
      }
    }
    prevOptimalRef.current = isOptimalFocus;
  }, [isOptimalFocus, selectedSpecimen.id]);

  // Handle lens rotation with sound
  const handleLensChange = (magnification) => {
    sound.playClick();
    setObjectiveLens(magnification);
  };

  // Turn knob helper (Makrometer - with strict 40x safety guard)
  const adjustCoarse = (delta) => {
    if (objectiveLens === 40) {
      triggerCoarseWarning();
      return;
    }
    sound.playClick();
    setCoarseFocus(prev => Math.max(0, Math.min(100, prev + delta)));
  };

  const adjustFine = (delta) => {
    sound.playClick();
    setFineFocus(prev => Math.max(0, Math.min(100, prev + delta)));
  };

  // Stage translation helpers (Meja Objek & Kaca Preparat geser Kiri/Kanan & Maju/Mundur)
  const adjustStageX = (delta) => {
    sound.playClick();
    setStagePosX(prev => Math.max(-40, Math.min(40, prev + delta)));
  };

  const adjustStageY = (delta) => {
    sound.playClick();
    setStagePosY(prev => Math.max(-40, Math.min(40, prev + delta)));
  };

  const centerStage = () => {
    sound.playClick();
    setStagePosX(0);
    setStagePosY(0);
  };

  // Specimen selection
  const handleSelectSpecimen = (specimen) => {
    sound.playClick();
    setSelectedSpecimen(specimen);
    // Reset focus slightly so user has to refocus
    setCoarseFocus(Math.max(5, specimen.idealFocus.coarse - 25));
    setFineFocus(20);
    setStagePosX(0);
    setStagePosY(0);
    prevOptimalRef.current = false;
  };

  const handleConfetti = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Total calculated magnification: Eyepiece (10x) * Objective
  const totalMagnification = 10 * objectiveLens;

  // Render full visual novel intro with Kak Fafa upon entering lab
  if (showLabIntro) {
    return <LabIntroVisualNovel onFinish={handleLabIntroFinish} />;
  }

  return (
    <div className="w-full h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans select-none">
      
      {/* ================= TOP NAVIGATION BAR ================= */}
      <header className="shrink-0 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-2 sm:px-4 md:px-8 py-2 flex items-center justify-between z-30 shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { sound.playClick(); navigateTo('main-menu'); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-[#facc15] border border-slate-700 rounded-lg text-xs font-pixel uppercase transition cursor-pointer"
            title="Kembali ke Menu Utama"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">KEMBALI KE MENU</span>
            <span className="sm:hidden text-[10px]">MENU</span>
          </button>

          <div className="hidden md:block border-l border-slate-700 pl-3">
            <h1 className="text-sm md:text-base font-bold text-white tracking-wide flex items-center gap-2">
              <span>LABORATORIUM MIKROSKOP SITOGENETIKA 3D</span>
              <span className="text-[10px] font-pixel px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
                SIMULATOR REAL-TIME
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Pengamatan Struktur Sel, Kromosom, &amp; Mutasi Genetika</p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 sm:p-1 border border-slate-700 rounded-lg">
          <button
            onClick={() => { sound.playClick(); setActiveTab('microscope'); }}
            className={`px-2 sm:px-3 py-1 rounded text-[11px] sm:text-xs font-medium transition cursor-pointer flex items-center gap-1 sm:gap-1.5 ${
              activeTab === 'microscope' ? 'bg-[#ca7c38] text-slate-950 font-bold shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Mikroskop</span>
            <span className="sm:hidden">Lab</span>
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveTab('sop'); }}
            className={`px-2 sm:px-3 py-1 rounded text-[11px] sm:text-xs font-medium transition cursor-pointer flex items-center gap-1 sm:gap-1.5 ${
              activeTab === 'sop' ? 'bg-[#ca7c38] text-slate-950 font-bold shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Panduan SOP</span>
            <span className="sm:hidden">SOP</span>
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveTab('model3d'); }}
            className={`px-2 sm:px-3 py-1 rounded text-[11px] sm:text-xs font-medium transition cursor-pointer flex items-center gap-1 sm:gap-1.5 ${
              activeTab === 'model3d' ? 'bg-[#ca7c38] text-slate-950 font-bold shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Box className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Model 3D</span>
            <span className="sm:hidden">3D</span>
          </button>
          <button
            onClick={() => { sound.playClick(); setShowLabIntro(true); }}
            className="px-2 sm:px-2.5 py-1 rounded text-[11px] sm:text-xs font-medium transition cursor-pointer flex items-center gap-1 bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-amber-500/30"
            title="Tonton Ulang Video Cerita &amp; Panduan Intro Kak Fafa"
          >
            <span className="text-xs leading-none">🎬</span>
            <span className="hidden sm:inline font-pixel text-[10px]">Intro</span>
          </button>
          <button
            onClick={() => { sound.playClick(); setShowLkpdModal(true); }}
            className="px-2 sm:px-3 py-1 rounded text-[11px] sm:text-xs font-bold transition cursor-pointer flex items-center gap-1 bg-emerald-600/90 hover:bg-emerald-500 text-white border border-emerald-400 shadow-md active:scale-95"
            title="Buka Lembar Kerja Peserta Didik (LKPD) Digital"
          >
            <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-200" />
            <span className="font-pixel text-[10px]">LKPD ({Object.keys(capturedPhotos).length}/5)</span>
          </button>
          <div className="w-px h-3.5 bg-slate-700 mx-0.5" />
          <button
            onClick={() => { 
              sound.playClick(); 
              setIsRackCollapsed(prev => !prev);
            }}
            className={`px-2 sm:px-2.5 py-1 rounded text-[11px] sm:text-xs font-medium transition cursor-pointer flex items-center gap-1 border ${
              !isRackCollapsed 
                ? 'bg-emerald-600/90 text-white font-bold border-emerald-400 shadow-sm' 
                : 'bg-slate-900/60 text-slate-300 hover:text-emerald-300 border-slate-700'
            }`}
            title={isRackCollapsed ? "Buka Rak Preparat & Panduan Kak Fafa [▶]" : "Kecilkan Rak Preparat ke Kiri [◀]"}
          >
            <span className="text-xs leading-none">👩‍🔬</span>
            <span className="font-pixel text-[10px]">
              {!isRackCollapsed ? 'Tutup' : 'Rak'}
            </span>
          </button>
        </div>
      </header>

      {/* ================= MAIN INTERACTIVE WORKSPACE (FULL 3D LAB WITH PORTRAIT RACK & BOTTOM-RIGHT CONTROLS) ================= */}
      {activeTab === 'microscope' && (
      <div className="flex-1 min-h-0 w-full flex flex-row overflow-hidden relative">

        {/* Mobile Backdrop Overlay (Clicking outside closes drawer on mobile) */}
        {!isRackCollapsed && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-35 lg:hidden"
            onClick={() => setIsRackCollapsed(true)}
          />
        )}

        {/* ================= 1. LEFT COLUMN: RAK KACA PREPARAT POTRET & PANDUAN KAK FAFA ================= */}
        <aside className={`h-full bg-slate-900/98 lg:bg-slate-900/95 border-r border-slate-800 flex flex-col justify-between shrink-0 z-40 shadow-2xl transition-all duration-300 ease-in-out fixed inset-y-0 left-0 w-[85%] max-w-[320px] lg:relative lg:inset-auto lg:h-full ${
          isRackCollapsed 
            ? '-translate-x-full lg:translate-x-0 lg:w-0 lg:p-0 lg:overflow-hidden lg:opacity-0 lg:pointer-events-none lg:border-none' 
            : 'translate-x-0 lg:w-72 xl:w-80 p-3 sm:p-4 opacity-100 overflow-y-auto'
        }`}>
          
          <div className="flex flex-col gap-3">
            {/* Header: Rak Preparat */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#facc15]" />
                <span className="text-xs font-pixel text-slate-200 uppercase tracking-wider">
                  Rak Preparat
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{observedSpecimens.size}/{SPECIMENS.length}</span>
                </span>
                <button
                  onClick={() => { sound.playClick(); setIsRackCollapsed(true); }}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-amber-300 transition cursor-pointer flex items-center gap-0.5"
                  title="Tutup / Perkecil Rak Preparat"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="lg:hidden text-[10px] font-pixel">Tutup</span>
                </button>
              </div>
            </div>

            {/* 5 Glass Slide Cards in Vertical/Portrait Stack */}
            <div className="flex flex-col gap-2">
              {SPECIMENS.map(specimen => {
                const isSelected = selectedSpecimen.id === specimen.id;
                const isObserved = observedSpecimens.has(specimen.id);

                return (
                  <button
                    key={specimen.id}
                    onClick={() => handleSelectSpecimen(specimen)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative group flex items-center gap-3 ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#3a1d08] to-[#1c0f05] border-[#f59e0b] text-white shadow-xl ring-2 ring-[#f59e0b]/50'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/80'
                    }`}
                  >
                    {/* Realistic Mini Glass Slide Frame */}
                    <div className="w-12 h-14 rounded-lg overflow-hidden border border-slate-700/80 bg-black shrink-0 relative shadow-inner">
                      <img 
                        src={specimen.images?.[10] || specimen.imageSrc} 
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200" 
                      />
                      <div className="absolute inset-0 border border-white/20 rounded-lg pointer-events-none" />
                      <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[7px] font-pixel text-center py-0.5 text-amber-300">
                        10x
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`text-[8px] font-pixel px-1.5 py-0.5 rounded border truncate ${
                          isSelected ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {specimen.badge}
                        </span>
                        {isObserved ? (
                          <span className="text-[8px] font-bold text-emerald-400 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          </span>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-700" />
                        )}
                      </div>

                      <div className="text-[11px] font-bold leading-snug line-clamp-1 group-hover:text-amber-300 transition-colors">
                        {specimen.name.replace(/\(.*?\)/, '')}
                      </div>
                      <div className="text-[9px] font-mono text-emerald-400/90 line-clamp-1 mt-0.5">
                        🧬 {specimen.inheritanceShort}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom of Left Column: Panduan Interaktif Kak Fafa Menggantikan SOP Statis */}
          <KakFafaDialogueGuide
            docked={true}
            currentStep={currentStepView}
            selectedSpecimen={selectedSpecimen}
            lightPower={lightPower}
            objectiveLens={objectiveLens}
            stagePosX={stagePosX}
            stagePosY={stagePosY}
            isStageCentered={isStageCentered}
            coarseFocus={coarseFocus}
            fineFocus={fineFocus}
            focusScore={focusScore}
            isOptimalFocus={isOptimalFocus}
            showEyepieceView={showEyepieceView}
            onOpenEyepiece={() => { sound.playClick(); setShowEyepieceView(true); }}
            onViewAllSop={() => { sound.playClick(); setActiveTab('sop'); }}
            onCloseRack={() => setIsRackCollapsed(true)}
            onReplayIntro={() => setShowLabIntro(true)}
            capturedPhotos={capturedPhotos}
            onOpenLkpd={() => setShowLkpdModal(true)}
            isOpen={true}
          />

        </aside>

        {/* ================= 2. MAIN WORKSPACE: MIKROSKOP 3D UTAMA (HERO VIEWPORT) ================= */}
        <main className="flex-1 min-h-0 min-w-0 relative w-full h-full bg-[radial-gradient(ellipse_at_45%_45%,_var(--tw-gradient-stops))] from-slate-800/80 via-[#0a1224] to-[#03060e] overflow-hidden">

          {/* Floating Expand Tab when Rak Preparat is Collapsed */}
          {isRackCollapsed && (
            <button
              onClick={() => { sound.playClick(); setIsRackCollapsed(false); }}
              className="absolute left-0 top-14 sm:top-16 z-25 bg-slate-900/95 hover:bg-slate-800 text-amber-300 border-r-2 border-y-2 border-amber-500/60 pl-2 pr-3 py-1.5 sm:py-2 rounded-r-2xl shadow-2xl flex items-center gap-1.5 sm:gap-2 cursor-pointer transition hover:scale-105 active:scale-95 group backdrop-blur-md animate-in fade-in slide-in-from-left duration-200"
              title="Buka Rak Preparat & Panduan Kak Fafa [▶]"
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-emerald-400 overflow-hidden bg-slate-950 shrink-0">
                <img src="/assets/kak_fafa_sprite.png" alt="Kak Fafa" className="w-full h-full object-cover object-top" />
              </div>
              <div className="flex items-center gap-1">
                <ChevronRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition" />
                <span className="text-[9px] sm:text-[10px] font-pixel text-slate-200">Rak &amp; Kak Fafa</span>
              </div>
            </button>
          )}

          {/* Top-Left Status Bar Overlay: Current Active Specimen, Magnification & Quick Peek */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 flex flex-wrap items-center gap-1.5 sm:gap-2 max-w-[calc(100vw-85px)] sm:max-w-none">
            <div className="bg-slate-900/90 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 border border-slate-700/80 rounded-xl text-[10px] sm:text-xs text-slate-200 font-mono shadow-xl flex items-center gap-1.5 pointer-events-none truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="truncate">Spesimen: <strong className="text-amber-300">{selectedSpecimen.badge}</strong></span>
              <span className="text-slate-600">|</span>
              <span className="shrink-0"><strong className="text-sky-300">{totalMagnification}x</strong></span>
            </div>

            {/* Optimal Focus Badge Overlay (ONLY appears when focus is truly 100% crystal sharp) */}
            {isOptimalFocus && focusScore === 100 && (
              <div className="bg-emerald-500/95 text-slate-950 font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs flex items-center gap-1 shadow-xl animate-bounce pointer-events-none shrink-0">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>FOKUS 100%!</span>
              </div>
            )}

            {!showEyepieceView && (
              <button
                onClick={() => {
                  sound.playClick();
                  setShowEyepieceView(true);
                }}
                className="bg-sky-500/20 hover:bg-sky-500/35 text-sky-200 hover:text-white border border-sky-400/50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-pixel shadow-xl backdrop-blur-md flex items-center gap-1 cursor-pointer transition hover:scale-105 active:scale-95 animate-pulse shrink-0"
                title="Klik untuk membuka bidang pandang lensa okuler"
              >
                <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400" />
                <span>INTIP OKULER</span>
              </button>
            )}
          </div>

          {/* SOP 40x Safety Warning Alert Toast */}
          {coarseWarning40x && (
            <div className="absolute top-12 sm:top-14 left-2 right-2 sm:left-1/2 sm:-translate-x-1/2 z-40 max-w-lg bg-rose-950/95 border-2 border-rose-500 text-rose-100 p-2.5 sm:p-3.5 rounded-2xl text-[10px] sm:text-xs flex items-center justify-between shadow-2xl animate-shake backdrop-blur-md">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-rose-200 font-pixel">PERINGATAN ATURAN SOP MIKROSKOP:</div>
                  <div className="text-[11px] text-rose-300 leading-relaxed mt-0.5">
                    <strong>Dilarang memutar makrometer (pemutar kasar) pada perbesaran 40x!</strong> Lensa objektif panjang berjarak sangat dekat dengan kaca penutup (&lt;0.5 mm) dan berisiko menabrak atau meremukkannya. <strong>Cukup gunakan mikrometer (pemutar halus) saja.</strong>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setCoarseWarning40x(false)}
                className="px-2.5 py-1 bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-bold rounded cursor-pointer ml-3 shrink-0"
              >
                Paham [✕]
              </button>
            </div>
          )}

          {/* 3D Microscope Canvas (Fills whole hero space) */}
          <div className="absolute inset-0 z-0">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Box className="w-10 h-10 text-[#facc15] mx-auto animate-pulse" />
                  <p className="text-xs font-pixel text-slate-400 uppercase tracking-wider">Memuat Mikroskop 3D Interaktif...</p>
                </div>
              </div>
            }>
              <Microscope3DViewer
                className="w-full h-full"
                compact={true}
                showEyepieceView={showEyepieceView}
                coarseFocus={coarseFocus}
                fineFocus={fineFocus}
                lightPower={lightPower}
                diaphragm={diaphragm}
                objectiveLens={objectiveLens}
                stagePosX={stagePosX}
                stagePosY={stagePosY}
                specimenColor={selectedSpecimen?.stainColor || '#ec4899'}
                specimenName={selectedSpecimen?.name}
                onLensChange={handleLensChange}
                onAdjustCoarse={adjustCoarse}
                onAdjustFine={adjustFine}
                onAdjustStageX={adjustStageX}
                onAdjustStageY={adjustStageY}
                onCenterStage={centerStage}
                onToggleLight={() => { sound.playClick(); setLightPower(prev => !prev); }}
                onAdjustDiaphragm={(delta) => { sound.playClick(); setDiaphragm(prev => Math.min(100, Math.max(20, (prev + delta) % 110))); }}
                onInspectEyepiece={() => {
                  sound.playClick();
                  setShowEyepieceView(true);
                }}
              />
            </Suspense>
          </div>

          {/* ================= 3. FLOATING EYEPIECE VIEWPORT (MUNCUL KETIKA LENSA 3D DIKLIK) ================= */}
          {showEyepieceView && (
            <div className="absolute top-12 left-2 right-2 sm:inset-auto sm:top-2.5 sm:right-2.5 z-30 sm:w-72 max-w-sm max-h-[75vh] sm:max-h-[340px] overflow-y-auto bg-slate-900/98 sm:bg-slate-900/95 border-2 border-sky-500/50 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-200 mx-auto">
              
              {/* Eyepiece Header & Actions */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-[10px] font-pixel text-slate-200 uppercase tracking-wider">
                    Bidang Okuler ({totalMagnification}x)
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { sound.playClick(); setShowReticle(!showReticle); }}
                    title="Tampilkan Skala Mikrometer"
                    className={`p-1 rounded border transition cursor-pointer ${
                      showReticle ? 'bg-sky-500/20 text-sky-400 border-sky-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    <Crosshair className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => { sound.playClick(); setShowLabels(!showLabels); }}
                    title="Tampilkan Label Anatomi"
                    className={`p-1 rounded border transition cursor-pointer ${
                      showLabels ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    <Info className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => { sound.playClick(); setShowEyepieceView(false); }}
                    title="Tutup Bidang Pandang Okuler"
                    className="p-1 px-1.5 rounded border bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border-slate-700 hover:border-rose-500/50 text-[10px] font-bold transition cursor-pointer ml-1"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Authentic Circular Microscope Eyepiece Viewport */}
              <div className="relative w-full aspect-square max-w-[135px] mx-auto bg-black rounded-full border-4 border-slate-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.9),0_4px_10px_rgba(0,0,0,0.5)] overflow-hidden flex items-center justify-center shrink-0">
                
                {/* The Specimen Canvas / Viewport Layer */}
                <div 
                  className="relative w-full h-full rounded-full flex items-center justify-center overflow-hidden bg-black"
                  style={{
                    filter: !lightPower 
                      ? 'brightness(0)' 
                      : [
                          blurAmount > 0.1 ? `blur(${blurAmount.toFixed(1)}px)` : null,
                          `brightness(${diaphragm / 70})`,
                          focusScore === 100 ? 'contrast(1.15) saturate(1.08)' : `contrast(${1 + (focusScore / 300)})`
                        ].filter(Boolean).join(' '),
                    transform: `scale(${objectiveLens === 4 ? 1.02 : objectiveLens === 10 ? 1.05 : 1.08}) translate(${stagePosX * 1.5}px, ${stagePosY * 1.5}px)`,
                    transition: 'transform 120ms ease-out'
                  }}
                >
                  {/* Authentic High-Resolution Biological Micrograph Image (Progressive per Magnification: 4x, 10x, 40x) */}
                  <img 
                    key={`${selectedSpecimen.id}-${objectiveLens}`}
                    src={selectedSpecimen.images?.[objectiveLens] || selectedSpecimen.imageSrc} 
                    alt={`${selectedSpecimen.name} (${objectiveLens}x)`} 
                    className="w-full h-full object-cover select-none pointer-events-none transition-opacity duration-200"
                    style={{
                      imageRendering: 'high-quality'
                    }}
                  />

                  {/* Natural optical staining tint overlay */}
                  <div 
                    className="absolute inset-0 pointer-events-none mix-blend-color opacity-10"
                    style={{ backgroundColor: selectedSpecimen.stainColor }}
                  />

                  {/* Condenser Aperture Ring simulation */}
                  <div 
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      boxShadow: `inset 0 0 ${Math.max(12, 48 - (diaphragm * 0.4))}px rgba(0,0,0,0.85)`
                    }}
                  />
                </div>

                {/* Reticle / Micrometer Grid Overlay */}
                {showReticle && lightPower && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-full h-[1px] bg-emerald-400/50" />
                    <div className="h-full w-[1px] bg-emerald-400/50 absolute" />
                    <div className="w-24 h-24 rounded-full border border-emerald-400/30 absolute" />
                    <div className="w-36 h-36 rounded-full border border-emerald-400/20 absolute" />
                    <span className="absolute bottom-6 right-8 text-[7px] font-mono text-emerald-400/70">1 Div = 10 µm</span>
                  </div>
                )}

                {/* Structure Pointer Labels (Shown if user clicks label toggle and focus is clear) */}
                {showLabels && isOptimalFocus && (
                  <div className="absolute inset-0 pointer-events-none">
                    {selectedSpecimen.structures.map((item, idx) => (
                      <div 
                        key={idx}
                        className="absolute bg-slate-900/90 text-[#facc15] border border-[#facc15]/50 px-1.5 py-0.5 rounded text-[7px] font-sans font-bold shadow-lg pointer-events-auto"
                        style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%)' }}
                      >
                        <span>{item.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Circular Vignette Border (Microscope Edge) */}
                <div className="absolute inset-0 pointer-events-none rounded-full shadow-[inset_0_0_25px_rgba(0,0,0,0.95)] border-4 border-black" />

                {/* Camera Flash Animation */}
                {photoFlash && (
                  <div className="absolute inset-0 bg-white rounded-full z-40 animate-fade-out pointer-events-none" />
                )}
              </div>

              {/* Focus Quality Bar & Clarity Metric */}
              <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-medium">Ketajaman Resolusi:</span>
                  <span className={`font-pixel text-[9px] ${
                    focusScore === 100 ? 'text-emerald-400 font-bold' : focusScore >= 80 ? 'text-yellow-400' : 'text-rose-400'
                  }`}>
                    {focusScore === 100 ? '100% KRISTAL' : `${focusScore}%`}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <div 
                    className={`h-full rounded-full transition-all duration-200 ${
                      focusScore === 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : focusScore >= 80 ? 'bg-amber-400' : 'bg-rose-500'
                    }`}
                    style={{ width: `${focusScore}%` }}
                  />
                </div>

                {/* Status Feedback Message */}
                <div className="text-[10px] text-center pt-0.5 font-medium leading-tight">
                  {!lightPower ? (
                    <span className="text-rose-400">⚠️ Saklar lampu mati! Nyalakan LED di kanan bawah.</span>
                  ) : focusScore === 100 ? (
                    <span className="text-emerald-300 font-bold">🟢 Fokus Kristal 100%! Struktur sitogenetika tampak tajam.</span>
                  ) : focusScore >= 85 ? (
                    <span className="text-yellow-300">🟡 Mendekati fokus ({focusScore}%). Putar mikrometer halus sedikit lagi.</span>
                  ) : (
                    <span className="text-rose-400">🔴 Bayangan buram ({focusScore}%). Putar makrometer/mikrometer di kanan bawah.</span>
                  )}
                </div>
              </div>

              {/* Snapshot Photo Button to LKPD */}
              <div className="pt-0.5">
                <button
                  onClick={handleCapturePhoto}
                  className={`w-full py-2 px-3 rounded-xl border font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md active:scale-95 ${
                    focusScore === 100 && lightPower
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 border-emerald-400 animate-pulse'
                      : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                  title="Ambil foto preparat ini dan simpan ke LKPD"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {capturedPhotos[selectedSpecimen.id] 
                      ? '📸 Foto Tersimpan di LKPD (Jepret Ulang)' 
                      : '📸 Ambil Foto Preparat (Masuk LKPD)'}
                  </span>
                </button>
              </div>

              {/* Specimen Intelligence Tabs (Compact) */}
              <div className="bg-slate-950/80 rounded-xl border border-slate-800 overflow-hidden text-left shadow-md">
                <div className="flex border-b border-slate-800 bg-slate-900/60 p-1 gap-1">
                  <button
                    onClick={() => setInfoTab('bio')}
                    className={`flex-1 py-1 px-1.5 rounded text-[9px] font-bold transition cursor-pointer ${
                      infoTab === 'bio' ? 'bg-[#ca7c38] text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🧬 Sifat
                  </button>
                  <button
                    onClick={() => setInfoTab('stage')}
                    className={`flex-1 py-1 px-1.5 rounded text-[9px] font-bold transition cursor-pointer ${
                      infoTab === 'stage' ? 'bg-[#ca7c38] text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🧬 Pewarisan
                  </button>
                  <button
                    onClick={() => setInfoTab('focus')}
                    className={`flex-1 py-1 px-1.5 rounded text-[9px] font-bold transition cursor-pointer ${
                      infoTab === 'focus' ? 'bg-[#ca7c38] text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🔬 Target
                  </button>
                </div>

                <div className="p-2 text-[10px] leading-relaxed">
                  {infoTab === 'bio' && (
                    <div className="space-y-1">
                      <div className="font-bold text-amber-300 line-clamp-1">{selectedSpecimen.name}</div>
                      <p className="text-slate-300 text-[10px] line-clamp-2">{selectedSpecimen.description}</p>
                      <div className="p-1.5 rounded bg-amber-950/30 border border-amber-500/20 text-amber-200 text-[9px]">
                        <strong>Fakta: </strong>{selectedSpecimen.bioFact}
                      </div>
                    </div>
                  )}

                  {infoTab === 'stage' && (
                    <div className="space-y-1">
                      <div className="text-amber-300 font-pixel text-[9px]">{selectedSpecimen.inheritanceRole}</div>
                      <p className="text-slate-300 text-[10px] line-clamp-3">{selectedSpecimen.inheritanceDetail}</p>
                    </div>
                  )}

                  {infoTab === 'focus' && (
                    <div className="space-y-1 text-[10px]">
                      <div className="flex justify-between text-slate-300">
                        <span>Target Makro:</span>
                        <span className="font-mono text-amber-300 font-bold">~{selectedSpecimen.idealFocus.coarse}%</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Target Mikro:</span>
                        <span className="font-mono text-sky-300 font-bold">~{selectedSpecimen.idealFocus.fine}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ================= 4. BOTTOM-RIGHT PRECISION CONTROLS POD ================= */}
          <div className="absolute bottom-2 inset-x-2 sm:inset-x-auto sm:right-3 sm:bottom-3 z-25 sm:max-w-lg md:max-w-xl bg-slate-950/98 sm:bg-slate-950/95 border border-slate-800 rounded-2xl p-2 sm:p-2.5 shadow-2xl backdrop-blur-md flex flex-col gap-1.5 transition-all duration-200">
            
            {/* Top Sub-Bar: Revolver (4x, 10x, 40x), LED Switch & Eyepiece Toggle */}
            <div className="flex items-center justify-between gap-1 border-b border-slate-800/80 pb-1.5">
              {/* Revolver 4x, 10x, 40x */}
              <div className="flex items-center gap-1">
                <span className="text-[9px] sm:text-[10px] font-pixel text-slate-400 uppercase mr-0.5">Rev:</span>
                {[
                  { mag: 4, label: '4x', color: 'border-rose-500 text-rose-400 bg-rose-500/10' },
                  { mag: 10, label: '10x', color: 'border-yellow-500 text-yellow-400 bg-yellow-500/10' },
                  { mag: 40, label: '40x', color: 'border-sky-500 text-sky-400 bg-sky-500/10' },
                ].map(item => (
                  <button
                    key={item.mag}
                    onClick={() => handleLensChange(item.mag)}
                    className={`px-1.5 sm:px-2 py-0.5 rounded text-center transition cursor-pointer text-[10px] sm:text-xs font-bold ${
                      objectiveLens === item.mag
                        ? `${item.color} font-black shadow-xs ring-1 ring-amber-400/40`
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* LED Power Switch & Eyepiece Toggle & Minimize */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { sound.playClick(); setLightPower(!lightPower); }}
                  className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase transition cursor-pointer flex items-center gap-1 ${
                    lightPower ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                  } ${(!lightPower && selectedSpecimen) ? 'ring-2 ring-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)] animate-pulse' : ''}`}
                  title="Nyalakan / Matikan Lampu LED"
                >
                  <Lightbulb className="w-3 h-3" />
                  <span>{lightPower ? 'LED ON' : 'LED OFF'}</span>
                </button>

                <button
                  onClick={() => { sound.playClick(); setShowEyepieceView(!showEyepieceView); }}
                  className={`px-2 sm:px-2.5 py-0.5 rounded text-[9px] sm:text-[10px] font-pixel transition cursor-pointer flex items-center gap-1 border ${
                    showEyepieceView 
                      ? 'bg-sky-500/20 text-sky-300 border-sky-400/60 font-bold' 
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                  } ${(!showEyepieceView && lightPower && coarseFocus >= 20) ? 'ring-2 ring-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.6)] animate-pulse' : ''}`}
                  title={showEyepieceView ? "Tutup bidang pandang lensa okuler" : "Buka bidang pandang lensa okuler"}
                >
                  <Eye className="w-3 h-3 text-sky-400" />
                  <span>{showEyepieceView ? 'Tutup' : 'Okuler'}</span>
                </button>

                <button
                  onClick={() => { sound.playClick(); setIsControlsMinimized(!isControlsMinimized); }}
                  className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 text-[10px] transition cursor-pointer ml-0.5"
                  title={isControlsMinimized ? "Buka panel kontrol" : "Kecilkan panel kontrol"}
                >
                  {isControlsMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {!isControlsMinimized && (
              <>
                {/* Mobile Segmented Tab Selector (Visible ONLY on mobile screens < sm) */}
                <div className="flex sm:hidden items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-800">
                  <button
                    onClick={() => { sound.playClick(); setMobileControlTab('macro'); }}
                    className={`flex-1 py-1 rounded text-[10px] font-pixel transition flex items-center justify-center gap-1 ${
                      mobileControlTab === 'macro' 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>▲▼ Makro</span>
                    <span className="text-[9px] font-mono opacity-80">({Math.round(coarseFocus)}%)</span>
                  </button>
                  <button
                    onClick={() => { sound.playClick(); setMobileControlTab('micro'); }}
                    className={`flex-1 py-1 rounded text-[10px] font-pixel transition flex items-center justify-center gap-1 ${
                      mobileControlTab === 'micro' 
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>▲▼ Mikro</span>
                    <span className="text-[9px] font-mono opacity-80">({Math.round(fineFocus)}%)</span>
                  </button>
                  <button
                    onClick={() => { sound.playClick(); setMobileControlTab('stage'); }}
                    className={`flex-1 py-1 rounded text-[10px] font-pixel transition flex items-center justify-center gap-1 ${
                      mobileControlTab === 'stage' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Move className="w-2.5 h-2.5" />
                    <span>Geser Meja</span>
                  </button>
                </div>

                {/* 3 Main Control Cards: On Mobile, active tab card is shown. On Desktop (sm:), all 3 in grid */}
                <div className="block sm:grid sm:grid-cols-3 gap-2">
                  
                  {/* 1. Makrometer (Kasar) */}
                  <div className={`${mobileControlTab === 'macro' ? 'flex' : 'hidden sm:flex'} bg-slate-900/80 p-2 rounded-xl border border-slate-800 flex-col justify-between gap-1.5`}>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                        Makrometer
                      </span>
                      {objectiveLens === 40 ? (
                        <span className="text-[8px] font-bold text-rose-400 bg-rose-950/80 px-1 py-0.5 rounded border border-rose-500/40">
                          🔒 40x Kunci
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-amber-300 font-bold">{Math.round(coarseFocus)}%</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-1">
                      <button 
                        onClick={() => adjustCoarse(5)} 
                        disabled={objectiveLens === 40}
                        className="py-1 bg-slate-800 hover:bg-amber-950/60 hover:border-amber-400 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded text-[9px] font-bold text-amber-200 transition cursor-pointer flex items-center justify-center gap-0.5 active:scale-95"
                        title="Putar kenop ke depan (Menaikkan meja objek)"
                      >
                        <ChevronUp className="w-3 h-3 text-amber-400" />
                        <span>▲ Naik</span>
                      </button>
                      <button 
                        onClick={() => adjustCoarse(-5)} 
                        disabled={objectiveLens === 40}
                        className="py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded text-[9px] font-bold text-slate-300 transition cursor-pointer flex items-center justify-center gap-0.5 active:scale-95"
                        title="Putar kenop ke belakang (Menurunkan meja objek)"
                      >
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                        <span>▼ Turun</span>
                      </button>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={coarseFocus}
                      disabled={objectiveLens === 40}
                      onChange={(e) => {
                        if (objectiveLens === 40) {
                          triggerCoarseWarning();
                          return;
                        }
                        setCoarseFocus(Number(e.target.value));
                      }}
                      onClick={() => {
                        if (objectiveLens === 40) triggerCoarseWarning();
                      }}
                      className={`w-full h-1 ${
                        objectiveLens === 40 ? 'accent-slate-600 opacity-40 cursor-not-allowed' : 'accent-amber-400 cursor-pointer'
                      }`}
                    />
                  </div>

                  {/* 2. Mikrometer (Halus) */}
                  <div className={`${mobileControlTab === 'micro' ? 'flex' : 'hidden sm:flex'} bg-slate-900/80 p-2 rounded-xl border border-slate-800 flex-col justify-between gap-1.5`}>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                        Mikrometer
                      </span>
                      <span className="text-[10px] font-mono text-sky-300 font-bold">{Math.round(fineFocus)}%</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1">
                      <button 
                        onClick={() => adjustFine(2)} 
                        className="py-1 bg-slate-800 hover:bg-sky-950/60 hover:border-sky-400 border border-slate-700 rounded text-[9px] font-bold text-sky-200 transition cursor-pointer flex items-center justify-center gap-0.5 active:scale-95"
                        title="Fokus mikro ke depan"
                      >
                        <ChevronUp className="w-3 h-3 text-sky-400" />
                        <span>▲ +2</span>
                      </button>
                      <button 
                        onClick={() => adjustFine(-2)} 
                        className="py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-[9px] font-bold text-slate-300 transition cursor-pointer flex items-center justify-center gap-0.5 active:scale-95"
                        title="Fokus mikro ke belakang"
                      >
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                        <span>▼ -2</span>
                      </button>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={fineFocus}
                      onChange={(e) => setFineFocus(Number(e.target.value))}
                      className="w-full accent-sky-400 cursor-pointer h-1"
                    />
                  </div>

                  {/* 3. Alat Geser Preparat (Kenop Meja X-Y) */}
                  <div className={`${mobileControlTab === 'stage' ? 'flex' : 'hidden sm:flex'} bg-slate-900/80 p-2 rounded-xl border border-slate-800 flex-col justify-between gap-1.5`}>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <Move className="w-3 h-3 text-emerald-400" />
                        <span>Geser Preparat</span>
                      </span>
                      <button
                        onClick={centerStage}
                        className="px-1.5 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-500/40 rounded text-[8px] font-pixel transition cursor-pointer"
                        title="Pusatkan posisi kaca preparat (0,0)"
                      >
                        Pusat
                      </button>
                    </div>

                    {/* Sumbu X (Kiri - Kanan) */}
                    <div className="grid grid-cols-2 gap-1">
                      <button 
                        onClick={() => adjustStageX(-5)}
                        className="py-1 bg-slate-800 hover:bg-emerald-950/60 hover:border-emerald-400 border border-slate-700 rounded text-[9px] font-bold text-slate-200 transition cursor-pointer flex items-center justify-center gap-0.5 active:scale-95"
                        title="Geser Kiri"
                      >
                        <ChevronLeft className="w-3 h-3 text-emerald-400" />
                        <span>◀ Kiri</span>
                      </button>
                      <button 
                        onClick={() => adjustStageX(5)}
                        className="py-1 bg-slate-800 hover:bg-emerald-950/60 hover:border-emerald-400 border border-slate-700 rounded text-[9px] font-bold text-slate-200 transition cursor-pointer flex items-center justify-center gap-0.5 active:scale-95"
                        title="Geser Kanan"
                      >
                        <span>Kanan ▶</span>
                        <ChevronRight className="w-3 h-3 text-emerald-400" />
                      </button>
                    </div>

                    {/* Sumbu Y (Maju - Mundur) */}
                    <div className="grid grid-cols-2 gap-1">
                      <button 
                        onClick={() => adjustStageY(-5)}
                        className="py-1 bg-slate-800 hover:bg-emerald-950/60 hover:border-emerald-400 border border-slate-700 rounded text-[9px] font-bold text-slate-200 transition cursor-pointer flex items-center justify-center gap-0.5 active:scale-95"
                        title="Geser Maju"
                      >
                        <ChevronUp className="w-3 h-3 text-emerald-400" />
                        <span>▲ Maju</span>
                      </button>
                      <button 
                        onClick={() => adjustStageY(5)}
                        className="py-1 bg-slate-800 hover:bg-emerald-950/60 hover:border-emerald-400 border border-slate-700 rounded text-[9px] font-bold text-slate-200 transition cursor-pointer flex items-center justify-center gap-0.5 active:scale-95"
                        title="Geser Mundur"
                      >
                        <ChevronDown className="w-3 h-3 text-emerald-400" />
                        <span>Mundur ▼</span>
                      </button>
                    </div>
                  </div>

                </div>
              </>
            )}

          </div>

        </main>

      </div>
      )}


      {/* ================= MODAL: PANDUAN PRAKTIKUM SOP (BERTAHAP) ================= */}
      {activeTab === 'sop' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-2 border-slate-700 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                    Prosedur Penggunaan Mikroskop yang Benar (Bertahap)
                  </h3>
                  <p className="text-[11px] text-slate-400">Standar Operasional Prosedur Praktikum Biologi &amp; Sitogenetika Laboratorium</p>
                </div>
              </div>
              <button 
                onClick={() => { sound.playClick(); setActiveTab('microscope'); }}
                className="text-slate-400 hover:text-white text-xs font-pixel px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded cursor-pointer"
              >
                TUTUP [X]
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              {SOP_STEPS.map((s) => (
                <div 
                  key={s.step} 
                  className={`p-3.5 rounded-xl border transition-all ${
                    s.isCompleted 
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-100 shadow-sm' 
                      : 'bg-slate-800/40 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        s.isCompleted ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {s.step}
                      </div>
                      <h4 className="font-bold text-sm text-white">
                        {s.step}. {s.title}
                      </h4>
                    </div>

                    <span className={`text-[10px] font-pixel px-2 py-0.5 rounded border ${
                      s.isCompleted 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {s.isCompleted ? '✓ Selesai Terpenuhi' : s.step === 4 ? 'Opsional' : '⏳ Belum Selesai'}
                    </span>
                  </div>

                  <ul className="space-y-1.5 pl-2 mb-2.5">
                    {s.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                        <span className="text-amber-400 font-bold leading-tight mt-0.5">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Status Praktikum:</span>
                    <span className={s.isCompleted ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                      {s.liveStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Achievement Card */}
            {completedStepsCount === 4 ? (
              <div className="bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-teal-500/20 border border-emerald-500/50 p-3.5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Award className="w-7 h-7 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-amber-300">Prestasi SOP Mikroskop Terpenuhi Sempurna!</div>
                    <div className="text-[11px] text-slate-300">Anda telah menguasai seluruh urutan prosedur operasional mikroskop profesional.</div>
                  </div>
                </div>
                <button
                  onClick={handleConfetti}
                  className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer shrink-0"
                >
                  Rayakan 🎉
                </button>
              </div>
            ) : (
              <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Progres: <strong className="text-amber-300">{completedStepsCount} dari 4 langkah</strong> selesai dalam sesi praktikum ini.
                </span>
                <button
                  onClick={() => { sound.playClick(); setActiveTab('microscope'); }}
                  className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg cursor-pointer transition"
                >
                  Lanjutkan Praktikum 🔬
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODEL 3D TAB ================= */}
      {activeTab === 'model3d' && (
        <div className="flex-1 w-full flex flex-col">
          {/* 3D Viewer Header */}
          <div className="w-full max-w-7xl mx-auto px-4 pt-3 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-[#facc15]" />
              <span className="text-xs font-pixel text-slate-200 uppercase tracking-wider">Model 3D Interaktif — Mikroskop Binokuler</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-3">
              <span>🖱️ Drag: Rotasi</span>
              <span>⚙️ Scroll: Zoom</span>
              <span>🤚 Right-click: Geser</span>
            </div>
          </div>
          
          {/* Full 3D Canvas */}
          <div className="flex-1 w-full px-4 pb-4">
            <div className="w-full h-[calc(100vh-180px)] bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl relative">
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto animate-pulse">
                      <Box className="w-6 h-6 text-[#facc15]" />
                    </div>
                    <p className="text-xs font-pixel text-slate-400 uppercase tracking-wider">Memuat Model 3D...</p>
                  </div>
                </div>
              }>
                <Microscope3DViewer className="w-full h-full" />
              </Suspense>

              {/* Floating info badge */}
              <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl px-4 py-2.5 text-left">
                <h4 className="text-[10px] font-pixel text-[#facc15] uppercase tracking-wider">Mikroskop Binokuler Compound</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Pembesaran 40x — 1000x • Iluminasi LED • Kondensor Abbe</p>
              </div>

              {/* Part labels toggle (future enhancement placeholder) */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  onClick={() => { sound.playClick(); setActiveTab('microscope'); }}
                  className="bg-slate-800/80 backdrop-blur-md border border-slate-700 hover:border-[#ca7c38] rounded-lg px-3 py-1.5 text-[10px] font-pixel text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
                >
                  <Eye className="w-3 h-3" />
                  <span>Gunakan Mikroskop</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification for Camera Photos */}
      {photoToast && (
        <div className={`fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-xs font-bold shadow-2xl backdrop-blur-md flex items-center gap-2 border animate-in slide-in-from-top duration-200 ${
          photoToast.type === 'success' 
            ? 'bg-emerald-950/95 text-emerald-200 border-emerald-400' 
            : 'bg-rose-950/95 text-rose-200 border-rose-500'
        }`}>
          <span>{photoToast.message}</span>
        </div>
      )}

      {/* ================= MODAL: DIGITAL LKPD (LEMBAR KERJA PESERTA DIDIK) ================= */}
      <DigitalLkpdModal
        isOpen={showLkpdModal}
        onClose={() => setShowLkpdModal(false)}
        capturedPhotos={capturedPhotos}
        specimens={SPECIMENS}
        onSelectSpecimenToView={(specimenId) => {
          const target = SPECIMENS.find(s => s.id === specimenId);
          if (target) {
            setSelectedSpecimen(target);
            setShowEyepieceView(true);
          }
        }}
      />

      {/* Footer Info */}
      <footer className="shrink-0 bg-slate-900/60 border-t border-slate-800 px-4 py-1.5 text-center text-[10px] text-slate-500 font-mono">
        GENETIC ODYSSEY • SIMULATOR MIKROSKOP VIRTUAL UNTUK INOVASI PEMBELAJARAN DIGITAL 2026
      </footer>

    </div>
  );
};
