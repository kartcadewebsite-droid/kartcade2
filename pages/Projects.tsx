import React, { useRef, useState, useEffect } from 'react';
import { useLenis } from 'lenis/react';
import gsap from 'gsap';
import { X, ArrowLeft } from 'lucide-react';
import FinalCTA from '../components/home/FinalCTA';

// SEO Effect Hook
const usePageSEO = () => {
  useEffect(() => {
    document.title = "Portfolio | Our Work | AgencyStarter";

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'View our portfolio of web design projects. From startups to enterprise clients, see how we build beautiful, effective websites.');
    }

    return () => {
      document.title = "AgencyStarter | Web Design Agency";
    };
  }, []);
};

const projects = [
  {
    id: 1,
    title: "Luxe Fashion",
    location: "E-Commerce",
    type: "Full-Stack Development",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
    desc: "A premium e-commerce platform built from scratch. We handled brand strategy, visual identity, full UI/UX design, frontend and backend development, payment integration, and performance optimization. The entire product was built in-house.",
    liveUrl: "#",
    client: "Fashion Brand Co."
  },
  {
    id: 2,
    title: "TechStart SaaS",
    location: "SaaS Platform",
    type: "Website Rebuild",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
    desc: "Complete rebuild of a B2B SaaS platform. The focus was on user experience, information architecture, and conversion optimization. We redesigned the entire customer journey from landing to signup.",
    liveUrl: "#",
    client: "TechStart Inc."
  },
  {
    id: 3,
    title: "HealthCare Pro",
    location: "Healthcare",
    type: "UX/UI Design",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1200&q=80",
    desc: "Designed a patient portal and appointment booking system. The app focused on accessibility, ease of use, and HIPAA compliance. We created the complete user flow and responsive design system."
  },
  {
    id: 4,
    title: "Urban Builders",
    location: "Construction",
    type: "Business Website",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80",
    desc: "Professional website for a construction company. We designed a clean, modern, trust-building layout with sections for services, portfolio, testimonials, and lead capture.",
    liveUrl: "#",
    client: "Urban Builders Ltd."
  },
  {
    id: 5,
    title: "FoodieApp",
    location: "Mobile App",
    type: "App UI Design",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&q=80",
    desc: "Designed the complete UI for a food delivery mobile app. Included onboarding flow, restaurant browsing, cart system, order tracking, and customer reviews. Clean and intuitive interface."
  },
  {
    id: 6,
    title: "FinanceHub",
    location: "Fintech",
    type: "Dashboard Design",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
    desc: "Financial dashboard platform for investment tracking. Modern dark theme UI with portfolio analytics, real-time market data, and user-friendly transaction management."
  }
];

