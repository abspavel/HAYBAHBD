import { supabase } from '../lib/supabase';
import {
  Product,
  CategoryItem,
  HeroBanner,
  OrderDetails,
  Customer,
  Coupon,
  IncompleteOrder,
  SiteSettings,
  OrderStatus,
} from '../types';
import { CATEGORIES as DEFAULT_CATEGORIES, ALL_PRODUCTS as DEFAULT_PRODUCTS } from '../data/mockData';
import {
  getLocalProducts,
  saveLocalProduct,
  deleteLocalProduct,
  getLocalCategories,
  saveLocalCategory,
  deleteLocalCategory,
  getLocalBanners,
  saveLocalBanner,
  deleteLocalBanner,
  getLocalCoupons,
  saveLocalCoupon,
  deleteLocalCoupon,
  getLocalOrders,
  saveLocalOrder,
  updateLocalOrderStatus,
  deleteLocalOrder,
  getLocalCustomers,
  deleteLocalCustomer,
  getLocalIncompleteOrders,
  saveLocalIncompleteOrder,
  updateLocalIncompleteOrder,
  deleteLocalIncompleteOrder,
  getLocalSettings,
  saveLocalSettings,
  getDeletedProductIds,
  getDeletedCategoryIds,
  getDeletedBannerIds,
  getDeletedCouponIds,
  DEFAULT_BANNERS,
  DEFAULT_SETTINGS,
} from './localAdminStore';

export { DEFAULT_BANNERS, DEFAULT_SETTINGS };

// ==========================================
// 1. IMAGE COMPRESSION & STORAGE HELPERS
// ==========================================

/**
 * Compresses an image on the client using HTML5 Canvas
 * Max width 1600px, quality 0.82, converts to WebP if supported
 */
export async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // If not an image, return original file
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const maxWidth = 1600;
        let { width, height } = img;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first, fallback to JPEG
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              canvas.toBlob(
                (jpegBlob) => resolve(jpegBlob || file),
                'image/jpeg',
                0.85
              );
            }
          },
          'image/webp',
          0.82
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => reject(reader.error);
  });
}

/**
 * Uploads an image file to Supabase Storage public bucket
 */
export async function uploadImageToSupabase(
  file: File,
  bucket: 'banners' | 'categories' | 'products',
  oldUrl?: string
): Promise<string> {
  try {
    const compressedBlob = await compressImage(file);
    const ext = 'webp';
    const cleanFileName = file.name
      .replace(/[^a-zA-Z0-9]/g, '_')
      .slice(0, 30);
    const filePath = `${Date.now()}_${cleanFileName}.${ext}`;

    // Upload to bucket
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, compressedBlob, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (error) {
      console.warn('Storage upload error, falling back to data URL or local URL:', error);
      // In case storage bucket is not created or permissions fail, generate a data URL so user can still test!
      return await fileToDataUrl(file);
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    // If an old image existed in the same bucket, attempt to delete it
    if (oldUrl && oldUrl.includes(`/storage/v1/object/public/${bucket}/`)) {
      try {
        const oldPath = oldUrl.split(`/${bucket}/`)[1];
        if (oldPath) {
          await supabase.storage.from(bucket).remove([oldPath]);
        }
      } catch (e) {
        console.warn('Could not delete old image:', e);
      }
    }

    return publicUrlData.publicUrl;
  } catch (err) {
    console.warn('Image upload failed, falling back:', err);
    return await fileToDataUrl(file);
  }
}

/**
 * Fallback to base64 Data URL if storage is not yet initialized
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || '');
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Delete image from bucket
 */
export async function deleteImageFromSupabase(
  bucket: 'banners' | 'categories' | 'products',
  url: string
): Promise<void> {
  if (!url || !url.includes(`/storage/v1/object/public/${bucket}/`)) return;
  try {
    const oldPath = url.split(`/${bucket}/`)[1];
    if (oldPath) {
      await supabase.storage.from(bucket).remove([oldPath]);
    }
  } catch (e) {
    console.warn('Delete image failed:', e);
  }
}

// ==========================================
// 2. AUTH & ADMIN PERMISSIONS
// ==========================================

export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    // First try the is_admin() RPC function
    const { data: rpcAdmin, error: rpcError } = await supabase.rpc('is_admin');
    if (!rpcError && typeof rpcAdmin === 'boolean') {
      return rpcAdmin;
    }

    // Direct check in admins table by ID
    const { data: adminById } = await supabase
      .from('admins')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (adminById) {
      return true;
    }

    // Direct check in admins table by email
    if (user.email) {
      const { data: adminByEmail } = await supabase
        .from('admins')
        .select('id')
        .eq('email', user.email.toLowerCase().trim())
        .maybeSingle();

      if (adminByEmail) {
        return true;
      }
    }

    // Fallback: designated default admin
    if (user.email && user.email.toLowerCase().trim() === 'haybahclothing1@gmail.com') {
      return true;
    }

    return false;
  } catch (e) {
    console.error('Error verifying admin status:', e);
    return false;
  }
}

