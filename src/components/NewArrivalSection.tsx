import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ALL_PRODUCTS } from '../data/mockData';
import { AutoSlideCarousel } from './AutoSlideCarousel';
import { useShop } from '../context/ShopContext';

export const NewArrivalSection: React.FC = () => {
  const { navigateTo, products } = useShop();
  const allProds = products && products.length > 0 ? products : ALL_PRODUCTS;
  const newArrivalProducts = allProds.filter((p) => p.isNewArrival && p.isActive !== false);

  return (
    <section className="py-8 px-3 sm:px-4 max-w-7xl mx-auto">
      {/* Outer Card Wrapper matching Screenshot 5 */}
      <div className="bg-white rounded-3xl p-3 sm:p-6 border border-gray-100 shadow-sm">
        {/* Gold Pill Title */}
        <div className="flex justify-center -mt-6 sm:-mt-9 mb-4">
          <div className="inline-block px-8 py-2 rounded-full bg-[#D4AF37] text-[#06201A] font-black text-sm sm:text-base uppercase tracking-wider shadow-md">
            NEW ARRIVAL
          </div>
        </div>

        {/* Wide Banner Showcase */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#06201A] via-[#0E342B] to-[#041511] text-white p-5 sm:p-8 mb-5 border border-[#D4AF37]/30 shadow-md">
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-[#06201A] text-[10px] font-extrabold uppercase tracking-widest mb-1.5">
                <Sparkles className="w-3 h-3" />
                <span>NEW ARRIVALS 2026</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black uppercase font-brand text-white tracking-wide">
                NEW ARRIVALS COLLECTION
              </h3>
              <p className="text-xs text-gray-300 mt-1 max-w-xl">
                Discover our latest seasonal drops and newly arrived premium menswear collection. Fresh styles added regularly.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigateTo('new-arrival')}
              className="shrink-0 px-6 py-2.5 rounded-full bg-[#D4AF37] hover:bg-[#B8962E] text-[#06201A] font-bold text-xs uppercase tracking-wider transition-all transform hover:scale-105 active:scale-95 shadow-sm"
            >
              Shop New Arrivals
            </button>
          </div>
        </div>

        {/* Auto-Sliding Product Carousel */}
        <AutoSlideCarousel
          products={newArrivalProducts}
          autoSlideInterval={3700}
        />

        {/* View All Button below carousel */}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => navigateTo('new-arrival')}
            className="inline-flex items-center gap-2 px-8 py-2.5 rounded-full bg-[#06201A] hover:bg-[#0B2B22] text-[#D4AF37] border border-[#D4AF37]/60 font-bold text-xs sm:text-sm tracking-wider uppercase shadow-sm transition-all active:scale-95"
          >
            <span>View All New Arrivals</span>
            <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
          </button>
        </div>
      </div>
    </section>
  );
};
