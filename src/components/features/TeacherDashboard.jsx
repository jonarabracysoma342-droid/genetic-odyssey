import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { doc, setDoc, updateDoc, getDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { useGame } from '../../context/GameContext';
import { sound } from '../../services/sound';
import { QUESTIONS as HOTS_QUESTIONS } from './HotsQuiz';
import { 
  Users, 
  Plus, 
  FolderPlus, 
  BookOpen, 
  Send, 
  FileSpreadsheet, 
  GraduationCap, 
  CheckCircle,
  Target,
  Trash2,
  ClipboardList,
  FileText,
  PlusCircle,
  X,
  ChevronRight,
  User,
  Award,
  AlertCircle,
  Brain,
  Eye,
  RefreshCw,
  Sparkles,
  TrendingUp,
  BarChart2,
  Download,
  Printer,
  Search,
  Book, 
  Activity, 
  Lightbulb, 
  FileDown,
  MessageSquare
} from 'lucide-react';

// Topics map for AI quiz generation
const AI_QUESTION_POOL = {
  'monohibrid': [
    {
      id: 'm1',
      question: "Jika tanaman ercis berbiji bulat (BB) disilangkan dengan berbiji kisut (bb), bagaimana fenotipe seluruh keturunan F1?",
      options: [
        { key: 'A', text: '100% Berbiji bulat' },
        { key: 'B', text: '50% Bulat, 50% Kisut' },
        { key: 'C', text: '100% Berbiji kisut' },
        { key: 'D', text: '75% Bulat, 25% Kisut' }
      ],
      answer: 'A',
      explanation: "Karena alel bulat (B) dominan penuh terhadap alel kisut (b), persilangan parental homozigot dominan dan resesif menghasilkan F1 bergenotipe Bb (100% fenotipe bulat)."
    },
    {
      id: 'm2',
      question: "Pemisahan pasangan alel secara bebas pada Hukum I Mendel (Segregasi) terjadi pada tahap bioproses apa?",
      options: [
        { key: 'A', text: 'Pembelahan mitosis' },
        { key: 'B', text: 'Pembentukan gamet (meiosis)' },
        { key: 'C', text: 'Proses fertilisasi' },
        { key: 'D', text: 'Perkembangan embrio' }
      ],
      answer: 'B',
      explanation: "Hukum Mendel I menyatakan bahwa pada saat pembentukan gamet (meiosis), pasangan alel suatu gen akan memisah (segregasi) secara bebas."
    },
    {
      id: 'm3',
      question: "Sebuah tanaman bunga merah disilangkan dengan bunga putih. Seluruh keturunan F1 berwarna merah muda. Peristiwa ini menunjukkan fenomena...",
      options: [
        { key: 'A', text: 'Dominansi penuh' },
        { key: 'B', text: 'Intermediet / Dominansi tidak penuh' },
        { key: 'C', text: 'Epistasis resesif' },
        { key: 'D', text: 'Polimeri' }
      ],
      answer: 'B',
      explanation: "Intermediet terjadi jika sifat alel dominan tidak menutupi sifat resesif secara penuh, sehingga anakan heterozigot menunjukkan sifat perpaduan (merah muda)."
    }
  ],
  'dihibrid': [
    {
      id: 'd1',
      question: "Pada persilangan dihibrid heterozigot ganda (AaBb x AaBb), berapa rasio fenotipe keturunan F2 jika sifat dominan penuh?",
      options: [
        { key: 'A', text: '3 : 1' },
        { key: 'B', text: '9 : 3 : 3 : 1' },
        { key: 'C', text: '9 : 3 : 4' },
        { key: 'D', text: '12 : 3 : 1' }
      ],
      answer: 'B',
      explanation: "Sesuai Hukum Asortasi Bebas Mendel (Hukum II), persilangan dihibrid heterozigot ganda menghasilkan rasio fenotipe F2 klasik yaitu 9 : 3 : 3 : 1."
    },
    {
      id: 'd2',
      question: "Berapa banyak macam gamet yang dapat dibentuk oleh individu bergenotipe CCDdEe?",
      options: [
        { key: 'A', text: '2 macam' },
        { key: 'B', text: '4 macam' },
        { key: 'C', text: '8 macam' },
        { key: 'D', text: '16 macam' }
      ],
      answer: 'B',
      explanation: "Gunakan rumus 2^n di mana n adalah jumlah alel heterozigot. Di sini heterozigot ada Dd dan Ee (n=2), maka 2^2 = 4 macam gamet (CDE, CDe, CdE, Cde)."
    }
  ]
};

// Curriculum map detailing Bloom's taxonomy alignment
const BLOOM_CURRICULUM = [
  { stage: 1, title: 'Mengingat Sifat Fisik (C1)', topic: 'Fenotipe & Sifat Dominan-Resesif', focus: 'Mengenali ekspresi fisik tanaman ercis' },
  { stage: 2, title: 'Memahami Genotipe (C2)', topic: 'Alel & Kromosom Homolog', focus: 'Menerjemahkan sifat fisik ke kode genetik alel' },
  { stage: 3, title: 'Menerapkan Persilangan (C3)', topic: 'Hukum I Mendel - Segregasi', focus: 'Membuat persilangan monohibrida sederhana' },
  { stage: 4, title: 'Menganalisis Diagram (C4)', topic: 'Punnett Square Grid', focus: 'Menganalisis probabilitas genotipe anakan' },
  { stage: 5, title: 'Mengevaluasi Hasil (C5)', topic: 'Rasio Fenotipe F1 & F2', focus: 'Menguji hasil persilangan dengan target panen' },
  { stage: 6, title: 'Menciptakan Hibrida (C6)', topic: 'Hukum II Mendel - Asortasi Bebas', focus: 'Merekayasa persilangan dihibrida ganda' },
  { stage: 7, title: 'Penyimpangan Semu (HOTS)', topic: 'Epistasis, Kriptomeri, Polimeri', focus: 'Menganalisis rasio non-klasik hasil persilangan' },
  { stage: 8, title: 'Evaluasi Komprehensif', topic: 'Gen Letal & Pautan Kromosom', focus: 'Menguji penalaran kasus genetika kompleks' }
];

export const TeacherDashboard = () => {
  const { currentUser, userName, showAlert, showConfirm, activeStudentModal, setActiveStudentModal, activeReviewQuiz, setActiveReviewQuiz } = useGame();
  
  // Dashboard Tabs (Renamed to match user request)
  // 'dashboard' | 'my_classes' | 'students' | 'learning_progress' | 'material_analysis' | 'question_analysis' | 'question_bank' | 'modules_materials' | 'report_cards'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Search & Selector states
  const [newGroupName, setNewGroupName] = useState('');
  const [teacherGroups, setTeacherGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedGroupStudents, setSelectedGroupStudents] = useState([]);
  const [searchStudentQuery, setSearchStudentQuery] = useState('');
  
  // Announcement states
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');

  // Materials states
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialContent, setMaterialContent] = useState('');
  const [materialUrl, setMaterialUrl] = useState('');

  // Material Q&A Discussion states for teacher
  const [activeTeacherDiscussionMaterial, setActiveTeacherDiscussionMaterial] = useState(null);
  const [activeReplyingCommentId, setActiveReplyingCommentId] = useState(null);
  const [teacherReplyText, setTeacherReplyText] = useState('');
  const [submittingTeacherReply, setSubmittingTeacherReply] = useState(false);

  // Quiz Builder states
  const [quizTitle, setQuizTitle] = useState('');
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizBuildMethod, setQuizBuildMethod] = useState('manual'); // 'manual' | 'ai'
  const [aiTopic, setAiTopic] = useState('monohibrid'); 
  const [aiCount, setAiCount] = useState(3);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Question builder temp states
  const [qText, setQText] = useState('');
  const [qOptA, setQOptA] = useState('');
  const [qOptB, setQOptB] = useState('');
  const [qOptC, setQOptC] = useState('');
  const [qOptD, setQOptD] = useState('');
  const [qAnswer, setQAnswer] = useState('A');
  const [qExplanation, setQExplanation] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Generate unique 6-character class code
  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const fetchTeacherGroups = async () => {
    if (!currentUser) return;
    try {
      const q = query(collection(db, 'groups'), where('teacherId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const groups = [];
      querySnapshot.forEach((doc) => {
        groups.push(doc.data());
      });
      setTeacherGroups(groups);
      
      // Auto select first group
      if (groups.length > 0 && !selectedGroup) {
        handleSelectGroup(groups[0]);
      } else if (groups.length === 0) {
        setActiveTab('my_classes');
      }
    } catch (err) {
      console.error("Error fetching teacher groups:", err);
    }
  };

  useEffect(() => {
    fetchTeacherGroups();
  }, [currentUser]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    sound.playClick();
    setLoading(true);
    setMessage({ text: '', type: '' });

    const code = generateCode();

    try {
      const newClass = {
        groupId: code,
        groupName: newGroupName,
        teacherId: currentUser.uid,
        teacherName: userName,
        students: [],
        materials: [],
        quizzes: [],
        announcement: {
          title: 'Selamat Datang!',
          content: 'Silakan mulai selesaikan stage 1 hingga stage 6 dan kuis HOTS.',
          timestamp: new Date().toISOString()
        }
      };

      await setDoc(doc(db, 'groups', code), newClass);

      sound.playCorrect();
      setMessage({ text: `Kelompok "${newGroupName}" berhasil dibuat! Kode: ${code}`, type: 'success' });
      setNewGroupName('');
      fetchTeacherGroups();
      setSelectedGroup(newClass);
      setSelectedGroupStudents([]);
      setActiveTab('dashboard');
    } catch (err) {
      sound.playWrong();
      console.error(err);
      setMessage({ text: 'Gagal membuat kelompok. Silakan coba kembali.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGroup = async (group) => {
    if (!group) return;
    sound.playClick();
    setSelectedGroup(group);
    setSelectedGroupStudents([]);

    if (group.groupId === 'FAKE99') {
      const fakeStudentsList = [
        { uid: 'fake_s1', displayName: 'Andi Wijaya', email: 'andi@sekolah.sch.id', progress: { score: 1450, unlockedStage: 7, unlockedStages: [1, 2, 3, 4, 5, 6, 7], stars: { 1: 3, 2: 2, 3: 3, 4: 3, 5: 3, 6: 2 }, totalQuestionsAnswered: 20, correctAnswersCount: 17, hotsQuiz: { score: 1600, correctCount: 16, totalQuestions: 20, answers: { 1: 'B', 2: 'B', 3: 'B', 4: 'B', 5: 'B', 6: 'B', 7: 'A', 8: 'C', 9: 'A', 10: 'A', 11: 'B', 12: 'B', 13: 'A', 14: 'B', 15: 'A', 16: 'B', 17: 'B', 18: 'A', 19: 'A', 20: 'A' }, completedAt: new Date().toISOString() } } },
        { uid: 'fake_s2', displayName: 'Siti Rahma', email: 'siti@sekolah.sch.id', progress: { score: 850, unlockedStage: 4, unlockedStages: [1, 2, 3, 4], stars: { 1: 2, 2: 3, 3: 2 }, totalQuestionsAnswered: 12, correctAnswersCount: 8, hotsQuiz: { score: 1000, correctCount: 10, totalQuestions: 20, answers: { 1: 'B', 2: 'B', 3: 'B', 4: 'B', 5: 'B', 6: 'B', 7: 'A', 8: 'C', 9: 'C', 10: 'B', 11: 'A', 12: 'A', 13: 'B', 14: 'A', 15: 'B', 16: 'A', 17: 'A', 18: 'B', 19: 'A', 20: 'A' }, completedAt: new Date().toISOString() } } },
        { uid: 'fake_s3', displayName: 'Budi Santoso', email: 'budi@sekolah.sch.id', progress: { score: 1900, unlockedStage: 8, unlockedStages: [1, 2, 3, 4, 5, 6, 7, 8], stars: { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 2, 8: 2 }, totalQuestionsAnswered: 25, correctAnswersCount: 22, hotsQuiz: { score: 1800, correctCount: 18, totalQuestions: 20, answers: { 1: 'B', 2: 'B', 3: 'B', 4: 'B', 5: 'B', 6: 'B', 7: 'A', 8: 'C', 9: 'C', 10: 'A', 11: 'B', 12: 'B', 13: 'A', 14: 'B', 15: 'A', 16: 'B', 17: 'B', 18: 'A', 19: 'B', 20: 'A' }, completedAt: new Date().toISOString() } } },
        { uid: 'fake_s4', displayName: 'Clara Sinta', email: 'clara@sekolah.sch.id', progress: { score: 320, unlockedStage: 2, unlockedStages: [1, 2], stars: { 1: 2 }, totalQuestionsAnswered: 5, correctAnswersCount: 3, hotsQuiz: null } }
      ];
      setSelectedGroupStudents(fakeStudentsList);
      return;
    }
    
    try {
      setLoading(true);
      const groupDoc = await getDoc(doc(db, 'groups', group.groupId));
      if (groupDoc.exists()) {
        const freshGroup = groupDoc.data();
        setSelectedGroup(freshGroup);
        
        if (freshGroup.students && freshGroup.students.length > 0) {
          const studentDetails = [];
          for (const stu of freshGroup.students) {
            const userDoc = await getDoc(doc(db, 'users', stu.uid));
            if (userDoc.exists()) {
              studentDetails.push(userDoc.data());
            }
          }
          studentDetails.sort((a, b) => (b.progress?.score || 0) - (a.progress?.score || 0));
          setSelectedGroupStudents(studentDetails);
        }
      }
    } catch (err) {
      console.error("Error loading group details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    showConfirm("Apakah Anda yakin ingin menghapus kelas ini secara permanen?", async () => {
      sound.playClick();
      setLoading(true);
      try {
        await deleteDoc(doc(db, 'groups', groupId));
        sound.playCorrect();
        setMessage({ text: "Kelas berhasil dihapus permanen!", type: 'success' });
        setSelectedGroup(null);
        fetchTeacherGroups();
      } catch (err) {
        sound.playWrong();
        console.error(err);
        setMessage({ text: 'Gagal menghapus kelas.', type: 'error' });
      } finally {
        setLoading(false);
      }
    });
  };

  const handleRemoveStudent = async (studentUid) => {
    if (!selectedGroup) return;
    showConfirm("Keluarkan siswa ini dari kelas Anda?", async () => {
      sound.playClick();
      setLoading(true);
      try {
        const updatedStudents = (selectedGroup.students || []).filter(s => s.uid !== studentUid);
        await updateDoc(doc(db, 'groups', selectedGroup.groupId), {
          students: updatedStudents
        });

        // Also update student profile to clear groupId
        await updateDoc(doc(db, 'users', studentUid), {
          groupId: ""
        });

        sound.playCorrect();
        setMessage({ text: "Siswa berhasil dikeluarkan dari kelas.", type: 'success' });
        handleSelectGroup(selectedGroup);
      } catch (err) {
        sound.playWrong();
        console.error(err);
        setMessage({ text: 'Gagal mengeluarkan siswa.', type: 'error' });
      } finally {
        setLoading(false);
      }
    });
  };

  const handleCreateDemoClass = async () => {
    sound.playClick();
    setLoading(true);
    setMessage({ text: '', type: '' });

    const code = 'FAKE99';
    const teacherUid = currentUser?.uid || "demo_teacher_id";
    const teacherDisplayName = userName || "Guru Demo";

    const fakeStudentsList = [
      { uid: 'fake_s1', displayName: 'Andi Wijaya', email: 'andi@sekolah.sch.id', progress: { score: 1450, unlockedStage: 7, unlockedStages: [1, 2, 3, 4, 5, 6, 7], stars: { 1: 3, 2: 2, 3: 3, 4: 3, 5: 3, 6: 2 }, totalQuestionsAnswered: 20, correctAnswersCount: 17, hotsQuiz: { score: 1600, correctCount: 16, totalQuestions: 20, answers: { 1: 'B', 2: 'B', 3: 'B', 4: 'B', 5: 'B', 6: 'B', 7: 'A', 8: 'C', 9: 'A', 10: 'A', 11: 'B', 12: 'B', 13: 'A', 14: 'B', 15: 'A', 16: 'B', 17: 'B', 18: 'A', 19: 'A', 20: 'A' }, completedAt: new Date().toISOString() } } },
      { uid: 'fake_s2', displayName: 'Siti Rahma', email: 'siti@sekolah.sch.id', progress: { score: 850, unlockedStage: 4, unlockedStages: [1, 2, 3, 4], stars: { 1: 2, 2: 3, 3: 2 }, totalQuestionsAnswered: 12, correctAnswersCount: 8, hotsQuiz: { score: 1000, correctCount: 10, totalQuestions: 20, answers: { 1: 'B', 2: 'B', 3: 'B', 4: 'B', 5: 'B', 6: 'B', 7: 'A', 8: 'C', 9: 'C', 10: 'B', 11: 'A', 12: 'A', 13: 'B', 14: 'A', 15: 'B', 16: 'A', 17: 'A', 18: 'B', 19: 'A', 20: 'A' }, completedAt: new Date().toISOString() } } },
      { uid: 'fake_s3', displayName: 'Budi Santoso', email: 'budi@sekolah.sch.id', progress: { score: 1900, unlockedStage: 8, unlockedStages: [1, 2, 3, 4, 5, 6, 7, 8], stars: { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 2, 8: 2 }, totalQuestionsAnswered: 25, correctAnswersCount: 22, hotsQuiz: { score: 1800, correctCount: 18, totalQuestions: 20, answers: { 1: 'B', 2: 'B', 3: 'B', 4: 'B', 5: 'B', 6: 'B', 7: 'A', 8: 'C', 9: 'C', 10: 'A', 11: 'B', 12: 'B', 13: 'A', 14: 'B', 15: 'A', 16: 'B', 17: 'B', 18: 'A', 19: 'B', 20: 'A' }, completedAt: new Date().toISOString() } } },
      { uid: 'fake_s4', displayName: 'Clara Sinta', email: 'clara@sekolah.sch.id', progress: { score: 320, unlockedStage: 2, unlockedStages: [1, 2], stars: { 1: 2 }, totalQuestionsAnswered: 5, correctAnswersCount: 3, hotsQuiz: null } }
    ];

    const demoClass = {
      groupId: code,
      groupName: 'Kelas XI MIPA Demo (Fake)',
      teacherId: teacherUid,
      teacherName: teacherDisplayName,
      students: fakeStudentsList.map(s => ({ uid: s.uid, displayName: s.displayName })),
      materials: [
        {
          id: 'mat_demo1',
          title: 'Materi 1: Hukum Segregasi Mendel I',
          content: 'Ringkasan Hukum Mendel I menyatakan pemisahan pasangan alel secara bebas pada meiosis.',
          url: 'https://id.wikipedia.org/wiki/Hukum_pewarisan_Mendel',
          timestamp: new Date().toISOString()
        },
        {
          id: 'mat_demo2',
          title: 'Materi 2: Pewarisan Dihibrida Asortasi Bebas',
          content: 'Prinsip asortasi menyatakan pengelompokan gen secara bebas pada pembuahan silang.',
          url: '',
          timestamp: new Date().toISOString()
        }
      ],
      quizzes: [
        {
          id: 'quiz_demo1',
          title: 'Kuis Evaluasi Dihibrida Kelas',
          questions: [
            {
              id: 'q1',
              question: 'Persilangan dihibrid heterozigot menghasilkan rasio fenotip klasik...',
              options: [
                { key: 'A', text: '3:1' },
                { key: 'B', text: '9:3:3:1' },
                { key: 'C', text: '1:2:1' },
                { key: 'D', text: '9:3:4' }
              ],
              answer: 'B',
              explanation: 'Persilangan AaBb x AaBb menghasilkan rasio klasik 9:3:3:1.'
            }
          ],
          timestamp: new Date().toISOString()
        }
      ],
      announcement: {
        title: '📢 Kelas Demo Diaktifkan!',
        content: 'Ini adalah kelas simulasi buatan dengan data palsu siswa (Andi, Siti, Budi, Clara) untuk keperluan uji coba dashboard analitik taksonomi Bloom.',
        timestamp: new Date().toISOString()
      }
    };

    try {
      for (const student of fakeStudentsList) {
        await setDoc(doc(db, 'users', student.uid), {
          uid: student.uid,
          displayName: student.displayName,
          email: student.email,
          role: 'student',
          groupId: code,
          progress: student.progress
        });
      }
      await setDoc(doc(db, 'groups', code), demoClass);

      sound.playCorrect();
      setMessage({ text: 'Kelas Demo FAKE99 berhasil dibuat & diunggah ke cloud!', type: 'success' });
      await fetchTeacherGroups();
      setSelectedGroup(demoClass);
      setSelectedGroupStudents(fakeStudentsList);
      setActiveTab('dashboard');
    } catch (err) {
      console.warn("Firestore save failed, falling back to local memory simulation:", err);
      sound.playCorrect();
      setTeacherGroups(prev => {
        if (prev.some(g => g.groupId === 'FAKE99')) return prev;
        return [...prev, demoClass];
      });
      setSelectedGroup(demoClass);
      setSelectedGroupStudents(fakeStudentsList);
      setActiveTab('dashboard');
      setMessage({ text: 'Kelas Demo FAKE99 berhasil dimuat (Simulasi Lokal)!', type: 'success' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    if (!selectedGroup || !annTitle.trim() || !annContent.trim()) return;

    sound.playClick();
    setLoading(true);

    try {
      const updatedAnnouncement = {
        title: annTitle,
        content: annContent,
        timestamp: new Date().toISOString()
      };

      await updateDoc(doc(db, 'groups', selectedGroup.groupId), {
        announcement: updatedAnnouncement
      });

      sound.playCorrect();
      setMessage({ text: "Pengumuman berhasil diperbarui!", type: 'success' });
      setAnnTitle('');
      setAnnContent('');
      
      setSelectedGroup(prev => ({
        ...prev,
        announcement: updatedAnnouncement
      }));
    } catch (err) {
      sound.playWrong();
      console.error(err);
      setMessage({ text: 'Gagal mengirim pengumuman.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!selectedGroup || !materialTitle.trim() || !materialContent.trim()) return;

    sound.playClick();
    setLoading(true);

    try {
      const newMaterial = {
        id: 'mat_' + Date.now(),
        title: materialTitle.trim(),
        content: materialContent.trim(),
        url: materialUrl.trim(),
        timestamp: new Date().toISOString()
      };

      const updatedMaterials = [...(selectedGroup.materials || []), newMaterial];
      await updateDoc(doc(db, 'groups', selectedGroup.groupId), {
        materials: updatedMaterials
      });

      sound.playCorrect();
      setMessage({ text: `Materi "${materialTitle}" berhasil dibagikan!`, type: 'success' });
      setMaterialTitle('');
      setMaterialContent('');
      setMaterialUrl('');
      setSelectedGroup(prev => ({ ...prev, materials: updatedMaterials }));
    } catch (err) {
      sound.playWrong();
      console.error(err);
      setMessage({ text: 'Gagal membagikan materi.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = (materialId) => {
    if (!selectedGroup) return;
    showConfirm("Hapus materi belajar ini?", async () => {
      sound.playClick();
      setLoading(true);
      try {
        const updatedMaterials = (selectedGroup.materials || []).filter(m => m.id !== materialId);
        await updateDoc(doc(db, 'groups', selectedGroup.groupId), {
          materials: updatedMaterials
        });
        sound.playCorrect();
        setMessage({ text: "Materi berhasil dihapus!", type: 'success' });
        setSelectedGroup(prev => ({ ...prev, materials: updatedMaterials }));
      } catch (err) {
        sound.playWrong();
        console.error(err);
      } finally {
        setLoading(false);
      }
    });
  };

  const handleSendTeacherReply = async (commentId) => {
    if (!teacherReplyText.trim() || !activeTeacherDiscussionMaterial || !selectedGroup) return;
    sound.playClick();
    setSubmittingTeacherReply(true);

    const newReply = {
      id: 'rep_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      authorUid: currentUser?.uid || 'teacher_uid',
      authorName: userName || currentUser?.displayName || 'Guru',
      authorRole: 'guru',
      text: teacherReplyText.trim(),
      createdAt: new Date().toISOString()
    };

    try {
      const updatedMaterials = (selectedGroup.materials || []).map(mat => {
        if (mat.id === activeTeacherDiscussionMaterial.id) {
          const updatedComments = (mat.comments || []).map(c => {
            if (c.id === commentId) {
              return {
                ...c,
                replies: [...(c.replies || []), newReply]
              };
            }
            return c;
          });
          return { ...mat, comments: updatedComments };
        }
        return mat;
      });

      await updateDoc(doc(db, 'groups', selectedGroup.groupId), {
        materials: updatedMaterials
      });

      sound.playCorrect();
      setTeacherReplyText('');
      setActiveReplyingCommentId(null);

      // Update local states
      const currentMat = updatedMaterials.find(m => m.id === activeTeacherDiscussionMaterial.id);
      setActiveTeacherDiscussionMaterial(currentMat);
      setSelectedGroup(prev => ({ ...prev, materials: updatedMaterials }));
      setMessage({ text: 'Balasan guru berhasil dikirim!', type: 'success' });
    } catch (err) {
      sound.playWrong();
      console.error("Error replying as teacher:", err);
      showAlert("Gagal mengirim balasan guru.");
    } finally {
      setSubmittingTeacherReply(false);
    }
  };

  const handleDeleteComment = (commentId) => {
    if (!selectedGroup || !activeTeacherDiscussionMaterial) return;
    showConfirm("Hapus pertanyaan/komentar siswa ini?", async () => {
      sound.playClick();
      try {
        const updatedMaterials = (selectedGroup.materials || []).map(mat => {
          if (mat.id === activeTeacherDiscussionMaterial.id) {
            const updatedComments = (mat.comments || []).filter(c => c.id !== commentId);
            return { ...mat, comments: updatedComments };
          }
          return mat;
        });
        await updateDoc(doc(db, 'groups', selectedGroup.groupId), {
          materials: updatedMaterials
        });
        sound.playCorrect();
        const currentMat = updatedMaterials.find(m => m.id === activeTeacherDiscussionMaterial.id);
        setActiveTeacherDiscussionMaterial(currentMat);
        setSelectedGroup(prev => ({ ...prev, materials: updatedMaterials }));
        setMessage({ text: "Komentar berhasil dihapus!", type: 'success' });
      } catch (err) {
        sound.playWrong();
        console.error(err);
      }
    });
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!qText.trim() || !qOptA.trim() || !qOptB.trim() || !qOptC.trim() || !qOptD.trim()) {
      showAlert("Mohon isi lengkap seluruh butir pertanyaan.");
      return;
    }
    const newQ = {
      id: 'q_' + Date.now() + '_' + Math.floor(Math.random()*100),
      question: qText.trim(),
      options: [
        { key: 'A', text: qOptA.trim() },
        { key: 'B', text: qOptB.trim() },
        { key: 'C', text: qOptC.trim() },
        { key: 'D', text: qOptD.trim() }
      ],
      answer: qAnswer,
      explanation: qExplanation.trim()
    };
    setQuizQuestions(prev => [...prev, newQ]);
    setQText('');
    setQOptA('');
    setQOptB('');
    setQOptC('');
    setQOptD('');
    setQAnswer('A');
    setQExplanation('');
    sound.playClick();
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    if (!selectedGroup || !quizTitle.trim() || quizQuestions.length === 0) return;

    sound.playClick();
    setLoading(true);

    try {
      const newQuiz = {
        id: 'quiz_' + Date.now(),
        title: quizTitle.trim(),
        questions: quizQuestions,
        timestamp: new Date().toISOString()
      };

      const updatedQuizzes = [...(selectedGroup.quizzes || []), newQuiz];
      await updateDoc(doc(db, 'groups', selectedGroup.groupId), {
        quizzes: updatedQuizzes
      });

      sound.playCorrect();
      setMessage({ text: `Kuis "${quizTitle}" berhasil diaktifkan di kelas!`, type: 'success' });
      setQuizTitle('');
      setQuizQuestions([]);
      setSelectedGroup(prev => ({ ...prev, quizzes: updatedQuizzes }));
    } catch (err) {
      sound.playWrong();
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = (quizId) => {
    if (!selectedGroup) return;
    showConfirm("Hapus kuis ini dari kelas?", async () => {
      sound.playClick();
      setLoading(true);
      try {
        const updatedQuizzes = (selectedGroup.quizzes || []).filter(q => q.id !== quizId);
        await updateDoc(doc(db, 'groups', selectedGroup.groupId), {
          quizzes: updatedQuizzes
        });
        sound.playCorrect();
        setMessage({ text: "Kuis berhasil dihapus!", type: 'success' });
        setSelectedGroup(prev => ({ ...prev, quizzes: updatedQuizzes }));
      } catch (err) {
        sound.playWrong();
      } finally {
        setLoading(false);
      }
    });
  };

  const handleDownloadCSV = () => {
    if (selectedGroupStudents.length === 0 || !selectedGroup) return;
    sound.playClick();

    // Headers
    const headers = ["Nama Siswa", ...HOTS_QUESTIONS.map((_, i) => `Q${i+1}`), "Skor Akhir"];
    const csvRows = [headers.join(",")];
    
    // Student Rows
    selectedGroupStudents.forEach(student => {
      const hots = student.progress?.hotsQuiz || null;
      const hotsAnswers = hots?.answers || {};
      const correctCount = hots?.correctCount || 0;
      const totalQ = hots?.totalQuestions || HOTS_QUESTIONS.length;
      const percentage = hots ? `${Math.round((correctCount / totalQ) * 100)}%` : "-";

      const studentAnswers = HOTS_QUESTIONS.map(q => {
        const ans = hotsAnswers[q.id];
        if (!hots) return "-";
        return ans === q.answer ? "✓" : "✕";
      });

      const row = [
        `"${student.displayName}"`,
        ...studentAnswers,
        `"${percentage}"`
      ];
      csvRows.push(row.join(","));
    });

    // Summary Row (Persentase Kelas)
    const summaryRow = ["Persentase Kelas"];
    HOTS_QUESTIONS.forEach(q => {
      let correctAnswers = 0;
      let submittedCount = 0;

      selectedGroupStudents.forEach(student => {
        const hots = student.progress?.hotsQuiz || null;
        const hotsAnswers = hots?.answers || {};
        if (hots) {
          submittedCount++;
          if (hotsAnswers[q.id] === q.answer) {
            correctAnswers++;
          }
        }
      });

      const successPct = submittedCount > 0 ? Math.round((correctAnswers / submittedCount) * 100) : 0;
      summaryRow.push(`"${successPct}%"`);
    });

    // Average Score
    let totalScoreSum = 0;
    let count = 0;
    selectedGroupStudents.forEach(s => {
      if (s.progress?.hotsQuiz) {
        totalScoreSum += s.progress.hotsQuiz.score || 0;
        count++;
      }
    });
    const classAverageHots = count > 0 ? Math.round(totalScoreSum / count) : 0;
    summaryRow.push(`"Rata-rata: ${classAverageHots}%"`);
    csvRows.push(summaryRow.join(","));

    // Download trigger with UTF-8 BOM
    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Laporan_Matriks_Jawaban_${selectedGroup.groupName}.csv`;
    link.click();
  };

  const filteredStudents = selectedGroupStudents.filter(stu => 
    stu.displayName.toLowerCase().includes(searchStudentQuery.toLowerCase()) ||
    stu.email.toLowerCase().includes(searchStudentQuery.toLowerCase())
  );

  // Compute classroom stats
  const totalStudentsCount = selectedGroupStudents.length;
  const averageClassScore = totalStudentsCount > 0 
    ? Math.round(selectedGroupStudents.reduce((acc, curr) => acc + (curr.progress?.score || 0), 0) / totalStudentsCount)
    : 0;
  const highestScore = totalStudentsCount > 0
    ? Math.max(...selectedGroupStudents.map(s => s.progress?.score || 0))
    : 0;

  return (
    <div className="space-y-4 md:space-y-6 pb-12 select-none text-left">
      
      {/* Top Welcome Title Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-850 border-2 border-slate-800 rounded-3xl p-5 md:p-7 text-white shadow-[4px_4px_0px_#1e293b] flex items-center justify-between">
        <div>
          <span className="text-[7px] md:text-[10px] font-black uppercase tracking-widest text-indigo-200">PORTAL MANAGEMENT KELAS</span>
          <h2 className="text-sm md:text-lg font-black mt-0.5 font-sans leading-none">Dashboard Guru: {userName}</h2>
          <p className="text-[9px] md:text-xs text-indigo-100 font-bold mt-1.5 leading-normal max-w-[260px] md:max-w-[400px]">
            Pantau performa, lakukan analisis materi & soal, kelola bank soal, dan ekspor lembar laporan secara praktis.
          </p>
        </div>
        <GraduationCap className="w-10 h-10 md:w-14 md:h-14 text-indigo-200/30 stroke-[1.5]" />
      </div>

      {/* Message Notifications */}
      {message.text && (
        <div className={`p-3 border-2 border-slate-800 rounded-2xl text-[9px] font-bold shadow-[2px_2px_0px_#1e293b] flex items-center gap-2 animate-scale-up ${
          message.type === 'success' ? 'bg-emerald-100 text-emerald-850' : 'bg-rose-100 text-rose-850'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-700" /> : <Target className="w-4 h-4 text-rose-700" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Group Selector Pill Bar */}
      <div className="bg-white border-2 border-slate-800 rounded-3xl p-4 md:p-6 shadow-[4px_4px_0px_#1e293b] space-y-3 md:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-[10px] md:text-xs font-black text-slate-850 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 md:w-5 md:h-5 text-indigo-650" /> Kelompok Kelas Anda ({teacherGroups.length})
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCreateDemoClass}
              disabled={loading}
              className="px-2.5 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-650 text-white font-black text-[8px] border-2 border-slate-800 rounded-lg shadow-3xs cursor-pointer flex items-center gap-1 active:translate-y-0.2"
            >
              <Sparkles className="w-3.5 h-3.5 fill-white stroke-none animate-pulse" />
              <span>BUAT KELAS DEMO (FAKE)</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('my_classes');
              }}
              className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-black text-[8px] border-2 border-slate-800 rounded-lg shadow-3xs cursor-pointer flex items-center gap-1 active:translate-y-0.2"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3px]" />
              <span>BUAT KELAS RIIL</span>
            </button>
          </div>
          {selectedGroup && (
            <span className="text-[8px] font-black text-indigo-650 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg self-start sm:self-auto">
              Kode Kelas: {selectedGroup.groupId}
            </span>
          )}
        </div>

        {teacherGroups.length === 0 ? (
          <p className="text-[9px] font-bold text-slate-400">Belum ada kelompok kelas yang terdaftar. Buka tab "Kelas Saya" untuk membuat baru.</p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1 max-w-full snap-x scrollbar-thin">
            {teacherGroups.map((g) => (
              <button
                key={g.groupId}
                onClick={() => handleSelectGroup(g)}
                className={`px-3 py-2 rounded-xl border-2 flex-shrink-0 cursor-pointer snap-start transition flex items-center gap-2 ${
                  selectedGroup?.groupId === g.groupId
                    ? 'bg-indigo-50 border-indigo-650 text-indigo-850 font-black shadow-3xs'
                    : 'bg-slate-50 border-slate-800 text-slate-700 font-bold'
                }`}
              >
                <span className="text-[9.5px] whitespace-nowrap">{g.groupName}</span>
                <span className="text-[7.5px] px-1.5 py-0.2 rounded bg-indigo-150 border border-indigo-300 font-mono font-black">
                  {g.groupId}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tabs Navigation Grid (All 9 tabs requested by User) */}
      {selectedGroup && (
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'dashboard', label: '📊 Dashboard' },
            { id: 'my_classes', label: '🏫 Kelas Saya' },
            { id: 'students', label: '👤 Siswa' },
            { id: 'learning_progress', label: '📈 Progres' },
            { id: 'material_analysis', label: '🧬 Analisis Materi' },
            { id: 'question_analysis', label: '📝 Analisis Soal' },
            { id: 'question_bank', label: '🧠 Bank Soal' },
            { id: 'modules_materials', label: '📚 Modul & Materi' },
            { id: 'report_cards', label: '📑 Laporan Belajar' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { sound.playClick(); setActiveTab(tab.id); }}
              className={`py-2 px-1 text-[8.5px] font-black uppercase tracking-wider border-2 border-slate-800 rounded-xl cursor-pointer shadow-3xs transition-all text-center ${
                activeTab === tab.id 
                  ? 'bg-indigo-600 text-white translate-y-0.5 shadow-none' 
                  : 'bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {selectedGroup ? (
        <div className="space-y-4">
          
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4 animate-scale-up">
              
              {/* Quick Analytics Cards Row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white border-2 border-slate-800 rounded-2xl p-3 shadow-3xs text-center">
                  <span className="text-[6.5px] font-black text-slate-400 uppercase tracking-widest block">Jumlah Siswa</span>
                  <span className="text-lg font-black text-slate-805 font-mono leading-none mt-1 block">{totalStudentsCount}</span>
                </div>
                <div className="bg-white border-2 border-slate-800 rounded-2xl p-3 shadow-3xs text-center">
                  <span className="text-[6.5px] font-black text-slate-400 uppercase tracking-widest block">Rata-Rata Kelas</span>
                  <span className="text-lg font-black text-indigo-705 font-mono leading-none mt-1 block">{averageClassScore} XP</span>
                </div>
                <div className="bg-white border-2 border-slate-800 rounded-2xl p-3 shadow-3xs text-center">
                  <span className="text-[6.5px] font-black text-slate-400 uppercase tracking-widest block">Skor Tertinggi</span>
                  <span className="text-lg font-black text-emerald-705 font-mono leading-none mt-1 block">{highestScore} XP</span>
                </div>
              </div>

              {/* Send Announcements & Tasks Widget */}
              <div className="bg-white border-2 border-slate-800 rounded-3xl p-4 shadow-[4px_4px_0px_#1e293b] space-y-3">
                <h3 className="text-[10px] font-black text-slate-855 uppercase tracking-wider flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-indigo-650" /> Buat Pengumuman & Tugas Kelas Baru
                </h3>
                <form onSubmit={handleSendAnnouncement} className="space-y-2.5">
                  <input
                    type="text"
                    required
                    placeholder="Judul Pengumuman (Misal: Selesaikan Stage 3 Monohibrid!)"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    className="w-full px-3 py-2 text-[9.5px] font-bold border-2 border-slate-800 rounded-xl outline-none placeholder-slate-400 focus:border-indigo-605 transition bg-[#fafafa]"
                  />
                  <textarea
                    required
                    rows={3}
                    placeholder="Tulis detail materi tugas singkat di sini..."
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    className="w-full px-3 py-2 text-[9.5px] font-bold border-2 border-slate-800 rounded-xl outline-none placeholder-slate-400 focus:border-indigo-605 transition bg-[#fafafa] resize-none"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[9px] border-2 border-slate-800 rounded-xl shadow-3xs flex items-center justify-center gap-1 cursor-pointer active:translate-y-0.2"
                  >
                    <span>KIRIM PENGUMUMAN</span>
                  </button>
                </form>
              </div>

              {/* Active Announcement Card */}
              {selectedGroup.announcement && (
                <div className="bg-amber-50 border-2 border-slate-800 rounded-3xl p-4 shadow-[4px_4px_0px_#1e293b] space-y-2 text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-black text-amber-800 uppercase tracking-widest">📢 PENGUMUMAN KELAS AKTIF</span>
                  </div>
                  <div className="border-t border-amber-200 pt-2">
                    <h4 className="text-[10px] font-black text-slate-800">{selectedGroup.announcement.title}</h4>
                    <p className="text-[9px] font-bold text-slate-650 leading-relaxed mt-1 whitespace-pre-wrap">{selectedGroup.announcement.content}</p>
                    <span className="text-[7.5px] font-bold text-slate-400 block mt-2">
                      Dikirim pada: {new Date(selectedGroup.announcement.timestamp).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: KELAS SAYA */}
          {activeTab === 'my_classes' && (
            <div className="space-y-4 animate-scale-up">
              
              {/* Create New Group Class Form */}
              <div className="bg-white border-2 border-slate-800 rounded-3xl p-4 shadow-[4px_4px_0px_#1e293b] space-y-3">
                <h3 className="text-[10px] font-black text-slate-855 uppercase tracking-wider flex items-center gap-1.5">
                  <FolderPlus className="w-4 h-4 text-indigo-650" /> Buat Kelompok Kelas Baru
                </h3>
                <form onSubmit={handleCreateGroup} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kelas XI MIPA 1"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="flex-1 px-3 py-2 text-[10px] font-bold border-2 border-slate-800 rounded-xl outline-none placeholder-slate-400 focus:border-indigo-605 transition bg-[#fafafa]"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[9px] border-2 border-slate-800 rounded-xl shadow-3xs flex items-center gap-1 cursor-pointer active:translate-y-0.2"
                  >
                    <Plus className="w-4 h-4 stroke-[3px]" />
                    <span>BUAT</span>
                  </button>
                </form>
              </div>

              {/* Class Lists and Codes Table */}
              <div className="bg-white border-2 border-slate-800 rounded-3xl p-4 shadow-[4px_4px_0px_#1e293b] space-y-3">
                <h3 className="text-[10px] font-black text-slate-855 uppercase tracking-wider">Daftar Kelas Aktif Guru ({teacherGroups.length})</h3>
                
                {teacherGroups.length === 0 ? (
                  <p className="text-[9px] text-slate-450 py-3 text-center">Belum ada kelas.</p>
                ) : (
                  <div className="space-y-2">
                    {teacherGroups.map(g => (
                      <div key={g.groupId} className="p-3 border-2 border-slate-800 rounded-2xl bg-slate-50 flex items-center justify-between shadow-3xs">
                        <div className="text-left">
                          <h4 className="text-[10px] font-black text-slate-855 leading-tight">{g.groupName}</h4>
                          <span className="text-[8px] font-black text-indigo-705 block mt-1">Kode Kelas: {g.groupId}</span>
                          <span className="text-[7.5px] font-bold text-slate-450 block mt-0.5">Siswa terdaftar: {g.students?.length || 0} siswa</span>
                        </div>
                        <button
                          onClick={() => handleDeleteGroup(g.groupId)}
                          className="p-1.5 text-slate-400 hover:text-rose-650 transition cursor-pointer"
                          title="Hapus Kelas"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SISWA (STUDENTS LIST) */}
          {activeTab === 'students' && (
            <div className="bg-white border-2 border-slate-800 rounded-3xl p-4 shadow-[4px_4px_0px_#1e293b] space-y-3 animate-scale-up">
              
              {/* Search and Student Filter Widget */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama siswa atau email..."
                    value={searchStudentQuery}
                    onChange={(e) => setSearchStudentQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-[9.5px] font-bold border-2 border-slate-800 rounded-xl outline-none placeholder-slate-400 focus:border-indigo-605 transition bg-[#fafafa]"
                  />
                </div>
              </div>

              {filteredStudents.length === 0 ? (
                <p className="text-[9.5px] font-bold text-slate-400 text-center py-6">Tidak ditemukan siswa yang cocok.</p>
              ) : (
                <div className="space-y-2">
                  {filteredStudents.map((student, idx) => {
                    const prog = student.progress || {};
                    const starTotal = prog.stars ? Object.values(prog.stars).reduce((a, b) => a + b, 0) : 0;
                    
                    return (
                      <div key={student.uid || idx} className="p-3 border-2 border-slate-800 rounded-2xl bg-slate-50 flex items-center justify-between gap-3 shadow-3xs">
                        <div 
                          onClick={() => { sound.playClick(); setActiveStudentModal(student); }}
                          className="flex items-center gap-2 cursor-pointer flex-1 text-left"
                        >
                          <div className="w-5 h-5 rounded bg-indigo-50 border border-slate-800 flex items-center justify-center flex-shrink-0 text-[8px] font-black text-indigo-700">
                            #{idx + 1}
                          </div>
                          <div>
                            <span className="text-[9.5px] font-black text-slate-850 hover:text-indigo-650 flex items-center gap-0.5">
                              {student.displayName}
                              <ChevronRight className="w-3 h-3 text-slate-400" />
                            </span>
                            <span className="text-[8px] font-bold text-slate-455 block truncate max-w-[150px]">{student.email}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[8.5px] font-black text-indigo-700 font-mono">★{starTotal}</span>
                          <button
                            onClick={() => handleRemoveStudent(student.uid)}
                            className="p-1.5 text-slate-400 hover:text-rose-650 cursor-pointer"
                            title="Keluarkan Siswa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROGRES BELAJAR (LEARNING PROGRESS MATRIX) */}
          {activeTab === 'learning_progress' && (
            <div className="bg-white border-2 border-slate-800 rounded-3xl p-4 shadow-[4px_4px_0px_#1e293b] space-y-3 overflow-x-auto animate-scale-up">
              <div className="text-left border-b border-slate-200 pb-2">
                <h3 className="text-[10px] font-black text-slate-855 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-650" /> Matriks Progres Pembelajaran Siswa (Stage 1 - 8)
                </h3>
              </div>

              {selectedGroupStudents.length === 0 ? (
                <p className="text-[9.5px] text-slate-400 text-center py-6">Belum ada data siswa.</p>
              ) : (
                <table className="w-full text-left border-collapse text-[8.5px]">
                  <thead>
                    <tr className="border-b border-slate-300">
                      <th className="py-2 pr-2 font-black text-slate-500 uppercase tracking-wider">Nama Siswa</th>
                      <th className="py-2 px-1 font-black text-slate-500 uppercase tracking-wider text-center">Stage</th>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(st => (
                        <th key={st} className="py-2 px-1 font-black text-slate-500 uppercase tracking-wider text-center">S{st}</th>
                      ))}
                      <th className="py-2 pl-2 font-black text-slate-500 uppercase tracking-wider text-right">Skor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedGroupStudents.map((stu) => {
                      const prog = stu.progress || {};
                      const unlocked = prog.unlockedStage || 1;
                      const unlockedStages = prog.unlockedStages || [1];

                      return (
                        <tr key={stu.uid} className="border-b border-slate-200 hover:bg-slate-55 transition">
                          <td className="py-2.5 pr-2 font-black text-slate-800">{stu.displayName}</td>
                          <td className="py-2.5 px-1 font-mono text-center font-black text-indigo-700">Lvl {unlocked}</td>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(st => {
                            const isCleared = unlockedStages.includes(st) || st < unlocked;
                            return (
                              <td key={st} className="py-2.5 px-1 text-center font-bold">
                                <span className={isCleared ? "text-emerald-600" : "text-slate-350"}>
                                  {isCleared ? "✓" : "○"}
                                </span>
                              </td>
                            );
                          })}
                          <td className="py-2.5 pl-2 font-mono font-black text-slate-800 text-right">{prog.score || 0}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 5: ANALISIS MATERI (CURRICULUM MASTERY BREAKDOWN) */}
          {activeTab === 'material_analysis' && (
            <div className="bg-white border-2 border-slate-800 rounded-3xl p-4 shadow-[4px_4px_0px_#1e293b] space-y-3.5 animate-scale-up">
              <div className="text-left border-b border-slate-200 pb-2">
                <h3 className="text-[10px] font-black text-slate-855 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-indigo-650" /> Analisis Penguasaan Materi (Taksonomi Bloom)
                </h3>
                <p className="text-[8px] font-bold text-slate-400 mt-1 leading-normal">
                  Persentase siswa dalam kelas yang telah berhasil menyelesaikan kompetensi materi genetik.
                </p>
              </div>

              {totalStudentsCount === 0 ? (
                <p className="text-[9.5px] text-slate-400 text-center py-6">Belum ada data analisis siswa.</p>
              ) : (
                <div className="space-y-3">
                  {BLOOM_CURRICULUM.map((cur) => {
                    // Count how many students cleared this stage
                    const clearedCount = selectedGroupStudents.filter(s => {
                      const stages = s.progress?.unlockedStages || [1];
                      return stages.includes(cur.stage) || (s.progress?.unlockedStage || 1) > cur.stage;
                    }).length;
                    
                    const pct = Math.round((clearedCount / totalStudentsCount) * 100);
                    
                    // Difficulty indicator color
                    let barColor = 'bg-emerald-500';
                    if (pct < 40) barColor = 'bg-rose-500';
                    else if (pct < 70) barColor = 'bg-amber-500';

                    return (
                      <div key={cur.stage} className="space-y-1 text-left">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-[9.5px] font-black text-slate-850">{cur.title}</h4>
                            <span className="text-[8px] text-slate-500 font-bold block leading-none">{cur.topic}</span>
                          </div>
                          <span className="text-[9px] font-black font-mono text-slate-850">{pct}% ({clearedCount}/{totalStudentsCount})</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full h-2.5 rounded-full bg-slate-100 border border-slate-300 overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: ANALISIS SOAL (HOTS QUIZ METRICS) */}
          {activeTab === 'question_analysis' && (
            <div className="bg-white border-2 border-slate-800 rounded-3xl p-4 shadow-[4px_4px_0px_#1e293b] space-y-4 animate-scale-up">
              <div className="text-left border-b border-slate-205 pb-2">
                <h3 className="text-[10px] font-black text-slate-855 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-indigo-650" /> Analisis Tingkat Kesukaran Soal Kuis HOTS
                </h3>
                <p className="text-[8px] font-bold text-slate-400 mt-1 leading-normal">
                  Statistik ketepatan jawaban siswa pada setiap butir soal kuis evaluasi sistem biologi.
                </p>
              </div>

              {totalStudentsCount === 0 ? (
                <p className="text-[9.5px] text-slate-400 text-center py-6">Belum ada data pengerjaan kuis siswa.</p>
              ) : (
                <div className="space-y-4">
                  {/* Part 1: Grid Table Breakdown (Matriks Jawaban) */}
                  <div className="border-2 border-slate-800 rounded-2xl bg-slate-50 p-3 overflow-x-auto">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-2">Matriks Jawaban Butir Soal (Siswa vs Soal)</span>
                    <table className="w-full text-[8.5px] border-collapse text-left">
                      <thead>
                        <tr className="border-b border-slate-300">
                          <th className="py-2 pr-2 font-black text-slate-600">Nama Siswa</th>
                          {HOTS_QUESTIONS.map((q, idx) => (
                            <th key={q.id} className="py-2 px-1 font-black text-slate-605 text-center">Q{idx + 1}</th>
                          ))}
                          <th className="py-2 pl-2 font-black text-slate-605 text-right">Hasil</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedGroupStudents.map((student) => {
                          const hots = student.progress?.hotsQuiz || null;
                          const hotsAnswers = hots?.answers || {};
                          const correctCount = hots?.correctCount || 0;
                          const totalQ = hots?.totalQuestions || HOTS_QUESTIONS.length;

                          return (
                            <tr key={student.uid} className="border-b border-slate-200 hover:bg-slate-100 transition">
                              <td className="py-2.5 pr-2 font-black text-slate-800">{student.displayName}</td>
                              {HOTS_QUESTIONS.map((q) => {
                                const ans = hotsAnswers[q.id];
                                if (!hots) return <td key={q.id} className="py-2.5 px-1 text-center text-slate-350 font-bold">-</td>;
                                const isCorrect = ans === q.answer;
                                return (
                                  <td key={q.id} className={`py-2.5 px-1 text-center font-black ${isCorrect ? "text-emerald-600" : "text-rose-500"}`}>
                                    {isCorrect ? "✓" : "✕"}
                                  </td>
                                );
                              })}
                              <td className="py-2.5 pl-2 font-mono font-black text-slate-800 text-right">
                                {hots ? `${correctCount}/${totalQ}` : "-"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      {/* Summary Row */}
                      <tfoot>
                        <tr className="bg-indigo-50/50 font-black border-t-2 border-slate-855">
                          <td className="py-2.5 pr-2 text-slate-700">Persentase Kelas</td>
                          {HOTS_QUESTIONS.map((q) => {
                            let correctAnswers = 0;
                            let submittedCount = 0;

                            selectedGroupStudents.forEach(student => {
                              const hots = student.progress?.hotsQuiz || null;
                              const hotsAnswers = hots?.answers || {};
                              if (hots) {
                                submittedCount++;
                                if (hotsAnswers[q.id] === q.answer) {
                                  correctAnswers++;
                                }
                              }
                            });

                            const successPct = submittedCount > 0 ? Math.round((correctAnswers / submittedCount) * 100) : 0;
                            return (
                              <td key={q.id} className="py-2.5 px-1 text-center text-indigo-705 font-mono">
                                {successPct}%
                              </td>
                            );
                          })}
                          <td className="py-2.5 pl-2 text-right text-indigo-705 font-mono">
                            {(() => {
                              let totalScoreSum = 0;
                              let count = 0;
                              selectedGroupStudents.forEach(s => {
                                if (s.progress?.hotsQuiz) {
                                  totalScoreSum += s.progress.hotsQuiz.score || 0;
                                  count++;
                                }
                              });
                              const classAverageHots = count > 0 ? Math.round(totalScoreSum / count) : 0;
                              return `${classAverageHots}%`;
                            })()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Part 2: Question List Breakdown */}
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Rincian Butir Pertanyaan HOTS</span>
                    {HOTS_QUESTIONS.map((q, idx) => {
                      // Calculate how many students answered this question correctly
                      let correctAnswers = 0;
                      let submittedStudentsCount = 0;

                      selectedGroupStudents.forEach(student => {
                        const hotsAnswers = student.progress?.hotsQuiz?.answers || {};
                        if (student.progress?.hotsQuiz) {
                          submittedStudentsCount++;
                          if (hotsAnswers[q.id] === q.answer) {
                            correctAnswers++;
                          }
                        }
                      });

                      const successRate = submittedStudentsCount > 0 ? Math.round((correctAnswers / submittedStudentsCount) * 100) : 0;
                      
                      let statusLabel = "Mudah";
                      let labelColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
                      if (successRate < 35) {
                        statusLabel = "Sukar (HOTS)";
                        labelColor = "bg-rose-100 text-rose-800 border-rose-300";
                      } else if (successRate < 70) {
                        statusLabel = "Sedang";
                        labelColor = "bg-amber-100 text-amber-800 border-amber-300";
                      }

                      return (
                        <div key={q.id || idx} className="p-3 border-2 border-slate-800 rounded-2xl bg-slate-50 space-y-2 text-left text-[8.5px]">
                          <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                            <span className="font-black text-slate-500 uppercase text-[8px]">Soal {idx + 1}</span>
                            <span className={`px-2 py-0.5 rounded-lg border text-[7.5px] font-black ${labelColor}`}>
                              {statusLabel} ({successRate}% Benar)
                            </span>
                          </div>
                          <p className="font-bold text-slate-800 leading-normal">{q.question}</p>
                          <span className="text-[7.5px] text-slate-400 block mt-1 leading-normal italic">
                            *Terjawab Benar: {correctAnswers} dari {submittedStudentsCount} siswa yang mengerjakan.
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: BANK SOAL (QUIZ MANAGER & AI BUILDER) */}
          {activeTab === 'question_bank' && (
            <div className="space-y-4 animate-scale-up">
              
              {/* Custom Quiz Creator Panel */}
              <div className="bg-white border-2 border-slate-800 rounded-3xl p-4 shadow-[4px_4px_0px_#1e293b] space-y-3.5">
                <div className="flex justify-between items-center border-b border-slate-205 pb-2">
                  <h3 className="text-[10px] font-black text-slate-855 uppercase tracking-wider flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-indigo-650" /> Pembuat Kuis Kustom (Quiz Builder)
                  </h3>
                  
                  {/* Select Builder Option */}
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => { sound.playClick(); setQuizBuildMethod('manual'); }}
                      className={`px-2.5 py-1 rounded-lg border-2 text-[8px] font-black uppercase cursor-pointer transition shadow-3xs ${
                        quizBuildMethod === 'manual' 
                          ? "bg-indigo-50 border-indigo-650 text-indigo-850" 
                          : "bg-white border-slate-800 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      ✍️ Manual
                    </button>
                    <button
                      type="button"
                      onClick={() => { sound.playClick(); setQuizBuildMethod('ai'); }}
                      className={`px-2.5 py-1 rounded-lg border-2 text-[8px] font-black uppercase cursor-pointer transition shadow-3xs ${
                        quizBuildMethod === 'ai' 
                          ? "bg-indigo-50 border-indigo-650 text-indigo-850" 
                          : "bg-white border-slate-800 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      ✨ BioBot AI
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-left">
                  <div>
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-wide block mb-1">Judul Kuis</label>
                    <input
                      type="text"
                      placeholder="Contoh: Kuis Hibrid Mendel"
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      className="w-full px-3 py-2 text-[9.5px] font-bold border-2 border-slate-800 rounded-xl outline-none placeholder-slate-400 focus:border-indigo-605 transition bg-[#fafafa]"
                    />
                  </div>

                  {quizQuestions.length > 0 && (
                    <div className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-2xl space-y-2">
                      <span className="text-[8px] font-black text-indigo-800 uppercase block">Pertanyaan Ditambahkan ({quizQuestions.length})</span>
                      <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                        {quizQuestions.map((q, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-white p-2 border border-slate-205 rounded-lg text-[8.5px] font-bold">
                            <span className="truncate flex-1 pr-2 text-left">{idx + 1}. {q.question}</span>
                            <button
                              onClick={() => handleRemoveQuestion(idx)}
                              className="text-rose-650 font-black px-1.5 py-0.5 hover:bg-rose-50 rounded cursor-pointer transition"
                            >
                              Hapus
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {quizBuildMethod === 'manual' ? (
                    <div className="p-3 border-2 border-dashed border-slate-350 rounded-2xl space-y-2.5">
                      <span className="text-[8px] font-black text-slate-500 uppercase block text-left">Tambah Butir Pertanyaan Pilihan Ganda</span>
                      <input
                        type="text"
                        placeholder="Teks Soal / Pertanyaan..."
                        value={qText}
                        onChange={(e) => setQText(e.target.value)}
                        className="w-full px-3 py-2 text-[9px] font-bold border-2 border-slate-800 rounded-xl outline-none"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Opsi A"
                          value={qOptA}
                          onChange={(e) => setQOptA(e.target.value)}
                          className="px-2.5 py-1.5 text-[8.5px] font-medium border border-slate-400 rounded-lg outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Opsi B"
                          value={qOptB}
                          onChange={(e) => setQOptB(e.target.value)}
                          className="px-2.5 py-1.5 text-[8.5px] font-medium border border-slate-400 rounded-lg outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Opsi C"
                          value={qOptC}
                          onChange={(e) => setQOptC(e.target.value)}
                          className="px-2.5 py-1.5 text-[8.5px] font-medium border border-slate-400 rounded-lg outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Opsi D"
                          value={qOptD}
                          onChange={(e) => setQOptD(e.target.value)}
                          className="px-2.5 py-1.5 text-[8.5px] font-medium border border-slate-400 rounded-lg outline-none"
                        />
                      </div>

                      <div className="flex gap-2 items-center text-left">
                        <div className="flex-1">
                          <label className="text-[7px] font-black text-slate-500 block mb-0.5">KUNCI JAWABAN</label>
                          <select
                            value={qAnswer}
                            onChange={(e) => setQAnswer(e.target.value)}
                            className="w-full p-1.5 text-[9px] font-black border border-slate-400 rounded-lg bg-white"
                          >
                            <option value="A">Opsi A</option>
                            <option value="B">Opsi B</option>
                            <option value="C">Opsi C</option>
                            <option value="D">Opsi D</option>
                          </select>
                        </div>
                        <div className="flex-[2]">
                          <label className="text-[7px] font-black text-slate-500 block mb-0.5">PENJELASAN (OPSIONAL)</label>
                          <input
                            type="text"
                            placeholder="Mengapa opsi ini benar..."
                            value={qExplanation}
                            onChange={(e) => setQExplanation(e.target.value)}
                            className="w-full px-2 py-1.5 text-[8.5px] font-medium border border-slate-400 rounded-lg outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="w-full py-1.5 bg-indigo-50 border border-indigo-400 text-indigo-850 font-black text-[8.5px] rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>TAMBAHKAN SOAL</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 border-2 border-dashed border-indigo-400 bg-indigo-50/5 rounded-2xl space-y-3.5 relative overflow-hidden">
                      {aiGenerating && (
                        <div className="absolute inset-0 bg-white/95 z-30 flex flex-col items-center justify-center space-y-3">
                          <Brain className="w-6 h-6 text-indigo-650 animate-pulse" />
                          <span className="text-[8.5px] font-bold text-slate-500">BioBot AI sedang merumuskan...</span>
                        </div>
                      )}
                      <div className="text-left border-b border-indigo-200 pb-2">
                        <span className="text-[8.5px] font-black text-indigo-700 uppercase tracking-widest flex items-center gap-1">
                          <Sparkles className="w-4 h-4 text-indigo-650" /> BioBot AI Generator
                        </span>
                      </div>
                      <div className="space-y-2 text-left">
                        <label className="text-[7.5px] font-black text-slate-500 uppercase tracking-wide block mb-1">Topik Genetika</label>
                        <select
                          value={aiTopic}
                          onChange={(e) => setAiTopic(e.target.value)}
                          className="w-full p-2 text-[9px] font-black border-2 border-slate-800 rounded-xl bg-white outline-none"
                        >
                          <option value="monohibrid">Monohibrida & Hukum I</option>
                          <option value="dihibrid">Dihibrida & Hukum II</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setAiGenerating(true);
                          setTimeout(() => {
                            const pool = AI_QUESTION_POOL[aiTopic] || [];
                            setQuizQuestions(pool);
                            setQuizTitle(`Kuis AI: ${aiTopic === 'monohibrid' ? 'Monohibrida' : 'Dihibrida'}`);
                            sound.playCorrect();
                            setAiGenerating(false);
                          }, 1000);
                        }}
                        className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-indigo-650 text-white border-2 border-slate-800 font-black text-[9px] rounded-xl flex items-center justify-center gap-1 cursor-pointer active:translate-y-0.2"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>GENERATE DENGAN AI</span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSaveQuiz}
                  disabled={loading || !quizTitle.trim() || quizQuestions.length === 0}
                  className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-650 text-white font-black text-[9px] border-2 border-slate-800 rounded-xl shadow-3xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>SIMPAN DAN AKTIFKAN KUIS DI KELAS</span>
                </button>
              </div>

              {/* List of active custom quizzes */}
              <div className="bg-white border-2 border-slate-800 rounded-3xl p-4 shadow-[4px_4px_0px_#1e293b] space-y-3">
                <h3 className="text-[10px] font-black text-slate-855 uppercase tracking-wider">Daftar Kuis Kelas ({selectedGroup.quizzes?.length || 0})</h3>
                {(!selectedGroup.quizzes || selectedGroup.quizzes.length === 0) ? (
                  <p className="text-[9.5px] font-bold text-slate-400 text-center py-3">Belum ada kuis.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedGroup.quizzes.map(qz => (
                      <div key={qz.id} className="p-3 border-2 border-slate-800 rounded-2xl bg-slate-50 flex items-center justify-between shadow-3xs">
                        <div className="text-left">
                          <h4 className="text-[10px] font-black text-slate-850 leading-tight">{qz.title}</h4>
                          <span className="text-[8px] font-black text-indigo-705 block mt-1">📝 Jumlah Soal: {qz.questions?.length || 0} butir</span>
                        </div>
                        <button
                          onClick={() => handleDeleteQuiz(qz.id)}
                          className="text-slate-400 hover:text-rose-650 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 8: MODUL DAN MATERI (CURRICULUM MODULES & SHARED LEARNING MATERIALS) */}
          {activeTab === 'modules_materials' && (
            <div className="space-y-4 animate-scale-up">
              
              {/* Sharing Materials to Class Form */}
              <div className="bg-white border-2 border-slate-800 rounded-3xl p-4 shadow-[4px_4px_0px_#1e293b] space-y-3">
                <h3 className="text-[10px] font-black text-slate-855 uppercase tracking-wider flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-indigo-650" /> Tambah Ringkasan Materi Baru
                </h3>
                <form onSubmit={handleAddMaterial} className="space-y-2.5 text-left">
                  <input
                    type="text"
                    required
                    placeholder="Judul Materi (Misal: Konsep Segregasi Alel)"
                    value={materialTitle}
                    onChange={(e) => setMaterialTitle(e.target.value)}
                    className="w-full px-3 py-2 text-[9.5px] font-bold border-2 border-slate-800 rounded-xl outline-none focus:border-indigo-605 transition bg-[#fafafa]"
                  />
                  <textarea
                    required
                    rows={3}
                    placeholder="Tulis ringkasan penjelasan materi di sini..."
                    value={materialContent}
                    onChange={(e) => setMaterialContent(e.target.value)}
                    className="w-full px-3 py-2 text-[9.5px] font-bold border-2 border-slate-800 rounded-xl outline-none focus:border-indigo-605 transition bg-[#fafafa] resize-none"
                  />
                  <input
                    type="url"
                    placeholder="Tautan URL Video/PDF Eksternal (Opsional)"
                    value={materialUrl}
                    onChange={(e) => setMaterialUrl(e.target.value)}
                    className="w-full px-3 py-2 text-[9.5px] font-bold border-2 border-slate-800 rounded-xl outline-none bg-[#fafafa]"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-slate-800 font-black text-[9px] rounded-xl flex items-center justify-center gap-1 cursor-pointer active:translate-y-0.2"
                  >
                    <span>BAGIKAN MATERI</span>
                  </button>
                </form>
              </div>

              {/* Shared Materials Table */}
              <div className="bg-white border-2 border-slate-800 rounded-3xl p-4 shadow-[4px_4px_0px_#1e293b] space-y-3">
                <h3 className="text-[10px] font-black text-slate-855 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Book className="w-4 h-4 text-indigo-605" /> Materi yang Telah Dibagikan ({selectedGroup.materials?.length || 0})
                </h3>
                {(!selectedGroup.materials || selectedGroup.materials.length === 0) ? (
                  <p className="text-[9.5px] font-bold text-slate-400 py-3 text-center">Belum ada materi dibagikan.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedGroup.materials.map(mat => {
                      const commentsCount = (mat.comments || []).length;
                      return (
                        <div key={mat.id} className="p-3 border-2 border-slate-800 rounded-2xl bg-slate-50 text-left relative shadow-3xs space-y-2">
                          <div className="flex justify-between items-start">
                            <h4 className="text-[10px] font-black text-slate-850 leading-tight pr-6">{mat.title}</h4>
                            <button
                              onClick={() => handleDeleteMaterial(mat.id)}
                              className="text-slate-400 hover:text-rose-650 cursor-pointer"
                              title="Hapus Materi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-[9px] font-bold text-slate-600 leading-relaxed whitespace-pre-wrap">{mat.content}</p>
                          {mat.url && (
                            <a href={mat.url} target="_blank" rel="noreferrer" className="text-[8px] font-black text-indigo-650 hover:underline block">
                              🔗 Baca Selengkapnya: {mat.url}
                            </a>
                          )}
                          
                          {/* Discussion / Q&A Button for Teacher */}
                          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => {
                                sound.playClick();
                                setActiveTeacherDiscussionMaterial(mat);
                                setActiveReplyingCommentId(null);
                                setTeacherReplyText('');
                              }}
                              className={`px-3 py-1.5 rounded-xl border-2 text-[8.5px] font-black flex items-center gap-1.5 cursor-pointer shadow-3xs transition ${
                                commentsCount > 0 
                                  ? 'bg-indigo-650 text-white border-slate-800 hover:bg-indigo-700' 
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Forum Tanya Jawab ({commentsCount} Pertanyaan)</span>
                            </button>
                            {commentsCount > 0 && (
                              <span className="text-[7.5px] font-black text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                                💬 Butuh tanggapan
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 9: LAPORAN HASIL BELAJAR (STUDY REPORT CARDS & EXPORTS) */}
          {activeTab === 'report_cards' && (
            <div className="bg-white border-2 border-slate-800 rounded-3xl p-4 shadow-[4px_4px_0px_#1e293b] space-y-4 animate-scale-up print:p-0 print:border-none print:shadow-none">
              <div className="text-left border-b border-slate-200 pb-2 flex justify-between items-center print:hidden">
                <div>
                  <h3 className="text-[10px] font-black text-slate-855 uppercase tracking-wider">Laporan Hasil Belajar Kelas</h3>
                  <p className="text-[8px] font-bold text-slate-400 mt-0.5 leading-none">Cetak lembar matriks jawaban kuis HOTS siswa kelas Anda.</p>
                </div>
                
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={handleDownloadCSV}
                    className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 font-black text-[8px] border border-slate-800 rounded-lg shadow-3xs cursor-pointer flex items-center gap-1 active:translate-y-0.2"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-650" />
                    <span>DOWNLOAD CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      window.print();
                    }}
                    className="px-2.5 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white font-black text-[8px] border-2 border-slate-800 rounded-lg shadow-3xs cursor-pointer flex items-center gap-1 active:translate-y-0.2"
                  >
                    <Printer className="w-3.5 h-3.5 text-white" />
                    <span>CETAK MATRIKS JAWABAN</span>
                  </button>
                </div>
              </div>

              {/* Printable Area - Matriks Jawaban Butir Soal */}
              <div className="space-y-4">
                <div className="border-2 border-slate-800 rounded-2xl bg-white p-4 overflow-x-auto print:border-none print:p-0">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-2.5 print:hidden">Matriks Jawaban Butir Soal (Cetak Lembar Laporan)</span>
                  
                  {selectedGroupStudents.length === 0 ? (
                    <p className="text-[9.5px] text-slate-400 text-center py-6">Belum ada data pengerjaan kuis siswa.</p>
                  ) : (
                    <table className="w-full text-[8.5px] print:text-[10px] border-collapse text-left">
                      <thead>
                        <tr className="border-b border-slate-350 bg-slate-50">
                          <th className="py-2.5 px-2 font-black text-slate-750 border border-slate-300">Nama Siswa</th>
                          {HOTS_QUESTIONS.map((q, idx) => (
                            <th key={q.id} className="py-2.5 px-1 font-black text-slate-750 text-center border border-slate-300">Q{idx + 1}</th>
                          ))}
                          <th className="py-2.5 px-2 font-black text-slate-750 text-right border border-slate-300">Skor / Hasil</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedGroupStudents.map((student) => {
                          const hots = student.progress?.hotsQuiz || null;
                          const hotsAnswers = hots?.answers || {};
                          const correctCount = hots?.correctCount || 0;
                          const totalQ = hots?.totalQuestions || HOTS_QUESTIONS.length;
                          const percentage = hots ? Math.round((correctCount / totalQ) * 100) : 0;

                          return (
                            <tr key={student.uid} className="hover:bg-slate-50 transition border-b border-slate-200">
                              <td className="py-2.5 px-2 font-black text-slate-800 border border-slate-200">{student.displayName}</td>
                              {HOTS_QUESTIONS.map((q) => {
                                const ans = hotsAnswers[q.id];
                                if (!hots) return <td key={q.id} className="py-2.5 px-1 text-center text-slate-450 font-bold border border-slate-200">-</td>;
                                const isCorrect = ans === q.answer;
                                return (
                                  <td 
                                    key={q.id} 
                                    className={`py-2.5 px-1 text-center font-black border border-slate-200 ${
                                      isCorrect ? "text-emerald-600 print:text-emerald-700" : "text-rose-500 print:text-rose-700"
                                    }`}
                                  >
                                    {isCorrect ? "✓" : "✕"}
                                  </td>
                                );
                              })}
                              <td className="py-2.5 px-2 font-mono font-black text-slate-800 text-right border border-slate-200">
                                {hots ? `${percentage}% (${correctCount}/${totalQ})` : "-"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-indigo-50/50 print:bg-slate-100 font-black">
                          <td className="py-2.5 px-2 text-slate-700 border border-slate-300">Persentase Kelas</td>
                          {HOTS_QUESTIONS.map((q) => {
                            let correctAnswers = 0;
                            let submittedCount = 0;

                            selectedGroupStudents.forEach(student => {
                              const hots = student.progress?.hotsQuiz || null;
                              const hotsAnswers = hots?.answers || {};
                              if (hots) {
                                submittedCount++;
                                if (hotsAnswers[q.id] === q.answer) {
                                  correctAnswers++;
                                }
                              }
                            });

                            const successPct = submittedCount > 0 ? Math.round((correctAnswers / submittedCount) * 100) : 0;
                            return (
                              <td key={q.id} className="py-2.5 px-1 text-center text-indigo-705 font-mono border border-slate-300">
                                {successPct}%
                              </td>
                            );
                          })}
                          <td className="py-2.5 px-2 text-right text-indigo-705 font-mono border border-slate-300">
                            {(() => {
                              let totalScoreSum = 0;
                              let count = 0;
                              selectedGroupStudents.forEach(s => {
                                if (s.progress?.hotsQuiz) {
                                  totalScoreSum += s.progress.hotsQuiz.score || 0;
                                  count++;
                                }
                              });
                              const classAverageHots = count > 0 ? Math.round(totalScoreSum / count) : 0;
                              return `Rata-rata: ${classAverageHots}%`;
                            })()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
      ) : (
        /* Display if no class selected and list is empty */
        <div className="bg-white border-2 border-slate-800 rounded-3xl p-6 shadow-[4px_4px_0px_#1e293b] text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border-2 border-slate-800 p-2.5 flex items-center justify-center mx-auto shadow-3xs">
            <Users className="w-6 h-6 text-indigo-650" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-850 uppercase font-sans">Belum Ada Kelompok Kelas</h3>
            <p className="text-[9.5px] font-bold text-slate-500 mt-1.5 leading-relaxed max-w-[280px] mx-auto">
              Silakan buat kelompok kelas belajar baru terlebih dahulu di menu "Kelas Saya" agar data monitoring siswa dapat diakses.
            </p>
          </div>
        </div>
      )}

      {/* STUDENT QUIZ PROGRESS OVERLAY MODAL */}
      {activeStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-[3px] border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-[8px_8px_0px_#1e293b] flex flex-col max-h-[85vh] animate-scale-up">
            
            <div className="p-4 bg-indigo-50 border-b-[3px] border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2 text-left">
                <div className="w-8 h-8 rounded-xl bg-indigo-150 border-2 border-slate-800 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-indigo-755 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-slate-800 uppercase leading-none font-sans">{activeStudentModal.displayName}</h4>
                  <span className="text-[8px] font-bold text-slate-500 leading-none block mt-1">{activeStudentModal.email}</span>
                </div>
              </div>
              <button
                onClick={() => setActiveStudentModal(null)}
                className="p-1 rounded-lg border-2 border-slate-800 bg-white hover:bg-slate-50 text-slate-700 transition cursor-pointer"
              >
                <X className="w-4.5 h-4.5 stroke-[3px]" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 border-2 border-slate-800 rounded-2xl bg-slate-50">
                  <span className="text-[6.5px] font-black text-slate-400 block uppercase">Skor Game</span>
                  <span className="text-[11px] font-black text-slate-800 font-mono mt-0.5 block leading-none">
                    {activeStudentModal.progress?.score || 0}
                  </span>
                </div>
                <div className="p-2 border-2 border-slate-800 rounded-2xl bg-slate-50">
                  <span className="text-[6.5px] font-black text-slate-400 block uppercase">Stage</span>
                  <span className="text-[11px] font-black text-indigo-700 font-mono mt-0.5 block leading-none">
                    Lvl {activeStudentModal.progress?.unlockedStage || 1}
                  </span>
                </div>
                <div className="p-2 border-2 border-slate-800 rounded-2xl bg-slate-50">
                  <span className="text-[6.5px] font-black text-slate-400 block uppercase">Lencana</span>
                  <span className="text-[11px] font-black text-emerald-700 font-mono mt-0.5 block leading-none">
                    🏆 {activeStudentModal.progress?.badges?.length || 0}
                  </span>
                </div>
              </div>

              {/* HOTS Quiz stats */}
              <div className="space-y-2 border-t border-slate-205 pt-3">
                <h5 className="text-[9px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1 text-left">
                  <Brain className="w-4 h-4 text-indigo-650" /> 1. Kuis Evaluasi HOTS (Sistem)
                </h5>
                
                {activeStudentModal.progress?.hotsQuiz ? (
                  (() => {
                    const hotsData = activeStudentModal.progress.hotsQuiz;
                    const accuracy = hotsData.totalQuestions > 0 ? Math.round((hotsData.correctCount / hotsData.totalQuestions) * 100) : 0;
                    
                    return (
                      <div className="p-2.5 border-2 border-slate-800 rounded-2xl bg-slate-50 space-y-1.5 shadow-3xs text-left">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[9.5px] font-black text-slate-850 block">Kuis Evaluasi Genetika Mandiri</span>
                            <span className="text-[7.5px] font-bold text-slate-450 mt-0.5 block">
                              Akurasi: <strong className="text-emerald-700">{hotsData.correctCount}/{hotsData.totalQuestions} ({accuracy}%)</strong>
                            </span>
                          </div>
                          
                          <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                            <span className="text-[10px] font-mono font-black text-indigo-755 leading-none">
                              Skor: {hotsData.score || 0}
                            </span>
                            <button
                              onClick={() => {
                                sound.playClick();
                                setActiveReviewQuiz({
                                  title: "Kuis Evaluasi HOTS (Sistem)",
                                  studentName: activeStudentModal.displayName,
                                  questions: HOTS_QUESTIONS,
                                  answers: hotsData.answers || {}
                                });
                              }}
                              className="px-2 py-0.8 bg-indigo-55 hover:bg-indigo-100 text-indigo-850 font-black text-[7px] border border-indigo-400 rounded-md transition shadow-3xs cursor-pointer flex items-center gap-0.5"
                            >
                              <Eye className="w-2.5 h-2.5" />
                              <span>LIHAT JAWABAN</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="p-3 border-2 border-dashed border-slate-300 rounded-2xl text-center">
                    <p className="text-[8.5px] font-bold text-slate-400">Siswa belum mengerjakan kuis.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t-2 border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveStudentModal(null)}
                className="px-4 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white font-black text-[9px] border-2 border-slate-800 rounded-xl cursor-pointer"
              >
                TUTUP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT QUIZ DETAILED ANSWERS REVIEW MODAL */}
      {activeReviewQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-[3px] border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-[8px_8px_0px_#1e293b] flex flex-col max-h-[85vh] animate-scale-up">
            
            <div className="p-4 bg-indigo-50 border-b-[3px] border-slate-800 flex justify-between items-center">
              <div className="text-left">
                <span className="text-[8px] font-black text-indigo-755 uppercase tracking-widest leading-none">Review Lembar Jawaban</span>
                <h3 className="text-xs font-black text-slate-855 mt-1 leading-tight">{activeReviewQuiz.studentName}</h3>
              </div>
              <button
                onClick={() => { sound.playClick(); setActiveReviewQuiz(null); }}
                className="p-1 rounded-lg border-2 border-slate-800 bg-white hover:bg-slate-50 text-slate-700 transition cursor-pointer"
              >
                <X className="w-4.5 h-4.5 stroke-[3px]" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 flex-1 text-left">
              <div className="bg-slate-50 border-2 border-slate-800 p-3 rounded-2xl mb-1 flex items-center justify-between gap-3 shadow-3xs">
                <div>
                  <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest block leading-none">JUDUL KUIS</span>
                  <span className="text-[10px] font-black text-slate-800 leading-tight block mt-1">{activeReviewQuiz.title}</span>
                </div>
                <Brain className="w-6 h-6 text-indigo-650 flex-shrink-0" />
              </div>

              <div className="space-y-3.5">
                {activeReviewQuiz.questions.map((q, idx) => {
                  const studentChoice = activeReviewQuiz.answers?.[q.id];
                  const isCorrect = studentChoice === q.answer;

                  return (
                    <div key={q.id || idx} className="p-3.5 border-2 border-slate-800 rounded-2xl bg-white shadow-3xs space-y-2.5">
                      <div className="flex justify-between items-center gap-2 border-b border-slate-200 pb-1.5">
                        <span className="text-[8px] font-black text-slate-400 uppercase">Pertanyaan {idx + 1}</span>
                        <span className={`text-[7.5px] font-black px-2 py-0.5 rounded-lg border ${
                          isCorrect ? "bg-emerald-100 text-emerald-800 border-emerald-450" : "bg-rose-100 text-rose-800 border-rose-450"
                        }`}>
                          {isCorrect ? "BENAR" : "SALAH"}
                        </span>
                      </div>

                      <p className="text-[9.5px] font-bold text-slate-855 leading-relaxed">{q.question}</p>

                      <div className="flex flex-col gap-1.5">
                        {q.options.map((opt) => {
                          const isChosen = studentChoice === opt.key;
                          const isCorrectOpt = opt.key === q.answer;

                          let optStyle = "bg-white border-slate-205 text-slate-800";
                          if (isChosen) {
                            optStyle = isCorrectOpt
                              ? "bg-emerald-100 border-emerald-600 text-emerald-900 font-black"
                              : "bg-rose-100 border-rose-600 text-rose-900 font-black";
                          } else if (isCorrectOpt) {
                            optStyle = "bg-emerald-50 border-emerald-500 text-emerald-855 font-black";
                          }

                          return (
                            <div key={opt.key} className={`p-2 rounded-xl border-2 text-[8.5px] font-bold flex items-start gap-2 ${optStyle}`}>
                              <span className="w-4 h-4 rounded border-2 border-slate-800 flex items-center justify-center flex-shrink-0 text-[7.5px] font-black bg-white">
                                {opt.key}
                              </span>
                              <span className="flex-1 leading-normal">{opt.text}</span>
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div className="p-2.5 bg-indigo-50/40 border border-indigo-200 rounded-xl text-[8px] font-semibold text-slate-600 leading-normal">
                          <span className="text-[7px] font-black text-indigo-755 uppercase block mb-0.5">Eksplanasi:</span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t-2 border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveReviewQuiz(null)}
                className="px-4 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white font-black text-[9px] border-2 border-slate-800 rounded-xl cursor-pointer"
              >
                TUTUP REVIEW
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TEACHER MATERIAL Q&A DISCUSSION MODAL */}
      {activeTeacherDiscussionMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-white border-[3px] border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-[8px_8px_0px_#1e293b] flex flex-col max-h-[88vh] animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-4 bg-indigo-50 border-b-[3px] border-slate-800 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-150 border-2 border-slate-800 flex items-center justify-center">
                  <MessageSquare className="w-4.5 h-4.5 text-indigo-700" />
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-slate-855 uppercase leading-none font-sans">
                    Forum Tanya Jawab & Diskusi
                  </h4>
                  <span className="text-[8px] font-bold text-slate-500 block mt-1 truncate max-w-[260px]">
                    {activeTeacherDiscussionMaterial.title}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTeacherDiscussionMaterial(null);
                  setActiveReplyingCommentId(null);
                }}
                className="p-1 rounded-lg border-2 border-slate-800 bg-white hover:bg-slate-50 text-slate-700 transition cursor-pointer"
              >
                <X className="w-4.5 h-4.5 stroke-[3px]" />
              </button>
            </div>

            {/* Scrollable Comments List */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              
              {/* Material Overview Banner */}
              <div className="p-3 bg-slate-50 border-2 border-slate-800 rounded-2xl space-y-1">
                <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block">Ringkasan Materi</span>
                <p className="text-[9.5px] font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {activeTeacherDiscussionMaterial.content}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-700 uppercase tracking-wider">
                    Daftar Pertanyaan Siswa ({(activeTeacherDiscussionMaterial.comments || []).length})
                  </span>
                  <span className="text-[7.5px] font-bold text-slate-400">
                    Klik "Balas" untuk memberikan penjelasan guru
                  </span>
                </div>

                {(!activeTeacherDiscussionMaterial.comments || activeTeacherDiscussionMaterial.comments.length === 0) ? (
                  <div className="p-6 border-2 border-dashed border-slate-300 rounded-2xl text-center space-y-1">
                    <p className="text-[10px] font-bold text-slate-400">Belum ada pertanyaan dari siswa pada materi ini.</p>
                    <span className="text-[8px] font-medium text-slate-400">Pertanyaan yang diajukan siswa di kelas akan muncul di sini.</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeTeacherDiscussionMaterial.comments.map((comm) => (
                      <div key={comm.id} className="p-3.5 bg-white border-2 border-slate-800 rounded-2xl space-y-2 shadow-2xs">
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black text-slate-900">{comm.authorName}</span>
                            <span className="px-1.5 py-0.2 rounded text-[7px] font-black bg-emerald-100 text-emerald-800 uppercase">
                              {comm.authorRole === 'guru' ? 'Guru' : 'Siswa'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[7.5px] font-bold text-slate-400">
                              {comm.createdAt ? new Date(comm.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                            <button
                              onClick={() => handleDeleteComment(comm.id)}
                              className="text-slate-300 hover:text-rose-600 transition cursor-pointer p-0.5"
                              title="Hapus Pertanyaan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-[10px] font-bold text-slate-800 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          {comm.text}
                        </p>

                        {/* Existing Replies List */}
                        {comm.replies && comm.replies.length > 0 && (
                          <div className="pl-3 border-l-2 border-indigo-400 space-y-2 pt-1">
                            {comm.replies.map(rep => (
                              <div key={rep.id} className="p-2.5 bg-indigo-50/90 border border-indigo-200 rounded-xl space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] font-black text-indigo-950">{rep.authorName}</span>
                                  <span className="px-1.5 py-0.2 rounded text-[6.5px] font-black bg-indigo-200 text-indigo-900 uppercase">
                                    👨‍🏫 Jawaban Guru
                                  </span>
                                  <span className="text-[7px] text-slate-400 ml-auto">
                                    {rep.createdAt ? new Date(rep.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}
                                  </span>
                                </div>
                                <p className="text-[9.5px] font-medium text-slate-800 leading-relaxed">{rep.text}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply Form */}
                        {activeReplyingCommentId === comm.id ? (
                          <div className="pt-2 space-y-2 border-t border-slate-200">
                            <textarea
                              rows={2}
                              value={teacherReplyText}
                              onChange={(e) => setTeacherReplyText(e.target.value)}
                              placeholder="Tulis penjelasan/jawaban guru untuk pertanyaan ini..."
                              className="w-full p-2.5 text-[9.5px] font-bold border-2 border-slate-800 rounded-xl bg-indigo-50/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            />
                            <div className="flex justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveReplyingCommentId(null);
                                  setTeacherReplyText('');
                                }}
                                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[8.5px] font-black rounded-lg border border-slate-300 cursor-pointer"
                              >
                                Batal
                              </button>
                              <button
                                type="button"
                                disabled={submittingTeacherReply || !teacherReplyText.trim()}
                                onClick={() => handleSendTeacherReply(comm.id)}
                                className="px-3.5 py-1 bg-indigo-650 hover:bg-indigo-700 text-white text-[8.5px] font-black rounded-lg border-2 border-slate-800 flex items-center gap-1 shadow-3xs cursor-pointer disabled:opacity-50"
                              >
                                <Send className="w-3 h-3" />
                                <span>{submittingTeacherReply ? 'Mengirim...' : 'Kirim Jawaban Guru'}</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="pt-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                sound.playClick();
                                setActiveReplyingCommentId(comm.id);
                                setTeacherReplyText('');
                              }}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[8px] font-black rounded-lg border border-indigo-200 flex items-center gap-1 cursor-pointer transition shadow-3xs"
                            >
                              <MessageSquare className="w-3 h-3 text-indigo-600" />
                              <span>Jawab Pertanyaan</span>
                            </button>
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                )}

              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t-2 border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTeacherDiscussionMaterial(null);
                  setActiveReplyingCommentId(null);
                }}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-[9px] border-2 border-slate-800 rounded-xl cursor-pointer"
              >
                TUTUP FORUM
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
