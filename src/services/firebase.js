import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration using placeholder values.
// Silakan ganti nilai-nilai di bawah ini dengan kredensial dari Firebase Console Anda.
const firebaseConfig = {
  apiKey: "AIzaSyCfXYeSoQimtm3-X1l8h_jZqM2Dljf64Ws",
  authDomain: "database-genetic-oddesey.firebaseapp.com",
  projectId: "database-genetic-oddesey",
  storageBucket: "database-genetic-oddesey.firebasestorage.app",
  messagingSenderId: "952219235592",
  appId: "1:952219235592:web:efe5819634b7e6e7f7e8bd",
  measurementId: "G-3Q9K3K3D8W"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