// ==========================================
// 3. STOREFRONT DATA FETCHING & MAPPERS
// ==========================================

export function mapDbBannerToHeroBanner(row: any): HeroBanner {
  const defaultMatch = DEFAULT_BANNERS.find((d) => d.id === String(row.id));
  const image =
    row.image && String(row.image).trim() !== ''
      ? String(row.image).trim()
      : defaultMatch?.image || '';

  return {
    id: String(row.id),
    title: row.title || defaultMatch?.title || '',
    subtitle: row.subtitle || defaultMatch?.subtitle || '',
    badge: row.badge || defaultMatch?.badge || '',
    tagline: row.tagline || defaultMatch?.tagline || '',
    actionText: row.action_text || defaultMatch?.actionText || 'SHOP NOW',
    actionLink: row.action_link || defaultMatch?.actionLink || 'category',
    categorySlug: row.category_slug || defaultMatch?.categorySlug || '',
    image,
    bgColor: row.bg_color || 'from-[#06201A] via-[#0B2B22] to-[#041511]',
    accentColor: row.accent_color || '#D4AF37',
    sortOrder: Number(row.sort_order ?? 0),
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
  };
}

export function mapDbCategoryToCategoryItem(row: any): CategoryItem {
  return {
    id: String(row.id),
    name: row.name || 'Untitled Category',
    slug: row.slug || String(row.id),
    image:
      row.image ||
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    badge: row.badge || '',
    itemCount: Number(row.item_count ?? 0),
    sortOrder: Number(row.sort_order ?? 0),
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
  };
}

export function mapDbProductToProduct(row: any): Product {
  const mainImage = row.image || (Array.isArray(row.gallery) && row.gallery[0]) || '';
  const gallery =
    Array.isArray(row.gallery) && row.gallery.length > 0
      ? row.gallery
      : mainImage
      ? [mainImage]
      : [];

  return {
    id: String(row.id),
    name: row.name || 'Untitled Product',
    slug: row.slug || String(row.id),
    category: row.category || 'General',
    categorySlug: row.category_slug || row.categorySlug || 'general',
    price: Number(row.price || 0),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    discountPercent: Number(row.discount_percent || 0),
    isHot: Boolean(row.is_hot),
    isFlashSale: Boolean(row.is_flash_sale),
    isFeatured: Boolean(row.is_featured),
    isNewArrival: Boolean(row.is_new_arrival),
    isActive: row.is_active ?? true,
    rating: Number(row.rating || 5.0),
    reviewsCount: Number(row.reviews_count || 12),
    image: mainImage,
    gallery,
    description: row.description || '',
    shortDescription: row.short_description || '',
    details: row.details || '',
    sizes: Array.isArray(row.sizes) && row.sizes.length > 0 ? row.sizes : ['M', 'L', 'XL', 'XXL'],
    colors: Array.isArray(row.colors) ? row.colors : [],
    fabric: row.fabric || '',
    gsm: row.gsm ? Number(row.gsm) : undefined,
    fit: row.fit || '',
    sku: row.sku || `HYB-${row.id}`,
    inStock: Boolean(row.in_stock ?? true),
    stockQuantity: Number(row.stock_quantity ?? 50),
    tag: row.tag || '',
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export async function fetchLiveCategories(): Promise<CategoryItem[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      const mapped = data.map(mapDbCategoryToCategoryItem);
      try {
        localStorage.setItem('haybah_admin_categories', JSON.stringify(mapped));
      } catch {}
      return mapped.filter((c) => c.isActive !== false);
    }
  } catch (err) {
    console.warn('Supabase fetch categories note:', err);
  }

  const local = getLocalCategories();
  const deleted = getDeletedCategoryIds();
  return (local && local.length > 0 ? local : DEFAULT_CATEGORIES).filter(
    (c) => c.isActive !== false && !deleted.has(c.id)
  );
}

