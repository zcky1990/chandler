import { supabase } from './supabase'
import { categorySchema } from '@/schema/schema'
import type { ProductCategory, ProductCategoryInput } from '@/types/database'
import type { z } from 'zod'

function normalizeCategoryInput(input: z.infer<typeof categorySchema>): ProductCategoryInput {
  return {
    name: input.name,
    description: input.description ?? null,
    is_active: input.is_active,
  }
}

export const getCategories = async () => {
  const supabaseClient = supabase()
  const { data, error } = await supabaseClient
    .from('product_categories')
    .select('*')
    .order('name', { ascending: true })

  return { categories: data as ProductCategory[] | null, error }
}

export const getActiveCategories = async () => {
  const supabaseClient = supabase()
  const { data, error } = await supabaseClient
    .from('product_categories')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  return { categories: data as ProductCategory[] | null, error }
}

export const createCategory = async (category: ProductCategoryInput) => {
  const validated = categorySchema.safeParse(category)
  if (!validated.success) {
    return { category: null, error: validated.error.flatten().fieldErrors }
  }

  const supabaseClient = supabase()
  const { data, error } = await supabaseClient
    .from('product_categories')
    .insert(normalizeCategoryInput(validated.data))
    .select()
    .single()

  return { category: data as ProductCategory | null, error }
}

export const updateCategory = async (id: string, category: ProductCategoryInput) => {
  const validated = categorySchema.safeParse(category)
  if (!validated.success) {
    return { category: null, error: validated.error.flatten().fieldErrors }
  }

  const supabaseClient = supabase()
  const { data, error } = await supabaseClient
    .from('product_categories')
    .update(normalizeCategoryInput(validated.data))
    .eq('id', id)
    .select()
    .single()

  return { category: data as ProductCategory | null, error }
}

export const deleteCategory = async (id: string) => {
  const supabaseClient = supabase()
  const { error } = await supabaseClient.from('product_categories').delete().eq('id', id)
  return { error }
}
