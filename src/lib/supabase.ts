import { createClient } from '@supabase/supabase-js';

// Read from Vite environment variables with graceful fallback to user-provided credentials
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://iuvgammnubrarjyenbxi.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_497tjJOz_L9950HFlJZ4DQ_VBn9b6yV';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const SUPABASE_CONFIG = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  projectId: 'iuvgammnubrarjyenbxi',
};
