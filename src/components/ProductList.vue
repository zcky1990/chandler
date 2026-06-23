<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { useI18n } from '@/composables/useI18n'
import { formatPrice } from '@/lib/format'
import type { Product } from '@/types/database'

defineProps<{
  products: Product[]
}>()

const { t } = useI18n()
</script>

<template>
  <div class="grid w-full gap-2">
    <Card
      v-for="product in products"
      :key="product.id"
      class="gap-0 py-0 shadow-sm"
    >
      <CardContent class="flex items-start justify-between gap-4 p-4">
        <div class="min-w-0 space-y-1">
          <p class="font-medium leading-none">
            {{ product.name }}
          </p>
          <p
            v-if="product.description"
            class="line-clamp-2 text-sm text-muted-foreground"
          >
            {{ product.description }}
          </p>
          <p v-if="product.sku" class="text-xs text-muted-foreground">
            {{ t('common.sku') }} {{ product.sku }}
          </p>
        </div>

        <div class="shrink-0 space-y-1 text-right">
          <p class="font-semibold tabular-nums">
            {{ formatPrice(product.price) }}
          </p>
          <p
            class="text-xs text-muted-foreground"
            :class="product.stock_quantity <= 0 ? 'text-destructive' : ''"
          >
            {{ t('common.stockLabel', { quantity: product.stock_quantity }) }}
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
