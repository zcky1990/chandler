import { shopConfigSchema } from '@/schema/schema'
import { useLocaleStore } from '@/stores/useLocaleStore'
import { supabase } from './supabase'
import type { ShopConfig, ShopConfigInput, PaymentFlowMode } from '@/types/database'

export type { PaymentFlowMode }

export const SHOP_CONFIG_ID = '00000000-0000-0000-0000-000000000001'
const QRIS_STORAGE_BUCKET = 'shop-assets'
const QRIS_STORAGE_PATH = 'qris/qris'
const LOGO_STORAGE_PATH = 'invoice-logo/logo'
const LANDING_HERO_STORAGE_PATH = 'landing/hero'
const TESTIMONIAL_AVATAR_STORAGE_PATH = 'landing/testimonials'
const SERVICE_IMAGE_STORAGE_PATH = 'landing/services'

export const getShopConfig = async () => {
  const supabaseClient = supabase()
  const { data, error } = await supabaseClient
    .from('shop_config')
    .select('*')
    .eq('id', SHOP_CONFIG_ID)
    .maybeSingle()

  return { config: data as ShopConfig | null, error }
}

export const updateShopConfig = async (input: ShopConfigInput) => {
  const validated = shopConfigSchema().safeParse(input)
  if (!validated.success) {
    return { config: null, error: validated.error.flatten().fieldErrors }
  }

  const payload: ShopConfigInput = {}

  if (input.shop_name !== undefined) {
    payload.shop_name = validated.data.shop_name?.trim() || null
  }
  if (input.shop_address !== undefined) {
    payload.shop_address = validated.data.shop_address?.trim() || null
  }
  if (input.transfer_bank_name !== undefined) {
    payload.transfer_bank_name = validated.data.transfer_bank_name?.trim() || null
  }
  if (input.transfer_account_number !== undefined) {
    payload.transfer_account_number = validated.data.transfer_account_number?.trim() || null
  }
  if (input.transfer_account_holder !== undefined) {
    payload.transfer_account_holder = validated.data.transfer_account_holder?.trim() || null
  }
  if (input.qris_image_url !== undefined) {
    payload.qris_image_url = input.qris_image_url
  }
  if (input.payment_flow_mode !== undefined) {
    payload.payment_flow_mode = validated.data.payment_flow_mode
  }
  if (input.require_table_for_eat_first !== undefined) {
    payload.require_table_for_eat_first = validated.data.require_table_for_eat_first
  }
  if (input.menu_category_ids !== undefined) {
    payload.menu_category_ids = validated.data.menu_category_ids ?? null
  }
  if (input.enable_table_booking !== undefined) {
    payload.enable_table_booking = validated.data.enable_table_booking
  }
  if (input.booking_duration_minutes !== undefined) {
    payload.booking_duration_minutes = validated.data.booking_duration_minutes
  }
  if (input.booking_advance_days_max !== undefined) {
    payload.booking_advance_days_max = validated.data.booking_advance_days_max
  }
  if (input.booking_open_time !== undefined) {
    payload.booking_open_time = validated.data.booking_open_time
  }
  if (input.booking_close_time !== undefined) {
    payload.booking_close_time = validated.data.booking_close_time
  }
  if (input.booking_auto_confirm !== undefined) {
    payload.booking_auto_confirm = validated.data.booking_auto_confirm
  }
  if (input.loyalty_enabled !== undefined) {
    payload.loyalty_enabled = validated.data.loyalty_enabled
  }
  if (input.loyalty_points_per_transaction !== undefined) {
    payload.loyalty_points_per_transaction = validated.data.loyalty_points_per_transaction
  }
  if (input.loyalty_point_redeem_value !== undefined) {
    payload.loyalty_point_redeem_value = validated.data.loyalty_point_redeem_value
  }
  if (input.loyalty_minimum_transaction_amount !== undefined) {
    payload.loyalty_minimum_transaction_amount = validated.data.loyalty_minimum_transaction_amount
  }
  if (input.invoice_footer_text !== undefined) {
    payload.invoice_footer_text = validated.data.invoice_footer_text?.trim() || null
  }
  if (input.invoice_logo_url !== undefined) {
    payload.invoice_logo_url = input.invoice_logo_url
  }
  if (input.invoice_show_logo !== undefined) {
    payload.invoice_show_logo = validated.data.invoice_show_logo
  }
  if (input.invoice_show_qris !== undefined) {
    payload.invoice_show_qris = validated.data.invoice_show_qris
  }
  if (input.invoice_tax_id !== undefined) {
    payload.invoice_tax_id = validated.data.invoice_tax_id?.trim() || null
  }
  if (input.invoice_show_tax_id !== undefined) {
    payload.invoice_show_tax_id = validated.data.invoice_show_tax_id
  }
  if (input.invoice_terms_text !== undefined) {
    payload.invoice_terms_text = validated.data.invoice_terms_text?.trim() || null
  }
  if (input.invoice_show_terms !== undefined) {
    payload.invoice_show_terms = validated.data.invoice_show_terms
  }
  if (input.invoice_primary_color !== undefined) {
    payload.invoice_primary_color = validated.data.invoice_primary_color
  }
  if (input.invoice_show_item_prices !== undefined) {
    payload.invoice_show_item_prices = validated.data.invoice_show_item_prices
  }
  if (input.invoice_show_qty !== undefined) {
    payload.invoice_show_qty = validated.data.invoice_show_qty
  }
  if (input.landing_template !== undefined) {
    payload.landing_template = validated.data.landing_template
  }
  if (input.landing_hero_image_url !== undefined) {
    payload.landing_hero_image_url = input.landing_hero_image_url
  }
  if (input.landing_hero_title !== undefined) {
    payload.landing_hero_title = validated.data.landing_hero_title?.trim() || null
  }
  if (input.landing_hero_subtitle !== undefined) {
    payload.landing_hero_subtitle = validated.data.landing_hero_subtitle?.trim() || null
  }
  if (input.landing_primary_color !== undefined) {
    payload.landing_primary_color = validated.data.landing_primary_color
  }
  if (input.landing_carousel_enabled !== undefined) {
    payload.landing_carousel_enabled = validated.data.landing_carousel_enabled
  }
  if (input.landing_carousel_max_items !== undefined) {
    payload.landing_carousel_max_items = validated.data.landing_carousel_max_items
  }
  if (input.landing_carousel_title !== undefined) {
    payload.landing_carousel_title = validated.data.landing_carousel_title?.trim() || null
  }
  if (input.landing_carousel_bg_color !== undefined) {
    payload.landing_carousel_bg_color = validated.data.landing_carousel_bg_color
  }
  if (input.landing_testimonials_enabled !== undefined) {
    payload.landing_testimonials_enabled = validated.data.landing_testimonials_enabled
  }
  if (input.landing_testimonials_title !== undefined) {
    payload.landing_testimonials_title = validated.data.landing_testimonials_title?.trim() || null
  }
  if (input.landing_testimonials_data !== undefined) {
    payload.landing_testimonials_data = input.landing_testimonials_data
  }
  if (input.landing_testimonials_bg_color !== undefined) {
    payload.landing_testimonials_bg_color = validated.data.landing_testimonials_bg_color
  }
  if (input.landing_services_enabled !== undefined) {
    payload.landing_services_enabled = validated.data.landing_services_enabled
  }
  if (input.landing_services_title !== undefined) {
    payload.landing_services_title = validated.data.landing_services_title?.trim() || null
  }
  if (input.landing_services_subtitle !== undefined) {
    payload.landing_services_subtitle = validated.data.landing_services_subtitle?.trim() || null
  }
  if (input.landing_services_whatsapp !== undefined) {
    payload.landing_services_whatsapp = validated.data.landing_services_whatsapp?.trim() || null
  }
  if (input.landing_services_data !== undefined) {
    payload.landing_services_data = input.landing_services_data
  }
  if (input.landing_services_bg_color !== undefined) {
    payload.landing_services_bg_color = validated.data.landing_services_bg_color
  }
  if (input.landing_gallery_enabled !== undefined) {
    payload.landing_gallery_enabled = validated.data.landing_gallery_enabled
  }
  if (input.landing_gallery_title !== undefined) {
    payload.landing_gallery_title = validated.data.landing_gallery_title?.trim() || null
  }
  if (input.landing_gallery_subtitle !== undefined) {
    payload.landing_gallery_subtitle = validated.data.landing_gallery_subtitle?.trim() || null
  }
  if (input.landing_gallery_images !== undefined) {
    payload.landing_gallery_images = input.landing_gallery_images
  }
  if (input.landing_gallery_bg_color !== undefined) {
    payload.landing_gallery_bg_color = validated.data.landing_gallery_bg_color
  }
  if (input.landing_contact_enabled !== undefined) {
    payload.landing_contact_enabled = validated.data.landing_contact_enabled
  }
  if (input.landing_contact_title !== undefined) {
    payload.landing_contact_title = validated.data.landing_contact_title?.trim() || null
  }
  if (input.landing_contact_subtitle !== undefined) {
    payload.landing_contact_subtitle = validated.data.landing_contact_subtitle?.trim() || null
  }
  if (input.landing_contact_address !== undefined) {
    payload.landing_contact_address = validated.data.landing_contact_address?.trim() || null
  }
  if (input.landing_contact_phone !== undefined) {
    payload.landing_contact_phone = validated.data.landing_contact_phone?.trim() || null
  }
  if (input.landing_contact_email !== undefined) {
    payload.landing_contact_email = validated.data.landing_contact_email?.trim() || null
  }
  if (input.landing_contact_map_lat !== undefined) {
    payload.landing_contact_map_lat = validated.data.landing_contact_map_lat
  }
  if (input.landing_contact_map_lng !== undefined) {
    payload.landing_contact_map_lng = validated.data.landing_contact_map_lng
  }
  if (input.landing_contact_map_zoom !== undefined) {
    payload.landing_contact_map_zoom = validated.data.landing_contact_map_zoom
  }
  if (input.landing_contact_bg_color !== undefined) {
    payload.landing_contact_bg_color = validated.data.landing_contact_bg_color
  }

  const supabaseClient = supabase()
  const { data, error } = await supabaseClient
    .from('shop_config')
    .update(payload)
    .eq('id', SHOP_CONFIG_ID)
    .select()
    .single()

  if (error?.code === 'PGRST116') {
    const { data: inserted, error: insertError } = await supabaseClient
      .from('shop_config')
      .insert({ id: SHOP_CONFIG_ID, ...payload })
      .select()
      .single()

    return { config: inserted as ShopConfig | null, error: insertError }
  }

  return { config: data as ShopConfig | null, error }
}

