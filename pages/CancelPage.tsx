import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { AlertTriangle, CheckCircle, XCircle, ArrowLeft, Loader2, Gift } from 'lucide-react';
import { bookingConfig } from '../config/booking';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { doc, updateDoc, query, where, getDocs, collection, serverTimestamp } from 'firebase/firestore';

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
    const s = station.toLowerCase();
    if (s.includes('kart')) return 'kart';
    if (s.includes('rig')) return 'rig';
    if (s.includes('motion') || s.includes('flight')) return 'motion';
    return null;
};

// Check if booking is Event/Full Space (2+ hours or special event)
const isEventBooking = (booking: any): boolean => {
    return (parseInt(booking.drivers) || 0) >= 6 || booking.isEvent === true || booking.station?.includes('[PARTY]') || booking.notes?.includes('[PARTY]');
};

// Determine refund eligibility
type RefundType = 'full' | 'credit50' | 'none' | 'venue';
const getRefundType = (hoursUntilBooking: number, isEvent: boolean, paymentMethod: string): RefundType => {
    if (paymentMethod === 'venue') return 'venue';

    if (isEvent) {
        if (hoursUntilBooking > 168) return 'full';
        if (hoursUntilBooking > 0) return 'credit50';
        return 'none';
    } else {
        if (paymentMethod === 'credits') {
            if (hoursUntilBooking >= 48) return 'full';
            return 'none';
        }
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
                    if (data.booking.status === 'Cancelled') setCancelled(true);
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

    const hoursUntilBooking = booking ? getHoursUntilBooking(booking.date, booking.time) : 0;
    const isEvent = booking ? isEventBooking(booking) : false;
    const paymentMethod = booking?.paymentMethod || 'venue';
    const refundType = booking ? getRefundType(hoursUntilBooking, isEvent, paymentMethod) : 'none';

    // ✅ FIX: Precise parsing using regex only (no fallback to global drivers count in multi-equipment mode)
    const calculateRefundCredits = () => {
        if (!booking) return null;

        const s = (booking.station || '').toLowerCase();
        const equipment: CreditRefund = { kart: 0, rig: 0, motion: 0 };

        let duration = 1;
        const durationMatch = s.match(/\((\d+)h\)/);
        if (durationMatch) duration = parseInt(durationMatch[1]);

        // Specific regex for each type (Matches "Karts:1", "1 Kart", "Kart 1", etc.)
        const kartMatch = s.match(/karts?[:\s]*(\d+)|(\d+)\s*karts?/i);
        const rigMatch = s.match(/rigs?[:\s]*(\d+)|(\d+)\s*rigs?/i);
        const motionMatch = s.match(/(?:motion|flight)[:\s]*(\d+)|(\d+)\s*(?:motion|flight)/i);

        if (kartMatch) equipment.kart = parseInt(kartMatch[1] || kartMatch[2]);
        if (rigMatch) equipment.rig = parseInt(rigMatch[1] || rigMatch[2]);
        if (motionMatch) equipment.motion = parseInt(motionMatch[1] || motionMatch[2]);

        // Fallback ONLY if absolutely no counts found but keyword exists
        if (!equipment.kart && !equipment.rig && !equipment.motion) {
            const type = getEquipmentType(s);
            if (type) equipment[type] = parseInt(booking.drivers) || 1;
        }

        return {
            kart: equipment.kart * duration,
            rig: equipment.rig * duration,
            motion: equipment.motion * duration
        };
    };

    const potentialCredits = calculateRefundCredits();
    const daysUntilBooking = Math.ceil(hoursUntilBooking / 24);

    const handleCancel = async () => {
        if (!bookingId) return;
        setCancelling(true);
        try {
            const url = `${bookingConfig.API_URL}?action=cancel&id=${bookingId}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                if ((refundType === 'full' || refundType === 'credit50') && currentUser && potentialCredits) {
                    try {
                        let multiplier = 0;
                        if (paymentMethod === 'credits') {
                            multiplier = refundType === 'full' ? 1.0 : (refundType === 'credit50' ? 0.5 : 0);
                        } else {
                            // Pay $30 -> Get 1 Credit ($15) = 50% Refund (Multiplier 1.0)
                            // Pay $30 -> Get 2 Credits ($30) = 100% Refund (Multiplier 2.0)
                            multiplier = refundType === 'full' ? 2.0 : 1.0;
                        }

                        const refundCredits = {
                            kart: Math.floor(potentialCredits.kart * multiplier),
                            rig: Math.floor(potentialCredits.rig * multiplier),
                            motion: Math.floor(potentialCredits.motion * multiplier)
                        };

                        if (refundCredits.kart > 0) await addCredits('kart', refundCredits.kart);
                        if (refundCredits.rig > 0) await addCredits('rig', refundCredits.rig);
                        if (refundCredits.motion > 0) await addCredits('motion', refundCredits.motion);

                        setCreditsAwarded(refundCredits);

                        const total = refundCredits.kart + refundCredits.rig + refundCredits.motion;
                        if (total > 0) {
                            alert(`✅ SUCCESS: ${total} credits added!\nBreakdown: Karts:${refundCredits.kart}, Rigs:${refundCredits.rig}, Motion:${refundCredits.motion}`);
                        }
                    } catch (creditError: any) {
                        console.error('Failed to add credits:', creditError);
                        alert(`❌ FAILED to add credits: ${creditError.message || 'Please contact support.'}`);
                    }
                }

                // CRM Sync
                try {
                    const partiesRef = collection(db, 'parties');
                    const q_p = query(partiesRef, where('bookingId', '==', bookingId));
                    const partySnapshot = await getDocs(q_p);
                    for (const d of partySnapshot.docs) {
                        await updateDoc(doc(db, 'parties', d.id), { status: 'cancelled', updatedAt: new Date().toISOString() });
                    }

                    const txRef = collection(db, 'transactions_log');
                    const q_t = query(txRef, where('bookingId', '==', bookingId));
                    const txSnapshot = await getDocs(q_t);
                    for (const d of txSnapshot.docs) {
                        await updateDoc(doc(db, 'transactions_log', d.id), { status: 'cancelled', cancelledAt: serverTimestamp() });
                    }
                } catch (crmErr) { console.error('[CRM] Sync failed:', crmErr); }

                setCancelled(true);
            } else { setError(data.error || 'Failed to cancel booking'); }
        } catch (err) { setError('Failed to cancel booking'); }
        finally { setCancelling(false); }
    };

    if (loading) return <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-[#2D9E49]" /></div>;

    if (error && !booking) return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-6 text-center">
            <div><XCircle className="w-16 h-16 text-[#D42428] mx-auto mb-6" /><h1 className="text-3xl font-bold mb-4">Error</h1><p className="text-white/60 mb-8">{error}</p><Link to="/" className="px-6 py-3 bg-[#2D9E49] rounded-full font-bold">Back to Home</Link></div>
        </div>
    );

    if (cancelled) {
        const totalCredits = creditsAwarded ? (creditsAwarded.kart + creditsAwarded.rig + creditsAwarded.motion) : 0;
        return (
            <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-6 text-center">
                <div className="max-w-md"><CheckCircle className="w-16 h-16 text-[#2D9E49] mx-auto mb-6" /><h1 className="text-3xl font-bold mb-4">Booking Cancelled</h1>
                    {totalCredits > 0 && (
                        <div className="bg-[#2D9E49]/10 border border-[#2D9E49]/30 rounded-xl p-4 mb-8">
                            <p className="font-bold text-[#2D9E49] mb-2">Credits Added!</p>
                            <div className="text-sm text-white/70">
                                {creditsAwarded!.kart > 0 && <p>+{creditsAwarded!.kart} Kart</p>}
                                {creditsAwarded!.rig > 0 && <p>+{creditsAwarded!.rig} Rig</p>}
                                {creditsAwarded!.motion > 0 && <p>+{creditsAwarded!.motion} Motion</p>}
                            </div>
                        </div>
                    )}
                    <Link to="/dashboard" className="w-full block py-4 bg-[#D42428] rounded-full font-bold">View Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-6 py-20">
            <div className="max-w-lg w-full text-center">
                <AlertTriangle className="w-16 h-16 text-[#D42428] mx-auto mb-6" />
                <h1 className="text-3xl font-bold mb-8">Cancel Booking?</h1>
                {booking && (
                    <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 mb-6 text-left space-y-4">
                        <div className="flex justify-between text-sm"><span className="text-white/40">Station</span><span>{booking.station}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-white/40">Date/Time</span><span>{booking.date} at {booking.time}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-white/40">Drivers</span><span>{booking.drivers}</span></div>
                    </div>
                )}
                <div className="bg-[#141414] border border-white/10 rounded-xl p-4 mb-8 text-sm">
                    <p className="text-yellow-500 font-bold mb-2">Refund Policy:</p>
                    <p className="text-white/60">
                        {refundType === 'full' && 'Eligible for 100% credit refund.'}
                        {refundType === 'credit50' && `Eligible for 50% credit refund (${Math.ceil(hoursUntilBooking / 24)} days notice).`}
                        {refundType === 'venue' && 'Pay at Venue booking - no charges.'}
                        {refundType === 'none' && 'Non-refundable (under 48h notice).'}
                    </p>
                </div>
                <button onClick={handleCancel} disabled={cancelling} className="w-full py-4 bg-[#D42428] rounded-full font-bold uppercase tracking-widest disabled:opacity-50 mb-4 h-16 flex items-center justify-center">
                    {cancelling ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Yes, Cancel Booking'}
                </button>
                <Link to="/" className="block w-full py-4 border border-white/20 rounded-full font-bold uppercase">No, Go Back</Link>
            </div>
        </div>
    );
};

export default CancelPage;
