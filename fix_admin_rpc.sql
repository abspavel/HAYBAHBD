-- ============================================================================
-- RPC FUNCTIONS FOR SECURE & INSTANT ADMIN OPERATIONS
-- Allows admin console to create, update, delete products, categories,
-- banners, coupons, read orders and customers without RLS blocking!
-- ============================================================================

-- 1. GET ALL ORDERS FOR ADMIN
CREATE OR REPLACE FUNCTION public.admin_get_orders()
RETURNS JSONB AS $$
DECLARE
  v_res JSONB;
BEGIN
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', o.id,
        'order_number', o.order_number,
        'customer_name', o.customer_name,
        'phone', o.phone,
        'address', o.address,
        'district', o.district,
        'thana', o.thana,
        'city', o.city,
        'payment_method', o.payment_method,
        'subtotal', o.subtotal,
        'delivery_fee', o.delivery_fee,
        'discount', o.discount,
        'total', o.total,
        'status', o.status,
        'notes', o.notes,
        'coupon_code', o.coupon_code,
        'created_at', o.created_at,
        'updated_at', o.updated_at,
        'order_items', (
          SELECT COALESCE(jsonb_agg(row_to_json(oi)), '[]'::jsonb)
          FROM public.order_items oi
          WHERE oi.order_id = o.id
        )
      ) ORDER BY o.created_at DESC
    ),
    '[]'::jsonb
  ) INTO v_res
  FROM public.orders o;

  RETURN v_res;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. GET ALL CUSTOMERS FOR ADMIN
CREATE OR REPLACE FUNCTION public.admin_get_customers()
RETURNS JSONB AS $$
DECLARE
  v_res JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(row_to_json(c) ORDER BY c.total_spent DESC), '[]'::jsonb)
  INTO v_res
  FROM public.customers c;

  RETURN v_res;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. GET ALL INCOMPLETE ORDERS FOR ADMIN
CREATE OR REPLACE FUNCTION public.admin_get_incomplete_orders()
RETURNS JSONB AS $$
DECLARE
  v_res JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(row_to_json(i) ORDER BY i.created_at DESC), '[]'::jsonb)
  INTO v_res
  FROM public.incomplete_orders i;

  RETURN v_res;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. GET ALL COUPONS FOR ADMIN
CREATE OR REPLACE FUNCTION public.admin_get_coupons()
RETURNS JSONB AS $$
DECLARE
  v_res JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(row_to_json(cp) ORDER BY cp.created_at DESC), '[]'::jsonb)
  INTO v_res
  FROM public.coupons cp;

  RETURN v_res;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. UPSERT PRODUCT
CREATE OR REPLACE FUNCTION public.admin_save_product(p_product JSONB)
RETURNS JSONB AS $$
DECLARE
  v_id TEXT;
  v_res JSONB;
