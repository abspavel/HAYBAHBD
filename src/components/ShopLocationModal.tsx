import React from 'react';
import { X, MapPin, Clock, Phone, Navigation, ExternalLink } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const ShopLocationModal: React.FC = () => {
  const { isLocationModalOpen, setIsLocationModalOpen } = useShop();

  if (!isLocationModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={() => setIsLocationModalOpen(false)}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#D4AF37]/30 z-10">
        <button
          type="button"
          onClick={() => setIsLocationModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-[#AA820A] text-xs font-bold uppercase tracking-wider mb-2">
          <MapPin className="w-4 h-4" />
          <span>Flagship Showroom</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-[#06201A] font-brand">
          HAYBAH OUTLET & STORE
        </h3>

        <div className="mt-4 space-y-4 text-xs sm:text-sm text-gray-700">
          <div className="p-4 bg-[#FAF7EC] rounded-2xl border border-[#D4AF37]/30 space-y-1.5">
            <p className="font-bold text-gray-900 text-sm">
              Nearby Kutubpur Primary School
            </p>
            <p className="text-gray-700 font-medium">
              Fatullah, Narayanganj, Bangladesh
            </p>
            <p className="text-[11px] text-gray-500">
              (Main road access, near Kutubpur Govt. Primary School)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="flex items-center gap-1.5 font-bold text-[#06201A] mb-1">
                <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                Opening Hours
              </span>
              <p className="text-gray-600">Everyday: 11:00 AM – 10:00 PM</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="flex items-center gap-1.5 font-bold text-[#06201A] mb-1">
                <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                Store Helpline
              </span>
              <a href="tel:+8801642247530" className="text-[#06201A] font-semibold hover:underline">
                01642247530
              </a>
            </div>
          </div>

          {/* Interactive Map Visual */}
          <div className="relative rounded-2xl overflow-hidden h-40 bg-[#06201A] border border-gray-200 flex items-center justify-center text-center p-4">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:12px_12px]" />
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37] text-[#06201A] flex items-center justify-center mx-auto mb-2 shadow-lg animate-bounce">
                <Navigation className="w-5 h-5" />
              </div>
              <p className="text-white font-bold text-xs uppercase tracking-wide">
                Fatullah, Narayanganj Store Map
              </p>
              <p className="text-[#E8CE7A] text-[11px]">Kutubpur Primary School, Fatullah</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <a
            href="https://maps.google.com/?q=Kutubpur+Primary+School+Fatullah+Narayanganj"
            target="_blank"
            rel="noreferrer"
            className="flex-1 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#B8962E] text-[#06201A] font-extrabold text-xs uppercase tracking-wider shadow-md transition-all text-center flex items-center justify-center gap-1.5"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
