import { supabase } from '../lib/supabase';

const DEFAULT_ADMIN_EMAIL = 'haybahclothing1@gmail.com';
const DEFAULT_ADMIN_PASSWORD = 'admin123';
const STORAGE_KEY_PASSWORD = 'haybah_admin_custom_password';
const STORAGE_KEY_EMAIL = 'haybah_admin_custom_email';
const STORAGE_KEY_UPDATED_AT = 'haybah_admin_password_updated_at';

// Simple reversible obfuscation for storing inside the db role field (format: super_admin#enc:<data>)
function encodeSecret(str: string): string {
  try {
    return btoa(encodeURIComponent(str));
  } catch {
    return btoa(str);
  }
}

function decodeSecret(encoded: string): string {
  try {
    return decodeURIComponent(atob(encoded));
  } catch {
    try {
      return atob(encoded);
    } catch {
      return '';
    }
  }
}

/**
 * Retrieves the currently active admin password.
 * Checks Supabase DB `admins` table first, then falls back to localStorage, then default 'admin123'.
 */
export async function getActiveAdminPassword(): Promise<string> {
  try {
    // 1. Try querying Supabase admins table
    const { data, error } = await supabase
      .from('admins')
      .select('role')
      .limit(1)
      .maybeSingle();

    if (!error && data?.role && typeof data.role === 'string') {
      if (data.role.startsWith('super_admin#enc:')) {
        const raw = data.role.slice('super_admin#enc:'.length);
        const decoded = decodeSecret(raw);
        if (decoded) {
          // Sync with local storage if available
          if (typeof window !== 'undefined' && window.localStorage) {
            try {
              window.localStorage.setItem(STORAGE_KEY_PASSWORD, decoded);
            } catch {}
          }
          return decoded;
        }
      }
    }
  } catch (err) {
    console.warn('Could not fetch admin password from Supabase:', err);
  }

  // 2. Fallback to localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const localPass = window.localStorage.getItem(STORAGE_KEY_PASSWORD);
      if (localPass) return localPass;
    } catch {}
  }

  // 3. Default master password
  return DEFAULT_ADMIN_PASSWORD;
}

/**
 * Retrieves the currently active admin email.
 */
export async function getActiveAdminEmail(): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) return user.email;
  } catch {}

  try {
    const { data } = await supabase
      .from('admins')
      .select('email')
      .limit(1)
      .maybeSingle();
    if (data?.email) return data.email;
  } catch {}

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const localEmail = window.localStorage.getItem(STORAGE_KEY_EMAIL);
      if (localEmail) return localEmail;
    } catch {}
  }

  return DEFAULT_ADMIN_EMAIL;
}

/**
 * Verifies if the entered current password matches the active admin password.
 */
export async function verifyAdminCurrentPassword(
  enteredPassword: string,
  email?: string
): Promise<boolean> {
  const cleanPass = enteredPassword.trim();
  if (!cleanPass) return false;

  // 1. Try Supabase Auth sign-in verification if user has Supabase Auth
  try {
    const adminEmail = email || (await getActiveAdminEmail());
    const { data, error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: cleanPass,
    });
    if (!error && data?.user) {
      return true;
    }
  } catch {}

  // 2. Verify against active DB/local password
  const activePass = await getActiveAdminPassword();
  if (cleanPass === activePass) {
    return true;
  }

  return false;
}

/**
 * Updates the admin password in Supabase DB, localStorage, and Supabase Auth.
 */
export async function updateAdminPassword(
  newPassword: string,
  email?: string
): Promise<{ success: boolean; error?: string }> {
  const cleanPass = newPassword.trim();
  if (!cleanPass || cleanPass.length < 6) {
    return {
      success: false,
      error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে (Password must be at least 6 characters).',
    };
  }

  const adminEmail = (email || (await getActiveAdminEmail())).toLowerCase().trim();
  let updatedAnywhere = false;
  let lastErrorMessage = '';

  // 1. Update Supabase admins table for cross-device persistence
  try {
    const encoded = encodeSecret(cleanPass);
    const newRole = `super_admin#enc:${encoded}`;

    // Update by email or first admin record
    const { error: updateDbError } = await supabase
      .from('admins')
      .update({ role: newRole })
      .or(`email.eq.${adminEmail},role.ilike.super_admin%`);

    if (!updateDbError) {
      updatedAnywhere = true;
    } else {
      console.warn('DB admins update error:', updateDbError);
    }
  } catch (err: any) {
    console.warn('DB update exception:', err);
    lastErrorMessage = err?.message || '';
  }

  // 2. Always persist to localStorage for instant local access
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY_PASSWORD, cleanPass);
      window.localStorage.setItem(STORAGE_KEY_EMAIL, adminEmail);
      window.localStorage.setItem(STORAGE_KEY_UPDATED_AT, new Date().toISOString());
      updatedAnywhere = true;
    } catch (err: any) {
      console.warn('localStorage save error:', err);
    }
  } else {
    updatedAnywhere = true;
  }

  // 3. If there is an active Supabase Auth user session, update it as well
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error: authError } = await supabase.auth.updateUser({
        password: cleanPass,
      });
      if (authError) {
        console.warn('Supabase Auth updateUser warning:', authError.message);
      }
    }
  } catch (authErr) {
    console.warn('Supabase Auth update exception:', authErr);
  }

  if (updatedAnywhere) {
    return { success: true };
  }

  return {
    success: false,
    error: lastErrorMessage || 'পাসওয়ার্ড আপডেট করতে সমস্যা হয়েছে (Password update failed).',
  };
}
