import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Fashion Brand Co.",
    location: "E-Commerce Client",
    text: "AgencyStarter built our entire e-commerce platform from scratch — branding, UI/UX, development, SEO, everything. Delivered beyond expectations with a premium finish.",
    rating: 5,
  },
  {
    name: "Urban Builders Ltd.",
    location: "Construction Company",
    text: "Our new website actually generates leads now. Professional design, fast loading, and the SEO is bringing in organic traffic. Highly recommend their team.",
    rating: 5,
  },
  {
    name: "TechStart Inc.",
    location: "SaaS Platform",
    text: "The UX design for our SaaS platform was exceptional. They understood our users and delivered a simple, intuitive solution that works perfectly.",
    rating: 5,
  }
];

const Testimonials: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    });

    tl.from(titleRef.current, {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    })
      .from(cardsRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out"
      }, "-=0.4");

  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="py-12 md:py-24 px-6 md:px-12 lg:px-20 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 md:mb-16 text-center">
          <h2 ref={titleRef} className="font-display text-4xl md:text-5xl uppercase tracking-tight text-white">
            Client <span className="text-white/40">Stories</span>
          </h2>
        </div>

        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 overflow-x-auto md:overflow-visible pb-12 md:pb-0 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              ref={el => cardsRef.current[index] = el}
              className="min-w-[85vw] md:min-w-0 snap-center glass p-8 md:p-10 rounded-2xl flex flex-col justify-between hover:-translate-y-2 transition-transform duration-300"
            >
              <div>
                <Quote className="w-10 h-10 text-white mb-6 opacity-40" />
                <p className="font-sans text-lg text-white/80 leading-relaxed mb-8">
                  "{testimonial.text}"
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-6">
                <div>
                  <h4 className="font-display text-xl font-bold text-white">{testimonial.name}</h4>
                  <p className="font-sans text-sm text-white/40 uppercase tracking-wide">{testimonial.location}</p>
                </div>
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-white text-lg">★</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
