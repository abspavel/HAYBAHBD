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

// Default banners fallback
export const DEFAULT_BANNERS: HeroBanner[] = [
  {
    id: 'banner-1',
    badge: 'No #1 Streetwear Brand',
    title: 'URBAN EVOLUTION 2026',
    subtitle: 'PREMIUM DROPS & EXCLUSIVE CUTS',
    tagline: 'Engineered for those who lead with energy and edge',
    actionText: 'EXPLORE COLLECTION',
    actionLink: 'shop',
    categorySlug: 'y2k-jersey',
    image: '',
    bgColor: 'from-[#06201A] via-[#0B2B22] to-[#041511]',
    accentColor: '#D4AF37',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'banner-2',
    badge: 'Winter Capsule Collection',
    title: 'HEAVYWEIGHT HOODIES',
    subtitle: '420 GSM FRENCH TERRY & CORD SHACKETS',
    tagline: 'Signature warmth with architectural oversized draping',
    actionText: 'SHOP WINTER DROPS',
    actionLink: 'category',
    categorySlug: 'premium-hoodie',
    image: '',
    bgColor: 'from-[#091E19] via-[#102B23] to-[#061814]',
    accentColor: '#E8CE7A',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'banner-3',
    badge: 'Limited Edition Drop',
    title: 'Y2K MOTOR JERSEYS',
    subtitle: 'RETRO ATHLETIC APPAREL IN BANGLADESH',
    tagline: 'Authentic mesh with double stitched number graphics',
    actionText: 'VIEW JERSEYS',
    actionLink: 'category',
    categorySlug: 'y2k-jersey',
    image: '',
    bgColor: 'from-[#12241D] via-[#0B2B22] to-[#051510]',
    accentColor: '#D4AF37',
    sortOrder: 3,
    isActive: true,
  },
];

// Default site settings
export const DEFAULT_SETTINGS: SiteSettings = {
  brandName: 'HAYBAH',
  helpline: '+880 1642-247530',
  helplineHours: '(11:00 AM – 08:00 PM)',
  email: 'haybahclothing1@gmail.com',
  whatsapp: '+8801642247530',
  marqueeText:
    'FREE SHIPPING ON ORDERS OVER ৳2000! | CASH ON DELIVERY AVAILABLE ALL OVER BANGLADESH | 7-DAY EXCHANGE POLICY',
  shippingInsideDhaka: 80,
  shippingOutsideDhaka: 120,
};

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

    // Direct check in admins table
    const { data, error } = await supabase
      .from('admins')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!error && data) {
      return true;
    }

    // Fallback: if email matches the designated admin email
    if (user.email === 'haybahclothing1@gmail.com') {
      return true;
    }

    return false;
  } catch (e) {
    console.error('Error verifying admin status:', e);
    return false;
  }
}

// ==========================================
// 3. STOREFRONT DATA FETCHING
// ==========================================

export async function fetchLiveCategories(): Promise<CategoryItem[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_CATEGORIES;
    }

    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      image: item.image,
      badge: item.badge || '',
      itemCount: item.item_count ?? 2,
      sortOrder: item.sort_order ?? 0,
      isActive: item.is_active ?? true,
    }));
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export async function fetchLiveProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_PRODUCTS;
    }

    return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      categorySlug: p.category_slug || p.slug,
      price: Number(p.price),
      originalPrice: p.original_price ? Number(p.original_price) : undefined,
      discountPercent: p.discount_percent || 0,
      isHot: Boolean(p.is_hot),
      isFlashSale: Boolean(p.is_flash_sale),
      isFeatured: Boolean(p.is_featured),
      isNewArrival: Boolean(p.is_new_arrival),
      isActive: Boolean(p.is_active),
      rating: Number(p.rating || 5.0),
      reviewsCount: Number(p.reviews_count || 12),
      image: p.image,
      gallery: Array.isArray(p.gallery) ? p.gallery : [p.image],
      description: p.description || '',
      shortDescription: p.short_description || '',
      details: p.details || '',
      sizes: Array.isArray(p.sizes) && p.sizes.length ? p.sizes : ['M', 'L', 'XL', 'XXL'],
      colors: Array.isArray(p.colors) ? p.colors : [],
      fabric: p.fabric || '',
      gsm: p.gsm ? Number(p.gsm) : undefined,
      fit: p.fit || '',
      sku: p.sku || `HYB-${p.id}`,
      inStock: Boolean(p.in_stock && (p.stock_quantity === undefined || p.stock_quantity > 0)),
      stockQuantity: p.stock_quantity ?? 50,
      tag: p.tag || '',
      sortOrder: p.sort_order ?? 0,
    }));
  } catch {
    return DEFAULT_PRODUCTS;
  }
}

