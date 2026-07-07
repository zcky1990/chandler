<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeft, ChevronRight, Star } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/composables/useI18n'
import { landingSectionStyle } from '@/lib/landing-section-style'
import SarabSectionHeading from '@/components/landing/sarab/SarabSectionHeading.vue'
import type { LandingTestimonial } from '@/types/database'

const props = defineProps<{
  testimonials: LandingTestimonial[]
  accentColor: string
  title: string | null
  bgColor: string
  bgImage: string | null
}>()

const { t } = useI18n()
const current = ref(0)
const total = computed(() => props.testimonials.length)
const active = computed(() => props.testimonials[current.value])
const sectionStyle = computed(() => landingSectionStyle(props.bgImage, props.bgColor))

function prev() {
  if (!total.value) return
  current.value = (current.value - 1 + total.value) % total.value
}
function next() {
  if (!total.value) return
  current.value = (current.value + 1) % total.value
}
</script>

<template>
  <section id="reviews" class="px-6 py-20" :style="sectionStyle">
    <div class="mx-auto max-w-4xl">
      <SarabSectionHeading
        :label="t('config.landingTestimonialsLabel')"
        :title="title || t('config.landingSarabReviewsTitle')"
      />
      <div v-if="active" class="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
        <div class="mb-4 flex justify-center gap-1">
          <Star
            v-for="i in 5"
            :key="i"
            class="size-4"
            :class="i <= active.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'"
          />
        </div>
        <p class="mb-6 text-lg italic text-zinc-300">&ldquo;{{ active.text }}&rdquo;</p>
        <p class="font-semibold text-white">{{ active.name }}</p>
        <p v-if="active.role" class="text-sm text-zinc-500">{{ active.role }}</p>
        <div v-if="total > 1" class="mt-8 flex justify-center gap-3">
          <Button variant="outline" size="icon" class="rounded-full border-zinc-700" @click="prev">
            <ChevronLeft class="size-5" />
          </Button>
          <Button variant="outline" size="icon" class="rounded-full border-zinc-700" @click="next">
            <ChevronRight class="size-5" />
          </Button>
        </div>
      </div>
      <p v-else class="text-center text-sm text-zinc-500">{{ t('config.landingTestimonialsEmpty') }}</p>
    </div>
  </section>
</template>
