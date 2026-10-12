import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  UserPlus,
  TrendingUp,
  AlertTriangle,
  PhoneCall,
  Calendar,
  ArrowUpRight,
  Eye,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { OrderDetails } from '../../types';
import { adminFetchAllOrders, adminFetchAllCustomers, adminFetchAllIncompleteOrders, adminFetchAllProducts } from '../../services/supabaseService';

interface DashboardViewProps {
  onViewOrder: (order: OrderDetails) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onViewOrder,
  onNavigateTab,
}) => {
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | '90days' | 'this_year'>('30days');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [customersCount, setCustomersCount] = useState(0);
  const [incompleteCount, setIncompleteCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [loadedOrders, loadedCustomers, loadedIncomplete, loadedProducts] = await Promise.all([
          adminFetchAllOrders(),
          adminFetchAllCustomers(),
          adminFetchAllIncompleteOrders(),
          adminFetchAllProducts(),
        ]);

        setOrders(loadedOrders);
        setCustomersCount(loadedCustomers.length);
        setIncompleteCount(loadedIncomplete.filter((i) => i.status === 'new').length);
        setLowStockCount(loadedProducts.filter((p) => (p.stockQuantity ?? 50) <= 10).length);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute KPIs from REAL live orders
  const totalRevenue = orders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.total : sum), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'Order Placed').length;
  const confirmedOrders = orders.filter((o) => o.status === 'confirmed').length;
  const processingOrders = orders.filter((o) => o.status === 'processing').length;
  const shippedOrders = orders.filter((o) => o.status === 'shipped').length;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled' || o.status === 'returned').length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Chart 1: Real Revenue & Orders by Day (Last 7 days from live orders)
  const chartDailyData = React.useMemo(() => {
    const days: { date: string; revenue: number; orders: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      days.push({ date: dateLabel, revenue: 0, orders: 0 });
    }

    orders.forEach((o) => {
      if (o.status === 'cancelled' || o.status === 'returned') return;
      const orderDate = o.createdAt ? new Date(o.createdAt) : null;
      if (orderDate && !isNaN(orderDate.getTime())) {
        const orderLabel = orderDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
        const targetDay = days.find((d) => d.date === orderLabel);
        if (targetDay) {
          targetDay.revenue += o.total || 0;
          targetDay.orders += 1;
        }
      }
    });

    return days;
  }, [orders]);

  // Chart 2: Real Status Donut Chart
  const statusPieData = React.useMemo(() => {
    const list = [
      { name: 'Pending', value: pendingOrders, color: '#F59E0B' },
      { name: 'Confirmed', value: confirmedOrders, color: '#3B82F6' },
      { name: 'Processing', value: processingOrders, color: '#8B5CF6' },
      { name: 'Shipped', value: shippedOrders, color: '#6366F1' },
      { name: 'Delivered', value: deliveredOrders, color: '#10B981' },
      { name: 'Cancelled', value: cancelledOrders, color: '#EF4444' },
    ];
    const activeItems = list.filter((item) => item.value > 0);
    return activeItems.length > 0
      ? activeItems
      : [{ name: 'No Orders', value: 1, color: '#E5E7EB' }];
  }, [pendingOrders, confirmedOrders, processingOrders, shippedOrders, deliveredOrders, cancelledOrders]);

  // Chart 3: Real Sales by Category
  const categorySalesData = React.useMemo(() => {
    const catMap: Record<string, number> = {};
    orders.forEach((o) => {
      if (o.status === 'cancelled' || o.status === 'returned') return;
      o.items.forEach((it) => {
        const cat = it.product?.category || 'General';
        catMap[cat] = (catMap[cat] || 0) + (it.quantity || 1);
      });
    });

    const entries = Object.entries(catMap);
    if (entries.length === 0) return [];
    const colors = ['#D4AF37', '#B8962E', '#E8CE7A', '#102B23', '#06201A', '#737373'];
    return entries.map(([name, sales], idx) => ({
      name,
      sales,
      color: colors[idx % colors.length],
    }));
  }, [orders]);

  // Real Top 5 Selling Products
  const topProductsData = React.useMemo(() => {
    const prodMap: Record<string, { name: string; units: number; revenue: number }> = {};
    orders.forEach((o) => {
      if (o.status === 'cancelled' || o.status === 'returned') return;
      o.items.forEach((it) => {
        const pId = it.productId || it.product?.name || 'prod';
        const name = it.product?.name || 'Product';
        const qty = it.quantity || 1;
        const rev = (it.product?.price || 0) * qty;

        if (!prodMap[pId]) {
          prodMap[pId] = { name, units: qty, revenue: rev };
        } else {
          prodMap[pId].units += qty;
          prodMap[pId].revenue += rev;
        }
      });
    });

    return Object.values(prodMap)
      .sort((a, b) => b.units - a.units)
      .slice(0, 5)
      .map((p) => ({
        name: p.name,
        units: p.units,
        revenue: `৳${p.revenue.toLocaleString()}`,
      }));
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#06201A] uppercase tracking-tight">
            Live Store Dashboard
          </h1>
          <p className="text-xs text-gray-500">Real-time overview of live store activity & revenue</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold self-start sm:self-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Store Synchronized</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <StatCard
          title="Total Revenue"
          value={`৳${totalRevenue.toLocaleString()}`}
          subtitle="Net sales revenue"
          icon={<DollarSign className="w-5 h-5 text-[#D4AF37]" />}
          highlight={true}
        />

        <StatCard
          title="Total Orders"
          value={totalOrders}
          subtitle="All received orders"
          icon={<ShoppingCart className="w-5 h-5" />}
        />

        <StatCard
          title="Pending Orders"
          value={pendingOrders}
          subtitle="Awaiting fulfillment"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
        />

        <StatCard
          title="Delivered"
          value={deliveredOrders}
          subtitle="Successfully delivered"
          icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
        />

        <StatCard
          title="Cancelled / Ret."
          value={cancelledOrders}
          subtitle="Returned or cancelled"
          icon={<XCircle className="w-5 h-5 text-rose-600" />}
        />

        <StatCard
          title="Total Customers"
          value={customersCount}
          subtitle="Registered & COD shoppers"
          icon={<Users className="w-5 h-5 text-blue-600" />}
        />

        <StatCard
          title="Average Order (AOV)"
          value={`৳${avgOrderValue.toLocaleString()}`}
          subtitle="Basket size per order"
          icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
        />

        <StatCard
          title="Incomplete Drops"
          value={incompleteCount}
          subtitle="Checkout drops to recover"
          icon={<PhoneCall className="w-5 h-5 text-amber-600" />}
        />

        <StatCard
          title="Low Stock Items"
          value={lowStockCount}
          subtitle="Inventory <= 10 units"
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
        />

        <StatCard
          title="New Customers"
          value={customersCount}
          subtitle="Registered buyers"
          icon={<UserPlus className="w-5 h-5 text-teal-600" />}
        />
      </div>

      {/* Charts Section: Live Performance or Awaiting Orders */}
      {orders.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-gray-200 text-center shadow-xs space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF7EC] text-[#D4AF37] flex items-center justify-center mx-auto mb-2 border border-[#D4AF37]/30">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="font-black text-sm uppercase tracking-wider text-[#06201A]">
            লাইভ অর্ডার অ্যানালিটিক্স ও সেলস গ্রাফ (Live Analytics)
          </h3>
          <p className="text-xs text-gray-500 max-w-lg mx-auto leading-relaxed">
            সকল ডেমো ডেটা সফলভাবে মুছে ফেলা হয়েছে। লাইভ ওয়েবসাইট থেকে গ্রাহকরা রিয়েল অর্ডার প্রদান করার সাথে সাথে এখানে রেভিনিউ ট্রেন্ড, অর্ডার স্ট্যাটাস ব্রেকডাউন ও বেস্ট-সেলিং প্রোডাক্টের চার্ট স্বয়ংক্রিয়ভাবে তৈরি হবে।
          </p>
        </div>
      ) : (
        <>
          {/* Charts Row: Revenue Area Chart & Orders Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Revenue Trend */}
            <div className="lg:col-span-8 bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider text-[#06201A]">
                    Revenue Trend (BDT)
                  </h3>
                  <p className="text-xs text-gray-500">Daily gross revenue over time</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {totalOrders > 0 ? `${totalOrders} Orders Live` : 'Live Tracking'}
                </span>
              </div>

              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartDailyData}>
                    <defs>
                      <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#888" fontSize={11} />
                    <YAxis stroke="#888" fontSize={11} tickFormatter={(val) => `৳${val >= 1000 ? `${val / 1000}k` : val}`} />
                    <Tooltip
                      formatter={(value: any) => [`৳${Number(value).toLocaleString()}`, 'Revenue']}
                      contentStyle={{ backgroundColor: '#06201A', color: '#FFF', borderRadius: '12px', border: '1px solid #D4AF37' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#goldGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right: Order Status Donut Chart */}
            <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between">
              <div className="mb-2">
                <h3 className="font-black text-sm uppercase tracking-wider text-[#06201A]">
                  Order Status Breakdown
                </h3>
                <p className="text-xs text-gray-500">Distribution by fulfillment status</p>
              </div>

              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-[11px]">
                {statusPieData.map((st) => (
                  <div key={st.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                    <span className="text-gray-600 truncate">{st.name}: {st.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Sales by Category & Top 5 Selling Products */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sales by Category Bar */}
            <div className="lg:col-span-6 bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
              <div className="mb-4">
                <h3 className="font-black text-sm uppercase tracking-wider text-[#06201A]">
                  Sales by Category
                </h3>
                <p className="text-xs text-gray-500">Units sold across signature product lines</p>
              </div>

              {categorySalesData.length === 0 ? (
                <div className="h-60 w-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                  <p className="font-bold text-xs text-gray-600">কোনো ক্যাটাগরি বিক্রির তথ্য নেই</p>
                  <p className="text-[11px] text-gray-400 mt-1">অর্ডার সম্পন্ন হলে এখানে স্বয়ংক্রিয়ভাবে ক্যাটাগরি সেলস প্রদর্শিত হবে।</p>
                </div>
              ) : (
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categorySalesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#888" fontSize={10} />
                      <YAxis stroke="#888" fontSize={11} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#06201A', color: '#FFF', borderRadius: '12px' }}
                      />
                      <Bar dataKey="sales" fill="#0B2B22" radius={[6, 6, 0, 0]}>
                        {categorySalesData.map((entry, index) => (
                          <Cell key={`bar-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Top 5 Products */}
            <div className="lg:col-span-6 bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-wider text-[#06201A]">
                      Top 5 Best-Selling Products
                    </h3>
                    <p className="text-xs text-gray-500">Highest volume performers</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('products')}
                    className="text-xs font-bold text-[#AA820A] hover:underline"
                  >
                    All Products →
                  </button>
                </div>

                {topProductsData.length === 0 ? (
                  <div className="py-16 text-center text-gray-400">
                    <p className="font-bold text-xs text-gray-600">কোনো পণ্য এখনো বিক্রি হয়নি</p>
                    <p className="text-[11px] text-gray-400 mt-1">নতুন গ্রাহক পণ্য ক্রয় করলে সেরা বিক্রিত পণ্য এখানে তালিকাভুক্ত হবে।</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {topProductsData.map((prod, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-gray-100 font-black text-gray-700 flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-[#06201A]">{prod.name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-right">
                          <span className="text-gray-500 font-medium">{prod.units} units</span>
                          <span className="font-black text-[#06201A] font-mono">{prod.revenue}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Recent Orders List Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm uppercase tracking-wider text-[#06201A]">
              Recent Customer Orders
            </h3>
            <p className="text-xs text-gray-500">Live incoming COD orders</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('orders')}
            className="px-3.5 py-1.5 rounded-xl bg-[#06201A] text-[#D4AF37] text-xs font-bold uppercase tracking-wider hover:bg-[#0B2B22] transition-colors"
          >
            Manage All Orders →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-black tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5 pl-5">Order ID</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Items</th>
                <th className="p-3.5">Total</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    <ShoppingCart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="font-bold text-xs text-gray-600">এখনো কোনো লাইভ অর্ডার আসেনি</p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      গ্রাহকরা ওয়েবসাইট থেকে নতুন অর্ডার করলে সাথে সাথে এখানে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।
                    </p>
                  </td>
                </tr>
              ) : (
                orders.slice(0, 6).map((order) => (
                  <tr
                    key={order.orderId}
                    className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                    onClick={() => onViewOrder(order)}
                  >
                    <td className="p-3.5 pl-5 font-mono font-bold text-[#06201A]">
                      {order.orderId}
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold text-[#06201A]">{order.customerName}</p>
                      <p className="text-[11px] text-gray-500">{order.phone}</p>
                    </td>
                    <td className="p-3.5 text-gray-600">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </td>
                    <td className="p-3.5 font-bold text-[#06201A]">
                      ৳{order.total.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-gray-500 text-[11px]">
                      {order.createdAt}
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={order.status} type="order" />
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewOrder(order);
                        }}
                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#D4AF37] hover:text-[#06201A] transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
