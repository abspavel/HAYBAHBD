import React, { useState, useEffect } from 'react';
import {
  User,
  Package,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  Truck,
  ChevronRight,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Edit2,
  CheckCircle2,
  ShoppingBag,
  Download,
  AlertCircle,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { OrderDetails } from '../types';
import {
  CustomerAccount,
  getActiveCustomerSession,
  setActiveCustomerSession,
  saveRegisteredCustomer,
  findCustomerByCredentials,
} from '../services/localAdminStore';
import { supabase } from '../lib/supabase';
import { downloadInvoicePdf } from '../utils/generateInvoice';

export const AccountView: React.FC = () => {
  const { orders, navigateTo, setIsTrackOrderModalOpen, showToast } = useShop();

  // Active customer session state
  const [customer, setCustomer] = useState<CustomerAccount | null>(() => getActiveCustomerSession());

  // Auth toggle: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Sign In inputs
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Sign Up inputs
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupAddress, setSignupAddress] = useState('');
  const [showSignupPass, setShowSignupPass] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);

  // Profile Edit Modal state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [cloudOrders, setCloudOrders] = useState<OrderDetails[] | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (customer) {
      setEditName(customer.name);
      setEditPhone(customer.phone);
      setEditAddress(customer.address || '');

      const fetchMyLiveOrders = async () => {
        setLoadingOrders(true);
        try {
          const cleanP = customer.phone.replace(/[^0-9]/g, '');
          const last10 = cleanP.slice(-10);
          if (last10) {
            const { data, error } = await supabase
              .from('orders')
              .select('*, order_items(*)')
              .ilike('phone', `%${last10}%`)
              .order('created_at', { ascending: false });

            if (!error && Array.isArray(data)) {
              const mapped: OrderDetails[] = data.map((o: any) => ({
                orderId: o.order_number || o.id,
                customerName: o.customer_name || customer.name,
                phone: o.phone || customer.phone,
                address: o.address || '',
                district: o.district || '',
                thana: o.thana || '',
                city: o.city || 'Inside Dhaka',
                paymentMethod: o.payment_method || 'Cash on Delivery',
                subtotal: Number(o.subtotal || 0),
                deliveryFee: Number(o.delivery_fee || 0),
                discount: Number(o.discount || 0),
                total: Number(o.total || 0),
                status: o.status || 'pending',
                notes: o.notes || '',
                couponCode: o.coupon_code || '',
                createdAt: o.created_at
                  ? new Date(o.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Recent',
                updatedAt: o.updated_at,
                items: (o.order_items || []).map((it: any) => ({
                  id: it.id,
                  productId: it.product_id,
                  product: {
                    id: it.product_id,
                    name: it.product_name || 'Item',
                    price: Number(it.unit_price || it.price || 0),
                    image: it.product_image || '',
                    sizes: [it.selected_size || it.size || 'L'],
                  } as any,
                  selectedSize: it.selected_size || it.size || 'L',
                  quantity: Number(it.quantity || 1),
                })),
              }));
              setCloudOrders(mapped);
            }
          }
        } catch (err) {
          console.warn('Customer live orders fetch note:', err);
        } finally {
          setLoadingOrders(false);
        }
      };

      fetchMyLiveOrders();
    }
  }, [customer]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const trimmedId = loginIdentifier.trim();
      const trimmedPass = loginPassword.trim();

      if (!trimmedId || !trimmedPass) {
        setLoginError('অনুগ্রহ করে আপনার ইমেইল/ফোন নম্বর এবং পাসওয়ার্ড প্রদান করুন।');
        setIsLoggingIn(false);
        return;
      }

      // 1. Check local customer database
      const matched = findCustomerByCredentials(trimmedId, trimmedPass);
      if (matched) {
        setActiveCustomerSession(matched);
        setCustomer(matched);
        showToast(`স্বাগতম, ${matched.name}!`);
        setIsLoggingIn(false);
        return;
      }

      // 2. Fallback check Supabase customers table if online
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .or(`email.ilike.${trimmedId},phone.ilike.%${trimmedId.replace(/[^0-9]/g, '').slice(-10)}%`)
          .maybeSingle();

        if (data) {
          // If password_hash is recorded in remote database, verify it
          if (data.password_hash && data.password_hash.trim() !== '' && data.password_hash !== trimmedPass) {
            setLoginError('পাসওয়ার্ড সঠিক নয়। দয়া করে আবার চেষ্টা করুন।');
            setIsLoggingIn(false);
            return;
          }

          const sessionUser: CustomerAccount = {
            id: data.id || `cust-${Date.now()}`,
            name: data.name || 'Shopper',
            email: data.email || trimmedId,
            phone: data.phone || trimmedId,
            password: trimmedPass,
            address: data.address || '',
            city: data.city || 'Inside Dhaka',
            district: data.district || '',
            thana: data.thana || '',
            createdAt: data.created_at || new Date().toISOString(),
          };
          saveRegisteredCustomer(sessionUser);
          setActiveCustomerSession(sessionUser);
          setCustomer(sessionUser);
          showToast(`স্বাগতম, ${sessionUser.name}!`);
          setIsLoggingIn(false);
          return;
        }
      } catch (err) {
        console.warn('Supabase customer login note:', err);
      }

      setLoginError('ইমেইল/ফোন নম্বর অথবা পাসওয়ার্ড সঠিক নয়। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    setIsSigningUp(true);

    try {
      const cleanName = signupName.trim();
      const cleanEmail = signupEmail.trim().toLowerCase();
      const cleanPhone = signupPhone.trim();
      const cleanPass = signupPassword.trim();

      if (!cleanName) {
        setSignupError('অনুগ্রহ করে আপনার পুরো নাম প্রদান করুন।');
        setIsSigningUp(false);
        return;
      }

      if (!cleanPhone || cleanPhone.length < 11) {
        setSignupError('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017xxxxxxxx)');
        setIsSigningUp(false);
        return;
      }

      if (cleanPass.length < 6) {
        setSignupError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
        setIsSigningUp(false);
        return;
      }

      if (cleanPass !== signupConfirmPassword.trim()) {
        setSignupError('পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না।');
        setIsSigningUp(false);
        return;
      }

      const newAccount: CustomerAccount = {
        id: `cust-${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password: cleanPass,
        address: signupAddress.trim(),
        city: 'Inside Dhaka',
        createdAt: new Date().toISOString(),
      };

      // Save locally
      saveRegisteredCustomer(newAccount);
      setActiveCustomerSession(newAccount);
      setCustomer(newAccount);

      // Attempt remote sync in Supabase customers table
      try {
        await supabase.from('customers').upsert({
          id: newAccount.id,
          name: newAccount.name,
          email: newAccount.email,
          phone: newAccount.phone,
          address: newAccount.address,
          password_hash: newAccount.password,
          total_orders: 0,
          total_spent: 0,
          created_at: newAccount.createdAt,
        });
      } catch (err) {
        console.warn('Remote customer sync note:', err);
      }

      showToast('আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!');
    } finally {
      setIsSigningUp(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setActiveCustomerSession(null);
    setCustomer(null);
    showToast('সফলভাবে লগআউট হয়েছেন।');
  };

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    setIsSavingProfile(true);

    const updated: CustomerAccount = {
      ...customer,
      name: editName.trim() || customer.name,
      phone: editPhone.trim() || customer.phone,
      address: editAddress.trim(),
    };

    saveRegisteredCustomer(updated);
    setActiveCustomerSession(updated);
    setCustomer(updated);

    try {
      await supabase.from('customers').update({
        name: updated.name,
        phone: updated.phone,
        address: updated.address,
      }).eq('id', updated.id);
    } catch {}

    setIsSavingProfile(false);
    setIsEditingProfile(false);
    showToast('প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!');
  };

  // ----------------------------------------------------
  // IF NOT LOGGED IN: Render Login / Sign Up Page
  // ----------------------------------------------------
  if (!customer) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 sm:py-12">
        <button
          type="button"
          onClick={() => navigateTo('home')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#06201A] hover:text-[#AA820A] transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>মূল পাতায় ফিরে যান (Back to Home)</span>
        </button>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-xl">
          {/* Logo & Heading */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#06201A] text-[#D4AF37] border-2 border-[#D4AF37] flex items-center justify-center font-bold text-2xl font-brand mx-auto mb-3 shadow-md">
              H
            </div>
            <h1 className="text-2xl font-black text-[#06201A] tracking-tight">
              {authMode === 'signin' ? 'কাস্টমার লগইন' : 'নতুন অ্যাকাউন্ট খুলুন'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {authMode === 'signin'
                ? 'আপনার নিজস্ব অর্ডার হিস্ট্রি দেখতে ও ট্র্যাক করতে লগইন করুন'
                : 'আপনার নাম, মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে একাউন্ট তৈরি করুন'}
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setLoginError(null);
              }}
              className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-[#06201A] text-[#D4AF37] shadow-sm'
                  : 'text-gray-600 hover:text-[#06201A]'
              }`}
            >
              সাইন ইন (Sign In)
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setSignupError(null);
              }}
              className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-[#06201A] text-[#D4AF37] shadow-sm'
                  : 'text-gray-600 hover:text-[#06201A]'
              }`}
            >
              রেজিস্ট্রেশন (Sign Up)
            </button>
          </div>

          {/* SIGN IN FORM */}
          {authMode === 'signin' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-gray-700 mb-1">
                  ইমেইল অথবা মোবাইল নম্বর
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="017xxxxxxxx বা user@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 mb-1">
                  পাসওয়ার্ড
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPass ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPass(!showLoginPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#06201A] via-[#0B2B22] to-[#041511] text-[#D4AF37] border border-[#D4AF37]/40 font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all cursor-pointer mt-2 disabled:opacity-50"
              >
                {isLoggingIn ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-gray-500">
                  অ্যাকাউন্ট নেই?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setSignupError(null);
                    }}
                    className="font-bold text-[#AA820A] hover:underline cursor-pointer"
                  >
                    নতুন অ্যাকাউন্ট খুলুন
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* SIGN UP FORM */
            <form onSubmit={handleSignUp} className="space-y-3.5">
              {signupError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{signupError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-gray-700 mb-1">
                  আপনার নাম *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="আপনার পুরো নাম"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 mb-1">
                  মোবাইল নম্বর * (১১ ডিজিট)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 mb-1">
                  ইমেইল অ্যাড্রেস
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="yourname@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 mb-1">
                  পাসওয়ার্ড * (কমপক্ষে ৬ অক্ষর)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showSignupPass ? 'text' : 'password'}
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="পাসওয়ার্ড নির্ধারণ করুন"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPass(!showSignupPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    {showSignupPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 mb-1">
                  পাসওয়ার্ড নিশ্চিত করুন *
                </label>
                <input
                  type={showSignupPass ? 'text' : 'password'}
                  required
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="পুনরায় পাসওয়ার্ড লিখুন"
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 mb-1">
                  ডিফল্ট ডেলিভারি ঠিকানা (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={signupAddress}
                  onChange={(e) => setSignupAddress(e.target.value)}
                  placeholder="বাসা নং, রোড, এরিয়া, থানা"
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              <button
                type="submit"
                disabled={isSigningUp}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#FFF3B0] to-[#D4AF37] text-[#06201A] font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all cursor-pointer mt-3 border border-[#D4AF37] disabled:opacity-50"
              >
                {isSigningUp ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'অ্যাকাউন্ট তৈরি করুন'}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-gray-500">
                  ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      setLoginError(null);
                    }}
                    className="font-bold text-[#AA820A] hover:underline cursor-pointer"
                  >
                    লগইন করুন
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // IF LOGGED IN: Render Dedicated Customer Dashboard
  // ----------------------------------------------------
  const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
  const bareNumber = cleanPhone.slice(-10);

  // Filter orders strictly for this customer only
  const localCustomerOrders = orders.filter((o) => {
    const oPhone = (o.phone || '').replace(/[^0-9]/g, '');
    const phoneMatch = Boolean(bareNumber && oPhone.endsWith(bareNumber));
    const nameMatch = Boolean(
      o.customerName &&
        customer.name &&
        o.customerName.trim().toLowerCase() === customer.name.trim().toLowerCase()
    );
    return phoneMatch || (nameMatch && phoneMatch);
  });

  const myOrders = cloudOrders !== null ? cloudOrders : localCustomerOrders;

  const totalSpent = myOrders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.total : sum), 0);
  const pendingCount = myOrders.filter((o) => o.status === 'pending' || o.status === 'Order Placed' || o.status === 'confirmed').length;
  const deliveredCount = myOrders.filter((o) => o.status === 'delivered').length;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => navigateTo('home')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#06201A] hover:text-[#AA820A] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>মূল পাতায় ফিরে যান (Home)</span>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>লগআউট</span>
        </button>
      </div>

      {/* Customer Profile Banner Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-md mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-full bg-[#06201A] text-[#D4AF37] border-2 border-[#D4AF37] flex items-center justify-center font-bold text-3xl font-brand shrink-0 shadow-lg">
            {customer.name.slice(0, 1).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FAF7EC] text-[#AA820A] text-[11px] font-black uppercase tracking-wider mb-1.5 border border-[#D4AF37]/30">
              <ShieldCheck className="w-3 h-3 text-[#AA820A]" />
              <span>HAYBAH Verified Customer</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#06201A] truncate">
              {customer.name}
            </h1>
            <p className="text-xs text-gray-500 mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="font-mono font-bold text-gray-700">{customer.phone}</span>
              {customer.email && (
                <>
                  <span>•</span>
                  <span>{customer.email}</span>
                </>
              )}
            </p>
            {customer.address && (
              <p className="text-[11px] text-gray-500 mt-1 flex items-center justify-center sm:justify-start gap-1">
                <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                <span className="truncate">{customer.address}</span>
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsEditingProfile(true)}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#06201A] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-gray-600" />
              <span>এডিট প্রোফাইল</span>
            </button>
            <button
              type="button"
              onClick={() => setIsTrackOrderModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#06201A] hover:bg-[#0B2B22] text-[#D4AF37] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>অর্ডার ট্র্যাক</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customer Private Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
            মোট অর্ডার (Orders)
          </span>
          <p className="text-2xl font-black text-[#06201A] mt-1">{myOrders.length}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
            মোট শপিং (Total Spent)
          </span>
          <p className="text-2xl font-black text-[#AA820A] mt-1">৳{totalSpent.toLocaleString()}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
            পেন্ডিং ডেলিভারি (Pending)
          </span>
          <p className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
            ডেলিভার্ড সম্পন্ন (Delivered)
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{deliveredCount}</p>
        </div>
      </div>

      {/* Personal Order History Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-md">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
          <h2 className="text-lg font-black text-[#06201A] uppercase tracking-wide flex items-center gap-2">
            <Package className="w-5 h-5 text-[#D4AF37]" />
            <span>আমার অর্ডারসমূহ ({myOrders.length})</span>
          </h2>
          <button
            type="button"
            onClick={() => navigateTo('shop')}
            className="text-xs font-bold text-[#AA820A] hover:underline"
          >
            কালেকশন দেখুন →
          </button>
        </div>

        {myOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-extrabold text-base text-gray-800">আপনি এখনো কোনো অর্ডার করেননি</p>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto mb-5">
              আপনার প্রিমিয়াম হুডি, ড্রপ শোল্ডার টি-শার্ট ও স্ট্রিটওয়্যার কালেকশন সিলেক্ট করে অর্ডার করুন।
            </p>
            <button
              type="button"
              onClick={() => navigateTo('shop')}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-[#06201A] font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              শপিং শুরু করুন (Explore Shop)
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {myOrders.map((ord) => {
              const statusColor =
                ord.status === 'delivered'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : ord.status === 'cancelled'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : ord.status === 'shipped'
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200';

              return (
                <div
                  key={ord.orderId}
                  className="p-5 rounded-2xl bg-[#FBFBFA] border border-gray-200 hover:border-[#D4AF37]/50 transition-all shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200/60">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-[#06201A] text-sm">
                          #{ord.orderId}
                        </span>
                        <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full border ${statusColor}`}>
                          {ord.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        অর্ডারের তারিখ: {ord.createdAt} • {ord.paymentMethod}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">
                        সর্বমোট বিল
                      </span>
                      <span className="font-black text-[#06201A] text-base">
                        ৳{ord.total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="py-3 divide-y divide-gray-100">
                    {ord.items.map((it: any) => (
                      <div key={it.id} className="py-2 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          {it.product?.image ? (
                            <img
                              src={it.product.image}
                              alt={it.product.name}
                              className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                              <ShoppingBag className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-[#06201A]">{it.product?.name || 'Product'}</p>
                            <p className="text-[11px] text-gray-500">
                              সাইজ: {it.selectedSize || 'L'} • পরিমাণ: {it.quantity || 1}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-[#06201A] font-mono">
                          ৳{((it.product?.price || 0) * (it.quantity || 1)).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Location & Buttons */}
                  <div className="pt-3 border-t border-gray-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <p className="text-[11px] text-gray-500 flex items-center gap-1 truncate max-w-md">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>ডেলিভারি ঠিকানা: {ord.address}, {ord.city}</span>
                    </p>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => downloadInvoicePdf(ord)}
                        className="px-3 py-1.5 rounded-xl border border-gray-300 hover:border-gray-400 bg-white text-gray-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        <span>ইনভয়েস</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsTrackOrderModalOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-[#06201A] hover:bg-[#0B2B22] text-[#D4AF37] font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                      >
                        <Truck className="w-3 h-3 text-[#D4AF37]" />
                        <span>ট্র্যাক করুন</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-200 animate-in zoom-in-95">
            <h3 className="font-black text-lg text-[#06201A] mb-1">
              প্রোফাইল তথ্য আপডেট করুন
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              আপনার নাম, মোবাইল নম্বর ও ডেলিভারি ঠিকানা পরিবর্তন করতে পারেন
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">আপনার নাম</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">মোবাইল নম্বর</label>
                <input
                  type="tel"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">ডিফল্ট ডেলিভারি ঠিকানা</label>
                <textarea
                  rows={2}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="বাসা নং, রোড, থানা, জেলা"
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2 rounded-xl bg-[#06201A] text-[#D4AF37] font-black border border-[#D4AF37]/50 shadow-md hover:bg-[#0B2B22] cursor-pointer"
                >
                  {isSavingProfile ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Saved Addresses & Outlets Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
          <h3 className="font-bold text-sm text-[#06201A] flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-[#D4AF37]" />
            <span>ডিফল্ট ডেলিভারি সহায়তা</span>
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            {customer.address || 'আপনার অর্ডার চেকআউটের সময় দেয়া ঠিকানায় ক্যাশ অন ডেলিভারি মারফত পাঠানো হবে।'}
          </p>
          <span className="inline-block mt-3 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            HAYBAH কাস্টমার প্রোফাইল
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
          <h3 className="font-bold text-sm text-[#06201A] flex items-center gap-2 mb-2">
            <Phone className="w-4 h-4 text-[#D4AF37]" />
            <span>কাস্টমার সাপোর্ট ও রিটার্ন</span>
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            অর্ডার, সাইজ পরিবর্তন বা এক্সচেঞ্জ সম্পর্কিত যেকোনো প্রয়োজনে আমাদের হেল্পলাইনে কল করুন।
          </p>
          <a
            href="tel:+8801642247530"
            className="inline-block mt-3 text-xs font-bold text-[#AA820A] hover:underline"
          >
            01642247530 (সকাল ১১টা - রাত ৮টা) →
          </a>
        </div>
      </div>
    </div>
  );
};
