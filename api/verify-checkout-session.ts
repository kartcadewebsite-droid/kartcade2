
import { Stripe } from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia' as any,
});

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzlJM7zscm9Txy-5Q2MLqoqDtzbab6a0L-CtUWIRUWrN0Bo8b-GGK51iuDa6hQOBpV5UA/exec';

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        res.status(405).end('Method Not Allowed');
        return;
    }

    const { session_id } = req.query;

    if (!session_id || typeof session_id !== 'string') {
        return res.status(400).json({ error: 'Missing session_id' });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status !== 'paid') {
            return res.json({ success: false, status: session.payment_status, message: 'Payment not completed' });
        }

        const metadata = session.metadata || {};
        const type = metadata.type;

        if (type === 'booking_deposit') {
            // It's a booking! Let's ensure it's created in Google Sheets

            // 1. Construct parameters for Apps Script
            const params = new URLSearchParams({
                action: 'book',
                date: metadata.bookingDate || '',
                time: metadata.bookingTime || '',
                station: metadata.bookingStation || '',
                drivers: (metadata.bookingDrivers || '1').toString(),
                name: metadata.bookingName || 'Guest',
                email: metadata.bookingEmail || (session.customer_details?.email || ''),
                phone: metadata.bookingPhone || '',
                paymentMethod: 'deposit',
                notes: (metadata.bookingNotes || '') + ` [Stripe Verified: ${session.payment_intent}]`
            });

            // 2. Call Google Apps Script
            const url = `${GOOGLE_APPS_SCRIPT_URL}?${params.toString()}`;
            const response = await fetch(url, { method: 'GET' });
            const data = await response.json();

            // Return success with booking details
            return res.json({
                success: true,
                type: 'booking',
                booking: data,
                details: {
                    station: metadata.bookingStation,
                    date: metadata.bookingDate,
                    time: metadata.bookingTime,
                    amount: session.amount_total
                }
            });

        } else if (type === 'membership_purchase') {
            // Return membership details
            return res.json({
                success: true,
                type: 'membership',
                tierId: metadata.tierId
            });
        }

        return res.json({ success: true, type: 'unknown', metadata });

    } catch (err: any) {
        console.error('Verify Session Error:', err);
        return res.status(500).json({ error: err.message });
    }
}
