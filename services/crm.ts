import { collection, getDocs, query, where, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Equipment prices (must match booking.ts)
const EQUIPMENT_PRICES: Record<string, number> = {
    karts: 30,
    rigs: 40,
    motion: 50,
    flight: 40
};

// ============================================
// CRM SERVICE
// ============================================
// Aggregates customer data from:
// 1. Firebase `users` collection (profiles, memberships)
// 2. Firebase `transactions_log` collection (permanent booking history)
//
// Spend is CALCULATED from equipment prices, not payment amounts.
// This ensures accuracy regardless of payment method (Stripe/PayPal/Venue).
// ============================================

export interface CustomerAnalytics {
    userId: string;
    name: string;
    email: string;
    photoURL?: string;
    phone?: string;
    totalSpend: number;        // Calculated from equipment prices
    totalHours: number;        // Total booking hours
    visitCount: number;        // Number of bookings (excluding cancelled)
    cancelCount: number;       // Number of cancelled bookings
    lastVisit: string | null;
    favoriteEquipment: string | null;
    membershipTier: string | null;
    membershipActive: boolean;
    registrationDate: any;
    transactions: TransactionRecord[];
}

export interface TransactionRecord {
    id?: string;
    type: 'booking' | 'membership_purchase' | 'membership_renewal';
    amount: number;          // calculatedPrice for bookings, actual for memberships
    date: string;
    time?: string;
    station?: string;
    equipment?: Record<string, number>;
    drivers?: number;
    duration?: number;
    paymentMethod?: string;
    status?: string;         // 'confirmed' | 'cancelled'
    tierId?: string;
    tierName?: string;
    bookingId?: string;
    createdAt?: any;
}

/**
 * Calculate estimated spend from equipment breakdown
 * e.g. { karts: 2, rigs: 1 } with duration 1 = (2*30) + (1*40) = $100
 */
function calculateSpendFromEquipment(equipment: Record<string, number>, duration: number): number {
    let total = 0;
    for (const [type, qty] of Object.entries(equipment)) {
        const price = EQUIPMENT_PRICES[type] || 0;
        total += price * qty * (duration || 1);
    }
    return total;
}

/**
 * Try to parse station string to extract equipment info
 * e.g. "Rigs:2, Karts:1 (1h)" → { rigs: 2, karts: 1 }, duration: 1
 */
function parseStationString(station: string): { equipment: Record<string, number>; duration: number } {
    const equipment: Record<string, number> = {};
    let duration = 1;

    // Extract duration from "(Xh)" pattern
    const durationMatch = station.match(/\(([\d.]+)h\)/);
    if (durationMatch) duration = parseFloat(durationMatch[1]);

    // Extract equipment from "Type:Qty" patterns
    const patterns = station.match(/(\w+):(\d+)/g);
    if (patterns) {
        patterns.forEach(p => {
            const [type, qty] = p.split(':');
            const key = type.toLowerCase();
            if (EQUIPMENT_PRICES[key]) {
                equipment[key] = parseInt(qty);
            }
        });
    }

    return { equipment, duration };
}

export const crmService = {
    /**
     * Fetch all customers with their analytics
     */
    async getAllCustomers(): Promise<CustomerAnalytics[]> {
        try {
            // 1. Fetch all users
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const users = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as any[];

            // 2. Fetch ALL transactions
            const txSnapshot = await getDocs(collection(db, 'transactions_log'));
            const allTransactions = txSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // 3. Build analytics for each user
            const customers: CustomerAnalytics[] = users.map(user => {
                // Find transactions for this user (by userId OR email)
                const userTx = allTransactions.filter((tx: any) =>
                    tx.userId === user.id ||
                    (tx.email && user.email && tx.email.toLowerCase() === user.email.toLowerCase())
                );

                // Separate by type and status
                const allBookings = userTx.filter((tx: any) =>
                    ['booking', 'booking_deposit', 'party_booking'].includes(tx.type)
                );

                // CRITICAL BUSINESS RULE: Only include 'confirmed' or 'completed' status
                // We also allow !tx.status for legacy bookings that haven't been explicitly cancelled
                const confirmedBookings = allBookings.filter((tx: any) => {
                    const status = tx.status?.toLowerCase();
                    return status === 'confirmed' || status === 'completed' || !tx.status;
                });
                const cancelledBookings = allBookings.filter((tx: any) => tx.status?.toLowerCase() === 'cancelled');

                const membershipTx = userTx.filter((tx: any) =>
                    (tx.type === 'membership_purchase' || tx.type === 'membership_renewal') &&
                    (tx.status === 'confirmed' || tx.status === 'completed' || !tx.status) // Memberships usually don't have status yet, assume confirmed if missing
                );

                // Calculate spend from equipment prices or actual amount paid
                let bookingSpend = 0;
                confirmedBookings.forEach((tx: any) => {
                    if (tx.type === 'party_booking' || tx.isPartyBooking) {
                        // For parties, use the pre-calculated total price or the amount paid
                        bookingSpend += tx.totalPrice || tx.amount || 0;
                    } else if (tx.calculatedPrice) {
                        // Use pre-calculated price if available (Standardized Stripe Flow)
                        bookingSpend += tx.calculatedPrice;
                    } else if (tx.equipment) {
                        // Calculate from equipment breakdown
                        bookingSpend += calculateSpendFromEquipment(tx.equipment, tx.duration || 1);
                    } else if (tx.station) {
                        // Fallback: parse station string (for synced Sheet data)
                        const parsed = parseStationString(tx.station);
                        bookingSpend += calculateSpendFromEquipment(parsed.equipment, parsed.duration);
                    }
                });

                // Add membership spend (actual amounts from Stripe)
                const membershipSpend = membershipTx.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);
                const totalSpend = bookingSpend + membershipSpend;

                // Total hours
                const totalHours = confirmedBookings.reduce((sum: number, tx: any) => sum + (tx.duration || 1), 0);

                // Last visit
                const sortedBookings = confirmedBookings
                    .filter((tx: any) => tx.date)
                    .sort((a: any, b: any) => (b.date || '').localeCompare(a.date || ''));
                const lastVisit = sortedBookings.length > 0 ? (sortedBookings[0] as any).date : null;

                // Favorite equipment
                const favoriteEquipment = this.calculateFavoriteEquipment(confirmedBookings);

                // Membership info
                const activeMembership = ['kart', 'rig', 'motion']
                    .map(type => user.memberships?.[type])
                    .find((m: any) => m?.active);

                // Map transactions
                const transactions: TransactionRecord[] = userTx.map((tx: any) => ({
                    id: tx.id,
                    type: tx.type,
                    amount: tx.calculatedPrice || tx.amount || 0,
                    date: tx.date || '',
                    time: tx.time,
                    station: tx.station,
                    equipment: tx.equipment,
                    drivers: tx.drivers,
                    duration: tx.duration,
                    paymentMethod: tx.paymentMethod,
                    status: tx.status,
                    tierId: tx.tierId,
                    tierName: tx.tierName,
                    bookingId: tx.bookingId,
                    createdAt: tx.createdAt
                }));

                return {
                    userId: user.id,
                    name: user.name || user.displayName || 'Unnamed Driver',
                    email: user.email || '',
                    photoURL: user.photoURL,
                    phone: user.phone,
                    totalSpend,
                    totalHours,
                    visitCount: confirmedBookings.length,
                    cancelCount: cancelledBookings.length,
                    lastVisit,
                    favoriteEquipment,
                    membershipTier: activeMembership ? activeMembership.tier : null,
                    membershipActive: !!activeMembership,
                    registrationDate: user.createdAt,
                    transactions
                };
            });

            // Sort by total spend (highest first)
            customers.sort((a, b) => b.totalSpend - a.totalSpend);
            return customers;
        } catch (error) {
            console.error('CRM: Error fetching customers:', error);
            throw error;
        }
    },

    /**
     * Determine which equipment a user books most often
     */
    calculateFavoriteEquipment(bookings: any[]): string | null {
        if (bookings.length === 0) return null;

        const counts: Record<string, number> = {};
        bookings.forEach((tx: any) => {
            // Use equipment breakdown if available
            if (tx.equipment && typeof tx.equipment === 'object') {
                for (const [type, qty] of Object.entries(tx.equipment)) {
                    counts[type] = (counts[type] || 0) + (qty as number);
                }
            } else if (tx.station) {
                // Fallback: parse station string
                const parsed = parseStationString(tx.station);
                for (const [type, qty] of Object.entries(parsed.equipment)) {
                    counts[type] = (counts[type] || 0) + qty;
                }
            }
        });

        if (Object.keys(counts).length === 0) return null;
        return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    },

    /**
     * Mark a transaction as cancelled
     */
    async cancelTransaction(transactionId: string): Promise<void> {
        const txRef = doc(db, 'transactions_log', transactionId);
        await updateDoc(txRef, { status: 'cancelled' });
    },

    /**
     * Delete a transaction record permanently
     */
    async deleteTransaction(transactionId: string): Promise<void> {
        const txRef = doc(db, 'transactions_log', transactionId);
        await deleteDoc(txRef);
    }
};
