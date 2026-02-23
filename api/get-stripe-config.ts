
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

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
        }
    }
    return getFirestore();
}

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        res.status(405).end('Method Not Allowed');
        return;
    }

    try {
        const db = getDb();
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