export const uploadQrisImage = async (file: File) => {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'png'
  const allowed = ['png', 'jpg', 'jpeg', 'webp']
  if (!allowed.includes(extension)) {
    return { url: null, error: { message: useLocaleStore().translate('config.imageMustBeImage') } }
  }

  const path = `${QRIS_STORAGE_PATH}.${extension}`
  const supabaseClient = supabase()
  const { error: uploadError } = await supabaseClient.storage
    .from(QRIS_STORAGE_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) {
    return { url: null, error: uploadError }
  }

  const { data } = supabaseClient.storage.from(QRIS_STORAGE_BUCKET).getPublicUrl(path)
  const cacheBustedUrl = `${data.publicUrl}?t=${Date.now()}`

  const { config, error } = await updateShopConfig({ qris_image_url: cacheBustedUrl })
  if (error) {
    return { url: null, error: typeof error === 'object' && 'message' in error ? error : { message: useLocaleStore().translate('error.qrisSaveFailed') } }
  }

  return { url: config?.qris_image_url ?? cacheBustedUrl, error: null }
}

export const removeQrisImage = async () => {
  const supabaseClient = supabase()
  const extensions = ['png', 'jpg', 'jpeg', 'webp']

  await Promise.all(
    extensions.map((extension) =>
      supabaseClient.storage.from(QRIS_STORAGE_BUCKET).remove([`${QRIS_STORAGE_PATH}.${extension}`]),
    ),
  )

  return updateShopConfig({ qris_image_url: null })
}

