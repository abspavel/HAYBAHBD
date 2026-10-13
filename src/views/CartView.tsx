import React, { useState } from 'react';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Sparkles,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const CartView: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    getCartTotal,
    navigateTo,
    goBack,
    clearCart,
  } = useShop();

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');

  const { subtotal, itemCount } = getCartTotal();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (couponCode.trim().toUpperCase() === 'HAYBAH10') {
      const discount = Math.round(subtotal * 0.1);
      setDiscountAmount(discount);
      setCouponApplied(true);
    } else {
      setCouponError('Invalid code. Use "HAYBAH10" for 10% off!');
    }
  };

  const deliveryInsideDhaka = 80;
  const deliveryOutsideDhaka = 130;
  const finalSubtotalWithDiscount = Math.max(0, subtotal - discountAmount);

  return (
    <div className="min-h-[75vh] max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10 select-none">
      {/* Top Breadcrumb & Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8 pb-4 border-b border-gray-200">
        <div>
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#06201A] transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </button>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[#06201A] tracking-tight uppercase font-sans">
              Shopping Cart
            </h1>
            <span className="bg-[#FAF7EC] border border-[#D4AF37]/50 text-[#AA820A] font-extrabold text-xs px-2.5 py-0.5 rounded-full">
              {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
            </span>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="self-start sm:self-auto text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        /* Empty Cart State - Luxury Minimalist */
        <div className="bg-white rounded-3xl p-8 sm:p-14 border border-[#D4AF37]/25 shadow-xs flex flex-col items-center justify-center text-center max-w-xl mx-auto my-6">
          <div className="w-20 h-20 rounded-full bg-[#06201A] text-[#D4AF37] flex items-center justify-center mb-5 shadow-lg shadow-[#06201A]/10">
            <ShoppingBag className="w-9 h-9 stroke-[1.8]" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-[#06201A] uppercase tracking-tight mb-2">
            Your Cart is Empty
          </h2>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-sm mb-7">
            You haven’t added any premium heavyweight hoodies, graphic t-shirts, or signature pieces to your bag yet.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => navigateTo('shop')}
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#D4AF37] hover:bg-[#B8962E] text-[#06201A] font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-sm transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Explore Men's Collection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => navigateTo('new-arrival')}
              className="w-full sm:w-auto px-6 py-3 rounded-full border border-gray-300 hover:border-[#06201A] text-[#06201A] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              New Arrivals
            </button>
          </div>
        </div>
      ) : (
        /* Cart Grid Layout: Items on Left, Order Summary on Right */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {/* Nationwide Banner */}
            <div className="bg-[#06201A] text-white rounded-2xl p-3.5 sm:p-4 border border-[#D4AF37]/30 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-[#D4AF37] shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-[#FFF3B0]">
                    Fast Delivery Available Across Bangladesh
                  </p>
                  <p className="text-gray-300 text-[11px]">
                    Inside Dhaka ৳80 (24-48 Hours) • Outside Dhaka ৳130 (48-72 Hours)
                  </p>
                </div>
              </div>
              <span className="shrink-0 hidden sm:inline-block bg-[#D4AF37] text-[#06201A] font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                Cash On Delivery
              </span>
            </div>

            {/* Items Container */}
            <div className="bg-white rounded-2xl border border-gray-200/90 divide-y divide-gray-100 overflow-hidden shadow-xs">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3.5 sm:gap-5 hover:bg-gray-50/60 transition-colors"
                >
                  {/* Product Thumbnail */}
                  <div
                    onClick={() =>
                      navigateTo('product-detail', { product: item.product })
                    }
                    className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200 cursor-pointer group"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Info Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#AA820A]">
                          {item.product.category}
                        </span>
                        <h3
                          onClick={() =>
                            navigateTo('product-detail', { product: item.product })
                          }
                          className="font-bold text-sm sm:text-base text-[#06201A] line-clamp-1 hover:text-[#AA820A] cursor-pointer transition-colors"
                        >
                          {item.product.name}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Selected Size Badge & Price */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-md">
                        Size: <strong className="text-[#06201A]">{item.selectedSize}</strong>
                      </span>
                      {item.product.gsm && (
                        <span className="text-[10px] text-gray-500 font-semibold">
                          {item.product.gsm} GSM
                        </span>
                      )}
                    </div>

                    {/* Bottom Controls Row: Quantity Selector & Line Item Price */}
                    <div className="mt-3 flex items-center justify-between">
                      {/* Quantity Selector */}
                      <div className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5 shadow-2xs">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity - 1)
                          }
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-white hover:bg-gray-100 text-[#06201A] transition-colors cursor-pointer active:scale-95 shadow-2xs"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-9 text-center text-xs font-black text-[#06201A]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity + 1)
                          }
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-white hover:bg-gray-100 text-[#06201A] transition-colors cursor-pointer active:scale-95 shadow-2xs"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Total for this line */}
                      <div className="text-right">
                        <div className="text-sm sm:text-base font-black text-[#06201A]">
                          ৳{(item.product.price * item.quantity).toLocaleString()}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-[10px] text-gray-500 font-medium">
                            ৳{item.product.price} each
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Assurances */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white border border-gray-200/80 flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-gray-700">100% Original Brand</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-gray-200/80 flex items-center gap-2 text-xs">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span className="font-semibold text-gray-700">Cash On Delivery</span>
              </div>
              <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-white border border-gray-200/80 flex items-center gap-2 text-xs">
                <Sparkles className="w-4 h-4 text-[#06201A] shrink-0" />
                <span className="font-semibold text-gray-700">7 Days Easy Return</span>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Checkout Card */}
          <div className="lg:col-span-4 sticky top-20">
            <div className="bg-white rounded-2xl border border-[#D4AF37]/35 p-5 sm:p-6 shadow-sm space-y-5">
              <h2 className="text-base sm:text-lg font-black text-[#06201A] uppercase tracking-wide border-b border-gray-100 pb-3 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs text-[#AA820A] font-bold">
                  {itemCount} Items
                </span>
              </h2>

              {/* Coupon Code Section */}
              <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Promo Code</span>
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Try HAYBAH10"
                    disabled={couponApplied}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#D4AF37] uppercase font-bold tracking-wider disabled:bg-gray-100"
                  />
                  <button
                    type="submit"
                    disabled={couponApplied || !couponCode.trim()}
                    className="px-4 py-2 bg-[#06201A] hover:bg-[#0B2B22] text-[#D4AF37] font-bold text-xs rounded-xl disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {couponApplied && (
                  <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Coupon applied! 10% discount unlocked.</span>
                  </p>
                )}
                {couponError && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">
                    {couponError}
                  </p>
                )}
              </form>

              {/* Cost Calculation */}
              <div className="space-y-2.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#06201A]">
                    ৳{subtotal.toLocaleString()}
                  </span>
                </div>

                {couponApplied && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount (10%)</span>
                    <span>-৳{discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between items-start">
                  <div>
                    <span>Delivery Charge</span>
                    <p className="text-[10px] text-gray-400">
                      Inside Dhaka ৳{deliveryInsideDhaka} / Outside ৳{deliveryOutsideDhaka}
                    </p>
                  </div>
                  <span className="font-bold text-[#06201A]">
                    ৳{deliveryInsideDhaka} - ৳{deliveryOutsideDhaka}
                  </span>
                </div>

                {/* Final Total Row */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-extrabold text-[#06201A]">
                      Estimated Total
                    </span>
                    <div className="text-right">
                      <span className="text-xl font-black text-[#06201A]">
                        ৳{(finalSubtotalWithDiscount + deliveryInsideDhaka).toLocaleString()}
                      </span>
                      <span className="block text-[10px] text-gray-500 font-medium">
                        (With Dhaka delivery)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary Action Button: Proceed to Checkout */}
              <button
                type="button"
                onClick={() => navigateTo('checkout')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#FFF3B0] to-[#D4AF37] text-[#06201A] font-black text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer border border-[#D4AF37]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={() => navigateTo('shop')}
                className="w-full py-2.5 rounded-xl border border-gray-200 hover:border-[#06201A] text-[#06201A] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Add More Items
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
