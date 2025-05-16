import { createClient } from '@supabase/supabase-js';
import type { Database } from '../db/database.types';

interface Env {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
}

export function createSupabaseClient(env: Env) {
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        flowType: 'pkce',
        detectSessionInUrl: true,
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
    }
  );
}