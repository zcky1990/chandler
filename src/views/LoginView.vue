<script setup lang="ts">
import LoginForm from '@/components/new-york-v4/blocks/login-01/components/LoginForm.vue'
import { persistAuthSession, supabase } from '@/lib/auth'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogin = async (email: string, password: string) => {
  const supabaseClient = await supabase()
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error(error)
    return
  }

  if (data.session) {
    persistAuthSession(data.session)
    router.push('/')
  }
}
</script>

<template>
  <div class="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
    <div class="w-full max-w-sm">
      <LoginForm @submit="handleLogin" />
    </div>
  </div>
</template>
