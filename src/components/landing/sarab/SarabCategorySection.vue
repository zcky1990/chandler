<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { UtensilsCrossed } from '@lucide/vue'
import { useI18n } from '@/composables/useI18n'
import { landingSectionStyle } from '@/lib/landing-section-style'
import SarabSectionHeading from '@/components/landing/sarab/SarabSectionHeading.vue'
import type { Product } from '@/types/database'

const props = defineProps<{
  products: Product[]
  accentColor: string
  bgColor: string
  bgImage: string | null
}>()

const { t } = useI18n()

const sectionStyle = computed(() => landingSectionStyle(props.bgImage, props.bgColor))

const categories = computed(() => {
  const map = new Map<string, number>()
  for (const p of props.products) {
    const name = p.product_categories?.name || t('config.landingSarabCategoryAll')
    map.set(name, (map.get(name) || 0) + 1)
  }
  if (map.size === 0) {
    return [{ name: t('config.landingSarabCategoryAll'), count: 0 }]
  }
  return Array.from(map.entries()).map(([name, count]) => ({ name, count }))
})
</script>

<template>
  <section id="categories" class="px-6 py-20" :style="sectionStyle">
    <div class="mx-auto max-w-6xl">
      <SarabSectionHeading
        :label="t('config.landingSarabCategoriesLabel')"
        :title="t('config.landingSarabCategoriesTitle')"
      />
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <RouterLink
          v-for="cat in categories"
          :key="cat.name"
          to="/order"
          class="group rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 text-center transition-all hover:border-orange-500/50 hover:bg-zinc-900"
        >
          <div
            class="mx-auto mb-3 flex size-12 items-center justify-center rounded-full"
            :style="{ backgroundColor: `${accentColor}22`, color: accentColor }"
          >
            <UtensilsCrossed class="size-6" />
          </div>
          <h3 class="mb-1 font-semibold text-white">{{ cat.name }}</h3>
          <p class="text-xs text-zinc-500">{{ cat.count }} {{ t('config.landingSarabItems') }}</p>
        </RouterLink>
      </div>
    </div>
  </section>
</template>
