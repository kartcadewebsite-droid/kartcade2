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
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';
import { UserCredits, UserMembership, DEFAULT_CREDITS, DEFAULT_MEMBERSHIP } from '../config/membership';

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
    // NEW: Credits and Membership
    credits: UserCredits;
    membership: UserMembership;
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
    // NEW: Credits functions
    useCredits: (equipmentType: 'kart' | 'rig' | 'motion', amount: number) => Promise<boolean>;
    addCredits: (equipmentType: 'kart' | 'rig' | 'motion', amount: number) => Promise<void>;
    getCredits: (equipmentType: 'kart' | 'rig' | 'motion') => number;
    hasEnoughCredits: (equipmentType: 'kart' | 'rig' | 'motion', amount: number) => boolean;
    refreshUserProfile: () => Promise<void>;
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
            const profileData = {
                uid: user.uid,
                email: user.email || '',
                name: additionalData.name || user.displayName || '',
                phone: additionalData.phone || '',
                waiverAccepted: true,
                rulesAccepted: true,
                waiverAcceptedAt: serverTimestamp(),
                createdAt: serverTimestamp(),
                // Initialize with empty credits and no membership
                credits: DEFAULT_CREDITS,
                membership: DEFAULT_MEMBERSHIP,
            };

            await setDoc(userRef, profileData);
        }
    };

    // Fetch user profile from Firestore
    const fetchUserProfile = async (uid: string) => {
        const userRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const data = userDoc.data();
            // Ensure credits and membership fields exist (for existing users)
            const profile: UserProfile = {
                ...data,
                credits: data.credits || DEFAULT_CREDITS,
                membership: data.membership || DEFAULT_MEMBERSHIP,
            } as UserProfile;
            setUserProfile(profile);
        }
    };

    // Refresh user profile (useful after actions like using credits)
    const refreshUserProfile = async () => {
        if (currentUser) {
            await fetchUserProfile(currentUser.uid);
        }
    };

    // Get credits for a specific equipment type
    const getCredits = (equipmentType: 'kart' | 'rig' | 'motion'): number => {
        return userProfile?.credits?.[equipmentType] || 0;
    };

    // Check if user has enough credits
    const hasEnoughCredits = (equipmentType: 'kart' | 'rig' | 'motion', amount: number): boolean => {
        return getCredits(equipmentType) >= amount;
    };

    // Use credits for a booking
    const useCredits = async (equipmentType: 'kart' | 'rig' | 'motion', amount: number): Promise<boolean> => {
        if (!currentUser || !userProfile) return false;

        const currentCredits = getCredits(equipmentType);
        if (currentCredits < amount) return false;

        const userRef = doc(db, 'users', currentUser.uid);
        const newCredits = { ...userProfile.credits };
        newCredits[equipmentType] = currentCredits - amount;

        await updateDoc(userRef, { credits: newCredits });
        await refreshUserProfile();

        return true;
    };

    // Add credits (called by webhook or admin)
    const addCredits = async (equipmentType: 'kart' | 'rig' | 'motion', amount: number): Promise<void> => {
        if (!currentUser || !userProfile) return;

        const userRef = doc(db, 'users', currentUser.uid);
        const newCredits = { ...userProfile.credits };
        newCredits[equipmentType] = (newCredits[equipmentType] || 0) + amount;

        await updateDoc(userRef, { credits: newCredits });
        await refreshUserProfile();
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
        // Credits functions
        useCredits,
        addCredits,
        getCredits,
        hasEnoughCredits,
        refreshUserProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
