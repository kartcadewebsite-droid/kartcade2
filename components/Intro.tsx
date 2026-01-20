import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const gamesList = [
  "Le Mans Ultimate",
  "Dirt Rally 2.0",
  "Grid Legends",
  "CarX Drift Online",
  "Wreckfest",
  "Deathsprint 66",
  "BeamNG",
  "American Truck Simulator",
  "Star Wars Squadrons",
  "Assetto Corsa",
  "And many more..."
];

const Intro: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textLinesRef = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(() => {
    textLinesRef.current.forEach((line, index) => {
      if (!line) return;

      gsap.fromTo(line,
        { y: "100%" },
        {
          y: "0%",
          duration: 1.2,
          ease: "power4.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          },
          delay: index * 0.1
        }
      );
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative z-10 bg-white text-black py-16 md:py-48 rounded-t-[2rem] md:rounded-t-[4rem] -mt-10 shadow-[0_-20px_60px_rgba(0,0,0,0.3)]">
      <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12">

        {/* Editorial Text */}
        <div className="md:col-span-7">
          <h2 className="font-display text-4xl md:text-7xl font-semibold leading-[1.1] uppercase tracking-tight">
            <div className="overflow-hidden">
              <span ref={el => textLinesRef.current[0] = el} className="block">Not Just</span>
            </div>
            <div className="overflow-hidden">
              <span ref={el => textLinesRef.current[1] = el} className="block text-[#2D9E49]">Sim Racing.</span>
            </div>
            <div className="overflow-hidden">
              <span ref={el => textLinesRef.current[2] = el} className="block text-black/40">Everything</span>
            </div>
            <div className="overflow-hidden">
              <span ref={el => textLinesRef.current[3] = el} className="block">With Wheels.</span>
            </div>
          </h2>
        </div>

        {/* Small Description */}
        <div className="md:col-span-5 flex flex-col justify-end">
          <p className="font-sans text-black/60 text-lg leading-relaxed max-w-sm mb-6">
            Kartcade is Oregon's premier racing simulator lounge, featuring 10 state-of-the-art simulators. Unlike traditional sim racing centers, we offer an incredible variety of games—from ultra-realistic racing sims to arcade classics and everything in between.
          </p>
          <div className="flex gap-8">
            <div>
              <div className="text-4xl font-bold text-[#D42428]">10</div>
              <div className="text-xs uppercase tracking-widest text-black/40">Simulators</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#2D9E49]">40+</div>
              <div className="text-xs uppercase tracking-widest text-black/40">Games</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-black">All</div>
              <div className="text-xs uppercase tracking-widest text-black/40">Skill Levels</div>
            </div>
          </div>
        </div>
      </div>

      {/* Games Ticker */}
      <div className="mt-16 md:mt-32 overflow-hidden w-full border-t border-b border-black/10 py-8 bg-white">
        <div className="flex w-[300%] animate-marquee">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex justify-around w-full">
              {gamesList.map((game, idx) => (
                <span key={idx} className="text-xl md:text-2xl font-display font-medium uppercase tracking-wide text-black mx-12 whitespace-nowrap flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#D42428]"></span>
                  {game}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default Intro;