import { z } from 'zod'

export const loginSchema = z.object({
    email: z.email().min(1, { message: 'Email harus diisi' }),
    password: z.string().min(1, { message: 'Password harus diisi' }),
})

export const signUpSchema = z.object({
    name: z.string().min(1, { message: 'Nama harus diisi' }),
    email: z.email().min(1, { message: 'Email harus diisi' }),
    password: z.string().min(1, { message: 'Password harus diisi' }),
    confirmPassword: z.string().min(1, { message: 'Konfirmasi password harus diisi' }),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Password dan konfirmasi password harus sama',
    path: ['confirmPassword'],
})

export type LoginSchema = z.infer<typeof loginSchema>
export type SignUpSchema = z.infer<typeof signUpSchema>

export const productSchema = z.object({
  name: z.string().min(1, { message: 'Nama produk harus diisi' }),
  description: z.string().nullable().optional(),
  price: z.coerce.number().min(0, { message: 'Harga tidak boleh negatif' }),
  purchase_price: z.coerce.number().min(0, { message: 'Harga beli tidak boleh negatif' }).default(0),
  stock_quantity: z.coerce.number().int().min(0, { message: 'Stok tidak boleh negatif' }),
  sku: z.string().nullable().optional(),
  image_url: z.union([
    z.string().url({ message: 'URL gambar tidak valid' }),
    z.literal(''),
  ]).nullable().optional(),
  is_active: z.boolean().default(true),
  product_type: z.enum(['menu', 'addon']).default('menu'),
})

export const customerSchema = z.object({
  name: z.string().min(1, { message: 'Nama harus diisi' }),
  email: z.union([
    z.string().email({ message: 'Email tidak valid' }),
    z.literal(''),
  ]).nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
})

export type ProductSchema = z.infer<typeof productSchema>
export type CustomerSchema = z.infer<typeof customerSchema>

export const transactionItemAddonSchema = z.object({
  addon_product_id: z.string().uuid({ message: 'Addon tidak valid' }),
  quantity: z.coerce.number().int().min(1, { message: 'Jumlah addon minimal 1' }),
  unit_price: z.coerce.number().min(0, { message: 'Harga addon tidak valid' }),
})

export const transactionItemSchema = z.object({
  product_id: z.string().uuid({ message: 'Produk tidak valid' }),
  quantity: z.coerce.number().int().min(1, { message: 'Jumlah minimal 1' }),
  unit_price: z.coerce.number().min(0, { message: 'Harga tidak valid' }),
  addons: z.array(transactionItemAddonSchema).optional(),
})

export const transactionSchema = z.object({
  customer_id: z.string().uuid({ message: 'Pembeli harus dipilih' }),
  notes: z.string().nullable().optional(),
  items: z.array(transactionItemSchema).min(1, { message: 'Minimal 1 produk' }),
})

export type TransactionSchema = z.infer<typeof transactionSchema>

export const transactionItemUpdateSchema = z.object({
  id: z.string().uuid({ message: 'Item tidak valid' }).optional(),
  product_id: z.string().uuid({ message: 'Produk tidak valid' }),
  quantity: z.coerce.number().int().min(1, { message: 'Jumlah minimal 1' }),
  unit_price: z.coerce.number().min(0, { message: 'Harga tidak valid' }).optional(),
  addons: z.array(transactionItemAddonSchema).optional(),
}).superRefine((data, ctx) => {
  if (!data.id && data.unit_price === undefined) {
    ctx.addIssue({
      code: 'custom',
      message: 'Harga produk wajib untuk item baru',
      path: ['unit_price'],
    })
  }
})

export const transactionItemsUpdateSchema = z.object({
  notes: z.string().nullable().optional(),
  items: z.array(transactionItemUpdateSchema).min(1, { message: 'Minimal 1 item' }),
})

export type TransactionItemsUpdateSchema = z.infer<typeof transactionItemsUpdateSchema>

export const shopConfigSchema = z.object({
  transfer_bank_name: z.string().nullable().optional(),
  transfer_account_number: z.string().nullable().optional(),
  transfer_account_holder: z.string().nullable().optional(),
})

export type ShopConfigSchema = z.infer<typeof shopConfigSchema>

export const restockSchema = z.object({
  product_id: z.string().uuid({ message: 'Produk tidak valid' }),
  quantity: z.coerce.number().int().min(1, { message: 'Jumlah minimal 1' }),
  unit_cost: z.coerce.number().min(0, { message: 'Harga beli tidak boleh negatif' }),
  notes: z.string().nullable().optional(),
})

export type RestockSchema = z.infer<typeof restockSchema>