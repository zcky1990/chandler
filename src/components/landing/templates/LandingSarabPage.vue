<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight, UtensilsCrossed, Clock, MapPin, Phone, Mail, Zap, Award, Leaf } from '@lucide/vue'
import ApplicationLayout from '@/layouts/ApplicationLayout.vue'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/composables/useI18n'
import LandingNav from '@/components/landing/LandingNav.vue'
import LandingConfigurableSections from '@/components/landing/LandingConfigurableSections.vue'
import type { LandingPageProps } from '@/components/landing/landing-page-props'

const props = defineProps<Omit<LandingPageProps, 'template'>>()

const { t } = useI18n()

const displayTitle = computed(() => props.heroTitle || props.shopName)
const displaySubtitle = computed(() => props.heroSubtitle || t('config.landingSarabHero'))
const menuCount = computed(() => props.products.length)
</script>

<template>
  <ApplicationLayout show-staff-button>
    <div class="w-full bg-zinc-950 text-white">
      <div class="border-b border-zinc-800 bg-zinc-900 px-6 py-2 text-xs text-zinc-400">
        <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-4">
            <span v-if="shopPhone" class="flex items-center gap-1.5">
              <Phone class="size-3" />
              {{ shopPhone }}
            </span>
            <span v-if="contactEmail" class="flex items-center gap-1.5">
              <Mail class="size-3" />
              {{ contactEmail }}
            </span>
            <span v-if="shopAddress" class="flex items-center gap-1.5">
              <MapPin class="size-3" />
              {{ shopAddress }}
            </span>
          </div>
          <span class="font-medium text-orange-400">Free Delivery Today!</span>
        </div>
      </div>

      <section class="relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-orange-950/40" />
        <LandingNav variant="sarab" :shop-name="shopName" :accent-color="primaryColor" />
        <div class="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 py-20 lg:flex-row lg:py-28">
          <div class="flex-1 text-center lg:text-left">
            <p class="mb-3 text-sm font-semibold tracking-widest text-orange-400 uppercase">
              {{ t('config.landingSarabTagline') }}
            </p>
            <h1 class="mb-6 text-4xl leading-tight font-extrabold tracking-tight md:text-5xl lg:text-6xl">
              {{ displayTitle }}
            </h1>
            <p class="mb-10 max-w-xl text-lg leading-relaxed text-zinc-400">
              {{ displaySubtitle }}
            </p>
            <div class="flex flex-wrap justify-center gap-4 lg:justify-start">
              <RouterLink to="/order">
                <Button
                  size="lg"
                  class="h-12 rounded-full px-8 font-semibold"
                  :style="{ backgroundColor: primaryColor, color: '#fff' }"
                >
                  {{ t('nav.createTransaction') }}
                </Button>
              </RouterLink>
              <RouterLink to="/book">
                <Button variant="outline" size="lg" class="h-12 rounded-full border-zinc-600 px-8 text-white hover:bg-zinc-800">
                  {{ t('nav.bookings') }}
                  <ArrowRight class="ml-2 size-5" />
                </Button>
              </RouterLink>
            </div>
            <div class="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
              <div>
                <p class="text-2xl font-bold text-orange-400">850+</p>
                <p class="text-xs text-zinc-500">Happy Customers</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-orange-400">{{ menuCount }}+</p>
                <p class="text-xs text-zinc-500">Menu Items</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-orange-400">15+</p>
                <p class="text-xs text-zinc-500">Expert Chefs</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-orange-400">12 yr</p>
                <p class="text-xs text-zinc-500">Experience</p>
              </div>
            </div>
          </div>
          <div class="flex-1">
            <img
              v-if="heroImageUrl"
              :src="heroImageUrl"
              :alt="displayTitle"
              class="mx-auto w-full max-w-lg rounded-2xl object-cover shadow-2xl ring-2 ring-orange-500/30"
            />
            <div
              v-else
              class="mx-auto flex aspect-[4/3] w-full max-w-lg items-center justify-center rounded-2xl bg-zinc-800 ring-2 ring-orange-500/30"
            >
              <UtensilsCrossed class="size-20 text-zinc-600" />
            </div>
          </div>
        </div>
      </section>

      <section class="border-y border-zinc-800 bg-zinc-900 px-6 py-16">
        <div class="mx-auto max-w-6xl">
          <p class="mb-2 text-center text-sm font-semibold tracking-widest text-orange-400 uppercase">
            {{ t('config.landingSarabFeatures') }}
          </p>
          <div class="mt-8 grid gap-6 sm:grid-cols-3">
            <div class="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <Leaf class="mb-4 size-8 text-orange-400" />
              <h3 class="mb-2 font-semibold">{{ t('config.landingSarabFeat1Title') }}</h3>
              <p class="text-sm text-zinc-400">{{ t('config.landingSarabFeat1Desc') }}</p>
            </div>
            <div class="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <Zap class="mb-4 size-8 text-orange-400" />
              <h3 class="mb-2 font-semibold">{{ t('config.landingSarabFeat2Title') }}</h3>
              <p class="text-sm text-zinc-400">{{ t('config.landingSarabFeat2Desc') }}</p>
            </div>
            <div class="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <Award class="mb-4 size-8 text-orange-400" />
              <h3 class="mb-2 font-semibold">{{ t('config.landingSarabFeat3Title') }}</h3>
              <p class="text-sm text-zinc-400">{{ t('config.landingSarabFeat3Desc') }}</p>
            </div>
          </div>
        </div>
      </section>

      <LandingConfigurableSections v-bind="props" />

      <section class="px-6 py-20" :style="{ background: `linear-gradient(135deg, ${primaryColor} 0%, color-mix(in srgb, ${primaryColor} 60%, #000) 100%)` }">
        <div class="mx-auto max-w-3xl text-center">
          <h2 class="mb-4 text-3xl font-bold">{{ t('config.landingSarabCta') }}</h2>
          <p class="mb-8 text-lg text-orange-100">{{ t('config.landingSarabCtaDesc') }}</p>
          <RouterLink to="/order">
            <Button size="lg" class="h-12 rounded-full bg-white px-8 font-semibold text-zinc-900 hover:bg-orange-50">
              {{ t('nav.createTransaction') }}
              <ArrowRight class="ml-2 size-5" />
            </Button>
          </RouterLink>
        </div>
      </section>

      <section class="border-t border-zinc-800 bg-zinc-900 px-6 py-10">
        <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-sm text-zinc-400">
          <div class="flex items-center gap-2">
            <MapPin class="size-4 text-orange-400" />
            <span>{{ shopAddress || contactAddress || '—' }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Phone class="size-4 text-orange-400" />
            <span>{{ shopPhone || contactPhone || '—' }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Clock class="size-4 text-orange-400" />
            <span>{{ t('config.landingDefaultHours') }}</span>
          </div>
        </div>
      </section>
    </div>
  </ApplicationLayout>
</template>
