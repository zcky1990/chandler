<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { getShopConfig } from '@/lib/config'
import { applyAppTitle, initAppTitle } from './lib/app-title'

onMounted(async () => {
  initAppTitle()
  const { config } = await getShopConfig()
  applyAppTitle(config?.app_title || config?.shop_name || 'Bistro')
})
</script>

<template>
  <RouterView />
</template>
