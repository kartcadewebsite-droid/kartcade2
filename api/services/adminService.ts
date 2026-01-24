
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (this runs server-side only)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

const db = getFirestore();

/**
 * Service for administrative tasks (Server-Side Only)
 * Used by Webhooks and API routes to bypass client-side rules
 */
export const adminService = {
    /**
     * Add credits to a user's account securely
     */
    async addCredits(userId: string, equipmentType: 'kart' | 'rig' | 'motion', amount: number) {
        try {
            const userRef = db.collection('users').doc(userId);

            await db.runTransaction(async (transaction) => {
                const userDoc = await transaction.get(userRef);

                if (!userDoc.exists) {
                    throw new Error('User does not exist');
                }

                const userData = userDoc.data();
                const currentCredits = userData?.credits?.[equipmentType] || 0;
                const newCredits = currentCredits + amount;

                // Update credits
                transaction.set(userRef, {
                    credits: {
                        ...userData?.credits,
                        [equipmentType]: newCredits
                    }
                }, { merge: true });

                // Log transaction
                const transactionRef = db.collection('transactions').doc();
                transaction.set(transactionRef, {
                    userId,
                    type: 'credit_add',
                    amount,
                    equipmentType,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                    source: 'system' // or 'stripe'
                });
            });

            console.log(`Successfully added ${amount} ${equipmentType} credits to user ${userId}`);
            return true;
        } catch (error) {
            console.error('Error adding credits:', error);
            throw error;
        }
    },

    /**
     * Set credits to a specific amount (Used for monthly resets/renewals)
     */
    async setCredits(userId: string, equipmentType: 'kart' | 'rig' | 'motion', amount: number) {
        try {
            const userRef = db.collection('users').doc(userId);

            await db.runTransaction(async (transaction) => {
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists) throw new Error('User not found');

                const userData = userDoc.data();
                const newCredits = { ...userData?.credits };
                newCredits[equipmentType] = amount; // Force set

                transaction.update(userRef, { credits: newCredits });
            });

            console.log(`Successfully reset ${equipmentType} credits for user ${userId} to ${amount}`);
            return true;
        } catch (error) {
            console.error('Error setting credits:', error);
            throw error;
        }
    },

    /**
     * Activate or Update Membership
     */
    async updateMembership(userId: string, tierId: string, subscriptionId: string, currentPeriodEnd: Date) {
        try {
            const userRef = db.collection('users').doc(userId);

            await userRef.set({
                membership: {
                    active: true,
                    tier: tierId,
                    stripeSubscriptionId: subscriptionId,
                    nextBillingDate: admin.firestore.Timestamp.fromDate(currentPeriodEnd),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                }
            }, { merge: true });

            console.log(`Successfully updated membership for user ${userId} to ${tierId}`);
            return true;
        } catch (error) {
            console.error('Error updating membership:', error);
            throw error;
        }
    }
};
