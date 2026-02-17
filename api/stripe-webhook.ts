
import { Stripe } from 'stripe';
import { buffer } from 'micro';
import { MEMBERSHIP_TIERS } from './config/membership';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzlJM7zscm9Txy-5Q2MLqoqDtzbab6a0L-CtUWIRUWrN0Bo8b-GGK51iuDa6hQOBpV5UA/exec';

// ============================================
// FIREBASE ADMIN INIT (Inlined for Vercel Safety)
// ============================================

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
        } else {
            console.error('FIREBASE_PROJECT_ID is missing in environment variables.');
        }
    }
    return getFirestore();
}

// ============================================
// IDEMPOTENCY: Prevent double-processing of webhook events
// ============================================
async function isEventProcessed(eventId: string): Promise<boolean> {
    const db = getDb();
    try {
        const docRef = db.collection('processed_stripe_events').doc(eventId);
        const doc = await docRef.get();
        return doc.exists;
    } catch {
        return false; // If check fails, process anyway (safer than skipping)
    }
}

async function markEventProcessed(eventId: string, eventType: string): Promise<void> {
    const db = getDb();
    try {
        await db.collection('processed_stripe_events').doc(eventId).set({
            eventType,
            processedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    } catch (err) {
        console.error('[WEBHOOK] Failed to mark event as processed:', err);
    }
}

// Inlined Admin Service
const adminService = {
    async addCredits(userId: string, equipmentType: 'kart' | 'rig' | 'motion', amount: number) {
        const db = getDb();
        try {
            const userRef = db.collection('users').doc(userId);
            await db.runTransaction(async (transaction) => {
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists) throw new Error('User does not exist');
                const userData = userDoc.data();
                const currentCredits = userData?.credits?.[equipmentType] || 0;
                const newCredits = currentCredits + amount;
                transaction.set(userRef, {
                    credits: { ...userData?.credits, [equipmentType]: newCredits }
                }, { merge: true });
                const transactionRef = db.collection('transactions').doc();
                transaction.set(transactionRef, {
                    userId, type: 'credit_add', amount, equipmentType,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(), source: 'system'
                });
            });
            console.log(`Added ${amount} ${equipmentType} credits to ${userId}`);
            return true;
        } catch (error) { console.error('Error adding credits:', error); throw error; }
    },
    async setCredits(userId: string, equipmentType: 'kart' | 'rig' | 'motion', amount: number) {
        const db = getDb();
        try {
            const userRef = db.collection('users').doc(userId);
            await db.runTransaction(async (transaction) => {
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists) throw new Error('User not found');
                const userData = userDoc.data();
                const newCredits = { ...userData?.credits };
                newCredits[equipmentType] = amount;
                transaction.update(userRef, { credits: newCredits });
            });
            return true;
        } catch (error) { console.error('Error setting credits:', error); throw error; }
    },
    async updateMembership(userId: string, tierId: string, equipmentType: 'kart' | 'rig' | 'motion', subscriptionId: string, currentPeriodEnd: Date) {
        const db = getDb();
        try {
            const userRef = db.collection('users').doc(userId);
            const updateKey = `memberships.${equipmentType}`;
            const data = {
                [updateKey]: {
                    active: true, tier: tierId, type: equipmentType, stripeSubscriptionId: subscriptionId,
                    nextBillingDate: admin.firestore.Timestamp.fromDate(currentPeriodEnd),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                }
            };
            await userRef.update(data);
            return true;
        } catch (error) {
            // Fallback for missing parent map
            try {
                const userRef = db.collection('users').doc(userId);
                const updateKey = `memberships.${equipmentType}`;
                await userRef.set({
                    [updateKey]: {
                        active: true, tier: tierId, type: equipmentType, stripeSubscriptionId: subscriptionId,
                        nextBillingDate: admin.firestore.Timestamp.fromDate(currentPeriodEnd),
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    }
                }, { merge: true });
                return true;
            } catch (err) { console.error('Error updating membership:', err); throw err; }
        }
    },
    async deactivateMembership(userId: string, equipmentType: 'kart' | 'rig' | 'motion') {
        const db = getDb();
        try {
            const userRef = db.collection('users').doc(userId);
            const updateKey = `memberships.${equipmentType}.active`;
            await userRef.update({
                [updateKey]: false,
                [`memberships.${equipmentType}.updatedAt`]: admin.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('[WEBHOOK] deactivateMembership update failed, trying set+merge fallback:', error);
            // Fallback: use set with merge (handles missing map)
            try {
                const userRef = db.collection('users').doc(userId);
                await userRef.set({
                    memberships: {
                        [equipmentType]: {
                            active: false,
                            updatedAt: admin.firestore.FieldValue.serverTimestamp()
                        }
                    }
                }, { merge: true });
                return true;
            } catch (fallbackErr) {
                console.error('[WEBHOOK] deactivateMembership fallback also failed:', fallbackErr);
                throw fallbackErr;
            }
        }
    }
};

// ============================================
// MAIN HANDLER
// ============================================

// Disable body parser for this route (required for signature verification)
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
        return;
    }

    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: Stripe.Event;

    try {
        if (!sig || !webhookSecret) {
            throw new Error('Missing signature or webhook secret');
        }
        event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    const eventId = event.id;
    const db = getDb();
    try {
        // IDEMPOTENCY CHECK: Skip already-processed events
        const docRef = db.collection('processed_stripe_events').doc(eventId);
        const doc = await docRef.get();
        if (doc.exists) {
            console.log(`[WEBHOOK] Event ${eventId} already processed, skipping (idempotency guard)`);
            return res.json({ received: true, skipped: true });
        }

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const type = session.metadata?.type;

                if (type === 'booking_deposit') {
                    await handleBookingDeposit(session);
                } else {
                    await handleCheckoutCompleted(session);
                }
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                await handleInvoicePaid(invoice);
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                await handlePaymentFailed(invoice);
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionUpdated(subscription);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionDeleted(subscription);
                break;
            }

            default:
                console.log(`[WEBHOOK] Unhandled event type ${event.type}`);
        }

        // Mark event as processed (idempotency)
        const db = getDb();
        await db.collection('processed_stripe_events').doc(event.id).set({
            eventType: event.type,
            processedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({ received: true });
    } catch (err: any) {
        console.error(`[WEBHOOK] Error handling ${event.type} event: ${err.message}`);
        res.status(500).json({ error: 'Webhook handler failed' });
    }
}

import { bookingService } from './services/bookingService';

/**
 * Handle initial successful checkout (Unified v4)
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    console.log(`[WEBHOOK] Transferring fulfillment to Unified Service: ${session.id}`);
    try {
        await bookingService.fulfillStripeBooking(session.id, 'webhook');
        console.log(`[WEBHOOK] Unified fulfillment complete for session: ${session.id}`);
    } catch (err: any) {
        console.error(`[WEBHOOK] Unified fulfillment failed for session ${session.id}:`, err.message);
        // Important: throw here so Stripe retries the webhook if it's a transient error
        throw err;
    }
}

/**
 * Handle individual booking deposit (Unified v4)
 */
async function handleBookingDeposit(session: Stripe.Checkout.Session) {
    console.log(`[WEBHOOK] Transferring booking deposit to Unified Service: ${session.id}`);
    try {
        await bookingService.fulfillStripeBooking(session.id, 'webhook');
        console.log(`[WEBHOOK] Unified booking fulfillment complete for session: ${session.id}`);
    } catch (err: any) {
        console.error(`[WEBHOOK] Unified booking fulfillment failed for session ${session.id}:`, err.message);
        throw err;
    }
}

/**
 * Handle recurring payment success (Renewals)
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
    const subscriptionId = (invoice as any).subscription as string;

    // If subscription is missing or expanded object, handle strictly string ID
    if (!subscriptionId || typeof subscriptionId !== 'string') return;

    try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;

        // Check if metadata exists on subscription (it should propagate from creation)
        const userId = subscription.metadata?.userId;
        const tierId = subscription.metadata?.tierId;

        if (!userId || !tierId || invoice.billing_reason === 'subscription_create') {
            return;
        }

        console.log(`[WEBHOOK] Processing renewal for user ${userId}, tier ${tierId}`);

        const tier = MEMBERSHIP_TIERS.find(t => t.id === tierId);
        if (!tier) {
            console.error(`[WEBHOOK] Tier "${tierId}" not found for renewal. User: ${userId}`);
            return;
        }

        const equipmentType = tier.equipmentType;
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

        // 1. Extend membership date
        await adminService.updateMembership(
            userId,
            tierId,
            equipmentType,
            subscriptionId,
            currentPeriodEnd
        );

        // 2. Refresh credits (Renewal)
        // Reset balance to tier amount (no rollover)
        await adminService.setCredits(userId, equipmentType, tier.credits);

        console.log(`[WEBHOOK] Renewal complete for ${userId}: ${tier.credits} ${equipmentType} credits refreshed`);

        // CRM PERMANENT LOG: Save renewal record (safe — won't affect renewal)
        const db = getDb();
        try {
            await db.collection('transactions_log').add({
                userId,
                type: 'membership_renewal',
                tierId,
                tierName: tier.name,
                equipmentType,
                amount: (invoice.amount_paid || 0) / 100,
                currency: invoice.currency || 'usd',
                stripeInvoiceId: invoice.id,
                subscriptionId,
                creditsRefreshed: tier.credits,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`[CRM] Logged renewal for ${userId}`);
        } catch (logErr) {
            console.error('[CRM] Failed to log renewal (non-critical):', logErr);
        }
    } catch (err: any) {
        console.error(`[WEBHOOK] RENEWAL FAILURE for invoice ${invoice.id}:`, err.message || err);
        throw err; // Re-throw so Stripe retries
    }
}

/**
 * Handle failed recurring payment
 * Deactivate membership so user can't use credits for free
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
    const subscriptionId = (invoice as any).subscription as string;

    if (!subscriptionId || typeof subscriptionId !== 'string') return;

    // Only act on recurring payment failures, not initial ones
    if (invoice.billing_reason === 'subscription_create') return;

    try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
        const userId = subscription.metadata?.userId;
        const tierId = subscription.metadata?.tierId;

        if (!userId || !tierId) {
            console.error('[WEBHOOK] Missing metadata on failed payment subscription:', subscriptionId);
            return;
        }

        console.log(`[WEBHOOK] Payment FAILED for user ${userId}, tier ${tierId}`);

        const tier = MEMBERSHIP_TIERS.find(t => t.id === tierId);
        if (tier) {
            // Deactivate membership — they can reactivate once payment succeeds
            await adminService.deactivateMembership(userId, tier.equipmentType);
            console.log(`[WEBHOOK] Deactivated ${tier.equipmentType} membership for ${userId} due to payment failure`);
        }
    } catch (err: any) {
        console.error(`[WEBHOOK] Error handling payment failure:`, err.message || err);
    }
}

/**
 * Handle subscription updates (tier changes via Stripe portal)
 * Syncs the new tier/plan to Firebase when customer upgrades/downgrades through portal
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;
    const tierId = subscription.metadata?.tierId;

    if (!userId) {
        console.log('[WEBHOOK] subscription.updated without userId metadata, skipping');
        return;
    }

    // Check if the subscription is still active
    if (subscription.status !== 'active') {
        console.log(`[WEBHOOK] subscription.updated but status is "${subscription.status}", skipping tier sync`);
        return;
    }

    try {
        // Get the current price ID from the subscription to find the matching tier
        const currentPriceId = subscription.items?.data?.[0]?.price?.id;

        if (!currentPriceId) {
            console.log('[WEBHOOK] subscription.updated but no price ID found, skipping');
            return;
        }

        // Try to find the tier by Stripe price ID from our Firestore config
        const db = getDb();
        const configDoc = await db.collection('system').doc('stripe_config').get();
        const pricesMap = configDoc.exists ? configDoc.data()?.prices || {} : {};

        // Reverse lookup: find tier ID from price ID
        let newTierId: string | null = null;
        for (const [tierKey, priceValue] of Object.entries(pricesMap)) {
            if (priceValue === currentPriceId) {
                newTierId = tierKey;
                break;
            }
        }

        // If we couldn't find it in config, fall back to metadata tierId
        if (!newTierId) {
            newTierId = tierId || null;
        }

        if (!newTierId) {
            console.error(`[WEBHOOK] subscription.updated: Could not determine tier for price ${currentPriceId}`);
            return;
        }

        const tier = MEMBERSHIP_TIERS.find(t => t.id === newTierId);
        if (!tier) {
            console.error(`[WEBHOOK] subscription.updated: Tier "${newTierId}" not found in MEMBERSHIP_TIERS`);
            return;
        }

        const equipmentType = tier.equipmentType;
        const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000);

        console.log(`[WEBHOOK] Subscription updated for user ${userId}: syncing to ${newTierId}`);

        // Update membership with new tier
        await adminService.updateMembership(
            userId,
            newTierId,
            equipmentType,
            subscription.id,
            currentPeriodEnd
        );

        // Update subscription metadata to reflect the new tier
        if (newTierId !== tierId) {
            try {
                await stripe.subscriptions.update(subscription.id, {
                    metadata: { ...subscription.metadata, tierId: newTierId }
                });
            } catch (metaErr) {
                console.error('[WEBHOOK] Failed to update subscription metadata:', metaErr);
            }
        }

        console.log(`[WEBHOOK] Subscription update synced: ${userId} now on ${tier.name}`);
    } catch (err: any) {
        console.error(`[WEBHOOK] Error handling subscription update for ${userId}:`, err.message || err);
    }
}

/**
 * Handle cancellation
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;
    const tierId = subscription.metadata?.tierId;

    if (!userId) {
        console.error('[WEBHOOK] subscription.deleted without userId metadata:', subscription.id);
        return;
    }

    console.log(`[WEBHOOK] Processing cancellation for user ${userId}, tier ${tierId}`);

    try {
        if (tierId) {
            const tier = MEMBERSHIP_TIERS.find(t => t.id === tierId);
            if (tier) {
                await adminService.deactivateMembership(userId, tier.equipmentType);
                console.log(`[WEBHOOK] Cancelled ${tier.equipmentType} membership for ${userId}`);
            } else {
                console.warn(`[WEBHOOK] Could not find tier ${tierId} to deactivate. Trying all types...`);
                // Fallback: deactivate all equipment types for this user
                await deactivateAllMemberships(userId);
            }
        } else {
            console.warn(`[WEBHOOK] No tierId on cancelled subscription ${subscription.id}. Deactivating all for ${userId}`);
            await deactivateAllMemberships(userId);
        }
    } catch (err: any) {
        console.error(`[WEBHOOK] Error handling cancellation for ${userId}:`, err.message || err);
    }
}

/**
 * Emergency fallback: deactivate all membership types for a user
 * Used when we can't determine which specific type to deactivate
 */
async function deactivateAllMemberships(userId: string) {
    const equipmentTypes: Array<'kart' | 'rig' | 'motion'> = ['kart', 'rig', 'motion'];
    const db = getDb();
    for (const type of equipmentTypes) {
        try {
            const userRef = db.collection('users').doc(userId);
            const userDoc = await userRef.get();
            if (userDoc.exists && userDoc.data()?.memberships?.[type]?.active) {
                await adminService.deactivateMembership(userId, type);
                console.log(`[WEBHOOK] Deactivated ${type} membership for ${userId} (fallback)`);
            }
        } catch (err) {
            console.error(`[WEBHOOK] Failed to deactivate ${type} for ${userId}:`, err);
        }
    }
}

