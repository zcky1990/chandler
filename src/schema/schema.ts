import { z } from 'zod'
import type { MessageKey } from '@/lib/i18n/messages'
import { useLocaleStore } from '@/stores/useLocaleStore'

function t(key: MessageKey) {
  return useLocaleStore().translate(key)
}

export function loginSchema() {
  return z.object({
    email: z.email().min(1, { message: t('validation.emailRequired') }),
    password: z.string().min(1, { message: t('validation.passwordRequired') }),
  })
}

export function signUpSchema() {
  return z.object({
    name: z.string().min(1, { message: t('validation.nameRequired') }),
    email: z.email().min(1, { message: t('validation.emailRequired') }),
    password: z.string().min(1, { message: t('validation.passwordRequired') }),
    confirmPassword: z.string().min(1, { message: t('validation.confirmPasswordRequired') }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('validation.passwordMismatch'),
    path: ['confirmPassword'],
  })
}

export type LoginSchema = z.infer<ReturnType<typeof loginSchema>>
export type SignUpSchema = z.infer<ReturnType<typeof signUpSchema>>

export function productSchema() {
  return z.object({
    name: z.string().min(1, { message: t('validation.productNameRequired') }),
    description: z.string().nullable().optional(),
    price: z.coerce.number().min(0, { message: t('validation.priceNonNegative') }),
    purchase_price: z.coerce.number().min(0, { message: t('validation.purchasePriceNonNegative') }).default(0),
    stock_quantity: z.coerce.number().int().min(0, { message: t('validation.stockNonNegative') }),
    sku: z.string().nullable().optional(),
    image_url: z.union([
      z.string().url({ message: t('validation.imageUrlInvalid') }),
      z.literal(''),
    ]).nullable().optional(),
    is_active: z.boolean().default(true),
    is_addons: z.boolean().default(false),
    category_id: z.string().uuid({ message: t('validation.categoryInvalid') }).nullable().optional(),
  })
}

export function customerSchema() {
  return z.object({
    name: z.string().min(1, { message: t('validation.nameRequired') }),
    email: z.union([
      z.string().email({ message: t('validation.emailInvalid') }),
      z.literal(''),
    ]).nullable().optional(),
    phone: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    is_active: z.boolean().default(true),
    is_member: z.boolean().default(false),
  })
}

export function categorySchema() {
  return z.object({
    name: z.string().min(1, { message: t('validation.categoryNameRequired') }),
    description: z.string().nullable().optional(),
    is_active: z.boolean().default(true),
  })
}

export type CategorySchema = z.infer<ReturnType<typeof categorySchema>>

export function diningTableSchema() {
  return z.object({
    table_number: z.string().trim().min(1, { message: t('validation.tableNumberRequired') }),
    seats: z.coerce.number().int().min(1, { message: t('validation.tableSeatsMin') }),
    is_active: z.boolean(),
  })
}

export type DiningTableSchema = z.infer<ReturnType<typeof diningTableSchema>>
export type ProductSchema = z.infer<ReturnType<typeof productSchema>>
export type CustomerSchema = z.infer<ReturnType<typeof customerSchema>>

function transactionItemAddonSchema() {
  return z.object({
    addon_product_id: z.string().uuid({ message: t('validation.addonInvalid') }),
    quantity: z.coerce.number().int().min(1, { message: t('validation.addonQtyMin') }),
    unit_price: z.coerce.number().min(0, { message: t('validation.addonPriceInvalid') }),
  })
}

function transactionItemSchema() {
  return z.object({
    product_id: z.string().uuid({ message: t('validation.productInvalid') }),
    quantity: z.coerce.number().int().min(1, { message: t('validation.qtyMin') }),
    unit_price: z.coerce.number().min(0, { message: t('validation.priceInvalid') }),
    addons: z.array(transactionItemAddonSchema()).optional(),
  })
}

export function transactionSchema() {
  return z.object({
    customer_id: z.string().uuid({ message: t('validation.buyerRequired') }),
    notes: z.string().nullable().optional(),
    table_number: z.string().trim().nullable().optional(),
    items: z.array(transactionItemSchema()).min(1, { message: t('validation.minOneProduct') }),
  })
}

export type TransactionSchema = z.infer<ReturnType<typeof transactionSchema>>

function transactionItemUpdateSchema() {
  return z.object({
    id: z.string().uuid({ message: t('validation.itemInvalid') }).optional(),
    product_id: z.string().uuid({ message: t('validation.productInvalid') }),
    quantity: z.coerce.number().int().min(1, { message: t('validation.qtyMin') }),
    unit_price: z.coerce.number().min(0, { message: t('validation.priceInvalid') }).optional(),
    addons: z.array(transactionItemAddonSchema()).optional(),
  }).superRefine((data, ctx) => {
    if (!data.id && data.unit_price === undefined) {
      ctx.addIssue({
        code: 'custom',
        message: t('validation.unitPriceRequiredNewItem'),
        path: ['unit_price'],
      })
    }
  })
}

export function transactionItemsUpdateSchema() {
  return z.object({
    notes: z.string().nullable().optional(),
    items: z.array(transactionItemUpdateSchema()).min(1, { message: t('validation.minOneItem') }),
  })
}

export type TransactionItemsUpdateSchema = z.infer<ReturnType<typeof transactionItemsUpdateSchema>>

export function cancelTransactionSchema() {
  return z.object({
    reason: z.string().trim().min(1, { message: t('validation.cancelReasonRequired') }),
  })
}

export type CancelTransactionSchema = z.infer<ReturnType<typeof cancelTransactionSchema>>

export function shopConfigSchema() {
  return z.object({
    shop_name: z.string().nullable().optional(),
    shop_address: z.string().nullable().optional(),
    transfer_bank_name: z.string().nullable().optional(),
    transfer_account_number: z.string().nullable().optional(),
    transfer_account_holder: z.string().nullable().optional(),
    payment_flow_mode: z.enum(['pay_first_only', 'eat_first_only', 'both']).optional(),
    require_table_for_eat_first: z.boolean().optional(),
    menu_category_ids: z.array(z.string().uuid()).nullable().optional(),
    enable_table_booking: z.boolean().optional(),
    booking_duration_minutes: z.coerce.number().int().min(30).max(480).optional(),
    booking_advance_days_max: z.coerce.number().int().min(1).max(365).optional(),
    booking_open_time: z.string().optional(),
    booking_close_time: z.string().optional(),
    booking_auto_confirm: z.boolean().optional(),
    loyalty_enabled: z.boolean().optional(),
    loyalty_points_per_transaction: z.coerce.number().int().min(0).max(10000).optional(),
    loyalty_point_redeem_value: z.coerce.number().min(0).max(1000000).optional(),
    loyalty_minimum_transaction_amount: z.coerce.number().min(0).max(100000000).optional(),
    invoice_footer_text: z.string().nullable().optional(),
    invoice_logo_url: z.string().nullable().optional(),
    invoice_show_logo: z.boolean().optional(),
    invoice_show_qris: z.boolean().optional(),
    invoice_tax_id: z.string().nullable().optional(),
    invoice_show_tax_id: z.boolean().optional(),
    invoice_terms_text: z.string().nullable().optional(),
    invoice_show_terms: z.boolean().optional(),
    invoice_primary_color: z.string().optional(),
    invoice_show_item_prices: z.boolean().optional(),
    invoice_show_qty: z.boolean().optional(),
    landing_template: z.string().optional(),
    landing_hero_image_url: z.string().nullable().optional(),
    landing_hero_title: z.string().nullable().optional(),
    landing_hero_subtitle: z.string().nullable().optional(),
    landing_primary_color: z.string().optional(),
    landing_carousel_enabled: z.boolean().optional(),
    landing_carousel_max_items: z.coerce.number().int().min(4).max(20).optional(),
    landing_carousel_title: z.string().nullable().optional(),
    landing_carousel_bg_color: z.string().optional(),
    landing_testimonials_enabled: z.boolean().optional(),
    landing_testimonials_title: z.string().nullable().optional(),
    landing_testimonials_data: z.any().nullable().optional(),
    landing_testimonials_bg_color: z.string().optional(),
    landing_services_enabled: z.boolean().optional(),
    landing_services_title: z.string().nullable().optional(),
    landing_services_subtitle: z.string().nullable().optional(),
    landing_services_whatsapp: z.string().nullable().optional(),
    landing_services_data: z.any().nullable().optional(),
    landing_services_bg_color: z.string().optional(),
    landing_gallery_enabled: z.boolean().optional(),
    landing_gallery_title: z.string().nullable().optional(),
    landing_gallery_subtitle: z.string().nullable().optional(),
    landing_gallery_images: z.any().nullable().optional(),
    landing_gallery_bg_color: z.string().optional(),
    landing_contact_enabled: z.boolean().optional(),
    landing_contact_title: z.string().nullable().optional(),
    landing_contact_subtitle: z.string().nullable().optional(),
    landing_contact_address: z.string().nullable().optional(),
    landing_contact_phone: z.string().nullable().optional(),
    landing_contact_email: z.string().nullable().optional(),
    landing_contact_map_lat: z.coerce.number().optional(),
    landing_contact_map_lng: z.coerce.number().optional(),
    landing_contact_map_zoom: z.coerce.number().int().min(1).max(18).optional(),
    landing_contact_bg_color: z.string().optional(),
  })
}

export type ShopConfigSchema = z.infer<ReturnType<typeof shopConfigSchema>>

export function restockSchema() {
  return z.object({
    product_id: z.string().uuid({ message: t('validation.productInvalid') }),
    quantity: z.coerce.number().int().min(1, { message: t('validation.restockQtyMin') }),
    unit_cost: z.coerce.number().min(0, { message: t('validation.unitCostNonNegative') }),
    notes: z.string().nullable().optional(),
  })
}

export type RestockSchema = z.infer<ReturnType<typeof restockSchema>>

export function stockOpnameSchema() {
  return z.object({
    product_id: z.string().uuid({ message: t('validation.productInvalid') }),
    physical_count: z.coerce.number().int().min(0, { message: t('validation.physicalCountNonNegative') }),
    reason: z.string().trim().min(1, { message: t('validation.opnameReasonRequired') }),
  })
}

export type StockOpnameSchema = z.infer<ReturnType<typeof stockOpnameSchema>>

export function floorTableSchema() {
  return z.object({
    id: z.string().uuid().optional(),
    label: z.string().trim().min(1, { message: t('validation.tableLabelRequired') }),
    shape: z.enum(['round', 'square']),
    kind: z.enum(['table', 'zone']).default('table'),
    color: z.string().trim().nullable().optional(),
    pos_x: z.coerce.number().int(),
    pos_y: z.coerce.number().int(),
    width: z.coerce.number().int().min(1, { message: t('validation.tableSizeInvalid') }),
    height: z.coerce.number().int().min(1, { message: t('validation.tableSizeInvalid') }),
    seats: z.coerce.number().int().min(0).nullable().optional(),
    area: z.string().trim().nullable().optional(),
    dining_table_id: z.string().uuid().nullable().optional(),
    sort_order: z.coerce.number().int().default(0),
  })
}

export type FloorTableSchema = z.infer<ReturnType<typeof floorTableSchema>>

export function preOrderSubmitSchema() {
  return z.object({
    customer_name: z.string().nullable().optional(),
    table_number: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    payment_choice: z.enum(['pay_later', 'pay_now']),
    items: z.array(transactionItemSchema()).min(1, { message: t('validation.minOneProduct') }),
  }).superRefine((data, ctx) => {
    if (data.payment_choice === 'pay_later' && !data.table_number?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: t('validation.tableNumberRequired'),
        path: ['table_number'],
      })
    }
  })
}

