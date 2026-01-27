
import { Stripe } from 'stripe';
import { adminService } from '../services/adminService';
import { MEMBERSHIP_TIERS } from '../../config/membership';

// Initialize Stripe
// @ts-ignore: Version mismatch with installed types
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
});

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

        // 1. Loop through defined tiers
        for (const tier of MEMBERSHIP_TIERS) {
            console.log(`Processing tier: ${tier.name}`);

            // Create Product
            const product = await stripe.products.create({
                name: `Kartcade ${tier.name} Membership`,
                description: `${tier.credits}h of ${tier.equipmentName} time per month`,
                metadata: {
                    equipmentType: tier.equipmentType,
                    level: tier.level,
                    tierId: tier.id
                }
            });

            // Create Price
            const price = await stripe.prices.create({
                product: product.id,
                unit_amount: tier.price * 100, // cents
                currency: 'usd',
                recurring: {
                    interval: 'month',
                },
                metadata: {
                    tierId: tier.id
                }
            });

            // store the mapping
            config[tier.id] = price.id;
            createdProducts.push({
                name: tier.name,
                priceId: price.id
            });

            console.log(`Created ${tier.name}: ${price.id}`);
        }

        // 2. Save mapping to Firestore
        await adminService.saveStripeConfig(config);

        // 3. Return nice HTML success page
        res.setHeader('Content-Type', 'text/html');
        res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Stripe Setup Complete</title>
            <style>
                body { font-family: system-ui, -apple-system, sans-serif; background: #111; color: white; display: flex; justify-content: center; items-center; height: 100vh; margin: 0; }
                .card { background: #222; padding: 2rem; border-radius: 1rem; border: 1px solid #333; max-width: 500px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                h1 { color: #2D9E49; margin-top: 0; display: flex; align-items: center; gap: 0.5rem; }
                .success-icon { font-size: 1.5rem; }
                ul { list-style: none; padding: 0; margin: 1.5rem 0; text-align: left; }
                li { padding: 0.5rem 0; border-bottom: 1px solid #333; display: flex; justify-content: space-between; font-size: 0.9rem; }
                li:last-child { border-bottom: none; }
                .label { color: #888; }
                .value { font-family: monospace; color: #ccc; }
                .btn { display: inline-block; background: #333; color: white; padding: 0.8rem 1.5rem; text-decoration: none; border-radius: 0.5rem; margin-top: 1rem; transition: background 0.2s; }
                .btn:hover { background: #444; }
            </style>
        </head>
        <body>
            <div class="card text-center">
                <h1><span class="success-icon">✅</span> System Setup Complete</h1>
                <p>Your Kartcade payment system is now fully initialized.</p>
                
                <ul>
                    <li><span class="label">Stripe Connection</span> <span class="value">Active</span></li>
                    <li><span class="label">Products Created</span> <span class="value">${createdProducts.length}</span></li>
                    <li><span class="label">Database Updated</span> <span class="value">True</span></li>
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
            <h1>❌ Setup Failed</h1>
            <p>Error: ${err.message}</p>
            <pre>${JSON.stringify(err, null, 2)}</pre>
        `);
    }
}
