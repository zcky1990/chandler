<script setup lang="ts">
import { computed } from 'vue'
import { ImageIcon } from '@lucide/vue'
import { useI18n } from '@/composables/useI18n'
import { landingSectionStyle } from '@/lib/landing-section-style'
import SarabSectionHeading from '@/components/landing/sarab/SarabSectionHeading.vue'

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
      <SarabSectionHeading
        :label="t('config.landingGalleryLabel')"
        :title="title || t('config.landingSarabGalleryTitle')"
      />
      <p v-if="subtitle" class="-mt-6 mb-10 text-center text-zinc-400">{{ subtitle }}</p>
      <div class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <div
          v-for="(url, idx) in images"
          :key="idx"
          class="group relative aspect-[4/5] overflow-hidden rounded-xl bg-zinc-800"
        >
          <img :src="url" :alt="`Gallery ${idx + 1}`" class="h-full w-full object-cover transition-transform group-hover:scale-110" />
        </div>
      </div>
      <p v-if="images.length === 0" class="py-8 text-center text-sm text-zinc-500">{{ t('config.landingGalleryEmpty') }}</p>
    </div>
  </section>
</template>
