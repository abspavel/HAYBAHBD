import React from 'react';
import { Heart, Star, ShoppingBag, Eye, Package } from 'lucide-react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';

interface ProductCardProps {
  product: Product;
  className?: string;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className = '',
  onQuickView,
}) => {
  const { addToCart, toggleWishlist, isInWishlist, navigateTo } = useShop();
  const wishlisted = isInWishlist(product.id);

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if click wasn't on button
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    navigateTo('product-detail', { product });
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative bg-white rounded-2xl overflow-hidden border border-gray-200/80 hover:border-[#D4AF37]/50 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer ${className}`}
    >
      {/* Product Image Area */}
      <div className="relative aspect-4/5 w-full bg-neutral-900 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            // Elegant fallback if network fails
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Badges: Top Left */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {(!product.inStock || (product.stockQuantity !== undefined && product.stockQuantity <= 0)) ? (
            <span className="bg-neutral-900/90 text-white font-extrabold text-[10px] tracking-wider px-2 py-0.5 rounded-full shadow-sm border border-white/20">
              OUT OF STOCK
            </span>
          ) : (
            <>
              {product.discountPercent && product.discountPercent > 0 && (
                <span className="bg-[#D4AF37] text-[#06201A] font-extrabold text-[10px] tracking-wide px-2 py-0.5 rounded-full shadow-sm">
                  -{product.discountPercent}%
                </span>
              )}
              {product.isHot && (
                <span className="bg-[#D4AF37] text-[#06201A] font-extrabold text-[10px] tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                  HOT
                </span>
              )}
            </>
          )}
        </div>

        {/* Wishlist Button: Top Right */}
        <button
          type="button"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center shadow-md transition-transform duration-200 hover:scale-110 active:scale-90 z-10 ${
            wishlisted ? 'text-[#D4AF37]' : 'text-gray-600 hover:text-[#06201A]'
          }`}
        >
          <Heart
            className="w-4 h-4 transition-colors"
            fill={wishlisted ? '#D4AF37' : 'none'}
            strokeWidth={wishlisted ? 0 : 2}
          />
        </button>

        {/* Quick View Hover Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onQuickView) onQuickView(product);
            else navigateTo('product-detail', { product });
          }}
          className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#06201A] backdrop-blur-xs"
          title="Quick Details"
        >
          <Eye className="w-3.5 h-3.5 text-[#E8CE7A]" />
        </button>
      </div>

      {/* Product Content Details */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between bg-white">
        <div>
          <h3 className="font-semibold text-xs sm:text-sm text-[#06201A] line-clamp-1 group-hover:text-[#AA820A] transition-colors">
            {product.name}
          </h3>

          {/* 5-Star Rating Line */}
          <div className="flex items-center gap-1 mt-1 text-gray-400">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="w-3 h-3 text-[#D4AF37]"
                  fill={star <= product.rating ? '#D4AF37' : 'none'}
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <span className="text-[11px] text-gray-500 font-medium">
              ({product.reviewsCount})
            </span>
          </div>

          {/* Price Row */}
          <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
            {product.originalPrice && (
              <span className="text-[11px] sm:text-xs text-gray-400 line-through">
                {formatPrice(product.originalPrice)}৳
              </span>
            )}
            <span className="text-xs sm:text-sm font-bold text-[#06201A]">
              {formatPrice(product.price)}৳
            </span>
          </div>
        </div>

        {/* ORDER NOW Button or Out of stock disabled button */}
        {(!product.inStock || (product.stockQuantity !== undefined && product.stockQuantity <= 0)) ? (
          <button
            type="button"
            disabled
            className="mt-3 w-full bg-gray-200 text-gray-400 font-bold text-[11px] sm:text-xs py-2 sm:py-2.5 px-3 rounded-lg uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <span>OUT OF STOCK</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, product.sizes[0] || 'L', 1);
              navigateTo('checkout');
            }}
            className="mt-3 w-full bg-[#0B2B22] hover:bg-[#06201A] text-[#D4AF37] border border-[#D4AF37]/50 font-black text-[11px] sm:text-xs md:text-sm py-2 sm:py-2.5 px-3 rounded-lg uppercase tracking-wider transition-all duration-200 active:scale-98 flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer"
          >
            <Package className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>ORDER NOW</span>
          </button>
        )}
      </div>
    </div>
  );
};
