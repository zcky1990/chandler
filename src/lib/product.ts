import { supabase } from './supabase'

export const getProducts = async () => {
  const supabaseClient = await supabase()
  const { data, error } = await supabaseClient.from('products').select('*')
  if (error) {
    throw error
  }
  return data
}

export const getProductByName = async (name: string) => {
  const supabaseClient = await supabase()
  const { data, error } = await supabaseClient.from('products').select('*').ilike('name', `%${name}%`)
  if (error) {
    throw error
  }
  return data
}