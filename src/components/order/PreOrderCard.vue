<script setup lang="ts">
import { computed } from 'vue'
import { formatPreOrderItemWithAddons } from '@/lib/addon'
import { formatPrice } from '@/lib/format'
import { formatPreOrderNumber, getPreOrderPaymentLabel, needsPreOrderPaymentConfirmation } from '@/lib/pre-order'
import { useI18n } from '@/composables/useI18n'
import type { PreOrderWithDetails } from '@/types/database'

const props = defineProps<{
  preOrder: PreOrderWithDetails
}>()

const { t } = useI18n()

const emit = defineEmits<{
  process: []
  cancel: []
  edit: []
}>()

const itemsSummary = computed(() =>
  props.preOrder.pre_order_items
    .map((item) => formatPreOrderItemWithAddons(item))
    .join(', '),
)

const paymentLabel = computed(() => getPreOrderPaymentLabel(props.preOrder))
const needsPaymentConfirm = computed(() => needsPreOrderPaymentConfirmation(props.preOrder))
</script>

<template>
  <article class="rounded-xl border bg-background p-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h3 class="text-lg font-semibold">
          {{ formatPreOrderNumber(preOrder.order_number) }}
        </h3>
        <p class="mt-1 text-sm text-muted-foreground">
          {{ preOrder.customer_name || t('order.noName') }}
          <span v-if="preOrder.table_number"> · {{ t('order.table', { number: preOrder.table_number }) }}</span>
        </p>
      </div>
      <span
        class="rounded-md border px-2 py-1 text-xs font-medium"
        :class="preOrder.payment_choice === 'pay_now' ? 'border-amber-500/40 bg-amber-500/10' : ''"
      >
        {{ paymentLabel }}
      </span>
    </div>

    <p class="mt-3 text-sm">
      {{ itemsSummary || '-' }}
    </p>

    <p
      v-if="preOrder.notes"
      class="mt-2 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground"
    >
      {{ preOrder.notes }}
    </p>

    <div class="mt-4 flex items-center justify-between gap-3">
      <p class="font-semibold">{{ formatPrice(preOrder.total_amount) }}</p>
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="inline-flex h-8 items-center justify-center rounded-md border px-3 text-sm font-medium hover:bg-muted"
          @click="emit('edit')"
        >
          {{ t('common.edit') }}
        </button>
        <button
          type="button"
          class="inline-flex h-8 items-center justify-center rounded-md border px-3 text-sm font-medium hover:bg-muted"
          @click="emit('cancel')"
        >
          {{ t('order.cancel') }}
        </button>
        <button
          type="button"
          class="inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          @click="emit('process')"
        >
          {{ needsPaymentConfirm ? t('order.confirmPayButton') : t('common.process') }}
        </button>
      </div>
    </div>
  </article>
</template>
