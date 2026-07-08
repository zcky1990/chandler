<script setup lang="ts">
import { computed } from 'vue'
import LandingDefaultPage from '@/components/landing/templates/LandingDefaultPage.vue'
import LandingYummyPage from '@/components/landing/templates/LandingYummyPage.vue'
import LandingSarabPage from '@/components/landing/templates/LandingSarabPage.vue'
import LandingSpiceHavenPage from '@/components/landing/templates/LandingSpiceHavenPage.vue'
import { getLandingThemeAttrs } from '@/lib/landing-theme'
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
const themeAttrs = computed(() => getLandingThemeAttrs(props.template))
</script>

<template>
  <div class="landing-root min-h-screen w-full" :class="themeAttrs.class" :style="themeAttrs.style">
    <component :is="activeComponent" v-bind="props" />
  </div>
</template>

<style scoped>
:global(.landing-fade-in) {
  animation: landing-fade-in 0.7s ease-out both;
}

:global(.landing-fade-up) {
  animation: landing-fade-up 0.8s ease-out both;
}

:global(.landing-delay-1) {
  animation-delay: 0.12s;
}

:global(.landing-delay-2) {
  animation-delay: 0.24s;
}

:global(.landing-delay-3) {
  animation-delay: 0.36s;
}

@keyframes landing-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes landing-fade-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  :global(.landing-fade-in),
  :global(.landing-fade-up),
  :global(.landing-delay-1),
  :global(.landing-delay-2),
  :global(.landing-delay-3) {
    animation: none !important;
  }
}
</style>
