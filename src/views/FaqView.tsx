import React, { useState } from 'react';
import {
  ArrowLeft,
  HelpCircle,
  Search,
  ChevronDown,
  MessageCircle,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

interface FaqItem {
  q: string;
  a: string;
  category: 'Delivery' | 'Payment' | 'Sizing' | 'Return' | 'Quality';
}

export const FaqView: React.FC = () => {
  const { navigateTo } = useShop();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      category: 'Delivery',
      q: 'What are the delivery charges inside and outside Dhaka?',
      a: 'Delivery inside Dhaka is ৳80 (delivered within 24 to 48 hours). Delivery outside Dhaka across all 64 districts is ৳120 (delivered within 48 to 72 hours).',
    },
    {
      category: 'Delivery',
      q: 'Can I open and inspect the parcel in front of the courier rider?',
      a: 'Yes, absolutely! You are encouraged to unbox and check the garment size, fabric, and finishing before paying. Pay cash only after you are completely satisfied.',
    },
    {
      category: 'Payment',
      q: 'How does payment work? Is any advance deposit required?',
      a: 'No advance deposit is needed. HAYBAH operates on 100% Cash on Delivery across Bangladesh. You pay full cash only upon receiving your package.',
    },
    {
      category: 'Sizing',
      q: 'How do I choose the correct size for myself?',
      a: 'Each product page includes our exact size chart (M, L, XL, XXL). Our pieces feature relaxed, dropped-shoulder silhouettes. If you are unsure, message us on WhatsApp (01642247530) with your height and weight, and our specialists will recommend your best fit.',
    },
    {
      category: 'Return',
      q: 'Can I exchange the garment if the size does not fit or if there is an issue?',
      a: 'Yes, we provide a hassle-free 7-day exchange guarantee. Simply message our WhatsApp or helpline with your Order ID, and our courier will deliver the replacement size while collecting the previous item.',
    },
    {
      category: 'Quality',
      q: 'What fabric GSM and quality does HAYBAH utilize?',
      a: 'Our signature hoodies are constructed from premium 420 GSM French Terry fleece, and our drop-shoulder tees use 260 GSM 100% combed compact cotton. They maintain shape, dense drape, and deep color across multiple washes.',
    },
    {
      category: 'Return',
      q: 'What are the basic conditions for an exchange?',
      a: 'The apparel must be unworn, unwashed, and have the original brand tags attached. Notify our customer support team within 7 days of receiving your parcel.',
    },
    {
      category: 'Quality',
      q: 'Can I visit your showroom to try on apparel in person?',
      a: 'Yes! Our flagship showroom is located nearby Kutubpur Primary School, Fatullah, Narayanganj. We are open 7 days a week from 11:00 AM to 10:00 PM.',
    },
  ];

  const filteredFaqs = faqs.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-20">
      {/* Breadcrumb */}
      <button
        type="button"
        onClick={() => navigateTo('home')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#06201A] hover:text-[#AA820A] mb-5 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Home / FAQs</span>
      </button>

      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#FAF7EC] text-[#AA820A] border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-3">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#06201A] uppercase tracking-tight">
          FREQUENTLY ASKED QUESTIONS
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Common queries regarding delivery, cash on delivery, sizes, exchanges, and fabrics.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-lg mx-auto mb-6">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search question (e.g. delivery, sizing, return, COD)..."
          className="w-full bg-white pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-xs focus:border-[#D4AF37] focus:outline-hidden shadow-xs"
        />
      </div>

      {/* Category Pills */}
      <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
        {['All', 'Delivery', 'Payment', 'Sizing', 'Return', 'Quality'].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#06201A] text-[#D4AF37]'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-[#D4AF37]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Accordion FAQ List */}
      <div className="bg-white p-4 sm:p-7 rounded-3xl border border-gray-100 shadow-xs space-y-3 mb-8">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-xs">
            No matching questions found. Try a different keyword or contact our support team.
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="border border-gray-200/80 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left font-bold text-xs sm:text-sm text-[#06201A] flex items-center justify-between gap-3 bg-gray-50/50 hover:bg-[#FAF7EC]/50 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37] shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-[#AA820A]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="p-4 pt-3 text-xs sm:text-sm text-gray-700 bg-white leading-relaxed border-t border-gray-100 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* WhatsApp Help Banner */}
      <div className="bg-[#FAF7EC] p-6 rounded-3xl border border-[#D4AF37]/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h3 className="font-black text-base text-[#06201A]">
            Did not find your answer?
          </h3>
          <p className="text-xs text-gray-600 mt-0.5">
            Our live customer support is active on WhatsApp from 11:00 AM to 10:00 PM.
          </p>
        </div>

        <a
          href="https://wa.me/8801642247530"
          target="_blank"
          rel="noreferrer"
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shrink-0 transition-colors shadow-sm"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Chat on WhatsApp</span>
        </a>
      </div>
    </div>
  );
};
