<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { ChevronDown, ImageIcon, Landmark, LayoutGrid, LayoutTemplate, MapPin, MessageCircle, Palette, Pencil, Plus, Printer, QrCode, ReceiptText, Trash2, Upload, User, Wallet, CalendarDays, Gift, ImagePlus, Star, Mail, Phone } from '@lucide/vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import MenuCategoryConfigList from '@/components/config/MenuCategoryConfigList.vue'
import LandingSectionBgFields from '@/components/config/LandingSectionBgFields.vue'
import satabThumb from '@/assets/satab-thumbnail.webp'
import spiceThumb from '@/assets/spice-thumbnail.webp'
import yummyThumb from '@/assets/yummy-thumbnail.webp'
import defaultThumb from '@/assets/default-thumbnail.webp'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useI18n } from '@/composables/useI18n'
import { getShopConfig, removeInvoiceLogo, removeLandingAboutImage, removeLandingHeroImage, removeQrisImage, removeServiceImage, removeTestimonialAvatar, updateShopConfig, uploadInvoiceLogo, uploadLandingAboutImage, uploadLandingHeroImage, uploadQrisImage, uploadServiceImage, uploadTestimonialAvatar } from '@/lib/config'
import { LANDING_TEMPLATE_PRESETS, extractLandingOverrides } from '@/lib/landing'
import { getActiveCategories } from '@/lib/category'
import { usesCustomMenuCategories } from '@/lib/menu-categories'
import { useAlertStore } from '@/stores/useAlertStore'
import type { PaymentFlowMode, ProductCategory, ShopConfig, LandingTemplate, LandingTestimonial, LandingServiceItem, LandingFeatureItem, LandingStatItem } from '@/types/database'

const { t, locale } = useI18n()
const alertStore = useAlertStore()
const isLoading = ref(true)
const isSavingTransfer = ref(false)
const isSavingReceipt = ref(false)
const isSavingPaymentFlow = ref(false)
const isSavingMenuCategories = ref(false)
const isSavingBooking = ref(false)
const isSavingLoyalty = ref(false)
const isSavingInvoice = ref(false)
const isUploadingQris = ref(false)
const isRemovingQris = ref(false)
const isUploadingLogo = ref(false)
const isRemovingLogo = ref(false)
const qrisPreview = ref<string | null>(null)
const logoPreview = ref<string | null>(null)

const transferForm = ref({
  transfer_bank_name: '',
  transfer_account_number: '',
  transfer_account_holder: '',
})

const receiptForm = ref({
  shop_name: '',
  shop_address: '',
})

const paymentFlowForm = ref({
  payment_flow_mode: 'both' as PaymentFlowMode,
  require_table_for_eat_first: true,
})

const menuCategoryCustom = ref(false)
const menuCategoryIds = ref<string[]>([])

const bookingForm = ref({
  enable_table_booking: false,
  booking_duration_minutes: 120,
  booking_advance_days_max: 30,
  booking_open_time: '10:00',
  booking_close_time: '22:00',
  booking_auto_confirm: true,
})

const loyaltyForm = ref({
  loyalty_enabled: false,
  loyalty_points_per_transaction: 0,
  loyalty_point_redeem_value: 0,
  loyalty_minimum_transaction_amount: 0,
})

const invoiceForm = ref({
  invoice_primary_color: '#000000',
  invoice_show_logo: false,
  invoice_logo_url: null as string | null,
  invoice_tax_id: '',
  invoice_show_tax_id: false,
  invoice_terms_text: '',
  invoice_show_terms: false,
  invoice_footer_text: '',
  invoice_show_qris: true,
  invoice_show_item_prices: true,
  invoice_show_qty: true,
})
const landingTemplate = ref('default')
const landingHeroImage = ref<string | null>(null)
const landingHeroTitle = ref('')
const landingHeroSubtitle = ref('')
const landingPrimaryColor = ref('#0f172a')
const landingHeroBgColor = ref('#ffffff')
const landingHeroBgImage = ref('')
const isSavingLanding = ref(false)
const isUploadingLandingHero = ref(false)
const isRemovingLandingHero = ref(false)
const landingHeroPreview = ref<string | null>(null)
const landingCarouselEnabled = ref(true)
const landingCarouselMaxItems = ref(8)
const landingCarouselTitle = ref('')
const landingCarouselBgColor = ref('#f1f5f9')
const landingCarouselBgImage = ref('')
const landingTestimonialsEnabled = ref(false)
const landingTestimonialsTitle = ref('')
const landingTestimonialsData = ref<LandingTestimonial[]>([])
const landingTestimonialsBgColor = ref('#ffffff')
const landingTestimonialsBgImage = ref('')
const landingServicesEnabled = ref(false)
const landingServicesTitle = ref('')
const landingServicesSubtitle = ref('')
const landingServicesWhatsapp = ref('')
const landingServicesData = ref<LandingServiceItem[]>([])
const landingServicesBgColor = ref('#f8fafc')
const landingServicesBgImage = ref('')
const landingGalleryEnabled = ref(false)
const landingGalleryTitle = ref('')
const landingGallerySubtitle = ref('')
const landingGalleryImages = ref<string[]>([])
const landingGalleryBgColor = ref('#ffffff')
const landingGalleryBgImage = ref('')
const landingContactEnabled = ref(false)
const landingContactTitle = ref('')
const landingContactSubtitle = ref('')
const landingContactAddress = ref('')
const landingContactPhone = ref('')
const landingContactEmail = ref('')
const landingContactMapLat = ref(-6.2088)
const landingContactMapLng = ref(106.8456)
const landingContactMapZoom = ref(15)
const landingContactBgColor = ref('#f8fafc')
const landingContactBgImage = ref('')

const landingAccordion = ref<Record<string, boolean>>({
  hero: false,
  about: false,
  why: false,
  carousel: false,
  testimonials: false,
  services: false,
  gallery: false,
  contact: false,
  book: false,
})

function toggleAccordion(key: string) {
  landingAccordion.value[key] = !landingAccordion.value[key]
}

const landingAboutEnabled = ref(false)
const landingAboutLabel = ref('')
const landingAboutTitle = ref('')
const landingAboutDescription = ref('')
const landingAboutImage = ref<string | null>(null)
const landingAboutPreview = ref<string | null>(null)
const landingAboutBullets = ref<string[]>([])
const landingAboutBgColor = ref('#ffffff')
const landingAboutBgImage = ref('')
const isUploadingLandingAbout = ref(false)
const isRemovingLandingAbout = ref(false)
const landingWhyEnabled = ref(false)
const landingWhyLabel = ref('')
const landingWhyTitle = ref('')
const landingWhyDescription = ref('')
const landingWhyFeatures = ref<LandingFeatureItem[]>([])
const landingWhyStats = ref<LandingStatItem[]>([])
const landingWhyBgColor = ref('#f2f2f2')
const landingWhyBgImage = ref('')
const landingBookBgColor = ref('')
const landingBookBgImage = ref('')
const activeTab = ref('store')

const tabs = computed(() => [
  { id: 'store', label: t('config.tabStore'), icon: LayoutTemplate },
  { id: 'payments', label: t('config.tabPayments'), icon: Wallet },
  { id: 'invoice', label: t('config.tabInvoice'), icon: ReceiptText },
  { id: 'features', label: t('config.tabFeatures'), icon: LayoutGrid },
])

const templateOptions = computed(() => [
  { id: 'default', name: t('config.landingDefault'), desc: t('config.landingDefaultDesc'), thumb: defaultThumb, color: null },
  { id: 'sarab', name: t('config.landingSarab'), desc: t('config.landingSarabDesc'), thumb: satabThumb, color: null },
  { id: 'spicehaven', name: t('config.landingSpiceHaven'), desc: t('config.landingSpiceHavenDesc'), thumb: spiceThumb, color: null },
  { id: 'yummy', name: t('config.landingYummy'), desc: t('config.landingYummyDesc'), thumb: yummyThumb, color: null },
])

const activeCategories = ref<ProductCategory[]>([])

