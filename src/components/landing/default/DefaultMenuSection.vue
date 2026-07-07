<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ImageIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/composables/useI18n'
import { formatPrice } from '@/lib/format'
import { landingSectionStyle } from '@/lib/landing-section-style'
import type { Product } from '@/types/database'

const props = defineProps<{
  products: Product[]
  maxItems: number
  accentColor: string
  title: string | null
  bgColor: string
  bgImage: string | null
}>()

const { t } = useI18n()
const sectionStyle = computed(() => landingSectionStyle(props.bgImage, props.bgColor || '#f8fafc'))
const items = computed(() => props.products.slice(0, props.maxItems))
</script>

<template>
  <section id="menu" class="px-6 py-20" :style="sectionStyle">
    <div class="mx-auto max-w-6xl">
      <div class="mb-12 text-center">
        <p class="mb-2 text-sm font-semibold tracking-widest uppercase" style="color: var(--landing-muted)">
          {{ t('config.landingDefaultMenuLabel') }}
        </p>
        <h2 class="text-3xl font-bold tracking-tight" style="color: var(--landing-heading)">
          {{ title || t('config.landingDefaultMenuTitle') }}
        </h2>
        <p class="mt-3" style="color: var(--landing-muted)">{{ t('config.landingDefaultMenuDesc') }}</p>
      </div>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="product in items"
          :key="product.id"
          to="/order"
          class="group overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-lg"
          style="border-color: var(--landing-border); background-color: var(--landing-surface)"
        >
          <div class="relative h-44 overflow-hidden bg-slate-100">
            <img
              v-if="product.image_url"
              :src="product.image_url"
              :alt="product.name"
              class="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            <div v-else class="flex h-full items-center justify-center">
              <ImageIcon class="size-10 text-slate-300" />
            </div>
          </div>
          <div class="p-5">
            <h3 class="mb-1 font-semibold" style="color: var(--landing-heading)">{{ product.name }}</h3>
            <p v-if="product.description" class="mb-2 line-clamp-2 text-sm" style="color: var(--landing-muted)">
              {{ product.description }}
            </p>
            <span class="font-bold" :style="{ color: accentColor }">{{ formatPrice(product.price) }}</span>
          </div>
        </RouterLink>
      </div>
      <div v-if="products.length > maxItems" class="mt-10 text-center">
        <RouterLink to="/order">
          <Button size="lg" :style="{ backgroundColor: accentColor, color: '#fff' }">
            {{ t('config.landingCarouselViewMore') }}
          </Button>
        </RouterLink>
      </div>
    </div>
  </section>
</template>
