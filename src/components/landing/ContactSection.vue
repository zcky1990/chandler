<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Phone, Mail } from '@lucide/vue'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

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
}>()

const iconBgStyle = computed(() => ({
  backgroundColor: props.accentColor + '18',
  color: props.accentColor,
}))

const mapContainer = ref<HTMLElement | null>(null)
let mapInstance: L.Map | null = null

function initMap() {
  if (!mapContainer.value) return
  if (mapInstance) {
    mapInstance.setView([props.mapLat, props.mapLng], props.mapZoom)
    return
  }
  mapInstance = L.map(mapContainer.value).setView([props.mapLat, props.mapLng], props.mapZoom)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(mapInstance)
  L.marker([props.mapLat, props.mapLng]).addTo(mapInstance)
}

onMounted(initMap)

onUnmounted(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})

watch(() => [props.mapLat, props.mapLng, props.mapZoom], () => {
  if (mapInstance) {
    mapInstance.setView([props.mapLat, props.mapLng], props.mapZoom)
  }
})
</script>

<template>
  <div class="relative mx-auto max-w-6xl">
    <div class="mb-12 text-center">
      <p class="mb-2 text-sm font-semibold tracking-widest uppercase opacity-60" :style="{ color: accentColor }">
        {{ t('config.landingContactLabel') }}
      </p>
      <h2 class="text-3xl font-bold tracking-tight text-slate-900">
        {{ title || t('config.landingContactTitle') }}
      </h2>
      <p v-if="subtitle" class="mt-3 max-w-2xl mx-auto text-slate-500">
        {{ subtitle }}
      </p>
    </div>

    <div class="flex flex-col gap-6 lg:flex-row">
      <div class="flex-1 space-y-4">
        <div v-if="address" class="flex gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-lg" :style="iconBgStyle">
            <MapPin class="size-5" />
          </div>
          <div>
            <p class="text-sm font-semibold text-slate-900">{{ t('config.landingContactAddress') }}</p>
            <p class="text-sm text-slate-600">{{ address }}</p>
          </div>
        </div>
        <div v-if="phone" class="flex gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-lg" :style="iconBgStyle">
            <Phone class="size-5" />
          </div>
          <div>
            <p class="text-sm font-semibold text-slate-900">{{ t('config.landingContactPhone') }}</p>
            <p class="text-sm text-slate-600">{{ phone }}</p>
          </div>
        </div>
        <div v-if="email" class="flex gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-lg" :style="iconBgStyle">
            <Mail class="size-5" />
          </div>
          <div>
            <p class="text-sm font-semibold text-slate-900">{{ t('config.landingContactEmail') }}</p>
            <p class="text-sm text-slate-600">{{ email }}</p>
          </div>
        </div>
      </div>
      <div class="h-80 flex-1 overflow-hidden rounded-2xl border border-slate-200 lg:h-auto">
        <div ref="mapContainer" class="h-full w-full" />
      </div>
    </div>
  </div>
</template>
