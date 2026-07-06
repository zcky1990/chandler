<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight, MapPin, Phone, Star, UtensilsCrossed, Clock } from '@lucide/vue'
import ApplicationLayout from '@/layouts/ApplicationLayout.vue'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/composables/useI18n'
import { getShopConfig } from '@/lib/config'

const { t } = useI18n()
const shopName = ref('Spice Haven')
const shopAddress = ref('')
const shopPhone = ref('')

onMounted(async () => {
  const { config } = await getShopConfig()
  shopName.value = config?.shop_name || 'Spice Haven'
  shopAddress.value = config?.shop_address || ''
})
</script>

<template>
  <ApplicationLayout show-staff-button>
    <div class="w-full">
      <!-- Hero -->
      <section class="relative flex min-h-[90vh] items-center bg-gradient-to-br from-amber-900 via-stone-900 to-amber-950 px-6 py-20 text-white">
        <div class="mx-auto max-w-4xl text-center">
          <p class="mb-3 font-serif text-lg italic text-amber-400">
            &ldquo;{{ t('config.landingSpiceHavenTagline') }}&rdquo;
          </p>
          <h1 class="mb-6 font-serif text-5xl font-bold leading-tight tracking-wide md:text-7xl">
            {{ shopName }}
          </h1>
          <p class="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-amber-100/80">
            {{ t('config.landingSpiceHavenHero') }}
          </p>
          <div class="flex flex-wrap justify-center gap-4">
            <RouterLink to="/order">
              <Button size="lg" class="bg-amber-500 text-stone-900 hover:bg-amber-400">
                <UtensilsCrossed class="mr-2 size-5" />
                {{ t('nav.createTransaction') }}
              </Button>
            </RouterLink>
            <RouterLink to="/book">
              <Button variant="outline" size="lg" class="border-amber-400 text-amber-400 hover:bg-amber-400/10">
                {{ t('nav.bookings') }}
                <ArrowRight class="ml-2 size-5" />
              </Button>
            </RouterLink>
          </div>
        </div>
      </section>

      <!-- Quote -->
      <section class="border-y border-amber-200 bg-amber-50 px-6 py-16 text-center">
        <blockquote class="mx-auto max-w-2xl">
          <p class="mb-4 font-serif text-xl italic text-amber-900">
            &ldquo;{{ t('config.landingSpiceHavenQuote') }}&rdquo;
          </p>
          <div class="flex items-center justify-center gap-1 text-amber-500">
            <Star v-for="i in 5" :key="i" class="size-4 fill-current" />
            <span class="ml-2 text-sm text-amber-700">Google Review</span>
          </div>
        </blockquote>
      </section>

      <!-- Features -->
      <section class="bg-white px-6 py-20">
        <div class="mx-auto max-w-5xl">
          <h2 class="mb-12 text-center font-serif text-3xl font-bold text-stone-800">
            {{ t('config.landingSpiceHavenStory') }}
          </h2>
          <div class="grid gap-8 md:grid-cols-3">
            <div class="text-center">
              <div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full border-2 border-amber-200 bg-amber-50">
                <UtensilsCrossed class="size-7 text-amber-700" />
              </div>
              <h3 class="mb-2 text-lg font-semibold text-stone-800">{{ t('config.landingSpiceHavenFeat1Title') }}</h3>
              <p class="text-sm leading-relaxed text-stone-600">{{ t('config.landingSpiceHavenFeat1Desc') }}</p>
            </div>
            <div class="text-center">
              <div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full border-2 border-amber-200 bg-amber-50">
                <Star class="size-7 text-amber-700" />
              </div>
              <h3 class="mb-2 text-lg font-semibold text-stone-800">{{ t('config.landingSpiceHavenFeat2Title') }}</h3>
              <p class="text-sm leading-relaxed text-stone-600">{{ t('config.landingSpiceHavenFeat2Desc') }}</p>
            </div>
            <div class="text-center">
              <div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full border-2 border-amber-200 bg-amber-50">
                <Clock class="size-7 text-amber-700" />
              </div>
              <h3 class="mb-2 text-lg font-semibold text-stone-800">{{ t('config.landingSpiceHavenFeat3Title') }}</h3>
              <p class="text-sm leading-relaxed text-stone-600">{{ t('config.landingSpiceHavenFeat3Desc') }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="bg-stone-900 px-6 py-20 text-center text-white">
        <h2 class="mb-4 font-serif text-3xl font-bold">{{ t('config.landingSpiceHavenCta') }}</h2>
        <p class="mx-auto mb-8 max-w-xl text-stone-400">{{ t('config.landingSpiceHavenCtaDesc') }}</p>
        <RouterLink to="/order">
          <Button size="lg" class="bg-amber-500 text-stone-900 hover:bg-amber-400">
            {{ t('nav.createTransaction') }}
            <ArrowRight class="ml-2 size-5" />
          </Button>
        </RouterLink>
      </section>

      <!-- Footer info -->
      <section class="border-t border-stone-200 bg-stone-100 px-6 py-10">
        <div class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 text-sm text-stone-700">
          <div class="flex items-center gap-2">
            <MapPin class="size-4" />
            <span>{{ shopAddress || '500 Terry Francine St, San Francisco' }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Phone class="size-4" />
            <span>{{ shopPhone || '123-456-7890' }}</span>
          </div>
          <p class="text-stone-500">Mon&ndash;Sun: 12:00 PM &ndash; 10:30 PM</p>
        </div>
      </section>
    </div>
  </ApplicationLayout>
</template>