export async function fetchLiveProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      const mapped = data.map(mapDbProductToProduct);
      try {
        localStorage.setItem('haybah_admin_products', JSON.stringify(mapped));
      } catch {}
      return mapped.filter((p) => p.isActive !== false);
    }
  } catch (err) {
    console.warn('Supabase fetch products note:', err);
  }

  const local = getLocalProducts();
  const deleted = getDeletedProductIds();
  return (local && local.length > 0 ? local : DEFAULT_PRODUCTS).filter(
    (p) => p.isActive !== false && !deleted.has(p.id)
  );
}

export async function fetchLiveHeroBanners(): Promise<HeroBanner[]> {
  try {
    const { data, error } = await supabase
      .from('hero_banners')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && Array.isArray(data)) {
      const mapped = data.map(mapDbBannerToHeroBanner);
      try {
        localStorage.setItem('haybah_admin_banners', JSON.stringify(mapped));
      } catch {}
      return mapped.filter((b) => b.isActive !== false);
    }
  } catch (err) {
    console.warn('Supabase fetch banners note:', err);
  }

  const local = getLocalBanners();
  const deleted = getDeletedBannerIds();
  return (local && local.length > 0 ? local : []).filter(
    (b) => b.isActive !== false && !deleted.has(b.id)
  );
}

export async function fetchLiveSiteSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      const mapped: SiteSettings = {
        brandName: data.brand_name || 'HAYBAH',
        helpline: data.helpline || '+880 1642-247530',
        helplineHours: data.helpline_hours || '(11:00 AM – 08:00 PM)',
        email: data.email || 'haybahclothing1@gmail.com',
        whatsapp: data.whatsapp || '+8801642247530',
        marqueeText:
          data.marquee_text ||
          'FREE SHIPPING ON ORDERS OVER ৳2000! | CASH ON DELIVERY AVAILABLE ALL OVER BANGLADESH | 7-DAY EXCHANGE POLICY',
        shippingInsideDhaka: Number(data.shipping_inside_dhaka ?? 80),
        shippingOutsideDhaka: Number(data.shipping_outside_dhaka ?? 130),
      };
      try {
        localStorage.setItem('haybah_admin_settings', JSON.stringify(mapped));
      } catch {}
      return mapped;
    }
  } catch (err) {
    console.warn('Supabase fetch settings note:', err);
  }

  const local = getLocalSettings();
  return local || DEFAULT_SETTINGS;
}

// ==========================================
// 4. RPC HELPERS (Storefront -> Backend)
// ==========================================

export async function rpcCheckCoupon(
  code: string,
  subtotal: number
): Promise<{ valid: boolean; discount: number; message: string }> {
  try {
    const { data, error } = await supabase.rpc('check_coupon', {
      p_code: code.trim().toUpperCase(),
      p_subtotal: subtotal,
    });

    if (error) {
      console.warn('Coupon RPC error, checking local fallback:', error);
      if (code.trim().toUpperCase() === 'HAYBAH10') {
        const discount = Math.round(subtotal * 0.1);
        return { valid: true, discount, message: '10% discount applied!' };
      }
      return { valid: false, discount: 0, message: 'Invalid or expired coupon code' };
    }

    return {
      valid: Boolean(data?.valid),
      discount: Number(data?.discount || 0),
      message: data?.message || (data?.valid ? 'Coupon applied!' : 'Invalid code'),
    };
  } catch {
    if (code.trim().toUpperCase() === 'HAYBAH10') {
      const discount = Math.round(subtotal * 0.1);
      return { valid: true, discount, message: '10% discount applied!' };
    }
    return { valid: false, discount: 0, message: 'Could not apply coupon' };
  }
}

