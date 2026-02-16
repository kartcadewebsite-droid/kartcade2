
import { Stripe } from 'stripe';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { MEMBERSHIP_TIERS } from '../config/membership';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia' as any,
});

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzlJM7zscm9Txy-5Q2MLqoqDtzbab6a0L-CtUWIRUWrN0Bo8b-GGK51iuDa6hQOBpV5UA/exec';

/**
 * Lazy-initialize Firebase Admin and return Firestore
 */
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
        } else {
            console.error('[API] FIREBASE_PROJECT_ID is missing');
        }
    }
    return getFirestore();
}

export default async function handler(req: any, res: any) {
    // Initialize DB inside the handler to prevent top-level crashes
    let db;
    try {
        db = getDb();
    } catch (dbErr: any) {
        console.error('[API] Database init failed:', dbErr);
        return res.status(500).json({ error: 'Internal database error' });
    }

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

            // Extract metadata with fallbacks
            const drivers = metadata.bookingDrivers || '1';
            const duration = metadata.bookingDuration || '1';
            const stationName = metadata.bookingStation || '';

            // ✅ ROBUST STATION FORMATTING
            // If station already has format "Station:2 (1h)", use as-is
            // Otherwise, rebuild it from components
            const stationFormatted = stationName.includes(':') && stationName.includes('(')
                ? stationName
                : `${stationName}:${drivers} (${duration}h)`;

            console.log('[VERIFY] Station formatting:', {
                original: stationName,
                formatted: stationFormatted,
                drivers: drivers,
                duration: duration
            });

            // 1. Construct parameters for Apps Script
            const params = new URLSearchParams({
                action: 'book',
                date: metadata.bookingDate || '',
                time: metadata.bookingTime || '',
                station: stationFormatted,
                drivers: drivers.toString(),
                name: metadata.bookingName || 'Guest',
                email: metadata.bookingEmail || (session.customer_details?.email || ''),
                phone: metadata.bookingPhone || '',
                paymentMethod: 'deposit',
                notes: (metadata.bookingNotes || '') + ` [Stripe Verified: ${session.payment_intent}]`
            });

            // 2. Call Google Apps Script
            const url = `${GOOGLE_APPS_SCRIPT_URL}?${params.toString()}`;
            console.log('[VERIFY] Calling Google Apps Script:', url);

            try {
                const response = await fetch(url, { method: 'GET' });
                const data = await response.json();

                console.log('[VERIFY] Google Apps Script response:', JSON.stringify(data, null, 2));

                if (!data.success) {
                    console.error('[VERIFY] Apps Script returned failure:', data);
                    return res.status(500).json({
                        success: false,
                        error: 'Booking creation failed',
                        details: data.error || 'Unknown error from Apps Script',
                        session_id
                    });
                }

                // Return success with booking details
                return res.json({
                    success: true,
                    type: 'booking',
                    bookingId: data.bookingId,
                    details: {
                        station: stationFormatted,
                        date: metadata.bookingDate,
                        time: metadata.bookingTime,
                        amount: session.amount_total
                    }
                });
            } catch (gasErr: any) {
                console.error('[VERIFY] Google Apps Script fetch failed:', gasErr);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to connect to booking system',
                    details: gasErr.message,
                    session_id
                });
            }

        } else if (type === 'membership_purchase') {
            // ============================================
            // MEMBERSHIP SAFETY NET (Mirror of booking safety net)
            // If webhook failed, this activates the membership directly
            // ============================================
            const userId = metadata.userId;
            const tierId = metadata.tierId;

            if (userId && tierId) {
                const tier = MEMBERSHIP_TIERS.find(t => t.id === tierId);

                if (tier) {
                    const userRef = db.collection('users').doc(userId);
                    const userDoc = await userRef.get();

                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        const equipmentType = tier.equipmentType;
                        const existingMembership = userData?.memberships?.[equipmentType];

                        // CHECK: Is membership already active? (webhook worked)
                        if (existingMembership?.active) {
                            console.log(`[VERIFY] Membership already active for ${userId} (${tierId}) - webhook worked fine`);
                            return res.json({
                                success: true,
                                type: 'membership',
                                tierId: tierId,
                                safetyNet: false
                            });
                        }

                        // SAFETY NET: Webhook failed! Activate membership now.
                        console.log(`[VERIFY SAFETY NET] Activating membership for ${userId} (${tierId}) - webhook missed this!`);

                        // IDEMPOTENCY: Check if this session was already processed
                        const sessionProcessed = await db.collection('processed_stripe_events').doc(`verify_${session_id}`).get();
                        if (sessionProcessed.exists) {
                            console.log(`[VERIFY] Session ${session_id} already processed by safety net, skipping`);
                            return res.json({
                                success: true,
                                type: 'membership',
                                tierId: tierId,
                                safetyNet: false
                            });
                        }

                        try {
                            // 1. Get subscription details from Stripe
                            const subscriptionId = session.subscription as string;
                            let currentPeriodEnd = new Date();
                            currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30); // Fallback: 30 days

                            if (subscriptionId) {
                                try {
                                    const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
                                    currentPeriodEnd = new Date(subscription.current_period_end * 1000);
                                } catch (subErr) {
                                    console.error('[VERIFY] Could not fetch subscription, using 30-day fallback:', subErr);
                                }
                            }

                            // 2. Activate membership in Firebase
                            await userRef.set({
                                [`memberships`]: {
                                    ...userData?.memberships,
                                    [equipmentType]: {
                                        active: true,
                                        tier: tierId,
                                        type: equipmentType,
                                        stripeSubscriptionId: subscriptionId || '',
                                        nextBillingDate: admin.firestore.Timestamp.fromDate(currentPeriodEnd),
                                        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                                        activatedBy: 'safety_net'
                                    }
                                }
                            }, { merge: true });

                            // 3. Add credits
                            const currentCredits = userData?.credits?.[equipmentType] || 0;
                            await userRef.set({
                                credits: {
                                    ...userData?.credits,
                                    [equipmentType]: currentCredits + tier.credits
                                }
                            }, { merge: true });

                            // 4. Mark as processed (idempotency)
                            await db.collection('processed_stripe_events').doc(`verify_${session_id}`).set({
                                eventType: 'safety_net_activation',
                                userId,
                                tierId,
                                processedAt: admin.firestore.FieldValue.serverTimestamp()
                            });

                            console.log(`[VERIFY SAFETY NET] SUCCESS: Activated ${tierId} for ${userId}, added ${tier.credits} ${equipmentType} credits`);

                            return res.json({
                                success: true,
                                type: 'membership',
                                tierId: tierId,
                                safetyNet: true,
                                creditsAdded: tier.credits
                            });

                        } catch (activationErr: any) {
                            console.error('[VERIFY SAFETY NET] Failed to activate membership:', activationErr);
                            // Still return success for the payment, but flag the issue
                            return res.json({
                                success: true,
                                type: 'membership',
                                tierId: tierId,
                                safetyNet: false,
                                activationError: activationErr.message
                            });
                        }
                    } else {
                        console.error(`[VERIFY] User document not found for ${userId}`);
                    }
                }
            }

            // Fallback: return basic success (no safety net possible)
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
