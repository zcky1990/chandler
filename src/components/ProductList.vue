<script setup lang="ts">
import type { Product } from '@/types/database'

defineProps<{
  products: Product[]
}>()

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)
}
</script>

<template>
  <div class="grid w-full gap-2">
    <div
      v-for="product in products"
      :key="product.id"
      class="rounded-xl border border-border bg-background/90 px-4 py-3 backdrop-blur-sm"
    >
      <p class="font-semibold text-foreground">
        {{ product.name }}
      </p>
      <p class="text-sm text-muted-foreground">
        {{ formatPrice(product.price) }}
        <span v-if="product.description"> · {{ product.description }}</span>
      </p>
    </div>
  </div>
</template>
