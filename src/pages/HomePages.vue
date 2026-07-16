<script setup lang="ts">
import { onMounted, ref } from 'vue'
import LandingPage from '@/components/landing/LandingPage.vue'
import { getShopConfig } from '@/lib/config'
import { getLandingConfig, extractLandingOverrides } from '@/lib/landing'
import {
  readLandingPageCache,
  saveLandingPageCache,
  landingConfigToPageState,
  filterLandingProducts,
} from '@/lib/landing-cache'
import { getProducts as fetchProducts } from '@/lib/product'
import type { LandingTemplate, Product, LandingTestimonial, LandingServiceItem, LandingFeatureItem, LandingStatItem } from '@/types/database'

const shopName = ref('Bistro')
const shopAddress = ref('')
const shopPhone = ref('')
const template = ref<LandingTemplate>('default')
const products = ref<Product[]>([])
const landing = ref({
  heroImageUrl: null as string | null,
  heroTitle: null as string | null,
  heroSubtitle: null as string | null,
  heroTagline: null as string | null,
  navLogoUrl: null as string | null,
  primaryColor: '#0f172a',
  heroBgColor: '#ffffff', heroBgImage: null as string | null,
  carouselEnabled: true, carouselMaxItems: 8, carouselTitle: null as string | null, carouselBgColor: '#f1f5f9', carouselBgImage: null as string | null,
  testimonialsEnabled: false, testimonialsTitle: null as string | null, testimonialsData: null as LandingTestimonial[] | null, testimonialsBgColor: '#ffffff', testimonialsBgImage: null as string | null,
  servicesEnabled: false, servicesTitle: null as string | null, servicesSubtitle: null as string | null,
  servicesWhatsapp: null as string | null, servicesData: null as LandingServiceItem[] | null, servicesBgColor: '#f8fafc', servicesBgImage: null as string | null,
  galleryEnabled: false, galleryTitle: null as string | null, gallerySubtitle: null as string | null,
  galleryImages: null as string[] | null, galleryBgColor: '#ffffff', galleryBgImage: null as string | null,
  contactEnabled: false, contactTitle: null as string | null, contactSubtitle: null as string | null,
  contactAddress: null as string | null, contactPhone: null as string | null, contactEmail: null as string | null,
  contactMapLat: -6.2088, contactMapLng: 106.8456, contactMapZoom: 15, contactBgColor: '#f8fafc', contactBgImage: null as string | null,
  aboutEnabled: false, aboutLabel: null as string | null, aboutTitle: null as string | null,
  aboutDescription: null as string | null, aboutImageUrl: null as string | null,
  aboutBullets: null as string[] | null, aboutBgColor: '#ffffff', aboutBgImage: null as string | null,
  whyEnabled: false, whyLabel: null as string | null, whyTitle: null as string | null,
  whyDescription: null as string | null, whyFeatures: null as LandingFeatureItem[] | null,
  whyStats: null as LandingStatItem[] | null, whyBgColor: '#f2f2f2', whyBgImage: null as string | null,
  bookBgColor: null as string | null, bookBgImage: null as string | null,
})

function applyCache(payload: ReturnType<typeof readLandingPageCache>) {
  if (!payload) return
  shopName.value = payload.shopName
  shopAddress.value = payload.shopAddress
  shopPhone.value = payload.shopPhone
  template.value = payload.template
  landing.value = { ...payload.landing }
  products.value = payload.products
}

async function loadFromApi() {
  const [{ config }, productsResult] = await Promise.all([getShopConfig(), fetchProducts()])
  const tpl = (config?.landing_template || 'default') as LandingTemplate
  const cfg = getLandingConfig(tpl, extractLandingOverrides(config))
  const filteredProducts = productsResult.products
    ? filterLandingProducts(productsResult.products)
    : []

  shopName.value = config?.shop_name || 'Bistro'
  shopAddress.value = config?.shop_address || ''
  shopPhone.value = config?.landing_contact_phone?.trim() || ''
  template.value = tpl
  landing.value = landingConfigToPageState(cfg)
  products.value = filteredProducts

  saveLandingPageCache({
    shopName: shopName.value,
    shopAddress: shopAddress.value,
    shopPhone: shopPhone.value,
    template: template.value,
    landing: landing.value,
    products: filteredProducts,
  })
}

onMounted(async () => {
  const cached = readLandingPageCache()
  if (cached) {
    applyCache(cached)
    return
  }
  await loadFromApi()
})
</script>

<template>
  <LandingPage
    :template="template"
    :shop-name="shopName"
    :shop-address="shopAddress"
    :shop-phone="shopPhone"
    :hero-image-url="landing.heroImageUrl"
    :hero-title="landing.heroTitle"
    :hero-subtitle="landing.heroSubtitle"
    :hero-tagline="landing.heroTagline"
    :nav-logo-url="landing.navLogoUrl"
    :primary-color="landing.primaryColor"
    :hero-bg-color="landing.heroBgColor"
    :hero-bg-image="landing.heroBgImage"
    :carousel-enabled="landing.carouselEnabled"
    :carousel-max-items="landing.carouselMaxItems"
    :carousel-title="landing.carouselTitle"
    :carousel-bg-color="landing.carouselBgColor"
    :carousel-bg-image="landing.carouselBgImage"
    :products="products"
    :testimonials-enabled="landing.testimonialsEnabled"
    :testimonials-title="landing.testimonialsTitle"
    :testimonials-data="landing.testimonialsData"
    :testimonials-bg-color="landing.testimonialsBgColor"
    :testimonials-bg-image="landing.testimonialsBgImage"
    :services-enabled="landing.servicesEnabled"
    :services-title="landing.servicesTitle"
    :services-subtitle="landing.servicesSubtitle"
    :services-whatsapp="landing.servicesWhatsapp"
    :services-data="landing.servicesData"
    :services-bg-color="landing.servicesBgColor"
    :services-bg-image="landing.servicesBgImage"
    :gallery-enabled="landing.galleryEnabled"
    :gallery-title="landing.galleryTitle"
    :gallery-subtitle="landing.gallerySubtitle"
    :gallery-images="landing.galleryImages"
    :gallery-bg-color="landing.galleryBgColor"
    :gallery-bg-image="landing.galleryBgImage"
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
    :contact-bg-image="landing.contactBgImage"
    :about-enabled="landing.aboutEnabled"
    :about-label="landing.aboutLabel"
    :about-title="landing.aboutTitle"
    :about-description="landing.aboutDescription"
    :about-image-url="landing.aboutImageUrl"
    :about-bullets="landing.aboutBullets"
    :about-bg-color="landing.aboutBgColor"
    :about-bg-image="landing.aboutBgImage"
    :why-enabled="landing.whyEnabled"
    :why-label="landing.whyLabel"
    :why-title="landing.whyTitle"
    :why-description="landing.whyDescription"
    :why-features="landing.whyFeatures"
    :why-stats="landing.whyStats"
    :why-bg-color="landing.whyBgColor"
    :why-bg-image="landing.whyBgImage"
    :book-bg-color="landing.bookBgColor"
    :book-bg-image="landing.bookBgImage"
  />
</template>
