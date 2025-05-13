import { createClient } from '@supabase/supabase-js';
import { type Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const url = new URL(supabaseUrl);

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    detectSessionInUrl: false,
    flowType: 'pkce',
    autoRefreshToken: true
  },
  global: {
    fetch: fetch.bind(globalThis),
    headers: {
      'X-Client-Info': '10x-cards-cloudflare',
      'Origin': 'https://10x-cards.pages.dev',
      'Host': url.hostname
    }
  },
  db: {
    schema: 'public'
  }
});

// Fixed UUID for anonymous users
export const ANONYMOUS_USER_ID = '00000000-0000-0000-0000-000000000000';
