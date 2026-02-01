
export default async function handler(req: any, res: any) {
    // Simple diagnostic endpoint
    const checks = {
        timestamp: new Date().toISOString(),
        environment: {
            STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? '✅ Set (' + process.env.STRIPE_SECRET_KEY.substring(0, 10) + '...)' : '❌ Missing',
            FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing',
            FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? '✅ Set' : '❌ Missing',
            FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? '✅ Set (' + process.env.FIREBASE_PRIVATE_KEY.substring(0, 30) + '...)' : '❌ Missing',
        }
    };

    res.setHeader('Content-Type', 'text/html');
    res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Environment Check</title></head>
        <body style="font-family: system-ui; background: #111; color: white; padding: 40px;">
            <h1>🔍 Environment Variable Check</h1>
            <p>Timestamp: ${checks.timestamp}</p>
            <h2>Variables:</h2>
            <ul>
                <li>STRIPE_SECRET_KEY: ${checks.environment.STRIPE_SECRET_KEY}</li>
                <li>FIREBASE_PROJECT_ID: ${checks.environment.FIREBASE_PROJECT_ID}</li>
                <li>FIREBASE_CLIENT_EMAIL: ${checks.environment.FIREBASE_CLIENT_EMAIL}</li>
                <li>FIREBASE_PRIVATE_KEY: ${checks.environment.FIREBASE_PRIVATE_KEY}</li>
            </ul>
            <p style="color: #888; margin-top: 40px;">If any show ❌ Missing, they need to be added to Vercel Environment Variables.</p>
        </body>
        </html>
    `);
}
