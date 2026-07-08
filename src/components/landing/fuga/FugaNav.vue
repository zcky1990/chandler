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
  { href: '#hero', label: 'config.landingFugaNavHome' },
  { href: '#about', label: 'config.landingFugaNavAbout' },
  { href: '#menu', label: 'config.landingFugaNavMenu' },
  { href: '#contact', label: 'config.landingFugaNavContact' },
] as const
</script>

<template>
  <header class="fixed top-0 right-0 left-0 z-50 border-b border-white/10 bg-[#0f172a]/90 backdrop-blur-lg">
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
      <RouterLink to="/" class="flex items-center gap-2 font-serif text-xl font-bold tracking-tight text-white">
        <img v-if="navLogoUrl" :src="navLogoUrl" alt="Logo" class="h-6 w-auto object-contain">
        <span>{{ shopName }}</span>
      </RouterLink>
      <nav class="hidden items-center gap-8 md:flex">
        <a
          v-for="link in links"
          :key="link.href"
          :href="link.href"
          class="text-xs font-medium tracking-wider text-white/60 uppercase transition-colors hover:text-white/90"
        >
          {{ t(link.label) }}
        </a>
      </nav>
      <RouterLink to="/order">
        <Button size="sm" variant="outline" class="h-9 rounded-full border-white/30 px-5 text-xs font-semibold tracking-wider text-white uppercase hover:bg-white/10">
          {{ t('nav.createTransaction') }}
        </Button>
      </RouterLink>
    </div>
  </header>
</template>
