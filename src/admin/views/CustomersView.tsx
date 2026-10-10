import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Users,
  Phone,
  MessageSquare,
  Eye,
  ShieldBan,
  ShieldCheck,
  UserCheck,
  Calendar,
  X,
  CreditCard,
} from 'lucide-react';
import { Customer, OrderDetails } from '../../types';
import { adminFetchAllCustomers, adminFetchAllOrders } from '../../services/supabaseService';
import { getLocalCustomers, saveLocalCustomer, toggleBlockCustomer as toggleBlockLocalCustomer, playAdminChime } from '../../services/localAdminStore';
import { supabase } from '../../lib/supabase';
import { AdminNotification, NotificationType } from '../components/AdminNotification';

export const CustomersView: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [notification, setNotification] = useState<{ message: string | null; type: NotificationType }>({
    message: null,
    type: 'success',
  });

  const loadData = async () => {
    setLoading(true);
    const [custData, ordersData] = await Promise.all([
      adminFetchAllCustomers(),
      adminFetchAllOrders(),
    ]);

    // Always guarantee customers are available from customer table or synthesized from shoppers
    let merged = [...custData];
    if (merged.length === 0) {
      merged = getLocalCustomers();
    }

    if (merged.length === 0 && ordersData.length > 0) {
      const custMap: Record<string, Customer> = {};
      ordersData.forEach((ord) => {
        const phone = ord.phone;
        if (!custMap[phone]) {
          custMap[phone] = {
            id: `cust-${phone}`,
            name: ord.customerName,
            phone: ord.phone,
            address: ord.address,
            city: ord.city,
            district: ord.district,
            thana: ord.thana,
            totalOrders: 1,
            totalSpent: ord.total,
            lastOrderDate: ord.createdAt,
            isBlocked: false,
          };
        } else {
          custMap[phone].totalOrders += 1;
          custMap[phone].totalSpent += ord.total;
        }
      });
      merged = Object.values(custMap);
    }

    setCustomers(merged);
    setOrders(ordersData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleBlockCustomer = async (cust: Customer) => {
    const isNowBlocked = toggleBlockLocalCustomer(cust.id);
    try {
      await supabase
        .from('customers')
        .update({ is_blocked: isNowBlocked })
        .eq('id', cust.id);
    } catch (e) {
      console.warn(e);
    }
    setCustomers((prev) =>
      prev.map((c) => (c.id === cust.id ? { ...c, isBlocked: isNowBlocked } : c))
    );
    if (selectedCustomer?.id === cust.id) {
      setSelectedCustomer({ ...selectedCustomer, isBlocked: isNowBlocked });
    }
    playAdminChime(isNowBlocked ? 'delete' : 'success');
    setNotification({
      message: `✓ কাস্টমার "${cust.name}" ${isNowBlocked ? 'ব্লক' : 'আনব্লক'} করা হয়েছে!`,
      type: isNowBlocked ? 'delete' : 'success',
    });
  };

  const handleSaveNotes = async () => {
    if (!selectedCustomer) return;
    saveLocalCustomer({ id: selectedCustomer.id, adminNotes: adminNote });
    try {
      await supabase
        .from('customers')
        .update({ admin_notes: adminNote })
        .eq('id', selectedCustomer.id);
    } catch (e) {
      console.warn(e);
    }
    setSelectedCustomer({ ...selectedCustomer, adminNotes: adminNote });
    playAdminChime('success');
    setNotification({
      message: '✓ কাস্টমার নোট সফলভাবে সংরক্ষিত হয়েছে!',
      type: 'success',
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Name', 'Phone', 'Address', 'City', 'Total Orders', 'Total Spent', 'Status'];
    const rows = filteredCustomers.map((c) => [
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${(c.address || '').replace(/"/g, '""')}"`,
      `"${c.city || ''}"`,
      c.totalOrders,
      c.totalSpent,
      c.isBlocked ? 'Blocked' : 'Active',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `haybah-customers-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const customerOrders = selectedCustomer
    ? orders.filter((o) => o.phone === selectedCustomer.phone)
    : [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#06201A] uppercase tracking-tight">
            Customers ({customers.length})
          </h1>
          <p className="text-xs text-gray-500">
            View shopper profiles, order history, and manage buyer relationships
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-[#06201A] hover:bg-[#0B2B22] text-[#D4AF37] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-[#06201A]/10 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-[#D4AF37]" />
          <span>Export Customers CSV</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer by name, phone (+880...), location..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#D4AF37]"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-black tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5 pl-5">Customer</th>
                <th className="p-3.5">Phone</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5 text-center">Orders</th>
                <th className="p-3.5">Total Spent</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.map((cust) => {
                const cleanPhone = cust.phone.replace(/[^0-9]/g, '');
                const bdBareNumber = cleanPhone.slice(-10);
                const whatsappUrl = `https://wa.me/880${bdBareNumber}?text=${encodeURIComponent(
                  `Hello ${cust.name}, this is HAYBAH customer support.`
                )}`;

                return (
                  <tr
                    key={cust.id}
                    className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedCustomer(cust);
                      setAdminNote(cust.adminNotes || '');
                    }}
                  >
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#06201A] text-[#D4AF37] font-black flex items-center justify-center text-xs shrink-0">
                          {cust.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-extrabold text-[#06201A]">{cust.name}</p>
                          {cust.email && (
                            <p className="text-[11px] text-gray-400">{cust.email}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-gray-700 font-medium">
                      {cust.phone}
                    </td>

                    <td className="p-3.5 text-gray-600">
                      <p className="truncate max-w-xs">{cust.address || '—'}</p>
                      <p className="text-[10px] text-gray-400">{cust.city || 'Dhaka'}</p>
                    </td>

                    <td className="p-3.5 text-center font-bold text-[#06201A]">
                      {cust.totalOrders}
                    </td>

                    <td className="p-3.5 font-black text-sm text-[#06201A]">
                      ৳{cust.totalSpent.toLocaleString()}
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          cust.isBlocked
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {cust.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>

                    <td className="p-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`tel:${cust.phone}`}
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
                            setSelectedCustomer(cust);
                            setAdminNote(cust.adminNotes || '');
                          }}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#D4AF37] hover:text-[#06201A] text-gray-700"
                          title="View Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right">
            {/* Header */}
            <div className="p-5 border-b border-gray-200 bg-[#06201A] text-white flex items-center justify-between sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37] text-[#06201A] font-black flex items-center justify-center text-sm">
                  {selectedCustomer.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-black text-base text-white">{selectedCustomer.name}</h3>
                  <p className="text-xs text-gray-300 font-mono">{selectedCustomer.phone}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="p-2 rounded-xl bg-white/10 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-6 flex-1 text-xs">
              {/* Quick Contact & Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={`tel:${selectedCustomer.phone}`}
                  className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Call</span>
                </a>

                <a
                  href={`https://wa.me/880${selectedCustomer.phone.replace(/[^0-9]/g, '').slice(-10)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-bold flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => toggleBlockCustomer(selectedCustomer)}
                  className={`p-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 ${
                    selectedCustomer.isBlocked
                      ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                  }`}
                >
                  {selectedCustomer.isBlocked ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Unblock</span>
                    </>
                  ) : (
                    <>
                      <ShieldBan className="w-3.5 h-3.5 text-rose-600" />
                      <span>Block</span>
                    </>
                  )}
                </button>
              </div>

              {/* Stats Box */}
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <div>
                  <span className="text-gray-500 font-bold uppercase text-[10px]">
                    Total Orders
                  </span>
                  <p className="text-xl font-black text-[#06201A] mt-0.5">
                    {selectedCustomer.totalOrders}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 font-bold uppercase text-[10px]">
                    Total Spend
                  </span>
                  <p className="text-xl font-black text-[#AA820A] mt-0.5">
                    ৳{selectedCustomer.totalSpent.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-1">
                <span className="text-gray-400 font-bold uppercase text-[10px]">
                  Default Delivery Address
                </span>
                <p className="font-semibold text-gray-800">{selectedCustomer.address || 'Not specified'}</p>
                <p className="text-gray-500 text-[11px]">
                  {selectedCustomer.thana ? `${selectedCustomer.thana}, ` : ''}
                  {selectedCustomer.district || ''} ({selectedCustomer.city})
                </p>
              </div>

              {/* Admin Notes */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                <span className="text-gray-700 font-bold uppercase text-[10px]">
                  Internal Admin Notes
                </span>
                <textarea
                  rows={2}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Notes about customer preferences, exchange history, etc..."
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
                />
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="px-3 py-1.5 rounded-lg bg-[#06201A] text-[#D4AF37] font-bold text-xs"
                >
                  Save Note
                </button>
              </div>

              {/* Order History */}
              <div className="space-y-2">
                <span className="text-gray-700 font-bold uppercase text-[10px]">
                  Order History ({customerOrders.length})
                </span>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {customerOrders.length === 0 ? (
                    <p className="text-gray-400">No orders found for this phone number</p>
                  ) : (
                    customerOrders.map((ord) => (
                      <div
                        key={ord.orderId}
                        className="p-3 rounded-xl border border-gray-200 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-mono font-bold text-[#06201A]">
                            {ord.orderId}
                          </span>
                          <p className="text-[11px] text-gray-500">{ord.createdAt}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-[#06201A]">৳{ord.total}</span>
                          <p className="text-[10px] text-gray-500 capitalize">{ord.status}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 text-right">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2 rounded-xl bg-[#06201A] text-[#D4AF37] font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <AdminNotification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: null, type: 'success' })}
      />
    </div>
  );
};
