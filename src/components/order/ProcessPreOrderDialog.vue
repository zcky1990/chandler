<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import PaymentMethodDialog from '@/components/transactions/PaymentMethodDialog.vue'
import PaymentSuccessDialog from '@/components/transactions/PaymentSuccessDialog.vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import TableSelect from '@/components/tables/TableSelect.vue'
import { Switch } from '@/components/ui/switch'
import { useI18n } from '@/composables/useI18n'
import { formatPreOrderItemWithAddons } from '@/lib/addon'
import { formatPrice } from '@/lib/format'
import { isDiningTableAvailable } from '@/lib/table'
import { buildInvoiceFromTransaction, type InvoiceData } from '@/lib/invoice'
import {
  confirmPreOrderPayment,
  formatPreOrderNumber,
  getPreOrderPaymentLabel,
  needsPreOrderPaymentConfirmation,
  processPreOrder,
} from '@/lib/pre-order'
import { getTransactionById } from '@/lib/transaction'
import { useAlertStore } from '@/stores/useAlertStore'
import type { PaymentMethod, PreOrderWithDetails } from '@/types/database'

const props = defineProps<{
  open: boolean
  preOrder: PreOrderWithDetails | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  processed: []
  paymentConfirmed: []
}>()

const { t } = useI18n()
const alertStore = useAlertStore()
const addToQueue = ref(true)
const tableNumber = ref('')
const isSubmitting = ref(false)
const paymentDialogOpen = ref(false)
const paymentDialogMode = ref<'confirm' | 'process'>('process')
const paymentSuccessDialogOpen = ref(false)
const paymentSuccessInvoice = ref<InvoiceData | null>(null)
const dialogStep = ref<'confirm' | 'process'>('process')

const items = computed(() => props.preOrder?.pre_order_items ?? [])

const isConfirmStep = computed(
  () => dialogStep.value === 'confirm' && props.preOrder && needsPreOrderPaymentConfirmation(props.preOrder),
)

const dialogTitle = computed(() =>
  isConfirmStep.value ? t('order.confirmPayTitle') : t('order.processTitle'),
)

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    addToQueue.value = true
    tableNumber.value = props.preOrder?.table_number ?? ''
    dialogStep.value =
      props.preOrder && needsPreOrderPaymentConfirmation(props.preOrder) ? 'confirm' : 'process'
  },
)

watch(
  () => props.preOrder,
  (preOrder) => {
    if (!props.open || !preOrder) return
    if (needsPreOrderPaymentConfirmation(preOrder)) {
      dialogStep.value = 'confirm'
      return
    }
    dialogStep.value = 'process'
  },
)

function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message)
  }

  return t('order.processFailed')
}

async function finishProcessEatFirst() {
  if (!props.preOrder) return

  const normalizedTableNumber = tableNumber.value.trim()
  if (normalizedTableNumber) {
    const { available, error: tableError } = await isDiningTableAvailable(normalizedTableNumber)
    if (tableError) {
      alertStore.showAlert(t('alert.error'), getErrorMessage(tableError), 'error')
      return
    }

    if (!available) {
      alertStore.showAlert(t('alert.error'), t('master.diningTableUnavailable'), 'error')
      return
    }
  }

  isSubmitting.value = true
  const { transaction, queueNumber, error } = await processPreOrder(props.preOrder.id, {
    addToQueue: addToQueue.value,
    tableNumber: tableNumber.value.trim() || null,
  })
  isSubmitting.value = false

  if (error) {
    alertStore.showAlert(t('alert.error'), getErrorMessage(error), 'error')
    return
  }

  if (!transaction) {
    alertStore.showAlert(t('alert.error'), t('order.transactionNotFound'), 'error')
    return
  }

  const queueLabel = queueNumber ? ` #${queueNumber}` : ''
  alertStore.showAlert(
    t('alert.success'),
    `${t('order.processWithoutPaySuccess')}${queueLabel}`,
    'success',
  )
  emit('update:open', false)
  emit('processed')
}

async function finishProcess(paymentMethod: PaymentMethod) {
  if (!props.preOrder) return

  isSubmitting.value = true
  const { transaction, queueNumber, error } = await processPreOrder(props.preOrder.id, {
    paymentMethod,
    addToQueue: addToQueue.value,
    tableNumber: tableNumber.value.trim() || null,
  })
  isSubmitting.value = false
  paymentDialogOpen.value = false

  if (error) {
    alertStore.showAlert(t('alert.error'), getErrorMessage(error), 'error')
    return
  }

  if (!transaction) {
    alertStore.showAlert(t('alert.error'), t('order.transactionNotFound'), 'error')
    return
  }

  const { transaction: transactionDetails, error: fetchError } = await getTransactionById(transaction.id)

  if (fetchError || !transactionDetails) {
    alertStore.showAlert(t('alert.error'), fetchError?.message ?? t('order.loadTransactionFailed'), 'error')
    emit('update:open', false)
    emit('processed')
    return
  }

  paymentSuccessInvoice.value = buildInvoiceFromTransaction(
    transactionDetails,
    paymentMethod,
    { queueNumber, paidAt: transaction.paid_at ?? new Date().toISOString() },
  )
  paymentSuccessDialogOpen.value = true
  emit('update:open', false)
  emit('processed')
}

