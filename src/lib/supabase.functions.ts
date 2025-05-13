import { createClient } from '@supabase/supabase-js';
import type { Database } from '../db/database.types';

interface Env {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
}

export function createSupabaseClient(env: Env) {
  const supabaseUrl = new URL(env.NEXT_PUBLIC_SUPABASE_URL);
  
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        detectSessionInUrl: false,
        flowType: 'pkce',
        autoRefreshToken: true,
      },
      global: {
        fetch: fetch.bind(globalThis),
        headers: {
          'X-Client-Info': '10x-cards-cloudflare',
          'Origin': 'https://10x-cards.pages.dev',
          'Host': supabaseUrl.hostname,
        }
      },
      db: {
        schema: 'public'
      },
      realtime: {
        headers: {
          'Origin': 'https://10x-cards.pages.dev',
          'Host': supabaseUrl.hostname,
        }
      }
    }
  );
}