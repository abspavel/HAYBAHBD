import React, { useState } from 'react';
import {
  ArrowLeft,
  Package,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const TrackOrderView: React.FC = () => {
  const { navigateTo, orders } = useShop();

  const [inputVal, setInputVal] = useState('');
  const [activeTracking, setActiveTracking] = useState<{
    id: string;
    customerName: string;
    phone: string;
    address: string;
    courier: string;
    consignmentId: string;
    status: 'Order Placed' | 'Processing' | 'In Transit' | 'Out for Delivery' | 'Delivered';
    date: string;
    currentLocation: string;
    estimatedDelivery: string;
  } | null>(() => {
    // If there is an existing placed order, load the latest one by default!
    if (orders.length > 0) {
      const latest = orders[0];
      return {
        id: latest.orderId,
        customerName: latest.customerName,
        phone: latest.phone,
        address: `${latest.address}, ${latest.thana}, ${latest.district}`,
        courier: latest.city === 'Inside Dhaka' ? 'RedX Express' : 'Steadfast Courier',
        consignmentId: `CN-${latest.orderId.replace('HYB-', '')}`,
        status: 'In Transit',
        date: latest.createdAt,
        currentLocation:
          latest.city === 'Inside Dhaka'
            ? 'Dhaka Central Hub - Out for sorting'
            : 'Regional Gateway Hub',
        estimatedDelivery:
          latest.city === 'Inside Dhaka' ? 'Within 24-48 Hours' : 'Within 48-72 Hours',
      };
    }
    return null;
  });

  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputVal.trim().toUpperCase();
    if (!query) return;

    setHasSearched(true);

    // Check if query matches local orders
    const matched = orders.find(
      (o) => o.orderId.toUpperCase() === query || o.phone.includes(query)
    );

    if (matched) {
      setActiveTracking({
        id: matched.orderId,
        customerName: matched.customerName,
        phone: matched.phone,
        address: `${matched.address}, ${matched.thana}, ${matched.district}`,
        courier: matched.city === 'Inside Dhaka' ? 'RedX Express' : 'Steadfast Courier',
        consignmentId: `CN-${matched.orderId.replace('HYB-', '')}`,
        status: 'In Transit',
        date: matched.createdAt,
        currentLocation:
          matched.city === 'Inside Dhaka'
            ? 'Dhaka Central Hub - Dispatched'
            : 'Regional Gateway Hub',
        estimatedDelivery:
          matched.city === 'Inside Dhaka' ? 'Within 24-48 Hours' : 'Within 48-72 Hours',
      });
    } else {
      // Mock tracking info for any standard order ID or phone
      setActiveTracking({
        id: query.startsWith('HYB-') ? query : `HYB-${query.slice(-6)}`,
        customerName: 'Valued Customer',
        phone: query.length === 11 ? query : '01642247530',
        address: 'Delivery destination via Cash on Delivery',
        courier: 'Steadfast Courier / RedX Express',
        consignmentId: `CN-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'In Transit',
        date: 'Today',
        currentLocation: 'Hub in transit to local distribution center',
        estimatedDelivery: '24-48 Hours',
      });
    }
  };

  const steps = [
    { title: 'Order Confirmed', desc: 'Received & verified', completed: true },
    { title: 'Quality Packed', desc: '420 GSM inspected', completed: true },
    { title: 'In Transit', desc: 'Dispatched to courier', completed: true },
    { title: 'Out for Delivery', desc: 'Rider on the way', completed: false },
    { title: 'Delivered', desc: 'Cash paid to rider', completed: false },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-20">
      {/* Breadcrumb */}
      <button
        type="button"
        onClick={() => navigateTo('home')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#06201A] hover:text-[#AA820A] mb-5 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Home / Track Order</span>
      </button>

      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#06201A] text-[#D4AF37] flex items-center justify-center mx-auto mb-3 shadow-md">
          <Truck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#06201A] uppercase tracking-tight">
          LIVE ORDER TRACKING
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Enter your Order ID (e.g. HYB-104928) or phone number to track package progress in real time.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-xs mb-8 max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Enter Order ID (e.g. HYB-104928) or Mobile"
              className="w-full bg-gray-50/50 pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-xs font-mono uppercase focus:border-[#D4AF37] focus:bg-white focus:outline-hidden transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-[#06201A] hover:bg-[#0B2B22] text-[#D4AF37] font-extrabold text-xs uppercase tracking-wider transition-all shrink-0 cursor-pointer shadow-md"
          >
            Track Order
          </button>
        </form>

        {/* Quick order shortcuts if user has orders */}
        {orders.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-gray-500 font-semibold text-[11px]">Your recent order:</span>
            <button
              type="button"
              onClick={() => {
                setInputVal(orders[0].orderId);
                setActiveTracking({
                  id: orders[0].orderId,
                  customerName: orders[0].customerName,
                  phone: orders[0].phone,
                  address: `${orders[0].address}, ${orders[0].thana}, ${orders[0].district}`,
                  courier: orders[0].city === 'Inside Dhaka' ? 'RedX Express' : 'Steadfast Courier',
                  consignmentId: `CN-${orders[0].orderId.replace('HYB-', '')}`,
                  status: 'In Transit',
                  date: orders[0].createdAt,
                  currentLocation:
                    orders[0].city === 'Inside Dhaka'
                      ? 'Dhaka Central Hub - Out for sorting'
                      : 'Regional Gateway Hub',
                  estimatedDelivery:
                    orders[0].city === 'Inside Dhaka' ? 'Within 24-48 Hours' : 'Within 48-72 Hours',
                });
              }}
              className="px-2.5 py-1 rounded-lg bg-[#FAF7EC] text-[#AA820A] border border-[#D4AF37]/30 font-mono font-bold text-[11px] hover:bg-[#D4AF37] hover:text-[#06201A] transition-colors"
            >
              {orders[0].orderId} (Click to load)
            </button>
          </div>
        )}
      </div>

      {/* Tracking Results Card */}
      {activeTracking ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
          {/* Header Info Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 uppercase font-semibold">Order ID:</span>
                <span className="font-mono text-base sm:text-lg font-black text-[#06201A]">
                  {activeTracking.id}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                  {activeTracking.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Courier Partner: <strong className="text-gray-900">{activeTracking.courier}</strong> • Consignment: <span className="font-mono">{activeTracking.consignmentId}</span>
              </p>
            </div>

            <div className="sm:text-right">
              <span className="text-xs text-gray-500 block">Estimated Arrival</span>
              <span className="text-sm font-extrabold text-[#AA820A]">
                {activeTracking.estimatedDelivery}
              </span>
            </div>
          </div>

          {/* Progress Timeline Stepper */}
          <div className="py-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-6">
              Delivery Milestones
            </h3>
            <div className="grid grid-cols-5 gap-2 relative">
              {/* Connecting line */}
              <div className="absolute top-4 left-6 right-6 h-0.5 bg-gray-200 -z-0" />
              <div className="absolute top-4 left-6 w-3/5 h-0.5 bg-[#D4AF37] -z-0" />

              {steps.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center text-center relative z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                      step.completed
                        ? 'bg-[#06201A] text-[#D4AF37] ring-4 ring-[#D4AF37]/20 shadow-md'
                        : 'bg-gray-100 text-gray-400 border border-gray-300'
                    }`}
                  >
                    {step.completed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-[#06201A] leading-tight">
                    {step.title}
                  </span>
                  <span className="text-[10px] text-gray-500 mt-0.5 hidden sm:block">
                    {step.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Location & Courier Details Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div className="p-4 rounded-2xl bg-[#FAF7EC] border border-[#D4AF37]/30 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#06201A]">
                <MapPin className="w-4 h-4 text-[#AA820A]" />
                <span>Current Hub Location:</span>
              </div>
              <p className="text-xs text-gray-700 pl-6">{activeTracking.currentLocation}</p>
              <p className="text-[11px] text-gray-500 pl-6">Latest update: Scanned today</p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Payment Terms:</span>
              </div>
              <p className="text-xs text-gray-700 pl-6">
                100% Cash on Delivery (Pay only after physical inspection)
              </p>
              <p className="text-[11px] text-gray-500 pl-6">7-day hassle-free exchange guaranteed</p>
            </div>
          </div>

          {/* Need help row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#06201A] text-white">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-[#D4AF37]" />
              <div>
                <p className="font-bold text-xs">Need instant courier assistance?</p>
                <p className="text-[11px] text-gray-300">
                  Call our customer helpline for live dispatch coordination.
                </p>
              </div>
            </div>
            <a
              href="tel:01642247530"
              className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#B8962E] text-[#06201A] font-extrabold text-xs uppercase tracking-wider shrink-0"
            >
              01642247530
            </a>
          </div>
        </div>
      ) : hasSearched ? (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xs text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="font-bold text-base text-[#06201A]">No tracking record found</h3>
          <p className="text-xs text-gray-600 max-w-sm mx-auto">
            Please ensure you entered the exact Order ID sent via SMS or provided at checkout.
          </p>
          <button
            type="button"
            onClick={() => setInputVal('')}
            className="text-xs font-bold text-[#AA820A] hover:underline"
          >
            Clear and Try Again
          </button>
        </div>
      ) : null}
    </div>
  );
};
