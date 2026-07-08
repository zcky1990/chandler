<script setup lang="ts">
import { ImageIcon } from '@lucide/vue'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

defineProps<{
  images: string[]
  accentColor: string
  title: string | null
  subtitle: string | null
}>()
</script>

<template>
  <div class="relative mx-auto max-w-6xl">
    <div class="mb-12 text-center">
      <p class="mb-2 text-sm font-semibold tracking-widest uppercase opacity-60" :style="{ color: accentColor }">
        {{ t('config.landingGalleryLabel') }}
      </p>
      <h2 class="text-3xl font-bold tracking-tight text-[var(--landing-heading,#0f172a)]">
        {{ title || t('config.landingGalleryTitle') }}
      </h2>
      <p v-if="subtitle" class="mt-3 max-w-2xl mx-auto text-[var(--landing-muted,#64748b)]">
        {{ subtitle }}
      </p>
    </div>

    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <div
        v-for="(url, idx) in images"
        :key="idx"
        class="landing-stagger group relative aspect-square overflow-hidden rounded-xl border border-[var(--landing-border,#e2e8f0)]"
        :style="{ '--i': idx }">
        <img
          :src="url"
          :alt="`Gallery ${idx + 1}`"
          class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        >
        <div class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <ImageIcon class="size-8 text-white" />
        </div>
      </div>
    </div>

    <div v-if="images.length === 0" class="text-center text-sm text-slate-400 py-8">
      {{ t('config.landingGalleryEmpty') }}
    </div>
  </div>
</template>
