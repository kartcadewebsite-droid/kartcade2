import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Calendar, Gamepad2, Flag, Coffee } from 'lucide-react';

const steps = [
  {
    id: "01",
    title: "Book Online or Walk In",
    icon: <Calendar className="w-12 h-12 text-[#2D9E49] mb-6" />,
    desc: "Reserve your spot online or drop by. We recommend booking ahead, especially for weekends and groups. Call us at 503-490-9194 to check availability."
  },
  {
    id: "02",
    title: "Choose Your Experience",
    icon: <Gamepad2 className="w-12 h-12 text-white mb-6" />,
    desc: "Pick from our massive demo game library spanning arcade to simulation. Our staff will help you find the perfect game for your skill level and interests."
  },
  {
    id: "03",
    title: "Get Racing",
    icon: <Flag className="w-12 h-12 text-[#D42428] mb-6" />,
    desc: "Our expert team will get you set up and ready to roll. Race together with your group—no taking turns! Up to 10 drivers simultaneously."
  },
  {
    id: "04",
    title: "Enjoy Refreshments",
    icon: <Coffee className="w-12 h-12 text-white mb-6" />,
    desc: "Grab snacks and cold drinks while you play. We have light refreshments available, and you're welcome to bring your own food too."
  }
];

const Process: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const totalWidth = trackRef.current!.offsetWidth;
    const amountToScroll = totalWidth - window.innerWidth;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerRef.current,
        start: "top top",
        end: `+=${amountToScroll + 1000}`,
        pin: true,
        scrub: 1,
        snap: 1 / (steps.length - 1),
      }
    });

    tl.to(trackRef.current, {
      xPercent: -100 * (steps.length - 1) / steps.length,
      ease: "none",
    });

    gsap.to(lineRef.current, {
      width: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: triggerRef.current,
        start: "top top",
        end: `+=${amountToScroll + 1000}`,
        scrub: 1,
      }
    });

  }, { scope: triggerRef });

  // Refresh ScrollTrigger after mount to recalculate positions
  useEffect(() => {
    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#0A0A0A] text-white relative z-20">
      <div ref={triggerRef} className="h-screen overflow-hidden flex flex-col justify-center py-20">

        <div className="container mx-auto px-6 mb-12">
          <span className="text-[#2D9E49] text-xs font-bold uppercase tracking-widest">Simple & Easy</span>
          <h2 className="font-display text-4xl uppercase tracking-tight text-white mt-2">How It Works</h2>
        </div>

        {/* The Track */}
        <div ref={trackRef} className="flex flex-row w-[400vw] h-[60vh] items-center relative pl-6 md:pl-20">

          {/* Connection Line Background */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -z-10" />
          {/* Animated Line - Racing gradient */}
          <div ref={lineRef} className="absolute top-1/2 left-0 w-0 h-[2px] bg-gradient-to-r from-[#2D9E49] via-white to-[#D42428] -z-10" />

          {steps.map((step, index) => (
            <div key={index} className="w-[100vw] h-full flex items-center justify-start relative px-10 md:px-20">
              <div className="relative group">
                <div className="font-display text-[8rem] md:text-[10rem] lg:text-[15rem] leading-none font-bold text-white/5 absolute -top-16 md:-top-24 lg:-top-32 -left-10 md:-left-20 select-none z-0 transform translate-x-10 group-hover:translate-x-0 transition-transform duration-1000">
                  {step.id}
                </div>
                <div className="relative z-10 bg-[#141414] backdrop-blur-sm p-8 border border-white/10 max-w-xl rounded-2xl">
                  {step.icon}
                  <h3 className="font-display text-3xl md:text-4xl uppercase mb-4">{step.title}</h3>
                  <p className="font-sans text-lg md:text-xl text-white/60 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;