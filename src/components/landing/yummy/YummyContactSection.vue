<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Phone, Mail, Clock } from '@lucide/vue'
import { useI18n } from '@/composables/useI18n'
import { landingSectionStyle } from '@/lib/landing-section-style'
import YummySectionHeading from '@/components/landing/yummy/YummySectionHeading.vue'

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

const iconStyle = computed(() => ({
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

const sectionStyle = computed(() => landingSectionStyle(props.bgImage, props.bgColor))
</script>

<template>
  <section id="contact" class="px-6 py-20" :style="sectionStyle">
    <div class="mx-auto max-w-6xl">
      <YummySectionHeading
        :label="t('config.landingContactLabel')"
        :title="title || t('config.landingContactTitle')"
        :accent-color="accentColor"
      />
      <p v-if="subtitle" class="-mt-6 mb-10 text-center text-slate-500">
        {{ subtitle }}
      </p>

      <div class="grid gap-8 lg:grid-cols-2">
        <div class="space-y-6">
          <div v-if="address" class="flex gap-4">
            <MapPin class="mt-1 size-5 shrink-0" :style="iconStyle" />
            <div>
              <h3 class="mb-1 font-bold text-slate-800">{{ t('config.landingContactAddress') }}</h3>
              <p class="text-sm text-slate-600">{{ address }}</p>
            </div>
          </div>
          <div v-if="phone" class="flex gap-4">
            <Phone class="mt-1 size-5 shrink-0" :style="iconStyle" />
            <div>
              <h3 class="mb-1 font-bold text-slate-800">{{ t('config.landingContactPhone') }}</h3>
              <p class="text-sm text-slate-600">{{ phone }}</p>
            </div>
          </div>
          <div v-if="email" class="flex gap-4">
            <Mail class="mt-1 size-5 shrink-0" :style="iconStyle" />
            <div>
              <h3 class="mb-1 font-bold text-slate-800">{{ t('config.landingContactEmail') }}</h3>
              <p class="text-sm text-slate-600">{{ email }}</p>
            </div>
          </div>
        </div>

        <div class="h-80 overflow-hidden rounded-lg border border-slate-200 lg:h-auto lg:min-h-[320px]">
          <div ref="mapContainer" class="h-full w-full" />
        </div>
      </div>
    </div>
  </section>
</template>
