// Profile Photo Upload/Delete Utilities

import imageCompression from 'browser-image-compression';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { storage, db } from '../config/firebase';

/**
 * Compress image before upload
 * Target: ~500KB, max dimension 800px, always convert to JPEG
 */
export async function compressImage(file: File): Promise<File> {
    const options = {
        maxSizeMB: 0.5,           // Target 500KB
        maxWidthOrHeight: 800,    // Max dimension
        useWebWorker: true,
        fileType: 'image/jpeg'    // Always convert to JPEG
    };

    return await imageCompression(file, options);
}

/**
 * Upload profile photo to Firebase Storage
 * @param userId - User's Firebase Auth UID
 * @param file - Image file to upload
 * @param juniorIndex - Optional index for junior driver photo (0, 1, 2...)
 */
export async function uploadProfilePhoto(
    userId: string,
    file: File,
    juniorIndex?: number
): Promise<string> {
    // 1. Compress image
    const compressedFile = await compressImage(file);

    // 2. Create storage reference
    const fileName = juniorIndex !== undefined
        ? `profile-photos/${userId}_junior_${juniorIndex}.jpg`
        : `profile-photos/${userId}.jpg`;
    const photoRef = ref(storage, fileName);

    // 3. Upload to Firebase Storage
    await uploadBytes(photoRef, compressedFile);

    // 4. Get download URL
    const downloadURL = await getDownloadURL(photoRef);

    // 5. Update Firestore user document
    const userRef = doc(db, 'users', userId);

    if (juniorIndex !== undefined) {
        // Update junior driver's photoURL - preserve all existing fields
        const userDoc = await getDoc(userRef);
        const juniorDrivers = userDoc.data()?.juniorDrivers || [];
        if (juniorDrivers[juniorIndex]) {
            // Preserve all existing fields (name, age, etc.) and just update photoURL
            juniorDrivers[juniorIndex] = {
                ...juniorDrivers[juniorIndex],
                photoURL: downloadURL
            };
            await updateDoc(userRef, { juniorDrivers });
        }
    } else {
        // Update parent's photoURL
        await updateDoc(userRef, { photoURL: downloadURL });
    }

    return downloadURL;
}

/**
 * Delete profile photo from Firebase Storage
 * @param userId - User's Firebase Auth UID
 * @param juniorIndex - Optional index for junior driver photo
 */
export async function deleteProfilePhoto(
    userId: string,
    juniorIndex?: number
): Promise<void> {
    // 1. Create storage reference
    const fileName = juniorIndex !== undefined
        ? `profile-photos/${userId}_junior_${juniorIndex}.jpg`
        : `profile-photos/${userId}.jpg`;
    const photoRef = ref(storage, fileName);

    // 2. Delete from Storage
    await deleteObject(photoRef);

    // 3. Update Firestore
    const userRef = doc(db, 'users', userId);

    if (juniorIndex !== undefined) {
        // Remove junior driver's photoURL - preserve all other existing fields
        const userDoc = await getDoc(userRef);
        const juniorDrivers = userDoc.data()?.juniorDrivers || [];
        if (juniorDrivers[juniorIndex]) {
            // Preserve all existing fields and just remove photoURL
            const { photoURL, ...rest } = juniorDrivers[juniorIndex];
            juniorDrivers[juniorIndex] = rest;
            await updateDoc(userRef, { juniorDrivers });
        }
    } else {
        // Remove parent's photoURL
        await updateDoc(userRef, { photoURL: null });
    }
}

/**
 * Validate file before upload
 * Returns error message or null if valid
 */
export function validatePhotoFile(file: File): string | null {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        return 'Please upload a JPG, PNG, or WebP image';
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        return 'File size must be less than 10MB';
    }

    return null; // Valid
}
