export const setCookie = (name: string, value: string) => {
    const secure = window.location.protocol === 'https:' ? '; secure' : ''
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; samesite=strict${secure}`
  }

export const getCookie = (name: string) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    const raw = parts.pop()?.split(';').shift() ?? ''
    return raw ? decodeURIComponent(raw) : ''
  }
  return ''
}

const AUTH_COOKIE_NAMES = [
  '_access_token',
  '_token_type',
  '_refresh_token',
  '_expires_in',
  '_user_email',
] as const

export const clearAuthCookies = () => {
  for (const name of AUTH_COOKIE_NAMES) {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  }
}
