<script setup lang="ts">
import { ChevronRight } from '@lucide/vue'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useI18n } from '@/composables/useI18n'
import { formatPrice } from '@/lib/format'
import { WALK_IN_CUSTOMER_NAME } from '@/types/database'
import type { CustomerWithDebt } from '@/types/database'

defineProps<{
  customers: CustomerWithDebt[]
}>()

const { t } = useI18n()

const emit = defineEmits<{
  select: [customer: CustomerWithDebt]
}>()

function getCustomerDetail(customer: CustomerWithDebt) {
  return customer.phone || customer.email || customer.address || t('common.noContact')
}

function displayName(name: string) {
  if (name === WALK_IN_CUSTOMER_NAME) return t('common.walkIn')
  return name
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
              {{ displayName(customer.name) }}
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
            <span class="text-muted-foreground">{{ t('customerList.debt') }}</span>
            <div class="text-right">
              <p class="font-semibold tabular-nums">
                {{ formatPrice(customer.outstandingAmount) }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ customer.unpaidCount }} {{ t('dashboard.transactions') }}
              </p>
            </div>
          </div>
        </template>

        <p v-else class="mt-2 text-sm text-muted-foreground">
          {{ t('customerList.noDebt') }}
        </p>
      </CardContent>
    </Card>
  </div>
</template>
