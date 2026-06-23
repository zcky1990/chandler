import { en } from './en'
import { id } from './id'

export type Locale = 'id' | 'en'

export const LOCALE_LABELS: Record<Locale, string> = {
  id: 'Bahasa Indonesia',
  en: 'English',
}

export const messages = { id, en } as const

export type MessageKey = keyof typeof id

export function interpolate(
  template: string,
  params?: Record<string, string | number>,
) {
  if (!params) return template

  return Object.entries(params).reduce(
    (result, [key, value]) => result.replace(`{${key}}`, String(value)),
    template,
  )
}
