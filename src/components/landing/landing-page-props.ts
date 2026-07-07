import type {
  LandingTemplate,
  LandingServiceItem,
  LandingTestimonial,
  LandingFeatureItem,
  LandingStatItem,
  Product,
} from '@/types/database'

export type LandingPageProps = {
  template: LandingTemplate
  shopName: string
  shopAddress: string
  shopPhone: string
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
  products: Product[]
  testimonialsEnabled: boolean
  testimonialsTitle: string | null
  testimonialsData: LandingTestimonial[] | null
  testimonialsBgColor: string
  testimonialsBgImage: string | null
  servicesEnabled: boolean
  servicesTitle: string | null
  servicesSubtitle: string | null
  servicesWhatsapp: string | null
  servicesData: LandingServiceItem[] | null
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
  whyFeatures: LandingFeatureItem[] | null
  whyStats: LandingStatItem[] | null
  whyBgColor: string
  whyBgImage: string | null
  bookBgColor: string | null
  bookBgImage: string | null
  navLogoUrl: string | null
}
