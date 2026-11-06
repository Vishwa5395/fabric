import React from 'react';

interface FloatingHeart {
  id: number;
  left: string;
  top: string;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  rotation: number;
  animType: 'anim-wobble' | 'anim-bounce' | 'anim-jiggle';
}

const RED_COLOR = '#E63946'; // Vibrant classic red

// Hearts placed strictly on the side borders/margins (outer flanks),
// keeping the entire central reading and interaction region (10% to 90%) 100% clean and unobstructed.
const HEARTS: FloatingHeart[] = [
  // Left border flank
  { id: 1, left: '2.5%', top: '4%', size: 48, opacity: 0.78, duration: 0.72, delay: 0.05, rotation: -12, animType: 'anim-wobble' },
  { id: 2, left: '5%', top: '16%', size: 38, opacity: 0.72, duration: 0.65, delay: 0.22, rotation: 14, animType: 'anim-bounce' },
  { id: 3, left: '2%', top: '30%', size: 50, opacity: 0.76, duration: 0.8, delay: 0.12, rotation: -8, animType: 'anim-jiggle' },
  { id: 4, left: '5.5%', top: '44%', size: 42, opacity: 0.74, duration: 0.68, delay: 0.35, rotation: 16, animType: 'anim-wobble' },
  { id: 5, left: '2%', top: '58%', size: 48, opacity: 0.75, duration: 0.75, delay: 0.18, rotation: -14, animType: 'anim-bounce' },
  { id: 6, left: '4.5%', top: '72%', size: 40, opacity: 0.72, duration: 0.7, delay: 0.28, rotation: 10, animType: 'anim-jiggle' },
  { id: 7, left: '2%', top: '85%', size: 52, opacity: 0.78, duration: 0.82, delay: 0.08, rotation: -10, animType: 'anim-wobble' },
  { id: 8, left: '4%', top: '95%', size: 38, opacity: 0.7, duration: 0.66, delay: 0.4, rotation: 12, animType: 'anim-bounce' },

  // Right border flank
  { id: 9, left: '93%', top: '5%', size: 46, opacity: 0.76, duration: 0.74, delay: 0.15, rotation: 12, animType: 'anim-jiggle' },
  { id: 10, left: '91%', top: '18%', size: 52, opacity: 0.78, duration: 0.82, delay: 0.3, rotation: -15, animType: 'anim-wobble' },
  { id: 11, left: '94%', top: '32%', size: 38, opacity: 0.72, duration: 0.64, delay: 0.05, rotation: 10, animType: 'anim-bounce' },
  { id: 12, left: '91.5%', top: '46%', size: 48, opacity: 0.75, duration: 0.78, delay: 0.25, rotation: -12, animType: 'anim-jiggle' },
  { id: 13, left: '94%', top: '60%', size: 42, opacity: 0.74, duration: 0.7, delay: 0.1, rotation: 15, animType: 'anim-wobble' },
  { id: 14, left: '91%', top: '74%', size: 50, opacity: 0.76, duration: 0.76, delay: 0.38, rotation: -8, animType: 'anim-bounce' },
  { id: 15, left: '93.5%', top: '87%', size: 44, opacity: 0.75, duration: 0.84, delay: 0.2, rotation: 14, animType: 'anim-jiggle' },
  { id: 16, left: '92%', top: '95%', size: 38, opacity: 0.7, duration: 0.68, delay: 0.14, rotation: -10, animType: 'anim-wobble' }
];

export const BackgroundHearts: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}
    >
      {HEARTS.map(heart => (
        <div
          key={heart.id}
          className={`bg-floating-heart ${heart.animType}`}
          style={{
            position: 'absolute',
            left: heart.left,
            top: heart.top,
            width: `${heart.size}px`,
            height: `${heart.size}px`,
            opacity: heart.opacity,
            animationDuration: `${heart.duration}s`,
            animationDelay: `${heart.delay}s`,
            ['--base-rot' as string]: `${heart.rotation}deg`,
            filter: 'drop-shadow(0 3px 5px rgba(32, 35, 41, 0.42))'
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width="100%"
            height="100%"
            style={{ display: 'block', overflow: 'visible' }}
          >
            {/* Highlighted White Die-Cut Outline & Vibrant Red Fill */}
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill={RED_COLOR}
              stroke="#FFFFFF"
              strokeWidth="2.6"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Glossy Vinyl Sticker Sheen / Highlight (Behance sticker pack reflection) */}
            <path
              d="M6.2 7.2 C6.8 5.4 8.6 4.8 10 5.2"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
              opacity="0.88"
            />
            <circle cx="6" cy="9.2" r="0.75" fill="#FFFFFF" opacity="0.88" />
          </svg>
        </div>
      ))}
    </div>
  );
};