async function handlePayment(method: PaymentMethod) {
  if (paymentDialogMode.value === 'confirm') {
    if (!props.preOrder) return

    isSubmitting.value = true
    const { error } = await confirmPreOrderPayment(props.preOrder.id, method)
    isSubmitting.value = false
    paymentDialogOpen.value = false

    if (error) {
      alertStore.showAlert(t('alert.error'), getErrorMessage(error), 'error')
      return
    }

    alertStore.showAlert(t('alert.success'), t('order.paymentConfirmSuccess'), 'success')
    dialogStep.value = 'process'
    emit('paymentConfirmed')
    return
  }

  await finishProcess(method)
}

function openConfirmPaymentDialog() {
  paymentDialogMode.value = 'confirm'
  paymentDialogOpen.value = true
}

function handleProcessClick() {
  if (!props.preOrder) return

  if (props.preOrder.payment_choice === 'pay_now') {
    const method = props.preOrder.confirmed_payment_method
    if (!method) {
      alertStore.showAlert(t('alert.error'), t('order.paymentConfirmRequired'), 'error')
      return
    }
    finishProcess(method)
    return
  }

  finishProcessEatFirst()
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-[520px]">
      <DialogHeader>
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
        <DialogDescription v-if="preOrder">
          {{ formatPreOrderNumber(preOrder.order_number) }} · {{ getPreOrderPaymentLabel(preOrder) }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="preOrder" class="space-y-4">
        <div class="space-y-2">
          <p
            v-for="item in items"
            :key="item.id"
            class="rounded-lg border px-3 py-2 text-sm"
          >
            {{ formatPreOrderItemWithAddons(item) }}
            <span class="text-muted-foreground"> — {{ formatPrice(item.subtotal) }}</span>
          </p>
        </div>

        <div class="flex items-center justify-between border-t pt-4">
          <span class="text-sm text-muted-foreground">{{ t('common.total') }}</span>
          <span class="text-lg font-bold">{{ formatPrice(preOrder.total_amount) }}</span>
        </div>

        <template v-if="isConfirmStep">
          <p class="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-3 text-sm">
            {{ t('order.confirmPayDesc') }}
          </p>
        </template>

        <template v-else>
          <Field>
            <FieldLabel for="process-table-number">{{ t('order.processTable') }}</FieldLabel>
            <TableSelect
              id="process-table-number"
              v-model="tableNumber"
              :placeholder="t('common.optional')"
            />
          </Field>

          <div class="flex items-center justify-between rounded-lg border px-3 py-3">
            <div>
              <p class="text-sm font-medium">{{ t('order.addToQueue') }}</p>
              <p class="text-xs text-muted-foreground">{{ t('order.addToQueueDesc') }}</p>
            </div>
            <Switch v-model="addToQueue" />
          </div>

          <p class="text-sm text-muted-foreground">
            {{
              preOrder.payment_choice === 'pay_now'
                ? t('order.payNowConfirmedNote')
                : t('order.processWithoutPay')
            }}
          </p>
        </template>
      </div>

      <DialogFooter>
        <DialogClose as-child>
          <Button type="button" variant="outline">{{ t('common.cancel') }}</Button>
        </DialogClose>
        <Button
          v-if="isConfirmStep"
          :disabled="isSubmitting || !preOrder"
          @click="openConfirmPaymentDialog"
        >
          {{ isSubmitting ? t('order.processing') : t('order.confirmPayButton') }}
        </Button>
        <Button
          v-else
          :disabled="isSubmitting || !preOrder"
          @click="handleProcessClick"
        >
          {{
            isSubmitting
              ? t('order.processing')
              : preOrder?.payment_choice === 'pay_now'
                ? t('order.processQueueButton')
                : t('order.processToKitchen')
          }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <PaymentMethodDialog
    v-model:open="paymentDialogOpen"
    :transaction="null"
    :amount="preOrder?.total_amount ?? 0"
    @select="handlePayment"
  />

  <PaymentSuccessDialog
    v-model:open="paymentSuccessDialogOpen"
    :invoice="paymentSuccessInvoice"
  />
</template>
