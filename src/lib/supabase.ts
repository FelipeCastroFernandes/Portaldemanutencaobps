import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

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
