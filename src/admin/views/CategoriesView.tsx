import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  ArrowUp,
  ArrowDown,
  Grid,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { CategoryItem } from '../../types';
import { adminFetchAllCategories } from '../../services/supabaseService';
import { supabase } from '../../lib/supabase';
import { ImageUploader } from '../components/ImageUploader';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const CategoriesView: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Partial<CategoryItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    const data = await adminFetchAllCategories();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name?.trim()) return;

    const slug = editingCategory.slug?.trim() || generateSlug(editingCategory.name);
    const catId = editingCategory.id || `cat-${slug}`;

    const payload = {
      id: catId,
      name: editingCategory.name.trim(),
      slug: slug,
      image: editingCategory.image || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
      badge: editingCategory.badge || '',
      item_count: editingCategory.itemCount ?? 2,
      sort_order: editingCategory.sortOrder ?? categories.length + 1,
      is_active: editingCategory.isActive ?? true,
      updated_at: new Date().toISOString(),
    };

    try {
      await supabase.from('categories').upsert(payload);
    } catch (err) {
      console.warn('Upsert category error:', err);
    }

    setIsModalOpen(false);
    setEditingCategory(null);
    loadCategories();
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await supabase.from('categories').delete().eq('id', deleteTargetId);
    } catch (err) {
      console.warn('Delete category error:', err);
    }
    setDeleteTargetId(null);
    loadCategories();
  };

  const toggleActive = async (cat: CategoryItem) => {
    try {
      await supabase
        .from('categories')
        .update({ is_active: !cat.isActive, updated_at: new Date().toISOString() })
        .eq('id', cat.id);
    } catch (e) {
      console.warn(e);
    }
    loadCategories();
  };

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const updated = [...categories];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    setCategories(updated);

    try {
      for (let i = 0; i < updated.length; i++) {
        await supabase
          .from('categories')
          .update({ sort_order: i + 1 })
          .eq('id', updated[i].id);
      }
    } catch (e) {
      console.warn('Reorder error:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#06201A] uppercase tracking-tight">
            Categories ({categories.length})
          </h1>
          <p className="text-xs text-gray-500">
            Manage the &quot;SHOP BY CATEGORY&quot; cards and navigation filters
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingCategory({
              name: '',
              slug: '',
              image: '',
              badge: '',
              itemCount: 2,
              sortOrder: categories.length + 1,
              isActive: true,
            });
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#06201A] hover:bg-[#0B2B22] text-[#D4AF37] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-[#06201A]/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Grid (Matching 4-column gold look) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {categories.map((cat, idx) => (
          <div
            key={cat.id}
            className={`bg-white rounded-2xl border p-3 flex flex-col justify-between transition-all duration-200 ${
              cat.isActive
                ? 'border-gray-200 hover:border-[#D4AF37] shadow-xs hover:shadow-md'
                : 'border-dashed border-gray-300 opacity-60'
            }`}
          >
            {/* Portrait Image Frame */}
            <div className="relative aspect-3/4 rounded-xl overflow-hidden bg-neutral-900 border border-gray-200 mb-2">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover object-center"
              />

              {cat.badge && (
                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 bg-[#06201A]/90 text-[#D4AF37] text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-[#D4AF37]/50 whitespace-nowrap">
                  {cat.badge}
                </div>
              )}

              <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                #{cat.sortOrder ?? idx + 1}
              </div>
            </div>

            {/* Title */}
            <div className="text-center min-h-[36px] flex flex-col justify-center">
              <h4 className="font-extrabold text-xs text-[#06201A] line-clamp-2 leading-tight">
                {cat.name}
              </h4>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">{cat.slug}</p>
            </div>

            {/* Controls */}
            <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveOrder(idx, 'up')}
                  className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-30"
                  title="Move Left/Up"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  disabled={idx === categories.length - 1}
                  onClick={() => moveOrder(idx, 'down')}
                  className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-30"
                  title="Move Right/Down"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory(cat);
                    setIsModalOpen(true);
                  }}
                  className="p-1 rounded bg-gray-100 hover:bg-[#D4AF37] hover:text-[#06201A] text-gray-700"
                  title="Edit"
                >
                  <Edit className="w-3 h-3" />
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteTargetId(cat.id)}
                  className="p-1 rounded bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-black text-[#06201A] uppercase tracking-tight mb-4">
              {editingCategory.id ? 'Edit Category' : 'Create New Category'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={(e) => {
                    const name = e.target.value;
                    setEditingCategory({
                      ...editingCategory,
                      name,
                      slug: editingCategory.slug ? editingCategory.slug : generateSlug(name),
                    });
                  }}
                  placeholder="e.g. Baggy Cargo Pant"
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Slug (URL identifier)
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.slug || ''}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, slug: e.target.value })
                  }
                  placeholder="e.g. baggy-cargo-pant"
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37] font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Label Badge Text (Optional)
                </label>
                <input
                  type="text"
                  value={editingCategory.badge || ''}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, badge: e.target.value })
                  }
                  placeholder="e.g. NEW / HOT / EXCLUSIVE"
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37]"
                />
              </div>

              {/* Gallery Image Uploader */}
              <ImageUploader
                bucket="categories"
                label="Category Portrait Photo (Gallery Upload)"
                multiple={false}
                images={editingCategory.image ? [editingCategory.image] : []}
                onChange={(imgs) =>
                  setEditingCategory({ ...editingCategory, image: imgs[0] || '' })
                }
              />

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={editingCategory.isActive ?? true}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, isActive: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#D4AF37] rounded"
                  />
                  <span>Active & Visible in Shop By Category</span>
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete Category"
        message="Are you sure you want to remove this category? Products assigned to it may need reassignment."
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
