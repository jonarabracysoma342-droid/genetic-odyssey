import React, { createContext, useContext, useState, useEffect } from 'react';
import { STAGES } from '../data/geneticsData';
import { sound } from '../services/sound';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const GameContext = createContext();

const INITIAL_PROGRESS = {
  unlockedStage: 1,
  stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
  score: 0,
  badges: [],
  totalQuestionsAnswered: 0,
  correctAnswersCount: 0
};

export const GameProvider = ({ children }) => {
  const [activeView, setActiveView] = useState('main-menu'); // 'main-menu', 'map', 'stage', 'hots-quiz'
  const [currentStageId, setCurrentStageId] = useState(1);
  const [userProgress, setUserProgress] = useState(INITIAL_PROGRESS);
  const [teacherLogs, setTeacherLogs] = useState(() => {
    const saved = localStorage.getItem('genetic_odyssey_teacher_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Authentication states
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('siswa'); // 'siswa' | 'guru'
  const [userName, setUserName] = useState('');
  const [groupId, setGroupId] = useState('');
  const [authLoading, setAuthLoading] = useState(true);

  // Listen for Firebase authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(true);
      if (user) {
        setCurrentUser(user);
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData.role || 'siswa');
            setUserName(userData.displayName || user.email.split('@')[0]);
            setGroupId(userData.groupId || '');
            if (userData.progress) {
              setUserProgress(userData.progress);
            }
          }
        } catch (err) {
          console.error("Error fetching user profile from Firestore:", err);
        }
      } else {
        // Only clear if the current session is not a guest session
        setCurrentUser(prev => {
          if (prev && prev.isGuest) return prev;
          
          setUserRole('siswa');
          setUserName('');
          setGroupId('');
          setUserProgress(INITIAL_PROGRESS);
          return null;
        });
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Force sign out on initial mount so user always lands on the login page (as requested by user)
  useEffect(() => {
    signOut(auth).catch(err => console.error("Error signing out on mount:", err));
  }, []);

  const loginAsGuest = () => {
    sound.playClick();
    const guestUser = {
      uid: 'guest_' + Date.now(),
      email: 'guest@odyssey.com',
      displayName: 'Tamu Odyssey',
      isGuest: true
    };
    setCurrentUser(guestUser);
    setUserRole('siswa');
    setUserName('Tamu Odyssey');
    setGroupId('');
    setUserProgress(INITIAL_PROGRESS);
    setActiveView('main-menu');
  };

  // Modal Visibility States
  const [isGenopediaOpen, setIsGenopediaOpen] = useState(false);
  const [isBioBotOpen, setIsBioBotOpen] = useState(false);
  const [isTeacherReportOpen, setIsTeacherReportOpen] = useState(false);
  const [teacherReportActiveTab, setTeacherReportActiveTab] = useState('identity');
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Modals for sub-components (promoted to game context for scroll-locking)
  const [activePreviewStage, setActivePreviewStage] = useState(null);
  const [activeStudentModal, setActiveStudentModal] = useState(null);
  const [activeReviewQuiz, setActiveReviewQuiz] = useState(null);

  // Custom global alert/confirm modal state
  const [customModal, setCustomModal] = useState({
    isOpen: false,
    type: 'alert',
    message: '',
    onConfirm: null,
    onCancel: null
  });

  const showAlert = (message, onConfirm = null) => {
    setCustomModal({
      isOpen: true,
      type: 'alert',
      message,
      onConfirm: () => {
        setCustomModal(prev => ({ ...prev, isOpen: false }));
        if (onConfirm) onConfirm();
      },
      onCancel: null
    });
  };

  const showConfirm = (message, onConfirm, onCancel = null) => {
    setCustomModal({
      isOpen: true,
      type: 'confirm',
      message,
      onConfirm: () => {
        setCustomModal(prev => ({ ...prev, isOpen: false }));
        if (onConfirm) onConfirm();
      },
      onCancel: () => {
        setCustomModal(prev => ({ ...prev, isOpen: false }));
        if (onCancel) onCancel();
      }
    });
  };

  // Audio settings
  const [soundOn, setSoundOn] = useState(true);
  const [bgmOn, setBgmOn] = useState(true);

  useEffect(() => {
    localStorage.setItem('genetic_odyssey_teacher_logs', JSON.stringify(teacherLogs));
  }, [teacherLogs]);

  // Auto-start BGM and handle browser autoplay permissions on first click
  useEffect(() => {
    if (bgmOn) {
      sound.startBgm();
    }
    const handleFirstUserClick = () => {
      sound.init();
      if (bgmOn) {
        sound.startBgm();
      }
    };
    document.addEventListener('click', handleFirstUserClick, { once: true });
    return () => {
      document.removeEventListener('click', handleFirstUserClick);
    };
  }, [bgmOn]);

  const totalStars = Object.values(userProgress.stars).reduce((acc, curr) => acc + curr, 0);

  const navigateTo = (view, stageId = null) => {
    sound.playClick();
    if (stageId) setCurrentStageId(stageId);
    setActiveView(view);
  };

  const completeStage = async (stageId, starsEarned, scoreAdded, accuracy = 100, timeSpent = 45) => {
    sound.playFanfare();
    const currentStageObj = STAGES.find(s => s.id === stageId);
    const newBadge = currentStageObj ? currentStageObj.badge : null;

    let updatedProgress = INITIAL_PROGRESS;

    setUserProgress(prev => {
      const nextUnlocked = Math.max(prev.unlockedStage, Math.min(6, stageId + 1));
      const oldStars = prev.stars[stageId] || 0;
      const newStars = Math.max(oldStars, starsEarned);
      const updatedStars = { ...prev.stars, [stageId]: newStars };
      const updatedBadges = newBadge && !prev.badges.includes(newBadge) 
        ? [...prev.badges, newBadge] 
        : prev.badges;

      updatedProgress = {
        ...prev,
        unlockedStage: nextUnlocked,
        stars: updatedStars,
        score: prev.score + scoreAdded,
        badges: updatedBadges,
        totalQuestionsAnswered: prev.totalQuestionsAnswered + 5,
        correctAnswersCount: prev.correctAnswersCount + Math.round((accuracy / 100) * 5)
      };

      // Sync progress to Firestore
      if (currentUser) {
        setDoc(doc(db, 'users', currentUser.uid), {
          progress: updatedProgress
        }, { merge: true }).catch(err => console.error("Error syncing progress to Firestore:", err));
      }

      return updatedProgress;
    });

    // Add teacher log entry
    const newLog = {
      id: Date.now(),
      date: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      stageId,
      stageTitle: currentStageObj ? currentStageObj.title : `Stage ${stageId}`,
      stars: starsEarned,
      score: scoreAdded,
      accuracy,
      timeSpent
    };
    setTeacherLogs(prev => [newLog, ...prev]);
  };

  const handleLogout = () => {
    sound.playClick();
    showConfirm("Apakah Anda yakin ingin keluar dari akun?", async () => {
      try {
        await signOut(auth);
        setUserProgress(INITIAL_PROGRESS);
        setTeacherLogs([]);
        setActiveView('main-menu');
      } catch (err) {
        console.error("Sign out error:", err);
      }
    });
  };

  const toggleSound = () => {
    sound.soundEnabled = !soundOn;
    setSoundOn(!soundOn);
  };

  const toggleBgm = () => {
    const isPlaying = sound.toggleBgm();
    setBgmOn(isPlaying);
  };

  const unlockAllStages = () => {
    sound.playFanfare();
    setUserProgress(prev => {
      const allStageIds = [1, 2, 3, 4, 5, 6, 7, 8];
      const newProgress = {
        ...prev,
        unlockedStage: 8,
        unlockedStages: allStageIds
      };
      if (currentUser) {
        setDoc(doc(db, 'users', currentUser.uid), { progress: newProgress }, { merge: true })
          .catch(err => console.error("Error saving progress to Firestore:", err));
      }
      return newProgress;
    });
    showAlert("🔓 Selamat! Seluruh level (Stage 1 - 8) telah berhasil dibuka.");
  };

  const resetProgress = () => {
    showConfirm("Apakah Anda yakin ingin mereset seluruh kemajuan belajar dan skor?", () => {
      setUserProgress(INITIAL_PROGRESS);
      setTeacherLogs([]);
      localStorage.removeItem('genetic_odyssey_teacher_logs');
      
      if (currentUser) {
        setDoc(doc(db, 'users', currentUser.uid), {
          progress: INITIAL_PROGRESS
        }, { merge: true }).catch(err => console.error("Error resetting progress in Firestore:", err));
      }
      
      setActiveView('main-menu');
    });
  };

  return (
    <GameContext.Provider
      value={{
        activeView,
        currentStageId,
        userProgress,
        teacherLogs,
        totalStars,
        navigateTo,
        completeStage,
        isGenopediaOpen,
        setIsGenopediaOpen,
        isBioBotOpen,
        setIsBioBotOpen,
        isTeacherReportOpen,
        setIsTeacherReportOpen,
        teacherReportActiveTab,
        setTeacherReportActiveTab,
        isLeaderboardOpen,
        setIsLeaderboardOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        soundOn,
        toggleSound,
        bgmOn,
        toggleBgm,
        unlockAllStages,
        resetProgress,
        
        // Auth variables
        currentUser,
        userRole,
        userName,
        groupId,
        setGroupId,
        authLoading,
        handleLogout,
        loginAsGuest,

        // Custom modal helper functions
        customModal,
        showAlert,
        showConfirm,

        // Promoted local modals for scroll locking
        activePreviewStage,
        setActivePreviewStage,
        activeStudentModal,
        setActiveStudentModal,
        activeReviewQuiz,
        setActiveReviewQuiz
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
