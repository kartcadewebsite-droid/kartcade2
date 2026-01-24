import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    User,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';

// Types
interface UserProfile {
    uid: string;
    email: string;
    name: string;
    phone?: string;
    role?: 'admin' | 'user';
    waiverAccepted: boolean;
    rulesAccepted: boolean;
    waiverAcceptedAt?: Date;
    createdAt?: Date;
}

interface AuthContextType {
    currentUser: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    isAdmin: boolean;
    signUp: (email: string, password: string, name: string, phone: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Check if current user is admin - ONLY from Firestore role (no hardcoded email)
    const isAdmin = userProfile?.role === 'admin';

    // Create user profile in Firestore
    const createUserProfile = async (
        user: User,
        additionalData: { name: string; phone?: string }
    ) => {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            const profileData: Omit<UserProfile, 'createdAt' | 'waiverAcceptedAt'> & {
                createdAt: ReturnType<typeof serverTimestamp>;
                waiverAcceptedAt: ReturnType<typeof serverTimestamp>;
            } = {
                uid: user.uid,
                email: user.email || '',
                name: additionalData.name || user.displayName || '',
                phone: additionalData.phone || '',
                waiverAccepted: true,
                rulesAccepted: true,
                waiverAcceptedAt: serverTimestamp(),
                createdAt: serverTimestamp(),
            };

            await setDoc(userRef, profileData);
        }
    };

    // Fetch user profile from Firestore
    const fetchUserProfile = async (uid: string) => {
        const userRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
        }
    };

    // Sign up with email/password
    const signUp = async (email: string, password: string, name: string, phone: string) => {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await createUserProfile(user, { name, phone });
        await fetchUserProfile(user.uid);
    };

    // Login with email/password
    const login = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    // Login with Google
    const loginWithGoogle = async () => {
        const { user } = await signInWithPopup(auth, googleProvider);
        await createUserProfile(user, { name: user.displayName || '' });
        await fetchUserProfile(user.uid);
    };

    // Logout
    const logout = async () => {
        await signOut(auth);
        setUserProfile(null);
    };

    // Reset password
    const resetPassword = async (email: string) => {
        await sendPasswordResetEmail(auth, email);
    };

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                await fetchUserProfile(user.uid);
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value: AuthContextType = {
        currentUser,
        userProfile,
        loading,
        isAdmin,
        signUp,
        login,
        loginWithGoogle,
        logout,
        resetPassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
