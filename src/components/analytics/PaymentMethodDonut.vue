<script setup lang="ts">
import { computed } from 'vue'
import type { ChartConfig } from '@/components/ui/chart'
import { VisDonut, VisSingleContainer } from '@unovis/vue'
import { ChartContainer } from '@/components/ui/chart'
import type { PaymentBreakdownRow } from '@/types/database'

const props = defineProps<{
  payments: PaymentBreakdownRow[]
}>()

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-4)',
]

type Slice = PaymentBreakdownRow & { fill: string, key: string }

const chartConfig = computed<ChartConfig>(() => {
  const config: ChartConfig = {}
  props.payments.forEach((payment, index) => {
    config[payment.method] = {
      label: payment.label,
      color: COLORS[index % COLORS.length],
    }
  })
  return config
})

const chartData = computed<Slice[]>(() =>
  props.payments.map((payment, index) => ({
    ...payment,
    key: payment.method,
    fill: COLORS[index % COLORS.length]!,
  })),
)

const centralLabel = computed(() => {
  const total = props.payments.reduce((sum, row) => sum + row.amount, 0)
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    notation: 'compact',
  }).format(total)
})
</script>

<template>
  <ChartContainer :config="chartConfig" class="min-h-[280px] w-full">
    <VisSingleContainer v-if="chartData.length" :data="chartData">
      <VisDonut
        :value="(d: Slice) => d.amount"
        :color="(d: Slice) => d.fill"
        :arc-width="36"
        :central-label="centralLabel"
        central-sub-label="Lunas"
      />
    </VisSingleContainer>
    <div
      v-else
      class="flex min-h-[280px] items-center justify-center text-sm text-muted-foreground"
    >
      Belum ada pembayaran lunas.
    </div>

    <ul v-if="chartData.length" class="mt-4 space-y-2">
      <li
        v-for="row in chartData"
        :key="row.method"
        class="flex items-center justify-between text-sm"
      >
        <span class="flex items-center gap-2">
          <span class="size-2.5 rounded-full" :style="{ background: row.fill }" />
          {{ row.label }}
        </span>
        <span class="text-muted-foreground">{{ row.transactionCount }} trx</span>
      </li>
    </ul>
  </ChartContainer>
</template>
