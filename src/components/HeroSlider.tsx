import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';

interface BannerSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  tagline: string;
  actionText: string;
  categorySlug?: string;
  bgColor: string;
  accentColor: string;
}

const DEFAULT_SLIDES: BannerSlide[] = [
  {
    id: 'slide-1',
    badge: 'No #1 Streetwear Brand',
    title: 'URBAN EVOLUTION 2026',
    subtitle: 'PREMIUM DROPS & EXCLUSIVE CUTS',
    tagline: 'Engineered for those who lead with energy and edge',
    actionText: 'EXPLORE COLLECTION',
    categorySlug: 'y2k-jersey',
    bgColor: 'from-[#06201A] via-[#0B2B22] to-[#041511]',
    accentColor: '#D4AF37',
  },
  {
    id: 'slide-2',
    badge: 'Winter Capsule Collection',
    title: 'HEAVYWEIGHT HOODIES',
    subtitle: '420 GSM FRENCH TERRY & CORD SHACKETS',
    tagline: 'Signature warmth with architectural oversized draping',
    actionText: 'SHOP WINTER DROPS',
    categorySlug: 'premium-hoodie',
    bgColor: 'from-[#091E19] via-[#102B23] to-[#061814]',
    accentColor: '#E8CE7A',
  },
  {
    id: 'slide-3',
    badge: 'Limited Edition Drop',
    title: 'Y2K MOTOR JERSEYS',
    subtitle: 'RETRO ATHLETIC APPAREL IN BANGLADESH',
    tagline: 'Authentic mesh with double stitched number graphics',
    actionText: 'VIEW JERSEYS',
    categorySlug: 'y2k-jersey',
    bgColor: 'from-[#12241D] via-[#0B2B22] to-[#051510]',
    accentColor: '#D4AF37',
  },
];

export const HeroSlider: React.FC = () => {
  const { navigateTo, heroBanners } = useShop();
  const [currentSlide, setCurrentSlide] = useState(0);

  const activeBanners = heroBanners && heroBanners.length > 0
    ? heroBanners.filter((b) => b.isActive !== false)
    : [];

  const slides: BannerSlide[] = activeBanners.length > 0
    ? activeBanners.map((b) => ({
        id: b.id,
        badge: b.badge || 'Featured Drop',
        title: b.title,
        subtitle: b.subtitle || '',
        tagline: b.tagline || '',
        actionText: b.actionText || 'EXPLORE COLLECTION',
        categorySlug: b.categorySlug || 'shop',
        bgColor: b.bgColor || 'from-[#06201A] via-[#0B2B22] to-[#041511]',
        accentColor: b.accentColor || '#D4AF37',
      }))
    : DEFAULT_SLIDES;

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prev = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const next = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  const active = slides[currentSlide];
  return (
    <div className="relative w-full overflow-hidden bg-[#06201A] text-white mt-1.5 sm:mt-2">
      {/* Banner Viewport - Slightly larger with comfortable breathing room */}
      <div className={`relative h-[155px] sm:h-[185px] md:h-[215px] lg:h-[235px] min-h-[155px] bg-gradient-to-r ${active.bgColor} transition-all duration-700 flex items-center justify-center`}>
        {/* Subtle Geometric Overlay */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-64 h-64 rounded-full bg-[#D4AF37]/15 blur-2xl pointer-events-none" />

        {/* Banner Content Container */}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-8 py-2.5 sm:py-3.5 md:py-4.5 w-full flex flex-col items-center text-center z-10">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] text-[9.5px] sm:text-[10.5px] md:text-xs font-bold uppercase tracking-widest mb-1 sm:mb-1.5 backdrop-blur-xs">
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#E8CE7A]" />
            <span>{active.badge}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-base sm:text-2xl md:text-3xl lg:text-3xl font-black tracking-tight text-white font-brand uppercase leading-tight">
            {active.title}
          </h1>

          {/* Subtitle */}
          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs md:text-sm font-bold text-[#D4AF37] tracking-wider uppercase">
            {active.subtitle}
          </p>

          {/* Tagline */}
          <p className="hidden sm:block mt-1 max-w-lg text-[11px] sm:text-xs text-gray-300 font-normal line-clamp-1">
            {active.tagline}
          </p>

          {/* CTA Button */}
          <button
            type="button"
            onClick={() => navigateTo('shop', { category: active.categorySlug })}
            className="mt-2 sm:mt-2.5 px-4 py-1.5 sm:px-6 sm:py-2 rounded-full bg-[#D4AF37] hover:bg-[#B8962E] text-[#06201A] font-extrabold text-[10px] sm:text-xs tracking-wider uppercase shadow-md shadow-[#D4AF37]/25 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            {active.actionText} →
          </button>
        </div>

        {/* Left Arrow Button */}
        <button
          type="button"
          aria-label="Previous slide"
          onClick={prev}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/45 hover:bg-[#D4AF37] text-white hover:text-[#06201A] backdrop-blur-xs flex items-center justify-center transition-all cursor-pointer shadow-md"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Right Arrow Button */}
        <button
          type="button"
          aria-label="Next slide"
          onClick={next}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/45 hover:bg-[#D4AF37] text-white hover:text-[#06201A] backdrop-blur-xs flex items-center justify-center transition-all cursor-pointer shadow-md"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Slide Indicator Dots */}
      <div className="absolute bottom-1.5 sm:bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`Go to slide ${idx + 1}`}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentSlide ? 'w-5 sm:w-6 bg-[#D4AF37]' : 'w-2 bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
