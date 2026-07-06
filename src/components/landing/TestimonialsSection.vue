<script setup lang="ts">
import { Star, Quote, User } from '@lucide/vue'
import { useI18n } from '@/composables/useI18n'
import type { LandingTestimonial } from '@/types/database'

const { t } = useI18n()

defineProps<{
  testimonials: LandingTestimonial[]
  accentColor: string
  title: string | null
}>()
</script>

<template>
  <div class="relative mx-auto max-w-6xl">
    <div class="mb-12 text-center">
      <p class="mb-2 text-sm font-semibold tracking-widest uppercase opacity-60" :style="{ color: accentColor }">
        {{ t('config.landingTestimonialsLabel') }}
      </p>
      <h2 class="text-3xl font-bold tracking-tight text-slate-900">
        {{ title || t('config.landingTestimonialsTitle') }}
      </h2>
    </div>

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="(item, idx) in testimonials"
        :key="idx"
        class="relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <Quote class="absolute right-4 top-4 size-8 opacity-10" :style="{ color: accentColor }" />

        <div class="mb-4 flex gap-1">
          <Star
            v-for="i in 5"
            :key="i"
            class="size-4"
            :class="i <= item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'"
          />
        </div>

        <p class="mb-6 flex-1 text-sm leading-relaxed text-slate-600">
          &ldquo;{{ item.text }}&rdquo;
        </p>

        <div class="flex items-center gap-3 border-t border-slate-100 pt-4">
          <div
            class="flex size-10 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold"
            :style="{ backgroundColor: accentColor }"
          >
            <img
              v-if="item.avatar_url"
              :src="item.avatar_url"
              :alt="item.name"
              class="size-10 rounded-full object-cover"
            >
            <User v-else class="size-5" />
          </div>
          <div>
            <p class="text-sm font-semibold text-slate-900">{{ item.name }}</p>
            <p v-if="item.role" class="text-xs text-slate-500">{{ item.role }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="testimonials.length === 0" class="text-center text-sm text-slate-400 py-8">
      {{ t('config.landingTestimonialsEmpty') }}
    </div>
  </div>
</template>
