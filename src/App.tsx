/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Header } from './components/Header';
import { SearchBarRow } from './components/SearchBarRow';
import { HeroSlider } from './components/HeroSlider';
import { ShopByCategory } from './components/ShopByCategory';
import { FlashSaleSection } from './components/FlashSaleSection';
import { FeaturedProductsSection } from './components/FeaturedProductsSection';
import { NewArrivalSection } from './components/NewArrivalSection';
import { TestimonialSection } from './components/TestimonialSection';
import { ShowroomBanner } from './components/ShowroomBanner';
import { Footer } from './components/Footer';
import { FloatingActions } from './components/FloatingActions';
import { MobileBottomNav } from './components/MobileBottomNav';
import { CartDrawer } from './components/CartDrawer';
import { SideMenuDrawer } from './components/SideMenuDrawer';
import { ShopLocationModal } from './components/ShopLocationModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import { CheckoutModal } from './components/CheckoutModal';
import { ListingView } from './views/ListingView';
import { ProductDetailView } from './views/ProductDetailView';
import { WishlistView } from './views/WishlistView';
import { AccountView } from './views/AccountView';
import { AboutUsView } from './views/AboutUsView';
import { ContactUsView } from './views/ContactUsView';
import { OurStoryView } from './views/OurStoryView';
import { BlogView } from './views/BlogView';
import { TrackOrderView } from './views/TrackOrderView';
import { FaqView } from './views/FaqView';
import { HowToOrderView } from './views/HowToOrderView';
import { PrivacyPolicyView } from './views/PrivacyPolicyView';
import { TermsView } from './views/TermsView';
import { ReturnsRefundView } from './views/ReturnsRefundView';
import { DeliveryInfoView } from './views/DeliveryInfoView';
import { CartView } from './views/CartView';
import { ThankYouView } from './views/ThankYouView';
import { AdminRoot } from './admin/AdminRoot';
import { CheckCircle2, Info } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentView, selectedProduct, toasts } = useShop();

  // Ensure every page transition instantly loads directly from the top with no bottom-up scroll animation
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentView]);

  // If in admin mode, render complete Admin Console without storefront chrome
  if (currentView === 'admin' || currentView === 'admin-login') {
    return <AdminRoot />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'shop':
      case 'category':
      case 'flash-sale':
      case 'featured':
      case 'new-arrival':
        return <ListingView viewType={currentView} />;

      case 'product-detail':
        return selectedProduct ? (
          <ProductDetailView product={selectedProduct} />
        ) : (
          <ListingView viewType="shop" />
        );

      case 'wishlist':
        return <WishlistView />;

      case 'account':
        return <AccountView />;

      case 'checkout':
        return <CheckoutModal />;

      case 'about-us':
        return <AboutUsView />;

      case 'contact-us':
        return <ContactUsView />;

      case 'our-story':
        return <OurStoryView />;

      case 'blog':
        return <BlogView />;

      case 'track-order':
        return <TrackOrderView />;

      case 'faqs':
        return <FaqView />;

      case 'how-to-order':
        return <HowToOrderView />;

      case 'privacy-policy':
        return <PrivacyPolicyView />;

      case 'terms':
        return <TermsView />;

      case 'returns-refund':
        return <ReturnsRefundView />;

      case 'delivery-info':
        return <DeliveryInfoView />;

      case 'cart':
        return <CartView />;

      case 'thank-you':
        return <ThankYouView />;

      case 'home':
      default:
        return (
          <>
            {/* 4. Hero banner slider with left/right arrows, auto-play */}
            <HeroSlider />

            {/* 5. "SHOP BY CATEGORY" heading with wavy underline; 4-column grid with gold frame */}
            <ShopByCategory />

            {/* 6. FLASH SALE: dark green gradient rounded section, "Go Shopping →" button, auto-sliding carousel */}
            <FlashSaleSection />

            {/* 7. FEATURED PRODUCTS: gold pill title, category tab pills, carousel, "See all products ↗" button */}
            <FeaturedProductsSection />

            {/* 8. NEW ARRIVAL: gold pill title, wide banner, product carousel with discount % badge & strikethrough price */}
            <NewArrivalSection />

            {/* 9. "TRUSTED BY ALL" pill + "Happy Clients" testimonial slider */}
            <TestimonialSection />

            {/* 10. Showroom banner */}
            <ShowroomBanner />
          </>
        );
    }
  };

  const isSearchAllowedView =
    currentView === 'home' ||
    currentView === 'shop' ||
    currentView === 'category' ||
    currentView === 'flash-sale' ||
    currentView === 'featured' ||
    currentView === 'new-arrival';

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5] text-[#06201A] selection:bg-[#D4AF37] selection:text-[#06201A]">
      {/* 1. Top scrolling announcement marquee bar (ONLY on Home page) */}
      {currentView === 'home' && <AnnouncementBar />}

      {/* 2. Header: hamburger menu (left), centered logo, cart icon with count badge (right) */}
      <Header />

      {/* 3. Row with "Shop Location" + search bar */}
      {isSearchAllowedView && <SearchBarRow />}

      {/* Main Body View */}
      <main className="flex-1 pb-16 md:pb-6">{renderView()}</main>

      {/* 11. Footer (dark green) */}
      <Footer />

      {/* 12. Floating green WhatsApp button (bottom-left), scroll-to-top button (bottom-right) */}
      <FloatingActions />

      {/* 13. Sticky bottom mobile navigation */}
      <MobileBottomNav />

      {/* Slide-out & Modal Drawers */}
      <CartDrawer />
      <SideMenuDrawer />
      <ShopLocationModal />
      <TrackOrderModal />

      {/* Toast Notification Stack */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none w-max max-w-sm px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-2 bg-[#06201A] text-white px-4 py-2.5 rounded-full shadow-2xl border border-[#D4AF37]/50 text-xs sm:text-sm font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            {toast.type === 'info' ? (
              <Info className="w-4 h-4 text-[#E8CE7A]" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <MainContent />
    </ShopProvider>
  );
}
