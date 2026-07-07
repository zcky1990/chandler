<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { UtensilsCrossed } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/composables/useI18n'

type NavVariant = 'default' | 'sarab' | 'yummy' | 'spicehaven'

const props = defineProps<{
  variant: NavVariant
  shopName: string
  accentColor: string
  navLogoUrl?: string | null
}>()

const { t } = useI18n()

const variantClasses: Record<NavVariant, string> = {
  default: 'border-white/10 bg-black/20 text-white backdrop-blur-md',
  sarab: 'border-zinc-800 bg-zinc-950/95 text-white backdrop-blur-md',
  yummy: 'border-red-100 bg-white/95 text-slate-900 shadow-sm backdrop-blur-md',
  spicehaven: 'border-amber-900/10 bg-stone-950/40 text-amber-50 backdrop-blur-md',
}
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b"
    :class="variantClasses[variant]"
  >
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
      <RouterLink to="/" class="flex items-center gap-2 font-bold tracking-tight">
        <img v-if="navLogoUrl" :src="navLogoUrl" alt="Logo" class="h-7 w-auto object-contain">
        <UtensilsCrossed v-else class="size-5" :style="{ color: accentColor }" />
        <span>{{ shopName }}</span>
      </RouterLink>
      <nav class="hidden items-center gap-6 text-sm font-medium md:flex">
        <RouterLink to="/order" class="opacity-80 transition-opacity hover:opacity-100">
          {{ t('nav.createTransaction') }}
        </RouterLink>
        <RouterLink to="/book" class="opacity-80 transition-opacity hover:opacity-100">
          {{ t('nav.bookings') }}
        </RouterLink>
      </nav>
      <RouterLink to="/order">
        <Button
          size="sm"
          class="font-medium"
          :style="{ backgroundColor: accentColor, color: '#fff' }"
        >
          {{ t('nav.createTransaction') }}
        </Button>
      </RouterLink>
    </div>
  </header>
</template>
