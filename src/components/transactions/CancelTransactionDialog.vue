<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { AlertTriangle } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/composables/useI18n'
import { cancelTransaction } from '@/lib/transaction'
import { formatPrice } from '@/lib/format'
import { getPaymentMethodLabel } from '@/lib/invoice'
import { useAlertStore } from '@/stores/useAlertStore'
import type { TransactionWithDetails } from '@/types/database'

const props = defineProps<{
  open: boolean
  transaction: TransactionWithDetails | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  cancelled: []
}>()

const { t } = useI18n()
const alertStore = useAlertStore()
const reason = ref('')
const isSubmitting = ref(false)

const isPaid = computed(() => !!props.transaction?.is_paid)

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      reason.value = ''
      isSubmitting.value = false
    }
  },
)

async function handleConfirm() {
  if (!props.transaction) return

  const trimmedReason = reason.value.trim()
  if (!trimmedReason) {
    alertStore.showAlert(t('alert.error'), t('validation.cancelReasonRequired'), 'error')
    return
  }

  isSubmitting.value = true
  const { error } = await cancelTransaction(props.transaction.id, { reason: trimmedReason })
  isSubmitting.value = false

  if (error) {
    const message = typeof error === 'object' && error && 'message' in error
      ? String((error as { message: string }).message)
      : t('transaction.cancelFailed')
    alertStore.showAlert(t('alert.error'), message, 'error')
    return
  }

  alertStore.showAlert(t('alert.success'), t('transaction.cancelled'), 'success')
  emit('update:open', false)
  emit('cancelled')
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[480px]">
      <DialogHeader>
        <DialogTitle>{{ t('transaction.cancelTitle') }}</DialogTitle>
        <DialogDescription v-if="transaction">
          {{ t('transaction.cancelDesc', { amount: formatPrice(transaction.total_amount) }) }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="transaction" class="space-y-4">
        <div
          v-if="isPaid"
          class="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm"
        >
          <AlertTriangle class="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p class="text-amber-900 dark:text-amber-100">
            {{
              t('transaction.cancelPaidWarning', {
                method: transaction.payment_method
                  ? getPaymentMethodLabel(transaction.payment_method)
                  : t('status.paid'),
              })
            }}
          </p>
        </div>

        <div class="rounded-xl border px-4 py-3 text-sm">
          <p class="text-muted-foreground">{{ t('transaction.cancelEffects') }}</p>
          <ul class="mt-2 list-disc space-y-1 pl-5">
            <li>{{ t('transaction.cancelEffectStock') }}</li>
            <li>{{ t('transaction.cancelEffectStatus') }}</li>
            <li>{{ t('transaction.cancelEffectQueue') }}</li>
            <li>{{ t('transaction.cancelEffectAudit') }}</li>
          </ul>
        </div>

        <div class="space-y-2">
          <Label for="cancel-reason">{{ t('transaction.cancelReason') }}</Label>
          <Textarea
            id="cancel-reason"
            v-model="reason"
            :placeholder="t('transaction.cancelReasonPlaceholder')"
            rows="3"
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" :disabled="isSubmitting" @click="emit('update:open', false)">
          {{ t('common.back') }}
        </Button>
        <Button
          type="button"
          variant="destructive"
          :disabled="isSubmitting || !reason.trim()"
          @click="handleConfirm"
        >
          {{ isSubmitting ? t('common.processing') : t('transaction.confirmCancel') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
