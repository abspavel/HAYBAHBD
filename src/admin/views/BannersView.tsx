import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  ExternalLink,
  CheckCircle,
  Eye,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { HeroBanner, CategoryItem } from '../../types';
import { adminFetchAllBanners, fetchLiveCategories } from '../../services/supabaseService';
import { saveLocalBanner, deleteLocalBanner, playAdminChime } from '../../services/localAdminStore';
import { supabase } from '../../lib/supabase';
import { ImageUploader } from '../components/ImageUploader';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { AdminNotification, NotificationType } from '../components/AdminNotification';

export const BannersView: React.FC = () => {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBanner, setEditingBanner] = useState<Partial<HeroBanner> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string | null; type: NotificationType }>({
    message: null,
    type: 'success',
  });

  const loadData = async () => {
    setLoading(true);
    const [bannerList, catList] = await Promise.all([
      adminFetchAllBanners(),
      fetchLiveCategories(),
    ]);
    setBanners(bannerList);
    setCategories(catList);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!editingBanner?.image || editingBanner.image.trim() === '') {
      setErrorMsg('অনুগ্রহ করে গ্যালারি থেকে ব্যানারের ছবি সিলেক্ট বা আপলোড করুন।');
      return;
    }

    setIsSaving(true);

    const bannerId = editingBanner.id || `banner-${Date.now()}`;
    const autoTitle =
      editingBanner.title?.trim() ||
      `Banner #${editingBanner.sortOrder ?? banners.length + 1}`;

    const payload = {
      id: bannerId,
      title: autoTitle,
      subtitle: '',
      badge: '',
      tagline: '',
      action_text: '',
      action_link: editingBanner.actionLink || 'category',
      category_slug: editingBanner.categorySlug || '',
      image: editingBanner.image.trim(),
      bg_color: 'from-[#06201A] via-[#0B2B22] to-[#041511]',
      accent_color: '#D4AF37',
      sort_order: editingBanner.sortOrder ?? banners.length + 1,
      is_active: editingBanner.isActive ?? true,
      updated_at: new Date().toISOString(),
    };

    // 1. Save locally
    saveLocalBanner({
      id: bannerId,
      title: autoTitle,
      subtitle: '',
      badge: '',
      tagline: '',
      actionText: '',
      actionLink: editingBanner.actionLink || 'category',
      categorySlug: editingBanner.categorySlug || '',
      image: editingBanner.image.trim(),
      bgColor: 'from-[#06201A] via-[#0B2B22] to-[#041511]',
      accentColor: '#D4AF37',
      sortOrder: editingBanner.sortOrder ?? banners.length + 1,
      isActive: editingBanner.isActive ?? true,
    });

    // 2. Sync to Supabase in background
    try {
      await supabase.from('hero_banners').upsert(payload);
    } catch (err: any) {
      console.warn('Upsert banner remote note:', err);
    }

    setIsModalOpen(false);
    setEditingBanner(null);
    setIsSaving(false);
    await loadData();
    playAdminChime('success');
    setNotification({
      message: '✓ ব্যানার সফলভাবে সংরক্ষিত হয়েছে! (Banner Saved)',
      type: 'success',
    });
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    deleteLocalBanner(deleteTargetId);
    try {
      await supabase.from('hero_banners').delete().eq('id', deleteTargetId);
    } catch (err) {
      console.warn('Delete banner error:', err);
    }
    setDeleteTargetId(null);
    await loadData();
    playAdminChime('delete');
    setNotification({
      message: '✓ ব্যানার মুছে ফেলা হয়েছে! (Banner Removed)',
      type: 'delete',
    });
  };

  const toggleActive = async (banner: HeroBanner) => {
    const nextActive = !banner.isActive;
    saveLocalBanner({ id: banner.id, isActive: nextActive });
    try {
      await supabase
        .from('hero_banners')
        .update({ is_active: nextActive, updated_at: new Date().toISOString() })
        .eq('id', banner.id);
    } catch (e) {
      console.warn(e);
    }
    await loadData();
    playAdminChime('success');
    setNotification({
      message: `✓ ব্যানার ${nextActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে!`,
      type: 'success',
    });
  };

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const updated = [...banners];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    updated.forEach((b, i) => {
      saveLocalBanner({ id: b.id, sortOrder: i + 1 });
    });

    setBanners(updated);
    playAdminChime('success');
    setNotification({
      message: '✓ ব্যানারের ক্রম আপডেট হয়েছে!',
      type: 'info',
    });

    try {
      for (let i = 0; i < updated.length; i++) {
        await supabase
          .from('hero_banners')
          .update({ sort_order: i + 1 })
          .eq('id', updated[i].id);
      }
    } catch (e) {
      console.warn('Error reordering banners:', e);
    }
    await loadData();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#06201A] uppercase tracking-tight flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-[#D4AF37]" />
            <span>Hero Image Banners</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            হোমপেজের মূল স্লাইডারে প্রদর্শিত ব্যানার ছবি। এতে কোনো টেক্সট বা বাটন থাকবে না—সরাসরি গ্যালারি থেকে ছবি আপলোড করুন।
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingBanner({
              title: '',
              categorySlug: '',
              actionLink: 'category',
              image: '',
              sortOrder: banners.length + 1,
              isActive: true,
            });
            setErrorMsg(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#06201A] hover:bg-[#0B2B22] text-[#D4AF37] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-[#06201A]/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Upload New Banner</span>
        </button>
      </div>

      {/* Guidelines Card */}
      <div className="bg-[#06201A] text-white p-4 rounded-2xl border border-[#D4AF37]/30 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-[#E8CE7A]">
            ব্যানার ছবির নির্দেশনা (Pure Image Banner):
          </p>
          <p className="text-gray-300">
            ব্যানারের ওপর কোনো টেক্সট বা বাটন দেখানো হবে না। আপনার ডিজাইনারের তৈরি ব্যানার ছবি (প্রস্তাবিত মাপ: 1600x600 বা 1920x700 পিক্সেল) সরাসরি গ্যালারি থেকে আপলোড করুন। ক্রেতা ব্যানারে ক্লিক করলে নির্দিষ্ট ক্যাটাগরি বা শপ পেজে চলে যাবে।
          </p>
        </div>
      </div>

      {/* Banner Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {banners.map((b, idx) => (
          <div
            key={b.id}
            className={`bg-white rounded-3xl border overflow-hidden flex flex-col justify-between transition-all duration-200 ${
              b.isActive
                ? 'border-gray-200/90 shadow-xs hover:border-[#D4AF37]/50 hover:shadow-md'
                : 'border-dashed border-gray-300 opacity-60'
            }`}
          >
            {/* Pure Banner Image Viewport */}
            <div className="relative aspect-[16/7] bg-[#041511] overflow-hidden flex items-center justify-center">
              {b.image ? (
                <img
                  src={b.image}
                  alt={b.title || 'Banner'}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 gap-1 p-4">
                  <ImageIcon className="w-8 h-8 opacity-40" />
                  <span className="text-[11px]">কোনো ছবি নেই</span>
                </div>
              )}

              {/* Order Badge in corner */}
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-[#D4AF37] font-bold text-[10px] px-2 py-0.5 rounded-full border border-white/10">
                Slide #{idx + 1}
              </div>

              {/* Status Badge in corner */}
              <div
                className={`absolute top-2 right-2 font-bold text-[10px] px-2 py-0.5 rounded-full backdrop-blur-xs ${
                  b.isActive
                    ? 'bg-emerald-500/80 text-white'
                    : 'bg-rose-500/80 text-white'
                }`}
              >
                {b.isActive ? 'Active' : 'Hidden'}
              </div>
            </div>

            {/* Banner Information */}
            <div className="p-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
              <div className="truncate pr-2">
                <span className="font-bold text-[#06201A] block truncate">
                  {b.title || `Banner Slide #${idx + 1}`}
                </span>
                <span className="text-[11px] text-gray-500">
                  {b.categorySlug
                    ? `Destination: ${b.categorySlug}`
                    : 'Destination: Shop All'}
                </span>
              </div>
            </div>

            {/* Banner Action Controls */}
            <div className="p-3.5 bg-white flex items-center justify-between gap-2 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveOrder(idx, 'up')}
                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-30 cursor-pointer"
                  title="Move Left/Up in Slider"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === banners.length - 1}
                  onClick={() => moveOrder(idx, 'down')}
                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-30 cursor-pointer"
                  title="Move Right/Down in Slider"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleActive(b)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    b.isActive
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {b.isActive ? 'Active' : 'Disabled'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingBanner(b);
                    setErrorMsg(null);
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#D4AF37] hover:text-[#06201A] text-gray-700 transition-colors cursor-pointer"
                  title="Change Image or Settings"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteTargetId(b.id)}
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 transition-colors cursor-pointer"
                  title="Delete Banner"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Banner Modal */}
      {isModalOpen && editingBanner && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-200 max-h-[92vh] overflow-y-auto">
            <h2 className="text-xl font-black text-[#06201A] uppercase tracking-tight mb-2 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#D4AF37]" />
              <span>
                {editingBanner.id ? 'Edit Banner Image' : 'Upload Banner Image'}
              </span>
            </h2>
            <p className="text-xs text-gray-500 mb-5">
              গ্যালারি বা ফাইল থেকে পরিষ্কার ব্যানার ছবি যুক্ত করুন।
            </p>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* PRIMARY: Gallery Image Uploader */}
              <div className="bg-[#06201A]/5 p-4 rounded-2xl border border-[#D4AF37]/30">
                <ImageUploader
                  bucket="banners"
                  label="ব্যানার ছবি (সরাসরি গ্যালারি থেকে আপলোড করুন) *"
                  multiple={false}
                  images={editingBanner.image ? [editingBanner.image] : []}
                  onChange={(imgs) =>
                    setEditingBanner({ ...editingBanner, image: imgs[0] || '' })
                  }
                />
              </div>

              {/* Optional: Banner Title (For admin list only) */}
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  ব্যানারের নাম (শুধু এডমিনের বোঝার জন্য - অপশনাল)
                </label>
                <input
                  type="text"
                  value={editingBanner.title || ''}
                  onChange={(e) =>
                    setEditingBanner({ ...editingBanner, title: e.target.value })
                  }
                  placeholder="যেমন: ঈদ ড্রপ বা উইন্টার অফার"
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              {/* Destination Category on Click */}
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  ব্যানারে ক্লিক করলে কোথায় যাবে?
                </label>
                <select
                  value={editingBanner.categorySlug || ''}
                  onChange={(e) =>
                    setEditingBanner({
                      ...editingBanner,
                      categorySlug: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37] bg-white font-medium"
                >
                  <option value="">সকল প্রোডাক্ট পেজ (All Products / Shop)</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name} ({cat.slug})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  ক্রেতা হোমপেজে ব্যানারের যেকোনো জায়গায় ক্লিক করলে সরাসরি এই ক্যাটাগরিতে নিয়ে যাবে।
                </p>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={editingBanner.isActive ?? true}
                    onChange={(e) =>
                      setEditingBanner({ ...editingBanner, isActive: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#D4AF37] rounded"
                  />
                  <span>স্লাইডারে সক্রিয় রাখুন (Active on Storefront)</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#06201A] hover:bg-[#0B2B22] text-[#D4AF37] font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-60 transition-transform active:scale-95"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                      <span>সেভ হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-[#D4AF37]" />
                      <span>ব্যানার সেভ করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="ব্যানার মুছে ফেলতে চান?"
        message="আপনি কি নিশ্চিত যে এই ব্যানারটি হোমপেজ স্লাইডার থেকে মুছে ফেলতে চান?"
        confirmLabel="মুছে ফেলুন"
        cancelLabel="না"
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
