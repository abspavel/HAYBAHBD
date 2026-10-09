import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { HeroBanner } from '../../types';
import { adminFetchAllBanners } from '../../services/supabaseService';
import { supabase } from '../../lib/supabase';
import { ImageUploader } from '../components/ImageUploader';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const BannersView: React.FC = () => {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBanner, setEditingBanner] = useState<Partial<HeroBanner> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const loadBanners = async () => {
    setLoading(true);
    const data = await adminFetchAllBanners();
    setBanners(data);
    setLoading(false);
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner?.title?.trim()) return;

    const bannerId = editingBanner.id || `banner-${Date.now()}`;
    const payload = {
      id: bannerId,
      title: editingBanner.title.trim(),
      subtitle: editingBanner.subtitle || '',
      badge: editingBanner.badge || 'New Drop',
      tagline: editingBanner.tagline || '',
      action_text: editingBanner.actionText || 'EXPLORE COLLECTION',
      action_link: editingBanner.actionLink || 'shop',
      category_slug: editingBanner.categorySlug || '',
      image: editingBanner.image || '',
      bg_color: editingBanner.bgColor || 'from-[#06201A] via-[#0B2B22] to-[#041511]',
      accent_color: editingBanner.accentColor || '#D4AF37',
      sort_order: editingBanner.sortOrder ?? banners.length + 1,
      is_active: editingBanner.isActive ?? true,
      updated_at: new Date().toISOString(),
    };

    try {
      await supabase.from('hero_banners').upsert(payload);
    } catch (err) {
      console.warn('Upsert banner error:', err);
    }

    setIsModalOpen(false);
    setEditingBanner(null);
    loadBanners();
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await supabase.from('hero_banners').delete().eq('id', deleteTargetId);
    } catch (err) {
      console.warn('Delete banner error:', err);
    }
    setDeleteTargetId(null);
    loadBanners();
  };

  const toggleActive = async (banner: HeroBanner) => {
    try {
      await supabase
        .from('hero_banners')
        .update({ is_active: !banner.isActive, updated_at: new Date().toISOString() })
        .eq('id', banner.id);
    } catch (e) {
      console.warn(e);
    }
    loadBanners();
  };

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const updated = [...banners];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    setBanners(updated);

    // Update in Supabase
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
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#06201A] uppercase tracking-tight">
            Hero Banners
          </h1>
          <p className="text-xs text-gray-500">
            Control the top slider announcements on the storefront homepage
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingBanner({
              title: '',
              subtitle: '',
              badge: 'Featured Drop',
              tagline: '',
              actionText: 'EXPLORE COLLECTION',
              actionLink: 'shop',
              categorySlug: '',
              image: '',
              bgColor: 'from-[#06201A] via-[#0B2B22] to-[#041511]',
              accentColor: '#D4AF37',
              sortOrder: banners.length + 1,
              isActive: true,
            });
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#06201A] hover:bg-[#0B2B22] text-[#D4AF37] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-[#06201A]/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Add New Banner</span>
        </button>
      </div>

      {/* Banner Cards List */}
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
            {/* Live Banner Preview Box */}
            <div
              className={`p-5 relative min-h-[140px] flex flex-col justify-center text-center bg-gradient-to-r ${b.bgColor} text-white`}
            >
              {b.image && (
                <img
                  src={b.image}
                  alt={b.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
                />
              )}
              <div className="relative z-10 space-y-1">
                {b.badge && (
                  <span className="inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37]">
                    {b.badge}
                  </span>
                )}
                <h3 className="text-sm font-black uppercase text-white truncate">
                  {b.title}
                </h3>
                <p className="text-[10px] font-bold text-[#D4AF37] uppercase truncate">
                  {b.subtitle}
                </p>
                <div className="pt-1">
                  <span className="inline-block text-[9px] font-bold bg-[#D4AF37] text-[#06201A] px-2 py-0.5 rounded-full uppercase">
                    {b.actionText} →
                  </span>
                </div>
              </div>
            </div>

            {/* Banner Details & Action Controls */}
            <div className="p-4 bg-white flex items-center justify-between gap-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveOrder(idx, 'up')}
                  className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-30 cursor-pointer"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === banners.length - 1}
                  onClick={() => moveOrder(idx, 'down')}
                  className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-30 cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-mono font-bold text-gray-500">
                  #{b.sortOrder}
                </span>
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
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#D4AF37] hover:text-[#06201A] text-gray-700 transition-colors cursor-pointer"
                  title="Edit"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteTargetId(b.id)}
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 transition-colors cursor-pointer"
                  title="Delete"
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
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-black text-[#06201A] uppercase tracking-tight mb-4">
              {editingBanner.id ? 'Edit Hero Banner' : 'Create New Hero Banner'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Main Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingBanner.title || ''}
                  onChange={(e) =>
                    setEditingBanner({ ...editingBanner, title: e.target.value })
                  }
                  placeholder="e.g. URBAN EVOLUTION 2026"
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Top Badge
                  </label>
                  <input
                    type="text"
                    value={editingBanner.badge || ''}
                    onChange={(e) =>
                      setEditingBanner({ ...editingBanner, badge: e.target.value })
                    }
                    placeholder="e.g. Winter Capsule"
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={editingBanner.subtitle || ''}
                    onChange={(e) =>
                      setEditingBanner({ ...editingBanner, subtitle: e.target.value })
                    }
                    placeholder="e.g. 420 GSM HOODIES"
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Tagline (Small text)
                </label>
                <input
                  type="text"
                  value={editingBanner.tagline || ''}
                  onChange={(e) =>
                    setEditingBanner({ ...editingBanner, tagline: e.target.value })
                  }
                  placeholder="e.g. Engineered for those who lead with energy and edge"
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={editingBanner.actionText || 'EXPLORE COLLECTION'}
                    onChange={(e) =>
                      setEditingBanner({ ...editingBanner, actionText: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Category Filter Slug
                  </label>
                  <input
                    type="text"
                    value={editingBanner.categorySlug || ''}
                    onChange={(e) =>
                      setEditingBanner({ ...editingBanner, categorySlug: e.target.value })
                    }
                    placeholder="e.g. premium-hoodie"
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Gallery Image Uploader */}
              <ImageUploader
                bucket="banners"
                label="Banner Background / Graphic (Gallery Upload)"
                multiple={false}
                images={editingBanner.image ? [editingBanner.image] : []}
                onChange={(imgs) =>
                  setEditingBanner({ ...editingBanner, image: imgs[0] || '' })
                }
              />

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
                  <span>Active on Storefront Slider</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#06201A] hover:bg-[#0B2B22] text-[#D4AF37] font-black uppercase tracking-wider"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete Hero Banner"
        message="Are you sure you want to remove this banner? It will no longer display on the homepage slider."
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
