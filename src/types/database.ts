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

export type CustomerWithDebt = Customer & {
  outstandingAmount: number
  unpaidCount: number
}

export const WALK_IN_CUSTOMER_NAME = 'Walk-in Customer'

export type PaymentMethod = 'qris' | 'cash' | 'transfer'

export type Transaction = {
  id: string
  customer_id: string
  total_amount: number
  is_paid: boolean
  payment_method: PaymentMethod | null
  paid_at: string | null
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

export type CreateTransactionOptions = {
  paymentMethod?: PaymentMethod
}

export type TransactionItemInput = {
  product_id: string
  quantity: number
  unit_price: number
}

export type TransactionProduct = {
  id: string
  name: string
}

export type TransactionItemWithProduct = TransactionItem & {
  products: TransactionProduct | null
}

export type TransactionCustomer = {
  id: string
  name: string
}

export type TransactionWithDetails = Transaction & {
  customers: TransactionCustomer | null
  transaction_items: TransactionItemWithProduct[]
}

export type CustomerTransactionSummary = {
  customerId: string
  customerName: string
  transactionCount: number
  totalAmount: number
  outstandingAmount: number
  unpaidCount: number
  transactions: TransactionWithDetails[]
}

export type ShopConfig = {
  id: string
  qris_image_url: string | null
  transfer_bank_name: string | null
  transfer_account_number: string | null
  transfer_account_holder: string | null
  created_at: string
  updated_at: string
}

export type ShopConfigInput = {
  qris_image_url?: string | null
  transfer_bank_name?: string | null
  transfer_account_number?: string | null
  transfer_account_holder?: string | null
}
