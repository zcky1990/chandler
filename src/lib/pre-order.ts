import { supabase } from './supabase'
import { getShopDateString } from './date'
import { useLocaleStore } from '@/stores/useLocaleStore'
import {
  getLineSubtotal,
  expandItemsForSubmit,
  PRE_ORDER_ITEMS_WITH_ADDONS_SELECT,
} from './addon'
import { createQueueEntry } from './queue'
import { canEatFirst, canPayFirst, getShopConfig, requiresTableForEatFirst } from './config'
import { createTransaction, getWalkInCustomer } from './transaction'
import { preOrderItemsUpdateSchema, preOrderSubmitSchema } from '@/schema/schema'
import type {
  PaymentMethod,
  PreOrder,
  PreOrderInput,
  PreOrderItemInput,
  PreOrderPaymentStatus,
  PreOrderWithDetails,
  ProcessPreOrderOptions,
  Product,
} from '@/types/database'
import type { z } from 'zod'

async function getNextPreOrderNumber(orderDate: string) {
  const supabaseClient = supabase()
  const { data, error } = await supabaseClient
    .from('pre_orders')
    .select('order_number')
    .eq('order_date', orderDate)
    .order('order_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    return { orderNumber: null, error }
  }

  return { orderNumber: (data?.order_number ?? 0) + 1, error: null }
}

async function getProductsStockMap(productIds: string[]) {
  if (!productIds.length) return { stockById: new Map<string, Product>(), error: null }

  const supabaseClient = supabase()
  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .in('id', productIds)

  if (error) {
    return { stockById: new Map<string, Product>(), error }
  }

  return {
    stockById: new Map((data as Product[] ?? []).map((product) => [product.id, product])),
    error: null,
  }
}

function validateStock(
  items: z.infer<ReturnType<typeof preOrderSubmitSchema>>['items'],
  stockById: Map<string, Product>,
) {
  const translate = useLocaleStore().translate

  for (const item of items) {
    const product = stockById.get(item.product_id)
    if (!product || !product.is_active) {
      return { ok: false, message: translate('error.productUnavailable') }
    }

    if (item.quantity > product.stock_quantity) {
      return { ok: false, message: translate('error.stockInsufficientProduct', { name: product.name }) }
    }

    for (const addon of item.addons ?? []) {
      const addonProduct = stockById.get(addon.addon_product_id)
      const required = addon.quantity * item.quantity
      if (!addonProduct || !addonProduct.is_active || required > addonProduct.stock_quantity) {
        return { ok: false, message: translate('error.addonStockInsufficient') }
      }
    }
  }

  return { ok: true, message: null }
}

export type PreOrderStockIssue = {
  itemId: string
  label: string
  message: string
}

export async function getPreOrderStockIssues(preOrder: PreOrderWithDetails) {
  const items = preOrder.pre_order_items.map((item) => ({
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: Number(item.unit_price),
    addons: (item.pre_order_item_addons ?? []).map((addon) => ({
      addon_product_id: addon.addon_product_id,
      quantity: addon.quantity,
      unit_price: Number(addon.unit_price),
    })),
  }))

  const productIds = [
    ...items.map((item) => item.product_id),
    ...items.flatMap((item) => (item.addons ?? []).map((addon) => addon.addon_product_id)),
  ]
  const { stockById, error } = await getProductsStockMap([...new Set(productIds)])

  if (error) {
    return { issues: [] as PreOrderStockIssue[], error }
  }

  const translate = useLocaleStore().translate
  const issues: PreOrderStockIssue[] = []

  for (const item of preOrder.pre_order_items) {
    const label = item.products?.name ?? translate('common.unknownProduct')
    const product = stockById.get(item.product_id)

    if (!product || !product.is_active) {
      issues.push({
        itemId: item.id,
        label,
        message: translate('error.productUnavailable'),
      })
      continue
    }

    if (item.quantity > product.stock_quantity) {
      issues.push({
        itemId: item.id,
        label,
        message: translate('error.stockInsufficientProduct', { name: label }),
      })
    }

    for (const addon of item.pre_order_item_addons ?? []) {
      const addonProduct = stockById.get(addon.addon_product_id)
      const required = addon.quantity * item.quantity

      if (!addonProduct || !addonProduct.is_active || required > addonProduct.stock_quantity) {
      issues.push({
        itemId: item.id,
        label,
        message: translate('error.addonStockInsufficient'),
      })
      }
    }
  }

  return { issues, error: null }
}

