<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ImageIcon } from '@lucide/vue'
import { useI18n } from '@/composables/useI18n'
import { formatPrice } from '@/lib/format'
import { landingSectionStyle } from '@/lib/landing-section-style'
import YummySectionHeading from '@/components/landing/yummy/YummySectionHeading.vue'
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
    const name = product.product_categories?.name || t('config.landingYummyMenuAll')
    if (!map.has(name)) map.set(name, [])
    map.get(name)!.push(product)
  }
  if (map.size === 0) {
    return [[t('config.landingYummyMenuAll'), []] as [string, Product[]]]
  }
  return Array.from(map.entries())
})

const activeProducts = computed(() => categories.value[activeTab.value]?.[1] ?? [])

const menuImage = computed(() => {
  const first = props.products.find((p) => p.image_url)
  return first?.image_url ?? null
})

const sectionStyle = computed(() => landingSectionStyle(props.bgImage, props.bgColor))
</script>

<template>
  <section id="menu" class="landing-fade-up px-6 py-20" :style="sectionStyle">
    <div class="mx-auto max-w-6xl">
      <YummySectionHeading
        :label="t('config.landingYummyMenuLabel')"
        :title="title || t('config.landingYummyMenuSubtitle')"
        :accent-color="accentColor"
      />

      <div class="mb-8 flex flex-wrap justify-center gap-2">
        <button
          v-for="([name], idx) in categories"
          :key="name"
          type="button"
          class="rounded-full px-5 py-2 text-sm font-medium transition-colors"
          :class="activeTab === idx ? 'text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-50'"
          :style="activeTab === idx ? { backgroundColor: accentColor } : undefined"
          @click="activeTab = idx"
        >
          {{ name }}
        </button>
      </div>

      <div class="grid items-start gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div class="hidden overflow-hidden rounded-lg lg:block">
          <img
            v-if="menuImage"
            :src="menuImage"
            alt="Menu"
            class="h-full min-h-[420px] w-full object-cover"
          />
          <div
            v-else
            class="flex min-h-[420px] items-center justify-center bg-slate-100"
          >
            <ImageIcon class="size-16 text-slate-300" />
          </div>
        </div>

        <div>
          <p class="mb-6 text-center text-xs font-bold tracking-[0.3em] text-slate-400 uppercase lg:text-left">
            Menu
          </p>
          <h3 class="mb-8 text-center text-2xl font-bold text-slate-800 lg:text-left">
            {{ categories[activeTab]?.[0] }}
          </h3>

          <div v-if="activeProducts.length > 0" class="space-y-0 divide-y divide-slate-100">
            <RouterLink
              v-for="(product, idx) in activeProducts"
              :key="product.id"
              to="/order"
              class="landing-stagger group flex items-start justify-between gap-4 py-5 transition-colors hover:bg-white/60"
              :style="{ '--i': idx }">
              <div class="min-w-0 flex-1">
                <h4 class="mb-1 font-semibold text-slate-800 group-hover:underline">
                  {{ product.name }}
                </h4>
                <p v-if="product.description" class="text-sm italic text-slate-500 line-clamp-2">
                  {{ product.description }}
                </p>
              </div>
              <span class="shrink-0 text-lg font-bold" :style="{ color: accentColor }">
                {{ formatPrice(product.price) }}
              </span>
            </RouterLink>
          </div>
          <p v-else class="py-8 text-center text-sm text-slate-400">
            {{ t('config.landingCarouselViewMore') }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
