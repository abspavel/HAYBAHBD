import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  CartItem,
  CategoryItem,
  HeroBanner,
  SiteSettings,
  OrderDetails,
  ViewType,
} from '../types';
import { ALL_PRODUCTS, CATEGORIES } from '../data/mockData';
import {
  fetchLiveProducts,
  fetchLiveCategories,
  fetchLiveHeroBanners,
  fetchLiveSiteSettings,
  rpcPlaceOrder,
  rpcCheckCoupon,
  rpcSaveIncompleteOrder,
  DEFAULT_BANNERS,
  DEFAULT_SETTINGS,
} from '../services/supabaseService';
import { supabase } from '../lib/supabase';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning';
}

interface ShopContextType {
  cart: CartItem[];
  wishlist: string[];
  orders: OrderDetails[];
  currentView: ViewType;
  selectedCategory: string | null;
  selectedProduct: Product | null;
  searchQuery: string;
  isCartOpen: boolean;
  isSideMenuOpen: boolean;
  isLocationModalOpen: boolean;
  isTrackOrderModalOpen: boolean;
  activeOrderConfirmation: OrderDetails | null;
  toasts: Toast[];

  // Live Supabase Storefront Data
  products: Product[];
  categories: CategoryItem[];
  heroBanners: HeroBanner[];
  siteSettings: SiteSettings;
  loadingStoreData: boolean;
  refreshStoreData: () => Promise<void>;

  // Actions
  setSearchQuery: (query: string) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsSideMenuOpen: (open: boolean) => void;
  setIsLocationModalOpen: (open: boolean) => void;
  setIsTrackOrderModalOpen: (open: boolean) => void;
  setActiveOrderConfirmation: (order: OrderDetails | null) => void;

  addToCart: (product: Product, size?: string, quantity?: number) => boolean;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => { subtotal: number; deliveryFee: number; total: number; itemCount: number };

  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  placeOrder: (formData: {
    customerName: string;
    phone: string;
    address: string;
    district: string;
    thana: string;
    city: 'Inside Dhaka' | 'Outside Dhaka' | string;
    couponCode?: string;
    discount?: number;
    notes?: string;
  }) => Promise<OrderDetails>;

  checkCoupon: (code: string) => Promise<{ valid: boolean; discount: number; message: string }>;
  trackIncompleteOrder: (data: {
    name: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    thana: string;
  }) => void;

