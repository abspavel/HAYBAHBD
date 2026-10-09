import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface AutoSlideCarouselProps {
  products: Product[];
  autoSlideInterval?: number; // ms, default 3500
  className?: string;
  cardClassName?: string;
}

export const AutoSlideCarousel: React.FC<AutoSlideCarouselProps> = ({
  products,
  autoSlideInterval = 3500,
  className = '',
  cardClassName = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Touch tracking for mobile swipe
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Number of cards to move per step: 1 card for smooth continuous progression
  const total = products.length;

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % total);
    setTimeout(() => setIsAnimating(false), 500);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
    setTimeout(() => setIsAnimating(false), 500);
  }, [total]);

  // Auto slide effect
  useEffect(() => {
    if (isPaused || total <= 2) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, autoSlideInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide, autoSlideInterval, total]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (!products || products.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        No products available in this collection.
      </div>
    );
  }

  // To achieve seamless looping display, duplicate or map items with modulo
  // On mobile: 2 cards visible (each ~50% minus gap). On tablet: 3 cards. On desktop: 4 cards.
  // Percentage to translate per index: on mobile 50%, tablet 33.333%, desktop 25%.
  return (
    <div
      className={`relative group/carousel select-none ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Left Navigation Arrow */}
      <button
        type="button"
        aria-label="Previous products"
        onClick={prevSlide}
        className="absolute -left-2.5 sm:-left-3.5 top-1/2 -translate-y-1/2 z-20 w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-white/95 text-[#06201A] hover:bg-[#D4AF37] hover:text-[#06201A] shadow-md flex items-center justify-center transition-all duration-200 active:scale-90 border border-gray-200/80"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Right Navigation Arrow */}
      <button
        type="button"
        aria-label="Next products"
        onClick={nextSlide}
        className="absolute -right-2.5 sm:-right-3.5 top-1/2 -translate-y-1/2 z-20 w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-white/95 text-[#06201A] hover:bg-[#D4AF37] hover:text-[#06201A] shadow-md flex items-center justify-center transition-all duration-200 active:scale-90 border border-gray-200/80"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Overflow Container */}
      <div className="overflow-hidden py-1 px-0.5">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            // Mobile (default): width of each card is 50%, so translate by currentIndex * 50%
            // Responsive styling via responsive CSS variable or calc
            transform: `translateX(calc(-${currentIndex} * (100% / var(--cards-visible, 2))))`,
          }}
        >
          {/* Render products (double list for smooth wrapping) */}
          {[...products, ...products].map((product, idx) => (
            <div
              key={`${product.id}-loop-${idx}`}
              className={`shrink-0 px-1.5 sm:px-2 transition-all duration-300 w-1/2 sm:w-1/3 md:w-1/4 ${cardClassName}`}
              style={{
                // Ensure CSS variable defines cards visible on various breakpoints
              }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
