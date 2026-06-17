<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { validateOrRefreshSession } from '@/lib/auth'
import { onMounted } from 'vue'

const router = useRouter()

onMounted(() => {
  validateOrRefreshSession(router)
})
</script>

<template>
  <RouterView />
</template>

<style scoped>
</style>
