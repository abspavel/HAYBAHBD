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
  getLocalCustomers,
  getLocalIncompleteOrders,
  saveLocalIncompleteOrder,
  updateLocalIncompleteOrder,
  getLocalSettings,
  saveLocalSettings,
  getDeletedProductIds,
  getDeletedCategoryIds,
  getDeletedBannerIds,
  getDeletedCouponIds,
} from './localAdminStore';

// Default banners fallback - High-res streetwear banner imagery
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
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=85',
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
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=85',
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
    categorySlug: 'premium-drop-shoulders',
    image: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=1600&q=85',
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
    const local = getLocalCategories();
    const deleted = getDeletedCategoryIds();
    return (local && local.length > 0 ? local : DEFAULT_CATEGORIES).filter(
      (c) => c.isActive !== false && !deleted.has(c.id)
    );
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export async function fetchLiveProducts(): Promise<Product[]> {
  try {
    const local = getLocalProducts();
    const deleted = getDeletedProductIds();
    return (local && local.length > 0 ? local : DEFAULT_PRODUCTS).filter(
      (p) => p.isActive !== false && !deleted.has(p.id)
    );
  } catch {
    return DEFAULT_PRODUCTS;
  }
}

export async function fetchLiveHeroBanners(): Promise<HeroBanner[]> {
  try {
    const local = getLocalBanners();
    const deleted = getDeletedBannerIds();
    return (local && local.length > 0 ? local : DEFAULT_BANNERS).filter(
      (b) => b.isActive !== false && !deleted.has(b.id)
    );
  } catch {
    return DEFAULT_BANNERS;
  }
}

export async function fetchLiveSiteSettings(): Promise<SiteSettings> {
  try {
    const local = getLocalSettings();
    return local || DEFAULT_SETTINGS;
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
  try {
    const local = getLocalProducts();
    const deleted = getDeletedProductIds();
    return (local && local.length > 0 ? local : DEFAULT_PRODUCTS).filter(
      (p) => !deleted.has(p.id)
    );
  } catch {
    return DEFAULT_PRODUCTS;
  }
}

export async function adminFetchAllCategories(): Promise<CategoryItem[]> {
  try {
    const local = getLocalCategories();
    const deleted = getDeletedCategoryIds();
    return (local && local.length > 0 ? local : DEFAULT_CATEGORIES).filter(
      (c) => !deleted.has(c.id)
    );
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export async function adminFetchAllBanners(): Promise<HeroBanner[]> {
  try {
    const local = getLocalBanners();
    const deleted = getDeletedBannerIds();
    return (local && local.length > 0 ? local : DEFAULT_BANNERS).filter(
      (b) => !deleted.has(b.id)
    );
  } catch {
    return DEFAULT_BANNERS;
  }
}

export async function adminFetchAllOrders(): Promise<OrderDetails[]> {
  try {
    return getLocalOrders();
  } catch {
    return [];
  }
}

export async function adminFetchAllCustomers(): Promise<Customer[]> {
  try {
    return getLocalCustomers();
  } catch {
    return [];
  }
}

export async function adminFetchAllCoupons(): Promise<Coupon[]> {
  try {
    const local = getLocalCoupons();
    const deleted = getDeletedCouponIds();
    return (local && local.length > 0 ? local : []).filter(
      (c) => !deleted.has(c.id)
    );
  } catch {
    return [];
  }
}

export async function adminFetchAllIncompleteOrders(): Promise<IncompleteOrder[]> {
  try {
    return getLocalIncompleteOrders();
  } catch {
    return [];
  }
}

export async function adminUpdateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<boolean> {
  // Always update local store first
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

export async function adminSaveSiteSettings(settings: SiteSettings): Promise<boolean> {
  saveLocalSettings(settings);
  try {
    await supabase
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
  } catch (err) {
    console.warn('Remote save settings note:', err);
  }
  return true;
}
