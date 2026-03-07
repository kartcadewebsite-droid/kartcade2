// Payment Status Calculation Utilities

import { bookingConfig } from '../config/booking';

/**
 * Parses station string to extract equipment details
 * Format: "Racing Karts:3 (2h)" or "Karts:2, Rigs:1 (2h)"
 */
export const parseStationString = (stationStr: string): {
    equipment: { type: string; quantity: number }[],
    duration: number
} => {
    const equipment: Array<{ type: string; quantity: number }> = [];

    // Extract duration - Updated to support decimals like 0.5h
    const durationMatch = String(stationStr).match(/\(([\d.]+)h\)/);
    const duration = durationMatch ? parseFloat(durationMatch[1]) : 1;

    // Remove duration from string - Updated to support decimals
    const equipmentString = String(stationStr).replace(/\([\d.]+h\)/, '').trim();

    // Split by comma for multi-equipment bookings
    const items = equipmentString.split(',');

    items.forEach(item => {
        // Match "Racing Karts:3" or "Karts:2"
        const match = item.trim().match(/(.+):(\d+)/);
        if (match) {
            equipment.push({
                type: match[1].trim(),
                quantity: parseInt(match[2])
            });
        } else {
            // LEGACY FORMAT: No quantity specified (e.g., "Racing Karts")
            // Assume single unit (quantity: 1)
            const trimmed = item.trim();
            if (trimmed) {
                equipment.push({
                    type: trimmed,
                    quantity: 1
                });
            }
        }
    });

    return { equipment, duration };
}

/**
 * Get price per hour for equipment type
 */
export function getEquipmentPrice(equipmentType: string): number {
    const normalizedType = equipmentType.toLowerCase();

    if (normalizedType.includes('kart')) return 30;
    if (normalizedType.includes('rig')) return 40;
    if (normalizedType.includes('motion')) return 50;
    if (normalizedType.includes('flight')) return 40;

    return 30; // Default
}

/**
 * Calculate total cost from station string
 */
export function calculateTotalCost(station: string): number {
    const { equipment, duration } = parseStationString(station);

    let total = 0;
    equipment.forEach(item => {
        const pricePerHour = getEquipmentPrice(item.type);
        total += item.quantity * duration * pricePerHour;
    });

    return total;
}

/**
 * Calculate amount paid based on payment method
 */
export const calculatePaidAmount = (paymentMethod: string, totalCost: number) => {
    const method = String(paymentMethod || 'venue').toLowerCase().trim();

    // Check for deposits first (including paypal_deposit)
    if (method === 'paypal_deposit' || method === 'deposit' || method.indexOf('deposit') !== -1) {
        return Math.round(totalCost * 0.5);
    }

    if (method === 'paypal' ||
        method.indexOf('paypal') !== -1 ||
        method === 'credits' ||
        method.indexOf('credit') !== -1 ||
        method === 'stripe' ||
        method === 'online') {
        return totalCost; // Paid in full
    }

    return 0; // Pay at venue
};

/**
 * Get payment status display information
 */
export function getPaymentStatus(station: string, paymentMethod: string): {
    total: number;
    paid: number;
    remaining: number;
    badge: string;
    color: string;
} {
    const total = calculateTotalCost(station);
    const paid = calculatePaidAmount(paymentMethod, total);
    const remaining = total - paid;

    let badge = '';
    let color = '';

    if (remaining === 0) {
        badge = 'PAID IN FULL';
        color = '#2D9E49'; // Green
    } else if (paid > 0) {
        badge = 'DEPOSIT PAID';
        color = '#F59E0B'; // Yellow/Orange
    } else {
        badge = 'UNPAID';
        color = '#D42428'; // Red
    }

    return { total, paid, remaining, badge, color };
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
    return `$${amount.toFixed(0)}`;
}