export async function rpcSaveIncompleteOrder(orderData: {
  name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  thana: string;
  items: any[];
  total: number;
}): Promise<void> {
  try {
    await supabase.rpc('save_incomplete_order', {
      p_name: orderData.name,
      p_phone: orderData.phone,
      p_address: orderData.address,
      p_city: orderData.city,
      p_district: orderData.district,
      p_thana: orderData.thana,
      p_items: orderData.items,
      p_total: orderData.total,
    });
  } catch (e) {
    console.warn('Save incomplete order error:', e);
  }
}

export async function rpcPlaceOrder(orderData: {
  customerName: string;
  phone: string;
  address: string;
  district: string;
  thana: string;
  city: string;
  items: any[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  couponCode?: string;
  notes?: string;
}): Promise<{ orderId: string; orderNumber: string } | null> {
  try {
    const { data, error } = await supabase.rpc('place_order', {
      p_customer_name: orderData.customerName,
      p_phone: orderData.phone,
      p_address: orderData.address,
      p_district: orderData.district,
      p_thana: orderData.thana,
      p_city: orderData.city,
      p_items: orderData.items,
      p_subtotal: orderData.subtotal,
      p_delivery_fee: orderData.deliveryFee,
      p_discount: orderData.discount,
      p_total: orderData.total,
      p_coupon_code: orderData.couponCode || null,
      p_notes: orderData.notes || null,
    });

    if (error) {
      console.warn('Place order RPC error:', error);
      return null;
    }

    return {
      orderId: data?.id || `HYB-${Math.floor(100000 + Math.random() * 900000)}`,
      orderNumber: data?.order_number || `HYB-${Math.floor(100000 + Math.random() * 900000)}`,
    };
  } catch (e) {
    console.warn('Place order exception:', e);
    return null;
  }
}

// ==========================================
// 5. ADMIN DATA FETCHING & CLOUD CRUD
// ==========================================

export async function adminFetchAllProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      const mapped = data.map(mapDbProductToProduct);
      try {
        localStorage.setItem('haybah_admin_products', JSON.stringify(mapped));
      } catch {}
      return mapped;
    }
  } catch (err) {
    console.warn('Supabase admin fetch products note:', err);
  }

  const local = getLocalProducts();
  const deleted = getDeletedProductIds();
  return (local && local.length > 0 ? local : DEFAULT_PRODUCTS).filter(
    (p) => !deleted.has(p.id)
  );
}

export async function adminFetchAllCategories(): Promise<CategoryItem[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      const mapped = data.map(mapDbCategoryToCategoryItem);
      try {
        localStorage.setItem('haybah_admin_categories', JSON.stringify(mapped));
      } catch {}
      return mapped;
    }
  } catch (err) {
    console.warn('Supabase admin fetch categories note:', err);
  }

  const local = getLocalCategories();
  const deleted = getDeletedCategoryIds();
  return (local && local.length > 0 ? local : DEFAULT_CATEGORIES).filter(
    (c) => !deleted.has(c.id)
  );
}

export async function adminFetchAllBanners(): Promise<HeroBanner[]> {
  try {
    const { data, error } = await supabase
      .from('hero_banners')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      const mapped = data.map(mapDbBannerToHeroBanner);
      try {
        localStorage.setItem('haybah_admin_banners', JSON.stringify(mapped));
      } catch {}
      return mapped;
    }
  } catch (err) {
    console.warn('Supabase admin fetch banners note:', err);
  }

  const local = getLocalBanners();
  const deleted = getDeletedBannerIds();
  return (local && local.length > 0 ? local : DEFAULT_BANNERS).filter(
    (b) => !deleted.has(b.id)
  );
}

