<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight, MapPin, Phone, Star, UtensilsCrossed, Users, Clock, CalendarDays } from '@lucide/vue'
import ApplicationLayout from '@/layouts/ApplicationLayout.vue'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/composables/useI18n'
import { getShopConfig } from '@/lib/config'

const { t } = useI18n()
const shopName = ref('Yummy')
const shopAddress = ref('')
const shopPhone = ref('')

onMounted(async () => {
  const { config } = await getShopConfig()
  shopName.value = config?.shop_name || 'Yummy'
  shopAddress.value = config?.shop_address || ''
})
</script>

<template>
  <ApplicationLayout show-staff-button>
    <div class="w-full">
      <!-- Hero -->
      <section class="relative flex min-h-[90vh] items-center bg-gradient-to-br from-red-800 via-red-700 to-rose-800 px-6 py-20 text-white">
        <div class="mx-auto max-w-5xl text-center">
          <h1 class="mb-6 text-5xl font-extrabold md:text-7xl">
            {{ t('config.landingYummyHero') }}
            <span class="block text-red-200">{{ shopName }}</span>
          </h1>
          <p class="mx-auto mb-10 max-w-xl text-lg text-red-100">
            {{ t('config.landingYummyHeroDesc') }}
          </p>
          <div class="flex flex-wrap justify-center gap-4">
            <RouterLink to="/order">
              <Button size="lg" class="bg-white text-red-700 hover:bg-red-50">
                <UtensilsCrossed class="mr-2 size-5" />
                {{ t('nav.createTransaction') }}
              </Button>
            </RouterLink>
            <RouterLink to="/book">
              <Button variant="outline" size="lg" class="border-white text-white hover:bg-white/10">
                <CalendarDays class="mr-2 size-5" />
                {{ t('nav.bookings') }}
              </Button>
            </RouterLink>
          </div>
        </div>
      </section>

      <!-- Stats -->
      <section class="bg-red-600 px-6 py-12 text-white">
        <div class="mx-auto grid max-w-4xl grid-cols-2 gap-8 text-center sm:grid-cols-4">
          <div>
            <p class="text-3xl font-bold">850+</p>
            <p class="text-sm text-red-200">{{ t('config.landingYummyStat1') }}</p>
          </div>
          <div>
            <p class="text-3xl font-bold">120+</p>
            <p class="text-sm text-red-200">{{ t('config.landingYummyStat2') }}</p>
          </div>
          <div>
            <p class="text-3xl font-bold">15+</p>
            <p class="text-sm text-red-200">{{ t('config.landingYummyStat3') }}</p>
          </div>
          <div>
            <p class="text-3xl font-bold">12yr</p>
            <p class="text-sm text-red-200">{{ t('config.landingYummyStat4') }}</p>
          </div>
        </div>
      </section>

      <!-- About -->
      <section class="bg-white px-6 py-20">
        <div class="mx-auto max-w-4xl text-center">
          <p class="mb-2 text-sm font-semibold tracking-widest text-red-500 uppercase">{{ t('config.landingYummyAbout') }}</p>
          <h2 class="mb-6 text-3xl font-bold text-stone-800">{{ t('config.landingYummyAboutTitle') }}</h2>
          <p class="mx-auto mb-10 max-w-2xl leading-relaxed text-stone-600">
            {{ t('config.landingYummyAboutDesc') }}
          </p>
          <div class="grid gap-6 sm:grid-cols-3">
            <div class="rounded-xl border border-red-100 bg-red-50 p-6">
              <UtensilsCrossed class="mx-auto mb-3 size-8 text-red-500" />
              <h3 class="mb-1 font-semibold text-stone-800">{{ t('config.landingYummyFeat1Title') }}</h3>
              <p class="text-sm text-stone-500">{{ t('config.landingYummyFeat1Desc') }}</p>
            </div>
            <div class="rounded-xl border border-red-100 bg-red-50 p-6">
              <Users class="mx-auto mb-3 size-8 text-red-500" />
              <h3 class="mb-1 font-semibold text-stone-800">{{ t('config.landingYummyFeat2Title') }}</h3>
              <p class="text-sm text-stone-500">{{ t('config.landingYummyFeat2Desc') }}</p>
            </div>
            <div class="rounded-xl border border-red-100 bg-red-50 p-6">
              <Star class="mx-auto mb-3 size-8 text-red-500" />
              <h3 class="mb-1 font-semibold text-stone-800">{{ t('config.landingYummyFeat3Title') }}</h3>
              <p class="text-sm text-stone-500">{{ t('config.landingYummyFeat3Desc') }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="bg-red-700 px-6 py-20 text-center text-white">
        <h2 class="mb-4 text-3xl font-bold">{{ t('config.landingYummyCta') }}</h2>
        <p class="mx-auto mb-8 max-w-lg text-red-200">{{ t('config.landingYummyCtaDesc') }}</p>
        <RouterLink to="/order">
          <Button size="lg" class="bg-white text-red-700 hover:bg-red-50">
            <ArrowRight class="mr-2 size-5" />
            {{ t('nav.createTransaction') }}
          </Button>
        </RouterLink>
      </section>

      <!-- Footer info -->
      <section class="border-t border-red-100 bg-red-50 px-6 py-10">
        <div class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 text-sm text-red-900">
          <div class="flex items-center gap-2">
            <MapPin class="size-4" />
            <span>{{ shopAddress || 'A108 Adam Street, New York, NY' }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Phone class="size-4" />
            <span>{{ shopPhone || '+1 5589 55488 55' }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Clock class="size-4" />
            <span>Mon&ndash;Sat: 11AM &ndash; 23PM</span>
          </div>
        </div>
      </section>
    </div>
  </ApplicationLayout>
</template>
