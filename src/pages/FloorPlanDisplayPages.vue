<script setup lang="ts">
import { Radio } from '@lucide/vue'
import FloorPlanCanvas from '@/components/floor/FloorPlanCanvas.vue'
import { useFloorOccupancy } from '@/composables/useFloorOccupancy'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

const {
  canvasTables,
  occupancyByLabel,
  isLoading,
  isRealtimeConnected,
} = useFloorOccupancy({ channelName: 'floor_plan_display' })

const legendItems = [
  { status: 'free', class: 'bg-background border-border' },
  { status: 'waiting', class: 'bg-amber-500/20 border-amber-500' },
  { status: 'preparing', class: 'bg-blue-500/20 border-blue-500' },
  { status: 'ready', class: 'bg-emerald-500/20 border-emerald-500' },
  { status: 'serving', class: 'bg-violet-500/20 border-violet-500' },
  { status: 'occupied', class: 'bg-rose-500/20 border-rose-500' },
  { status: 'reserved', class: 'bg-cyan-500/20 border-cyan-500' },
] as const

function legendLabel(status: (typeof legendItems)[number]['status']) {
  if (status === 'waiting') return t('status.waiting')
  if (status === 'preparing') return t('status.preparing')
  if (status === 'ready') return t('status.ready')
  if (status === 'serving') return t('status.serving')
  if (status === 'occupied') return t('floor.legendOccupied')
  if (status === 'reserved') return t('floor.legendReserved')
  return t('floor.legendFree')
}
</script>

<template>
  <div class="min-h-svh w-full bg-background p-5 md:p-10">
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-col gap-1">
        <h1 class="text-2xl font-bold tracking-tight md:text-3xl">{{ t('floor.viewTitle') }}</h1>
        <span
          v-if="isRealtimeConnected"
          class="inline-flex w-fit items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300"
        >
          <Radio class="size-3" />
          {{ t('common.live') }}
        </span>
      </div>
      <div class="flex flex-wrap gap-4 text-sm md:text-base">
        <span
          v-for="item in legendItems"
          :key="item.status"
          class="inline-flex items-center gap-2"
        >
          <span class="size-4 rounded border-2" :class="item.class" />
          {{ legendLabel(item.status) }}
        </span>
      </div>
    </div>

    <p v-if="isLoading" class="text-base text-muted-foreground">
      {{ t('common.loading') }}
    </p>
    <p v-else-if="!canvasTables.length" class="text-base text-muted-foreground">
      {{ t('floor.noTables') }}
    </p>

    <FloorPlanCanvas
      v-else
      :tables="canvasTables"
      :occupancy-by-label="occupancyByLabel"
    />
  </div>
</template>
