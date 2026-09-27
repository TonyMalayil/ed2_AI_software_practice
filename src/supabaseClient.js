import { createClient } from '@supabase/supabase-js'

// Values come from .env locally and from Netlify environment variables in production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. See .env.example.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
