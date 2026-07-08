<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { landingSectionStyle } from '@/lib/landing-section-style'
import type { LandingTestimonial } from '@/types/database'

const props = defineProps<{
  testimonial: LandingTestimonial | null
  fallbackQuote: string
  fallbackAuthor: string
  bgColor: string
  bgImage: string | null
}>()

const { t } = useI18n()
const sectionStyle = computed(() => landingSectionStyle(props.bgImage, props.bgColor))
const quote = computed(() => props.testimonial?.text || props.fallbackQuote)
const author = computed(() => props.testimonial?.name || props.fallbackAuthor)
const rating = computed(() => props.testimonial?.rating ?? 5)
</script>

<template>
  <section class="landing-fade-up px-6 py-20" :style="sectionStyle">
    <blockquote class="mx-auto max-w-3xl text-center">
      <p class="font-serif text-2xl leading-relaxed text-amber-100/90 italic md:text-3xl">
        &ldquo;{{ quote }}&rdquo;
      </p>
      <footer class="mt-6 text-sm tracking-widest text-amber-500 uppercase">
        — {{ author }}
        <span class="ml-2 text-amber-400">{{ '★'.repeat(rating) }}</span>
      </footer>
    </blockquote>
  </section>
</template>
