<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ChevronLeft, ChevronRight, ArrowRight, ImageIcon, ShoppingCart } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/composables/useI18n'
import { formatPrice } from '@/lib/format'
import type { Product } from '@/types/database'

const { t } = useI18n()

const props = defineProps<{
  products: Product[]
  maxItems: number
  accentColor: string
  title: string | null
}>()

const scrollContainer = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(true)

const visibleProducts = computed(() => props.products.slice(0, props.maxItems))

const hasMore = computed(() => props.products.length > props.maxItems)

const showArrows = computed(() => props.products.length > 4)

function scrollLeft() {
  const el = scrollContainer.value
  if (!el) return
  el.scrollBy({ left: -300, behavior: 'smooth' })
}

function scrollRight() {
  const el = scrollContainer.value
  if (!el) return
  el.scrollBy({ left: 300, behavior: 'smooth' })
}

function onScroll() {
  const el = scrollContainer.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 10
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 10
}
</script>

<template>
  <div class="relative mx-auto max-w-6xl">
    <div class="flex items-center justify-between mb-8">
      <div>
        <p class="mb-1 text-sm font-semibold tracking-widest uppercase opacity-60" :style="{ color: accentColor }">
          {{ t('config.landingCarouselLabel') }}
        </p>
        <h2 class="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          {{ title || t('config.landingCarouselTitle') }}
        </h2>
      </div>
      <div v-if="showArrows" class="hidden gap-2 sm:flex">
        <Button
          variant="outline"
          size="icon"
          class="size-10 rounded-full"
          :disabled="!canScrollLeft"
          @click="scrollLeft"
        >
          <ChevronLeft class="size-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          class="size-10 rounded-full"
          :disabled="!canScrollRight"
          @click="scrollRight"
        >
          <ChevronRight class="size-5" />
        </Button>
      </div>
    </div>

    <div
      v-if="visibleProducts.length > 0"
      ref="scrollContainer"
      class="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar"
      @scroll="onScroll"
    >
      <div
        v-for="product in visibleProducts"
        :key="product.id"
        class="w-[240px] flex-shrink-0 snap-start md:w-[280px]"
      >
        <RouterLink
          :to="'/order'"
          class="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
        >
          <div class="relative flex h-44 items-center justify-center bg-slate-100 md:h-52">
            <img
              v-if="product.image_url"
              :src="product.image_url"
              :alt="product.name"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            >
            <ImageIcon v-else class="size-10 text-slate-300" />
            <span
              v-if="product.product_categories?.name"
              class="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-sm"
            >
              {{ product.product_categories.name }}
            </span>
          </div>
          <div class="p-4">
            <h3 class="mb-1 line-clamp-2 text-sm font-semibold text-slate-900">
              {{ product.name }}
            </h3>
            <p class="text-sm font-bold" :style="{ color: accentColor }">
              {{ formatPrice(product.price) }}
            </p>
            <div class="mt-3 flex items-center gap-1.5 text-xs font-medium transition-colors" :style="{ color: accentColor }">
              <ShoppingCart class="size-3.5" />
              {{ t('nav.createTransaction') }}
            </div>
          </div>
        </RouterLink>
      </div>
    </div>

    <div v-if="hasMore" class="mt-8 flex justify-center">
      <RouterLink to="/order">
        <Button size="lg" class="h-12 px-8 font-medium" :style="{ backgroundColor: accentColor, color: '#fff' }">
          {{ t('config.landingCarouselViewMore') }}
          <ArrowRight class="ml-2 size-5" />
        </Button>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.hide-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