BEGIN
  v_id := COALESCE(p_product->>'id', 'p-' || LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0'));

  INSERT INTO public.products (
    id, name, slug, category, category_slug, price, original_price,
    discount_percent, is_hot, is_flash_sale, is_featured, is_new_arrival,
    is_active, rating, reviews_count, image, gallery, description,
    short_description, details, sizes, colors, fabric, gsm, fit,
    sku, in_stock, stock_quantity, tag, sort_order, updated_at
  ) VALUES (
    v_id,
    COALESCE(p_product->>'name', 'Untitled Product'),
    COALESCE(p_product->>'slug', v_id),
    COALESCE(p_product->>'category', 'General'),
    COALESCE(p_product->>'category_slug', p_product->>'categorySlug', 'general'),
    COALESCE((p_product->>'price')::NUMERIC, 0),
    (p_product->>'original_price')::NUMERIC,
    COALESCE((p_product->>'discount_percent')::INTEGER, 0),
    COALESCE((p_product->>'is_hot')::BOOLEAN, FALSE),
    COALESCE((p_product->>'is_flash_sale')::BOOLEAN, FALSE),
    COALESCE((p_product->>'is_featured')::BOOLEAN, FALSE),
    COALESCE((p_product->>'is_new_arrival')::BOOLEAN, FALSE),
    COALESCE((p_product->>'is_active')::BOOLEAN, TRUE),
    COALESCE((p_product->>'rating')::NUMERIC, 5.0),
    COALESCE((p_product->>'reviews_count')::INTEGER, 12),
    COALESCE(p_product->>'image', ''),
    COALESCE(p_product->'gallery', '[]'::jsonb),
    COALESCE(p_product->>'description', ''),
    COALESCE(p_product->>'short_description', ''),
    COALESCE(p_product->>'details', ''),
    COALESCE(p_product->'sizes', '["M","L","XL","XXL"]'::jsonb),
    COALESCE(p_product->'colors', '[]'::jsonb),
    COALESCE(p_product->>'fabric', ''),
    (p_product->>'gsm')::INTEGER,
    COALESCE(p_product->>'fit', ''),
    COALESCE(p_product->>'sku', 'HYB-' || v_id),
    COALESCE((p_product->>'in_stock')::BOOLEAN, TRUE),
    COALESCE((p_product->>'stock_quantity')::INTEGER, 50),
    COALESCE(p_product->>'tag', ''),
    COALESCE((p_product->>'sort_order')::INTEGER, 0),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    category = EXCLUDED.category,
    category_slug = EXCLUDED.category_slug,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    discount_percent = EXCLUDED.discount_percent,
    is_hot = EXCLUDED.is_hot,
    is_flash_sale = EXCLUDED.is_flash_sale,
    is_featured = EXCLUDED.is_featured,
    is_new_arrival = EXCLUDED.is_new_arrival,
    is_active = EXCLUDED.is_active,
    image = EXCLUDED.image,
    gallery = EXCLUDED.gallery,
    description = EXCLUDED.description,
    short_description = EXCLUDED.short_description,
    details = EXCLUDED.details,
    sizes = EXCLUDED.sizes,
    colors = EXCLUDED.colors,
    fabric = EXCLUDED.fabric,
    gsm = EXCLUDED.gsm,
    fit = EXCLUDED.fit,
    sku = EXCLUDED.sku,
    in_stock = EXCLUDED.in_stock,
    stock_quantity = EXCLUDED.stock_quantity,
    tag = EXCLUDED.tag,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

  SELECT row_to_json(p) INTO v_res FROM public.products p WHERE p.id = v_id;
  RETURN v_res;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. DELETE PRODUCT
CREATE OR REPLACE FUNCTION public.admin_delete_product(p_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM public.products WHERE id = p_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. UPSERT CATEGORY
CREATE OR REPLACE FUNCTION public.admin_save_category(p_category JSONB)
RETURNS JSONB AS $$
DECLARE
  v_id TEXT;
  v_res JSONB;
BEGIN
  v_id := COALESCE(p_category->>'id', 'cat-' || (p_category->>'slug'));

  INSERT INTO public.categories (
    id, name, slug, image, badge, item_count, sort_order, is_active, updated_at
  ) VALUES (
    v_id,
    COALESCE(p_category->>'name', 'Untitled'),
    COALESCE(p_category->>'slug', v_id),
    COALESCE(p_category->>'image', ''),
    COALESCE(p_category->>'badge', ''),
    COALESCE((p_category->>'item_count')::INTEGER, 2),
    COALESCE((p_category->>'sort_order')::INTEGER, 0),
    COALESCE((p_category->>'is_active')::BOOLEAN, TRUE),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    image = EXCLUDED.image,
    badge = EXCLUDED.badge,
    item_count = EXCLUDED.item_count,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

  SELECT row_to_json(c) INTO v_res FROM public.categories c WHERE c.id = v_id;
  RETURN v_res;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. DELETE CATEGORY
CREATE OR REPLACE FUNCTION public.admin_delete_category(p_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM public.categories WHERE id = p_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 9. UPSERT HERO BANNER
CREATE OR REPLACE FUNCTION public.admin_save_banner(p_banner JSONB)
RETURNS JSONB AS $$
DECLARE
  v_id TEXT;
  v_res JSONB;
BEGIN
  v_id := COALESCE(p_banner->>'id', 'banner-' || LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0'));

  INSERT INTO public.hero_banners (
    id, title, subtitle, badge, tagline, action_text, action_link,
    category_slug, image, bg_color, accent_color, sort_order, is_active, updated_at
  ) VALUES (
    v_id,
    COALESCE(p_banner->>'title', 'Banner'),
    COALESCE(p_banner->>'subtitle', ''),
    COALESCE(p_banner->>'badge', ''),
    COALESCE(p_banner->>'tagline', ''),
    COALESCE(p_banner->>'action_text', ''),
    COALESCE(p_banner->>'action_link', 'category'),
    COALESCE(p_banner->>'category_slug', ''),
    COALESCE(p_banner->>'image', ''),
    COALESCE(p_banner->>'bg_color', 'from-[#06201A] via-[#0B2B22] to-[#041511]'),
    COALESCE(p_banner->>'accent_color', '#D4AF37'),
    COALESCE((p_banner->>'sort_order')::INTEGER, 1),
    COALESCE((p_banner->>'is_active')::BOOLEAN, TRUE),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    badge = EXCLUDED.badge,
    tagline = EXCLUDED.tagline,
    action_text = EXCLUDED.action_text,
    action_link = EXCLUDED.action_link,
    category_slug = EXCLUDED.category_slug,
    image = EXCLUDED.image,
    bg_color = EXCLUDED.bg_color,
    accent_color = EXCLUDED.accent_color,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

  SELECT row_to_json(b) INTO v_res FROM public.hero_banners b WHERE b.id = v_id;
  RETURN v_res;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 10. DELETE HERO BANNER
CREATE OR REPLACE FUNCTION public.admin_delete_banner(p_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM public.hero_banners WHERE id = p_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 11. UPSERT COUPON
CREATE OR REPLACE FUNCTION public.admin_save_coupon(p_coupon JSONB)
RETURNS JSONB AS $$
DECLARE
  v_id TEXT;
  v_code TEXT;
  v_res JSONB;
BEGIN
  v_code := UPPER(TRIM(COALESCE(p_coupon->>'code', '')));
  v_id := COALESCE(p_coupon->>'id', 'cp-' || LOWER(v_code));

  INSERT INTO public.coupons (
    id, code, type, value, min_order, max_discount, usage_limit,
    used_count, is_active, start_date, end_date, updated_at
  ) VALUES (
    v_id,
    v_code,
    COALESCE(p_coupon->>'type', 'percent'),
    COALESCE((p_coupon->>'value')::NUMERIC, 0),
    COALESCE((p_coupon->>'min_order')::NUMERIC, 0),
    COALESCE((p_coupon->>'max_discount')::NUMERIC, 0),
    COALESCE((p_coupon->>'usage_limit')::INTEGER, 100),
    COALESCE((p_coupon->>'used_count')::INTEGER, 0),
    COALESCE((p_coupon->>'is_active')::BOOLEAN, TRUE),
    COALESCE((p_coupon->>'start_date')::TIMESTAMPTZ, NOW()),
    (p_coupon->>'end_date')::TIMESTAMPTZ,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    type = EXCLUDED.type,
    value = EXCLUDED.value,
    min_order = EXCLUDED.min_order,
    max_discount = EXCLUDED.max_discount,
    usage_limit = EXCLUDED.usage_limit,
    used_count = EXCLUDED.used_count,
    is_active = EXCLUDED.is_active,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    updated_at = NOW();

  SELECT row_to_json(c) INTO v_res FROM public.coupons c WHERE c.id = v_id;
  RETURN v_res;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 12. DELETE COUPON
CREATE OR REPLACE FUNCTION public.admin_delete_coupon(p_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM public.coupons WHERE id = p_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 13. UPDATE ORDER STATUS
CREATE OR REPLACE FUNCTION public.admin_set_order_status(p_order_id TEXT, p_status TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.orders
  SET status = p_status, updated_at = NOW()
  WHERE id = p_order_id OR order_number = p_order_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 14. SAVE SITE SETTINGS
CREATE OR REPLACE FUNCTION public.admin_save_settings(p_settings JSONB)
RETURNS JSONB AS $$
DECLARE
  v_res JSONB;
BEGIN
  INSERT INTO public.site_settings (
    id, brand_name, helpline, helpline_hours, email, whatsapp,
    marquee_text, shipping_inside_dhaka, shipping_outside_dhaka, updated_at
  ) VALUES (
    1,
    COALESCE(p_settings->>'brand_name', 'HAYBAH'),
    COALESCE(p_settings->>'helpline', '+880 1642-247530'),
    COALESCE(p_settings->>'helpline_hours', '(11:00 AM – 08:00 PM)'),
    COALESCE(p_settings->>'email', 'haybahclothing1@gmail.com'),
    COALESCE(p_settings->>'whatsapp', '+8801642247530'),
    COALESCE(p_settings->>'marquee_text', 'FREE SHIPPING ON ORDERS OVER ৳2000!'),
    COALESCE((p_settings->>'shipping_inside_dhaka')::NUMERIC, 80),
    COALESCE((p_settings->>'shipping_outside_dhaka')::NUMERIC, 120),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    brand_name = EXCLUDED.brand_name,
    helpline = EXCLUDED.helpline,
    helpline_hours = EXCLUDED.helpline_hours,
    email = EXCLUDED.email,
    whatsapp = EXCLUDED.whatsapp,
    marquee_text = EXCLUDED.marquee_text,
    shipping_inside_dhaka = EXCLUDED.shipping_inside_dhaka,
    shipping_outside_dhaka = EXCLUDED.shipping_outside_dhaka,
    updated_at = NOW();

  SELECT row_to_json(s) INTO v_res FROM public.site_settings s WHERE s.id = 1;
  RETURN v_res;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
