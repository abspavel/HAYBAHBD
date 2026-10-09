import React from 'react';
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const PrivacyPolicyView: React.FC = () => {
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
        <span>Home / Privacy Policy</span>
      </button>

      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#FAF7EC] text-[#AA820A] border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#06201A] uppercase tracking-tight">
          PRIVACY POLICY
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Last Updated: October 2026 • Official Data Protection Statement for HAYBAH
        </p>
      </div>

      {/* Content */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-xs space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-extrabold text-[#06201A] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#D4AF37]" />
            <span>1. Information Privacy & Data Security</span>
          </h2>
          <p>
            HAYBAH is fully committed to upholding the utmost security and confidentiality of our customers' personal data. When you browse or shop on our platform, your information remains guarded under industry-standard encryption and operational privacy.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-extrabold text-[#06201A] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#D4AF37]" />
            <span>2. Information We Collect</span>
          </h2>
          <p>
            To fulfill your orders accurately and provide prompt doorstep delivery, we collect only essential checkout details:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 pl-2">
            <li>Full customer name</li>
            <li>Direct mobile contact number for delivery coordination</li>
            <li>Shipping address, district/city, and thana</li>
            <li>Order specifications, selected sizes, and quantities</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-extrabold text-[#06201A] flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#D4AF37]" />
            <span>3. How We Use Your Data</span>
          </h2>
          <p>
            Collected customer data is exclusively utilized for the following order fulfillment purposes:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 pl-2">
            <li>Order processing and item packaging validation.</li>
            <li>Handover to certified courier networks (RedX / Steadfast) for nationwide Cash on Delivery dispatch.</li>
            <li>Real-time SMS and delivery tracking notifications.</li>
            <li>Facilitating size exchanges or direct customer care inquiries.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-extrabold text-[#06201A]">
            4. Zero Third-Party Sharing Policy
          </h2>
          <p>
            We strictly do not sell, rent, lease, or monetize your contact details with any third-party advertising companies, telemarketers, or external agencies under any circumstances.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-extrabold text-[#06201A]">
            5. Contact For Privacy Inquiries
          </h2>
          <p>
            For any queries or updates regarding your stored order records, feel free to contact our compliance team:
          </p>
          <div className="p-4 rounded-2xl bg-[#FAF7EC] border border-[#D4AF37]/30 text-xs text-gray-800 space-y-1">
            <p><strong>Email:</strong> haybahclothing1@gmail.com</p>
            <p><strong>Helpline:</strong> +880 1642-247530 (11:00 AM – 10:00 PM)</p>
            <p><strong>Showroom:</strong> Nearby kutubpur primary school, Fatullah, Narayanganj</p>
          </div>
        </section>
      </div>
    </div>
  );
};
