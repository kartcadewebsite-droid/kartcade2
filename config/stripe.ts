// ============================================================
// STRIPE CONFIGURATION
// ============================================================
// Replace placeholder keys with real keys when available
// Test keys: pk_test_xxx, sk_test_xxx
// Live keys: pk_live_xxx, sk_live_xxx
// ============================================================

export const stripeConfig = {
    // Environment variable is preferred, fall back to placeholder
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_PLACEHOLDER_REPLACE_WITH_REAL_KEY',

    // Note: Secret key should NEVER be in frontend code
    // It will be used in Vercel serverless functions / webhooks only

    // Stripe Price IDs (create these in Stripe Dashboard)
    // These link to the recurring subscription products
    priceIds: {
        // Kart memberships
        bronze_kart: 'price_PLACEHOLDER_bronze_kart',
        silver_kart: 'price_PLACEHOLDER_silver_kart',
        gold_kart: 'price_PLACEHOLDER_gold_kart',

        // Rig memberships
        bronze_rig: 'price_PLACEHOLDER_bronze_rig',
        silver_rig: 'price_PLACEHOLDER_silver_rig',
        gold_rig: 'price_PLACEHOLDER_gold_rig',

        // Motion memberships
        bronze_motion: 'price_PLACEHOLDER_bronze_motion',
        silver_motion: 'price_PLACEHOLDER_silver_motion',
        gold_motion: 'price_PLACEHOLDER_gold_motion',
    },

    // Webhook signing secret (for verifying webhook events)
    webhookSecret: 'whsec_PLACEHOLDER',

    // URLs for checkout flow
    successUrl: '/checkout/success',
    cancelUrl: '/checkout/cancel',
};

// Check if Stripe is configured with real keys
export const isStripeConfigured = (): boolean => {
    // Check environment variable first
    if (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) return true;
    // Fallback to checking the hardcoded string
    return !stripeConfig.publishableKey.includes('PLACEHOLDER');
};

// Get price ID for a membership tier
export const getPriceId = (tierId: string): string | null => {
    const priceId = stripeConfig.priceIds[tierId as keyof typeof stripeConfig.priceIds];
    return priceId && !priceId.includes('PLACEHOLDER') ? priceId : null;
};

export default stripeConfig;
