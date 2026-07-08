<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Phone, Mail, Clock } from '@lucide/vue'
import { useI18n } from '@/composables/useI18n'
import { landingSectionStyle } from '@/lib/landing-section-style'
import SarabSectionHeading from '@/components/landing/sarab/SarabSectionHeading.vue'

const props = defineProps<{
  accentColor: string
  title: string | null
  subtitle: string | null
  address: string | null
  phone: string | null
  email: string | null
  mapLat: number
  mapLng: number
  mapZoom: number
  bgColor: string
  bgImage: string | null
}>()

const { t } = useI18n()
const mapContainer = ref<HTMLElement | null>(null)
let mapInstance: L.Map | null = null
const sectionStyle = computed(() => landingSectionStyle(props.bgImage, props.bgColor))

function initMap() {
  if (!mapContainer.value) return
  if (mapInstance) {
    mapInstance.setView([props.mapLat, props.mapLng], props.mapZoom)
    return
  }
  mapInstance = L.map(mapContainer.value).setView([props.mapLat, props.mapLng], props.mapZoom)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
  }).addTo(mapInstance)
  L.marker([props.mapLat, props.mapLng]).addTo(mapInstance)
}

onMounted(initMap)
onUnmounted(() => { mapInstance?.remove(); mapInstance = null })
watch(() => [props.mapLat, props.mapLng, props.mapZoom], () => {
  mapInstance?.setView([props.mapLat, props.mapLng], props.mapZoom)
})
</script>

<template>
  <section id="contact" class="landing-fade-up px-6 py-20" :style="sectionStyle">
    <div class="mx-auto max-w-6xl">
      <SarabSectionHeading
        :label="t('config.landingContactLabel')"
        :title="title || t('config.landingSarabContactTitle')"
      />
      <p v-if="subtitle" class="-mt-6 mb-10 text-center text-zinc-400">{{ subtitle }}</p>
      <div class="grid gap-8 lg:grid-cols-2">
        <div class="space-y-5">
          <div v-if="address" class="flex gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <MapPin class="size-5 shrink-0" :style="{ color: accentColor }" />
            <div>
              <p class="font-semibold text-white">{{ t('config.landingContactAddress') }}</p>
              <p class="text-sm text-zinc-400">{{ address }}</p>
            </div>
          </div>
          <div v-if="phone" class="flex gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <Phone class="size-5 shrink-0" :style="{ color: accentColor }" />
            <div>
              <p class="font-semibold text-white">{{ t('config.landingContactPhone') }}</p>
              <p class="text-sm text-zinc-400">{{ phone }}</p>
            </div>
          </div>
          <div v-if="email" class="flex gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <Mail class="size-5 shrink-0" :style="{ color: accentColor }" />
            <div>
              <p class="font-semibold text-white">{{ t('config.landingContactEmail') }}</p>
              <p class="text-sm text-zinc-400">{{ email }}</p>
            </div>
          </div>
          <div class="flex gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <Clock class="size-5 shrink-0" :style="{ color: accentColor }" />
            <div>
              <p class="font-semibold text-white">{{ t('config.landingContactHours') }}</p>
              <p class="text-sm text-zinc-400">{{ t('config.landingDefaultHours') }}</p>
            </div>
          </div>
        </div>
        <div class="h-80 overflow-hidden rounded-2xl border border-zinc-800 lg:h-auto lg:min-h-[320px]">
          <div ref="mapContainer" class="h-full w-full" />
        </div>
      </div>
    </div>
  </section>
</template>
