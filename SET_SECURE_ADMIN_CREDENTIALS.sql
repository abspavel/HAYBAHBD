-- ============================================================================
-- HAYBAH E-COMMERCE - SECURE ADMIN CREDENTIALS CONFIGURATION
-- ফাইল: SET_SECURE_ADMIN_CREDENTIALS.sql
-- 
-- বিবরণ (Description):
-- এই SQL স্ক্রিপ্টটি দিয়ে আপনি Supabase এ সম্পূর্ণ সুরক্ষিত এডমিন অ্যাকাউন্ট তৈরি
-- অথবা বর্তমান এডমিন ইমেইল ও পাসওয়ার্ড পরিবর্তন (Update/Reset) করতে পারবেন।
--
-- ব্যবহারের নিয়ম (Instructions):
-- ১. Supabase Dashboard (https://supabase.com) এ লগইন করুন।
-- ২. আপনার প্রোজেক্ট নির্বাচন করুন -> বাম পাশের মেনু থেকে "SQL Editor" এ যান।
-- ৩. নিচের কোডে v_admin_email এবং v_admin_password এর জায়গায় আপনার পছন্দমতো 
--    গোপন ইমেইল এবং স্ট্রং পাসওয়ার্ড লিখুন।
-- ৪. "Run" বাটনে ক্লিক করুন। সাথে সাথে আপনার নতুন সুরক্ষিত এডমিন আইডি তৈরি হয়ে যাবে!
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  -- >>> আপনার পছন্দের গোপন ইমেইল এবং নতুন পাসওয়ার্ড এখানে লিখুন <<<
  v_admin_email TEXT := 'haybahclothing1@gmail.com'; -- পরিবর্তন করতে পারেন (e.g. your_admin@gmail.com)
  v_admin_password TEXT := 'admin123';               -- পরিবর্তন করতে পারেন (e.g. YourSecretPass#2026)

  v_user_id UUID;
  v_encrypted_pw TEXT;
BEGIN
  -- 1. Blowfish সল্টিং দিয়ে পাসওয়ার্ড এনক্রিপ্ট করা
  v_encrypted_pw := crypt(v_admin_password, gen_salt('bf', 10));

  -- 2. চেক করা ইউজার ইতিমধ্যে আছে কিনা
  SELECT id INTO v_user_id FROM auth.users WHERE email = lower(v_admin_email);

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();

    -- নতুন এডমিন ইউজার তৈরি
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
      lower(v_admin_email),
      v_encrypted_pw,
      NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"name": "HAYBAH Admin", "role": "admin"}'::jsonb,
      NOW(),
      NOW()
    );

    -- আইডেন্টিটি লিংক করা
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
        format('{"sub":"%s","email":"%s"}', v_user_id, lower(v_admin_email))::jsonb,
        'email',
        v_user_id::text,
        NOW(),
        NOW(),
        NOW()
      );
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  ELSE
    -- পূর্বের অ্যাকাউন্ট থাকলে পাসওয়ার্ড ও স্ট্যাটাস আপডেট
    UPDATE auth.users
    SET encrypted_password = v_encrypted_pw,
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        raw_app_meta_data = '{"provider": "email", "providers": ["email"]}'::jsonb,
        raw_user_meta_data = '{"name": "HAYBAH Admin", "role": "admin"}'::jsonb,
        updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  -- 3. public.admins টেবিলে সুপার-এডমিন পারমিশন নিশ্চিত করা
  INSERT INTO public.admins (id, email, role, created_at)
  VALUES (v_user_id, lower(v_admin_email), 'super_admin', NOW())
  ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email, 
    role = 'super_admin';

  UPDATE public.admins 
  SET id = v_user_id, role = 'super_admin' 
  WHERE email = lower(v_admin_email);

  RAISE NOTICE 'SUCCESS: Admin account % has been securely provisioned/updated!', v_admin_email;
END $$;

-- 4. এডমিন ভেরিফিকেশন RPC ফাংশন আপডেট
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE id = auth.uid() OR lower(email) = lower(auth.jwt() ->> 'email')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;
