import React from 'react';
import { ArrowRight, Flame } from 'lucide-react';
import { ALL_PRODUCTS } from '../data/mockData';
import { AutoSlideCarousel } from './AutoSlideCarousel';
import { useShop } from '../context/ShopContext';

export const FlashSaleSection: React.FC = () => {
  const { navigateTo, products } = useShop();
  const allProds = products && products.length > 0 ? products : ALL_PRODUCTS;
  const flashSaleProducts = allProds.filter((p) => p.isFlashSale && p.isActive !== false);

  return (
    <section className="py-6 px-3 sm:px-4 max-w-7xl mx-auto">
      {/* Deep Green Gradient Container (replaces red gradient) */}
      <div className="relative rounded-3xl p-4 sm:p-6 bg-gradient-to-b from-[#06201A] via-[#0B2B22] to-[#031510] border border-[#D4AF37]/30 shadow-2xl overflow-hidden">
        {/* Decorative Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-48 h-48 bg-[#E8CE7A]/5 rounded-full blur-2xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center mb-5">
          <div className="inline-flex items-center gap-1.5 text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-1">
            <Flame className="w-4 h-4 fill-[#D4AF37]" />
            <span>LIMITED TIME PROMO</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-wider uppercase font-sans">
            FLASH SALE
          </h2>

          {/* Go Shopping Button (Opens dedicated Flash Sale page) */}
          <button
            type="button"
            onClick={() => navigateTo('flash-sale')}
            className="mt-3 inline-flex items-center gap-2 px-6 py-2 rounded-full bg-black/80 hover:bg-[#D4AF37] text-white hover:text-[#06201A] font-bold text-xs sm:text-sm tracking-wide transition-all border border-[#D4AF37]/40 shadow-md active:scale-95"
          >
            <span>Go Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Horizontal Auto-Sliding Product Carousel (2 cards visible on mobile) */}
        <div className="relative z-10">
          <AutoSlideCarousel
            products={flashSaleProducts}
            autoSlideInterval={3400}
          />
        </div>
      </div>
    </section>
  );
};
