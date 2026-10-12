import React, { useState, useEffect } from 'react';
import {
  Settings,
  Lock,
  Globe,
  Truck,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Save,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { SiteSettings } from '../../types';
import { fetchLiveSiteSettings, adminSaveSiteSettings } from '../../services/supabaseService';
import { supabase } from '../../lib/supabase';

export const SettingsView: React.FC = () => {
  // Site settings state
  const [settings, setSettings] = useState<SiteSettings>({
    brandName: 'HAYBAH',
    helpline: '+880 1642-247530',
    helplineHours: '(11:00 AM – 08:00 PM)',
    email: 'haybahclothing1@gmail.com',
    whatsapp: '+8801642247530',
    marqueeText:
      'FREE SHIPPING ON ORDERS OVER ৳2000! | CASH ON DELIVERY AVAILABLE ALL OVER BANGLADESH | 7-DAY EXCHANGE POLICY',
    shippingInsideDhaka: 80,
    shippingOutsideDhaka: 120,
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [adminUserEmail, setAdminUserEmail] = useState('Admin Account');

  useEffect(() => {
    async function load() {
      const live = await fetchLiveSiteSettings();
      setSettings(live);

      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setAdminUserEmail(user.email);
      }
    }
    load();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);

    const ok = await adminSaveSiteSettings(settings);
    setSavingSettings(false);
    if (ok) {
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setUpdatingPassword(true);

    try {
      // First verify current password by attempting sign in
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email && currentPassword) {
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });

        if (verifyError) {
          setPasswordError('Current password is not correct.');
          setUpdatingPassword(false);
          return;
        }
      }

      // Update password via Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setPasswordError(updateError.message);
      } else {
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(false), 4000);
      }
    } catch (err: any) {
      setPasswordError(err?.message || 'Password update failed.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Password strength calculation
  const getStrength = (pwd: string) => {
    if (!pwd) return { score: 0, text: '', color: 'bg-gray-200' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score: 1, text: 'Weak', color: 'bg-rose-500' };
    if (score <= 4) return { score: 2, text: 'Medium', color: 'bg-amber-500' };
    return { score: 3, text: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getStrength(newPassword);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-black text-[#06201A] uppercase tracking-tight">
          Admin & Store Settings
        </h1>
        <p className="text-xs text-gray-500">
          Configure site-wide parameters, shipping rates, and account security
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Site Settings Form */}
        <div className="md:col-span-7 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-black text-sm uppercase tracking-wider text-[#06201A] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#D4AF37]" />
              <span>Storefront Configuration</span>
            </h3>

            {settingsSuccess && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved successfully!</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">
                Brand Name (Strictly No &quot;Clothing&quot;)
              </label>
              <input
                type="text"
                value={settings.brandName}
                onChange={(e) =>
                  setSettings({ ...settings, brandName: e.target.value })
                }
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37] font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Helpline Phone
                </label>
                <input
                  type="text"
                  value={settings.helpline}
                  onChange={(e) =>
                    setSettings({ ...settings, helpline: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37] font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Working Hours
                </label>
                <input
                  type="text"
                  value={settings.helplineHours}
                  onChange={(e) =>
                    setSettings({ ...settings, helplineHours: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) =>
                    setSettings({ ...settings, email: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37] font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="text"
                  value={settings.whatsapp}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsapp: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">
                Top Announcement Bar Text (Marquee)
              </label>
              <textarea
                rows={2}
                value={settings.marqueeText}
                onChange={(e) =>
                  setSettings({ ...settings, marqueeText: e.target.value })
                }
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37]"
              />
            </div>

            {/* Shipping Fees */}
            <div className="pt-2 border-t border-gray-100">
              <span className="block font-bold text-gray-700 uppercase mb-2 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Delivery Charges (BDT)</span>
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">
                    Inside Dhaka (৳)
                  </label>
                  <input
                    type="number"
                    value={settings.shippingInsideDhaka}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        shippingInsideDhaka: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37] font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">
                    Outside Dhaka (৳)
                  </label>
                  <input
                    type="number"
                    value={settings.shippingOutsideDhaka}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        shippingOutsideDhaka: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37] font-bold"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="w-full py-3 rounded-xl bg-[#06201A] hover:bg-[#0B2B22] text-[#D4AF37] font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Save className="w-4 h-4 text-[#D4AF37]" />
              <span>{savingSettings ? 'Saving to Database...' : 'Save Site Settings'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Change Password & Security */}
        <div className="md:col-span-5 space-y-6">
          {/* Change Password Box */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <div className="pb-3 border-b border-gray-100">
              <h3 className="font-black text-sm uppercase tracking-wider text-[#06201A] flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#D4AF37]" />
                <span>Change Admin Password</span>
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Updates password on Supabase Auth
              </p>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Password changed successfully!</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Current Password
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {newPassword && (
                  <div className="mt-1.5 flex items-center justify-between text-[10px]">
                    <span className="text-gray-500">Strength: {strength.text}</span>
                    <div className="flex gap-1">
                      <span
                        className={`w-6 h-1 rounded-full ${
                          strength.score >= 1 ? strength.color : 'bg-gray-200'
                        }`}
                      />
                      <span
                        className={`w-6 h-1 rounded-full ${
                          strength.score >= 2 ? strength.color : 'bg-gray-200'
                        }`}
                      />
                      <span
                        className={`w-6 h-1 rounded-full ${
                          strength.score >= 3 ? strength.color : 'bg-gray-200'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D4AF37]"
                />
              </div>

              <button
                type="submit"
                disabled={updatingPassword}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#FFF3B0] to-[#D4AF37] text-[#06201A] font-black uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer border border-[#D4AF37]"
              >
                {updatingPassword ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Admin Profile Box */}
          <div className="bg-[#06201A] text-white p-6 rounded-3xl border border-[#D4AF37]/40 shadow-lg space-y-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37] text-[#06201A] font-black flex items-center justify-center text-lg shadow-md">
                H
              </div>
              <div>
                <h4 className="font-black text-sm text-white">HAYBAH Admin</h4>
                <p className="text-[11px] text-[#E8CE7A] font-mono">{adminUserEmail}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-800 space-y-1.5 text-gray-300 text-[11px]">
              <p className="flex justify-between">
                <span>Account Role:</span>
                <strong className="text-[#FFF5C0]">Super Administrator</strong>
              </p>
              <p className="flex justify-between">
                <span>Database:</span>
                <strong className="font-mono text-gray-400">iuvgammnubrarjyenbxi</strong>
              </p>
              <p className="flex justify-between">
                <span>Security Engine:</span>
                <strong className="text-emerald-400">RLS + Security Definer</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
