import React, { useState } from 'react';
import {
  ArrowLeft,
  Heart,
  Star,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Ruler,
  Share2,
  Package,
} from 'lucide-react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { ALL_PRODUCTS } from '../data/mockData';
import { AutoSlideCarousel } from '../components/AutoSlideCarousel';
import { getProductSlug } from '../utils/urlHelper';

interface ProductDetailViewProps {
  product: Product;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({ product }) => {
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    navigateTo,
    goBack,
    showToast,
    setActiveOrderConfirmation,
  } = useShop();

  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || 'L');
  const [quantity, setQuantity] = useState<number>(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'delivery'>('desc');

  const galleryImages =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : [product.image];
  const [activeImage, setActiveImage] = useState<string>(product.image || galleryImages[0]);

  // Sync state when product prop changes
  React.useEffect(() => {
    setActiveImage(product.image || (product.gallery && product.gallery[0]) || '');
    if (product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product]);

  const wishlisted = isInWishlist(product.id);

  // Related products from same category or featured
  const relatedProducts = ALL_PRODUCTS.filter(
    (p) => p.id !== product.id && (p.category === product.category || p.isFeatured)
  ).slice(0, 8);

  const formatPrice = (val: number) => {
    return val.toLocaleString('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Dynamic SEO: Update document title and OpenGraph tags dynamically for this product
  React.useEffect(() => {
    const originalTitle = document.title;
    document.title = `${product.name} | HAYBAH Bangladesh - haybahbd.com`;

    const slug = getProductSlug(product);
    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonical) {
      canonical.href = `https://haybahbd.com/p/${encodeURIComponent(slug)}`;
    }

    return () => {
      document.title = originalTitle;
      if (canonical) {
        canonical.href = 'https://haybahbd.com/';
      }
    };
  }, [product]);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, quantity);
  };

  const handleBuyNow = () => {
    setActiveOrderConfirmation(null);
    const added = addToCart(product, selectedSize, quantity);
    if (added) {
      navigateTo('checkout');
    }
  };

  const handleShare = async () => {
    // Generate clean short URL with haybahbd.com domain: https://haybahbd.com/p/:slug
    const slug = getProductSlug(product);
    const shareUrl = `https://haybahbd.com/p/${slug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          url: shareUrl,
        });
        showToast('প্রোডাক্ট লিংক শেয়ার হয়েছে!');
        return;
      } catch (err: unknown) {
        // Ignore AbortError when user closes native share sheet
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
      }
    }

    // Fallback: copy to clipboard
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        showToast('প্রোডাক্ট লিংক কপি হয়েছে: ' + shareUrl);
      } else {
        showToast(shareUrl);
      }
    } catch {
      showToast(shareUrl);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-2 sm:pt-4 pb-12">
      {/* Top Breadcrumb & Back Navigation */}
      <div className="flex items-center justify-between py-2 mb-3 text-xs sm:text-sm">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-1.5 font-bold text-[#06201A] hover:text-[#AA820A] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>

        <span className="text-gray-400 text-xs hidden sm:inline-block">
          Home / {product.category} / <strong className="text-gray-700">{product.name}</strong>
        </span>
      </div>

      {/* Main PDP Grid: Starts right from the top */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10 bg-white rounded-3xl p-4 sm:p-7 border border-gray-100 shadow-xs">
        {/* Left: Product Images Gallery */}
        <div className="md:col-span-6 flex flex-col gap-3">
          <div className="relative aspect-4/5 w-full rounded-2xl bg-neutral-900 overflow-hidden border border-gray-100 shadow-xs">
            <img
              src={activeImage || product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
              decoding="async"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80';
              }}
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              {product.discountPercent && (
                <span className="bg-[#D4AF37] text-[#06201A] font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-sm">
                  -{product.discountPercent}% OFF
                </span>
              )}
              {product.isHot && (
                <span className="bg-[#D4AF37] text-[#06201A] font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-sm">
                  HOT DROP
                </span>
              )}
            </div>

            {/* Floating Action Buttons */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`w-10 h-10 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center shadow-md transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
                  wishlisted ? 'text-[#D4AF37]' : 'text-gray-600'
                }`}
                title="Wishlist"
              >
                <Heart
                  className="w-5 h-5"
                  fill={wishlisted ? '#D4AF37' : 'none'}
                  strokeWidth={wishlisted ? 0 : 2}
                />
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center shadow-md text-gray-600 hover:text-[#06201A] transition-transform hover:scale-110 cursor-pointer"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Micro Thumbnails Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {galleryImages.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImage(imgUrl)}
                className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-neutral-900 shadow-xs shrink-0 ${
                  activeImage === imgUrl
                    ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/50 scale-102'
                    : 'border-gray-200 hover:border-gray-400 opacity-80 hover:opacity-100'
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Product Details Purchase Box */}
        <div className="md:col-span-6 flex flex-col justify-between">
          <div>
            {/* Category & SKU */}
            <div className="flex items-center justify-between text-xs text-gray-400 font-semibold mb-1">
              <span className="text-[#AA820A] uppercase tracking-wider">{product.category}</span>
              <span className="font-mono text-[11px]">SKU: {product.sku}</span>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#06201A] uppercase tracking-tight">
              {product.name}
            </h1>

            {/* Rating & Stock */}
            <div className="flex items-center gap-2 mt-2 text-xs">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-3.5 h-3.5 text-[#D4AF37]"
                    fill={star <= product.rating ? '#D4AF37' : 'none'}
                    strokeWidth={1}
                  />
                ))}
              </div>
              <span className="text-gray-500 font-medium">
                {product.rating}.0 ({product.reviewsCount} reviews)
              </span>
              {(!product.inStock || (product.stockQuantity !== undefined && product.stockQuantity <= 0)) ? (
                <span className="text-rose-800 font-bold bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full text-[11px]">
                  ✕ Out of Stock
                </span>
              ) : (
                <span className="text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full text-[11px]">
                  ✓ In Stock
                </span>
              )}
            </div>

            {/* Price Box */}
            <div className="mt-4 p-4 rounded-2xl bg-[#FAF7EC] border border-[#D4AF37]/30 flex items-baseline gap-3 flex-wrap">
              <span className="text-2xl sm:text-3xl font-black text-[#06201A]">
                {formatPrice(product.price)}৳
              </span>
              {product.originalPrice && (
                <span className="text-sm sm:text-base text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}৳
                </span>
              )}
              {product.discountPercent && (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Save {product.discountPercent}%
                </span>
              )}
            </div>

            {/* Delivery Charge Callout Box */}
            <div className="mt-3.5 p-3 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-between text-xs text-gray-700">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>
                  Delivery Charge: <strong className="text-[#06201A]">Inside Dhaka ৳80</strong> | <strong className="text-[#06201A]">Outside Dhaka ৳130</strong>
                </span>
              </div>
              <span className="font-bold text-emerald-700 text-[11px] bg-emerald-50 px-2 py-0.5 rounded shrink-0">
                Cash on Delivery
              </span>
            </div>

            {/* Size Selector */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-700 uppercase">
                  Select Size: <strong className="text-[#06201A]">{selectedSize}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(!showSizeGuide)}
                  className="inline-flex items-center gap-1 text-xs text-[#AA820A] font-bold hover:underline"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Chart</span>
                </button>
              </div>

              {/* Size Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`min-w-12 py-2 px-3.5 rounded-xl text-xs font-bold uppercase transition-all ${
                      selectedSize === sz
                        ? 'bg-[#06201A] text-[#D4AF37] ring-2 ring-[#D4AF37] shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-[#D4AF37]'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>

              {/* Popover Size Guide */}
              {showSizeGuide && (
                <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 animate-in fade-in duration-200">
                  <p className="font-bold text-gray-800 mb-1">HAYBAH Size Chart (Inches):</p>
                  <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                    <div className="bg-white p-1.5 rounded border">M: Chest 42 | Length 28</div>
                    <div className="bg-white p-1.5 rounded border">L: Chest 44 | Length 29</div>
                    <div className="bg-white p-1.5 rounded border">XL: Chest 46 | Length 30</div>
                    <div className="bg-white p-1.5 rounded border">XXL: Chest 48 | Length 31</div>
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Stepper */}
            <div className="mt-4">
              <span className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                Quantity
              </span>
              <div className="flex items-center border border-gray-200 rounded-xl w-32 overflow-hidden bg-gray-50">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-200 font-bold"
                >
                  -
                </button>
                <span className="flex-1 text-center font-bold text-xs text-[#06201A]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-200 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Purchase CTA Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {(!product.inStock || (product.stockQuantity !== undefined && product.stockQuantity <= 0)) ? (
                <button
                  type="button"
                  disabled
                  className="flex-1 py-3.5 rounded-xl bg-gray-200 text-gray-400 font-extrabold text-xs sm:text-sm uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>OUT OF STOCK</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#B8962E] text-[#06201A] font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>ADD TO CART</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="flex-1 py-3.5 rounded-xl bg-[#06201A] hover:bg-[#0B2B22] text-[#D4AF37] border border-[#D4AF37]/50 font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                  >
                    <Package className="w-4 h-4 text-[#D4AF37]" />
                    <span>BUY NOW (COD)</span>
                  </button>
                </>
              )}
            </div>

            {/* Trust Badges */}
            <div className="mt-6 grid grid-cols-3 gap-2 pt-4 border-t border-gray-100 text-center">
              <div className="p-2 flex flex-col items-center text-[11px] text-gray-600">
                <Truck className="w-4 h-4 text-[#D4AF37] mb-1" />
                <span className="font-semibold text-[#06201A]">Cash on Delivery</span>
                <span>Pay After Inspecting</span>
              </div>
              <div className="p-2 flex flex-col items-center text-[11px] text-gray-600">
                <RotateCcw className="w-4 h-4 text-[#D4AF37] mb-1" />
                <span className="font-semibold text-[#06201A]">Easy Exchange</span>
                <span>7-Day Hassle Free</span>
              </div>
              <div className="p-2 flex flex-col items-center text-[11px] text-gray-600">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37] mb-1" />
                <span className="font-semibold text-[#06201A]">100% Original</span>
                <span>Premium Quality</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Specifications, Delivery */}
      <div className="mt-8 bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
        <div className="flex border-b border-gray-200 gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('desc')}
            className={`pb-3 text-xs sm:text-sm font-bold uppercase transition-all ${
              activeTab === 'desc'
                ? 'border-b-2 border-[#D4AF37] text-[#06201A]'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            Description
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`pb-3 text-xs sm:text-sm font-bold uppercase transition-all ${
              activeTab === 'specs'
                ? 'border-b-2 border-[#D4AF37] text-[#06201A]'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            Fabric & Specs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('delivery')}
            className={`pb-3 text-xs sm:text-sm font-bold uppercase transition-all ${
              activeTab === 'delivery'
                ? 'border-b-2 border-[#D4AF37] text-[#06201A]'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            Delivery Info
          </button>
        </div>

        <div className="pt-4 text-xs sm:text-sm text-gray-600 leading-relaxed">
          {activeTab === 'desc' && (
            <div>
              <p>{product.description}</p>
              <ul className="mt-3 space-y-1.5 text-gray-700 list-disc list-inside">
                <li>Heavyweight custom-milled fabric with relaxed drop-shoulder structure.</li>
                <li>Pre-shrunk fibers that retain rich color and form after multiple washes.</li>
                <li>Non-itching soft embroidery threads and long-lasting high-density print.</li>
              </ul>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-[11px] text-gray-400 font-bold uppercase block">Fabric GSM</span>
                <span className="font-bold text-gray-900">{product.gsm || 380} GSM</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-[11px] text-gray-400 font-bold uppercase block">Material</span>
                <span className="font-bold text-gray-900">{product.fabric || 'Cotton Blend'}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-[11px] text-gray-400 font-bold uppercase block">Fit Profile</span>
                <span className="font-bold text-gray-900">{product.fit || 'Oversized Street Cut'}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-[11px] text-gray-400 font-bold uppercase block">Care</span>
                <span className="font-bold text-gray-900">Machine wash cold</span>
              </div>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="space-y-2 text-gray-700">
              <p>• <strong>Inside Dhaka:</strong> Delivery fee ৳80 (Doorstep delivery within 24 to 48 hours).</p>
              <p>• <strong>Outside Dhaka:</strong> Delivery fee ৳130 (Doorstep delivery within 48 to 72 hours across 64 districts).</p>
              <p>• <strong>Payment Method:</strong> 100% Cash on Delivery — pay only after inspecting your parcel.</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section with AutoSlideCarousel */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-black text-[#06201A] uppercase tracking-wide">
            You May Also Like
          </h3>
          <button
            type="button"
            onClick={() => navigateTo('shop')}
            className="text-xs font-bold text-[#AA820A] hover:underline"
          >
            View More →
          </button>
        </div>

        <AutoSlideCarousel products={relatedProducts} autoSlideInterval={3800} />
      </div>
    </div>
  );
};
