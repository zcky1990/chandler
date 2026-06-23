import { storeToRefs } from 'pinia'
import { useLocaleStore } from '@/stores/useLocaleStore'
import type { MessageKey } from '@/lib/i18n/messages'

export function useI18n() {
  const localeStore = useLocaleStore()
  const { locale } = storeToRefs(localeStore)

  function t(key: MessageKey, params?: Record<string, string | number>) {
    return localeStore.translate(key, params)
  }

  return { t, locale, localeStore }
}
