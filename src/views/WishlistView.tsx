import React from 'react';
import { Heart, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';
import { ALL_PRODUCTS } from '../data/mockData';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';

export const WishlistView: React.FC = () => {
  const { wishlist, navigateTo, goBack } = useShop();

  const wishlistedProducts = ALL_PRODUCTS.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#06201A] hover:text-[#AA820A] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-3 py-1 rounded-full">
          {wishlistedProducts.length} Saved Items
        </span>
      </div>

      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-full bg-[#FAF7EC] text-[#D4AF37] flex items-center justify-center mx-auto mb-2 border border-[#D4AF37]/30">
          <Heart className="w-6 h-6 fill-[#D4AF37]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#06201A] uppercase tracking-wide">
          My Wishlist
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Save your favorite streetwear pieces and order whenever you are ready.
        </p>
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="py-16 text-center text-gray-500 bg-white rounded-3xl border border-gray-100 p-8 max-w-md mx-auto">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">Your wishlist is empty</h3>
          <p className="text-xs text-gray-500 mt-1 mb-6">
            Tap the heart icon on any product to save it here for later.
          </p>
          <button
            type="button"
            onClick={() => navigateTo('shop')}
            className="px-6 py-2.5 rounded-full bg-[#D4AF37] hover:bg-[#B8962E] text-[#06201A] font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all"
          >
            Explore Streetwear
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
          {wishlistedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
