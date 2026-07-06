<script setup lang="ts">
import { onMounted, ref } from 'vue'
import LandingPage from '@/components/landing/LandingPage.vue'
import { getShopConfig } from '@/lib/config'
import { getLandingConfig, extractLandingOverrides } from '@/lib/landing'
import { getProducts as fetchProducts } from '@/lib/product'
import type { LandingTemplate, Product, LandingTestimonial, LandingServiceItem } from '@/types/database'

const shopName = ref('Bistro')
const shopAddress = ref('')
const shopPhone = ref('')
const products = ref<Product[]>([])
const landing = ref({
  heroImageUrl: null as string | null,
  heroTitle: null as string | null,
  heroSubtitle: null as string | null,
  primaryColor: '#0f172a',
  carouselEnabled: true, carouselMaxItems: 8, carouselTitle: null as string | null, carouselBgColor: '#f1f5f9',
  testimonialsEnabled: false, testimonialsTitle: null as string | null, testimonialsData: null as LandingTestimonial[] | null, testimonialsBgColor: '#ffffff',
  servicesEnabled: false, servicesTitle: null as string | null, servicesSubtitle: null as string | null,
  servicesWhatsapp: null as string | null, servicesData: null as LandingServiceItem[] | null, servicesBgColor: '#f8fafc',
  galleryEnabled: false, galleryTitle: null as string | null, gallerySubtitle: null as string | null,
  galleryImages: null as string[] | null, galleryBgColor: '#ffffff',
  contactEnabled: false, contactTitle: null as string | null, contactSubtitle: null as string | null,
  contactAddress: null as string | null, contactPhone: null as string | null, contactEmail: null as string | null,
  contactMapLat: -6.2088, contactMapLng: 106.8456, contactMapZoom: 15, contactBgColor: '#f8fafc',
})

onMounted(async () => {
  const [{ config }, productsResult] = await Promise.all([getShopConfig(), fetchProducts()])
  shopName.value = config?.shop_name || 'Bistro'
  shopAddress.value = config?.shop_address || ''
  const template = (config?.landing_template || 'default') as LandingTemplate
  const cfg = getLandingConfig(template, extractLandingOverrides(config))
  landing.value = {
    heroImageUrl: cfg.heroImageUrl, heroTitle: cfg.heroTitle, heroSubtitle: cfg.heroSubtitle, primaryColor: cfg.primaryColor,
    carouselEnabled: cfg.carouselEnabled, carouselMaxItems: cfg.carouselMaxItems, carouselTitle: cfg.carouselTitle, carouselBgColor: cfg.carouselBgColor,
    testimonialsEnabled: cfg.testimonialsEnabled, testimonialsTitle: cfg.testimonialsTitle, testimonialsData: cfg.testimonialsData, testimonialsBgColor: cfg.testimonialsBgColor,
    servicesEnabled: cfg.servicesEnabled, servicesTitle: cfg.servicesTitle, servicesSubtitle: cfg.servicesSubtitle,
    servicesWhatsapp: cfg.servicesWhatsapp, servicesData: cfg.servicesData, servicesBgColor: cfg.servicesBgColor,
    galleryEnabled: cfg.galleryEnabled, galleryTitle: cfg.galleryTitle, gallerySubtitle: cfg.gallerySubtitle,
    galleryImages: cfg.galleryImages, galleryBgColor: cfg.galleryBgColor,
    contactEnabled: cfg.contactEnabled, contactTitle: cfg.contactTitle, contactSubtitle: cfg.contactSubtitle,
    contactAddress: cfg.contactAddress, contactPhone: cfg.contactPhone, contactEmail: cfg.contactEmail,
    contactMapLat: cfg.contactMapLat, contactMapLng: cfg.contactMapLng, contactMapZoom: cfg.contactMapZoom, contactBgColor: cfg.contactBgColor,
  }
  if (productsResult.products) {
    products.value = productsResult.products.filter((p) => p.is_active && !p.is_addons && p.stock_quantity > 0)
  }
})
</script>

<template>
  <LandingPage
    :shop-name="shopName"
    :shop-address="shopAddress"
    :shop-phone="shopPhone"
    :hero-image-url="landing.heroImageUrl"
    :hero-title="landing.heroTitle"
    :hero-subtitle="landing.heroSubtitle"
    :primary-color="landing.primaryColor"
    :carousel-enabled="landing.carouselEnabled"
    :carousel-max-items="landing.carouselMaxItems"
    :carousel-title="landing.carouselTitle"
    :carousel-bg-color="landing.carouselBgColor"
    :products="products"
    :testimonials-enabled="landing.testimonialsEnabled"
    :testimonials-title="landing.testimonialsTitle"
    :testimonials-data="landing.testimonialsData"
    :testimonials-bg-color="landing.testimonialsBgColor"
    :services-enabled="landing.servicesEnabled"
    :services-title="landing.servicesTitle"
    :services-subtitle="landing.servicesSubtitle"
    :services-whatsapp="landing.servicesWhatsapp"
    :services-data="landing.servicesData"
    :services-bg-color="landing.servicesBgColor"
    :gallery-enabled="landing.galleryEnabled"
    :gallery-title="landing.galleryTitle"
    :gallery-subtitle="landing.gallerySubtitle"
    :gallery-images="landing.galleryImages"
    :gallery-bg-color="landing.galleryBgColor"
    :contact-enabled="landing.contactEnabled"
    :contact-title="landing.contactTitle"
    :contact-subtitle="landing.contactSubtitle"
    :contact-address="landing.contactAddress"
    :contact-phone="landing.contactPhone"
    :contact-email="landing.contactEmail"
    :contact-map-lat="landing.contactMapLat"
    :contact-map-lng="landing.contactMapLng"
    :contact-map-zoom="landing.contactMapZoom"
    :contact-bg-color="landing.contactBgColor"
  />
</template>