export async function fetchLiveHeroBanners(): Promise<HeroBanner[]> {
  try {
    const { data, error } = await supabase
      .from('hero_banners')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_BANNERS;
    }

    return data.map((b: any) => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle || '',
      badge: b.badge || '',
      tagline: b.tagline || '',
      actionText: b.action_text || 'EXPLORE COLLECTION',
      actionLink: b.action_link || 'shop',
      categorySlug: b.category_slug || '',
      image: b.image || '',
      bgColor: b.bg_color || 'from-[#06201A] via-[#0B2B22] to-[#041511]',
      accentColor: b.accent_color || '#D4AF37',
      sortOrder: b.sort_order ?? 0,
      isActive: b.is_active ?? true,
    }));
  } catch {
    return DEFAULT_BANNERS;
  }
}

export async function fetchLiveSiteSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_SETTINGS;
    }

    return {
      brandName: data.brand_name || DEFAULT_SETTINGS.brandName,
      helpline: data.helpline || DEFAULT_SETTINGS.helpline,
      helplineHours: data.helpline_hours || DEFAULT_SETTINGS.helplineHours,
      email: data.email || DEFAULT_SETTINGS.email,
      whatsapp: data.whatsapp || DEFAULT_SETTINGS.whatsapp,
      marqueeText: data.marquee_text || DEFAULT_SETTINGS.marqueeText,
      shippingInsideDhaka: Number(data.shipping_inside_dhaka ?? 80),
      shippingOutsideDhaka: Number(data.shipping_outside_dhaka ?? 120),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
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
// 5. ADMIN DATA FETCHING & CRUD
// ==========================================

export async function adminFetchAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error || !data || data.length === 0) {
    return DEFAULT_PRODUCTS;
  }

  return data.map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category,
    categorySlug: p.category_slug,
    price: Number(p.price),
    originalPrice: p.original_price ? Number(p.original_price) : undefined,
    discountPercent: p.discount_percent || 0,
    isHot: Boolean(p.is_hot),
    isFlashSale: Boolean(p.is_flash_sale),
    isFeatured: Boolean(p.is_featured),
    isNewArrival: Boolean(p.is_new_arrival),
    isActive: Boolean(p.is_active),
    rating: Number(p.rating || 5.0),
    reviewsCount: Number(p.reviews_count || 12),
    image: p.image,
    gallery: Array.isArray(p.gallery) ? p.gallery : [p.image],
    description: p.description || '',
    shortDescription: p.short_description || '',
    details: p.details || '',
    sizes: Array.isArray(p.sizes) && p.sizes.length ? p.sizes : ['M', 'L', 'XL', 'XXL'],
    colors: Array.isArray(p.colors) ? p.colors : [],
    fabric: p.fabric || '',
    gsm: p.gsm ? Number(p.gsm) : undefined,
    fit: p.fit || '',
    sku: p.sku || `HYB-${p.id}`,
    inStock: Boolean(p.in_stock),
    stockQuantity: p.stock_quantity ?? 50,
    tag: p.tag || '',
    sortOrder: p.sort_order ?? 0,
    createdAt: p.created_at,
  }));
}

export async function adminFetchAllCategories(): Promise<CategoryItem[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error || !data || data.length === 0) {
    return DEFAULT_CATEGORIES;
  }

  return data.map((item: any) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    image: item.image,
    badge: item.badge || '',
    itemCount: item.item_count ?? 2,
    sortOrder: item.sort_order ?? 0,
    isActive: item.is_active ?? true,
    createdAt: item.created_at,
  }));
}

export async function adminFetchAllBanners(): Promise<HeroBanner[]> {
  const { data, error } = await supabase
    .from('hero_banners')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error || !data || data.length === 0) {
    return DEFAULT_BANNERS;
  }

  return data.map((b: any) => ({
    id: b.id,
    title: b.title,
    subtitle: b.subtitle || '',
    badge: b.badge || '',
    tagline: b.tagline || '',
    actionText: b.action_text || 'EXPLORE COLLECTION',
    actionLink: b.action_link || 'shop',
    categorySlug: b.category_slug || '',
    image: b.image || '',
    bgColor: b.bg_color || 'from-[#06201A] via-[#0B2B22] to-[#041511]',
    accentColor: b.accent_color || '#D4AF37',
    sortOrder: b.sort_order ?? 0,
    isActive: b.is_active ?? true,
    createdAt: b.created_at,
  }));
}

