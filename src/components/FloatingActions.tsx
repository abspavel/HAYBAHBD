import React, { useState, useEffect } from 'react';
import { ArrowUp, MessageCircle } from 'lucide-react';

export const FloatingActions: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 250);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openWhatsApp = () => {
    const phoneNumber = '8801642247530';
    const message = encodeURIComponent(
      'Salam! I want to inquire about products from HAYBAH.'
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <>
      {/* Floating Green WhatsApp Button (Bottom-Left) */}
      <button
        type="button"
        aria-label="Contact on WhatsApp"
        onClick={openWhatsApp}
        className="fixed bottom-20 left-4 z-40 w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 group cursor-pointer"
      >
        <MessageCircle className="w-7 h-7 fill-white text-[#25D366]" />
        {/* Tooltip on desktop */}
        <span className="hidden md:group-hover:block absolute left-14 bg-[#06201A] text-white text-xs px-2.5 py-1 rounded-md whitespace-nowrap shadow-md">
          Chat on WhatsApp
        </span>
      </button>

      {/* Scroll-to-Top Button (Bottom-Right) */}
      {showScrollTop && (
        <button
          type="button"
          aria-label="Scroll to top"
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 z-40 w-10 h-10 rounded-full bg-white/90 hover:bg-[#D4AF37] text-[#06201A] shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 border border-gray-200 cursor-pointer"
        >
          <ArrowUp className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}
    </>
  );
};
