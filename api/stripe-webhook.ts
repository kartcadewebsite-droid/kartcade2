
import { Stripe } from 'stripe';
import { buffer } from 'micro';
import { adminService } from './services/adminService';
import { MEMBERSHIP_TIERS } from '../config/membership';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzlJM7zscm9Txy-5Q2MLqoqDtzbab6a0L-CtUWIRUWrN0Bo8b-GGK51iuDa6hQOBpV5UA/exec';

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

    try {
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

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionDeleted(subscription);
                break;
            }

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
    } catch (err: any) {
        console.error(`Error handling webhook event: ${err.message}`);
        res.status(500).json({ error: 'Webhook handler failed' });
    }
}

/**
 * Handle initial successful checkout
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const metadata = session.metadata || {};
    const userId = metadata.userId;
    const tierId = metadata.tierId;
    const oldSubscriptionId = metadata.oldSubscriptionId;
    const subscriptionId = session.subscription as string;

    if (!userId || !tierId) {
        console.error('Missing metadata in checkout session');
        return;
    }

    console.log(`Processing new subscription for user ${userId}, tier ${tierId}`);

    // Get tier details to know credit amount and equipment type
    const tier = MEMBERSHIP_TIERS.find(t => t.id === tierId);

    if (tier) {
        const equipmentType = tier.equipmentType;

        // 1. Handle Upgrade: Cancel old subscription if ID is provided
        if (oldSubscriptionId) {
            try {
                console.log(`Upgrading: Cancelling old subscription ${oldSubscriptionId}`);
                await stripe.subscriptions.cancel(oldSubscriptionId);
            } catch (err) {
                console.error(`Failed to cancel old subscription ${oldSubscriptionId}:`, err);
                // Continue anyway to activate new plan
            }
        }

        // 2. Create/Update membership record
        // Note: stripe.subscriptions.retrieve returns a Stripe.Subscription object
        const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

        await adminService.updateMembership(
            userId,
            tierId,
            equipmentType,
            subscriptionId,
            currentPeriodEnd
        );

        // 3. Add initial credits
        // For upgrades, we ADD to existing. For new, we ADD (starting from 0).
        // The logic is unchanged: addCredits adds to current balance.
        await adminService.addCredits(userId, equipmentType, tier.credits);
    }
}

/**
 * Handle recurring payment success (Renewals)
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
    const subscriptionId = (invoice as any).subscription as string;

    // If subscription is missing or expanded object, handle strictly string ID
    if (!subscriptionId || typeof subscriptionId !== 'string') return;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;

    // Check if metadata exists on subscription (it should propagate from creation)
    const userId = subscription.metadata?.userId;
    const tierId = subscription.metadata?.tierId;

    if (!userId || !tierId || invoice.billing_reason === 'subscription_create') {
        return;
    }

    console.log(`Processing renewal for user ${userId}, tier ${tierId}`);

    const tier = MEMBERSHIP_TIERS.find(t => t.id === tierId);
    if (tier && userId) {
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
    }
}

/**
 * Handle cancellation
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;
    const tierId = subscription.metadata?.tierId;

    if (userId && tierId) {
        console.log(`Processing cancellation for user ${userId}, tier ${tierId}`);
        const tier = MEMBERSHIP_TIERS.find(t => t.id === tierId);
        if (tier) {
            await adminService.deactivateMembership(userId, tier.equipmentType);
        } else {
            console.warn(`Could not find tier ${tierId} to deactivate.`);
        }
    }
}

/**
 * Handle individual booking deposit (One-time payment)
 */
async function handleBookingDeposit(session: Stripe.Checkout.Session) {
    const metadata = session.metadata || {};

    // Check if we have enough info to create a booking
    if (!metadata.bookingStation || !metadata.bookingDate || !metadata.bookingTime) {
        console.error('Missing booking metadata in checkout session:', session.id);
        return;
    }

    console.log(`Processing booking deposit for user ${metadata.userId} (Station: ${metadata.bookingStation}, Date: ${metadata.bookingDate})`);

    try {
        // Construct URL parameters for Google Apps Script
        const params = new URLSearchParams({
            action: 'book',
            date: metadata.bookingDate,
            time: metadata.bookingTime,
            station: metadata.bookingStation,
            drivers: (metadata.bookingDrivers || '1').toString(),
            name: metadata.bookingName || 'Guest',
            email: metadata.bookingEmail || (session.customer_details?.email || ''),
            phone: metadata.bookingPhone || '',
            paymentMethod: 'deposit', // Mark as paid deposit
            notes: (metadata.bookingNotes || '') + ` [Stripe Deposit: ${session.payment_intent}]`
        });

        const url = `${GOOGLE_APPS_SCRIPT_URL}?${params.toString()}`;

        // Call Google Apps Script
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        if (data.success) {
            console.log(`Booking created successfully! ID: ${data.bookingId}`);
        } else {
            console.error('Google Apps Script returned error:', data.error);
        }

    } catch (err: any) {
        console.error('Failed to call Booking API from Webhook:', err.message);
    }
}
