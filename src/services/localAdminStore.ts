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

// Default banners fallback - Empty baseline, populated only by live uploaded banners
export const DEFAULT_BANNERS: HeroBanner[] = [];

// One-time automatic purge of demo orders, customers, and outdated demo banners
const DEMO_PURGE_KEY = 'haybah_demo_data_purged_final_v3';
if (typeof window !== 'undefined') {
  try {
    if (!localStorage.getItem(DEMO_PURGE_KEY)) {
      localStorage.removeItem('haybah_orders');
      localStorage.removeItem('haybah_admin_customers');
      localStorage.removeItem('haybah_admin_incomplete_orders');
      const rawB = localStorage.getItem('haybah_admin_banners');
      if (rawB && (rawB.includes('photo-1509631179647') || rawB.includes('banner-1'))) {
        localStorage.removeItem('haybah_admin_banners');
      }
      localStorage.setItem(DEMO_PURGE_KEY, 'true');
    }
  } catch {}
}

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
    const cleaned = existing.filter(
      (b) =>
        !b.image?.includes('photo-1509631179647') &&
        !b.image?.includes('photo-1483985988355') &&
        !b.image?.includes('photo-1523381294911') &&
        b.title !== 'URBAN EVOLUTION 2026' &&
        b.title !== 'HEAVYWEIGHT HOODIES' &&
        b.title !== 'Y2K MOTOR JERSEYS'
    );
    if (cleaned.length !== existing.length) {
      saveJSON(STORAGE_KEYS.BANNERS, cleaned);
    }
    return cleaned;
  }
  return [];
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
// 5. ORDERS (Empty baseline - only real orders from live site)
// ============================================================================

export const INITIAL_ORDERS: OrderDetails[] = [];

// Demo order IDs to purge
const DEMO_ORDER_IDS = new Set([
  'HYB-849201',
  'HYB-793412',
  'HYB-652190',
  'HYB-581044',
  'HYB-492110',
]);

export function getLocalOrders(): OrderDetails[] {
  const stored = loadJSON<OrderDetails[] | null>(STORAGE_KEYS.ORDERS, null);
  if (stored && Array.isArray(stored)) {
    // Purge any remaining demo seed orders
    const cleaned = stored.filter((o) => !DEMO_ORDER_IDS.has(o.orderId));
    if (cleaned.length !== stored.length) {
      saveJSON(STORAGE_KEYS.ORDERS, cleaned);
    }
    return cleaned;
  }
  return [];
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
// 6. CUSTOMERS (Only real customers from orders or user registrations)
// ============================================================================

const DEMO_CUSTOMER_PHONES = new Set([
  '01712-345678',
  '01819-876543',
  '01911-223344',
  '01623-998877',
  '01552-667788',
]);

export function getLocalCustomers(): Customer[] {
  const stored = loadJSON<Customer[] | null>(STORAGE_KEYS.CUSTOMERS, null);
  if (stored && Array.isArray(stored)) {
    const cleaned = stored.filter(
      (c) =>
        !DEMO_CUSTOMER_PHONES.has(c.phone) &&
        !c.name.includes('Md. Tanvir Hossain') &&
        !c.name.includes('Farhan Ahmed') &&
        !c.name.includes('Rahim Khan') &&
        !c.name.includes('Sabbir Chowdhury') &&
        !c.name.includes('Nafis Iqbal')
    );
    if (cleaned.length !== stored.length) {
      saveJSON(STORAGE_KEYS.CUSTOMERS, cleaned);
    }
    return cleaned;
  }

  // Synthesize customers from REAL orders only
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

export function deleteLocalCustomer(customerId: string): boolean {
  const customers = getLocalCustomers();
  const filtered = customers.filter((c) => c.id !== customerId && c.phone !== customerId);
  saveJSON(STORAGE_KEYS.CUSTOMERS, filtered);
  notifyStoreUpdated('customers');
  return true;
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
// 7. INCOMPLETE ORDERS (Leads - empty baseline)
// ============================================================================

export const INITIAL_INCOMPLETE_ORDERS: IncompleteOrder[] = [];

const DEMO_INCOMPLETE_IDS = new Set(['inc-101', 'inc-102']);

export function getLocalIncompleteOrders(): IncompleteOrder[] {
  const stored = loadJSON<IncompleteOrder[] | null>(STORAGE_KEYS.INCOMPLETE, null);
  if (stored && Array.isArray(stored)) {
    const cleaned = stored.filter((i) => !DEMO_INCOMPLETE_IDS.has(i.id));
    if (cleaned.length !== stored.length) {
      saveJSON(STORAGE_KEYS.INCOMPLETE, cleaned);
    }
    return cleaned;
  }
  return [];
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

// ============================================================================
// 9. CUSTOMER ACCOUNTS & AUTHENTICATION
// ============================================================================

export interface CustomerAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  address?: string;
  district?: string;
  thana?: string;
  city?: string;
  createdAt: string;
}

const CUSTOMER_ACCOUNTS_KEY = 'haybah_registered_customers';
const CUSTOMER_SESSION_KEY = 'haybah_active_customer_session';

export function getRegisteredCustomers(): CustomerAccount[] {
  return loadJSON<CustomerAccount[]>(CUSTOMER_ACCOUNTS_KEY, []);
}

export function saveRegisteredCustomer(account: CustomerAccount): CustomerAccount {
  const accounts = getRegisteredCustomers();
  const existingIdx = accounts.findIndex(
    (a) =>
      a.id === account.id ||
      (account.email && a.email.toLowerCase() === account.email.toLowerCase()) ||
      (account.phone && a.phone.replace(/[^0-9]/g, '') === account.phone.replace(/[^0-9]/g, ''))
  );

  if (existingIdx >= 0) {
    accounts[existingIdx] = { ...accounts[existingIdx], ...account };
  } else {
    accounts.unshift(account);
  }

  saveJSON(CUSTOMER_ACCOUNTS_KEY, accounts);
  return account;
}

export function findCustomerByCredentials(
  identifier: string,
  pass: string
): CustomerAccount | null {
  const accounts = getRegisteredCustomers();
  const cleanId = identifier.trim().toLowerCase();
  const cleanDigits = identifier.replace(/[^0-9]/g, '');

  const matched = accounts.find((a) => {
    const emailMatch = a.email && a.email.toLowerCase() === cleanId;
    const phoneMatch = a.phone && cleanDigits && a.phone.replace(/[^0-9]/g, '').endsWith(cleanDigits.slice(-10));
    return (emailMatch || phoneMatch) && a.password === pass;
  });

  return matched || null;
}

export function getActiveCustomerSession(): CustomerAccount | null {
  return loadJSON<CustomerAccount | null>(CUSTOMER_SESSION_KEY, null);
}

export function setActiveCustomerSession(account: CustomerAccount | null): void {
  if (account) {
    saveJSON(CUSTOMER_SESSION_KEY, account);
  } else {
    localStorage.removeItem(CUSTOMER_SESSION_KEY);
  }
}

