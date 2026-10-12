import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';

export interface BannerSlide {
  id: string;
  image: string;
  title?: string;
  categorySlug?: string;
  actionLink?: string;
}

export const HeroSlider: React.FC = () => {
  const { heroBanners, loadingStoreData } = useShop();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Filter active banners that have an image URL
  const activeBanners =
    heroBanners && heroBanners.length > 0
      ? heroBanners
          .filter((b) => b.isActive !== false && Boolean(b.image && b.image.trim() !== ''))
          .map((b) => ({
            id: b.id,
            image: b.image as string,
            title: b.title,
            categorySlug: b.categorySlug || '',
            actionLink: b.actionLink || 'shop',
          }))
      : [];

  const slides: BannerSlide[] = activeBanners;

  // Ensure currentIndex stays within bounds if slides length changes (e.g. banners deleted or updated in admin)
  useEffect(() => {
    if (slides.length > 0 && currentIndex >= slides.length) {
      setCurrentIndex(0);
      setPrevIndex(null);
    }
  }, [slides.length, currentIndex]);

  // Auto-transition: smoothly crossfades between banners every 5 seconds
  useEffect(() => {
    if (slides.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setPrevIndex(currentIndex);
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length, isHovered, currentIndex]);

  // Clean up previous slide reference once the 1200ms crossfade finishes
  useEffect(() => {
    if (prevIndex === null) return;
    const timeout = setTimeout(() => {
      setPrevIndex(null);
    }, 1300);
    return () => clearTimeout(timeout);
  }, [prevIndex]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || slides.length <= 1) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 45;

    if (distance > minSwipeDistance) {
      // Swiped left -> advance to next banner
      setPrevIndex(currentIndex);
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    } else if (distance < -minSwipeDistance) {
      // Swiped right -> go to previous banner
      setPrevIndex(currentIndex);
      setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  // If no slides are configured yet
  if (slides.length === 0) {
    if (loadingStoreData) {
      return (
        <div className="w-full mt-1.5 sm:mt-2 h-[160px] xs:h-[190px] sm:h-[260px] md:h-[340px] lg:h-[420px] bg-gradient-to-r from-[#06201A] via-[#0B2B22] to-[#041511] animate-pulse" />
      );
    }
    return null;
  }

  return (
    <div
      className="relative w-full overflow-hidden bg-[#06201A] mt-1.5 sm:mt-2 select-none cursor-default"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 
        Cinematic Fashion Banner Stage:
        - Smooth cross-dissolve & gentle luxury zoom transition (NO sliding / gliding)
        - Non-clickable: clicking does NOT navigate anywhere
        - Pure image: no dots, no arrows, no text overlays
      */}
      <div className="relative w-full h-[160px] xs:h-[190px] sm:h-[260px] md:h-[340px] lg:h-[420px] max-h-[460px] overflow-hidden bg-[#041511]">
        {slides.map((slide, idx) => {
          const isCurrent = idx === currentIndex;
          const isPrev = idx === prevIndex;
          const isVisible = isCurrent || isPrev;

          return (
            <div
              key={slide.id || idx}
              className={`absolute inset-0 w-full h-full overflow-hidden transition-opacity duration-[1200ms] ease-in-out ${
                isCurrent
                  ? 'opacity-100 z-10'
                  : isPrev
                  ? 'opacity-100 z-0'
                  : 'opacity-0 z-0 pointer-events-none'
              }`}
              style={{
                visibility: isVisible ? 'visible' : 'hidden',
              }}
            >
              <img
                src={slide.image}
                alt={slide.title || 'HAYBAH Hero Banner'}
                loading={idx === 0 ? 'eager' : 'lazy'}
                draggable={false}
                className={`w-full h-full object-cover object-center block pointer-events-none select-none transition-transform duration-[5500ms] ease-out ${
                  isCurrent ? 'scale-105' : 'scale-100 duration-1000'
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
