import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowRight } from 'lucide-react';

const FinalCTA: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useGSAP(() => {
        // Text Animation
        const elements = containerRef.current?.querySelectorAll('.fade-up');
        gsap.fromTo(elements!,
            { y: 30, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 75%",
                }
            }
        );

        // Mouse Move Listener
        const updateMousePosition = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            setMousePos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        };

        const section = containerRef.current;
        section?.addEventListener('mousemove', updateMousePosition);

        return () => {
            section?.removeEventListener('mousemove', updateMousePosition);
        };
    }, { scope: containerRef });

    return (
        <section ref={containerRef} className="py-32 px-6 md:px-12 relative overflow-hidden bg-white border-t border-black group">

            {/* 1. Base Subtle Grid Pattern (Static) */}
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

            {/* 2. Darker Grid Pattern Overlay (Static Position, Revealed by Mask) */}
            <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                style={{
                    backgroundImage: `
                        linear-gradient(#000 1px, transparent 1px),
                        linear-gradient(90deg, #000 1px, transparent 1px)
                    `,
                    backgroundSize: '32px 32px',
                    // The darker opacity
                    backgroundColor: 'transparent',
                    // Masking logic
                    maskImage: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
                    WebkitMaskImage: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
                }}
            >
                {/* 
                   We apply the grid within this masked container. 
                   Since this div is 'inset-0', its grid aligns perfectly with the base grid div above.
                   We just increase opacity here (e.g. 0.15 or 0.2) to make it look "darker". 
                */}
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
                {/* Text Halo/Glow to improve readability against grid */}
                <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] pointer-events-none -z-10"
                    style={{
                        background: 'radial-gradient(circle, #ffffff 30%, rgba(255,255,255,0) 70%)'
                    }}
                />

                <h2 className="fade-up font-display text-3xl md:text-4xl lg:text-5xl font-medium text-black mb-8 leading-tight">
                    Ready to build something <span className="text-black/40">remarkable?</span>
                </h2>

                <div className="fade-up flex flex-col items-center gap-6">
                    <p className="text-black/50 text-base md:text-lg max-w-lg leading-relaxed">
                        Let's collaborate to create a digital experience that sets you apart.
                    </p>

                    <Link
                        to="/contact"
                        className="group inline-flex items-center gap-2 text-black font-display uppercase tracking-widest text-xs font-bold border-b border-black pb-1 hover:opacity-60 transition-opacity"
                    >
                        Start Project <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FinalCTA;
