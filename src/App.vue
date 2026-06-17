<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { validateOrRefreshSession } from '@/lib/auth'
import { onMounted } from 'vue'
import AppAlert from '@/components/AppAlert.vue'

const router = useRouter()

onMounted(() => {
  validateOrRefreshSession(router)
})
</script>

<template>
  <div class="flex flex-col items-center justify-center w-full fixed top-0">
    <AppAlert />
  </div>
  <RouterView />
</template>
