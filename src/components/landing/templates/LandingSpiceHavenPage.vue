<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowDown, Sparkles } from '@lucide/vue'
import ApplicationLayout from '@/layouts/ApplicationLayout.vue'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/composables/useI18n'
import { landingSectionStyle } from '@/lib/landing-section-style'
import SpiceHavenNav from '@/components/landing/spicehaven/SpiceHavenNav.vue'
import SpiceHavenMenuIntro from '@/components/landing/spicehaven/SpiceHavenMenuIntro.vue'
import SpiceHavenStorySection from '@/components/landing/spicehaven/SpiceHavenStorySection.vue'
import SpiceHavenQuoteSection from '@/components/landing/spicehaven/SpiceHavenQuoteSection.vue'
import SpiceHavenMenuGrid from '@/components/landing/spicehaven/SpiceHavenMenuGrid.vue'
import SpiceHavenMomentsGallery from '@/components/landing/spicehaven/SpiceHavenMomentsGallery.vue'
import SpiceHavenFooter from '@/components/landing/spicehaven/SpiceHavenFooter.vue'
import type { LandingPageProps } from '@/components/landing/landing-page-props'

const props = defineProps<Omit<LandingPageProps, 'template'>>()

const { t } = useI18n()

const displaySubtitle = computed(() => props.heroSubtitle || t('config.landingSpiceHavenHero'))
const heroHeadline = computed(() => props.heroTitle || t('config.landingSpiceHavenHeroHeadline'))
const displayTagline = computed(() => props.heroTagline)

const heroStyle = computed(() => {
  if (props.heroBgImage?.trim()) {
    return landingSectionStyle(props.heroBgImage, props.heroBgColor || '#1c1917')
  }
  const c = props.primaryColor
  return {
    background: `linear-gradient(160deg, #1c1917 0%, color-mix(in srgb, ${c} 40%, #1c1917) 50%, #292524 100%)`,
  }
})

const storyFeatures = computed(() => {
  if (props.whyFeatures?.length) return props.whyFeatures
  return [
    { title: t('config.landingSpiceHavenFeat1Title'), description: t('config.landingSpiceHavenFeat1Desc') },
    { title: t('config.landingSpiceHavenFeat2Title'), description: t('config.landingSpiceHavenFeat2Desc') },
    { title: t('config.landingSpiceHavenFeat3Title'), description: t('config.landingSpiceHavenFeat3Desc') },
  ]
})

const firstTestimonial = computed(() => props.testimonialsData?.[0] ?? null)
</script>

<template>
  <ApplicationLayout show-staff-button>
    <div class="w-full bg-stone-950 text-amber-50">
      <section id="hero" class="landing-fade-in relative flex min-h-screen flex-col">
        <div
          v-if="heroImageUrl && !heroBgImage"
          class="absolute inset-0 bg-cover bg-center"
          :style="{ backgroundImage: `url(${heroImageUrl})` }"
        />
        <div v-else class="absolute inset-0" :style="heroStyle" />
        <div class="absolute inset-0 bg-stone-950/60" />
        <SpiceHavenNav :shop-name="shopName" :accent-color="primaryColor" :nav-logo-url="navLogoUrl" />
        <div class="landing-fade-up landing-delay-1 relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
          <p v-if="displayTagline" class="mb-4 text-sm font-semibold tracking-[0.2em] text-amber-400 uppercase">
            {{ displayTagline }}
          </p>
          <h1 class="max-w-4xl font-serif text-5xl leading-tight font-light whitespace-pre-line md:text-6xl lg:text-7xl">
            {{ heroHeadline }}
          </h1>
          <p class="mt-6 max-w-2xl text-lg text-amber-100/70">
            {{ displaySubtitle }}
          </p>
          <RouterLink to="/order" class="mt-10">
            <Button
              size="lg"
              variant="outline"
              class="h-12 rounded-none border-amber-400/50 px-10 tracking-widest text-amber-50 uppercase hover:bg-amber-400/10"
            >
              {{ t('config.landingSpiceHavenOrder') }}
            </Button>
          </RouterLink>
          <ArrowDown class="mt-16 size-6 animate-bounce text-amber-400/60" />
        </div>
      </section>

      <SpiceHavenMenuIntro
        :subtitle="displaySubtitle"
        :image-url="aboutImageUrl || heroImageUrl"
        :shop-name="shopName"
        :bg-color="aboutBgColor || '#0c0a09'"
        :bg-image="aboutBgImage"
      />

      <SpiceHavenStorySection
        v-if="whyEnabled !== false"
        :label="whyLabel"
        :title="whyTitle"
        :description="whyDescription"
        :features="storyFeatures"
        :bg-color="whyBgColor || '#1c1917'"
        :bg-image="whyBgImage"
      />

      <SpiceHavenQuoteSection
        :testimonial="firstTestimonial"
        :fallback-quote="t('config.landingSpiceHavenQuote')"
        :fallback-author="'Google Review'"
        :bg-color="testimonialsBgColor || '#0c0a09'"
        :bg-image="testimonialsBgImage"
      />

      <SpiceHavenMenuGrid
        v-if="carouselEnabled"
        :products="products"
        :max-items="carouselMaxItems"
        :title="carouselTitle"
        :accent-color="primaryColor"
        :bg-color="carouselBgColor || '#0c0a09'"
        :bg-image="carouselBgImage"
      />

      <SpiceHavenMomentsGallery
        v-if="galleryEnabled"
        :images="galleryImages ?? []"
        :title="galleryTitle"
        :subtitle="gallerySubtitle"
        :bg-color="galleryBgColor || '#0c0a09'"
        :bg-image="galleryBgImage"
      />

      <section
        class="landing-fade-up px-6 py-20"
        :style="landingSectionStyle(bookBgImage, bookBgColor || primaryColor)"
      >
        <div class="mx-auto max-w-3xl text-center">
          <h2 class="mb-4 font-serif text-3xl text-amber-50">{{ t('config.landingSpiceHavenCta') }}</h2>
          <p class="mb-8 text-amber-100/80">{{ t('config.landingSpiceHavenCtaDesc') }}</p>
          <RouterLink to="/order">
            <Button size="lg" class="h-12 rounded-none bg-amber-50 px-10 text-stone-900 hover:bg-amber-100">
              {{ t('config.landingSpiceHavenOrder') }}
            </Button>
          </RouterLink>
        </div>
      </section>

      <SpiceHavenFooter
        :shop-name="shopName"
        :address="contactAddress || shopAddress || null"
        :phone="contactPhone || shopPhone || null"
        :email="contactEmail"
        :bg-color="contactBgColor || '#0c0a09'"
        :bg-image="contactBgImage"
      />
    </div>
  </ApplicationLayout>
</template>
