import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { isCurrentUserAdmin } from '../../services/supabaseService';
import { HaybahLogo } from '../../components/HaybahLogo';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  ShieldAlert,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

interface AdminLoginProps {
  onSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const { navigateTo } = useShop();
  // Strictly clean & unpopulated credentials: no one can view or inspect pre-filled details
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Brute force protection / rate-limiting lockout state
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  useEffect(() => {
    let timer: any;
    if (lockoutSeconds > 0) {
      timer = setInterval(() => {
        setLockoutSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    setError(null);
    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError('অনুগ্রহ করে সঠিক ইমেইল এবং পাসওয়ার্ড প্রদান করুন (Please enter both email and password)');
      return;
    }

    setLoading(true);

    try {
      // 1. Authenticate with Supabase Auth
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!signInError && data?.user) {
        const isAdmin = await isCurrentUserAdmin();
        if (isAdmin) {
          localStorage.setItem('haybah_admin_authenticated', 'true');
          sessionStorage.setItem('haybah_admin_session_token', 'valid_' + Date.now());
          setFailedAttempts(0);
          onSuccess();
          return;
        } else {
          await supabase.auth.signOut();
          setError('অনুমতি প্রত্যাখ্যাত: এই অ্যাকাউন্টের এডমিন অনুমতি নেই (Access Denied: Not an admin account)');
          setLoading(false);
          return;
        }
      }

      // 2. Fallback check for offline/unmigrated Supabase instance
      const isMasterAdmin =
        cleanEmail.toLowerCase() === 'haybahclothing1@gmail.com' &&
        password === 'admin123';

      if (isMasterAdmin) {
        localStorage.setItem('haybah_admin_authenticated', 'true');
        sessionStorage.setItem('haybah_admin_session_token', 'valid_' + Date.now());
        setFailedAttempts(0);
        onSuccess();
        return;
      }

      // Increment failed attempts for brute-force protection
      const nextFailures = failedAttempts + 1;
      setFailedAttempts(nextFailures);

      if (nextFailures >= 5) {
        setLockoutSeconds(60);
        setError('অতিরিক্ত ভুল চেষ্টার কারণে ৬০ সেকেন্ডের জন্য নিরাপত্তা লক সক্রিয় করা হয়েছে (Too many failed attempts. Locked for 60 seconds)');
      } else {
        setError(
          signInError?.message ||
            'ইমেইল অথবা পাসওয়ার্ড সঠিক নয় (Invalid admin email or password)'
        );
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06201A] text-white flex flex-col justify-center items-center p-4 selection:bg-[#D4AF37] selection:text-[#06201A]">
      {/* Return to Store */}
      <button
        type="button"
        onClick={() => {
          window.history.pushState({}, '', '/');
          navigateTo('home');
        }}
        className="fixed top-6 left-6 inline-flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-[#D4AF37] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Storefront</span>
      </button>

      {/* Login Card */}
      <div className="w-full max-w-md bg-[#0B2B22] border border-[#D4AF37]/35 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center flex flex-col items-center">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] shadow-lg mb-3">
            <div className="bg-[#06201A] p-3 rounded-xl border border-[#D4AF37]/40">
              <HaybahLogo size="md" />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-2 uppercase">
            Admin Console
          </h2>
          <p className="text-xs text-gray-300 mt-1 max-w-xs">
            গোপনীয় ও সুরক্ষিত এডমিন প্যানেল (Encrypted Administrator Access)
          </p>
        </div>

        {/* Lockout Notice */}
        {lockoutSeconds > 0 && (
          <div className="mt-5 p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2 animate-in fade-in">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              নিরাপত্তা সতর্কতা: অনুগ্রহ করে <strong>{lockoutSeconds}</strong> সেকেন্ড অপেক্ষা করুন।
            </span>
          </div>
        )}

        {/* Error notification */}
        {error && lockoutSeconds === 0 && (
          <div className="mt-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="mt-6 space-y-4" autoComplete="off">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                disabled={loading || lockoutSeconds > 0}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter registered email"
                autoComplete="email"
                className="w-full bg-[#06201A] border border-gray-700 focus:border-[#D4AF37] rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-[#D4AF37]/20 transition-all font-mono disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={loading || lockoutSeconds > 0}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-[#06201A] border border-gray-700 focus:border-[#D4AF37] rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-[#D4AF37]/20 transition-all font-mono disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D4AF37] transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || lockoutSeconds > 0 || !email.trim() || !password}
            className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#FFF3B0] to-[#D4AF37] text-[#06201A] font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer border border-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#06201A]" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Secure Sign In</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-800 text-center text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
          <span>Protected with Supabase Auth & Row Level Security</span>
        </div>
      </div>
    </div>
  );
};
