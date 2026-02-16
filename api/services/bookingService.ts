
import Stripe from 'stripe';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { MEMBERSHIP_TIERS } from '../../config/membership';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia' as any,
});

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzlJM7zscm9Txy-5Q2MLqoqDtzbab6a0L-CtUWIRUWrN0Bo8b-GGK51iuDa6hQOBpV5UA/exec';

/**
 * Lazy-initialize Firebase Admin and return Firestore
 */
function getDb() {
    if (!admin.apps.length) {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            : undefined;

        if (process.env.FIREBASE_PROJECT_ID) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: privateKey,
                }),
            });
        }
    }
    return getFirestore();
}

export const bookingService = {
    /**
     * UNIFIED FULFILLMENT: The single source of truth for completing a Stripe booking
     * Handles both the Webhook and the Browser Redirect concurrently with a lock
     */
    async fulfillStripeBooking(sessionId: string, source: 'webhook' | 'redirect', retryCount = 0) {
        const db = getDb();
        const lockRef = db.collection('bookings_fulfillment').doc(sessionId);

        console.log(`[BOOKING SERVICE] Request from ${source} for session ${sessionId}`);

        try {
            // 1. Transactional Lock: Determine who is responsible for this fulfillment
            return await db.runTransaction(async (transaction) => {
                const lockDoc = await transaction.get(lockRef);

                // If it's already finished, return the success data immediately
                if (lockDoc.exists && lockDoc.data()?.status === 'SUCCESS') {
                    console.log(`[BOOKING SERVICE] Session ${sessionId} already fulfilled by ${lockDoc.data()?.fulfilledBy}. Source ${source} skipped.`);
                    return { success: true, alreadyProcessed: true, ...lockDoc.data() };
                }

                // If it's currently IN_PROGRESS by another process, let's wait a bit (or return pending)
                if (lockDoc.exists && lockDoc.data()?.status === 'IN_PROGRESS') {
                    if (source === 'redirect' || source === 'webhook') {
                        // Both source types should wait and retry if another process is currently fulfilling
                        console.log(`[BOOKING SERVICE] Session ${sessionId} is IN_PROGRESS by ${lockDoc.data()?.fulfilledBy}. ${source} waiting...`);
                        throw new Error('PENDING_LOCK');
                    }
                    return { success: true, status: 'IN_PROGRESS', message: 'Fulfillment already in progress' };
                }

                // 2. We are the Winner! Set lock to IN_PROGRESS
                transaction.set(lockRef, {
                    status: 'IN_PROGRESS',
                    fulfilledBy: source,
                    startTime: admin.firestore.FieldValue.serverTimestamp()
                });

                // 3. Retrieve session details from Stripe
                const session = await stripe.checkout.sessions.retrieve(sessionId);
                const metadata = session.metadata || {};

                // Fixed type detection (Claude's Recommendation)
                const type = metadata.type || metadata.bookingType || (metadata.tierId ? 'membership_purchase' : (metadata.bookingDate ? 'booking_deposit' : 'unknown'));

                if (type === 'unknown') {
                    console.warn(`[BOOKING SERVICE] Unknown payment type for session ${sessionId}. Metadata:`, metadata);
                    throw new Error('UNKNOWN_PAYMENT_TYPE');
                }

                if (session.payment_status !== 'paid') {
                    throw new Error('SESSION_NOT_PAID');
                }

                // ============================================
                // FULFILLMENT Logic (Grouped by type)
                // ============================================

                let resultData: any = { type };

                if (type === 'booking_deposit') {
                    // 4a. Booking Logic
                    const drivers = metadata.bookingDrivers || '1';
                    const duration = metadata.bookingDuration || '1';
                    const stationName = metadata.bookingStation || '';
                    const stationFormatted = stationName.includes(':') && stationName.includes('(')
                        ? stationName
                        : `${stationName}:${drivers} (${duration}h)`;

                    const params = new URLSearchParams({
                        action: 'book',
                        date: metadata.bookingDate || '',
                        time: metadata.bookingTime || '',
                        station: stationFormatted,
                        drivers: drivers.toString(),
                        name: metadata.bookingName || 'Guest',
                        email: metadata.bookingEmail || (session.customer_details?.email || ''),
                        phone: metadata.bookingPhone || '',
                        paymentMethod: 'deposit',
                        notes: (metadata.bookingNotes || '') + ` [Stripe ${source.toUpperCase()}: ${session.payment_intent}]`
                    });

                    const url = `${GOOGLE_APPS_SCRIPT_URL}?${params.toString()}`;

                    const gasResponse = await fetch(url, {
                        method: 'GET',
                        headers: { 'User-Agent': 'Kartcade-Service/4.0', 'Accept': 'application/json' },
                        redirect: 'follow'
                    });
                    const gasData = await gasResponse.json();

                    if (!gasData.success) {
                        throw new Error(gasData.error || 'Google Apps Script failed');
                    }

                    resultData.bookingId = gasData.bookingId;
                    resultData.details = {
                        station: stationFormatted,
                        date: metadata.bookingDate,
                        time: metadata.bookingTime,
                        amount: session.amount_total
                    };

                    // CRM Log
                    transaction.set(db.collection('transactions_log').doc(), {
                        userId: metadata.userId || '',
                        email: metadata.bookingEmail || session.customer_details?.email || '',
                        type: 'booking_deposit',
                        station: stationFormatted,
                        date: metadata.bookingDate,
                        time: metadata.bookingTime,
                        drivers: parseInt(drivers),
                        name: metadata.bookingName || 'Guest',
                        amount: (session.amount_total || 0) / 100,
                        stripeSessionId: sessionId,
                        bookingId: gasData.bookingId,
                        fulfillmentSource: source,
                        createdAt: admin.firestore.FieldValue.serverTimestamp()
                    });

                } else if (type === 'membership_purchase') {
                    // 4b. Membership Logic
                    const userId = metadata.userId;
                    const tierId = metadata.tierId;
                    if (!userId || !tierId) throw new Error('MISSING_METADATA');

                    const tier = MEMBERSHIP_TIERS.find(t => t.id === tierId);
                    if (!tier) throw new Error('INVALID_TIER');

                    const subscriptionId = session.subscription as string;
                    let currentPeriodEnd = new Date();
                    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

                    if (subscriptionId) {
                        const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
                        currentPeriodEnd = new Date(subscription.current_period_end * 1000);
                    }

                    const equipmentType = tier.equipmentType;
                    const userRef = db.collection('users').doc(userId);
                    const userDoc = await transaction.get(userRef);
                    const userData = userDoc.data();

                    // Activate Membership
                    transaction.set(userRef, {
                        memberships: {
                            ...userData?.memberships,
                            [equipmentType]: {
                                active: true,
                                tier: tierId,
                                type: equipmentType,
                                stripeSubscriptionId: subscriptionId || '',
                                nextBillingDate: admin.firestore.Timestamp.fromDate(currentPeriodEnd),
                                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                                activatedBy: source
                            }
                        }
                    }, { merge: true });

                    // Add Credits (Using set {merge: true} as per Claude's recommendation)
                    const currentCredits = userData?.credits?.[equipmentType] || 0;
                    transaction.set(userRef, {
                        credits: {
                            ...userData?.credits,
                            [equipmentType]: currentCredits + tier.credits
                        }
                    }, { merge: true });

                    resultData.tierId = tierId;
                    resultData.creditsAdded = tier.credits;

                    // CRM Log
                    transaction.set(db.collection('transactions_log').doc(), {
                        userId,
                        email: session.customer_details?.email || '',
                        type: 'membership_purchase',
                        tierId,
                        amount: (session.amount_total || 0) / 100,
                        stripeSessionId: sessionId,
                        fulfillmentSource: source,
                        createdAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                }

                const finalResult = {
                    ...resultData,
                    status: 'SUCCESS',
                    fulfilledBy: source,
                    completedAt: admin.firestore.FieldValue.serverTimestamp()
                };

                // Update the lock to SUCCESS
                transaction.set(lockRef, finalResult);

                return { ...finalResult, success: true };
            });
        } catch (err: any) {
            if (err.message === 'PENDING_LOCK') {
                if (retryCount >= 3) {
                    console.error(`[BOOKING SERVICE] Max retries reached for session ${sessionId}`);
                    throw new Error('FULFILLMENT_TIMEOUT: The other process did not complete in time');
                }
                console.log(`[BOOKING SERVICE] Retry ${retryCount + 1}/3 for session ${sessionId}`);
                // Wait and retry
                await new Promise(resolve => setTimeout(resolve, 2000));
                return this.fulfillStripeBooking(sessionId, source, retryCount + 1);
            }
            console.error(`[BOOKING SERVICE] Fulfillment error:`, err);
            throw err;
        }
    }
};
