<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { Inbox, Radio } from '@lucide/vue'
import PreOrderCard from '@/components/order/PreOrderCard.vue'
import ProcessPreOrderDialog from '@/components/order/ProcessPreOrderDialog.vue'
import { Button } from '@/components/ui/button'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { cancelPreOrder, getPendingPreOrders, subscribePendingPreOrders } from '@/lib/pre-order'
import { useAlertStore } from '@/stores/useAlertStore'
import type { PreOrderWithDetails } from '@/types/database'

const alertStore = useAlertStore()
const preOrders = ref<PreOrderWithDetails[]>([])
const isLoading = ref(true)
const isRealtimeConnected = ref(false)
const processDialogOpen = ref(false)
const selectedPreOrder = ref<PreOrderWithDetails | null>(null)

let unsubscribeRealtime: (() => void) | null = null

async function loadPreOrders(options?: { silent?: boolean }) {
  if (!options?.silent) {
    isLoading.value = true
  }

  const { preOrders: data, error } = await getPendingPreOrders()
  isLoading.value = false

  if (error) {
    if (!options?.silent) {
      alertStore.showAlert('Error', error.message, 'error')
    }
    return
  }

  preOrders.value = data ?? []
}

function openProcessDialog(preOrder: PreOrderWithDetails) {
  selectedPreOrder.value = preOrder
  processDialogOpen.value = true
}

async function handleCancel(preOrderId: string) {
  if (!confirm('Batalkan pesanan ini?')) return

  const { error } = await cancelPreOrder(preOrderId)
  if (error) {
    alertStore.showAlert('Error', error.message, 'error')
    return
  }

  alertStore.showAlert('Berhasil', 'Pesanan dibatalkan', 'success')
  await loadPreOrders({ silent: true })
}

onMounted(async () => {
  await loadPreOrders()

  unsubscribeRealtime = subscribePendingPreOrders(
    () => loadPreOrders({ silent: true }),
    (status) => {
      isRealtimeConnected.value = status === 'SUBSCRIBED'
    },
  )
})

onUnmounted(() => {
  unsubscribeRealtime?.()
  unsubscribeRealtime = null
})
</script>

<template>
  <DashboardLayout>
    <div class="flex flex-col gap-6 p-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Inbox class="size-6" />
            Pesanan Masuk
          </h1>
          <p class="text-sm text-muted-foreground">
            Pesanan dari halaman publik yang menunggu diproses.
            <span
              v-if="isRealtimeConnected"
              class="ml-2 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300"
            >
              <Radio class="size-3" />
              Live
            </span>
          </p>
        </div>
        <Button variant="outline" :disabled="isLoading" @click="loadPreOrders">
          Refresh
        </Button>
      </div>

      <div v-if="isLoading" class="text-sm text-muted-foreground">
        Memuat pesanan...
      </div>

      <div
        v-else-if="!preOrders.length"
        class="rounded-xl border border-dashed px-4 py-12 text-center text-sm text-muted-foreground"
      >
        Tidak ada pesanan masuk.
      </div>

      <div v-else class="grid gap-3 lg:grid-cols-2">
        <PreOrderCard
          v-for="preOrder in preOrders"
          :key="preOrder.id"
          :pre-order="preOrder"
          @process="openProcessDialog(preOrder)"
          @cancel="handleCancel(preOrder.id)"
        />
      </div>

      <ProcessPreOrderDialog
        v-model:open="processDialogOpen"
        :pre-order="selectedPreOrder"
        @processed="loadPreOrders({ silent: true })"
      />
    </div>
  </DashboardLayout>
</template>
