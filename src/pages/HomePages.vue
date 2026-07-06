<script setup lang="ts">
import { defineAsyncComponent, onMounted, ref } from 'vue'
import LandingDefault from '@/components/landing/LandingDefault.vue'
import { getShopConfig } from '@/lib/config'

const template = ref<'default' | 'sarab' | 'spicehaven' | 'yummy'>('default')

const templateComponents = {
  default: LandingDefault,
  sarab: defineAsyncComponent(() => import('@/components/landing/LandingSarab.vue')),
  spicehaven: defineAsyncComponent(() => import('@/components/landing/LandingSpiceHaven.vue')),
  yummy: defineAsyncComponent(() => import('@/components/landing/LandingYummy.vue')),
} as const

onMounted(async () => {
  const { config } = await getShopConfig()
  const tpl = config?.landing_template
  if (tpl && tpl in templateComponents) {
    template.value = tpl as keyof typeof templateComponents
  }
})
</script>

<template>
  <component :is="templateComponents[template]" />
</template>
