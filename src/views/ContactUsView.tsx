import React, { useState } from 'react';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const ContactUsView: React.FC = () => {
  const { navigateTo, setIsLocationModalOpen } = useShop();

  const [fullName, setFullName] = useState('');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName && phoneOrEmail && message) {
      setSubmitted(true);
      setTimeout(() => {
        setFullName('');
        setPhoneOrEmail('');
        setSubject('');
        setMessage('');
        setSubmitted(false);
      }, 5000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-20">
      {/* Breadcrumb */}
      <button
        type="button"
        onClick={() => navigateTo('home')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#06201A] hover:text-[#AA820A] mb-5 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Home / Contact Us</span>
      </button>

      <div className="text-center max-w-xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-[#06201A] uppercase tracking-tight">
          GET IN TOUCH WITH HAYBAH
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Have an inquiry regarding an order, size recommendation, or custom query? Our dedicated Dhaka support team is here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Contact Info Cards */}
        <div className="md:col-span-5 space-y-4">
          {/* Store Location Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7EC] flex items-center justify-center text-[#D4AF37] shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#06201A] mb-1">
                  Store & Showroom Location
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Nearby kutubpur primary school, Fatullah, Narayanganj, Bangladesh
                </p>
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#AA820A] hover:underline cursor-pointer"
                >
                  <span>View Map Location</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Hotline & WhatsApp */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-sm text-[#06201A] mb-1">
                  Helpline & WhatsApp
                </h3>
                <p className="text-xs text-gray-500 mb-2">
                  Direct call or 24/7 WhatsApp customer messaging
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="tel:01642247530"
                    className="px-3 py-1.5 rounded-lg bg-[#FAF7EC] border border-[#D4AF37]/30 text-xs font-bold text-[#06201A] hover:bg-[#D4AF37] transition-colors"
                  >
                    📞 01642247530
                  </a>
                  <a
                    href="https://wa.me/8801642247530"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                  >
                    💬 WhatsApp Chat
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7EC] flex items-center justify-center text-[#D4AF37] shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#06201A] mb-1">
                  Email Support
                </h3>
                <p className="text-xs text-gray-500 mb-1">
                  For corporate, bulk orders or press queries
                </p>
                <a
                  href="mailto:haybahclothing1@gmail.com"
                  className="text-xs font-bold text-[#AA820A] hover:underline break-all"
                >
                  haybahclothing1@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#06201A] mb-1">
                  Operating Hours
                </h3>
                <p className="text-xs text-gray-600">
                  Open Everyday: <strong className="text-gray-900">11:00 AM – 10:00 PM</strong>
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Online order placement is active 24 hours a day
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Message Form */}
        <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="text-base font-black text-[#06201A] uppercase">
              Send Us A Direct Message
            </h3>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-sm text-emerald-900">
                Thank you! Your message has been received.
              </h4>
              <p className="text-xs text-emerald-700">
                Our customer relationship team will respond to you within 2-4 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D4AF37] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Phone Number or Email *
                </label>
                <input
                  type="text"
                  required
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D4AF37] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Subject (Optional)
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D4AF37] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Your Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#D4AF37] focus:outline-hidden resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#06201A] hover:bg-[#0B2B22] text-[#D4AF37] font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>Submit Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
