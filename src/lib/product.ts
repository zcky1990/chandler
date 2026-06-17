import { supabase } from './supabase'

export const getProducts = async () => {
  const supabaseClient = await supabase()
  const { data, error } = await supabaseClient.from('products').select('*')
  return { products: data, error }
}

export const getProductByName = async (name: string) => {
  const supabaseClient = await supabase()
  const { data, error } = await supabaseClient.from('products').select('*').ilike('name', `%${name}%`)
  return { products: data, error }
}