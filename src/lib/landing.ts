import type { LandingTemplate, LandingTemplateConfig, LandingTemplatePreset, LandingTestimonial, LandingServiceItem } from '@/types/database'
import defaultThumb from '@/assets/default-thumbnail.webp'
import sarabThumb from '@/assets/satab-thumbnail.webp'
import spiceThumb from '@/assets/spice-thumbnail.webp'
import yummyThumb from '@/assets/yummy-thumbnail.webp'

export const LANDING_TEMPLATE_PRESETS: Record<LandingTemplate, LandingTemplatePreset> = {
  default: {
    label: 'Default',
    thumbnail: defaultThumb,
    defaults: {
      heroImageUrl: null, heroTitle: null, heroSubtitle: null, primaryColor: '#0f172a',
      carouselEnabled: true, carouselMaxItems: 8, carouselTitle: null, carouselBgColor: '#f1f5f9',
      testimonialsEnabled: false, testimonialsTitle: null, testimonialsData: null, testimonialsBgColor: '#ffffff',
      servicesEnabled: false, servicesTitle: null, servicesSubtitle: null, servicesWhatsapp: null, servicesData: null, servicesBgColor: '#f8fafc',
      galleryEnabled: false, galleryTitle: null, gallerySubtitle: null, galleryImages: null, galleryBgColor: '#ffffff',
      contactEnabled: false, contactTitle: null, contactSubtitle: null, contactAddress: null, contactPhone: null, contactEmail: null,
      contactMapLat: -6.2088, contactMapLng: 106.8456, contactMapZoom: 15, contactBgColor: '#f8fafc',
    },
  },
  sarab: {
    label: 'Sarab',
    thumbnail: sarabThumb,
    defaults: {
      heroImageUrl: null, heroTitle: null, heroSubtitle: null, primaryColor: '#7c2d12',
      carouselEnabled: true, carouselMaxItems: 8, carouselTitle: null, carouselBgColor: '#fff7ed',
      testimonialsEnabled: false, testimonialsTitle: null, testimonialsData: null, testimonialsBgColor: '#faf5ff',
      servicesEnabled: false, servicesTitle: null, servicesSubtitle: null, servicesWhatsapp: null, servicesData: null, servicesBgColor: '#fef2f2',
      galleryEnabled: false, galleryTitle: null, gallerySubtitle: null, galleryImages: null, galleryBgColor: '#ffffff',
      contactEnabled: false, contactTitle: null, contactSubtitle: null, contactAddress: null, contactPhone: null, contactEmail: null,
      contactMapLat: -6.2088, contactMapLng: 106.8456, contactMapZoom: 15, contactBgColor: '#fff7ed',
    },
  },
  spicehaven: {
    label: 'Spice Haven',
    thumbnail: spiceThumb,
    defaults: {
      heroImageUrl: null, heroTitle: null, heroSubtitle: null, primaryColor: '#92400e',
      carouselEnabled: true, carouselMaxItems: 8, carouselTitle: null, carouselBgColor: '#fef3c7',
      testimonialsEnabled: false, testimonialsTitle: null, testimonialsData: null, testimonialsBgColor: '#fffbeb',
      servicesEnabled: false, servicesTitle: null, servicesSubtitle: null, servicesWhatsapp: null, servicesData: null, servicesBgColor: '#fff7ed',
      galleryEnabled: false, galleryTitle: null, gallerySubtitle: null, galleryImages: null, galleryBgColor: '#fffbeb',
      contactEnabled: false, contactTitle: null, contactSubtitle: null, contactAddress: null, contactPhone: null, contactEmail: null,
      contactMapLat: -6.2088, contactMapLng: 106.8456, contactMapZoom: 15, contactBgColor: '#fef3c7',
    },
  },
  yummy: {
    label: 'Yummy',
    thumbnail: yummyThumb,
    defaults: {
      heroImageUrl: null, heroTitle: null, heroSubtitle: null, primaryColor: '#991b1b',
      carouselEnabled: true, carouselMaxItems: 8, carouselTitle: null, carouselBgColor: '#fef2f2',
      testimonialsEnabled: false, testimonialsTitle: null, testimonialsData: null, testimonialsBgColor: '#ffffff',
      servicesEnabled: false, servicesTitle: null, servicesSubtitle: null, servicesWhatsapp: null, servicesData: null, servicesBgColor: '#fee2e2',
      galleryEnabled: false, galleryTitle: null, gallerySubtitle: null, galleryImages: null, galleryBgColor: '#ffffff',
      contactEnabled: false, contactTitle: null, contactSubtitle: null, contactAddress: null, contactPhone: null, contactEmail: null,
      contactMapLat: -6.2088, contactMapLng: 106.8456, contactMapZoom: 15, contactBgColor: '#fef2f2',
    },
  },
}

