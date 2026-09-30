import React, { useEffect, useState } from 'react';

export default function BackgroundShapes() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-decorations" aria-hidden="true">
      <div 
        className="blob blob-1" 
        style={{ transform: `translateY(${scrollY * 0.15}px)` }} 
      />
      <div 
        className="blob blob-2" 
        style={{ transform: `translateY(${scrollY * -0.08}px)` }} 
      />
      <div 
        className="blob blob-3" 
        style={{ transform: `translateY(${scrollY * 0.12}px)` }} 
      />
      <div className="shape shape-triangle"></div>
      <div className="shape shape-square"></div>
      <div className="shape shape-diamond"></div>
    </div>
  );
}
