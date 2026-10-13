import React from 'react';
import { HaybahLogo } from './HaybahLogo';
import { Phone, Mail, Clock } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { PaymentMethodLogo } from './PaymentMethodLogo';

export const Footer: React.FC = () => {
  const { navigateTo, setIsTrackOrderModalOpen, setIsLocationModalOpen } = useShop();

  return (
    <footer className="bg-[#06201A] text-white pt-12 pb-24 md:pb-12 border-t border-[#D4AF37]/30 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Brand Showcase with Metallic Gold Framed Logo */}
        <div className="flex flex-col items-center text-center max-w-xl mx-auto mb-10">
          {/* Gold Metallic Frame for Logo matching Screenshot 7 */}
          <div className="relative p-3.5 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#FFF5C0] to-[#997300] shadow-xl mb-4 group cursor-pointer" onClick={() => navigateTo('home')}>
            <div className="bg-[#06201A] px-6 py-3 rounded-xl border border-[#D4AF37]/40 flex items-center justify-center">
              <HaybahLogo size="lg" />
            </div>
          </div>

          {/* Brand Description */}
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-md">
            HAYBAH is crafted for those who value timeless elegance and everyday confidence. We specialize in precision-tailored slim and regular fit apparel designed to elevate your daily style with effortless sophistication.
          </p>

          {/* Connect With Us Box matching Screenshot 7 */}
          <div className="mt-6 w-full max-w-sm rounded-xl border border-gray-700/80 p-3 bg-black/30 backdrop-blur-xs flex flex-col items-center">
            <span className="text-xs font-bold text-gray-300 tracking-wider uppercase mb-2.5">
              — Connect With Us —
            </span>

            <div className="flex items-center justify-center gap-4">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/profile.php?id=61594215545684"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform font-bold text-lg"
                title="Facebook"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/hayba_h01?stkn=MXBnODFrM3Izd2NmMA=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform text-lg"
                title="Instagram"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@haybah45?_r=1&_t=ZS-9ANiCgHfR4e"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-black border border-gray-600 text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                title="TikTok"
                aria-label="TikTok"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31 0 2.6.37 3.73 1.05a7.35 7.35 0 0 0 3.82 1.34V5.7a4.9 4.9 0 0 1-3.77-1.33v8.52c0 4.1-3.32 7.42-7.42 7.42-4.1 0-7.42-3.32-7.42-7.42 0-4.1 3.32-7.42 7.42-7.42.38 0 .76.03 1.13.09v3.42a4.06 4.06 0 0 0-1.13-.16 4.07 4.07 0 1 0 4.07 4.07V.02h2.57z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* 4 Navigation Link Columns (2-column on mobile) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-t border-b border-gray-800 text-xs sm:text-sm">
          {/* Col 1: About */}
          <div>
            <h4 className="font-extrabold text-[#D4AF37] uppercase tracking-wider mb-3 text-xs flex items-center gap-1.5">
              <span>About</span>
            </h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <button onClick={() => navigateTo('about-us')} className="hover:text-[#D4AF37] transition-colors text-left cursor-pointer">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('contact-us')} className="hover:text-[#D4AF37] transition-colors text-left cursor-pointer">
                  Contact Us
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('our-story')} className="hover:text-[#D4AF37] transition-colors text-left cursor-pointer">
                  Our Story
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('blog')} className="hover:text-[#D4AF37] transition-colors text-left cursor-pointer">
                  Blog & Lookbook
                </button>
              </li>
            </ul>
          </div>

          {/* Col 2: Customer Service */}
          <div>
            <h4 className="font-extrabold text-[#D4AF37] uppercase tracking-wider mb-3 text-xs flex items-center gap-1.5">
              <span>Customer Service</span>
            </h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <button onClick={() => navigateTo('account')} className="hover:text-[#D4AF37] transition-colors text-left cursor-pointer">
                  My Account
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('track-order')} className="hover:text-[#D4AF37] transition-colors text-left cursor-pointer">
                  Track Order
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('faqs')} className="hover:text-[#D4AF37] transition-colors text-left cursor-pointer">
                  FAQs
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('how-to-order')} className="hover:text-[#D4AF37] transition-colors text-left cursor-pointer">
                  How to Order
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Policies */}
          <div>
            <h4 className="font-extrabold text-[#D4AF37] uppercase tracking-wider mb-3 text-xs flex items-center gap-1.5">
              <span>Policies</span>
            </h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <button onClick={() => navigateTo('privacy-policy')} className="hover:text-[#D4AF37] transition-colors text-left cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('terms')} className="hover:text-[#D4AF37] transition-colors text-left cursor-pointer">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('returns-refund')} className="hover:text-[#D4AF37] transition-colors text-left cursor-pointer">
                  Returns & Refund (7 Days)
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('delivery-info')} className="hover:text-[#D4AF37] transition-colors text-left cursor-pointer">
                  Delivery Information
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Need Help? */}
          <div>
            <h4 className="font-extrabold text-[#D4AF37] uppercase tracking-wider mb-3 text-xs flex items-center gap-1.5">
              <span>Need Help?</span>
            </h4>
            <div className="space-y-2.5 text-xs text-gray-300">
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Our Helpline:</p>
                  <a href="tel:+8801642247530" className="text-[#E8CE7A] hover:underline font-medium">
                    +880 1642-247530
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <p className="text-gray-400">(11:00 AM – 08:00 PM)</p>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">E-mail:</p>
                  <a href="mailto:haybahclothing1@gmail.com" className="text-gray-300 hover:text-[#D4AF37] break-all">
                    haybahclothing1@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Accepted Payment Methods - Pill Container */}
        <div className="py-4 sm:py-5 flex flex-col items-center justify-center px-2">
          <div className="w-full max-w-5xl bg-[#0B2B22] rounded-2xl sm:rounded-full border border-[#D4AF37]/50 shadow-[0_0_16px_rgba(212,175,55,0.15)] px-2.5 sm:px-5 py-2.5 sm:py-3 flex flex-col md:flex-row items-center justify-between gap-2 sm:gap-3">
            {/* Desktop Left: Pay with label */}
            <div className="hidden md:flex shrink-0 items-center gap-1.5 self-center">
              <span className="text-white text-xs sm:text-sm font-bold tracking-wide whitespace-nowrap">
                Pay with
              </span>
            </div>

            {/* Mobile Header: Pay with label */}
            <div className="w-full flex items-center justify-center md:hidden pb-1">
              <span className="text-white text-xs font-bold tracking-wide">
                Pay with
              </span>
            </div>

            {/* Middle: Strictly 2 Rows of White Rounded Square Logo Tiles - NO horizontal scrolling, all visible at once */}
            <div className="w-full md:flex-1 overflow-hidden flex flex-col items-center justify-center gap-1 sm:gap-1.5 py-0.5">
              {/* Row 1 - 13 tiles strictly in 1 line */}
              <div className="w-full flex items-center justify-center gap-[2.5px] xs:gap-[3px] sm:gap-1 md:gap-1.5">
                {[
                  'VISA',
                  'Mastercard',
                  'AMEX',
                  'UnionPay',
                  'Diners Club',
                  'bKash',
                  'Nagad',
                  'Rocket',
                  'Upay',
                  'Tap',
                  'Islami Bank',
                  'MTCash',
                  'LankaBangla',
                ].map((name) => (
                  <div
                    key={name}
                    title={name}
                    className="w-[20px] h-[20px] xs:w-[22px] xs:h-[22px] sm:w-[28px] sm:h-[28px] md:w-[32px] md:h-[32px] rounded-[4px] sm:rounded-md bg-white shadow-xs border border-gray-100 flex items-center justify-center p-0 hover:scale-110 transition-transform duration-150 shrink-0 select-none overflow-hidden"
                  >
                    <div className="transform scale-[0.66] xs:scale-[0.76] sm:scale-90 md:scale-100 origin-center flex items-center justify-center w-full h-full whitespace-nowrap">
                      <PaymentMethodLogo name={name} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Row 2 - 12 tiles strictly in 1 line */}
              <div className="w-full flex items-center justify-center gap-[2.5px] xs:gap-[3px] sm:gap-1 md:gap-1.5">
                {[
                  'iPay',
                  'Sure Cash',
                  'Nexus Pay',
                  'Dutch-Bangla',
                  'Brac Bank',
                  'MTB',
                  'AB Bank',
                  'City Bank',
                  'Trust Bank',
                  'Islami Wallet',
                  'OK Wallet',
                  'Cash on Delivery',
                ].map((name) => (
                  <div
                    key={name}
                    title={name}
                    className="w-[20px] h-[20px] xs:w-[22px] xs:h-[22px] sm:w-[28px] sm:h-[28px] md:w-[32px] md:h-[32px] rounded-[4px] sm:rounded-md bg-white shadow-xs border border-gray-100 flex items-center justify-center p-0 hover:scale-110 transition-transform duration-150 shrink-0 select-none overflow-hidden"
                  >
                    <div className="transform scale-[0.66] xs:scale-[0.76] sm:scale-90 md:scale-100 origin-center flex items-center justify-center w-full h-full whitespace-nowrap">
                      <PaymentMethodLogo name={name} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright & Creator Attribution Line */}
        <div className="pt-4 border-t border-gray-800/80 text-center text-xs text-gray-400 space-y-2">
          <p>© 2026 HAYBAH. All Rights Reserved.</p>
          {/* Design & Development Attribution */}
          <div className="pt-1 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-gray-400">
            <span className="text-gray-400 tracking-wide font-normal">Crafted with precision —</span>
            <span className="text-gray-300 font-medium tracking-wide">Design &amp; Developed by</span>
            <span className="inline-flex items-center gap-1.5 flex-wrap justify-center">
              <a
                href="https://www.webtrixit.site"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-[#D4AF37]/15 border border-[#D4AF37]/40 hover:border-[#D4AF37] text-[#E8CE7A] hover:text-[#FFF3B0] font-semibold tracking-wider transition-all duration-200 shadow-xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] group-hover:scale-125 transition-transform"></span>
                <span>Webtrix IT Solution</span>
              </a>
              <span className="text-gray-500 font-light">&amp;</span>
              <a
                href="https://www.paveljoy.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-[#D4AF37]/15 border border-[#D4AF37]/40 hover:border-[#D4AF37] text-[#E8CE7A] hover:text-[#FFF3B0] font-semibold tracking-wider uppercase transition-all duration-200 shadow-xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] group-hover:scale-125 transition-transform"></span>
                <span>Pavel Ahmed Joy</span>
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