function applyConfig(config: ShopConfig | null) {
  qrisPreview.value = config?.qris_image_url ?? null
  transferForm.value = {
    transfer_bank_name: config?.transfer_bank_name ?? '',
    transfer_account_number: config?.transfer_account_number ?? '',
    transfer_account_holder: config?.transfer_account_holder ?? '',
  }
  receiptForm.value = {
    shop_name: config?.shop_name ?? '',
    shop_address: config?.shop_address ?? '',
  }
  paymentFlowForm.value = {
    payment_flow_mode: config?.payment_flow_mode ?? 'both',
    require_table_for_eat_first: config?.require_table_for_eat_first ?? true,
  }
  menuCategoryCustom.value = usesCustomMenuCategories(config)
  menuCategoryIds.value = config?.menu_category_ids ? [...config.menu_category_ids] : []
  bookingForm.value = {
    enable_table_booking: config?.enable_table_booking ?? false,
    booking_duration_minutes: config?.booking_duration_minutes ?? 120,
    booking_advance_days_max: config?.booking_advance_days_max ?? 30,
    booking_open_time: (config?.booking_open_time ?? '10:00').slice(0, 5),
    booking_close_time: (config?.booking_close_time ?? '22:00').slice(0, 5),
    booking_auto_confirm: config?.booking_auto_confirm ?? true,
  }
  loyaltyForm.value = {
    loyalty_enabled: config?.loyalty_enabled ?? false,
    loyalty_points_per_transaction: config?.loyalty_points_per_transaction ?? 0,
    loyalty_point_redeem_value: Number(config?.loyalty_point_redeem_value ?? 0),
    loyalty_minimum_transaction_amount: Number(config?.loyalty_minimum_transaction_amount ?? 0),
  }
  logoPreview.value = config?.invoice_logo_url ?? null
  invoiceForm.value = {
    invoice_primary_color: config?.invoice_primary_color || '#000000',
    invoice_show_logo: config?.invoice_show_logo ?? false,
    invoice_logo_url: config?.invoice_logo_url ?? null,
    invoice_tax_id: config?.invoice_tax_id ?? '',
    invoice_show_tax_id: config?.invoice_show_tax_id ?? false,
    invoice_terms_text: config?.invoice_terms_text ?? '',
    invoice_show_terms: config?.invoice_show_terms ?? false,
    invoice_footer_text: config?.invoice_footer_text ?? '',
    invoice_show_qris: config?.invoice_show_qris ?? true,
    invoice_show_item_prices: config?.invoice_show_item_prices ?? true,
    invoice_show_qty: config?.invoice_show_qty ?? true,
  }
  landingTemplate.value = config?.landing_template || 'default'
  landingHeroImage.value = config?.landing_hero_image_url ?? null
  landingHeroPreview.value = config?.landing_hero_image_url ?? null
  landingHeroTitle.value = config?.landing_hero_title ?? ''
  landingHeroSubtitle.value = config?.landing_hero_subtitle ?? ''
  landingPrimaryColor.value = config?.landing_primary_color
    || LANDING_TEMPLATE_PRESETS[(config?.landing_template || 'default') as LandingTemplate].defaults.primaryColor
  landingHeroBgColor.value = config?.landing_hero_bg_color
    || LANDING_TEMPLATE_PRESETS[(config?.landing_template || 'default') as LandingTemplate].defaults.heroBgColor
  landingHeroBgImage.value = config?.landing_hero_bg_image ?? ''
  landingCarouselEnabled.value = config?.landing_carousel_enabled ?? true
  landingCarouselMaxItems.value = config?.landing_carousel_max_items ?? 8
  landingCarouselTitle.value = config?.landing_carousel_title ?? ''
  landingCarouselBgColor.value = config?.landing_carousel_bg_color
    || LANDING_TEMPLATE_PRESETS[(config?.landing_template || 'default') as LandingTemplate].defaults.carouselBgColor
  landingCarouselBgImage.value = config?.landing_carousel_bg_image ?? ''
  landingTestimonialsEnabled.value = config?.landing_testimonials_enabled ?? false
  landingTestimonialsTitle.value = config?.landing_testimonials_title ?? ''
  landingTestimonialsData.value = config?.landing_testimonials_data ?? []
  landingTestimonialsBgColor.value = config?.landing_testimonials_bg_color
    || LANDING_TEMPLATE_PRESETS[(config?.landing_template || 'default') as LandingTemplate].defaults.testimonialsBgColor
  landingTestimonialsBgImage.value = config?.landing_testimonials_bg_image ?? ''
  landingServicesEnabled.value = config?.landing_services_enabled ?? false
  landingServicesTitle.value = config?.landing_services_title ?? ''
  landingServicesSubtitle.value = config?.landing_services_subtitle ?? ''
  landingServicesWhatsapp.value = config?.landing_services_whatsapp ?? ''
  landingServicesData.value = config?.landing_services_data ?? []
  landingServicesBgColor.value = config?.landing_services_bg_color
    || LANDING_TEMPLATE_PRESETS[(config?.landing_template || 'default') as LandingTemplate].defaults.servicesBgColor
  landingServicesBgImage.value = config?.landing_services_bg_image ?? ''
  landingGalleryEnabled.value = config?.landing_gallery_enabled ?? false
  landingGalleryTitle.value = config?.landing_gallery_title ?? ''
  landingGallerySubtitle.value = config?.landing_gallery_subtitle ?? ''
  landingGalleryImages.value = config?.landing_gallery_images ?? []
  landingGalleryBgColor.value = config?.landing_gallery_bg_color
    || LANDING_TEMPLATE_PRESETS[(config?.landing_template || 'default') as LandingTemplate].defaults.galleryBgColor
  landingGalleryBgImage.value = config?.landing_gallery_bg_image ?? ''
  landingContactEnabled.value = config?.landing_contact_enabled ?? false
  landingContactTitle.value = config?.landing_contact_title ?? ''
  landingContactSubtitle.value = config?.landing_contact_subtitle ?? ''
  landingContactAddress.value = config?.landing_contact_address ?? ''
  landingContactPhone.value = config?.landing_contact_phone ?? ''
  landingContactEmail.value = config?.landing_contact_email ?? ''
  landingContactMapLat.value = config?.landing_contact_map_lat ?? -6.2088
  landingContactMapLng.value = config?.landing_contact_map_lng ?? 106.8456
  landingContactMapZoom.value = config?.landing_contact_map_zoom ?? 15
  landingContactBgColor.value = config?.landing_contact_bg_color
    || LANDING_TEMPLATE_PRESETS[(config?.landing_template || 'default') as LandingTemplate].defaults.contactBgColor
  landingContactBgImage.value = config?.landing_contact_bg_image ?? ''
  landingAboutEnabled.value = config?.landing_about_enabled ?? false
  landingAboutLabel.value = config?.landing_about_label ?? ''
  landingAboutTitle.value = config?.landing_about_title ?? ''
  landingAboutDescription.value = config?.landing_about_description ?? ''
  landingAboutImage.value = config?.landing_about_image_url ?? null
  landingAboutPreview.value = config?.landing_about_image_url ?? null
  landingAboutBullets.value = config?.landing_about_bullets ?? []
  landingAboutBgColor.value = config?.landing_about_bg_color
    || LANDING_TEMPLATE_PRESETS[(config?.landing_template || 'default') as LandingTemplate].defaults.aboutBgColor
  landingAboutBgImage.value = config?.landing_about_bg_image ?? ''
  landingWhyEnabled.value = config?.landing_why_enabled ?? false
  landingWhyLabel.value = config?.landing_why_label ?? ''
  landingWhyTitle.value = config?.landing_why_title ?? ''
  landingWhyDescription.value = config?.landing_why_description ?? ''
  landingWhyFeatures.value = config?.landing_why_features ?? []
  landingWhyStats.value = config?.landing_why_stats ?? []
  landingWhyBgColor.value = config?.landing_why_bg_color
    || LANDING_TEMPLATE_PRESETS[(config?.landing_template || 'default') as LandingTemplate].defaults.whyBgColor
  landingWhyBgImage.value = config?.landing_why_bg_image ?? ''
  landingBookBgColor.value = config?.landing_book_bg_color ?? ''
  landingBookBgImage.value = config?.landing_book_bg_image ?? ''
}

async function loadConfig() {
  isLoading.value = true
  const [{ config, error }, categoriesResult] = await Promise.all([
    getShopConfig(),
    getActiveCategories(),
  ])
  isLoading.value = false

  if (error) {
    alertStore.showAlert(t('alert.error'), error.message, 'error')
    return
  }

  if (categoriesResult.error) {
    alertStore.showAlert(t('alert.error'), categoriesResult.error.message, 'error')
  }

  activeCategories.value = categoriesResult.categories ?? []
  applyConfig(config)
}

async function handleQrisUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''

  if (!file) return

  if (!file.type.startsWith('image/')) {
    alertStore.showAlert(t('alert.error'), t('config.imageMustBeImage'), 'error')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    alertStore.showAlert(t('alert.error'), t('config.imageMaxSize'), 'error')
    return
  }

  isUploadingQris.value = true
  const { url, error } = await uploadQrisImage(file)
  isUploadingQris.value = false

  if (error) {
    alertStore.showAlert(t('alert.error'), error.message, 'error')
    return
  }

  qrisPreview.value = url
  alertStore.showAlert(t('alert.success'), t('config.qrisUploaded'), 'success')
}

async function handleRemoveQris() {
  if (!confirm(t('config.deleteQrisConfirm'))) return

  isRemovingQris.value = true
  const { error } = await removeQrisImage()
  isRemovingQris.value = false

  if (error) {
    const message = typeof error === 'object' && 'message' in error
      ? String(error.message)
      : t('config.qrisDeleteFailed')
    alertStore.showAlert(t('alert.error'), message, 'error')
    return
  }

  qrisPreview.value = null
  alertStore.showAlert(t('alert.success'), t('config.qrisDeleted'), 'success')
}

async function handleSaveTransfer() {
  isSavingTransfer.value = true
  const { error } = await updateShopConfig(transferForm.value)
  isSavingTransfer.value = false

  if (error) {
    const message = typeof error === 'object' && 'message' in error
      ? String(error.message)
      : t('config.transferSaveFailed')
    alertStore.showAlert(t('alert.error'), message, 'error')
    return
  }

  alertStore.showAlert(t('alert.success'), t('config.transferSaved'), 'success')
}

async function handleSaveReceipt() {
  isSavingReceipt.value = true
  const { error } = await updateShopConfig({
    shop_name: receiptForm.value.shop_name.trim() || null,
    shop_address: receiptForm.value.shop_address.trim() || null,
  })
  isSavingReceipt.value = false

  if (error) {
    const message = typeof error === 'object' && 'message' in error
      ? String(error.message)
      : t('config.receiptSaveFailed')
    alertStore.showAlert(t('alert.error'), message, 'error')
    return
  }

  alertStore.showAlert(t('alert.success'), t('config.receiptSaved'), 'success')
}

async function handleSavePaymentFlow() {
  isSavingPaymentFlow.value = true
  const { error } = await updateShopConfig(paymentFlowForm.value)
  isSavingPaymentFlow.value = false

  if (error) {
    const message = typeof error === 'object' && 'message' in error
      ? String(error.message)
      : t('config.paymentFlowSaveFailed')
    alertStore.showAlert(t('alert.error'), message, 'error')
    return
  }

  alertStore.showAlert(t('alert.success'), t('config.paymentFlowSaved'), 'success')
}

async function handleSaveBooking() {
  isSavingBooking.value = true
  const { error } = await updateShopConfig(bookingForm.value)
  isSavingBooking.value = false

  if (error) {
    const message = typeof error === 'object' && 'message' in error
      ? String(error.message)
      : t('config.bookingSaveFailed')
    alertStore.showAlert(t('alert.error'), message, 'error')
    return
  }

  alertStore.showAlert(t('alert.success'), t('config.bookingSaved'), 'success')
}

async function handleSaveLoyalty() {
  isSavingLoyalty.value = true
  const { error } = await updateShopConfig(loyaltyForm.value)
  isSavingLoyalty.value = false

  if (error) {
    const message = typeof error === 'object' && 'message' in error
      ? String(error.message)
      : t('config.loyaltySaveFailed')
    alertStore.showAlert(t('alert.error'), message, 'error')
    return
  }

  alertStore.showAlert(t('alert.success'), t('config.loyaltySaved'), 'success')
}

async function handleSaveInvoice() {
  isSavingInvoice.value = true
  const { error } = await updateShopConfig(invoiceForm.value)
  isSavingInvoice.value = false

  if (error) {
    const message = typeof error === 'object' && 'message' in error
      ? String(error.message)
      : t('config.invoiceSaveFailed')
    alertStore.showAlert(t('alert.error'), message, 'error')
    return
  }

  alertStore.showAlert(t('alert.success'), t('config.invoiceSaved'), 'success')
}

