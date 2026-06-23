import type { Product, TransactionItemAddonInput, TransactionItemWithProduct } from '@/types/database'

export type CartAddonSelection = {
  product: Product
  quantity: number
}

export function getAddonSignature(addons: { addon_product_id: string, quantity: number }[]) {
  return addons
    .slice()
    .sort((a, b) => a.addon_product_id.localeCompare(b.addon_product_id))
    .map((addon) => `${addon.addon_product_id}:${addon.quantity}`)
    .join('|')
}

export function buildCartLineKey(productId: string, addons: CartAddonSelection[]) {
  return `${productId}::${getAddonSignature(
    addons.map((addon) => ({
      addon_product_id: addon.product.id,
      quantity: addon.quantity,
    })),
  )}`
}

export function getAddonSubtotalPerUnit(addons: TransactionItemAddonInput[]) {
  return addons.reduce((sum, addon) => sum + addon.quantity * addon.unit_price, 0)
}

export function getLineSubtotal(
  menuQuantity: number,
  unitPrice: number,
  addons: TransactionItemAddonInput[] = [],
) {
  return menuQuantity * (unitPrice + getAddonSubtotalPerUnit(addons))
}

export function cartAddonsToInput(addons: CartAddonSelection[]): TransactionItemAddonInput[] {
  return addons.map((addon) => ({
    addon_product_id: addon.product.id,
    quantity: addon.quantity,
    unit_price: addon.product.price,
  }))
}

export function formatItemWithAddons(item: TransactionItemWithProduct) {
  const menuName = item.products?.name ?? 'Produk'
  const addonNames = (item.transaction_item_addons ?? [])
    .map((addon) => addon.products?.name ?? 'Addon')
    .join(', ')

  const base = `${menuName} x${item.quantity}`
  return addonNames ? `${base} (+ ${addonNames})` : base
}

export const TRANSACTION_ITEMS_WITH_ADDONS_SELECT = `
  id,
  product_id,
  quantity,
  unit_price,
  subtotal,
  products ( id, name ),
  transaction_item_addons (
    id,
    addon_product_id,
    quantity,
    unit_price,
    subtotal,
    products ( id, name )
  )
`

export const PRE_ORDER_ITEMS_WITH_ADDONS_SELECT = `
  id,
  product_id,
  quantity,
  unit_price,
  subtotal,
  products ( id, name ),
  pre_order_item_addons (
    id,
    addon_product_id,
    quantity,
    unit_price,
    subtotal,
    products ( id, name )
  )
`

export function formatPreOrderItemWithAddons(item: {
  quantity: number
  products: { name: string } | null
  pre_order_item_addons?: { quantity: number, products: { name: string } | null }[]
}) {
  const menuName = item.products?.name ?? 'Produk'
  const addonNames = (item.pre_order_item_addons ?? [])
    .map((addon) => addon.products?.name ?? 'Addon')
    .join(', ')

  const base = `${menuName} x${item.quantity}`
  return addonNames ? `${base} (+ ${addonNames})` : base
}
