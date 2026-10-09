-- ============================================================================
-- HAYBAH E-COMMERCE & ADMIN SYSTEM - PART 1 OF 3
-- DATABASE TABLES, INDEXES, STORAGE BUCKETS & REALTIME SETUP
-- Target Supabase Project: iuvgammnubrarjyenbxi (https://iuvgammnubrarjyenbxi.supabase.co)
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM (
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'returned'
    );
  END IF;
END$$;

-- 3. TABLES

-- A. ADMINS TABLE
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- B. SITE SETTINGS TABLE (Single configuration record)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  brand_name TEXT NOT NULL DEFAULT 'HAYBAH',
  helpline TEXT NOT NULL DEFAULT '+880 1642-247530',
  helpline_hours TEXT NOT NULL DEFAULT '(11:00 AM – 08:00 PM)',
  email TEXT NOT NULL DEFAULT 'haybahclothing1@gmail.com',
  whatsapp TEXT NOT NULL DEFAULT '+8801642247530',
  marquee_text TEXT NOT NULL DEFAULT 'FREE SHIPPING ON ORDERS OVER ৳2000! | CASH ON DELIVERY AVAILABLE ALL OVER BANGLADESH | 7-DAY EXCHANGE POLICY',
  shipping_inside_dhaka NUMERIC NOT NULL DEFAULT 80,
  shipping_outside_dhaka NUMERIC NOT NULL DEFAULT 120,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT single_row_check CHECK (id = 1)
);

-- C. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  image TEXT NOT NULL,
  badge TEXT DEFAULT '',
  item_count INTEGER DEFAULT 2,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active);

-- D. HERO BANNERS TABLE
CREATE TABLE IF NOT EXISTS public.hero_banners (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  badge TEXT DEFAULT '',
  tagline TEXT DEFAULT '',
  action_text TEXT DEFAULT 'EXPLORE COLLECTION',
  action_link TEXT DEFAULT 'shop',
  category_slug TEXT DEFAULT '',
  image TEXT DEFAULT '',
  bg_color TEXT DEFAULT 'from-[#06201A] via-[#0B2B22] to-[#041511]',
  accent_color TEXT DEFAULT '#D4AF37',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_banners_active ON public.hero_banners(is_active);

-- E. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price >= 0),
  original_price NUMERIC,
  discount_percent INTEGER DEFAULT 0,
  is_hot BOOLEAN DEFAULT FALSE,
  is_flash_sale BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_new_arrival BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  rating NUMERIC DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 12,
  image TEXT NOT NULL,
  gallery TEXT[] DEFAULT '{}',
  description TEXT DEFAULT '',
  short_description TEXT DEFAULT '',
  details TEXT DEFAULT '',
  sizes TEXT[] DEFAULT '{"M", "L", "XL", "XXL"}',
  colors TEXT[] DEFAULT '{}',
  fabric TEXT DEFAULT '',
  gsm INTEGER,
  fit TEXT DEFAULT '',
  sku TEXT DEFAULT '',
  in_stock BOOLEAN DEFAULT TRUE,
  stock_quantity INTEGER DEFAULT 50 CHECK (stock_quantity >= 0),
  tag TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_slug);
CREATE INDEX IF NOT EXISTS idx_products_flags ON public.products(is_active, is_flash_sale, is_featured, is_new_arrival);

-- F. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT 'Inside Dhaka',
  district TEXT DEFAULT '',
  thana TEXT DEFAULT '',
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  last_order_date TIMESTAMPTZ,
  is_blocked BOOLEAN DEFAULT FALSE,
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);

-- G. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'percent',
  value NUMERIC NOT NULL CHECK (value > 0),
  min_order NUMERIC DEFAULT 0,
  max_discount NUMERIC DEFAULT 0,
  usage_limit INTEGER DEFAULT 100,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);

-- H. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  district TEXT DEFAULT '',
  thana TEXT DEFAULT '',
  city TEXT NOT NULL DEFAULT 'Inside Dhaka',
  payment_method TEXT NOT NULL DEFAULT 'Cash on Delivery',
  subtotal NUMERIC NOT NULL,
  delivery_fee NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT DEFAULT '',
  coupon_code TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

-- I. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT DEFAULT '',
  selected_size TEXT NOT NULL DEFAULT 'L',
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- J. INCOMPLETE ORDERS TABLE (Cart Abandonment Leads)
CREATE TABLE IF NOT EXISTS public.incomplete_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  customer_name TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  district TEXT DEFAULT '',
  thana TEXT DEFAULT '',
  cart_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  call_count INTEGER DEFAULT 0,
  last_call_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_incomplete_orders_phone ON public.incomplete_orders(phone);
CREATE INDEX IF NOT EXISTS idx_incomplete_orders_status ON public.incomplete_orders(status);

-- 4. STORAGE BUCKETS (Public Media Buckets)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('banners', 'banners', TRUE),
  ('categories', 'categories', TRUE),
  ('products', 'products', TRUE)
ON CONFLICT (id) DO UPDATE SET public = TRUE;

-- 5. REALTIME REPLICATION SETUP
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'incomplete_orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.incomplete_orders;
  END IF;
END$$;
