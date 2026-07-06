<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowDown, UtensilsCrossed, Clock, MapPin, Phone, Mail, Sparkles } from '@lucide/vue'
import ApplicationLayout from '@/layouts/ApplicationLayout.vue'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/composables/useI18n'
import LandingNav from '@/components/landing/LandingNav.vue'
import LandingConfigurableSections from '@/components/landing/LandingConfigurableSections.vue'
import type { LandingPageProps } from '@/components/landing/landing-page-props'

const props = defineProps<Omit<LandingPageProps, 'template'>>()

const { t } = useI18n()

const displayTitle = computed(() => props.heroTitle || t('config.landingSpiceHavenTagline'))
const displaySubtitle = computed(() => props.heroSubtitle || t('config.landingSpiceHavenHero'))

const featuredQuote = computed(() => {
  const first = props.testimonialsData?.[0]
  if (first?.text) return first.text
  return t('config.landingSpiceHavenQuote')
})

const quoteAuthor = computed(() => {
  const first = props.testimonialsData?.[0]
  if (first?.name) return first.name
  return 'Google Review'
})
</script>

<template>
  <ApplicationLayout show-staff-button>
    <div class="w-full bg-stone-950 text-amber-50">
      <section class="relative flex min-h-screen flex-col">
        <div
          v-if="heroImageUrl"
          class="absolute inset-0 bg-cover bg-center"
          :style="{ backgroundImage: `url(${heroImageUrl})` }"
        />
        <div
          v-else
          class="absolute inset-0"
          :style="{ background: `linear-gradient(160deg, #1c1917 0%, color-mix(in srgb, ${primaryColor} 40%, #1c1917) 50%, #292524 100%)` }"
        />
        <div class="absolute inset-0 bg-stone-950/60" />
        <LandingNav variant="spicehaven" :shop-name="shopName" :accent-color="primaryColor" />
        <div class="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
          <p class="mb-6 flex items-center gap-2 text-sm tracking-[0.3em] text-amber-200/80 uppercase">
            <Sparkles class="size-4" />
            Est. 2010
          </p>
          <h1 class="max-w-4xl font-serif text-5xl leading-tight font-light md:text-6xl lg:text-7xl">
            Where Every<br />
            Spice Tells<br />
            a <em class="not-italic font-semibold text-amber-300">Story</em>
          </h1>
          <p v-if="heroTitle" class="mt-6 max-w-xl text-lg text-amber-100/70">
            {{ displayTitle }}
          </p>
          <p class="mt-4 max-w-2xl text-amber-100/60">
            {{ displaySubtitle }}
          </p>
          <RouterLink to="/order" class="mt-10">
            <Button
              size="lg"
              variant="outline"
              class="h-12 rounded-none border-amber-400/50 px-10 tracking-widest text-amber-50 uppercase hover:bg-amber-400/10"
            >
              {{ t('nav.createTransaction') }}
            </Button>
          </RouterLink>
          <ArrowDown class="mt-16 size-6 animate-bounce text-amber-400/60" />
        </div>
      </section>

      <section class="px-6 py-24">
        <div class="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
          <div>
            <p class="mb-4 text-sm font-semibold tracking-[0.25em] text-amber-500 uppercase">Our Menu</p>
            <p class="font-serif text-2xl leading-relaxed text-amber-100/90">
              {{ displaySubtitle }}
            </p>
            <RouterLink to="/order" class="mt-8 inline-block">
              <span class="border-b border-amber-400 pb-1 text-sm font-semibold tracking-widest text-amber-400 uppercase">
                Explore Menu
              </span>
            </RouterLink>
          </div>
          <div class="relative">
            <img
              v-if="heroImageUrl"
              :src="heroImageUrl"
              :alt="shopName"
              class="w-full rounded-sm object-cover shadow-2xl"
            />
            <div
              v-else
              class="flex aspect-[4/3] items-center justify-center bg-stone-800"
            >
              <UtensilsCrossed class="size-16 text-stone-600" />
            </div>
          </div>
        </div>
      </section>

      <section class="border-y border-amber-900/30 bg-stone-900 px-6 py-20">
        <div class="mx-auto max-w-4xl text-center">
          <p class="mb-2 text-sm tracking-[0.25em] text-amber-500 uppercase">{{ t('config.landingSpiceHavenStory') }}</p>
          <h2 class="mb-12 font-serif text-3xl text-amber-50">It's Always More Than Good Food</h2>
          <div class="grid gap-8 sm:grid-cols-3">
            <div>
              <h3 class="mb-2 font-semibold text-amber-300">{{ t('config.landingSpiceHavenFeat1Title') }}</h3>
              <p class="text-sm text-amber-100/60">{{ t('config.landingSpiceHavenFeat1Desc') }}</p>
            </div>
            <div>
              <h3 class="mb-2 font-semibold text-amber-300">{{ t('config.landingSpiceHavenFeat2Title') }}</h3>
              <p class="text-sm text-amber-100/60">{{ t('config.landingSpiceHavenFeat2Desc') }}</p>
            </div>
            <div>
              <h3 class="mb-2 font-semibold text-amber-300">{{ t('config.landingSpiceHavenFeat3Title') }}</h3>
              <p class="text-sm text-amber-100/60">{{ t('config.landingSpiceHavenFeat3Desc') }}</p>
            </div>
          </div>
        </div>
      </section>

      <section v-if="!testimonialsEnabled" class="px-6 py-20">
        <blockquote class="mx-auto max-w-3xl text-center">
          <p class="font-serif text-2xl leading-relaxed text-amber-100/90 italic">
            "{{ featuredQuote }}"
          </p>
          <footer class="mt-6 text-sm tracking-widest text-amber-500 uppercase">
            — {{ quoteAuthor }} ★★★★★
          </footer>
        </blockquote>
      </section>

      <LandingConfigurableSections v-bind="props" />

      <section class="px-6 py-20" :style="{ backgroundColor: primaryColor }">
        <div class="mx-auto max-w-3xl text-center">
          <h2 class="mb-4 font-serif text-3xl text-amber-50">{{ t('config.landingSpiceHavenCta') }}</h2>
          <p class="mb-8 text-amber-100/80">{{ t('config.landingSpiceHavenCtaDesc') }}</p>
          <RouterLink to="/order">
            <Button size="lg" class="h-12 rounded-none bg-amber-50 px-10 text-stone-900 hover:bg-amber-100">
              {{ t('nav.createTransaction') }}
            </Button>
          </RouterLink>
        </div>
      </section>

      <footer class="border-t border-amber-900/30 bg-stone-950 px-6 py-16">
        <div class="mx-auto max-w-6xl">
          <div class="mb-8 text-center">
            <p class="font-serif text-2xl font-semibold tracking-widest text-amber-400 uppercase">{{ shopName }}</p>
            <p class="mt-2 text-sm text-amber-100/50">Indian Restaurant & Caffe</p>
          </div>
          <div class="grid gap-8 text-center text-sm text-amber-100/70 sm:grid-cols-3">
            <div class="flex flex-col items-center gap-2">
              <MapPin class="size-4 text-amber-500" />
              <span>{{ contactAddress || shopAddress || '—' }}</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Phone class="size-4 text-amber-500" />
              <span>{{ contactPhone || shopPhone || '—' }}</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Mail v-if="contactEmail" class="size-4 text-amber-500" />
              <Clock v-else class="size-4 text-amber-500" />
              <span>{{ contactEmail || t('config.landingDefaultHours') }}</span>
            </div>
          </div>
          <div class="mt-10 flex flex-wrap justify-center gap-6 text-xs tracking-widest text-amber-100/40 uppercase">
            <RouterLink to="/" class="hover:text-amber-400">Home</RouterLink>
            <RouterLink to="/order" class="hover:text-amber-400">{{ t('nav.createTransaction') }}</RouterLink>
            <RouterLink to="/book" class="hover:text-amber-400">{{ t('nav.bookings') }}</RouterLink>
          </div>
        </div>
      </footer>
    </div>
  </ApplicationLayout>
</template>
