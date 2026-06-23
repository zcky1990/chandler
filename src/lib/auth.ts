import type { Session } from '@supabase/supabase-js'
import type { Router } from 'vue-router'
import { clearAuthCookies, getCookie, setCookie } from './cookies'
import { supabase } from './supabase'
import { loginSchema, signUpSchema } from '@/schema/schema'

export const isGuestRoute = (path: string) => {
  const GUEST_ROUTES = ['/login', '/sign-up'] as const
  return GUEST_ROUTES.includes(path as (typeof GUEST_ROUTES)[number])
}

export const login = async ({ email, password }: { email: string, password: string }) => {
  const validatedLogin = loginSchema().safeParse({ email, password })
  if (!validatedLogin.success) {
    return { error: validatedLogin.error.flatten().fieldErrors }
  }
  const supabaseClient = supabase()
  const { data, error } = await supabaseClient.auth.signInWithPassword(validatedLogin.data)
  return { data, error: error ? error.message : null }
}

export const signUp = async ({ name, email, password, confirmPassword }: { name: string, email: string, password: string, confirmPassword: string }) => {
  const validatedSignUp = signUpSchema().safeParse({ name, email, password, confirmPassword })
  if (!validatedSignUp.success) {
    return { error: validatedSignUp.error.flatten().fieldErrors }
  }
  const supabaseClient = supabase()
  const { data, error } = await supabaseClient.auth.signUp({
    email: validatedSignUp.data.email,
    password: validatedSignUp.data.password,
    options: {
      data: {
        full_name: validatedSignUp.data.name,
      },
    },
  })
  return { data, error: error ? error.message : null }
}

export const persistAuthSession = async (session: Session) => {
  setCookie('_access_token', session.access_token)
  setCookie('_token_type', session.token_type)
  setCookie('_refresh_token', session.refresh_token)
  setCookie('_expires_in', String(session.expires_in))
  if (session.user.email) {
    setCookie('_user_email', session.user.email)
  }

  await supabase().auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  })
}

export const ensureAuthSession = async (): Promise<boolean> => {
  const accessToken = getCookie('_access_token')
  const refreshToken = getCookie('_refresh_token')

  if (!accessToken || !refreshToken) return false

  const supabaseClient = supabase()
  const { data: { session } } = await supabaseClient.auth.getSession()

  if (session?.access_token === accessToken) {
    return true
  }

  const { error } = await supabaseClient.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  return !error
}

export const validateOrRefreshSession = async (
  router: Router,
  currentPath = router.currentRoute.value.path,
): Promise<boolean> => {
  const accessToken = getCookie('_access_token')
  const refreshToken = getCookie('_refresh_token')

  if (!accessToken || !refreshToken) return false

  const supabaseClient = supabase()

  const logout = async () => {
    await supabaseClient.auth.signOut()
    clearAuthCookies()
    if (!isGuestRoute(currentPath)) {
      router.push('/login')
    }
  }

  const refresh = async () => {
    const { data, error } = await supabaseClient.auth.refreshSession({
      refresh_token: refreshToken,
    })
    if (error || !data.session) {
      await logout()
      return false
    }
    await persistAuthSession(data.session)
    return true
  }

  const { data, error } = await supabaseClient.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  if (error || !data.session) {
    return refresh()
  }

  const { error: userError } = await supabaseClient.auth.getUser()
  if (userError) {
    return refresh()
  }

  if (data.session.access_token !== accessToken) {
    await persistAuthSession(data.session)
  }

  return true
}
