import React, { useState } from 'react';
import { X, Search, CheckCircle, Truck, Package, Clock, ShieldCheck } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const TrackOrderModal: React.FC = () => {
  const { isTrackOrderModalOpen, setIsTrackOrderModalOpen, orders } = useShop();
  const [searchId, setSearchId] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isTrackOrderModalOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const cleaned = searchId.trim().toUpperCase();
    const found = orders.find((o) => o.orderId.toUpperCase() === cleaned);
    if (found) {
      setSearchedOrder(found);
    } else if (cleaned.startsWith('HYB-') || cleaned.length >= 6) {
      // Mock tracking state for demo order IDs
      setSearchedOrder({
        orderId: cleaned,
        customerName: 'Valued Customer',
        phone: '017••••••••',
        address: 'Dhaka, Bangladesh',
        city: 'Inside Dhaka',
        status: 'Shipped',
        createdAt: 'Today',
        total: 1950,
      });
    } else {
      setSearchedOrder(null);
    }
  };

  const steps = [
    { label: 'Order Placed', desc: 'Received & verified', icon: CheckCircle, done: true },
    { label: 'Processing', desc: 'Packaging & quality inspection', icon: Package, done: true },
    { label: 'Shipped', desc: 'Handed to RedX Courier', icon: Truck, done: true },
    { label: 'Out for Delivery', desc: 'Rider is en route to your address', icon: Clock, done: false },
    { label: 'Delivered', desc: 'Delivered safely with Cash on Delivery', icon: ShieldCheck, done: false },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div
        onClick={() => setIsTrackOrderModalOpen(false)}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
      />

      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#D4AF37]/30 z-10">
        <button
          type="button"
          onClick={() => setIsTrackOrderModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl sm:text-2xl font-black text-[#06201A] uppercase tracking-wide">
          Track Your Order
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Enter your 6-digit HAYBAH order number to view real-time shipping status.
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mt-4 flex gap-2">
          <input
            type="text"
            required
            placeholder="e.g. HYB-104928"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="flex-1 bg-gray-50 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 uppercase font-mono focus:border-[#D4AF37] focus:bg-white focus:outline-hidden"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#06201A] hover:bg-[#0B2B22] text-[#D4AF37] rounded-xl text-xs font-bold uppercase transition-colors flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Track</span>
          </button>
        </form>

        {/* Recent Orders helper chips if user placed orders */}
        {orders.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-gray-400">Your recent orders:</span>
            {orders.slice(0, 3).map((o) => (
              <button
                key={o.orderId}
                type="button"
                onClick={() => {
                  setSearchId(o.orderId);
                  setSearchedOrder(o);
                  setHasSearched(true);
                }}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-700 hover:bg-[#FAF7EC] hover:text-[#AA820A] border border-gray-200"
              >
                {o.orderId}
              </button>
            ))}
          </div>
        )}

        {/* Tracking Details Result */}
        {hasSearched && searchedOrder && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-bold text-[#AA820A] uppercase tracking-wider">
                  Order Status
                </span>
                <h4 className="text-sm font-extrabold text-[#06201A] font-mono">
                  {searchedOrder.orderId}
                </h4>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                In Transit
              </span>
            </div>

            {/* Stepper Timeline */}
            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {steps.map((st, idx) => {
                const Icon = st.icon;
                return (
                  <div key={idx} className="relative flex items-start gap-3 pl-1">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        st.done
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                    </div>
                    <div>
                      <h5
                        className={`text-xs font-bold ${
                          st.done ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {st.label}
                      </h5>
                      <p className="text-[11px] text-gray-500">{st.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {hasSearched && !searchedOrder && (
          <div className="mt-6 p-4 rounded-xl bg-red-50 text-red-700 text-xs text-center">
            No order found with that ID. Please check the spelling or contact support.
          </div>
        )}
      </div>
    </div>
  );
};
