<script setup lang="ts">
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
  return customer.address || customer.phone || customer.email || 'Tidak ada detail'
}

function handleClick(customer: CustomerWithDebt) {
  if (customer.unpaidCount > 0) {
    emit('select', customer)
  }
}
</script>

<template>
  <div class="grid w-full gap-2">
    <div
      v-for="customer in customers"
      :key="customer.id"
      class="rounded-xl border border-border bg-background/90 px-4 py-3 backdrop-blur-sm transition-colors"
      :class="customer.unpaidCount > 0 ? 'cursor-pointer hover:bg-accent/50' : ''"
      @click="handleClick(customer)"
    >
      <p class="font-semibold text-foreground">
        {{ customer.name }}
      </p>
      <p class="text-sm text-muted-foreground">
        {{ getCustomerDetail(customer) }}
      </p>

      <p
        v-if="customer.unpaidCount > 0"
        class="mt-2 text-sm font-medium text-amber-600 dark:text-amber-400"
      >
        Tunggakan: {{ formatPrice(customer.outstandingAmount) }}
        <span class="font-normal text-muted-foreground">
          ({{ customer.unpaidCount }} transaksi)
        </span>
      </p>
      <p v-else class="mt-2 text-sm text-muted-foreground">
        Tidak ada tunggakan
      </p>

      <p
        v-if="customer.unpaidCount > 0"
        class="mt-1 text-xs text-muted-foreground"
      >
        Ketuk untuk lihat detail item
      </p>
    </div>
  </div>
</template>
