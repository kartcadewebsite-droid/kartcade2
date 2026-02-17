
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
    // Option 1: Full JSON in FIREBASE_SERVICE_ACCOUNT_KEY (recommended)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }
    // Option 2: Individual keys (legacy)
    else if (process.env.FIREBASE_PROJECT_ID) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            } as admin.ServiceAccount),
        });
    }
}

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        res.status(405).end('Method Not Allowed');
        return;
    }

    try {
        const db = getFirestore();
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
