import { adminService } from './services/adminService';
import { MEMBERSHIP_TIERS } from '../config/membership';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
        return;
    }

    // SECURITY: Block in production unless testing secret is provided
    const testingSecret = process.env.TESTING_SECRET;
    const providedSecret = req.headers['x-testing-secret'] || req.body?.testingSecret;

    if (process.env.NODE_ENV === 'production' && (!testingSecret || providedSecret !== testingSecret)) {
        console.warn('[TEST-MEMBERSHIP] Blocked unauthorized access in production');
        return res.status(403).json({ error: 'Test endpoint is disabled in production' });
    }

    try {
        const { userId, tierId } = req.body;

        if (!userId || !tierId) {
            return res.status(400).json({ error: 'Missing userId or tierId' });
        }

        console.log(`🧪 TEST MODE: Simulating membership purchase for ${userId} tier ${tierId}`);

        const tier = MEMBERSHIP_TIERS.find(t => t.id === tierId);
        if (!tier) {
            return res.status(400).json({ error: 'Invalid tierId' });
        }

        // 1. Update Membership (Simulate Stripe Subscription)
        const fakeSubId = 'sub_test_' + Math.random().toString(36).substr(2, 9);
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        await adminService.updateMembership(
            userId,
            tierId,
            tier.equipmentType,
            fakeSubId,
            nextMonth
        );

        // 2. Add Credits (Simulate Webhook Logic)
        if (tier.equipmentType) {
            await adminService.addCredits(userId, tier.equipmentType, tier.credits);
        }

        res.status(200).json({
            success: true,
            message: `Membership ${tier.name} activated for user ${userId}`,
            creditsAdded: tier.credits
        });

    } catch (err: any) {
        console.error('Test Membership Error:', err);
        res.status(500).json({ error: err.message });
    }
}
