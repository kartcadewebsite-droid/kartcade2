import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus, Minus, MessageCircle } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FixedGrid from '../../components/FixedGrid';

gsap.registerPlugin(ScrollTrigger);

// FAQ Accordion Item - Controlled component
const FAQItem: React.FC<{
    question: string;
    answer: string;
    isOpen: boolean;
    onToggle: () => void;
}> = ({ question, answer, isOpen, onToggle }) => {
    return (
        <div className="border-t border-white/20">
            <button
                onClick={onToggle}
                className="w-full py-6 flex items-start justify-between text-left group"
            >
                <h3 className="font-sans text-lg md:text-xl font-medium text-white pr-8 group-hover:opacity-60 transition-opacity">
                    {question}
                </h3>
                <div className="flex-shrink-0 mt-1">
                    {isOpen ? (
                        <Minus className="w-5 h-5 text-white/40" />
                    ) : (
                        <Plus className="w-5 h-5 text-white/40" />
                    )}
                </div>
            </button>
            <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 pb-6' : 'max-h-0'
                    }`}
            >
                <p className="font-sans text-white/50 text-base leading-relaxed pr-12">
                    {answer}
                </p>
            </div>
        </div>
    );
};

// Features data
const features = [
    { number: "01", title: "Lead generation", desc: "Contact forms & quote calculators" },
    { number: "02", title: "Mobile-first design", desc: "Perfect on every device" },
    { number: "03", title: "Google optimization", desc: "Rank for local searches" },
    { number: "04", title: "Fast performance", desc: "3-second load time" },
    { number: "05", title: "Professional design", desc: "Trust-building aesthetic" },
    { number: "06", title: "Conversion-focused", desc: "Turn visitors into customers" },
];

// FAQ data with SEO keywords
const faqs = [
    {
        question: "How much does a solar company website cost in Phoenix?",
        answer: "Our Express Launch package is $499 total with no hidden fees. This includes custom design, mobile optimization, SEO setup, and lead capture forms. You get a free preview in 24 hours before paying anything."
    },
    {
        question: "How long does it take to build a website for a solar company?",
        answer: "With our Express Launch service, you'll see a custom preview in 24 hours. Once approved, your website goes live within 1 week. Traditional agencies take 2-3 months."
    },
    {
        question: "Do I need to pay upfront for my solar company website?",
        answer: "No. We build a custom preview for free first. You only pay the $499 if you approve the design. Zero risk, zero upfront payment."
    },
    {
        question: "Will my solar website rank on Google in Phoenix?",
        answer: "Yes. Every website includes SEO optimization for local Phoenix searches like 'solar installation Phoenix' and 'solar panels Phoenix AZ'. We also help with Google Business Profile setup."
    },
    {
        question: "What if I don't like the website preview?",
        answer: "No charge. If you don't love the preview, you walk away with zero cost. We only get paid when you're 100% satisfied."
    },
    {
        question: "Can you help with lead generation for my solar business?",
        answer: "Absolutely. Every website includes optimized contact forms, quote calculators, and call-to-action buttons designed to capture leads 24/7."
    },
];

// Portfolio mockups
const portfolioItems = [
    {
        image: "/mockups/solar_website_mockup_1767687402650.png",
        name: "Phoenix Solar Pro",
        result: "+300% increase in leads"
    },
    {
        image: "/mockups/solar_mockup_2_1767689721143.png",
        name: "Arizona Solar Solutions",
        result: "Ranked #1 on Google"
    },
    {
        image: "/mockups/solar_mockup_3_1767689740277.png",
        name: "Desert Sun Energy",
        result: "15 leads in first week"
    },
];

// Trust points with illustrations
const trustPoints = [
    { text: "50+ websites built for solar companies", image: "/illustrations/trust_websites_built_1767692006576.png" },
    { text: "4.9/5 average client rating", image: "/illustrations/trust_rating_v2_1767692332388.png" },
    { text: "100% money-back guarantee", image: "/illustrations/trust_guarantee_1767692085247.png" },
    { text: "Free preview before you pay", image: "/illustrations/trust_preview_1767692106531.png" },
    { text: "1-week delivery (not months)", image: "/illustrations/trust_fast_delivery_1767692122687.png" },
    { text: "Dedicated support included", image: "/illustrations/trust_support_v2_1767692352450.png" },
];

const SolarCompaniesPhoenixPage: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);
    const statementRef = useRef<HTMLDivElement>(null);
    const featuresRef = useRef<HTMLDivElement>(null);
    const trustSectionRef = useRef<HTMLDivElement>(null);
    const trustTrackRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);
    const [ctaMousePos, setCtaMousePos] = useState({ x: 0, y: 0 });
    const [activeFaq, setActiveFaq] = useState<number | null>(0); // First FAQ open by default

    // SEO Meta Tags and FAQ Schema
    useEffect(() => {
        // Set page title
        document.title = "Solar Company Website Design Phoenix | Free 24hr Preview";

        // Set/update meta description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', 'Professional website design for solar companies in Phoenix. $499 flat rate. Free 24-hour preview before you pay. Rank on Google & get more customers.');

        // Set/update meta keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.setAttribute('name', 'keywords');
            document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', 'solar company website phoenix, web design solar companies, solar website design arizona, solar company website cost, phoenix solar web design');

        // Open Graph tags
        const ogTags = [
            { property: 'og:title', content: 'Solar Company Website Design Phoenix | AgencyStarter' },
            { property: 'og:description', content: 'Professional website design for solar companies in Phoenix. $499 flat rate. Free 24-hour preview before you pay.' },
            { property: 'og:type', content: 'website' },
            { property: 'og:url', content: 'https://yourdomain.com/for/solar-companies-phoenix' },
        ];

        ogTags.forEach(({ property, content }) => {
            let tag = document.querySelector(`meta[property="${property}"]`);
            if (!tag) {
                tag = document.createElement('meta');
                tag.setAttribute('property', property);
                document.head.appendChild(tag);
            }
            tag.setAttribute('content', content);
        });

        // Canonical URL
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', 'https://yourdomain.com/for/solar-companies-phoenix');

        // FAQ Schema for rich snippets
        const faqSchema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                }
            }))
        };

        // Add/update FAQ schema script
        let schemaScript = document.querySelector('script[data-schema="faq"]');
        if (!schemaScript) {
            schemaScript = document.createElement('script');
            schemaScript.setAttribute('type', 'application/ld+json');
            schemaScript.setAttribute('data-schema', 'faq');
            document.head.appendChild(schemaScript);
        }
        schemaScript.textContent = JSON.stringify(faqSchema);

        // Cleanup on unmount
        return () => {
            document.title = "AgencyStarter | Web Design Agency";
        };
    }, []);

    const statementText = "Without a professional website, you're losing customers to competitors every single day.";

    useGSAP(() => {
        // Hero fade in
        gsap.fromTo(heroRef.current,
            { opacity: 0, y: 60 },
            { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", delay: 0.2 }
        );

        // Statement character animation
        const chars = statementRef.current?.querySelectorAll('.char');
        if (chars && chars.length > 0) {
            gsap.fromTo(chars,
                { color: "rgba(0, 0, 0, 0.2)" },
                {
                    color: "rgba(0, 0, 0, 1)",
                    stagger: 0.1,
                    ease: "none",
                    scrollTrigger: {
                        trigger: statementRef.current,
                        start: "top 70%",
                        end: "center center",
                        scrub: true,
                    }
                }
            );
        }

        // SEO content character animation
        const seoChars = containerRef.current?.querySelectorAll('.seo-char');
        if (seoChars && seoChars.length > 0) {
            gsap.fromTo(seoChars,
                { color: "rgba(0, 0, 0, 0.15)" },
                {
                    color: "rgba(0, 0, 0, 1)",
                    stagger: 0.02,
                    ease: "none",
                    scrollTrigger: {
                        trigger: ".seo-text",
                        start: "top 80%",
                        end: "bottom 30%",
                        scrub: true,
                    }
                }
            );
        }

        // Features stagger animation
        const items = featuresRef.current?.querySelectorAll('.service-item');
        items?.forEach((item, i) => {
            gsap.fromTo(item,
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    delay: i * 0.1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: item,
                        start: "top 90%",
                    }
                }
            );
        });

        // Horizontal scroll for Trust section - starts when section is centered
        const getScrollAmount = () => {
            if (!trustTrackRef.current) return 0;
            return trustTrackRef.current.scrollWidth - window.innerWidth;
        };

        gsap.to(trustTrackRef.current, {
            x: () => -getScrollAmount(),
            ease: "none",
            scrollTrigger: {
                trigger: trustSectionRef.current,
                start: "top 20%",
                end: "bottom 80%",
                scrub: 1,
                invalidateOnRefresh: true,
            }
        });

        // CTA animation
        const ctaElements = ctaRef.current?.querySelectorAll('.fade-up');
        gsap.fromTo(ctaElements!,
            { y: 30, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: ctaRef.current,
                    start: "top 75%",
                }
            }
        );

        // CTA mouse move
        const updateMousePosition = (e: MouseEvent) => {
            if (!ctaRef.current) return;
            const rect = ctaRef.current.getBoundingClientRect();
            setCtaMousePos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        };

        const section = ctaRef.current;
        section?.addEventListener('mousemove', updateMousePosition);

        return () => {
            section?.removeEventListener('mousemove', updateMousePosition);
        };
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="relative">
            {/* Fixed Grid Background */}
            <FixedGrid />

            {/* SECTION 1: Hero - Above the Fold */}
            <section className="relative z-10 min-h-screen flex items-center justify-center px-6 md:px-12 pt-32 pb-24">
                <div ref={heroRef} className="max-w-5xl mx-auto text-center">
                    <span className="font-mono text-white/40 uppercase tracking-widest text-sm mb-8 block">
                        For Solar Companies in Phoenix
                    </span>

                    <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.1] tracking-tight mb-8">
                        Get more customers.<br />
                        Rank on Google.<br />
                        Grow.
                    </h1>

                    <p className="font-sans text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-12">
                        Professional website design for solar installation companies. Built to convert visitors into customers.
                    </p>

                    {/* Trust Bullets */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center mb-12 text-white/60 font-mono text-xs uppercase tracking-widest">
                        <span>Free 24-hour preview</span>
                        <span className="hidden sm:inline">•</span>
                        <span>No payment until you approve</span>
                        <span className="hidden sm:inline">•</span>
                        <span>Launch in 1 week</span>
                    </div>

                    {/* Box CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/express-launch"
                            className="inline-flex items-center justify-center bg-white text-black px-8 py-4 font-sans text-sm font-medium hover:rounded-[50px] transition-all duration-700 ease-in-out"
                        >
                            Get free preview
                        </Link>
                        <a
                            href="https://wa.me/12345678900?text=Hi, I need a website for my solar company in Phoenix"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-4 font-sans text-sm font-medium hover:bg-white/20 hover:rounded-[50px] transition-all duration-700 ease-in-out"
                        >
                            <MessageCircle className="w-4 h-4" />
                            WhatsApp us
                        </a>
                    </div>
                </div>
            </section>

            {/* SECTION 2: Social Proof Bar */}
            <section className="relative z-10 border-t border-white/10 py-12 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left text-white">
                    <div>
                        <p className="font-display text-3xl mb-1">50+</p>
                        <p className="font-mono text-xs uppercase tracking-widest text-white/40">Solar websites built</p>
                    </div>
                    <div>
                        <p className="font-display text-3xl mb-1">4.9/5</p>
                        <p className="font-mono text-xs uppercase tracking-widest text-white/40">Client rating</p>
                    </div>
                    <div>
                        <p className="font-display text-3xl mb-1">100%</p>
                        <p className="font-mono text-xs uppercase tracking-widest text-white/40">Money-back guarantee</p>
                    </div>
                </div>
            </section>

            {/* SECTION 3: Problem Statement (Character Animation) */}
            <div className="relative z-20 bg-white">
                <section
                    ref={statementRef}
                    className="py-32 px-6 md:px-12 flex items-center justify-center"
                >
                    <div className="max-w-4xl mx-auto">
                        <p className="font-sans text-2xl md:text-3xl lg:text-4xl leading-relaxed text-center">
                            {statementText.split(" ").map((word, i) => (
                                <span key={i} className="inline-block whitespace-nowrap">
                                    {word.split("").map((char, j) => (
                                        <span key={j} className="char transition-colors">{char}</span>
                                    ))}
                                    <span className="inline-block">&nbsp;</span>
                                </span>
                            ))}
                        </p>
                    </div>
                </section>
            </div>

            {/* SECTION 4: Features (ServicesShowcase Style) */}
            <div className="relative z-20 bg-white">
                <section className="py-24 px-6 md:px-12">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                            <div>
                                <p className="text-black/40 text-xs font-mono uppercase tracking-widest mb-4">What's included</p>
                                <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-black leading-tight">
                                    Everything you need<br />to get more solar customers
                                </h2>
                            </div>
                            <Link to="/express-launch" className="hidden md:inline-flex items-center justify-center bg-black text-white px-6 py-3 font-sans text-sm font-medium hover:rounded-[50px] transition-all duration-700 ease-in-out">
                                Get started
                            </Link>
                        </div>

                        <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
                            {features.map((feature, i) => (
                                <Link
                                    to="/express-launch"
                                    key={i}
                                    className="service-item py-8 border-t border-black/10 group cursor-pointer hover:border-black transition-colors block"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-black/30 font-mono text-xs">{feature.number}</span>
                                        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                    </div>
                                    <h3 className="font-display text-2xl font-bold text-black mb-2">{feature.title}</h3>
                                    <p className="text-black/50 text-sm">{feature.desc}</p>
                                </Link>
                            ))}
                        </div>

                        <div className="mt-8 md:hidden">
                            <Link to="/express-launch" className="inline-flex items-center justify-center bg-black text-white px-6 py-3 font-sans text-sm font-medium hover:rounded-[50px] transition-all duration-700 ease-in-out">
                                Get started
                            </Link>
                        </div>
                    </div>
                </section>
            </div>

            {/* SECTION 5: Express Launch */}
            <section className="relative z-10 py-32 px-6 md:px-12">
                <div className="max-w-4xl mx-auto text-center text-white">
                    <span className="font-mono text-white/40 uppercase tracking-widest text-sm mb-8 block">
                        Express Launch
                    </span>

                    <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-12">
                        See your website<br />
                        in 24 hours.
                    </h2>

                    <p className="font-sans text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-16">
                        Fill out a simple form. We build a custom preview. You review it for free. Pay only if you love it. Launch within a week.
                    </p>

                    {/* Box CTA */}
                    <Link
                        to="/express-launch"
                        className="inline-flex items-center justify-center bg-white text-black px-10 py-5 font-sans text-sm font-medium hover:rounded-[50px] transition-all duration-700 ease-in-out"
                    >
                        Get free preview
                    </Link>

                    <p className="mt-8 font-mono text-xs uppercase tracking-widest text-white/30">
                        No credit card • No obligation • No risk
                    </p>
                </div>
            </section>

            {/* SECTION 6: Portfolio */}
            <div className="relative z-20 bg-white">
                <section className="py-24 px-6 md:px-12">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-16">
                            <p className="text-black/40 text-xs font-mono uppercase tracking-widest mb-4">Our work</p>
                            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-black">
                                Solar websites we've built
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {portfolioItems.map((item, i) => (
                                <div key={i} className="group">
                                    <div className="bg-gray-100 aspect-[4/3] mb-6 overflow-hidden">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                                        />
                                    </div>
                                    <p className="font-display text-xl font-bold text-black mb-1">{item.name}</p>
                                    <p className="font-mono text-xs uppercase tracking-widest text-black/40">
                                        {item.result}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            {/* SECTION 7: SEO Content with Character Animation - Visual Layout */}
            <div className="relative z-20 bg-white">
                <section className="py-32 px-6 md:px-12">
                    <div className="max-w-5xl mx-auto">

                        {/* Header */}
                        <div className="mb-20">
                            <p className="text-black/40 text-xs font-mono uppercase tracking-widest mb-4">The Phoenix Solar Market</p>
                            <h2 className="font-display text-3xl md:text-4xl font-medium text-black leading-tight">
                                Why Your Solar Company<br />Needs a Website
                            </h2>
                        </div>

                        {/* Content Blocks */}
                        <div className="space-y-20">

                            {/* Block 1 - The Problem */}
                            <div className="grid md:grid-cols-12 gap-8 items-start">
                                <div className="md:col-span-2">
                                    <span className="font-display text-6xl md:text-8xl font-bold text-black/10">01</span>
                                </div>
                                <div className="md:col-span-10">
                                    <p className="seo-text font-display text-xl md:text-2xl lg:text-3xl leading-relaxed tracking-tight">
                                        {`Phoenix is one of the fastest-growing solar markets in the United States. With over 300 sunny days per year, 93% of Arizona homeowners start their solar buying journey with a Google search. Without a professional website, your solar company is invisible to these customers.`.split('').map((char, i) => (
                                            <span key={`p1-${i}`} className="seo-char" style={{ color: 'rgba(0,0,0,0.15)' }}>
                                                {char}
                                            </span>
                                        ))}
                                    </p>
                                </div>
                            </div>

                            {/* Block 2 - The Issue */}
                            <div className="grid md:grid-cols-12 gap-8 items-start">
                                <div className="md:col-span-2">
                                    <span className="font-display text-6xl md:text-8xl font-bold text-black/10">02</span>
                                </div>
                                <div className="md:col-span-10">
                                    <p className="seo-text font-display text-xl md:text-2xl lg:text-3xl leading-relaxed tracking-tight">
                                        {`Most solar companies in Phoenix either don't have a website, or have outdated designs that don't convert. A modern solar company website should load fast, look professional on mobile, and be optimized for local SEO to appear in searches like "solar installation Phoenix" or "best solar company in Arizona."`.split('').map((char, i) => (
                                            <span key={`p2-${i}`} className="seo-char" style={{ color: 'rgba(0,0,0,0.15)' }}>
                                                {char}
                                            </span>
                                        ))}
                                    </p>
                                </div>
                            </div>

                            {/* Block 3 - The Solution */}
                            <div className="grid md:grid-cols-12 gap-8 items-start">
                                <div className="md:col-span-2">
                                    <span className="font-display text-6xl md:text-8xl font-bold text-black/10">03</span>
                                </div>
                                <div className="md:col-span-10">
                                    <p className="seo-text font-display text-xl md:text-2xl lg:text-3xl leading-relaxed tracking-tight">
                                        {`Traditional agencies charge $3,000 to $10,000 with 6-8 week timelines. We deliver premium solar websites for $499 in one week. Free 24-hour preview before you pay. 50+ websites built across Phoenix, Mesa, Scottsdale, Tempe, and Gilbert.`.split('').map((char, i) => (
                                            <span key={`p3-${i}`} className="seo-char" style={{ color: 'rgba(0,0,0,0.15)' }}>
                                                {char}
                                            </span>
                                        ))}
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>
            </div>

            {/* SECTION 8: Pricing */}
            <section className="relative z-10 py-32 px-6 md:px-12">
                <div className="max-w-4xl mx-auto text-white">
                    <div className="text-center mb-16">
                        <p className="font-mono text-white/40 uppercase tracking-widest text-sm mb-4">Pricing</p>
                        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold">
                            Simple. Transparent.
                        </h2>
                    </div>

                    <div className="bg-white border border-black/10 p-12 md:p-16 max-w-md mx-auto">
                        <p className="font-display text-6xl md:text-7xl mb-4 text-black">$799</p>
                        <p className="font-mono text-xs uppercase tracking-widest text-black/40 mb-12">
                            One-time payment
                        </p>

                        <div className="space-y-4 mb-12 text-black/70">
                            <p className="font-sans">Custom design for solar industry</p>
                            <p className="font-sans">Mobile-optimized for all devices</p>
                            <p className="font-sans">SEO-ready to rank on Google</p>
                            <p className="font-sans">Lead capture forms included</p>
                            <p className="font-sans">1-week delivery guaranteed</p>
                            <p className="font-sans text-black font-medium">Free 24-hour preview first</p>
                        </div>

                        {/* Box CTA */}
                        <Link
                            to="/express-launch"
                            className="block w-full text-center bg-black text-white py-5 font-sans text-sm font-medium hover:rounded-[50px] transition-all duration-700 ease-in-out"
                        >
                            Get started
                        </Link>
                    </div>
                </div>
            </section>

            {/* SECTION 8: Trust Builders - Horizontal Scroll */}
            <div ref={trustSectionRef} className="relative z-20 h-[400vh]">
                <div className="sticky top-0 h-screen bg-white overflow-hidden flex items-center">
                    <div ref={trustTrackRef} className="flex gap-20 px-20">
                        {/* First item - Header */}
                        <div className="w-[80vw] md:w-[50vw] flex flex-col justify-center flex-shrink-0 border-l border-black/20 pl-12">
                            <p className="text-black/40 text-xs font-mono uppercase tracking-widest mb-4">Why choose us</p>
                            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight">
                                Why solar companies<br />trust AgencyStarter
                            </h2>
                        </div>

                        {/* Trust Points */}
                        {trustPoints.map((point, i) => (
                            <div key={i} className="w-[80vw] md:w-[40vw] flex flex-col justify-center flex-shrink-0 border-l border-black/20 pl-12">
                                <img
                                    src={point.image}
                                    alt={point.text}
                                    className="w-40 h-40 md:w-48 md:h-48 object-contain mb-6"
                                />
                                <span className="font-mono text-black/40 text-xl mb-4">0{i + 1}</span>
                                <p className="font-display text-3xl md:text-4xl font-bold text-black leading-tight max-w-md">
                                    {point.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* SECTION 9: FAQ (Accordion) - Black Background */}
            <div className="relative z-20 bg-black">
                <section className="py-24 px-6 md:px-12">
                    <div className="max-w-3xl mx-auto">
                        <div className="mb-12">
                            <p className="text-white/40 text-xs font-mono uppercase tracking-widest mb-4">Questions</p>
                            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-medium text-white">
                                Common questions answered
                            </h2>
                        </div>

                        <div>
                            {faqs.map((faq, i) => (
                                <FAQItem
                                    key={i}
                                    question={faq.question}
                                    answer={faq.answer}
                                    isOpen={activeFaq === i}
                                    onToggle={() => setActiveFaq(activeFaq === i ? null : i)}
                                />
                            ))}
                            <div className="border-t border-white/20" />
                        </div>
                    </div>
                </section>
            </div>

            {/* SECTION 10: Final CTA (Homepage Style with Interactive Grid) */}
            <div className="relative z-20 bg-white border-t border-black">
                <section ref={ctaRef} className="py-32 px-6 md:px-12 relative overflow-hidden group">

                    {/* Base Grid */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-[0.03]"
                        style={{
                            backgroundImage: `
                linear-gradient(#000 1px, transparent 1px),
                linear-gradient(90deg, #000 1px, transparent 1px)
              `,
                            backgroundSize: '32px 32px'
                        }}
                    />

                    {/* Interactive Grid */}
                    <div
                        className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                        style={{
                            backgroundImage: `
                linear-gradient(#000 1px, transparent 1px),
                linear-gradient(90deg, #000 1px, transparent 1px)
              `,
                            backgroundSize: '32px 32px',
                            backgroundColor: 'transparent',
                            maskImage: `radial-gradient(300px circle at ${ctaMousePos.x}px ${ctaMousePos.y}px, black 0%, transparent 100%)`,
                            WebkitMaskImage: `radial-gradient(300px circle at ${ctaMousePos.x}px ${ctaMousePos.y}px, black 0%, transparent 100%)`,
                        }}
                    >
                        <div className="absolute inset-0 opacity-[0.15]"
                            style={{
                                backgroundImage: `
                  linear-gradient(#000 1px, transparent 1px),
                  linear-gradient(90deg, #000 1px, transparent 1px)
                `,
                                backgroundSize: '32px 32px'
                            }}
                        />
                    </div>

                    <div className="max-w-3xl mx-auto text-center relative z-10">
                        <div
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] pointer-events-none -z-10"
                            style={{
                                background: 'radial-gradient(circle, #ffffff 30%, rgba(255,255,255,0) 70%)'
                            }}
                        />

                        <h2 className="fade-up font-display text-3xl md:text-4xl lg:text-5xl font-medium text-black mb-8 leading-tight">
                            Ready to get <span className="text-black/40">more customers?</span>
                        </h2>

                        <div className="fade-up flex flex-col items-center gap-6">
                            <p className="text-black/50 text-base md:text-lg max-w-lg leading-relaxed">
                                Get your free website preview in 24 hours. No payment. No risk.
                            </p>

                            {/* Box CTAs */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    to="/express-launch"
                                    className="inline-flex items-center justify-center bg-black text-white px-8 py-4 font-sans text-sm font-medium hover:rounded-[50px] transition-all duration-700 ease-in-out"
                                >
                                    Get free preview
                                </Link>
                                <a
                                    href="https://wa.me/12345678900?text=Hi, I need a website for my solar company in Phoenix"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 bg-black/10 text-black px-8 py-4 font-sans text-sm font-medium hover:bg-black/20 hover:rounded-[50px] transition-all duration-700 ease-in-out"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    WhatsApp us
                                </a>
                            </div>
                        </div>

                        <p className="mt-12 font-mono text-xs uppercase tracking-widest text-black/30">
                            Serving Phoenix, Scottsdale, Mesa, Tempe, Chandler & surrounding areas
                        </p>
                    </div>
                </section>
            </div>

        </div>
    );
};

export default SolarCompaniesPhoenixPage;
