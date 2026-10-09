import React, { useState } from 'react';

interface HaybahLogoProps {
  className?: string;
  variant?: 'transparent' | 'navbar' | 'footer' | 'raw';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'navbar';
}

export const HaybahLogo: React.FC<HaybahLogoProps> = ({
  className = '',
  variant = 'transparent',
  size = 'md',
}) => {
  const [imageError, setImageError] = useState(false);

  // Height configurations: fill about 90-95% of header height (~44px on mobile, ~48px on sm, ~52px on md)
  const heightClass = {
    sm: 'h-9 sm:h-10',
    md: 'h-11 sm:h-12',
    navbar: 'h-[44px] sm:h-[48px] md:h-[52px]', // 90-95% of header height
    lg: 'h-18 sm:h-22',
    xl: 'h-24 sm:h-28',
  }[size];

  // If image fails, fallback to vector SVG
  if (imageError) {
    return (
      <div className={`inline-flex items-center justify-center select-none ${className}`}>
        <svg
          viewBox="0 0 260 180"
          className={`${heightClass} w-auto`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="haybahGoldGradFallback" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E8CE7A" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#B8962E" />
            </linearGradient>
          </defs>
          <path
            d="M 68 108 L 68 68 C 68 62, 70 58, 76 56 L 82 56 C 82 46, 88 38, 96 30 C 108 18, 122 8, 130 3 C 138 8, 152 18, 164 30 C 172 38, 178 46, 178 56 L 184 56 C 190 58, 192 62, 192 68 L 192 108"
            stroke="url(#haybahGoldGradFallback)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text
            x="130"
            y="152"
            textAnchor="middle"
            fill="url(#haybahGoldGradFallback)"
            fontSize="32"
            fontWeight="700"
            fontFamily="'Cinzel', serif"
            letterSpacing="6"
          >
            HAYBAH
          </text>
        </svg>
      </div>
    );
  }

  // Pure logo on transparent background
  return (
    <div
      className={`inline-flex items-center justify-center select-none transition-transform duration-200 ${className}`}
    >
      <img
        src="/haybah-logo-transparent.png"
        alt="HAYBAH"
        onError={() => setImageError(true)}
        className={`${heightClass} w-auto object-contain transition-all duration-300`}
        style={
          variant === 'navbar'
            ? { filter: 'drop-shadow(0 0 3px rgba(212,175,55,0.5))' }
            : undefined
        }
        loading="eager"
      />
    </div>
  );
};
