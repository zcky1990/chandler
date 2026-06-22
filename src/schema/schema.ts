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
  stock_quantity: z.coerce.number().int().min(0, { message: 'Stok tidak boleh negatif' }),
  sku: z.string().nullable().optional(),
  image_url: z.union([
    z.string().url({ message: 'URL gambar tidak valid' }),
    z.literal(''),
  ]).nullable().optional(),
  is_active: z.boolean().default(true),
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