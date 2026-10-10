import {
  Product,
  CategoryItem,
  HeroBanner,
  Coupon,
  OrderDetails,
  Customer,
  IncompleteOrder,
  SiteSettings,
  OrderStatus,
} from '../types';
import { ALL_PRODUCTS, CATEGORIES } from '../data/mockData';
import { DEFAULT_BANNERS, DEFAULT_SETTINGS } from './supabaseService';

// Storage keys
const STORAGE_KEYS = {
  PRODUCTS: 'haybah_admin_products',
  CATEGORIES: 'haybah_admin_categories',
  BANNERS: 'haybah_admin_banners',
  COUPONS: 'haybah_admin_coupons',
  ORDERS: 'haybah_orders',
  CUSTOMERS: 'haybah_admin_customers',
  INCOMPLETE: 'haybah_admin_incomplete_orders',
  SETTINGS: 'haybah_admin_settings',
  DELETED_PRODUCTS: 'haybah_deleted_products',
  DELETED_CATEGORIES: 'haybah_deleted_categories',
  DELETED_BANNERS: 'haybah_deleted_banners',
  DELETED_COUPONS: 'haybah_deleted_coupons',
  DELETED_ORDERS: 'haybah_deleted_orders',
};

// Safe JSON loader
function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch {
    return fallback;
  }
}

// Safe JSON saver
function saveJSON<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`LocalAdminStore failed to save ${key}:`, e);
  }
}

// Audio chime helper
export function playAdminChime(type: 'success' | 'delete' | 'alert' = 'success') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'delete') {
      osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc.frequency.setValueAtTime(349.23, ctx.currentTime + 0.1); // F4
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } else {
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch {
    // Ignore audio policy issues
  }
}

// Broadcast store updates
export function notifyStoreUpdated(type: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('haybah:store-updated', { detail: { type } }));
  }
}

// ============================================================================
// DELETED IDS TRACKERS (Ensures deleted items are never revived by remote)
// ============================================================================

export function getDeletedProductIds(): Set<string> {
  const arr = loadJSON<string[]>(STORAGE_KEYS.DELETED_PRODUCTS, []);
  return new Set(arr);
}
export function trackDeletedProduct(id: string) {
  const set = getDeletedProductIds();
  set.add(id);
  saveJSON(STORAGE_KEYS.DELETED_PRODUCTS, Array.from(set));
}

export function getDeletedCategoryIds(): Set<string> {
  const arr = loadJSON<string[]>(STORAGE_KEYS.DELETED_CATEGORIES, []);
  return new Set(arr);
}
export function trackDeletedCategory(id: string) {
  const set = getDeletedCategoryIds();
  set.add(id);
  saveJSON(STORAGE_KEYS.DELETED_CATEGORIES, Array.from(set));
}

export function getDeletedBannerIds(): Set<string> {
  const arr = loadJSON<string[]>(STORAGE_KEYS.DELETED_BANNERS, []);
  return new Set(arr);
}
export function trackDeletedBanner(id: string) {
  const set = getDeletedBannerIds();
  set.add(id);
  saveJSON(STORAGE_KEYS.DELETED_BANNERS, Array.from(set));
}

export function getDeletedCouponIds(): Set<string> {
  const arr = loadJSON<string[]>(STORAGE_KEYS.DELETED_COUPONS, []);
  return new Set(arr);
}
export function trackDeletedCoupon(id: string) {
  const set = getDeletedCouponIds();
  set.add(id);
  saveJSON(STORAGE_KEYS.DELETED_COUPONS, Array.from(set));
}

// ============================================================================
// 1. PRODUCTS
// ============================================================================

export function getLocalProducts(): Product[] {
  const existing = loadJSON<Product[] | null>(STORAGE_KEYS.PRODUCTS, null);
  if (existing && Array.isArray(existing) && existing.length > 0) {
    return existing;
  }
  // Initialize with ALL_PRODUCTS
  saveJSON(STORAGE_KEYS.PRODUCTS, ALL_PRODUCTS);
  return ALL_PRODUCTS;
}

