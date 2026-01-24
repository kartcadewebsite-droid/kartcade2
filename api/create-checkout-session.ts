
import { Stripe } from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16', // Use latest API version
});

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
        return;
    }

    try {
        const { priceId, userId, userEmail, tierId } = req.body;

        if (!priceId || !userId) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer_email: userEmail,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${req.headers.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/checkout/cancel`,
            metadata: {
                userId: userId,
                tierId: tierId,
                type: 'membership_purchase'
            },
            subscription_data: {
                metadata: {
                    userId: userId,
                    tierId: tierId
                }
            }
        });

        res.status(200).json({ url: session.url });
    } catch (err: any) {
        console.error('Stripe Checkout Error:', err);
        res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
}
