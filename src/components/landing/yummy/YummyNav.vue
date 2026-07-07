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

const navLinks = [
  { href: '#about', label: 'config.landingYummyNavAbout' },
  { href: '#menu', label: 'config.landingYummyNavMenu' },
  { href: '#events', label: 'config.landingYummyNavEvents' },
  { href: '#gallery', label: 'config.landingYummyNavGallery' },
  { href: '#contact', label: 'config.landingYummyNavContact' },
] as const
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-slate-100 bg-white/98 shadow-sm backdrop-blur-sm">
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
      <RouterLink to="/" class="flex items-center gap-2 yummy-font-display text-3xl font-bold leading-none" :style="{ color: accentColor }">
        <img v-if="navLogoUrl" :src="navLogoUrl" alt="Logo" class="h-8 w-auto object-contain">
        <span>{{ shopName }}</span><span v-if="!navLogoUrl" class="text-4xl">.</span>
      </RouterLink>

      <nav class="hidden items-center gap-5 lg:flex">
        <a
          v-for="link in navLinks"
          :key="link.href"
          :href="link.href"
          class="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          {{ t(link.label) }}
        </a>
      </nav>

      <RouterLink to="/book">
        <Button
          size="sm"
          class="rounded-full px-5 font-semibold shadow-sm"
          :style="{ backgroundColor: accentColor, color: '#fff' }"
        >
          {{ t('config.landingYummyBookTable') }}
        </Button>
      </RouterLink>
    </div>
  </header>
</template>

<style scoped>
.yummy-font-display {
  font-family: 'Amatic SC', cursive;
  letter-spacing: 0.02em;
}
</style>
