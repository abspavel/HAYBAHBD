import React, { useState } from 'react';
import { CATEGORIES } from '../data/mockData';
import { useShop } from '../context/ShopContext';

export const ShopByCategory: React.FC = () => {
  const { navigateTo, categories } = useShop();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  // Get active categories matching the 12 signature categories in the reference
  const allCategories = categories && categories.length > 0 ? categories : CATEGORIES;
  
  // The 12 categories in the exact order shown in the reference screenshot
  const displayedCategories = allCategories
    .filter((c) => c.isActive !== false)
    .slice(0, 12);

  const handleCategoryClick = (slug: string, id: string) => {
    setActiveId(id);
    setTimeout(() => {
      navigateTo('category', { category: slug });
      setActiveId(null);
    }, 120);
  };

  return (
    <section className="py-5 sm:py-7 px-3.5 sm:px-6 max-w-3xl mx-auto overflow-hidden">
      {/* 1. Header: "SHOP BY CATEGORY" with dense sharp sawtooth / zigzag underline */}
      <div className="flex flex-col items-center justify-center text-center mb-5 sm:mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-[#06201A] uppercase font-sans">
          SHOP BY CATEGORY
        </h2>

        {/* Sharp Sawtooth / Zigzag Underline (matching exact reference) */}
        <div className="mt-1 flex justify-center text-[#06201A] overflow-hidden">
          <svg
            className="w-52 xs:w-60 sm:w-72 h-3 sm:h-3.5 text-[#06201A]"
            viewBox="0 0 240 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 0 10 L 4.8 2 L 9.6 10 L 14.4 2 L 19.2 10 L 24 2 L 28.8 10 L 33.6 2 L 38.4 10 L 43.2 2 L 48 10 L 52.8 2 L 57.6 10 L 62.4 2 L 67.2 10 L 72 2 L 76.8 10 L 81.6 2 L 86.4 10 L 91.2 2 L 96 10 L 100.8 2 L 105.6 10 L 110.4 2 L 115.2 10 L 120 2 L 124.8 10 L 129.6 2 L 134.4 10 L 139.2 2 L 144 10 L 148.8 2 L 153.6 10 L 158.4 2 L 163.2 10 L 168 2 L 172.8 10 L 177.6 2 L 182.4 10 L 187.2 2 L 192 10 L 196.8 2 L 201.6 10 L 206.4 2 L 211.2 10 L 216 2 L 220.8 10 L 225.6 2 L 230.4 10 L 235.2 2 L 240 10"
              stroke="#06201A"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* 2. Grid: 4 columns x 3 rows with spacious vertical gap between rows */}
      <div className="grid grid-cols-4 gap-x-3.5 xs:gap-x-4 sm:gap-x-6 md:gap-x-8 gap-y-6 xs:gap-y-7 sm:gap-y-8 md:gap-y-10 items-start justify-items-center">
        {displayedCategories.map((cat) => {
          const isActive = activeId === cat.id;
          const isLoaded = loadedImages[cat.id];

          return (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.slug, cat.id)}
              className="group flex flex-col items-center cursor-pointer select-none w-full max-w-[60px] xs:max-w-[70px] sm:max-w-[84px] md:max-w-[96px]"
            >
              {/* 
                Card Frame:
                - Compact 3/4 aspect ratio portrait
                - Thicker, radiant pure Metallic Gold border ONLY on Left and Right (খাঁটি উজ্জ্বল গোল্ডেন বর্ডার)
                - Rounded corners
                - Clean studio image inside (কোনো টেক্সট/লেখা ছবির উপর থাকবে না)
              */}
              <div
                className={`relative w-full aspect-[3/4] rounded-[7px] sm:rounded-[10px] bg-white border-y-0 border-x-[3.5px] xs:border-x-[4px] sm:border-x-[4.5px] border-[#D4AF37] shadow-[0_3px_12px_rgba(212,175,55,0.25)] overflow-hidden transition-all duration-200 ease-out transform group-hover:-translate-y-1 group-hover:scale-[1.04] group-hover:border-[#E8CE7A] group-hover:shadow-[0_6px_20px_rgba(212,175,55,0.5)] active:scale-[0.95] active:duration-100 ${
                  isActive ? 'scale-[1.04] -translate-y-1 ring-2 ring-[#D4AF37]' : ''
                }`}
              >
                {/* Inner Image Container (No text overlay) */}
                <div className="w-full h-full relative overflow-hidden bg-white">
                  {/* Skeleton placeholder while image is loading */}
                  {!isLoaded && (
                    <div className="absolute inset-0 bg-neutral-100 animate-pulse z-0" />
                  )}

                  {/* Clean Category Photography - No Text On Image */}
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
                    className={`w-full h-full object-cover object-top transition-transform duration-300 ease-out group-hover:scale-105 ${
                      isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </div>
              </div>

              {/* 3. Category Name Text Below Card (Centered, dark, bold) */}
              <div className="mt-1 w-full min-h-[1.5rem] sm:min-h-[1.9rem] flex items-start justify-center text-center">
                <p className="text-[8.5px] xs:text-[9.5px] sm:text-[10.5px] md:text-[11px] font-bold text-[#06201A] leading-tight break-words group-hover:text-[#C5A028] transition-colors">
                  {cat.name}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
