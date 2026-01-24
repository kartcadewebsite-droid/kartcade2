// Firebase configuration for Kartcade
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDqXtIUkJEulbW-cCZq9uzCIw0kH99AUIQ",
    authDomain: "kartcade-website.firebaseapp.com",
    projectId: "kartcade-website",
    storageBucket: "kartcade-website.firebasestorage.app",
    messagingSenderId: "1089395024153",
    appId: "1:1089395024153:web:c1cece8fe11f434d8e6588"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
