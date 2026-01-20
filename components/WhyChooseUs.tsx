import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const cards = [
  {
    title: "Massive Game Library",
    desc: "From hardcore sims like Le Mans Ultimate and Dirt Rally to arcade fun like Wreckfest and Grid Legends. If it has wheels, we can run it.",
    bg: "bg-[#0A0A0A]",
    text: "text-white",
    accent: "text-[#2D9E49]"
  },
  {
    title: "Race Together",
    desc: "Up to 10 drivers simultaneously—no taking turns! Birthday parties, corporate events, or just friends competing. Everyone races at once.",
    bg: "bg-white",
    text: "text-black",
    accent: "text-[#D42428]"
  },
  {
    title: "All Skill Levels",
    desc: "Complete beginner? Pro sim racer? We have games and assists for everyone. Our staff will help you find the perfect experience.",
    bg: "bg-[#0A0A0A]",
    text: "text-white",
    accent: "text-[#2D9E49]"
  },
  {
    title: "Beyond Sim Racing",
    desc: "Combat racing, drifting, truck simulators, destruction derbies, space combat—we celebrate ALL types of driving games, not just realistic sims.",
    bg: "bg-white",
    text: "text-black",
    accent: "text-[#D42428]"
  }
];

const WhyChooseUs: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    cardsRef.current.forEach((card, index) => {
      if (!card) return;

      gsap.to(card, {
        scale: 0.95,
        scrollTrigger: {
          trigger: card,
          start: "top 15%",
          end: "bottom top",
          scrub: true,
          endTrigger: cardsRef.current[index + 1] || containerRef.current
        }
      });
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative z-20 py-32 px-6 md:px-12 lg:px-20 bg-white min-h-screen">
      <div className="mb-20">
        <span className="text-[#D42428] text-xs font-bold uppercase tracking-widest">What Makes Us Different</span>
        <h2 className="font-display text-5xl uppercase tracking-tight text-black mt-2">Why Kartcade</h2>
      </div>

      <div className="flex flex-col items-center pb-20">
        {cards.map((card, index) => (
          <div
            key={index}
            ref={el => cardsRef.current[index] = el}
            className={`sticky top-[15vh] w-full max-w-4xl h-[60vh] rounded-3xl p-8 md:p-12 lg:p-20 flex flex-col justify-center shadow-2xl origin-top ${card.bg} ${card.text} ${card.bg === 'bg-white' ? 'border border-black/10' : 'border border-white/10'}`}
            style={{ marginBottom: `${index === cards.length - 1 ? 0 : 10}vh` }}
          >
            <div className="flex justify-between items-start mb-auto">
              <span className={`font-display text-2xl ${card.accent}`}>0{index + 1}</span>
              {/* Racing flag decoration */}
              <div className="flex gap-1">
                <span className="w-3 h-3 rounded-full bg-[#2D9E49]"></span>
                <span className="w-3 h-3 rounded-full bg-white border border-black/10"></span>
                <span className="w-3 h-3 rounded-full bg-[#D42428]"></span>
              </div>
            </div>
            <div>
              <h3 className="font-display text-4xl md:text-5xl lg:text-7xl font-bold uppercase mb-8 leading-none">
                {card.title}
              </h3>
              <p className="font-sans text-xl md:text-2xl opacity-60 max-w-xl leading-relaxed">
                {card.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseUs;