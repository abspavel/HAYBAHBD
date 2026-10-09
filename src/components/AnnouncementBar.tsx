import React from 'react';
import { useShop } from '../context/ShopContext';

export const AnnouncementBar: React.FC = () => {
  const { siteSettings } = useShop();

  const customText = siteSettings?.marqueeText?.trim();
  const marqueeItems = customText
    ? customText.split('|').map((s) => s.trim()).filter(Boolean)
    : [
        'FREE SHIPPING ON ORDERS OVER ৳2000!',
        'CASH ON DELIVERY AVAILABLE ALL OVER BANGLADESH',
        '7-DAY EASY EXCHANGE POLICY',
        '100% ORIGINAL QUALITY GUARANTEED',
      ];

  return (
    <div className="w-full bg-[#D4AF37] text-[#06201A] overflow-hidden h-[26px] sm:h-[28px] flex items-center font-extrabold text-[12px] tracking-wider uppercase border-b border-[#B8962E] select-none py-0">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, idx) => (
          <div key={idx} className="flex items-center mx-3 sm:mx-4">
            <span>{item}</span>
            <span className="mx-3 sm:mx-4 text-black text-[9px]">●</span>
          </div>
        ))}
      </div>
    </div>
  );
};
