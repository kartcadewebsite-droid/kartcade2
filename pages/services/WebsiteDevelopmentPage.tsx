import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Zap, Search, Shield, Smartphone, Globe, MessageCircle } from 'lucide-react';

const WebsiteDevelopmentPage: React.FC = () => {
    const features = [
        {
            icon: <Zap className="w-8 h-8" />,
            title: "Lightning Fast",
            desc: "Optimized for 90+ PageSpeed score. Fast loading means better user experience and higher Google rankings."
        },
        {
            icon: <Search className="w-8 h-8" />,
            title: "SEO Optimized",
            desc: "Built with search engines in mind. Proper structure, meta tags, schema markup, and keyword-optimized content."
        },
        {
            icon: <Smartphone className="w-8 h-8" />,
            title: "Mobile First",
            desc: "Responsive design that looks perfect on all devices. Over 60% of traffic comes from mobile."
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: "Secure & Reliable",
            desc: "SSL certificate, regular backups, and secure hosting. Your website is protected 24/7."
        },
        {
            icon: <MessageCircle className="w-8 h-8" />,
            title: "Lead Generation",
            desc: "Contact forms, WhatsApp integration, and call-to-actions designed to convert visitors into customers."
        },
        {
            icon: <Globe className="w-8 h-8" />,
            title: "Local SEO Ready",
            desc: "Targeted content and structure optimized for local search. Get found by customers in your area."
        }
    ];

    const process = [
        { step: "01", title: "Discovery", desc: "We learn about your business, goals, and target audience to create the perfect strategy." },
        { step: "02", title: "Design", desc: "Custom mockups and wireframes. You approve every design before we build." },
        { step: "03", title: "Development", desc: "We build your website with clean code, smooth animations, and perfect functionality." },
        { step: "04", title: "Launch", desc: "Final testing, SEO setup, and deployment. Your website goes live." }
    ];

    const included = [
        "5-page custom website",
        "Modern, clean design",
        "GSAP scroll animations",
        "Contact forms",
        "WhatsApp integration",
        "SEO optimization",
        "Speed optimization",
        "Mobile responsive",
        "Google Analytics setup",
        "Hosting & SSL setup"
    ];

    return (
        <div className="bg-white min-h-screen">

            {/* Hero - SEO Title */}
            <section className="pt-40 pb-20 px-6 md:px-12 bg-black text-white">
                <div className="max-w-5xl mx-auto">
                    <span className="font-mono text-white/40 uppercase tracking-widest text-sm mb-6 block">Professional Website Development</span>
                    <h1 className="font-display text-5xl md:text-7xl font-bold uppercase leading-none mb-8">
                        Business Website<br />Development
                    </h1>
                    <p className="font-sans text-xl text-white/60 max-w-2xl leading-relaxed mb-10">
                        Custom business websites built to convert visitors into customers. SEO-optimized, mobile-responsive, and designed for results. Get a professional online presence that grows your business.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center gap-2 bg-white text-black px-10 py-5 rounded-full font-display uppercase tracking-widest font-bold hover:bg-white/90 transition-colors group"
                        >
                            Get a Quote <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/pricing"
                            className="inline-flex items-center justify-center px-10 py-5 rounded-full border border-white/20 font-display uppercase tracking-widest font-bold hover:bg-white/10 transition-colors"
                        >
                            View Pricing
                        </Link>
                    </div>
                </div>
            </section>

            {/* What's Included */}
            <section className="py-20 px-6 md:px-12">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="font-display text-4xl md:text-5xl uppercase mb-6 text-black">What's Included</h2>
                            <p className="text-black/60 text-lg mb-8">
                                Every business website we build comes with everything you need to get found online and convert visitors into leads.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {included.map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <Check className="w-5 h-5 text-black" />
                                        <span className="text-black/80">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-black text-white p-12 rounded-3xl">
                            <span className="font-mono text-white/40 uppercase tracking-widest text-sm block mb-4">Starting at</span>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="font-display text-6xl font-bold">$599</span>
                                <span className="text-white/40">one-time</span>
                            </div>
                            <p className="text-white/60 mb-8">+ $39/mo maintenance (includes hosting, SSL, support)</p>
                            <Link
                                to="/contact"
                                className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-display uppercase text-sm tracking-widest font-bold hover:bg-white/90 transition-colors group w-full justify-center"
                            >
                                Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-6 md:px-12 bg-black text-white">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-4xl md:text-5xl uppercase mb-4">Built for Results</h2>
                        <p className="text-white/60 text-lg">Every feature designed to help your business grow</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, i) => (
                            <div key={i} className="p-8 border border-white/10 rounded-2xl hover:border-white/30 transition-colors">
                                <div className="text-white mb-6">{feature.icon}</div>
                                <h3 className="font-display text-xl uppercase mb-3">{feature.title}</h3>
                                <p className="text-white/60">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Process */}
            <section className="py-20 px-6 md:px-12">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-4xl md:text-5xl uppercase mb-4 text-black">Our Process</h2>
                        <p className="text-black/60 text-lg">From concept to launch in 2-3 weeks</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {process.map((item, i) => (
                            <div key={i} className="relative">
                                <span className="font-display text-8xl font-bold text-black/5 absolute -top-6 -left-2">{item.step}</span>
                                <div className="relative z-10 pt-8">
                                    <h3 className="font-display text-2xl uppercase mb-3">{item.title}</h3>
                                    <p className="text-black/60">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Local SEO Section - Keyword rich */}
            <section className="py-20 px-6 md:px-12 bg-black text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="font-display text-4xl md:text-5xl uppercase mb-8">Local Business Website Development</h2>
                    <p className="text-white/60 text-lg leading-relaxed mb-8">
                        We specialize in building websites for local businesses that need to get found on Google. Whether you're a contractor, restaurant, dental clinic, law firm, or any local service provider, we create websites optimized for local search. Our SEO-focused approach helps you rank for keywords like "best [service] near me" and "[service] in [city]".
                    </p>
                    <p className="text-white/60 text-lg leading-relaxed">
                        Every website includes Google My Business optimization guidance, local schema markup, location-based keywords, and mobile optimization — because over 60% of local searches happen on mobile devices.
                    </p>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 md:px-12 text-center">
                <div className="max-w-2xl mx-auto">
                    <h2 className="font-display text-4xl md:text-5xl uppercase mb-6 text-black">Ready to Build Your Website?</h2>
                    <p className="text-black/60 text-lg mb-10">
                        Get a professional business website that converts visitors into customers. Let's discuss your project.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center gap-2 bg-black text-white px-10 py-5 rounded-full font-display uppercase tracking-widest font-bold hover:bg-black/80 transition-colors group"
                        >
                            Get a Free Quote <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a
                            href="https://wa.me/12345678900"
                            className="inline-flex items-center justify-center px-10 py-5 rounded-full border border-black/20 font-display uppercase tracking-widest font-bold hover:bg-black/5 transition-colors"
                        >
                            WhatsApp Us
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default WebsiteDevelopmentPage;
