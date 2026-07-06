<script setup lang="ts">
import SarabMenuGrid from '@/components/landing/sarab/SarabMenuGrid.vue'
import SarabTestimonialsSection from '@/components/landing/sarab/SarabTestimonialsSection.vue'
import SarabGallerySection from '@/components/landing/sarab/SarabGallerySection.vue'
import SarabContactSection from '@/components/landing/sarab/SarabContactSection.vue'
import type { LandingPageProps } from '@/components/landing/landing-page-props'

defineProps<LandingPageProps>()
</script>

<template>
  <SarabMenuGrid
    v-if="carouselEnabled"
    :products="products"
    :max-items="carouselMaxItems"
    :accent-color="primaryColor"
    :title="carouselTitle"
    :bg-color="carouselBgColor"
    :bg-image="carouselBgImage"
  />
  <SarabTestimonialsSection
    v-if="testimonialsEnabled"
    :testimonials="testimonialsData ?? []"
    :accent-color="primaryColor"
    :title="testimonialsTitle"
    :bg-color="testimonialsBgColor"
    :bg-image="testimonialsBgImage"
  />
  <SarabGallerySection
    v-if="galleryEnabled"
    :images="galleryImages ?? []"
    :accent-color="primaryColor"
    :title="galleryTitle"
    :subtitle="gallerySubtitle"
    :bg-color="galleryBgColor"
    :bg-image="galleryBgImage"
  />
  <SarabContactSection
    v-if="contactEnabled"
    :accent-color="primaryColor"
    :title="contactTitle"
    :subtitle="contactSubtitle"
    :address="contactAddress || shopAddress || null"
    :phone="contactPhone || shopPhone || null"
    :email="contactEmail"
    :map-lat="contactMapLat"
    :map-lng="contactMapLng"
    :map-zoom="contactMapZoom"
    :bg-color="contactBgColor"
    :bg-image="contactBgImage"
  />
</template>
