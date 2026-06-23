import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { interpolate, messages, type Locale, type MessageKey } from '@/lib/i18n/messages'

const LOCALE_STORAGE_KEY = 'locale'

function isLocale(value: string | null): value is Locale {
  return value === 'id' || value === 'en'
}

export const useLocaleStore = defineStore('locale', () => {
  const locale = ref<Locale>(
    isLocale(localStorage.getItem(LOCALE_STORAGE_KEY)) ? localStorage.getItem(LOCALE_STORAGE_KEY)! : 'id',
  )

  function translate(key: MessageKey, params?: Record<string, string | number>) {
    const template = messages[locale.value][key] ?? messages.id[key] ?? key
    return interpolate(template, params)
  }

  const t = computed(() => translate)

  function setLocale(next: Locale) {
    locale.value = next
  }

  function initLocale() {
    document.documentElement.lang = locale.value
  }

  watch(locale, (next) => {
    localStorage.setItem(LOCALE_STORAGE_KEY, next)
    document.documentElement.lang = next
  })

  return { locale, t, translate, setLocale, initLocale }
})
