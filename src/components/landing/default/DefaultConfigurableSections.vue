<script setup lang="ts">
import { computed } from 'vue'
import { landingSectionStyle } from '@/lib/landing-section-style'
import TestimonialsSection from '@/components/landing/TestimonialsSection.vue'
import ServicesSection from '@/components/landing/ServicesSection.vue'
import GallerySection from '@/components/landing/GallerySection.vue'
import ContactSection from '@/components/landing/ContactSection.vue'
import type { LandingPageProps } from '@/components/landing/landing-page-props'

const props = defineProps<LandingPageProps>()

const testimonialsStyle = computed(() => landingSectionStyle(props.testimonialsBgImage, props.testimonialsBgColor))
const servicesStyle = computed(() => landingSectionStyle(props.servicesBgImage, props.servicesBgColor))
const galleryStyle = computed(() => landingSectionStyle(props.galleryBgImage, props.galleryBgColor))
const contactStyle = computed(() => landingSectionStyle(props.contactBgImage, props.contactBgColor))
</script>

<template>
  <section v-if="testimonialsEnabled" class="px-6 py-20" :style="testimonialsStyle">
    <TestimonialsSection
      :testimonials="testimonialsData ?? []"
      :accent-color="primaryColor"
      :title="testimonialsTitle"
    />
  </section>

  <section v-if="servicesEnabled" class="px-6 py-20" :style="servicesStyle">
    <ServicesSection
      :items="servicesData ?? []"
      :accent-color="primaryColor"
      :title="servicesTitle"
      :subtitle="servicesSubtitle"
      :whatsapp-number="servicesWhatsapp"
    />
  </section>

  <section v-if="galleryEnabled" class="px-6 py-20" :style="galleryStyle">
    <GallerySection
      :images="galleryImages ?? []"
      :accent-color="primaryColor"
      :title="galleryTitle"
      :subtitle="gallerySubtitle"
    />
  </section>

  <section v-if="contactEnabled" id="contact" class="px-6 py-20" :style="contactStyle">
    <ContactSection
      :accent-color="primaryColor"
      :title="contactTitle"
      :subtitle="contactSubtitle"
      :address="contactAddress || shopAddress || null"
      :phone="contactPhone || shopPhone || null"
      :email="contactEmail"
      :map-lat="contactMapLat"
      :map-lng="contactMapLng"
      :map-zoom="contactMapZoom"
    />
  </section>
</template>
