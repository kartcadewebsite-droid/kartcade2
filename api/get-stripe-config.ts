
import { adminService } from './services/adminService';
import * as admin from 'firebase-admin';

// Re-use admin initialization check from adminService if needed, 
// but receiving `db` or `admin` from a shared module is better.
// Since adminService initiates admin, we can use it, but adminService doesn't export db.
// We will use admin.firestore() since admin is initialized singleton.

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        res.status(405).end('Method Not Allowed');
        return;
    }

    try {
        const db = admin.firestore();
        const doc = await db.collection('system').doc('stripe_config').get();

        if (!doc.exists) {
            return res.status(200).json({ prices: {} });
        }

        const data = doc.data();
        return res.status(200).json({ prices: data?.prices || {} });
    } catch (error) {
        console.error('Error fetching Stripe config:', error);
        res.status(500).json({ error: 'Failed to fetch configuration' });
    }
}
