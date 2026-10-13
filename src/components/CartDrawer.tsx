import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartQuantity,
    getCartTotal,
    navigateTo,
  } = useShop();

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  const { subtotal, deliveryFee, total, itemCount } = getCartTotal();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'HAYBAH10') {
      const discount = Math.round(subtotal * 0.1);
      setDiscountAmount(discount);
      setCouponApplied(true);
    } else {
      alert('Invalid coupon code. Try "HAYBAH10" for 10% off!');
    }
  };

  const finalTotal = Math.max(0, total - discountAmount);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 bg-[#06201A] text-white flex items-center justify-between border-b border-[#D4AF37]/30">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="font-bold text-base uppercase tracking-wider">
                Shopping Cart ({itemCount})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery Notice */}
          <div className="bg-[#FAF7EC] px-4 py-2 border-b border-[#D4AF37]/20 flex items-center justify-between text-xs text-[#06201A]">
            <span className="font-semibold text-gray-700">
              Delivery: <strong className="text-[#06201A]">Inside Dhaka ৳80</strong> | <strong className="text-[#06201A]">Outside Dhaka ৳120</strong>
            </span>
            <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
              Cash on Delivery
            </span>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-gray-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-gray-800 text-base mb-1">
                  Your cart is empty
                </h3>
                <p className="text-xs text-gray-500 mb-6">
                  Explore our premium hoodies, jerseys, and streetwear collections.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    navigateTo('shop');
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#D4AF37] hover:bg-[#B8962E] text-[#06201A] font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="py-3.5 flex gap-3">
                  {/* Thumbnail */}
                  <div className="w-18 h-22 rounded-lg bg-neutral-900 overflow-hidden shrink-0 border border-gray-200">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-xs sm:text-sm text-[#06201A] line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                        <span className="font-medium bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">
                          Size: {item.selectedSize}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-[#06201A]">
                          ৳{item.product.price.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="p-1 px-2 hover:bg-gray-200 text-gray-600 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-[#06201A]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="p-1 px-2 hover:bg-gray-200 text-gray-600 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-extrabold text-xs sm:text-sm text-[#06201A]">
                        ৳{(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Calculations */}
          {cart.length > 0 && (
            <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
              {/* Promo Coupon */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon code (e.g. HAYBAH10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={couponApplied}
                  className="flex-1 bg-white text-xs px-3 py-2 rounded-lg border border-gray-200 uppercase focus:border-[#D4AF37] focus:outline-hidden"
                />
                <button
                  type="submit"
                  disabled={couponApplied}
                  className="px-3.5 py-2 bg-[#06201A] text-[#D4AF37] rounded-lg text-xs font-bold uppercase transition-colors hover:bg-[#0B2B22] disabled:opacity-50"
                >
                  {couponApplied ? 'Applied' : 'Apply'}
                </button>
              </form>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-gray-600 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-800">
                    ৳{subtotal.toLocaleString()}
                  </span>
                </div>

                {couponApplied && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount (10%)</span>
                    <span>-৳{discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="font-semibold text-gray-800">
                    ৳80 (Inside Dhaka) / ৳130 (Outside Dhaka)
                  </span>
                </div>

                <div className="flex justify-between text-sm sm:text-base font-extrabold text-[#06201A] pt-2 border-t border-gray-200">
                  <span>Total Amount</span>
                  <span>৳{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  navigateTo('checkout');
                }}
                className="w-full py-3 rounded-xl bg-[#D4AF37] hover:bg-[#B8962E] text-[#06201A] font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cash on Delivery available nationwide</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