export async function adminFetchAllOrders(): Promise<OrderDetails[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .order('created_at', { ascending: false });

  if (error || !data) {
    // Return saved local orders
    try {
      const saved = localStorage.getItem('haybah_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  return data.map((o: any) => ({
    orderId: o.order_number || o.id,
    customerName: o.customer_name,
    phone: o.phone,
    address: o.address,
    district: o.district || '',
    thana: o.thana || '',
    city: o.city,
    paymentMethod: o.payment_method || 'Cash on Delivery',
    items: (o.order_items || []).map((it: any) => ({
      id: it.id,
      productId: it.product_id || '',
      selectedSize: it.selected_size || 'L',
      quantity: it.quantity,
      product: {
        id: it.product_id || '',
        name: it.product_name,
        price: Number(it.unit_price),
        image: it.product_image || '',
        category: '',
        rating: 5,
        reviewsCount: 1,
        description: '',
        sizes: [it.selected_size || 'L'],
        sku: '',
        inStock: true,
      },
    })),
    subtotal: Number(o.subtotal),
    deliveryFee: Number(o.delivery_fee),
    discount: Number(o.discount || 0),
    total: Number(o.total),
    status: o.status || 'pending',
    notes: o.notes || '',
    couponCode: o.coupon_code || '',
    createdAt: new Date(o.created_at).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    updatedAt: o.updated_at,
  }));
}

export async function adminFetchAllCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('total_spent', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((c: any) => ({
    id: c.id,
    phone: c.phone,
    name: c.name,
    email: c.email || '',
    address: c.address || '',
    city: c.city || 'Inside Dhaka',
    district: c.district || '',
    thana: c.thana || '',
    totalOrders: Number(c.total_orders || 0),
    totalSpent: Number(c.total_spent || 0),
    lastOrderDate: c.last_order_date,
    isBlocked: Boolean(c.is_blocked),
    adminNotes: c.admin_notes || '',
    createdAt: c.created_at,
  }));
}

export async function adminFetchAllCoupons(): Promise<Coupon[]> {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [
      {
        id: 'c-1',
        code: 'HAYBAH10',
        type: 'percent',
        value: 10,
        minOrder: 1000,
        maxDiscount: 500,
        usageLimit: 500,
        usedCount: 24,
        isActive: true,
      },
    ];
  }

  return data.map((c: any) => ({
    id: c.id,
    code: c.code,
    type: c.type || 'percent',
    value: Number(c.value),
    minOrder: Number(c.min_order || 0),
    maxDiscount: Number(c.max_discount || 0),
    usageLimit: Number(c.usage_limit || 100),
    usedCount: Number(c.used_count || 0),
    isActive: Boolean(c.is_active),
    startDate: c.start_date,
    endDate: c.end_date,
    createdAt: c.created_at,
  }));
}

export async function adminFetchAllIncompleteOrders(): Promise<IncompleteOrder[]> {
  const { data, error } = await supabase
    .from('incomplete_orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((inc: any) => ({
    id: inc.id,
    phone: inc.phone,
    customerName: inc.customer_name || 'Anonymous Customer',
    address: inc.address || '',
    city: inc.city || '',
    district: inc.district || '',
    thana: inc.thana || '',
    cartItems: Array.isArray(inc.cart_items) ? inc.cart_items : [],
    totalAmount: Number(inc.total_amount || 0),
    callCount: Number(inc.call_count || 0),
    lastCallAt: inc.last_call_at,
    status: inc.status || 'new',
    adminNotes: inc.admin_notes || '',
    createdAt: inc.created_at,
    updatedAt: inc.updated_at,
  }));
}

export async function adminUpdateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .or(`id.eq.${orderId},order_number.eq.${orderId}`);

    if (error) {
      console.warn('Update order status error:', error);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function adminSaveSiteSettings(settings: SiteSettings): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('site_settings')
      .upsert({
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

    return !error;
  } catch {
    return false;
  }
}
