import React, { useRef, ReactElement } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface Props {
  children: ReactElement;
}

const MagneticButton: React.FC<Props> = ({ children }) => {
  const magnetRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const magnet = magnetRef.current;
    if (!magnet) return;

    const xTo = gsap.quickTo(magnet, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
    const yTo = gsap.quickTo(magnet, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = magnet.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      
      xTo(x * 0.35);
      yTo(y * 0.35);
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
    };

    magnet.addEventListener("mousemove", handleMouseMove);
    magnet.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      magnet.removeEventListener("mousemove", handleMouseMove);
      magnet.removeEventListener("mouseleave", handleMouseLeave);
    };
  });

  return React.cloneElement(children, { ref: magnetRef });
};

export default MagneticButton;