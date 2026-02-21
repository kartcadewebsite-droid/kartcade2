
import { Stripe } from 'stripe';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia' as any,
});

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzlJM7zscm9Txy-5Q2MLqoqDtzbab6a0L-CtUWIRUWrN0Bo8b-GGK51iuDa6hQOBpV5UA/exec';

// ============================================================
// SELF-CONTAINED CONFIG (Inlined to fix Vercel ERR_MODULE_NOT_FOUND)
// ============================================================
export interface MembershipTier {
    id: string;
    name: string;
    level: 'bronze' | 'silver' | 'gold';
    equipmentType: 'kart' | 'rig' | 'motion';
    equipmentName: string;
    price: number;
    credits: number;
    pricePerCredit: number;
    regularPrice: number;
    savings: number;
    color: string;
    popular?: boolean;
    stripePriceId?: string;
}

export const MEMBERSHIP_TIERS: MembershipTier[] = [
    { id: 'bronze_kart', name: 'Bronze Kart', level: 'bronze', equipmentType: 'kart', equipmentName: 'Racing Karts', price: 75, credits: 5, pricePerCredit: 15, regularPrice: 30, savings: 15, color: '#CD7F32', stripePriceId: 'price_placeholder_bronze_kart' },
    { id: 'silver_kart', name: 'Silver Kart', level: 'silver', equipmentType: 'kart', equipmentName: 'Racing Karts', price: 150, credits: 10, pricePerCredit: 15, regularPrice: 30, savings: 15, color: '#C0C0C0', popular: true, stripePriceId: 'price_placeholder_silver_kart' },
    { id: 'gold_kart', name: 'Gold Kart', level: 'gold', equipmentType: 'kart', equipmentName: 'Racing Karts', price: 300, credits: 20, pricePerCredit: 15, regularPrice: 30, savings: 15, color: '#FFD700', stripePriceId: 'price_placeholder_gold_kart' },
    { id: 'bronze_rig', name: 'Bronze Rig', level: 'bronze', equipmentType: 'rig', equipmentName: 'Full-Size Rigs', price: 100, credits: 5, pricePerCredit: 20, regularPrice: 40, savings: 20, color: '#CD7F32', stripePriceId: 'price_placeholder_bronze_rig' },
    { id: 'silver_rig', name: 'Silver Rig', level: 'silver', equipmentType: 'rig', equipmentName: 'Full-Size Rigs', price: 200, credits: 10, pricePerCredit: 20, regularPrice: 40, savings: 20, color: '#C0C0C0', popular: true, stripePriceId: 'price_placeholder_silver_rig' },
    { id: 'gold_rig', name: 'Gold Rig', level: 'gold', equipmentType: 'rig', equipmentName: 'Full-Size Rigs', price: 400, credits: 20, pricePerCredit: 20, regularPrice: 40, savings: 20, color: '#FFD700', stripePriceId: 'price_placeholder_gold_rig' },
    { id: 'bronze_motion', name: 'Bronze Motion', level: 'bronze', equipmentType: 'motion', equipmentName: 'Motion Simulator', price: 125, credits: 5, pricePerCredit: 25, regularPrice: 50, savings: 25, color: '#CD7F32', stripePriceId: 'price_placeholder_bronze_motion' },
    { id: 'silver_motion', name: 'Silver Motion', level: 'silver', equipmentType: 'motion', equipmentName: 'Motion Simulator', price: 250, credits: 10, pricePerCredit: 25, regularPrice: 50, savings: 25, color: '#C0C0C0', popular: true, stripePriceId: 'price_placeholder_silver_motion' },
    { id: 'gold_motion', name: 'Gold Motion', level: 'gold', equipmentType: 'motion', equipmentName: 'Motion Simulator', price: 500, credits: 20, pricePerCredit: 25, regularPrice: 50, savings: 25, color: '#FFD700', stripePriceId: 'price_placeholder_gold_motion' }
];

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

/**
 * INLINED BOOKING SERVICE LOGIC
 * Copied directly to ensure Vercel bundles it correctly.
 */
