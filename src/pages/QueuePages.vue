<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ChefHat, Check, ClipboardList, Play } from '@lucide/vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  completeQueue,
  getActiveQueues,
  markQueueReady,
  pickupQueue,
} from '@/lib/queue'
import { useAlertStore } from '@/stores/useAlertStore'
import type { OrderQueueWithDetails, QueueStatus } from '@/types/database'

type FilterStatus = QueueStatus | 'all'

const alertStore = useAlertStore()
const queues = ref<OrderQueueWithDetails[]>([])
const isLoading = ref(true)
const isUpdating = ref(false)
const activeFilter = ref<FilterStatus>('all')

const statusLabels: Record<QueueStatus, string> = {
  waiting: 'Menunggu',
  preparing: 'Disiapkan',
  ready: 'Siap',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}

const filterOptions: { value: FilterStatus, label: string }[] = [
  { value: 'all', label: 'Semua Aktif' },
  { value: 'waiting', label: 'Menunggu' },
  { value: 'preparing', label: 'Disiapkan' },
  { value: 'ready', label: 'Siap' },
]

const filteredQueues = computed(() => {
  if (activeFilter.value === 'all') {
    return queues.value
  }

  return queues.value.filter((queue) => queue.status === activeFilter.value)
})

const waitingCount = computed(() => queues.value.filter((queue) => queue.status === 'waiting').length)
const preparingCount = computed(() => queues.value.filter((queue) => queue.status === 'preparing').length)
const readyCount = computed(() => queues.value.filter((queue) => queue.status === 'ready').length)

function formatQueueNumber(number: number) {
  return `#${String(number).padStart(3, '0')}`
}

function formatItems(queue: OrderQueueWithDetails) {
  return (queue.transactions?.transaction_items ?? [])
    .map((item) => `${item.products?.name ?? 'Produk'} x${item.quantity}`)
    .join(', ')
}

async function loadQueues() {
  isLoading.value = true
  const { queues: data, error } = await getActiveQueues()
  isLoading.value = false

  if (error) {
    alertStore.showAlert('Error', error.message, 'error')
    return
  }

  queues.value = data ?? []
}

async function handlePickup(queueId: string) {
  isUpdating.value = true
  const { error } = await pickupQueue(queueId)
  isUpdating.value = false

  if (error) {
    alertStore.showAlert('Error', error.message, 'error')
    return
  }

  alertStore.showAlert('Berhasil', 'Antrian mulai disiapkan', 'success')
  await loadQueues()
}

async function handleMarkReady(queueId: string) {
  isUpdating.value = true
  const { error } = await markQueueReady(queueId)
  isUpdating.value = false

  if (error) {
    alertStore.showAlert('Error', error.message, 'error')
    return
  }

  alertStore.showAlert('Berhasil', 'Pesanan siap diambil', 'success')
  await loadQueues()
}

async function handleComplete(queueId: string) {
  isUpdating.value = true
  const { error } = await completeQueue(queueId)
  isUpdating.value = false

  if (error) {
    alertStore.showAlert('Error', error.message, 'error')
    return
  }

  alertStore.showAlert('Berhasil', 'Antrian selesai', 'success')
  await loadQueues()
}

onMounted(loadQueues)
</script>

<template>
  <DashboardLayout>
    <div class="flex flex-col gap-6 p-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <ClipboardList class="size-6" />
            Antrian
          </h1>
          <p class="text-sm text-muted-foreground">
            Kelola pesanan yang perlu disiapkan.
          </p>
        </div>
        <Button variant="outline" :disabled="isLoading" @click="loadQueues">
          Refresh
        </Button>
      </div>

      <div class="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent class="p-4">
            <p class="text-sm text-muted-foreground">Menunggu</p>
            <p class="text-2xl font-bold">{{ waitingCount }}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="p-4">
            <p class="text-sm text-muted-foreground">Disiapkan</p>
            <p class="text-2xl font-bold">{{ preparingCount }}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="p-4">
            <p class="text-sm text-muted-foreground">Siap</p>
            <p class="text-2xl font-bold">{{ readyCount }}</p>
          </CardContent>
        </Card>
      </div>

      <div class="flex flex-wrap gap-2">
        <Button
          v-for="option in filterOptions"
          :key="option.value"
          size="sm"
          :variant="activeFilter === option.value ? 'default' : 'outline'"
          @click="activeFilter = option.value"
        >
          {{ option.label }}
        </Button>
      </div>

      <div v-if="isLoading" class="text-sm text-muted-foreground">
        Memuat antrian...
      </div>

      <div
        v-else-if="!filteredQueues.length"
        class="rounded-xl border border-dashed px-4 py-12 text-center text-sm text-muted-foreground"
      >
        Tidak ada antrian aktif.
      </div>

      <div v-else class="grid gap-3 lg:grid-cols-2">
        <Card
          v-for="queue in filteredQueues"
          :key="queue.id"
          class="gap-0 py-0"
        >
          <CardHeader class="border-b px-4 py-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <CardTitle class="text-xl">
                  {{ formatQueueNumber(queue.queue_number) }}
                </CardTitle>
                <p class="mt-1 text-sm text-muted-foreground">
                  {{ queue.transactions?.customers?.name ?? 'Pembeli tidak diketahui' }}
                  <span v-if="queue.table_number"> · Meja {{ queue.table_number }}</span>
                </p>
              </div>
              <span class="rounded-md border px-2 py-1 text-xs font-medium">
                {{ statusLabels[queue.status] }}
              </span>
            </div>
          </CardHeader>

          <CardContent class="space-y-4 p-4">
            <div>
              <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Item Pesanan
              </p>
              <p class="mt-1 text-sm">
                {{ formatItems(queue) || '-' }}
              </p>
            </div>

            <p
              v-if="queue.transactions?.notes"
              class="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground"
            >
              {{ queue.transactions.notes }}
            </p>

            <div class="flex flex-wrap gap-2">
              <Button
                v-if="queue.status === 'waiting'"
                size="sm"
                :disabled="isUpdating"
                @click="handlePickup(queue.id)"
              >
                <Play class="size-4" />
                Pickup
              </Button>
              <Button
                v-if="queue.status === 'preparing'"
                size="sm"
                variant="secondary"
                :disabled="isUpdating"
                @click="handleMarkReady(queue.id)"
              >
                <ChefHat class="size-4" />
                Siap
              </Button>
              <Button
                v-if="queue.status === 'ready'"
                size="sm"
                variant="outline"
                :disabled="isUpdating"
                @click="handleComplete(queue.id)"
              >
                <Check class="size-4" />
                Selesai
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </DashboardLayout>
</template>
