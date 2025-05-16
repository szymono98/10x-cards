import { createClient } from '@supabase/supabase-js';

interface SupabaseConfig {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
}

export function createSupabaseClient(config: SupabaseConfig) {
  return createClient(config.NEXT_PUBLIC_SUPABASE_URL, config.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
