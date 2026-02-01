
import { Stripe } from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);


export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
        return;
    }

    const { userId, userEmail } = req.body;

    if (!userId || !userEmail) {
        return res.status(400).json({ error: 'Missing user details' });
    }

    try {
        // 1. Find the Stripe Customer
        const customers = await stripe.customers.list({
            email: userEmail,
            limit: 1,
        });

        let customerId;

        if (customers.data.length > 0) {
            customerId = customers.data[0].id;
        } else {
            // Should theoretically exist if they have a membership, 
            // but if not, we can't open portal for them effectively without creating one.
            // For now, return error if no customer found.
            return res.status(404).json({ error: 'No billing account found.' });
        }

        // 2. Create Portal Session
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${req.headers.origin}/membership`,
        });

        res.status(200).json({ url: session.url });

    } catch (err: any) {
        console.error('Portal Session Error:', err);
        res.status(500).json({ error: 'Failed to create portal session' });
    }
}
