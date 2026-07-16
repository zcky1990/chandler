<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/composables/useI18n'

defineProps<{
  shopName: string
  accentColor: string
  navLogoUrl?: string | null
}>()

const { t } = useI18n()

const links = [
  { href: '#hero', label: 'config.landingSarabNavHome' },
  { href: '#categories', label: 'config.landingSarabNavMenu' },
  { href: '#menu', label: 'config.landingSarabNavFood' },
  { href: '#reviews', label: 'config.landingSarabNavReviews' },
  { href: '#contact', label: 'config.landingSarabNavContact' },
] as const
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md">
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
      <RouterLink to="/" class="flex items-center gap-2 text-xl font-extrabold tracking-tight text-white">
        <img v-if="navLogoUrl" :src="navLogoUrl" alt="Logo" class="h-7 w-auto object-contain">
        <span>{{ shopName }}</span>
      </RouterLink>
      <nav class="hidden items-center gap-6 lg:flex">
        <a
          v-for="link in links"
          :key="link.href"
          :href="link.href"
          class="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
        >
          {{ t(link.label) }}
        </a>
      </nav>
      <RouterLink to="/order">
        <Button
          size="sm"
          class="rounded-full px-5 font-semibold"
          :style="{ backgroundColor: accentColor, color: '#fff' }"
        >
          {{ t('config.landingSarabOrderNow') }}
        </Button>
      </RouterLink>
    </div>
  </header>
</template>
