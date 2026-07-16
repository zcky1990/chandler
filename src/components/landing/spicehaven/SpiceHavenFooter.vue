<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { MapPin, Phone, Mail, Clock } from '@lucide/vue'
import { useI18n } from '@/composables/useI18n'
import { landingSectionStyle } from '@/lib/landing-section-style'

const props = defineProps<{
  shopName: string
  address: string | null
  phone: string | null
  email: string | null
  bgColor: string
  bgImage: string | null
}>()

const { t } = useI18n()
const sectionStyle = computed(() => landingSectionStyle(props.bgImage, props.bgColor || '#0c0a09'))
</script>

<template>
  <footer id="contact" class="landing-fade-up border-t border-amber-900/30 px-6 py-16" :style="sectionStyle">
    <div class="mx-auto max-w-6xl">
      <div class="mb-8 text-center">
        <p class="font-serif text-2xl font-semibold tracking-widest text-amber-400 uppercase">{{ shopName }}</p>
        <p class="mt-2 text-sm text-amber-100/50">{{ t('config.landingSpiceHavenSubtitle') }}</p>
      </div>
      <div class="grid gap-8 text-center text-sm text-amber-100/70 sm:grid-cols-3">
        <div v-if="address" class="flex flex-col items-center gap-2">
          <MapPin class="size-4 text-amber-500" />
          <span>{{ address }}</span>
        </div>
        <div v-if="phone" class="flex flex-col items-center gap-2">
          <Phone class="size-4 text-amber-500" />
          <span>{{ phone }}</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Mail v-if="email" class="size-4 text-amber-500" />
          <Clock v-else class="size-4 text-amber-500" />
          <span>{{ email || t('config.landingDefaultHours') }}</span>
        </div>
      </div>
      <div class="mt-10 flex flex-wrap justify-center gap-6 text-xs tracking-widest text-amber-100/40 uppercase">
        <RouterLink to="/" class="hover:text-amber-400">{{ t('config.landingSpiceHavenNavHome') }}</RouterLink>
        <RouterLink to="/order" class="hover:text-amber-400">{{ t('config.landingSpiceHavenOrder') }}</RouterLink>
        <RouterLink to="/book" class="hover:text-amber-400">{{ t('nav.bookings') }}</RouterLink>
      </div>
    </div>
  </footer>
</template>
