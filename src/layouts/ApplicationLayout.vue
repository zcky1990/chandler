<script setup lang="ts">
import { useRouter } from 'vue-router'
import { LayoutDashboard } from '@lucide/vue'
import AppAlert from '@/components/AppAlert.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import { Button } from '@/components/ui/button'
import { validateOrRefreshSession } from '@/lib/auth'

defineProps<{
  showStaffButton?: boolean
}>()

const router = useRouter()

async function goToStaff() {
  const isAuthenticated = await validateOrRefreshSession(router)
  await router.push(isAuthenticated ? '/dashboard' : '/login')
}
</script>

<template>
  <div class="flex w-full flex-col items-center justify-center">
    <div class="fixed top-0 z-50 flex w-full flex-col items-center justify-center">
      <AppAlert />
    </div>
    <div class="fixed right-4 top-4 z-50 flex items-center gap-2">
      <Button v-if="showStaffButton" variant="outline" size="sm" @click="goToStaff">
        <LayoutDashboard class="size-4" />
        Staff
      </Button>
      <LanguageSwitcher />
      <ThemeSwitcher />
    </div>
    <slot />
  </div>
</template>