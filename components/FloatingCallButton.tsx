import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Calendar } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import siteConfig from '../config/site';

const FloatingCallButton: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(containerRef.current,
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        delay: 1.5,
        ease: "back.out(1.7)"
      }
    );
  }, []);

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[9999] flex flex-col gap-3">
      {/* Book Now Button */}
      <Link
        to="/book"
        className="w-14 h-14 md:w-16 md:h-16 bg-[#D42428] text-white rounded-full flex items-center justify-center shadow-2xl shadow-[#D42428]/30 hover:bg-[#B91C1C] transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="Book Now"
      >
        <Calendar className="w-6 h-6 md:w-7 md:h-7" />
      </Link>

      {/* Call Button */}
      <a
        href={`tel:${siteConfig.phone}`}
        className="w-14 h-14 md:w-16 md:h-16 bg-[#2D9E49] text-white rounded-full flex items-center justify-center shadow-2xl shadow-[#2D9E49]/30 hover:bg-[#248C3E] transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="Call Us"
      >
        <Phone className="w-6 h-6 md:w-7 md:h-7" />
      </a>
    </div>
  );
};

export default FloatingCallButton;