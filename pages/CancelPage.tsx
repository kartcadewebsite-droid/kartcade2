import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { AlertTriangle, CheckCircle, XCircle, ArrowLeft, Loader2, Gift } from 'lucide-react';
import { bookingConfig } from '../config/booking';
import { useAuth } from '../contexts/AuthContext';

// Credit value per type (from Adam's pricing)
const CREDIT_VALUES = {
    kart: 15,    // $75 / 5 credits
    rig: 20,     // $100 / 5 credits
    motion: 25   // $125 / 5 credits
};

// Hourly rates for calculating refund (for Cash/Card users)
const HOURLY_RATES = {
    'Racing Karts': 30,
    'Full-Size Rigs': 40,
    'Motion Simulator': 50,
    'Flight Simulator': 50
};

// Precise hour calculation
const getHoursUntilBooking = (bookingDate: string, bookingTime: string): number => {
    const [hours, minutes] = (bookingTime || "00:00").split(':').map(Number);
    const booking = new Date(bookingDate);
    booking.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const diffMs = booking.getTime() - now.getTime();
    return diffMs / (1000 * 60 * 60);
};

// Map station name to credit type
const getEquipmentType = (station: string): 'kart' | 'rig' | 'motion' | null => {
    if (station.includes('Kart')) return 'kart';
    if (station.includes('Rig')) return 'rig';
    if (station.includes('Motion') || station.includes('Flight')) return 'motion';
    return null;
};

// Check if booking is Event/Full Space (2+ hours or special event)
const isEventBooking = (booking: any): boolean => {
    // For now, check if drivers >= 6 (full space typically involves more people)
    // Or if the booking has an "event" flag
    return booking.drivers >= 6 || booking.isEvent === true;
};

