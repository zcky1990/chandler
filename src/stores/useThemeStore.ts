import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export type Theme = 'light' | 'dark' | 'system'

const THEME_STORAGE_KEY = 'theme'

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyThemeToDOM(theme: Theme) {
  const root = document.documentElement
  root.classList.remove('dark')

  const resolvedTheme = theme === 'system' ? getSystemTheme() : theme
  if (resolvedTheme === 'dark') {
    root.classList.add('dark')
  }
}

export const useThemeStore = defineStore('theme', () => {
  const themeState = ref<Theme>(
    (localStorage.getItem(THEME_STORAGE_KEY) as Theme | null) ?? 'system',
  )

  function setTheme(theme: Theme) {
    themeState.value = theme
  }

  function initTheme() {
    applyThemeToDOM(themeState.value)

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (themeState.value === 'system') {
        applyThemeToDOM('system')
      }
    })
  }

  watch(themeState, (newTheme) => {
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    applyThemeToDOM(newTheme)
  })

  return { themeState, setTheme, initTheme }
})
