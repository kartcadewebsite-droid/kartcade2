import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, Palette, Search, Share2, Camera, Zap } from 'lucide-react';
import FinalCTA from '../components/home/FinalCTA';

gsap.registerPlugin(ScrollTrigger);

// SEO Effect Hook
const usePageSEO = () => {
  useEffect(() => {
    document.title = "Services | Web Design, SEO & Branding | AgencyStarter";

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Professional web design, SEO optimization, branding, social media management & graphic design services. Get a free quote today.');
    }

    return () => {
      document.title = "AgencyStarter | Web Design Agency";
    };
  }, []);
};

const services = [
  {
    id: "01",
    name: "Website Development",
    tagline: "Built to Convert",
    desc: "Custom, responsive websites built for performance. SEO-optimized, fast-loading, and conversion-focused. We integrate WhatsApp, booking systems, CMS, and custom features tailored to your business needs.",
    features: ["Responsive Design", "SEO Optimized", "WhatsApp & CMS Integration"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
    icon: <Globe className="w-8 h-8" />
  },
  {
    id: "02",
    name: "Branding & Design",
    tagline: "Stand Out",
    desc: "Complete brand identity from logo to business cards. We create memorable visual systems including logo design, color palette, typography, stationery, social media templates, packaging, and catalogues.",
    features: ["Logo & Identity", "Stationery Design", "Social Templates"],
    image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=2564&auto=format&fit=crop",
    icon: <Palette className="w-8 h-8" />
  },
  {
    id: "03",
    name: "SEO & Content",
    tagline: "Get Found",
    desc: "Boost your visibility with our SEO services. Keyword research, on-page optimization, technical SEO, blog writing, and content marketing to drive organic traffic and generate leads.",
    features: ["Keyword Research", "On-Page SEO", "Blog & Content"],
    image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?q=80&w=2674&auto=format&fit=crop",
    icon: <Search className="w-8 h-8" />
  },
  {
    id: "04",
    name: "Social Media & Ads",
    tagline: "Grow Your Presence",
    desc: "Strategic social media management with posts, reels, stories, and paid advertising. We handle Meta, Google, and other platforms with detailed analytics and reporting.",
    features: ["Content Strategy", "Reels & Posts", "Paid Ads"],
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2574&auto=format&fit=crop",
    icon: <Share2 className="w-8 h-8" />
  },
  {
    id: "05",
    name: "AI Product Media",
    tagline: "AI-Powered Visuals",
    desc: "Professional AI-powered product photography and video ads. We create stunning visuals for e-commerce, social media campaigns, and marketing materials using cutting-edge AI tools.",
    features: ["AI Product Photos", "Video Ads", "E-commerce Ready"],
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2670&auto=format&fit=crop",
    icon: <Camera className="w-8 h-8" />
  },
  {
    id: "06",
    name: "Business Automation",
    tagline: "Scale Efficiently",
    desc: "Chatbots, lead automation, CRM integrations, and workflow optimization. We help you scale your business with intelligent automation and AI-powered solutions.",
    features: ["Chatbot Setup", "Lead Automation", "CRM Integration"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop",
    icon: <Zap className="w-8 h-8" />
  }
];

const ServicesPage: React.FC = () => {
  usePageSEO(); // SEO hook

  const showcaseRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [activeService, setActiveService] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useGSAP(() => {
    // Mouse Move Listener for Hero
    const updateMousePosition = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };

    heroRef.current?.addEventListener('mousemove', updateMousePosition);

    const sections = gsap.utils.toArray('.service-text-section');

    sections.forEach((section: any, i) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top center",
        end: "bottom center",
        onEnter: () => setActiveService(i),
        onEnterBack: () => setActiveService(i),
      });
    });

    return () => {
      heroRef.current?.removeEventListener('mousemove', updateMousePosition);
    };
  }, { scope: showcaseRef });

  return (
    <div className="bg-white min-h-screen">

      {/* Hero with Interactive Grid */}
      <section ref={heroRef} className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 relative overflow-hidden bg-white group border-b border-black">
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

        {/* 2. Highlight Grid (Darker lines revealed by mask) */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100"
          style={{
            backgroundColor: 'transparent',
            backgroundImage: `
                    linear-gradient(#000 1px, transparent 1px), 
                    linear-gradient(90deg, #000 1px, transparent 1px)
                `,
            backgroundSize: '32px 32px',
            maskImage: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
            WebkitMaskImage: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
          }}
        >
          {/* This inner div sets the opacity of the "dark" lines */}
          <div className="absolute inset-0 opacity-[0.15] bg-transparent" />
        </div>


        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Text Halo/Glow */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] pointer-events-none -z-10"
            style={{
              background: 'radial-gradient(circle, #ffffff 40%, rgba(255,255,255,0) 70%)'
            }}
          />

          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-black leading-[1.1] tracking-tight mb-8">
            Expert web design<br />
            that drives growth
          </h1>

          <p className="font-sans text-lg md:text-xl text-black/60 max-w-2xl mx-auto leading-relaxed mb-12">
            We build high-performance websites and execute data-driven marketing strategies to help your business scale.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center bg-black text-white px-8 py-4 font-sans text-sm font-medium rounded-none hover:rounded-[50px] transition-all duration-700 ease-in-out"
            >
              View Packages
            </Link>
          </div>
        </div>
      </section>

      {/* Sticky Scroll Showcase */}
      <section ref={showcaseRef} className="relative flex flex-col md:flex-row">

        {/* Left: Sticky Image */}
        <div className="w-full md:w-1/2 h-[50vh] md:h-screen sticky top-0 bg-black overflow-hidden">
          {services.map((service, index) => (
            <div
              key={service.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${index === activeService ? 'opacity-100' : 'opacity-0'}`}
            >
              <img src={service.image} alt={service.name} className="w-full h-full object-cover opacity-70" />
              <div className="absolute inset-0 bg-black/50" />
              <div className="absolute bottom-10 left-10 text-white">
                <span className="font-mono text-white/40 text-sm uppercase tracking-widest">{service.id}</span>
                <h3 className="font-display text-4xl md:text-5xl uppercase">{service.name}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Scrolling Text */}
        <div className="w-full md:w-1/2 bg-white">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="service-text-section min-h-screen flex items-center justify-center p-12 md:p-16 lg:p-20 border-b border-black/10"
            >
              <div className="max-w-lg">
                <div className="mb-8 text-black">{service.icon}</div>
                <span className="font-mono text-black/40 text-sm uppercase tracking-widest block mb-2">{service.tagline}</span>
                <h2 className="font-display text-4xl md:text-5xl uppercase mb-6 text-black">{service.name}</h2>
                <p className="font-sans text-lg text-black/60 leading-relaxed mb-8">{service.desc}</p>

                <ul className="space-y-3 mb-10">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-black/80">
                      <span className="w-2 h-2 bg-black rounded-full"></span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link to="/pricing" className="inline-flex items-center gap-2 font-display uppercase tracking-widest text-sm font-bold text-black hover:opacity-60 transition-opacity group">
                  View Packages <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-20 px-6 md:px-12 bg-black text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {services.map((service) => (
              <Link
                key={service.id}
                to="/pricing"
                className="p-6 border border-white/10 hover:bg-white/5 transition-colors text-center group"
              >
                <div className="mb-4 flex justify-center text-white/60 group-hover:text-white transition-colors">{service.icon}</div>
                <span className="font-display text-sm uppercase">{service.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA />
    </div>
  );
};

export default ServicesPage;