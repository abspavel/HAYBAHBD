import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  ShoppingBag,
  Copy,
  Check,
  Banknote,
  CheckCircle,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { downloadInvoicePdf } from '../utils/generateInvoice';
import { Download, Home, Truck } from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    cart,
    getCartTotal,
    placeOrder,
    checkCoupon,
    trackIncompleteOrder,
    navigateTo,
    goBack,
  } = useShop();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [thana, setThana] = useState('');
  const [deliveryZone, setDeliveryZone] = useState<'Inside Dhaka' | 'Outside Dhaka'>('Inside Dhaka');
  const [copiedId, setCopiedId] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const { subtotal } = getCartTotal();
  // Delivery charge: Inside Dhaka 80 Tk, Outside Dhaka 120 Tk
  const deliveryFee = deliveryZone === 'Inside Dhaka' ? 80 : 120;
  const totalPayable = Math.max(0, subtotal - discountAmount) + deliveryFee;

  // Bangladesh phone validation: ^(\+?88)?01[3-9][0-9]{8}$
  const isBdPhone = (phone: string) => /^(\+?88)?01[3-9][0-9]{8}$/.test(phone.trim());

  const handleMobileBlur = () => {
    if (isBdPhone(mobile)) {
      trackIncompleteOrder({
        name: name.trim() || 'Shopper',
        phone: mobile.trim(),
        address: fullAddress.trim(),
        city: deliveryZone,
        district: district.trim(),
        thana: thana.trim(),
      });
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCheckingCoupon(true);
    setCouponMessage('');

    const res = await checkCoupon(couponCode);
    setCheckingCoupon(false);

    if (res.valid) {
      setDiscountAmount(res.discount);
      setCouponApplied(true);
      setCouponMessage(`✓ ${res.message}`);
    } else {
      setDiscountAmount(0);
      setCouponApplied(false);
      setCouponMessage(`✕ ${res.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim() || !fullAddress.trim() || !district.trim() || !thana.trim()) {
      alert('Please fill in your Name, Mobile Number, Full Address, District/City, and Thana.');
      return;
    }

    if (!isBdPhone(mobile)) {
      alert('Please enter a valid Bangladeshi mobile number (e.g. 017XXXXXXXX).');
      return;
    }

    await placeOrder({
      customerName: name.trim(),
      phone: mobile.trim(),
      address: fullAddress.trim(),
      district: district.trim(),
      thana: thana.trim(),
      city: deliveryZone,
      couponCode: couponApplied ? couponCode : undefined,
      discount: discountAmount,
    });
    navigateTo('thank-you');
  };

  // Ultra-Minimal Checkout View
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-5 pt-3 sm:pt-5 pb-16">
      {/* Return Button */}
      <button
        type="button"
        onClick={() => goBack()}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#06201A] hover:text-[#AA820A] mb-4 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Shopping</span>
      </button>

      {/* Clean Minimal Header */}
      <div className="text-center mb-7">
        <h1 className="text-2xl sm:text-3xl font-black text-[#06201A] tracking-tight">
          Checkout & Confirm Order
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Complete your Cash on Delivery order by entering your delivery details below
        </p>
      </div>

      {cart.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-gray-200 max-w-md mx-auto shadow-xs">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">Your Cart is Empty</h3>
          <p className="text-xs text-gray-500 mt-1 mb-4">
            Add items to your cart before proceeding to checkout.
          </p>
          <button
            type="button"
            onClick={() => navigateTo('shop')}
            className="px-6 py-2.5 rounded-full bg-[#D4AF37] text-[#06201A] font-bold text-xs uppercase shadow-sm"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form Fields (Completely clean, white, no examples) */}
          <div className="md:col-span-7 bg-white rounded-3xl p-5 sm:p-7 border border-gray-200/90 shadow-xs space-y-4">
            <div className="border-b border-gray-100 pb-2.5 flex items-center justify-between">
              <h2 className="font-black text-sm sm:text-base text-[#06201A] tracking-wide">
                Delivery Details
              </h2>
              <span className="text-[11px] font-bold text-[#AA820A] bg-[#FAF7EC] px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30">
                Cash on Delivery
              </span>
            </div>

            {/* 1. Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white text-xs sm:text-sm text-[#06201A] px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-hidden transition-all shadow-2xs"
              />
            </div>

            {/* 2. Mobile Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                onBlur={handleMobileBlur}
                placeholder="01XXXXXXXXX"
                className="w-full bg-white text-xs sm:text-sm text-[#06201A] px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-hidden transition-all shadow-2xs font-mono"
              />
            </div>

            {/* 3. District/City & Thana */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  District / City *
                </label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-white text-xs sm:text-sm text-[#06201A] px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-hidden transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Thana / Upazila *
                </label>
                <input
                  type="text"
                  required
                  value={thana}
                  onChange={(e) => setThana(e.target.value)}
                  className="w-full bg-white text-xs sm:text-sm text-[#06201A] px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-hidden transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* 4. Full Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Full Address *
              </label>
              <textarea
                required
                rows={2}
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                className="w-full bg-white text-xs sm:text-sm text-[#06201A] px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-hidden transition-all shadow-2xs"
              />
            </div>

            {/* Pure Cash on Delivery Note (Minimal & Clean) */}
            <div className="p-3 bg-[#FAF7EC]/80 rounded-2xl border border-[#D4AF37]/30 flex items-center gap-2.5 text-xs text-[#06201A]">
              <Banknote className="w-4 h-4 text-[#AA820A] shrink-0" />
              <span>
                <strong>Cash on Delivery:</strong> Pay full amount in cash after receiving and verifying your parcel.
              </span>
            </div>

            {/* 5. Delivery Area Selection (Inside Dhaka / Outside Dhaka) - Placed at the very bottom */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Delivery Area *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setDeliveryZone('Inside Dhaka')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all bg-white flex flex-col justify-between ${
                    deliveryZone === 'Inside Dhaka'
                      ? 'border-[#06201A] ring-2 ring-[#06201A] shadow-xs'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-[#06201A]">Inside Dhaka</span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        deliveryZone === 'Inside Dhaka'
                          ? 'border-[#06201A] bg-[#06201A]'
                          : 'border-gray-300'
                      }`}
                    >
                      {deliveryZone === 'Inside Dhaka' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-[11px] text-gray-500">Home Delivery</span>
                    <span className="font-black text-sm text-[#AA820A]">৳80</span>
                  </div>
                </div>

                <div
                  onClick={() => setDeliveryZone('Outside Dhaka')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all bg-white flex flex-col justify-between ${
                    deliveryZone === 'Outside Dhaka'
                      ? 'border-[#06201A] ring-2 ring-[#06201A] shadow-xs'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-[#06201A]">Outside Dhaka</span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        deliveryZone === 'Outside Dhaka'
                          ? 'border-[#06201A] bg-[#06201A]'
                          : 'border-gray-300'
                      }`}
                    >
                      {deliveryZone === 'Outside Dhaka' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-[11px] text-gray-500">Home Delivery</span>
                    <span className="font-black text-sm text-[#AA820A]">৳120</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="md:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/90 shadow-xs space-y-4">
            <h3 className="font-black text-xs uppercase tracking-wider text-gray-700 pb-2 border-b border-gray-100">
              Order Summary ({cart.length} {cart.length === 1 ? 'item' : 'items'})
            </h3>

            {/* Product items list */}
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 divide-y divide-gray-100">
              {cart.map((item) => (
                <div key={item.id} className="pt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-11 h-13 object-cover rounded-xl bg-neutral-900 border border-gray-200 shrink-0"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 line-clamp-1">{item.product.name}</p>
                      <p className="text-gray-500 text-[11px]">Size: {item.selectedSize} × {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">
                    ৳{(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Code Input */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Coupon Code (e.g. HAYBAH10)"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-300 font-mono uppercase font-bold focus:border-[#D4AF37]"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={checkingCoupon || !couponCode.trim()}
                  className="px-3.5 py-2 rounded-xl bg-[#06201A] text-[#D4AF37] font-bold text-xs uppercase tracking-wider hover:bg-[#0B2B22] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {checkingCoupon ? '...' : 'Apply'}
                </button>
              </div>
              {couponMessage && (
                <p
                  className={`text-[11px] mt-1 font-bold ${
                    couponApplied ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {couponMessage}
                </p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-gray-900">৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee:</span>
                <span className="font-semibold text-gray-900">৳{deliveryFee}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount:</span>
                  <span>-৳{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-[#06201A] pt-2 border-t border-gray-200">
                <span>Total Payable:</span>
                <span className="text-lg text-[#06201A]">৳{totalPayable.toLocaleString()}</span>
              </div>
            </div>

            {/* Big Prominent Confirm Order Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[#D4AF37] hover:bg-[#B8962E] text-[#06201A] font-black text-xs sm:text-sm uppercase tracking-wider shadow-md shadow-[#D4AF37]/20 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Confirm Order (৳{totalPayable.toLocaleString()})</span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>100% Safe Delivery & 7-Day Easy Exchange</span>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
