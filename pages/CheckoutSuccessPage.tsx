import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Zap, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import confetti from 'canvas-confetti';

const CheckoutSuccessPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const { userProfile, refreshUserProfile } = useAuth();
    const [loading, setLoading] = useState(true);

    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        // Refresh user profile to get updated credits/membership
        const loadData = async () => {
            await refreshUserProfile();
            setLoading(false);

            // Celebration confetti!
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#2D9E49', '#D42428', '#FFD700'],
            });
        };

        loadData();
    }, [refreshUserProfile]);

    const membership = userProfile?.membership;

    return (
        <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-12">
            <div className="container mx-auto px-4 md:px-6 lg:px-12 max-w-xl text-center">
                {/* Success Icon */}
                <div className="w-24 h-24 bg-[#2D9E49] rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle className="w-12 h-12 text-white" />
                </div>

                {/* Header */}
                <h1 className="font-display text-4xl md:text-5xl font-bold uppercase text-white mb-4">
                    Welcome to the <span className="text-[#2D9E49]">Club!</span>
                </h1>
                <p className="text-white/60 text-lg mb-8">
                    Your membership is now active. Time to hit the track!
                </p>

                {/* Membership Details */}
                {membership?.active && (
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

                {/* What's Next */}
                <div className="bg-[#141414] rounded-2xl p-6 border border-white/10 mb-8 text-left">
                    <h2 className="font-display text-lg font-bold uppercase text-white mb-4">
                        What's Next?
                    </h2>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-[#2D9E49]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-[#2D9E49] text-xs font-bold">1</span>
                            </div>
                            <div>
                                <div className="text-white font-medium">Book a Session</div>
                                <div className="text-white/50 text-sm">
                                    Use your credits to book at 50% off
                                </div>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-[#2D9E49]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-[#2D9E49] text-xs font-bold">2</span>
                            </div>
                            <div>
                                <div className="text-white font-medium">Check Your Dashboard</div>
                                <div className="text-white/50 text-sm">
                                    View credits, bookings, and manage your membership
                                </div>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-[#2D9E49]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-[#2D9E49] text-xs font-bold">3</span>
                            </div>
                            <div>
                                <div className="text-white font-medium">Enjoy Member Perks</div>
                                <div className="text-white/50 text-sm">
                                    Priority booking, exclusive events, and more!
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/book"
                        className="inline-flex items-center justify-center gap-2 bg-[#D42428] text-white px-8 py-4 rounded-full font-display uppercase tracking-widest font-bold text-sm hover:bg-[#b91f22] transition-colors"
                    >
                        <Calendar className="w-5 h-5" />
                        Book Now
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
