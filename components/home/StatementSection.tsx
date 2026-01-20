import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const StatementSection: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const chars = containerRef.current?.querySelectorAll('.char');
        if (!chars || chars.length === 0) return;

        gsap.fromTo(chars,
            { color: "rgba(255, 255, 255, 0.2)" },
            {
                color: "rgba(255, 255, 255, 1)",
                stagger: 0.1,
                ease: "none",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 70%",
                    end: "center center",
                    scrub: true,
                }
            }
        );
    }, { scope: containerRef });

    const text = "We're a small team focused on one thing: building websites that actually work for your business. No fluff, no gimmicks — just clean design that gets results.";

    return (
        <section
            ref={containerRef}
            className="py-40 px-6 md:px-12 min-h-[50vh] flex items-center justify-center relative z-10"
        >
            <div className="max-w-4xl mx-auto">
                <p className="font-sans text-2xl md:text-3xl lg:text-4xl leading-relaxed text-center">
                    {text.split(" ").map((word, i) => (
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
    );
};

export default StatementSection;
