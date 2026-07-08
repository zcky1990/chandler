<script setup lang="ts">
import { ChevronDown, ImageIcon, Plus, Star, Trash2, Upload, User } from '@lucide/vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import LandingSectionBgFields from './LandingSectionBgFields.vue'
import { useI18n } from '@/composables/useI18n'
import type { LandingFeatureItem, LandingServiceItem, LandingStatItem, LandingTestimonial } from '@/types/database'

const { t } = useI18n()

interface TemplateOption {
  id: string
  name: string
  desc: string
  thumb: string
  color: string | null
}

const props = defineProps<{
  templateOptions: TemplateOption[]
  landingTemplate: string
  landingHeroImage: string | null
  landingHeroTitle: string
  landingHeroSubtitle: string
  landingHeroTagline: string
  landingPrimaryColor: string
  landingHeroBgColor: string
  landingHeroBgImage: string
  landingHeroPreview: string | null
  isUploadingLandingHero: boolean
  isRemovingLandingHero: boolean
  isSavingLanding: boolean
  landingCarouselEnabled: boolean
  landingCarouselMaxItems: number
  landingCarouselTitle: string
  landingCarouselBgColor: string
  landingCarouselBgImage: string
  landingTestimonialsEnabled: boolean
  landingTestimonialsTitle: string
  landingTestimonialsData: LandingTestimonial[]
  landingTestimonialsBgColor: string
  landingTestimonialsBgImage: string
  landingServicesEnabled: boolean
  landingServicesTitle: string
  landingServicesSubtitle: string
  landingServicesWhatsapp: string
  landingServicesData: LandingServiceItem[]
  landingServicesBgColor: string
  landingServicesBgImage: string
  landingGalleryEnabled: boolean
  landingGalleryTitle: string
  landingGallerySubtitle: string
  landingGalleryImages: string[]
  landingGalleryBgColor: string
  landingGalleryBgImage: string
  landingContactEnabled: boolean
  landingContactTitle: string
  landingContactSubtitle: string
  landingContactAddress: string
  landingContactPhone: string
  landingContactEmail: string
  landingContactMapLat: number
  landingContactMapLng: number
  landingContactMapZoom: number
  landingContactBgColor: string
  landingContactBgImage: string
  landingAboutEnabled: boolean
  landingAboutLabel: string
  landingAboutTitle: string
  landingAboutDescription: string
  landingAboutImage: string | null
  landingAboutPreview: string | null
  landingAboutBullets: string[]
  landingAboutBgColor: string
  landingAboutBgImage: string
  isUploadingLandingAbout: boolean
  isRemovingLandingAbout: boolean
  landingWhyEnabled: boolean
  landingWhyLabel: string
  landingWhyTitle: string
  landingWhyDescription: string
  landingWhyFeatures: LandingFeatureItem[]
  landingWhyStats: LandingStatItem[]
  landingWhyBgColor: string
  landingWhyBgImage: string
  landingBookBgColor: string
  landingBookBgImage: string
  landingNavLogoUrl: string | null
  landingNavLogoPreview: string | null
  isUploadingNavLogo: boolean
  isRemovingNavLogo: boolean
  landingAccordion: Record<string, boolean>
}>()

const emit = defineEmits<{
  'update:landingTemplate': [value: string]
  'update:landingHeroTitle': [value: string]
  'update:landingHeroSubtitle': [value: string]
  'update:landingHeroTagline': [value: string]
  'update:landingPrimaryColor': [value: string]
  'update:landingHeroBgColor': [value: string]
  'update:landingHeroBgImage': [value: string]
  'update:landingCarouselEnabled': [value: boolean]
  'update:landingCarouselMaxItems': [value: number]
  'update:landingCarouselTitle': [value: string]
  'update:landingCarouselBgColor': [value: string]
  'update:landingCarouselBgImage': [value: string]
  'update:landingTestimonialsEnabled': [value: boolean]
  'update:landingTestimonialsTitle': [value: string]
  'update:landingTestimonialsBgColor': [value: string]
  'update:landingTestimonialsBgImage': [value: string]
  'update:landingServicesEnabled': [value: boolean]
  'update:landingServicesTitle': [value: string]
  'update:landingServicesSubtitle': [value: string]
  'update:landingServicesWhatsapp': [value: string]
  'update:landingServicesBgColor': [value: string]
  'update:landingServicesBgImage': [value: string]
  'update:landingGalleryEnabled': [value: boolean]
  'update:landingGalleryTitle': [value: string]
  'update:landingGallerySubtitle': [value: string]
  'update:landingGalleryBgColor': [value: string]
  'update:landingGalleryBgImage': [value: string]
  'update:landingContactEnabled': [value: boolean]
  'update:landingContactTitle': [value: string]
  'update:landingContactSubtitle': [value: string]
  'update:landingContactAddress': [value: string]
  'update:landingContactPhone': [value: string]
  'update:landingContactEmail': [value: string]
  'update:landingContactMapLat': [value: number]
  'update:landingContactMapLng': [value: number]
  'update:landingContactMapZoom': [value: number]
  'update:landingContactBgColor': [value: string]
  'update:landingContactBgImage': [value: string]
  'update:landingAboutEnabled': [value: boolean]
  'update:landingAboutLabel': [value: string]
  'update:landingAboutTitle': [value: string]
  'update:landingAboutDescription': [value: string]
  'update:landingAboutBgColor': [value: string]
  'update:landingAboutBgImage': [value: string]
  'update:landingWhyEnabled': [value: boolean]
  'update:landingWhyLabel': [value: string]
  'update:landingWhyTitle': [value: string]
  'update:landingWhyDescription': [value: string]
  'update:landingWhyBgColor': [value: string]
  'update:landingWhyBgImage': [value: string]
  'update:landingBookBgColor': [value: string]
  'update:landingBookBgImage': [value: string]
  toggleAccordion: [key: string]
  uploadNavLogo: [event: Event]
  removeNavLogo: []
  uploadLandingHero: [event: Event]
  removeLandingHero: []
  uploadLandingAbout: [event: Event]
  removeLandingAbout: []
  addAboutBullet: []
  removeAboutBullet: [index: number]
  addWhyFeature: []
  removeWhyFeature: [index: number]
  addWhyStat: []
  removeWhyStat: [index: number]
  addTestimonial: []
  removeTestimonial: [index: number]
  uploadTestimonialAvatar: [event: Event, index: number]
  removeTestimonialAvatar: [index: number]
  addServiceItem: []
  removeServiceItem: [index: number]
  uploadServiceImage: [event: Event, index: number]
  removeServiceImage: [index: number]
  addGalleryImage: []
  removeGalleryImage: [index: number]
  uploadGalleryImage: [event: Event, index: number]
  saveLanding: []
}>()
</script>

