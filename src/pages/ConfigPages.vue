<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { ImageIcon, Landmark, LayoutGrid, LayoutTemplate, Printer, QrCode, ReceiptText, Trash2, Upload, Wallet, CalendarDays, Gift } from '@lucide/vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import MenuCategoryConfigList from '@/components/config/MenuCategoryConfigList.vue'
import satabThumb from '@/assets/satab-thumbnail.webp'
import spiceThumb from '@/assets/spice-thumbnail.webp'
import yummyThumb from '@/assets/yummy-thumbnail.webp'
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
import { getShopConfig, removeInvoiceLogo, removeQrisImage, updateShopConfig, uploadInvoiceLogo, uploadQrisImage } from '@/lib/config'
import { getActiveCategories } from '@/lib/category'
import { usesCustomMenuCategories } from '@/lib/menu-categories'
import { useAlertStore } from '@/stores/useAlertStore'
import type { PaymentFlowMode, ProductCategory, ShopConfig } from '@/types/database'

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
const isSavingLanding = ref(false)
const activeTab = ref('store')

const tabs = computed(() => [
  { id: 'store', label: t('config.tabStore'), icon: LayoutTemplate },
  { id: 'payments', label: t('config.tabPayments'), icon: Wallet },
  { id: 'invoice', label: t('config.tabInvoice'), icon: ReceiptText },
  { id: 'features', label: t('config.tabFeatures'), icon: LayoutGrid },
])

const templateOptions = computed(() => [
  { id: 'default', name: t('config.landingDefault'), desc: t('config.landingDefaultDesc'), thumb: null as string | null, color: 'bg-blue-500' as string | null },
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
  const { error } = await updateShopConfig({ landing_template: landingTemplate.value })
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