async function handleSaveLanding() {
  isSavingLanding.value = true
  const { error } = await updateShopConfig({
    landing_template: landingTemplate.value,
    landing_hero_image_url: landingHeroImage.value || null,
    landing_hero_title: landingHeroTitle.value.trim() || null,
    landing_hero_subtitle: landingHeroSubtitle.value.trim() || null,
    landing_primary_color: landingPrimaryColor.value,
    landing_hero_bg_color: landingHeroBgColor.value,
    landing_hero_bg_image: landingHeroBgImage.value.trim() || null,
    landing_carousel_enabled: landingCarouselEnabled.value,
    landing_carousel_max_items: landingCarouselMaxItems.value,
    landing_carousel_title: landingCarouselTitle.value.trim() || null,
    landing_carousel_bg_color: landingCarouselBgColor.value,
    landing_carousel_bg_image: landingCarouselBgImage.value.trim() || null,
    landing_testimonials_enabled: landingTestimonialsEnabled.value,
    landing_testimonials_title: landingTestimonialsTitle.value.trim() || null,
    landing_testimonials_data: landingTestimonialsData.value.length > 0 ? landingTestimonialsData.value : null,
    landing_testimonials_bg_color: landingTestimonialsBgColor.value,
    landing_testimonials_bg_image: landingTestimonialsBgImage.value.trim() || null,
    landing_services_enabled: landingServicesEnabled.value,
    landing_services_title: landingServicesTitle.value.trim() || null,
    landing_services_subtitle: landingServicesSubtitle.value.trim() || null,
    landing_services_whatsapp: landingServicesWhatsapp.value.trim() || null,
    landing_services_data: landingServicesData.value.length > 0 ? landingServicesData.value : null,
    landing_services_bg_color: landingServicesBgColor.value,
    landing_services_bg_image: landingServicesBgImage.value.trim() || null,
    landing_gallery_enabled: landingGalleryEnabled.value,
    landing_gallery_title: landingGalleryTitle.value.trim() || null,
    landing_gallery_subtitle: landingGallerySubtitle.value.trim() || null,
    landing_gallery_images: landingGalleryImages.value.length > 0 ? landingGalleryImages.value : null,
    landing_gallery_bg_color: landingGalleryBgColor.value,
    landing_gallery_bg_image: landingGalleryBgImage.value.trim() || null,
    landing_contact_enabled: landingContactEnabled.value,
    landing_contact_title: landingContactTitle.value.trim() || null,
    landing_contact_subtitle: landingContactSubtitle.value.trim() || null,
    landing_contact_address: landingContactAddress.value.trim() || null,
    landing_contact_phone: landingContactPhone.value.trim() || null,
    landing_contact_email: landingContactEmail.value.trim() || null,
    landing_contact_map_lat: landingContactMapLat.value,
    landing_contact_map_lng: landingContactMapLng.value,
    landing_contact_map_zoom: landingContactMapZoom.value,
    landing_contact_bg_color: landingContactBgColor.value,
    landing_contact_bg_image: landingContactBgImage.value.trim() || null,
    landing_about_enabled: landingAboutEnabled.value,
    landing_about_label: landingAboutLabel.value.trim() || null,
    landing_about_title: landingAboutTitle.value.trim() || null,
    landing_about_description: landingAboutDescription.value.trim() || null,
    landing_about_image_url: landingAboutImage.value || null,
    landing_about_bullets: landingAboutBullets.value.filter((b) => b.trim()).length > 0
      ? landingAboutBullets.value.filter((b) => b.trim())
      : null,
    landing_about_bg_color: landingAboutBgColor.value,
    landing_about_bg_image: landingAboutBgImage.value.trim() || null,
    landing_why_enabled: landingWhyEnabled.value,
    landing_why_label: landingWhyLabel.value.trim() || null,
    landing_why_title: landingWhyTitle.value.trim() || null,
    landing_why_description: landingWhyDescription.value.trim() || null,
    landing_why_features: landingWhyFeatures.value.filter((f) => f.title.trim()).length > 0
      ? landingWhyFeatures.value
      : null,
    landing_why_stats: landingWhyStats.value.filter((s) => s.label.trim()).length > 0
      ? landingWhyStats.value
      : null,
    landing_why_bg_color: landingWhyBgColor.value,
    landing_why_bg_image: landingWhyBgImage.value.trim() || null,
    landing_book_bg_color: landingBookBgColor.value.trim() || null,
    landing_book_bg_image: landingBookBgImage.value.trim() || null,
  })
  isSavingLanding.value = false

  if (error) {
    const message = typeof error === 'object' && 'message' in error
      ? String(error.message)
      : t('config.landingSaveFailed')
    alertStore.showAlert(t('alert.error'), message, 'error')
    return
  }

  alertStore.showAlert(t('alert.success'), t('config.landingSaved'), 'success')
}

async function handleLandingHeroUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''

  if (!file) return

  if (!file.type.startsWith('image/webp')) {
    alertStore.showAlert(t('alert.error'), t('config.imageMustBeWebp'), 'error')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    alertStore.showAlert(t('alert.error'), t('config.imageMaxSize'), 'error')
    return
  }

  isUploadingLandingHero.value = true
  const { url, error } = await uploadLandingHeroImage(file)
  isUploadingLandingHero.value = false

  if (error) {
    alertStore.showAlert(t('alert.error'), error.message, 'error')
    return
  }

  landingHeroPreview.value = url
  landingHeroImage.value = url
  alertStore.showAlert(t('alert.success'), t('config.landingHeroUploaded'), 'success')
}

async function handleRemoveLandingHero() {
  if (!confirm(t('config.landingHeroDeleteConfirm'))) return

  isRemovingLandingHero.value = true
  const { error } = await removeLandingHeroImage()
  isRemovingLandingHero.value = false

  if (error) {
    const message = typeof error === 'object' && 'message' in error
      ? String(error.message)
      : t('config.landingHeroDeleteFailed')
    alertStore.showAlert(t('alert.error'), message, 'error')
    return
  }

  landingHeroPreview.value = null
  landingHeroImage.value = null
  alertStore.showAlert(t('alert.success'), t('config.landingHeroDeleted'), 'success')
}

async function handleLandingAboutUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''

  if (!file) return

  if (!file.type.startsWith('image/webp')) {
    alertStore.showAlert(t('alert.error'), t('config.imageMustBeWebp'), 'error')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    alertStore.showAlert(t('alert.error'), t('config.imageMaxSize'), 'error')
    return
  }

  isUploadingLandingAbout.value = true
  const { url, error } = await uploadLandingAboutImage(file)
  isUploadingLandingAbout.value = false

  if (error) {
    alertStore.showAlert(t('alert.error'), error.message, 'error')
    return
  }

  landingAboutPreview.value = url
  landingAboutImage.value = url
  alertStore.showAlert(t('alert.success'), t('config.landingAboutUploaded'), 'success')
}

async function handleRemoveLandingAbout() {
  if (!confirm(t('config.landingAboutDeleteConfirm'))) return

  isRemovingLandingAbout.value = true
  const { error } = await removeLandingAboutImage()
  isRemovingLandingAbout.value = false

  if (error) {
    const message = typeof error === 'object' && 'message' in error
      ? String(error.message)
      : t('config.landingAboutDeleteFailed')
    alertStore.showAlert(t('alert.error'), message, 'error')
    return
  }

  landingAboutPreview.value = null
  landingAboutImage.value = null
  alertStore.showAlert(t('alert.success'), t('config.landingAboutDeleted'), 'success')
}

function addAboutBullet() {
  landingAboutBullets.value.push('')
}

function removeAboutBullet(index: number) {
  landingAboutBullets.value.splice(index, 1)
}

function addWhyFeature() {
  landingWhyFeatures.value.push({ title: '', description: '' })
}

function removeWhyFeature(index: number) {
  landingWhyFeatures.value.splice(index, 1)
}

function addWhyStat() {
  landingWhyStats.value.push({ value: '', label: '' })
}

function removeWhyStat(index: number) {
  landingWhyStats.value.splice(index, 1)
}

function addTestimonial() {
  landingTestimonialsData.value.push({
    name: '',
    role: '',
    text: '',
    rating: 5,
    avatar_url: null,
  })
}

function removeTestimonial(index: number) {
  landingTestimonialsData.value.splice(index, 1)
}

async function handleTestimonialAvatarUpload(event: Event, index: number) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''

  if (!file) return

  if (!file.type.startsWith('image/webp')) {
    alertStore.showAlert(t('alert.error'), t('config.imageMustBeWebp'), 'error')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    alertStore.showAlert(t('alert.error'), t('config.imageMaxSize'), 'error')
    return
  }

  const { url, error } = await uploadTestimonialAvatar(file, index)
  if (error) {
    alertStore.showAlert(t('alert.error'), error.message, 'error')
    return
  }

  landingTestimonialsData.value[index].avatar_url = url
  alertStore.showAlert(t('alert.success'), t('config.landingTestimonialAvatarUploaded'), 'success')
}

async function handleTestimonialAvatarRemove(index: number) {
  await removeTestimonialAvatar(index)
  landingTestimonialsData.value[index].avatar_url = null
  alertStore.showAlert(t('alert.success'), t('config.landingTestimonialAvatarDeleted'), 'success')
}

function addServiceItem() {
  landingServicesData.value.push({
    title: '',
    price: '',
    description: '',
    image_url: null,
  })
}

function removeServiceItem(index: number) {
  landingServicesData.value.splice(index, 1)
}

async function handleServiceImageUpload(event: Event, index: number) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''

  if (!file) return

  if (!file.type.startsWith('image/webp')) {
    alertStore.showAlert(t('alert.error'), t('config.imageMustBeWebp'), 'error')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    alertStore.showAlert(t('alert.error'), t('config.imageMaxSize'), 'error')
    return
  }

  const { url, error } = await uploadServiceImage(file, index)
  if (error) {
    alertStore.showAlert(t('alert.error'), error.message, 'error')
    return
  }

  landingServicesData.value[index].image_url = url
  alertStore.showAlert(t('alert.success'), t('config.landingServiceImageUploaded'), 'success')
}

async function handleServiceImageRemove(index: number) {
  await removeServiceImage(index)
  landingServicesData.value[index].image_url = null
  alertStore.showAlert(t('alert.success'), t('config.landingServiceImageDeleted'), 'success')
}

function addGalleryImage() {
  landingGalleryImages.value.push('')
}

function removeGalleryImage(index: number) {
  landingGalleryImages.value.splice(index, 1)
}

async function handleGalleryImageUpload(event: Event, index: number) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''

  if (!file) return

  if (!file.type.startsWith('image/webp')) {
    alertStore.showAlert(t('alert.error'), t('config.imageMustBeWebp'), 'error')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    alertStore.showAlert(t('alert.error'), t('config.imageMaxSize'), 'error')
    return
  }

  const { url, error } = await uploadGalleryImage(file, index)
  if (error) {
    alertStore.showAlert(t('alert.error'), error.message, 'error')
    return
  }

  landingGalleryImages.value.splice(index, 1, url)
  alertStore.showAlert(t('alert.success'), t('config.landingGalleryImageUploaded'), 'success')
}

async function handleGalleryImageRemove(index: number) {
  await removeGalleryImage(index)
  landingGalleryImages.value.splice(index, 1, '')
  alertStore.showAlert(t('alert.success'), t('config.landingGalleryImageDeleted'), 'success')
}

async function handleLogoUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''

  if (!file) return

  if (!file.type.startsWith('image/')) {
    alertStore.showAlert(t('alert.error'), t('config.imageMustBeImage'), 'error')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    alertStore.showAlert(t('alert.error'), t('config.imageMaxSize'), 'error')
    return
  }

  isUploadingLogo.value = true
  const { url, error } = await uploadInvoiceLogo(file)
  isUploadingLogo.value = false

  if (error) {
    alertStore.showAlert(t('alert.error'), error.message, 'error')
    return
  }

  logoPreview.value = url
  invoiceForm.value.invoice_logo_url = url
  invoiceForm.value.invoice_show_logo = true
  alertStore.showAlert(t('alert.success'), t('config.invoiceLogoUploaded'), 'success')
}

async function handleRemoveLogo() {
  if (!confirm(t('config.invoiceLogoDeleteConfirm'))) return

  isRemovingLogo.value = true
  const { error } = await removeInvoiceLogo()
  isRemovingLogo.value = false

  if (error) {
    const message = typeof error === 'object' && 'message' in error
      ? String(error.message)
      : t('config.invoiceLogoDeleteFailed')
    alertStore.showAlert(t('alert.error'), message, 'error')
    return
  }

  logoPreview.value = null
  invoiceForm.value.invoice_logo_url = null
  invoiceForm.value.invoice_show_logo = false
  alertStore.showAlert(t('alert.success'), t('config.invoiceLogoDeleted'), 'success')
}

