-- ============================================================================
-- HAYBAH E-COMMERCE & ADMIN SYSTEM - PART 2 OF 3
-- SECURITY, RLS POLICIES, TRIGGERS & RPC FUNCTIONS
-- Target Supabase Project: iuvgammnubrarjyenbxi (https://iuvgammnubrarjyenbxi.supabase.co)
-- ============================================================================

-- 1. UPDATED_AT TRIGGER FUNCTION & TRIGGERS
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

-- 2. STOCK RESTORATION TRIGGER (When order is cancelled or returned)
CREATE OR REPLACE FUNCTION public.handle_order_status_stock_restore()
RETURNS TRIGGER AS $$
DECLARE
  v_item RECORD;
BEGIN
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

-- 3. IS_ADMIN() SECURITY DEFINER FUNCTION
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  -- Check existence in admins table
  IF EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()) THEN
    RETURN TRUE;
  END IF;
  -- Fallback check for designated administrative email
  IF (auth.jwt() ->> 'email') = 'haybahclothing1@gmail.com' THEN
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS across all tables
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

-- Clean existing policies
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

-- Table Policies:
-- Admins table
CREATE POLICY "admins_full_access" ON public.admins
  FOR ALL TO authenticated
  USING (public.is_admin() OR auth.uid() = id);

-- Site settings: Public can read, Admin can edit
CREATE POLICY "public_read_site_settings" ON public.site_settings
  FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY "admins_all_site_settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.is_admin());

-- Categories: Public sees active, Admin sees all
CREATE POLICY "public_read_active_categories" ON public.categories
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "admins_all_categories" ON public.categories
  FOR ALL TO authenticated
  USING (public.is_admin());

-- Hero Banners: Public sees active, Admin sees all
CREATE POLICY "public_read_active_banners" ON public.hero_banners
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "admins_all_banners" ON public.hero_banners
  FOR ALL TO authenticated
  USING (public.is_admin());

-- Products: Public sees active, Admin sees all
CREATE POLICY "public_read_active_products" ON public.products
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "admins_all_products" ON public.products
  FOR ALL TO authenticated
  USING (public.is_admin());

-- Customers: Admin only
CREATE POLICY "admins_all_customers" ON public.customers
  FOR ALL TO authenticated
  USING (public.is_admin());

-- Coupons: Admin only
CREATE POLICY "admins_all_coupons" ON public.coupons
  FOR ALL TO authenticated
  USING (public.is_admin());

-- Orders & Items: Admin only
CREATE POLICY "admins_all_orders" ON public.orders
  FOR ALL TO authenticated
  USING (public.is_admin());

CREATE POLICY "admins_all_order_items" ON public.order_items
  FOR ALL TO authenticated
  USING (public.is_admin());

-- Incomplete orders: Admin only
CREATE POLICY "admins_all_incomplete_orders" ON public.incomplete_orders
  FOR ALL TO authenticated
  USING (public.is_admin());

-- Storage Policies
DROP POLICY IF EXISTS "public_read_storage_banners" ON storage.objects;
DROP POLICY IF EXISTS "admin_all_storage_banners" ON storage.objects;
DROP POLICY IF EXISTS "public_read_storage_categories" ON storage.objects;
DROP POLICY IF EXISTS "admin_all_storage_categories" ON storage.objects;
DROP POLICY IF EXISTS "public_read_storage_products" ON storage.objects;
DROP POLICY IF EXISTS "admin_all_storage_products" ON storage.objects;

CREATE POLICY "public_read_storage_banners" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'banners');

CREATE POLICY "public_read_storage_categories" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'categories');

CREATE POLICY "public_read_storage_products" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'products');

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

-- 5. RPC FUNCTIONS

