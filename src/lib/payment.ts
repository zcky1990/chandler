export function getPaymentProofWhatsapp() {
  return import.meta.env.VITE_PAYMENT_PROOF_WHATSAPP?.trim() ?? ''
}

export function formatWhatsappDisplay(number: string) {
  const digits = number.replace(/\D/g, '')
  if (!digits) return ''

  if (digits.startsWith('62')) {
    return `+62 ${digits.slice(2)}`
  }

  if (digits.startsWith('0')) {
    return `+62 ${digits.slice(1)}`
  }

  return `+${digits}`
}

export function getWhatsappProofUrl(message?: string) {
  const raw = getPaymentProofWhatsapp()
  const digits = raw.replace(/\D/g, '')
  if (!digits) return null

  const normalized = digits.startsWith('0') ? `62${digits.slice(1)}` : digits
  const text = encodeURIComponent(
    message ?? 'Halo, saya ingin mengirim bukti pembayaran tunggakan Warung Zavi.',
  )

  return `https://wa.me/${normalized}?text=${text}`
}
