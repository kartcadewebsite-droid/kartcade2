import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      gsap.to(cursorRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: 'power2.out'
      });
      gsap.to(followerRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.5,
        ease: 'power2.out'
      });
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.getAttribute('data-cursor') === 'view') {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
    };
  }, []);

  return (
    <>
      {/* Main dot */}
      <div 
        ref={cursorRef} 
        className="fixed top-0 left-0 w-3 h-3 bg-premium-accent rounded-full pointer-events-none z-[100] -translate-x-1/2 -translate-y-1/2 mix-blend-difference hidden md:block"
      />
      {/* Follower circle / View Button */}
      <div 
        ref={followerRef} 
        className={`fixed top-0 left-0 rounded-full pointer-events-none z-[99] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-300 mix-blend-difference hidden md:flex
            ${isHovering ? 'w-24 h-24 bg-white text-black' : 'w-8 h-8 border border-white/50 bg-transparent'}
        `}
      >
        <span className={`font-display font-bold text-xs uppercase tracking-widest ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
            View
        </span>
      </div>
    </>
  );
};

export default CustomCursor;