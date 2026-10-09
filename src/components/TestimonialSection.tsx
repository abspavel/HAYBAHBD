import React, { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, CheckCircle2 } from 'lucide-react';
import { TESTIMONIALS } from '../data/mockData';

export const TestimonialSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const total = TESTIMONIALS.length;

  // Auto sliding carousel without pause interruption unless hovered
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused, total]);

  const prev = () =>
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  const next = () =>
    setCurrentIndex((prev) => (prev + 1) % total);

  // Touch swipe handling for mobile
  const touchStartX = useRef<number>(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    const endX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - endX;
    if (diff > 40) {
      next();
    } else if (diff < -40) {
      prev();
    }
  };

  return (
    <section className="py-8 px-3 sm:px-4 max-w-7xl mx-auto select-none">
      {/* Outer Card Container */}
      <div
        className="bg-white rounded-3xl p-5 sm:p-8 border border-[#D4AF37]/25 shadow-sm relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-[#0B2B22]/5 rounded-full blur-3xl pointer-events-none" />


        {/* Header Titles with clean minimal typography & side navigation arrows */}
        <div className="flex items-center justify-between max-w-4xl mx-auto mb-6 px-1">
          <div className="text-left">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#06201A] font-sans tracking-tight">
              Happy Clients
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-gray-500 font-medium">
              Real reviews from verified HAYBAH wearers across Bangladesh
            </p>
          </div>

          {/* Slider Arrow Controls (Top Right) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              aria-label="Previous testimonial"
              onClick={prev}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-200 bg-white hover:bg-[#0B2B22] hover:text-[#D4AF37] hover:border-[#0B2B22] text-[#06201A] flex items-center justify-center transition-all duration-200 shadow-xs active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Next testimonial"
              onClick={next}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-200 bg-white hover:bg-[#0B2B22] hover:text-[#D4AF37] hover:border-[#0B2B22] text-[#06201A] flex items-center justify-center transition-all duration-200 shadow-xs active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Multi-card side-by-side auto-slider viewport */}
        <div ref={containerRef} className="overflow-hidden max-w-5xl mx-auto">
          <div
            className="flex transition-transform duration-500 ease-out gap-4 sm:gap-5"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            {TESTIMONIALS.map((item) => (
              <div
                key={item.id}
                className="w-full shrink-0 flex flex-col md:flex-row gap-4"
              >
                {/* Primary Active Review Card */}
                <div className="w-full bg-[#FAF9F5] rounded-2xl p-6 sm:p-7 border border-[#D4AF37]/25 hover:border-[#D4AF37]/60 shadow-xs relative transition-all duration-300 flex flex-col justify-between">
                  {/* Subtle Top Quote Accent */}
                  <div className="absolute top-5 right-5 text-[#D4AF37]/20 pointer-events-none">
                    <Quote className="w-8 h-8" />
                  </div>

                  <div>
                    {/* Rating stars & verified badge */}
                    <div className="flex items-center justify-between gap-2 mb-3.5">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-4 h-4 text-[#D4AF37]"
                            fill="#D4AF37"
                            strokeWidth={0}
                          />
                        ))}
                      </div>

                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Verified Buyer</span>
                      </div>
                    </div>

                    {/* Review quote text */}
                    <p className="text-sm sm:text-base text-gray-800 leading-relaxed font-normal">
                      "{item.text}"
                    </p>
                  </div>

                  {/* Customer author footer */}
                  <div className="mt-5 pt-3.5 border-t border-gray-200/70 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0B2B22] to-[#164e3f] text-[#D4AF37] font-bold text-xs flex items-center justify-center border border-[#D4AF37]/40 shadow-xs">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#06201A] leading-tight">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-gray-500 font-medium">
                          {item.city}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                      HAYBAH Customer
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Note: Dots are removed completely as requested */}
      </div>
    </section>
  );
};
