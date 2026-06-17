import { createClient, type Session } from '@supabase/supabase-js'
import type { Router } from 'vue-router'
import { clearAuthCookies, getCookie, setCookie } from './cookies'

const supabaseUrl = import.meta.env.VITE_SUPERBASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPERBASE_PUBLISH_KEY

export const supabase = async () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}

export const persistAuthSession = (session: Session) => {
  setCookie('_access_token', session.access_token)
  setCookie('_token_type', session.token_type)
  setCookie('_refresh_token', session.refresh_token)
  setCookie('_expires_in', String(session.expires_in))
  if (session.user.email) {
    setCookie('_user_email', session.user.email)
  }
}

export const validateOrRefreshSession = async (router: Router) => {
  const accessToken = getCookie('_access_token')
  const refreshToken = getCookie('_refresh_token')

  if (!accessToken || !refreshToken) return

  const supabaseClient = await supabase()

  const logout = async () => {
    await supabaseClient.auth.signOut()
    clearAuthCookies()
    router.push('/login')
  }

  const refresh = async () => {
    const { data, error } = await supabaseClient.auth.refreshSession({
      refresh_token: refreshToken,
    })
    if (error || !data.session) {
      await logout()
      return false
    }
    persistAuthSession(data.session)
    return true
  }

  const { data, error } = await supabaseClient.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  if (error || !data.session) {
    await refresh()
    return
  }

  const { error: userError } = await supabaseClient.auth.getUser()
  if (userError) {
    await refresh()
    return
  }

  if (data.session.access_token !== accessToken) {
    persistAuthSession(data.session)
  }
}