export function hasQrisConfig(config: ShopConfig | null) {
  return !!config?.qris_image_url
}

export function hasTransferConfig(config: ShopConfig | null) {
  return !!config?.transfer_account_number
}

export function hasPaymentConfig(config: ShopConfig | null) {
  return hasQrisConfig(config) || hasTransferConfig(config)
}

export function canPayFirst(config: ShopConfig | null) {
  return (config?.payment_flow_mode ?? 'both') !== 'eat_first_only'
}

export function canEatFirst(config: ShopConfig | null) {
  return (config?.payment_flow_mode ?? 'both') !== 'pay_first_only'
}

export function requiresTableForEatFirst(config: ShopConfig | null) {
  return config?.require_table_for_eat_first !== false
}

export function isTableBookingEnabled(config: ShopConfig | null) {
  return config?.enable_table_booking === true
}

export function getBookingDefaults(config: ShopConfig | null) {
  return {
    durationMinutes: config?.booking_duration_minutes ?? 120,
    advanceDaysMax: config?.booking_advance_days_max ?? 30,
    openTime: config?.booking_open_time ?? '10:00',
    closeTime: config?.booking_close_time ?? '22:00',
    autoConfirm: config?.booking_auto_confirm ?? true,
  }
}

export function isLoyaltyEnabled(config: ShopConfig | null) {
  return config?.loyalty_enabled === true
}

