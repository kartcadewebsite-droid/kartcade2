import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const HeroSection: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline({ delay: 0.2 });

        tl.fromTo(contentRef.current,
            { opacity: 0, y: 60 },
            { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }
        );

    }, { scope: containerRef });

    return (
        <section
            ref={containerRef}
            className="min-h-screen flex items-center justify-center px-6 md:px-12 pt-24 relative overflow-hidden"
        >
            {/* Content */}
            <div ref={contentRef} className="max-w-5xl mx-auto text-center relative z-10">

                {/* Main Title */}
                <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.1] tracking-tight mb-8">
                    We build websites<br />
                    that grow businesses
                </h1>

                {/* Subtitle */}
                <p className="font-sans text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-12">
                    Clean design. Fast performance. Real results.
                </p>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/contact"
                        className="inline-flex items-center justify-center bg-white text-black px-8 py-4 rounded-none font-sans text-sm font-medium hover:rounded-[50px] transition-all duration-700 ease-in-out"
                    >
                        Start a project
                    </Link>
                    <Link
                        to="/projects"
                        className="inline-flex items-center justify-center text-white/60 px-8 py-4 font-sans text-sm font-medium hover:text-white transition-colors"
                    >
                        View our work →
                    </Link>
                </div>

                <div className="mt-8 flex justify-center">
                    <Link
                        to="/express-launch"
                        className="inline-flex items-center gap-2 text-cyan-400/80 hover:text-cyan-400 transition-colors font-mono text-xs uppercase tracking-widest"
                    >
                        ⚡ Need a site next week? Check Express Launch
                    </Link>
                </div>
            </div>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
        </section>
    );
};

export default HeroSection;
