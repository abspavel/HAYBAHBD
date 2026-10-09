import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Image as ImageIcon,
  Grid,
  Package,
  ShoppingCart,
  Users,
  Tag,
  PhoneCall,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Bell,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { HaybahLogo } from '../../components/HaybahLogo';
import { supabase } from '../../lib/supabase';
import { useShop } from '../../context/ShopContext';

export type AdminTab =
  | 'dashboard'
  | 'banners'
  | 'categories'
  | 'products'
  | 'orders'
  | 'customers'
  | 'coupons'
  | 'incomplete'
  | 'settings';

interface AdminLayoutProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  children: React.ReactNode;
  onLogout: () => void;
  incompleteCount?: number;
  newOrdersCount?: number;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  onTabChange,
  children,
  onLogout,
  incompleteCount = 0,
  newOrdersCount = 0,
}) => {
  const { navigateTo } = useShop();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [realtimeOrderAlert, setRealtimeOrderAlert] = useState<string | null>(null);

  // Supabase Realtime subscription for incoming orders
  useEffect(() => {
    const channel = supabase
      .channel('admin-realtime-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const newOrderNumber = payload.new?.order_number || 'New Order';
          setRealtimeOrderAlert(`New Order Arrived! #${newOrderNumber}`);

          // Try play notification chime audio
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
          } catch (e) {
            console.warn('Audio chime unsupported:', e);
          }

          setTimeout(() => setRealtimeOrderAlert(null), 5000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const navItems: { id: AdminTab; label: string; icon: any; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: newOrdersCount },
    { id: 'incomplete', label: 'Incomplete Orders', icon: PhoneCall, badge: incompleteCount },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Grid },
    { id: 'banners', label: 'Hero Banners', icon: ImageIcon },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F5] text-[#06201A] flex flex-col md:flex-row font-sans">
      {/* Realtime Alert Banner */}
      {realtimeOrderAlert && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-[#06201A] text-[#FFF5C0] border-2 border-[#D4AF37] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <Bell className="w-5 h-5 text-[#D4AF37] animate-pulse" />
          <span className="font-black text-sm">{realtimeOrderAlert}</span>
          <button
            onClick={() => onTabChange('orders')}
            className="px-3 py-1 bg-[#D4AF37] text-[#06201A] text-xs font-bold rounded-lg uppercase tracking-wider"
          >
            View Orders
          </button>
        </div>
      )}

      {/* Mobile Top Header */}
      <header className="md:hidden bg-[#06201A] text-white px-4 py-3 border-b border-[#D4AF37]/30 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg bg-white/10 text-white"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="scale-90 origin-left">
            <HaybahLogo size="sm" />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] bg-[#D4AF37]/15 px-2 py-0.5 rounded-full border border-[#D4AF37]/40">
            Admin
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              window.history.pushState({}, '', '/');
              navigateTo('home');
            }}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#FFF5C0] text-xs font-bold flex items-center gap-1 cursor-pointer"
            title="View Storefront"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="text-[11px]">Store</span>
          </button>
        </div>
      </header>

      {/* Desktop Sidebar & Mobile Slide-Out Drawer */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-40 bg-[#06201A] text-white flex flex-col justify-between w-64 border-r border-[#D4AF37]/25 transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-gray-800/80 flex items-center justify-between">
            <div className="flex flex-col">
              <HaybahLogo size="md" />
              <div className="mt-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold tracking-widest text-[#D4AF37] uppercase">
                  Management Console
                </span>
              </div>
            </div>
            {isMobileMenuOpen && (
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="md:hidden p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Nav List */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#E8CE7A] text-[#06201A] shadow-md font-black'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#06201A]' : 'text-[#D4AF37]'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isActive
                          ? 'bg-[#06201A] text-[#D4AF37]'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile & Actions */}
        <div className="p-4 border-t border-gray-800/80 space-y-2 bg-[#041511]">
          {/* Storefront Link */}
          <button
            type="button"
            onClick={() => {
              window.history.pushState({}, '', '/');
              navigateTo('home');
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#FFF5C0] text-xs font-bold transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>View Storefront</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
          </button>

          {/* Admin Info */}
          <div className="flex items-center justify-between pt-1">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-bold text-white truncate">HAYBAH Admin</p>
              <p className="text-[10px] text-gray-400 truncate">haybahclothing1@gmail.com</p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 pb-16 md:pb-6">
        {/* Desktop Topbar */}
        <header className="hidden md:flex bg-white border-b border-gray-200 px-8 py-3.5 items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div>
            <h2 className="text-lg font-black text-[#06201A] capitalize tracking-tight flex items-center gap-2">
              <span>{activeTab.replace('-', ' ')}</span>
              <span className="text-xs font-normal text-gray-400">|</span>
              <span className="text-xs font-medium text-gray-500">HAYBAH Administration</span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                window.history.pushState({}, '', '/');
                navigateTo('home');
              }}
              className="px-3.5 py-1.5 rounded-full border border-[#D4AF37] bg-[#FAF7EC] hover:bg-[#D4AF37] text-[#06201A] text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Storefront</span>
            </button>

            <div className="flex items-center gap-2 pl-3 border-l border-gray-200 text-xs">
              <div className="w-7 h-7 rounded-full bg-[#06201A] text-[#D4AF37] font-black flex items-center justify-center text-xs">
                H
              </div>
              <span className="font-bold text-gray-800">haybahclothing1@gmail.com</span>
            </div>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 p-3 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Quick Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#06201A] border-t border-[#D4AF37]/30 z-30 flex items-center justify-around py-2 px-1">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            activeTab === 'dashboard' ? 'text-[#D4AF37]' : 'text-gray-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Stats</span>
        </button>

        <button
          onClick={() => onTabChange('orders')}
          className={`relative flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            activeTab === 'orders' ? 'text-[#D4AF37]' : 'text-gray-400'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Orders</span>
          {newOrdersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center">
              {newOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange('incomplete')}
          className={`relative flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            activeTab === 'incomplete' ? 'text-[#D4AF37]' : 'text-gray-400'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Drops</span>
          {incompleteCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-[#06201A] text-[8px] font-black flex items-center justify-center">
              {incompleteCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange('products')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            activeTab === 'products' ? 'text-[#D4AF37]' : 'text-gray-400'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Products</span>
        </button>

        <button
          onClick={() => onTabChange('settings')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            activeTab === 'settings' ? 'text-[#D4AF37]' : 'text-gray-400'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};
