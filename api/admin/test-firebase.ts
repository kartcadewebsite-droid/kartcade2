
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

export default async function handler(req: any, res: any) {
    const results: any = {
        timestamp: new Date().toISOString(),
        steps: [],
        error: null
    };

    try {
        // Step 1: Check environment variables
        results.steps.push({
            step: 'Check Environment',
            status: '✅',
            details: {
                FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? 'Set' : 'MISSING',
                FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? 'Set' : 'MISSING',
                FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? `Set (${process.env.FIREBASE_PRIVATE_KEY.substring(0, 20)}...)` : 'MISSING',
            }
        });

        // Step 2: Try to initialize Firebase
        results.steps.push({ step: 'Initialize Firebase', status: 'Starting...' });

        const privateKey = process.env.FIREBASE_PRIVATE_KEY;

        // Log the key format for debugging
        results.steps.push({
            step: 'Private Key Format Check',
            status: '✅',
            details: {
                startsWithBegin: privateKey?.startsWith('-----BEGIN'),
                containsNewlines: privateKey?.includes('\n'),
                containsBackslashN: privateKey?.includes('\\n'),
                length: privateKey?.length
            }
        });

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    // Handle both formats: actual newlines and literal \n
                    privateKey: privateKey?.replace(/\\n/g, '\n'),
                }),
            });
        }
        results.steps[1].status = '✅ Firebase initialized';

        // Step 3: Try to access Firestore
        results.steps.push({ step: 'Access Firestore', status: 'Starting...' });
        const db = getFirestore();
        results.steps[results.steps.length - 1].status = '✅ Firestore connected';

        // Step 4: Try to write a test document
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
            stack: err.stack
        };
        results.success = false;
    }

    res.setHeader('Content-Type', 'text/html');
    res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Firebase Connection Test</title></head>
        <body style="font-family: system-ui; background: #111; color: white; padding: 40px;">
            <h1>${results.success ? '✅' : '❌'} Firebase Connection Test</h1>
            <p>Timestamp: ${results.timestamp}</p>
            
            <h2>Steps:</h2>
            <ul>
                ${results.steps.map((s: any) => `
                    <li>
                        <strong>${s.step}</strong>: ${s.status}
                        ${s.details ? `<pre style="background:#222;padding:10px;border-radius:5px;font-size:12px;">${JSON.stringify(s.details, null, 2)}</pre>` : ''}
                    </li>
                `).join('')}
            </ul>
            
            ${results.error ? `
                <h2 style="color: #ff6b6b;">Error Details:</h2>
                <pre style="background: #222; padding: 20px; border-radius: 8px; overflow: auto; color: #ff6b6b;">
Message: ${results.error.message}
Code: ${results.error.code || 'N/A'}

Stack:
${results.error.stack}
                </pre>
            ` : ''}
        </body>
        </html>
    `);
}
