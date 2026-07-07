<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from '@/composables/useI18n'

defineProps<{
  shopName: string
  accentColor: string
  navLogoUrl?: string | null
}>()

const { t } = useI18n()
</script>

<template>
  <header class="absolute inset-x-0 top-0 z-40 px-6 py-6">
    <div class="mx-auto flex max-w-6xl items-center justify-between">
      <RouterLink to="/" class="flex items-center gap-2 font-serif text-xl font-semibold tracking-[0.2em] text-amber-50 uppercase">
        <img v-if="navLogoUrl" :src="navLogoUrl" alt="Logo" class="h-7 w-auto object-contain">
        <span>{{ shopName }}</span>
      </RouterLink>
      <nav class="hidden items-center gap-8 md:flex">
        <a href="#hero" class="text-xs tracking-[0.2em] text-amber-100/70 uppercase hover:text-amber-300">{{ t('config.landingSpiceHavenNavHome') }}</a>
        <a href="#menu" class="text-xs tracking-[0.2em] text-amber-100/70 uppercase hover:text-amber-300">{{ t('config.landingSpiceHavenNavMenu') }}</a>
        <a href="#story" class="text-xs tracking-[0.2em] text-amber-100/70 uppercase hover:text-amber-300">{{ t('config.landingSpiceHavenNavStory') }}</a>
        <a href="#moments" class="text-xs tracking-[0.2em] text-amber-100/70 uppercase hover:text-amber-300">{{ t('config.landingSpiceHavenNavGallery') }}</a>
        <a href="#contact" class="text-xs tracking-[0.2em] text-amber-100/70 uppercase hover:text-amber-300">{{ t('config.landingSpiceHavenNavContact') }}</a>
      </nav>
      <RouterLink
        to="/order"
        class="border border-amber-400/40 px-4 py-2 text-xs font-semibold tracking-[0.15em] text-amber-50 uppercase transition-colors hover:bg-amber-400/10"
      >
        {{ t('config.landingSpiceHavenOrder') }}
      </RouterLink>
    </div>
  </header>
</template>
