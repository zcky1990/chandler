<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { Inbox, Radio } from '@lucide/vue'
import PreOrderCard from '@/components/order/PreOrderCard.vue'
import PreOrderEditDialog from '@/components/order/PreOrderEditDialog.vue'
import ProcessPreOrderDialog from '@/components/order/ProcessPreOrderDialog.vue'
import { Button } from '@/components/ui/button'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { useI18n } from '@/composables/useI18n'
import { cancelPreOrder, formatPreOrderNumber, getPendingPreOrders, subscribePendingPreOrders, type PreOrderRealtimeChange } from '@/lib/pre-order'
import { playNewOrderSound, unlockNotificationSound } from '@/lib/notification-sound'
import { useAlertStore } from '@/stores/useAlertStore'
import type { PreOrderWithDetails } from '@/types/database'

const { t } = useI18n()
const alertStore = useAlertStore()
const preOrders = ref<PreOrderWithDetails[]>([])
const isLoading = ref(true)
const isRealtimeConnected = ref(false)
const processDialogOpen = ref(false)
const editDialogOpen = ref(false)
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
      alertStore.showAlert(t('alert.error'), error.message, 'error')
    }
    return
  }

  preOrders.value = data ?? []
}

function isNewPendingOrder(change: PreOrderRealtimeChange) {
  if (change.eventType !== 'INSERT') return false
  return change.newRecord?.status === 'pending'
}

function notifyNewPreOrder(change: PreOrderRealtimeChange) {
  const orderNumber = Number(change.newRecord?.order_number ?? 0)
  playNewOrderSound()
  alertStore.showAlert(
    t('order.newOrderTitle'),
    t('order.newOrderDesc', { number: formatPreOrderNumber(orderNumber) }),
    'success',
  )
}

function handlePreOrderRealtime(change?: PreOrderRealtimeChange) {
  if (change && isNewPendingOrder(change)) {
    notifyNewPreOrder(change)
  }
  loadPreOrders({ silent: true })
}

function onRefresh() {
  unlockNotificationSound()
  loadPreOrders()
}

function syncSelectedPreOrder() {
  if (!selectedPreOrder.value) return
  selectedPreOrder.value = preOrders.value.find((order) => order.id === selectedPreOrder.value?.id) ?? null
}

async function handlePaymentConfirmed() {
  await loadPreOrders({ silent: true })
  syncSelectedPreOrder()
}

function openProcessDialog(preOrder: PreOrderWithDetails) {
  unlockNotificationSound()
  selectedPreOrder.value = preOrder
  processDialogOpen.value = true
}

function openEditDialog(preOrder: PreOrderWithDetails) {
  selectedPreOrder.value = preOrder
  editDialogOpen.value = true
}

function handlePreOrderEdited(preOrder: PreOrderWithDetails) {
  const index = preOrders.value.findIndex((order) => order.id === preOrder.id)
  if (index >= 0) {
    preOrders.value[index] = preOrder
  }
  selectedPreOrder.value = preOrder
}

function handleEditFromProcess() {
  if (!selectedPreOrder.value) return
  editDialogOpen.value = true
}

async function handleCancel(preOrderId: string) {
  if (!confirm(t('order.cancelConfirm'))) return

  const { error } = await cancelPreOrder(preOrderId)
  if (error) {
    alertStore.showAlert(t('alert.error'), error.message, 'error')
    return
  }

  alertStore.showAlert(t('alert.success'), t('order.cancelled'), 'success')
  await loadPreOrders({ silent: true })
}

onMounted(async () => {
  await loadPreOrders()

  unsubscribeRealtime = subscribePendingPreOrders(
    handlePreOrderRealtime,
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
            {{ t('order.inboxTitle') }}
          </h1>
          <p class="text-sm text-muted-foreground">
            {{ t('order.inboxSubtitle') }}
            <span
              v-if="isRealtimeConnected"
              class="ml-2 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300"
            >
              <Radio class="size-3" />
              {{ t('common.live') }}
            </span>
          </p>
        </div>
        <Button variant="outline" :disabled="isLoading" @click="onRefresh">
          {{ t('common.refresh') }}
        </Button>
      </div>

      <div v-if="isLoading" class="text-sm text-muted-foreground">
        {{ t('order.loadingOrders') }}
      </div>

      <div
        v-else-if="!preOrders.length"
        class="rounded-xl border border-dashed px-4 py-12 text-center text-sm text-muted-foreground"
      >
        {{ t('order.noOrders') }}
      </div>

      <div v-else class="grid gap-3 lg:grid-cols-2">
        <PreOrderCard
          v-for="preOrder in preOrders"
          :key="preOrder.id"
          :pre-order="preOrder"
          @edit="openEditDialog(preOrder)"
          @process="openProcessDialog(preOrder)"
          @cancel="handleCancel(preOrder.id)"
        />
      </div>

      <PreOrderEditDialog
        v-model:open="editDialogOpen"
        :pre-order="selectedPreOrder"
        @saved="handlePreOrderEdited"
      />

      <ProcessPreOrderDialog
        v-model:open="processDialogOpen"
        :pre-order="selectedPreOrder"
        @processed="loadPreOrders({ silent: true })"
        @payment-confirmed="handlePaymentConfirmed"
        @edit="handleEditFromProcess"
      />
    </div>
  </DashboardLayout>
</template>