async function fulfillStripeBooking(sessionId: string, source: 'webhook' | 'redirect', retryCount = 0): Promise<any> {
    const db = getDb();
    const lockRef = db.collection('bookings_fulfillment').doc(sessionId);

    console.log(`[VERIFY ENDPOINT] Request from ${source} for session ${sessionId}`);

    try {
        // 1. Transactional Lock: Determine who is responsible for this fulfillment
        return await db.runTransaction(async (transaction) => {
            const lockDoc = await transaction.get(lockRef);

            // If it's already finished, return the success data immediately
            if (lockDoc.exists && lockDoc.data()?.status === 'SUCCESS') {
                console.log(`[VERIFY ENDPOINT] Session ${sessionId} already fulfilled by ${lockDoc.data()?.fulfilledBy}. Source ${source} skipped.`);
                return { success: true, alreadyProcessed: true, ...lockDoc.data() };
            }

            // If it's currently IN_PROGRESS by another process, let's wait a bit (or return pending)
            if (lockDoc.exists && lockDoc.data()?.status === 'IN_PROGRESS') {
                if (source === 'redirect' || source === 'webhook') {
                    // Both source types should wait and retry if another process is currently fulfilling
                    console.log(`[VERIFY ENDPOINT] Session ${sessionId} is IN_PROGRESS by ${lockDoc.data()?.fulfilledBy}. ${source} waiting...`);
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
            const metadata = (session.metadata || {}) as any;

            // Fixed type detection
            const type = metadata.type || metadata.bookingType || (metadata.tierId ? 'membership_purchase' : (metadata.bookingDate ? 'booking_deposit' : 'unknown'));

            if (type === 'unknown') {
                console.warn(`[VERIFY ENDPOINT] Unknown payment type for session ${sessionId}. Metadata:`, metadata);
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
                // Calculate the real estimated value for CRM stats
                const equipmentBreakdown = metadata.bookingEquipment ? JSON.parse(metadata.bookingEquipment) : null;
                const durationHours = parseInt(metadata.bookingDuration || '1');

                let calculatedPrice = 0;
                if (equipmentBreakdown) {
                    const prices: Record<string, number> = { karts: 30, rigs: 40, motion: 50, flight: 40 };
                    for (const [type, qty] of Object.entries(equipmentBreakdown)) {
                        calculatedPrice += (prices[type] || 0) * (qty as number) * durationHours;
                    }
                }

                // Create Transaction Log
                transaction.set(db.collection('transactions_log').doc(), {
                    userId: metadata.userId || '',
                    email: metadata.bookingEmail || session.customer_details?.email || '',
                    type: metadata.isParty === 'true' ? 'party_booking' : 'booking_deposit',
                    station: stationFormatted,
                    equipment: equipmentBreakdown,
                    date: metadata.bookingDate,
                    time: metadata.bookingTime,
                    drivers: parseInt(drivers),
                    duration: durationHours,
                    name: metadata.bookingName || 'Guest',
                    amount: (session.amount_total || 0) / 100, // Actual paid amount
                    calculatedPrice: calculatedPrice || (session.amount_total || 0) / 100, // Total estimated value
                    stripeSessionId: sessionId,
                    bookingId: gasData.bookingId,
                    fulfillmentSource: source,
                    status: 'confirmed', // CRITICAL: This activates CRM stats
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });

                if (metadata.isParty === 'true') {
                    const partyRef = db.collection('parties').doc();
                    const partyId = partyRef.id;

                    // 🔥 FIX 1: Safely catch 'duration' from Stripe metadata
                    const durationStr = metadata.bookingDuration || metadata.duration || '2';
                    const durationInt = parseInt(durationStr);

                    const amountPaid = (session.amount_total || 0) / 100;

                    // 🔥 FIX 2: Guaranteed Pricing Math
                    const PARTY_PRICES: Record<number, number> = { 2: 400, 3: 600, 4: 800 };
                    const totalPrice = PARTY_PRICES[durationInt] || 400;

                    // 🔥 FIX 3: Never allow a negative balance
                    const remainingBalance = Math.max(0, totalPrice - amountPaid);

                    // 1. Create the Party Doc
                    transaction.set(partyRef, {
                        partyId: partyId,
                        hostUserId: metadata.hostUserId || metadata.userId || '',
                        hostName: metadata.bookingName || 'Guest',
                        hostEmail: metadata.bookingEmail || session.customer_details?.email || '',
                        hostPhone: metadata.bookingPhone || '',
                        bookingDate: metadata.bookingDate,
                        bookingTime: metadata.bookingTime,
                        duration: durationInt,
                        totalPrice: totalPrice,
                        depositPaid: amountPaid, // Used as 'Amount Paid'
                        remainingBalance: remainingBalance,
                        maxGuests: 15,
                        registeredGuests: [],
                        status: 'confirmed',
                        source: 'stripe',
                        bookingId: gasData.bookingId,
                        stripeSessionId: sessionId,
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    });

                    // 2. Link Party to User Profile
                    if (metadata.userId) {
                        const userRef = db.collection('users').doc(metadata.userId);
                        transaction.set(userRef, {
                            partyInfo: {
                                hostingParties: admin.firestore.FieldValue.arrayUnion(partyId)
                            }
                        }, { merge: true });
                    }
                }

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

                // Add Credits
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
                console.error(`[VERIFY ENDPOINT] Max retries reached for session ${sessionId}`);
                throw new Error('FULFILLMENT_TIMEOUT: The other process did not complete in time');
            }
            console.log(`[VERIFY ENDPOINT] Retry ${retryCount + 1}/3 for session ${sessionId}`);
            // Wait and retry
            await new Promise(resolve => setTimeout(resolve, 2000));
            return fulfillStripeBooking(sessionId, source, retryCount + 1);
        }
        console.error(`[VERIFY ENDPOINT] Fulfillment error:`, err);
        throw err;
    }
}

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).end('Method Not Allowed');
    }

    const { session_id } = req.query;

    if (!session_id) {
        return res.status(400).json({ error: 'Missing session_id' });
    }

    try {
        // Use the inlined service
        const result = await fulfillStripeBooking(session_id, 'redirect');
        return res.status(200).json(result);
    } catch (error: any) {
        console.error('Error verifying session:', error);
        return res.status(500).json({ error: error.message });
    }
}
