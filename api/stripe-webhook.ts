
import { Stripe } from 'stripe';
import { buffer } from 'micro';
import { adminService } from './services/adminService';
import { MEMBERSHIP_TIERS } from '../config/membership';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16', // @ts-ignore: Version mismatch with installed types
});

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
                await handleCheckoutCompleted(session);
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
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
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
    const subscriptionId = invoice.subscription as string;

    // If subscription is missing or expanded object, handle strictly string ID
    if (!subscriptionId || typeof subscriptionId !== 'string') return;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Explicitly cast to any to access metadata safely if types are outdated
    const subData = subscription as any;

    // Check if metadata exists on subscription (it should propagate from creation)
    const userId = subData.metadata?.userId;
    const tierId = subData.metadata?.tierId;

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
