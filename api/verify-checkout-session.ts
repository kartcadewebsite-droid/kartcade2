
import { Stripe } from 'stripe';
import { bookingService } from './services/bookingService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia' as any,
});

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
        console.log(`[VERIFY API] Handling verification for session: ${session_id}`);

        // Use the unified booking service to handle fulfillment
        // This handles bookings, memberships, idempotency, and the "lock" race condition
        const result = await bookingService.fulfillStripeBooking(session_id, 'redirect');

        return res.json({
            success: true,
            ...result
        });

    } catch (err: any) {
        console.error('[VERIFY API] Error:', err.message);

        // Special case: if session is not paid yet, return a graceful status
        if (err.message === 'SESSION_NOT_PAID') {
            return res.json({
                success: false,
                status: 'unpaid',
                message: 'Payment collection is still in progress.'
            });
        }

        return res.status(500).json({
            success: false,
            error: err.message || 'Verification failed',
            details: 'The system encountered an error while verifying your payment. Please refresh or contact support.'
        });
    }
}
