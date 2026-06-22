<script setup lang="ts">
import SignupForm from '@/components/new-york-v4/blocks/signup-01/components/SignupForm.vue'
import ApplicationLayout from '@/layouts/ApplicationLayout.vue'
import { signUp } from '@/lib/auth'
import { useAlertStore } from '@/stores/useAlertStore'
import { useRouter } from 'vue-router'

const alertStore = useAlertStore()
const router = useRouter()

const handleSignUp = async (name: string, email: string, password: string, confirmPassword: string) => {
  const { data, error } = await signUp({ name, email, password, confirmPassword })
  if (error) {
    alertStore.showAlert('Error', error as string, 'error')
  } else if (data?.user) {
    alertStore.showAlert('Success', 'Akun berhasil dibuat', 'success')
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
