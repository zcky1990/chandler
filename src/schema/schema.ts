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