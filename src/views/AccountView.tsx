import React from 'react';
import { User, Package, MapPin, Phone, Mail, ArrowLeft, Truck, ChevronRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const AccountView: React.FC = () => {
  const { orders, navigateTo, setIsTrackOrderModalOpen, setIsLocationModalOpen } = useShop();

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => navigateTo('home')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#06201A] hover:text-[#AA820A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-full bg-[#06201A] text-[#D4AF37] border-2 border-[#D4AF37] flex items-center justify-center font-bold text-2xl font-brand shrink-0 shadow-lg">
            H
          </div>

          <div className="flex-1">
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#FAF7EC] text-[#AA820A] text-[11px] font-bold uppercase tracking-wider mb-1">
              HAYBAH Club Member
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#06201A]">
              Humaira Nourin
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              haybahclothing1@gmail.com • 01642247530
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsTrackOrderModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-[#06201A] hover:bg-[#0B2B22] text-[#D4AF37] font-bold text-xs uppercase tracking-wider transition-all"
          >
            Track An Order
          </button>
        </div>
      </div>

      {/* Order History */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs mb-8">
        <h2 className="text-lg font-black text-[#06201A] uppercase tracking-wide mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
          <Package className="w-5 h-5 text-[#D4AF37]" />
          <span>Your Orders ({orders.length})</span>
        </h2>

        {orders.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-semibold text-sm text-gray-700">No orders placed yet</p>
            <p className="text-xs text-gray-400 mt-0.5 mb-4">
              Your completed orders and delivery tracking will appear here.
            </p>
            <button
              type="button"
              onClick={() => navigateTo('shop')}
              className="px-5 py-2 rounded-full bg-[#D4AF37] text-[#06201A] font-bold text-xs uppercase"
            >
              Shop Collections
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => (
              <div
                key={ord.orderId}
                className="p-4 rounded-2xl bg-[#FBFBFA] border border-gray-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-[#06201A] text-sm">
                      {ord.orderId}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                      {ord.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Placed on {ord.createdAt} • {ord.items.length} item(s) • {ord.paymentMethod}
                  </p>
                  <p className="text-xs font-bold text-[#06201A] mt-1">
                    Total: ৳{ord.total.toLocaleString()}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsTrackOrderModalOpen(true)}
                  className="px-4 py-2 bg-white border border-gray-200 hover:border-[#D4AF37] rounded-xl text-xs font-bold text-[#06201A] flex items-center gap-1.5 transition-colors self-end sm:self-auto"
                >
                  <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Track Status</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Saved Addresses & Outlets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
          <h3 className="font-bold text-sm text-[#06201A] flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-[#D4AF37]" />
            <span>Default Delivery Address</span>
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            House 42, Road 7, Sector 3, Uttara, Dhaka-1230, Bangladesh
          </p>
          <span className="inline-block mt-3 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            Verified Address
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
          <h3 className="font-bold text-sm text-[#06201A] flex items-center gap-2 mb-2">
            <Phone className="w-4 h-4 text-[#D4AF37]" />
            <span>Customer Assistance</span>
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Have questions about an exchange or refund? Reach out to our Dhaka support team.
          </p>
          <a
            href="tel:+8801642247530"
            className="inline-block mt-3 text-xs font-bold text-[#AA820A] hover:underline"
          >
            01642247530 (11 AM - 8 PM) →
          </a>
        </div>
      </div>
    </div>
  );
};
