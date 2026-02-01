
// Use default import for firebase-admin on Vercel
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

export default async function handler(req: any, res: any) {
    const results: any = {
        timestamp: new Date().toISOString(),
        steps: [],
        error: null
    };

    try {
        // Step 1: Check environment variables
        const hasFullJson = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        const hasIndividualKeys = !!(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);

        results.steps.push({
            step: 'Check Environment',
            status: '✅',
            details: {
                FIREBASE_SERVICE_ACCOUNT_KEY: hasFullJson ? `Set (length: ${process.env.FIREBASE_SERVICE_ACCOUNT_KEY!.length})` : 'Not Set',
                FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Not Set',
                FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? 'Set' : 'Not Set',
                FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? 'Set' : 'Not Set',
                usingMethod: hasFullJson ? 'Full JSON' : (hasIndividualKeys ? 'Individual Keys' : 'NONE'),
                adminType: typeof admin,
                hasCredential: !!admin?.credential,
                hasCredentialCert: !!admin?.credential?.cert
            }
        });

        // Step 2: Prepare credential
        results.steps.push({ step: 'Prepare Credentials', status: 'Starting...' });

        let credential;

        if (hasFullJson) {
            const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY!;
            const serviceAccount = JSON.parse(rawJson);
            credential = admin.credential.cert(serviceAccount);
            results.steps[results.steps.length - 1].status = '✅ Parsed full JSON';
        } else if (hasIndividualKeys) {
            credential = admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            } as admin.ServiceAccount);
            results.steps[results.steps.length - 1].status = '✅ Using individual keys';
        } else {
            throw new Error('No Firebase credentials found!');
        }

        // Step 3: Initialize Firebase
        results.steps.push({ step: 'Initialize Firebase', status: 'Starting...' });

        if (!admin.apps.length) {
            admin.initializeApp({ credential });
        }
        results.steps[results.steps.length - 1].status = '✅ Firebase initialized';

        // Step 4: Access Firestore
        results.steps.push({ step: 'Access Firestore', status: 'Starting...' });
        const db = getFirestore();
        results.steps[results.steps.length - 1].status = '✅ Firestore connected';

        // Step 5: Write test document
        results.steps.push({ step: 'Write Test Document', status: 'Starting...' });
        await db.collection('system').doc('connection_test').set({
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            test: 'Firebase Admin SDK working!'
        }, { merge: true });
        results.steps[results.steps.length - 1].status = '✅ Write successful';

        results.success = true;

    } catch (err: any) {
        results.error = {
            message: err.message,
            code: err.code,
            stack: err.stack?.split('\n').slice(0, 10).join('\n')
        };
        results.success = false;
    }

    res.setHeader('Content-Type', 'text/html');
    res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Firebase Connection Test</title></head>
        <body style="font-family: system-ui; background: #111; color: white; padding: 40px; max-width: 800px; margin: 0 auto;">
            <h1>${results.success ? '✅' : '❌'} Firebase Connection Test</h1>
            <p style="color: #888;">Timestamp: ${results.timestamp}</p>
            
            <h2>Steps:</h2>
            <ul style="list-style: none; padding: 0;">
                ${results.steps.map((s: any) => `
                    <li style="margin-bottom: 15px; padding: 15px; background: #222; border-radius: 8px;">
                        <strong>${s.step}</strong>: ${s.status}
                        ${s.details ? `<pre style="background:#333;padding:10px;border-radius:5px;font-size:12px;overflow-x:auto;margin-top:8px;">${JSON.stringify(s.details, null, 2)}</pre>` : ''}
                    </li>
                `).join('')}
            </ul>
            
            ${results.error ? `
                <h2 style="color: #ff6b6b;">❌ Error Details:</h2>
                <pre style="background: #331111; padding: 20px; border-radius: 8px; overflow: auto; color: #ff9999; font-size: 13px;">
Message: ${results.error.message}
Code: ${results.error.code || 'N/A'}

Stack:
${results.error.stack}
                </pre>
            ` : ''}
            
            ${results.success ? `
                <div style="background: #112211; border: 1px solid #2D9E49; padding: 20px; border-radius: 8px; margin-top: 20px;">
                    <h3 style="color: #2D9E49; margin-top: 0;">🎉 Firebase is working!</h3>
                    <p>Now try: <a href="/api/admin/init-stripe" style="color: #4da6ff;">/api/admin/init-stripe</a></p>
                </div>
            ` : ''}
        </body>
        </html>
    `);
}