// Calculate days until booking
const getDaysUntilBooking = (bookingDate: string): number => {
    const booking = new Date(bookingDate);
    const now = new Date();
    const diffTime = booking.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

// Determine refund eligibility
type RefundType = 'full' | 'credit50' | 'none' | 'venue';
const getRefundType = (hoursUntilBooking: number, isEvent: boolean, paymentMethod: string): RefundType => {
    // Pay at venue = no payment made, just cancel
    if (paymentMethod === 'venue') {
        return 'venue';
    }

    if (isEvent) {
        // Events: > 7 days (168h) = full, 0-7 days = 50% credit
        if (hoursUntilBooking > 168) return 'full';
        if (hoursUntilBooking > 0) return 'credit50';
        return 'none';
    } else {
        // Standard bookings
        // If pay with Credits: > 48h = Full Refund, < 48h = No refund
        if (paymentMethod === 'credits') {
            if (hoursUntilBooking >= 48) return 'full';
            return 'none';
        }

        // If pay with Cash/Card: > 7 days = Full, 48h-7d = 50% Credit
        if (hoursUntilBooking > 168) return 'full';
        if (hoursUntilBooking >= 48) return 'credit50';
        return 'none';
    }
};

interface CreditRefund {
    kart: number;
    rig: number;
    motion: number;
}

// Calculate credits to refund
const calculateCreditRefund = (booking: any, refundType: RefundType): CreditRefund => {
    const station = booking.station || '';
    const drivers = parseInt(booking.drivers) || 1;
    const hours = parseInt(booking.hours) || 1;
    const paymentMethod = booking.paymentMethod;

    // ✅ FIX Bug #2: If paid with credits, refund is 1:1 based on drivers, not division math
    if (paymentMethod === 'credits') {
        const equipmentType = getEquipmentType(station);
        if (!equipmentType) return { kart: 0, rig: 0, motion: 0 };

        // Full = 100%, Credit50 = 50%
        const multiplier = refundType === 'full' ? 1.0 : 0.5;
        const refundQty = Math.floor(drivers * multiplier);

        return {
            kart: equipmentType === 'kart' ? refundQty : 0,
            rig: equipmentType === 'rig' ? refundQty : 0,
            motion: equipmentType === 'motion' ? refundQty : 0
        };
    }

    // Standard cash/deposit calculation (conversion to credits)
    const hourlyRate = HOURLY_RATES[station as keyof typeof HOURLY_RATES] || 35;
    const totalValue = hourlyRate * hours * drivers;
    const multiplier = refundType === 'full' ? 1.0 : 0.5;
    const refundValue = totalValue * multiplier;
    const equipmentType = getEquipmentType(station);

    if (drivers >= 6 || station.includes('Full Space')) {
        const creditsPerType = Math.floor(refundValue / 3 / CREDIT_VALUES.rig);
        return { kart: creditsPerType, rig: creditsPerType, motion: creditsPerType };
    }

    if (equipmentType) {
        const credits = Math.floor(refundValue / CREDIT_VALUES[equipmentType]);
        return {
            kart: equipmentType === 'kart' ? credits : 0,
            rig: equipmentType === 'rig' ? credits : 0,
            motion: equipmentType === 'motion' ? credits : 0
        };
    }

    return { kart: 0, rig: 0, motion: 0 };
};

const CancelPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const bookingId = searchParams.get('id');
    const { currentUser, userProfile, addCredits } = useAuth();
    const location = useLocation();

    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState(false);
    const [cancelled, setCancelled] = useState(false);
    const [creditsAwarded, setCreditsAwarded] = useState<CreditRefund | null>(null);

    // Fetch booking details
    useEffect(() => {
        if (!bookingId) {
            setError('No booking ID provided');
            setLoading(false);
            return;
        }

        const fetchBooking = async () => {
            try {
                const url = `${bookingConfig.API_URL}?action=getBooking&id=${bookingId}`;
                const response = await fetch(url);
                const data = await response.json();

                if (data.success && data.booking) {
                    setBooking(data.booking);
                    if (data.booking.status === 'Cancelled') {
                        setCancelled(true);
                    }
                } else {
                    setError(data.error || 'Booking not found');
                }
            } catch (err) {
                setError('Failed to fetch booking details');
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [bookingId]);

    // Calculate refund info for display
    const hoursUntilBooking = booking ? getHoursUntilBooking(booking.date, booking.time) : 0;
    const isEvent = booking ? isEventBooking(booking) : false;
    const paymentMethod = booking?.paymentMethod || 'venue';
    const refundType = booking ? getRefundType(hoursUntilBooking, isEvent, paymentMethod) : 'none';

    // ✅ NEW: Use actual driver count (which equals credits spent)
    const calculateRefundCredits = () => {
        if (!booking || paymentMethod !== 'credits') return null;

        // Parse station string to get equipment types, driver counts, and duration
        const stationStr = booking.station || '';
        const driversPerSlot = parseInt(booking.drivers) || 0;

        // Extract duration from station string like "Racing Karts (2h)"
        let durationHours = 1;
        const durationMatch = stationStr.match(/\((\d+)h\)/);
        if (durationMatch && durationMatch[1]) {
            durationHours = parseInt(durationMatch[1]);
        }

        // Total credits spent is drivers * duration
        const totalCreditsSpent = driversPerSlot * durationHours;

        // Determine equipment type from station string
        let equipmentType: 'kart' | 'rig' | 'motion' | null = null;
        const stationLower = stationStr.toLowerCase();

        if (stationLower.includes('kart')) equipmentType = 'kart';
        else if (stationLower.includes('rig')) equipmentType = 'rig';
        else if (stationLower.includes('motion')) equipmentType = 'motion';

        if (!equipmentType) return null;

        // ✅ FIXED: Return total credits spent (drivers * duration)
        // NOT calculated from division math
        return {
            kart: equipmentType === 'kart' ? totalCreditsSpent : 0,
            rig: equipmentType === 'rig' ? totalCreditsSpent : 0,
            motion: equipmentType === 'motion' ? totalCreditsSpent : 0
        };
    };

    const potentialCredits = calculateRefundCredits();

    const daysUntilBooking = Math.ceil(hoursUntilBooking / 24);

    // DEBUG LOGS
    useEffect(() => {
        if (booking) {
            console.log("🔍 BOOKING DEBUG:", {
                id: booking.id,
                paymentMethod: booking.paymentMethod,
                resolvedPayment: paymentMethod,
                days: daysUntilBooking,
                refundType: refundType
            });
        }
    }, [booking]);

    // Handle cancellation
    const handleCancel = async () => {
        if (!bookingId) return;

        setCancelling(true);
        try {
            const url = `${bookingConfig.API_URL}?action=cancel&id=${bookingId}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                // ✅ FIX Bug #1: Trigger for BOTH 'full' and 'credit50'
                if ((refundType === 'full' || refundType === 'credit50') && currentUser && potentialCredits) {
                    try {
                        // Determine refund amount based on type
                        const refundMultiplier = refundType === 'full' ? 1 : 0.5;

                        // ✅ FIXED: Use actual drivers count (potentialCredits), not recalculated value
                        const refundCredits = {
                            kart: Math.floor(potentialCredits.kart * refundMultiplier),
                            rig: Math.floor(potentialCredits.rig * refundMultiplier),
                            motion: Math.floor(potentialCredits.motion * refundMultiplier)
                        };

                        // Add credits for each type
                        if (refundCredits.kart > 0) {
                            await addCredits('kart', refundCredits.kart);
                        }
                        if (refundCredits.rig > 0) {
                            await addCredits('rig', refundCredits.rig);
                        }
                        if (refundCredits.motion > 0) {
                            await addCredits('motion', refundCredits.motion);
                        }

                        setCreditsAwarded(refundCredits);
                    } catch (creditError) {
                        console.error('Failed to add credits:', creditError);
                        // Still mark as cancelled even if credits fail
                    }
                }
                setCancelled(true);
            } else {
                setError(data.error || 'Failed to cancel booking');
            }
        } catch (err) {
            setError('Failed to cancel booking');
        } finally {
            setCancelling(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-[#2D9E49] mx-auto mb-4" />
                    <p className="text-white/60">Loading booking details...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !booking) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-6">
                <div className="text-center max-w-md">
                    <XCircle className="w-16 h-16 text-[#D42428] mx-auto mb-6" />
                    <h1 className="text-3xl font-bold mb-4">Booking Not Found</h1>
                    <p className="text-white/60 mb-8">{error}</p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#2D9E49] text-white rounded-full font-bold"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    // Cancelled state
    if (cancelled) {
        const totalCredits = creditsAwarded ?
            creditsAwarded.kart + creditsAwarded.rig + creditsAwarded.motion : 0;

        return (
            <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-6">
                <div className="text-center max-w-md">
                    <CheckCircle className="w-16 h-16 text-[#2D9E49] mx-auto mb-6" />
                    <h1 className="text-3xl font-bold mb-4">Booking Cancelled</h1>
                    <p className="text-white/60 mb-2">Your booking has been successfully cancelled.</p>
                    <p className="text-white/40 text-sm mb-4">A confirmation email has been sent to {booking?.email}</p>

                    {/* Credits Awarded Message */}
                    {totalCredits > 0 && (
                        <div className="bg-[#2D9E49]/10 border border-[#2D9E49]/30 rounded-xl p-4 mb-8">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Gift className="w-5 h-5 text-[#2D9E49]" />
                                <span className="font-bold text-[#2D9E49]">Credits Added to Your Account!</span>
                            </div>
                            <div className="text-sm text-white/70 space-y-1">
                                {creditsAwarded!.kart > 0 && (
                                    <p>+{creditsAwarded!.kart} Kart Credits</p>
                                )}
                                {creditsAwarded!.rig > 0 && (
                                    <p>+{creditsAwarded!.rig} Rig Credits</p>
                                )}
                                {creditsAwarded!.motion > 0 && (
                                    <p>+{creditsAwarded!.motion} Motion Credits</p>
                                )}
                            </div>
                            <p className="text-xs text-white/40 mt-2">Use these credits on your next booking!</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-4">
                        <Link
                            to="/book"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#D42428] text-white rounded-full font-bold"
                        >
                            Book Again
                        </Link>
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/20 text-white rounded-full"
                        >
                            View Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Confirmation state
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-6 py-20">
            <div className="max-w-lg w-full">
                <div className="text-center mb-8">
                    <AlertTriangle className="w-16 h-16 text-[#D42428] mx-auto mb-6" />
                    <h1 className="text-3xl font-bold mb-2">Cancel Booking?</h1>
                    <p className="text-white/60">Are you sure you want to cancel this booking?</p>
                </div>

                {/* Booking Details Card */}
                <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 mb-6">
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-white/40">Booking ID</span>
                            <span className="font-mono font-bold">{booking.id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/40">Name</span>
                            <span>{booking.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/40">Station</span>
                            <span>{booking.station}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/40">Date</span>
                            <span>{booking.date}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/40">Time</span>
                            <span>{booking.time}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/40">Drivers</span>
                            <span>{booking.drivers}</span>
                        </div>
                    </div>
                </div>

                {/* Refund Info */}
                <div className={`rounded-xl p-4 mb-6 ${refundType === 'full' ? 'bg-[#2D9E49]/10 border border-[#2D9E49]/30' :
                    refundType === 'credit50' ? 'bg-yellow-500/10 border border-yellow-500/30' :
                        refundType === 'venue' ? 'bg-blue-500/10 border border-blue-500/30' :
                            'bg-[#D42428]/10 border border-[#D42428]/30'
                    }`}>
                    <h3 className={`font-bold mb-2 ${refundType === 'full' ? 'text-[#2D9E49]' :
                        refundType === 'credit50' ? 'text-yellow-500' :
                            refundType === 'venue' ? 'text-blue-400' :
                                'text-[#D42428]'
                        }`}>
                        {refundType === 'full' && '✓ Full Refund Available'}
                        {refundType === 'credit50' && '⚡ 50% Credit Refund'}
                        {refundType === 'venue' && 'ℹ️ Pay at Venue Booking'}
                        {refundType === 'none' && '✕ No Refund Available'}
                    </h3>
                    <p className="text-sm text-white/70">
                        {refundType === 'full' && 'Cancelling more than 7 days in advance. You\'ll receive a full refund.'}
                        {refundType === 'credit50' && (
                            <>
                                Cancelling {daysUntilBooking} days before your booking.
                                {potentialCredits && currentUser && (
                                    <span className="block mt-1">
                                        You'll receive:
                                        {potentialCredits.kart > 0 && ` ${potentialCredits.kart} Kart`}
                                        {potentialCredits.rig > 0 && ` ${potentialCredits.rig} Rig`}
                                        {potentialCredits.motion > 0 && ` ${potentialCredits.motion} Motion`}
                                        {' '}credits
                                    </span>
                                )}
                                {!currentUser && (
                                    <span className="block mt-1 text-yellow-500">
                                        Log in to receive credits automatically!
                                    </span>
                                )}
                            </>
                        )}
                        {refundType === 'venue' && 'No payment was made for this booking. You can cancel without any charges.'}
                        {refundType === 'none' && 'Cancellations within 48 hours are non-refundable.'}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-4">
                    {/* Show Login button if refund eligible but NOT logged in */}
                    {refundType === 'credit50' && !currentUser ? (
                        <Link
                            to="/login"
                            state={{ from: location }}
                            className="w-full py-4 bg-yellow-500 text-black rounded-full font-bold uppercase tracking-widest hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
                        >
                            Log In to Claim Refund
                        </Link>
                    ) : (
                        <button
                            onClick={handleCancel}
                            disabled={cancelling}
                            className="w-full py-4 bg-[#D42428] text-white rounded-full font-bold uppercase tracking-widest hover:bg-[#B91C1C] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {cancelling ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Cancelling...
                                </>
                            ) : (
                                'Yes, Cancel Booking'
                            )}
                        </button>
                    )}
                    <Link
                        to="/"
                        className="w-full py-4 border border-white/20 text-white rounded-full font-bold uppercase tracking-widest hover:bg-white/5 transition-colors text-center"
                    >
                        No, Keep My Booking
                    </Link>
                </div>

                {error && (
                    <p className="text-[#D42428] text-center mt-4">{error}</p>
                )}
            </div>
        </div>
    );
};

export default CancelPage;
