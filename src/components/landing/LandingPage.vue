<script setup lang="ts">
import { computed } from 'vue'
import LandingDefaultPage from '@/components/landing/templates/LandingDefaultPage.vue'
import LandingYummyPage from '@/components/landing/templates/LandingYummyPage.vue'
import LandingSarabPage from '@/components/landing/templates/LandingSarabPage.vue'
import LandingSpiceHavenPage from '@/components/landing/templates/LandingSpiceHavenPage.vue'
import type { LandingPageProps } from '@/components/landing/landing-page-props'
import type { LandingTemplate } from '@/types/database'

const props = defineProps<LandingPageProps>()

const templateComponents: Record<LandingTemplate, typeof LandingDefaultPage> = {
  default: LandingDefaultPage,
  yummy: LandingYummyPage,
  sarab: LandingSarabPage,
  spicehaven: LandingSpiceHavenPage,
}

const activeComponent = computed(() => templateComponents[props.template] ?? LandingDefaultPage)
</script>

<template>
  <component :is="activeComponent" v-bind="props" />
</template>
