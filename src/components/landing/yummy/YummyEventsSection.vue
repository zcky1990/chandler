<script setup lang="ts">
import { computed } from 'vue'
import { ImageIcon, UtensilsCrossed } from '@lucide/vue'
import { useI18n } from '@/composables/useI18n'
import { landingSectionStyle } from '@/lib/landing-section-style'
import YummySectionHeading from '@/components/landing/yummy/YummySectionHeading.vue'
import type { LandingServiceItem } from '@/types/database'

const props = defineProps<{
  items: LandingServiceItem[]
  accentColor: string
  title: string | null
  subtitle: string | null
  whatsappNumber: string | null
  bgColor: string
  bgImage: string | null
}>()

const { t } = useI18n()

const sectionStyle = computed(() => landingSectionStyle(props.bgImage, props.bgColor))

const showHeading = computed(() => !!(props.title || props.subtitle))

const placeholderGradients = [
  'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
  'linear-gradient(135deg, #fff1f2 0%, #fecdd3 100%)',
  'linear-gradient(135deg, #fef2f2 0%, #fca5a5 100%)',
  'linear-gradient(135deg, #fdf2f8 0%, #fbcfe8 100%)',
]
</script>

<template>
  <section id="events" class="landing-fade-up events-section px-6 py-20" :style="sectionStyle">
    <div class="mx-auto max-w-6xl">
      <YummySectionHeading
        v-if="showHeading"
        :label="t('config.landingYummyNavEvents')"
        :title="title || t('config.landingYummyEventsTitle')"
        :accent-color="accentColor"
      />
      <p v-if="showHeading && subtitle" class="-mt-6 mb-12 text-center text-slate-500">
        {{ subtitle }}
      </p>
      <div v-else class="mb-12" />

      <div class="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="(item, idx) in items"
          :key="idx"
          class="landing-stagger event-card group flex h-full flex-col overflow-hidden rounded-sm bg-white shadow-[0_0_30px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
          :style="{ '--i': idx }">
          <div class="relative h-52 shrink-0 overflow-hidden">
            <img
              v-if="item.image_url"
              :src="item.image_url"
              :alt="item.title"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            >
            <div
              v-else
              class="flex h-full w-full items-center justify-center"
              :style="{ background: placeholderGradients[idx % placeholderGradients.length] }"
            >
              <UtensilsCrossed class="size-14 text-red-300/70" />
            </div>
          </div>

          <div class="flex flex-1 flex-col px-5 py-6 text-center">
            <h3 class="yummy-font-display mb-2 text-xl font-bold text-slate-800">
              {{ item.title }}
            </h3>
            <p
              class="yummy-font-display mb-4 text-3xl font-bold leading-none"
              :style="{ color: accentColor }"
            >
              {{ item.price }}
            </p>
            <p class="flex-1 text-sm leading-relaxed text-slate-500">
              {{ item.description }}
            </p>
          </div>
        </article>
      </div>

      <p v-if="items.length === 0" class="py-12 text-center text-sm text-slate-400">
        {{ t('config.landingServicesEmpty') }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.yummy-font-display {
  font-family: 'Amatic SC', cursive;
  letter-spacing: 0.02em;
}
</style>
