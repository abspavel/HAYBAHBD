import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Copy,
  Eye,
  CheckCircle,
  XCircle,
  Sparkles,
  Flame,
  Zap,
  Tag,
  Package,
} from 'lucide-react';
import { Product, CategoryItem } from '../../types';
import { adminFetchAllProducts, adminFetchAllCategories } from '../../services/supabaseService';
import { supabase } from '../../lib/supabase';
import { ImageUploader } from '../components/ImageUploader';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const ProductsView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Selected for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [prods, cats] = await Promise.all([
      adminFetchAllProducts(),
      adminFetchAllCategories(),
    ]);
    setProducts(prods);
    setCategories(cats);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat =
      selectedCategoryFilter === 'ALL' ||
      p.category.toLowerCase() === selectedCategoryFilter.toLowerCase() ||
      p.categorySlug === selectedCategoryFilter;

    const matchesStock =
      stockFilter === 'ALL' ||
      (stockFilter === 'IN_STOCK' && p.inStock && (p.stockQuantity ?? 50) > 0) ||
      (stockFilter === 'OUT_OF_STOCK' && (!p.inStock || (p.stockQuantity ?? 50) <= 0));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && (p.isActive ?? true)) ||
      (statusFilter === 'INACTIVE' && p.isActive === false);

    return matchesSearch && matchesCat && matchesStock && matchesStatus;
  });

  const handlePriceChange = (priceVal: number, originalVal?: number) => {
    let discount = 0;
    if (originalVal && originalVal > priceVal) {
      discount = Math.round(((originalVal - priceVal) / originalVal) * 100);
    }
    setEditingProduct((prev) =>
      prev ? { ...prev, price: priceVal, originalPrice: originalVal, discountPercent: discount } : null
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name?.trim() || !editingProduct?.category) return;

    const slug = editingProduct.slug?.trim() || generateSlug(editingProduct.name);
    const prodId = editingProduct.id || `prod-${slug}-${Date.now().toString().slice(-4)}`;
    const matchedCategory = categories.find(
      (c) => c.name.toLowerCase() === editingProduct.category?.toLowerCase()
    );

    const galleryImages =
      editingProduct.gallery && editingProduct.gallery.length > 0
        ? editingProduct.gallery
        : editingProduct.image
        ? [editingProduct.image]
        : ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'];

    const mainImage = galleryImages[0];
    const stockQty = Number(editingProduct.stockQuantity ?? 50);

    const payload = {
      id: prodId,
      name: editingProduct.name.trim(),
      slug: slug,
      category: editingProduct.category,
      category_slug: matchedCategory?.slug || editingProduct.categorySlug || slug,
      price: Number(editingProduct.price || 0),
      original_price: editingProduct.originalPrice ? Number(editingProduct.originalPrice) : null,
      discount_percent: editingProduct.discountPercent || 0,
      is_hot: Boolean(editingProduct.isHot),
      is_flash_sale: Boolean(editingProduct.isFlashSale),
      is_featured: Boolean(editingProduct.isFeatured),
      is_new_arrival: Boolean(editingProduct.isNewArrival),
      is_active: editingProduct.isActive ?? true,
      rating: Number(editingProduct.rating || 5.0),
      reviews_count: Number(editingProduct.reviewsCount || 12),
      image: mainImage,
      gallery: galleryImages,
      description: editingProduct.description || '',
      short_description: editingProduct.shortDescription || '',
      details: editingProduct.details || '',
      sizes: editingProduct.sizes && editingProduct.sizes.length ? editingProduct.sizes : ['M', 'L', 'XL', 'XXL'],
      colors: editingProduct.colors || [],
      fabric: editingProduct.fabric || '',
      gsm: editingProduct.gsm ? Number(editingProduct.gsm) : null,
      fit: editingProduct.fit || '',
      sku: editingProduct.sku || `HYB-${prodId}`,
      in_stock: stockQty > 0 && (editingProduct.inStock ?? true),
      stock_quantity: stockQty,
      tag: editingProduct.tag || '',
      updated_at: new Date().toISOString(),
    };

    try {
      await supabase.from('products').upsert(payload);
    } catch (err) {
      console.warn('Product save error:', err);
    }

    setIsModalOpen(false);
    setEditingProduct(null);
    loadData();
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await supabase.from('products').delete().eq('id', deleteTargetId);
    } catch (e) {
      console.warn(e);
    }
    setDeleteTargetId(null);
    loadData();
  };

  const handleDuplicate = (p: Product) => {
    setEditingProduct({
      ...p,
      id: undefined,
      name: `${p.name} (Copy)`,
      slug: `${p.slug || generateSlug(p.name)}-copy`,
      sku: `${p.sku}-COPY`,
    });
    setIsModalOpen(true);
  };

  // Bulk Actions
  const handleBulkActivate = async (active: boolean) => {
    if (selectedIds.length === 0) return;
    try {
      await supabase
        .from('products')
        .update({ is_active: active, updated_at: new Date().toISOString() })
        .in('id', selectedIds);
      setSelectedIds([]);
      loadData();
    } catch (e) {
      console.warn(e);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) return;
    try {
      await supabase.from('products').delete().in('id', selectedIds);
      setSelectedIds([]);
      loadData();
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#06201A] uppercase tracking-tight">
            Products ({products.length})
          </h1>
          <p className="text-xs text-gray-500">
            Manage your complete inventory, pricing, tags, and gallery images
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingProduct({
              name: '',
              category: categories[0]?.name || 'Premium Hoodie',
              categorySlug: categories[0]?.slug || 'premium-hoodie',
              price: 1550,
              originalPrice: 1950,
              discountPercent: 20,
              inStock: true,
              stockQuantity: 50,
              isActive: true,
              sizes: ['M', 'L', 'XL', 'XXL'],
              colors: ['Black', 'Dark Green'],
              isFeatured: true,
              isNewArrival: true,
              isHot: false,
              isFlashSale: false,
              description: 'Heavyweight streetwear piece crafted for superior warmth and luxury draping.',
              sku: `HYB-${Math.floor(1000 + Math.random() * 9000)}`,
              image: '',
              gallery: [],
            });
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#06201A] hover:bg-[#0B2B22] text-[#D4AF37] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-[#06201A]/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Row */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by title, SKU..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 focus:border-[#D4AF37]"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="p-2 rounded-xl border border-gray-300 focus:border-[#D4AF37] bg-white font-medium"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="p-2 rounded-xl border border-gray-300 focus:border-[#D4AF37] bg-white font-medium"
          >
            <option value="ALL">All Stock Status</option>
            <option value="IN_STOCK">In Stock (Available)</option>
            <option value="OUT_OF_STOCK">Out of Stock (0 units)</option>
          </select>

          {/* Active Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="p-2 rounded-xl border border-gray-300 focus:border-[#D4AF37] bg-white font-medium"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active in Store</option>
            <option value="INACTIVE">Hidden / Disabled</option>
          </select>
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7EC] border border-[#D4AF37]/40 text-xs">
            <span className="font-bold text-[#06201A]">
              {selectedIds.length} products selected
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleBulkActivate(true)}
                className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-bold text-[11px]"
              >
                Set Active
              </button>
              <button
                type="button"
                onClick={() => handleBulkActivate(false)}
                className="px-2.5 py-1 rounded-lg bg-gray-700 text-white font-bold text-[11px]"
              >
                Deactivate
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px]"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-black tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5 pl-5 w-8">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length > 0 &&
                      selectedIds.length === filteredProducts.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(filteredProducts.map((p) => p.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    className="w-4 h-4 accent-[#D4AF37] rounded"
                  />
                </th>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Price</th>
                <th className="p-3.5">Stock</th>
                <th className="p-3.5">Badges</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-3.5 pl-5">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(p.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds([...selectedIds, p.id]);
                        } else {
                          setSelectedIds(selectedIds.filter((id) => id !== p.id));
                        }
                      }}
                      className="w-4 h-4 accent-[#D4AF37] rounded"
                    />
                  </td>

                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-11 h-13 object-cover rounded-xl bg-neutral-900 border border-gray-200 shrink-0"
                      />
                      <div>
                        <p className="font-extrabold text-[#06201A] line-clamp-1">{p.name}</p>
                        <p className="text-[11px] text-gray-400 font-mono">SKU: {p.sku || p.id}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5 font-medium text-gray-700">
                    {p.category}
                  </td>

                  <td className="p-3.5">
                    <span className="font-black text-sm text-[#06201A]">৳{p.price}</span>
                    {p.originalPrice && (
                      <span className="block text-[11px] text-gray-400 line-through">
                        ৳{p.originalPrice}
                      </span>
                    )}
                  </td>

                  <td className="p-3.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                        p.inStock && (p.stockQuantity ?? 50) > 0
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-rose-50 text-rose-800'
                      }`}
                    >
                      {p.inStock && (p.stockQuantity ?? 50) > 0
                        ? `${p.stockQuantity ?? 50} in stock`
                        : 'Out of stock'}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <div className="flex items-center gap-1 flex-wrap">
                      {p.isFlashSale && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-800">
                          FLASH
                        </span>
                      )}
                      {p.isFeatured && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-100 text-purple-800">
                          FEATURED
                        </span>
                      )}
                      {p.isNewArrival && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-800">
                          NEW
                        </span>
                      )}
                      {p.isHot && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-100 text-rose-800">
                          HOT
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-3.5">
                    <StatusBadge
                      status={p.isActive ?? true ? 'active' : 'inactive'}
                      type="active"
                    />
                  </td>

                  <td className="p-3.5 pr-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDuplicate(p)}
                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                        title="Duplicate Product"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct(p);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#D4AF37] hover:text-[#06201A] text-gray-700"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(p.id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 sm:p-8 max-w-3xl w-full shadow-2xl border border-gray-200 max-h-[92vh] overflow-y-auto">
            <h2 className="text-xl font-black text-[#06201A] uppercase tracking-tight mb-4">
              {editingProduct.id ? 'Edit Product' : 'Add New Product'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Row 1: Name and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => {
                      const name = e.target.value;
                      setEditingProduct({
                        ...editingProduct,
                        name,
                        slug: editingProduct.slug ? editingProduct.slug : generateSlug(name),
                      });
                    }}
                    placeholder="e.g. Velvet Midnight Heavyweight Hoodie"
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={editingProduct.category || ''}
                    onChange={(e) => {
                      const catName = e.target.value;
                      const catObj = categories.find((c) => c.name === catName);
                      setEditingProduct({
                        ...editingProduct,
                        category: catName,
                        categorySlug: catObj?.slug || generateSlug(catName),
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37] bg-white font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Pricing & Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Sale Price (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price ?? ''}
                    onChange={(e) =>
                      handlePriceChange(Number(e.target.value), editingProduct.originalPrice)
                    }
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37] font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Original Price (৳)
                  </label>
                  <input
                    type="number"
                    value={editingProduct.originalPrice ?? ''}
                    onChange={(e) =>
                      handlePriceChange(
                        editingProduct.price || 0,
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    placeholder="Regular price"
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    readOnly
                    value={editingProduct.discountPercent ?? 0}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={editingProduct.stockQuantity ?? 50}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stockQuantity: Number(e.target.value),
                        inStock: Number(e.target.value) > 0,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37] font-bold"
                  />
                </div>
              </div>

              {/* Gallery Image Uploader */}
              <ImageUploader
                bucket="products"
                label="Product Images from Phone Gallery (First image is main)"
                multiple={true}
                maxFiles={6}
                images={
                  editingProduct.gallery && editingProduct.gallery.length > 0
                    ? editingProduct.gallery
                    : editingProduct.image
                    ? [editingProduct.image]
                    : []
                }
                onChange={(imgs) =>
                  setEditingProduct({
                    ...editingProduct,
                    gallery: imgs,
                    image: imgs[0] || '',
                  })
                }
              />

              {/* Row 3: Available Sizes */}
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1.5">
                  Available Sizes
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {['S', 'M', 'L', 'XL', 'XXL', 'Regular'].map((sz) => {
                    const hasSize = (editingProduct.sizes || []).includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          const currentSizes = editingProduct.sizes || [];
                          const updated = hasSize
                            ? currentSizes.filter((s) => s !== sz)
                            : [...currentSizes, sz];
                          setEditingProduct({ ...editingProduct, sizes: updated });
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold uppercase transition-all ${
                          hasSize
                            ? 'bg-[#06201A] text-[#D4AF37] ring-2 ring-[#D4AF37]'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {sz} {hasSize ? '✓' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 4: Descriptions */}
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  placeholder="Detail about the fabric, fit, gsm, cut, styling..."
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37]"
                />
              </div>

              {/* Row 5: Storefront Display Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 bg-gray-50 p-3 rounded-2xl border border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={editingProduct.isFlashSale ?? false}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, isFlashSale: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#D4AF37] rounded"
                  />
                  <span>Flash Sale</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={editingProduct.isFeatured ?? false}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#D4AF37] rounded"
                  />
                  <span>Featured</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={editingProduct.isNewArrival ?? false}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, isNewArrival: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#D4AF37] rounded"
                  />
                  <span>New Arrival</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={editingProduct.isHot ?? false}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, isHot: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#D4AF37] rounded"
                  />
                  <span>Hot Badge</span>
                </label>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={editingProduct.isActive ?? true}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, isActive: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#D4AF37] rounded"
                  />
                  <span>Active & Visible in Storefront</span>
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
                  className="px-5 py-2 rounded-xl bg-[#06201A] hover:bg-[#0B2B22] text-[#D4AF37] font-black uppercase tracking-wider shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
