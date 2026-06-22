export type Product = {
  id: string
  name: string
  description: string | null
  price: number
  stock_quantity: number
  sku: string | null
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ProductInput = Omit<Product, 'id' | 'created_at' | 'updated_at'>

export type Customer = {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type CustomerInput = Omit<Customer, 'id' | 'created_at' | 'updated_at'>
