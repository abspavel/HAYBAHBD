import React from 'react';
import { ArrowLeft, ShieldCheck, Sparkles, Truck, Star, Award, MapPin, Phone } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { HaybahLogo } from '../components/HaybahLogo';

export const AboutUsView: React.FC = () => {
  const { navigateTo, setIsLocationModalOpen } = useShop();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-20">
      {/* Breadcrumb / Back button */}
      <button
        type="button"
        onClick={() => navigateTo('home')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#06201A] hover:text-[#AA820A] mb-5 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Home / About Us</span>
      </button>

      {/* Hero Brand Statement */}
      <div className="bg-gradient-to-br from-[#06201A] via-[#0B2B22] to-[#041511] text-white p-6 sm:p-10 rounded-3xl border border-[#D4AF37]/30 shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#E8CE7A] text-[11px] font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Spirit of HAYBAH</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black font-brand tracking-tight mb-4 text-[#FFF3B0]">
            ABOUT HAYBAH
          </h1>

          <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
            HAYBAH is not just what you wear — it’s who you are in the moment. We engineer contemporary streetwear and luxury silhouettes for individuals who move with quiet confidence, dignity, and unapologetic presence.
          </p>
        </div>
      </div>

      {/* Core Brand Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#FAF7EC] flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <h3 className="font-extrabold text-sm text-[#06201A] mb-1.5">
            Heavyweight Craftsmanship
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Custom-milled 420 GSM French Terry fleece and 260 GSM combed compact cotton for unmatched comfort, warmth, and structural drape.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#FAF7EC] flex items-center justify-center mb-3">
            <Award className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <h3 className="font-extrabold text-sm text-[#06201A] mb-1.5">
            Contemporary Aesthetic
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Blending relaxed drop-shoulder tailoring with timeless Islamic calligraphic artistry and modern metropolitan cuts.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#FAF7EC] flex items-center justify-center mb-3">
            <Truck className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <h3 className="font-extrabold text-sm text-[#06201A] mb-1.5">
            Fast Nationwide Fulfillment
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Rapid 24-72 hours doorstep delivery across all 64 districts of Bangladesh with 100% Cash on Delivery and no advance payments.
          </p>
        </div>
      </div>

      {/* Flagship Showroom & Contact info */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-[11px] font-bold text-[#AA820A] uppercase tracking-wider">
            Visit Our Showroom
          </span>
          <h3 className="text-lg font-black text-[#06201A]">
            Experience The Fabric In Person
          </h3>
          <p className="text-xs text-gray-600 max-w-md">
            Nearby kutubpur primary school, Fatullah, Narayanganj. Open 7 days a week from 11:00 AM to 10:00 PM.
          </p>
        </div>

        <div className="flex gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#06201A] hover:bg-[#0B2B22] text-[#D4AF37] font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Showroom Location
          </button>
          <button
            type="button"
            onClick={() => navigateTo('shop')}
            className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#B8962E] text-[#06201A] font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Shop Now
          </button>
        </div>
      </div>

      {/* Brand Numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="p-4 bg-white rounded-2xl border border-gray-100">
          <span className="block text-2xl font-black text-[#06201A] font-brand">10,000+</span>
          <span className="text-[11px] text-gray-500 font-semibold uppercase">Happy Customers</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-100">
          <span className="block text-2xl font-black text-[#06201A] font-brand">100%</span>
          <span className="text-[11px] text-gray-500 font-semibold uppercase">Cash On Delivery</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-100">
          <span className="block text-2xl font-black text-[#06201A] font-brand">7 Days</span>
          <span className="text-[11px] text-gray-500 font-semibold uppercase">Easy Exchange</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-100">
          <span className="block text-2xl font-black text-[#06201A] font-brand">64</span>
          <span className="text-[11px] text-gray-500 font-semibold uppercase">Districts Covered</span>
        </div>
      </div>
    </div>
  );
};
