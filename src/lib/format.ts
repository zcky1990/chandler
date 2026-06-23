export function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
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
