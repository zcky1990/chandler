<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ImageIcon, Star } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/composables/useI18n'
import { formatPrice } from '@/lib/format'
import { landingSectionStyle } from '@/lib/landing-section-style'
import SarabSectionHeading from '@/components/landing/sarab/SarabSectionHeading.vue'
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
const activeTab = ref(0)

const categories = computed(() => {
  const map = new Map<string, Product[]>()
  for (const product of props.products.slice(0, props.maxItems)) {
    const name = product.product_categories?.name || t('config.landingSarabCategoryAll')
    if (!map.has(name)) map.set(name, [])
    map.get(name)!.push(product)
  }
  if (map.size === 0) {
    return [[t('config.landingSarabCategoryAll'), []] as [string, Product[]]]
  }
  return [[t('config.landingSarabCategoryAll'), props.products.slice(0, props.maxItems)] as [string, Product[]], ...Array.from(map.entries())]
})

const activeProducts = computed(() => {
  if (activeTab.value === 0) return props.products.slice(0, props.maxItems)
  const entry = categories.value[activeTab.value]
  return entry?.[1] ?? []
})

const sectionStyle = computed(() => landingSectionStyle(props.bgImage, props.bgColor))
</script>

<template>
  <section id="menu" class="px-6 py-20" :style="sectionStyle">
    <div class="mx-auto max-w-6xl">
      <SarabSectionHeading
        :label="t('config.landingSarabMenuLabel')"
        :title="title || t('config.landingSarabMenuTitle')"
      />

      <div class="mb-8 flex flex-wrap justify-center gap-2">
        <button
          v-for="([name], idx) in categories"
          :key="name"
          type="button"
          class="rounded-full px-4 py-2 text-sm font-medium transition-colors"
          :class="activeTab === idx ? 'text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'"
          :style="activeTab === idx ? { backgroundColor: accentColor } : undefined"
          @click="activeTab = idx"
        >
          {{ name }}
        </button>
      </div>

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="product in activeProducts"
          :key="product.id"
          to="/order"
          class="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition-all hover:border-orange-500/40 hover:shadow-lg hover:shadow-orange-500/10"
        >
          <div class="relative h-48 overflow-hidden bg-zinc-800">
            <img
              v-if="product.image_url"
              :src="product.image_url"
              :alt="product.name"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div v-else class="flex h-full items-center justify-center">
              <ImageIcon class="size-12 text-zinc-600" />
            </div>
            <span
              v-if="product.product_categories?.name"
              class="absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
              :style="{ backgroundColor: accentColor }"
            >
              {{ product.product_categories.name }}
            </span>
          </div>
          <div class="p-5">
            <h3 class="mb-1 font-bold text-white group-hover:text-orange-300">{{ product.name }}</h3>
            <p v-if="product.description" class="mb-3 line-clamp-2 text-sm text-zinc-400">
              {{ product.description }}
            </p>
            <div class="flex items-center justify-between">
              <span class="text-lg font-bold" :style="{ color: accentColor }">{{ formatPrice(product.price) }}</span>
              <span class="flex items-center gap-1 text-xs text-zinc-500">
                <Star class="size-3 fill-amber-400 text-amber-400" />
                4.9
              </span>
            </div>
          </div>
        </RouterLink>
      </div>

      <div v-if="products.length > maxItems" class="mt-10 text-center">
        <RouterLink to="/order">
          <Button
            size="lg"
            class="rounded-full px-8 font-semibold"
            :style="{ backgroundColor: accentColor, color: '#fff' }"
          >
            {{ t('config.landingCarouselViewMore') }}
          </Button>
        </RouterLink>
      </div>
    </div>
  </section>
</template>
