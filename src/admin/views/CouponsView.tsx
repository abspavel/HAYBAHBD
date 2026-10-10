import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  Tag,
  Percent,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Coupon } from '../../types';
import { adminFetchAllCoupons } from '../../services/supabaseService';
import { saveLocalCoupon, deleteLocalCoupon, playAdminChime } from '../../services/localAdminStore';
import { supabase } from '../../lib/supabase';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { AdminNotification, NotificationType } from '../components/AdminNotification';

export const CouponsView: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string | null; type: NotificationType }>({
    message: null,
    type: 'success',
  });

  const loadCoupons = async () => {
    setLoading(true);
    const data = await adminFetchAllCoupons();
    setCoupons(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!editingCoupon?.code?.trim()) {
      setFormError('দয়া করে কুপন কোড লিখুন (Coupon Code is required)');
      return;
    }
    if (!editingCoupon?.value || Number(editingCoupon.value) <= 0) {
      setFormError('দয়া করে সঠিক ডিসকাউন্ট ভ্যালু লিখুন (Valid discount value is required)');
      return;
    }

    setIsSaving(true);

    const code = editingCoupon.code.trim().toUpperCase();
    const payload = {
      id: editingCoupon.id || undefined,
      code,
      type: editingCoupon.type || 'percent',
      value: Number(editingCoupon.value),
      min_order: Number(editingCoupon.minOrder || 0),
      max_discount: Number(editingCoupon.maxDiscount || 0),
      usage_limit: Number(editingCoupon.usageLimit || 100),
      used_count: Number(editingCoupon.usedCount || 0),
      is_active: editingCoupon.isActive ?? true,
      start_date: editingCoupon.startDate || new Date().toISOString(),
      end_date: editingCoupon.endDate || null,
      updated_at: new Date().toISOString(),
    };

    // 1. Local persist
    saveLocalCoupon({
      id: editingCoupon.id,
      code,
      type: editingCoupon.type || 'percent',
      value: Number(editingCoupon.value),
      minOrder: Number(editingCoupon.minOrder || 0),
      maxDiscount: Number(editingCoupon.maxDiscount || 0),
      usageLimit: Number(editingCoupon.usageLimit || 100),
      usedCount: Number(editingCoupon.usedCount || 0),
      isActive: editingCoupon.isActive ?? true,
      startDate: editingCoupon.startDate || new Date().toISOString(),
      endDate: editingCoupon.endDate || undefined,
    });

    // 2. Remote sync in background
    try {
      await supabase.from('coupons').upsert(payload);
    } catch (err) {
      console.warn('Coupon remote save note:', err);
    }

    setIsModalOpen(false);
    setEditingCoupon(null);
    setIsSaving(false);
    await loadCoupons();
    playAdminChime('success');
    setNotification({
      message: '✓ কুপন কোড সফলভাবে সংরক্ষিত হয়েছে! (Coupon Saved)',
      type: 'success',
    });
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    deleteLocalCoupon(deleteTargetId);
    try {
      await supabase.from('coupons').delete().eq('id', deleteTargetId);
    } catch (e) {
      console.warn(e);
    }
    setDeleteTargetId(null);
    await loadCoupons();
    playAdminChime('delete');
    setNotification({
      message: '✓ কুপন মুছে ফেলা হয়েছে! (Coupon Removed)',
      type: 'delete',
    });
  };

  const toggleActive = async (c: Coupon) => {
    const nextActive = !c.isActive;
    saveLocalCoupon({ id: c.id, code: c.code, isActive: nextActive });
    try {
      await supabase
        .from('coupons')
        .update({ is_active: nextActive, updated_at: new Date().toISOString() })
        .eq('id', c.id);
    } catch (e) {
      console.warn(e);
    }
    await loadCoupons();
    playAdminChime('success');
    setNotification({
      message: `✓ কুপন "${c.code}" - ${nextActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে!`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#06201A] uppercase tracking-tight">
            Coupons & Promo Codes
          </h1>
          <p className="text-xs text-gray-500">
            Create discount vouchers tested via the check_coupon RPC in checkout
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingCoupon({
              code: '',
              type: 'percent',
              value: 10,
              minOrder: 1000,
              maxDiscount: 500,
              usageLimit: 200,
              usedCount: 0,
              isActive: true,
            });
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#06201A] hover:bg-[#0B2B22] text-[#D4AF37] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-[#06201A]/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className={`bg-white rounded-3xl border p-5 flex flex-col justify-between transition-all duration-200 ${
              coupon.isActive
                ? 'border-gray-200/90 shadow-xs hover:border-[#D4AF37]/50 hover:shadow-md'
                : 'border-dashed border-gray-300 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-base font-black tracking-wider text-[#06201A] bg-[#FAF7EC] px-3 py-1 rounded-xl border border-[#D4AF37]/50">
                  {coupon.code}
                </span>

                <button
                  type="button"
                  onClick={() => toggleActive(coupon)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    coupon.isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {coupon.isActive ? 'Active' : 'Disabled'}
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-gray-600">
                <p className="text-sm font-bold text-[#06201A]">
                  {coupon.type === 'percent'
                    ? `${coupon.value}% Off Discount`
                    : `৳${coupon.value} Flat Off`}
                </p>
                <p>Min Order Requirement: ৳{coupon.minOrder.toLocaleString()}</p>
                {coupon.maxDiscount > 0 && (
                  <p>Max Discount Cap: ৳{coupon.maxDiscount.toLocaleString()}</p>
                )}
                <div className="pt-2 flex items-center justify-between text-[11px] text-gray-500">
                  <span>
                    Used: <strong>{coupon.usedCount}</strong> / {coupon.usageLimit}
                  </span>
                  <span className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
                    <span
                      className="h-full bg-[#D4AF37] block"
                      style={{
                        width: `${Math.min(
                          100,
                          (coupon.usedCount / coupon.usageLimit) * 100
                        )}%`,
                      }}
                    />
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setEditingCoupon(coupon);
                  setIsModalOpen(true);
                }}
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#D4AF37] hover:text-[#06201A] text-gray-700"
                title="Edit"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setDeleteTargetId(coupon.id)}
                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && editingCoupon && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-200">
            <h2 className="text-xl font-black text-[#06201A] uppercase tracking-tight mb-4">
              {editingCoupon.id ? 'Edit Coupon' : 'Create New Coupon'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {formError && (
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={editingCoupon.code || ''}
                  onChange={(e) =>
                    setEditingCoupon({
                      ...editingCoupon,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="e.g. HAYBAH10, FESTIVE500"
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37] font-mono uppercase font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Discount Type
                  </label>
                  <select
                    value={editingCoupon.type || 'percent'}
                    onChange={(e) =>
                      setEditingCoupon({ ...editingCoupon, type: e.target.value as any })
                    }
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37] bg-white font-medium"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (৳)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Value *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingCoupon.value ?? ''}
                    onChange={(e) =>
                      setEditingCoupon({ ...editingCoupon, value: Number(e.target.value) })
                    }
                    placeholder="e.g. 10 or 200"
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37] font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Min Order (৳)
                  </label>
                  <input
                    type="number"
                    value={editingCoupon.minOrder ?? 0}
                    onChange={(e) =>
                      setEditingCoupon({ ...editingCoupon, minOrder: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Max Discount (৳)
                  </label>
                  <input
                    type="number"
                    value={editingCoupon.maxDiscount ?? 0}
                    onChange={(e) =>
                      setEditingCoupon({
                        ...editingCoupon,
                        maxDiscount: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Usage Limit (Total uses)
                </label>
                <input
                  type="number"
                  value={editingCoupon.usageLimit ?? 100}
                  onChange={(e) =>
                    setEditingCoupon({
                      ...editingCoupon,
                      usageLimit: Number(e.target.value),
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37]"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={editingCoupon.isActive ?? true}
                    onChange={(e) =>
                      setEditingCoupon({ ...editingCoupon, isActive: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#D4AF37] rounded"
                  />
                  <span>Active & Redeemable at Checkout</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormError(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#06201A] hover:bg-[#0B2B22] text-[#D4AF37] font-black uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-60 transition-transform active:scale-95"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                      <span>Saving Coupon...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-[#D4AF37]" />
                      <span>Save Coupon</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete Coupon"
        message="Are you sure you want to remove this coupon code?"
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
