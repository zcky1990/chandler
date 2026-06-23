import { computed, onMounted, onUnmounted, ref } from 'vue'
import { getActiveQueues, subscribeActiveQueues } from '@/lib/queue'
import { useAlertStore } from '@/stores/useAlertStore'
import type { OrderQueueWithDetails, QueueStatus } from '@/types/database'

export type QueueFilterStatus = QueueStatus | 'all'

export const queueStatusLabels: Record<QueueStatus, string> = {
  waiting: 'Menunggu',
  preparing: 'Disiapkan',
  ready: 'Siap',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}

export function useActiveQueues(options?: { silentErrors?: boolean }) {
  const alertStore = useAlertStore()
  const queues = ref<OrderQueueWithDetails[]>([])
  const isLoading = ref(true)
  const isRealtimeConnected = ref(false)

  let unsubscribeRealtime: (() => void) | null = null

  async function loadQueues(loadOptions?: { silent?: boolean }) {
    if (!loadOptions?.silent) {
      isLoading.value = true
    }

    const { queues: data, error } = await getActiveQueues()
    isLoading.value = false

    if (error) {
      if (!loadOptions?.silent && !options?.silentErrors) {
        alertStore.showAlert('Error', error.message, 'error')
      }
      return
    }

    queues.value = data ?? []
  }

  onMounted(async () => {
    await loadQueues()

    unsubscribeRealtime = subscribeActiveQueues(
      () => loadQueues({ silent: true }),
      (status) => {
        isRealtimeConnected.value = status === 'SUBSCRIBED'
      },
    )
  })

  onUnmounted(() => {
    unsubscribeRealtime?.()
    unsubscribeRealtime = null
  })

  return {
    queues,
    isLoading,
    isRealtimeConnected,
    loadQueues,
  }
}

export function useQueueFilter(queues: () => OrderQueueWithDetails[]) {
  const activeFilter = ref<QueueFilterStatus>('all')

  const filterOptions: { value: QueueFilterStatus, label: string }[] = [
    { value: 'all', label: 'Semua Aktif' },
    { value: 'waiting', label: 'Menunggu' },
    { value: 'preparing', label: 'Disiapkan' },
    { value: 'ready', label: 'Siap' },
  ]

  const filteredQueues = computed(() => {
    if (activeFilter.value === 'all') {
      return queues()
    }

    return queues().filter((queue) => queue.status === activeFilter.value)
  })

  const waitingCount = computed(() => queues().filter((queue) => queue.status === 'waiting').length)
  const preparingCount = computed(() => queues().filter((queue) => queue.status === 'preparing').length)
  const readyCount = computed(() => queues().filter((queue) => queue.status === 'ready').length)

  return {
    activeFilter,
    filterOptions,
    filteredQueues,
    waitingCount,
    preparingCount,
    readyCount,
  }
}
