import React, { useState } from 'react';
import {
  CheckCircle2,
  Download,
  Printer,
  Home,
  ShoppingBag,
  Clock,
  Phone,
  Copy,
  Check,
  ShieldCheck,
  FileText,
  MapPin,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { downloadInvoicePdf } from '../utils/generateInvoice';

export const ThankYouView: React.FC = () => {
  const {
    activeOrderConfirmation,
    navigateTo,
    setIsTrackOrderModalOpen,
    showToast,
  } = useShop();

  const [copiedId, setCopiedId] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // If directly navigated or reloaded without active order, show friendly fallback with last order
  const order = activeOrderConfirmation;

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    showToast('অর্ডার নম্বর কপি করা হয়েছে!', 'success');
    setTimeout(() => setCopiedId(false), 2200);
  };

  const handleDownloadInvoice = () => {
    if (!order) return;
    setIsDownloading(true);
    showToast('ইনভয়েস ডাউনলোড প্রস্তুত হচ্ছে...', 'info');
    try {
      downloadInvoicePdf(order);
      setTimeout(() => {
        setIsDownloading(false);
        showToast('ইনভয়েস ডাউনলোড সফল হয়েছে!', 'success');
      }, 1000);
    } catch (e) {
      setIsDownloading(false);
      showToast('ডাউনলোড সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।', 'info');
    }
  };

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200/90 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-300 mx-auto flex items-center justify-center mb-4">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-black text-[#06201A]">ধন্যবাদ!</h2>
          <p className="text-sm text-gray-600 mt-2">
            আপনার কোনো সক্রিয় অর্ডার নির্বাচন করা নেই। নতুন পণ্য দেখতে শপে যান অথবা অর্ডার ট্র্যাক করুন।
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="px-6 py-3 rounded-full bg-[#06201A] text-[#D4AF37] font-bold text-xs uppercase tracking-wider hover:bg-[#0B2B22] transition-colors"
            >
              হোম পেজে ফিরে যান
            </button>
            <button
              type="button"
              onClick={() => navigateTo('shop')}
              className="px-6 py-3 rounded-full bg-[#D4AF37] text-[#06201A] font-extrabold text-xs uppercase tracking-wider hover:bg-[#B8962E] transition-colors"
            >
              আরও কেনাকাটা করুন
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-[#F7F7F5] py-5 sm:py-8 px-3 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-5">
        
        {/* Top Success Banner Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-md text-center relative overflow-hidden">
          {/* Subtle Islamic Accent glow in background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-2 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-60" />

          {/* Animated Green Badge */}
          <div className="relative inline-block mb-3.5">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#E6F4EA] to-[#D4EDDA] text-[#047857] border-2 border-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10 sm:w-11 sm:h-11" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#D4AF37] text-[#06201A] p-1 rounded-full shadow-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FAF7EC] border border-[#D4AF37]/40 text-[#AA820A] text-xs font-bold uppercase tracking-wider mb-2">
            <span>🎉 অর্ডার সফলভাবে সম্পন্ন হয়েছে</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#06201A] tracking-tight">
            ধন্যবাদ, {order.customerName}!
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto mt-2 leading-relaxed">
            আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে। খুব শীঘ্রই আমাদের প্রতিনিধি আপনার দেওয়া ঠিকানায় পার্সেলটি পৌঁছে দেবেন।
          </p>

          {/* Order ID & Status Quick Strip */}
          <div className="mt-5 max-w-md mx-auto bg-gradient-to-r from-[#F9FAF8] via-white to-[#F9FAF8] border border-gray-200 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="text-left">
              <span className="text-[11px] text-gray-500 font-medium block">অর্ডার আইডি</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono font-black text-sm sm:text-base text-[#06201A]">
                  #{order.orderId}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyId(order.orderId)}
                  className="p-1 text-gray-400 hover:text-[#06201A] hover:bg-gray-100 rounded transition-colors"
                  title="কপি করুন"
                >
                  {copiedId ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-gray-500 font-medium block">পেমেন্ট পদ্ধতি</span>
              <span className="inline-flex items-center gap-1 font-bold text-xs sm:text-sm text-[#047857] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 mt-0.5">
                ক্যাশ অন ডেলিভারি
              </span>
            </div>
          </div>

          {/* Primary Action Buttons: Invoice Download & Back to Home */}
          <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-center gap-3">
            {/* INVOICE DOWNLOAD BUTTON */}
            <button
              type="button"
              onClick={handleDownloadInvoice}
              disabled={isDownloading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 rounded-full bg-[#0B2B22] text-[#D4AF37] hover:bg-[#133F32] active:scale-[0.98] font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-[#0B2B22]/15 border border-[#D4AF37]/50 transition-all cursor-pointer"
            >
              <Download className={`w-4 h-4 sm:w-5 sm:h-5 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span>{isDownloading ? 'ইনভয়েস প্রস্তুত হচ্ছে...' : 'ইনভয়েস ডাউনলোড করুন (PDF)'}</span>
            </button>

            {/* BACK TO HOME BUTTON */}
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 rounded-full bg-[#D4AF37] text-[#06201A] hover:bg-[#B8962E] active:scale-[0.98] font-black text-xs sm:text-sm tracking-wide shadow-md transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>হোমে ফিরে যান</span>
            </button>

            {/* Track Order Secondary Button */}
            <button
              type="button"
              onClick={() => setIsTrackOrderModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-white text-gray-700 hover:text-[#06201A] hover:bg-gray-50 border border-gray-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>অর্ডার ট্র্যাক</span>
            </button>
          </div>
        </div>

        {/* Invoice & Order Summary Details Section */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-gray-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#B8962E]" />
              <h2 className="text-base sm:text-lg font-black text-[#06201A]">
                অর্ডারের বিবরণ ও রসিদ
              </h2>
            </div>
            <span className="text-xs font-bold text-gray-500">
              তারিখ: {order.createdAt}
            </span>
          </div>

          {/* Delivery & Contact Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
            <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-gray-200/70 space-y-1.5">
              <span className="text-[11px] font-black text-[#AA820A] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> ডেলিভারির ঠিকানা
              </span>
              <p className="font-bold text-gray-900 text-sm">{order.customerName}</p>
              <p className="text-gray-700">{order.phone}</p>
              <p className="text-gray-600 leading-snug">
                {order.address}, {order.thana}, {order.district}
              </p>
              <p className="text-[11px] text-gray-500 font-semibold pt-1">
                এরিয়া: {order.city}
              </p>
            </div>

            <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-gray-200/70 space-y-1.5">
              <span className="text-[11px] font-black text-[#AA820A] uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> ডেলিভারি ও পেমেন্ট
              </span>
              <div className="flex justify-between text-gray-700">
                <span>পেমেন্ট মোড:</span>
                <span className="font-bold text-[#047857]">ক্যাশ অন ডেলিভারি (COD)</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>ডেলিভারি সময়:</span>
                <span className="font-semibold text-gray-900">
                  {order.city === 'Inside Dhaka' ? '২৪-৪৮ ঘণ্টার মধ্যে' : '৪৮-৭২ ঘণ্টার মধ্যে'}
                </span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>বর্তমান স্ট্যাটাস:</span>
                <span className="font-bold text-emerald-700">{order.status}</span>
              </div>
              <p className="text-[11px] text-gray-500 pt-1">
                পণ্য হাতে পেয়ে মূল্য ডেলিভারি রাইডারকে পরিশোধ করুন।
              </p>
            </div>
          </div>

          {/* Ordered Products Table */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <div className="bg-[#0B2B22] text-[#D4AF37] px-4 py-2.5 text-xs font-black uppercase tracking-wider flex justify-between">
              <span>অর্ডারকৃত পণ্য ({order.items.length})</span>
              <span>মোট</span>
            </div>

            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="p-3 sm:p-4 flex items-center justify-between gap-3 text-xs sm:text-sm bg-white">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-xl border border-gray-200 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-[#06201A] line-clamp-1">{item.product.name}</h4>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500 font-medium">
                        <span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-700 font-semibold">
                          সাইজ: {item.selectedSize}
                        </span>
                        <span>পরিমাণ: {item.quantity}</span>
                        <span>(৳{item.product.price.toLocaleString()} প্রতিটি)</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-black text-[#06201A] text-sm shrink-0">
                    ৳{(item.product.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-[#FAF9F5] p-4 border-t border-gray-200 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-gray-600">
                <span>সাবটোটাল:</span>
                <span className="font-bold text-gray-800">৳{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>ডেলিভারি চার্জ ({order.city}):</span>
                <span className="font-bold text-gray-800">৳{order.deliveryFee}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>ডিসকাউন্ট:</span>
                  <span>-৳{order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-base sm:text-lg font-black text-[#06201A] pt-2 border-t border-gray-200">
                <span>সর্বমোট প্রদেয় টাকা:</span>
                <span className="text-[#0B2B22] text-xl">৳{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Quick Help Strip */}
          <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-700">
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                কোনো প্রশ্ন বা অর্ডারে পরিবর্তন প্রয়োজন? কল অথবা হোয়াটসঅ্যাপ করুন:{' '}
                <a href="tel:01889138400" className="font-bold text-[#06201A] hover:underline">
                  01889-138400
                </a>
              </span>
            </div>
            <button
              type="button"
              onClick={handleDownloadInvoice}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B2B22] hover:text-[#AA820A] underline underline-offset-4 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>রসিদ সংরক্ষণ করুন</span>
            </button>
          </div>
        </div>

        {/* Bottom Navigation Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 pb-6">
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-[#06201A] border border-gray-300 font-bold text-xs uppercase tracking-wider hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>হোমে ফিরে যান</span>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('shop')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-[#06201A] text-[#D4AF37] font-extrabold text-xs uppercase tracking-wider hover:bg-[#0B2B22] transition-colors shadow-sm cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>আরও কেনাকাটা করুন</span>
          </button>
        </div>

      </div>
    </div>
  );
};
