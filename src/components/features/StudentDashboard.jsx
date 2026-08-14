import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useGame } from '../../context/GameContext';
import { sound } from '../../services/sound';
import { 
  GraduationCap, 
  Search, 
  Trophy, 
  Megaphone, 
  Award,
  CheckCircle2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  XCircle,
  ArrowRight,
  Star,
  X,
  ClipboardList
} from 'lucide-react';

export const StudentDashboard = () => {
  const { currentUser, userName, groupId, setGroupId, userProgress, showAlert, showConfirm } = useGame();
  
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [studentGroupInfo, setStudentGroupInfo] = useState(null);
  const [classmates, setClassmates] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Custom Quiz Scores state (synchronized locally for instant updates)
  const [customQuizScores, setCustomQuizScores] = useState({});

  // Material details modal state
  const [activeMaterialModal, setActiveMaterialModal] = useState(null);

  // Custom Quiz taking states
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null); // 'A', 'B', 'C', 'D'
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});

  useEffect(() => {
    if (userProgress && userProgress.customQuizzes) {
      setCustomQuizScores(userProgress.customQuizzes);
    } else {
      setCustomQuizScores({});
    }
  }, [userProgress]);

  const fetchStudentGroupInfo = async (gId) => {
    const code = gId || groupId;
    if (!code) return;
    try {
      const groupDoc = await getDoc(doc(db, 'groups', code));
      if (groupDoc.exists()) {
        const groupData = groupDoc.data();
        setStudentGroupInfo(groupData);
        
        // Fetch all classmates (members of the group)
        if (groupData.students && groupData.students.length > 0) {
          setLoading(true);
          const classmateDetails = [];
          for (const stu of groupData.students) {
            const userDoc = await getDoc(doc(db, 'users', stu.uid));
            if (userDoc.exists()) {
              classmateDetails.push(userDoc.data());
            }
          }
          // Sort by score descending
          classmateDetails.sort((a, b) => (b.progress?.score || 0) - (a.progress?.score || 0));
          setClassmates(classmateDetails);
        }
      }
    } catch (err) {
      console.error("Error fetching student group details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchStudentGroupInfo();
    }
  }, [currentUser, groupId]);

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;

    sound.playClick();
    setLoading(true);
    setMessage({ text: '', type: '' });

    const code = joinCodeInput.trim().toUpperCase();

    try {
      // 1. Check if group exists in database
      const groupDoc = await getDoc(doc(db, 'groups', code));
      if (!groupDoc.exists()) {
        sound.playWrong();
        setMessage({ text: 'Kode kelompok tidak ditemukan. Silakan periksa kembali.', type: 'error' });
        setLoading(false);
        return;
      }

      const groupData = groupDoc.data();

      // 2. Check if student already in the group list
      const alreadyJoined = groupData.students.some(s => s.uid === currentUser.uid);

      if (!alreadyJoined) {
        // Add student to the group document
        await updateDoc(doc(db, 'groups', code), {
          students: arrayUnion({
            uid: currentUser.uid,
            name: userName
          })
        });
      }

      // 3. Link student profile to group code
      await updateDoc(doc(db, 'users', currentUser.uid), {
        groupId: code
      });

      sound.playCorrect();
      setGroupId(code);
      fetchStudentGroupInfo(code);
      setMessage({ text: "Berhasil bergabung ke kelompok \"" + groupData.groupName + "\"!", type: 'success' });
      setJoinCodeInput('');
    } catch (err) {
      sound.playWrong();
      console.error(err);
      setMessage({ text: 'Gagal bergabung. Silakan coba kembali.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (quiz) => {
    sound.playClick();
    setActiveQuiz(quiz);
    setCurrentQIdx(0);
    setSelectedOption(null);
    setCorrectAnswers(0);
    setUserAnswers({});
    setQuizFinished(false);
  };

  const handleSelectQuizOption = (key) => {
    if (selectedOption !== null) return; // Answer locked
    setSelectedOption(key);
    
    const currentQ = activeQuiz.questions[currentQIdx];
    setUserAnswers(prev => ({ ...prev, [currentQ.id]: key }));

    if (key === currentQ.answer) {
      sound.playCorrect();
      setCorrectAnswers(prev => prev + 1);
    } else {
      sound.playWrong();
    }
  };

  const handleNextQuizQuestion = () => {
    sound.playClick();
    if (currentQIdx < activeQuiz.questions.length - 1) {
      setCurrentQIdx(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setQuizFinished(true);
      sound.playFanfare();
    }
  };

  const handleFinishAndSubmitQuiz = async () => {
    sound.playClick();
    setLoading(true);
    setMessage({ text: '', type: '' });

    const totalQ = activeQuiz.questions.length;
    const finalScore = Math.round((correctAnswers / totalQ) * 100);

    try {
      const updatedCustomQuizzes = {
        ...customQuizScores,
        [activeQuiz.id]: {
          score: finalScore,
          correctCount: correctAnswers,
          totalQuestions: totalQ,
          answers: userAnswers,
          completedAt: new Date().toISOString()
        }
      };

      // Sync progress to Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        'progress.customQuizzes': updatedCustomQuizzes
      });

      setCustomQuizScores(updatedCustomQuizzes);
      setMessage({ text: "Kuis \"" + activeQuiz.title + "\" berhasil dikerjakan! Nilai: " + finalScore, type: 'success' });
      setActiveQuiz(null);
      
      // Refresh classroom leaderboard to update scores
      fetchStudentGroupInfo();
    } catch (err) {
      sound.playWrong();
      console.error(err);
      setMessage({ text: 'Gagal mengirim nilai kuis.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const starsCount = userProgress.stars ? Object.values(userProgress.stars).reduce((a, b) => a + b, 0) : 0;

  // Render Quiz Taking Layout
  if (activeQuiz) {
    const currentQuestion = activeQuiz.questions[currentQIdx];
    const totalQuestions = activeQuiz.questions.length;

    return (
      <div className="w-full min-h-screen relative overflow-hidden bg-[#faf6ee] select-none flex flex-col p-4 md:p-8 text-left">
        {/* HUD Top Bar */}
        <div className="w-full p-3 md:p-5 rounded-2xl bg-white border-2 border-slate-800 shadow-[4px_4px_0px_#1e293b] flex items-center justify-between gap-2 z-30 relative mb-4 md:mb-6 flex-shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => {
                sound.playClick();
                showConfirm("Apakah Anda yakin ingin membatalkan kuis ini? Jawaban tidak akan disimpan.", () => {
                  setActiveQuiz(null);
                });
              }}
              className="p-1 md:p-1.5 rounded-lg border-2 border-slate-800 bg-white hover:bg-slate-55 text-slate-700 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 stroke-[3px]" />
            </button>
            <div>
              <span className="text-[7.5px] md:text-[10px] font-black text-indigo-755 uppercase tracking-widest block font-sans">Kuis Kustom Guru</span>
              <h2 className="text-[11px] sm:text-xs md:text-sm font-black text-black leading-tight">{activeQuiz.title}</h2>
            </div>
          </div>
          <div className="text-[9px] font-black text-slate-855 bg-indigo-50 border-2 border-slate-800 px-3 py-1 rounded-xl shadow-3xs">
            Soal {currentQIdx + 1}/{totalQuestions}
          </div>
        </div>

        {!quizFinished ? (
          <div className="flex-1 flex flex-col justify-between relative z-10 py-1 overflow-y-auto space-y-4">
            {/* Question Card */}
            <div className="bg-white border-2 border-slate-800 rounded-3xl p-4 sm:p-5 shadow-[4px_4px_0px_#1e293b] flex flex-col gap-3.5 relative overflow-hidden flex-shrink-0">
              <div className="border-b-2 border-slate-800 pb-2 flex justify-between items-center">
                <span className="text-[8.5px] font-black text-indigo-755 uppercase tracking-widest block font-sans">Pilihan Ganda</span>
                <span className="text-[8.5px] font-black text-slate-400">Poin: 100</span>
              </div>

              {/* Question Text */}
              <div className="p-3 bg-indigo-500/5 border-2 border-slate-800 rounded-2xl text-[10px] font-bold text-slate-800 leading-relaxed text-left flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-650 flex-shrink-0 mt-0.5" />
                <p>{currentQuestion.question}</p>
              </div>

              {/* Multiple choices */}
              <div className="flex flex-col gap-2">
                {currentQuestion.options.map((opt) => {
                  const isSelected = selectedOption === opt.key;
                  const isCorrect = opt.key === currentQuestion.answer;
                  const isLocked = selectedOption !== null;

                  let btnStyle = "bg-white border-slate-855 hover:bg-slate-50 text-slate-850";
                  
                  if (isLocked) {
                    if (isSelected) {
                      btnStyle = isCorrect
                        ? "bg-emerald-100 border-emerald-600 text-emerald-900 font-extrabold"
                        : "bg-rose-100 border-rose-600 text-rose-900 font-extrabold animate-shake";
                    } else if (isCorrect) {
                      btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-800 font-extrabold";
                    } else {
                      btnStyle = "bg-slate-50 border-slate-202 text-slate-400 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleSelectQuizOption(opt.key)}
                      disabled={isLocked}
                      className={"w-full p-2.5 rounded-2xl border-2 text-[9.5px] font-bold text-left shadow-3xs cursor-pointer flex items-start gap-2 transition active:translate-y-0.5 active:shadow-none hover:scale-[1.005] " + btnStyle}
                    >
                      <span className="w-4.5 h-4.5 rounded-lg border-2 border-slate-850 flex items-center justify-center flex-shrink-0 text-[9.5px] font-black bg-white">
                        {opt.key}
                      </span>
                      <p className="flex-1 leading-normal">{opt.text}</p>
                    </button>
                  );
                })}
              </div>

              {/* Answer Feedback Alert */}
              {selectedOption !== null && (
                <div className="space-y-3 border-t border-slate-300 pt-3 animate-scale-up">
                  <div className={"p-2.5 rounded-xl border-2 border-slate-800 flex items-start gap-2.5 text-[9px] font-bold shadow-[2px_2px_0px_#1e293b] text-left leading-normal " + (
                    selectedOption === currentQuestion.answer ? "bg-emerald-100 text-emerald-855" : "bg-rose-100 text-rose-855"
                  )}>
                    {selectedOption === currentQuestion.answer ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-[9.5px] font-black text-emerald-900">BENAR!</strong>
                          <p className="mt-0.5">{currentQuestion.explanation || 'Jawaban Anda tepat sekali.'}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-650 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-[9.5px] font-black text-rose-900">KURANG TEPAT</strong>
                          <p className="mt-0.5">{currentQuestion.explanation || 'Pelajari materi kembali untuk pemahaman lebih baik.'}</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleNextQuizQuestion}
                      className="px-5 py-2 rounded-xl border-2 border-slate-800 bg-gradient-to-r from-purple-500 to-indigo-655 text-white font-black text-[9px] shadow-[2px_2px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer hover:scale-102"
                    >
                      <span>{currentQIdx < totalQuestions - 1 ? 'PERTANYAAN BERIKUTNYA' : 'LIHAT HASIL'}</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[3.5px]" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Finished summary layout */
          <div className="flex-1 flex items-center justify-center py-2 animate-scale-up">
            <div className="p-6 rounded-3xl text-center space-y-4 max-w-sm w-full border-2 border-slate-800 bg-white shadow-[4px_4px_0px_#1e293b]">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border-2 border-slate-800 p-2.5 flex items-center justify-center mx-auto shadow-3xs">
                <Trophy className="w-8 h-8 text-amber-500 fill-amber-500" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[8px] font-black text-indigo-755 uppercase tracking-widest font-sans">Kuis Selesai!</span>
                <h3 className="text-base font-black text-black">HASIL PENGERJAAN</h3>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed px-1">
                  {"Selamat! Kamu telah menyelesaikan kuis kustom \"" + activeQuiz.title + "\" yang dibagikan oleh gurumu."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-350 p-2.5 rounded-2xl text-[9px] font-bold text-slate-700">
                <div className="border-r border-slate-205 py-1">
                  <span className="block text-[14px] font-black text-indigo-755">{correctAnswers} / {totalQuestions}</span>
                  <span className="block text-[7px] text-slate-400 uppercase font-black">BENAR</span>
                </div>
                <div className="py-1">
                  <span className="block text-[14px] font-black text-amber-600">
                    {Math.round((correctAnswers / totalQuestions) * 100)}
                  </span>
                  <span className="block text-[7px] text-slate-400 uppercase font-black">SKOR AKHIR</span>
                </div>
              </div>

              <button
                onClick={handleFinishAndSubmitQuiz}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-extrabold text-[10px] flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#1e293b] border-2 border-slate-800 cursor-pointer active:translate-y-0.5 active:shadow-none transition-all"
              >
                <span>SIMPAN DAN KIRIM NILAI GURU</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      
      {/* Feedback Banner */}
      {message.text && (
        <div className={"p-3 border-2 border-slate-800 rounded-2xl text-[9px] font-bold shadow-[2px_2px_0px_#1e293b] flex items-center gap-2 animate-scale-up " + (
          message.type === 'success' ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
        )}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-655" /> : <Megaphone className="w-4 h-4 text-rose-655" />}
          <span>{message.text}</span>
        </div>
      )}

      {!groupId ? (
        /* JOIN GROUP FORM */
        <div className="bg-white border-2 border-slate-800 rounded-3xl p-5 md:p-7 shadow-[4px_4px_0px_#1e293b] space-y-4 md:space-y-5 animate-scale-up">
          <div className="text-center space-y-1.5 md:space-y-2">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-indigo-50 border-2 border-slate-800 p-2.5 md:p-3 flex items-center justify-center mx-auto shadow-3xs">
              <GraduationCap className="w-6 h-6 md:w-7 md:h-7 text-indigo-655" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-black text-slate-855 uppercase font-sans">Gabung Kelompok Belajar</h2>
              <p className="text-[9.5px] md:text-xs font-bold text-slate-500 mt-1 leading-relaxed max-w-[280px] md:max-w-[400px] mx-auto">
                Game Anda belum terhubung ke kelompok kelas manapun. Masukkan 6-digit kode kelas yang diberikan oleh guru Anda.
              </p>
            </div>
          </div>

          <form onSubmit={handleJoinGroup} className="flex gap-2">
            <input
              type="text"
              required
              maxLength={6}
              placeholder="CONTOH: MNDL99"
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value)}
              className="flex-1 px-4 py-2.5 text-[10.5px] font-mono font-black border-2 border-slate-800 rounded-xl outline-none placeholder-slate-400 focus:border-indigo-650 uppercase tracking-widest text-center"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 bg-indigo-655 hover:bg-indigo-700 text-white font-black text-[9px] border-2 border-slate-800 rounded-xl shadow-[2px_2px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center gap-1"
            >
              <Search className="w-3.5 h-3.5" />
              <span>GABUNG</span>
            </button>
          </form>
        </div>
      ) : (
        /* STUDENT LOGGED IN & JOINED DASHBOARD */
        <div className="space-y-4 animate-scale-up">
          
          {/* Welcome Banner Card */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 border-2 border-slate-800 rounded-3xl p-5 text-white shadow-[4px_4px_0px_#1e293b] flex items-center justify-between">
            <div>
              <span className="text-[7.5px] font-black uppercase tracking-widest text-emerald-250">
                PROFIL SISWA GENETIKA
              </span>
              <h2 className="text-sm font-black mt-0.5 leading-none font-sans">Hai, {userName}!</h2>
              <span className="text-[8.5px] font-bold text-emerald-100 block mt-2.5 leading-none">
                Kelompok: <strong className="text-white font-extrabold">{studentGroupInfo?.groupName || '-'}</strong>
              </span>
            </div>
            <Award className="w-10 h-10 text-emerald-100/40 stroke-[1.5]" />
          </div>

          {/* Teacher's Announcement Bulletin Board */}
          {studentGroupInfo?.announcement && (
            <div className="bg-amber-50 border-2 border-slate-800 rounded-3xl p-4 shadow-[4px_4px_0px_#1e293b] space-y-2.5">
              <span className="text-[8px] font-black text-amber-800 uppercase tracking-widest flex items-center gap-1">
                <Megaphone className="w-3.5 h-3.5 text-amber-750" /> PENGUMUMAN DARI GURU
              </span>
              <div className="border-t border-amber-200 pt-2 space-y-1">
                <h4 className="text-[10px] font-black text-slate-855 leading-tight">
                  {studentGroupInfo.announcement.title}
                </h4>
                <p className="text-[9px] font-bold text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {studentGroupInfo.announcement.content}
                </p>
              </div>
            </div>
          )}

          {/* Learning Materials Section */}
          {studentGroupInfo?.materials && studentGroupInfo.materials.length > 0 && (
            <div className="bg-white border-2 border-slate-800 rounded-3xl p-4 shadow-[4px_4px_0px_#1e293b] space-y-3">
              <h3 className="text-[10px] font-black text-slate-855 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-205 pb-2">
                <BookOpen className="w-4 h-4 text-indigo-650" /> Materi Pembelajaran Kelas ({studentGroupInfo.materials.length})
              </h3>
              
              <div className="grid grid-cols-1 gap-2.5">
                {studentGroupInfo.materials.map((mat) => (
                  <div 
                    key={mat.id}
                    onClick={() => {
                      sound.playClick();
                      setActiveMaterialModal(mat);
                    }}
                    className="p-3 border-2 border-slate-850 hover:border-indigo-650 hover:bg-indigo-50/10 rounded-2xl bg-slate-50 flex items-center justify-between gap-3 shadow-3xs transition cursor-pointer"
                  >
                    <div className="text-left space-y-1">
                      <span className="text-[9.5px] font-black text-slate-855 block leading-tight">{mat.title}</span>
                      <p className="text-[8.5px] font-medium text-slate-500 line-clamp-1">{mat.content}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Quizzes Section */}
          {studentGroupInfo?.quizzes && studentGroupInfo.quizzes.length > 0 && (
            <div className="bg-white border-2 border-slate-800 rounded-3xl p-4 shadow-[4px_4px_0px_#1e293b] space-y-3">
              <h3 className="text-[10px] font-black text-slate-855 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-205 pb-2">
                <ClipboardList className="w-4 h-4 text-indigo-655" /> Kuis Pembelajaran Guru
              </h3>

              <div className="space-y-2.5">
                {studentGroupInfo.quizzes.map((quiz) => {
                  const attempted = customQuizScores && customQuizScores[quiz.id];

                  return (
                    <div 
                      key={quiz.id}
                      className="p-3 border-2 border-slate-800 rounded-2xl bg-slate-50 flex items-center justify-between gap-3 shadow-3xs"
                    >
                      <div className="text-left">
                        <span className="text-[9.5px] font-black text-slate-855 block leading-tight">{quiz.title}</span>
                        <span className="text-[7.5px] font-bold text-slate-455 block mt-1">📝 Soal: {quiz.questions?.length || 0} butir</span>
                      </div>

                      {attempted ? (
                        <div className="text-center px-3 py-1 bg-emerald-50 border border-emerald-450 rounded-xl min-w-[64px]">
                          <span className="text-[6.5px] font-black text-emerald-800 uppercase block tracking-wider">SELESAI</span>
                          <span className="text-[10px] font-black text-emerald-900 font-mono mt-0.5 block leading-none">Skor: {attempted.score || 0}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartQuiz(quiz)}
                          className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white font-black text-[8px] border-2 border-slate-800 rounded-xl shadow-3xs active:translate-y-0.2 active:shadow-none cursor-pointer transition flex items-center gap-1"
                        >
                          <span>KERJAKAN</span>
                          <ChevronRight className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Student's Own Stats Summary Widget */}
          <div className="bg-white border-2 border-slate-800 rounded-3xl p-4 shadow-[4px_4px_0px_#1e293b] grid grid-cols-3 gap-3 text-center">
            <div className="flex flex-col items-center justify-center p-2 bg-slate-50 border-2 border-slate-800 rounded-2xl">
              <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">SKOR Game</span>
              <span className="text-[12px] font-black text-slate-800 font-mono mt-0.5 leading-none">{userProgress.score || 0}</span>
            </div>
            
            <div className="flex flex-col items-center justify-center p-2 bg-slate-50 border-2 border-slate-800 rounded-2xl">
              <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">BINTANG</span>
              <span className="text-[12px] font-black text-indigo-755 font-mono mt-0.5 leading-none">★{starsCount}</span>
            </div>

            <div className="flex flex-col items-center justify-center p-2 bg-slate-50 border-2 border-slate-800 rounded-2xl">
              <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">LEVEL</span>
              <span className="text-[12px] font-black text-emerald-700 font-mono mt-0.5 leading-none">Lvl {userProgress.unlockedStage || 1}</span>
            </div>
          </div>

          {/* Local Classroom Leaderboard Scoreboard */}
          <div className="bg-white border-2 border-slate-800 rounded-3xl p-4 shadow-[4px_4px_0px_#1e293b] space-y-3">
            <h3 className="text-[10px] font-black text-slate-855 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Trophy className="w-4 h-4 text-amber-500" /> Peringkat Kelas Online
            </h3>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {classmates.map((member, idx) => {
                const isSelf = member.uid === currentUser.uid;
                const memberStars = member.progress?.stars ? Object.values(member.progress.stars).reduce((a, b) => a + b, 0) : 0;

                return (
                  <div 
                    key={member.uid || idx}
                    className={"p-2.5 border-2 rounded-2xl flex items-center justify-between gap-3 shadow-3xs transition-all " + (
                      isSelf ? "bg-amber-50/50 border-amber-500 scale-[1.01]" : "bg-slate-50 border-slate-800"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={"w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 text-[8px] font-black " + (
                        isSelf ? "bg-amber-100 border-amber-500 text-amber-900" : "bg-slate-100 border-slate-800 text-slate-700"
                      )}>
                        #{idx + 1}
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-slate-855 flex items-center gap-1">
                          {member.displayName}
                          {isSelf && <span className="px-1 py-0.2 rounded bg-amber-200 border border-amber-400 text-[6.5px] font-bold text-amber-900">Kamu</span>}
                        </span>
                        <span className="text-[7.5px] font-bold text-slate-400 block mt-0.5">Stage {member.progress?.unlockedStage || 1} • ★{memberStars}</span>
                      </div>
                    </div>

                    <div className="text-right flex flex-col justify-center bg-white border border-slate-350 px-2 py-0.5 rounded-xl min-w-[40px]">
                      <span className="text-[6px] font-black text-slate-400 uppercase tracking-widest leading-none">SKOR</span>
                      <span className="text-[9.5px] font-black text-slate-800 font-mono leading-none mt-0.5">
                        {member.progress?.score || 0}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* DETAIL MATERI MODAL */}
      {activeMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-[3px] border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-[8px_8px_0px_#1e293b] flex flex-col max-h-[80vh] animate-scale-up">
            
            <div className="p-4 bg-indigo-50 border-b-[3px] border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-150 border-2 border-slate-800 flex items-center justify-center">
                  <BookOpen className="w-4.5 h-4.5 text-indigo-755" />
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-slate-855 uppercase leading-none font-sans">Materi Belajar</h4>
                  <span className="text-[7.5px] font-bold text-slate-500 block mt-1">Hukum Mendel & Genetika</span>
                </div>
              </div>
              <button
                onClick={() => setActiveMaterialModal(null)}
                className="p-1 rounded-lg border-2 border-slate-800 bg-white hover:bg-slate-50 text-slate-700 transition cursor-pointer"
              >
                <X className="w-4.5 h-4.5 stroke-[3px]" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3.5 flex-1 text-left">
              <h3 className="text-[12px] font-black text-slate-855 leading-tight">{activeMaterialModal.title}</h3>
              <p className="text-[9.5px] font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">{activeMaterialModal.content}</p>
              
              {activeMaterialModal.url && (
                <div className="p-3 border border-indigo-200 bg-indigo-50/30 rounded-xl space-y-1">
                  <span className="text-[7.5px] font-black text-indigo-755 uppercase tracking-wide block">Tautan Belajar Eksternal</span>
                  <a 
                    href={activeMaterialModal.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[9px] font-bold text-indigo-650 hover:underline truncate block"
                  >
                    🔗 {activeMaterialModal.url}
                  </a>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t-2 border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveMaterialModal(null)}
                className="px-4 py-1.5 bg-indigo-655 hover:bg-indigo-700 text-white font-black text-[9px] border-2 border-slate-800 rounded-xl shadow-[2px_2px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              >
                TUTUP MATERI
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
