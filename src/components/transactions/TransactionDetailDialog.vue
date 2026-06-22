<script setup lang="ts">
import { computed } from 'vue'
import { Pencil } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import type { TransactionWithDetails } from '@/types/database'

const props = defineProps<{
  open: boolean
  transaction: TransactionWithDetails | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  edit: []
}>()

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const itemCount = computed(() =>
  props.transaction?.transaction_items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
)

const canEdit = computed(() => props.transaction && !props.transaction.is_paid)
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[520px]">
      <DialogHeader>
        <DialogTitle>Detail Transaksi</DialogTitle>
        <DialogDescription v-if="transaction">
          {{ transaction.customers?.name ?? 'Pembeli tidak diketahui' }} · {{ formatDateTime(transaction.created_at) }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="transaction" class="space-y-4">
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p class="text-muted-foreground">Status</p>
            <p class="font-medium">
              {{ transaction.is_paid ? `Lunas (${transaction.payment_method?.toUpperCase() ?? '-'})` : 'Belum dibayar' }}
            </p>
          </div>
          <div>
            <p class="text-muted-foreground">Total item</p>
            <p class="font-medium">{{ itemCount }}</p>
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-medium">Produk</p>
          <div
            v-for="item in transaction.transaction_items"
            :key="item.id"
            class="rounded-xl border px-4 py-3"
          >
            <p class="font-medium">{{ item.products?.name ?? 'Produk' }}</p>
            <p class="text-sm text-muted-foreground">
              {{ item.quantity }} x {{ formatPrice(item.unit_price) }} = {{ formatPrice(item.subtotal) }}
            </p>
            <p
              v-for="addon in item.transaction_item_addons ?? []"
              :key="addon.id"
              class="text-sm text-muted-foreground"
            >
              + {{ addon.products?.name ?? 'Addon' }}
              ({{ item.quantity }} x {{ addon.quantity }} x {{ formatPrice(addon.unit_price) }})
              = {{ formatPrice(addon.subtotal) }}
            </p>
          </div>
        </div>

        <div v-if="transaction.notes" class="rounded-xl border px-4 py-3 text-sm">
          <p class="text-muted-foreground">Catatan</p>
          <p>{{ transaction.notes }}</p>
        </div>

        <div class="flex items-center justify-between border-t pt-4">
          <span class="text-sm text-muted-foreground">Total</span>
          <span class="text-lg font-bold">{{ formatPrice(transaction.total_amount) }}</span>
        </div>
      </div>

      <DialogFooter v-if="canEdit">
        <Button variant="outline" @click="emit('edit')">
          <Pencil class="size-4" />
          Ubah Jumlah Item
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
