import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/db/database.types';
import * as dotenv from 'dotenv';

// Load environment variables from .env.test for e2e tests
dotenv.config({ path: '.env.test' });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required in .env.test');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required in .env.test');
}

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false }
  }
);

export async function teardownTestDatabase() {
  try {
    // Usuwamy dane z tabel w odpowiedniej kolejności ze względu na foreign keys
    await supabase.from('flashcards').delete().neq('id', 0);
    await supabase.from('generation_error_logs').delete().neq('id', 0);
    await supabase.from('generations').delete().neq('id', 0);
    
    console.log('Test database teardown completed successfully');
  } catch (error) {
    console.error('Error during test database teardown:', error);
    throw error;
  }
}