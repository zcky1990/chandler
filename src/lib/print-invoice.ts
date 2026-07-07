import {
  applyShopInfoToInvoice,
  buildInvoiceCustomization,
  buildInvoiceFromTransaction,
  formatInvoiceDateTime,
  getPaymentMethodLabel,
  type InvoiceData,
  type InvoiceCustomization,
} from '@/lib/invoice'
import { getShopConfig } from '@/lib/config'
import { formatPrice, formatQueueNumber } from '@/lib/format'
import { useLocaleStore } from '@/stores/useLocaleStore'
import type { PaymentMethod, TransactionWithDetails } from '@/types/database'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatPricePlain(price: number, locale: string) {
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price).replace(/\s/g, ' ')
}

function buildInvoiceHtml(data: InvoiceData) {
  const localeStore = useLocaleStore()
  const t = localeStore.translate.bind(localeStore)
  const locale = localeStore.locale
  const c = data.customization ?? {} as InvoiceCustomization
  const accent = escapeHtml(c.primaryColor || '#000000')

  const itemRows = data.items.map((item) => {
    const qtyCol = c.showQty
      ? `<td class="item-qty">${item.quantity}x</td>`
      : ''
    const priceCol = c.showItemPrices
      ? `<td class="item-price">${formatPricePlain(item.subtotal, locale)}</td>`
      : ''

    if (!c.showQty && !c.showItemPrices) {
      return `<tr><td class="item-name" colspan="2">${escapeHtml(item.label)}</td></tr>`
    }

    return `<tr>
      <td class="item-name">${escapeHtml(item.label)}</td>
      ${qtyCol}
      ${priceCol}
    </tr>`
  }).join('')

  const logoBlock = c.showLogo && c.logoUrl
    ? `<div class="center logo-wrap"><img src="${escapeHtml(c.logoUrl)}" alt="Logo" class="logo-img" /></div>`
    : ''

  const addressBlock = data.shopAddress
    ? `<p class="shop-address">${escapeHtml(data.shopAddress)}</p>`
    : ''

  const taxIDBlock = c.showTaxId && c.taxId
    ? `<p class="tax-id">${escapeHtml(t('invoice.taxIdLabel'))} ${escapeHtml(c.taxId)}</p>`
    : ''

  const notesBlock = data.notes
    ? `<p class="notes">${escapeHtml(t('receipt.notes'))} ${escapeHtml(data.notes)}</p>`
    : ''

  const queueBlock = data.queueNumber != null
    ? `<p>${escapeHtml(t('receipt.queue'))} ${escapeHtml(formatQueueNumber(data.queueNumber))}</p>`
    : ''

  const termsBlock = c.showTerms && c.termsText
    ? `<div class="divider"></div><p class="terms">${escapeHtml(c.termsText)}</p>`
    : ''

  const qrisBlock = c.showQris
    ? `<p>${escapeHtml(t('receipt.qris'))} ${escapeHtml(t('config.qrisTitle'))}</p>`
    : ''

  const footerBlock = c.footerText
    ? `<div class="divider"></div><p class="footer-text center">${escapeHtml(c.footerText)}</p>`
    : ''

  const qtyColCount = c.showQty ? 1 : 0
  const priceColCount = c.showItemPrices ? 1 : 0
  const extraCols = qtyColCount + priceColCount

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(data.invoiceNumber)}</title>
  <style>
    @page { size: 80mm auto; margin: 4mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 72mm;
      font-family: 'Courier New', Courier, monospace;
      font-size: 11px;
      line-height: 1.4;
      color: #000;
      background: #fff;
    }
    .center { text-align: center; }
    .shop-name { font-size: 14px; font-weight: bold; margin-bottom: 2px; color: ${accent}; }
    .shop-address { font-size: 10px; margin-bottom: 6px; }
    .tax-id { font-size: 10px; margin-bottom: 4px; }
    .divider { border-top: 1px dashed ${accent}; margin: 6px 0; }
    .meta p { margin-bottom: 2px; }
    table { width: 100%; border-collapse: collapse; }
    .item-name { padding: 3px 4px 3px 0; vertical-align: top; }
    .item-qty { padding: 3px 4px; text-align: center; white-space: nowrap; vertical-align: top; }
    .item-price { padding: 3px 0; text-align: right; white-space: nowrap; vertical-align: top; }
    .total-row { font-weight: bold; font-size: 12px; }
    .total-row td { padding-top: 6px; }
    .footer { margin-top: 8px; font-size: 10px; }
    .footer-text { font-size: 10px; }
    .thanks { margin-top: 6px; font-weight: bold; color: ${accent}; }
    .terms { font-size: 9px; font-style: italic; }
    .logo-wrap { margin-bottom: 6px; }
    .logo-img { max-width: 60mm; max-height: 20mm; }
    @media print {
      body { width: 72mm; }
    }
  </style>
