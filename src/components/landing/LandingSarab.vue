<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight, Phone, MapPin, Star, Clock, ChefHat, UtensilsCrossed, Users } from '@lucide/vue'
import ApplicationLayout from '@/layouts/ApplicationLayout.vue'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/composables/useI18n'
import { getShopConfig } from '@/lib/config'

const { t } = useI18n()
const shopName = ref('Sarab')
const shopPhone = ref('')
const shopAddress = ref('')

onMounted(async () => {
  const { config } = await getShopConfig()
  shopName.value = config?.shop_name || 'Sarab'
  shopAddress.value = config?.shop_address || ''
})
</script>

<template>
  <ApplicationLayout show-staff-button>
    <div class="w-full">
      <!-- Hero -->
      <section class="relative flex min-h-[90vh] items-center bg-gradient-to-br from-orange-900 via-orange-800 to-amber-900 px-6 py-20 text-white">
        <div class="mx-auto max-w-6xl text-center">
          <p class="mb-2 text-sm font-medium tracking-widest text-orange-300 uppercase">
            {{ t('config.landingSarabTagline') }}
          </p>
          <h1 class="mb-6 text-5xl font-extrabold leading-tight md:text-7xl">
            {{ shopName }}
          </h1>
          <p class="mx-auto mb-10 max-w-2xl text-lg text-orange-100">
            {{ t('config.landingSarabHero') }}
          </p>
          <div class="flex flex-wrap justify-center gap-4">
            <RouterLink to="/order">
              <Button size="lg" class="bg-white text-orange-900 hover:bg-orange-100">
                <UtensilsCrossed class="mr-2 size-5" />
                {{ t('nav.createTransaction') }}
              </Button>
            </RouterLink>
            <RouterLink to="/book">
              <Button variant="outline" size="lg" class="border-white text-white hover:bg-white/10">
                {{ t('nav.bookings') }}
                <ArrowRight class="ml-2 size-5" />
              </Button>
            </RouterLink>
          </div>
          <div class="mt-16 flex flex-wrap justify-center gap-8 text-sm">
            <div class="flex items-center gap-2">
              <Star class="size-5 text-yellow-400" />
              <span>4.9 / 5 — 2k+ reviews</span>
            </div>
            <div class="flex items-center gap-2">
              <Clock class="size-5 text-orange-300" />
              <span>Fast delivery</span>
            </div>
            <div class="flex items-center gap-2">
              <ChefHat class="size-5 text-orange-300" />
              <span>Premium ingredients</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section class="bg-orange-50 px-6 py-20">
        <div class="mx-auto max-w-6xl">
          <h2 class="mb-12 text-center text-3xl font-bold text-orange-900">{{ t('config.landingSarabFeatures') }}</h2>
          <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div class="rounded-2xl bg-white p-8 text-center shadow-sm">
              <div class="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-orange-100">
                <UtensilsCrossed class="size-7 text-orange-600" />
              </div>
              <h3 class="mb-2 text-lg font-semibold text-orange-900">{{ t('config.landingSarabFeat1Title') }}</h3>
              <p class="text-sm text-orange-700">{{ t('config.landingSarabFeat1Desc') }}</p>
            </div>
            <div class="rounded-2xl bg-white p-8 text-center shadow-sm">
              <div class="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-orange-100">
                <Clock class="size-7 text-orange-600" />
              </div>
              <h3 class="mb-2 text-lg font-semibold text-orange-900">{{ t('config.landingSarabFeat2Title') }}</h3>
              <p class="text-sm text-orange-700">{{ t('config.landingSarabFeat2Desc') }}</p>
            </div>
            <div class="rounded-2xl bg-white p-8 text-center shadow-sm">
              <div class="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-orange-100">
                <Users class="size-7 text-orange-600" />
              </div>
              <h3 class="mb-2 text-lg font-semibold text-orange-900">{{ t('config.landingSarabFeat3Title') }}</h3>
              <p class="text-sm text-orange-700">{{ t('config.landingSarabFeat3Desc') }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="bg-orange-600 px-6 py-20 text-white">
        <div class="mx-auto max-w-3xl text-center">
          <h2 class="mb-4 text-3xl font-bold">{{ t('config.landingSarabCta') }}</h2>
          <p class="mb-8 text-lg text-orange-100">{{ t('config.landingSarabCtaDesc') }}</p>
          <RouterLink to="/order">
            <Button size="lg" class="bg-white text-orange-600 hover:bg-orange-50">
              {{ t('nav.createTransaction') }}
              <ArrowRight class="ml-2 size-5" />
            </Button>
          </RouterLink>
        </div>
      </section>

      <!-- Footer info bar -->
      <section class="border-t border-orange-200 bg-orange-50 px-6 py-10">
        <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-sm text-orange-800">
          <div class="flex items-center gap-2">
            <MapPin class="size-4" />
            <span>{{ shopAddress || '42 Flavor Street, NY' }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Phone class="size-4" />
            <span>{{ shopPhone || '+1 (800) 123-4567' }}</span>
          </div>
        </div>
      </section>
    </div>
  </ApplicationLayout>
</template>
