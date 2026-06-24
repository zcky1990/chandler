<script setup lang="ts">
import { computed, ref } from 'vue'
import { Receipt } from '@lucide/vue'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { useI18n } from '@/composables/useI18n'
import { formatItemWithAddons } from '@/lib/addon'
import { formatPrice } from '@/lib/format'
import { isActiveTransaction } from '@/lib/transaction'
import { WALK_IN_CUSTOMER_NAME } from '@/types/database'
import type { CustomerTransactionSummary } from '@/types/database'

const props = defineProps<{
  open: boolean
  customer: CustomerTransactionSummary | null
  loading?: boolean
}>()

const { t, locale } = useI18n()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const dateLocale = computed(() => (locale.value === 'en' ? 'en-US' : 'id-ID'))

const unpaidTransactions = computed(() =>
  (props.customer?.transactions ?? [])
    .filter((transaction) => isActiveTransaction(transaction) && !transaction.is_paid)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
)

const totalOutstanding = computed(() =>
  unpaidTransactions.value.reduce((sum, transaction) => sum + Number(transaction.total_amount), 0),
)

function displayCustomerName(name: string | undefined | null) {
  if (!name) return ''
  if (name === WALK_IN_CUSTOMER_NAME) return t('common.walkIn')
  return name
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(dateLocale.value, {
    dateStyle: 'medium',
  }).format(new Date(value))
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-[560px]">
      <div class="border-b px-6 pb-5 pt-8 text-center">
        <div class="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-foreground text-background">
          <Receipt class="size-7" />
        </div>
        <h2 class="text-3xl font-bold tracking-tight uppercase">
          {{ displayCustomerName(customer?.customerName) }}
        </h2>
        <p class="mt-1 text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          {{ t('customerList.unpaidList') }}
        </p>
      </div>

      <div class="max-h-[55vh] overflow-y-auto px-6 py-5">
        <div
          v-if="loading"
          class="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground"
        >
          {{ t('customerList.loadingDebt') }}
        </div>

        <div
          v-else-if="!unpaidTransactions.length"
          class="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground"
        >
          {{ t('customerList.noUnpaid') }}
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="transaction in unpaidTransactions"
            :key="transaction.id"
            class="rounded-2xl border bg-background px-4 py-4"
          >
            <div class="flex items-center justify-between gap-3 border-b pb-3">
              <p class="font-semibold">{{ formatDate(transaction.created_at) }}</p>
              <p class="font-bold">{{ formatPrice(transaction.total_amount) }}</p>
            </div>

            <ul class="mt-3 space-y-2">
              <li
                v-for="item in transaction.transaction_items"
                :key="item.id"
                class="flex items-start justify-between gap-3 text-sm"
              >
                <div class="min-w-0">
                  <p class="font-medium">{{ formatItemWithAddons(item) }}</p>
                  <p class="text-muted-foreground">
                    {{ formatPrice(item.subtotal + (item.transaction_item_addons ?? []).reduce((sum, addon) => sum + Number(addon.subtotal), 0)) }}
                  </p>
                </div>
              </li>
            </ul>

            <p
              v-if="transaction.notes"
              class="mt-3 rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
            >
              {{ transaction.notes }}
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 border-t px-6 py-5">
        <div>
          <p class="text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase">
            {{ t('customerList.txCount') }}
          </p>
          <p class="mt-1 text-2xl font-bold">
            {{ unpaidTransactions.length }}
            <span class="text-base font-medium text-muted-foreground">{{ t('common.entries') }}</span>
          </p>
        </div>
        <div class="text-right">
          <p class="text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase">
            {{ t('customerList.totalDebt') }}
          </p>
          <p class="mt-1 text-3xl font-bold tracking-tight">
            {{ formatPrice(totalOutstanding) }}
          </p>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
