import React from 'react';
import { ArrowLeft, FileCheck, AlertCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const TermsView: React.FC = () => {
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
        <span>Home / Terms & Conditions</span>
      </button>

      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#FAF7EC] text-[#AA820A] border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-3">
          <FileCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#06201A] uppercase tracking-tight">
          TERMS & CONDITIONS
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Standard guidelines and terms of service for shopping at HAYBAH
        </p>
      </div>

      {/* Content */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-xs space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-extrabold text-[#06201A]">
            1. General Terms
          </h2>
          <p>
            By accessing and placing orders on the HAYBAH platform, you agree to comply with our terms and operational guidelines. Our streetwear apparel is crafted for personal wear and lifestyle expression.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-extrabold text-[#06201A]">
            2. Pricing & Cash on Delivery
          </h2>
          <p>
            All prices displayed on the store are denominated in Bangladeshi Taka (৳ BDT). HAYBAH operates strictly on a 100% Cash on Delivery fulfillment standard:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 pl-2">
            <li>No advance payment or digital pre-authorization is required at checkout.</li>
            <li>You may verify your package upon delivery before paying the full invoice amount in cash.</li>
            <li>Delivery charges apply at ৳80 inside Dhaka and ৳120 outside Dhaka nationwide.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-extrabold text-[#06201A]">
            3. Delivery Timeline
          </h2>
          <p>
            Standard shipping takes 24 to 48 hours for inside Dhaka addresses, and 48 to 72 hours for all 64 districts outside Dhaka. Real-time courier tracking is provided with every order.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-extrabold text-[#06201A]">
            4. Intellectual Property
          </h2>
          <p>
            The HAYBAH brand trademark, Arabic calligraphy motifs, logo crests, and original product photography are the sole intellectual property of HAYBAH. Any unauthorized reproduction is prohibited.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-extrabold text-[#06201A]">
            5. Official Customer Support
          </h2>
          <p>
            For inquiries, sizing help, or order updates, reach out directly to our support desk:
          </p>
          <p className="font-semibold text-gray-900">
            Helpline: 01642247530 | WhatsApp: 01642247530 | Email: haybahclothing1@gmail.com
          </p>
        </section>
      </div>
    </div>
  );
};
