import React from 'react';
import { MapPin, Navigation, Clock, Phone } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { HaybahLogo } from './HaybahLogo';

export const ShowroomBanner: React.FC = () => {
  const { setIsLocationModalOpen } = useShop();

  return (
    <section className="py-4 px-3 sm:px-4 max-w-7xl mx-auto">
      {/* Slim, refined Store Locator banner ribbon */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#06201A] via-[#0B2B22] to-[#041511] border border-[#D4AF37]/45 shadow-lg text-white px-4 sm:px-6 md:px-8 py-3.5 sm:py-4">
        {/* Subtle decorative gold light glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#D4AF37]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Left: Prominent store emblem/logo alongside details */}
          <div className="flex items-center gap-3.5 sm:gap-5 w-full md:w-auto">
            {/* Prominent circular illuminated Store Logo/Badge */}
            <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-2xl bg-[#06201A]/90 border-2 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.35)] flex items-center justify-center p-1.5 transition-transform duration-300 hover:scale-105 group">
              <HaybahLogo size="sm" variant="transparent" className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(212,175,55,0.6)]" />
            </div>

            {/* Store Text Information */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] text-[10px] font-extrabold uppercase tracking-wider">
                  <MapPin className="w-2.5 h-2.5" />
                  FLAGSHIP STORE
                </span>
                <span className="text-gray-400 text-xs hidden sm:inline">•</span>
                <span className="text-gray-300 text-xs hidden sm:inline-flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#D4AF37]" />
                  11:00 AM – 10:00 PM Everyday
                </span>
              </div>

              <h3 className="text-base sm:text-lg md:text-xl font-black uppercase tracking-tight text-white font-brand mt-0.5 leading-snug">
                HAYBAH STORE & OUTLET
              </h3>

              <div className="flex items-center gap-3 text-[11px] sm:text-xs text-[#E8CE7A] mt-0.5 flex-wrap">
                <span className="truncate max-w-[280px] sm:max-w-none">
                  Kutubpur, Fatullah, Narayanganj
                </span>
                <span className="hidden md:inline text-gray-500">|</span>
                <span className="inline-flex items-center gap-1 text-gray-300">
                  <Phone className="w-3 h-3 text-[#D4AF37]" />
                  01642247530
                </span>
              </div>
            </div>
          </div>

          {/* Right: Slim Compact Action Button */}
          <div className="shrink-0 w-full md:w-auto flex justify-end">
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="w-full md:w-auto px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#FFF3B0] to-[#D4AF37] hover:brightness-105 active:scale-95 text-[#06201A] font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 fill-[#06201A]" />
              <span>Store Details & Map</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
