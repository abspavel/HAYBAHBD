export interface Product {
  id: string;
  name: string;
  slug?: string;
  category: string;
  categorySlug?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  isHot?: boolean;
  isFlashSale?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isActive?: boolean;
  rating: number;
  reviewsCount: number;
  image: string;
  gallery?: string[];
  description: string;
  shortDescription?: string;
  details?: string;
  sizes: string[];
  colors?: string[];
  fabric?: string;
  gsm?: number;
  fit?: string;
  sku: string;
  inStock: boolean;
  stockQuantity?: number;
  tag?: string;
  sortOrder?: number;
  createdAt?: string;
}

export interface CartItem {
  id: string; // unique cart item id (product id + size)
  productId: string;
  product: Product;
  selectedSize: string;
  selectedColor?: string;
  quantity: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  image: string;
  badge?: string;
  itemCount: number;
  sortOrder?: number;
  isActive?: boolean;
  createdAt?: string;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  tagline: string;
  actionText: string;
  actionLink: string;
  categorySlug?: string;
  image?: string;
  bgColor?: string;
  accentColor?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
}

export interface Testimonial {
  id: string;
  rating: number;
  text: string;
  name: string;
  city: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string;
  productName: string;
  productImage?: string;
  selectedSize: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderDetails {
  orderId: string;
  customerName: string;
  phone: string;
  address: string;
  district: string;
  thana: string;
  city: 'Inside Dhaka' | 'Outside Dhaka' | string;
  paymentMethod: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: OrderStatus | string;
  notes?: string;
  couponCode?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Customer {
  id: string;
  phone: string;
  name: string;
  email?: string;
  address?: string;
  city?: string;
  district?: string;
  thana?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  isBlocked: boolean;
  adminNotes?: string;
  createdAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrder: number;
  maxDiscount: number;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
}

export type IncompleteOrderStatus =
  | 'new'
  | 'called'
  | 'no_answer'
  | 'interested'
  | 'converted'
  | 'cancelled';

export interface IncompleteOrder {
  id: string;
  phone: string;
  customerName: string;
  address?: string;
  city?: string;
  district?: string;
  thana?: string;
  cartItems: any[];
  totalAmount: number;
  callCount: number;
  lastCallAt?: string;
  status: IncompleteOrderStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SiteSettings {
  brandName: string;
  helpline: string;
  helplineHours: string;
  email: string;
  whatsapp: string;
  marqueeText: string;
  shippingInsideDhaka: number;
  shippingOutsideDhaka: number;
}

export type ViewType =
  | 'home'
  | 'shop'
  | 'category'
  | 'flash-sale'
  | 'featured'
  | 'new-arrival'
  | 'product-detail'
  | 'wishlist'
  | 'account'
  | 'cart'
  | 'checkout'
  | 'about-us'
  | 'contact-us'
  | 'our-story'
  | 'blog'
  | 'track-order'
  | 'faqs'
  | 'how-to-order'
  | 'privacy-policy'
  | 'terms'
  | 'returns-refund'
  | 'delivery-info'
  | 'thank-you'
  | 'admin'
  | 'admin-login';
