import { useLocaleStore } from '@/stores/useLocaleStore'

function intlLocale() {
  const locale = useLocaleStore().locale
  return locale === 'en' ? 'en-US' : 'id-ID'
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat(intlLocale(), {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

export function formatQueueNumber(number: number) {
  return `#${String(number).padStart(3, '0')}`
}
