import { supabase } from './supabase'
import { productSchema } from '@/schema/schema'
import type { Product, ProductInput } from '@/types/database'
import type { z } from 'zod'

function normalizeProductInput(input: z.infer<typeof productSchema>): ProductInput {
  return {
    name: input.name,
    description: input.description ?? null,
    price: input.price,
    stock_quantity: input.stock_quantity,
    sku: input.sku ?? null,
    image_url: input.image_url ?? null,
    is_active: input.is_active,
  }
}

export const getProducts = async () => {
  const supabaseClient = supabase()
  const { data, error } = await supabaseClient.from('products').select('*').order('created_at', { ascending: false })
  return { products: data as Product[] | null, error }
}

export const getProductByName = async (name: string) => {
  const supabaseClient = supabase()
  const { data, error } = await supabaseClient.from('products').select('*').ilike('name', `%${name}%`)
  return { products: data as Product[] | null, error }
}

export const createProduct = async (product: ProductInput) => {
  const validatedProduct = productSchema.safeParse(product)
  if (!validatedProduct.success) {
    return { product: null, error: validatedProduct.error.flatten().fieldErrors }
  }

  const supabaseClient = supabase()
  const { data, error } = await supabaseClient
    .from('products')
    .insert(normalizeProductInput(validatedProduct.data))
    .select()
    .single()

  return { product: data as Product | null, error }
}

export const updateProduct = async (id: string, product: ProductInput) => {
  const validatedProduct = productSchema.safeParse(product)
  if (!validatedProduct.success) {
    return { product: null, error: validatedProduct.error.flatten().fieldErrors }
  }

  const supabaseClient = supabase()
  const { data, error } = await supabaseClient
    .from('products')
    .update(normalizeProductInput(validatedProduct.data))
    .eq('id', id)
    .select()
    .single()

  return { product: data as Product | null, error }
}

export const deleteProduct = async (id: string) => {
  const supabaseClient = supabase()
  const { error } = await supabaseClient.from('products').delete().eq('id', id)
  return { error }
}
