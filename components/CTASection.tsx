import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone, Gift } from 'lucide-react';
import siteConfig from '../config/site';

const CTASection: React.FC = () => {
  return (
    <section className="relative py-32 bg-[#0A0A0A] text-white overflow-hidden">

      {/* Background racing stripes decoration */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-0 left-1/4 w-32 h-full bg-gradient-to-b from-[#2D9E49] to-transparent transform -skew-x-12"></div>
        <div className="absolute top-0 left-1/3 w-16 h-full bg-gradient-to-b from-white to-transparent transform -skew-x-12"></div>
        <div className="absolute top-0 left-[40%] w-32 h-full bg-gradient-to-b from-[#D42428] to-transparent transform -skew-x-12"></div>
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10 flex flex-col items-center text-center">
        <span className="font-mono text-[#2D9E49] tracking-widest uppercase text-sm mb-6">
          West Linn, Oregon
        </span>

        <h2 className="font-display text-5xl md:text-8xl font-bold uppercase leading-none mb-12">
          Ready to<br />
          <span className="text-[#D42428]">Race?</span>
        </h2>

        <p className="font-sans text-xl text-white/60 max-w-2xl mb-16 leading-relaxed">
          Book your session today and experience Oregon's premier racing simulator lounge.
          Perfect for solo racers, groups, parties, and corporate events.
        </p>

        <div className="flex flex-col md:flex-row gap-6">
          <Link
            to="/book"
            className="group relative bg-[#D42428] text-white px-12 py-6 rounded-full font-display uppercase tracking-widest font-bold overflow-hidden transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#D42428]/30"
          >
            <span className="relative z-10 flex items-center gap-2">
              Book Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <a
            href={`tel:${siteConfig.phone}`}
            className="px-12 py-6 rounded-full border border-white/20 font-display uppercase tracking-widest font-bold hover:bg-white/5 transition-colors flex items-center gap-2 justify-center"
          >
            <Phone className="w-5 h-5" /> Call Us
          </a>

          <a
            href={siteConfig.giftCardsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-12 py-6 rounded-full border border-[#2D9E49]/30 text-[#2D9E49] font-display uppercase tracking-widest font-bold hover:bg-[#2D9E49]/10 transition-colors flex items-center gap-2 justify-center"
          >
            <Gift className="w-5 h-5" /> Gift Cards
          </a>
        </div>

        {/* Quick Info */}
        <div className="mt-20 flex flex-wrap justify-center gap-8 md:gap-16 text-center">
          <div>
            <div className="text-3xl font-bold text-white">$20-25</div>
            <div className="text-xs uppercase tracking-widest text-white/40 mt-1">per hour</div>
          </div>
          <div className="w-[1px] h-12 bg-white/20 hidden md:block"></div>
          <div>
            <div className="text-3xl font-bold text-white">10</div>
            <div className="text-xs uppercase tracking-widest text-white/40 mt-1">simulators</div>
          </div>
          <div className="w-[1px] h-12 bg-white/20 hidden md:block"></div>
          <div>
            <div className="text-3xl font-bold text-white">Walk-ins</div>
            <div className="text-xs uppercase tracking-widest text-white/40 mt-1">welcome</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;