export async function remoteSaveBanner(
  banner: Partial<HeroBanner>
): Promise<{ success: boolean; banner: HeroBanner; error?: string; isRlsError?: boolean }> {
  const localSaved = saveLocalBanner(banner);
  const payload = {
    id: localSaved.id,
    title: localSaved.title,
    subtitle: localSaved.subtitle || '',
    badge: localSaved.badge || '',
    tagline: localSaved.tagline || '',
    action_text: localSaved.actionText || 'SHOP NOW',
    action_link: localSaved.actionLink || 'category',
    category_slug: localSaved.categorySlug || '',
    image: localSaved.image || '',
    bg_color: localSaved.bgColor || 'from-[#06201A] via-[#0B2B22] to-[#041511]',
    accent_color: localSaved.accentColor || '#D4AF37',
    sort_order: localSaved.sortOrder ?? 1,
    is_active: localSaved.isActive ?? true,
    updated_at: new Date().toISOString(),
  };

  try {
    const { error } = await supabase.from('hero_banners').upsert(payload);
    if (error) {
      const isRls = error.code === '42501' || error.message?.includes('row-level security');
      return { success: false, banner: localSaved, error: error.message, isRlsError: isRls };
    }
    return { success: true, banner: localSaved };
  } catch (err: any) {
    return { success: false, banner: localSaved, error: err?.message || 'Remote error' };
  }
}

