import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ALL_PRODUCTS } from '../data/mockData';
import { AutoSlideCarousel } from './AutoSlideCarousel';
import { useShop } from '../context/ShopContext';

export const FeaturedProductsSection: React.FC = () => {
  const { navigateTo, products } = useShop();
  const [activeTab, setActiveTab] = useState<string>('ALL');

  const tabs = ['ALL', 'HOODIE', 'Y2K JERSEY', 'SWEATSHIRT', 'DROP SHOULDER', 'CARGO & PANTS', 'ETHNIC'];

  const allProds = products && products.length > 0 ? products : ALL_PRODUCTS;

  // Filter products by selected tab
  const featuredProducts = allProds.filter((p) => {
    if (p.isActive === false) return false;
    const cat = p.category.toLowerCase();
    if (activeTab === 'ALL') return p.isFeatured;
    if (activeTab === 'Y2K JERSEY') return cat.includes('jersey');
    if (activeTab === 'HOODIE') return cat.includes('hoodie');
    if (activeTab === 'SWEATSHIRT') return cat.includes('sweatshirt');
    if (activeTab === 'DROP SHOULDER') return cat.includes('drop');
    if (activeTab === 'CARGO & PANTS') return cat.includes('cargo') || cat.includes('sweatpants');
    if (activeTab === 'ETHNIC') return cat.includes('panjabi') || cat.includes('abaya') || cat.includes('thobe');
    return true;
  });

  return (
    <section className="py-8 px-3 sm:px-4 max-w-7xl mx-auto">
      {/* Gold Pill Title Header */}
      <div className="flex flex-col items-center justify-center text-center mb-5">
        <div className="inline-block px-7 py-2 rounded-full bg-[#D4AF37] text-[#06201A] font-black text-sm sm:text-base uppercase tracking-wider shadow-sm">
          FEATURED PRODUCTS
        </div>

        {/* Category Tab Pills */}
        <div className="mt-4 flex items-center justify-center gap-2 flex-wrap max-w-xl">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'border-2 border-[#06201A] bg-[#06201A] text-[#D4AF37] shadow-sm'
                    : 'border border-gray-300 bg-white text-gray-700 hover:border-[#D4AF37] hover:text-[#06201A]'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Auto-Sliding Product Carousel */}
      <div className="mt-2">
        <AutoSlideCarousel
          key={activeTab} // Reset index smoothly when tab changes
          products={featuredProducts.length > 0 ? featuredProducts : ALL_PRODUCTS.slice(0, 8)}
          autoSlideInterval={3600}
        />
      </div>

      {/* See All Products Button (Gold pill with up-right arrow) */}
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => navigateTo('featured')}
          className="inline-flex items-center gap-2 px-8 py-2.5 rounded-full bg-[#D4AF37] hover:bg-[#B8962E] text-[#06201A] font-extrabold text-xs sm:text-sm tracking-wide shadow-md transition-all transform hover:scale-102 active:scale-95"
        >
          <span>See all products</span>
          <span className="w-5 h-5 rounded-full bg-[#06201A] text-[#D4AF37] flex items-center justify-center">
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
          </span>
        </button>
      </div>
    </section>
  );
};
