import React, { useState, useEffect } from 'react';

const FixedGrid: React.FC = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Track global mouse position
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none bg-black">

            {/* 1. Base Grid (Faint White) */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
                    backgroundSize: '80px 80px'
                }}
            />

            {/* 2. Highlight Grid (Brighter White, Revealed by Mask) */}
            <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), 
            linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
          `,
                    backgroundSize: '80px 80px',
                    // Mask revealing the brighter grid around cursor
                    maskImage: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
                    WebkitMaskImage: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
                }}
            />
        </div>
    );
};

export default FixedGrid;
