import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const steps = [
    {
        number: "01",
        title: "Discovery",
        desc: "We start by understanding your business, goals, and target audience. This foundation shapes everything that follows."
    },
    {
        number: "02",
        title: "Design",
        desc: "Custom mockups tailored to your brand. You review and approve every design before we write a single line of code."
    },
    {
        number: "03",
        title: "Build",
        desc: "Clean, efficient code. Fast performance. SEO-ready structure. We build websites that work as good as they look."
    },
    {
        number: "04",
        title: "Launch",
        desc: "Final testing across all devices, performance optimization, and deployment. Your website goes live."
    }
];

const ProcessSection: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    useGSAP(() => {
        const items = containerRef.current?.querySelectorAll('.process-item');

        items?.forEach((item, i) => {
            // Logic for sticky number update
            ScrollTrigger.create({
                trigger: item,
                start: "top center",
                end: "bottom center",
                onEnter: () => setActiveIndex(i),
                onEnterBack: () => setActiveIndex(i),
            });

            // Logic for text reveal animation
            const chars = item.querySelectorAll('.char');
            if (chars.length) {
                gsap.fromTo(chars,
                    { color: "rgba(255, 255, 255, 0.2)" },
                    {
                        color: "rgba(255, 255, 255, 1)",
                        stagger: 0.05,
                        ease: "none",
                        scrollTrigger: {
                            trigger: item,
                            start: "top 80%",
                            end: "center center",
                            scrub: true,
                        }
                    }
                );
            }
        });
    }, { scope: containerRef });

    return (
        <section className="text-white relative z-10 bg-black">

            {/* Header */}
            <div className="py-24 px-6 md:px-12 border-b border-white/10">
                <div className="max-w-5xl mx-auto">
                    <p className="text-white/40 text-sm mb-4">Process</p>
                    <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold">
                        How we work
                    </h2>
                </div>
            </div>

            {/* Steps - Sticky Layout */}
            <div className="flex flex-col lg:flex-row relative">

                {/* Sticky Indicator (Mobile: Top, Desktop: Left) */}
                <div className="sticky top-[80px] z-20 w-full lg:w-1/2 h-[150px] lg:h-screen bg-black/80 backdrop-blur-md lg:bg-transparent border-b lg:border-b-0 lg:border-r border-white/10 flex items-center justify-center transition-all duration-300">
                    <div className="text-center">
                        <span className="font-display text-6xl md:text-8xl lg:text-[15vw] font-bold text-white/5 leading-none transition-all duration-300 block">
                            {steps[activeIndex].number}
                        </span>
                        <h3 className="font-display text-2xl md:text-3xl lg:text-5xl font-bold -mt-4 lg:-mt-16 transition-all duration-300">
                            {steps[activeIndex].title}
                        </h3>
                    </div>
                </div>

                {/* Scrolling Content */}
                <div ref={containerRef} className="w-full lg:w-1/2">
                    {steps.map((step, i) => (
                        <div
                            key={i}
                            className="process-item min-h-[50vh] lg:min-h-screen flex items-center px-6 md:px-12 lg:px-20 py-20 border-b border-white/10 last:border-b-0"
                        >
                            <div className="max-w-md">
                                {/* Mobile: Hidden static title since we have sticky header now */}

                                <p className="font-sans text-lg md:text-xl leading-relaxed">
                                    {step.desc.split(" ").map((word, k) => (
                                        <span key={k} className="inline-block whitespace-nowrap">
                                            {word.split("").map((char, j) => (
                                                <span key={j} className="char">{char}</span>
                                            ))}
                                            <span className="inline-block">&nbsp;</span>
                                        </span>
                                    ))}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProcessSection;
