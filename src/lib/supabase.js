import { createClient } from '@supabase/supabase-js'
import { createSupabaseFetch } from './supabaseTransport'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, { global: { fetch: createSupabaseFetch() } })
  : null

