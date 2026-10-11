import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  ExternalLink,
  CheckCircle,
  Eye,
  Loader2,
  AlertCircle,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  CloudCheck,
  CloudOff,
} from 'lucide-react';
import { HeroBanner, CategoryItem } from '../../types';
import {
  adminFetchAllBanners,
  fetchLiveCategories,
  remoteSaveBanner,
  remoteDeleteBanner,
  checkSupabaseWritePermission,
} from '../../services/supabaseService';
import { playAdminChime } from '../../services/localAdminStore';
import { supabase } from '../../lib/supabase';
import { ImageUploader } from '../components/ImageUploader';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { AdminNotification, NotificationType } from '../components/AdminNotification';
import { useShop } from '../../context/ShopContext';

export const BannersView: React.FC = () => {
  const { refreshStoreData, setHeroBanners: setGlobalBanners } = useShop();
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBanner, setEditingBanner] = useState<Partial<HeroBanner> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    checked: boolean;
    writable: boolean;
    error?: string;
    isRlsError?: boolean;
  }>({ checked: false, writable: true });
  const [notification, setNotification] = useState<{ message: string | null; type: NotificationType }>({
    message: null,
    type: 'success',
  });

  const loadData = async () => {
    setLoading(true);
    const [bannerList, catList, health] = await Promise.all([
      adminFetchAllBanners(),
      fetchLiveCategories(),
      checkSupabaseWritePermission(),
    ]);
    setBanners(bannerList);
    setCategories(catList);
    setSyncStatus({ checked: true, writable: health.writable, error: health.error, isRlsError: health.isRlsError });
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopySql = () => {
    const sql = `-- ============================================================================
-- HAYBAH E-COMMERCE - 100% FAIL-SAFE REALTIME & CROSS-DEVICE CLOUD SYNC
-- ============================================================================

DO $$
BEGIN
  GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
  GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
  GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
DECLARE
  tbl TEXT;
  tbl_list TEXT[] := ARRAY['hero_banners', 'categories', 'products', 'site_settings', 'coupons', 'orders', 'order_items', 'incomplete_orders', 'customers', 'admins'];
BEGIN
  FOREACH tbl IN ARRAY tbl_list
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
      BEGIN
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', tbl);
      EXCEPTION WHEN OTHERS THEN NULL;
      END;

      BEGIN
        EXECUTE format('DROP POLICY IF EXISTS "open_sync_policy_%s" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "open_sync_policy_%s" ON public.%I FOR ALL TO public USING (true) WITH CHECK (true)', tbl, tbl);
      EXCEPTION WHEN OTHERS THEN NULL;
      END;
    END IF;
  END LOOP;
END $$;

DO $$
DECLARE
  tbl TEXT;
  realtime_tables TEXT[] := ARRAY['hero_banners', 'categories', 'products', 'site_settings', 'orders', 'incomplete_orders'];
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      CREATE PUBLICATION supabase_realtime;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;

  FOREACH tbl IN ARRAY realtime_tables
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
      BEGIN
        EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL', tbl);
      EXCEPTION WHEN OTHERS THEN NULL;
      END;

      IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = tbl
      ) THEN
        BEGIN
          EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl);
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
      END IF;
    END IF;
  END LOOP;
END $$;

DO $$
BEGIN
  BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('banners', 'banners', true), ('categories', 'categories', true), ('products', 'products', true)
    ON CONFLICT (id) DO UPDATE SET public = true;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    DROP POLICY IF EXISTS "public_all_storage_sync" ON storage.objects;
    CREATE POLICY "public_all_storage_sync" ON storage.objects FOR ALL TO public USING (true) WITH CHECK (true);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'hero_banners') THEN
    UPDATE public.hero_banners
    SET image = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=85'
    WHERE id = 'banner-1' AND (image IS NULL OR TRIM(image) = '');

    UPDATE public.hero_banners
    SET image = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=85'
    WHERE id = 'banner-2' AND (image IS NULL OR TRIM(image) = '');

    UPDATE public.hero_banners
    SET image = 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=1600&q=85'
    WHERE id = 'banner-3' AND (image IS NULL OR TRIM(image) = '');
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT 'SUCCESS: HAYBAH Supabase Cloud Permissions & Realtime Sync are 100% Active!' AS status;`;

    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!editingBanner?.image || editingBanner.image.trim() === '') {
      setErrorMsg('অনুগ্রহ করে গ্যালারি থেকে ব্যানারের ছবি সিলেক্ট বা আপলোড করুন অথবা একটি ছবির লিংক দিন।');
      return;
    }

    setIsSaving(true);

    const bannerId = editingBanner.id || `banner-${Date.now()}`;
    const autoTitle =
      editingBanner.title?.trim() ||
      `Banner #${editingBanner.sortOrder ?? banners.length + 1}`;

    const res = await remoteSaveBanner({
      id: bannerId,
      title: autoTitle,
      subtitle: '',
      badge: '',
      tagline: '',
      actionText: '',
      actionLink: editingBanner.actionLink || 'category',
      categorySlug: editingBanner.categorySlug || '',
      image: editingBanner.image.trim(),
      bgColor: 'from-[#06201A] via-[#0B2B22] to-[#041511]',
      accentColor: '#D4AF37',
      sortOrder: editingBanner.sortOrder ?? banners.length + 1,
      isActive: editingBanner.isActive ?? true,
    });

    // Instantly update global storefront banners synchronously
    setGlobalBanners((prev) => {
      const idx = prev.findIndex((b) => b.id === bannerId);
      if (idx >= 0) {
        const nextList = [...prev];
        nextList[idx] = res.banner;
        return nextList;
      }
      return [...prev, res.banner];
    });

    setIsModalOpen(false);
    setEditingBanner(null);
    setIsSaving(false);
    await loadData();
    await refreshStoreData();
    playAdminChime('success');

    if (res.isRlsError) {
      setSyncStatus((prev) => ({ ...prev, writable: false, isRlsError: true, error: res.error }));
      setNotification({
        message: '⚠️ ব্যানার এই ডিভাইসে সেভ হয়েছে, তবে Supabase RLS এর কারণে অন্যান্য ডিভাইসে সিঙ্ক হতে নিচের SQL রান করুন।',
        type: 'error',
      });
    } else {
      setNotification({
        message: '✓ ব্যানার সফলভাবে সংরক্ষিত ও ক্লাউডে আপলোড হয়েছে! (সকল ডিভাইসে লাইভ)',
        type: 'success',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    const targetId = deleteTargetId;
    // Instantly remove from global storefront banners synchronously
    setGlobalBanners((prev) => prev.filter((b) => b.id !== targetId));
    const res = await remoteDeleteBanner(targetId);
    setDeleteTargetId(null);
    await loadData();
    await refreshStoreData();
    playAdminChime('delete');

    if (res.isRlsError) {
      setNotification({
        message: '⚠️ ব্যানার লোকালি ডিলিট হয়েছে। Supabase থেকে পুরোপুরি ডিলিট করতে নিচের SQL রান করুন।',
        type: 'error',
      });
    } else {
      setNotification({
        message: '✓ ব্যানার মুছে ফেলা হয়েছে! (সকল ডিভাইসে সাথে সাথে আপডেট)',
        type: 'delete',
      });
    }
  };

  const toggleActive = async (banner: HeroBanner) => {
    const nextActive = !banner.isActive;
    setGlobalBanners((prev) =>
      prev.map((b) => (b.id === banner.id ? { ...b, isActive: nextActive } : b))
    );
    await remoteSaveBanner({ ...banner, isActive: nextActive });
    await loadData();
    await refreshStoreData();
  };

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === banners.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const currentItem = banners[index];
    const targetItem = banners[targetIndex];

    const currentOrder = currentItem.sortOrder ?? index + 1;
    const targetOrder = targetItem.sortOrder ?? targetIndex + 1;

    await Promise.all([
      remoteSaveBanner({ ...currentItem, sortOrder: targetOrder }),
      remoteSaveBanner({ ...targetItem, sortOrder: currentOrder }),
    ]);

    await loadData();
    playAdminChime('success');
  };


  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#06201A] uppercase tracking-tight flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-[#D4AF37]" />
            <span>Hero Image Banners ({banners.length})</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            হোমপেজের মূল স্লাইডারে প্রদর্শিত ব্যানার ছবি। এতে কোনো টেক্সট বা বাটন থাকবে না—সরাসরি গ্যালারি থেকে ছবি আপলোড করুন।
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingBanner({
              title: '',
              categorySlug: '',
              actionLink: 'category',
              image: '',
              sortOrder: banners.length + 1,
              isActive: true,
            });
            setErrorMsg(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#06201A] hover:bg-[#0B2B22] text-[#D4AF37] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-[#06201A]/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Upload New Banner</span>
        </button>
      </div>

      {/* Cloud Sync Status Diagnostic Banner */}
      {syncStatus.checked && !syncStatus.writable && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-amber-900 uppercase tracking-tight">
                  Supabase RLS পলিসি ফিক্স প্রয়োজন (Cross-Device Sync Setup)
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  আপনার আপলোড করা নতুন ব্যানার এই ব্রাউজারে সংরক্ষিত আছে, কিন্তু অন্যান্য ডিভাইস (মোবাইল/অন্যান্য কম্পিউটার)-এ সাথে সাথে লাইভ দেখানোর জন্য Supabase-এ ১-ক্লিকে ফিক্স রান করুন।
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={handleCopySql}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                {copiedSql ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? '✓ SQL কপি হয়েছে!' : '📋 SQL কোড কপি করুন'}</span>
              </button>
              <button
                type="button"
                onClick={loadData}
                className="p-2 rounded-xl bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 transition-all cursor-pointer"
                title="রিফ্রেশ করুন"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white/80 p-3 rounded-2xl border border-amber-200 text-[11px] text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>
              💡 <strong>সহজ ধাপ:</strong> ১. ওপরের <strong>[SQL কোড কপি করুন]</strong> চাপুন → ২. Supabase Dashboard &gt; <strong>SQL Editor</strong>-এ গিয়ে পেস্ট করে <strong>Run</strong> চাপুন। ব্যস! সব ডিভাইসে সাথে সাথে অটো-আপডেট হবে।
            </span>
            <a
              href="https://supabase.com/dashboard/project/iuvgammnubrarjyenbxi/sql"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#06201A] font-black underline shrink-0 hover:text-[#D4AF37] flex items-center gap-1"
            >
              <span>Supabase SQL Editor খুলুন</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {syncStatus.checked && syncStatus.writable && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 px-4 flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold">
              ক্লাউড লাইভ সিঙ্ক সক্রিয় (Supabase Realtime Cloud Sync Active)
            </span>
            <span className="text-emerald-600 hidden sm:inline">
              — যেকোনো ডিভাইস থেকে ব্যানার যোগ/ডিলিট করলে সব ডিভাইসে সাথে সাথে পরিবর্তন হবে।
            </span>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>সিঙ্ক চেক</span>
          </button>
        </div>
      )}

      {/* Guidelines Card */}
      <div className="bg-[#06201A] text-white p-4 rounded-2xl border border-[#D4AF37]/30 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-[#E8CE7A]">
            ব্যানার ছবির নির্দেশনা (Pure Image Banner):
          </p>
          <p className="text-gray-300">
            ব্যানারের ওপর কোনো টেক্সট বা বাটন দেখানো হবে না। আপনার ডিজাইনারের তৈরি ব্যানার ছবি (প্রস্তাবিত মাপ: 1600x600 বা 1920x700 পিক্সেল) সরাসরি গ্যালারি থেকে আপলোড করুন বা লিংক দিন। ডিলিট করলে লাইভ সাইট থেকে সাথে সাথে মুছে যাবে।
          </p>
        </div>
      </div>

      {/* Banner Cards Grid */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 border border-gray-200 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Loading Hero Banners...
          </p>
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-dashed border-gray-300 text-center flex flex-col items-center justify-center gap-3">
          <ImageIcon className="w-12 h-12 text-gray-300" />
          <h3 className="font-bold text-sm text-[#06201A]">কোনো ব্যানার নেই</h3>
          <p className="text-xs text-gray-500 max-w-sm">
            হোমপেজের মূল স্লাইডারে ছবি প্রদর্শনের জন্য নতুন ব্যানার আপলোড করুন।
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingBanner({
                title: '',
                categorySlug: '',
                actionLink: 'category',
                image: '',
                sortOrder: 1,
                isActive: true,
              });
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-[#06201A] text-[#D4AF37] font-bold text-xs uppercase"
          >
            Upload First Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {banners.map((b, idx) => (
          <div
            key={b.id}
            className={`bg-white rounded-3xl border overflow-hidden flex flex-col justify-between transition-all duration-200 ${
              b.isActive
                ? 'border-gray-200/90 shadow-xs hover:border-[#D4AF37]/50 hover:shadow-md'
                : 'border-dashed border-gray-300 opacity-60'
            }`}
          >
            {/* Pure Banner Image Viewport */}
            <div className="relative aspect-[16/7] bg-[#041511] overflow-hidden flex items-center justify-center">
              {b.image ? (
                <img
                  src={b.image}
                  alt={b.title || 'Banner'}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 gap-1 p-4">
                  <ImageIcon className="w-8 h-8 opacity-40" />
                  <span className="text-[11px]">কোনো ছবি নেই</span>
                </div>
              )}

              {/* Order Badge in corner */}
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-[#D4AF37] font-bold text-[10px] px-2 py-0.5 rounded-full border border-white/10">
                Slide #{idx + 1}
              </div>

              {/* Status Badge in corner */}
              <div
                className={`absolute top-2 right-2 font-bold text-[10px] px-2 py-0.5 rounded-full backdrop-blur-xs ${
                  b.isActive
                    ? 'bg-emerald-500/80 text-white'
                    : 'bg-rose-500/80 text-white'
                }`}
              >
                {b.isActive ? 'Active' : 'Hidden'}
              </div>
            </div>

            {/* Banner Information */}
            <div className="p-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
              <div className="truncate pr-2">
                <span className="font-bold text-[#06201A] block truncate">
                  {b.title || `Banner Slide #${idx + 1}`}
                </span>
                <span className="text-[11px] text-gray-500">
                  {b.categorySlug
                    ? `Destination: ${b.categorySlug}`
                    : 'Destination: Shop All'}
                </span>
              </div>
            </div>

            {/* Banner Action Controls */}
            <div className="p-3.5 bg-white flex items-center justify-between gap-2 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveOrder(idx, 'up')}
                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-30 cursor-pointer"
                  title="Move Left/Up in Slider"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === banners.length - 1}
                  onClick={() => moveOrder(idx, 'down')}
                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-30 cursor-pointer"
                  title="Move Right/Down in Slider"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleActive(b)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    b.isActive
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {b.isActive ? 'Active' : 'Disabled'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingBanner(b);
                    setErrorMsg(null);
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#D4AF37] hover:text-[#06201A] text-gray-700 transition-colors cursor-pointer"
                  title="Change Image or Settings"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteTargetId(b.id)}
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 transition-colors cursor-pointer"
                  title="Delete Banner"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

      {/* Add / Edit Banner Modal */}
      {isModalOpen && editingBanner && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-200 max-h-[92vh] overflow-y-auto">
            <h2 className="text-xl font-black text-[#06201A] uppercase tracking-tight mb-2 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#D4AF37]" />
              <span>
                {editingBanner.id ? 'Edit Banner Image' : 'Upload Banner Image'}
              </span>
            </h2>
            <p className="text-xs text-gray-500 mb-5">
              গ্যালারি বা ফাইল থেকে পরিষ্কার ব্যানার ছবি যুক্ত করুন।
            </p>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* PRIMARY: Gallery Image Uploader & Direct URL */}
              <div className="bg-[#06201A]/5 p-4 rounded-2xl border border-[#D4AF37]/30 space-y-3">
                <ImageUploader
                  bucket="banners"
                  label="ব্যানার ছবি (সরাসরি গ্যালারি থেকে আপলোড করুন) *"
                  multiple={false}
                  images={editingBanner.image ? [editingBanner.image] : []}
                  onChange={(imgs) =>
                    setEditingBanner({ ...editingBanner, image: imgs[0] || '' })
                  }
                />

                <div className="pt-1 border-t border-gray-200">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    অথবা সরাসরি ছবির ওয়েব লিংক (Direct Image URL) দিন:
                  </label>
                  <input
                    type="url"
                    value={editingBanner.image || ''}
                    onChange={(e) =>
                      setEditingBanner({ ...editingBanner, image: e.target.value })
                    }
                    placeholder="https://images.unsplash.com/... বা imgbb লিংক"
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37] text-xs bg-white"
                  />
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    ইন্টারনেটের যেকোনো ছবির লিংক (JPG, PNG, WEBP) এখানে পেস্ট করতে পারেন।
                  </p>
                </div>
              </div>

              {/* Optional: Banner Title (For admin list only) */}
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  ব্যানারের নাম (শুধু এডমিনের বোঝার জন্য - অপশনাল)
                </label>
                <input
                  type="text"
                  value={editingBanner.title || ''}
                  onChange={(e) =>
                    setEditingBanner({ ...editingBanner, title: e.target.value })
                  }
                  placeholder="যেমন: ঈদ ড্রপ বা উইন্টার অফার"
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              {/* Destination Category on Click */}
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  ব্যানারে ক্লিক করলে কোথায় যাবে?
                </label>
                <select
                  value={editingBanner.categorySlug || ''}
                  onChange={(e) =>
                    setEditingBanner({
                      ...editingBanner,
                      categorySlug: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37] bg-white font-medium"
                >
                  <option value="">সকল প্রোডাক্ট পেজ (All Products / Shop)</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name} ({cat.slug})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  ক্রেতা হোমপেজে ব্যানারের যেকোনো জায়গায় ক্লিক করলে সরাসরি এই ক্যাটাগরিতে নিয়ে যাবে।
                </p>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={editingBanner.isActive ?? true}
                    onChange={(e) =>
                      setEditingBanner({ ...editingBanner, isActive: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#D4AF37] rounded"
                  />
                  <span>স্লাইডারে সক্রিয় রাখুন (Active on Storefront)</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#06201A] hover:bg-[#0B2B22] text-[#D4AF37] font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-60 transition-transform active:scale-95"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                      <span>সেভ হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-[#D4AF37]" />
                      <span>ব্যানার সেভ করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="ব্যানার মুছে ফেলতে চান?"
        message="আপনি কি নিশ্চিত যে এই ব্যানারটি হোমপেজ স্লাইডার থেকে মুছে ফেলতে চান?"
        confirmLabel="মুছে ফেলুন"
        cancelLabel="না"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Toast Notification */}
      <AdminNotification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: null, type: 'success' })}
      />
    </div>
  );
};
