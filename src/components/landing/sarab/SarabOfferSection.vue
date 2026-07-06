<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/composables/useI18n'
import { landingSectionStyle } from '@/lib/landing-section-style'
import type { LandingServiceItem } from '@/types/database'

const props = defineProps<{
  items: LandingServiceItem[]
  accentColor: string
  title: string | null
  subtitle: string | null
  bgColor: string
  bgImage: string | null
  bookBgColor: string | null
  bookBgImage: string | null
  primaryColor: string
}>()

const { t } = useI18n()
const sectionStyle = computed(() =>
  landingSectionStyle(props.bookBgImage, props.bookBgColor || props.primaryColor),
)
const featured = computed(() => props.items[0])
</script>

<template>
  <section class="px-6 py-20" :style="sectionStyle">
    <div class="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
      <div>
        <p class="mb-2 text-sm font-semibold tracking-widest text-orange-200 uppercase">
          {{ t('config.landingSarabOfferLabel') }}
        </p>
        <h2 class="mb-4 text-3xl font-extrabold text-white md:text-4xl">
          {{ title || t('config.landingSarabOfferTitle') }}
        </h2>
        <p class="mb-8 text-orange-100/80">
          {{ subtitle || t('config.landingSarabOfferDesc') }}
        </p>
        <RouterLink to="/order">
          <Button size="lg" class="rounded-full bg-white px-8 font-semibold text-zinc-900 hover:bg-orange-50">
            {{ t('config.landingSarabOrderNow') }}
            <ArrowRight class="ml-2 size-5" />
          </Button>
        </RouterLink>
      </div>
      <div
        v-if="featured"
        class="rounded-2xl border border-white/10 bg-black/20 p-8 text-center backdrop-blur-sm"
      >
        <p class="text-sm text-orange-200">{{ featured.title }}</p>
        <p class="my-3 text-4xl font-extrabold text-white">{{ featured.price }}</p>
        <p class="text-sm text-orange-100/70">{{ featured.description }}</p>
      </div>
    </div>
  </section>
</template>
