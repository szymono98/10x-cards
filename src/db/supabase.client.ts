import { createClient } from '@supabase/supabase-js'
import { type Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseKey)

export const DEFAULT_USER_ID = "6e61325f-0a6f-4404-8e55-f704bde8e5dd";