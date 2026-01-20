import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowRight, Users, Gauge, Monitor, Plane } from 'lucide-react';

const equipment = [
    {
        id: "01",
        title: "Racing Karts",
        subtitle: "5 Units",
        icon: <Gauge className="w-12 h-12" />,
        image: "/images/kartcade/karts.png",
        description: "Our racing karts are designed for younger drivers and anyone under about 5'6\". These setups provide comfortable seating positions and adjusted controls, making them perfect for kids and teens who want the full racing experience.",
        specs: [
            { label: "Best For", value: "Kids ages 5+, teens, smaller adults" },
            { label: "Height", value: "4'0\" minimum" },
            { label: "Experience", value: "Beginner-friendly" },
            { label: "Controls", value: "Adjusted for smaller drivers" }
        ],
        color: "#2D9E49"
    },
    {
        id: "02",
        title: "Full-Size Racing Rigs",
        subtitle: "4 Units",
        icon: <Monitor className="w-12 h-12" />,
        image: "/images/kartcade/rigs.png",
        description: "These are our workhorses—professional-quality racing simulators with direct-drive force feedback wheels, load cell pedals, and comfortable racing seats. These rigs can handle everything from gentle cruising in American Truck Simulator to white-knuckle racing in Le Mans Ultimate.",
        specs: [
            { label: "Best For", value: "Adults, serious sim racers" },
            { label: "Height", value: "4'8\" minimum, up to 6'6\"" },
            { label: "Weight Limit", value: "~300 lbs for comfort" },
            { label: "Features", value: "Direct-drive wheels, load cell pedals" }
        ],
        color: "#FFFFFF"
    },
    {
        id: "03",
        title: "Triple-Screen Motion Simulator",
        subtitle: "1 Unit - Crown Jewel",
        icon: <Monitor className="w-12 h-12" />,
        image: "/images/kartcade/motion.png",
        description: "This is the crown jewel of Kartcade. Our motion simulator features three screens that wrap around you for incredible immersion, plus a motion platform that physically moves with the action. Feel every bump, drift, and collision as the simulator pitches, rolls, and vibrates beneath you.",
        specs: [
            { label: "Best For", value: "Ultimate experience, special occasions" },
            { label: "Age", value: "12+ recommended" },
            { label: "Features", value: "Triple screens, motion platform" },
            { label: "Note", value: "Not for motion-sensitive guests" }
        ],
        color: "#D42428"
    },
    {
        id: "04",
        title: "Flight Simulator",
        subtitle: "1 Unit",
        icon: <Plane className="w-12 h-12" />,
        image: "/images/kartcade/flight.png",
        description: "Not everything needs wheels! Our flight simulator lets you take to the skies with a full HOTAS (hands-on throttle and stick) setup. Perfect for a change of pace or anyone who loves aerial combat.",
        specs: [
            { label: "Featured Game", value: "Star Wars Squadrons" },
            { label: "Controls", value: "Full HOTAS setup" },
            { label: "Best For", value: "Flight fans, Star Wars lovers" },
            { label: "Experience", value: "All skill levels" }
        ],
        color: "#2D9E49"
    }
];

const EquipmentPage: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.fromTo(".equip-hero-text",
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: "power3.out", delay: 0.2 }
        );
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="bg-[#0A0A0A] text-white min-h-screen">
            {/* Hero Section - Full Image */}
            <section className="relative h-[70vh] min-h-[500px] flex items-end overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img
                        src="/images/kartcade/rigs.png"
                        alt="Kartcade Equipment"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/80 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 pb-16 w-full">
                    <p className="equip-hero-text text-[#2D9E49] text-sm font-medium tracking-[0.2em] uppercase mb-4">
                        State-of-the-Art
                    </p>
                    <h1 className="equip-hero-text text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
                        Our<br />
                        <span className="text-[#D42428]">Equipment</span>
                    </h1>
                    <p className="equip-hero-text text-lg md:text-xl text-white/70 max-w-md leading-relaxed mb-8">
                        10 simulators total. Something for everyone—from kids to pros.
                    </p>

                    {/* Stats */}
                    <div className="equip-hero-text flex gap-10">
                        <div>
                            <div className="text-3xl font-bold text-white">10</div>
                            <div className="text-xs uppercase tracking-[0.15em] text-white/50 mt-1">Simulators</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white">40+</div>
                            <div className="text-xs uppercase tracking-[0.15em] text-white/50 mt-1">Games</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-[#D42428]">1</div>
                            <div className="text-xs uppercase tracking-[0.15em] text-white/50 mt-1">Motion Sim</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Equipment List */}
            <section className="py-20 px-6 md:px-12">
                <div className="max-w-6xl mx-auto">
                    {equipment.map((item, index) => (
                        <div
                            key={item.id}
                            className={`grid grid-cols-1 lg:grid-cols-2 gap-12 py-16 ${index !== equipment.length - 1 ? 'border-b border-white/10' : ''
                                }`}
                        >
                            {/* Image */}
                            <div className={`relative overflow-hidden rounded-2xl ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-[400px] object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-6 left-6">
                                    <span
                                        className="inline-block px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest"
                                        style={{ backgroundColor: item.color, color: item.color === '#FFFFFF' ? '#000' : '#FFF' }}
                                    >
                                        {item.subtitle}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex flex-col justify-center">
                                <div className="mb-4" style={{ color: item.color }}>
                                    {item.icon}
                                </div>
                                <span className="text-white/40 text-sm font-mono mb-2">{item.id}</span>
                                <h2 className="text-4xl md:text-5xl font-bold mb-6">{item.title}</h2>
                                <p className="text-white/60 text-lg leading-relaxed mb-8">{item.description}</p>

                                {/* Specs */}
                                <div className="grid grid-cols-2 gap-4">
                                    {item.specs.map((spec, i) => (
                                        <div key={i} className="p-4 bg-[#141414] rounded-lg border border-white/10">
                                            <div className="text-xs uppercase tracking-widest text-white/40 mb-1">{spec.label}</div>
                                            <div className="text-sm font-medium">{spec.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 md:px-12 bg-[#141414]">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to Try Them?
                    </h2>
                    <p className="text-white/60 text-xl mb-12">
                        Book your session and experience our equipment firsthand.
                    </p>
                    <Link
                        to="/book"
                        className="inline-flex items-center gap-3 px-12 py-5 bg-[#D42428] text-white rounded-full font-bold uppercase tracking-widest hover:bg-[#B91C1C] transition-colors"
                    >
                        Book Now <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default EquipmentPage;
