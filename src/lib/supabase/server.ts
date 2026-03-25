import { createClient as createSupabaseClient } from '@supabase/supabase-js';

function getRequiredEnv(name: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY' | 'SUPABASE_SERVICE_ROLE_KEY') {
  return process.env[name] || (name === 'NEXT_PUBLIC_SUPABASE_URL' ? 'https://placeholder.supabase.co' : 'placeholder');
}

const supabaseUrl = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
const supabaseServiceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');

const serverAuthOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
};

export const createServerSupabase = () =>
  createSupabaseClient(supabaseUrl, supabaseAnonKey, serverAuthOptions);

export const createServiceRoleSupabase = () =>
  createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, serverAuthOptions);

/** Authenticated client using a user JWT (used by portal API routes). */
export const createClient = (token?: string) =>
  createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    ...serverAuthOptions,
    ...(token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {}),
  });
