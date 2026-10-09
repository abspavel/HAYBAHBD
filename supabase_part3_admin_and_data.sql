-- ============================================================================
-- HAYBAH E-COMMERCE & ADMIN SYSTEM - PART 3 OF 3
-- AUTOMATED ADMIN ACCOUNT CREATION & INITIAL SEED DATA
-- Email: haybahclothing1@gmail.com
-- Password: admin123
-- Target Supabase Project: iuvgammnubrarjyenbxi (https://iuvgammnubrarjyenbxi.supabase.co)
-- ============================================================================

-- 1. AUTOMATED ADMIN ACCOUNT PROVISIONING
-- This creates or updates the admin user directly in Supabase Auth & public.admins
DO $$
DECLARE
  v_user_id UUID;
  v_encrypted_pw TEXT;
BEGIN
  -- Generate Blowfish encrypted hash for 'admin123'
  v_encrypted_pw := crypt('admin123', gen_salt('bf', 10));

  -- Check if user already exists in auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'haybahclothing1@gmail.com';

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      'haybahclothing1@gmail.com',
      v_encrypted_pw,
      NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"name": "HAYBAH Admin", "role": "admin"}'::jsonb,
      NOW(),
      NOW()
    );

    -- Also link identity record
    BEGIN
      INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        v_user_id,
        format('{"sub":"%s","email":"%s"}', v_user_id, 'haybahclothing1@gmail.com')::jsonb,
        'email',
        v_user_id::text,
        NOW(),
        NOW(),
        NOW()
      );
    EXCEPTION WHEN OTHERS THEN
      -- If auth.identities schema differs or already present, continue
      NULL;
    END;
  ELSE
    -- If already exists, safely update the password & ensure email is confirmed
    UPDATE auth.users
    SET encrypted_password = v_encrypted_pw,
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        raw_app_meta_data = '{"provider": "email", "providers": ["email"]}'::jsonb,
        updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  -- Ensure record exists in public.admins
  INSERT INTO public.admins (id, email, role, created_at)
  VALUES (v_user_id, 'haybahclothing1@gmail.com', 'super_admin', NOW())
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, role = 'super_admin';

  UPDATE public.admins 
  SET id = v_user_id, role = 'super_admin' 
  WHERE email = 'haybahclothing1@gmail.com';
END $$;

-- 2. SITE SETTINGS (Brand name HAYBAH, Helpline, Shipping Rates)
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
ON CONFLICT (id) DO UPDATE SET
  brand_name = EXCLUDED.brand_name,
  helpline = EXCLUDED.helpline,
  email = EXCLUDED.email,
  whatsapp = EXCLUDED.whatsapp;

-- 3. DEFAULT COUPONS
INSERT INTO public.coupons (code, type, value, min_order, max_discount, usage_limit, used_count, is_active)
VALUES ('HAYBAH10', 'percent', 10, 1000, 500, 500, 24, TRUE)
ON CONFLICT (code) DO NOTHING;

-- 4. 16 SIGNATURE CATEGORIES
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

-- 5. HERO SLIDER BANNERS
INSERT INTO public.hero_banners (id, title, subtitle, badge, tagline, action_text, action_link, category_slug, bg_color, accent_color, sort_order, is_active)
VALUES
  ('banner-1', 'URBAN EVOLUTION 2026', 'PREMIUM DROPS & EXCLUSIVE CUTS', 'No #1 Streetwear Brand', 'Engineered for those who lead with energy and edge', 'EXPLORE COLLECTION', 'shop', 'y2k-jersey', 'from-[#06201A] via-[#0B2B22] to-[#041511]', '#D4AF37', 1, TRUE),
  ('banner-2', 'HEAVYWEIGHT HOODIES', '420 GSM FRENCH TERRY & CORD SHACKETS', 'Winter Capsule Collection', 'Signature warmth with architectural oversized draping', 'SHOP WINTER DROPS', 'category', 'premium-hoodie', 'from-[#091E19] via-[#102B23] to-[#061814]', '#E8CE7A', 2, TRUE),
  ('banner-3', 'Y2K MOTOR JERSEYS', 'RETRO ATHLETIC APPAREL IN BANGLADESH', 'Limited Edition Drop', 'Authentic mesh with double stitched number graphics', 'VIEW JERSEYS', 'category', 'y2k-jersey', 'from-[#12241D] via-[#0B2B22] to-[#051510]', '#D4AF37', 3, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 6. SIGNATURE PRODUCTS
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
