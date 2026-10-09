import React from 'react';
import { Menu, ShoppingBag } from 'lucide-react';
import { HaybahLogo } from './HaybahLogo';
import { useShop } from '../context/ShopContext';

export const Header: React.FC = () => {
  const { setIsSideMenuOpen, setIsCartOpen, getCartTotal, navigateTo } = useShop();
  const { itemCount } = getCartTotal();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] select-none overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 h-[48px] sm:h-[52px] md:h-[58px] py-0 flex items-center justify-between relative">
        {/* Left: 22-24px Hamburger Menu Button (Vertically Centered) */}
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setIsSideMenuOpen(true)}
          className="flex items-center gap-1.5 text-[#06201A] hover:text-[#AA820A] py-1 px-1.5 -ml-1 rounded-lg hover:bg-gray-100/70 transition-all active:scale-95 cursor-pointer shrink-0 z-20 group"
        >
          <Menu className="w-[22px] h-[22px] sm:w-[24px] sm:h-[24px] stroke-[2.2] transition-transform group-hover:scale-105" />
          <span className="hidden sm:inline-block text-[11px] font-black tracking-wider uppercase font-sans">
            Menu
          </span>
        </button>

        {/* Center: HAYBAH Logo with Organic Deep Green Hand-Painted Brush-Stroke Background */}
        <div
          onClick={() => navigateTo('home')}
          className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 cursor-pointer flex items-center justify-center transition-transform hover:scale-102 active:scale-98 z-10"
        >
          <div className="relative flex items-center justify-center w-[158px] sm:w-[172px] md:w-[220px] h-[46px] sm:h-[50px] md:h-[56px]">
            {/* Hand-Painted Organic Deep Green Brush-Stroke SVG Background */}
            <svg
              viewBox="0 0 240 54"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full -rotate-2 pointer-events-none drop-shadow-xs transition-transform"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Deep Green Paint Gradient */}
                <linearGradient id="haybahBrushGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0B2B22" />
                  <stop offset="35%" stopColor="#06201A" />
                  <stop offset="70%" stopColor="#082820" />
                  <stop offset="100%" stopColor="#0B2B22" />
                </linearGradient>

                {/* Subtle Lighter Green Paint Streak Highlight */}
                <linearGradient id="haybahStreakHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="5%" stopColor="#14463A" stopOpacity="0.4" />
                  <stop offset="30%" stopColor="#19594A" stopOpacity="0.85" />
                  <stop offset="70%" stopColor="#14463A" stopOpacity="0.8" />
                  <stop offset="95%" stopColor="#14463A" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* Main Organic Brush Stroke Body with Rough Torn Edges - Solidly contains logo */}
              <path
                d="M 14 7 
                   C 28 4, 55 3, 90 2 
                   C 125 1, 160 2, 195 3 
                   C 215 4, 226 6, 234 11 
                   C 238 14, 233 18, 239 22 
                   C 241 25, 232 29, 238 33 
                   C 240 37, 230 40, 235 44 
                   C 229 48, 218 51, 198 52 
                   C 160 53, 120 53, 85 52 
                   C 50 51, 25 50, 12 46 
                   C 4 42, 10 37, 3 33 
                   C 0 28, 8 24, 2 20 
                   C 0 16, 7 11, 14 7 Z"
                fill="url(#haybahBrushGrad)"
              />

              {/* Left Torn Bristle Splatters & Streaks */}
              <path
                d="M 12 14 C 6 17, 1 20, 0 22 C 4 23, 8 22, 13 22 Z"
                fill="url(#haybahBrushGrad)"
                opacity="0.95"
              />
              <path
                d="M 10 32 C 4 35, 1 38, 2 40 C 6 40, 10 38, 14 37 Z"
                fill="url(#haybahBrushGrad)"
                opacity="0.9"
              />
              <path
                d="M 15 25 C 8 26, 4 28, 3 29 C 7 30, 11 29, 16 28 Z"
                fill="url(#haybahBrushGrad)"
                opacity="0.92"
              />

              {/* Right Torn Bristle Splatters & Streaks */}
              <path
                d="M 226 11 C 233 13, 239 16, 240 18 C 235 19, 230 18, 224 17 Z"
                fill="url(#haybahBrushGrad)"
                opacity="0.95"
              />
              <path
                d="M 228 28 C 236 30, 240 33, 239 35 C 233 35, 228 34, 224 33 Z"
                fill="url(#haybahBrushGrad)"
                opacity="0.9"
              />
              <path
                d="M 225 42 C 232 44, 237 46, 235 48 C 230 48, 226 46, 221 45 Z"
                fill="url(#haybahBrushGrad)"
                opacity="0.88"
              />

              {/* Inner Dry-Brush Highlights (Realistic Paint Streaks) */}
              <path
                d="M 24 11 Q 120 8 215 10"
                stroke="url(#haybahStreakHighlight)"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.85"
              />
              <path
                d="M 16 27 Q 120 25 224 27"
                stroke="url(#haybahStreakHighlight)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeDasharray="40 10 55 12"
                opacity="0.7"
              />
              <path
                d="M 28 44 Q 125 45 210 42"
                stroke="url(#haybahStreakHighlight)"
                strokeWidth="2.2"
                strokeLinecap="round"
                opacity="0.8"
              />
            </svg>

            {/* Logo on Top (z-10) with Faint Gold Glow */}
            <div className="relative z-10 flex items-center justify-center">
              <HaybahLogo size="navbar" variant="navbar" />
            </div>
          </div>
        </div>

        {/* Right: 22-24px Cart Icon Button with Count Badge (Vertically Centered) - Opens dedicated Cart Page */}
        <button
          type="button"
          aria-label="Open cart page"
          onClick={() => navigateTo('cart')}
          className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-[#06201A] hover:text-[#AA820A] rounded-full hover:bg-gray-100/80 transition-all active:scale-90 cursor-pointer shrink-0 z-20"
        >
          <ShoppingBag className="w-[22px] h-[22px] sm:w-[24px] sm:h-[24px] stroke-[2.2]" />
          <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 bg-[#06201A] text-[#D4AF37] border border-[#D4AF37] rounded-full text-[8.5px] font-black flex items-center justify-center leading-none shadow-xs">
            {itemCount}
          </span>
        </button>
      </div>
    </header>
  );
};
