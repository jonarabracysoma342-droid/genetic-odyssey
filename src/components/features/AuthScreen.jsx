import React, { useState, useEffect } from 'react';
import { auth, db } from '../../services/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useGame } from '../../context/GameContext';
import { sound } from '../../services/sound';
import { Star, Mail, Lock, User, CheckCircle2, AlertCircle, GraduationCap, ArrowLeft, Copy, Eye, EyeOff } from 'lucide-react';

// Demo credentials for testing
const DEMO_CREDENTIALS = [
  { role: 'guru', label: '👨‍🏫 Akun Guru Demo', email: 'guru@geneticodyssey.app', password: 'guru123456', color: 'indigo' },
  { role: 'siswa', label: '🧬 Akun Siswa Demo', email: 'siswa@geneticodyssey.app', password: 'siswa123456', color: 'emerald' },
];

export const AuthScreen = ({ onAuthSuccess }) => {
  const { loginAsGuest, isLandscapeMobile } = useGame();

  // Start BGM when auth screen mounts (same track as game menu)
  useEffect(() => {
    sound.init();
    sound.startBgm();
    return () => {}; // Keep BGM running after login transition
  }, []);


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
    <div className={`w-full min-h-screen relative flex items-center justify-center overflow-y-auto select-none ${isLandscapeMobile ? 'py-2 px-2' : 'p-4 sm:p-6'}`}>
      
      {/* === FULL-BLEED PIXEL ART BACKGROUND === */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/loading_bg.jpg"
          alt="Background"
          className="w-full h-full object-cover image-pixelated"
          style={{ imageRendering: 'pixelated' }}
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f0a]/70 via-[#1a3a10]/50 to-[#361706]/70" />
        {/* Warm vignette */}
        <div className="absolute inset-0 bg-radial-[ellipse_at_center] from-transparent to-black/40" />
      </div>

      {/* === MAIN CONTENT WRAPPER (two-column on desktop) === */}
      <div className={`relative z-10 w-full my-auto flex items-center justify-center gap-4 sm:gap-6 ${isLandscapeMobile ? 'flex-row max-w-3xl' : 'flex-col lg:flex-row max-w-4xl'}`}>

        {/* === LEFT: Demo Credentials Panel (hidden on landscape mobile) === */}
        {!isLandscapeMobile && !isForgotPassword && (
          <div className="hidden lg:flex flex-col gap-3 w-72 shrink-0">
            {/* Header */}
            <div className="bg-[#fae8b6]/10 backdrop-blur-sm border-2 border-[#fae8b6]/30 rounded-2xl p-3.5 text-center">
              <span className="font-pixel text-[7px] text-[#fde68a] uppercase tracking-widest block">🔑 Akun Demo Tersedia</span>
              <p className="font-pixel text-[6.5px] text-[#fae8b6]/70 mt-1 leading-relaxed">Klik untuk mengisi form login otomatis</p>
            </div>

            {DEMO_CREDENTIALS.map((cred) => (
              <button
                key={cred.role}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setEmail(cred.email);
                  setPassword(cred.password);
                  setIsRegister(false);
                  setIsForgotPassword(false);
                }}
                className={`w-full text-left p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group backdrop-blur-sm ${
                  cred.color === 'indigo'
                    ? 'bg-indigo-900/60 border-indigo-400/60 hover:bg-indigo-800/70 hover:border-indigo-300'
                    : 'bg-emerald-900/60 border-emerald-400/60 hover:bg-emerald-800/70 hover:border-emerald-300'
                }`}
              >
                <span className={`font-pixel text-[8px] uppercase tracking-wider font-black block mb-2 ${cred.color === 'indigo' ? 'text-indigo-200' : 'text-emerald-200'}`}>
                  {cred.label}
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-white/50 shrink-0" />
                    <span className="font-mono text-[9px] text-white/80 truncate">{cred.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-3 h-3 text-white/50 shrink-0" />
                    <span className="font-mono text-[9px] text-white/80">{cred.password}</span>
                  </div>
                </div>
                <div className={`mt-2.5 text-[7px] font-pixel uppercase tracking-widest flex items-center gap-1 ${cred.color === 'indigo' ? 'text-indigo-300' : 'text-emerald-300'} group-hover:opacity-100 opacity-70 transition`}>
                  <Copy className="w-2.5 h-2.5" />
                  Klik untuk isi form
                </div>
              </button>
            ))}

            {/* Catatan */}
            <div className="bg-amber-900/40 border border-amber-400/30 rounded-xl p-2.5 backdrop-blur-sm">
              <p className="font-pixel text-[6px] text-amber-200/80 leading-relaxed text-center">
                ⚠️ Akun demo untuk keperluan testing. Jangan gunakan untuk data penting.
              </p>
            </div>
          </div>
        )}

        {/* === RIGHT / CENTER: Login Form Card === */}
      <div className={`w-full ${isLandscapeMobile ? 'max-w-md p-3 sm:p-3.5 space-y-2' : 'max-w-md lg:max-w-lg p-6 md:p-8 space-y-5'} bg-[#fae8b6] border-4 border-[#361706] rounded-2xl shadow-[6px_6px_0_#1a0b03] relative z-10 animate-scale-up text-[#2b1103] my-auto`}>

        
        {/* Header navigation for Forgot Password mode */}
        {isForgotPassword && (
          <button
            onClick={() => {
              sound.playClick();
              setIsForgotPassword(false);
              setErrorMsg('');
              setRecoverySuccess('');
            }}
            className="flex items-center gap-1.5 font-pixel text-[8px] text-[#884318] hover:text-[#361706] transition cursor-pointer self-start uppercase"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[3px]" />
            <span>KEMBALI KE LOGIN</span>
          </button>
        )}

        {/* Title Mascot — UPR Logo */}
        <div className={`text-center ${isLandscapeMobile ? 'flex items-center justify-center gap-3 py-0.5' : 'space-y-3'}`}>
          {/* UPR Logo — circular, drop shadow */}
          <div className={`${isLandscapeMobile ? 'w-12 h-12' : 'w-24 h-24 md:w-28 md:h-28'} flex items-center justify-center mx-auto overflow-hidden shrink-0 drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]`}>
            <img 
              src="/assets/upr_logo.png" 
              alt="Logo Universitas Palangka Raya" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className={isLandscapeMobile ? 'text-left' : 'text-center'}>
            <span className="font-['Poppins'] text-[10px] md:text-xs font-semibold text-[#6b3a0f] uppercase tracking-[0.2em] block">
              Universitas Palangka Raya
            </span>
            <h1 className={`font-['Poppins'] ${isLandscapeMobile ? 'text-sm' : 'text-lg md:text-xl'} text-[#361706] mt-1 font-extrabold leading-tight`}>
              {isForgotPassword 
                ? 'Pulihkan Kata Sandi' 
                : isRegister 
                  ? 'Buat Akun Baru' 
                  : 'Masuk ke Genetic Odyssey'}
            </h1>
            {!isRegister && !isForgotPassword && (
              <p className="font-['Poppins'] text-[10px] md:text-xs text-[#884318] mt-0.5 font-medium">
                Media Pembelajaran Genetika Interaktif
              </p>
            )}
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
              <label className="font-['Poppins'] text-xs font-semibold text-slate-500 uppercase tracking-wider block">Email Terdaftar</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="username@gmail.com"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 font-['Poppins'] text-sm font-medium border-2 border-slate-800 rounded-xl outline-none placeholder-slate-400 focus:border-indigo-600 transition"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="font-['Poppins'] text-xs font-semibold text-slate-500 uppercase tracking-wider block">Asal Sekolah</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Masukkan asal sekolah saat mendaftar..."
                  value={recoverySchool}
                  onChange={(e) => setRecoverySchool(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 font-['Poppins'] text-sm font-medium border-2 border-slate-800 rounded-xl outline-none placeholder-slate-400 focus:border-indigo-600 transition"
                />
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-['Poppins'] font-bold text-sm border-2 border-slate-800 rounded-xl shadow-[2px_2px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <span>Memproses...</span> : <span>Pulihkan Akun</span>}
            </button>
          </form>
        ) : (
          /* LOGIN OR REGISTER FORM */
          <form onSubmit={handleSubmit} className={isLandscapeMobile ? "space-y-2" : "space-y-3.5"}>
            
            <div className={isLandscapeMobile && isRegister ? "grid grid-cols-2 gap-2 text-left" : "space-y-2 text-left"}>
              {/* Name input (Register only) */}
              {isRegister && (
                <div className="space-y-0.5">
                  <label className="font-['Poppins'] text-xs font-semibold text-slate-500 uppercase tracking-wider block">Nama Lengkap</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full pl-8 pr-2.5 ${isLandscapeMobile ? 'py-1.5 text-sm' : 'py-2.5 text-sm'} font-['Poppins'] font-medium border-2 border-slate-800 rounded-xl outline-none placeholder-slate-400 focus:border-indigo-600 transition`}
                    />
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              )}

              {/* Asal Sekolah input (Register only) */}
              {isRegister && (
                <div className="space-y-0.5">
                  <label className="font-['Poppins'] text-xs font-semibold text-slate-500 uppercase tracking-wider block">Asal Sekolah</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Contoh: SMPN 1"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      className={`w-full pl-8 pr-2.5 ${isLandscapeMobile ? 'py-1.5 text-sm' : 'py-2.5 text-sm'} font-['Poppins'] font-medium border-2 border-slate-800 rounded-xl outline-none placeholder-slate-400 focus:border-indigo-600 transition`}
                    />
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              )}

              {/* Email input */}
              <div className="space-y-0.5">
                <label className="font-['Poppins'] text-xs font-semibold text-slate-500 uppercase tracking-wider block">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="username@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-8 pr-2.5 ${isLandscapeMobile ? 'py-1.5 text-sm' : 'py-2.5 text-sm'} font-['Poppins'] font-medium border-2 border-slate-800 rounded-xl outline-none placeholder-slate-400 focus:border-indigo-600 transition`}
                  />
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Password input */}
              <div className="space-y-0.5">
                <label className="font-['Poppins'] text-xs font-semibold text-slate-500 uppercase tracking-wider block">Kata Sandi (Min 6 Karakter)</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-8 pr-2.5 ${isLandscapeMobile ? 'py-1.5 text-sm' : 'py-2.5 text-sm'} font-['Poppins'] font-medium border-2 border-slate-800 rounded-xl outline-none placeholder-slate-400 focus:border-indigo-600 transition`}
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
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
                  className="font-['Poppins'] text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                >
                  Lupa Kata Sandi?
                </button>
              </div>
            )}

            {/* Role selector (Register only) */}
            {isRegister && (
              <div className="space-y-0.5 text-left">
                <label className="font-['Poppins'] text-xs font-semibold text-slate-500 uppercase tracking-wider block">Pilih Peran Anda</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { sound.playClick(); setRole('siswa'); }}
                    className={`py-2 rounded-xl border-2 font-['Poppins'] text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer transition ${
                      role === 'siswa'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-white border-slate-800 text-slate-700'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>Siswa</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { sound.playClick(); setRole('guru'); }}
                    className={`py-2 rounded-xl border-2 font-['Poppins'] text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer transition ${
                      role === 'guru'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-800'
                        : 'bg-white border-slate-800 text-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Guru</span>
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${isLandscapeMobile ? 'py-2 text-sm' : 'py-3 text-base'} bg-[#361706] hover:bg-[#4a2208] text-[#fae8b6] font-['Poppins'] font-bold border-2 border-[#1a0b03] rounded-xl shadow-[3px_3px_0px_#1a0b03] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50`}
            >
              {loading ? (
                <span>Memproses...</span>
              ) : (
                <span>{isRegister ? 'Daftar Akun' : '🚀 Masuk ke Genetic Odyssey'}</span>
              )}
            </button>

          </form>
        )}

        {/* Toggle Mode */}
        {!isForgotPassword && (
          <div className={`text-center ${isLandscapeMobile ? 'pt-1' : 'pt-3'} border-t border-slate-200`}>
            <button
              onClick={toggleMode}
              className="font-['Poppins'] text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
            >
              {isRegister 
                ? 'Sudah punya akun? Masuk di sini' 
                : 'Belum punya akun? Daftar di sini'}
            </button>
          </div>
        )}

        {/* Mobile-only demo credentials (shown on smaller screens below the form) */}
        {!isForgotPassword && !isRegister && (
          <div className="lg:hidden pt-2 border-t border-[#c88a5a]/40 space-y-2">
            <p className="font-pixel text-[6.5px] text-[#884318] uppercase tracking-widest text-center">🔑 Akun Demo – Klik untuk isi otomatis</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_CREDENTIALS.map((cred) => (
                <button
                  key={cred.role}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setEmail(cred.email);
                    setPassword(cred.password);
                  }}
                  className={`text-left p-2 rounded-xl border-2 cursor-pointer active:scale-95 transition-all ${
                    cred.color === 'indigo'
                      ? 'bg-indigo-50 border-indigo-300 hover:bg-indigo-100'
                      : 'bg-emerald-50 border-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  <span className={`font-pixel text-[7px] font-black block mb-1 ${cred.color === 'indigo' ? 'text-indigo-700' : 'text-emerald-700'}`}>
                    {cred.label}
                  </span>
                  <span className="font-mono text-[7px] text-slate-600 block truncate">{cred.email}</span>
                  <span className="font-mono text-[7px] text-slate-500">{cred.password}</span>
                </button>
              ))}
            </div>
          </div>
        )}


        {!isForgotPassword && (
          <div className={`${isLandscapeMobile ? 'pt-1' : 'pt-2'} border-t border-slate-200`}>
            <button
              onClick={loginAsGuest}
              className={`w-full ${isLandscapeMobile ? 'py-1.5 text-[8px]' : 'py-2 text-[9px]'} bg-emerald-600 hover:bg-emerald-700 text-white font-black border-2 border-slate-800 rounded-xl shadow-[2px_2px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5`}
            >
              <span>MASUK SEBAGAI TAMU (GUEST)</span>
            </button>
          </div>
        )}

      </div>
      </div> {/* end two-column wrapper */}
    </div>
  );
};