<template>
  <form class="max-w-3xl space-y-4" @submit.prevent="$emit('saveLanding')">
    <!-- Template Picker -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <label
        v-for="tpl in templateOptions"
        :key="tpl.id"
        class="cursor-pointer rounded-xl border-2 p-4 transition-all"
        :class="landingTemplate === tpl.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-transparent bg-muted/30 hover:border-muted-foreground/30'"
      >
        <input type="radio" :value="tpl.id" class="sr-only" :checked="landingTemplate === tpl.id" @change="$emit('update:landingTemplate', tpl.id)">
        <div class="mb-3 flex h-24 items-center justify-center rounded-lg overflow-hidden" :class="tpl.color">
          <img v-if="tpl.thumb" :src="tpl.thumb" :alt="tpl.name" class="h-full w-full object-cover">
          <span v-else class="text-lg font-bold text-white">{{ tpl.name }}</span>
        </div>
        <p class="text-sm font-medium">{{ tpl.name }}</p>
        <p class="text-xs text-muted-foreground">{{ tpl.desc }}</p>
      </label>
    </div>

    <!-- Hero Section -->
    <div class="rounded-lg border bg-background">
      <button type="button" class="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors" @click="$emit('toggleAccordion', 'hero')">
        <span class="flex items-center gap-3">
          <span class="text-sm font-medium">{{ t('config.landingHeroSection') }}</span>
        </span>
        <ChevronDown class="size-4 shrink-0 text-muted-foreground transition-transform" :class="{ 'rotate-180': landingAccordion.hero }" />
      </button>
      <div v-show="landingAccordion.hero" class="space-y-4 px-4 pb-4">
        <p class="text-xs text-muted-foreground">{{ t('config.landingHeroSectionDesc') }}</p>
        <div>
          <FieldLabel>{{ t('config.landingHeroImage') }}</FieldLabel>
          <div class="mt-1 flex min-h-[120px] items-center justify-center rounded-xl border border-dashed bg-muted/30 p-4">
            <img v-if="landingHeroPreview" :src="landingHeroPreview" alt="Hero" class="max-h-48 max-w-full rounded-lg object-cover">
            <div v-else class="text-center text-sm text-muted-foreground">
              <ImageIcon class="mx-auto mb-2 size-8 opacity-50" />
              {{ t('config.landingHeroImagePlaceholder') }}
            </div>
          </div>
          <div class="mt-3 flex flex-wrap gap-2">
            <Button as-child :disabled="isUploadingLandingHero">
              <label class="cursor-pointer">
                <Upload class="size-4" />
                {{ isUploadingLandingHero ? t('config.uploading') : t('config.uploadImage') }}
                <input type="file" accept="image/webp" class="hidden" :disabled="isUploadingLandingHero" @change="$emit('uploadLandingHero', $event)">
              </label>
            </Button>
            <Button v-if="landingHeroPreview" variant="outline" :disabled="isRemovingLandingHero" @click="$emit('removeLandingHero')">
              <Trash2 class="size-4" /> {{ t('common.delete') }}
            </Button>
          </div>
          <p class="mt-1 text-xs text-muted-foreground">{{ t('config.imageMustBeWebp') }}</p>
        </div>
        <Field>
          <FieldLabel for="landing-hero-title">{{ t('config.landingHeroTitle') }}</FieldLabel>
          <Input id="landing-hero-title" :model-value="landingHeroTitle" @update:model-value="$emit('update:landingHeroTitle', $event)" :placeholder="t('config.landingHeroTitleHint')" />
        </Field>
        <Field>
          <FieldLabel for="landing-hero-subtitle">{{ t('config.landingHeroSubtitle') }}</FieldLabel>
          <Input id="landing-hero-subtitle" :model-value="landingHeroSubtitle" @update:model-value="$emit('update:landingHeroSubtitle', $event)" :placeholder="t('config.landingHeroSubtitleHint')" />
        </Field>
        <Field>
          <FieldLabel for="landing-hero-tagline">{{ t('config.landingHeroTagline') }}</FieldLabel>
          <Input id="landing-hero-tagline" :model-value="landingHeroTagline" @update:model-value="$emit('update:landingHeroTagline', $event)" :placeholder="t('config.landingHeroTaglineHint')" />
        </Field>
        <Field>
          <FieldLabel for="landing-primary-color">{{ t('config.landingPrimaryColor') }}</FieldLabel>
          <div class="flex items-center gap-3">
            <Input id="landing-primary-color" :model-value="landingPrimaryColor" @update:model-value="$emit('update:landingPrimaryColor', $event)" type="color" class="size-10 cursor-pointer border-0 p-1" />
            <span class="text-sm text-muted-foreground">{{ landingPrimaryColor }}</span>
          </div>
        </Field>
        <LandingSectionBgFields
          :bg-color="landingHeroBgColor" @update:bg-color="$emit('update:landingHeroBgColor', $event)"
          :bg-image="landingHeroBgImage" @update:bg-image="$emit('update:landingHeroBgImage', $event)"
          color-id="landing-hero-bg-color" image-id="landing-hero-bg-image"
          :color-label="t('config.landingHeroBgColor')" section-key="hero"
        />

        <div class="border-t pt-4">
          <FieldLabel>{{ t('config.navLogo') }}</FieldLabel>
          <p class="mb-2 text-xs text-muted-foreground">{{ t('config.navLogoDesc') }}</p>
          <div class="flex flex-wrap items-center gap-3">
            <div v-if="landingNavLogoPreview" class="relative size-12 overflow-hidden rounded-lg border">
              <img :src="landingNavLogoPreview" alt="Nav Logo" class="size-full object-contain">
            </div>
            <div v-else class="flex size-12 items-center justify-center rounded-lg border bg-muted">
              <ImageIcon class="size-6 text-muted-foreground" />
            </div>
            <Button as-child :disabled="isUploadingNavLogo">
              <label class="cursor-pointer">
                {{ isUploadingNavLogo ? t('config.uploading') : t('config.uploadImage') }}
                <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" class="hidden" :disabled="isUploadingNavLogo" @change="$emit('uploadNavLogo', $event)">
              </label>
            </Button>
            <Button v-if="landingNavLogoPreview" variant="outline" type="button" :disabled="isRemovingNavLogo" @click="$emit('removeNavLogo')">
              <Trash2 class="size-4" /> {{ t('common.delete') }}
            </Button>
          </div>
          <p class="mt-1 text-xs text-muted-foreground">{{ t('config.imageFormat') }}</p>
        </div>
      </div>
    </div>

    <!-- About Section -->
    <div class="rounded-lg border bg-background">
      <button type="button" class="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors" @click="$emit('toggleAccordion', 'about')">
        <span class="flex items-center gap-3">
          <Switch :model-value="landingAboutEnabled" @update:model-value="$emit('update:landingAboutEnabled', $event)" @click.stop />
          <span class="font-medium">{{ t('config.landingAboutEnable') }}</span>
        </span>
        <ChevronDown class="size-4 shrink-0 text-muted-foreground transition-transform" :class="{ 'rotate-180': landingAccordion.about }" />
      </button>
      <div v-show="landingAccordion.about" class="space-y-4 px-4 pb-4">
        <template v-if="landingAboutEnabled">
          <Field>
            <FieldLabel for="landing-about-label">{{ t('config.landingAboutLabel') }}</FieldLabel>
            <Input id="landing-about-label" :model-value="landingAboutLabel" @update:model-value="$emit('update:landingAboutLabel', $event)" :placeholder="t('config.landingYummyAbout')" />
          </Field>
          <Field>
            <FieldLabel for="landing-about-title">{{ t('config.landingAboutTitle') }}</FieldLabel>
            <Input id="landing-about-title" :model-value="landingAboutTitle" @update:model-value="$emit('update:landingAboutTitle', $event)" :placeholder="t('config.landingYummyAboutTitle')" />
          </Field>
          <Field>
            <FieldLabel for="landing-about-description">{{ t('config.landingAboutDescription') }}</FieldLabel>
            <textarea id="landing-about-description" :value="landingAboutDescription" @input="$emit('update:landingAboutDescription', ($event.target as HTMLTextAreaElement).value)" class="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" :placeholder="t('config.landingYummyAboutDesc')" />
          </Field>
          <Field>
            <FieldLabel>{{ t('config.landingAboutImage') }}</FieldLabel>
            <div class="flex flex-wrap items-center gap-3">
              <div v-if="landingAboutPreview" class="relative size-24 overflow-hidden rounded-lg border">
                <img :src="landingAboutPreview" alt="About" class="size-full object-cover">
              </div>
              <div v-else class="flex size-24 items-center justify-center rounded-lg border bg-muted">
                <ImageIcon class="size-8 text-muted-foreground" />
              </div>
              <Button as-child :disabled="isUploadingLandingAbout">
                <label class="cursor-pointer">
                  {{ isUploadingLandingAbout ? t('config.uploading') : t('config.uploadImage') }}
                  <input type="file" accept="image/webp" class="hidden" :disabled="isUploadingLandingAbout" @change="$emit('uploadLandingAbout', $event)">
                </label>
              </Button>
              <Button v-if="landingAboutPreview" variant="outline" type="button" :disabled="isRemovingLandingAbout" @click="$emit('removeLandingAbout')">
                {{ t('common.delete') }}
              </Button>
            </div>
          </Field>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium">{{ t('config.landingAboutBullets') }}</p>
              <Button size="sm" variant="outline" type="button" @click="$emit('addAboutBullet')"><Plus class="size-4" /> {{ t('common.add') }}</Button>
            </div>
            <div v-for="(bullet, idx) in landingAboutBullets" :key="idx" class="flex items-center gap-2">
              <Input :model-value="bullet" @update:model-value="landingAboutBullets[idx] = $event" :placeholder="t('config.landingAboutBulletsHint')" />
              <Button size="icon" variant="ghost" type="button" @click="$emit('removeAboutBullet', idx)"><Trash2 class="size-4 text-red-500" /></Button>
            </div>
          </div>
          <LandingSectionBgFields
            :bg-color="landingAboutBgColor" @update:bg-color="$emit('update:landingAboutBgColor', $event)"
            :bg-image="landingAboutBgImage" @update:bg-image="$emit('update:landingAboutBgImage', $event)"
            color-id="landing-about-bg" image-id="landing-about-bg-image"
            :color-label="t('config.landingAboutBgColor')" section-key="about"
          />
        </template>
      </div>
    </div>

    <!-- Why Section -->
    <div class="rounded-lg border bg-background">
      <button type="button" class="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors" @click="$emit('toggleAccordion', 'why')">
        <span class="flex items-center gap-3">
          <Switch :model-value="landingWhyEnabled" @update:model-value="$emit('update:landingWhyEnabled', $event)" @click.stop />
          <span class="font-medium">{{ t('config.landingWhyEnable') }}</span>
        </span>
        <ChevronDown class="size-4 shrink-0 text-muted-foreground transition-transform" :class="{ 'rotate-180': landingAccordion.why }" />
      </button>
      <div v-show="landingAccordion.why" class="space-y-4 px-4 pb-4">
        <template v-if="landingWhyEnabled">
          <Field>
            <FieldLabel for="landing-why-label">{{ t('config.landingWhyLabel') }}</FieldLabel>
            <Input id="landing-why-label" :model-value="landingWhyLabel" @update:model-value="$emit('update:landingWhyLabel', $event)" :placeholder="t('config.landingYummyWhyChoose')" />
          </Field>
          <Field>
            <FieldLabel for="landing-why-title">{{ t('config.landingWhyTitle') }}</FieldLabel>
            <Input id="landing-why-title" :model-value="landingWhyTitle" @update:model-value="$emit('update:landingWhyTitle', $event)" :placeholder="t('config.landingYummyWhyChoose')" />
          </Field>
          <Field>
            <FieldLabel for="landing-why-description">{{ t('config.landingWhyDescription') }}</FieldLabel>
            <textarea id="landing-why-description" :value="landingWhyDescription" @input="$emit('update:landingWhyDescription', ($event.target as HTMLTextAreaElement).value)" class="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" :placeholder="t('config.landingYummyWhyChooseDesc')" />
          </Field>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium">{{ t('config.landingWhyFeatures') }}</p>
              <Button size="sm" variant="outline" type="button" @click="$emit('addWhyFeature')"><Plus class="size-4" /> {{ t('common.add') }}</Button>
            </div>
            <div v-for="(feature, idx) in landingWhyFeatures" :key="idx" class="rounded-lg border p-3 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-muted-foreground">{{ t('config.landingWhyFeatureItem', { n: idx + 1 }) }}</span>
                <Button size="icon" variant="ghost" type="button" @click="$emit('removeWhyFeature', idx)"><Trash2 class="size-4 text-red-500" /></Button>
              </div>
              <Input :model-value="feature.title" @update:model-value="landingWhyFeatures[idx].title = $event" :placeholder="t('config.landingYummyFeat1Title')" />
              <textarea :value="feature.description" @input="landingWhyFeatures[idx].description = ($event.target as HTMLTextAreaElement).value" class="flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" :placeholder="t('config.landingYummyFeat1Desc')" />
            </div>
          </div>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium">{{ t('config.landingWhyStats') }}</p>
              <Button size="sm" variant="outline" type="button" @click="$emit('addWhyStat')"><Plus class="size-4" /> {{ t('common.add') }}</Button>
            </div>
            <p class="text-xs text-muted-foreground">{{ t('config.landingWhyStatsHint') }}</p>
            <div v-for="(stat, idx) in landingWhyStats" :key="idx" class="grid gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_auto]">
              <Input :model-value="stat.value" @update:model-value="landingWhyStats[idx].value = $event" :placeholder="t('config.landingWhyStatValue')" />
              <Input :model-value="stat.label" @update:model-value="landingWhyStats[idx].label = $event" :placeholder="t('config.landingWhyStatLabel')" />
              <Button size="icon" variant="ghost" type="button" @click="$emit('removeWhyStat', idx)"><Trash2 class="size-4 text-red-500" /></Button>
            </div>
          </div>
          <LandingSectionBgFields
            :bg-color="landingWhyBgColor" @update:bg-color="$emit('update:landingWhyBgColor', $event)"
            :bg-image="landingWhyBgImage" @update:bg-image="$emit('update:landingWhyBgImage', $event)"
            color-id="landing-why-bg" image-id="landing-why-bg-image"
            :color-label="t('config.landingWhyBgColor')" section-key="why"
          />
        </template>
      </div>
    </div>

    <!-- Carousel Section -->
    <div class="rounded-lg border bg-background">
      <button type="button" class="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors" @click="$emit('toggleAccordion', 'carousel')">
        <span class="flex items-center gap-3">
          <Switch :model-value="landingCarouselEnabled" @update:model-value="$emit('update:landingCarouselEnabled', $event)" @click.stop />
          <span class="font-medium">{{ t('config.landingCarouselEnable') }}</span>
        </span>
        <ChevronDown class="size-4 shrink-0 text-muted-foreground transition-transform" :class="{ 'rotate-180': landingAccordion.carousel }" />
      </button>
      <div v-show="landingAccordion.carousel" class="space-y-4 px-4 pb-4">
        <template v-if="landingCarouselEnabled">
          <Field>
            <FieldLabel for="landing-carousel-title">{{ t('config.landingCarouselTitle') }}</FieldLabel>
            <Input id="landing-carousel-title" :model-value="landingCarouselTitle" @update:model-value="$emit('update:landingCarouselTitle', $event)" :placeholder="t('config.landingCarouselTitleHint')" />
          </Field>
          <Field>
            <FieldLabel for="landing-carousel-max">{{ t('config.landingCarouselMaxItems') }}</FieldLabel>
            <Input id="landing-carousel-max" :model-value="landingCarouselMaxItems.toString()" @update:model-value="$emit('update:landingCarouselMaxItems', Number($event))" type="number" min="4" max="20" />
            <p class="mt-1 text-xs text-muted-foreground">{{ t('config.landingCarouselMaxItemsDesc') }}</p>
          </Field>
          <LandingSectionBgFields
            :bg-color="landingCarouselBgColor" @update:bg-color="$emit('update:landingCarouselBgColor', $event)"
            :bg-image="landingCarouselBgImage" @update:bg-image="$emit('update:landingCarouselBgImage', $event)"
            color-id="landing-carousel-bg" image-id="landing-carousel-bg-image"
            :color-label="t('config.landingCarouselBgColor')" section-key="carousel"
          />
        </template>
      </div>
    </div>

    <!-- Testimonials Section -->
    <div class="rounded-lg border bg-background">
      <button type="button" class="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors" @click="$emit('toggleAccordion', 'testimonials')">
        <span class="flex items-center gap-3">
          <Switch :model-value="landingTestimonialsEnabled" @update:model-value="$emit('update:landingTestimonialsEnabled', $event)" @click.stop />
          <span class="font-medium">{{ t('config.landingTestimonialsEnable') }}</span>
        </span>
        <ChevronDown class="size-4 shrink-0 text-muted-foreground transition-transform" :class="{ 'rotate-180': landingAccordion.testimonials }" />
      </button>
      <div v-show="landingAccordion.testimonials" class="space-y-4 px-4 pb-4">
        <template v-if="landingTestimonialsEnabled">
          <Field>
            <FieldLabel for="landing-testimonials-title">{{ t('config.landingTestimonialsTitle') }}</FieldLabel>
            <Input id="landing-testimonials-title" :model-value="landingTestimonialsTitle" @update:model-value="$emit('update:landingTestimonialsTitle', $event)" :placeholder="t('config.landingTestimonialsTitleHint')" />
          </Field>
          <LandingSectionBgFields
            :bg-color="landingTestimonialsBgColor" @update:bg-color="$emit('update:landingTestimonialsBgColor', $event)"
            :bg-image="landingTestimonialsBgImage" @update:bg-image="$emit('update:landingTestimonialsBgImage', $event)"
            color-id="landing-testimonials-bg" image-id="landing-testimonials-bg-image"
            :color-label="t('config.landingTestimonialsBgColor')" section-key="testimonials"
          />
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium">{{ t('config.landingTestimonialsItems') }}</p>
              <Button size="sm" variant="outline" type="button" @click="$emit('addTestimonial')"><Plus class="size-4" /> {{ t('common.add') }}</Button>
            </div>
            <div v-for="(item, idx) in landingTestimonialsData" :key="idx" class="rounded-lg border p-3 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-muted-foreground">{{ t('config.landingTestimonialItem', { n: idx + 1 }) }}</span>
                <Button size="icon" variant="ghost" class="size-8" type="button" @click="$emit('removeTestimonial', idx)"><Trash2 class="size-4 text-red-500" /></Button>
              </div>
              <div class="flex items-center gap-3">
                <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <img v-if="item.avatar_url" :src="item.avatar_url" alt="Avatar" class="size-10 rounded-full object-cover">
                  <User v-else class="size-5 text-muted-foreground" />
                </div>
                <div class="flex gap-1.5">
                  <Button as-child size="sm" variant="outline" type="button">
                    <label class="cursor-pointer">
                      <Upload class="size-3.5" /><span class="ml-1 text-xs">{{ t('config.uploadImage') }}</span>
                      <input type="file" accept="image/webp" class="hidden" @change="$emit('uploadTestimonialAvatar', $event, idx)">
                    </label>
                  </Button>
                  <Button v-if="item.avatar_url" size="sm" variant="ghost" type="button" @click="$emit('removeTestimonialAvatar', idx)"><Trash2 class="size-3.5 text-red-500" /></Button>
                </div>
              </div>
              <Field>
                <FieldLabel class="text-xs">{{ t('config.landingTestimonialName') }}</FieldLabel>
                <Input :model-value="item.name" @update:model-value="landingTestimonialsData[idx].name = $event" :placeholder="t('config.landingTestimonialNamePh')" class="h-8 text-sm" />
              </Field>
              <Field>
                <FieldLabel class="text-xs">{{ t('config.landingTestimonialRole') }}</FieldLabel>
                <Input :model-value="item.role" @update:model-value="landingTestimonialsData[idx].role = $event" :placeholder="t('config.landingTestimonialRolePh')" class="h-8 text-sm" />
              </Field>
              <Field>
                <FieldLabel class="text-xs">{{ t('config.landingTestimonialText') }}</FieldLabel>
                <textarea :value="item.text" @input="landingTestimonialsData[idx].text = ($event.target as HTMLTextAreaElement).value" class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" rows="3" :placeholder="t('config.landingTestimonialTextPh')" />
              </Field>
              <Field>
                <FieldLabel class="text-xs">{{ t('config.landingTestimonialRating') }}</FieldLabel>
                <div class="flex gap-1">
                  <button v-for="i in 5" :key="i" type="button" class="size-6" @click="landingTestimonialsData[idx].rating = i">
                    <Star class="size-5 transition-colors" :class="i <= item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'" />
                  </button>
                </div>
              </Field>
            </div>
            <p v-if="landingTestimonialsData.length === 0" class="text-xs text-muted-foreground py-2 text-center">{{ t('config.landingTestimonialsEmptyHint') }}</p>
          </div>
        </template>
      </div>
    </div>

    <!-- Services Section -->
    <div class="rounded-lg border bg-background">
      <button type="button" class="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors" @click="$emit('toggleAccordion', 'services')">
        <span class="flex items-center gap-3">
          <Switch :model-value="landingServicesEnabled" @update:model-value="$emit('update:landingServicesEnabled', $event)" @click.stop />
          <span class="font-medium">{{ t('config.landingServicesEnable') }}</span>
        </span>
        <ChevronDown class="size-4 shrink-0 text-muted-foreground transition-transform" :class="{ 'rotate-180': landingAccordion.services }" />
      </button>
      <div v-show="landingAccordion.services" class="space-y-4 px-4 pb-4">
        <template v-if="landingServicesEnabled">
          <Field>
            <FieldLabel for="landing-services-title">{{ t('config.landingServicesTitle') }}</FieldLabel>
            <Input id="landing-services-title" :model-value="landingServicesTitle" @update:model-value="$emit('update:landingServicesTitle', $event)" :placeholder="t('config.landingServicesTitleHint')" />
          </Field>
          <Field>
            <FieldLabel for="landing-services-subtitle">{{ t('config.landingServicesSubtitle') }}</FieldLabel>
            <Input id="landing-services-subtitle" :model-value="landingServicesSubtitle" @update:model-value="$emit('update:landingServicesSubtitle', $event)" :placeholder="t('config.landingServicesSubtitleHint')" />
          </Field>
          <Field>
            <FieldLabel for="landing-services-wa">{{ t('config.landingServicesWhatsapp') }}</FieldLabel>
            <Input id="landing-services-wa" :model-value="landingServicesWhatsapp" @update:model-value="$emit('update:landingServicesWhatsapp', $event)" placeholder="6281234567890" />
            <p class="mt-1 text-xs text-muted-foreground">{{ t('config.landingServicesWhatsappHint') }}</p>
          </Field>
          <LandingSectionBgFields
            :bg-color="landingServicesBgColor" @update:bg-color="$emit('update:landingServicesBgColor', $event)"
            :bg-image="landingServicesBgImage" @update:bg-image="$emit('update:landingServicesBgImage', $event)"
            color-id="landing-services-bg" image-id="landing-services-bg-image"
            :color-label="t('config.landingServicesBgColor')" section-key="services"
          />
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium">{{ t('config.landingServicesItems') }}</p>
              <Button size="sm" variant="outline" type="button" @click="$emit('addServiceItem')"><Plus class="size-4" /> {{ t('common.add') }}</Button>
            </div>
            <div v-for="(item, idx) in landingServicesData" :key="idx" class="rounded-lg border p-3 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-muted-foreground">{{ t('config.landingServiceItem', { n: idx + 1 }) }}</span>
                <Button size="icon" variant="ghost" class="size-8" type="button" @click="$emit('removeServiceItem', idx)"><Trash2 class="size-4 text-red-500" /></Button>
              </div>
              <div class="flex gap-3">
                <div class="flex size-16 shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden">
                  <img v-if="item.image_url" :src="item.image_url" alt="Service" class="size-full object-cover">
                  <ImageIcon v-else class="size-6 text-muted-foreground" />
                </div>
                <div class="flex flex-col justify-center gap-1.5">
                  <Button as-child size="sm" variant="outline" type="button">
                    <label class="cursor-pointer">
                      <Upload class="size-3.5" /><span class="ml-1 text-xs">{{ t('config.uploadImage') }}</span>
                      <input type="file" accept="image/webp" class="hidden" @change="$emit('uploadServiceImage', $event, idx)">
                    </label>
                  </Button>
                  <Button v-if="item.image_url" size="sm" variant="ghost" type="button" @click="$emit('removeServiceImage', idx)"><Trash2 class="size-3.5 text-red-500" /></Button>
                </div>
              </div>
              <Field>
                <FieldLabel class="text-xs">{{ t('config.landingServiceItemTitle') }}</FieldLabel>
                <Input :model-value="item.title" @update:model-value="landingServicesData[idx].title = $event" :placeholder="t('config.landingServiceItemTitlePh')" class="h-8 text-sm" />
              </Field>
              <Field>
                <FieldLabel class="text-xs">{{ t('config.landingServiceItemPrice') }}</FieldLabel>
                <Input :model-value="item.price" @update:model-value="landingServicesData[idx].price = $event" placeholder="$99" class="h-8 text-sm" />
              </Field>
              <Field>
                <FieldLabel class="text-xs">{{ t('config.landingServiceItemDesc') }}</FieldLabel>
                <textarea :value="item.description" @input="landingServicesData[idx].description = ($event.target as HTMLTextAreaElement).value" class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" rows="2" :placeholder="t('config.landingServiceItemDescPh')" />
              </Field>
            </div>
            <p v-if="landingServicesData.length === 0" class="text-xs text-muted-foreground py-2 text-center">{{ t('config.landingServicesEmptyHint') }}</p>
          </div>
        </template>
      </div>
    </div>

    <!-- Gallery Section -->
    <div class="rounded-lg border bg-background">
      <button type="button" class="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors" @click="$emit('toggleAccordion', 'gallery')">
        <span class="flex items-center gap-3">
          <Switch :model-value="landingGalleryEnabled" @update:model-value="$emit('update:landingGalleryEnabled', $event)" @click.stop />
          <span class="font-medium">{{ t('config.landingGalleryEnable') }}</span>
        </span>
        <ChevronDown class="size-4 shrink-0 text-muted-foreground transition-transform" :class="{ 'rotate-180': landingAccordion.gallery }" />
      </button>
      <div v-show="landingAccordion.gallery" class="space-y-4 px-4 pb-4">
        <template v-if="landingGalleryEnabled">
          <Field>
            <FieldLabel for="landing-gallery-title">{{ t('config.landingGalleryTitle') }}</FieldLabel>
            <Input id="landing-gallery-title" :model-value="landingGalleryTitle" @update:model-value="$emit('update:landingGalleryTitle', $event)" :placeholder="t('config.landingGalleryTitleHint')" />
          </Field>
          <Field>
            <FieldLabel for="landing-gallery-subtitle">{{ t('config.landingGallerySubtitle') }}</FieldLabel>
            <Input id="landing-gallery-subtitle" :model-value="landingGallerySubtitle" @update:model-value="$emit('update:landingGallerySubtitle', $event)" :placeholder="t('config.landingGallerySubtitleHint')" />
          </Field>
          <LandingSectionBgFields
            :bg-color="landingGalleryBgColor" @update:bg-color="$emit('update:landingGalleryBgColor', $event)"
            :bg-image="landingGalleryBgImage" @update:bg-image="$emit('update:landingGalleryBgImage', $event)"
            color-id="landing-gallery-bg" image-id="landing-gallery-bg-image"
            :color-label="t('config.landingGalleryBgColor')" section-key="gallery"
          />
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium">{{ t('config.landingGalleryImages') }}</p>
              <Button size="sm" variant="outline" type="button" @click="$emit('addGalleryImage')"><Plus class="size-4" /> {{ t('common.add') }}</Button>
            </div>
            <div class="grid grid-cols-4 gap-2">
              <div v-for="(_, idx) in landingGalleryImages" :key="idx" class="relative aspect-square rounded-lg border bg-muted overflow-hidden">
                <img v-if="landingGalleryImages[idx]" :src="landingGalleryImages[idx]" alt="Gallery" class="size-full object-cover">
                <ImageIcon v-else class="absolute inset-0 m-auto size-6 text-muted-foreground" />
                <div class="absolute right-1 top-1 flex gap-0.5">
                  <Button as-child size="sm" variant="secondary" type="button" class="size-6 p-0">
                    <label class="cursor-pointer">
                      <Upload class="size-3" />
                      <input type="file" accept="image/webp" class="hidden" @change="$emit('uploadGalleryImage', $event, idx)">
                    </label>
                  </Button>
                  <Button size="sm" variant="secondary" type="button" class="size-6 p-0" @click="$emit('removeGalleryImage', idx)"><Trash2 class="size-3 text-red-500" /></Button>
                </div>
              </div>
            </div>
            <p v-if="landingGalleryImages.length === 0" class="text-xs text-muted-foreground py-2 text-center">{{ t('config.landingGalleryEmptyHint') }}</p>
          </div>
        </template>
      </div>
    </div>

    <!-- Contact Section -->
    <div class="rounded-lg border bg-background">
      <button type="button" class="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors" @click="$emit('toggleAccordion', 'contact')">
        <span class="flex items-center gap-3">
          <Switch :model-value="landingContactEnabled" @update:model-value="$emit('update:landingContactEnabled', $event)" @click.stop />
          <span class="font-medium">{{ t('config.landingContactEnable') }}</span>
        </span>
        <ChevronDown class="size-4 shrink-0 text-muted-foreground transition-transform" :class="{ 'rotate-180': landingAccordion.contact }" />
      </button>
      <div v-show="landingAccordion.contact" class="space-y-4 px-4 pb-4">
        <template v-if="landingContactEnabled">
          <Field>
            <FieldLabel for="landing-contact-title">{{ t('config.landingContactTitle') }}</FieldLabel>
            <Input id="landing-contact-title" :model-value="landingContactTitle" @update:model-value="$emit('update:landingContactTitle', $event)" :placeholder="t('config.landingContactTitleHint')" />
          </Field>
          <Field>
            <FieldLabel for="landing-contact-subtitle">{{ t('config.landingContactSubtitle') }}</FieldLabel>
            <Input id="landing-contact-subtitle" :model-value="landingContactSubtitle" @update:model-value="$emit('update:landingContactSubtitle', $event)" :placeholder="t('config.landingContactSubtitleHint')" />
          </Field>
          <Field>
            <FieldLabel for="landing-contact-address">{{ t('config.landingContactAddress') }}</FieldLabel>
            <Input id="landing-contact-address" :model-value="landingContactAddress" @update:model-value="$emit('update:landingContactAddress', $event)" placeholder="Jl. Contoh No. 123, Jakarta" />
          </Field>
          <Field>
            <FieldLabel for="landing-contact-phone">{{ t('config.landingContactPhone') }}</FieldLabel>
            <Input id="landing-contact-phone" :model-value="landingContactPhone" @update:model-value="$emit('update:landingContactPhone', $event)" placeholder="+62 812 3456 7890" />
          </Field>
          <Field>
            <FieldLabel for="landing-contact-email">{{ t('config.landingContactEmail') }}</FieldLabel>
            <Input id="landing-contact-email" :model-value="landingContactEmail" @update:model-value="$emit('update:landingContactEmail', $event)" placeholder="hello@example.com" />
          </Field>
          <div class="grid gap-4 sm:grid-cols-3">
            <Field>
              <FieldLabel for="landing-contact-lat">Latitude</FieldLabel>
              <Input id="landing-contact-lat" :model-value="landingContactMapLat.toString()" @update:model-value="$emit('update:landingContactMapLat', Number($event))" type="number" step="0.000001" />
            </Field>
            <Field>
              <FieldLabel for="landing-contact-lng">Longitude</FieldLabel>
              <Input id="landing-contact-lng" :model-value="landingContactMapLng.toString()" @update:model-value="$emit('update:landingContactMapLng', Number($event))" type="number" step="0.000001" />
            </Field>
            <Field>
              <FieldLabel for="landing-contact-zoom">Zoom (1-18)</FieldLabel>
              <Input id="landing-contact-zoom" :model-value="landingContactMapZoom.toString()" @update:model-value="$emit('update:landingContactMapZoom', Number($event))" type="number" min="1" max="18" />
            </Field>
          </div>
          <LandingSectionBgFields
            :bg-color="landingContactBgColor" @update:bg-color="$emit('update:landingContactBgColor', $event)"
            :bg-image="landingContactBgImage" @update:bg-image="$emit('update:landingContactBgImage', $event)"
            color-id="landing-contact-bg" image-id="landing-contact-bg-image"
            :color-label="t('config.landingContactBgColor')" section-key="contact"
          />
        </template>
      </div>
    </div>

    <!-- Book Section (yummy only) -->
    <div v-if="landingTemplate === 'yummy'" class="rounded-lg border bg-background">
      <button type="button" class="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors" @click="$emit('toggleAccordion', 'book')">
        <span class="text-sm font-medium">{{ t('config.landingBookSectionBg') }}</span>
        <ChevronDown class="size-4 shrink-0 text-muted-foreground transition-transform" :class="{ 'rotate-180': landingAccordion.book }" />
      </button>
      <div v-show="landingAccordion.book" class="space-y-4 px-4 pb-4">
        <p class="text-xs text-muted-foreground">{{ t('config.landingBookSectionBgDesc') }}</p>
        <LandingSectionBgFields
          :bg-color="landingBookBgColor" @update:bg-color="$emit('update:landingBookBgColor', $event)"
          :bg-image="landingBookBgImage" @update:bg-image="$emit('update:landingBookBgImage', $event)"
          color-id="landing-book-bg" image-id="landing-book-bg-image"
          :color-label="t('config.landingBookBgColor')" section-key="book"
        />
      </div>
    </div>

    <Button type="submit" :disabled="isSavingLanding">
      {{ isSavingLanding ? t('common.saving') : t('config.saveLanding') }}
    </Button>
  </form>
</template>
