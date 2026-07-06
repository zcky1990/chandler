<script setup lang="ts">
import { computed } from 'vue'
import { ImageIcon } from '@lucide/vue'
import { useI18n } from '@/composables/useI18n'
import { landingSectionStyle } from '@/lib/landing-section-style'
import YummySectionHeading from '@/components/landing/yummy/YummySectionHeading.vue'

const props = defineProps<{
  images: string[]
  accentColor: string
  title: string | null
  subtitle: string | null
  bgColor: string
  bgImage: string | null
}>()

const { t } = useI18n()
const sectionStyle = computed(() => landingSectionStyle(props.bgImage, props.bgColor))
</script>

<template>
  <section id="gallery" class="px-6 py-20" :style="sectionStyle">
    <div class="mx-auto max-w-6xl">
      <YummySectionHeading
        :label="t('config.landingGalleryLabel')"
        :title="title || t('config.landingGalleryTitle')"
        :accent-color="accentColor"
      />
      <p v-if="subtitle" class="-mt-6 mb-10 text-center text-slate-500">
        {{ subtitle }}
      </p>

      <div class="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
        <div
          v-for="(url, idx) in images"
          :key="idx"
          class="group relative aspect-square overflow-hidden bg-slate-100"
        >
          <img
            :src="url"
            :alt="`Gallery ${idx + 1}`"
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <ImageIcon class="size-8 text-white" />
          </div>
        </div>
      </div>

      <p v-if="images.length === 0" class="text-center text-sm text-slate-400">
        {{ t('config.landingGalleryEmpty') }}
      </p>
    </div>
  </section>
</template>