export type PreOrderSubmitSchema = z.infer<ReturnType<typeof preOrderSubmitSchema>>

export function preOrderItemsUpdateSchema() {
  return z.object({
    notes: z.string().nullable().optional(),
    items: z.array(transactionItemSchema()).min(1, { message: t('validation.minOneProduct') }),
  })
}

export type PreOrderItemsUpdateSchema = z.infer<ReturnType<typeof preOrderItemsUpdateSchema>>

export function tableBookingCreateSchema() {
  return z.object({
    dining_table_ids: z
      .array(z.string().uuid({ message: t('validation.tableInvalid') }))
      .min(1, { message: t('validation.minOneTable') }),
    customer_name: z.string().trim().nullable().optional(),
    customer_phone: z.string().trim().nullable().optional(),
    party_size: z.coerce.number().int().min(1, { message: t('validation.partySizeMin') }),
    scheduled_at: z.string().datetime({
      offset: true,
      message: t('validation.scheduledAtInvalid'),
    }),
    notes: z.string().trim().nullable().optional(),
    items: z.array(transactionItemSchema()).min(1, { message: t('validation.minOneProduct') }),
  })
}

export type TableBookingCreateSchema = z.infer<ReturnType<typeof tableBookingCreateSchema>>

export function profileUpdateSchema() {
  return z.object({
    fullName: z.string().min(1, { message: t('validation.nameRequired') }),
  })
}

export function passwordUpdateSchema() {
  return z.object({
    password: z.string().min(8, { message: t('validation.passwordMinLength') }),
    confirmPassword: z.string().min(1, { message: t('validation.confirmPasswordRequired') }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('validation.passwordMismatch'),
    path: ['confirmPassword'],
  })
}

export function userCreateSchema() {
  return z.object({
    fullName: z.string().min(1, { message: t('validation.nameRequired') }),
    email: z.email().min(1, { message: t('validation.emailRequired') }),
    password: z.string().min(8, { message: t('validation.passwordMinLength') }),
    role: z.enum(['owner', 'staff']),
  })
}
