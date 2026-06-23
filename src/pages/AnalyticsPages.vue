<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Package,
  RefreshCw,
  TrendingUp,
  Wallet,
} from '@lucide/vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import PaymentMethodDonut from '@/components/analytics/PaymentMethodDonut.vue'
import ProfitTrendChart from '@/components/analytics/ProfitTrendChart.vue'
import RevenueBreakdownDonut from '@/components/analytics/RevenueBreakdownDonut.vue'
import TopProductsProfitChart from '@/components/analytics/TopProductsProfitChart.vue'
import { useI18n } from '@/composables/useI18n'
import { getDateRangePreset, getFullAnalyticsReport } from '@/lib/analytics'
import { getLowStockProducts } from '@/lib/stock'
import { formatPercent, formatPrice } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAlertStore } from '@/stores/useAlertStore'
import type {
  AnalyticsSummary,
  DailyAnalyticsRow,
  DateRangePreset,
  PaymentBreakdownRow,
  Product,
  ProductAnalyticsRow,
} from '@/types/database'

const LOW_STOCK_THRESHOLD = 5

const { t } = useI18n()
const alertStore = useAlertStore()
const isLoading = ref(true)
const activePreset = ref<DateRangePreset>('month')
const customStart = ref('')
const customEnd = ref('')
const showAllProducts = ref(false)

const summary = ref<AnalyticsSummary | null>(null)
const products = ref<ProductAnalyticsRow[]>([])
const payments = ref<PaymentBreakdownRow[]>([])
const dailyTrend = ref<DailyAnalyticsRow[]>([])
const lowStockProducts = ref<Product[]>([])

const presetOptions = computed(() => [
  { value: 'today' as const, label: t('analytics.today') },
  { value: '7d' as const, label: t('analytics.7days') },
  { value: 'month' as const, label: t('analytics.thisMonth') },
  { value: '30d' as const, label: t('analytics.30days') },
])

const displayedProducts = computed(() => {
  if (showAllProducts.value) return products.value
  return products.value.slice(0, 10)
})

const marginBarWidth = computed(() => {
  if (!summary.value) return 0
  return Math.min(Math.max(summary.value.marginPercent, 0), 100)
})

function getCurrentRange() {
  if (activePreset.value === 'custom') {
    const start = customStart.value ? new Date(customStart.value) : new Date()
    const end = customEnd.value ? new Date(customEnd.value) : new Date()
    return getDateRangePreset('custom', start, end)
  }

  return getDateRangePreset(activePreset.value)
}

function setPreset(preset: DateRangePreset) {
  activePreset.value = preset
}

async function loadAnalytics() {
  isLoading.value = true
  const range = getCurrentRange()

  const [reportResult, lowStockResult] = await Promise.all([
    getFullAnalyticsReport(range),
    getLowStockProducts(LOW_STOCK_THRESHOLD),
  ])

  isLoading.value = false

  if (reportResult.error) {
    alertStore.showAlert(t('alert.error'), reportResult.error.message, 'error')
    return
  }

  if (lowStockResult.error) {
    alertStore.showAlert(t('alert.error'), lowStockResult.error.message, 'error')
    return
  }

  summary.value = reportResult.summary
  products.value = reportResult.products ?? []
  payments.value = reportResult.payments ?? []
  dailyTrend.value = reportResult.dailyTrend ?? []
  lowStockProducts.value = lowStockResult.products ?? []
}

watch(activePreset, () => {
  if (activePreset.value === 'custom' && (!customStart.value || !customEnd.value)) {
    return
  }
  loadAnalytics()
})

watch([customStart, customEnd], () => {
  if (activePreset.value !== 'custom') return
  if (!customStart.value || !customEnd.value) return
  loadAnalytics()
})

onMounted(() => {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  customStart.value = monthStart.toISOString().slice(0, 10)
  customEnd.value = now.toISOString().slice(0, 10)
  loadAnalytics()
})
</script>

