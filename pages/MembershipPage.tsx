import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Zap, Crown, Star, Clock, Users, Gift, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { MEMBERSHIP_TIERS, getMembershipById } from '../config/membership';
import { isStripeConfigured } from '../config/stripe';

// Group tiers by equipment type
const membershipTiers = {
    kart: {
        name: 'Kart',
        description: 'Perfect for casual racers and beginners',
        tiers: MEMBERSHIP_TIERS.filter(t => t.equipmentType === 'kart'),
    },
    rig: {
        name: 'Rig',
        description: 'For dedicated sim racers who want the full experience',
        tiers: MEMBERSHIP_TIERS.filter(t => t.equipmentType === 'rig'),
    },
    motion: {
        name: 'Motion',
        description: 'The ultimate experience with our motion simulator',
        tiers: MEMBERSHIP_TIERS.filter(t => t.equipmentType === 'motion'),
    },
};

const levelColors = {
    bronze: { bg: 'bg-amber-900/20', border: 'border-amber-700/30', text: 'text-amber-500', glow: 'hover:shadow-amber-500/20' },
    silver: { bg: 'bg-gray-400/10', border: 'border-gray-400/30', text: 'text-gray-300', glow: 'hover:shadow-gray-300/20' },
    gold: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', glow: 'hover:shadow-yellow-400/20' },
};

const levelIcons = {
    bronze: Star,
    silver: Zap,
    gold: Crown,
};

type EquipmentType = 'kart' | 'rig' | 'motion';

