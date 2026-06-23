<script setup lang="ts">
import { computed } from 'vue'
import type { ChartConfig } from '@/components/ui/chart'
import { VisDonut, VisSingleContainer } from '@unovis/vue'
import { ChartContainer } from '@/components/ui/chart'
import { useI18n } from '@/composables/useI18n'
import type { AnalyticsSummary } from '@/types/database'

const props = defineProps<{
  summary: AnalyticsSummary
}>()

const { t, locale } = useI18n()

const dateLocale = computed(() => (locale.value === 'en' ? 'en-US' : 'id-ID'))

type Slice = {
  key: string
  label: string
  value: number
  fill: string
}

const chartConfig = computed(() => ({
  hpp: { label: t('analytics.chartHppCost'), color: 'var(--chart-2)' },
  profit: { label: t('analytics.grossProfit'), color: 'var(--chart-3)' },
}) satisfies ChartConfig)

const chartData = computed<Slice[]>(() => {
  const hpp = Math.max(props.summary.cogs, 0)
  const profit = Math.max(props.summary.grossProfit, 0)

  if (hpp === 0 && profit === 0) return []

  return [
    { key: 'hpp', label: t('analytics.chartCogsShort'), value: hpp, fill: chartConfig.value.hpp.color! },
    { key: 'profit', label: t('analytics.grossProfit'), value: profit, fill: chartConfig.value.profit.color! },
  ]
})

const centralLabel = computed(() => {
  return new Intl.NumberFormat(dateLocale.value, {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    notation: 'compact',
  }).format(props.summary.revenue)
})
</script>

<template>
  <ChartContainer :config="chartConfig" class="min-h-[280px] w-full">
    <VisSingleContainer v-if="chartData.length" :data="chartData">
      <VisDonut
        :value="(d: Slice) => d.value"
        :color="(d: Slice) => d.fill"
        :arc-width="36"
        :central-label="centralLabel"
        :central-sub-label="t('analytics.revenueLabel')"
      />
    </VisSingleContainer>
    <div
      v-else
      class="flex min-h-[280px] items-center justify-center text-sm text-muted-foreground"
    >
      {{ t('analytics.noRevenue') }}
    </div>
  </ChartContainer>
</template>
