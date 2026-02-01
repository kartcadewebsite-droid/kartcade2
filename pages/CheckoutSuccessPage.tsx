import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Zap, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import confetti from 'canvas-confetti';

type SuccessData = {
    type: 'booking' | 'membership' | 'unknown';
    booking?: any;
    details?: any;
};

const CheckoutSuccessPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const { userProfile, refreshUserProfile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [successData, setSuccessData] = useState<SuccessData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        const verifySession = async () => {
            if (!sessionId) {
                setLoading(false);
                return;
            }

            try {
                // Call our verification API
                const response = await fetch(`/api/verify-checkout-session?session_id=${sessionId}`);
                const data = await response.json();

                if (data.success) {
                    setSuccessData(data);

                    // Refresh profile if membership
                    if (data.type === 'membership') {
                        await refreshUserProfile();
                    }

                    // Celebration confetti!
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#2D9E49', '#D42428', '#FFD700'],
                    });
                } else {
                    setError('Payment verification failed. Please contact support.');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to verify payment details.');
            } finally {
                setLoading(false);
            }
        };

        verifySession();
    }, [sessionId, refreshUserProfile]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#2D9E49] animate-spin mx-auto mb-4" />
                    <p className="text-white/50">Verifying your payment...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] pt-32 pb-12">
                <div className="container mx-auto px-4 text-center">
                    <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                        <Zap className="w-12 h-12 text-red-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">Something went wrong</h1>
                    <p className="text-white/60 mb-8">{error}</p>
                    <Link to="/contact" className="text-[#2D9E49] hover:underline">Contact Support</Link>
                </div>
            </div>
        );
    }

    // Determine content based on purchase type
    const isBooking = successData?.type === 'booking';
    const isMembership = successData?.type === 'membership';

    // Find active membership from the map (if any)
    const membership = userProfile?.memberships && Object.values(userProfile.memberships).find(m => m.active);

    return (
        <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-12">
            <div className="container mx-auto px-4 md:px-6 lg:px-12 max-w-xl text-center">
                {/* Success Icon */}
                <div className="w-24 h-24 bg-[#2D9E49] rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle className="w-12 h-12 text-white" />
                </div>

                {/* Header */}
                <h1 className="font-display text-4xl md:text-5xl font-bold uppercase text-white mb-4">
                    {isBooking ? 'Booking Confirmed!' : 'Welcome to the '} <span className="text-[#2D9E49]">{isBooking ? '' : 'Club!'}</span>
                </h1>

                <p className="text-white/60 text-lg mb-8">
                    {isBooking
                        ? 'Your spot is secured. Get ready to race!'
                        : 'Your membership is now active. Time to hit the track!'}
                </p>

                {/* Booking Details Card */}
                {isBooking && successData?.details && (
                    <div className="bg-[#141414] rounded-2xl p-8 border border-white/10 mb-8 text-left">
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-white/50">Station</span>
                                <span className="font-medium text-white">{successData.details.station}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/50">Date</span>
                                <span className="font-medium text-white">{successData.details.date}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/50">Time</span>
                                <span className="font-medium text-white">{successData.details.time}</span>
                            </div>
                            <div className="flex justify-between border-t border-white/10 pt-4">
                                <span className="text-white/50">Deposit Paid</span>
                                <span className="font-bold text-[#2D9E49] text-xl">${(successData.details.amount / 100).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Membership Details Card */}
                {isMembership && membership?.active && (
                    <div className="bg-[#141414] rounded-2xl p-6 border border-[#2D9E49]/30 mb-8">
                        <div className="flex items-center justify-center gap-2 text-[#2D9E49] mb-4">
                            <Zap className="w-5 h-5" />
                            <span className="font-display uppercase font-bold">Membership Active</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-black/30 rounded-xl p-4">
                                <div className="text-white/60 mb-1">Your Plan</div>
                                <div className="text-white font-bold capitalize">
                                    {membership.tier?.replace('_', ' ')}
                                </div>
                            </div>
                            <div className="bg-black/30 rounded-xl p-4">
                                <div className="text-white/60 mb-1">Credits Added</div>
                                <div className="text-[#2D9E49] font-bold">
                                    {membership.creditsPerCycle} hours
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/book"
                        className="inline-flex items-center justify-center gap-2 bg-[#D42428] text-white px-8 py-4 rounded-full font-display uppercase tracking-widest font-bold text-sm hover:bg-[#b91f22] transition-colors"
                    >
                        <Calendar className="w-5 h-5" />
                        Book Another
                    </Link>
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-8 py-4 rounded-full font-display uppercase tracking-widest font-bold text-sm hover:bg-white/5 transition-colors"
                    >
                        View Dashboard
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CheckoutSuccessPage;