  navigateTo: (
    view: ViewType,
    params?: { category?: string; product?: Product; search?: string }
  ) => void;
  showToast: (message: string, type?: 'success' | 'info') => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved state from localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('haybah_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('haybah_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<OrderDetails[]>(() => {
    try {
      const saved = localStorage.getItem('haybah_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Check URL pathname for /admin or /admin/login
  const [currentView, setCurrentView] = useState<ViewType>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path === '/admin' || path.startsWith('/admin/')) {
        return 'admin';
      }
    }
    return 'home';
  });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isTrackOrderModalOpen, setIsTrackOrderModalOpen] = useState(false);
  const [activeOrderConfirmation, setActiveOrderConfirmation] = useState<OrderDetails | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Live Supabase Storefront Data
  const [products, setProducts] = useState<Product[]>(ALL_PRODUCTS);
  const [categories, setCategories] = useState<CategoryItem[]>(CATEGORIES);
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>(DEFAULT_BANNERS);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loadingStoreData, setLoadingStoreData] = useState(true);

  // Fetch live storefront data from Supabase
  const refreshStoreData = useCallback(async () => {
    setLoadingStoreData(true);
    try {
      const [liveProds, liveCats, liveBanners, liveSettings] = await Promise.all([
        fetchLiveProducts(),
        fetchLiveCategories(),
        fetchLiveHeroBanners(),
        fetchLiveSiteSettings(),
      ]);

      if (liveProds && liveProds.length > 0) setProducts(liveProds);
      if (liveCats && liveCats.length > 0) setCategories(liveCats);
      if (liveBanners && liveBanners.length > 0) setHeroBanners(liveBanners);
      if (liveSettings) setSiteSettings(liveSettings);
    } catch (e) {
      console.warn('Storefront data sync warning:', e);
    } finally {
      setLoadingStoreData(false);
    }
  }, []);

  useEffect(() => {
    refreshStoreData();

    // Listen to browser forward/back buttons
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path === '/admin' || path.startsWith('/admin/')) {
        setCurrentView('admin');
      } else if (path === '/' || path === '') {
        setCurrentView('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [refreshStoreData]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('haybah_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('haybah_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem('haybah_orders', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  const addToCart = (product: Product, size = 'L', quantity = 1): boolean => {
    // Check out of stock guard
    if (!product.inStock || (product.stockQuantity !== undefined && product.stockQuantity <= 0)) {
      showToast(`${product.name} is currently out of stock.`, 'info');
      return false;
    }

    const defaultSize = size || product.sizes[0] || 'Regular';
    const cartItemId = `${product.id}-${defaultSize}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          id: cartItemId,
          productId: product.id,
          product,
          selectedSize: defaultSize,
          quantity,
        },
      ];
    });

    showToast(`Added ${product.name} (${defaultSize}) to cart!`);
    return true;
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    showToast('Item removed from cart', 'info');
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    // Free delivery over ৳2000
    const deliveryFee =
      subtotal > 2000 || subtotal === 0 ? 0 : siteSettings.shippingInsideDhaka || 80;
    const total = subtotal + deliveryFee;

    return { subtotal, deliveryFee, total, itemCount };
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from Wishlist', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Added to Wishlist! ❤️');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Check coupon via RPC check_coupon
  const checkCoupon = async (code: string) => {
    const { subtotal } = getCartTotal();
    return await rpcCheckCoupon(code, subtotal);
  };

  // Debounced / blur trigger to track incomplete order
  const trackIncompleteOrder = (data: {
    name: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    thana: string;
  }) => {
    if (!data.phone || cart.length === 0) return;
    const { total } = getCartTotal();
    rpcSaveIncompleteOrder({
      ...data,
      items: cart,
      total,
    });
  };

  // Place order via RPC place_order and save
  const placeOrder = async (formData: {
    customerName: string;
    phone: string;
    address: string;
    district: string;
    thana: string;
    city: 'Inside Dhaka' | 'Outside Dhaka' | string;
    couponCode?: string;
    discount?: number;
    notes?: string;
  }): Promise<OrderDetails> => {
    const { subtotal } = getCartTotal();
    const deliveryFee =
      formData.city === 'Outside Dhaka'
        ? siteSettings.shippingOutsideDhaka || 120
        : siteSettings.shippingInsideDhaka || 80;
    const discount = formData.discount || 0;
    const total = Math.max(0, subtotal - discount) + deliveryFee;

    // Call RPC place_order on Supabase
    const rpcRes = await rpcPlaceOrder({
      customerName: formData.customerName,
      phone: formData.phone,
      address: formData.address,
      district: formData.district,
      thana: formData.thana,
      city: formData.city,
      items: cart,
      subtotal,
      deliveryFee,
      discount,
      total,
      couponCode: formData.couponCode,
      notes: formData.notes,
    });

    const orderId = rpcRes?.orderNumber || `HYB-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: OrderDetails = {
      orderId,
      customerName: formData.customerName,
      phone: formData.phone,
      address: formData.address,
      district: formData.district,
      thana: formData.thana,
      city: formData.city,
      paymentMethod: 'Cash on Delivery',
      items: [...cart],
      subtotal,
      deliveryFee,
      discount,
      total,
      status: 'pending',
      couponCode: formData.couponCode,
      notes: formData.notes,
      createdAt: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setActiveOrderConfirmation(newOrder);
    clearCart();
    setIsCartOpen(false);
    setCurrentView('thank-you');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    return newOrder;
  };

  const navigateTo = (
    view: ViewType,
    params?: { category?: string; product?: Product; search?: string }
  ) => {
    if (params?.category) {
      setSelectedCategory(params.category);
    }
    if (params?.product) {
      setSelectedProduct(params.product);
    }
    if (params?.search !== undefined) {
      setSearchQuery(params.search);
    }

    if (view === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else if (view === 'home') {
      if (window.location.pathname.startsWith('/admin')) {
        window.history.pushState({}, '', '/');
      }
    }

    setCurrentView(view);
    // Instant scroll to top without scroll animation
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  return (
    <ShopContext.Provider
      value={{
        cart,
        wishlist,
        orders,
        currentView,
        selectedCategory,
        selectedProduct,
        searchQuery,
        isCartOpen,
        isSideMenuOpen,
        isLocationModalOpen,
        isTrackOrderModalOpen,
        activeOrderConfirmation,
        toasts,
        products,
        categories,
        heroBanners,
        siteSettings,
        loadingStoreData,
        refreshStoreData,
        setSearchQuery,
        setIsCartOpen,
        setIsSideMenuOpen,
        setIsLocationModalOpen,
        setIsTrackOrderModalOpen,
        setActiveOrderConfirmation,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getCartTotal,
        toggleWishlist,
        isInWishlist,
        placeOrder,
        checkCoupon,
        trackIncompleteOrder,
        navigateTo,
        showToast,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within ShopProvider');
  return context;
};
