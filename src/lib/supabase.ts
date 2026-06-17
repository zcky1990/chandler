import { createClient} from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPERBASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPERBASE_PUBLISH_KEY

export const supabase = async () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}