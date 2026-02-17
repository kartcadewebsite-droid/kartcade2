import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CreditCard, Loader2, ArrowLeft, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getMembershipById, MembershipTier } from '../config/membership';
import { isStripeConfigured } from '../config/stripe';

const CheckoutPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { currentUser, userProfile } = useAuth();

    const tierId = searchParams.get('tier');
    const [tier, setTier] = useState<MembershipTier | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!tierId) {
            navigate('/membership');
            return;
        }

        const foundTier = getMembershipById(tierId);
        if (!foundTier) {
            navigate('/membership');
            return;
        }

        setTier(foundTier);
    }, [tierId, navigate]);

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!currentUser) {
            navigate('/login', { state: { from: `/checkout?tier=${tierId}` } });
        }
    }, [currentUser, navigate, tierId]);

    const handleCheckout = async () => {
        if (!tier || !currentUser) return;

        setLoading(true);
        setError('');

        try {
            // First, try to get priceId from URL params
            let finalPriceId = searchParams.get('priceId');

            // If no priceId in URL, fetch from API
            if (!finalPriceId) {
                const configRes = await fetch('/api/get-stripe-config');
                const configData = await configRes.json();
                finalPriceId = configData?.prices?.[tier.id] || null;
            }

            // If still no price, use fallback from tier config
            if (!finalPriceId) {
                finalPriceId = tier.stripePriceId;
            }

            if (!isStripeConfigured()) {
                setError('Payment system is not yet configured. Please contact us to complete your purchase.');
                setLoading(false);
                return;
            }

            // Check if we have a valid price ID
            if (!finalPriceId || finalPriceId.includes('placeholder')) {
                setError('Configuration Error: Membership Price ID is missing. Please contact support.');
                setLoading(false);
                return;
            }

            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    priceId: finalPriceId,
                    tierId: tier.id,
                    equipmentType: tier.equipmentType,
                    oldSubscriptionId: searchParams.get('upgradeFrom'),
                    userId: currentUser.uid,
                    userEmail: currentUser.email,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Checkout failed');
            }

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (err) {
            setError('Failed to start checkout. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!tier) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#2D9E49]" />
            </div>
        );
    }

    const levelColors: { [key: string]: string } = {
        bronze: '#CD7F32',
        silver: '#C0C0C0',
        gold: '#FFD700',
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-12">
            <div className="container mx-auto px-4 md:px-6 lg:px-12 max-w-xl">
                {/* Back Button */}
                <Link
                    to="/membership"
                    className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to plans
                </Link>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="font-display text-3xl md:text-4xl font-bold uppercase text-white mb-2">
                        Checkout
                    </h1>
                    <p className="text-white/60">Complete your membership purchase</p>
                </div>

                {/* Order Summary */}
                <div className="bg-[#141414] rounded-2xl p-6 border border-white/10 mb-6">
                    <h2 className="font-display text-lg font-bold uppercase text-white mb-4">
                        Order Summary
                    </h2>

                    <div className="flex items-center gap-4 p-4 rounded-xl mb-4" style={{ backgroundColor: `${levelColors[tier.level]}15` }}>
                        <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${levelColors[tier.level]}20`, border: `1px solid ${levelColors[tier.level]}40` }}
                        >
                            <CreditCard className="w-6 h-6" style={{ color: levelColors[tier.level] }} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-display text-white font-bold uppercase">
                                {tier.name}
                            </h3>
                            <p className="text-white/60 text-sm">
                                {tier.credits} credits/month
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-white">${tier.price}</div>
                            <div className="text-white/40 text-xs">/month</div>
                        </div>
                    </div>

                    <div className="space-y-2 text-sm border-t border-white/10 pt-4">
                        <div className="flex justify-between text-white/60">
                            <span>Billed</span>
                            <span>Monthly</span>
                        </div>
                        <div className="flex justify-between text-white/60">
                            <span>Credits per cycle</span>
                            <span>{tier.credits} hours</span>
                        </div>
                        <div className="flex justify-between text-white/60">
                            <span>Savings vs regular price</span>
                            <span className="text-[#2D9E49]">${tier.savings * tier.credits}/month</span>
                        </div>
                        <div className="flex justify-between font-bold text-white pt-2 border-t border-white/10">
                            <span>Total today</span>
                            <span>${tier.price}</span>
                        </div>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="bg-[#141414] rounded-2xl p-6 border border-white/10 mb-6">
                    <h2 className="font-display text-lg font-bold uppercase text-white mb-4">
                        Account
                    </h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-white/60">Name</span>
                            <span className="text-white">{userProfile?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/60">Email</span>
                            <span className="text-white">{currentUser?.email}</span>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <p className="text-yellow-500 text-sm">{error}</p>
                    </div>
                )}

                {/* Checkout Button */}
                <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full py-4 bg-[#2D9E49] text-white rounded-full font-display uppercase tracking-widest font-bold text-sm hover:bg-[#248a3f] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <CreditCard className="w-5 h-5" />
                            Pay ${tier.price} / month
                        </>
                    )}
                </button>

                {/* Security Note */}
                <div className="flex items-center justify-center gap-2 text-white/40 text-xs mt-4">
                    <Shield className="w-4 h-4" />
                    Secure payment powered by Stripe
                </div>

                {/* Terms */}
                <p className="text-white/40 text-xs text-center mt-4 leading-relaxed">
                    By subscribing, you agree to our Terms of Service and authorize recurring monthly charges.
                    You can cancel anytime from your dashboard.
                </p>
            </div>
        </div>
    );
};

export default CheckoutPage;