function buildPaymentStatus(paymentChoice: PreOrderInput['payment_choice']): PreOrderPaymentStatus {
  return paymentChoice === 'pay_now' ? 'awaiting_confirmation' : 'unpaid'
}

function buildOrderNotes(preOrder: PreOrder) {
  const translate = useLocaleStore().translate
  const parts: string[] = []
  if (preOrder.customer_name) {
    parts.push(`${translate('order.preOrderNoteCustomer')} ${preOrder.customer_name}`)
  }
  if (preOrder.table_number) {
    parts.push(`${translate('order.preOrderNoteTable')} ${preOrder.table_number}`)
  }
  if (preOrder.notes) {
    parts.push(preOrder.notes)
  }
  parts.push(`Pre-order #${String(preOrder.order_number).padStart(3, '0')}`)
  return parts.join(' · ') || null
}

export const createPreOrder = async (input: PreOrderInput) => {
  const validated = preOrderSubmitSchema().safeParse(input)
  if (!validated.success) {
    return { preOrder: null, error: validated.error.flatten().fieldErrors }
  }

  const payload = validated.data
  const items = expandItemsForSubmit(payload.items)
  const productIds = [
    ...items.map((item) => item.product_id),
    ...items.flatMap((item) => (item.addons ?? []).map((addon) => addon.addon_product_id)),
  ]

  const { stockById, error: stockError } = await getProductsStockMap([...new Set(productIds)])
  if (stockError) {
    return { preOrder: null, error: stockError }
  }

  const stockCheck = validateStock(items, stockById)
  if (!stockCheck.ok) {
    return { preOrder: null, error: { message: stockCheck.message! } }
  }

  const orderDate = getShopDateString()
  const { orderNumber, error: numberError } = await getNextPreOrderNumber(orderDate)
  if (numberError || orderNumber === null) {
    return { preOrder: null, error: numberError }
  }

  const totalAmount = items.reduce(
    (sum, item) => sum + getLineSubtotal(item.quantity, item.unit_price, item.addons),
    0,
  )

  const supabaseClient = supabase()
  const { data: preOrder, error: insertError } = await supabaseClient
    .from('pre_orders')
    .insert({
      order_number: orderNumber,
      order_date: orderDate,
      customer_name: payload.customer_name?.trim() || null,
      table_number: payload.table_number?.trim() || null,
      notes: payload.notes?.trim() || null,
      payment_choice: payload.payment_choice,
      payment_status: buildPaymentStatus(payload.payment_choice),
      total_amount: totalAmount,
      status: 'pending',
    })
    .select()
    .single()

  if (insertError || !preOrder) {
    return { preOrder: null, error: insertError }
  }

  const { error: itemsError } = await insertPreOrderItems(preOrder.id, items)
  if (itemsError) {
    await supabaseClient.from('pre_orders').delete().eq('id', preOrder.id)
    return { preOrder: null, error: itemsError }
  }

  return { preOrder: preOrder as PreOrder, error: null }
}

