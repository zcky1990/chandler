<script setup lang="ts">
import { ChevronRight } from '@lucide/vue'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { CustomerWithDebt } from '@/types/database'

defineProps<{
  customers: CustomerWithDebt[]
}>()

const emit = defineEmits<{
  select: [customer: CustomerWithDebt]
}>()

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)
}

function getCustomerDetail(customer: CustomerWithDebt) {
  return customer.phone || customer.email || customer.address || 'Tidak ada detail kontak'
}

function handleClick(customer: CustomerWithDebt) {
  if (customer.unpaidCount > 0) {
    emit('select', customer)
  }
}
</script>

<template>
  <div class="grid w-full gap-2">
    <Card
      v-for="customer in customers"
      :key="customer.id"
      class="gap-0 py-0 shadow-sm transition-colors"
      :class="customer.unpaidCount > 0 ? 'cursor-pointer hover:bg-accent/50' : ''"
      @click="handleClick(customer)"
    >
      <CardContent class="p-4">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 space-y-1">
            <p class="font-medium leading-none">
              {{ customer.name }}
            </p>
            <p class="text-sm text-muted-foreground">
              {{ getCustomerDetail(customer) }}
            </p>
          </div>
          <ChevronRight
            v-if="customer.unpaidCount > 0"
            class="mt-0.5 size-4 shrink-0 text-muted-foreground"
          />
        </div>

        <template v-if="customer.unpaidCount > 0">
          <Separator class="my-3" />
          <div class="flex items-center justify-between gap-3 text-sm">
            <span class="text-muted-foreground">Tunggakan</span>
            <div class="text-right">
              <p class="font-semibold tabular-nums">
                {{ formatPrice(customer.outstandingAmount) }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ customer.unpaidCount }} transaksi
              </p>
            </div>
          </div>
        </template>

        <p v-else class="mt-2 text-sm text-muted-foreground">
          Tidak ada tunggakan
        </p>
      </CardContent>
    </Card>
  </div>
</template>
