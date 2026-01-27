// ============================================================
// MEMBERSHIP CONFIGURATION
// ============================================================
// All 9 membership tiers with pricing and credits from Adam
// Rolling 30-day billing cycle
// ============================================================

export interface MembershipTier {
    id: string;
    name: string;
    level: 'bronze' | 'silver' | 'gold';
    equipmentType: 'kart' | 'rig' | 'motion';
    equipmentName: string;
    price: number;           // Monthly price in dollars
    credits: number;         // Credits per month
    pricePerCredit: number;  // Calculated: price / credits
    regularPrice: number;    // Regular hourly price for this equipment
    savings: number;         // Savings per credit vs regular price
    color: string;           // Display color
    popular?: boolean;       // Highlight as popular
    stripePriceId?: string;  // Stripe Price ID (e.g., price_12345)
}

// Regular prices (non-member)
export const REGULAR_PRICES = {
    kart: 30,
    rig: 40,
    motion: 50
};

// All 9 membership tiers from Adam's email
export const MEMBERSHIP_TIERS: MembershipTier[] = [
    // KART MEMBERSHIPS
    {
        id: 'bronze_kart',
        name: 'Bronze Kart',
        level: 'bronze',
        equipmentType: 'kart',
        equipmentName: 'Racing Karts',
        price: 75,
        credits: 5,
        pricePerCredit: 15,
        regularPrice: 30,
        savings: 15,
        color: '#CD7F32',
        stripePriceId: 'price_placeholder_bronze_kart'
    },
    {
        id: 'silver_kart',
        name: 'Silver Kart',
        level: 'silver',
        equipmentType: 'kart',
        equipmentName: 'Racing Karts',
        price: 150,
        credits: 10,
        pricePerCredit: 15,
        regularPrice: 30,
        savings: 15,
        color: '#C0C0C0',
        popular: true,
        stripePriceId: 'price_placeholder_silver_kart'
    },
    {
        id: 'gold_kart',
        name: 'Gold Kart',
        level: 'gold',
        equipmentType: 'kart',
        equipmentName: 'Racing Karts',
        price: 300,
        credits: 20,
        pricePerCredit: 15,
        regularPrice: 30,
        savings: 15,
        color: '#FFD700',
        stripePriceId: 'price_placeholder_gold_kart'
    },

    // RIG MEMBERSHIPS
    {
        id: 'bronze_rig',
        name: 'Bronze Rig',
        level: 'bronze',
        equipmentType: 'rig',
        equipmentName: 'Full-Size Rigs',
        price: 100,
        credits: 5,
        pricePerCredit: 20,
        regularPrice: 40,
        savings: 20,
        color: '#CD7F32',
        stripePriceId: 'price_placeholder_bronze_rig'
    },
    {
        id: 'silver_rig',
        name: 'Silver Rig',
        level: 'silver',
        equipmentType: 'rig',
        equipmentName: 'Full-Size Rigs',
        price: 200,
        credits: 10,
        pricePerCredit: 20,
        regularPrice: 40,
        savings: 20,
        color: '#C0C0C0',
        popular: true,
        stripePriceId: 'price_placeholder_silver_rig'
    },
    {
        id: 'gold_rig',
        name: 'Gold Rig',
        level: 'gold',
        equipmentType: 'rig',
        equipmentName: 'Full-Size Rigs',
        price: 400,
        credits: 20,
        pricePerCredit: 20,
        regularPrice: 40,
        savings: 20,
        color: '#FFD700',
        stripePriceId: 'price_placeholder_gold_rig'
    },

    // MOTION MEMBERSHIPS
    {
        id: 'bronze_motion',
        name: 'Bronze Motion',
        level: 'bronze',
        equipmentType: 'motion',
        equipmentName: 'Motion Simulator',
        price: 125,
        credits: 5,
        pricePerCredit: 25,
        regularPrice: 50,
        savings: 25,
        color: '#CD7F32',
        stripePriceId: 'price_placeholder_bronze_motion'
    },
    {
        id: 'silver_motion',
        name: 'Silver Motion',
        level: 'silver',
        equipmentType: 'motion',
        equipmentName: 'Motion Simulator',
        price: 250,
        credits: 10,
        pricePerCredit: 25,
        regularPrice: 50,
        savings: 25,
        color: '#C0C0C0',
        popular: true,
        stripePriceId: 'price_placeholder_silver_motion'
    },
    {
        id: 'gold_motion',
        name: 'Gold Motion',
        level: 'gold',
        equipmentType: 'motion',
        equipmentName: 'Motion Simulator',
        price: 500,
        credits: 20,
        pricePerCredit: 25,
        regularPrice: 50,
        savings: 25,
        color: '#FFD700',
        stripePriceId: 'price_placeholder_gold_motion'
    }
];

// Helper functions
export const getMembershipById = (id: string): MembershipTier | undefined => {
    return MEMBERSHIP_TIERS.find(tier => tier.id === id);
};

export const getMembershipsByEquipment = (equipmentType: 'kart' | 'rig' | 'motion'): MembershipTier[] => {
    return MEMBERSHIP_TIERS.filter(tier => tier.equipmentType === equipmentType);
};

export const getEquipmentTypeFromStation = (stationId: string): 'kart' | 'rig' | 'motion' | null => {
    const mapping: { [key: string]: 'kart' | 'rig' | 'motion' } = {
        'karts': 'kart',
        'rigs': 'rig',
        'motion': 'motion'
    };
    return mapping[stationId] || null;
};

// Credits type for user profile
export interface UserCredits {
    kart: number;
    rig: number;
    motion: number;
}

// Membership status for user profile
export interface UserMembership {
    active: boolean;
    tier: string;                    // e.g., 'silver_kart'
    type: 'kart' | 'rig' | 'motion';
    creditsPerCycle: number;
    pricePerMonth: number;
    startDate: Date | null;
    currentCycleStart: Date | null;
    nextBillingDate: Date | null;
    stripeSubscriptionId: string | null;
    stripeCustomerId: string | null;
}

// Map of equipment type to membership details
export interface UserMembershipsMap {
    kart?: UserMembership;
    rig?: UserMembership;
    motion?: UserMembership;
}

// Default empty values
export const DEFAULT_CREDITS: UserCredits = {
    kart: 0,
    rig: 0,
    motion: 0
};

export const DEFAULT_MEMBERSHIPS: UserMembershipsMap = {};
