const APP_TITLE_STORAGE_KEY = 'app_title'
const FALLBACK_TITLE = 'Bistro'

function normalizeTitle(title?: string | null) {
  return title?.trim() || FALLBACK_TITLE
}

export function applyAppTitle(title?: string | null) {
  const normalized = normalizeTitle(title)
  document.title = normalized
  localStorage.setItem(APP_TITLE_STORAGE_KEY, normalized)
}

export function initAppTitle() {
  const cachedTitle = localStorage.getItem(APP_TITLE_STORAGE_KEY)
  document.title = normalizeTitle(cachedTitle)
}
