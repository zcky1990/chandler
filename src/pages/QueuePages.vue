<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Check, ChefHat, ClipboardList, Monitor, Radio } from '@lucide/vue'
import QueueCard from '@/components/queue/QueueCard.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { queueStatusLabels, useActiveQueues, useQueueFilter } from '@/composables/useActiveQueues'
import { completeQueue, markQueueReady, pickupQueue } from '@/lib/queue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { useAlertStore } from '@/stores/useAlertStore'

const alertStore = useAlertStore()
const isUpdating = ref(false)

const { queues, isLoading, isRealtimeConnected, loadQueues } = useActiveQueues()
const {
  activeFilter,
  filterOptions,
  filteredQueues,
  waitingCount,
  preparingCount,
  readyCount,
} = useQueueFilter(() => queues.value)

async function handlePickup(queueId: string) {
  isUpdating.value = true
  const { error } = await pickupQueue(queueId)
  isUpdating.value = false

  if (error) {
    alertStore.showAlert('Error', error.message, 'error')
    return
  }

  alertStore.showAlert('Berhasil', 'Antrian mulai disiapkan', 'success')
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
}
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
            <span
              v-if="isRealtimeConnected"
              class="ml-2 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300"
            >
              <Radio class="size-3" />
              Live
            </span>
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <Button variant="outline" :disabled="isLoading" @click="loadQueues">
            Refresh
          </Button>
          <Button variant="outline" as-child>
            <RouterLink :to="{ name: 'queue-display' }" target="_blank" rel="noopener noreferrer">
              <Monitor class="size-4" />
              Layar Antrian
            </RouterLink>
          </Button>
        </div>
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
        <QueueCard
          v-for="queue in filteredQueues"
          :key="queue.id"
          :queue="queue"
          :status-label="queueStatusLabels[queue.status]"
          :is-updating="isUpdating"
          @pickup="handlePickup"
          @mark-ready="handleMarkReady"
          @complete="handleComplete"
        />
      </div>
    </div>
  </DashboardLayout>
</template>
