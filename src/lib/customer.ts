import { supabase } from './supabase'

export const getCustomers = async () => {
  const supabaseClient = await supabase()
  const { data, error } = await supabaseClient.from('customers').select('*')
  return { customers: data, error }
}

export const getCustomerByName = async (name: string) => {
  const supabaseClient = await supabase()
  const { data, error } = await supabaseClient.from('customers').select('*').ilike('name', `%${name}%`)
  return { customers: data, error }
}