'use client';

import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  symbol: string;
}

export default function ClickEffect() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const symbols = ['💖', '✨', '💕', '⭐', '🌸', '🪄'];

    const handleClick = (e: MouseEvent | TouchEvent) => {
      let x = 0;
      let y = 0;
      if ('touches' in e && e.touches.length > 0) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
      } else if ('clientX' in e) {
        x = (e as MouseEvent).clientX;
        y = (e as MouseEvent).clientY;
      }

      const id = Date.now() + Math.random();
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];

      setParticles((prev) => [...prev.slice(-15), { id, x, y, symbol }]);

      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== id));
      }, 900);
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('touchstart', handleClick, { passive: true });

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('touchstart', handleClick);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute select-none pointer-events-none animate-click-pop text-lg md:text-xl"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {p.symbol}
        </span>
      ))}
    </div>
  );
}
