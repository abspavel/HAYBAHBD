import React from 'react';
import { ArrowLeft, RotateCcw, CheckCircle2, AlertTriangle, Phone, MessageCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const ReturnsRefundView: React.FC = () => {
  const { navigateTo } = useShop();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-20">
      {/* Breadcrumb */}
      <button
        type="button"
        onClick={() => navigateTo('home')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#06201A] hover:text-[#AA820A] mb-5 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Home / Returns & Refund (7 Days)</span>
      </button>

      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto mb-3">
          <RotateCcw className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#06201A] uppercase tracking-tight">
          7-DAY EASY EXCHANGE & RETURN POLICY
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Hassle-Free 7 Days Exchange & Return Guarantee by HAYBAH
        </p>
      </div>

      {/* Highlights Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-[#06201A] text-white p-6 sm:p-8 rounded-3xl mb-8 border border-emerald-700/40 shadow-md">
        <div className="max-w-xl space-y-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-[11px] uppercase tracking-wider">
            100% Worry-Free Experience
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-[#FFF3B0]">
            Size doesn't fit or found a defect? No worries!
          </h2>
          <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
            Within 7 days of receiving your parcel, you can easily exchange the size or model. Our dedicated support team handles it quickly with courier pickup.
          </p>
        </div>
      </div>

      {/* Return Conditions */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-6 text-xs sm:text-sm text-gray-700 mb-8 leading-relaxed">
        <div>
          <h3 className="font-extrabold text-base text-[#06201A] mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Eligible Exchange Situations:</span>
          </h3>
          <ul className="list-disc list-inside space-y-1.5 text-gray-600 pl-2">
            <li>Garment size too large or small (M / L / XL / XXL exchange).</li>
            <li>Any manufacturing defect discovered in stitching or printing.</li>
            <li>Incorrect model or color received contrary to your order.</li>
          </ul>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="font-extrabold text-base text-[#06201A] mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>General Conditions for Exchange:</span>
          </h3>
          <ul className="list-disc list-inside space-y-1.5 text-gray-600 pl-2">
            <li>Product must be completely unworn, unwashed, and undamaged.</li>
            <li>Original brand tags and packaging must remain intact.</li>
            <li>Items that have been washed or treated with perfume/deodorant are not eligible.</li>
            <li>Notify our support team within a maximum of 7 days after parcel delivery.</li>
          </ul>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="font-extrabold text-base text-[#06201A] mb-3">
            How to Request an Exchange:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-[#FAF7EC] border border-[#D4AF37]/30">
              <strong className="block text-[#AA820A] text-xs font-black mb-1">Step 1</strong>
              <p className="text-xs text-gray-700">Message our WhatsApp (01642247530) with your Order ID and the preferred replacement size.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF7EC] border border-[#D4AF37]/30">
              <strong className="block text-[#AA820A] text-xs font-black mb-1">Step 2</strong>
              <p className="text-xs text-gray-700">Our logistics team processes your exchange and books the new parcel with courier tracking.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF7EC] border border-[#D4AF37]/30">
              <strong className="block text-[#AA820A] text-xs font-black mb-1">Step 3</strong>
              <p className="text-xs text-gray-700">The courier rider delivers the new piece to your doorstep and retrieves the previous item simultaneously.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Support Direct Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-[#06201A] text-white">
        <div>
          <h4 className="font-bold text-sm text-[#FFF3B0]">Have questions regarding an exchange?</h4>
          <p className="text-xs text-gray-300 mt-0.5">Message us directly on WhatsApp or call our helpline</p>
        </div>
        <div className="flex gap-2.5 shrink-0">
          <a
            href="https://wa.me/8801642247530"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
          <a
            href="tel:01642247530"
            className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#B8962E] text-[#06201A] font-extrabold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>01642247530</span>
          </a>
        </div>
      </div>
    </div>
  );
};
