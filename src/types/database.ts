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

export const WALK_IN_CUSTOMER_NAME = 'Walk-in Customer'

export type Transaction = {
  id: string
  customer_id: string
  total_amount: number
  is_paid: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export type TransactionItem = {
  id: string
  transaction_id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
  created_at: string
}

export type TransactionInput = {
  customer_id: string
  notes?: string | null
  items: TransactionItemInput[]
}

export type TransactionItemInput = {
  product_id: string
  quantity: number
  unit_price: number
}
