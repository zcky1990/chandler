<script setup lang="ts">
import SignupForm from '@/components/new-york-v4/blocks/signup-01/components/SignupForm.vue'
import ApplicationLayout from '@/layouts/ApplicationLayout.vue'
import { signUp } from '@/lib/auth'
import { useI18n } from '@/composables/useI18n'
import { useAlertStore } from '@/stores/useAlertStore'
import { useRouter } from 'vue-router'

const alertStore = useAlertStore()
const router = useRouter()
const { t } = useI18n()

function formatAuthError(error: unknown): string {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object') {
    const fields = error as Record<string, string[] | undefined>
    const first = Object.values(fields).flat().find(Boolean)
    if (first) return first
  }
  return t('alert.error')
}

const handleSignUp = async (name: string, email: string, password: string, confirmPassword: string) => {
  const { data, error } = await signUp({ name, email, password, confirmPassword })
  if (error) {
    alertStore.showAlert(t('alert.error'), formatAuthError(error), 'error')
  } else if (data?.user) {
    alertStore.showAlert(t('alert.success'), t('auth.signupSuccess'), 'success')
    router.push('/login')
  }
}
</script>

<template>
  <ApplicationLayout>
    <div class="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div class="w-full max-w-sm">
        <SignupForm :on-submit="handleSignUp" />
      </div>
    </div>
  </ApplicationLayout>
</template>
