import React, { useState } from 'react';
import { auth, db } from '../../services/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useGame } from '../../context/GameContext';
import { sound } from '../../services/sound';
import { Brain, Star, Mail, Lock, User, CheckCircle2, AlertCircle, HelpCircle, GraduationCap, ArrowLeft } from 'lucide-react';

export const AuthScreen = ({ onAuthSuccess }) => {
  const { loginAsGuest } = useGame();

  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [school, setSchool] = useState(''); // Asal Sekolah state
  const [role, setRole] = useState('siswa'); // 'siswa' | 'guru'
  
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySchool, setRecoverySchool] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    sound.playClick();
    setErrorMsg('');
    setRecoverySuccess('');
    setLoading(true);

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', recoveryEmail.trim().toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        sound.playWrong();
        setErrorMsg('Email tidak terdaftar dalam sistem.');
        setLoading(false);
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      const cleanString = (str) => (str || '').replace(/\s+/g, '').toLowerCase();
      const storedSchool = cleanString(userData.school);
      const inputSchool = cleanString(recoverySchool);

      if (!userData.school || storedSchool !== inputSchool) {
        sound.playWrong();
        setErrorMsg('Validasi gagal: Asal sekolah tidak cocok dengan data terdaftar.');
        setLoading(false);
        return;
      }

      await sendPasswordResetEmail(auth, recoveryEmail.trim().toLowerCase());
      sound.playCorrect();
      setRecoverySuccess('Kecocokan Asal Sekolah terverifikasi! Link reset kata sandi telah dikirim ke email Anda.');
      setRecoveryEmail('');
      setRecoverySchool('');
    } catch (err) {
      sound.playWrong();
      console.error(err);
      setErrorMsg('Gagal mengirim email reset. Pastikan email valid.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    sound.playClick();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        // 1. Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Default student progress
        const initialProgress = {
          unlockedStage: 1,
          stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
          score: 0,
          badges: [],
          totalQuestionsAnswered: 0,
          correctAnswersCount: 0
        };

        // 2. Save role and profile details to Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: name || 'User',
          role: role,
          school: school || '', // Save Asal Sekolah
          groupId: '',
          progress: initialProgress
        });

        sound.playCorrect();
        if (onAuthSuccess) onAuthSuccess(user, role, name, initialProgress);
      } else {
        // 1. Sign in via Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Fetch profile & progress from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          sound.playCorrect();
          if (onAuthSuccess) onAuthSuccess(user, userData.role, userData.displayName, userData.progress, userData.groupId);
        } else {
          // If profile missing, create default
          const defaultProgress = {
            unlockedStage: 1,
            stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
            score: 0,
            badges: []
          };
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: user.email.split('@')[0],
            role: 'siswa',
            groupId: '',
            progress: defaultProgress
          });
          if (onAuthSuccess) onAuthSuccess(user, 'siswa', user.email.split('@')[0], defaultProgress);
        }
      }
    } catch (err) {
      sound.playWrong();
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('Email ini sudah terdaftar.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Kata sandi terlalu lemah (minimal 6 karakter).');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('Format email salah/tidak valid.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Email atau kata sandi salah.');
      } else {
        setErrorMsg('Terjadi kesalahan. Silakan coba kembali.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    sound.playClick();
    setIsRegister(!isRegister);
    setIsForgotPassword(false);
    setErrorMsg('');
    setRecoverySuccess('');
    setEmail('');
    setPassword('');
    setName('');
    setSchool('');
  };

  return (
    <div className="w-full min-h-screen bg-[#faf6ee] relative flex items-center justify-center p-4">
      {/* Parchment BG */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] z-0" />

      <div className="w-full max-w-sm bg-white border-2 border-slate-800 rounded-3xl p-6 shadow-[6px_6px_0px_#1e293b] relative z-10 animate-scale-up space-y-4">
        
        {/* Header navigation for Forgot Password mode */}
        {isForgotPassword && (
          <button
            onClick={() => {
              sound.playClick();
              setIsForgotPassword(false);
              setErrorMsg('');
              setRecoverySuccess('');
            }}
            className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 hover:text-indigo-650 transition cursor-pointer self-start uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[3px]" />
            <span>Kembali ke Login</span>
          </button>
        )}

        {/* Title Mascot */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border-2 border-slate-800 p-2 flex items-center justify-center mx-auto shadow-3xs">
            <Brain className="w-6 h-6 text-indigo-650" />
          </div>
          <div>
            <span className="text-[7.5px] font-black text-indigo-700 uppercase tracking-widest font-sans block">
              GERBANG GENETIKA
            </span>
            <h1 className="text-base font-black text-black">
              {isForgotPassword 
                ? 'PULIHKAN KATA SANDI' 
                : isRegister 
                  ? 'BUAT AKUN BARU' 
                  : 'MASUK PERMAINAN'}
            </h1>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-2.5 bg-rose-50 border-2 border-rose-600 rounded-xl text-rose-800 text-[9px] font-bold flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-650 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Recovery Success Notification */}
        {recoverySuccess && (
          <div className="p-2.5 bg-emerald-50 border-2 border-emerald-500 rounded-xl text-emerald-800 text-[9px] font-bold flex items-center gap-2 animate-scale-up">
            <CheckCircle2 className="w-4 h-4 text-emerald-655 flex-shrink-0" />
            <span>{recoverySuccess}</span>
          </div>
        )}

        {/* FORGOT PASSWORD FORM */}
        {isForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="space-y-3.5">
            <div className="space-y-1 text-left">
              <label className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">Email Terdaftar</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="username@gmail.com"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-[10px] font-bold border-2 border-slate-800 rounded-xl outline-none placeholder-slate-400 focus:border-indigo-600 transition"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">Asal Sekolah</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Masukkan asal sekolah saat mendaftar..."
                  value={recoverySchool}
                  onChange={(e) => setRecoverySchool(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-[10px] font-bold border-2 border-slate-800 rounded-xl outline-none placeholder-slate-400 focus:border-indigo-600 transition"
                />
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] border-2 border-slate-800 rounded-xl shadow-[2px_2px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <span>MEMPROSES...</span> : <span>PULIHKAN AKUN</span>}
            </button>
          </form>
        ) : (
          /* LOGIN OR REGISTER FORM */
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Name input (Register only) */}
            {isRegister && (
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">Nama Lengkap</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Masukkan nama lengkap..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-[10px] font-bold border-2 border-slate-800 rounded-xl outline-none placeholder-slate-400 focus:border-indigo-600 transition"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            {/* Asal Sekolah input (Register only) */}
            {isRegister && (
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">Asal Sekolah</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SMPN 1 Jakarta"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-[10px] font-bold border-2 border-slate-800 rounded-xl outline-none placeholder-slate-400 focus:border-indigo-600 transition"
                  />
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            {/* Email input */}
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="username@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-[10px] font-bold border-2 border-slate-800 rounded-xl outline-none placeholder-slate-400 focus:border-indigo-600 transition"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">Kata Sandi (Min 6 Karakter)</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-[10px] font-bold border-2 border-slate-800 rounded-xl outline-none placeholder-slate-400 focus:border-indigo-600 transition"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Forgot password link - Login only */}
            {!isRegister && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsForgotPassword(true);
                    setErrorMsg('');
                    setRecoverySuccess('');
                  }}
                  className="text-[8px] font-black text-indigo-650 hover:underline cursor-pointer uppercase tracking-wider"
                >
                  Lupa Kata Sandi?
                </button>
              </div>
            )}

            {/* Role selector (Register only) */}
            {isRegister && (
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">Pilih Peran Anda</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { sound.playClick(); setRole('siswa'); }}
                    className={`py-2 rounded-xl border-2 text-[9px] font-black flex items-center justify-center gap-1.5 cursor-pointer transition ${
                      role === 'siswa'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-extrabold'
                        : 'bg-white border-slate-800 text-slate-700'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>SISWA</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { sound.playClick(); setRole('guru'); }}
                    className={`py-2 rounded-xl border-2 text-[9px] font-black flex items-center justify-center gap-1.5 cursor-pointer transition ${
                      role === 'guru'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-800 font-extrabold'
                        : 'bg-white border-slate-800 text-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>GURU</span>
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] border-2 border-slate-800 rounded-xl shadow-[2px_2px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>MEMPROSES...</span>
              ) : (
                <span>{isRegister ? 'DAFTAR AKUN' : 'MASUK KE GAME'}</span>
              )}
            </button>

          </form>
        )}

        {/* Toggle Mode */}
        {!isForgotPassword && (
          <div className="text-center pt-2 border-t border-slate-200">
            <button
              onClick={toggleMode}
              className="text-[9px] font-bold text-indigo-650 hover:underline cursor-pointer"
            >
              {isRegister 
                ? 'Sudah punya akun? Masuk di sini' 
                : 'Belum punya akun? Daftar di sini'}
            </button>
          </div>
        )}

        {/* Guest Login Option */}
        {!isForgotPassword && (
          <div className="pt-2 border-t border-slate-200">
            <button
              onClick={loginAsGuest}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] border-2 border-slate-800 rounded-xl shadow-[2px_2px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>MASUK SEBAGAI TAMU (GUEST)</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
