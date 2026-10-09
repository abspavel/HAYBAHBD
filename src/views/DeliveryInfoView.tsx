import React from 'react';
import { ArrowLeft, Truck, Clock, ShieldCheck, MapPin, PackageCheck, AlertCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const DeliveryInfoView: React.FC = () => {
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
        <span>Home / Delivery Information</span>
      </button>

      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#FAF7EC] text-[#AA820A] border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-3">
          <Truck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#06201A] uppercase tracking-tight">
          DELIVERY INFORMATION
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Fast nationwide doorstep shipping and 100% Cash on Delivery guidelines
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {/* Inside Dhaka */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-[#D4AF37]/40 shadow-xs relative overflow-hidden">
          <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-[#FAF7EC] text-[#AA820A] text-[10px] font-black uppercase">
            Fast Track
          </div>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="font-extrabold text-base text-[#06201A]">Inside Dhaka</h3>
          </div>
          <div className="mb-4">
            <span className="text-3xl font-black text-[#06201A] font-brand">৳80</span>
            <span className="text-xs text-gray-500 font-semibold ml-1">Delivery Charge</span>
          </div>
          <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-3">
            <p className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D4AF37]" />
              <span>Delivery Time: <strong>24 to 48 Hours</strong></span>
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Doorstep Delivery + 100% Cash on Delivery</span>
            </p>
          </div>
        </div>

        {/* Outside Dhaka */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 shadow-xs relative overflow-hidden">
          <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-[10px] font-black uppercase">
            Nationwide
          </div>
          <div className="flex items-center gap-2 mb-3">
            <Truck className="w-5 h-5 text-[#06201A]" />
            <h3 className="font-extrabold text-base text-[#06201A]">Outside Dhaka</h3>
          </div>
          <div className="mb-4">
            <span className="text-3xl font-black text-[#06201A] font-brand">৳120</span>
            <span className="text-xs text-gray-500 font-semibold ml-1">Delivery Charge</span>
          </div>
          <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-3">
            <p className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#06201A]" />
              <span>Delivery Time: <strong>48 to 72 Hours</strong></span>
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>All 64 Districts Thana Coverage with COD</span>
            </p>
          </div>
        </div>
      </div>

      {/* Guidelines & Terms */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed mb-8">
        <div>
          <h3 className="font-extrabold text-base text-[#06201A] mb-2 flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-emerald-600" />
            <span>Parcel Unboxing & Inspection Policy</span>
          </h3>
          <p>
            HAYBAH proudly allows open-box inspection upon arrival. When the courier rider reaches your doorstep, you may open the parcel and verify the ordered model, size, fabric quality, and stitching before paying. Only pay cash when completely satisfied.
          </p>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="font-extrabold text-base text-[#06201A] mb-2">
            Our Official Courier Logistics Partners:
          </h3>
          <p className="text-xs text-gray-600 mb-3">
            We partner with Bangladesh’s leading automated courier and tracking networks:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center font-bold text-xs text-gray-800">
              Steadfast Courier
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center font-bold text-xs text-gray-800">
              RedX Express
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center font-bold text-xs text-gray-800">
              Paperfly Private
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="font-extrabold text-base text-[#06201A] mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>In Case of Unforeseen Delivery Delays:</span>
          </h3>
          <p>
            Inclement weather, nationwide logistics congestion, or public holidays may occasionally cause slight delivery delays. In such events, check your parcel status on our tracking page or call our hotline directly at 01642247530 for immediate updates.
          </p>
        </div>
      </div>

      {/* Track Button Shortcut */}
      <div className="p-6 rounded-3xl bg-[#06201A] text-white flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h4 className="font-black text-base text-[#FFF3B0]">Want to track your parcel?</h4>
          <p className="text-xs text-gray-300 mt-0.5">Use your Order ID to check live courier delivery status anytime.</p>
        </div>
        <button
          type="button"
          onClick={() => navigateTo('track-order')}
          className="px-6 py-2.5 rounded-full bg-[#D4AF37] hover:bg-[#B8962E] text-[#06201A] font-extrabold text-xs uppercase tracking-wider shrink-0 transition-all cursor-pointer"
        >
          Track Order Now →
        </button>
      </div>
    </div>
  );
};
