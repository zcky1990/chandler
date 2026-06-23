<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatPrice } from '@/lib/format'
import { formatPreOrderNumber } from '@/lib/pre-order'
import type { PreOrder } from '@/types/database'

defineProps<{
  open: boolean
  order: PreOrder | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[420px]">
      <DialogHeader>
        <DialogTitle>Pesanan Terkirim</DialogTitle>
        <DialogDescription v-if="order">
          Nomor pesanan Anda: <span class="font-semibold text-foreground">{{ formatPreOrderNumber(order.order_number) }}</span>
        </DialogDescription>
      </DialogHeader>

      <div v-if="order" class="space-y-3 text-sm">
        <p>
          Total: <span class="font-semibold">{{ formatPrice(order.total_amount) }}</span>
        </p>
        <p class="rounded-lg border bg-muted/40 p-3 text-muted-foreground">
          Pesanan Anda telah diterima. Silakan menuju <span class="font-medium text-foreground">kasir</span>
          untuk melakukan pembayaran. Tunjukkan nomor pesanan di atas kepada kasir.
        </p>
      </div>

      <DialogFooter class="flex-col gap-2 sm:flex-col">
        <Button variant="outline" class="w-full" as-child>
          <RouterLink to="/" @click="emit('update:open', false)">
            Kembali ke Beranda
          </RouterLink>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
