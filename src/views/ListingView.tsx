import React, { useState, useMemo } from 'react';
import { ArrowLeft, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { ALL_PRODUCTS, CATEGORIES } from '../data/mockData';
import { ProductCard } from '../components/ProductCard';
import { useShop } from '../context/ShopContext';
import { ViewType, Product } from '../types';

interface ListingViewProps {
  viewType: ViewType;
}

export const ListingView: React.FC<ListingViewProps> = ({ viewType }) => {
  const { navigateTo, selectedCategory, searchQuery, products, categories } = useShop();

  const allProds = (products && products.length > 0 ? products : ALL_PRODUCTS).filter(
    (p) => p.isActive !== false
  );
  const allCats = categories && categories.length > 0 ? categories : CATEGORIES;

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>(
    selectedCategory || 'ALL'
  );
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  // Determine base title and items according to viewType
  const pageConfig = useMemo(() => {
    switch (viewType) {
      case 'flash-sale':
        return {
          title: 'FLASH SALE',
          items: allProds.filter((p) => p.isFlashSale),
          showCategoryTabs: true,
        };
      case 'featured':
        return {
          title: 'FEATURED DROPS',
          items: allProds.filter((p) => p.isFeatured),
          showCategoryTabs: true,
        };
      case 'new-arrival':
        return {
          title: 'NEW ARRIVALS',
          items: allProds.filter((p) => p.isNewArrival),
          showCategoryTabs: true,
        };
      case 'category':
        const cat = allCats.find((c) => c.slug === selectedCategory);
        const catName = cat ? cat.name : 'Category Collection';
        return {
          title: catName.toUpperCase(),
          items: allProds.filter((p) =>
            p.category.toLowerCase().includes(catName.toLowerCase()) ||
            catName.toLowerCase().includes(p.category.toLowerCase()) ||
            p.categorySlug === selectedCategory
          ),
          showCategoryTabs: false,
        };
      case 'shop':
      default:
        return {
          title: searchQuery ? `SEARCH: "${searchQuery}"` : 'ALL PRODUCTS',
          items: searchQuery
            ? allProds.filter(
                (p) =>
                  p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.description.toLowerCase().includes(searchQuery.toLowerCase())
              )
            : allProds,
          showCategoryTabs: true,
        };
    }
  }, [viewType, selectedCategory, searchQuery, allProds, allCats]);

  // Apply Category filter if active
  const filteredProducts = useMemo(() => {
    let list = pageConfig.items;

    if (activeCategoryFilter !== 'ALL' && viewType !== 'category') {
      list = list.filter((p) => {
        const catLower = p.category.toLowerCase();
        if (activeCategoryFilter === 'HOODIE') return catLower.includes('hoodie');
        if (activeCategoryFilter === 'SWEATSHIRT') return catLower.includes('sweatshirt');
        if (activeCategoryFilter === 'SHACKET') return catLower.includes('shacket');
        if (activeCategoryFilter === 'Y2K JERSEY') return catLower.includes('jersey');
        if (activeCategoryFilter === 'DROP SHOULDER') return catLower.includes('drop');
        if (activeCategoryFilter === 'CARGO & PANTS') return catLower.includes('cargo') || catLower.includes('sweatpants');
        if (activeCategoryFilter === 'ETHNIC & MODEST') return catLower.includes('panjabi') || catLower.includes('abaya') || catLower.includes('hijab') || catLower.includes('thobe');
        if (activeCategoryFilter === 'HEADWEAR') return catLower.includes('head') || catLower.includes('bandana');
        return true;
      });
    }

    // Sort
    return [...list].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0; // default order
    });
  }, [pageConfig.items, activeCategoryFilter, sortBy, viewType]);

  const categoryTabs = [
    'ALL',
    'HOODIE',
    'SWEATSHIRT',
    'SHACKET',
    'Y2K JERSEY',
    'DROP SHOULDER',
    'CARGO & PANTS',
    'ETHNIC & MODEST',
    'HEADWEAR',
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-3 sm:pt-4 pb-14">
      {/* Minimal Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 mb-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#06201A] hover:border-gray-400 transition-colors shrink-0"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black text-[#06201A] tracking-tight uppercase font-sans">
              {pageConfig.title}
            </h1>
            <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {filteredProducts.length}
            </span>
          </div>
        </div>

        {/* Minimal Sort Dropdown */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="text-xs font-bold text-[#06201A] bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:border-[#D4AF37] focus:outline-hidden transition-colors cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Category Filter Pills (if enabled) - Compact & Horizontally Scrollable */}
      {pageConfig.showCategoryTabs && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3 mb-3">
          {categoryTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveCategoryFilter(tab)}
              className={`shrink-0 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase transition-all ${
                activeCategoryFilter === tab
                  ? 'bg-[#06201A] text-[#D4AF37] shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:text-black hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Responsive Products Grid (2 columns on mobile, 3 on tablet, 4 on desktop) */}
      {filteredProducts.length === 0 ? (
        <div className="py-16 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
          <p className="text-base font-bold text-gray-800">No products found</p>
          <p className="text-xs text-gray-500 mt-1 mb-4">
            Try choosing a different category or clearing filters.
          </p>
          <button
            type="button"
            onClick={() => setActiveCategoryFilter('ALL')}
            className="px-5 py-2 rounded-full bg-[#D4AF37] text-[#06201A] font-bold text-xs uppercase"
          >
            Show All Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
