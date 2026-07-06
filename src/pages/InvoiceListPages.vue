<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ChevronLeft, ChevronRight, Eye, Printer } from '@lucide/vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import InvoicePreviewDialog from '@/components/invoice/InvoicePreviewDialog.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useI18n } from '@/composables/useI18n'
import { getTransactions } from '@/lib/transaction'
import { buildInvoiceFromTransaction, formatInvoiceDateTime, formatInvoiceNumber, getPaymentMethodLabel, type InvoiceData } from '@/lib/invoice'
import { printTransactionReceipt } from '@/lib/print-invoice'
import { formatPrice } from '@/lib/format'
import { WALK_IN_CUSTOMER_NAME } from '@/types/database'
import type { TransactionWithDetails } from '@/types/database'

type PaidTransaction = TransactionWithDetails & { _paid: true }

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const

const { t, locale } = useI18n()
const transactions = ref<TransactionWithDetails[]>([])
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref<number>(PAGE_SIZE_OPTIONS[1])
const isLoading = ref(true)
const previewDialogOpen = ref(false)
const previewInvoice = ref<InvoiceData | null>(null)

const dateLocale = computed(() => (locale.value === 'en' ? 'en-US' : 'id-ID'))

const paidTransactions = computed(() =>
  transactions.value.filter(
    (tx): tx is PaidTransaction => tx.is_paid === true && tx.payment_method != null
  )
)

const filteredTransactions = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return paidTransactions.value

  return paidTransactions.value.filter((tx) => {
    const invoiceNumber = formatInvoiceNumber(tx.id, tx.paid_at ?? tx.created_at).toLowerCase()
    const customerName = (tx.customers?.name ?? '').toLowerCase()
    return invoiceNumber.includes(query) || customerName.includes(query)
  })
})

const totalPages = computed(() =>
  Math.ceil(filteredTransactions.value.length / pageSize.value) || 1
)

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredTransactions.value.slice(start, start + pageSize.value)
})

function displayCustomerName(name: string | undefined | null) {
  if (!name) return '-'
  if (name === WALK_IN_CUSTOMER_NAME) return t('common.walkIn')
  return name
}

function goToPage(page: number) {
  currentPage.value = Math.max(1, Math.min(page, totalPages.value))
}

async function handleReprint(transaction: TransactionWithDetails) {
  await printTransactionReceipt(transaction)
}

function handlePreview(transaction: TransactionWithDetails) {
  if (!transaction.payment_method) return
  previewInvoice.value = buildInvoiceFromTransaction(transaction, transaction.payment_method, {
    paidAt: transaction.paid_at ?? undefined,
  })
  previewDialogOpen.value = true
}

onMounted(async () => {
  isLoading.value = true
  const { transactions: data, error } = await getTransactions()
  isLoading.value = false

  if (error) {
    transactions.value = []
    return
  }

  transactions.value = data ?? []
})
</script>

<template>
  <DashboardLayout>
    <div class="flex flex-col gap-6 p-6">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">{{ t('invoice.title') }}</h1>
        <p class="text-sm text-muted-foreground">
          {{ t('invoice.subtitle') }}
        </p>
      </div>

      <div v-if="isLoading" class="rounded-xl border px-4 py-10 text-center text-muted-foreground">
        {{ t('config.loading') }}
      </div>

      <template v-else>
        <div class="flex flex-wrap items-center gap-4">
          <Input
            v-model="searchQuery"
            :placeholder="t('common.search') + '...'"
            class="max-w-xs"
          />
        </div>

        <Card v-if="filteredTransactions.length === 0">
          <CardContent class="py-10 text-center text-muted-foreground">
            {{ t('invoice.noInvoices') }}
          </CardContent>
        </Card>

        <Card v-else>
          <CardHeader class="pb-2">
            <CardTitle class="text-base">
              {{ filteredTransactions.length }} {{ t('invoice.title').toLowerCase() }}
            </CardTitle>
          </CardHeader>
          <CardContent class="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{{ t('receipt.number') }}</TableHead>
                  <TableHead>{{ t('receipt.customer') }}</TableHead>
                  <TableHead>{{ t('receipt.date') }}</TableHead>
                  <TableHead class="text-right">{{ t('common.total') }}</TableHead>
                  <TableHead>{{ t('payment.method') }}</TableHead>
                  <TableHead class="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="tx in paginatedTransactions" :key="tx.id">
                  <TableCell class="font-mono text-xs">
                    {{ formatInvoiceNumber(tx.id, tx.paid_at ?? tx.created_at) }}
                  </TableCell>
                  <TableCell>{{ displayCustomerName(tx.customers?.name) }}</TableCell>
                  <TableCell class="text-xs text-muted-foreground">
                    {{ formatInvoiceDateTime(tx.paid_at ?? tx.created_at) }}
                  </TableCell>
                  <TableCell class="text-right font-medium">
                    {{ formatPrice(Number(tx.total_amount)) }}
                  </TableCell>
                  <TableCell>
                    {{ tx.payment_method ? getPaymentMethodLabel(tx.payment_method) : '-' }}
                  </TableCell>
                  <TableCell>
                    <div class="flex gap-1">
                      <Button size="icon-sm" variant="ghost" @click="handlePreview(tx)">
                        <Eye class="size-4" />
                      </Button>
                      <Button size="icon-sm" variant="ghost" @click="handleReprint(tx)">
                        <Printer class="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div v-if="totalPages > 1" class="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            :disabled="currentPage <= 1"
            @click="goToPage(currentPage - 1)"
          >
            <ChevronLeft class="size-4" />
          </Button>
          <span class="text-sm text-muted-foreground">
            {{ t('common.pageOf', { page: currentPage, total: totalPages }) }}
          </span>
          <Button
            variant="outline"
            size="sm"
            :disabled="currentPage >= totalPages"
            @click="goToPage(currentPage + 1)"
          >
            <ChevronRight class="size-4" />
          </Button>
        </div>
      </template>
    </div>

    <InvoicePreviewDialog
      v-model:open="previewDialogOpen"
      :invoice="previewInvoice"
    />
  </DashboardLayout>
</template>
