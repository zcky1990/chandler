<script setup lang="ts">
import { computed, ref } from 'vue'
import { Banknote, Pencil, Receipt } from '@lucide/vue'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { formatItemWithAddons } from '@/lib/addon'
import PaymentMethodDialog from '@/components/transactions/PaymentMethodDialog.vue'
import TransactionEditDialog from '@/components/transactions/TransactionEditDialog.vue'
import { markTransactionAsPaid } from '@/lib/transaction'
import { useAlertStore } from '@/stores/useAlertStore'
import type { CustomerTransactionSummary, PaymentMethod, TransactionWithDetails } from '@/types/database'

const props = defineProps<{
  open: boolean
  customer: CustomerTransactionSummary | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  refresh: []
}>()

const alertStore = useAlertStore()
const paymentDialogOpen = ref(false)
const editDialogOpen = ref(false)
const selectedTransaction = ref<TransactionWithDetails | null>(null)
const isPaying = ref(false)

const unpaidTransactions = computed(() =>
  (props.customer?.transactions ?? [])
    .filter((transaction) => !transaction.is_paid)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
)

const totalOutstanding = computed(() =>
  unpaidTransactions.value.reduce((sum, transaction) => sum + Number(transaction.total_amount), 0),
)

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

function formatItems(transaction: TransactionWithDetails) {
  return transaction.transaction_items
    .map((item) => formatItemWithAddons(item))
    .join(' · ')
}

function openPaymentDialog(transaction: TransactionWithDetails) {
  selectedTransaction.value = transaction
  paymentDialogOpen.value = true
}

function openEditDialog(transaction: TransactionWithDetails) {
  selectedTransaction.value = transaction
  editDialogOpen.value = true
}

async function handlePayment(method: PaymentMethod) {
  if (!selectedTransaction.value) return

  isPaying.value = true
  const { error } = await markTransactionAsPaid(selectedTransaction.value.id, method)
  isPaying.value = false
  paymentDialogOpen.value = false

  if (error) {
    alertStore.showAlert('Error', error.message, 'error')
    return
  }

  const methodLabel = method === 'qris' ? 'QRIS' : method === 'cash' ? 'Cash' : 'Transfer'
  alertStore.showAlert('Berhasil', `Pembayaran ${methodLabel} berhasil dicatat`, 'success')
  emit('refresh')
}

function handleSaved() {
  emit('refresh')
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
          {{ customer?.customerName }}
        </h2>
        <p class="mt-1 text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Profil Hutang Aktif
        </p>
      </div>

      <div class="max-h-[50vh] overflow-y-auto px-6 py-5">
        <p class="mb-4 text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase">
          Catatan Per Transaksi
        </p>

        <div v-if="!unpaidTransactions.length" class="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          Tidak ada hutang aktif untuk pembeli ini.
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="transaction in unpaidTransactions"
            :key="transaction.id"
            class="rounded-2xl border bg-background px-4 py-4"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0 flex-1">
                <p class="text-lg font-semibold">{{ formatShortDate(transaction.created_at) }}</p>
                <p class="mt-1 text-sm text-muted-foreground">
                  {{ formatItems(transaction) }}
                </p>
              </div>

              <div class="flex items-center gap-2">
                <p class="text-right text-lg font-bold whitespace-nowrap">
                  {{ formatPrice(transaction.total_amount) }}
                </p>
                <Button
                  size="icon"
                  variant="outline"
                  class="size-10 shrink-0 rounded-xl"
                  @click="openEditDialog(transaction)"
                >
                  <Pencil class="size-4" />
                </Button>
                <Button
                  size="icon"
                  class="size-10 shrink-0 rounded-xl"
                  :disabled="isPaying"
                  @click="openPaymentDialog(transaction)"
                >
                  <Banknote class="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 border-t px-6 py-5">
        <div>
          <p class="text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase">
            Jumlah Catatan
          </p>
          <p class="mt-1 text-2xl font-bold">
            {{ unpaidTransactions.length }}
            <span class="text-base font-medium text-muted-foreground">entri</span>
          </p>
        </div>
        <div class="text-right">
          <p class="text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase">
            Total Hutang
          </p>
          <p class="mt-1 text-3xl font-bold tracking-tight">
            {{ formatPrice(totalOutstanding) }}
          </p>
        </div>
      </div>
    </DialogContent>
  </Dialog>

  <PaymentMethodDialog
    v-model:open="paymentDialogOpen"
    :transaction="selectedTransaction"
    @select="handlePayment"
  />

  <TransactionEditDialog
    v-model:open="editDialogOpen"
    :transaction="selectedTransaction"
    @saved="handleSaved"
  />
</template>
