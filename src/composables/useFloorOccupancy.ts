import { computed, onMounted, onUnmounted, ref } from 'vue'
import { getFloorTables, getTableOccupancy, resolveFloorOccupancy, subscribeFloorOccupancy } from '@/lib/floor'
import { getDiningTables } from '@/lib/table'
import type { FloorTable, TableOccupancy } from '@/types/database'

const OCCUPANCY_RELOAD_DEBOUNCE_MS = 400
const POLL_INTERVAL_MS = 15_000

type UseFloorOccupancyOptions = {
  channelName?: string
  onTablesError?: (message: string) => void
}

export function useFloorOccupancy(options: UseFloorOccupancyOptions = {}) {
  const channelName = options.channelName ?? 'floor_plan_occupancy'

  const floorTables = ref<FloorTable[]>([])
  const occupancyByLabel = ref<Record<string, TableOccupancy>>({})
  const isLoading = ref(true)
  const isRealtimeConnected = ref(false)

  let unsubscribeRealtime: (() => void) | null = null
  let reloadTimer: ReturnType<typeof setTimeout> | null = null
  let pollTimer: ReturnType<typeof setInterval> | null = null

  const canvasTables = computed(() =>
    floorTables.value.map((table) => ({
      id: table.id,
      label: table.label,
      shape: table.shape,
      kind: table.kind,
      color: table.color,
      pos_x: table.pos_x,
      pos_y: table.pos_y,
      width: table.width,
      height: table.height,
      seats: table.seats,
    })),
  )

  function clearPoll() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  function startPoll() {
    if (pollTimer) {
      return
    }

    pollTimer = setInterval(() => {
      void loadOccupancy(true)
    }, POLL_INTERVAL_MS)
  }

  function scheduleOccupancyReload() {
    if (reloadTimer) {
      clearTimeout(reloadTimer)
    }

    reloadTimer = setTimeout(() => {
      reloadTimer = null
      void loadOccupancy(true)
    }, OCCUPANCY_RELOAD_DEBOUNCE_MS)
  }

  async function loadTables() {
    isLoading.value = true
    const { tables, error } = await getFloorTables()
    isLoading.value = false

    if (error) {
      options.onTablesError?.(error.message)
      return
    }

    floorTables.value = tables ?? []
  }

  async function loadOccupancy(silent = false) {
    if (!floorTables.value.length) {
      occupancyByLabel.value = {}
      return
    }

    if (!silent) {
      isLoading.value = true
    }

    const [{ occupancyByLabel: raw }, { tables: diningTables }] = await Promise.all([
      getTableOccupancy(),
      getDiningTables(),
    ])

    occupancyByLabel.value = resolveFloorOccupancy(
      floorTables.value,
      diningTables ?? [],
      raw,
    )

    if (!silent) {
      isLoading.value = false
    }
  }

  async function refresh() {
    await loadTables()
    await loadOccupancy(true)
    isLoading.value = false
  }

  onMounted(async () => {
    await loadTables()
    await loadOccupancy()

    unsubscribeRealtime = subscribeFloorOccupancy(
      scheduleOccupancyReload,
      (status) => {
        isRealtimeConnected.value = status === 'SUBSCRIBED'
        if (status === 'SUBSCRIBED') {
          clearPoll()
          return
        }

        startPoll()
      },
      channelName,
    )

    startPoll()
  })

  onUnmounted(() => {
    if (reloadTimer) {
      clearTimeout(reloadTimer)
    }
    clearPoll()
    unsubscribeRealtime?.()
    unsubscribeRealtime = null
  })

  return {
    floorTables,
    canvasTables,
    occupancyByLabel,
    isLoading,
    isRealtimeConnected,
    refresh,
  }
}