async function handleSaveMenuCategories() {
  if (menuCategoryCustom.value && menuCategoryIds.value.length === 0) {
    alertStore.showAlert(t('alert.warning'), t('config.menuCategorySelectMin'), 'error')
    return
  }

  isSavingMenuCategories.value = true
  const { error } = await updateShopConfig({
    menu_category_ids: menuCategoryCustom.value ? menuCategoryIds.value : null,
  })
  isSavingMenuCategories.value = false

  if (error) {
    const message = typeof error === 'object' && 'message' in error
      ? String(error.message)
      : t('config.menuCategorySaveFailed')
    alertStore.showAlert(t('alert.error'), message, 'error')
    return
  }

  alertStore.showAlert(t('alert.success'), t('config.menuCategorySaved'), 'success')
}

function handleMenuCategoryCustomChange(enabled: boolean | 'indeterminate') {
  const isEnabled = enabled === true
  menuCategoryCustom.value = isEnabled
  if (!isEnabled) {
    menuCategoryIds.value = []
    return
  }

  if (menuCategoryIds.value.length === 0) {
    menuCategoryIds.value = activeCategories.value.map((category) => category.id)
  }
}

const invoicePreviewHtml = computed(() => {
  const c = invoiceForm.value
  const accent = c.invoice_primary_color || '#000000'
  const loc = locale.value
  const fmtPrice = (p: number) => new Intl.NumberFormat(loc === 'en' ? 'en-US' : 'id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p).replace(/\s/g, ' ')

  const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

  const shopName = receiptForm.value.shop_name || 'INVOICE'
  const shopAddr = receiptForm.value.shop_address || '42 Flavor Street, NY'

  const items = [
    { label: 'Classic Smash Burger', qty: 2, subtotal: 37998 },
    { label: 'Nashville Hot Chicken', qty: 1, subtotal: 16999 },
    { label: 'Truffle Mushroom Pasta (+ extra cheese)', qty: 1, subtotal: 24999 },
    { label: 'Nutella Lava Cake', qty: 2, subtotal: 23998 },
  ]
  const total = items.reduce((s, i) => s + i.subtotal, 0)

  const itemRows = items.map((item) => {
    const qtyCol = c.invoice_show_qty ? `<td class="iq">${item.qty}x</td>` : ''
    const priceCol = c.invoice_show_item_prices ? `<td class="ip">${fmtPrice(item.subtotal)}</td>` : ''
    if (!c.invoice_show_qty && !c.invoice_show_item_prices) return `<tr><td class="in" colspan="2">${esc(item.label)}</td></tr>`
    return `<tr><td class="in">${esc(item.label)}</td>${qtyCol}${priceCol}</tr>`
  }).join('')

  const logo = c.invoice_show_logo && logoPreview.value ? `<div class="logo-w"><img src="${esc(logoPreview.value)}" class="logo-i"></div>` : ''
  const taxId = c.invoice_show_tax_id && c.invoice_tax_id ? `<p class="tid">NPWP: ${esc(c.invoice_tax_id)}</p>` : ''
  const terms = c.invoice_show_terms && c.invoice_terms_text ? `<hr class="div"><p class="trm">${esc(c.invoice_terms_text)}</p>` : ''
  const qris = c.invoice_show_qris ? '<p>QRIS tersedia</p>' : ''
  const footer = c.invoice_footer_text ? `<hr class="div"><p class="ftr">${esc(c.invoice_footer_text)}</p>` : ''
  const xtra = (c.invoice_show_qty ? 1 : 0) + (c.invoice_show_item_prices ? 1 : 0)

  return `<div class="pw">
    ${logo}
    <p class="sn" style="color:${accent}">${esc(shopName)}</p>
    ${shopAddr ? `<p class="sa">${esc(shopAddr)}</p>` : ''}
    ${taxId}
    <hr class="div">
    <p class="meta">No: INV-20260706-abc123</p>
    <p class="meta">Tgl: 06/07/2026, 14:30</p>
    <p class="meta">Pelanggan: Walk-in Customer</p>
    <hr class="div">
    <table class="tb">${itemRows}</table>
    <tfoot class="tf"><tr class="tr"><td${xtra ? ` colspan="${1 + xtra}"` : ''}>TOTAL</td>    ${c.invoice_show_item_prices ? `<td class="ip">${fmtPrice(total)}</td>` : ''}</tr></tfoot>
    <hr class="div">
    <p>Bayar: Cash</p>
    ${qris}
    ${terms}
    ${footer}
    <p class="thx" style="color:${accent}">Terima kasih</p>
  </div>`
})

onMounted(loadConfig)

watch(landingTemplate, (newTemplate) => {
  const preset = LANDING_TEMPLATE_PRESETS[newTemplate as LandingTemplate]
  if (!preset) return
  landingPrimaryColor.value = preset.defaults.primaryColor
  landingHeroBgColor.value = preset.defaults.heroBgColor
  landingCarouselBgColor.value = preset.defaults.carouselBgColor
  landingTestimonialsBgColor.value = preset.defaults.testimonialsBgColor
  landingServicesBgColor.value = preset.defaults.servicesBgColor
  landingGalleryBgColor.value = preset.defaults.galleryBgColor
  landingContactBgColor.value = preset.defaults.contactBgColor
  landingAboutEnabled.value = preset.defaults.aboutEnabled
  landingAboutBgColor.value = preset.defaults.aboutBgColor
  landingWhyEnabled.value = preset.defaults.whyEnabled
  landingWhyBgColor.value = preset.defaults.whyBgColor
})
</script>

<template>
  <DashboardLayout>
    <div class="flex flex-col gap-6 p-6">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">{{ t('config.title') }}</h1>
        <p class="text-sm text-muted-foreground">
          {{ t('config.subtitle') }}
        </p>
      </div>

      <div v-if="isLoading" class="rounded-xl border px-4 py-10 text-center text-muted-foreground">
        {{ t('config.loading') }}
      </div>

      <template v-else>
        <!-- Tab Navigation -->
        <div class="flex flex-wrap gap-1.5 rounded-xl border bg-muted/50 p-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all"
            :class="activeTab === tab.id
              ? 'bg-background text-foreground shadow-sm ring-1 ring-border/50'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'"
            @click="activeTab = tab.id"
          >
            <component :is="tab.icon" class="size-4" />
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab: Store -->
        <div v-show="activeTab === 'store'" class="grid gap-6 lg:grid-cols-2">
          <Card class="lg:col-span-2 border-t-2 border-t-blue-500">
            <CardHeader>
              <div class="flex items-center gap-3">
                <div class="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  <LayoutTemplate class="size-5" />
                </div>
                <div>
                  <CardTitle>{{ t('config.landingTitle') }}</CardTitle>
                  <CardDescription>{{ t('config.landingDesc') }}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form class="max-w-3xl space-y-4" @submit.prevent="handleSaveLanding">
                <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <label
                    v-for="tpl in templateOptions"
                    :key="tpl.id"
                    class="cursor-pointer rounded-xl border-2 p-4 transition-all"
                    :class="landingTemplate === tpl.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-transparent bg-muted/30 hover:border-muted-foreground/30'"
                  >
                    <input
                      type="radio"
                      :value="tpl.id"
                      v-model="landingTemplate"
                      class="sr-only"
                    >
                    <div
                      class="mb-3 flex h-24 items-center justify-center rounded-lg overflow-hidden"
                      :class="tpl.color"
                    >
                      <img
                        v-if="tpl.thumb"
                        :src="tpl.thumb"
                        :alt="tpl.name"
                        class="h-full w-full object-cover"
                      >
                      <span v-else class="text-lg font-bold text-white">{{ tpl.name }}</span>
                    </div>
                    <p class="text-sm font-medium">{{ tpl.name }}</p>
                    <p class="text-xs text-muted-foreground">{{ tpl.desc }}</p>
                  </label>
                </div>

                <div class="rounded-lg border bg-background">
                  <button type="button" class="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors" @click="toggleAccordion('hero')">
                    <span class="flex items-center gap-3">
                      <span class="text-sm font-medium">{{ t('config.landingHeroSection') }}</span>
                    </span>
                    <ChevronDown class="size-4 shrink-0 text-muted-foreground transition-transform" :class="{ 'rotate-180': landingAccordion.hero }" />
                  </button>
                  <div v-show="landingAccordion.hero" class="space-y-4 px-4 pb-4">
                    <p class="text-xs text-muted-foreground">{{ t('config.landingHeroSectionDesc') }}</p>
                    <div>
                      <FieldLabel>{{ t('config.landingHeroImage') }}</FieldLabel>
                      <div class="mt-1 flex min-h-[120px] items-center justify-center rounded-xl border border-dashed bg-muted/30 p-4">
                        <img v-if="landingHeroPreview" :src="landingHeroPreview" alt="Hero" class="max-h-48 max-w-full rounded-lg object-cover">
                        <div v-else class="text-center text-sm text-muted-foreground">
                          <ImageIcon class="mx-auto mb-2 size-8 opacity-50" />
                          {{ t('config.landingHeroImagePlaceholder') }}
                        </div>
                      </div>
                      <div class="mt-3 flex flex-wrap gap-2">
                        <Button as-child :disabled="isUploadingLandingHero">
                          <label class="cursor-pointer">
                            <Upload class="size-4" />
                            {{ isUploadingLandingHero ? t('config.uploading') : t('config.uploadImage') }}
                            <input type="file" accept="image/webp" class="hidden" :disabled="isUploadingLandingHero" @change="handleLandingHeroUpload">
                          </label>
                        </Button>
                        <Button v-if="landingHeroPreview" variant="outline" :disabled="isRemovingLandingHero" @click="handleRemoveLandingHero">
                          <Trash2 class="size-4" /> {{ t('common.delete') }}
                        </Button>
                      </div>
                      <p class="mt-1 text-xs text-muted-foreground">{{ t('config.imageMustBeWebp') }}</p>
                    </div>
                    <Field>
                      <FieldLabel for="landing-hero-title">{{ t('config.landingHeroTitle') }}</FieldLabel>
                      <Input id="landing-hero-title" v-model="landingHeroTitle" :placeholder="t('config.landingHeroTitleHint')" />
                    </Field>
                    <Field>
                      <FieldLabel for="landing-hero-subtitle">{{ t('config.landingHeroSubtitle') }}</FieldLabel>
                      <Input id="landing-hero-subtitle" v-model="landingHeroSubtitle" :placeholder="t('config.landingHeroSubtitleHint')" />
                    </Field>
                    <Field>
                      <FieldLabel for="landing-primary-color">{{ t('config.landingPrimaryColor') }}</FieldLabel>
                      <div class="flex items-center gap-3">
                        <Input id="landing-primary-color" v-model="landingPrimaryColor" type="color" class="size-10 cursor-pointer border-0 p-1" />
                        <span class="text-sm text-muted-foreground">{{ landingPrimaryColor }}</span>
                      </div>
                    </Field>
                    <LandingSectionBgFields v-model:bg-color="landingHeroBgColor" v-model:bg-image="landingHeroBgImage" color-id="landing-hero-bg-color" image-id="landing-hero-bg-image" :color-label="t('config.landingHeroBgColor')" section-key="hero" />
                  </div>
                </div>

                <div class="rounded-lg border bg-background">
                  <button type="button" class="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors" @click="toggleAccordion('about')">
                    <span class="flex items-center gap-3">
                      <span class="text-sm font-medium">{{ t('config.landingAboutEnable') }}</span>
                      <Switch v-model="landingAboutEnabled" @click.stop />
                    </span>
                    <ChevronDown class="size-4 shrink-0 text-muted-foreground transition-transform" :class="{ 'rotate-180': landingAccordion.about }" />
                  </button>
                  <div v-show="landingAccordion.about" class="space-y-4 px-4 pb-4">
                    <template v-if="landingAboutEnabled">
                      <Field>
                        <FieldLabel for="landing-about-label">{{ t('config.landingAboutLabel') }}</FieldLabel>
                        <Input id="landing-about-label" v-model="landingAboutLabel" :placeholder="t('config.landingYummyAbout')" />
                      </Field>
                      <Field>
                        <FieldLabel for="landing-about-title">{{ t('config.landingAboutTitle') }}</FieldLabel>
                        <Input id="landing-about-title" v-model="landingAboutTitle" :placeholder="t('config.landingYummyAboutTitle')" />
                      </Field>
                      <Field>
                        <FieldLabel for="landing-about-description">{{ t('config.landingAboutDescription') }}</FieldLabel>
                        <textarea id="landing-about-description" v-model="landingAboutDescription" class="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" :placeholder="t('config.landingYummyAboutDesc')" />
                      </Field>
                      <Field>
                        <FieldLabel>{{ t('config.landingAboutImage') }}</FieldLabel>
                        <div class="flex flex-wrap items-center gap-3">
                          <div v-if="landingAboutPreview" class="relative size-24 overflow-hidden rounded-lg border">
                            <img :src="landingAboutPreview" alt="About" class="size-full object-cover">
                          </div>
                          <div v-else class="flex size-24 items-center justify-center rounded-lg border bg-muted">
                            <ImageIcon class="size-8 text-muted-foreground" />
                          </div>
                          <Button as-child :disabled="isUploadingLandingAbout">
                            <label class="cursor-pointer">
                              {{ isUploadingLandingAbout ? t('config.uploading') : t('config.uploadImage') }}
                              <input type="file" accept="image/webp" class="hidden" :disabled="isUploadingLandingAbout" @change="handleLandingAboutUpload">
                            </label>
                          </Button>
                          <Button v-if="landingAboutPreview" variant="outline" type="button" :disabled="isRemovingLandingAbout" @click="handleRemoveLandingAbout">
                            {{ t('common.delete') }}
                          </Button>
                        </div>
                      </Field>
                      <div class="space-y-3">
                        <div class="flex items-center justify-between">
                          <p class="text-sm font-medium">{{ t('config.landingAboutBullets') }}</p>
                          <Button size="sm" variant="outline" type="button" @click="addAboutBullet"><Plus class="size-4" /> {{ t('common.add') }}</Button>
                        </div>
                        <div v-for="(bullet, idx) in landingAboutBullets" :key="idx" class="flex items-center gap-2">
                          <Input v-model="landingAboutBullets[idx]" :placeholder="t('config.landingAboutBulletsHint')" />
                          <Button size="icon" variant="ghost" type="button" @click="removeAboutBullet(idx)"><Trash2 class="size-4 text-red-500" /></Button>
                        </div>
                      </div>
                      <LandingSectionBgFields v-model:bg-color="landingAboutBgColor" v-model:bg-image="landingAboutBgImage" color-id="landing-about-bg" image-id="landing-about-bg-image" :color-label="t('config.landingAboutBgColor')" section-key="about" />
                    </template>
                  </div>
                </div>

                <div class="rounded-lg border bg-background">
                  <button type="button" class="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors" @click="toggleAccordion('why')">
                    <span class="flex items-center gap-3">
                      <span class="text-sm font-medium">{{ t('config.landingWhyEnable') }}</span>
                      <Switch v-model="landingWhyEnabled" @click.stop />
                    </span>
                    <ChevronDown class="size-4 shrink-0 text-muted-foreground transition-transform" :class="{ 'rotate-180': landingAccordion.why }" />
                  </button>
                  <div v-show="landingAccordion.why" class="space-y-4 px-4 pb-4">
                    <template v-if="landingWhyEnabled">
                      <Field>
                        <FieldLabel for="landing-why-label">{{ t('config.landingWhyLabel') }}</FieldLabel>
                        <Input id="landing-why-label" v-model="landingWhyLabel" :placeholder="t('config.landingYummyWhyChoose')" />
                      </Field>
                      <Field>
                        <FieldLabel for="landing-why-title">{{ t('config.landingWhyTitle') }}</FieldLabel>
                        <Input id="landing-why-title" v-model="landingWhyTitle" :placeholder="t('config.landingYummyWhyChoose')" />
                      </Field>
                      <Field>
                        <FieldLabel for="landing-why-description">{{ t('config.landingWhyDescription') }}</FieldLabel>
                        <textarea id="landing-why-description" v-model="landingWhyDescription" class="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" :placeholder="t('config.landingYummyWhyChooseDesc')" />
                      </Field>
                      <div class="space-y-4">
                        <div class="flex items-center justify-between">
                          <p class="text-sm font-medium">{{ t('config.landingWhyFeatures') }}</p>
                          <Button size="sm" variant="outline" type="button" @click="addWhyFeature"><Plus class="size-4" /> {{ t('common.add') }}</Button>
                        </div>
                        <div v-for="(feature, idx) in landingWhyFeatures" :key="idx" class="rounded-lg border p-3 space-y-3">
                          <div class="flex items-center justify-between">
                            <span class="text-xs font-medium text-muted-foreground">{{ t('config.landingWhyFeatureItem', { n: idx + 1 }) }}</span>
                            <Button size="icon" variant="ghost" type="button" @click="removeWhyFeature(idx)"><Trash2 class="size-4 text-red-500" /></Button>
                          </div>
                          <Input v-model="feature.title" :placeholder="t('config.landingYummyFeat1Title')" />
                          <textarea v-model="feature.description" class="flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" :placeholder="t('config.landingYummyFeat1Desc')" />
                        </div>
                      </div>
                      <div class="space-y-4">
                        <div class="flex items-center justify-between">
                          <p class="text-sm font-medium">{{ t('config.landingWhyStats') }}</p>
                          <Button size="sm" variant="outline" type="button" @click="addWhyStat"><Plus class="size-4" /> {{ t('common.add') }}</Button>
                        </div>
                        <p class="text-xs text-muted-foreground">{{ t('config.landingWhyStatsHint') }}</p>
                        <div v-for="(stat, idx) in landingWhyStats" :key="idx" class="grid gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_auto]">
                          <Input v-model="stat.value" :placeholder="t('config.landingWhyStatValue')" />
                          <Input v-model="stat.label" :placeholder="t('config.landingWhyStatLabel')" />
                          <Button size="icon" variant="ghost" type="button" @click="removeWhyStat(idx)"><Trash2 class="size-4 text-red-500" /></Button>
                        </div>
                      </div>
                      <LandingSectionBgFields v-model:bg-color="landingWhyBgColor" v-model:bg-image="landingWhyBgImage" color-id="landing-why-bg" image-id="landing-why-bg-image" :color-label="t('config.landingWhyBgColor')" section-key="why" />
                    </template>
                  </div>
                </div>

                <div class="rounded-lg border bg-background">
                  <button type="button" class="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors" @click="toggleAccordion('carousel')">
                    <span class="flex items-center gap-3">
                      <span class="text-sm font-medium">{{ t('config.landingCarouselEnable') }}</span>
                      <Switch v-model="landingCarouselEnabled" @click.stop />
                    </span>
                    <ChevronDown class="size-4 shrink-0 text-muted-foreground transition-transform" :class="{ 'rotate-180': landingAccordion.carousel }" />
                  </button>
                  <div v-show="landingAccordion.carousel" class="space-y-4 px-4 pb-4">
                    <template v-if="landingCarouselEnabled">
                      <Field>
                        <FieldLabel for="landing-carousel-title">{{ t('config.landingCarouselTitle') }}</FieldLabel>
                        <Input id="landing-carousel-title" v-model="landingCarouselTitle" :placeholder="t('config.landingCarouselTitleHint')" />
                      </Field>
                      <Field>
                        <FieldLabel for="landing-carousel-max">{{ t('config.landingCarouselMaxItems') }}</FieldLabel>
                        <Input id="landing-carousel-max" v-model.number="landingCarouselMaxItems" type="number" min="4" max="20" />
                        <p class="mt-1 text-xs text-muted-foreground">{{ t('config.landingCarouselMaxItemsDesc') }}</p>
                      </Field>
                      <LandingSectionBgFields v-model:bg-color="landingCarouselBgColor" v-model:bg-image="landingCarouselBgImage" color-id="landing-carousel-bg" image-id="landing-carousel-bg-image" :color-label="t('config.landingCarouselBgColor')" section-key="carousel" />
                    </template>
                  </div>
                </div>

                <div class="rounded-lg border bg-background">
                  <button type="button" class="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors" @click="toggleAccordion('testimonials')">
                    <span class="flex items-center gap-3">
                      <span class="text-sm font-medium">{{ t('config.landingTestimonialsEnable') }}</span>
                      <Switch v-model="landingTestimonialsEnabled" @click.stop />
                    </span>
                    <ChevronDown class="size-4 shrink-0 text-muted-foreground transition-transform" :class="{ 'rotate-180': landingAccordion.testimonials }" />
                  </button>
                  <div v-show="landingAccordion.testimonials" class="space-y-4 px-4 pb-4">
                    <template v-if="landingTestimonialsEnabled">
                      <Field>
                        <FieldLabel for="landing-testimonials-title">{{ t('config.landingTestimonialsTitle') }}</FieldLabel>
                        <Input id="landing-testimonials-title" v-model="landingTestimonialsTitle" :placeholder="t('config.landingTestimonialsTitleHint')" />
                      </Field>
                      <LandingSectionBgFields v-model:bg-color="landingTestimonialsBgColor" v-model:bg-image="landingTestimonialsBgImage" color-id="landing-testimonials-bg" image-id="landing-testimonials-bg-image" :color-label="t('config.landingTestimonialsBgColor')" section-key="testimonials" />
                      <div class="space-y-4">
                        <div class="flex items-center justify-between">
                          <p class="text-sm font-medium">{{ t('config.landingTestimonialsItems') }}</p>
                          <Button size="sm" variant="outline" type="button" @click="addTestimonial"><Plus class="size-4" /> {{ t('common.add') }}</Button>
                        </div>
                        <div v-for="(item, idx) in landingTestimonialsData" :key="idx" class="rounded-lg border p-3 space-y-3">
                          <div class="flex items-center justify-between">
                            <span class="text-xs font-medium text-muted-foreground">{{ t('config.landingTestimonialItem', { n: idx + 1 }) }}</span>
                            <Button size="icon" variant="ghost" class="size-8" type="button" @click="removeTestimonial(idx)"><Trash2 class="size-4 text-red-500" /></Button>
                          </div>
                          <div class="flex items-center gap-3">
                            <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                              <img v-if="item.avatar_url" :src="item.avatar_url" alt="Avatar" class="size-10 rounded-full object-cover">
                              <User v-else class="size-5 text-muted-foreground" />
                            </div>
                            <div class="flex gap-1.5">
                              <Button as-child size="sm" variant="outline" type="button">
                                <label class="cursor-pointer">
                                  <Upload class="size-3.5" /><span class="ml-1 text-xs">{{ t('config.uploadImage') }}</span>
                                  <input type="file" accept="image/webp" class="hidden" @change="handleTestimonialAvatarUpload($event, idx)">
                                </label>
                              </Button>
                              <Button v-if="item.avatar_url" size="sm" variant="ghost" type="button" @click="handleTestimonialAvatarRemove(idx)"><Trash2 class="size-3.5 text-red-500" /></Button>
                            </div>
                          </div>
                          <Field>
                            <FieldLabel class="text-xs">{{ t('config.landingTestimonialName') }}</FieldLabel>
                            <Input v-model="item.name" :placeholder="t('config.landingTestimonialNamePh')" class="h-8 text-sm" />
                          </Field>
                          <Field>
                            <FieldLabel class="text-xs">{{ t('config.landingTestimonialRole') }}</FieldLabel>
                            <Input v-model="item.role" :placeholder="t('config.landingTestimonialRolePh')" class="h-8 text-sm" />
                          </Field>
                          <Field>
                            <FieldLabel class="text-xs">{{ t('config.landingTestimonialText') }}</FieldLabel>
                            <textarea v-model="item.text" class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" rows="3" :placeholder="t('config.landingTestimonialTextPh')" />
                          </Field>
                          <Field>
                            <FieldLabel class="text-xs">{{ t('config.landingTestimonialRating') }}</FieldLabel>
                            <div class="flex gap-1">
                              <button v-for="i in 5" :key="i" type="button" class="size-6" @click="item.rating = i">
                                <Star class="size-5 transition-colors" :class="i <= item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'" />
                              </button>
                            </div>
                          </Field>
                        </div>
                        <p v-if="landingTestimonialsData.length === 0" class="text-xs text-muted-foreground py-2 text-center">{{ t('config.landingTestimonialsEmptyHint') }}</p>
                      </div>
                    </template>
                  </div>
                </div>

                <div class="rounded-lg border bg-background">
                  <button type="button" class="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors" @click="toggleAccordion('services')">
                    <span class="flex items-center gap-3">
                      <span class="text-sm font-medium">{{ t('config.landingServicesEnable') }}</span>
                      <Switch v-model="landingServicesEnabled" @click.stop />
                    </span>
                    <ChevronDown class="size-4 shrink-0 text-muted-foreground transition-transform" :class="{ 'rotate-180': landingAccordion.services }" />
                  </button>
                  <div v-show="landingAccordion.services" class="space-y-4 px-4 pb-4">
                    <template v-if="landingServicesEnabled">
                      <Field>
                        <FieldLabel for="landing-services-title">{{ t('config.landingServicesTitle') }}</FieldLabel>
                        <Input id="landing-services-title" v-model="landingServicesTitle" :placeholder="t('config.landingServicesTitleHint')" />
                      </Field>
                      <Field>
                        <FieldLabel for="landing-services-subtitle">{{ t('config.landingServicesSubtitle') }}</FieldLabel>
                        <Input id="landing-services-subtitle" v-model="landingServicesSubtitle" :placeholder="t('config.landingServicesSubtitleHint')" />
                      </Field>
                      <Field>
                        <FieldLabel for="landing-services-wa">{{ t('config.landingServicesWhatsapp') }}</FieldLabel>
                        <Input id="landing-services-wa" v-model="landingServicesWhatsapp" placeholder="6281234567890" />
                        <p class="mt-1 text-xs text-muted-foreground">{{ t('config.landingServicesWhatsappHint') }}</p>
                      </Field>
                      <LandingSectionBgFields v-model:bg-color="landingServicesBgColor" v-model:bg-image="landingServicesBgImage" color-id="landing-services-bg" image-id="landing-services-bg-image" :color-label="t('config.landingServicesBgColor')" section-key="services" />
                      <div class="space-y-4">
                        <div class="flex items-center justify-between">
                          <p class="text-sm font-medium">{{ t('config.landingServicesItems') }}</p>
                          <Button size="sm" variant="outline" type="button" @click="addServiceItem"><Plus class="size-4" /> {{ t('common.add') }}</Button>
                        </div>
                        <div v-for="(item, idx) in landingServicesData" :key="idx" class="rounded-lg border p-3 space-y-3">
                          <div class="flex items-center justify-between">
                            <span class="text-xs font-medium text-muted-foreground">{{ t('config.landingServiceItem', { n: idx + 1 }) }}</span>
                            <Button size="icon" variant="ghost" class="size-8" type="button" @click="removeServiceItem(idx)"><Trash2 class="size-4 text-red-500" /></Button>
                          </div>
                          <div class="flex gap-3">
                            <div class="flex size-16 shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden">
                              <img v-if="item.image_url" :src="item.image_url" alt="Service" class="size-full object-cover">
                              <ImageIcon v-else class="size-6 text-muted-foreground" />
                            </div>
                            <div class="flex flex-col justify-center gap-1.5">
                              <Button as-child size="sm" variant="outline" type="button">
                                <label class="cursor-pointer">
                                  <Upload class="size-3.5" /><span class="ml-1 text-xs">{{ t('config.uploadImage') }}</span>
                                  <input type="file" accept="image/webp" class="hidden" @change="handleServiceImageUpload($event, idx)">
                                </label>
                              </Button>
                              <Button v-if="item.image_url" size="sm" variant="ghost" type="button" @click="handleServiceImageRemove(idx)"><Trash2 class="size-3.5 text-red-500" /></Button>
                            </div>
                          </div>
                          <Field>
                            <FieldLabel class="text-xs">{{ t('config.landingServiceItemTitle') }}</FieldLabel>
                            <Input v-model="item.title" :placeholder="t('config.landingServiceItemTitlePh')" class="h-8 text-sm" />
                          </Field>
                          <Field>
                            <FieldLabel class="text-xs">{{ t('config.landingServiceItemPrice') }}</FieldLabel>
                            <Input v-model="item.price" placeholder="$99" class="h-8 text-sm" />
                          </Field>
                          <Field>
                            <FieldLabel class="text-xs">{{ t('config.landingServiceItemDesc') }}</FieldLabel>
                            <textarea v-model="item.description" class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" rows="2" :placeholder="t('config.landingServiceItemDescPh')" />
                          </Field>
                        </div>
                        <p v-if="landingServicesData.length === 0" class="text-xs text-muted-foreground py-2 text-center">{{ t('config.landingServicesEmptyHint') }}</p>
                      </div>
                    </template>
                  </div>
                </div>

                <div class="rounded-lg border bg-background">
                  <button type="button" class="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors" @click="toggleAccordion('gallery')">
                    <span class="flex items-center gap-3">
                      <span class="text-sm font-medium">{{ t('config.landingGalleryEnable') }}</span>
                      <Switch v-model="landingGalleryEnabled" @click.stop />
                    </span>
                    <ChevronDown class="size-4 shrink-0 text-muted-foreground transition-transform" :class="{ 'rotate-180': landingAccordion.gallery }" />
                  </button>
                  <div v-show="landingAccordion.gallery" class="space-y-4 px-4 pb-4">
                    <template v-if="landingGalleryEnabled">
                      <Field>
                        <FieldLabel for="landing-gallery-title">{{ t('config.landingGalleryTitle') }}</FieldLabel>
                        <Input id="landing-gallery-title" v-model="landingGalleryTitle" :placeholder="t('config.landingGalleryTitleHint')" />
                      </Field>
                      <Field>
                        <FieldLabel for="landing-gallery-subtitle">{{ t('config.landingGallerySubtitle') }}</FieldLabel>
                        <Input id="landing-gallery-subtitle" v-model="landingGallerySubtitle" :placeholder="t('config.landingGallerySubtitleHint')" />
                      </Field>
                      <LandingSectionBgFields v-model:bg-color="landingGalleryBgColor" v-model:bg-image="landingGalleryBgImage" color-id="landing-gallery-bg" image-id="landing-gallery-bg-image" :color-label="t('config.landingGalleryBgColor')" section-key="gallery" />
                      <div class="space-y-4">
                        <div class="flex items-center justify-between">
                          <p class="text-sm font-medium">{{ t('config.landingGalleryImages') }}</p>
                          <Button size="sm" variant="outline" type="button" @click="addGalleryImage"><Plus class="size-4" /> {{ t('common.add') }}</Button>
                        </div>
                        <div class="grid grid-cols-4 gap-2">
                          <div v-for="(_, idx) in landingGalleryImages" :key="idx" class="relative aspect-square rounded-lg border bg-muted overflow-hidden">
                            <img v-if="landingGalleryImages[idx]" :src="landingGalleryImages[idx]" alt="Gallery" class="size-full object-cover">
                            <ImageIcon v-else class="absolute inset-0 m-auto size-6 text-muted-foreground" />
                            <div class="absolute right-1 top-1 flex gap-0.5">
                              <Button as-child size="sm" variant="secondary" type="button" class="size-6 p-0">
                                <label class="cursor-pointer">
                                  <Upload class="size-3" />
                                  <input type="file" accept="image/webp" class="hidden" @change="handleGalleryImageUpload($event, idx)">
                                </label>
                              </Button>
                              <Button size="sm" variant="secondary" type="button" class="size-6 p-0" @click="handleGalleryImageRemove(idx)"><Trash2 class="size-3 text-red-500" /></Button>
                            </div>
                          </div>
                        </div>
                        <p v-if="landingGalleryImages.length === 0" class="text-xs text-muted-foreground py-2 text-center">{{ t('config.landingGalleryEmptyHint') }}</p>
                      </div>
                    </template>
                  </div>
                </div>

                <div class="rounded-lg border bg-background">
                  <button type="button" class="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors" @click="toggleAccordion('contact')">
                    <span class="flex items-center gap-3">
                      <span class="text-sm font-medium">{{ t('config.landingContactEnable') }}</span>
                      <Switch v-model="landingContactEnabled" @click.stop />
                    </span>
                    <ChevronDown class="size-4 shrink-0 text-muted-foreground transition-transform" :class="{ 'rotate-180': landingAccordion.contact }" />
                  </button>
                  <div v-show="landingAccordion.contact" class="space-y-4 px-4 pb-4">
                    <template v-if="landingContactEnabled">
                      <Field>
                        <FieldLabel for="landing-contact-title">{{ t('config.landingContactTitle') }}</FieldLabel>
                        <Input id="landing-contact-title" v-model="landingContactTitle" :placeholder="t('config.landingContactTitleHint')" />
                      </Field>
                      <Field>
                        <FieldLabel for="landing-contact-subtitle">{{ t('config.landingContactSubtitle') }}</FieldLabel>
                        <Input id="landing-contact-subtitle" v-model="landingContactSubtitle" :placeholder="t('config.landingContactSubtitleHint')" />
                      </Field>
                      <Field>
                        <FieldLabel for="landing-contact-address">{{ t('config.landingContactAddress') }}</FieldLabel>
                        <Input id="landing-contact-address" v-model="landingContactAddress" placeholder="Jl. Contoh No. 123, Jakarta" />
                      </Field>
                      <Field>
                        <FieldLabel for="landing-contact-phone">{{ t('config.landingContactPhone') }}</FieldLabel>
                        <Input id="landing-contact-phone" v-model="landingContactPhone" placeholder="+62 812 3456 7890" />
                      </Field>
                      <Field>
                        <FieldLabel for="landing-contact-email">{{ t('config.landingContactEmail') }}</FieldLabel>
                        <Input id="landing-contact-email" v-model="landingContactEmail" placeholder="hello@example.com" />
                      </Field>
                      <div class="grid gap-4 sm:grid-cols-3">
                        <Field>
                          <FieldLabel for="landing-contact-lat">Latitude</FieldLabel>
                          <Input id="landing-contact-lat" v-model.number="landingContactMapLat" type="number" step="0.000001" />
                        </Field>
                        <Field>
                          <FieldLabel for="landing-contact-lng">Longitude</FieldLabel>
                          <Input id="landing-contact-lng" v-model.number="landingContactMapLng" type="number" step="0.000001" />
                        </Field>
                        <Field>
                          <FieldLabel for="landing-contact-zoom">Zoom (1-18)</FieldLabel>
                          <Input id="landing-contact-zoom" v-model.number="landingContactMapZoom" type="number" min="1" max="18" />
                        </Field>
                      </div>
                      <LandingSectionBgFields v-model:bg-color="landingContactBgColor" v-model:bg-image="landingContactBgImage" color-id="landing-contact-bg" image-id="landing-contact-bg-image" :color-label="t('config.landingContactBgColor')" section-key="contact" />
                    </template>
                  </div>
                </div>

                <div v-if="landingTemplate === 'yummy'" class="rounded-lg border bg-background">
                  <button type="button" class="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors" @click="toggleAccordion('book')">
                    <span class="text-sm font-medium">{{ t('config.landingBookSectionBg') }}</span>
                    <ChevronDown class="size-4 shrink-0 text-muted-foreground transition-transform" :class="{ 'rotate-180': landingAccordion.book }" />
                  </button>
                  <div v-show="landingAccordion.book" class="space-y-4 px-4 pb-4">
                    <p class="text-xs text-muted-foreground">{{ t('config.landingBookSectionBgDesc') }}</p>
                    <LandingSectionBgFields
                      v-model:bg-color="landingBookBgColor"
                      v-model:bg-image="landingBookBgImage"
                      color-id="landing-book-bg"
                      image-id="landing-book-bg-image"
                      :color-label="t('config.landingBookBgColor')"
                      section-key="book"
                    />
                  </div>
                </div>

                <Button type="submit" :disabled="isSavingLanding">
                  {{ isSavingLanding ? t('common.saving') : t('config.saveLanding') }}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card class="lg:col-span-2 border-t-2 border-t-slate-500">
            <CardHeader>
              <div class="flex items-center gap-3">
                <div class="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
                  <Printer class="size-5" />
                </div>
                <div>
                  <CardTitle>{{ t('config.receiptInfo') }}</CardTitle>
                  <CardDescription>{{ t('config.receiptDesc') }}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form class="max-w-xl" @submit.prevent="handleSaveReceipt">
                <FieldGroup>
                  <Field>
                    <FieldLabel for="shop-name">{{ t('config.shopName') }}</FieldLabel>
                    <Input
                      id="shop-name"
                      v-model="receiptForm.shop_name"
                      :placeholder="t('config.shopNamePh')"
                    />
                  </Field>
                  <Field>
                    <FieldLabel for="shop-address">{{ t('config.shopAddress') }}</FieldLabel>
                    <Input
                      id="shop-address"
                      v-model="receiptForm.shop_address"
                      :placeholder="t('config.shopAddressPh')"
                    />
                  </Field>
                </FieldGroup>
                <Button type="submit" class="mt-6" :disabled="isSavingReceipt">
                  {{ isSavingReceipt ? t('common.saving') : t('config.saveReceipt') }}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <!-- Tab: Payments -->
        <div v-show="activeTab === 'payments'" class="grid gap-6 lg:grid-cols-2">
          <Card class="lg:col-span-2 border-t-2 border-t-emerald-500">
            <CardHeader>
              <div class="flex items-center gap-3">
                <div class="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <Wallet class="size-5" />
                </div>
                <div>
                  <CardTitle>{{ t('config.paymentFlowTitle') }}</CardTitle>
                  <CardDescription>{{ t('config.paymentFlowDesc') }}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form class="max-w-xl space-y-4" @submit.prevent="handleSavePaymentFlow">
                <Field>
                  <FieldLabel>{{ t('config.paymentFlowMode') }}</FieldLabel>
                  <Select v-model="paymentFlowForm.payment_flow_mode">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pay_first_only">{{ t('config.paymentFlowPayFirst') }}</SelectItem>
                      <SelectItem value="eat_first_only">{{ t('config.paymentFlowEatFirst') }}</SelectItem>
                      <SelectItem value="both">{{ t('config.paymentFlowBoth') }}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p class="mt-1 text-xs text-muted-foreground">
                    {{
                      paymentFlowForm.payment_flow_mode === 'pay_first_only'
                        ? t('config.paymentFlowPayFirstHint')
                        : paymentFlowForm.payment_flow_mode === 'eat_first_only'
                          ? t('config.paymentFlowEatFirstHint')
                          : t('config.paymentFlowBothHint')
                    }}
                  </p>
                </Field>

                <div class="flex items-center justify-between rounded-lg border px-3 py-3">
                  <div>
                    <p class="text-sm font-medium">{{ t('config.requireTableForEatFirst') }}</p>
                    <p class="text-xs text-muted-foreground">{{ t('config.requireTableForEatFirstDesc') }}</p>
                  </div>
                  <Switch v-model="paymentFlowForm.require_table_for_eat_first" />
                </div>

                <Button type="submit" :disabled="isSavingPaymentFlow">
                  {{ isSavingPaymentFlow ? t('common.saving') : t('config.savePaymentFlow') }}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card class="border-t-2 border-t-teal-500">
            <CardHeader>
              <div class="flex items-center gap-3">
                <div class="flex size-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                  <QrCode class="size-5" />
                </div>
                <div>
                  <CardTitle>{{ t('config.qrisTitle') }}</CardTitle>
                  <CardDescription>{{ t('config.qrisDesc') }}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent class="space-y-4">
              <div
                class="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed bg-muted/30 p-4"
              >
                <img
                  v-if="qrisPreview"
                  :src="qrisPreview"
                  alt="QRIS"
                  class="max-h-64 max-w-full rounded-lg object-contain"
                >
                <div v-else class="text-center text-sm text-muted-foreground">
                  <ImageIcon class="mx-auto mb-2 size-8 opacity-50" />
                  {{ t('config.noQris') }}
                </div>
              </div>

              <div class="flex flex-wrap gap-2">
                <Button as-child :disabled="isUploadingQris">
                  <label class="cursor-pointer">
                    <Upload class="size-4" />
                    {{ isUploadingQris ? t('config.uploading') : t('config.uploadImage') }}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      class="hidden"
                      :disabled="isUploadingQris"
                      @change="handleQrisUpload"
                    >
                  </label>
                </Button>
                <Button
                  v-if="qrisPreview"
                  variant="outline"
                  :disabled="isRemovingQris"
                  @click="handleRemoveQris"
                >
                  <Trash2 class="size-4" />
                  {{ t('common.delete') }}
                </Button>
              </div>
              <p class="text-xs text-muted-foreground">
                {{ t('config.imageFormat') }}
              </p>
            </CardContent>
          </Card>

          <Card class="border-t-2 border-t-green-500">
            <CardHeader>
              <div class="flex items-center gap-3">
                <div class="flex size-10 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                  <Landmark class="size-5" />
                </div>
                <div>
                  <CardTitle>{{ t('config.transferTitle') }}</CardTitle>
                  <CardDescription>{{ t('config.transferDesc') }}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form @submit.prevent="handleSaveTransfer">
                <FieldGroup>
                  <Field>
                    <FieldLabel for="bank-name">{{ t('config.bankName') }}</FieldLabel>
                    <Input
                      id="bank-name"
                      v-model="transferForm.transfer_bank_name"
                      :placeholder="t('config.bankNamePh')"
                    />
                  </Field>
                  <Field>
                    <FieldLabel for="account-number">{{ t('payment.accountNumber') }}</FieldLabel>
                    <Input
                      id="account-number"
                      v-model="transferForm.transfer_account_number"
                      :placeholder="t('config.accountNumberPh')"
                    />
                  </Field>
                  <Field>
                    <FieldLabel for="account-holder">{{ t('payment.accountHolder') }}</FieldLabel>
                    <Input
                      id="account-holder"
                      v-model="transferForm.transfer_account_holder"
                      :placeholder="t('config.accountHolderPh')"
                    />
                  </Field>
                </FieldGroup>

                <Button type="submit" class="mt-6" :disabled="isSavingTransfer">
                  {{ isSavingTransfer ? t('common.saving') : t('config.saveTransfer') }}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <!-- Tab: Invoice -->
        <div v-show="activeTab === 'invoice'">
          <Card class="border-t-2 border-t-violet-500">
            <CardHeader>
              <div class="flex items-center gap-3">
                <div class="flex size-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                  <ReceiptText class="size-5" />
                </div>
                <div>
                  <CardTitle>{{ t('config.invoiceTitle') }}</CardTitle>
                  <CardDescription>{{ t('config.invoiceDesc') }}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form class="flex flex-col gap-0 lg:flex-row lg:gap-8" @submit.prevent="handleSaveInvoice">
                <!-- Left: Form Controls -->
                <div class="flex-1 space-y-4 lg:max-w-md">
                  <Field>
                    <FieldLabel for="invoice-primary-color">{{ t('config.invoicePrimaryColor') }}</FieldLabel>
                    <div class="flex items-center gap-3">
                      <Input id="invoice-primary-color" v-model="invoiceForm.invoice_primary_color" type="color" class="size-10 cursor-pointer border-0 p-1" />
                      <span class="text-sm text-muted-foreground">{{ invoiceForm.invoice_primary_color }}</span>
                    </div>
                  </Field>

                  <div class="flex items-center justify-between rounded-lg border px-3 py-3">
                    <div>
                      <p class="text-sm font-medium">{{ t('config.invoiceShowLogo') }}</p>
                    </div>
                    <Switch v-model="invoiceForm.invoice_show_logo" />
                  </div>

                  <template v-if="invoiceForm.invoice_show_logo">
                    <div class="flex min-h-[80px] items-center justify-center rounded-lg border border-dashed bg-muted/30 p-3">
                      <img v-if="logoPreview" :src="logoPreview" alt="Invoice Logo" class="max-h-20 max-w-full rounded object-contain">
                      <div v-else class="text-center text-sm text-muted-foreground">
                        <ImageIcon class="mx-auto mb-1 size-6 opacity-50" />
                        {{ t('config.invoiceNoLogo') }}
                      </div>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <Button as-child :disabled="isUploadingLogo">
                        <label class="cursor-pointer">
                          <Upload class="size-4" />
                          {{ isUploadingLogo ? t('config.uploading') : t('config.invoiceUploadLogo') }}
                          <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" class="hidden" :disabled="isUploadingLogo" @change="handleLogoUpload">
                        </label>
                      </Button>
                      <Button v-if="logoPreview" variant="outline" :disabled="isRemovingLogo" @click="handleRemoveLogo">
                        <Trash2 class="size-4" /> {{ t('common.delete') }}
                      </Button>
                    </div>
                    <p class="text-xs text-muted-foreground">{{ t('config.imageFormat') }}</p>
                  </template>

                  <div class="flex items-center justify-between rounded-lg border px-3 py-3">
                    <div><p class="text-sm font-medium">{{ t('config.invoiceShowTaxId') }}</p></div>
                    <Switch v-model="invoiceForm.invoice_show_tax_id" />
                  </div>
                  <Field v-if="invoiceForm.invoice_show_tax_id">
                    <FieldLabel for="invoice-tax-id">{{ t('config.invoiceTaxId') }}</FieldLabel>
                    <Input id="invoice-tax-id" v-model="invoiceForm.invoice_tax_id" placeholder="00.000.000.0-000.000" />
                  </Field>

                  <div class="flex items-center justify-between rounded-lg border px-3 py-3">
                    <div><p class="text-sm font-medium">{{ t('config.invoiceShowTerms') }}</p></div>
                    <Switch v-model="invoiceForm.invoice_show_terms" />
                  </div>
                  <Field v-if="invoiceForm.invoice_show_terms">
                    <FieldLabel for="invoice-terms">{{ t('config.invoiceTermsText') }}</FieldLabel>
                    <textarea id="invoice-terms" v-model="invoiceForm.invoice_terms_text" class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" rows="2" placeholder="Payment due within 7 days" />
                  </Field>

                  <Field>
                    <FieldLabel for="invoice-footer">{{ t('config.invoiceFooterText') }}</FieldLabel>
                    <textarea id="invoice-footer" v-model="invoiceForm.invoice_footer_text" class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" rows="2" placeholder="Thank you for your purchase!" />
                  </Field>

                  <div class="flex items-center justify-between rounded-lg border px-3 py-3">
                    <div><p class="text-sm font-medium">{{ t('config.invoiceShowQris') }}</p></div>
                    <Switch v-model="invoiceForm.invoice_show_qris" />
                  </div>
                  <div class="flex items-center justify-between rounded-lg border px-3 py-3">
                    <div><p class="text-sm font-medium">{{ t('config.invoiceShowItemPrices') }}</p></div>
                    <Switch v-model="invoiceForm.invoice_show_item_prices" />
                  </div>
                  <div class="flex items-center justify-between rounded-lg border px-3 py-3">
                    <div>
                      <p class="text-sm font-medium">{{ t('config.invoiceShowQty') }}</p>
                      <p class="text-xs text-muted-foreground">{{ t('config.invoiceShowQtyDesc') }}</p>
                    </div>
                    <Switch v-model="invoiceForm.invoice_show_qty" />
                  </div>

                  <Button type="submit" :disabled="isSavingInvoice">
                    {{ isSavingInvoice ? t('common.saving') : t('config.saveInvoice') }}
                  </Button>
                </div>

                <!-- Right: Live Preview -->
                <div class="flex-1 lg:sticky lg:top-6 lg:self-start">
                  <p class="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">Preview</p>
                  <div class="overflow-hidden rounded-xl border bg-white shadow-sm">
                    <div class="mx-auto max-w-[72mm] px-[4mm] py-[4mm]" v-html="invoicePreviewHtml" />
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <!-- Tab: Features -->
        <div v-show="activeTab === 'features'" class="grid gap-6 lg:grid-cols-2">
          <Card class="lg:col-span-2 border-t-2 border-t-amber-500">
            <CardHeader>
              <div class="flex items-center gap-3">
                <div class="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                  <CalendarDays class="size-5" />
                </div>
                <div>
                  <CardTitle>{{ t('config.bookingTitle') }}</CardTitle>
                  <CardDescription>{{ t('config.bookingDesc') }}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form class="max-w-xl space-y-4" @submit.prevent="handleSaveBooking">
                <div class="flex items-center justify-between rounded-lg border px-3 py-3">
                  <div>
                    <p class="text-sm font-medium">{{ t('config.bookingEnable') }}</p>
                    <p class="text-xs text-muted-foreground">{{ t('config.bookingEnableDesc') }}</p>
                  </div>
                  <Switch v-model="bookingForm.enable_table_booking" />
                </div>

                <FieldGroup>
                  <Field>
                    <FieldLabel for="booking-duration">{{ t('config.bookingDuration') }}</FieldLabel>
                    <Input
                      id="booking-duration"
                      v-model.number="bookingForm.booking_duration_minutes"
                      type="number"
                      min="30"
                      step="15"
                    />
                  </Field>
                  <Field>
                    <FieldLabel for="booking-advance">{{ t('config.bookingAdvanceDays') }}</FieldLabel>
                    <Input
                      id="booking-advance"
                      v-model.number="bookingForm.booking_advance_days_max"
                      type="number"
                      min="1"
                      max="90"
                    />
                  </Field>
                  <div class="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel for="booking-open">{{ t('config.bookingOpenTime') }}</FieldLabel>
                      <Input id="booking-open" v-model="bookingForm.booking_open_time" type="time" />
                    </Field>
                    <Field>
                      <FieldLabel for="booking-close">{{ t('config.bookingCloseTime') }}</FieldLabel>
                      <Input id="booking-close" v-model="bookingForm.booking_close_time" type="time" />
                    </Field>
                  </div>
                </FieldGroup>

                <div class="flex items-center justify-between rounded-lg border px-3 py-3">
                  <div>
                    <p class="text-sm font-medium">{{ t('config.bookingAutoConfirm') }}</p>
                    <p class="text-xs text-muted-foreground">{{ t('config.bookingAutoConfirmDesc') }}</p>
                  </div>
                  <Switch v-model="bookingForm.booking_auto_confirm" />
                </div>

                <Button type="submit" :disabled="isSavingBooking">
                  {{ isSavingBooking ? t('common.saving') : t('config.saveBooking') }}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card class="border-t-2 border-t-orange-500">
            <CardHeader>
              <div class="flex items-center gap-3">
                <div class="flex size-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                  <Gift class="size-5" />
                </div>
                <div>
                  <CardTitle>{{ t('config.loyaltyTitle') }}</CardTitle>
                  <CardDescription>{{ t('config.loyaltyDesc') }}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form class="max-w-xl space-y-4" @submit.prevent="handleSaveLoyalty">
                <div class="flex items-center justify-between rounded-lg border px-3 py-3">
                  <div>
                    <p class="text-sm font-medium">{{ t('config.loyaltyEnable') }}</p>
                    <p class="text-xs text-muted-foreground">{{ t('config.loyaltyEnableDesc') }}</p>
                  </div>
                  <Switch v-model="loyaltyForm.loyalty_enabled" />
                </div>

                <Field>
                  <FieldLabel for="loyalty-points-per-tx">{{ t('config.loyaltyPointsPerTransaction') }}</FieldLabel>
                  <Input
                    id="loyalty-points-per-tx"
                    v-model.number="loyaltyForm.loyalty_points_per_transaction"
                    type="number"
                    min="0"
                    step="1"
                    :disabled="!loyaltyForm.loyalty_enabled"
                  />
                </Field>

                <Field>
                  <FieldLabel for="loyalty-point-value">{{ t('config.loyaltyPointRedeemValue') }}</FieldLabel>
                  <Input
                    id="loyalty-point-value"
                    v-model.number="loyaltyForm.loyalty_point_redeem_value"
                    type="number"
                    min="0"
                    step="100"
                    :disabled="!loyaltyForm.loyalty_enabled"
                  />
                </Field>

                <Field>
                  <FieldLabel for="loyalty-minimum-amount">{{ t('config.loyaltyMinimumTransactionAmount') }}</FieldLabel>
                  <Input
                    id="loyalty-minimum-amount"
                    v-model.number="loyaltyForm.loyalty_minimum_transaction_amount"
                    type="number"
                    min="0"
                    step="1000"
                    :disabled="!loyaltyForm.loyalty_enabled"
                  />
                  <p class="mt-1 text-xs text-muted-foreground">
                    {{ t('config.loyaltyMinimumTransactionAmountDesc') }}
                  </p>
                </Field>

                <Button type="submit" :disabled="isSavingLoyalty">
                  {{ isSavingLoyalty ? t('common.saving') : t('config.saveLoyalty') }}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card class="lg:col-span-2 border-t-2 border-t-rose-500">
            <CardHeader>
              <div class="flex items-center gap-3">
                <div class="flex size-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                  <LayoutGrid class="size-5" />
                </div>
                <div>
                  <CardTitle>{{ t('config.menuCategoryTitle') }}</CardTitle>
                  <CardDescription>{{ t('config.menuCategoryDesc') }}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form class="max-w-2xl space-y-4" @submit.prevent="handleSaveMenuCategories">
                <div class="flex items-center justify-between rounded-lg border px-3 py-3">
                  <div>
                    <p class="text-sm font-medium">{{ t('config.menuCategoryCustom') }}</p>
                    <p class="text-xs text-muted-foreground">{{ t('config.menuCategoryCustomDesc') }}</p>
                  </div>
                  <Switch
                    :model-value="menuCategoryCustom"
                    @update:model-value="handleMenuCategoryCustomChange"
                  />
                </div>

                <MenuCategoryConfigList
                  v-if="menuCategoryCustom"
                  v-model:selected-ids="menuCategoryIds"
                  :categories="activeCategories"
                />

                <Button type="submit" :disabled="isSavingMenuCategories">
                  {{ isSavingMenuCategories ? t('common.saving') : t('config.saveMenuCategories') }}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>

<style scoped>
/* Invoice Preview */
.pw {
  font-family: 'Courier New', Courier, monospace;
  font-size: 10px;
  line-height: 1.35;
  color: #000;
  background: #fff;
}
.pw .sn { font-size: 13px; font-weight: bold; text-align: center; margin-bottom: 1px; }
.pw .sa { font-size: 8px; text-align: center; margin-bottom: 4px; }
.pw .tid { font-size: 8px; text-align: center; margin-bottom: 2px; }
.pw .div { border: none; border-top: 1px dashed #999; margin: 4px 0; }
.pw .meta { margin-bottom: 1px; }
.pw .tb { width: 100%; border-collapse: collapse; }
.pw .in { padding: 2px 3px 2px 0; vertical-align: top; }
.pw .iq { padding: 2px 3px; text-align: center; white-space: nowrap; vertical-align: top; }
.pw .ip { padding: 2px 0; text-align: right; white-space: nowrap; vertical-align: top; }
.pw .tf { font-weight: bold; font-size: 11px; }
.pw .tf td { padding-top: 4px; }
.pw .thx { text-align: center; font-weight: bold; margin-top: 4px; }
.pw .ftr { font-size: 9px; text-align: center; margin-top: 2px; }
.pw .trm { font-size: 8px; font-style: italic; margin-top: 2px; }
.pw .logo-w { text-align: center; margin-bottom: 4px; }
.pw .logo-i { max-width: 55mm; max-height: 16mm; }
</style>
