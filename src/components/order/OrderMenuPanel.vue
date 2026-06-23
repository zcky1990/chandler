<script setup lang="ts">
import { Plus } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice } from '@/lib/format'
import type { Product } from '@/types/database'

defineProps<{
  products: Product[]
  isLoading: boolean
}>()

const emit = defineEmits<{
  add: [product: Product]
}>()
</script>

<template>
  <section class="space-y-3">
    <h2 class="text-sm font-medium">Menu</h2>

    <div v-if="isLoading" class="text-sm text-muted-foreground">
      Memuat menu...
    </div>

    <div
      v-else-if="!products.length"
      class="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground"
    >
      Tidak ada menu tersedia saat ini.
    </div>

    <div v-else class="grid gap-2 sm:grid-cols-2">
      <Card
        v-for="product in products"
        :key="product.id"
        class="cursor-pointer gap-0 py-0 transition-colors hover:bg-muted/50"
        @click="emit('add', product)"
      >
        <CardContent class="flex items-center justify-between gap-3 p-4">
          <div class="min-w-0">
            <p class="font-medium">{{ product.name }}</p>
            <p class="text-sm text-muted-foreground">
              {{ formatPrice(product.price) }} · Stok {{ product.stock_quantity }}
            </p>
          </div>
          <Button size="icon-sm" variant="outline" @click.stop="emit('add', product)">
            <Plus class="size-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  </section>
</template>
