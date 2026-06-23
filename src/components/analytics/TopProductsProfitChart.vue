<script setup lang="ts">
import { computed } from 'vue'
import type { ChartConfig } from '@/components/ui/chart'
import { Orientation } from '@unovis/ts'
import { VisAxis, VisGroupedBar, VisXYContainer } from '@unovis/vue'
import {
  ChartContainer,
  ChartCrosshair,
  ChartTooltip,
  ChartTooltipContent,
  componentToString,
} from '@/components/ui/chart'
import { useI18n } from '@/composables/useI18n'
import type { ProductAnalyticsRow } from '@/types/database'

const props = defineProps<{
  products: ProductAnalyticsRow[]
  limit?: number
}>()

const { t, locale } = useI18n()

const dateLocale = computed(() => (locale.value === 'en' ? 'en-US' : 'id-ID'))

const chartConfig = computed(() => ({
  grossProfit: {
    label: t('analytics.grossProfit'),
    color: 'var(--chart-1)',
  },
}) satisfies ChartConfig)

type Data = {
  name: string
  grossProfit: number
}

const chartData = computed<Data[]>(() => {
  const top = [...props.products]
    .sort((a, b) => b.grossProfit - a.grossProfit)
    .slice(0, props.limit ?? 5)

  return top.map((product) => ({
    name: product.productName.length > 18
      ? `${product.productName.slice(0, 18)}…`
      : product.productName,
    grossProfit: product.grossProfit,
  }))
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat(dateLocale.value, {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    notation: 'compact',
  }).format(value)
}
</script>

<template>
  <ChartContainer :config="chartConfig" class="min-h-[280px] w-full" cursor>
    <VisXYContainer v-if="chartData.length" :data="chartData">
      <VisGroupedBar
        :x="(d: Data) => d.name"
        :y="(d: Data) => d.grossProfit"
        :color="chartConfig.grossProfit.color!"
        :orientation="Orientation.Horizontal"
        :rounded-corners="4"
        bar-padding="0.2"
      />
      <VisAxis
        type="x"
        :x="(d: Data) => d.grossProfit"
        :tick-format="(d: number) => formatCurrency(d)"
        :tick-line="false"
        :domain-line="false"
        :grid-line="true"
      />
      <VisAxis
        type="y"
        :y="(d: Data) => d.name"
        :tick-line="false"
        :domain-line="false"
        :grid-line="false"
      />
      <ChartTooltip />
      <ChartCrosshair
        :template="componentToString(chartConfig, ChartTooltipContent)"
        :color="[chartConfig.grossProfit.color!]"
      />
    </VisXYContainer>
    <div
      v-else
      class="flex min-h-[280px] items-center justify-center text-sm text-muted-foreground"
    >
      {{ t('analytics.noProductData') }}
    </div>
  </ChartContainer>
</template>