export async function remoteDeleteBanner(
  bannerId: string
): Promise<{ success: boolean; error?: string; isRlsError?: boolean }> {
  deleteLocalBanner(bannerId);
  try {
    const { error } = await supabase.from('hero_banners').delete().eq('id', bannerId);
    if (error) {
      const isRls = error.code === '42501' || error.message?.includes('row-level security');
      return { success: false, error: error.message, isRlsError: isRls };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Remote error' };
  }
}

export async function remoteSaveCategory(
  category: Partial<CategoryItem>
): Promise<{ success: boolean; category: CategoryItem; error?: string; isRlsError?: boolean }> {
  const localSaved = saveLocalCategory(category);
  const payload = {
    id: localSaved.id,
    name: localSaved.name,
    slug: localSaved.slug,
    image: localSaved.image || '',
    badge: localSaved.badge || '',
    item_count: localSaved.itemCount ?? 0,
    sort_order: localSaved.sortOrder ?? 1,
    is_active: localSaved.isActive ?? true,
    updated_at: new Date().toISOString(),
  };

  try {
    const { error } = await supabase.from('categories').upsert(payload);
    if (error) {
      const isRls = error.code === '42501' || error.message?.includes('row-level security');
      return { success: false, category: localSaved, error: error.message, isRlsError: isRls };
    }
    return { success: true, category: localSaved };
  } catch (err: any) {
    return { success: false, category: localSaved, error: err?.message || 'Remote error' };
  }
}

export async function remoteDeleteCategory(
  categoryId: string
): Promise<{ success: boolean; error?: string; isRlsError?: boolean }> {
  deleteLocalCategory(categoryId);
  try {
    const { error } = await supabase.from('categories').delete().eq('id', categoryId);
    if (error) {
      const isRls = error.code === '42501' || error.message?.includes('row-level security');
      return { success: false, error: error.message, isRlsError: isRls };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Remote error' };
  }
}

export async function remoteSaveProduct(
  product: Partial<Product>
): Promise<{ success: boolean; product: Product; error?: string; isRlsError?: boolean }> {
  const localSaved = saveLocalProduct(product);
  const payload = {
    id: localSaved.id,
    name: localSaved.name,
    slug: localSaved.slug,
    category: localSaved.category,
    category_slug: localSaved.categorySlug,
    price: localSaved.price,
    original_price: localSaved.originalPrice || null,
    discount_percent: localSaved.discountPercent || 0,
    is_hot: Boolean(localSaved.isHot),
    is_flash_sale: Boolean(localSaved.isFlashSale),
    is_featured: Boolean(localSaved.isFeatured),
    is_new_arrival: Boolean(localSaved.isNewArrival),
    is_active: localSaved.isActive ?? true,
    rating: localSaved.rating || 5.0,
    reviews_count: localSaved.reviewsCount || 12,
    image: localSaved.image || '',
    gallery: localSaved.gallery || [],
    description: localSaved.description || '',
    short_description: localSaved.shortDescription || '',
    details: localSaved.details || '',
    sizes: localSaved.sizes || ['M', 'L', 'XL', 'XXL'],
    colors: localSaved.colors || [],
    fabric: localSaved.fabric || '',
    gsm: localSaved.gsm || null,
    fit: localSaved.fit || '',
    sku: localSaved.sku || `HYB-${localSaved.id}`,
    in_stock: localSaved.inStock ?? true,
    stock_quantity: localSaved.stockQuantity ?? 50,
    tag: localSaved.tag || '',
    sort_order: localSaved.sortOrder ?? 0,
    updated_at: new Date().toISOString(),
  };

  try {
    const { error } = await supabase.from('products').upsert(payload);
    if (error) {
      const isRls = error.code === '42501' || error.message?.includes('row-level security');
      return { success: false, product: localSaved, error: error.message, isRlsError: isRls };
    }
    return { success: true, product: localSaved };
  } catch (err: any) {
    return { success: false, product: localSaved, error: err?.message || 'Remote error' };
  }
}

export async function remoteDeleteProduct(
  productId: string
): Promise<{ success: boolean; error?: string; isRlsError?: boolean }> {
  deleteLocalProduct(productId);
  try {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      const isRls = error.code === '42501' || error.message?.includes('row-level security');
      return { success: false, error: error.message, isRlsError: isRls };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Remote error' };
  }
}

export async function checkSupabaseWritePermission(): Promise<{
  writable: boolean;
  error?: string;
  isRlsError?: boolean;
}> {
  try {
    const { data, error } = await supabase.from('hero_banners').select('id').limit(1);
    if (error) {
      return {
        writable: false,
        error: error.message,
        isRlsError: error.code === '42501' || error.message?.includes('row-level security'),
      };
    }

    if (data && data.length > 0) {
      const testId = data[0].id;
      const { error: updErr } = await supabase
        .from('hero_banners')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', testId);

      if (updErr) {
        return {
          writable: false,
          error: updErr.message,
          isRlsError: updErr.code === '42501' || updErr.message?.includes('row-level security'),
        };
      }
      return { writable: true };
    }

    return { writable: true };
  } catch (e: any) {
    return { writable: false, error: e?.message };
  }
}

export async function adminFetchAllOrders(): Promise<OrderDetails[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      if (data.length === 0) {
        return [];
      }
      const mapped: OrderDetails[] = data.map((o: any) => ({
        orderId: o.order_number || o.id,
        customerName: o.customer_name || 'Customer',
        phone: o.phone || '',
        address: o.address || '',
        district: o.district || '',
        thana: o.thana || '',
        city: o.city || 'Inside Dhaka',
        paymentMethod: o.payment_method || 'Cash on Delivery',
        subtotal: Number(o.subtotal || 0),
        deliveryFee: Number(o.delivery_fee || 0),
        discount: Number(o.discount || 0),
        total: Number(o.total || 0),
        status: o.status || 'pending',
        notes: o.notes || '',
        couponCode: o.coupon_code || '',
        createdAt: o.created_at
          ? new Date(o.created_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Recent',
        updatedAt: o.updated_at,
        items: (o.order_items || []).map((it: any) => ({
          id: it.id,
          productId: it.product_id,
          product: {
            id: it.product_id,
            name: it.product_name || 'Item',
            price: Number(it.unit_price || it.price || 0),
            image: it.product_image || '',
            sizes: [it.selected_size || it.size || 'L'],
          } as any,
          selectedSize: it.selected_size || it.size || 'L',
          quantity: Number(it.quantity || 1),
        })),
      }));

      return mapped;
    }
  } catch (err) {
    console.warn('Supabase fetch orders note:', err);
  }
  return getLocalOrders();
}

export async function adminFetchAllCustomers(): Promise<Customer[]> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('last_order_date', { ascending: false });

    if (!error && Array.isArray(data)) {
      if (data.length === 0) {
        return [];
      }
      const mapped: Customer[] = data.map((c: any) => ({
        id: c.id || `cust-${c.phone}`,
        phone: c.phone || '',
        name: c.name || 'Shopper',
        email: c.email || '',
        address: c.address || '',
        city: c.city || 'Inside Dhaka',
        district: c.district || '',
        thana: c.thana || '',
        totalOrders: Number(c.total_orders ?? 1),
        totalSpent: Number(c.total_spent ?? 0),
        lastOrderDate: c.last_order_date
          ? new Date(c.last_order_date).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : 'Recent',
        isBlocked: Boolean(c.is_blocked),
        adminNotes: c.admin_notes || '',
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }));

      try {
        localStorage.setItem('haybah_admin_customers', JSON.stringify(mapped));
      } catch {}
      return mapped;
    }
  } catch (err) {
    console.warn('Supabase fetch customers note:', err);
  }
  return getLocalCustomers();
}

