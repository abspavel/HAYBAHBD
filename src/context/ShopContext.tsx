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
import {
  saveLocalOrder,
  saveLocalIncompleteOrder,
} from '../services/localAdminStore';
import { supabase } from '../lib/supabase';
import { parseProductFromUrl, getProductSlug } from '../utils/urlHelper';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning';
}

interface HistoryEntry {
  view: ViewType;
  scrollY: number;
  category?: string | null;
  product?: Product | null;
  search?: string;
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
  setCategories: React.Dispatch<React.SetStateAction<CategoryItem[]>>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setHeroBanners: React.Dispatch<React.SetStateAction<HeroBanner[]>>;

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
  goBack: () => void;
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

  // Check URL pathname for /admin, /checkout, /cart, /product/:id, /p/:id, etc.
  const [currentView, setCurrentView] = useState<ViewType>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path === '/admin' || path.startsWith('/admin/')) {
        return 'admin';
      }
      if (path === '/checkout') {
        return 'checkout';
      }
      if (path === '/cart') {
        return 'cart';
      }
      if (path === '/thank-you') {
        return 'thank-you';
      }
      if (path === '/wishlist') {
        return 'wishlist';
      }
      if (path === '/shop') {
        return 'shop';
      }
      if (path.startsWith('/product/') || path.startsWith('/p/')) {
        return 'product-detail';
      }
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get('product') || params.get('p')) {
          return 'product-detail';
        }
      } catch {}
    }
    return 'home';
  });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => {
    if (typeof window !== 'undefined') {
      return parseProductFromUrl(ALL_PRODUCTS);
    }
    return null;
  });
  const [searchQuery, setSearchQuery] = useState('');

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isTrackOrderModalOpen, setIsTrackOrderModalOpen] = useState(false);
  const [activeOrderConfirmation, setActiveOrderConfirmation] = useState<OrderDetails | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Navigation History Stack & Scroll Memory for flawless back restoration
  const navHistoryRef = React.useRef<HistoryEntry[]>([]);
  const scrollPositionsRef = React.useRef<Record<string, number>>({});

  // Live Supabase Storefront Data - Instant load from cached state
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem('haybah_admin_products');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return ALL_PRODUCTS;
  });

  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    try {
      const cached = localStorage.getItem('haybah_admin_categories');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return CATEGORIES;
  });

  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>(() => {
    try {
      const cached = localStorage.getItem('haybah_admin_banners');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    try {
      const cached = localStorage.getItem('haybah_admin_settings');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.brandName) return parsed;
      }
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const [loadingStoreData, setLoadingStoreData] = useState(false);

  // Fetch live storefront data from Supabase
  const refreshStoreData = useCallback(async () => {
    try {
      const [liveProds, liveCats, liveBanners, liveSettings] = await Promise.all([
        fetchLiveProducts(),
        fetchLiveCategories(),
        fetchLiveHeroBanners(),
        fetchLiveSiteSettings(),
      ]);

      if (Array.isArray(liveProds) && liveProds.length > 0) {
        setProducts(liveProds);
        try {
          localStorage.setItem('haybah_admin_products', JSON.stringify(liveProds));
        } catch {}

        // If URL currently points to a product link, resolve product from liveProds
        if (typeof window !== 'undefined') {
          const matched = parseProductFromUrl(liveProds);
          if (matched) {
            setSelectedProduct(matched);
          }
        }
      }
      if (Array.isArray(liveCats) && liveCats.length > 0) {
        setCategories(liveCats);
        try {
          localStorage.setItem('haybah_admin_categories', JSON.stringify(liveCats));
        } catch {}
      }
      if (Array.isArray(liveBanners) && liveBanners.length > 0) {
        setHeroBanners(liveBanners);
        try {
          localStorage.setItem('haybah_admin_banners', JSON.stringify(liveBanners));
        } catch {}
      }
      if (liveSettings) {
        setSiteSettings(liveSettings);
        try {
          localStorage.setItem('haybah_admin_settings', JSON.stringify(liveSettings));
        } catch {}
      }
    } catch (e) {
      console.warn('Storefront data sync warning:', e);
    } finally {
      setLoadingStoreData(false);
    }
  }, []);

  useEffect(() => {
    refreshStoreData();

    // Supabase Realtime Subscription for cross-device live sync:
    // When ANY device adds, edits, or deletes banners, categories, products, or settings,
    // all connected devices receive the postgres change and update immediately.
    const realtimeChannel = supabase
      .channel('storefront-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hero_banners' }, () => {
        refreshStoreData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        refreshStoreData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        refreshStoreData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, () => {
        refreshStoreData();
      })
      .subscribe();

    // Polling interval (every 10 seconds) as reliable heartbeat sync across devices
    const pollTimer = setInterval(() => {
      refreshStoreData();
    }, 10000);

    // Sync immediately when device window / browser tab gains focus or wakes up
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshStoreData();
      }
    };

    // Instant local broadcast handler across admin and storefront
    const handleLocalStoreUpdated = () => {
      try {
        const cp = localStorage.getItem('haybah_admin_products');
        if (cp) setProducts(JSON.parse(cp));
        const cc = localStorage.getItem('haybah_admin_categories');
        if (cc) setCategories(JSON.parse(cc));
        const cb = localStorage.getItem('haybah_admin_banners');
        if (cb) setHeroBanners(JSON.parse(cb));
        const cs = localStorage.getItem('haybah_admin_settings');
        if (cs) setSiteSettings(JSON.parse(cs));
      } catch {}
      refreshStoreData();
    };

    window.addEventListener('haybah:store-updated', handleLocalStoreUpdated);
    window.addEventListener('focus', refreshStoreData);
    document.addEventListener('visibilitychange', handleVisibility);

    // Listen to browser forward/back buttons & URL changes
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path === '/admin' || path.startsWith('/admin/')) {
        setCurrentView('admin');
      } else if (path === '/checkout') {
        setCurrentView('checkout');
      } else if (path === '/cart') {
        setCurrentView('cart');
      } else if (path === '/thank-you') {
        setCurrentView('thank-you');
      } else if (path.startsWith('/product/') || path.startsWith('/p/')) {
        const prod = parseProductFromUrl(products);
        if (prod) {
          setSelectedProduct(prod);
          setCurrentView('product-detail');
        }
      } else {
        const last = navHistoryRef.current.pop();
        const targetView = last?.view || (path === '/shop' ? 'shop' : 'home');
        const targetScroll = last?.scrollY ?? (scrollPositionsRef.current[targetView] || 0);

        if (last?.category !== undefined) {
          setSelectedCategory(last.category);
        }

        setCurrentView(targetView);
        requestAnimationFrame(() => {
          window.scrollTo({ top: targetScroll, left: 0, behavior: 'instant' });
          setTimeout(() => {
            window.scrollTo({ top: targetScroll, left: 0, behavior: 'instant' });
          }, 30);
        });
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      supabase.removeChannel(realtimeChannel);
      clearInterval(pollTimer);
      window.removeEventListener('haybah:store-updated', handleLocalStoreUpdated);
      window.removeEventListener('focus', refreshStoreData);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [refreshStoreData, products]);

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

    // 1. Immediately save to local admin store
    saveLocalIncompleteOrder({
      phone: data.phone,
      customerName: data.name,
      address: data.address,
      city: data.city,
      district: data.district,
      thana: data.thana,
      cartItems: cart,
      totalAmount: total,
    });

    // 2. Remote sync
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
        ? siteSettings.shippingOutsideDhaka || 130
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

    // 1. Immediately persist to local admin orders and customer list
    saveLocalOrder(newOrder);

    // 2. Update context state
    setOrders((prev) => [newOrder, ...prev]);
    setActiveOrderConfirmation(newOrder);
    clearCart();
    setIsCartOpen(false);
    setCurrentView('thank-you');
    window.history.pushState({}, '', '/thank-you');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    return newOrder;
  };

  const navigateTo = (
    view: ViewType,
    params?: { category?: string; product?: Product; search?: string }
  ) => {
    // Record current scroll position before leaving view
    if (typeof window !== 'undefined') {
      const currentScroll = window.scrollY;
      scrollPositionsRef.current[currentView] = currentScroll;
      if (currentView !== view) {
        navHistoryRef.current.push({
          view: currentView,
          scrollY: currentScroll,
          category: selectedCategory,
          product: selectedProduct,
          search: searchQuery,
        });
        if (navHistoryRef.current.length > 25) {
          navHistoryRef.current.shift();
        }
      }
    }

    if (params?.category !== undefined) {
      setSelectedCategory(params.category);
    }
    if (params?.product) {
      setSelectedProduct(params.product);
    }
    if (params?.search !== undefined) {
      setSearchQuery(params.search);
    }

    // When navigating to checkout, clear any previous order confirmation so checkout form shows
    if (view === 'checkout') {
      setActiveOrderConfirmation(null);
    }

    if (view === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else if (view === 'product-detail' && params?.product) {
      const shortId = getProductSlug(params.product);
      window.history.pushState({}, '', `/p/${encodeURIComponent(shortId)}`);
    } else if (view === 'home') {
      window.history.pushState({}, '', '/');
    } else if (view === 'shop') {
      window.history.pushState({}, '', '/shop');
    } else if (view === 'checkout') {
      window.history.pushState({}, '', '/checkout');
    } else if (view === 'cart') {
      window.history.pushState({}, '', '/cart');
    } else if (view === 'thank-you') {
      window.history.pushState({}, '', '/thank-you');
    } else if (view === 'wishlist') {
      window.history.pushState({}, '', '/wishlist');
    } else if (view === 'account') {
      window.history.pushState({}, '', '/account');
    } else if (view === 'track-order') {
      window.history.pushState({}, '', '/track-order');
    }

    setCurrentView(view);
    // Instant scroll to top on fresh forward navigation
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const goBack = () => {
    const last = navHistoryRef.current.pop();
    const targetView: ViewType = last?.view || 'home';
    const targetScrollY = last?.scrollY ?? (scrollPositionsRef.current[targetView] || 0);

    if (last?.category !== undefined) {
      setSelectedCategory(last.category);
    }
    if (last?.search !== undefined) {
      setSearchQuery(last.search);
    }
    if (targetView === 'product-detail' && last?.product) {
      setSelectedProduct(last.product);
    }

    if (targetView === 'home') {
      window.history.pushState({}, '', '/');
    } else if (targetView === 'shop') {
      window.history.pushState({}, '', '/shop');
    } else if (targetView === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else if (targetView === 'product-detail' && last?.product) {
      const shortId = getProductSlug(last.product);
      window.history.pushState({}, '', `/p/${encodeURIComponent(shortId)}`);
    } else {
      window.history.pushState({}, '', '/');
    }

    setCurrentView(targetView);

    // Instant seamless scroll restoration directly to where user was
    requestAnimationFrame(() => {
      window.scrollTo({ top: targetScrollY, left: 0, behavior: 'instant' });
      setTimeout(() => {
        window.scrollTo({ top: targetScrollY, left: 0, behavior: 'instant' });
      }, 30);
    });
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
        setCategories,
        setProducts,
        setHeroBanners,
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
        goBack,
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
