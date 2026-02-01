
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
import { UserCredits, UserMembership, UserMembershipsMap, DEFAULT_CREDITS, DEFAULT_MEMBERSHIPS } from '../config/membership';
import { bookingConfig } from '../config/booking';

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
    // Driver Details
    favDiscipline?: string;
    favTrack?: string;
    favCar?: string;
    favRig?: string;
    settings?: string;
    // Credits and Membership
    credits: UserCredits;
    memberships: UserMembershipsMap;
}

interface AuthContextType {
    currentUser: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    isAdmin: boolean;
    signUp: (
        email: string,
        password: string,
        name: string,
        phone: string,
        driverDetails?: {
            favDiscipline?: string;
            favTrack?: string;
            favCar?: string;
            favRig?: string;
            settings?: string;
        }
    ) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<{ isNewUser: boolean }>;
    updateProfile: (data: Partial<UserProfile>) => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    // Credits functions
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

    // Check if current user is admin - via Firestore role OR predefined admin email
    const isAdmin = userProfile?.role === 'admin' ||
        (currentUser?.email && bookingConfig.adminEmails?.includes(currentUser.email)) ||
        false;

    // Create user profile in Firestore - Returns true if new user created
    const createUserProfile = async (
        user: User,
        additionalData: {
            name: string;
            phone?: string;
        }
    ): Promise<boolean> => {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            const profileData = {
                uid: user.uid,
                email: user.email || '',
                name: additionalData.name || user.displayName || '',
                phone: additionalData.phone || '',
                waiverAccepted: false, // Will be set in Onboarding
                rulesAccepted: false,  // Will be set in Onboarding
                createdAt: serverTimestamp(),
                // Initialize with empty credits and no membership
                credits: DEFAULT_CREDITS,
                memberships: DEFAULT_MEMBERSHIPS,
            };

            await setDoc(userRef, profileData);
            return true; // New user created
        }
        return false; // User already existed
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
                memberships: data.memberships || DEFAULT_MEMBERSHIPS,
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
    const signUp = async (
        email: string,
        password: string,
        name: string,
        phone: string,
        driverDetails?: {
            favDiscipline?: string;
            favTrack?: string;
            favCar?: string;
            favRig?: string;
            settings?: string;
        }
    ) => {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        // For email signup, we might still want to capture details inline or redirect. 
        // For consistency, let's keep the details here IF passed, but normally we'd redirect too.
        // Actually, let's keep email signup as is (all in one), but Google as two-step.

        const userRef = doc(db, 'users', user.uid);
        const profileData = {
            uid: user.uid,
            email: user.email || '',
            name: name,
            phone: phone,
            ...driverDetails,
            waiverAccepted: true, // Email form has checkbox
            rulesAccepted: true,  // Email form has checkbox
            waiverAcceptedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
            credits: DEFAULT_CREDITS,
            memberships: DEFAULT_MEMBERSHIPS,
        };
        await setDoc(userRef, profileData);

        await fetchUserProfile(user.uid);
    };

    // Login with email/password
    const login = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    // Login with Google - Returns isNewUser
    const loginWithGoogle = async (): Promise<{ isNewUser: boolean }> => {
        const { user } = await signInWithPopup(auth, googleProvider);
        const isNewUser = await createUserProfile(user, { name: user.displayName || '' });
        await fetchUserProfile(user.uid);
        return { isNewUser };
    };

    // Update profile
    const updateProfile = async (data: Partial<UserProfile>) => {
        if (!currentUser) return;
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, data);
        await refreshUserProfile();
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
        updateProfile,
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
