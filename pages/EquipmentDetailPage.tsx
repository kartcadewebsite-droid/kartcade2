import React, { useState, useRef, useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import equipmentData from '../config/equipment';
import type { EquipmentItem } from '../config/equipment';

gsap.registerPlugin(ScrollTrigger);

// ─── Accordion Item (mobile specs) ───────────────────────────────────────────
const AccordionItem: React.FC<{
    heading: string;
    subheading: string;
    children: React.ReactNode;
}> = ({ heading, subheading, children }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-white/10 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-5 py-4 text-left bg-[#141414] hover:bg-[#1a1a1a] transition-colors"
            >
                <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{heading}</div>
                    <div className="text-sm font-semibold text-white mt-0.5">{subheading}</div>
                </div>
                {open ? <ChevronUp className="w-4 h-4 text-white/40 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-white/40 flex-shrink-0" />}
            </button>
            {open && (
                <div className="px-5 py-4 bg-[#111111] space-y-3">{children}</div>
            )}
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const EquipmentDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const item: EquipmentItem | undefined = equipmentData.find(e => e.id === id);

    const containerRef = useRef<HTMLDivElement>(null);
    const [activeVariant, setActiveVariant] = useState(0);

    useEffect(() => {
        window.scrollTo(0, 0);
        setActiveVariant(0);
    }, [id]);

    useEffect(() => {
        if (item) {
            document.title = `${item.title} | Kartcade`;
        }
    }, [item]);

    useGSAP(() => {
        gsap.fromTo('.detail-hero-text',
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9, stagger: 0.09, ease: 'power3.out', delay: 0.15 }
        );

        gsap.fromTo('.spec-card',
            { y: 40, opacity: 0 },
            {
                y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out',
                scrollTrigger: { trigger: '.spec-section', start: 'top 80%' }
            }
        );

        gsap.fromTo('.feature-badge',
            { scale: 0.85, opacity: 0 },
            {
                scale: 1, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(1.5)',
                scrollTrigger: { trigger: '.features-section', start: 'top 85%' }
            }
        );

        gsap.fromTo('.gallery-cell',
            { opacity: 0, scale: 0.97 },
            {
                opacity: 1, scale: 1, duration: 0.5, stagger: 0.07, ease: 'power2.out',
                scrollTrigger: { trigger: '.gallery-section', start: 'top 80%' }
            }
        );
    }, { scope: containerRef, dependencies: [id] });

    if (!item) return <Navigate to="/equipment" replace />;

    const variant = item.variants[activeVariant];
    const galleryImages = variant.galleryImages ?? item.galleryImages;

    return (
        <div ref={containerRef} className="bg-[#0A0A0A] text-white min-h-screen">

            {/* ── 1. HERO ──────────────────────────────────────────────────────── */}
            <section className="relative h-[40vh] md:h-[60vh] max-h-[700px] flex items-end overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={item.heroImage}
                        alt={item.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/55 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/85 to-transparent" />
                </div>

                <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 pb-12 w-full">
                    {/* Breadcrumb */}
                    <Link
                        to="/equipment"
                        className="detail-hero-text inline-flex items-center gap-2 text-white/40 text-xs uppercase tracking-widest hover:text-white/70 transition-colors mb-5"
                    >
                        ← Equipment
                    </Link>
                    <p className="detail-hero-text text-[#2D9E49] text-sm font-medium tracking-[0.2em] uppercase mb-3">
                        {item.subtitle}
                    </p>
                    <h1 className="detail-hero-text text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
                        {item.title}
                    </h1>
                </div>
            </section>

            {/* ── 1.5. EXPERIENCE DESCRIPTION ──────────────────────────────────── */}
            <section className="py-16 px-6 md:px-12 border-b border-white/5">
                <div className="max-w-6xl mx-auto">
                    <p className="text-xl md:text-2xl text-white/70 leading-relaxed max-w-3xl font-light">
                        {item.description}
                    </p>
                </div>
            </section>

            {/* ── 2. VARIATION TABS (conditional) ──────────────────────────────── */}
            {item.variants.length > 1 && (
                <section className="py-8 px-6 md:px-12 border-b border-white/5 bg-[#0D0D0D]">
                    <div className="max-w-6xl mx-auto">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/30 mb-4">Choose a build</p>
                        <div className="flex flex-wrap gap-3">
                            {item.variants.map((v, i) => (
                                <button
                                    key={v.id}
                                    onClick={() => setActiveVariant(i)}
                                    className={`px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-200 ${activeVariant === i
                                        ? 'bg-[#D42428] text-white'
                                        : 'border border-white/20 text-white/60 hover:border-white/50 hover:text-white'
                                        }`}
                                >
                                    {v.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── 3. KEY FEATURES CALLOUT ──────────────────────────────────────── */}
            <section className="features-section py-12 px-6 md:px-12 border-b border-white/5">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-wrap gap-4">
                        {variant.keyFeatures.map((f, i) => (
                            <div
                                key={i}
                                className="feature-badge flex items-center gap-4 px-6 py-5 bg-[#141414] border border-white/10 rounded-2xl flex-1 min-w-[180px]"
                            >
                                <div>
                                    <div className="text-2xl md:text-3xl font-bold text-white">{f.stat}</div>
                                    <div className="text-xs uppercase tracking-[0.15em] text-white/40 mt-1">{f.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 4. SPEC CARDS ─────────────────────────────────────────────── */}
            <section className="spec-section py-20 px-6 md:px-12">
                <div className="max-w-6xl mx-auto">

                    <div className="flex items-center gap-4 mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">Technical Specs</h2>
                        <div className="h-px flex-1 bg-white/8" />
                        <span className="font-mono text-[10px] text-white/20 tracking-[0.25em] uppercase">{variant.label || item.title}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {variant.specGroups.map((group, gi) => (
                            <div
                                key={gi}
                                className="spec-card relative bg-[#111111] border border-white/10 rounded-2xl overflow-hidden"
                                style={{ borderTop: `2px solid ${gi % 2 === 0 ? '#D42428' : '#2D9E49'}` }}
                            >
                                {/* Ghost index number */}
                                <span className="absolute top-3 right-4 font-mono text-[64px] font-bold leading-none text-white/[0.04] select-none pointer-events-none">
                                    {String(gi + 1).padStart(2, '0')}
                                </span>

                                {/* Card header */}
                                <div className="px-6 pt-6 pb-4">
                                    <span
                                        className="inline-block text-[9px] font-bold uppercase tracking-[0.25em] px-2.5 py-1 rounded mb-3"
                                        style={{
                                            backgroundColor: gi % 2 === 0 ? 'rgba(212,36,40,0.12)' : 'rgba(45,158,73,0.12)',
                                            color: gi % 2 === 0 ? '#D42428' : '#2D9E49',
                                        }}
                                    >
                                        {group.heading}
                                    </span>
                                    <div className="text-base font-bold text-white">{group.subheading}</div>
                                </div>

                                {/* Divider */}
                                <div className="mx-6 h-px bg-white/8" />

                                {/* Spec rows */}
                                <div className="px-6 py-4 space-y-0">
                                    {group.items.map((specItem, si) => (
                                        <div key={si} className="flex items-start justify-between gap-4 py-3 border-b border-white/5 last:border-0">
                                            <span className="text-xs uppercase tracking-widest text-white/35 shrink-0 pt-px">{specItem.label}</span>
                                            <span className="text-sm font-medium text-white/90 text-right leading-snug">{specItem.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </section>

            {/* ── 5. PHOTO BENTO GALLERY ───────────────────────────────────────── */}
            <section className="gallery-section py-20 px-6 md:px-12 border-t border-white/5">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <h2 className="text-2xl font-bold uppercase tracking-tight">Gallery</h2>
                        <div className="h-px flex-1 bg-white/5" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 auto-rows-[200px] md:auto-rows-[240px]">
                        {/* Large cell — spans 2 rows on the left */}
                        <div className="gallery-cell col-span-1 row-span-2 overflow-hidden rounded-2xl border border-white/10 group">
                            <img
                                src={galleryImages[0]}
                                alt={`${item.title} overview`}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                        {/* 4 smaller tiles */}
                        {galleryImages.slice(1).map((src, i) => (
                            <div key={i} className="gallery-cell col-span-1 row-span-1 overflow-hidden rounded-2xl border border-white/10 group">
                                <img
                                    src={src}
                                    alt={`${item.title} detail ${i + 2}`}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 5.5. INTERCHANGEABLE WHEELS (conditional) ────────────────────── */}
            {item.hasInterchangeableWheels && item.wheelImages && item.wheelNames && (
                <section className="py-20 px-6 md:px-12 border-t border-white/5 bg-[#0D0D0D]">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-10">
                            <p className="text-[#2D9E49] text-xs font-medium tracking-[0.2em] uppercase mb-2">Mix & Match</p>
                            <h2 className="text-2xl font-bold uppercase tracking-tight">Interchangeable Wheels</h2>
                            <p className="text-white/50 mt-3 text-sm max-w-xl">
                                Swap wheels between sessions to match your style. All wheels are compatible across the pro rigs and Fanatec karts.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {item.wheelImages.map((src, i) => (
                                <div key={i} className="flex flex-col items-center gap-3 group">
                                    <div className="w-[140px] h-[140px] md:w-[160px] md:h-[160px] overflow-hidden rounded-2xl border border-white/10 group-hover:border-white/30 transition-colors">
                                        <img
                                            src={src}
                                            alt={item.wheelNames![i]}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <span className="text-xs text-white/50 text-center max-w-[140px] tracking-wide">{item.wheelNames![i]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── 6. PRICING + CTA ─────────────────────────────────────────────── */}
            <section className="py-24 px-6 md:px-12 bg-[#141414]">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Pricing */}
                    <div className="inline-flex items-baseline gap-2 mb-3">
                        <span className="text-5xl md:text-6xl font-bold text-white">${item.price}</span>
                        <span className="text-white/40 text-lg">{item.priceUnit}</span>
                    </div>
                    <p className="text-white/40 text-sm mb-10 tracking-wide">
                        Members save up to 50% with session credits
                    </p>

                    {/* CTA */}
                    <Link
                        to="/book"
                        className="inline-flex items-center gap-3 px-12 py-5 bg-[#D42428] text-white rounded-full font-bold uppercase tracking-widest hover:bg-[#B91C1C] transition-colors text-sm"
                    >
                        Check Availability <ArrowRight className="w-5 h-5" />
                    </Link>

                    <div className="mt-6">
                        <Link
                            to="/equipment"
                            className="text-white/30 text-sm hover:text-white/60 transition-colors tracking-wide"
                        >
                            ← Back to all equipment
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default EquipmentDetailPage;