const Projects: React.FC = () => {
  usePageSEO(); // SEO hook

  const [activeProject, setActiveProject] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };

    const section = heroRef.current;
    section?.addEventListener('mousemove', updateMousePosition);
    return () => section?.removeEventListener('mousemove', updateMousePosition);
  }, []);

  const revealRef = useRef<HTMLDivElement>(null);
  const revealImgRef = useRef<HTMLImageElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const moveReveal = (e: MouseEvent) => {
      if (!revealRef.current) return;

      const x = e.clientX + 20;
      const y = e.clientY - 100;

      gsap.to(revealRef.current, {
        x: x,
        y: y,
        duration: 0.5,
        ease: "power2.out"
      });
    };

    window.addEventListener('mousemove', moveReveal);
    return () => window.removeEventListener('mousemove', moveReveal);
  }, []);

  const handleHover = (project: any) => {
    setActiveProject(project.id);
    if (revealRef.current && revealImgRef.current) {
      revealImgRef.current.src = project.image;
      gsap.to(revealRef.current, { scale: 1, opacity: 1, duration: 0.3 });
    }
  };

  const handleLeave = () => {
    setActiveProject(null);
    if (revealRef.current) {
      gsap.to(revealRef.current, { scale: 0.8, opacity: 0, duration: 0.3 });
    }
  };

  /* Scroll Locking */
  const lenis = useLenis();

  useEffect(() => {
    if (modalOpen) {
      // Don't stop Lenis, just hide overflow
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup function to ensure overflow is reset when component unmounts
    // or when modal closes. Crucial for browser back button navigation.
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalOpen]);

  const openModal = (project: any) => {
    setSelectedProject(project);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="bg-white min-h-screen">

      {/* Hero with Interactive Grid */}
      <section ref={heroRef} className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 relative overflow-hidden bg-white group border-b border-black">
        {/* ... (rest of hero content) ... */}

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
            Selected works<br />
            & case studies
          </h1>

          <p className="font-sans text-lg md:text-xl text-black/60 max-w-2xl mx-auto leading-relaxed mb-12">
            A collection of digital experiences built with precision, performance, and purpose.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
              className="inline-flex items-center justify-center bg-black text-white px-8 py-4 rounded-none font-sans text-sm font-medium hover:rounded-[50px] transition-all duration-700 ease-in-out"
            >
              Explore Portfolio
            </button>
          </div>
        </div>
      </section>

      {/* Project List */}
      <section ref={listRef} className="px-6 md:px-12 lg:px-20 pb-32 relative">

        {/* Hover Image Reveal (Desktop) */}
        <div
          ref={revealRef}
          className="fixed top-0 left-0 w-[400px] h-[280px] pointer-events-none z-50 opacity-0 scale-75 hidden lg:block"
        >
          <img ref={revealImgRef} src="" alt="" className="w-full h-full object-cover rounded-lg shadow-2xl" />
        </div>

        {/* Project Items */}
        <div className="divide-y divide-black/10">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`group py-8 md:py-12 cursor-pointer transition-opacity duration-300 ${activeProject !== null && activeProject !== project.id ? 'opacity-30' : 'opacity-100'}`}
              onMouseEnter={() => handleHover(project)}
              onMouseLeave={handleLeave}
              onClick={() => openModal(project)}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="font-mono text-xs text-black/40 uppercase tracking-widest">{project.type}</span>
                  <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold uppercase text-black group-hover:opacity-60 transition-opacity">
                    {project.title}
                  </h2>
                </div>
                <span className="font-sans text-black/40">{project.location}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal */}
      {/* Modal - Premium Redesign */}
      {modalOpen && selectedProject && (
        <div
          className="fixed inset-0 bg-black z-[9999] overflow-y-auto overflow-x-hidden focus:outline-none overscroll-contain"
          onClick={closeModal}
          data-lenis-prevent
        >
          <div
            className="min-h-full w-full flex flex-col bg-black text-white selection:bg-white/20"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-[100] flex justify-between items-center px-6 py-6 md:px-12 md:py-8 bg-black/90 backdrop-blur-xl border-b border-white/10 w-full">
              <button
                onClick={closeModal}
                className="group flex items-center gap-3 text-white transition-colors"
              >
                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                  <ArrowLeft className="w-5 h-5" />
                </div>
                <span className="font-mono text-sm uppercase tracking-widest font-bold hidden md:inline-block">Back to Projects</span>
              </button>

              <button
                onClick={closeModal}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Cinematic Layout */}
            <div className="flex-grow px-6 md:px-12 lg:px-20 py-12 w-full max-w-[100vw] overflow-x-hidden">
              <div className="max-w-7xl mx-auto space-y-16">

                {/* 1. Project Title Header */}
                <div className="border-b border-white/10 pb-16">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="max-w-full">
                      <span className="inline-block px-4 py-2 rounded-full border border-white/20 bg-white/5 text-sm font-mono uppercase tracking-widest mb-6">
                        {selectedProject.type}
                      </span>
                      <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold uppercase leading-[0.9] break-words hyphens-auto">
                        {selectedProject.title}
                      </h1>
                    </div>
                    <div className="text-right hidden md:block flex-shrink-0">
                      <span className="block font-mono text-white/40 uppercase tracking-widest text-sm mb-2">Client</span>
                      <span className="font-display text-2xl">{selectedProject.location}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Hero Image */}
                <div className="aspect-video w-full rounded-3xl overflow-hidden border border-white/10 bg-white/5">
                  <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
                </div>

                {/* 3. Project Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

                  {/* Left: Description */}
                  <div className="lg:col-span-7">
                    <h3 className="font-display text-2xl uppercase mb-8">About the Project</h3>
                    <p className="font-sans text-xl md:text-2xl text-white/70 leading-relaxed">
                      {selectedProject.desc}
                    </p>
                  </div>

                  {/* Right: Meta Information */}
                  <div className="lg:col-span-5 space-y-12">
                    {/* Mobile-only Client info duplication */}
                    <div className="md:hidden border-b border-white/10 pb-8">
                      <h4 className="font-mono text-white/40 uppercase tracking-widest text-sm mb-4">Client</h4>
                      <p className="font-display text-2xl">{selectedProject.location}</p>
                    </div>

                    {/* Client Info */}
                    {selectedProject.client && (
                      <div className="border-b border-white/10 pb-8">
                        <h4 className="font-mono text-white/40 uppercase tracking-widest text-sm mb-4">Client</h4>
                        <p className="text-lg text-white/90">{selectedProject.client}</p>
                      </div>
                    )}

                    <div className="border-b border-white/10 pb-8">
                      <h4 className="font-mono text-white/40 uppercase tracking-widest text-sm mb-4">Services Delivered</h4>
                      <ul className="space-y-2">
                        <li className="text-lg text-white/90">UI/UX Design</li>
                        <li className="text-lg text-white/90">Frontend Development</li>
                        <li className="text-lg text-white/90">Performance Optimization</li>
                      </ul>
                    </div>

                    {/* Live URL */}
                    {selectedProject.liveUrl && (
                      <div>
                        <h4 className="font-mono text-white/40 uppercase tracking-widest text-sm mb-4">Visit Live Site</h4>
                        <a
                          href={selectedProject.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 font-display uppercase text-sm font-bold hover:rounded-[50px] transition-all duration-500"
                        >
                          View Website →
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Back Button */}
                <div className="pt-16 border-t border-white/10 flex justify-center">
                  <button
                    onClick={closeModal}
                    className="group flex flex-col items-center gap-4 text-white hover:text-white/70 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                      <ArrowLeft className="w-6 h-6" />
                    </div>
                    <span className="font-display text-xl uppercase tracking-widest">Back to All Projects</span>
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}



      <FinalCTA />
    </div>
  );
};

export default Projects;