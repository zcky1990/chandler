import { getCookie } from './cookies'
import { supabase } from './supabase'
import { getCurrentUser } from './auth'
import { useLocaleStore } from '@/stores/useLocaleStore'
import type { UserRole } from '@/types/database'
import type { AppRole, Profile } from '@/types/database'

export async function getCurrentUserProfile() {
  const { user, error: userError } = await getCurrentUser()
  if (userError || !user) {
    return { profile: null, error: userError ?? { message: 'User not found' } }
  }

  const supabaseClient = supabase()
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('id, full_name, email, role, created_at, updated_at')
    .eq('id', user.id)
    .single()

  return { profile: data as Profile | null, error }
}

export async function getRoles() {
  const supabaseClient = supabase()
  const { data, error } = await supabaseClient
    .from('roles')
    .select('code, sort_order')
    .order('sort_order', { ascending: true })

  return { roles: (data ?? []) as AppRole[], error }
}

export async function listProfiles() {
  const supabaseClient = supabase()
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('id, full_name, email, role, created_at, updated_at')
    .order('created_at', { ascending: true })

  return { profiles: (data ?? []) as Profile[], error }
}

export async function updateProfileRole(userId: string, role: UserRole) {
  const supabaseClient = supabase()
  const { data, error } = await supabaseClient
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single()

  return { profile: data as Profile | null, error }
}

export async function createUserWithRole(input: {
  email: string
  password: string
  fullName: string
  role: UserRole
}) {
  const supabaseClient = supabase()
  const accessToken = getCookie('_access_token')
  const refreshToken = getCookie('_refresh_token')

  const { data, error } = await supabaseClient.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: {
        full_name: input.fullName.trim(),
        role: input.role,
      },
    },
  })

  if (error) {
    return { userId: null, error }
  }

  if (accessToken && refreshToken) {
    await supabaseClient.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
  }

  const userId = data.user?.id ?? null
  if (userId) {
    await updateProfileRole(userId, input.role)
  }

  return { userId, error: null }
}

export function getRoleLabelKey(role: UserRole) {
  return role === 'owner' ? 'role.owner' : 'role.staff'
}

export async function assertOwnerAction() {
  const { profile, error } = await getCurrentUserProfile()
  if (error || !profile) {
    return { ok: false, error: error ?? { message: useLocaleStore().translate('role.userRequired') } }
  }
  if (profile.role !== 'owner') {
    return { ok: false, error: { message: useLocaleStore().translate('role.ownerOnly') } }
  }
  return { ok: true, error: null }
}
