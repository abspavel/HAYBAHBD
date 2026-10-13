import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ALL_PRODUCTS } from '../data/mockData';
import { AutoSlideCarousel } from './AutoSlideCarousel';
import { useShop } from '../context/ShopContext';

export const FeaturedProductsSection: React.FC = () => {
  const { navigateTo, products } = useShop();

  const allProds = products && products.length > 0 ? products : ALL_PRODUCTS;

  // Filter featured products
  const featuredProducts = allProds.filter((p) => p.isActive !== false && p.isFeatured);
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : allProds.slice(0, 10);

  return (
    <section className="py-8 px-3 sm:px-4 max-w-7xl mx-auto">
      {/* Gold Pill Title Header */}
      <div className="flex flex-col items-center justify-center text-center mb-6">
        <div className="inline-block px-7 py-2 rounded-full bg-[#D4AF37] text-[#06201A] font-black text-sm sm:text-base uppercase tracking-wider shadow-sm">
          FEATURED PRODUCTS
        </div>
      </div>

      {/* Auto-Sliding Product Carousel */}
      <div className="mt-2">
        <AutoSlideCarousel
          products={displayProducts}
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
