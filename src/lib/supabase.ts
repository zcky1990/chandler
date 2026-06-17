import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPERBASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPERBASE_PUBLISH_KEY

let supabaseClient: SupabaseClient | null = null

export const supabase = () => {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseClient
}