<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeft, ChevronRight, Star, User } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/composables/useI18n'
import { landingSectionStyle } from '@/lib/landing-section-style'
import YummySectionHeading from '@/components/landing/yummy/YummySectionHeading.vue'
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

function prev() {
  if (total.value === 0) return
  current.value = (current.value - 1 + total.value) % total.value
}

function next() {
  if (total.value === 0) return
  current.value = (current.value + 1) % total.value
}

const active = computed(() => props.testimonials[current.value])
const sectionStyle = computed(() => landingSectionStyle(props.bgImage, props.bgColor))
</script>

<template>
  <section id="testimonials" class="landing-fade-up px-6 py-20" :style="sectionStyle">
    <div class="mx-auto max-w-4xl">
      <YummySectionHeading
        :label="t('config.landingTestimonialsLabel')"
        :title="title || t('config.landingTestimonialsTitle')"
        :accent-color="accentColor"
      />

      <div v-if="active" class="relative text-center">
        <p class="mb-8 text-lg leading-relaxed text-slate-600 italic md:text-xl">
          &ldquo;{{ active.text }}&rdquo;
        </p>

        <div class="mb-4 flex justify-center gap-1">
          <Star
            v-for="i in 5"
            :key="i"
            class="size-4"
            :class="i <= active.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'"
          />
        </div>

        <div class="flex flex-col items-center gap-3">
          <div
            class="flex size-16 items-center justify-center overflow-hidden rounded-full text-white"
            :style="{ backgroundColor: accentColor }"
          >
            <img
              v-if="active.avatar_url"
              :src="active.avatar_url"
              :alt="active.name"
              class="size-16 object-cover"
            />
            <User v-else class="size-7" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-800">{{ active.name }}</h3>
            <p v-if="active.role" class="text-sm text-slate-500">{{ active.role }}</p>
          </div>
        </div>

        <div v-if="total > 1" class="mt-10 flex justify-center gap-3">
          <Button variant="outline" size="icon" class="rounded-full" @click="prev">
            <ChevronLeft class="size-5" />
          </Button>
          <Button variant="outline" size="icon" class="rounded-full" @click="next">
            <ChevronRight class="size-5" />
          </Button>
        </div>
      </div>

      <p v-else class="text-center text-sm text-slate-400">
        {{ t('config.landingTestimonialsEmpty') }}
      </p>
    </div>
  </section>
</template>