export async function adminFetchAllCoupons(): Promise<Coupon[]> {
  try {
    const local = getLocalCoupons();
    const deleted = getDeletedCouponIds();
    return (local && local.length > 0 ? local : []).filter((c) => !deleted.has(c.id));
  } catch {
    return [];
  }
}

export async function adminFetchAllIncompleteOrders(): Promise<IncompleteOrder[]> {
  try {
    const { data, error } = await supabase
      .from('incomplete_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      if (data.length === 0) {
        return [];
      }
      return data.map((i: any) => ({
        id: i.id,
        customerName: i.customer_name || 'Customer',
        phone: i.phone || '',
        address: i.address || '',
        district: i.district || '',
        thana: i.thana || '',
        city: i.city || '',
        cartItems: Array.isArray(i.cart_items) ? i.cart_items : [],
        totalAmount: Number(i.total || i.total_amount || 0),
        callCount: Number(i.call_count || 0),
        lastCallAt: i.last_call_at,
        status: i.status || 'new',
        adminNotes: i.admin_notes || '',
        createdAt: i.created_at,
        updatedAt: i.updated_at,
      }));
    }
  } catch (err) {
    console.warn('Supabase fetch incomplete orders note:', err);
  }
  return getLocalIncompleteOrders();
}

export async function adminUpdateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<boolean> {
  updateLocalOrderStatus(orderId, newStatus);
  try {
    await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .or(`id.eq.${orderId},order_number.eq.${orderId}`);
  } catch (err) {
    console.warn('Remote update order status note:', err);
  }
  return true;
}

export async function adminDeleteOrder(orderId: string): Promise<boolean> {
  deleteLocalOrder(orderId);
  try {
    await supabase.from('order_items').delete().or(`order_id.eq.${orderId}`);
    await supabase.from('orders').delete().or(`id.eq.${orderId},order_number.eq.${orderId}`);
  } catch (err) {
    console.warn('Remote delete order note:', err);
  }
  return true;
}

export async function adminDeleteCustomer(customerId: string, phone?: string): Promise<boolean> {
  deleteLocalCustomer(customerId);
  try {
    if (customerId) {
      await supabase.from('customers').delete().eq('id', customerId);
    }
    if (phone) {
      await supabase.from('customers').delete().eq('phone', phone);
    }
  } catch (err) {
    console.warn('Remote delete customer note:', err);
  }
  return true;
}

export async function adminDeleteIncompleteOrder(id: string): Promise<boolean> {
  deleteLocalIncompleteOrder(id);
  try {
    await supabase.from('incomplete_orders').delete().eq('id', id);
  } catch (err) {
    console.warn('Remote delete incomplete order note:', err);
  }
  return true;
}

export async function adminSaveSiteSettings(settings: SiteSettings): Promise<boolean> {
  saveLocalSettings(settings);
  try {
    await supabase.from('site_settings').upsert({
      id: 1,
      brand_name: settings.brandName,
      helpline: settings.helpline,
      helpline_hours: settings.helplineHours,
      email: settings.email,
      whatsapp: settings.whatsapp,
      marquee_text: settings.marqueeText,
      shipping_inside_dhaka: settings.shippingInsideDhaka,
      shipping_outside_dhaka: settings.shippingOutsideDhaka,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Remote save settings note:', err);
  }
  return true;
}
