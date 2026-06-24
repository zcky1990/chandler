<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Ban, Pencil } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useI18n } from '@/composables/useI18n'
import { getPaymentMethodLabel } from '@/lib/invoice'
import { formatPrice } from '@/lib/format'
import { getTransactionEvents, isActiveTransaction } from '@/lib/transaction'
import { WALK_IN_CUSTOMER_NAME } from '@/types/database'
import type { TransactionEventWithPerformer, TransactionWithDetails } from '@/types/database'

const props = defineProps<{
  open: boolean
  transaction: TransactionWithDetails | null
}>()

const { t, locale } = useI18n()

const emit = defineEmits<{
  'update:open': [value: boolean]
  edit: []
  cancel: []
}>()

const auditEvents = ref<TransactionEventWithPerformer[]>([])
const isLoadingEvents = ref(false)

const dateLocale = computed(() => (locale.value === 'en' ? 'en-US' : 'id-ID'))

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(dateLocale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function displayCustomerName(name: string | undefined | null) {
  if (!name) return t('common.unknownBuyer')
  if (name === WALK_IN_CUSTOMER_NAME) return t('common.walkIn')
  return name
}

function displayPerformer(event: TransactionEventWithPerformer) {
  return event.profiles?.full_name
    ?? event.profiles?.email
    ?? t('common.unknownBuyer')
}

const itemCount = computed(() =>
  props.transaction?.transaction_items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
)

const canEdit = computed(() => props.transaction && props.transaction.is_paid === false && isActiveTransaction(props.transaction))
const canCancel = computed(() => props.transaction && isActiveTransaction(props.transaction))
const isCancelled = computed(() => props.transaction && !isActiveTransaction(props.transaction))

function paidStatusLabel(transaction: TransactionWithDetails) {
  if (!isActiveTransaction(transaction)) return t('status.cancelled')
  if (!transaction.is_paid) return t('common.unpaidStatus')
  const method = transaction.payment_method
  return method
    ? t('transaction.paidWithMethod', { method: getPaymentMethodLabel(method) })
    : t('status.paid')
}

async function loadAuditEvents() {
  if (!props.transaction || isActiveTransaction(props.transaction)) {
    auditEvents.value = []
    return
  }

  isLoadingEvents.value = true
  const { events } = await getTransactionEvents(props.transaction.id)
  auditEvents.value = events ?? []
  isLoadingEvents.value = false
}

watch(
  () => [props.open, props.transaction?.id, props.transaction?.status] as const,
  ([isOpen]) => {
    if (isOpen) {
      loadAuditEvents()
    }
  },
)
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[520px]">
      <DialogHeader>
        <DialogTitle>{{ t('transaction.detail') }}</DialogTitle>
        <DialogDescription v-if="transaction">
          {{ displayCustomerName(transaction.customers?.name) }} · {{ formatDateTime(transaction.created_at) }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="transaction" class="space-y-4">
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p class="text-muted-foreground">{{ t('common.status') }}</p>
            <p class="font-medium">
              {{ paidStatusLabel(transaction) }}
            </p>
          </div>
          <div>
            <p class="text-muted-foreground">{{ t('transaction.totalItems') }}</p>
            <p class="font-medium">{{ itemCount }}</p>
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-medium">{{ t('common.product') }}</p>
          <div
            v-for="item in transaction.transaction_items"
            :key="item.id"
            class="rounded-xl border px-4 py-3"
          >
            <p class="font-medium">{{ item.products?.name ?? t('common.unknownProduct') }}</p>
            <p class="text-sm text-muted-foreground">
              {{ item.quantity }} x {{ formatPrice(item.unit_price) }} = {{ formatPrice(item.subtotal) }}
            </p>
            <p
              v-for="addon in item.transaction_item_addons ?? []"
              :key="addon.id"
              class="text-sm text-muted-foreground"
            >
              + {{ addon.products?.name ?? t('common.addon') }}
              ({{ item.quantity }} x {{ addon.quantity }} x {{ formatPrice(addon.unit_price) }})
              = {{ formatPrice(addon.subtotal) }}
            </p>
          </div>
        </div>

        <div v-if="transaction.notes" class="rounded-xl border px-4 py-3 text-sm">
          <p class="text-muted-foreground">{{ t('common.notes') }}</p>
          <p>{{ transaction.notes }}</p>
        </div>

        <div
          v-if="isCancelled"
          class="space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm"
        >
          <div>
            <p class="text-muted-foreground">{{ t('transaction.cancelledAt') }}</p>
            <p class="font-medium">
              {{ transaction.cancelled_at ? formatDateTime(transaction.cancelled_at) : '-' }}
            </p>
          </div>
          <div v-if="transaction.cancellation_reason">
            <p class="text-muted-foreground">{{ t('transaction.cancelReason') }}</p>
            <p>{{ transaction.cancellation_reason }}</p>
          </div>
        </div>

        <div v-if="isCancelled" class="space-y-2">
          <p class="text-sm font-medium">{{ t('transaction.auditTrail') }}</p>
          <p v-if="isLoadingEvents" class="text-sm text-muted-foreground">{{ t('common.loading') }}</p>
          <div
            v-for="event in auditEvents"
            :key="event.id"
            class="rounded-xl border px-4 py-3 text-sm"
          >
            <p class="font-medium">{{ t('transaction.eventCancelled') }}</p>
            <p class="text-muted-foreground">
              {{ formatDateTime(event.created_at) }} · {{ displayPerformer(event) }}
            </p>
            <p v-if="event.reason" class="mt-1">{{ event.reason }}</p>
          </div>
        </div>

        <div class="flex items-center justify-between border-t pt-4">
          <span class="text-sm text-muted-foreground">{{ t('common.total') }}</span>
          <span class="text-lg font-bold">{{ formatPrice(transaction.total_amount) }}</span>
        </div>
      </div>

      <DialogFooter v-if="canEdit || canCancel" class="gap-2 sm:justify-between">
        <Button
          v-if="canCancel"
          variant="destructive"
          @click="emit('cancel')"
        >
          <Ban class="size-4" />
          {{ t('transaction.voidCancel') }}
        </Button>
        <Button v-if="canEdit" variant="outline" @click="emit('edit')">
          <Pencil class="size-4" />
          {{ t('transaction.editItems') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
