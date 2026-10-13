import React from 'react';
import { ArrowLeft, Feather, Sparkles, Compass, ShieldCheck } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { HaybahLogo } from '../components/HaybahLogo';

export const OurStoryView: React.FC = () => {
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
        <span>Home / Our Story</span>
      </button>

      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7EC] text-[#AA820A] border border-[#D4AF37]/30 text-xs font-black uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Heritage of HAYBAH</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-[#06201A] font-brand tracking-tight mb-3">
          ROOTED IN DIGNITY. CRAFTED FOR THE STREETS.
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          How an Arabic ideal of magnetic presence gave birth to Bangladesh's modern heavyweight apparel movement.
        </p>
      </div>

      {/* Story Sections */}
      <div className="space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
        {/* Section 1: The Meaning */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#06201A] text-[#D4AF37] flex items-center justify-center font-brand font-black text-lg">
              هـ
            </div>
            <div>
              <h2 className="font-black text-base text-[#06201A]">
                The Meaning of "HAYBAH" (هَيْبَة)
              </h2>
              <span className="text-[11px] text-[#AA820A] font-semibold">
                Dignity • Majesty • Irresistible Aura
              </span>
            </div>
          </div>

          <p>
            In traditional Arabic linguistics, <strong>Haybah</strong> represents an unforced aura — a natural reverence and respect commanded through modesty, poise, and upright carriage. It is the quiet confidence that does not need to shout to be felt.
          </p>

          <p>
            When we founded HAYBAH, we observed that conventional fast fashion was increasingly saturated with fleeting trends that lacked depth. We set out to build garments that honor heritage while precision-tailoring slim and regular fit apparel designed to elevate everyday men's style with timeless sophistication.
          </p>
        </div>

        {/* Section 2: Fabric Philosophy */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF7EC] text-[#D4AF37] flex items-center justify-center">
              <Compass className="w-5 h-5 text-[#AA820A]" />
            </div>
            <div>
              <h2 className="font-black text-base text-[#06201A]">
                The Heavyweight Philosophy
              </h2>
              <span className="text-[11px] text-[#AA820A] font-semibold">
                No Compromise on GSM or Texture
              </span>
            </div>
          </div>

          <p>
            Every piece in the HAYBAH catalog begins with custom-knitted yarn. Where standard fast-fashion uses lightweight 200–280 GSM fabrics that warp after a few washes, HAYBAH hoodies are engineered in <strong>420 GSM French Terry</strong> and our drop-shoulder tees in <strong>260 GSM combed compact cotton</strong>.
          </p>

          <p>
            The result is a structured silhouette that retains its silhouette, resists pill formation, and offers thermal comfort suited precisely to Bangladesh’s winter breeze and tropical seasons.
          </p>
        </div>

        {/* Section 3: The Calligraphy & Design */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF7EC] text-[#D4AF37] flex items-center justify-center">
              <Feather className="w-5 h-5 text-[#AA820A]" />
            </div>
            <div>
              <h2 className="font-black text-base text-[#06201A]">
                The Emblem & Aesthetic
              </h2>
              <span className="text-[11px] text-[#AA820A] font-semibold">
                Geometric Harmony Meets Modern Edge
              </span>
            </div>
          </div>

          <p>
            The arched niche in the HAYBAH logo draws inspiration from classic Andalusian and Ottoman architectural archways (Mihrab) — symbols of elevation and sacred geometry. Within it, fluid calligraphy asserts identity and purpose. When paired with gold and deep forest green tones, it creates a visual identity that is proud, grounded, and unmistakably premium.
          </p>
        </div>
      </div>

      {/* CTA Box */}
      <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#06201A] to-[#0B2B22] text-white flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h3 className="font-black text-lg text-[#FFF3B0] font-brand">
            BECOME PART OF THE LEGACY
          </h3>
          <p className="text-xs text-gray-300 mt-0.5">
            Explore the latest seasonal releases crafted with 100% precision.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigateTo('shop')}
          className="px-6 py-3 rounded-full bg-[#D4AF37] hover:bg-[#B8962E] text-[#06201A] font-extrabold text-xs uppercase tracking-wider transition-all shrink-0 cursor-pointer"
        >
          Explore Collection
        </button>
      </div>
    </div>
  );
};
