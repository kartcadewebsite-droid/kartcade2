import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const projects = [
    {
        title: "Luxe Fashion",
        category: "E-Commerce",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
    },
    {
        title: "TechStart SaaS",
        category: "SaaS Platform",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
    },
    {
        title: "Urban Builders",
        category: "Business Website",
        image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80"
    },
    {
        title: "FinanceHub",
        category: "Fintech Platform",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
    }
];

const WorkSection: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const track = trackRef.current;
        const container = containerRef.current;
        if (!track || !container) return;

        // Create animation with dynamic end value calculation
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: container,
                start: "top top",
                end: () => "+=" + Math.max(track.scrollWidth - window.innerWidth, 2000),
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true,
                anticipatePin: 1
            }
        });

        tl.to(track, {
            x: () => -(track.scrollWidth - window.innerWidth),
            ease: "none"
        });

    }, { scope: containerRef, dependencies: [] });

    return (
        <section ref={containerRef} className="bg-white overflow-hidden">

            {/* Universal Layout (Mobile + Desktop) */}
            <div className="flex h-screen items-center">
                <div ref={trackRef} className="flex items-center gap-6 md:gap-8 pl-6 md:pl-12">

                    {/* Header Card */}
                    <div className="flex-shrink-0 w-[85vw] md:w-[400px] pr-6 md:pr-12">
                        <p className="text-black/40 text-sm mb-4">Selected Work</p>
                        <h2 className="font-display text-4xl lg:text-5xl font-bold text-black mb-6">
                            Recent projects
                        </h2>
                        <Link to="/projects" className="text-black/60 text-sm hover:text-black transition-colors">
                            View all →
                        </Link>
                    </div>

                    {/* Project Cards */}
                    {projects.map((project, i) => (
                        <Link
                            key={i}
                            to="/projects"
                            className="flex-shrink-0 w-[85vw] md:w-[500px] group"
                        >
                            <div className="aspect-[4/3] overflow-hidden bg-gray-100 mb-4">
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>
                            <h3 className="font-display text-xl text-black mb-1">{project.title}</h3>
                            <p className="text-black/40 text-sm">{project.category}</p>
                        </Link>
                    ))}

                    {/* Spacer */}
                    <div className="flex-shrink-0 w-6 md:w-12" />
                </div>
            </div>
        </section>
    );
};

export default WorkSection;
