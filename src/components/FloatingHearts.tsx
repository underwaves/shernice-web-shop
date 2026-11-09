'use client';

import React, { useEffect, useState } from 'react';

interface Heart {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  symbol: string;
}

export default function FloatingHearts() {
  const [hearts, setHearts] = useState<Heart[]>([]);

  useEffect(() => {
    const symbols = ['💖', '💕', '🌸', '✨', '🤍', '🎀'];
    const generated: Heart[] = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: Math.random() * 95,
      size: Math.random() * 14 + 12,
      duration: Math.random() * 7 + 6,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.4 + 0.25,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
    }));
    setHearts(generated);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="absolute select-none animate-floating-heart"
          style={{
            left: `${h.left}%`,
            bottom: '-40px',
            fontSize: `${h.size}px`,
            opacity: h.opacity,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
          }}
        >
          {h.symbol}
        </span>
      ))}
    </div>
  );
}