export function saveLocalProduct(product: Partial<Product>): Product {
  const products = getLocalProducts();
  const id = product.id || `p-${Date.now()}`;
  const now = new Date().toISOString();

  // If was previously deleted, remove from deleted tracker
  const deleted = getDeletedProductIds();
  if (deleted.has(id)) {
    deleted.delete(id);
    saveJSON(STORAGE_KEYS.DELETED_PRODUCTS, Array.from(deleted));
  }

  const existingIndex = products.findIndex((p) => p.id === id);
  const existing = existingIndex >= 0 ? products[existingIndex] : null;

  const fullProduct: Product = {
    id,
    name: product.name !== undefined ? product.name.trim() : (existing?.name || 'Untitled Product'),
    slug: product.slug !== undefined ? product.slug.trim() : (existing?.slug || id),
    category: product.category !== undefined ? product.category : (existing?.category || 'General'),
    categorySlug: product.categorySlug !== undefined ? product.categorySlug : (existing?.categorySlug || 'general'),
    price: product.price !== undefined ? Number(product.price) : (existing?.price || 0),
    originalPrice: product.originalPrice !== undefined ? Number(product.originalPrice) : existing?.originalPrice,
    discountPercent: product.discountPercent !== undefined ? Number(product.discountPercent) : (existing?.discountPercent || 0),
    isHot: product.isHot !== undefined ? Boolean(product.isHot) : Boolean(existing?.isHot),
    isFlashSale: product.isFlashSale !== undefined ? Boolean(product.isFlashSale) : Boolean(existing?.isFlashSale),
    isFeatured: product.isFeatured !== undefined ? Boolean(product.isFeatured) : Boolean(existing?.isFeatured),
    isNewArrival: product.isNewArrival !== undefined ? Boolean(product.isNewArrival) : Boolean(existing?.isNewArrival),
    isActive: product.isActive !== undefined ? Boolean(product.isActive) : (existing?.isActive ?? true),
    rating: product.rating !== undefined ? Number(product.rating) : (existing?.rating || 5.0),
    reviewsCount: product.reviewsCount !== undefined ? Number(product.reviewsCount) : (existing?.reviewsCount || 12),
    image: product.image !== undefined ? product.image : (existing?.image || ''),
    gallery: Array.isArray(product.gallery) && product.gallery.length > 0
      ? product.gallery
      : existing?.gallery || [product.image || existing?.image || ''],
    description: product.description !== undefined ? product.description : (existing?.description || ''),
    shortDescription: product.shortDescription !== undefined ? product.shortDescription : (existing?.shortDescription || ''),
    details: product.details !== undefined ? product.details : (existing?.details || ''),
    sizes: Array.isArray(product.sizes) && product.sizes.length > 0
      ? product.sizes
      : existing?.sizes || ['M', 'L', 'XL', 'XXL'],
    colors: Array.isArray(product.colors) ? product.colors : existing?.colors || [],
    fabric: product.fabric !== undefined ? product.fabric : (existing?.fabric || ''),
    gsm: product.gsm !== undefined ? Number(product.gsm) : existing?.gsm,
    fit: product.fit !== undefined ? product.fit : (existing?.fit || ''),
    sku: product.sku !== undefined ? product.sku : (existing?.sku || `HYB-${id}`),
    inStock: product.inStock !== undefined ? Boolean(product.inStock) : (existing?.inStock ?? true),
    stockQuantity: product.stockQuantity !== undefined ? Number(product.stockQuantity) : (existing?.stockQuantity ?? 50),
    tag: product.tag !== undefined ? product.tag : (existing?.tag || ''),
    sortOrder: product.sortOrder !== undefined ? product.sortOrder : (existing?.sortOrder ?? 0),
    createdAt: existing?.createdAt || now,
  };

  if (existingIndex >= 0) {
    products[existingIndex] = fullProduct;
  } else {
    products.unshift(fullProduct);
  }

  saveJSON(STORAGE_KEYS.PRODUCTS, products);
  notifyStoreUpdated('products');
  return fullProduct;
}

export function deleteLocalProduct(productId: string): boolean {
  const products = getLocalProducts();
  const filtered = products.filter((p) => p.id !== productId);
  saveJSON(STORAGE_KEYS.PRODUCTS, filtered);
  trackDeletedProduct(productId);
  notifyStoreUpdated('products');
  return true;
}

