import React from 'react';
import { ShoppingBag, LayoutGrid, Home, Heart, User } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const MobileBottomNav: React.FC = () => {
  const { currentView, navigateTo, wishlist, setIsSideMenuOpen } = useShop();

  const isHomeActive = currentView === 'home';
  const isShopActive =
    currentView === 'shop' ||
    currentView === 'flash-sale' ||
    currentView === 'featured' ||
    currentView === 'new-arrival';
  const isCategoryActive = currentView === 'category';
  const isWishlistActive = currentView === 'wishlist';
  const isAccountActive = currentView === 'account';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200/70 shadow-[0_-2px_15px_rgba(0,0,0,0.05)] px-1.5 py-1 md:hidden select-none">
      <div className="flex items-center justify-around relative max-w-md mx-auto">
        {/* 1. Shop */}
        <button
          type="button"
          onClick={() => navigateTo('shop')}
          className={`flex flex-col items-center justify-center py-0.5 px-2 min-w-12 transition-all active:scale-90 ${
            isShopActive ? 'text-[#AA820A]' : 'text-gray-500 hover:text-[#06201A]'
          }`}
        >
          <ShoppingBag className="w-4.5 h-4.5 stroke-[2]" />
          <span className="text-[9px] font-bold tracking-tight mt-0.5">Shop</span>
        </button>

        {/* 2. Menu */}
        <button
          type="button"
          onClick={() => setIsSideMenuOpen(true)}
          className={`flex flex-col items-center justify-center py-0.5 px-2 min-w-12 transition-all active:scale-90 ${
            isCategoryActive ? 'text-[#AA820A]' : 'text-gray-500 hover:text-[#06201A]'
          }`}
        >
          <LayoutGrid className="w-4.5 h-4.5 stroke-[2]" />
          <span className="text-[9px] font-bold tracking-tight mt-0.5">
            Menu
          </span>
        </button>

        {/* 3. Center Raised Sleek Gold Home Button (Slim & Refined) */}
        <div className="relative -top-3.5 flex flex-col items-center">
          <button
            type="button"
            aria-label="Home"
            onClick={() => navigateTo('home')}
            className={`w-11 h-11 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#FFF2B2] to-[#AA820A] text-[#06201A] shadow-md shadow-[#D4AF37]/30 flex items-center justify-center border-2 border-white transition-all active:scale-90 hover:scale-105 ${
              isHomeActive ? 'ring-2 ring-[#06201A]/40' : ''
            }`}
          >
            <Home className="w-5 h-5 stroke-[2.3]" />
          </button>
          <span className="text-[9px] font-black text-[#06201A] -mt-0.5 tracking-tight">
            Home
          </span>
        </div>

        {/* 4. Wishlist with Badge */}
        <button
          type="button"
          onClick={() => navigateTo('wishlist')}
          className={`relative flex flex-col items-center justify-center py-0.5 px-2 min-w-12 transition-all active:scale-90 ${
            isWishlistActive ? 'text-[#AA820A]' : 'text-gray-500 hover:text-[#06201A]'
          }`}
        >
          <div className="relative">
            <Heart
              className="w-4.5 h-4.5 stroke-[2]"
              fill={isWishlistActive ? '#D4AF37' : 'none'}
            />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#06201A] text-[#D4AF37] border border-[#D4AF37] text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none">
                {wishlist.length}
              </span>
            )}
          </div>
          <span className="text-[9px] font-bold tracking-tight mt-0.5">Wishlist</span>
        </button>

        {/* 5. Account */}
        <button
          type="button"
          onClick={() => navigateTo('account')}
          className={`flex flex-col items-center justify-center py-0.5 px-2 min-w-12 transition-all active:scale-90 ${
            isAccountActive ? 'text-[#AA820A]' : 'text-gray-500 hover:text-[#06201A]'
          }`}
        >
          <User className="w-4.5 h-4.5 stroke-[2]" />
          <span className="text-[9px] font-bold tracking-tight mt-0.5">
            Account
          </span>
        </button>
      </div>
    </nav>
  );
};
