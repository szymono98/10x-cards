import { createClient } from '@supabase/supabase-js';
import { type Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    autoRefreshToken: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  },
  global: {
    headers: {
      'X-Client-Info': '10x-cards-cloudflare'
    }
  },
  db: {
    schema: 'public'
  }
});

// Fixed UUID for anonymous users
export const ANONYMOUS_USER_ID = '00000000-0000-0000-0000-000000000000';