export const getPendingPreOrders = async () => {
  const supabaseClient = supabase()
  const { data, error } = await supabaseClient
    .from('pre_orders')
    .select(`
      *,
      pre_order_items (
        ${PRE_ORDER_ITEMS_WITH_ADDONS_SELECT}
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  return { preOrders: data as PreOrderWithDetails[] | null, error }
}

export function needsPreOrderPaymentConfirmation(preOrder: PreOrder) {
  return preOrder.payment_choice === 'pay_now' && preOrder.payment_status === 'awaiting_confirmation'
}

export const confirmPreOrderPayment = async (preOrderId: string, paymentMethod: PaymentMethod) => {
  const supabaseClient = supabase()
  const { data, error } = await supabaseClient
    .from('pre_orders')
    .update({
      payment_status: 'confirmed',
      confirmed_payment_method: paymentMethod,
    })
    .eq('id', preOrderId)
    .eq('status', 'pending')
    .eq('payment_choice', 'pay_now')
    .eq('payment_status', 'awaiting_confirmation')
    .select()
    .single()

  return { preOrder: data as PreOrder | null, error }
}

export const cancelPreOrder = async (preOrderId: string) => {
  const supabaseClient = supabase()
  const { data, error } = await supabaseClient
    .from('pre_orders')
    .update({ status: 'cancelled' })
    .eq('id', preOrderId)
    .eq('status', 'pending')
    .select()
    .single()

  return { preOrder: data as PreOrder | null, error }
}

async function insertPreOrderItems(
  preOrderId: string,
  items: ReturnType<typeof expandItemsForSubmit>,
) {
  const supabaseClient = supabase()

  for (const item of items) {
    const subtotal = item.quantity * item.unit_price
    const { data: insertedItem, error: itemError } = await supabaseClient
      .from('pre_order_items')
      .insert({
        pre_order_id: preOrderId,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal,
      })
      .select()
      .single()

    if (itemError || !insertedItem) {
      return { error: itemError }
    }

    if (item.addons?.length) {
      const addonRows = item.addons.map((addon) => ({
        pre_order_item_id: insertedItem.id,
        addon_product_id: addon.addon_product_id,
        quantity: addon.quantity,
        unit_price: addon.unit_price,
        subtotal: addon.quantity * addon.unit_price * item.quantity,
      }))

      const { error: addonError } = await supabaseClient
        .from('pre_order_item_addons')
        .insert(addonRows)

      if (addonError) {
        return { error: addonError }
      }
    }
  }

  return { error: null }
}

export const updatePreOrderItems = async (
  preOrderId: string,
  input: {
    notes?: string | null
    items: {
      product_id: string
      quantity: number
      unit_price: number
      addons?: PreOrderItemInput['addons']
    }[]
  },
) => {
  const validated = preOrderItemsUpdateSchema().safeParse(input)
  if (!validated.success) {
    return { preOrder: null, error: validated.error.flatten().fieldErrors }
  }

  const supabaseClient = supabase()
  const { data: preOrder, error: fetchError } = await supabaseClient
    .from('pre_orders')
    .select('id, status')
    .eq('id', preOrderId)
    .single()

  if (fetchError || !preOrder) {
    return {
      preOrder: null,
      error: fetchError ?? { message: useLocaleStore().translate('order.orderNotFound') },
    }
  }

  if (preOrder.status !== 'pending') {
    return { preOrder: null, error: { message: useLocaleStore().translate('order.alreadyProcessed') } }
  }

  const items = expandItemsForSubmit(validated.data.items)
  const productIds = [
    ...items.map((item) => item.product_id),
    ...items.flatMap((item) => (item.addons ?? []).map((addon) => addon.addon_product_id)),
  ]
  const { stockById, error: stockError } = await getProductsStockMap([...new Set(productIds)])

  if (stockError) {
    return { preOrder: null, error: stockError }
  }

  const stockCheck = validateStock(items, stockById)
  if (!stockCheck.ok) {
    return { preOrder: null, error: { message: stockCheck.message! } }
  }

  const totalAmount = items.reduce(
    (sum, item) => sum + getLineSubtotal(item.quantity, item.unit_price, item.addons),
    0,
  )

  const { error: deleteError } = await supabaseClient
    .from('pre_order_items')
    .delete()
    .eq('pre_order_id', preOrderId)

  if (deleteError) {
    return { preOrder: null, error: deleteError }
  }

  const { error: insertError } = await insertPreOrderItems(preOrderId, items)
  if (insertError) {
    return { preOrder: null, error: insertError }
  }

  const { data: updatedPreOrder, error: updateError } = await supabaseClient
    .from('pre_orders')
    .update({
      notes: validated.data.notes?.trim() || null,
      total_amount: totalAmount,
    })
    .eq('id', preOrderId)
    .eq('status', 'pending')
    .select(`
      *,
      pre_order_items (
        ${PRE_ORDER_ITEMS_WITH_ADDONS_SELECT}
      )
    `)
    .single()

  return {
    preOrder: updatedPreOrder as PreOrderWithDetails | null,
    error: updateError,
  }
}

export const processPreOrder = async (preOrderId: string, options: ProcessPreOrderOptions) => {
  const supabaseClient = supabase()

  const { data: preOrder, error: fetchError } = await supabaseClient
    .from('pre_orders')
    .select(`
      *,
      pre_order_items (
        ${PRE_ORDER_ITEMS_WITH_ADDONS_SELECT}
      )
    `)
    .eq('id', preOrderId)
    .single()

  if (fetchError || !preOrder) {
    return { preOrder: null, transaction: null, queueNumber: null, error: fetchError ?? { message: useLocaleStore().translate('order.orderNotFound') } }
  }

  if (preOrder.status !== 'pending') {
    return { preOrder: null, transaction: null, queueNumber: null, error: { message: useLocaleStore().translate('order.alreadyProcessed') } }
  }

  if (preOrder.payment_choice === 'pay_now' && preOrder.payment_status !== 'confirmed') {
    return {
      preOrder: null,
      transaction: null,
      queueNumber: null,
      error: { message: useLocaleStore().translate('order.paymentConfirmRequired') },
    }
  }

  const payImmediately = preOrder.payment_choice === 'pay_now'
  const resolvedTableNumber = (options.tableNumber ?? preOrder.table_number)?.trim() || null

  const { config: shopConfig } = await getShopConfig()
  if (payImmediately && !canPayFirst(shopConfig)) {
    return {
      preOrder: null,
      transaction: null,
      queueNumber: null,
      error: { message: useLocaleStore().translate('transaction.payFirstNotAllowed') },
    }
  }

  if (!payImmediately && !canEatFirst(shopConfig)) {
    return {
      preOrder: null,
      transaction: null,
      queueNumber: null,
      error: { message: useLocaleStore().translate('transaction.eatFirstNotAllowed') },
    }
  }

  if (!payImmediately && requiresTableForEatFirst(shopConfig) && !resolvedTableNumber) {
    return {
      preOrder: null,
      transaction: null,
      queueNumber: null,
      error: { message: useLocaleStore().translate('transaction.tableRequired') },
    }
  }

  const paymentMethod: PaymentMethod | undefined = payImmediately
    ? (preOrder.confirmed_payment_method as PaymentMethod | null) ?? options.paymentMethod
    : options.paymentMethod

  if (payImmediately && !paymentMethod) {
    return {
      preOrder: null,
      transaction: null,
      queueNumber: null,
      error: { message: useLocaleStore().translate('order.paymentMethodRequired') },
    }
  }

  const { error: lockError } = await supabaseClient
    .from('pre_orders')
    .update({ status: 'processing' })
    .eq('id', preOrderId)
    .eq('status', 'pending')

  if (lockError) {
    return { preOrder: null, transaction: null, queueNumber: null, error: lockError }
  }

  const items = (preOrder as PreOrderWithDetails).pre_order_items.map((item) => ({
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: Number(item.unit_price),
    addons: (item.pre_order_item_addons ?? []).map((addon) => ({
      addon_product_id: addon.addon_product_id,
      quantity: addon.quantity,
      unit_price: Number(addon.unit_price),
    })),
  }))

  const productIds = [
    ...items.map((item) => item.product_id),
    ...items.flatMap((item) => (item.addons ?? []).map((addon) => addon.addon_product_id)),
  ]
  const { stockById, error: stockError } = await getProductsStockMap([...new Set(productIds)])

  if (stockError) {
    await supabaseClient.from('pre_orders').update({ status: 'pending' }).eq('id', preOrderId)
    return { preOrder: null, transaction: null, queueNumber: null, error: stockError }
  }

  const stockCheck = validateStock(items, stockById)
  if (!stockCheck.ok) {
    await supabaseClient.from('pre_orders').update({ status: 'pending' }).eq('id', preOrderId)
    return { preOrder: null, transaction: null, queueNumber: null, error: { message: stockCheck.message! } }
  }

  const walkInCustomer = await getWalkInCustomer()
  if (!walkInCustomer) {
    await supabaseClient.from('pre_orders').update({ status: 'pending' }).eq('id', preOrderId)
    return { preOrder: null, transaction: null, queueNumber: null, error: { message: useLocaleStore().translate('error.walkInNotFound') } }
  }

  const { transaction, error: transactionError } = await createTransaction(
    {
      customer_id: walkInCustomer.id,
      notes: buildOrderNotes(preOrder as PreOrder),
      table_number: resolvedTableNumber,
      items,
    },
    payImmediately
      ? { paymentMethod: paymentMethod! }
      : {
          table_number: resolvedTableNumber,
          paymentFlowMode: shopConfig?.payment_flow_mode,
          requireTableForEatFirst: shopConfig?.require_table_for_eat_first,
        },
  )

  if (transactionError || !transaction) {
    await supabaseClient.from('pre_orders').update({ status: 'pending' }).eq('id', preOrderId)
    return { preOrder: null, transaction: null, queueNumber: null, error: transactionError }
  }

  if (options.addToQueue) {
    const { queue, error: queueError } = await createQueueEntry(transaction.id, {
      tableNumber: options.tableNumber ?? preOrder.table_number,
    })

    if (queueError) {
      await supabaseClient.from('pre_orders').update({ status: 'pending' }).eq('id', preOrderId)
      return {
        preOrder: null,
        transaction: null,
        queueNumber: null,
        error: { message: useLocaleStore().translate('transaction.queueFailed', { message: queueError.message }) },
      }
    }

    const paymentStatus: PreOrderPaymentStatus =
      preOrder.payment_choice === 'pay_now' ? 'confirmed' : 'unpaid'

    const { data: completedOrder, error: completeError } = await supabaseClient
      .from('pre_orders')
      .update({
        status: 'completed',
        transaction_id: transaction.id,
        payment_status: paymentStatus,
      })
      .eq('id', preOrderId)
      .select()
      .single()

    if (completeError) {
      return { preOrder: null, transaction, queueNumber: queue?.queue_number ?? null, error: completeError }
    }

    return {
      preOrder: completedOrder as PreOrder,
      transaction,
      queueNumber: queue?.queue_number ?? null,
      error: null,
    }
  }

  const paymentStatus: PreOrderPaymentStatus =
    preOrder.payment_choice === 'pay_now' ? 'confirmed' : 'unpaid'

  const { data: completedOrder, error: completeError } = await supabaseClient
    .from('pre_orders')
    .update({
      status: 'completed',
      transaction_id: transaction.id,
      payment_status: paymentStatus,
    })
    .eq('id', preOrderId)
    .select()
    .single()

  if (completeError) {
    return { preOrder: null, transaction, queueNumber: null, error: completeError }
  }

  return {
    preOrder: completedOrder as PreOrder,
    transaction,
    queueNumber: null,
    error: null,
  }
}

type PreOrderRealtimeStatus = 'SUBSCRIBED' | 'CHANNEL_ERROR' | 'TIMED_OUT' | 'CLOSED'

export type PreOrderRealtimeChange = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  newRecord: Record<string, unknown> | null
  oldRecord: Record<string, unknown> | null
}

export const subscribePendingPreOrders = (
  onChange: (change?: PreOrderRealtimeChange) => void,
  onStatusChange?: (status: PreOrderRealtimeStatus) => void,
  channelName = 'pre_orders_pending',
) => {
  const supabaseClient = supabase()
  const channel = supabaseClient
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'pre_orders',
      },
      (payload) => {
        onChange({
          eventType: payload.eventType,
          newRecord: (payload.new as Record<string, unknown>) ?? null,
          oldRecord: (payload.old as Record<string, unknown>) ?? null,
        })
      },
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        onStatusChange?.(status)
      }
    })

  return () => {
    supabaseClient.removeChannel(channel)
  }
}

export function formatPreOrderNumber(number: number) {
  return `#${String(number).padStart(3, '0')}`
}

export function getPreOrderPaymentLabel(preOrder: PreOrder) {
  const t = useLocaleStore().translate

  if (preOrder.payment_choice === 'pay_later') {
    return t('payment.payAtCashier')
  }

  if (preOrder.payment_status === 'awaiting_confirmation') {
    return t('payment.awaitingConfirmation')
  }

  if (preOrder.payment_status === 'confirmed') {
    return t('payment.confirmed')
  }

  return t('payment.payNow')
}

export type { PaymentMethod }
