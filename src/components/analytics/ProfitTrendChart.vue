<script setup lang="ts">
import type { ChartConfig } from '@/components/ui/chart'
import { VisAxis, VisGroupedBar, VisXYContainer } from '@unovis/vue'
import {
  ChartContainer,
  ChartCrosshair,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  componentToString,
} from '@/components/ui/chart'
import type { DailyAnalyticsRow } from '@/types/database'

defineProps<{
  data: DailyAnalyticsRow[]
}>()

const chartConfig = {
  revenue: {
    label: 'Pendapatan',
    color: 'var(--chart-1)',
  },
  cogs: {
    label: 'HPP',
    color: 'var(--chart-2)',
  },
  grossProfit: {
    label: 'Laba',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig

type Data = DailyAnalyticsRow

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}
</script>

<template>
  <ChartContainer :config="chartConfig" class="min-h-[300px] w-full" cursor>
    <VisXYContainer v-if="data.length" :data="data">
      <VisGroupedBar
        :x="(d: Data) => d.dateLabel"
        :y="[
          (d: Data) => d.revenue,
          (d: Data) => d.cogs,
          (d: Data) => d.grossProfit,
        ]"
        :color="[
          chartConfig.revenue.color!,
          chartConfig.cogs.color!,
          chartConfig.grossProfit.color!,
        ]"
        :rounded-corners="4"
        bar-padding="0.12"
        group-padding="0.08"
      />
      <VisAxis
        type="x"
        :x="(d: Data) => d.dateLabel"
        :tick-line="false"
        :domain-line="false"
        :grid-line="false"
      />
      <VisAxis
        type="y"
        :tick-format="(d: number) => formatCurrency(d)"
        :tick-line="false"
        :domain-line="false"
        :grid-line="true"
      />
      <ChartTooltip />
      <ChartCrosshair
        :template="componentToString(chartConfig, ChartTooltipContent, {
          labelFormatter(d) {
            return String(d)
          },
        })"
        :color="[
          chartConfig.revenue.color!,
          chartConfig.cogs.color!,
          chartConfig.grossProfit.color!,
        ]"
      />
    </VisXYContainer>
    <div
      v-else
      class="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground"
    >
      Belum ada penjualan dalam periode ini.
    </div>
    <ChartLegendContent v-if="data.length" />
  </ChartContainer>
</template>
