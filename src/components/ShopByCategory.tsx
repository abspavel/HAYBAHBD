import React, { useState, useEffect, useRef } from 'react';
import { CATEGORIES } from '../data/mockData';
import { useShop } from '../context/ShopContext';
import { ArrowRight } from 'lucide-react';

export const ShopByCategory: React.FC = () => {
  const { navigateTo, categories } = useShop();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [hasEntered, setHasEntered] = useState<boolean>(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  // 1. Scroll-in Entrance via IntersectionObserver (triggers once)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Respect user's motion preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setHasEntered(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Display all active categories in clean grid
  const displayedCategories = (categories && categories.length > 0 ? categories : CATEGORIES).filter(
    (c) => c.isActive !== false
  );

  const handleCategoryClick = (slug: string, id: string) => {
    setActiveId(id);
    setTimeout(() => {
      navigateTo('category', { category: slug });
      setActiveId(null);
    }, 150);
  };

  return (
    <section ref={sectionRef} className="py-5 px-3 sm:px-4 max-w-7xl mx-auto overflow-hidden">
      {/* Scoped CSS animations for Floating Idle and Gold Border Shine */}
      <style>{`
        @keyframes catFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        @keyframes catGoldShine {
          0%, 15% {
            transform: translateX(-160%) skewX(-25deg);
            opacity: 0;
          }
          20% {
            opacity: 0.7;
          }
          35% {
            transform: translateX(190%) skewX(-25deg);
            opacity: 0;
          }
          100% {
            transform: translateX(190%) skewX(-25deg);
            opacity: 0;
          }
        }

        .cat-float-anim {
          animation: catFloat 3.5s ease-in-out infinite;
          will-change: transform;
        }

        .cat-shine-anim {
          animation: catGoldShine 4.5s ease-in-out infinite;
          will-change: transform, opacity;
        }

        @media (prefers-reduced-motion: reduce) {
          .cat-float-anim {
            animation: none !important;
          }
          .cat-shine-anim {
            animation: none !important;
          }
        }
      `}</style>

      {/* 1. Heading: Centered "SHOP BY CATEGORY" with scroll-in fade/slide & animated wavy underline */}
      <div
        className={`flex flex-col items-center justify-center text-center mb-4 sm:mb-5 transition-all duration-700 ease-out ${
          hasEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
      >
        <h2 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight text-[#06201A] uppercase font-sans">
          SHOP BY CATEGORY
        </h2>

        {/* Dense wavy underline in deep green #0B2B22 with SVG draw animation from left to right */}
        <div className="mt-0.5 sm:mt-1 flex justify-center text-[#0B2B22] overflow-hidden">
          <svg
            className="w-32 sm:w-44 h-2.5 sm:h-3 text-[#0B2B22]"
            viewBox="0 0 160 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 0 5 
                 Q 2.86 1.5, 5.71 5 T 11.43 5 
                 T 17.14 5 T 22.86 5 
                 T 28.57 5 T 34.29 5 
                 T 40.00 5 T 45.71 5 
                 T 51.43 5 T 57.14 5 
                 T 62.86 5 T 68.57 5 
                 T 74.29 5 T 80.00 5 
                 T 85.71 5 T 91.43 5 
                 T 97.14 5 T 102.86 5 
                 T 108.57 5 T 114.29 5 
                 T 120.00 5 T 125.71 5 
                 T 131.43 5 T 137.14 5 
                 T 142.86 5 T 148.57 5 
                 T 154.29 5 T 160.00 5"
              stroke="#0B2B22"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
              style={{
                strokeDasharray: 220,
                strokeDashoffset: hasEntered ? 0 : 220,
                transition: 'stroke-dashoffset 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.15s',
              }}
            />
          </svg>
        </div>
      </div>

      {/* 2. Grid: 4 columns mobile, 6 tablet, 8 desktop. items-start aligns all cards to top baseline */}
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-x-2.5 sm:gap-x-3.5 gap-y-3.5 sm:gap-y-4 items-start">
        {displayedCategories.map((cat, index) => {
          const isActive = activeId === cat.id;
          const isLoaded = loadedImages[cat.id];
          const staggerDelay = `${index * 70}ms`;
          const floatDelay = `${(index * 0.35) % 3.5}s`;
          const shineDelay = `${(index * 0.42) % 4.5}s`;

          return (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.slug, cat.id)}
              className="group flex flex-col items-center cursor-pointer select-none w-full"
              style={{
                opacity: hasEntered ? 1 : 0,
                transform: hasEntered ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.9)',
                transition: `opacity 500ms cubic-bezier(0.22, 1, 0.36, 1) ${staggerDelay}, transform 500ms cubic-bezier(0.22, 1, 0.36, 1) ${staggerDelay}`,
              }}
            >
              {/* Floating Idle Wrapper: Subtle 3px wave loop that pauses on hover/press */}
              <div
                className="w-full cat-float-anim group-hover:[animation-play-state:paused] group-active:[animation-play-state:paused]"
                style={{
                  animationDelay: floatDelay,
                }}
              >
                {/* Card Frame:
                    - Exact 3/4 aspect ratio
                    - Thick metallic gold border (5-6px), 12-14px rounded corners
                    - Soft gold shadow
                    - Hover / tap: lifts up 6px (-translate-y-1.5), scales to 1.05, brighter gold shadow
                    - Press (active): tactile scale-down to 0.96
                */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #B8962E 0%, #E8CE7A 35%, #D4AF37 70%, #B8962E 100%)',
                  }}
                  className={`relative w-full aspect-[3/4] rounded-[12px] sm:rounded-[14px] p-[5px] sm:p-[6px] shadow-[0_3px_8px_rgba(212,175,55,0.35)] transition-all duration-300 ease-out transform group-hover:-translate-y-1.5 group-hover:scale-[1.05] group-hover:shadow-[0_10px_22px_rgba(212,175,55,0.55),0_0_12px_rgba(232,206,122,0.4)] active:scale-[0.96] active:translate-y-0 active:duration-100 ${
                    isActive ? 'scale-[1.05] -translate-y-1.5 ring-2 ring-[#0B2B22] shadow-[0_10px_24px_rgba(212,175,55,0.6)]' : ''
                  }`}
                >
                  {/* Diagonal Gold Border Shine sweep */}
                  <div className="absolute inset-0 rounded-[12px] sm:rounded-[14px] overflow-hidden pointer-events-none z-10">
                    <div
                      className="absolute inset-y-0 -inset-x-8 bg-gradient-to-r from-transparent via-white/45 to-transparent cat-shine-anim"
                      style={{
                        animationDelay: shineDelay,
                      }}
                    />
                  </div>

                  {/* Decorative notch on right edge: deep green (#0B2B22), 4px wide, 10px tall, vertically centered */}
                  <span
                    aria-hidden="true"
                    className="absolute -right-[1px] top-1/2 -translate-y-1/2 w-[3.5px] sm:w-[4px] h-[9px] sm:h-[10px] bg-[#0B2B22] rounded-l-[2px] z-20 pointer-events-none"
                  />

                  {/* Inner white gap: 1.5px white frame directly separating metallic gold border from image */}
                  <div className="w-full h-full rounded-[8px] sm:rounded-[9px] p-[1.5px] bg-white overflow-hidden relative">
                    <div className="w-full h-full rounded-[6.5px] sm:rounded-[7.5px] overflow-hidden relative bg-[#F4F4F0]">
                      {/* Light skeleton placeholder while loading */}
                      {!isLoaded && (
                        <div className="absolute inset-0 bg-neutral-200 animate-pulse z-0" />
                      )}

                      {/* Category Image:
                          - object-fit: cover, object-position: center top
                          - Zoom slowly to 1.1 on hover
                          - NO text or badge overlay on top of the image (as strictly requested)
                      */}
                      <img
                        src={cat.image}
                        alt={cat.name}
                        loading="lazy"
                        onLoad={() => setLoadedImages((prev) => ({ ...prev, [cat.id]: true }))}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80';
                          setLoadedImages((prev) => ({ ...prev, [cat.id]: true }));
                        }}
                        className={`w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-110 ${
                          isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                      />

                      {/* Subtle bottom dark gradient for smooth contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Category Name Text: Below card, centered, dark green (#0B2B22), font size 13px,
                  changes to dark gold (#B8962E) on hover with a thin gold underline growing from center.
                  Fixed height container ensures identical baseline across all rows. */}
              <div className="mt-1.5 w-full h-[2.85rem] sm:h-[3.25rem] flex items-start justify-center">
                <div className="relative inline-block text-center px-0.5">
                  <p className="text-[11.5px] sm:text-[13px] font-normal text-center text-[#0B2B22] leading-[1.25] break-words group-hover:text-[#B8962E] transition-colors duration-200">
                    {cat.name}
                  </p>
                  {/* Thin gold underline growing from center on hover */}
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-[1.5px] bg-[#B8962E] rounded-full transition-all duration-300 ease-out w-0 group-hover:w-full pointer-events-none"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. "View All Categories" Gold Pill Button */}
      <div
        className={`mt-4 sm:mt-5 flex justify-center transition-all duration-700 delay-300 ease-out ${
          hasEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <button
          type="button"
          onClick={() => navigateTo('shop')}
          className="inline-flex items-center gap-2 px-6 py-2.5 sm:px-7 sm:py-3 rounded-full bg-gradient-to-r from-[#B8962E] via-[#E8CE7A] to-[#D4AF37] text-[#06201A] hover:brightness-105 active:scale-95 text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-200 shadow-[0_3px_10px_rgba(212,175,55,0.35)] hover:shadow-[0_5px_16px_rgba(212,175,55,0.5)] cursor-pointer"
        >
          <span>View All Categories</span>
          <ArrowRight className="w-4 h-4 text-[#06201A]" />
        </button>
      </div>
    </section>
  );
};
