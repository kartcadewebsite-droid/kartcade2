// Firebase configuration for Kartcade
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDqXtIUkJEulbW-cCZq9uzCIw0kH99AUIQ",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "kartcade-website.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "kartcade-website",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "kartcade-website.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1089395024153",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1089395024153:web:c1cece8fe11f434d8e6588"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
