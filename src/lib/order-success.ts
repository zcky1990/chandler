export type OrderSuccessPayload = {
  orderNumber: number
  totalAmount: number
}

const STORAGE_KEY = 'order_success_payload'

export function saveOrderSuccessPayload(payload: OrderSuccessPayload) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function readOrderSuccessPayload(): OrderSuccessPayload | null {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as OrderSuccessPayload
    if (typeof parsed.orderNumber !== 'number' || typeof parsed.totalAmount !== 'number') {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function clearOrderSuccessPayload() {
  sessionStorage.removeItem(STORAGE_KEY)
}