<template>
  <DashboardLayout>
    <div class="flex flex-col gap-6 p-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">{{ t('analytics.title') }}</h1>
          <p class="text-sm text-muted-foreground">
            {{ t('analytics.subtitle') }}
          </p>
        </div>
        <Button variant="outline" :disabled="isLoading" @click="loadAnalytics">
          <RefreshCw class="mr-2 size-4" :class="{ 'animate-spin': isLoading }" />
          {{ t('common.refresh') }}
        </Button>
      </div>

      <div class="flex flex-col gap-3">
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="option in presetOptions"
            :key="option.value"
            size="sm"
            :variant="activePreset === option.value ? 'default' : 'outline'"
            @click="setPreset(option.value)"
          >
            {{ option.label }}
          </Button>
          <Button
            size="sm"
            :variant="activePreset === 'custom' ? 'default' : 'outline'"
            @click="activePreset = 'custom'"
          >
            {{ t('analytics.custom') }}
          </Button>
        </div>
        <div v-if="activePreset === 'custom'" class="flex flex-wrap items-center gap-2">
          <Input v-model="customStart" type="date" class="w-auto" />
          <span class="text-sm text-muted-foreground">{{ t('analytics.to') }}</span>
          <Input v-model="customEnd" type="date" class="w-auto" />
        </div>
      </div>

      <div
        v-if="summary && summary.salesWithoutCogsCount > 0"
        class="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100"
      >
        <AlertTriangle class="mt-0.5 size-4 shrink-0" />
        <span>
          {{ t('analytics.cogsWarning', { count: summary.salesWithoutCogsCount }) }}
        </span>
      </div>

      <div v-if="isLoading" class="py-12 text-center text-muted-foreground">
        {{ t('analytics.loading') }}
      </div>

      <template v-else-if="summary">
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card class="border-l-4 border-l-[var(--chart-1)]">
            <CardHeader class="flex flex-row items-center justify-between pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">{{ t('analytics.revenue') }}</CardTitle>
              <ArrowUpCircle class="size-4 text-[var(--chart-1)]" />
            </CardHeader>
            <CardContent>
              <p class="text-2xl font-bold">{{ formatPrice(summary.revenue) }}</p>
              <p class="mt-1 text-xs text-muted-foreground">
                {{ summary.transactionCount }} {{ t('analytics.inPeriod') }}
              </p>
            </CardContent>
          </Card>

          <Card class="border-l-4 border-l-[var(--chart-2)]">
            <CardHeader class="flex flex-row items-center justify-between pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">{{ t('analytics.cogs') }}</CardTitle>
              <ArrowDownCircle class="size-4 text-[var(--chart-2)]" />
            </CardHeader>
            <CardContent>
              <p class="text-2xl font-bold">{{ formatPrice(summary.cogs) }}</p>
              <p class="mt-1 text-xs text-muted-foreground">
                {{ t('analytics.restockOut') }} {{ formatPrice(summary.restockSpend) }}
              </p>
            </CardContent>
          </Card>

          <Card class="border-l-4 border-l-[var(--chart-3)]">
            <CardHeader class="flex flex-row items-center justify-between pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">{{ t('analytics.grossProfit') }}</CardTitle>
              <TrendingUp class="size-4 text-[var(--chart-3)]" />
            </CardHeader>
            <CardContent>
              <p
                class="text-2xl font-bold"
                :class="summary.grossProfit >= 0 ? 'text-green-600' : 'text-destructive'"
              >
                {{ formatPrice(summary.grossProfit) }}
              </p>
              <div class="mt-2 space-y-1">
                <div class="flex justify-between text-xs text-muted-foreground">
                  <span>{{ t('analytics.margin') }}</span>
                  <span>{{ formatPercent(summary.marginPercent) }}</span>
                </div>
                <div class="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    class="h-full rounded-full bg-[var(--chart-3)] transition-all"
                    :style="{ width: `${marginBarWidth}%` }"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card class="border-l-4 border-l-amber-500">
            <CardHeader class="flex flex-row items-center justify-between pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">{{ t('analytics.cashReceivable') }}</CardTitle>
              <Wallet class="size-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <p class="text-lg font-bold text-green-600">{{ formatPrice(summary.paidAmount) }}</p>
              <p class="text-xs text-muted-foreground">{{ t('analytics.paidTrx', { count: summary.paidCount }) }}</p>
              <p class="mt-2 text-lg font-bold text-amber-600">{{ formatPrice(summary.unpaidAmount) }}</p>
              <p class="text-xs text-muted-foreground">
                {{ t('analytics.periodDebtDetail', { count: summary.unpaidCount, amount: formatPrice(summary.outstandingDebt) }) }}
              </p>
            </CardContent>
          </Card>
        </div>

        <div class="grid gap-4 lg:grid-cols-3">
          <Card class="lg:col-span-2">
            <CardHeader>
              <CardTitle>{{ t('analytics.dailyTrend') }}</CardTitle>
              <CardDescription>
                {{ t('analytics.dailyTrendDesc') }}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfitTrendChart :data="dailyTrend" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{{ t('analytics.revenueComposition') }}</CardTitle>
              <CardDescription>
                {{ t('analytics.revenueCompositionDesc') }}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueBreakdownDonut :summary="summary" />
            </CardContent>
          </Card>
        </div>

        <div class="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{{ t('analytics.topProfitable') }}</CardTitle>
              <CardDescription>{{ t('analytics.topProfitableDesc') }}</CardDescription>
            </CardHeader>
            <CardContent>
              <TopProductsProfitChart :products="products" :limit="5" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{{ t('analytics.paymentMethods') }}</CardTitle>
              <CardDescription>{{ t('analytics.paymentMethodsDesc') }}</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentMethodDonut :payments="payments" />
            </CardContent>
          </Card>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">{{ t('analytics.inventoryValue') }}</CardTitle>
            </CardHeader>
            <CardContent class="flex items-center gap-3">
              <Package class="size-8 text-muted-foreground" />
              <div>
                <p class="text-xl font-bold">{{ formatPrice(summary.inventoryValue) }}</p>
                <p class="text-xs text-muted-foreground">{{ t('analytics.inventoryDesc') }}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">{{ t('analytics.lowStockProducts') }}</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-xl font-bold">{{ lowStockProducts.length }} {{ t('analytics.productsUnit') }}</p>
              <p class="text-xs text-muted-foreground">{{ t('analytics.lowStockUnit', { threshold: LOW_STOCK_THRESHOLD }) }}</p>
            </CardContent>
          </Card>
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">{{ t('analytics.productDetail') }}</h2>
            <Button
              v-if="products.length > 10"
              variant="ghost"
              size="sm"
              @click="showAllProducts = !showAllProducts"
            >
              {{ showAllProducts ? t('analytics.showTop10') : t('analytics.showAll', { count: products.length }) }}
            </Button>
          </div>
          <div class="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{{ t('common.product') }}</TableHead>
                  <TableHead class="text-right">{{ t('common.qty') }}</TableHead>
                  <TableHead class="text-right">{{ t('analytics.revenueLabel') }}</TableHead>
                  <TableHead class="text-right">{{ t('analytics.chartCogsShort') }}</TableHead>
                  <TableHead class="text-right">{{ t('analytics.chartProfit') }}</TableHead>
                  <TableHead class="text-right">{{ t('analytics.margin') }}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-if="!displayedProducts.length">
                  <TableCell colspan="6" class="text-center text-muted-foreground">
                    {{ t('analytics.noSales') }}
                  </TableCell>
                </TableRow>
                <TableRow v-for="row in displayedProducts" :key="row.productId">
                  <TableCell class="font-medium">{{ row.productName }}</TableCell>
                  <TableCell class="text-right">{{ row.quantitySold }}</TableCell>
                  <TableCell class="text-right">{{ formatPrice(row.revenue) }}</TableCell>
                  <TableCell class="text-right">{{ formatPrice(row.cogs) }}</TableCell>
                  <TableCell
                    class="text-right font-medium"
                    :class="row.grossProfit >= 0 ? 'text-green-600' : 'text-destructive'"
                  >
                    {{ formatPrice(row.grossProfit) }}
                  </TableCell>
                  <TableCell class="text-right">{{ formatPercent(row.marginPercent) }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <div v-if="lowStockProducts.length" class="space-y-3">
          <h2 class="text-lg font-semibold">{{ t('analytics.lowStockTitle') }}</h2>
          <div class="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{{ t('common.product') }}</TableHead>
                  <TableHead>{{ t('common.sku') }}</TableHead>
                  <TableHead class="text-right">{{ t('common.stock') }}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="product in lowStockProducts" :key="product.id">
                  <TableCell class="font-medium">{{ product.name }}</TableCell>
                  <TableCell>{{ product.sku || '-' }}</TableCell>
                  <TableCell class="text-right font-semibold text-destructive">
                    {{ product.stock_quantity }}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>
