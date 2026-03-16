
import { Stripe } from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia' as any, // Cast to any to avoid TS version mismatch
});

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
        return;
    }

    try {
        const { priceId, userId, userEmail, tierId, oldSubscriptionId, equipmentType, mode, amount, productName, bookingDetails } = req.body;

        if (!userId || (!priceId && !amount)) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        let sessionConfig: any = {
            customer_email: userEmail,
            payment_method_types: ['card'],
            success_url: `${req.headers.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/checkout/cancel`,
            metadata: {
                userId: userId,
                hostUserId: userId,
                type: mode === 'payment' ? 'booking_deposit' : 'membership_purchase',
            }
        };

        if (amount) {
            // ONE-TIME PAYMENT (Deposit)
            sessionConfig.mode = 'payment';
            sessionConfig.line_items = [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: productName || 'Booking Deposit',
                    },
                    unit_amount: Math.round(amount), // Amount in cents
                },
                quantity: 1,
            }];
            sessionConfig.metadata.bookingType = 'deposit';

            // Add Booking Details to Metadata (for Webhook Fulfillment)
            if (bookingDetails) {
                sessionConfig.metadata.bookingStation = bookingDetails.station;
                sessionConfig.metadata.bookingDate = bookingDetails.date;
                sessionConfig.metadata.bookingTime = bookingDetails.time;
                sessionConfig.metadata.bookingDrivers = bookingDetails.drivers;
                sessionConfig.metadata.bookingDuration = bookingDetails.duration;
                sessionConfig.metadata.bookingName = bookingDetails.name;
                sessionConfig.metadata.bookingEmail = bookingDetails.email;
                sessionConfig.metadata.bookingPhone = bookingDetails.phone;
                // Truncate notes if needed to avoid 500 char limit
                if (bookingDetails.notes) {
                    sessionConfig.metadata.bookingNotes = bookingDetails.notes.substring(0, 400);
                }
                if (bookingDetails.stationEquipment) {
                    sessionConfig.metadata.bookingEquipment = JSON.stringify(bookingDetails.stationEquipment);
                }

                // Party Specific Metadata
                if (bookingDetails.isParty === 'true') {
                    sessionConfig.metadata.isParty = 'true';
                    sessionConfig.metadata.totalPrice = bookingDetails.totalPrice?.toString() || '0';
                    sessionConfig.metadata.depositPaid = (amount / 100).toString(); // Stripe amount is in cents
                    sessionConfig.metadata.remainingBalance = (parseFloat(bookingDetails.totalPrice || '0') - (amount / 100)).toString();
                }
            }
        } else {
            // SUBSCRIPTION (Membership)
            sessionConfig.mode = 'subscription';
            sessionConfig.line_items = [{
                price: priceId,
                quantity: 1,
            }];
            sessionConfig.metadata.tierId = tierId;
            sessionConfig.metadata.oldSubscriptionId = oldSubscriptionId || '';
            sessionConfig.metadata.equipmentType = equipmentType || '';

            sessionConfig.subscription_data = {
                metadata: {
                    userId: userId,
                    tierId: tierId,
                    equipmentType: equipmentType || ''
                }
            };

            // BTP SPECIFIC: Reset on the 1st of the month
            if (tierId === 'btp_monthly') {
                const now = new Date();
                const firstOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                const anchorTimestamp = Math.floor(firstOfNextMonth.getTime() / 1000);

                sessionConfig.subscription_data.billing_cycle_anchor = anchorTimestamp;
                sessionConfig.subscription_data.proration_behavior = 'create_prorations';
            }
        }

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create(sessionConfig);

        res.status(200).json({ url: session.url });
    } catch (err: any) {
        console.error('Stripe Checkout Error:', err);
        res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
}
