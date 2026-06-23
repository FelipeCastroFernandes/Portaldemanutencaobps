import { createClient } from '@supabase/supabase-js';

// Vite exposes env vars via import.meta.env with the VITE_ prefix.
// Fallback to NEXT_PUBLIC_ for local backwards compatibility.
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_URL ||
  '';
let supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

// If the key is misconfigured as equal to the URL or contains the local string placeholder
if (supabaseAnonKey === supabaseUrl || supabaseAnonKey.startsWith('http') || supabaseAnonKey === 'undefined') {
  supabaseAnonKey = '';
}

export const isSupabaseConfigured = (): boolean => {
  return !!supabaseUrl && !!supabaseAnonKey && supabaseUrl !== 'undefined';
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