const MembershipPage: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, userProfile } = useAuth();
    const [selectedType, setSelectedType] = useState<EquipmentType>('rig');
    const [loadingTier, setLoadingTier] = useState<string | null>(null);
    const [stripePrices, setStripePrices] = useState<Record<string, string>>({});

    // Fetch dynamic prices
    useEffect(() => {
        fetch('/api/get-stripe-config')
            .then(res => res.json())
            .then(data => {
                if (data && data.prices) {
                    setStripePrices(data.prices);
                }
            })
            .catch(err => console.error('Failed to load prices:', err));
    }, []);

    // Check if user has an active membership for the SELECTED equipment type
    const activeMembershipForType = userProfile?.memberships?.[selectedType]?.active
        ? userProfile.memberships[selectedType]
        : null;
    const activeTier = activeMembershipForType ? getMembershipById(activeMembershipForType.tier) : null;

    const handleSelectPlan = async (tierId: string) => {
        // If not logged in, redirect to signup
        if (!currentUser) {
            navigate('/signup', { state: { from: '/membership', selectedTier: tierId } });
            return;
        }

        // If already has THIS exact membership
        if (activeMembershipForType?.tier === tierId) {
            alert('You already have this membership!');
            return;
        }

        // If Stripe not configured, show message
        if (!isStripeConfigured()) {
            alert('Payment system coming soon! We\'ll notify you when memberships are available for purchase.');
            return;
        }

        // Proceed to checkout
        setLoadingTier(tierId);
        try {
            // Check if this is an upgrade (User has a membership for this TYPE, but different tier)
            const isUpgrade = !!activeMembershipForType;
            const upgradeParam = isUpgrade && activeMembershipForType?.stripeSubscriptionId
                ? `&upgradeFrom=${activeMembershipForType.stripeSubscriptionId}`
                : '';

            // Get dynamic price ID
            const priceId = stripePrices[tierId] || '';
            const priceParam = priceId ? `&priceId=${priceId}` : '';

            // Navigate to checkout with tier info AND upgrade info if applicable
            navigate(`/checkout?tier=${tierId}${upgradeParam}${priceParam}`);
        } catch (error) {
            console.error('Failed to start checkout:', error);
            alert('Failed to start checkout. Please try again.');
        } finally {
            setLoadingTier(null);
        }
    };



    const handleManageSubscription = async () => {
        if (!currentUser) return;

        if (!isStripeConfigured()) {
            alert('Subscription management coming soon!');
            return;
        }

        try {
            const response = await fetch('/api/create-portal-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.uid,
                    userEmail: currentUser.email
                })
            });

            const data = await response.json();

            if (response.ok && data.url) {
                window.location.href = data.url;
            } else {
                alert('Could not open subscription management at this time.');
                console.error('Portal Error:', data.error);
            }
        } catch (error) {
            console.error('Portal connection failed:', error);
            alert('Failed to connect to billing portal.');
        }
    };



    const features = [
        { icon: Clock, text: '1 credit = 1 hour at 50% off' },
        { icon: Users, text: 'Credits are personal (not shareable)' },
        { icon: AlertCircle, text: 'Credits reset each billing cycle' },
        { icon: Gift, text: 'Cancel anytime, no commitment' },
    ];

    return (
        <div className="relative bg-[#0A0A0A] min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-24 md:pt-32 pb-12 md:pb-16 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden opacity-10">
                    <div className="absolute top-0 left-1/4 w-32 h-full bg-gradient-to-b from-[#2D9E49] to-transparent transform -skew-x-12"></div>
                    <div className="absolute top-0 left-1/3 w-16 h-full bg-gradient-to-b from-white to-transparent transform -skew-x-12"></div>
                    <div className="absolute top-0 left-[40%] w-32 h-full bg-gradient-to-b from-[#D42428] to-transparent transform -skew-x-12"></div>
                </div>
                <div className="container mx-auto px-4 md:px-6 lg:px-12 relative z-10">
                    <span className="font-mono text-[#2D9E49] tracking-widest uppercase text-xs md:text-sm mb-4 md:mb-6 block text-center">
                        Save 50% on Every Hour
                    </span>
                    <h1 className="font-display text-4xl md:text-6xl lg:text-8xl font-bold uppercase leading-none text-center text-white mb-4 md:mb-6">
                        Membership<br />
                        <span className="text-[#D42428]">Plans</span>
                    </h1>
                    <p className="font-sans text-base md:text-xl text-white/60 max-w-2xl mx-auto text-center leading-relaxed px-4">
                        Join Kartcade and get exclusive member pricing. Choose your equipment type and commitment level.
                    </p>

                    {/* Current Membership Banner */}
                    {activeMembershipForType && activeTier && (
                        <div className="mt-8 max-w-md mx-auto">
                            <div className="bg-[#2D9E49]/10 border border-[#2D9E49]/30 rounded-xl p-4 text-center">
                                <p className="text-[#2D9E49] text-sm font-bold uppercase mb-1">
                                    Current Membership
                                </p>
                                <p className="text-white text-lg font-display uppercase">
                                    {activeTier.name}
                                </p>
                                <p className="text-white/60 text-sm mt-1">
                                    {activeTier.credits} credits/month • ${activeTier.price}/mo
                                </p>
                                <button
                                    onClick={handleManageSubscription}
                                    className="mt-3 text-[#2D9E49] text-sm hover:underline"
                                >
                                    Manage Subscription →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Stripe Not Configured Banner */}
            {!isStripeConfigured() && (
                <section className="py-4">
                    <div className="container mx-auto px-4 md:px-6 lg:px-12 max-w-4xl">
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
                            <p className="text-yellow-500 text-sm">
                                <AlertCircle className="w-4 h-4 inline mr-2" />
                                Membership purchases coming soon! Browse plans below.
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* How It Works */}
            <section className="py-8 md:py-12">
                <div className="container mx-auto px-4 md:px-6 lg:px-12 max-w-5xl">
                    <div className="bg-[#141414] rounded-xl md:rounded-2xl p-5 md:p-8 border border-white/10">
                        <h2 className="font-display text-xl md:text-2xl font-bold uppercase text-center text-white mb-6">How Credits Work</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {features.map((feature, index) => (
                                <div key={index} className="text-center">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#2D9E49]/20 border border-[#2D9E49]/30 flex items-center justify-center mx-auto mb-3">
                                        <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-[#2D9E49]" />
                                    </div>
                                    <p className="text-white/70 font-sans text-xs md:text-sm">{feature.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Equipment Type Selector */}
            <section className="py-8">
                <div className="container mx-auto px-4 md:px-6 lg:px-12 max-w-4xl">
                    <h2 className="font-display text-lg md:text-xl font-bold uppercase text-center text-white/60 mb-6">Choose Your Equipment</h2>
                    <div className="flex justify-center gap-2 md:gap-4">
                        {(Object.keys(membershipTiers) as EquipmentType[]).map((type) => (
                            <button
                                key={type}
                                onClick={() => setSelectedType(type)}
                                className={`px-6 md:px-8 py-3 md:py-4 rounded-full font-display uppercase tracking-wider text-sm md:text-base font-bold transition-all ${selectedType === type
                                    ? 'bg-[#D42428] text-white shadow-lg shadow-[#D42428]/30'
                                    : 'bg-[#141414] text-white/60 border border-white/10 hover:border-white/30'
                                    }`}
                            >
                                {membershipTiers[type].name}
                            </button>
                        ))}
                    </div>
                    <p className="text-center text-white/40 font-sans text-sm mt-4">
                        {membershipTiers[selectedType].description}
                    </p>
                </div>
            </section>

            {/* Tier Cards */}
            <section className="py-8 md:py-16">
                <div className="container mx-auto px-4 md:px-6 lg:px-12 max-w-6xl">
                    <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                        {membershipTiers[selectedType].tiers.map((tier) => {
                            const colors = levelColors[tier.level as keyof typeof levelColors];
                            const LevelIcon = levelIcons[tier.level as keyof typeof levelIcons];
                            const isPopular = tier.popular;
                            const isCurrentPlan = activeMembershipForType?.tier === tier.id;
                            const isLoading = loadingTier === tier.id;

                            return (
                                <div
                                    key={tier.id}
                                    className={`relative ${colors.bg} border ${colors.border} rounded-2xl p-6 md:p-8 transition-all hover:scale-[1.02] hover:shadow-2xl ${colors.glow} ${isPopular ? 'md:-mt-4 md:mb-4' : ''} ${isCurrentPlan ? 'ring-2 ring-[#2D9E49]' : ''}`}
                                >
                                    {isPopular && !isCurrentPlan && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2D9E49] text-white text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full">
                                            Most Popular
                                        </div>
                                    )}

                                    {isCurrentPlan && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2D9E49] text-white text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full">
                                            Current Plan
                                        </div>
                                    )}

                                    {/* Header */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-10 h-10 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                                            <LevelIcon className={`w-5 h-5 ${colors.text}`} />
                                        </div>
                                        <div>
                                            <h3 className={`font-display text-lg md:text-xl font-bold uppercase ${colors.text}`}>
                                                {tier.level}
                                            </h3>
                                            <p className="text-white/40 text-xs uppercase tracking-wider">
                                                {tier.equipmentName}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="mb-6">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl md:text-5xl font-bold text-white">${tier.price}</span>
                                            <span className="text-white/40 text-sm">/month</span>
                                        </div>
                                    </div>

                                    {/* Credits */}
                                    <div className="bg-black/30 rounded-xl p-4 mb-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-white/60 text-sm">Monthly Credits</span>
                                            <span className={`text-2xl font-bold ${colors.text}`}>{tier.credits}</span>
                                        </div>
                                        <div className="text-white/40 text-xs">
                                            = {tier.credits} hours at 50% off
                                        </div>
                                        <div className="mt-2 text-[#2D9E49] text-sm font-medium">
                                            Save ${tier.savings * tier.credits}/month
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-3 mb-6">
                                        <li className="flex items-center gap-2 text-white/70 text-sm">
                                            <Check className="w-4 h-4 text-[#2D9E49]" /> Access to {tier.equipmentName.toLowerCase()}
                                        </li>
                                        <li className="flex items-center gap-2 text-white/70 text-sm">
                                            <Check className="w-4 h-4 text-[#2D9E49]" /> Priority booking
                                        </li>
                                        <li className="flex items-center gap-2 text-white/70 text-sm">
                                            <Check className="w-4 h-4 text-[#2D9E49]" /> Member-only events
                                        </li>
                                        {tier.level === 'gold' && (
                                            <li className="flex items-center gap-2 text-white/70 text-sm">
                                                <Check className="w-4 h-4 text-[#2D9E49]" /> Free guest pass (1/month)
                                            </li>
                                        )}
                                    </ul>

                                    {/* CTA Button */}
                                    <button
                                        onClick={() => handleSelectPlan(tier.id)}
                                        disabled={isLoading || isCurrentPlan}
                                        className={`w-full py-4 rounded-full font-display uppercase tracking-widest font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${isCurrentPlan
                                            ? 'bg-[#2D9E49]/20 text-[#2D9E49] border border-[#2D9E49]/30'
                                            : isPopular
                                                ? 'bg-[#2D9E49] text-white hover:bg-[#248a3f] hover:shadow-lg hover:shadow-[#2D9E49]/30'
                                                : 'bg-white/10 text-white hover:bg-white/20'
                                            }`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Loading...
                                            </>
                                        ) : isCurrentPlan ? (
                                            'Current Plan'
                                        ) : (
                                            <>
                                                Get Started <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>


                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Comparison Note */}
            <section className="py-8 md:py-12">
                <div className="container mx-auto px-4 md:px-6 lg:px-12 max-w-4xl">
                    <div className="bg-[#D42428]/10 border border-[#D42428]/20 rounded-xl p-5 md:p-8">
                        <h3 className="font-display text-lg md:text-xl font-bold uppercase text-white mb-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-[#D42428]" />
                            Not Sure Which to Choose?
                        </h3>
                        <div className="text-white/70 font-sans text-sm md:text-base space-y-2">
                            <p><strong className="text-white">Kart:</strong> Our kid-friendly go-kart simulators. Great for families and beginners.</p>
                            <p><strong className="text-white">Rig:</strong> Full-size racing rigs with force feedback wheels. The core Kartcade experience.</p>
                            <p><strong className="text-white">Motion:</strong> Our premium motion simulator that moves with the action. Ultimate immersion.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-16 md:py-24 bg-[#0A0A0A] text-white overflow-hidden">
                <div className="absolute inset-0 overflow-hidden opacity-10">
                    <div className="absolute top-0 left-1/4 w-32 h-full bg-gradient-to-b from-[#2D9E49] to-transparent transform -skew-x-12"></div>
                    <div className="absolute top-0 left-1/3 w-16 h-full bg-gradient-to-b from-white to-transparent transform -skew-x-12"></div>
                    <div className="absolute top-0 left-[40%] w-32 h-full bg-gradient-to-b from-[#D42428] to-transparent transform -skew-x-12"></div>
                </div>

                <div className="container mx-auto px-4 md:px-6 lg:px-12 relative z-10 flex flex-col items-center text-center">
                    <span className="font-mono text-[#2D9E49] tracking-widest uppercase text-xs md:text-sm mb-4">
                        Questions?
                    </span>

                    <h2 className="font-display text-3xl md:text-5xl font-bold uppercase leading-none mb-6">
                        Try Before<br />
                        <span className="text-[#D42428]">You Commit</span>
                    </h2>

                    <p className="font-sans text-base md:text-lg text-white/60 max-w-2xl mb-8 leading-relaxed">
                        Not ready for a membership? Book a single session first and experience Kartcade. You can always upgrade later!
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
                        <Link
                            to="/book"
                            className="group relative bg-[#D42428] text-white px-8 md:px-12 py-4 md:py-5 rounded-full font-display uppercase tracking-widest font-bold text-sm overflow-hidden transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#D42428]/30 text-center"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Book a Session <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>

                        <Link
                            to="/contact"
                            className="px-8 md:px-12 py-4 md:py-5 rounded-full border border-white/20 font-display uppercase tracking-widest font-bold text-sm hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default MembershipPage;