-- A. place_order() RPC
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
  v_order_number := 'HYB-' || LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0');
  v_order_id := v_order_number;

  INSERT INTO public.orders (
    id, order_number, customer_name, phone, address,
    district, thana, city, payment_method, subtotal,
    delivery_fee, discount, total, status, notes, coupon_code
  ) VALUES (
    v_order_id, v_order_number, p_customer_name, p_phone, p_address,
    COALESCE(p_district, ''), COALESCE(p_thana, ''), p_city, 'Cash on Delivery', p_subtotal,
    p_delivery_fee, COALESCE(p_discount, 0), p_total, 'pending', COALESCE(p_notes, ''), COALESCE(p_coupon_code, '')
  );

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := COALESCE(v_item->>'productId', v_item->'product'->>'id');
    v_product_name := COALESCE(v_item->'product'->>'name', v_item->>'name', 'Item');
    v_product_image := COALESCE(v_item->'product'->>'image', v_item->>'image', '');
    v_size := COALESCE(v_item->>'selectedSize', 'L');
    v_qty := GREATEST(1, COALESCE((v_item->>'quantity')::INTEGER, 1));
    v_price := COALESCE((v_item->'product'->>'price')::NUMERIC, (v_item->>'price')::NUMERIC, 0);

    INSERT INTO public.order_items (
      order_id, product_id, product_name, product_image,
      selected_size, quantity, unit_price, total_price
    ) VALUES (
      v_order_id, v_product_id, v_product_name, v_product_image,
      v_size, v_qty, v_price, v_price * v_qty
    );

    IF v_product_id IS NOT NULL THEN
      UPDATE public.products
      SET stock_quantity = GREATEST(0, stock_quantity - v_qty),
          in_stock = (GREATEST(0, stock_quantity - v_qty) > 0)
      WHERE id = v_product_id;
    END IF;
  END LOOP;

  INSERT INTO public.customers (
    phone, name, address, city, district, thana, total_orders, total_spent, last_order_date
  ) VALUES (
    p_phone, p_customer_name, p_address, p_city, COALESCE(p_district, ''), COALESCE(p_thana, ''), 1, p_total, NOW()
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

  IF p_coupon_code IS NOT NULL AND TRIM(p_coupon_code) <> '' THEN
    UPDATE public.coupons
    SET used_count = used_count + 1
    WHERE code = UPPER(TRIM(p_coupon_code));
  END IF;

  UPDATE public.incomplete_orders
  SET status = 'converted', updated_at = NOW()
  WHERE phone = p_phone AND status <> 'converted';

  RETURN jsonb_build_object('id', v_order_id, 'order_number', v_order_number, 'total', p_total);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- B. check_coupon() RPC
CREATE OR REPLACE FUNCTION public.check_coupon(p_code TEXT, p_subtotal NUMERIC)
RETURNS JSONB AS $$
DECLARE
  v_coupon RECORD;
  v_discount NUMERIC := 0;
BEGIN
  SELECT * INTO v_coupon FROM public.coupons WHERE code = UPPER(TRIM(p_code)) AND is_active = TRUE;

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

  IF v_coupon.type = 'percent' THEN
    v_discount := ROUND(p_subtotal * (v_coupon.value / 100.0));
    IF v_coupon.max_discount > 0 AND v_discount > v_coupon.max_discount THEN
      v_discount := v_coupon.max_discount;
    END IF;
  ELSE
    v_discount := LEAST(v_coupon.value, p_subtotal);
  END IF;

  RETURN jsonb_build_object('valid', TRUE, 'discount', v_discount, 'message', 'Coupon applied! ৳' || v_discount || ' discount unlocked.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- C. save_incomplete_order() RPC
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

  INSERT INTO public.incomplete_orders (
    phone, customer_name, address, city, district, thana, cart_items, total_amount, status
  ) VALUES (
    TRIM(p_phone), COALESCE(p_name, ''), COALESCE(p_address, ''), COALESCE(p_city, ''),
    COALESCE(p_district, ''), COALESCE(p_thana, ''), COALESCE(p_items, '[]'::jsonb), COALESCE(p_total, 0), 'new'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- D. track_order() RPC
CREATE OR REPLACE FUNCTION public.track_order(p_query TEXT)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_items JSONB;
BEGIN
  SELECT * INTO v_order FROM public.orders
  WHERE (order_number = TRIM(p_query) OR phone = TRIM(p_query))
  ORDER BY created_at DESC LIMIT 1;

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
  ) INTO v_items FROM public.order_items WHERE order_id = v_order.id;

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

-- E. log_call() RPC
CREATE OR REPLACE FUNCTION public.log_call(p_incomplete_id UUID, p_note TEXT DEFAULT NULL)
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

-- F. convert_incomplete() RPC
CREATE OR REPLACE FUNCTION public.convert_incomplete(p_incomplete_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_inc RECORD;
  v_order_id TEXT;
  v_order_number TEXT;
  v_item JSONB;
BEGIN
  SELECT * INTO v_inc FROM public.incomplete_orders WHERE id = p_incomplete_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Lead record not found');
  END IF;

  v_order_number := 'HYB-' || LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0');
  v_order_id := v_order_number;

  INSERT INTO public.orders (
    id, order_number, customer_name, phone, address, district, thana, city,
    payment_method, subtotal, delivery_fee, total, status, notes
  ) VALUES (
    v_order_id, v_order_number,
    COALESCE(NULLIF(v_inc.customer_name, ''), 'Customer (Lead)'),
    v_inc.phone,
    COALESCE(NULLIF(v_inc.address, ''), 'Phone Order Confirmation'),
    COALESCE(v_inc.district, 'Dhaka'), COALESCE(v_inc.thana, 'Dhaka'), COALESCE(NULLIF(v_inc.city, ''), 'Inside Dhaka'),
    'Cash on Delivery', GREATEST(0, v_inc.total_amount - 80), 80, v_inc.total_amount, 'confirmed', 'Converted from Incomplete Order'
  );

  FOR v_item IN SELECT * FROM jsonb_array_elements(v_inc.cart_items)
  LOOP
    INSERT INTO public.order_items (
      order_id, product_id, product_name, product_image, selected_size, quantity, unit_price, total_price
    ) VALUES (
      v_order_id, v_item->'product'->>'id',
      COALESCE(v_item->'product'->>'name', 'Item'),
      COALESCE(v_item->'product'->>'image', ''),
      COALESCE(v_item->>'selectedSize', 'L'),
      GREATEST(1, COALESCE((v_item->>'quantity')::INTEGER, 1)),
      COALESCE((v_item->'product'->>'price')::NUMERIC, 0),
      COALESCE((v_item->'product'->>'price')::NUMERIC, 0) * GREATEST(1, COALESCE((v_item->>'quantity')::INTEGER, 1))
    );
  END LOOP;

  UPDATE public.incomplete_orders
  SET status = 'converted', updated_at = NOW()
  WHERE id = p_incomplete_id;

  RETURN jsonb_build_object('success', TRUE, 'order_id', v_order_id, 'order_number', v_order_number);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- G. admin_dashboard() RPC
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
