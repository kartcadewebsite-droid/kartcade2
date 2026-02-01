
import { Stripe } from 'stripe';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Membership tier definitions (matching config/membership.ts)
const MEMBERSHIP_TIERS = [
    // KART MEMBERSHIPS
    { id: 'bronze_kart', name: 'Bronze Kart', price: 75, credits: 5, equipmentType: 'kart', equipmentName: 'Racing Karts', level: 'bronze' },
    { id: 'silver_kart', name: 'Silver Kart', price: 150, credits: 10, equipmentType: 'kart', equipmentName: 'Racing Karts', level: 'silver' },
    { id: 'gold_kart', name: 'Gold Kart', price: 300, credits: 20, equipmentType: 'kart', equipmentName: 'Racing Karts', level: 'gold' },
    // RIG MEMBERSHIPS
    { id: 'bronze_rig', name: 'Bronze Rig', price: 100, credits: 5, equipmentType: 'rig', equipmentName: 'Full-Size Rigs', level: 'bronze' },
    { id: 'silver_rig', name: 'Silver Rig', price: 200, credits: 10, equipmentType: 'rig', equipmentName: 'Full-Size Rigs', level: 'silver' },
    { id: 'gold_rig', name: 'Gold Rig', price: 400, credits: 20, equipmentType: 'rig', equipmentName: 'Full-Size Rigs', level: 'gold' },
    // MOTION MEMBERSHIPS
    { id: 'bronze_motion', name: 'Bronze Motion', price: 125, credits: 5, equipmentType: 'motion', equipmentName: 'Motion Simulator', level: 'bronze' },
    { id: 'silver_motion', name: 'Silver Motion', price: 250, credits: 10, equipmentType: 'motion', equipmentName: 'Motion Simulator', level: 'silver' },
    { id: 'gold_motion', name: 'Gold Motion', price: 500, credits: 20, equipmentType: 'motion', equipmentName: 'Motion Simulator', level: 'gold' },
];

// Initialize Firebase Admin (inline)
if (!admin.apps.length) {
    let credential;

    // Option 1: Full JSON in FIREBASE_SERVICE_ACCOUNT_KEY (recommended)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        credential = admin.credential.cert(serviceAccount);
    }
    // Option 2: Individual keys (legacy)
    else {
        credential = admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        });
    }

    admin.initializeApp({ credential });
}


const db = getFirestore();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        res.status(405).end('Method Not Allowed');
        return;
    }

    try {
        console.log('Starting Stripe Initialization...');

        const config: Record<string, string> = {};
        const createdProducts = [];

        // 0. Fetch existing products to prevent duplicates (Idempotency)
        const existingProducts = await stripe.products.list({ limit: 100, active: true });

        // 1. Loop through defined tiers
        for (const tier of MEMBERSHIP_TIERS) {
            console.log(`Processing tier: ${tier.name}`);
            const productName = `Kartcade ${tier.name} Membership`;

            let productId: string;
            let priceId: string | undefined;

            // Check if exists
            const existing = existingProducts.data.find(p => p.name === productName);

            if (existing) {
                console.log(`✅ Product already exists: ${productName} (${existing.id})`);
                productId = existing.id;

                // Find all active prices for this product
                const prices = await stripe.prices.list({ product: productId, active: true, limit: 10 });
                const expectedAmount = tier.price * 100; // in cents

                // Check if any price has the correct amount
                const correctPrice = prices.data.find(p => p.unit_amount === expectedAmount);

                if (correctPrice) {
                    console.log(`✅ Found correct price: $${tier.price}`);
                    priceId = correctPrice.id;
                } else {
                    // Price exists but with wrong amount - create new price
                    console.log(`⚠️ Price amount mismatch! Creating new price with correct amount: $${tier.price}`);
                    const newPrice = await stripe.prices.create({
                        product: productId,
                        unit_amount: expectedAmount,
                        currency: 'usd',
                        recurring: { interval: 'month' },
                        metadata: { tierId: tier.id }
                    });
                    priceId = newPrice.id;
                    console.log(`✅ Created new price: ${priceId}`);
                }
            } else {
                // Create New Product
                console.log(`🆕 Creating new product: ${productName}`);
                const product = await stripe.products.create({
                    name: productName,
                    description: `${tier.credits}h of ${tier.equipmentName} time per month`,
                    metadata: {
                        equipmentType: tier.equipmentType,
                        level: tier.level,
                        tierId: tier.id
                    }
                });
                productId = product.id;

                // Create Price
                const price = await stripe.prices.create({
                    product: productId,
                    unit_amount: tier.price * 100,
                    currency: 'usd',
                    recurring: { interval: 'month' },
                    metadata: { tierId: tier.id }
                });
                priceId = price.id;
            }

            // store the mapping
            if (priceId) {
                config[tier.id] = priceId;
                createdProducts.push({
                    name: tier.name,
                    priceId: priceId,
                    status: existing ? 'Found Existing' : 'Created New'
                });
            }
        }

        // 2. Save mapping to Firestore (inline function)
        await db.collection('system').doc('stripe_config').set({
            prices: config,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log('Stripe config saved to Firestore');

        // 3. Return nice HTML success page
        res.setHeader('Content-Type', 'text/html');
        res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Stripe Setup Complete</title>
            <style>
                body { font-family: system-ui, -apple-system, sans-serif; background: #111; color: white; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
                .card { background: #222; padding: 2rem; border-radius: 1rem; border: 1px solid #333; max-width: 500px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.5); text-align: center; }
                h1 { color: #2D9E49; margin-top: 0; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
                .success-icon { font-size: 1.5rem; }
                ul { list-style: none; padding: 0; margin: 1.5rem 0; text-align: left; }
                li { padding: 0.75rem 0; border-bottom: 1px solid #333; display: flex; justify-content: space-between; font-size: 0.9rem; }
                li:last-child { border-bottom: none; }
                .label { color: #888; }
                .value { font-family: monospace; color: #2D9E49; }
                .btn { display: inline-block; background: #2D9E49; color: white; padding: 0.8rem 1.5rem; text-decoration: none; border-radius: 0.5rem; margin-top: 1rem; transition: background 0.2s; }
                .btn:hover { background: #248a3f; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1><span class="success-icon">✅</span> System Setup Complete</h1>
                <p>Your Kartcade payment system is now fully initialized.</p>
                
                <ul>
                    <li><span class="label">Stripe Connection</span> <span class="value">Active ✓</span></li>
                    <li><span class="label">Products Created</span> <span class="value">${createdProducts.length}</span></li>
                    <li><span class="label">Database Updated</span> <span class="value">True ✓</span></li>
                </ul>

                <p style="color: #666; font-size: 0.8rem; margin-top: 2rem;">You can safely close this window.</p>
                <a href="/" class="btn">Go to Homepage</a>
            </div>
        </body>
        </html>
        `);

    } catch (err: any) {
        console.error('Initialization Error:', err);
        res.status(500).send(`
            <html>
            <head><title>Setup Failed</title></head>
            <body style="font-family: system-ui; background: #111; color: white; padding: 40px;">
                <h1>❌ Setup Failed</h1>
                <p style="color: #ff6b6b;">Error: ${err.message}</p>
                <pre style="background: #222; padding: 20px; border-radius: 8px; overflow: auto;">${JSON.stringify(err, null, 2)}</pre>
            </body>
            </html>
        `);
    }
}
