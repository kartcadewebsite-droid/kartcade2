import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Gamepad2, Users, Trophy, ArrowRight, Phone } from 'lucide-react';
import siteConfig from '../config/site';

gsap.registerPlugin(ScrollTrigger);

const About: React.FC = () => {
    useEffect(() => {
        document.title = "About Us | Kartcade Racing Simulator Lounge";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', 'Learn about Kartcade - Oregon\'s premier racing simulator lounge in West Linn. Our story, mission, and what makes us different from other sim racing centers.');
        }
        return () => {
            document.title = "Kartcade | Racing & Flight Simulator Lounge";
        };
    }, []);

    const timelineRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.fromTo(".about-hero-text",
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: "power3.out", delay: 0.2 }
        );

        const getScrollAmount = () => {
            if (!trackRef.current) return 0;
            return trackRef.current.scrollWidth - window.innerWidth;
        };

        gsap.to(trackRef.current, {
            x: () => -getScrollAmount(),
            ease: "none",
            scrollTrigger: {
                trigger: timelineRef.current,
                start: "top top",
                end: () => `+=${getScrollAmount()}`,
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true,
            }
        });

    }, { scope: timelineRef });

    return (
        <div className="bg-[#0A0A0A] min-h-screen text-white">

            {/* Hero - Full Image Background */}
            <section ref={heroRef} className="relative h-[80vh] min-h-[600px] flex items-end overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img
                        src="/images/kartcade/hero.png"
                        alt="Kartcade Racing Lounge"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/90 via-[#0A0A0A]/40 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 pb-20 w-full">
                    <p className="about-hero-text text-[#2D9E49] text-sm font-medium tracking-[0.2em] uppercase mb-4">
                        Our Story
                    </p>
                    <h1 className="about-hero-text text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
                        More Than<br />
                        <span className="text-[#D42428]">Sim Racing</span>
                    </h1>
                    <p className="about-hero-text text-lg md:text-xl text-white/70 max-w-md leading-relaxed">
                        Oregon's first racing simulator lounge. From ultra-realistic sim racing
                        to arcade destruction derbies—we celebrate ALL types of driving games.
                    </p>
                </div>
            </section>

            {/* Horizontal Timeline */}
            <section ref={timelineRef} className="h-screen bg-[#0A0A0A] text-white overflow-hidden flex items-center">
                <div ref={trackRef} className="flex gap-8 md:gap-20 px-6 md:px-20">
                    {[
                        {
                            year: 'Why',
                            title: 'We Exist',
                            desc: 'Most sim racing centers focus exclusively on realistic simulation. We believe there\'s room for everyone—from kids wanting arcade fun to pros training for real races.'
                        },
                        {
                            year: '10',
                            title: 'Simulators',
                            desc: '5 racing karts for younger drivers, 4 professional full-size rigs, 1 triple-screen motion simulator, and 1 flight sim. Everyone races at the same time!'
                        },
                        {
                            year: '40+',
                            title: 'Games',
                            desc: 'Le Mans Ultimate, Dirt Rally, Grid Legends, Wreckfest, BeamNG, American Truck Simulator, Star Wars Squadrons, and many more.'
                        },
                        {
                            year: 'All',
                            title: 'Skill Levels',
                            desc: 'From first-timers to competitive sim racers, we welcome everyone. Our staff will help you find the perfect game for your ability.'
                        },
                        {
                            year: 'West',
                            title: 'Linn, Oregon',
                            desc: 'Located in West Linn, we\'re proud to serve the Portland metro area. Visit us for birthday parties, corporate events, or just a casual session.'
                        },
                    ].map((item, i) => (
                        <div key={i} className="w-[85vw] md:w-[40vw] flex flex-col justify-center flex-shrink-0 border-l-2 border-[#2D9E49]/30 pl-6 md:pl-12 relative">
                            <span className="text-6xl md:text-[8rem] lg:text-[12rem] font-bold text-white/5 leading-none absolute -translate-y-12 md:-translate-y-20 -translate-x-4 md:-translate-x-10 -z-10">{item.year}</span>
                            <span className="font-mono text-[#2D9E49] text-lg md:text-xl mb-3 md:mb-4">{item.year}</span>
                            <h3 className="text-3xl md:text-5xl font-bold uppercase mb-4 md:mb-6">{item.title}</h3>
                            <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-md">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Values Grid */}
            <section className="py-32 px-6 md:px-12 bg-[#0A0A0A]">
                <div className="container mx-auto max-w-6xl">
                    <div className="mb-16">
                        <span className="text-[#2D9E49] text-sm font-medium tracking-[0.2em] uppercase">What We Believe</span>
                        <h2 className="text-4xl md:text-5xl font-bold mt-2">Our Values</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                        <div className="p-8 lg:p-12 bg-[#141414] border border-white/10 rounded-2xl group hover:border-[#2D9E49]/50 transition-colors duration-500">
                            <Gamepad2 className="w-12 h-12 text-[#2D9E49] mb-8" />
                            <h3 className="text-2xl font-bold mb-4">Variety First</h3>
                            <p className="text-white/60">
                                We're not just sim racing. We embrace arcade racers, destruction derbies, truck simulators, drifting, and flight games.
                            </p>
                        </div>
                        <div className="p-8 lg:p-12 bg-[#141414] border border-white/10 rounded-2xl group hover:border-[#D42428]/50 transition-colors duration-500">
                            <Users className="w-12 h-12 text-[#D42428] mb-8" />
                            <h3 className="text-2xl font-bold mb-4">Race Together</h3>
                            <p className="text-white/60">
                                Everyone in your group races simultaneously—no taking turns. With 10 simulators, we can host up to 10 drivers at once.
                            </p>
                        </div>
                        <div className="p-8 lg:p-12 bg-[#141414] border border-white/10 rounded-2xl group hover:border-[#2D9E49]/50 transition-colors duration-500">
                            <Trophy className="w-12 h-12 text-[#2D9E49] mb-8" />
                            <h3 className="text-2xl font-bold mb-4">All Skill Levels</h3>
                            <p className="text-white/60">
                                From first-timers to competitive sim racers, we welcome everyone. Our staff will help you find the perfect game.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 md:px-12 bg-[#141414]">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Come Visit <span className="text-[#D42428]">Us</span>
                    </h2>
                    <p className="text-white/60 text-xl mb-12">
                        Experience why we're Oregon's premier racing simulator lounge.
                    </p>

                    <div className="flex flex-col md:flex-row gap-6 justify-center">
                        <Link
                            to="/book"
                            className="flex items-center justify-center gap-3 px-12 py-5 bg-[#D42428] text-white rounded-full font-bold uppercase tracking-widest hover:bg-[#B91C1C] transition-colors"
                        >
                            Book Now <ArrowRight className="w-5 h-5" />
                        </Link>
                        <a
                            href={`tel:${siteConfig.phone}`}
                            className="flex items-center justify-center gap-3 px-12 py-5 border border-white/20 text-white rounded-full font-bold uppercase tracking-widest hover:bg-white/5 transition-colors"
                        >
                            <Phone className="w-5 h-5" /> {siteConfig.phone}
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;