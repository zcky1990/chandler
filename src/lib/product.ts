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
    product_type: input.product_type ?? 'menu',
    is_active: input.is_active,
  }
}

export const getProducts = async () => {
  const supabaseClient = supabase()
  const { data, error } = await supabaseClient.from('products').select('*').order('created_at', { ascending: false })
  return { products: data as Product[] | null, error }
}

export const getAddonProducts = async () => {
  const supabaseClient = supabase()
  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .eq('product_type', 'addon')
    .eq('is_active', true)
    .order('name', { ascending: true })

  return { products: data as Product[] | null, error }
}

function extractJoinedProduct(value: unknown): Product | null {
  if (!value) return null
  if (Array.isArray(value)) {
    return (value[0] as Product | undefined) ?? null
  }

  return value as Product
}

export const getProductAddons = async (productId: string) => {
  const supabaseClient = supabase()
  const { data, error } = await supabaseClient
    .from('product_addons')
    .select('addon_product_id, sort_order, products:addon_product_id(*)')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true })

  const addons = (data ?? [])
    .map((row) => extractJoinedProduct(row.products))
    .filter((product): product is Product => !!product && product.is_active)

  return { addons, error }
}

export const getProductAddonsMap = async () => {
  const supabaseClient = supabase()
  const { data, error } = await supabaseClient
    .from('product_addons')
    .select('product_id, sort_order, products:addon_product_id(*)')
    .order('sort_order', { ascending: true })

  const map: Record<string, Product[]> = {}

  for (const row of data ?? []) {
    const product = extractJoinedProduct(row.products)
    if (!product || !product.is_active) continue

    if (!map[row.product_id]) {
      map[row.product_id] = []
    }

    map[row.product_id]!.push(product)
  }

  return { map, error }
}

export const saveProductAddons = async (productId: string, addonIds: string[]) => {
  const supabaseClient = supabase()
  const { error: deleteError } = await supabaseClient
    .from('product_addons')
    .delete()
    .eq('product_id', productId)

  if (deleteError) {
    return { error: deleteError }
  }

  if (!addonIds.length) {
    return { error: null }
  }

  const rows = addonIds.map((addonId, index) => ({
    product_id: productId,
    addon_product_id: addonId,
    sort_order: index,
  }))

  const { error } = await supabaseClient.from('product_addons').insert(rows)
  return { error }
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
      product_type: normalized.product_type,
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