</head>
<body>
  ${logoBlock}
  <div class="center">
    <p class="shop-name" style="color: ${accent}">${escapeHtml(data.shopName)}</p>
    ${addressBlock}
    ${taxIDBlock}
  </div>
  <div class="divider"></div>
  <div class="meta">
    <p>${escapeHtml(t('receipt.number'))} ${escapeHtml(data.invoiceNumber)}</p>
    <p>${escapeHtml(t('receipt.date'))} ${escapeHtml(formatInvoiceDateTime(data.paidAt, locale))}</p>
    <p>${escapeHtml(t('receipt.customer'))} ${escapeHtml(data.customerName)}</p>
  </div>
  <div class="divider"></div>
  <table>
    <tbody>
      ${itemRows}
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td${extraCols ? ` colspan="${1 + extraCols}"` : ''}>${escapeHtml(t('common.total').toUpperCase())}</td>
        ${c.showItemPrices ? `<td class="item-price">${formatPricePlain(data.totalAmount, locale)}</td>` : ''}
      </tr>
    </tfoot>
  </table>
  <div class="divider"></div>
  <div class="footer">
    <p>${escapeHtml(t('receipt.pay'))} ${escapeHtml(getPaymentMethodLabel(data.paymentMethod))}</p>
    ${queueBlock}
    ${qrisBlock}
    ${notesBlock}
    ${termsBlock}
    ${footerBlock}
    <p class="center thanks">${escapeHtml(t('receipt.thanks'))}</p>
  </div>
</body>
</html>`
}

export function printInvoice(data: InvoiceData) {
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = 'none'
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument ?? iframe.contentWindow?.document
  if (!doc) {
    document.body.removeChild(iframe)
    return
  }

  doc.open()
  doc.write(buildInvoiceHtml(data))
  doc.close()

  const win = iframe.contentWindow
  if (!win) {
    document.body.removeChild(iframe)
    return
  }

  setTimeout(() => {
    win.focus()
    win.print()
    setTimeout(() => {
      if (iframe.parentNode) {
        document.body.removeChild(iframe)
      }
    }, 1000)
  }, 250)
}

export function formatInvoiceSummaryAmount(amount: number) {
  return formatPrice(amount)
}

export async function printTransactionReceipt(
  transaction: TransactionWithDetails,
  options?: { queueNumber?: number | null, paymentMethod?: PaymentMethod },
) {
  const paymentMethod = options?.paymentMethod ?? transaction.payment_method
  if (!paymentMethod) return

  const { config } = await getShopConfig()
  const customization = buildInvoiceCustomization(config)
  const invoice = applyShopInfoToInvoice(
    buildInvoiceFromTransaction(transaction, paymentMethod, {
      paidAt: transaction.paid_at ?? undefined,
      queueNumber: options?.queueNumber,
    }),
    config?.shop_name,
    config?.shop_address,
    customization,
  )
  printInvoice(invoice)
}