// ============================================================================
// 2. CATEGORIES
// ============================================================================

export function getLocalCategories(): CategoryItem[] {
  const existing = loadJSON<CategoryItem[] | null>(STORAGE_KEYS.CATEGORIES, null);
  if (existing && Array.isArray(existing) && existing.length > 0) {
    return existing;
  }
  saveJSON(STORAGE_KEYS.CATEGORIES, CATEGORIES);
  return CATEGORIES;
}

export function saveLocalCategory(category: Partial<CategoryItem>): CategoryItem {
  const categories = getLocalCategories();
  const id = category.id || `cat-${category.slug || Date.now()}`;
  const now = new Date().toISOString();

  const deleted = getDeletedCategoryIds();
  if (deleted.has(id)) {
    deleted.delete(id);
    saveJSON(STORAGE_KEYS.DELETED_CATEGORIES, Array.from(deleted));
  }

  const existingIndex = categories.findIndex((c) => c.id === id);
  const existing = existingIndex >= 0 ? categories[existingIndex] : null;

  const fullCategory: CategoryItem = {
    id,
    name: category.name !== undefined ? category.name.trim() : (existing?.name || 'Untitled Category'),
    slug: category.slug !== undefined ? category.slug.trim() : (existing?.slug || id),
    image: category.image !== undefined ? category.image : (existing?.image || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'),
    badge: category.badge !== undefined ? category.badge : (existing?.badge || ''),
    itemCount: category.itemCount !== undefined ? Number(category.itemCount) : (existing?.itemCount ?? 2),
    sortOrder: category.sortOrder !== undefined ? Number(category.sortOrder) : (existing?.sortOrder ?? categories.length + 1),
    isActive: category.isActive !== undefined ? Boolean(category.isActive) : (existing?.isActive ?? true),
    createdAt: existing?.createdAt || now,
  };

  if (existingIndex >= 0) {
    categories[existingIndex] = fullCategory;
  } else {
    categories.push(fullCategory);
  }

  saveJSON(STORAGE_KEYS.CATEGORIES, categories);
  notifyStoreUpdated('categories');
  return fullCategory;
}

export function deleteLocalCategory(categoryId: string): boolean {
  const categories = getLocalCategories();
  const filtered = categories.filter((c) => c.id !== categoryId);
  saveJSON(STORAGE_KEYS.CATEGORIES, filtered);
  trackDeletedCategory(categoryId);
  notifyStoreUpdated('categories');
  return true;
}

// ============================================================================
// 3. HERO BANNERS
// ============================================================================

export function getLocalBanners(): HeroBanner[] {
  const existing = loadJSON<HeroBanner[] | null>(STORAGE_KEYS.BANNERS, null);
  if (existing && Array.isArray(existing) && existing.length > 0) {
    return existing;
  }
  saveJSON(STORAGE_KEYS.BANNERS, DEFAULT_BANNERS);
  return DEFAULT_BANNERS;
}

export function saveLocalBanner(banner: Partial<HeroBanner>): HeroBanner {
  const banners = getLocalBanners();
  const id = banner.id || `banner-${Date.now()}`;
  const now = new Date().toISOString();

  const deleted = getDeletedBannerIds();
  if (deleted.has(id)) {
    deleted.delete(id);
    saveJSON(STORAGE_KEYS.DELETED_BANNERS, Array.from(deleted));
  }

  const existingIndex = banners.findIndex((b) => b.id === id);
  const existing = existingIndex >= 0 ? banners[existingIndex] : null;

  const fullBanner: HeroBanner = {
    id,
    title: banner.title !== undefined ? banner.title : (existing?.title || 'Exclusive Collection'),
    subtitle: banner.subtitle !== undefined ? banner.subtitle : (existing?.subtitle || ''),
    badge: banner.badge !== undefined ? banner.badge : (existing?.badge || ''),
    tagline: banner.tagline !== undefined ? banner.tagline : (existing?.tagline || ''),
    actionText: banner.actionText !== undefined ? banner.actionText : (existing?.actionText || 'SHOP NOW'),
    actionLink: banner.actionLink !== undefined ? banner.actionLink : (existing?.actionLink || 'category'),
    categorySlug: banner.categorySlug !== undefined ? banner.categorySlug : (existing?.categorySlug || ''),
    image: banner.image !== undefined ? banner.image : (existing?.image || ''),
    bgColor: banner.bgColor !== undefined ? banner.bgColor : (existing?.bgColor || 'from-[#06201A] via-[#0B2B22] to-[#041511]'),
    accentColor: banner.accentColor !== undefined ? banner.accentColor : (existing?.accentColor || '#D4AF37'),
    sortOrder: banner.sortOrder !== undefined ? banner.sortOrder : (existing?.sortOrder ?? banners.length + 1),
    isActive: banner.isActive !== undefined ? Boolean(banner.isActive) : (existing?.isActive ?? true),
    createdAt: existing?.createdAt || now,
  };

  if (existingIndex >= 0) {
    banners[existingIndex] = fullBanner;
  } else {
    banners.push(fullBanner);
  }

  saveJSON(STORAGE_KEYS.BANNERS, banners);
  notifyStoreUpdated('banners');
  return fullBanner;
}

export function deleteLocalBanner(bannerId: string): boolean {
  const banners = getLocalBanners();
  const filtered = banners.filter((b) => b.id !== bannerId);
  saveJSON(STORAGE_KEYS.BANNERS, filtered);
  trackDeletedBanner(bannerId);
  notifyStoreUpdated('banners');
  return true;
}

// ============================================================================
// 4. COUPONS
// ============================================================================

export const DEFAULT_COUPONS: Coupon[] = [
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
  {
    id: 'c-2',
    code: 'WELCOME50',
    type: 'fixed',
    value: 50,
    minOrder: 500,
    maxDiscount: 50,
    usageLimit: 200,
    usedCount: 12,
    isActive: true,
  },
  {
    id: 'c-3',
    code: 'EIDSPECIAL',
    type: 'percent',
    value: 15,
    minOrder: 1500,
    maxDiscount: 700,
    usageLimit: 300,
    usedCount: 5,
    isActive: true,
  },
];

export function getLocalCoupons(): Coupon[] {
  const existing = loadJSON<Coupon[] | null>(STORAGE_KEYS.COUPONS, null);
  if (existing && Array.isArray(existing) && existing.length > 0) {
    return existing;
  }
  saveJSON(STORAGE_KEYS.COUPONS, DEFAULT_COUPONS);
  return DEFAULT_COUPONS;
}

export function saveLocalCoupon(coupon: Partial<Coupon>): Coupon {
  const coupons = getLocalCoupons();
  const code = (coupon.code || '').trim().toUpperCase();
  const id = coupon.id || `cp-${code.toLowerCase() || Date.now()}`;
  const now = new Date().toISOString();

  const deleted = getDeletedCouponIds();
  if (deleted.has(id)) {
    deleted.delete(id);
    saveJSON(STORAGE_KEYS.DELETED_COUPONS, Array.from(deleted));
  }

  const existingIndex = coupons.findIndex((c) => c.id === id || c.code === code);
  const existing = existingIndex >= 0 ? coupons[existingIndex] : null;

  const fullCoupon: Coupon = {
    id,
    code,
    type: coupon.type || existing?.type || 'percent',
    value: coupon.value !== undefined ? Number(coupon.value) : (existing?.value || 0),
    minOrder: coupon.minOrder !== undefined ? Number(coupon.minOrder) : (existing?.minOrder || 0),
    maxDiscount: coupon.maxDiscount !== undefined ? Number(coupon.maxDiscount) : (existing?.maxDiscount || 0),
    usageLimit: coupon.usageLimit !== undefined ? Number(coupon.usageLimit) : (existing?.usageLimit || 100),
    usedCount: coupon.usedCount !== undefined ? Number(coupon.usedCount) : (existing?.usedCount || 0),
    isActive: coupon.isActive !== undefined ? Boolean(coupon.isActive) : (existing?.isActive ?? true),
    startDate: coupon.startDate || existing?.startDate || now,
    endDate: coupon.endDate !== undefined ? coupon.endDate : existing?.endDate,
    createdAt: existing?.createdAt || now,
  };

  if (existingIndex >= 0) {
    coupons[existingIndex] = fullCoupon;
  } else {
    coupons.unshift(fullCoupon);
  }

  saveJSON(STORAGE_KEYS.COUPONS, coupons);
  notifyStoreUpdated('coupons');
  return fullCoupon;
}

export function deleteLocalCoupon(couponId: string): boolean {
  const coupons = getLocalCoupons();
  const filtered = coupons.filter((c) => c.id !== couponId && c.code !== couponId);
  saveJSON(STORAGE_KEYS.COUPONS, filtered);
  trackDeletedCoupon(couponId);
  notifyStoreUpdated('coupons');
  return true;
}

// ============================================================================
// 5. ORDERS & REALISTIC SEEDS
// ============================================================================

export const INITIAL_ORDERS: OrderDetails[] = [
  {
    orderId: 'HYB-849201',
    customerName: 'Md. Tanvir Hossain',
    phone: '01712-345678',
    address: 'House 42, Road 11, Block D, Banani',
    city: 'Inside Dhaka',
    district: 'Dhaka',
    thana: 'Banani',
    paymentMethod: 'Cash on Delivery',
    items: [
      {
        id: 'it-1',
        productId: 'p-hoodie-2',
        product: {
          id: 'p-hoodie-2',
          name: 'Forest Moss Architectural Hoodie',
          price: 2450,
          image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
          category: 'Premium Hoodie',
          rating: 5,
          reviewsCount: 18,
          description: '',
          sizes: ['L'],
          sku: 'HYB-MOSS-HD',
          inStock: true,
        },
        selectedSize: 'L',
        quantity: 1,
      },
      {
        id: 'it-2',
        productId: 'p-drop-1',
        product: {
          id: 'p-drop-1',
          name: 'Heavyweight Minimalist Boxy Drop Tee',
          price: 1350,
          image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
          category: 'Drop Shoulder',
          rating: 4.9,
          reviewsCount: 22,
          description: '',
          sizes: ['XL'],
          sku: 'HYB-BOX-TEE',
          inStock: true,
        },
        selectedSize: 'XL',
        quantity: 1,
      },
    ],
    subtotal: 3800,
    deliveryFee: 80,
    discount: 0,
    total: 3880,
    status: 'pending',
    notes: 'Please deliver after 3:00 PM if possible',
    createdAt: '9 Oct 2026, 02:45 PM',
  },
  {
    orderId: 'HYB-793412',
    customerName: 'Farhan Ahmed',
    phone: '01819-876543',
    address: 'GEC Circle, Nasirabad Housing Society, Road 3, House 12',
    city: 'Outside Dhaka',
    district: 'Chattogram',
    thana: 'Panchlaish',
    paymentMethod: 'Cash on Delivery',
    items: [
      {
        id: 'it-3',
        productId: 'p-jersey-1',
        product: {
          id: 'p-jersey-1',
          name: 'Y2K Track Speed Racing Jersey #88',
          price: 1700,
          image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
          category: 'Y2K Jersey',
          rating: 4.8,
          reviewsCount: 14,
          description: '',
          sizes: ['M'],
          sku: 'HYB-JERSEY-88',
          inStock: true,
        },
        selectedSize: 'M',
        quantity: 1,
      },
    ],
    subtotal: 1700,
    deliveryFee: 120,
    discount: 0,
    total: 1820,
    status: 'confirmed',
    notes: 'Call before delivery',
    createdAt: '9 Oct 2026, 11:15 AM',
  },
  {
    orderId: 'HYB-652190',
    customerName: 'Rahim Khan',
    phone: '01911-223344',
    address: 'Zindabazar, Amberkhana Road, Ward 4',
    city: 'Outside Dhaka',
    district: 'Sylhet',
    thana: 'Kotwali',
    paymentMethod: 'Cash on Delivery',
    items: [
      {
        id: 'it-4',
        productId: 'p-shacket-1',
        product: {
          id: 'p-shacket-1',
          name: 'Olive Heavyweight Corduroy Shacket',
          price: 2600,
          image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80',
          category: 'Premium Shacket',
          rating: 5,
          reviewsCount: 9,
          description: '',
          sizes: ['XL'],
          sku: 'HYB-CORD-SHK',
          inStock: true,
        },
        selectedSize: 'XL',
        quantity: 1,
      },
    ],
    subtotal: 2600,
    deliveryFee: 120,
    discount: 0,
    total: 2720,
    status: 'processing',
    notes: '',
    createdAt: '8 Oct 2026, 06:30 PM',
  },
  {
    orderId: 'HYB-581044',
    customerName: 'Sabbir Chowdhury',
    phone: '01623-998877',
    address: 'Flat 5B, Green Luxury, Sector 7, Uttara',
    city: 'Inside Dhaka',
    district: 'Dhaka',
    thana: 'Uttara',
    paymentMethod: 'Cash on Delivery',
    items: [
      {
        id: 'it-5',
        productId: 'p-cargo-1',
        product: {
          id: 'p-cargo-1',
          name: 'Tactical Deep Green 6-Pocket Cargo',
          price: 2200,
          image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=80',
          category: 'Pants & Cargo',
          rating: 4.9,
          reviewsCount: 16,
          description: '',
          sizes: ['32'],
          sku: 'HYB-CARGO-6P',
          inStock: true,
        },
        selectedSize: '32',
        quantity: 1,
      },
    ],
    subtotal: 2200,
    deliveryFee: 80,
    discount: 0,
    total: 2280,
    status: 'shipped',
    notes: 'Steadfast Courier tracking active',
    createdAt: '8 Oct 2026, 01:10 PM',
  },
  {
    orderId: 'HYB-492110',
    customerName: 'Nafis Iqbal',
    phone: '01552-667788',
    address: 'Dhanmondi 27, Road 16 (Old 27), House 15',
    city: 'Inside Dhaka',
    district: 'Dhaka',
    thana: 'Dhanmondi',
    paymentMethod: 'Cash on Delivery',
    items: [
      {
        id: 'it-6',
        productId: 'p-drop-1',
        product: {
          id: 'p-drop-1',
          name: 'Heavyweight Minimalist Boxy Drop Tee',
          price: 1350,
          image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
          category: 'Drop Shoulder',
          rating: 4.9,
          reviewsCount: 22,
          description: '',
          sizes: ['L'],
          sku: 'HYB-BOX-TEE',
          inStock: true,
        },
        selectedSize: 'L',
        quantity: 2,
      },
    ],
    subtotal: 2700,
    deliveryFee: 80,
    discount: 300,
    total: 2480,
    couponCode: 'HAYBAH10',
    status: 'delivered',
    notes: 'Delivered successfully and cash received',
    createdAt: '7 Oct 2026, 04:20 PM',
  },
];

export function getLocalOrders(): OrderDetails[] {
  const stored = loadJSON<OrderDetails[] | null>(STORAGE_KEYS.ORDERS, null);
  if (stored && Array.isArray(stored) && stored.length > 0) {
    return stored;
  }
  saveJSON(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  return INITIAL_ORDERS;
}

export function saveLocalOrder(order: OrderDetails): void {
  const orders = getLocalOrders();
  const existingIdx = orders.findIndex((o) => o.orderId === order.orderId);
  if (existingIdx >= 0) {
    orders[existingIdx] = order;
  } else {
    orders.unshift(order);
  }
  saveJSON(STORAGE_KEYS.ORDERS, orders);

  // Auto-sync / create Customer record
  updateCustomerFromOrder(order);
  notifyStoreUpdated('orders');
}

export function updateLocalOrderStatus(orderId: string, status: OrderStatus): boolean {
  const orders = getLocalOrders();
  const target = orders.find((o) => o.orderId === orderId);
  if (target) {
    target.status = status;
    target.updatedAt = new Date().toISOString();
    saveJSON(STORAGE_KEYS.ORDERS, orders);
    notifyStoreUpdated('orders');
    return true;
  }
  return false;
}

export function deleteLocalOrder(orderId: string): boolean {
  const orders = getLocalOrders();
  const filtered = orders.filter((o) => o.orderId !== orderId);
  saveJSON(STORAGE_KEYS.ORDERS, filtered);
  notifyStoreUpdated('orders');
  return true;
}

// ============================================================================
// 6. CUSTOMERS
// ============================================================================

export function getLocalCustomers(): Customer[] {
  const stored = loadJSON<Customer[] | null>(STORAGE_KEYS.CUSTOMERS, null);
  if (stored && Array.isArray(stored) && stored.length > 0) {
    return stored;
  }

  // Synthesize customers from orders
  const orders = getLocalOrders();
  const map = new Map<string, Customer>();

  orders.forEach((o) => {
    const key = o.phone || o.customerName;
    if (!key) return;

    if (!map.has(key)) {
      map.set(key, {
        id: `cust-${key.replace(/[^a-zA-Z0-9]/g, '')}`,
        phone: o.phone,
        name: o.customerName,
        email: '',
        address: o.address,
        city: o.city || 'Inside Dhaka',
        district: o.district || '',
        thana: o.thana || '',
        totalOrders: 1,
        totalSpent: o.total,
        lastOrderDate: o.createdAt,
        isBlocked: false,
        adminNotes: '',
        createdAt: o.createdAt,
      });
    } else {
      const existing = map.get(key)!;
      existing.totalOrders += 1;
      existing.totalSpent += o.total;
    }
  });

  const list = Array.from(map.values());
  saveJSON(STORAGE_KEYS.CUSTOMERS, list);
  return list;
}

export function saveLocalCustomer(customer: Partial<Customer>): Customer {
  const customers = getLocalCustomers();
  const id = customer.id || `cust-${Date.now()}`;
  const existingIdx = customers.findIndex((c) => c.id === id || (customer.phone && c.phone === customer.phone));

  const fullCustomer: Customer = {
    id,
    phone: customer.phone || '',
    name: customer.name || 'Anonymous Customer',
    email: customer.email || '',
    address: customer.address || '',
    city: customer.city || 'Inside Dhaka',
    district: customer.district || '',
    thana: customer.thana || '',
    totalOrders: Number(customer.totalOrders || 1),
    totalSpent: Number(customer.totalSpent || 0),
    lastOrderDate: customer.lastOrderDate || new Date().toISOString(),
    isBlocked: Boolean(customer.isBlocked),
    adminNotes: customer.adminNotes || '',
    createdAt: customer.createdAt || new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    customers[existingIdx] = { ...customers[existingIdx], ...fullCustomer };
  } else {
    customers.unshift(fullCustomer);
  }

  saveJSON(STORAGE_KEYS.CUSTOMERS, customers);
  notifyStoreUpdated('customers');
  return fullCustomer;
}

export function toggleBlockCustomer(id: string): boolean {
  const customers = getLocalCustomers();
  const target = customers.find((c) => c.id === id);
  if (target) {
    target.isBlocked = !target.isBlocked;
    saveJSON(STORAGE_KEYS.CUSTOMERS, customers);
    notifyStoreUpdated('customers');
    return target.isBlocked;
  }
  return false;
}

function updateCustomerFromOrder(order: OrderDetails): void {
  const customers = getLocalCustomers();
  const key = order.phone || order.customerName;
  if (!key) return;

  const existing = customers.find((c) => c.phone === order.phone);
  if (existing) {
    existing.name = order.customerName || existing.name;
    existing.address = order.address || existing.address;
    existing.city = order.city || existing.city;
    existing.district = order.district || existing.district;
    existing.thana = order.thana || existing.thana;
    existing.totalOrders += 1;
    existing.totalSpent += order.total;
    existing.lastOrderDate = order.createdAt || new Date().toISOString();
  } else {
    customers.unshift({
      id: `cust-${Date.now()}`,
      phone: order.phone,
      name: order.customerName,
      email: '',
      address: order.address,
      city: order.city || 'Inside Dhaka',
      district: order.district || '',
      thana: order.thana || '',
      totalOrders: 1,
      totalSpent: order.total,
      lastOrderDate: order.createdAt || new Date().toISOString(),
      isBlocked: false,
      adminNotes: '',
      createdAt: order.createdAt || new Date().toISOString(),
    });
  }

  saveJSON(STORAGE_KEYS.CUSTOMERS, customers);
}

// ============================================================================
// 7. INCOMPLETE ORDERS (Leads)
// ============================================================================

export const INITIAL_INCOMPLETE_ORDERS: IncompleteOrder[] = [
  {
    id: 'inc-101',
    phone: '01799-123456',
    customerName: 'Shakil Mahmud',
    address: 'Mirpur 10, Block C, Road 5',
    city: 'Inside Dhaka',
    district: 'Dhaka',
    thana: 'Mirpur',
    cartItems: [
      {
        id: 'ci-1',
        product: ALL_PRODUCTS[0],
        selectedSize: 'L',
        quantity: 1,
      },
    ],
    totalAmount: 2530,
    callCount: 1,
    status: 'called',
    adminNotes: 'Customer asked for size chart confirmation via WhatsApp',
    createdAt: '9 Oct 2026, 01:20 PM',
  },
  {
    id: 'inc-102',
    phone: '01923-456789',
    customerName: 'Mehedi Hasan',
    address: 'Agrabad Commercial Area',
    city: 'Outside Dhaka',
    district: 'Chattogram',
    thana: 'Double Mooring',
    cartItems: [
      {
        id: 'ci-2',
        product: ALL_PRODUCTS[1],
        selectedSize: 'XL',
        quantity: 1,
      },
    ],
    totalAmount: 1820,
    callCount: 0,
    status: 'new',
    adminNotes: '',
    createdAt: '9 Oct 2026, 12:40 PM',
  },
];

export function getLocalIncompleteOrders(): IncompleteOrder[] {
  const stored = loadJSON<IncompleteOrder[] | null>(STORAGE_KEYS.INCOMPLETE, null);
  if (stored && Array.isArray(stored) && stored.length > 0) {
    return stored;
  }
  saveJSON(STORAGE_KEYS.INCOMPLETE, INITIAL_INCOMPLETE_ORDERS);
  return INITIAL_INCOMPLETE_ORDERS;
}

export function saveLocalIncompleteOrder(lead: Partial<IncompleteOrder>): IncompleteOrder {
  const leads = getLocalIncompleteOrders();
  const id = lead.id || `inc-${Date.now()}`;
  const now = new Date().toISOString();

  const fullLead: IncompleteOrder = {
    id,
    phone: lead.phone || '',
    customerName: lead.customerName || 'Anonymous Customer',
    address: lead.address || '',
    city: lead.city || '',
    district: lead.district || '',
    thana: lead.thana || '',
    cartItems: lead.cartItems || [],
    totalAmount: Number(lead.totalAmount || 0),
    callCount: Number(lead.callCount || 0),
    lastCallAt: lead.lastCallAt,
    status: lead.status || 'new',
    adminNotes: lead.adminNotes || '',
    createdAt: lead.createdAt || now,
    updatedAt: now,
  };

  const existingIdx = leads.findIndex((l) => l.phone && l.phone === fullLead.phone);
  if (existingIdx >= 0) {
    leads[existingIdx] = {
      ...leads[existingIdx],
      ...fullLead,
      cartItems: fullLead.cartItems.length ? fullLead.cartItems : leads[existingIdx].cartItems,
      totalAmount: fullLead.totalAmount || leads[existingIdx].totalAmount,
      updatedAt: now,
    };
  } else {
    leads.unshift(fullLead);
  }

  saveJSON(STORAGE_KEYS.INCOMPLETE, leads);
  notifyStoreUpdated('incomplete');
  return fullLead;
}

export function updateLocalIncompleteOrder(
  id: string,
  updates: Partial<IncompleteOrder>
): boolean {
  const leads = getLocalIncompleteOrders();
  const target = leads.find((l) => l.id === id);
  if (target) {
    Object.assign(target, updates, { updatedAt: new Date().toISOString() });
    saveJSON(STORAGE_KEYS.INCOMPLETE, leads);
    notifyStoreUpdated('incomplete');
    return true;
  }
  return false;
}

export function deleteLocalIncompleteOrder(id: string): boolean {
  const leads = getLocalIncompleteOrders();
  const filtered = leads.filter((l) => l.id !== id);
  saveJSON(STORAGE_KEYS.INCOMPLETE, filtered);
  notifyStoreUpdated('incomplete');
  return true;
}

// ============================================================================
// 8. SITE SETTINGS
// ============================================================================

export function getLocalSettings(): SiteSettings {
  return loadJSON<SiteSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function saveLocalSettings(settings: SiteSettings): void {
  saveJSON(STORAGE_KEYS.SETTINGS, settings);
  notifyStoreUpdated('settings');
}
