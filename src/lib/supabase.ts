import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

/**
 * Checks if Supabase project environment variables are present and valid
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-anon-key')
)

if (!isSupabaseConfigured) {
  console.warn(
    '[Supabase][WARN] -> VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing or using placeholder values in .env. Real-time database calls will require valid credentials.'
  )
}

/**
 * Singleton Supabase Client
 */
export const supabase = createClient<any>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
)

