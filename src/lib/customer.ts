import { supabase } from './supabase'

export const getCustomers = async () => {
  const supabaseClient = await supabase()
  const { data, error } = await supabaseClient.from('customers').select('*')
  if (error) {
    throw error
  }
  return data
}

export const getCustomerByName = async (name: string) => {
  const supabaseClient = await supabase()
  const { data, error } = await supabaseClient.from('customers').select('*').ilike('name', `%${name}%`)
  if (error) {
    throw error
  }
  return data
}