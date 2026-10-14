import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  Trash2,
  Loader2,
  Copy,
  Check,
  ShoppingBag,
  Truck,
  ArrowRight,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { CartItem, OrderDetails } from '../types';
import { supabase } from '../lib/supabase';

export const CheckoutModal: React.FC = () => {
  const {
    cart,
    products,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    placeOrder,
    checkCoupon,
    trackIncompleteOrder,
    siteSettings,
    navigateTo,
    setIsTrackOrderModalOpen,
    showToast,
  } = useShop();

  // Current Step: 2 = Billing Information, 3 = Confirmation
  const [currentStep, setCurrentStep] = useState<2 | 3>(2);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderDetails | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [deliveryArea, setDeliveryArea] = useState<'' | 'ঢাকার ভিতরে' | 'ঢাকার বাইরে'>('');
  const [orderNote, setOrderNote] = useState('');

  // Form Validation & Errors
  const [errors, setErrors] = useState<{
    name?: string;
    mobile?: string;
    fullAddress?: string;
    deliveryArea?: string;
  }>({});
  const [touched, setTouched] = useState<{
    name?: boolean;
    mobile?: boolean;
    fullAddress?: boolean;
    deliveryArea?: boolean;
  }>({});

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponStatus, setCouponStatus] = useState<{
    type: 'idle' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  // Delivery Charges from Supabase siteSettings
  const insideCharge = Number(siteSettings?.shippingInsideDhaka ?? 80);
  const outsideCharge = Number(siteSettings?.shippingOutsideDhaka ?? 130);

  const deliveryFee =
    deliveryArea === 'ঢাকার ভিতরে'
      ? insideCharge
      : deliveryArea === 'ঢাকার বাইরে'
      ? outsideCharge
      : 0;

  // Real-time calculation of subtotal with fresh product prices
  const subtotal = cart.reduce((sum, item) => {
    const liveProd = products.find((p) => p.id === item.productId) || item.product;
    return sum + (liveProd?.price ?? item.product.price) * item.quantity;
  }, 0);

  const totalPayable = Math.max(0, subtotal - discountAmount) + deliveryFee;

  // Phone Validation: ^(\+?88)?01[3-9][0-9]{8}$
  const isBdPhone = (phone: string) =>
    /^(\+?88)?01[3-9][0-9]{8}$/.test(phone.trim().replace(/[\s-]/g, ''));

  // Debounced auto-save for incomplete order
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerIncompleteOrderSave = () => {
    const cleanPhone = mobile.trim().replace(/[\s-]/g, '');
    if (isBdPhone(cleanPhone) && cart.length > 0) {
      trackIncompleteOrder({
        name: name.trim() || 'Guest Shopper',
        phone: cleanPhone,
        address: fullAddress.trim(),
        city: deliveryArea || 'Unspecified',
        district: deliveryArea === 'ঢাকার ভিতরে' ? 'Dhaka' : 'Outside Dhaka',
        thana: deliveryArea || 'Pending',
      });
    }
  };

  const handleMobileBlur = () => {
    setTouched((prev) => ({ ...prev, mobile: true }));
    const cleanPhone = mobile.trim().replace(/[\s-]/g, '');
    if (cleanPhone && !isBdPhone(cleanPhone)) {
      setErrors((prev) => ({
        ...prev,
        mobile: '১১ ডিজিটের সঠিক মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX)',
      }));
    } else {
      setErrors((prev) => ({ ...prev, mobile: undefined }));
      triggerIncompleteOrderSave();
    }
  };

  // Debounce phone input changes
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    const cleanPhone = mobile.trim().replace(/[\s-]/g, '');
    if (isBdPhone(cleanPhone)) {
      debounceTimerRef.current = setTimeout(() => {
        triggerIncompleteOrderSave();
      }, 1500);
    }
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [mobile, name, fullAddress, deliveryArea]);

  // Handle Coupon Apply
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponCode.trim();
    if (!cleanCode) return;

    setCheckingCoupon(true);
    setCouponStatus({ type: 'idle', message: '' });

    try {
      const res = await checkCoupon(cleanCode);
      if (res.valid) {
        setDiscountAmount(res.discount);
        setCouponApplied(true);
        setCouponStatus({
          type: 'success',
          message: `৳${res.discount.toLocaleString('en-BD')} ডিসকাউন্ট সফলভাবে যুক্ত হয়েছে!`,
        });
        showToast('কুপন সফলভাবে প্রয়োগ করা হয়েছে!', 'success');
      } else {
        setDiscountAmount(0);
        setCouponApplied(false);
        setCouponStatus({
          type: 'error',
          message: res.message || 'কুপনটি সঠিক নয় অথবা মেয়াদোত্তীর্ণ।',
        });
      }
    } catch {
      setDiscountAmount(0);
      setCouponApplied(false);
      setCouponStatus({
        type: 'error',
        message: 'কুপন যাচাই করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
      });
    } finally {
      setCheckingCoupon(false);
    }
  };

  // Quantity Change Handler respecting stock
  const handleQuantityChange = (item: CartItem, newQty: number) => {
    const liveProd = products.find((p) => p.id === item.productId) || item.product;
    const maxStock = liveProd.stockQuantity;

    if (newQty <= 0) {
      removeFromCart(item.id);
      return;
    }

    if (maxStock !== undefined && maxStock > 0 && newQty > maxStock) {
      showToast(`সর্বোচ্চ স্টক উপলব্ধ: ${maxStock} টি`, 'info');
      return;
    }

    updateCartQuantity(item.id, newQty);
  };

  // Form Submit Handler
  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields
    const newErrors: {
      name?: string;
      mobile?: string;
      fullAddress?: string;
      deliveryArea?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = 'সম্পূর্ণ নামটি লিখুন';
    }

    const cleanPhone = mobile.trim().replace(/[\s-]/g, '');
    if (!cleanPhone) {
      newErrors.mobile = 'মোবাইল নাম্বারটি লিখুন';
    } else if (!isBdPhone(cleanPhone)) {
      newErrors.mobile = '১১ ডিজিটের সঠিক মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX)';
    }

    if (!fullAddress.trim()) {
      newErrors.fullAddress = 'সম্পূর্ণ ঠিকানা লিখুন';
    }

    if (!deliveryArea) {
      newErrors.deliveryArea = 'অনুগ্রহ করে ডেলিভারি এলাকা সিলেক্ট করুন';
    }

    setErrors(newErrors);
    setTouched({
      name: true,
      mobile: true,
      fullAddress: true,
      deliveryArea: true,
    });

    if (Object.keys(newErrors).length > 0) {
      // Scroll to the first error
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    if (cart.length === 0) {
      showToast('আপনার কার্ট খালি রয়েছে!', 'info');
      return;
    }

    setIsSubmitting(true);

    try {
      // Capture items before clearing
      const orderItemsSnapshot = [...cart];

      const placed = await placeOrder({
        customerName: name.trim(),
        phone: cleanPhone,
        address: fullAddress.trim(),
        district: deliveryArea === 'ঢাকার ভিতরে' ? 'Dhaka' : 'Outside Dhaka',
        thana: deliveryArea,
        city: deliveryArea,
        couponCode: couponApplied ? couponCode.trim() : undefined,
        discount: discountAmount,
        notes: orderNote.trim() || undefined,
        skipNavigation: true, // Keep user on checkout Step 3
      });

      // Clear cart
      clearCart();

      // Store confirmation and transition to Step 3
      setConfirmedOrder({
        ...placed,
        items: orderItemsSnapshot,
      });
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast('ধন্যবাদ! আপনার অর্ডার সফল হয়েছে', 'success');
    } catch (err) {
      console.error('Order placement error:', err);
      showToast('অর্ডার সম্পন্ন করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।', 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyOrderId = (id: string) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(id).catch(() => {});
    }
    setCopiedOrderId(true);
    showToast('অর্ডার নম্বর কপি করা হয়েছে!', 'success');
    setTimeout(() => setCopiedOrderId(false), 2200);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#06201A] pb-16 md:pb-24">
      {/* 1. TOP: 3-Step Progress Indicator */}
      <div className="bg-white border-b border-gray-200 sticky top-[48px] sm:top-[52px] md:top-[58px] z-30 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4">
          <div className="flex items-center justify-center gap-2 sm:gap-6 text-xs sm:text-sm font-semibold select-none">
            {/* Step 1: Cart */}
            <button
              type="button"
              onClick={() => {
                if (currentStep === 2) {
                  navigateTo('cart');
                }
              }}
              className="flex items-center gap-1.5 text-gray-500 hover:text-[#0B2B22] transition-colors cursor-pointer"
            >
              <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 text-[11px] font-bold flex items-center justify-center">
                1
              </span>
              <span>Cart</span>
            </button>

            <span className="text-gray-300 font-normal">/</span>

            {/* Step 2: Billing Information (Active when currentStep === 2) */}
            <div
              className={`flex items-center gap-1.5 transition-all ${
                currentStep === 2
                  ? 'text-[#0B2B22] font-black border-b-[3px] border-[#0B2B22] pb-1'
                  : 'text-gray-500 font-semibold'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                  currentStep === 2
                    ? 'bg-[#0B2B22] text-[#D4AF37]'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {currentStep === 3 ? '✓' : '2'}
              </span>
              <span>2. Billing Information</span>
            </div>

            <span className="text-gray-300 font-normal">/</span>

            {/* Step 3: Confirmation (Active when currentStep === 3) */}
            <div
              className={`flex items-center gap-1.5 transition-all ${
                currentStep === 3
                  ? 'text-[#0B2B22] font-black border-b-[3px] border-[#0B2B22] pb-1'
                  : 'text-gray-400 font-semibold'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                  currentStep === 3
                    ? 'bg-[#0B2B22] text-[#D4AF37]'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                3
              </span>
              <span>3. Confirmation</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 pt-5 sm:pt-7">
        {/* ========================================================
            STEP 3: ORDER CONFIRMATION VIEW (Shown upon success)
           ======================================================== */}
        {currentStep === 3 && confirmedOrder ? (
          <div className="max-w-2xl mx-auto animate-in fade-in duration-300 space-y-6">
            {/* Success Hero Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <CheckCircle2 className="w-9 h-9 sm:w-11 sm:h-11" />
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#0B2B22] tracking-tight mb-2">
                ধন্যবাদ! আপনার অর্ডার সফল হয়েছে
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto mb-6">
                আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। খুব শীঘ্রই আমাদের প্রতিনিধি কল করে অর্ডারটি নিশ্চিত করবেন।
              </p>

              {/* Order ID Badge with Copy */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FAF7EC] rounded-xl border border-[#D4AF37]/50 text-xs sm:text-sm text-[#0B2B22] font-bold">
                <span>অর্ডার নম্বর:</span>
                <span className="font-mono text-sm sm:text-base text-[#06201A] font-black tracking-wider">
                  #{confirmedOrder.orderId}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyOrderId(confirmedOrder.orderId)}
                  className="p-1 text-gray-500 hover:text-[#0B2B22] transition-colors cursor-pointer"
                  title="কপি করুন"
                >
                  {copiedOrderId ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Order Items Table in Confirmation */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
              <div className="bg-[#0B2B22] px-5 py-3 text-white flex items-center justify-between">
                <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-[#D4AF37]">
                  অর্ডারকৃত পণ্যসমূহ
                </h3>
                <span className="text-xs text-gray-300">
                  {confirmedOrder.items?.length || 0} টি আইটেম
                </span>
              </div>

              <div className="divide-y divide-gray-100 p-2 sm:p-4">
                {confirmedOrder.items?.map((item, idx) => (
                  <div
                    key={`${item.id}-${idx}`}
                    className="flex items-center justify-between py-3 px-2 gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover bg-gray-100 border border-gray-200 shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-[#06201A] line-clamp-1">
                          {item.product.name}
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Color: <strong className="font-bold text-[#06201A]">{item.selectedColor || 'Standard'}</strong>, Size: <strong className="font-bold text-[#06201A]">{item.selectedSize}</strong>
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Qty: <strong className="font-bold text-[#06201A]">{item.quantity}</strong>
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-xs sm:text-sm text-[#06201A]">
                        ৳{(item.product.price * item.quantity).toLocaleString('en-BD')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Cost Breakdown */}
              <div className="bg-gray-50/70 p-4 sm:p-5 border-t border-gray-100 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>সাবটোটাল</span>
                  <span className="font-semibold text-gray-800">
                    ৳{confirmedOrder.subtotal?.toLocaleString('en-BD')}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>ডেলিভারি চার্জ</span>
                  <span className="font-semibold text-gray-800">
                    ৳{confirmedOrder.deliveryFee?.toLocaleString('en-BD')}
                  </span>
                </div>
                {confirmedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>কুপন ডিসকাউন্ট</span>
                    <span>-৳{confirmedOrder.discount.toLocaleString('en-BD')}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200 text-sm sm:text-base font-black text-[#0B2B22]">
                  <span>সর্বমোট বিল (ক্যাশ অন ডেলিভারি)</span>
                  <span className="text-[#0B2B22] font-black">
                    ৳{confirmedOrder.total?.toLocaleString('en-BD')}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Destination & Contact Details */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-2.5 text-xs sm:text-sm">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#0B2B22] pb-2 border-b border-gray-100">
                ডেলিভারি ঠিকানা ও তথ্য
              </h3>
              <p className="text-gray-700">
                <strong className="text-gray-900">নাম:</strong> {confirmedOrder.customerName}
              </p>
              <p className="text-gray-700">
                <strong className="text-gray-900">মোবাইল:</strong> {confirmedOrder.phone}
              </p>
              <p className="text-gray-700">
                <strong className="text-gray-900">ঠিকানা:</strong> {confirmedOrder.address}
              </p>
              <p className="text-gray-700">
                <strong className="text-gray-900">এলাকা:</strong> {confirmedOrder.city}
              </p>
              <p className="text-gray-700">
                <strong className="text-gray-900">পেমেন্ট মেথড:</strong> ক্যাশ অন ডেলিভারি (Cash on Delivery)
              </p>
            </div>

            {/* Action Buttons: Track Order & Continue Shopping */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsTrackOrderModalOpen(true)}
                className="flex-1 py-3.5 rounded-xl bg-[#0B2B22] hover:bg-[#06201A] text-[#D4AF37] font-bold text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Package className="w-4 h-4 text-[#D4AF37]" />
                <span>Track Order</span>
              </button>

              <button
                type="button"
                onClick={() => navigateTo('shop')}
                className="flex-1 py-3.5 rounded-xl bg-white hover:bg-gray-50 text-[#0B2B22] border-2 border-[#0B2B22] font-bold text-xs sm:text-sm uppercase tracking-wider shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : cart.length === 0 ? (
          /* ========================================================
             EMPTY CART STATE (No items to checkout)
             ======================================================== */
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-gray-200 max-w-md mx-auto shadow-xs my-8">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-400">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-black text-gray-900 mb-1">আপনার কার্ট খালি</h2>
            <p className="text-xs text-gray-500 mb-6">
              চেকআউট করার জন্য প্রথমে আপনার পছন্দের পণ্য নির্বাচন করুন।
            </p>
            <button
              type="button"
              onClick={() => navigateTo('shop')}
              className="px-6 py-2.5 rounded-xl bg-[#0B2B22] text-[#D4AF37] font-extrabold text-xs uppercase tracking-wider shadow-md hover:bg-[#06201A] transition-all cursor-pointer"
            >
              পণ্য দেখুন
            </button>
          </div>
        ) : (
          /* ========================================================
             STEP 2: MAIN CHECKOUT & BILLING FORM
             ======================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* LEFT COLUMN: ORDER ITEMS TABLE + BILLING FORM */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              {/* 2. ORDER ITEMS TABLE */}
              <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[520px]">
                    {/* Deep Green Header Row */}
                    <thead>
                      <tr className="bg-[#0B2B22] text-white text-[11px] sm:text-xs uppercase tracking-wider font-extrabold">
                        <th className="py-3.5 px-3 sm:px-4 text-[#D4AF37]">PRODUCT</th>
                        <th className="py-3.5 px-3 text-[#D4AF37]">PRICE</th>
                        <th className="py-3.5 px-3 text-[#D4AF37]">COLOR & SIZE</th>
                        <th className="py-3.5 px-3 text-[#D4AF37] text-center">QUANTITY</th>
                        <th className="py-3.5 px-3 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                      {cart.map((item) => {
                        const liveProd =
                          products.find((p) => p.id === item.productId) || item.product;
                        const itemPrice = liveProd?.price ?? item.product.price;
                        const maxStock = liveProd?.stockQuantity;
                        const canIncrease =
                          maxStock === undefined || maxStock <= 0 || item.quantity < maxStock;

                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-gray-50/70 transition-colors"
                          >
                            {/* Product column with small image */}
                            <td className="py-3.5 px-3 sm:px-4">
                              <div className="flex items-center gap-2.5 sm:gap-3">
                                <img
                                  src={liveProd.image || item.product.image}
                                  alt={liveProd.name}
                                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover bg-gray-100 border border-gray-200 shrink-0"
                                />
                                <div className="min-w-0 max-w-[140px] sm:max-w-[200px]">
                                  <h3 className="font-bold text-xs sm:text-sm text-[#06201A] truncate">
                                    {liveProd.name}
                                  </h3>
                                  <span className="text-[10px] text-gray-400 font-mono">
                                    SKU: {liveProd.sku || 'HYB'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Price (Tk) */}
                            <td className="py-3.5 px-3 whitespace-nowrap font-bold text-[#06201A]">
                              ৳{itemPrice.toLocaleString('en-BD')}
                            </td>

                            {/* COLOR & SIZE ("Color: ..., Size: ..." in bold values) */}
                            <td className="py-3.5 px-3 whitespace-nowrap text-xs text-gray-600">
                              <div>
                                Color: <strong className="font-extrabold text-[#06201A]">{item.selectedColor || 'Standard'}</strong>
                              </div>
                              <div className="mt-0.5">
                                Size: <strong className="font-extrabold text-[#06201A]">{item.selectedSize}</strong>
                              </div>
                            </td>

                            {/* QUANTITY stepper with - and + buttons */}
                            <td className="py-3.5 px-3 text-center whitespace-nowrap">
                              <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleQuantityChange(item, item.quantity - 1)
                                  }
                                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 font-black text-sm transition-colors cursor-pointer active:scale-95"
                                  aria-label="Decrease quantity"
                                >
                                  -
                                </button>
                                <span className="w-8 sm:w-9 text-center font-bold text-xs text-[#06201A]">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleQuantityChange(item, item.quantity + 1)
                                  }
                                  disabled={!canIncrease}
                                  className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-700 font-black text-sm transition-colors ${
                                    canIncrease
                                      ? 'hover:bg-gray-100 cursor-pointer active:scale-95'
                                      : 'opacity-40 cursor-not-allowed bg-gray-50'
                                  }`}
                                  aria-label="Increase quantity"
                                >
                                  +
                                </button>
                              </div>
                            </td>

                            {/* Remove trash icon */}
                            <td className="py-3.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.id)}
                                className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="মুছে ফেলুন"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. BILLING FORM */}
              <div className="bg-white rounded-2xl p-5 sm:p-7 border border-gray-200/90 shadow-2xs space-y-4 sm:space-y-5">
                <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                  <h2 className="font-black text-sm sm:text-base text-[#0B2B22] uppercase tracking-wide">
                    বিলিং ও ডেলিভারি তথ্য
                  </h2>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-md">
                    ক্যাশ অন ডেলিভারি
                  </span>
                </div>

                {/* Full Name * */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                    placeholder="সম্পূর্ণ নামটি লিখুন"
                    className={`w-full bg-white text-xs sm:text-sm text-[#06201A] px-3.5 py-2.5 rounded-[8px] border transition-all placeholder:text-gray-400 outline-none ${
                      touched.name && errors.name
                        ? 'border-red-500 ring-1 ring-red-200'
                        : 'border-gray-300 focus:border-[#0B2B22] focus:ring-1 focus:ring-[#0B2B22]/30'
                    }`}
                  />
                  {touched.name && errors.name && (
                    <p className="text-[11px] text-red-600 mt-1 font-semibold">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Mobile Number * */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => {
                      setMobile(e.target.value);
                      if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: undefined }));
                    }}
                    onBlur={handleMobileBlur}
                    placeholder="১১ ডিজিটের মোবাইল নাম্বারটি লিখুন।"
                    className={`w-full bg-white text-xs sm:text-sm text-[#06201A] px-3.5 py-2.5 rounded-[8px] border transition-all placeholder:text-gray-400 outline-none font-mono ${
                      touched.mobile && errors.mobile
                        ? 'border-red-500 ring-1 ring-red-200'
                        : 'border-gray-300 focus:border-[#0B2B22] focus:ring-1 focus:ring-[#0B2B22]/30'
                    }`}
                  />
                  {touched.mobile && errors.mobile && (
                    <p className="text-[11px] text-red-600 mt-1 font-semibold">
                      {errors.mobile}
                    </p>
                  )}
                </div>

                {/* Address * */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={fullAddress}
                    onChange={(e) => {
                      setFullAddress(e.target.value);
                      if (errors.fullAddress)
                        setErrors((prev) => ({ ...prev, fullAddress: undefined }));
                    }}
                    onBlur={() => setTouched((prev) => ({ ...prev, fullAddress: true }))}
                    placeholder="সম্পূর্ণ ঠিকানা লিখুন"
                    className={`w-full bg-white text-xs sm:text-sm text-[#06201A] px-3.5 py-2.5 rounded-[8px] border transition-all placeholder:text-gray-400 outline-none resize-none ${
                      touched.fullAddress && errors.fullAddress
                        ? 'border-red-500 ring-1 ring-red-200'
                        : 'border-gray-300 focus:border-[#0B2B22] focus:ring-1 focus:ring-[#0B2B22]/30'
                    }`}
                  />
                  {touched.fullAddress && errors.fullAddress && (
                    <p className="text-[11px] text-red-600 mt-1 font-semibold">
                      {errors.fullAddress}
                    </p>
                  )}
                </div>

                {/* Choose Delivery Area * */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">
                    Choose Delivery Area <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={deliveryArea}
                      onChange={(e) => {
                        const val = e.target.value as '' | 'ঢাকার ভিতরে' | 'ঢাকার বাইরে';
                        setDeliveryArea(val);
                        if (errors.deliveryArea)
                          setErrors((prev) => ({ ...prev, deliveryArea: undefined }));
                      }}
                      onBlur={() => setTouched((prev) => ({ ...prev, deliveryArea: true }))}
                      className={`w-full bg-white text-xs sm:text-sm text-[#06201A] px-3.5 py-2.5 rounded-[8px] border transition-all outline-none cursor-pointer appearance-none ${
                        touched.deliveryArea && errors.deliveryArea
                          ? 'border-2 border-red-500 ring-2 ring-red-100 bg-red-50/20'
                          : 'border-gray-300 focus:border-[#0B2B22] focus:ring-1 focus:ring-[#0B2B22]/30'
                      }`}
                    >
                      <option value="">Select</option>
                      <option value="ঢাকার ভিতরে">
                        ঢাকার ভিতরে (৳{insideCharge})
                      </option>
                      <option value="ঢাকার বাইরে">
                        ঢাকার বাইরে (৳{outsideCharge})
                      </option>
                    </select>
                    {/* Select dropdown arrow */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                  {touched.deliveryArea && errors.deliveryArea && (
                    <p className="text-[11px] text-red-600 mt-1 font-semibold">
                      {errors.deliveryArea}
                    </p>
                  )}
                </div>

                {/* Optional: Order Note */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Order Note <span className="text-gray-400 font-normal">(ঐচ্ছিক)</span>
                  </label>
                  <input
                    type="text"
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder="অর্ডারের কোনো বিশেষ নির্দেশনা থাকলে লিখুন (ঐচ্ছিক)"
                    className="w-full bg-white text-xs sm:text-sm text-[#06201A] px-3.5 py-2 rounded-[8px] border border-gray-300 placeholder:text-gray-400 outline-none focus:border-[#0B2B22] focus:ring-1 focus:ring-[#0B2B22]/30 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY + COUPON + CONFIRM BUTTON */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-5 lg:sticky lg:top-24">
              {/* 4. ORDER SUMMARY CARD */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/90 shadow-2xs space-y-4">
                <h2 className="font-black text-sm sm:text-base text-[#0B2B22] uppercase tracking-wide border-b border-gray-100 pb-2.5">
                  অর্ডার সামারি
                </h2>

                {/* Subtotal */}
                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-700">
                  <span>সাবটোটাল</span>
                  <span className="font-bold text-[#06201A]">
                    ৳{subtotal.toLocaleString('en-BD')}
                  </span>
                </div>

                {/* Delivery Charge */}
                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-700">
                  <span>ডেলিভারি চার্জ</span>
                  <span className="font-bold text-[#06201A]">
                    {deliveryArea ? (
                      `৳${deliveryFee.toLocaleString('en-BD')}`
                    ) : (
                      <span className="text-xs text-amber-600 font-medium">
                        এলাকা সিলেক্ট করুন
                      </span>
                    )}
                  </span>
                </div>

                {/* Coupon Discount */}
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-xs sm:text-sm text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200/70">
                    <span>কুপন ডিসকাউন্ট</span>
                    <span>-৳{discountAmount.toLocaleString('en-BD')}</span>
                  </div>
                )}

                {/* Total */}
                <div className="pt-3 border-t border-gray-200 flex items-baseline justify-between">
                  <span className="font-black text-sm sm:text-base text-[#0B2B22]">
                    সর্বমোট
                  </span>
                  <span className="font-black text-lg sm:text-xl text-[#0B2B22]">
                    <span className="text-[#D4AF37] mr-0.5">৳</span>
                    {totalPayable.toLocaleString('en-BD')}
                  </span>
                </div>

                {/* Payment Method: Cash on Delivery as Radio */}
                <div className="pt-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                    পেমেন্ট মেথড
                  </label>
                  <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-[#0B2B22] bg-[#FAF7EC]/50 cursor-pointer select-none">
                    <input
                      type="radio"
                      id="cod"
                      name="paymentMethod"
                      checked={true}
                      readOnly
                      className="w-4 h-4 accent-[#0B2B22] cursor-pointer"
                    />
                    <label htmlFor="cod" className="flex items-center justify-between w-full cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-[#D4AF37]" />
                        <span className="font-extrabold text-xs sm:text-sm text-[#0B2B22]">
                          ক্যাশ অন ডেলিভারি (Cash on Delivery)
                        </span>
                      </div>
                      <span className="text-[10px] font-bold bg-[#0B2B22] text-[#D4AF37] px-2 py-0.5 rounded-full">
                        COD
                      </span>
                    </label>
                  </div>
                </div>

                {/* Coupon Code Box with Apply Button */}
                <div className="pt-2 border-t border-gray-100">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    কুপন কোড
                  </label>
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="কুপন কোড লিখুন"
                      className="flex-1 bg-white text-xs sm:text-sm text-[#06201A] px-3 py-2 rounded-[8px] border border-gray-300 placeholder:text-gray-400 outline-none uppercase font-mono tracking-wider focus:border-[#0B2B22]"
                    />
                    <button
                      type="submit"
                      disabled={checkingCoupon || !couponCode.trim()}
                      className="px-4 py-2 rounded-[8px] bg-[#0B2B22] hover:bg-[#06201A] text-[#D4AF37] font-bold text-xs uppercase tracking-wider disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center shrink-0"
                    >
                      {checkingCoupon ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                      ) : (
                        'Apply'
                      )}
                    </button>
                  </form>

                  {/* Coupon message */}
                  {couponStatus.type !== 'idle' && (
                    <p
                      className={`text-[11px] mt-1.5 font-semibold ${
                        couponStatus.type === 'success'
                          ? 'text-emerald-700'
                          : 'text-red-600'
                      }`}
                    >
                      {couponStatus.message}
                    </p>
                  )}
                </div>

                {/* 5. CONFIRM BUTTON */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleConfirmOrder}
                    disabled={isSubmitting || cart.length === 0}
                    className="w-full py-3.5 sm:py-4 rounded-[8px] bg-[#0B2B22] hover:bg-[#06201A] text-[#D4AF37] font-black text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                        <span>অর্ডার সম্পন্ন হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                        <span>অর্ডার কনফার্ম করুন</span>
                        <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      </>
                    )}
                  </button>
                  <p className="text-[10px] sm:text-[11px] text-gray-500 text-center mt-2">
                    পণ্য হাতে পেয়ে চেক করে মূল্য পরিশোধ করার সুবিধা।
                  </p>
                </div>
              </div>

              {/* Trust Badges Minimal Card */}
              <div className="bg-white rounded-xl p-3 border border-gray-200/80 flex items-center justify-around text-center text-[11px] text-gray-600">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span className="font-semibold text-gray-800">১০০% অরিজিনাল</span>
                </div>
                <div className="h-4 w-[1px] bg-gray-200" />
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#D4AF37]" />
                  <span className="font-semibold text-gray-800">ক্যাশ অন ডেলিভারি</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
