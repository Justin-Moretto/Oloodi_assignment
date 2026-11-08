import { createClient } from '@supabase/supabase-js'

import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from '@/lib/env'
import type { Database } from '@/types/database'

/**
 * The anon key is public by design. This demo has no authentication.
 * Direct table writes are denied by RLS. Mutations go through RPC functions.
 * The worker dropdown does not prove identity.
 */
export const supabase = createClient<Database>(
  supabaseUrl ?? 'https://example.supabase.co',
  supabaseAnonKey ?? 'public-anon-key-not-configured',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  },
)

export function assertSupabaseConfigured(): void {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env and restart the dev server.',
    )
  }
}
