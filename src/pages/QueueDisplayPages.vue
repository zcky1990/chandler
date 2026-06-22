<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getActiveQueues, subscribeActiveQueues } from '@/lib/queue'
import type { OrderQueueWithDetails, QueueStatus } from '@/types/database'

const queues = ref<OrderQueueWithDetails[]>([])
const isLoading = ref(true)

let unsubscribeRealtime: (() => void) | null = null

const statusLabels: Record<QueueStatus, string> = {
  waiting: 'Menunggu',
  preparing: 'Disiapkan',
  ready: 'Siap',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}

const statusClass: Record<QueueStatus, string> = {
  waiting: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
  preparing: 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200',
  ready: 'bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-200',
  completed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-muted text-muted-foreground',
}

function formatQueueNumber(number: number) {
  return `#${String(number).padStart(3, '0')}`
}

function formatItems(queue: OrderQueueWithDetails) {
  return (queue.transactions?.transaction_items ?? [])
    .map((item) => `${item.products?.name ?? 'Produk'} x${item.quantity}`)
    .join(', ')
}

async function loadQueues(options?: { silent?: boolean }) {
  if (!options?.silent) {
    isLoading.value = true
  }

  const { queues: data, error } = await getActiveQueues()
  isLoading.value = false

  if (!error) {
    queues.value = data ?? []
  }
}

onMounted(async () => {
  await loadQueues()

  unsubscribeRealtime = subscribeActiveQueues(
    () => loadQueues({ silent: true }),
    undefined,
    'order_queues_display',
  )
})

onUnmounted(() => {
  unsubscribeRealtime?.()
  unsubscribeRealtime = null
})
</script>

<template>
  <div class="min-h-svh w-full bg-background">
    <Table>
      <TableHeader>
        <TableRow class="hover:bg-transparent">
          <TableHead class="h-14 text-lg font-semibold">No. Antrian</TableHead>
          <TableHead class="h-14 text-lg font-semibold">Pelanggan</TableHead>
          <TableHead class="h-14 text-lg font-semibold">Meja</TableHead>
          <TableHead class="h-14 text-lg font-semibold">Pesanan</TableHead>
          <TableHead class="h-14 text-lg font-semibold">Catatan</TableHead>
          <TableHead class="h-14 text-lg font-semibold">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-if="isLoading">
          <TableCell colspan="6" class="h-24 text-center text-lg text-muted-foreground">
            Memuat antrian...
          </TableCell>
        </TableRow>
        <TableRow v-else-if="!queues.length">
          <TableCell colspan="6" class="h-24 text-center text-lg text-muted-foreground">
            Tidak ada antrian aktif.
          </TableCell>
        </TableRow>
        <TableRow
          v-for="queue in queues"
          :key="queue.id"
          class="text-base"
        >
          <TableCell class="py-4 text-xl font-bold">
            {{ formatQueueNumber(queue.queue_number) }}
          </TableCell>
          <TableCell class="py-4 text-lg">
            {{ queue.transactions?.customers?.name ?? '-' }}
          </TableCell>
          <TableCell class="py-4 text-lg">
            {{ queue.table_number ?? '-' }}
          </TableCell>
          <TableCell class="max-w-xl py-4 text-lg">
            {{ formatItems(queue) || '-' }}
          </TableCell>
          <TableCell class="max-w-md py-4 text-lg text-muted-foreground">
            <span v-if="queue.transactions?.notes" class="text-foreground">
              {{ queue.transactions.notes }}
            </span>
            <span v-else>-</span>
          </TableCell>
          <TableCell class="py-4">
            <span
              class="inline-flex rounded-md px-3 py-1 text-base font-medium"
              :class="statusClass[queue.status]"
            >
              {{ statusLabels[queue.status] }}
            </span>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