export function getLoyaltyEarnPoints(config: ShopConfig | null) {
  return config?.loyalty_points_per_transaction ?? 0
}

export function getLoyaltyPointRedeemValue(config: ShopConfig | null) {
  return Number(config?.loyalty_point_redeem_value ?? 0)
}

export function getLoyaltyMinimumTransactionAmount(config: ShopConfig | null) {
  return Number(config?.loyalty_minimum_transaction_amount ?? 0)
}

export function qualifiesForLoyaltyEarn(grossAmount: number, config: ShopConfig | null) {
  const minimum = getLoyaltyMinimumTransactionAmount(config)
  return grossAmount >= minimum
}

export const uploadInvoiceLogo = async (file: File) => {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'png'
  const allowed = ['png', 'jpg', 'jpeg', 'webp', 'svg']
  if (!allowed.includes(extension)) {
    return { url: null, error: { message: useLocaleStore().translate('config.imageMustBeImage') } }
  }

  const path = `${LOGO_STORAGE_PATH}.${extension}`
  const supabaseClient = supabase()
  const { error: uploadError } = await supabaseClient.storage
    .from(QRIS_STORAGE_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) {
    return { url: null, error: uploadError }
  }

  const { data } = supabaseClient.storage.from(QRIS_STORAGE_BUCKET).getPublicUrl(path)
  const cacheBustedUrl = `${data.publicUrl}?t=${Date.now()}`

  const { error } = await updateShopConfig({
    invoice_logo_url: cacheBustedUrl,
    invoice_show_logo: true,
  })
  if (error) {
    return { url: null, error: typeof error === 'object' && 'message' in error ? error : { message: useLocaleStore().translate('config.invoiceSaveFailed') } }
  }

  return { url: cacheBustedUrl, error: null }
}

export const removeInvoiceLogo = async () => {
  const supabaseClient = supabase()
  const extensions = ['png', 'jpg', 'jpeg', 'webp', 'svg']

  await Promise.all(
    extensions.map((extension) =>
      supabaseClient.storage.from(QRIS_STORAGE_BUCKET).remove([`${LOGO_STORAGE_PATH}.${extension}`]),
    ),
  )

  return updateShopConfig({ invoice_logo_url: null, invoice_show_logo: false })
}

export const uploadLandingHeroImage = async (file: File) => {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'webp'
  const allowed = ['webp']
  if (!allowed.includes(extension)) {
    return { url: null, error: { message: useLocaleStore().translate('config.imageMustBeWebp') } }
  }

  const path = `${LANDING_HERO_STORAGE_PATH}.webp`
  const supabaseClient = supabase()
  const { error: uploadError } = await supabaseClient.storage
    .from(QRIS_STORAGE_BUCKET)
    .upload(path, file, { upsert: true, contentType: 'image/webp' })

  if (uploadError) {
    return { url: null, error: uploadError }
  }

  const { data } = supabaseClient.storage.from(QRIS_STORAGE_BUCKET).getPublicUrl(path)
  const cacheBustedUrl = `${data.publicUrl}?t=${Date.now()}`

  const { error } = await updateShopConfig({ landing_hero_image_url: cacheBustedUrl })
  if (error) {
    return { url: null, error: typeof error === 'object' && 'message' in error ? error : { message: useLocaleStore().translate('error.landingHeroSaveFailed') } }
  }

  return { url: cacheBustedUrl, error: null }
}

