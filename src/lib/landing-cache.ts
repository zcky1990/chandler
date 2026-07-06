import type {
  LandingTemplate,
  LandingTemplateConfig,
  Product,
} from '@/types/database'

const STORAGE_KEY = 'landing_page_cache'
const CACHE_TTL_MS = 3 * 60 * 60 * 1000

export type LandingPageLandingState = {
  heroImageUrl: string | null
  heroTitle: string | null
  heroSubtitle: string | null
  primaryColor: string
  heroBgColor: string
  heroBgImage: string | null
  carouselEnabled: boolean
  carouselMaxItems: number
  carouselTitle: string | null
  carouselBgColor: string
  carouselBgImage: string | null
  testimonialsEnabled: boolean
  testimonialsTitle: string | null
  testimonialsData: LandingTemplateConfig['testimonialsData']
  testimonialsBgColor: string
  testimonialsBgImage: string | null
  servicesEnabled: boolean
  servicesTitle: string | null
  servicesSubtitle: string | null
  servicesWhatsapp: string | null
  servicesData: LandingTemplateConfig['servicesData']
  servicesBgColor: string
  servicesBgImage: string | null
  galleryEnabled: boolean
  galleryTitle: string | null
  gallerySubtitle: string | null
  galleryImages: string[] | null
  galleryBgColor: string
  galleryBgImage: string | null
  contactEnabled: boolean
  contactTitle: string | null
  contactSubtitle: string | null
  contactAddress: string | null
  contactPhone: string | null
  contactEmail: string | null
  contactMapLat: number
  contactMapLng: number
  contactMapZoom: number
  contactBgColor: string
  contactBgImage: string | null
  aboutEnabled: boolean
  aboutLabel: string | null
  aboutTitle: string | null
  aboutDescription: string | null
  aboutImageUrl: string | null
  aboutBullets: string[] | null
  aboutBgColor: string
  aboutBgImage: string | null
  whyEnabled: boolean
  whyLabel: string | null
  whyTitle: string | null
  whyDescription: string | null
  whyFeatures: LandingTemplateConfig['whyFeatures']
  whyStats: LandingTemplateConfig['whyStats']
  whyBgColor: string
  whyBgImage: string | null
  bookBgColor: string | null
  bookBgImage: string | null
}

export type LandingPageCachePayload = {
  cachedAt: number
  shopName: string
  shopAddress: string
  shopPhone: string
  template: LandingTemplate
  landing: LandingPageLandingState
  products: Product[]
}

type StoredLandingPageCache = LandingPageCachePayload

export function landingConfigToPageState(cfg: LandingTemplateConfig): LandingPageLandingState {
  return {
    heroImageUrl: cfg.heroImageUrl,
    heroTitle: cfg.heroTitle,
    heroSubtitle: cfg.heroSubtitle,
    primaryColor: cfg.primaryColor,
    heroBgColor: cfg.heroBgColor,
    heroBgImage: cfg.heroBgImage,
    carouselEnabled: cfg.carouselEnabled,
    carouselMaxItems: cfg.carouselMaxItems,
    carouselTitle: cfg.carouselTitle,
    carouselBgColor: cfg.carouselBgColor,
    carouselBgImage: cfg.carouselBgImage,
    testimonialsEnabled: cfg.testimonialsEnabled,
    testimonialsTitle: cfg.testimonialsTitle,
    testimonialsData: cfg.testimonialsData,
    testimonialsBgColor: cfg.testimonialsBgColor,
    testimonialsBgImage: cfg.testimonialsBgImage,
    servicesEnabled: cfg.servicesEnabled,
    servicesTitle: cfg.servicesTitle,
    servicesSubtitle: cfg.servicesSubtitle,
    servicesWhatsapp: cfg.servicesWhatsapp,
    servicesData: cfg.servicesData,
    servicesBgColor: cfg.servicesBgColor,
    servicesBgImage: cfg.servicesBgImage,
    galleryEnabled: cfg.galleryEnabled,
    galleryTitle: cfg.galleryTitle,
    gallerySubtitle: cfg.gallerySubtitle,
    galleryImages: cfg.galleryImages,
    galleryBgColor: cfg.galleryBgColor,
    galleryBgImage: cfg.galleryBgImage,
    contactEnabled: cfg.contactEnabled,
    contactTitle: cfg.contactTitle,
    contactSubtitle: cfg.contactSubtitle,
    contactAddress: cfg.contactAddress,
    contactPhone: cfg.contactPhone,
    contactEmail: cfg.contactEmail,
    contactMapLat: cfg.contactMapLat,
    contactMapLng: cfg.contactMapLng,
    contactMapZoom: cfg.contactMapZoom,
    contactBgColor: cfg.contactBgColor,
    contactBgImage: cfg.contactBgImage,
    aboutEnabled: cfg.aboutEnabled,
    aboutLabel: cfg.aboutLabel,
    aboutTitle: cfg.aboutTitle,
    aboutDescription: cfg.aboutDescription,
    aboutImageUrl: cfg.aboutImageUrl,
    aboutBullets: cfg.aboutBullets,
    aboutBgColor: cfg.aboutBgColor,
    aboutBgImage: cfg.aboutBgImage,
    whyEnabled: cfg.whyEnabled,
    whyLabel: cfg.whyLabel,
    whyTitle: cfg.whyTitle,
    whyDescription: cfg.whyDescription,
    whyFeatures: cfg.whyFeatures,
    whyStats: cfg.whyStats,
    whyBgColor: cfg.whyBgColor,
    whyBgImage: cfg.whyBgImage,
    bookBgColor: cfg.bookBgColor,
    bookBgImage: cfg.bookBgImage,
  }
}

export function filterLandingProducts(products: Product[]): Product[] {
  return products.filter((p) => p.is_active && !p.is_addons && p.stock_quantity > 0)
}

export function saveLandingPageCache(payload: Omit<LandingPageCachePayload, 'cachedAt'>) {
  const entry: StoredLandingPageCache = {
    ...payload,
    cachedAt: Date.now(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entry))
}

export function readLandingPageCache(): LandingPageCachePayload | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as StoredLandingPageCache
    if (
      typeof parsed.cachedAt !== 'number'
      || typeof parsed.shopName !== 'string'
      || typeof parsed.shopAddress !== 'string'
      || typeof parsed.template !== 'string'
      || !parsed.landing
      || !Array.isArray(parsed.products)
    ) {
      return null
    }

    if (Date.now() - parsed.cachedAt > CACHE_TTL_MS) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }

    return parsed
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function clearLandingPageCache() {
  localStorage.removeItem(STORAGE_KEY)
}