export function getLandingConfig(
  template: LandingTemplate,
  overrides: Partial<LandingTemplateConfig> = {},
): LandingTemplateConfig {
  const preset = LANDING_TEMPLATE_PRESETS[template]
  const d = preset.defaults
  return {
    template,
    heroImageUrl: overrides.heroImageUrl ?? d.heroImageUrl,
    heroTitle: overrides.heroTitle ?? d.heroTitle,
    heroSubtitle: overrides.heroSubtitle ?? d.heroSubtitle,
    primaryColor: overrides.primaryColor ?? d.primaryColor,
    carouselEnabled: overrides.carouselEnabled ?? d.carouselEnabled,
    carouselMaxItems: overrides.carouselMaxItems ?? d.carouselMaxItems,
    carouselTitle: overrides.carouselTitle ?? d.carouselTitle,
    carouselBgColor: overrides.carouselBgColor ?? d.carouselBgColor,
    testimonialsEnabled: overrides.testimonialsEnabled ?? d.testimonialsEnabled,
    testimonialsTitle: overrides.testimonialsTitle ?? d.testimonialsTitle,
    testimonialsData: overrides.testimonialsData ?? d.testimonialsData,
    testimonialsBgColor: overrides.testimonialsBgColor ?? d.testimonialsBgColor,
    servicesEnabled: overrides.servicesEnabled ?? d.servicesEnabled,
    servicesTitle: overrides.servicesTitle ?? d.servicesTitle,
    servicesSubtitle: overrides.servicesSubtitle ?? d.servicesSubtitle,
    servicesWhatsapp: overrides.servicesWhatsapp ?? d.servicesWhatsapp,
    servicesData: overrides.servicesData ?? d.servicesData,
    servicesBgColor: overrides.servicesBgColor ?? d.servicesBgColor,
    galleryEnabled: overrides.galleryEnabled ?? d.galleryEnabled,
    galleryTitle: overrides.galleryTitle ?? d.galleryTitle,
    gallerySubtitle: overrides.gallerySubtitle ?? d.gallerySubtitle,
    galleryImages: overrides.galleryImages ?? d.galleryImages,
    galleryBgColor: overrides.galleryBgColor ?? d.galleryBgColor,
    contactEnabled: overrides.contactEnabled ?? d.contactEnabled,
    contactTitle: overrides.contactTitle ?? d.contactTitle,
    contactSubtitle: overrides.contactSubtitle ?? d.contactSubtitle,
    contactAddress: overrides.contactAddress ?? d.contactAddress,
    contactPhone: overrides.contactPhone ?? d.contactPhone,
    contactEmail: overrides.contactEmail ?? d.contactEmail,
    contactMapLat: overrides.contactMapLat ?? d.contactMapLat,
    contactMapLng: overrides.contactMapLng ?? d.contactMapLng,
    contactMapZoom: overrides.contactMapZoom ?? d.contactMapZoom,
    contactBgColor: overrides.contactBgColor ?? d.contactBgColor,
  }
}

export function extractLandingOverrides(config: {
  landing_hero_image_url?: string | null
  landing_hero_title?: string | null
  landing_hero_subtitle?: string | null
  landing_primary_color?: string
  landing_carousel_enabled?: boolean
  landing_carousel_max_items?: number
  landing_carousel_title?: string | null
  landing_carousel_bg_color?: string
  landing_testimonials_enabled?: boolean
  landing_testimonials_title?: string | null
  landing_testimonials_data?: LandingTestimonial[] | null
  landing_testimonials_bg_color?: string
  landing_services_enabled?: boolean
  landing_services_title?: string | null
  landing_services_subtitle?: string | null
  landing_services_whatsapp?: string | null
  landing_services_data?: LandingServiceItem[] | null
  landing_services_bg_color?: string
  landing_gallery_enabled?: boolean
  landing_gallery_title?: string | null
  landing_gallery_subtitle?: string | null
  landing_gallery_images?: string[] | null
  landing_gallery_bg_color?: string
  landing_contact_enabled?: boolean
  landing_contact_title?: string | null
  landing_contact_subtitle?: string | null
  landing_contact_address?: string | null
  landing_contact_phone?: string | null
  landing_contact_email?: string | null
  landing_contact_map_lat?: number
  landing_contact_map_lng?: number
  landing_contact_map_zoom?: number
  landing_contact_bg_color?: string
} | null): Partial<LandingTemplateConfig> {
  if (!config) return {}
  return {
    heroImageUrl: config.landing_hero_image_url ?? null,
    heroTitle: config.landing_hero_title ?? null,
    heroSubtitle: config.landing_hero_subtitle ?? null,
    primaryColor: config.landing_primary_color ?? '',
    carouselEnabled: config.landing_carousel_enabled ?? undefined,
    carouselMaxItems: config.landing_carousel_max_items ?? undefined,
    carouselTitle: config.landing_carousel_title ?? null,
    carouselBgColor: config.landing_carousel_bg_color ?? '',
    testimonialsEnabled: config.landing_testimonials_enabled ?? undefined,
    testimonialsTitle: config.landing_testimonials_title ?? null,
    testimonialsData: config.landing_testimonials_data ?? null,
    testimonialsBgColor: config.landing_testimonials_bg_color ?? '',
    servicesEnabled: config.landing_services_enabled ?? undefined,
    servicesTitle: config.landing_services_title ?? null,
    servicesSubtitle: config.landing_services_subtitle ?? null,
    servicesWhatsapp: config.landing_services_whatsapp ?? null,
    servicesData: config.landing_services_data ?? null,
    servicesBgColor: config.landing_services_bg_color ?? '',
    galleryEnabled: config.landing_gallery_enabled ?? undefined,
    galleryTitle: config.landing_gallery_title ?? null,
    gallerySubtitle: config.landing_gallery_subtitle ?? null,
    galleryImages: config.landing_gallery_images ?? null,
    galleryBgColor: config.landing_gallery_bg_color ?? '',
    contactEnabled: config.landing_contact_enabled ?? undefined,
    contactTitle: config.landing_contact_title ?? null,
    contactSubtitle: config.landing_contact_subtitle ?? null,
    contactAddress: config.landing_contact_address ?? null,
    contactPhone: config.landing_contact_phone ?? null,
    contactEmail: config.landing_contact_email ?? null,
    contactMapLat: config.landing_contact_map_lat ?? undefined,
    contactMapLng: config.landing_contact_map_lng ?? undefined,
    contactMapZoom: config.landing_contact_map_zoom ?? undefined,
    contactBgColor: config.landing_contact_bg_color ?? '',
  }
}
