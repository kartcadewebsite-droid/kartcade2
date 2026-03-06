import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowRight, Users, Gauge, Monitor, Plane, ChevronLeft, ChevronRight } from 'lucide-react';

const equipment = [
    {
        id: "01",
        title: "Racing Karts",
        subtitle: "5 Units",
        icon: <Gauge className="w-12 h-12" />,
        image: "/images/kartcade/karts.webp",
        description: "Our racing karts are designed for younger drivers and anyone under about 6'3\". These setups provide comfortable seating positions and adjusted controls, making them perfect for kids and teens who want the full racing experience.",
        specs: [
            { label: "Ages", value: "5+ (Adjustable cockpits)" },
            { label: "Experience", value: "Beginner-friendly" },
            { label: "Controls", value: "Adjusted for smaller drivers" }
        ],
        color: "#2D9E49",
        route: "/equipment/karts"
    },
    {
        id: "02",
        title: "Full-Size Racing Rigs",
        subtitle: "4 Units",
        icon: <Monitor className="w-12 h-12" />,
        image: "/images/equipment/Rigs/IMG_0505.webp",
        description: "These are our workhorses—professional-quality racing simulators with direct-drive force feedback wheels, load cell pedals, and comfortable racing seats. These rigs can handle everything from gentle cruising in American Truck Simulator to white-knuckle racing in Le Mans Ultimate.",
        specs: [
            { label: "Wheelbase", value: "Fanatec direct-drive (12-20nm)" },
            { label: "Weight Limit", value: "~300 lbs for comfort" },
            { label: "Features", value: "Direct-drive wheels, load cell pedals" }
        ],
        color: "#FFFFFF",
        route: "/equipment/rigs"
    },
    {
        id: "03",
        title: "Triple-Screen Motion Simulator",
        subtitle: "1 Unit - Crown Jewel",
        icon: <Monitor className="w-12 h-12" />,
        image: "/images/equipment/Motion/IMG_7835.webp",
        description: "This is the crown jewel of Kartcade. Our motion simulator features three screens that wrap around you for incredible immersion, plus a motion platform that physically moves with the action. Feel every bump, drift, and collision as the simulator pitches, rolls, and vibrates beneath you.",
        specs: [
            { label: "Immersion", value: "Full-motion platform & haptics" },
            { label: "Features", value: "Triple screens, motion platform" },
            { label: "Note", value: "Not for motion-sensitive guests" }
        ],
        color: "#D42428",
        route: "/equipment/motion"
    },
    {
        id: "04",
        title: "Flight Simulator",
        subtitle: "1 Unit",
        icon: <Plane className="w-12 h-12" />,
        image: "/images/equipment/Flight/IMG_7891.webp",
        description: "Not everything needs wheels! Our flight simulator lets you take to the skies with a full HOTAS (hands-on throttle and stick) setup. Perfect for a change of pace or anyone who loves aerial combat.",
        specs: [
            { label: "Config", value: "Boeing-spec cockpit (Full HOTAS)" },
            { label: "Best For", value: "Flight fans, Star Wars lovers" },
            { label: "Experience", value: "All skill levels" }
        ],
        color: "#2D9E49",
        route: "/equipment/flight"
    }
];

const EquipmentPage: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [labIndex, setLabIndex] = useState(0);

    const labImages = [
        { src: '/images/equipment/Wheels/IMG_7911.webp', alt: 'Wheel collection' },
        { src: '/images/equipment/Wheels/IMG_7915.webp', alt: 'Steering wheels' },
        { src: '/images/equipment/Shop/IMG_7948.webp', alt: 'The shop' },
        { src: '/images/equipment/Motion/IMG_7837.webp', alt: 'Motion simulator detail' },
        { src: '/images/equipment/Motion/IMG_7850.webp', alt: 'Motion simulator interior' },
    ];

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
                        src="/images/equipment/Motion/IMG_7831.webp"
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
                            <div className={`relative overflow-hidden rounded-2xl group ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                                {/* Image with Link */}
                                <Link
                                    to={item.route}
                                    className="block relative h-full w-full overflow-hidden"
                                >
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-[400px] object-cover transform group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                                </Link>
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

                                {/* Explore CTA */}
                                <div className="mt-8">
                                    <Link
                                        to={item.route}
                                        className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:gap-3 transition-all duration-200"
                                        style={{ color: item.color === '#FFFFFF' ? '#FFFFFF' : item.color }}
                                    >
                                        Explore This Rig <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Inside the Lab */}
            <section className="py-20 px-6 md:px-12">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-4 mb-10">
                        <h2 className="text-3xl font-bold tracking-tight uppercase font-display">Inside the Lab</h2>
                        <div className="h-px flex-1 bg-white/5" />
                        <span className="md:hidden text-xs text-white/30 font-mono">{labIndex + 1} / {labImages.length}</span>
                    </div>

                    {/* Mobile Carousel */}
                    <div className="md:hidden relative">
                        <div className="relative overflow-hidden rounded-2xl border border-white/10 aspect-[4/3]">
                            <img
                                key={labIndex}
                                src={labImages[labIndex].src}
                                alt={labImages[labIndex].alt}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <button
                            onClick={() => setLabIndex(i => (i - 1 + labImages.length) % labImages.length)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setLabIndex(i => (i + 1) % labImages.length)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm"
                            aria-label="Next image"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                        <div className="flex justify-center gap-1.5 mt-4">
                            {labImages.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setLabIndex(i)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === labIndex ? 'bg-white w-4' : 'bg-white/30 w-1.5'}`}
                                    aria-label={`Go to image ${i + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Desktop Bento Grid */}
                    <div className="hidden md:grid grid-cols-3 gap-4 auto-rows-[220px]">
                        <div className="col-span-1 row-span-2 overflow-hidden rounded-2xl border border-white/10 group">
                            <img src={labImages[0].src} alt={labImages[0].alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        </div>
                        {labImages.slice(1).map((img, i) => (
                            <div key={i} className="col-span-1 row-span-1 overflow-hidden rounded-2xl border border-white/10 group">
                                <img src={img.src} alt={img.alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            </div>
                        ))}
                    </div>
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
