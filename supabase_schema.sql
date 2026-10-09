-- ============================================================================
-- HAYBAH E-COMMERCE & ADMIN CONSOLE - COMPLETE SUPABASE SQL SCHEMA
-- Target Database: iuvgammnubrarjyenbxi (https://iuvgammnubrarjyenbxi.supabase.co)
-- Brand: HAYBAH (Strictly no "Clothing")
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
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- B. SITE SETTINGS TABLE (Single row configuration)
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
  type TEXT NOT NULL DEFAULT 'percent', -- 'percent' or 'fixed'
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

-- J. INCOMPLETE ORDERS TABLE (Cart Drops / Abandoned Checkout)
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
  status TEXT NOT NULL DEFAULT 'new', -- 'new', 'called', 'no_answer', 'interested', 'converted', 'cancelled'
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_incomplete_orders_phone ON public.incomplete_orders(phone);
CREATE INDEX IF NOT EXISTS idx_incomplete_orders_status ON public.incomplete_orders(status);

-- 4. UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['site_settings', 'categories', 'hero_banners', 'products', 'customers', 'coupons', 'orders', 'incomplete_orders']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS tr_%I_updated_at ON public.%I', t, t);
    EXECUTE format('CREATE TRIGGER tr_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()', t, t);
  END LOOP;
END$$;

-- 5. STOCK RESTORE TRIGGER WHEN ORDER IS CANCELLED OR RETURNED
CREATE OR REPLACE FUNCTION public.handle_order_status_stock_restore()
RETURNS TRIGGER AS $$
DECLARE
  v_item RECORD;
BEGIN
  -- If order status transitioned to cancelled or returned, restore product quantities
  IF (OLD.status NOT IN ('cancelled', 'returned') AND NEW.status IN ('cancelled', 'returned')) THEN
    FOR v_item IN SELECT product_id, quantity FROM public.order_items WHERE order_id = NEW.id
    LOOP
      IF v_item.product_id IS NOT NULL THEN
        UPDATE public.products
        SET stock_quantity = stock_quantity + v_item.quantity,
            in_stock = TRUE
        WHERE id = v_item.product_id;
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS tr_orders_stock_restore ON public.orders;
CREATE TRIGGER tr_orders_stock_restore
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_order_status_stock_restore();

-- 6. SECURITY DEFINER RPC FUNCTIONS

-- A. is_admin() FUNCTION
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  -- Check in admins table
  IF EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()) THEN
    RETURN TRUE;
  END IF;
  -- Check matching email
  IF (auth.jwt() ->> 'email') = 'haybahclothing1@gmail.com' THEN
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- B. place_order() RPC (Storefront Checkout)
CREATE OR REPLACE FUNCTION public.place_order(
  p_customer_name TEXT,
  p_phone TEXT,
  p_address TEXT,
  p_district TEXT,
  p_thana TEXT,
  p_city TEXT,
  p_items JSONB,
  p_subtotal NUMERIC,
  p_delivery_fee NUMERIC,
  p_discount NUMERIC,
  p_total NUMERIC,
  p_coupon_code TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_order_id TEXT;
  v_order_number TEXT;
  v_item JSONB;
  v_product_id TEXT;
  v_product_name TEXT;
  v_product_image TEXT;
  v_size TEXT;
  v_qty INTEGER;
  v_price NUMERIC;
BEGIN
  -- 1. Generate Order Number HYB-XXXXXX
  v_order_number := 'HYB-' || LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0');
  v_order_id := v_order_number;

  -- 2. Insert into orders table
  INSERT INTO public.orders (
    id,
    order_number,
    customer_name,
    phone,
    address,
    district,
    thana,
    city,
    payment_method,
    subtotal,
    delivery_fee,
    discount,
    total,
    status,
    notes,
    coupon_code
  ) VALUES (
    v_order_id,
    v_order_number,
    p_customer_name,
    p_phone,
    p_address,
    COALESCE(p_district, ''),
    COALESCE(p_thana, ''),
    p_city,
    'Cash on Delivery',
    p_subtotal,
    p_delivery_fee,
    COALESCE(p_discount, 0),
    p_total,
    'pending',
    COALESCE(p_notes, ''),
    COALESCE(p_coupon_code, '')
  );

  -- 3. Unpack items JSONB and insert into order_items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := COALESCE(v_item->>'productId', v_item->'product'->>'id');
    v_product_name := COALESCE(v_item->'product'->>'name', v_item->>'name', 'Item');
    v_product_image := COALESCE(v_item->'product'->>'image', v_item->>'image', '');
    v_size := COALESCE(v_item->>'selectedSize', 'L');
    v_qty := GREATEST(1, COALESCE((v_item->>'quantity')::INTEGER, 1));
    v_price := COALESCE((v_item->'product'->>'price')::NUMERIC, (v_item->>'price')::NUMERIC, 0);

    INSERT INTO public.order_items (
      order_id,
      product_id,
      product_name,
      product_image,
      selected_size,
      quantity,
      unit_price,
      total_price
    ) VALUES (
      v_order_id,
      v_product_id,
      v_product_name,
      v_product_image,
      v_size,
      v_qty,
      v_price,
      v_price * v_qty
    );

    -- 4. Deduct stock quantity
    IF v_product_id IS NOT NULL THEN
      UPDATE public.products
      SET stock_quantity = GREATEST(0, stock_quantity - v_qty),
          in_stock = (GREATEST(0, stock_quantity - v_qty) > 0)
      WHERE id = v_product_id;
    END IF;
  END LOOP;

  -- 5. Upsert customer profile
  INSERT INTO public.customers (
    phone,
    name,
    address,
    city,
    district,
    thana,
    total_orders,
    total_spent,
    last_order_date
  ) VALUES (
    p_phone,
    p_customer_name,
    p_address,
    p_city,
    COALESCE(p_district, ''),
    COALESCE(p_thana, ''),
    1,
    p_total,
    NOW()
  )
  ON CONFLICT (phone) DO UPDATE
  SET total_orders = public.customers.total_orders + 1,
      total_spent = public.customers.total_spent + EXCLUDED.total_spent,
      last_order_date = NOW(),
      name = EXCLUDED.name,
      address = EXCLUDED.address,
      city = EXCLUDED.city,
      district = EXCLUDED.district,
      thana = EXCLUDED.thana;

  -- 6. Increment coupon used count if used
  IF p_coupon_code IS NOT NULL AND TRIM(p_coupon_code) <> '' THEN
    UPDATE public.coupons
    SET used_count = used_count + 1
    WHERE code = UPPER(TRIM(p_coupon_code));
  END IF;

  -- 7. Mark incomplete order as converted
  UPDATE public.incomplete_orders
  SET status = 'converted',
      updated_at = NOW()
  WHERE phone = p_phone AND status <> 'converted';

  RETURN jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_number,
    'total', p_total
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- C. check_coupon() RPC
CREATE OR REPLACE FUNCTION public.check_coupon(
  p_code TEXT,
  p_subtotal NUMERIC
)
RETURNS JSONB AS $$
DECLARE
  v_coupon RECORD;
  v_discount NUMERIC := 0;
BEGIN
  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE code = UPPER(TRIM(p_code)) AND is_active = TRUE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', FALSE, 'discount', 0, 'message', 'Invalid or inactive coupon code');
  END IF;

  IF v_coupon.end_date IS NOT NULL AND v_coupon.end_date < NOW() THEN
    RETURN jsonb_build_object('valid', FALSE, 'discount', 0, 'message', 'This coupon code has expired');
  END IF;

  IF v_coupon.used_count >= v_coupon.usage_limit THEN
    RETURN jsonb_build_object('valid', FALSE, 'discount', 0, 'message', 'Coupon usage limit has been reached');
  END IF;

  IF p_subtotal < v_coupon.min_order THEN
    RETURN jsonb_build_object('valid', FALSE, 'discount', 0, 'message', 'Minimum order requirement of ৳' || v_coupon.min_order || ' not met');
  END IF;

  -- Calculate discount
  IF v_coupon.type = 'percent' THEN
    v_discount := ROUND(p_subtotal * (v_coupon.value / 100.0));
    IF v_coupon.max_discount > 0 AND v_discount > v_coupon.max_discount THEN
      v_discount := v_coupon.max_discount;
    END IF;
  ELSE
    v_discount := LEAST(v_coupon.value, p_subtotal);
  END IF;

  RETURN jsonb_build_object(
    'valid', TRUE,
    'discount', v_discount,
    'message', 'Coupon applied! ৳' || v_discount || ' discount unlocked.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- D. save_incomplete_order() RPC
CREATE OR REPLACE FUNCTION public.save_incomplete_order(
  p_name TEXT,
  p_phone TEXT,
  p_address TEXT,
  p_city TEXT,
  p_district TEXT,
  p_thana TEXT,
  p_items JSONB,
  p_total NUMERIC
)
RETURNS VOID AS $$
BEGIN
  IF p_phone IS NULL OR TRIM(p_phone) = '' THEN
    RETURN;
  END IF;

  -- Insert or update existing non-converted drop for this phone
  INSERT INTO public.incomplete_orders (
    phone,
    customer_name,
    address,
    city,
    district,
    thana,
    cart_items,
    total_amount,
    status
  ) VALUES (
    TRIM(p_phone),
    COALESCE(p_name, ''),
    COALESCE(p_address, ''),
    COALESCE(p_city, ''),
    COALESCE(p_district, ''),
    COALESCE(p_thana, ''),
    COALESCE(p_items, '[]'::jsonb),
    COALESCE(p_total, 0),
    'new'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- E. track_order() RPC (Public Order Tracking)
CREATE OR REPLACE FUNCTION public.track_order(
  p_query TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_items JSONB;
BEGIN
  SELECT * INTO v_order
  FROM public.orders
  WHERE (order_number = TRIM(p_query) OR phone = TRIM(p_query))
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_agg(
    jsonb_build_object(
      'product_name', product_name,
      'product_image', product_image,
      'size', selected_size,
      'quantity', quantity,
      'total_price', total_price
    )
  ) INTO v_items
  FROM public.order_items
  WHERE order_id = v_order.id;

  RETURN jsonb_build_object(
    'order_number', v_order.order_number,
    'customer_name', v_order.customer_name,
    'status', v_order.status,
    'created_at', v_order.created_at,
    'total', v_order.total,
    'city', v_order.city,
    'items', COALESCE(v_items, '[]'::jsonb)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- F. log_call() RPC (For Incomplete Orders)
CREATE OR REPLACE FUNCTION public.log_call(
  p_incomplete_id UUID,
  p_note TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.incomplete_orders
  SET call_count = call_count + 1,
      last_call_at = NOW(),
      status = CASE WHEN status = 'new' THEN 'called' ELSE status END,
      admin_notes = CASE
        WHEN p_note IS NOT NULL AND TRIM(p_note) <> '' THEN
          COALESCE(admin_notes || E'\n', '') || '[' || TO_CHAR(NOW(), 'DD Mon HH24:MI') || '] ' || p_note
        ELSE admin_notes
      END,
      updated_at = NOW()
  WHERE id = p_incomplete_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- G. convert_incomplete() RPC
CREATE OR REPLACE FUNCTION public.convert_incomplete(
  p_incomplete_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_inc RECORD;
  v_order_id TEXT;
  v_order_number TEXT;
  v_item JSONB;
BEGIN
  SELECT * INTO v_inc
  FROM public.incomplete_orders
  WHERE id = p_incomplete_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Incomplete order record not found');
  END IF;

  v_order_number := 'HYB-' || LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0');
  v_order_id := v_order_number;

  INSERT INTO public.orders (
    id,
    order_number,
    customer_name,
    phone,
    address,
    district,
    thana,
    city,
    payment_method,
    subtotal,
    delivery_fee,
    total,
    status,
    notes
  ) VALUES (
    v_order_id,
    v_order_number,
    COALESCE(NULLIF(v_inc.customer_name, ''), 'Customer (Recovered)'),
    v_inc.phone,
    COALESCE(NULLIF(v_inc.address, ''), 'Phone Order Confirmation'),
    COALESCE(v_inc.district, 'Dhaka'),
    COALESCE(v_inc.thana, 'Dhaka'),
    COALESCE(NULLIF(v_inc.city, ''), 'Inside Dhaka'),
    'Cash on Delivery',
    GREATEST(0, v_inc.total_amount - 80),
    80,
    v_inc.total_amount,
    'confirmed',
    'Recovered via Incomplete Orders phone call'
  );

  -- Insert items
  FOR v_item IN SELECT * FROM jsonb_array_elements(v_inc.cart_items)
  LOOP
    INSERT INTO public.order_items (
      order_id,
      product_id,
      product_name,
      product_image,
      selected_size,
      quantity,
      unit_price,
      total_price
    ) VALUES (
      v_order_id,
      v_item->'product'->>'id',
      COALESCE(v_item->'product'->>'name', 'Item'),
      COALESCE(v_item->'product'->>'image', ''),
      COALESCE(v_item->>'selectedSize', 'L'),
      GREATEST(1, COALESCE((v_item->>'quantity')::INTEGER, 1)),
      COALESCE((v_item->'product'->>'price')::NUMERIC, 0),
      COALESCE((v_item->'product'->>'price')::NUMERIC, 0) * GREATEST(1, COALESCE((v_item->>'quantity')::INTEGER, 1))
    );
  END LOOP;

  -- Mark as converted
  UPDATE public.incomplete_orders
  SET status = 'converted',
      updated_at = NOW()
  WHERE id = p_incomplete_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'order_id', v_order_id,
    'order_number', v_order_number
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- H. admin_dashboard() RPC
CREATE OR REPLACE FUNCTION public.admin_dashboard(p_days INTEGER DEFAULT 30)
RETURNS JSONB AS $$
DECLARE
  v_revenue NUMERIC;
  v_orders_count INTEGER;
  v_pending_count INTEGER;
  v_delivered_count INTEGER;
  v_cancelled_count INTEGER;
  v_customers_count INTEGER;
  v_incomplete_count INTEGER;
  v_low_stock_count INTEGER;
BEGIN
  SELECT COALESCE(SUM(total), 0), COUNT(*)
  INTO v_revenue, v_orders_count
  FROM public.orders
  WHERE created_at >= (NOW() - (p_days || ' days')::INTERVAL)
    AND status NOT IN ('cancelled', 'returned');

  SELECT COUNT(*) INTO v_pending_count FROM public.orders WHERE status IN ('pending', 'Order Placed');
  SELECT COUNT(*) INTO v_delivered_count FROM public.orders WHERE status = 'delivered';
  SELECT COUNT(*) INTO v_cancelled_count FROM public.orders WHERE status IN ('cancelled', 'returned');
  SELECT COUNT(*) INTO v_customers_count FROM public.customers;
  SELECT COUNT(*) INTO v_incomplete_count FROM public.incomplete_orders WHERE status = 'new';
  SELECT COUNT(*) INTO v_low_stock_count FROM public.products WHERE stock_quantity <= 10;

  RETURN jsonb_build_object(
    'revenue', v_revenue,
    'total_orders', v_orders_count,
    'pending_orders', v_pending_count,
    'delivered_orders', v_delivered_count,
    'cancelled_orders', v_cancelled_count,
    'total_customers', v_customers_count,
    'incomplete_leads', v_incomplete_count,
    'low_stock', v_low_stock_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incomplete_orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "admins_full_access" ON public.admins;
DROP POLICY IF EXISTS "public_read_site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "admins_all_site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "public_read_active_categories" ON public.categories;
DROP POLICY IF EXISTS "admins_all_categories" ON public.categories;
DROP POLICY IF EXISTS "public_read_active_banners" ON public.hero_banners;
DROP POLICY IF EXISTS "admins_all_banners" ON public.hero_banners;
DROP POLICY IF EXISTS "public_read_active_products" ON public.products;
DROP POLICY IF EXISTS "admins_all_products" ON public.products;
DROP POLICY IF EXISTS "admins_all_customers" ON public.customers;
DROP POLICY IF EXISTS "admins_all_coupons" ON public.coupons;
DROP POLICY IF EXISTS "admins_all_orders" ON public.orders;
DROP POLICY IF EXISTS "admins_all_order_items" ON public.order_items;
DROP POLICY IF EXISTS "admins_all_incomplete_orders" ON public.incomplete_orders;

-- A. ADMINS table: Only admins can read/write
CREATE POLICY "admins_full_access" ON public.admins
  FOR ALL TO authenticated
  USING (public.is_admin() OR auth.uid() = id);

-- B. SITE_SETTINGS: Public can read, only admin can write
CREATE POLICY "public_read_site_settings" ON public.site_settings
  FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY "admins_all_site_settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.is_admin());

-- C. CATEGORIES: Public can read active categories, admin has full access
CREATE POLICY "public_read_active_categories" ON public.categories
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "admins_all_categories" ON public.categories
  FOR ALL TO authenticated
  USING (public.is_admin());

-- D. HERO BANNERS: Public can read active banners, admin has full access
CREATE POLICY "public_read_active_banners" ON public.hero_banners
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "admins_all_banners" ON public.hero_banners
  FOR ALL TO authenticated
  USING (public.is_admin());

-- E. PRODUCTS: Public can read active products, admin has full access
CREATE POLICY "public_read_active_products" ON public.products
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "admins_all_products" ON public.products
  FOR ALL TO authenticated
  USING (public.is_admin());

-- F. CUSTOMERS: Protected. Only admin can read/write directly (public interacts via place_order RPC)
CREATE POLICY "admins_all_customers" ON public.customers
  FOR ALL TO authenticated
  USING (public.is_admin());

-- G. COUPONS: Protected. Only admin can read/write directly (public interacts via check_coupon RPC)
CREATE POLICY "admins_all_coupons" ON public.coupons
  FOR ALL TO authenticated
  USING (public.is_admin());

-- H. ORDERS: Protected. Only admin can read/write directly (public interacts via place_order / track_order RPCs)
CREATE POLICY "admins_all_orders" ON public.orders
  FOR ALL TO authenticated
  USING (public.is_admin());

-- I. ORDER_ITEMS: Protected. Only admin can read/write directly
CREATE POLICY "admins_all_order_items" ON public.order_items
  FOR ALL TO authenticated
  USING (public.is_admin());

-- J. INCOMPLETE_ORDERS: Protected. Only admin can read/write directly (public writes via save_incomplete_order RPC)
CREATE POLICY "admins_all_incomplete_orders" ON public.incomplete_orders
  FOR ALL TO authenticated
  USING (public.is_admin());

-- 8. STORAGE BUCKETS & POLICIES
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('banners', 'banners', TRUE),
  ('categories', 'categories', TRUE),
  ('products', 'products', TRUE)
ON CONFLICT (id) DO UPDATE SET public = TRUE;

-- Storage Objects Policies
DROP POLICY IF EXISTS "public_read_storage_banners" ON storage.objects;
DROP POLICY IF EXISTS "admin_all_storage_banners" ON storage.objects;
DROP POLICY IF EXISTS "public_read_storage_categories" ON storage.objects;
DROP POLICY IF EXISTS "admin_all_storage_categories" ON storage.objects;
DROP POLICY IF EXISTS "public_read_storage_products" ON storage.objects;
DROP POLICY IF EXISTS "admin_all_storage_products" ON storage.objects;

-- Public can view files in public buckets
CREATE POLICY "public_read_storage_banners" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'banners');

CREATE POLICY "public_read_storage_categories" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'categories');

CREATE POLICY "public_read_storage_products" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'products');

-- Authenticated admins can upload, update, delete
CREATE POLICY "admin_all_storage_banners" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'banners' AND public.is_admin())
  WITH CHECK (bucket_id = 'banners' AND public.is_admin());

CREATE POLICY "admin_all_storage_categories" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'categories' AND public.is_admin())
  WITH CHECK (bucket_id = 'categories' AND public.is_admin());

CREATE POLICY "admin_all_storage_products" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'products' AND public.is_admin())
  WITH CHECK (bucket_id = 'products' AND public.is_admin());

-- 9. SUPABASE REALTIME REPLICATION
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

-- 10. SEED DATA

-- Site Settings
INSERT INTO public.site_settings (
  id,
  brand_name,
  helpline,
  helpline_hours,
  email,
  whatsapp,
  marquee_text,
  shipping_inside_dhaka,
  shipping_outside_dhaka
) VALUES (
  1,
  'HAYBAH',
  '+880 1642-247530',
  '(11:00 AM – 08:00 PM)',
  'haybahclothing1@gmail.com',
  '+8801642247530',
  'FREE SHIPPING ON ORDERS OVER ৳2000! | CASH ON DELIVERY AVAILABLE ALL OVER BANGLADESH | 7-DAY EXCHANGE POLICY',
  80,
  120
)
ON CONFLICT (id) DO NOTHING;

-- Default Coupons
INSERT INTO public.coupons (code, type, value, min_order, max_discount, usage_limit, used_count, is_active)
VALUES ('HAYBAH10', 'percent', 10, 1000, 500, 500, 24, TRUE)
ON CONFLICT (code) DO NOTHING;

-- 16 Signature Categories
INSERT INTO public.categories (id, name, slug, image, badge, item_count, sort_order, is_active)
VALUES
  ('cat-hoodie', 'Premium Hoodie', 'premium-hoodie', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80', 'HEAVYWEIGHT', 3, 1, TRUE),
  ('cat-sweatshirt', 'Premium Sweatshirt', 'premium-sweatshirt', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80', 'FRENCH TERRY', 3, 2, TRUE),
  ('cat-shacket', 'Premium Shacket', 'premium-shacket', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80', 'CORDUROY', 2, 3, TRUE),
  ('cat-jersey', 'Y2K Jersey', 'y2k-jersey', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80', 'RETRO RACING', 3, 4, TRUE),
  ('cat-headshot', 'Headshot Limited ED', 'headshot-limited-ed', 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=800&q=80', 'EXCLUSIVE', 2, 5, TRUE),
  ('cat-prem-drop', 'Premium Drop Shoulders', 'premium-drop-shoulders', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80', 'BOXY FIT', 3, 6, TRUE),
  ('cat-reg-drop', 'Regular Drop Shoulders', 'regular-drop-shoulders', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80', 'STREET CORE', 2, 7, TRUE),
  ('cat-bandana', 'Bandana', 'bandana', 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80', 'PAISLEY SILK', 2, 8, TRUE),
  ('cat-headwear', 'Head Wear', 'head-wear', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80', '5-PANEL CAP', 2, 9, TRUE),
  ('cat-export-headwear', 'Export Premium Head Wear', 'export-premium-head-wear', 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=800&q=80', 'WOOL BEANIE', 2, 10, TRUE),
  ('cat-cargo-pant', 'Baggy Cargo Pant', 'baggy-cargo-pant', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80', '6-POCKET HEAVY', 2, 11, TRUE),
  ('cat-sweatpants', 'Baggy Fitted Sweatpants', 'baggy-fitted-sweatpants', 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=80', 'COZY FLEECE', 2, 12, TRUE),
  ('cat-panjabi', 'Panjabi', 'panjabi', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', 'LUXURY COTTON', 2, 13, TRUE),
  ('cat-abaya', 'Abaya', 'abaya', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80', 'NIDA SILK', 2, 14, TRUE),
  ('cat-hijab', 'Hijab', 'hijab', 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800&q=80', 'GEORGETTE', 2, 15, TRUE),
  ('cat-thobe', 'Thobe', 'thobe', 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80', 'EMIRATI TAILORED', 2, 16, TRUE)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  image = EXCLUDED.image,
  badge = EXCLUDED.badge;

-- Hero Banners
INSERT INTO public.hero_banners (id, title, subtitle, badge, tagline, action_text, action_link, category_slug, bg_color, accent_color, sort_order, is_active)
VALUES
  ('banner-1', 'URBAN EVOLUTION 2026', 'PREMIUM DROPS & EXCLUSIVE CUTS', 'No #1 Streetwear Brand', 'Engineered for those who lead with energy and edge', 'EXPLORE COLLECTION', 'shop', 'y2k-jersey', 'from-[#06201A] via-[#0B2B22] to-[#041511]', '#D4AF37', 1, TRUE),
  ('banner-2', 'HEAVYWEIGHT HOODIES', '420 GSM FRENCH TERRY & CORD SHACKETS', 'Winter Capsule Collection', 'Signature warmth with architectural oversized draping', 'SHOP WINTER DROPS', 'category', 'premium-hoodie', 'from-[#091E19] via-[#102B23] to-[#061814]', '#E8CE7A', 2, TRUE),
  ('banner-3', 'Y2K MOTOR JERSEYS', 'RETRO ATHLETIC APPAREL IN BANGLADESH', 'Limited Edition Drop', 'Authentic mesh with double stitched number graphics', 'VIEW JERSEYS', 'category', 'y2k-jersey', 'from-[#12241D] via-[#0B2B22] to-[#051510]', '#D4AF37', 3, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Sample Signature Products
INSERT INTO public.products (
  id, name, slug, category, category_slug, price, original_price, discount_percent,
  is_hot, is_flash_sale, is_featured, is_new_arrival, is_active, rating, reviews_count,
  image, gallery, description, sizes, fabric, gsm, sku, in_stock, stock_quantity
) VALUES
  (
    'p-hoodie-1',
    'Velvet Midnight Heavyweight Hoodie',
    'velvet-midnight-heavyweight-hoodie',
    'Premium Hoodie',
    'premium-hoodie',
    2500,
    3200,
    22,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    5.0,
    28,
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'],
    'Signature oversized luxury hoodie constructed from 420 GSM combed French Terry cotton. Features brushed inner warmth and double-lined hood.',
    ARRAY['M', 'L', 'XL', 'XXL'],
    '100% Combed Cotton French Terry',
    420,
    'HYB-HD-001',
    TRUE,
    45
  ),
  (
    'p-hoodie-2',
    'Forest Moss Architectural Hoodie',
    'forest-moss-architectural-hoodie',
    'Premium Hoodie',
    'premium-hoodie',
    2400,
    2950,
    19,
    FALSE,
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    5.0,
    19,
    'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80'],
    'Deep bottle green hoodie featuring drop-shoulder tailoring, thick ribbed hems, and metallic eyelets with custom branded aglets.',
    ARRAY['M', 'L', 'XL'],
    'French Terry Cotton',
    400,
    'HYB-HD-002',
    TRUE,
    30
  ),
  (
    'p-jersey-1',
    'Y2K Track Speed Racing Jersey #88',
    'y2k-track-speed-racing-jersey-88',
    'Y2K Jersey',
    'y2k-jersey',
    1900,
    2400,
    21,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    5.0,
    42,
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80'],
    'Authentic retro motocross jersey made with high-ventilation athletic micro-mesh. Premium vinyl number typography and ribbed v-neck.',
    ARRAY['M', 'L', 'XL', 'XXL'],
    'Engineered Athletic Mesh',
    260,
    'HYB-JR-088',
    TRUE,
    60
  ),
  (
    'p-shacket-1',
    'Olive Heavyweight Corduroy Shacket',
    'olive-heavyweight-corduroy-shacket',
    'Premium Shacket',
    'premium-shacket',
    2500,
    3100,
    19,
    TRUE,
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    5.0,
    22,
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80'],
    'Oversized jacket-shirt hybrid tailored from 8-wale plush corduroy. Features dual utility chest flaps and antique brass snap fasteners.',
    ARRAY['M', 'L', 'XL'],
    '8-Wale Premium Cotton Corduroy',
    380,
    'HYB-SH-001',
    TRUE,
    25
  ),
  (
    'p-cargo-1',
    'Tactical Deep Green 6-Pocket Cargo',
    'tactical-deep-green-6-pocket-cargo',
    'Baggy Cargo Pant',
    'baggy-cargo-pant',
    2200,
    2800,
    21,
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    5.0,
    18,
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80'],
    'Wide-leg military cargo pant crafted from heavyweight cotton ripstop. Equipped with 6 tactical bellows pockets and drawcord ankle cuffs.',
    ARRAY['30', '32', '34', '36'],
    '100% Cotton Ripstop Twill',
    340,
    'HYB-CG-001',
    TRUE,
    40
  ),
  (
    'p-drop-1',
    'Heavyweight Minimalist Boxy Drop Tee',
    'heavyweight-minimalist-boxy-drop-tee',
    'Premium Drop Shoulders',
    'premium-drop-shoulders',
    1800,
    2300,
    22,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    5.0,
    31,
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'],
    'Ultra-clean streetwear drop shoulder t-shirt. Cut from 260 GSM single jersey with high crew collar and reinforced shoulder line.',
    ARRAY['M', 'L', 'XL', 'XXL'],
    '100% Combed Compact Cotton',
    260,
    'HYB-DS-001',
    TRUE,
    80
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SQL SCRIPT COMPLETE
-- ============================================================================
