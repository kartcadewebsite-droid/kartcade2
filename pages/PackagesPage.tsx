import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Star } from 'lucide-react';
import CTASection from '../components/CTASection';

const packages = [
    {
        name: "Launch",
        price: "$499",
        period: "one-time",
        description: "Perfect for startups getting their brand online",
        featured: false,
        features: [
            "5-Page Custom Website",
            "Starter Branding (Logo, Colors, Typography)",
            "Brand Kit PDF",
            "12 Social Media Graphics",
            "Basic SEO Setup",
            "Google My Business Setup",
            "Mobile Responsive",
            "WhatsApp Integration"
        ]
    },
    {
        name: "Accelerate",
        price: "$799",
        period: "+ $99/mo",
        description: "For growing businesses ready to scale",
        featured: false,
        features: [
            "Everything in Launch",
            "CMS Integration",
            "Booking System",
            "Advanced SEO",
            "Premium Branding (+ Business Cards, Letterhead)",
            "4 AI Product Videos",
            "16 Social Posts + 2 Reels/month",
            "Monthly Strategy Calls"
        ]
    },
    {
        name: "Dominate",
        price: "$999",
        period: "+ $149/mo",
        description: "For market leaders who want to own their space",
        featured: true,
        features: [
            "Everything in Accelerate",
            "Premium Custom Website",
            "Custom Integrations",
            "Complete Brand Identity (+ Packaging, Catalogue)",
            "8 AI Product Videos",
            "20 Social Posts + 4 Reels/month",
            "Advanced SEO + Ads Management",
            "Video Editing & Reporting"
        ]
    },
    {
        name: "Enterprise",
        price: "$1,499",
        period: "+ $249–$549/mo",
        description: "Full-stack digital transformation",
        featured: false,
        features: [
            "Everything in Dominate",
            "Full Automation Setup",
            "Chatbot Integration",
            "Lead Automation & CRM",
            "AI Content Generation",
            "Dedicated Account Manager",
            "Priority Support",
            "Custom Solutions"
        ]
    }
];

const PackagesPage: React.FC = () => {
    return (
        <div className="bg-white min-h-screen">

            {/* Hero */}
            <section className="pt-40 pb-20 px-6 md:px-12 text-center">
                <span className="font-mono text-black/40 uppercase tracking-widest text-sm mb-6 block">Transparent Pricing</span>
                <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold uppercase leading-none text-black mb-8">
                    Choose Your<br />Package
                </h1>
                <p className="font-sans text-xl text-black/60 max-w-2xl mx-auto leading-relaxed">
                    All-in-one digital solutions. Clear pricing, no hidden fees. Everything you need to launch, grow, and dominate your market.
                </p>
            </section>

            {/* Packages Grid */}
            <section className="py-20 px-6 md:px-12">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {packages.map((pkg, index) => (
                        <div
                            key={index}
                            className={`relative flex flex-col p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 ${pkg.featured
                                    ? 'bg-black text-white border-2 border-black'
                                    : 'bg-white text-black border border-black/10'
                                }`}
                        >
                            {pkg.featured && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                                    <Star className="w-3 h-3" /> Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="font-display text-2xl uppercase mb-2">{pkg.name}</h3>
                                <p className={`text-sm ${pkg.featured ? 'text-white/60' : 'text-black/60'}`}>{pkg.description}</p>
                            </div>

                            <div className="mb-8">
                                <span className="font-display text-5xl font-bold">{pkg.price}</span>
                                <span className={`text-sm block mt-1 ${pkg.featured ? 'text-white/60' : 'text-black/60'}`}>{pkg.period}</span>
                            </div>

                            <ul className="space-y-3 mb-8 flex-grow">
                                {pkg.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm">
                                        <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${pkg.featured ? 'text-white' : 'text-black'}`} />
                                        <span className={pkg.featured ? 'text-white/80' : 'text-black/80'}>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                to="/contact"
                                className={`w-full py-4 rounded-full font-display uppercase text-sm tracking-widest font-bold text-center transition-all flex items-center justify-center gap-2 group ${pkg.featured
                                        ? 'bg-white text-black hover:bg-white/90'
                                        : 'bg-black text-white hover:bg-black/80'
                                    }`}
                            >
                                Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* Comparison Note */}
            <section className="py-20 px-6 md:px-12 bg-black text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="font-display text-4xl md:text-5xl uppercase mb-8">Need Something Custom?</h2>
                    <p className="font-sans text-xl text-white/60 mb-12 leading-relaxed">
                        Every business is unique. If our packages don't fit your exact needs, we'll create a custom solution tailored to your goals and budget.
                    </p>
                    <Link
                        to="/contact"
                        className="inline-flex items-center gap-2 bg-white text-black px-10 py-5 rounded-full font-display uppercase tracking-widest font-bold hover:bg-white/90 transition-all group"
                    >
                        Request Custom Quote <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>

            <CTASection />
        </div>
    );
};

export default PackagesPage;
