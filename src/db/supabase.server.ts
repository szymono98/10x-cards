import { createClient } from '@supabase/supabase-js';
import { type Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const url = new URL(supabaseUrl);

export const supabaseServer = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'X-Client-Info': '10x-cards-cloudflare',
      'Origin': 'https://10x-cards.pages.dev',
      'Host': url.hostname,
    }
  }
});
