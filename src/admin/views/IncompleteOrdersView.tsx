import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  Phone,
  MessageSquare,
  CheckCircle,
  XCircle,
  Trash2,
  Search,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  Clock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { IncompleteOrder, IncompleteOrderStatus } from '../../types';
import { adminFetchAllIncompleteOrders, adminDeleteIncompleteOrder } from '../../services/supabaseService';
import {
  updateLocalIncompleteOrder,
  saveLocalOrder,
  deleteLocalIncompleteOrder,
  playAdminChime,
} from '../../services/localAdminStore';
import { supabase } from '../../lib/supabase';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { AdminNotification, NotificationType } from '../components/AdminNotification';

interface IncompleteOrdersViewProps {
  onOrderCreated?: (orderId: string) => void;
}

export const IncompleteOrdersView: React.FC<IncompleteOrdersViewProps> = ({
  onOrderCreated,
}) => {
  const [incompleteOrders, setIncompleteOrders] = useState<IncompleteOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | IncompleteOrderStatus>('ALL');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string | null; type: NotificationType }>({
    message: null,
    type: 'success',
  });

  const loadData = async () => {
    setLoading(true);
    const data = await adminFetchAllIncompleteOrders();
    setIncompleteOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogCall = async (inc: IncompleteOrder) => {
    try {
      await supabase.rpc('log_call', {
        p_incomplete_id: inc.id,
        p_note: `Called on ${new Date().toLocaleDateString('en-GB')}`,
      });
    } catch {
      // Fallback direct update
      await supabase
        .from('incomplete_orders')
        .update({
          call_count: inc.callCount + 1,
          last_call_at: new Date().toISOString(),
          status: inc.status === 'new' ? 'called' : inc.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', inc.id);
    }
    loadData();
  };

  const handleStatusChange = async (incId: string, newStatus: IncompleteOrderStatus) => {
    updateLocalIncompleteOrder(incId, { status: newStatus });
    try {
      await supabase
        .from('incomplete_orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', incId);
    } catch (e) {
      console.warn(e);
    }
    await loadData();
  };

  const handleConvert = async (inc: IncompleteOrder) => {
    setConvertingId(inc.id);
    const genId = `HYB-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create converted order in local store immediately
    saveLocalOrder({
      orderId: genId,
      customerName: inc.customerName || 'Customer',
      phone: inc.phone,
      address: inc.address || 'Phone Order Confirmation',
      district: inc.district || 'Dhaka',
      thana: inc.thana || 'Dhaka',
      city: inc.city || 'Inside Dhaka',
      paymentMethod: 'Cash on Delivery',
      items: inc.cartItems || [],
      subtotal: Math.max(0, inc.totalAmount - 80),
      deliveryFee: 80,
      discount: 0,
      total: inc.totalAmount,
      status: 'confirmed',
      notes: 'Converted from incomplete drop lead',
      createdAt: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    });
    updateLocalIncompleteOrder(inc.id, { status: 'converted' });

    try {
      const { data, error } = await supabase.rpc('convert_incomplete', {
        p_incomplete_id: inc.id,
      });

      if (error) {
        // Fallback manual convert on remote
        await supabase.from('orders').insert({
          id: genId,
          order_number: genId,
          customer_name: inc.customerName || 'Customer',
          phone: inc.phone,
          address: inc.address || 'Phone Order Confirmation',
          district: inc.district || 'Dhaka',
          thana: inc.thana || 'Dhaka',
          city: inc.city || 'Inside Dhaka',
          subtotal: Math.max(0, inc.totalAmount - 80),
          delivery_fee: 80,
          total: inc.totalAmount,
          status: 'confirmed',
          notes: 'Converted from incomplete drop call',
        });

        await supabase
          .from('incomplete_orders')
          .update({ status: 'converted', updated_at: new Date().toISOString() })
          .eq('id', inc.id);

        if (onOrderCreated) onOrderCreated(genId);
      } else if (data?.order_id && onOrderCreated) {
        onOrderCreated(data.order_id);
      } else if (onOrderCreated) {
        onOrderCreated(genId);
      }
    } catch (e) {
      console.warn('Convert error:', e);
      if (onOrderCreated) onOrderCreated(genId);
    } finally {
      setConvertingId(null);
      await loadData();
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await adminDeleteIncompleteOrder(deleteTargetId);
      playAdminChime('delete');
      setNotification({
        message: '✓ ইনকমপ্লিট অর্ডার লিডটি সফলভাবে ডিলিট করা হয়েছে!',
        type: 'delete',
      });
    } catch (e) {
      console.warn(e);
    }
    setDeleteTargetId(null);
    loadData();
  };

  const filtered = incompleteOrders.filter((inc) => {
    const matchesSearch =
      inc.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.phone.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || inc.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statuses: IncompleteOrderStatus[] = [
    'new',
    'called',
    'no_answer',
    'interested',
    'converted',
    'cancelled',
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#06201A] uppercase tracking-tight flex items-center gap-2">
            <span>Incomplete Orders & Cart Recovery</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
              {incompleteOrders.filter((i) => i.status === 'new').length} New Drops
            </span>
          </h1>
          <p className="text-xs text-gray-500">
            Customers who entered their phone number on checkout but did not complete the order
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="p-2.5 rounded-xl border border-gray-200 hover:border-[#D4AF37] bg-white text-gray-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Leads</span>
        </button>
      </div>

      {/* Filter and Search Row */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name or mobile number..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#D4AF37]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="p-2 text-xs rounded-xl border border-gray-300 focus:border-[#D4AF37] bg-white font-medium"
        >
          <option value="ALL">All Follow-up Statuses</option>
          <option value="new">New (Needs Call)</option>
          <option value="called">Called</option>
          <option value="no_answer">No Answer</option>
          <option value="interested">Interested</option>
          <option value="converted">Converted to Order ✓</option>
          <option value="cancelled">Lost / Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-black tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5 pl-5">Lead & Phone</th>
                <th className="p-3.5">Cart Preview</th>
                <th className="p-3.5">Estimated Total</th>
                <th className="p-3.5">Call Attempts</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-5 text-right">Quick Recovery Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-400">
                    No incomplete order drops found.
                  </td>
                </tr>
              ) : (
                filtered.map((inc) => {
                  const cleanPhone = inc.phone.replace(/[^0-9]/g, '');
                  const bdBareNumber = cleanPhone.slice(-10);
                  const whatsappMsg = `Hello ${inc.customerName || 'Customer'}, you left some premium apparel items in your HAYBAH bag! Would you like us to confirm and dispatch your order today?`;
                  const whatsappUrl = `https://wa.me/880${bdBareNumber}?text=${encodeURIComponent(
                    whatsappMsg
                  )}`;

                  return (
                    <tr key={inc.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3.5 pl-5">
                        <p className="font-extrabold text-[#06201A]">
                          {inc.customerName || 'Guest Shopper'}
                        </p>
                        <p className="text-xs text-gray-600 font-mono font-bold mt-0.5">
                          {inc.phone}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {new Date(inc.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                          {inc.cartItems.slice(0, 3).map((item: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg text-[11px]"
                            >
                              <span className="font-medium text-[#06201A] truncate max-w-[120px]">
                                {item.product?.name || item.name || 'Product'}
                              </span>
                              <span className="font-bold text-gray-400">
                                ×{item.quantity || 1}
                              </span>
                            </div>
                          ))}
                          {inc.cartItems.length > 3 && (
                            <span className="text-[10px] font-bold text-gray-400">
                              +{inc.cartItems.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 font-black text-sm text-[#06201A]">
                        ৳{inc.totalAmount.toLocaleString()}
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-gray-800">
                          {inc.callCount} calls
                        </span>
                        {inc.lastCallAt && (
                          <p className="text-[10px] text-gray-400">
                            Last: {new Date(inc.lastCallAt).toLocaleDateString('en-GB')}
                          </p>
                        )}
                      </td>

                      <td className="p-3.5">
                        <select
                          value={inc.status}
                          onChange={(e) =>
                            handleStatusChange(inc.id, e.target.value as any)
                          }
                          className="p-1 rounded-lg border border-gray-300 text-xs font-bold bg-white capitalize"
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s}>
                              {s.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="p-3.5 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Call & Log Button */}
                          <a
                            href={`tel:${inc.phone}`}
                            onClick={() => handleLogCall(inc)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1"
                            title="Call customer and log call timestamp"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>Call ({inc.callCount})</span>
                          </a>

                          {/* WhatsApp */}
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E]"
                            title="WhatsApp Recovery Message"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>

                          {/* Convert to Order */}
                          {inc.status !== 'converted' && (
                            <button
                              type="button"
                              disabled={convertingId === inc.id}
                              onClick={() => handleConvert(inc)}
                              className="px-2.5 py-1 rounded-lg bg-[#06201A] hover:bg-[#0B2B22] text-[#D4AF37] font-black text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-xs"
                              title="Convert to Confirmed Order"
                            >
                              <span>Convert</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setDeleteTargetId(inc.id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete Incomplete Order"
        message="Are you sure you want to delete this checkout lead?"
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
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
