import { supabase } from './supabase'
import { productSchema } from '@/schema/schema'
import { recordInitialStockMovement } from './stock'
import type { Product, ProductInput } from '@/types/database'
import type { z } from 'zod'

function normalizeProductInput(input: z.infer<typeof productSchema>): ProductInput {
  return {
    name: input.name,
    description: input.description ?? null,
    price: input.price,
    purchase_price: input.purchase_price ?? 0,
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
  const normalized = normalizeProductInput(validatedProduct.data)
  const { data, error } = await supabaseClient
    .from('products')
    .insert(normalized)
    .select()
    .single()

  if (error || !data) {
    return { product: data as Product | null, error }
  }

  if (normalized.stock_quantity > 0) {
    const { error: movementError } = await recordInitialStockMovement(
      data.id,
      normalized.stock_quantity,
      normalized.purchase_price,
    )

    if (movementError) {
      return { product: data as Product, error: movementError }
    }
  }

  return { product: data as Product, error: null }
}

export const updateProduct = async (id: string, product: ProductInput) => {
  const validatedProduct = productSchema.safeParse(product)
  if (!validatedProduct.success) {
    return { product: null, error: validatedProduct.error.flatten().fieldErrors }
  }

  const normalized = normalizeProductInput(validatedProduct.data)
  const supabaseClient = supabase()
  const { data, error } = await supabaseClient
    .from('products')
    .update({
      name: normalized.name,
      description: normalized.description,
      price: normalized.price,
      purchase_price: normalized.purchase_price,
      sku: normalized.sku,
      image_url: normalized.image_url,
      is_active: normalized.is_active,
    })
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
