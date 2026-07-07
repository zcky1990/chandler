<script setup lang="ts">
import { ref, watch } from 'vue'
import { Printer } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useI18n } from '@/composables/useI18n'
import { getShopConfig } from '@/lib/config'
import { applyShopInfoToInvoice, buildInvoiceCustomization, getPaymentMethodLabel, formatInvoiceDateTime, type InvoiceData } from '@/lib/invoice'
import { formatPrice } from '@/lib/format'
import { printInvoice } from '@/lib/print-invoice'
import { WALK_IN_CUSTOMER_NAME } from '@/types/database'

const props = defineProps<{
  open: boolean
  invoice: InvoiceData | null
}>()

const { t, locale } = useI18n()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const previewHtml = ref('')

function displayCustomerName(name: string) {
  if (name === WALK_IN_CUSTOMER_NAME) return t('common.walkIn')
  return name
}

async function buildPreview() {
  if (!props.invoice) {
    previewHtml.value = ''
    return
  }

  const { config } = await getShopConfig()
  const customization = buildInvoiceCustomization(config)
  const data = applyShopInfoToInvoice(
    props.invoice,
    config?.shop_name,
    config?.shop_address,
    customization,
  )

  const c = data.customization
  const accent = c.primaryColor || '#000000'
  const localeCode = locale.value

  const itemRows = data.items.map((item) => {
    const qtyCol = c.showQty ? `<td class="item-qty">${item.quantity}x</td>` : ''
    const priceCol = c.showItemPrices
      ? `<td class="item-price">${formatPrice(item.subtotal)}</td>`
      : ''
    if (!c.showQty && !c.showItemPrices) {
      return `<tr><td class="item-name" colspan="2">${escapeHtml(item.label)}</td></tr>`
    }
    return `<tr><td class="item-name">${escapeHtml(item.label)}</td>${qtyCol}${priceCol}</tr>`
  }).join('')

  const logoBlock = c.showLogo && c.logoUrl
    ? `<div style="text-align:center;margin-bottom:6px"><img src="${escapeHtml(c.logoUrl)}" style="max-width:60mm;max-height:20mm" /></div>`
    : ''

  const taxIdBlock = c.showTaxId && c.taxId
    ? `<p style="font-size:10px;margin-bottom:4px">${escapeHtml(t('invoice.taxIdLabel'))} ${escapeHtml(c.taxId)}</p>`
    : ''

  const termsBlock = c.showTerms && c.termsText
    ? `<hr style="border:1px dashed ${accent}"><p style="font-size:9px;font-style:italic">${escapeHtml(c.termsText)}</p>`
    : ''

  const footerBlock = c.footerText
    ? `<hr style="border:1px dashed ${accent}"><p style="font-size:10px;text-align:center">${escapeHtml(c.footerText)}</p>`
    : ''

  const qrisBlock = c.showQris
    ? `<p>${escapeHtml(t('receipt.qris'))} ${escapeHtml(t('config.qrisTitle'))}</p>`
    : ''

  const extraCols = (c.showQty ? 1 : 0) + (c.showItemPrices ? 1 : 0)

  previewHtml.value = `<div style="width:72mm;font-family:'Courier New',monospace;font-size:11px;line-height:1.4;color:#000;background:#fff;padding:4mm;margin:0 auto">
    ${logoBlock}
    <div style="text-align:center">
      <p style="font-size:14px;font-weight:bold;color:${accent};margin-bottom:2px">${escapeHtml(data.shopName)}</p>
      ${data.shopAddress ? `<p style="font-size:10px;margin-bottom:6px">${escapeHtml(data.shopAddress)}</p>` : ''}
      ${taxIdBlock}
    </div>
    <hr style="border:1px dashed ${accent};margin:6px 0">
    <p style="margin-bottom:2px">${escapeHtml(t('receipt.number'))} ${escapeHtml(data.invoiceNumber)}</p>
    <p style="margin-bottom:2px">${escapeHtml(t('receipt.date'))} ${escapeHtml(formatInvoiceDateTime(data.paidAt, localeCode))}</p>
    <p style="margin-bottom:2px">${escapeHtml(t('receipt.customer'))} ${escapeHtml(displayCustomerName(data.customerName))}</p>
    <hr style="border:1px dashed ${accent};margin:6px 0">
    <table style="width:100%;border-collapse:collapse">${itemRows}</table>
    <hr style="border:1px dashed ${accent};margin:6px 0">
    <p style="font-size:10px">${escapeHtml(t('receipt.pay'))} ${escapeHtml(getPaymentMethodLabel(data.paymentMethod))}</p>
    ${qrisBlock}
    ${termsBlock}
    ${footerBlock}
    <p style="text-align:center;font-weight:bold;margin-top:6px;color:${accent}">${escapeHtml(t('receipt.thanks'))}</p>
  </div>`
}

watch(() => [props.open, props.invoice], () => {
  if (props.open) buildPreview()
}, { immediate: true })

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function handlePrint() {
  if (!props.invoice) return

  const { config } = await getShopConfig()
  const customization = buildInvoiceCustomization(config)
  const data = applyShopInfoToInvoice(
    props.invoice,
    config?.shop_name,
    config?.shop_address,
    customization,
  )
  printInvoice(data)
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[520px]">
      <DialogHeader>
        <DialogTitle>{{ t('invoice.preview') }}</DialogTitle>
        <DialogDescription v-if="invoice">
          {{ invoice.invoiceNumber }}
        </DialogDescription>
      </DialogHeader>

      <div
        v-if="previewHtml"
        class="max-h-[60vh] overflow-auto rounded-xl border bg-white p-4"
        v-html="previewHtml"
      />

      <DialogFooter class="gap-2 sm:gap-2">
        <Button variant="outline" @click="emit('update:open', false)">
          {{ t('common.close') }}
        </Button>
        <Button :disabled="!invoice" @click="handlePrint">
          <Printer class="size-4" />
          {{ t('invoice.reprint') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
