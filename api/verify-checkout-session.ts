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
    equipmentType: 'kart' | 'rig' | 'motion' | 'btp';
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
    { id: 'gold_motion', name: 'Gold Motion', level: 'gold', equipmentType: 'motion', equipmentName: 'Motion Simulator', price: 500, credits: 20, pricePerCredit: 25, regularPrice: 50, savings: 25, color: '#FFD700', stripePriceId: 'price_placeholder_gold_motion' },
    { id: 'btp_monthly', name: 'Beat The Pro Monthly', level: 'gold', equipmentType: 'btp' as any, equipmentName: 'BTP Challenge', price: 100, credits: 30, pricePerCredit: 3.33, regularPrice: 450, savings: 350, color: '#FFD700', stripePriceId: 'price_placeholder_btp_monthly' }
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
        const result = await db.runTransaction(async (transaction) => {
            const lockDoc = await transaction.get(lockRef);

            if (lockDoc.exists && lockDoc.data()?.status === 'SUCCESS') {
                console.log(`[VERIFY ENDPOINT] Session ${sessionId} already fulfilled by ${lockDoc.data()?.fulfilledBy}. Source ${source} skipped.`);
                return { success: true, alreadyProcessed: true, ...lockDoc.data() };
            }

            if (lockDoc.exists && lockDoc.data()?.status === 'IN_PROGRESS') {
                if (source === 'redirect' || source === 'webhook') {
                    console.log(`[VERIFY ENDPOINT] Session ${sessionId} is IN_PROGRESS by ${lockDoc.data()?.fulfilledBy}. ${source} waiting...`);
                    throw new Error('PENDING_LOCK');
                }
                return { success: true, status: 'IN_PROGRESS', message: 'Fulfillment already in progress' };
            }

            transaction.set(lockRef, {
                status: 'IN_PROGRESS',
                fulfilledBy: source,
                startTime: admin.firestore.FieldValue.serverTimestamp()
            });

            const session = await stripe.checkout.sessions.retrieve(sessionId);
            const metadata = (session.metadata || {}) as any;

            const type = metadata.type || metadata.bookingType || (metadata.tierId ? 'membership_purchase' : (metadata.bookingDate ? 'booking_deposit' : 'unknown'));

            if (type === 'unknown') {
                console.warn(`[VERIFY ENDPOINT] Unknown payment type for session ${sessionId}. Metadata:`, metadata);
                throw new Error('UNKNOWN_PAYMENT_TYPE');
            }

            if (session.payment_status !== 'paid') {
                throw new Error('SESSION_NOT_PAID');
            }

            let resultData: any = { type };

            if (type === 'booking_deposit') {
                // Booking Logic — UNTOUCHED
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
                    paymentMethod: metadata.paymentMethod || 'deposit',
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

                const equipmentBreakdown = metadata.bookingEquipment ? JSON.parse(metadata.bookingEquipment) : null;
                const durationHours = parseInt(metadata.bookingDuration || '1');

                let calculatedPrice = 0;
                if (equipmentBreakdown) {
                    const prices: Record<string, number> = { karts: 30, rigs: 40, motion: 50, flight: 40 };
                    for (const [type, qty] of Object.entries(equipmentBreakdown)) {
                        calculatedPrice += (prices[type] || 0) * (qty as number) * durationHours;
                    }
                }

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
                    amount: (session.amount_total || 0) / 100,
                    calculatedPrice: calculatedPrice || (session.amount_total || 0) / 100,
                    stripeSessionId: sessionId,
                    bookingId: gasData.bookingId,
                    fulfillmentSource: source,
                    status: 'confirmed',
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });

                if (metadata.isParty === 'true') {
                    const partyRef = db.collection('parties').doc();
                    const partyId = partyRef.id;

                    transaction.set(partyRef, {
                        partyId: partyId,
                        hostUserId: metadata.hostUserId || metadata.userId || '',
                        hostName: metadata.bookingName || 'Guest',
                        hostEmail: metadata.bookingEmail || session.customer_details?.email || '',
                        hostPhone: metadata.bookingPhone || '',
                        bookingDate: metadata.bookingDate,
                        bookingTime: metadata.bookingTime,
                        duration: parseInt(metadata.bookingDuration || metadata.duration || '2'),
                        totalPrice: metadata.totalPrice ? parseFloat(metadata.totalPrice) : 400,
                        depositPaid: metadata.depositPaid ? parseFloat(metadata.depositPaid) : (session.amount_total || 0) / 100,
                        remainingBalance: metadata.remainingBalance ? parseFloat(metadata.remainingBalance) : 0,
                        maxGuests: 15,
                        registeredGuests: [],
                        status: 'confirmed',
                        source: 'stripe',
                        bookingId: gasData.bookingId,
                        stripeSessionId: sessionId,
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    });

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
                // Membership Logic
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

                const membershipUpdate: Record<string, any> = {
                    [`memberships.${equipmentType}.active`]: true,
                    [`memberships.${equipmentType}.tier`]: tierId,
                    [`memberships.${equipmentType}.type`]: equipmentType,
                    [`memberships.${equipmentType}.stripeSubscriptionId`]: subscriptionId || '',
                    [`memberships.${equipmentType}.nextBillingDate`]: admin.firestore.Timestamp.fromDate(currentPeriodEnd),
                    [`memberships.${equipmentType}.updatedAt`]: admin.firestore.FieldValue.serverTimestamp(),
                    [`memberships.${equipmentType}.activatedBy`]: source,
                };

                if (equipmentType === 'btp') {
                    membershipUpdate.btpCredits = tier.credits;
                } else {
                    membershipUpdate[`credits.${equipmentType}`] = tier.credits;
                }

                transaction.update(userRef, membershipUpdate);

                resultData.tierId = tierId;
                resultData.creditsAdded = tier.credits;
                // Pass oldSubId out of transaction so we can cancel AFTER commit
                resultData._oldSubIdToCancel = (metadata.oldSubscriptionId && metadata.oldSubscriptionId !== subscriptionId)
                    ? metadata.oldSubscriptionId
                    : null;

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

            transaction.set(lockRef, finalResult);

            return { ...finalResult, success: true };
        });

        // ✅ FIX: Cancel old subscription AFTER transaction commits.
        // Doing this inside the transaction caused: (1) cancel firing before Firestore
        // committed, and (2) double-cancel if Firestore retried the transaction.
        const oldSubIdToCancel = (result as any)?._oldSubIdToCancel;
        if (oldSubIdToCancel) {
            try {
                await stripe.subscriptions.cancel(oldSubIdToCancel);
                console.log(`[VERIFY ENDPOINT] Cancelled old subscription ${oldSubIdToCancel} (post-transaction commit).`);
            } catch (cancelErr: any) {
                // Non-fatal: old sub may already be cancelled by Stripe — log and continue
                console.warn(`[VERIFY ENDPOINT] Could not cancel old subscription ${oldSubIdToCancel}: ${cancelErr.message}`);
            }
        }

        return result;
    } catch (err: any) {
        if (err.message === 'PENDING_LOCK') {
            if (retryCount >= 3) {
                console.error(`[VERIFY ENDPOINT] Max retries reached for session ${sessionId}`);
                throw new Error('FULFILLMENT_TIMEOUT: The other process did not complete in time');
            }
            console.log(`[VERIFY ENDPOINT] Retry ${retryCount + 1}/3 for session ${sessionId}`);
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
        const result = await fulfillStripeBooking(session_id, 'redirect');
        return res.status(200).json(result);
    } catch (error: any) {
        console.error('Error verifying session:', error);
        return res.status(500).json({ error: error.message });
    }
}