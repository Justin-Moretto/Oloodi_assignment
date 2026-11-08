function readEnv(value: string | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export const supabaseUrl = readEnv(import.meta.env.VITE_SUPABASE_URL)
export const supabaseAnonKey = readEnv(import.meta.env.VITE_SUPABASE_ANON_KEY)

export const isSupabaseConfigured = supabaseUrl !== null && supabaseAnonKey !== null
