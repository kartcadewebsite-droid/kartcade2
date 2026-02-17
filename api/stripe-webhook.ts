
import { Stripe } from 'stripe';
import { buffer } from 'micro';
// Import config relative to this file (API folder)
import { MEMBERSHIP_TIERS } from './config/membership';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia' as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzlJM7zscm9Txy-5Q2MLqoqDtzbab6a0L-CtUWIRUWrN0Bo8b-GGK51iuDa6hQOBpV5UA/exec';

// Disable body parser for Vercel
export const config = {
    api: {
        bodyParser: false,
    },
};

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

    console.log(`[WEBHOOK] Request from ${source} for session ${sessionId}`);

    try {
        // 1. Transactional Lock: Determine who is responsible for this fulfillment
        return await db.runTransaction(async (transaction) => {
            const lockDoc = await transaction.get(lockRef);

            // If it's already finished, return the success data immediately
            if (lockDoc.exists && lockDoc.data()?.status === 'SUCCESS') {
                console.log(`[WEBHOOK] Session ${sessionId} already fulfilled by ${lockDoc.data()?.fulfilledBy}. Source ${source} skipped.`);
                return { success: true, alreadyProcessed: true, ...lockDoc.data() };
            }

            // If it's currently IN_PROGRESS by another process, let's wait a bit (or return pending)
            if (lockDoc.exists && lockDoc.data()?.status === 'IN_PROGRESS') {
                if (source === 'redirect' || source === 'webhook') {
                    // Both source types should wait and retry if another process is currently fulfilling
                    console.log(`[WEBHOOK] Session ${sessionId} is IN_PROGRESS by ${lockDoc.data()?.fulfilledBy}. ${source} waiting...`);
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
                console.warn(`[WEBHOOK] Unknown payment type for session ${sessionId}. Metadata:`, metadata);
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
                console.error(`[WEBHOOK] Max retries reached for session ${sessionId}`);
                throw new Error('FULFILLMENT_TIMEOUT: The other process did not complete in time');
            }
            console.log(`[WEBHOOK] Retry ${retryCount + 1}/3 for session ${sessionId}`);
            // Wait and retry
            await new Promise(resolve => setTimeout(resolve, 2000));
            return fulfillStripeBooking(sessionId, source, retryCount + 1);
        }
        console.error(`[WEBHOOK] Fulfillment error:`, err);
        throw err;
    }
}

/**
 * Handle recurring subscription payments
 */
async function handleInvoicePaid(invoice: any) {
    const db = getDb();
    const subscriptionId = invoice.subscription as string;

    if (!subscriptionId) {
        console.warn('[WEBHOOK] Invoice paid but no subscription ID present');
        return;
    }

    try {
        console.log(`[WEBHOOK] Processing invoice.payment_succeeded for subscription ${subscriptionId}`);

        // Retrieve full subscription to get metadata
        const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
        const { userId, equipmentType, tierId } = (subscription.metadata || {}) as any;

        if (!userId || !equipmentType) {
            console.warn(`[WEBHOOK] Missing metadata on subscription ${subscriptionId}. Cannot update user membership.`);
            return;
        }

        const userRef = db.collection('users').doc(userId);
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

        // Update membership expiry
        await userRef.set({
            memberships: {
                [equipmentType]: {
                    nextBillingDate: admin.firestore.Timestamp.fromDate(currentPeriodEnd),
                    active: true,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    lastPaymentStatus: 'succeeded'
                }
            }
        }, { merge: true });

        console.log(`[WEBHOOK] Successfully extended membership for user ${userId} (${equipmentType}) to ${currentPeriodEnd.toISOString()}`);

        // Assuming renewal DOES add credits based on tier
        if (tierId) {
            const tier = MEMBERSHIP_TIERS.find(t => t.id === tierId);
            if (tier) {
                const userDoc = await userRef.get();
                const userData = userDoc.data();
                const currentCredits = userData?.credits?.[equipmentType] || 0;

                // Add Monthly Credits
                await userRef.set({
                    credits: {
                        [equipmentType]: currentCredits + tier.credits
                    }
                }, { merge: true });
                console.log(`[WEBHOOK] Added ${tier.credits} credits for renewal.`);
            }
        }

    } catch (err: any) {
        console.error(`[WEBHOOK] Error handling invoice.payment_succeeded:`, err.message);
        throw err;
    }
}

/**
 * Handle subscription cancellations/deletions
 */
async function handleSubscriptionDeleted(subscription: any) {
    const db = getDb();
    const { userId, equipmentType } = (subscription.metadata || {}) as any;

    if (!userId || !equipmentType) {
        console.warn(`[WEBHOOK] Subscription deleted but missing metadata: ${subscription.id}`);
        return;
    }

    try {
        console.log(`[WEBHOOK] Processing customer.subscription.deleted for user ${userId}`);
        const userRef = db.collection('users').doc(userId);

        await userRef.set({
            memberships: {
                [equipmentType]: {
                    active: false,
                    canceledAt: admin.firestore.FieldValue.serverTimestamp(),
                    status: 'canceled'
                }
            }
        }, { merge: true });

        console.log(`[WEBHOOK] Deactivated membership for ${userId} (${equipmentType})`);

    } catch (err: any) {
        console.error(`[WEBHOOK] Error handling customer.subscription.deleted:`, err.message);
        throw err;
    }
}

async function handlePaymentFailed(invoice: any) {
    console.error(`[WEBHOOK] Payment failed for invoice ${invoice.id}, subscription ${invoice.subscription}`);
}

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
        return;
    }

    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];

    let event: Stripe.Event;

    try {
        if (!sig || !endpointSecret) throw new Error('Missing stripe signature or secret');
        event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
    } catch (err: any) {
        console.error(`[WEBHOOK] Error verifying webhook signature: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Wrap EACH event handler in its own try/catch and ALWAYS return 200
    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as any;
            console.log(`[WEBHOOK] Starting fulfillment for session ${session.id}`);

            try {
                await fulfillStripeBooking(session.id, 'webhook');
                console.log(`[WEBHOOK] Fulfillment complete for session ${session.id}`);
            } catch (fulfillErr: any) {
                // LOG the error but ALWAYS return 200
                // verify-checkout-session.ts safety net will catch failures
                // Returning 500 causes Stripe to retry → race conditions!
                console.error(`[WEBHOOK] Fulfillment failed for ${session.id}:`, fulfillErr.message);
            }
        }
        else if (event.type === 'invoice.payment_succeeded') {
            try {
                await handleInvoicePaid(event.data.object as any);
            } catch (err: any) {
                console.error('[WEBHOOK] Invoice paid handler failed:', err.message);
            }
        }
        else if (event.type === 'customer.subscription.deleted') {
            try {
                await handleSubscriptionDeleted(event.data.object as any);
            } catch (err: any) {
                console.error('[WEBHOOK] Subscription deleted handler failed:', err.message);
            }
        }
        else if (event.type === 'invoice.payment_failed') {
            try {
                await handlePaymentFailed(event.data.object as any);
            } catch (err: any) {
                console.error('[WEBHOOK] Payment failed handler failed:', err.message);
            }
        }

        // ALWAYS return 200 - no matter what!
        return res.status(200).json({ received: true });

    } catch (err: any) {
        // Even catastrophic errors return 200 to Stripe to prevent retry loops
        console.error(`[WEBHOOK] Critical error for ${event.type}:`, err.message);
        return res.status(200).json({ received: true });
    }
}
