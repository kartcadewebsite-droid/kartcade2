import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const services = [
    { number: "01", title: "Website Design", desc: "Custom digital experiences" },
    { number: "02", title: "Branding", desc: "Identity & visual systems" },
    { number: "03", title: "SEO Growth", desc: "Rank higher & get found" },
    { number: "04", title: "Marketing", desc: "Campaigns that convert" }
];

const ServicesSection: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const items = containerRef.current?.querySelectorAll('.service-item');

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
    }, { scope: containerRef });

    return (
        <section className="bg-white py-24 px-6 md:px-12">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div>
                        <p className="text-black/40 text-xs font-mono uppercase tracking-widest mb-4">Services</p>
                        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-black leading-tight">
                            Everything you need<br />for a strong online presence
                        </h2>
                    </div>
                    <Link to="/services" className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-black/60 hover:text-black transition-colors">
                        View all services <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Minimal List */}
                <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
                    {services.map((service, i) => (
                        <div
                            key={i}
                            className="service-item py-8 border-t border-black/10 group cursor-pointer hover:border-black transition-colors"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-black/30 font-mono text-xs">0{i + 1}</span>
                                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                            </div>
                            <h3 className="font-display text-2xl font-bold text-black mb-2">{service.title}</h3>
                            <p className="text-black/50 text-sm">{service.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-8 md:hidden">
                    <Link to="/services" className="inline-flex items-center gap-2 text-sm font-medium text-black/60 hover:text-black transition-colors">
                        View all services <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default ServicesSection;
