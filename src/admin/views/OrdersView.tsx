import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Filter,
  Eye,
  Phone,
  MessageSquare,
  Printer,
  Calendar,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { OrderDetails, OrderStatus } from '../../types';
import { adminFetchAllOrders } from '../../services/supabaseService';
import { playAdminChime } from '../../services/localAdminStore';
import { StatusBadge } from '../components/StatusBadge';
import { OrderDetailsDrawer } from '../components/OrderDetailsDrawer';
import { AdminNotification, NotificationType } from '../components/AdminNotification';

interface OrdersViewProps {
  onSelectOrder?: (order: OrderDetails) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = () => {
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatusTab, setActiveStatusTab] = useState<'all' | OrderStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [notification, setNotification] = useState<{ message: string | null; type: NotificationType }>({
    message: null,
    type: 'success',
  });

  const loadOrders = async () => {
    setLoading(true);
    const data = await adminFetchAllOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const statuses: { id: 'all' | OrderStatus; label: string }[] = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'processing', label: 'Processing' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
    { id: 'returned', label: 'Returned' },
  ];

  // Status counts
  const getCountForStatus = (st: 'all' | OrderStatus) => {
    if (st === 'all') return orders.length;
    return orders.filter(
      (o) =>
        (o.status || '').toLowerCase() === st ||
        (st === 'pending' && (o.status || '').toLowerCase() === 'order placed')
    ).length;
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phone.toLowerCase().includes(searchQuery.toLowerCase());

    const oStatus = (o.status || '').toLowerCase();
    const matchesStatus =
      activeStatusTab === 'all' ||
      oStatus === activeStatusTab ||
      (activeStatusTab === 'pending' && oStatus === 'order placed');

    return matchesSearch && matchesStatus;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Order ID',
      'Date',
      'Customer Name',
      'Phone',
      'Address',
      'District',
      'Thana',
      'City',
      'Items Count',
      'Subtotal',
      'Delivery Fee',
      'Discount',
      'Total',
      'Status',
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.orderId}"`,
      `"${o.createdAt}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.phone}"`,
      `"${o.address.replace(/"/g, '""')}"`,
      `"${o.district}"`,
      `"${o.thana}"`,
      `"${o.city}"`,
      o.items.length,
      o.subtotal,
      o.deliveryFee,
      o.discount,
      o.total,
      `"${o.status}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `haybah-orders-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#06201A] uppercase tracking-tight">
            Orders ({orders.length})
          </h1>
          <p className="text-xs text-gray-500">
            Fulfill and track customer orders with Cash on Delivery status management
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadOrders}
            className="p-2.5 rounded-xl border border-gray-200 hover:border-[#D4AF37] bg-white text-gray-700 hover:text-[#06201A] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-[#06201A] hover:bg-[#0B2B22] text-[#D4AF37] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-[#06201A]/10 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#D4AF37]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Status Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {statuses.map((tab) => {
          const count = getCountForStatus(tab.id);
          const isActive = activeStatusTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveStatusTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-[#06201A] text-[#D4AF37] shadow-sm ring-2 ring-[#D4AF37]/30'
                  : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isActive ? 'bg-[#D4AF37] text-[#06201A]' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID (e.g. HYB-123456), Customer Name, or Phone..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#D4AF37]"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-black tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5 pl-5">Order ID</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Customer & Phone</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Items</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 text-[#D4AF37] animate-spin mx-auto mb-2" />
                    <span className="font-bold text-xs uppercase tracking-wider">Loading orders...</span>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-gray-400">
                    No orders matching this filter
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const cleanPhone = order.phone.replace(/[^0-9]/g, '');
                  const bdBareNumber = cleanPhone.slice(-10);
                  const whatsappUrl = `https://wa.me/880${bdBareNumber}?text=${encodeURIComponent(
                    `Hello ${order.customerName}, this is HAYBAH regarding your order #${order.orderId}.`
                  )}`;

                  return (
                    <tr
                      key={order.orderId}
                      className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="p-3.5 pl-5 font-mono font-black text-[#06201A]">
                        {order.orderId}
                      </td>

                      <td className="p-3.5 text-gray-500 text-[11px]">
                        {order.createdAt}
                      </td>

                      <td className="p-3.5">
                        <p className="font-extrabold text-[#06201A]">{order.customerName}</p>
                        <p className="text-[11px] text-gray-500 font-mono">{order.phone}</p>
                      </td>

                      <td className="p-3.5 text-gray-600">
                        <p className="truncate max-w-xs">{order.address}</p>
                        <p className="text-[10px] text-gray-400 font-medium">
                          {order.thana ? `${order.thana}, ` : ''}{order.district || ''} ({order.city})
                        </p>
                      </td>

                      <td className="p-3.5 text-gray-700 font-medium">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </td>

                      <td className="p-3.5 font-black text-sm text-[#06201A]">
                        ৳{order.total.toLocaleString()}
                      </td>

                      <td className="p-3.5">
                        <StatusBadge status={order.status} type="order" />
                      </td>

                      <td className="p-3.5 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`tel:${order.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                            title="Call Customer"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E]"
                            title="WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                            }}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#D4AF37] hover:text-[#06201A] text-gray-700"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Drawer */}
      <OrderDetailsDrawer
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onStatusUpdated={async () => {
          await loadOrders();
          playAdminChime('success');
          setNotification({
            message: '✓ অর্ডার স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে! (Order Status Updated)',
            type: 'success',
          });
        }}
      />

      {/* Toast Notification */}
      <AdminNotification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: null, type: 'success' })}
      />
    </div>
  );
};
