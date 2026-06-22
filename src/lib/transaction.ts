import { supabase } from './supabase'
import { transactionSchema } from '@/schema/schema'
import { createCustomer, getCustomers } from './customer'
import type { Customer, Transaction, TransactionInput, TransactionItem } from '@/types/database'
import { WALK_IN_CUSTOMER_NAME } from '@/types/database'
import type { z } from 'zod'

type CreateTransactionResult = {
  transaction: Transaction | null
  merged: boolean
  error: unknown
}

function getTodayRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

async function decreaseProductStock(items: TransactionInput['items']) {
  const supabaseClient = supabase()

  for (const item of items) {
    const { data: product } = await supabaseClient
      .from('products')
      .select('stock_quantity')
      .eq('id', item.product_id)
      .single()

    if (product) {
      await supabaseClient
        .from('products')
        .update({ stock_quantity: Math.max(product.stock_quantity - item.quantity, 0) })
        .eq('id', item.product_id)
    }
  }
}

async function findPendingTransactionToday(customerId: string) {
  const { start, end } = getTodayRange()
  const supabaseClient = supabase()

  const { data, error } = await supabaseClient
    .from('transactions')
    .select(`
      *,
      transaction_items (
        id,
        product_id,
        quantity,
        unit_price,
        subtotal
      )
    `)
    .eq('customer_id', customerId)
    .eq('is_paid', false)
    .gte('created_at', start)
    .lte('created_at', end)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return { transaction: data, error }
}

async function mergeIntoTransaction(
  transactionId: string,
  existingItems: TransactionItem[],
  newItems: TransactionInput['items'],
  notes?: string | null,
): Promise<CreateTransactionResult> {
  const supabaseClient = supabase()
  const itemsByProduct = new Map(
    existingItems.map((item) => [item.product_id, item]),
  )

  for (const newItem of newItems) {
    const existingItem = itemsByProduct.get(newItem.product_id)

    if (existingItem) {
      const quantity = existingItem.quantity + newItem.quantity
      const subtotal = quantity * newItem.unit_price

      const { error } = await supabaseClient
        .from('transaction_items')
        .update({
          quantity,
          unit_price: newItem.unit_price,
          subtotal,
        })
        .eq('id', existingItem.id)

      if (error) {
        return { transaction: null, merged: true, error }
      }
    } else {
      const { error } = await supabaseClient.from('transaction_items').insert({
        transaction_id: transactionId,
        product_id: newItem.product_id,
        quantity: newItem.quantity,
        unit_price: newItem.unit_price,
        subtotal: newItem.quantity * newItem.unit_price,
      })

      if (error) {
        return { transaction: null, merged: true, error }
      }
    }
  }

  const { data: updatedItems, error: itemsError } = await supabaseClient
    .from('transaction_items')
    .select('subtotal')
    .eq('transaction_id', transactionId)

  if (itemsError || !updatedItems) {
    return { transaction: null, merged: true, error: itemsError }
  }

  const totalAmount = updatedItems.reduce((sum, item) => sum + Number(item.subtotal), 0)
  const updatePayload: { total_amount: number, notes?: string } = { total_amount: totalAmount }
  if (notes) {
    updatePayload.notes = notes
  }

  const { data: transaction, error: updateError } = await supabaseClient
    .from('transactions')
    .update(updatePayload)
    .eq('id', transactionId)
    .select()
    .single()

  if (updateError || !transaction) {
    return { transaction: null, merged: true, error: updateError }
  }

  await decreaseProductStock(newItems)

  return {
    transaction: transaction as Transaction,
    merged: true,
    error: null,
  }
}

export async function getWalkInCustomer(): Promise<Customer | null> {
  const { customers, error } = await getCustomers()
  if (error) return null

  const existing = customers?.find((customer) => customer.name === WALK_IN_CUSTOMER_NAME)
  if (existing) return existing

  const { customer } = await createCustomer({
    name: WALK_IN_CUSTOMER_NAME,
    email: null,
    phone: null,
    address: null,
    notes: 'Default customer for unknown buyers',
    is_active: true,
  })

  return customer
}

export async function getCustomersForTransaction() {
  const walkInCustomer = await getWalkInCustomer()
  const { customers, error } = await getCustomers()

  if (error) {
    return { customers: walkInCustomer ? [walkInCustomer] : [], error }
  }

  const activeCustomers = (customers ?? []).filter((customer) => customer.is_active)
  const withoutWalkIn = activeCustomers.filter((customer) => customer.name !== WALK_IN_CUSTOMER_NAME)
  const orderedCustomers = walkInCustomer
    ? [walkInCustomer, ...withoutWalkIn]
    : withoutWalkIn

  return { customers: orderedCustomers, error: null }
}

export async function getPendingTransactionForCustomer(customerId: string) {
  const { transaction, error } = await findPendingTransactionToday(customerId)
  return { transaction, error }
}

export const getTransactions = async () => {
  const supabaseClient = supabase()
  const { data, error } = await supabaseClient
    .from('transactions')
    .select(`
      *,
      customers ( id, name ),
      transaction_items (
        id,
        quantity,
        unit_price,
        subtotal,
        products ( id, name )
      )
    `)
    .order('created_at', { ascending: false })

  return { transactions: data, error }
}

export const createTransaction = async (input: TransactionInput): Promise<CreateTransactionResult> => {
  const validated = transactionSchema.safeParse(input)
  if (!validated.success) {
    return { transaction: null, merged: false, error: validated.error.flatten().fieldErrors }
  }

  const payload = validated.data as z.infer<typeof transactionSchema>
  const { transaction: pendingTransaction, error: pendingError } = await findPendingTransactionToday(payload.customer_id)

  if (pendingError) {
    return { transaction: null, merged: false, error: pendingError }
  }

  if (pendingTransaction) {
    return mergeIntoTransaction(
      pendingTransaction.id,
      (pendingTransaction.transaction_items ?? []) as TransactionItem[],
      payload.items,
      payload.notes,
    )
  }

  const totalAmount = payload.items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0,
  )

  const supabaseClient = supabase()

  const { data: transaction, error: transactionError } = await supabaseClient
    .from('transactions')
    .insert({
      customer_id: payload.customer_id,
      total_amount: totalAmount,
      is_paid: false,
      notes: payload.notes ?? null,
    })
    .select()
    .single()

  if (transactionError || !transaction) {
    return { transaction: null, merged: false, error: transactionError }
  }

  const transactionItems = payload.items.map((item) => ({
    transaction_id: transaction.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    subtotal: item.quantity * item.unit_price,
  }))

  const { error: itemsError } = await supabaseClient
    .from('transaction_items')
    .insert(transactionItems)

  if (itemsError) {
    await supabaseClient.from('transactions').delete().eq('id', transaction.id)
    return { transaction: null, merged: false, error: itemsError }
  }

  await decreaseProductStock(payload.items)

  return {
    transaction: transaction as Transaction,
    merged: false,
    error: null,
  }
}
