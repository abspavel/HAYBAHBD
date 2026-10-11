import React, { useState } from 'react';
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
  Info,
  Compass,
  FileQuestion,
  Headphones,
  ExternalLink,
  ShieldCheck,
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
    categories,
    products,
  } = useShop();

  // Clean Tab switcher for a calm, uncluttered experience
  const [activeTab, setActiveTab] = useState<'shop' | 'services'>('shop');

  if (!isSideMenuOpen) return null;

  const handleLinkClick = (action: () => void) => {
    setIsSideMenuOpen(false);
    action();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Soft Blurred Ambient Backdrop */}
      <div
        onClick={() => setIsSideMenuOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 animate-in fade-in cursor-pointer"
        aria-hidden="true"
      />

      {/* Slide-out Minimal Drawer */}
      <div className="absolute inset-y-0 left-0 max-w-full flex pr-8 sm:pr-12 pointer-events-none">
        <div className="w-[88vw] max-w-[340px] sm:max-w-[380px] bg-white shadow-2xl flex flex-col pointer-events-auto animate-in slide-in-from-left duration-300 border-r border-gray-100">
          
          {/* 1. Minimal Pristine Header */}
          <div className="px-5 py-3.5 bg-white border-b border-gray-100 flex items-center justify-between">
            <div
              onClick={() => handleLinkClick(() => navigateTo('home'))}
              className="cursor-pointer transition-opacity hover:opacity-85 flex items-center"
            >
              <HaybahLogo size="sm" />
            </div>

            <button
              type="button"
              onClick={() => setIsSideMenuOpen(false)}
              className="w-8 h-8 rounded-full border border-gray-200/80 hover:border-[#D4AF37] hover:bg-[#FAF7EC] text-gray-500 hover:text-[#06201A] flex items-center justify-center transition-all cursor-pointer active:scale-90"
              aria-label="Close menu"
            >
              <X className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>

          {/* 2. Modern Minimal Tabs (Collections vs. Customer Care) */}
          <div className="px-4 pt-3 pb-1 bg-white border-b border-gray-100/70">
            <div className="grid grid-cols-2 p-1 bg-gray-100/80 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('shop')}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'shop'
                    ? 'bg-white text-[#06201A] shadow-xs font-bold text-[#AA820A]'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Collections</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('services')}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'services'
                    ? 'bg-white text-[#06201A] shadow-xs font-bold text-[#AA820A]'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>Help & Info</span>
              </button>
            </div>
          </div>

          {/* 3. Scrollable Clean Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-thin">
            {activeTab === 'shop' ? (
              <>
                {/* Highlights Navigation */}
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 mb-2">
                    Quick Navigation
                  </p>

                  <button
                    type="button"
                    onClick={() => handleLinkClick(() => navigateTo('home'))}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-[#06201A] hover:bg-[#FAF7EC] hover:text-[#AA820A] transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-[#FFF3B0]/40 transition-colors">
                        <Home className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#AA820A]" />
                      </div>
                      <span>Home</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#AA820A] group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLinkClick(() => navigateTo('shop'))}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-[#06201A] hover:bg-[#FAF7EC] hover:text-[#AA820A] transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-[#FFF3B0]/40 transition-colors">
                        <Compass className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#AA820A]" />
                      </div>
                      <span>All Products</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#AA820A] group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLinkClick(() => navigateTo('new-arrival'))}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-[#06201A] hover:bg-[#FAF7EC] hover:text-[#AA820A] transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-amber-50/60 flex items-center justify-center group-hover:bg-[#FFF3B0] transition-colors">
                        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                      </div>
                      <span>New Arrivals</span>
                    </div>
                    <span className="bg-[#06201A] text-[#D4AF37] border border-[#D4AF37]/50 text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide">
                      NEW 2026
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLinkClick(() => navigateTo('flash-sale'))}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-[#06201A] hover:bg-[#FAF7EC] hover:text-[#AA820A] transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100/70 transition-colors">
                        <Flame className="w-3.5 h-3.5 text-red-500" />
                      </div>
                      <span>Flash Sale</span>
                    </div>
                    <span className="bg-gradient-to-r from-red-500 to-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs">
                      HOT SALE
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLinkClick(() => navigateTo('featured'))}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-[#06201A] hover:bg-[#FAF7EC] hover:text-[#AA820A] transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-[#FFF3B0]/40 transition-colors">
                        <Layers className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#AA820A]" />
                      </div>
                      <span>Featured Pieces</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#AA820A] group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>

                {/* Minimalist Categories List with Clean Breathing Room */}
                <div className="pt-2">
                  {(() => {
                    const liveCategories = (categories && categories.length > 0 ? categories : CATEGORIES).filter(
                      (c) => c.isActive !== false
                    );
                    const allProds = products || [];

                    return (
                      <>
                        <div className="flex items-center justify-between px-2 mb-2.5">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Product Categories
                          </p>
                          <span className="text-[10px] font-semibold text-gray-400">
                            {liveCategories.length} Categories
                          </span>
                        </div>

                        <div className="space-y-1">
                          {liveCategories.map((cat) => {
                            const count = allProds.filter(
                              (p) =>
                                p.isActive !== false &&
                                (p.category?.toLowerCase() === cat.name.toLowerCase() ||
                                  p.categorySlug === cat.slug ||
                                  p.category?.toLowerCase().includes(cat.name.toLowerCase()))
                            ).length;
                            const displayCount = count > 0 ? count : (cat.itemCount || 0);

                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() =>
                                  handleLinkClick(() => navigateTo('category', { category: cat.slug }))
                                }
                                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm text-gray-700 hover:bg-[#FAF7EC] hover:text-[#06201A] transition-all group cursor-pointer"
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-[#D4AF37] transition-colors" />
                                  <span className="font-medium group-hover:font-semibold group-hover:translate-x-0.5 transition-transform">
                                    {cat.name}
                                  </span>
                                </div>
                                <span className="text-[10px] text-gray-400 bg-gray-100/70 group-hover:bg-white group-hover:text-[#AA820A] px-2 py-0.5 rounded-full font-medium transition-colors">
                                  {displayCount} items
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </>
            ) : (
              /* Help & Customer Service Tab */
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 mb-2">
                  Customer Assistance
                </p>

                <button
                  type="button"
                  onClick={() => handleLinkClick(() => navigateTo('track-order'))}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-[#06201A] hover:bg-[#FAF7EC] hover:text-[#AA820A] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-[#D4AF37]">
                      <Truck className="w-3.5 h-3.5" />
                    </div>
                    <span>Track Your Order</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#AA820A] group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  type="button"
                  onClick={() => handleLinkClick(() => setIsLocationModalOpen(true))}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-[#06201A] hover:bg-[#FAF7EC] hover:text-[#AA820A] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-[#D4AF37]">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <span>Showroom Location</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#AA820A] group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  type="button"
                  onClick={() => handleLinkClick(() => navigateTo('delivery-info'))}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-[#06201A] hover:bg-gray-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
                      <Truck className="w-3.5 h-3.5" />
                    </div>
                    <span>Delivery Information</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  type="button"
                  onClick={() => handleLinkClick(() => navigateTo('returns-refund'))}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-[#06201A] hover:bg-gray-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
                      <RotateCcw className="w-3.5 h-3.5" />
                    </div>
                    <span>Returns & Refund</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  type="button"
                  onClick={() => handleLinkClick(() => navigateTo('how-to-order'))}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-[#06201A] hover:bg-gray-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
                      <HelpCircle className="w-3.5 h-3.5" />
                    </div>
                    <span>How to Order</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  type="button"
                  onClick={() => handleLinkClick(() => navigateTo('about-us'))}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-[#06201A] hover:bg-gray-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
                      <Info className="w-3.5 h-3.5" />
                    </div>
                    <span>About HAYBAH</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  type="button"
                  onClick={() => handleLinkClick(() => navigateTo('contact-us'))}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-[#06201A] hover:bg-gray-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <span>Contact Us</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  type="button"
                  onClick={() => handleLinkClick(() => navigateTo('faqs'))}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-[#06201A] hover:bg-gray-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
                      <FileQuestion className="w-3.5 h-3.5" />
                    </div>
                    <span>FAQs</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* Admin Console Direct Link */}
                <button
                  type="button"
                  onClick={() =>
                    handleLinkClick(() => {
                      window.history.pushState({}, '', '/admin');
                      navigateTo('admin');
                    })
                  }
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-[#06201A] hover:bg-[#FAF7EC] transition-all group border border-[#D4AF37]/30 mt-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#06201A] flex items-center justify-center text-[#D4AF37]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-[#06201A]">Admin Panel</span>
                  </div>
                  <span className="text-[10px] font-black uppercase text-[#AA820A] bg-[#D4AF37]/20 px-2 py-0.5 rounded-full">
                    Console
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* 4. Minimalist Modern Footer Actions */}
          <div className="p-3.5 bg-[#FAF7EC]/50 border-t border-gray-100 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://wa.me/8801642247530"
                target="_blank"
                rel="noreferrer"
                className="py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>

              <a
                href="tel:+8801642247530"
                className="py-2 px-2.5 rounded-xl bg-white hover:bg-gray-50 text-[#06201A] border border-gray-200/90 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>01642247530</span>
              </a>
            </div>

            <div className="flex items-center justify-between pt-1 px-1 text-[10px] text-gray-400">
              <span className="tracking-wide">HAYBAH • Modest Fashion</span>
              <span className="text-[#AA820A] font-medium">Dhaka, Bangladesh</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
