import React from 'react';
import { ArrowLeft, ShoppingBag, CheckCircle, Truck, CreditCard, Sparkles, Phone } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const HowToOrderView: React.FC = () => {
  const { navigateTo } = useShop();

  const steps = [
    {
      num: '01',
      title: 'Select Your Desired Apparel',
      desc: 'Browse our latest heavyweight hoodies, vintage Y2K motor jerseys, shackets, drop-shoulder tees, or trucker caps from the catalog.',
      tip: 'Check out the Flash Sale and New Arrival sections for seasonal releases.',
    },
    {
      num: '02',
      title: 'Choose Size & Add to Cart',
      desc: 'Pick your preferred fit (M, L, XL, XXL) from the product details view and click "ADD TO CART" or instant "BUY NOW".',
      tip: 'Our streetwear pieces feature a contemporary relaxed boxy silhouette.',
    },
    {
      num: '03',
      title: 'Fill Out Minimal Checkout Form',
      desc: 'Simply provide your Name, Mobile Number, Full Address, District/City, and Thana. Delivery fee (৳80 Inside Dhaka / ৳120 Outside Dhaka) calculates automatically.',
      tip: 'No password or mandatory account registration required — finish in 30 seconds.',
    },
    {
      num: '04',
      title: 'Receive via 100% Cash on Delivery',
      desc: 'Upon clicking "Confirm Order", your shipment is booked. Inspect your parcel at your doorstep before handing cash to the courier rider.',
      tip: 'Zero advance payment required — completely risk-free shopping!',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-20">
      {/* Breadcrumb */}
      <button
        type="button"
        onClick={() => navigateTo('home')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#06201A] hover:text-[#AA820A] mb-5 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Home / How to Order</span>
      </button>

      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7EC] text-[#AA820A] border border-[#D4AF37]/30 text-xs font-black uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Easy 4-Step Process</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#06201A] uppercase tracking-tight">
          How To Place An Order
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Ordering on HAYBAH is smooth, fast, and secure. No advance payment is ever required.
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-5 mb-10">
        {steps.map((st, idx) => (
          <div
            key={idx}
            className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-start gap-5 hover:border-[#D4AF37]/50 transition-colors"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#06201A] text-[#D4AF37] font-brand font-black text-xl flex items-center justify-center shrink-0 shadow-md">
              {st.num}
            </div>

            <div className="flex-1 space-y-2">
              <h3 className="font-extrabold text-base sm:text-lg text-[#06201A]">
                {st.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {st.desc}
              </p>
              <div className="inline-block px-3 py-1 rounded-lg bg-[#FAF7EC] text-[#AA820A] text-xs font-semibold">
                💡 Tip: {st.tip}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delivery Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-xs">
          <h4 className="font-bold text-sm text-[#06201A] mb-1 flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#D4AF37]" />
            <span>Inside Dhaka Delivery</span>
          </h4>
          <p className="text-xs text-gray-600">Delivery Fee: <strong className="text-gray-900">৳80</strong></p>
          <p className="text-[11px] text-gray-500 mt-1">Timeline: Doorstep delivery within 24 to 48 hours</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-xs">
          <h4 className="font-bold text-sm text-[#06201A] mb-1 flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#D4AF37]" />
            <span>Outside Dhaka (Nationwide)</span>
          </h4>
          <p className="text-xs text-gray-600">Delivery Fee: <strong className="text-gray-900">৳120</strong></p>
          <p className="text-[11px] text-gray-500 mt-1">Timeline: 48 to 72 hours across 64 districts & thanas</p>
        </div>
      </div>

      {/* CTA Box */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#06201A] to-[#0B2B22] text-white text-center space-y-4">
        <h3 className="text-lg sm:text-xl font-black font-brand text-[#FFF3B0]">
          Ready to Elevate Your Streetwear Collection?
        </h3>
        <p className="text-xs text-gray-300 max-w-md mx-auto">
          Explore the authentic heavyweight drops now with complete Cash on Delivery.
        </p>
        <button
          type="button"
          onClick={() => navigateTo('shop')}
          className="px-8 py-3.5 rounded-full bg-[#D4AF37] hover:bg-[#B8962E] text-[#06201A] font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer inline-block"
        >
          Explore Catalog Now →
        </button>
      </div>
    </div>
  );
};
