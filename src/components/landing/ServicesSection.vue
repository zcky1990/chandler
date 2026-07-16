<script setup lang="ts">
import { computed } from 'vue'
import { ImageIcon, ExternalLink } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/composables/useI18n'
import type { LandingServiceItem } from '@/types/database'

const { t } = useI18n()

const props = defineProps<{
  items: LandingServiceItem[]
  accentColor: string
  title: string | null
  subtitle: string | null
  whatsappNumber: string | null
}>()

const hasWhatsapp = computed(() => !!props.whatsappNumber)

function waLink(text: string) {
  const number = props.whatsappNumber?.replace(/[^0-9]/g, '') ?? ''
  const msg = encodeURIComponent(`Halo, saya tertarik dengan layanan: ${text}`)
  return `https://wa.me/${number}?text=${msg}`
}
</script>

<template>
  <div class="relative mx-auto max-w-6xl">
    <div class="mb-12 text-center">
      <p class="mb-2 text-sm font-semibold tracking-widest uppercase opacity-60" :style="{ color: accentColor }">
        {{ t('config.landingServicesLabel') }}
      </p>
      <h2 class="text-3xl font-bold tracking-tight text-slate-900">
        {{ title || t('config.landingServicesTitle') }}
      </h2>
      <p v-if="subtitle" class="mt-3 max-w-2xl mx-auto text-slate-500">
        {{ subtitle }}
      </p>
    </div>

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="(item, idx) in items"
        :key="idx"
        class="landing-stagger group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg hover:-translate-y-0.5"
        :style="{ '--i': idx }">
        <div class="relative h-52 overflow-hidden">
          <img
            v-if="item.image_url"
            :src="item.image_url"
            :alt="item.title"
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          >
          <div
            v-else
            class="flex h-full w-full items-center justify-center bg-slate-100"
          >
            <ImageIcon class="size-12 text-slate-300" />
          </div>
          <div
            class="absolute right-0 bottom-0 rounded-tl-xl px-4 py-2 text-lg font-bold text-white"
            :style="{ backgroundColor: accentColor }"
          >
            {{ item.price }}
          </div>
        </div>

        <div class="p-5 text-center">
          <h3 class="mb-3 text-lg font-bold text-slate-900">{{ item.title }}</h3>
          <p class="mb-4 text-sm leading-relaxed text-slate-500">
            {{ item.description }}
          </p>
          <a
            v-if="hasWhatsapp && item.title"
            :href="waLink(item.title)"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              size="sm"
              class="w-full border-current transition-colors"
              :style="{ color: accentColor, borderColor: accentColor }"
            >
              {{ t('config.landingServicesCta') }}
              <ExternalLink class="ml-1.5 size-4" />
            </Button>
          </a>
        </div>
      </div>
    </div>

    <div v-if="items.length === 0" class="text-center text-sm text-slate-400 py-8">
      {{ t('config.landingServicesEmpty') }}
    </div>
  </div>
</template>
