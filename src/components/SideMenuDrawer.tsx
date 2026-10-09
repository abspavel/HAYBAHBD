import React from 'react';
import {
  X,
  ChevronRight,
  MapPin,
  Truck,
  Flame,
  Sparkles,
  MessageCircle,
  Phone,
  Layers,
  HelpCircle,
  RotateCcw,
  ShoppingBag,
  Home,
  Info
} from 'lucide-react';
import { HaybahLogo } from './HaybahLogo';
import { CATEGORIES } from '../data/mockData';
import { useShop } from '../context/ShopContext';

export const SideMenuDrawer: React.FC = () => {
  const {
    isSideMenuOpen,
    setIsSideMenuOpen,
    navigateTo,
    setIsLocationModalOpen,
  } = useShop();

  if (!isSideMenuOpen) return null;

  const handleLinkClick = (action: () => void) => {
    setIsSideMenuOpen(false);
    action();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsSideMenuOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-out Drawer */}
      <div className="absolute inset-y-0 left-0 max-w-full flex pr-10">
        <div className="w-screen max-w-xs sm:max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
          {/* Header */}
          <div className="px-5 py-4 bg-[#06201A] text-white flex items-center justify-between border-b border-[#D4AF37]/25">
            <div className="flex items-center gap-2">
              <HaybahLogo size="sm" />
            </div>
            <button
              type="button"
              onClick={() => setIsSideMenuOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
            {/* 1. Main Navigation */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2.5 mb-1.5">
                NAVIGATION
              </p>
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => handleLinkClick(() => navigateTo('home'))}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-xs sm:text-sm text-[#06201A] hover:bg-[#FAF7EC] hover:text-[#AA820A] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Home className="w-4 h-4 text-gray-400" />
                    <span>Home</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleLinkClick(() => navigateTo('shop'))}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-xs sm:text-sm text-[#06201A] hover:bg-[#FAF7EC] hover:text-[#AA820A] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4 text-gray-400" />
                    <span>All Products</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleLinkClick(() => navigateTo('new-arrival'))}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-xs sm:text-sm text-[#06201A] hover:bg-[#FAF7EC] hover:text-[#AA820A] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span>New Arrivals</span>
                  </div>
                  <span className="bg-[#06201A] text-[#D4AF37] border border-[#D4AF37]/60 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                    NEW 2026
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLinkClick(() => navigateTo('flash-sale'))}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-xs sm:text-sm text-[#06201A] hover:bg-[#FAF7EC] hover:text-[#AA820A] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Flame className="w-4 h-4 text-red-500" />
                    <span>Flash Sale</span>
                  </div>
                  <span className="bg-[#D4AF37] text-[#06201A] text-[9px] font-black px-1.5 py-0.5 rounded-full">
                    HOT
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLinkClick(() => navigateTo('featured'))}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-xs sm:text-sm text-[#06201A] hover:bg-[#FAF7EC] hover:text-[#AA820A] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-gray-400" />
                    <span>Featured Pieces</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* 2. Shop By Category */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2.5 mb-1.5">
                CATEGORIES
              </p>
              <div className="space-y-0.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() =>
                      handleLinkClick(() => navigateTo('category', { category: cat.slug }))
                    }
                    className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs sm:text-sm text-gray-700 hover:bg-[#FAF7EC] hover:text-[#06201A] font-semibold transition-colors"
                  >
                    <span>{cat.name}</span>
                    <span className="text-[11px] text-gray-400 font-normal">
                      {cat.itemCount} items
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Customer Care & Services */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2.5 mb-1.5">
                CUSTOMER SERVICES
              </p>
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => handleLinkClick(() => navigateTo('track-order'))}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs sm:text-sm text-gray-700 hover:bg-gray-50 font-semibold transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Truck className="w-4 h-4 text-[#D4AF37]" />
                    <span>Track Your Order</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleLinkClick(() => setIsLocationModalOpen(true))}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs sm:text-sm text-gray-700 hover:bg-gray-50 font-semibold transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-[#D4AF37]" />
                    <span>Showroom Location</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleLinkClick(() => navigateTo('delivery-info'))}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs sm:text-sm text-gray-700 hover:bg-gray-50 font-semibold transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Truck className="w-4 h-4 text-gray-400" />
                    <span>Delivery Information</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleLinkClick(() => navigateTo('returns-refund'))}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs sm:text-sm text-gray-700 hover:bg-gray-50 font-semibold transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <RotateCcw className="w-4 h-4 text-gray-400" />
                    <span>Returns & Refund</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleLinkClick(() => navigateTo('how-to-order'))}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs sm:text-sm text-gray-700 hover:bg-gray-50 font-semibold transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-gray-400" />
                    <span>How to Order</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleLinkClick(() => navigateTo('about-us'))}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs sm:text-sm text-gray-700 hover:bg-gray-50 font-semibold transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Info className="w-4 h-4 text-gray-400" />
                    <span>About HAYBAH</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer Direct Contact Buttons */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-2">
            <a
              href="https://wa.me/8801642247530"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Customer Support</span>
            </a>

            <a
              href="tel:+8801642247530"
              className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-gray-100 text-[#06201A] border border-gray-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4 text-[#D4AF37]" />
              <span>Hotline: 01642247530</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
