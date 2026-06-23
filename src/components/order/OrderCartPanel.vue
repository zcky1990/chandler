<script setup lang="ts">
import { Minus, Plus, ShoppingCart, Trash2 } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPrice } from '@/lib/format'
import type { PreOrderCartItem } from '@/composables/usePreOrderCart'

defineProps<{
  cart: PreOrderCartItem[]
  totalAmount: number
  isSubmitting: boolean
  getCartLineSubtotal: (item: PreOrderCartItem) => number
}>()

const emit = defineEmits<{
  updateQuantity: [lineKey: string, quantity: number]
  remove: [lineKey: string]
  submit: []
}>()
</script>

<template>
  <section class="space-y-4">
    <div class="rounded-xl border bg-background p-4">
      <div class="mb-4 flex items-center gap-2">
        <ShoppingCart class="size-5" />
        <h2 class="font-semibold">Keranjang</h2>
      </div>

      <div v-if="!cart.length" class="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        Belum ada item. Pilih menu untuk memulai pesanan.
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="item in cart"
          :key="item.lineKey"
          class="rounded-xl border px-4 py-3"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="font-medium">{{ item.product.name }}</p>
              <p class="text-sm text-muted-foreground">
                {{ formatPrice(item.product.price) }} / item
              </p>
              <p
                v-if="item.addons.length"
                class="mt-1 text-xs text-muted-foreground"
              >
                + {{ item.addons.map((addon) => addon.product.name).join(', ') }}
              </p>
            </div>
            <Button
              size="icon-sm"
              variant="ghost"
              @click="emit('remove', item.lineKey)"
            >
              <Trash2 class="size-4" />
            </Button>
          </div>

          <div class="mt-3 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Button
                size="icon-sm"
                variant="outline"
                @click="emit('updateQuantity', item.lineKey, item.quantity - 1)"
              >
                <Minus class="size-4" />
              </Button>
              <Input
                :model-value="item.quantity"
                type="number"
                min="1"
                class="w-16 text-center"
                @update:model-value="emit('updateQuantity', item.lineKey, Number($event))"
              />
              <Button
                size="icon-sm"
                variant="outline"
                @click="emit('updateQuantity', item.lineKey, item.quantity + 1)"
              >
                <Plus class="size-4" />
              </Button>
            </div>
            <p class="font-semibold">
              {{ formatPrice(getCartLineSubtotal(item)) }}
            </p>
          </div>
        </div>
      </div>

      <div class="mt-4 flex items-center justify-between border-t pt-4">
        <span class="text-sm text-muted-foreground">Total</span>
        <span class="text-lg font-bold">{{ formatPrice(totalAmount) }}</span>
      </div>

      <Button
        class="mt-4 w-full"
        :disabled="isSubmitting || !cart.length"
        @click="emit('submit')"
      >
        {{ isSubmitting ? 'Membuat pesanan...' : 'Buat Pesanan' }}
      </Button>
    </div>
  </section>
</template>