export const removeLandingHeroImage = async () => {
  const supabaseClient = supabase()

  await supabaseClient.storage.from(QRIS_STORAGE_BUCKET).remove([`${LANDING_HERO_STORAGE_PATH}.webp`])

  return updateShopConfig({ landing_hero_image_url: null })
}

export const uploadTestimonialAvatar = async (file: File, index: number) => {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'webp'
  const allowed = ['webp']
  if (!allowed.includes(extension)) {
    return { url: null, error: { message: useLocaleStore().translate('config.imageMustBeWebp') } }
  }

  const path = `${TESTIMONIAL_AVATAR_STORAGE_PATH}/avatar_${index}.webp`
  const supabaseClient = supabase()
  const { error: uploadError } = await supabaseClient.storage
    .from(QRIS_STORAGE_BUCKET)
    .upload(path, file, { upsert: true, contentType: 'image/webp' })

  if (uploadError) {
    return { url: null, error: uploadError }
  }

  const { data } = supabaseClient.storage.from(QRIS_STORAGE_BUCKET).getPublicUrl(path)
  const cacheBustedUrl = `${data.publicUrl}?t=${Date.now()}`

  return { url: cacheBustedUrl, error: null }
}

export const removeTestimonialAvatar = async (index: number) => {
  const supabaseClient = supabase()
  await supabaseClient.storage
    .from(QRIS_STORAGE_BUCKET)
    .remove([`${TESTIMONIAL_AVATAR_STORAGE_PATH}/avatar_${index}.webp`])
}

export const uploadServiceImage = async (file: File, index: number) => {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'webp'
  const allowed = ['webp']
  if (!allowed.includes(extension)) {
    return { url: null, error: { message: useLocaleStore().translate('config.imageMustBeWebp') } }
  }

  const path = `${SERVICE_IMAGE_STORAGE_PATH}/service_${index}.webp`
  const supabaseClient = supabase()
  const { error: uploadError } = await supabaseClient.storage
    .from(QRIS_STORAGE_BUCKET)
    .upload(path, file, { upsert: true, contentType: 'image/webp' })

  if (uploadError) {
    return { url: null, error: uploadError }
  }

  const { data } = supabaseClient.storage.from(QRIS_STORAGE_BUCKET).getPublicUrl(path)
  return { url: `${data.publicUrl}?t=${Date.now()}`, error: null }
}

export const removeServiceImage = async (index: number) => {
  const supabaseClient = supabase()
  await supabaseClient.storage
    .from(QRIS_STORAGE_BUCKET)
    .remove([`${SERVICE_IMAGE_STORAGE_PATH}/service_${index}.webp`])
}

export const uploadGalleryImage = async (file: File, index: number) => {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'webp'
  const allowed = ['webp']
  if (!allowed.includes(extension)) {
    return { url: null, error: { message: useLocaleStore().translate('config.imageMustBeWebp') } }
  }

  const path = `landing/gallery/gallery_${index}.webp`
  const supabaseClient = supabase()
  const { error: uploadError } = await supabaseClient.storage
    .from(QRIS_STORAGE_BUCKET)
    .upload(path, file, { upsert: true, contentType: 'image/webp' })

  if (uploadError) {
    return { url: null, error: uploadError }
  }

  const { data } = supabaseClient.storage.from(QRIS_STORAGE_BUCKET).getPublicUrl(path)
  return { url: `${data.publicUrl}?t=${Date.now()}`, error: null }
}

export const removeGalleryImage = async (index: number) => {
  const supabaseClient = supabase()
  await supabaseClient.storage
    .from(QRIS_STORAGE_BUCKET)
    .remove([`landing/gallery/gallery_${index}.webp`])
}
