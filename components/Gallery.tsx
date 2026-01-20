import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const images = [
    "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=2669&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=2670&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2574&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2670&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=2564&auto=format&fit=crop"
];

const Gallery: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const col1Ref = useRef<HTMLDivElement>(null);
    const col2Ref = useRef<HTMLDivElement>(null);
    const col3Ref = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const mm = gsap.matchMedia();

        mm.add("(min-width: 768px)", () => {
            gsap.to(col1Ref.current, {
                y: -100,
                ease: "none",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1,
                }
            });

            gsap.to(col2Ref.current, {
                y: -250,
                ease: "none",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1,
                }
            });

            gsap.to(col3Ref.current, {
                y: -50,
                ease: "none",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1,
                }
            });
        });

    }, { scope: containerRef });

    return (
        <section ref={containerRef} className="bg-white py-16 md:py-32 z-20 relative overflow-hidden">
            <div className="container mx-auto px-6 mb-20 text-center">
                <h2 className="font-display text-4xl md:text-6xl uppercase tracking-widest text-black">Selected Works</h2>
            </div>

            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 h-[150vh] overflow-hidden">
                {/* Column 1 */}
                <div ref={col1Ref} className="flex flex-col gap-8">
                    <div className="w-full h-[60vh] overflow-hidden group cursor-none" data-cursor="view">
                        <img src={images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Website Development" />
                    </div>
                    <div className="w-full h-[40vh] overflow-hidden group cursor-none" data-cursor="view">
                        <img src={images[1]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Brand Identity" />
                    </div>
                </div>

                {/* Column 2 */}
                <div ref={col2Ref} className="flex flex-col gap-8 pt-20">
                    <div className="w-full h-[50vh] overflow-hidden group cursor-none" data-cursor="view">
                        <img src={images[2]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Analytics Dashboard" />
                    </div>
                    <div className="w-full h-[70vh] overflow-hidden group cursor-none" data-cursor="view">
                        <img src={images[3]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Social Media" />
                    </div>
                </div>

                {/* Column 3 */}
                <div ref={col3Ref} className="flex flex-col gap-8">
                    <div className="w-full h-[70vh] overflow-hidden group cursor-none" data-cursor="view">
                        <img src={images[4]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Team Collaboration" />
                    </div>
                    <div className="w-full h-[50vh] overflow-hidden group cursor-none" data-cursor="view">
                        <img src={images[5]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Creative Design" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Gallery;