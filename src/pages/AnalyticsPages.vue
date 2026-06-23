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

const presetOptions: { value: DateRangePreset, label: string }[] = [
  { value: 'today', label: 'Hari ini' },
  { value: '7d', label: '7 hari' },
  { value: 'month', label: 'Bulan ini' },
  { value: '30d', label: '30 hari' },
]

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
    alertStore.showAlert('Error', reportResult.error.message, 'error')
    return
  }

  if (lowStockResult.error) {
    alertStore.showAlert('Error', lowStockResult.error.message, 'error')
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
          <h1 class="text-2xl font-bold tracking-tight">Analisis Keuntungan</h1>
          <p class="text-sm text-muted-foreground">
            Visualisasi laba kotor, tren penjualan, dan performa produk.
          </p>
        </div>
        <Button variant="outline" :disabled="isLoading" @click="loadAnalytics">
          <RefreshCw class="mr-2 size-4" :class="{ 'animate-spin': isLoading }" />
          Refresh
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
            Custom
          </Button>
        </div>
        <div v-if="activePreset === 'custom'" class="flex flex-wrap items-center gap-2">
          <Input v-model="customStart" type="date" class="w-auto" />
          <span class="text-sm text-muted-foreground">s/d</span>
          <Input v-model="customEnd" type="date" class="w-auto" />
        </div>
      </div>

      <div
        v-if="summary && summary.salesWithoutCogsCount > 0"
        class="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100"
      >
        <AlertTriangle class="mt-0.5 size-4 shrink-0" />
        <span>
          {{ summary.salesWithoutCogsCount }} transaksi belum memiliki data HPP
          (kemungkinan data lama sebelum costing FIFO).
        </span>
      </div>

      <div v-if="isLoading" class="py-12 text-center text-muted-foreground">
        Memuat analisis...
      </div>

      <template v-else-if="summary">
        <!-- Ringkasan utama -->
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card class="border-l-4 border-l-[var(--chart-1)]">
            <CardHeader class="flex flex-row items-center justify-between pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">Pendapatan</CardTitle>
              <ArrowUpCircle class="size-4 text-[var(--chart-1)]" />
            </CardHeader>
            <CardContent>
              <p class="text-2xl font-bold">{{ formatPrice(summary.revenue) }}</p>
              <p class="mt-1 text-xs text-muted-foreground">
                {{ summary.transactionCount }} transaksi dalam periode
              </p>
            </CardContent>
          </Card>

          <Card class="border-l-4 border-l-[var(--chart-2)]">
            <CardHeader class="flex flex-row items-center justify-between pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">HPP (FIFO)</CardTitle>
              <ArrowDownCircle class="size-4 text-[var(--chart-2)]" />
            </CardHeader>
            <CardContent>
              <p class="text-2xl font-bold">{{ formatPrice(summary.cogs) }}</p>
              <p class="mt-1 text-xs text-muted-foreground">
                Restock keluar: {{ formatPrice(summary.restockSpend) }}
              </p>
            </CardContent>
          </Card>

          <Card class="border-l-4 border-l-[var(--chart-3)]">
            <CardHeader class="flex flex-row items-center justify-between pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">Laba kotor</CardTitle>
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
                  <span>Margin</span>
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
              <CardTitle class="text-sm font-medium text-muted-foreground">Kas & Piutang</CardTitle>
              <Wallet class="size-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <p class="text-lg font-bold text-green-600">{{ formatPrice(summary.paidAmount) }}</p>
              <p class="text-xs text-muted-foreground">Sudah lunas ({{ summary.paidCount }} trx)</p>
              <p class="mt-2 text-lg font-bold text-amber-600">{{ formatPrice(summary.unpaidAmount) }}</p>
              <p class="text-xs text-muted-foreground">
                Hutang periode ({{ summary.unpaidCount }} trx) · Piutang total {{ formatPrice(summary.outstandingDebt) }}
              </p>
            </CardContent>
          </Card>
        </div>

        <!-- Charts row 1 -->
        <div class="grid gap-4 lg:grid-cols-3">
          <Card class="lg:col-span-2">
            <CardHeader>
              <CardTitle>Tren harian</CardTitle>
              <CardDescription>
                Perbandingan pendapatan, HPP, dan laba per hari dalam periode terpilih.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfitTrendChart :data="dailyTrend" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Komposisi pendapatan</CardTitle>
              <CardDescription>
                Berapa bagian pendapatan yang menjadi HPP vs laba kotor.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueBreakdownDonut :summary="summary" />
            </CardContent>
          </Card>
        </div>

        <!-- Charts row 2 -->
        <div class="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top produk paling untung</CardTitle>
              <CardDescription>5 produk dengan laba kotor tertinggi.</CardDescription>
            </CardHeader>
            <CardContent>
              <TopProductsProfitChart :products="products" :limit="5" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metode pembayaran</CardTitle>
              <CardDescription>Distribusi pembayaran lunas dalam periode.</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentMethodDonut :payments="payments" />
            </CardContent>
          </Card>
        </div>

        <!-- Metrik operasional -->
        <div class="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">Nilai inventaris</CardTitle>
            </CardHeader>
            <CardContent class="flex items-center gap-3">
              <Package class="size-8 text-muted-foreground" />
              <div>
                <p class="text-xl font-bold">{{ formatPrice(summary.inventoryValue) }}</p>
                <p class="text-xs text-muted-foreground">Stok tersisa (FIFO) saat ini</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">Stok menipis</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-xl font-bold">{{ lowStockProducts.length }} produk</p>
              <p class="text-xs text-muted-foreground">Stok &le; {{ LOW_STOCK_THRESHOLD }} unit</p>
            </CardContent>
          </Card>
        </div>

        <!-- Tabel detail -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Detail per produk</h2>
            <Button
              v-if="products.length > 10"
              variant="ghost"
              size="sm"
              @click="showAllProducts = !showAllProducts"
            >
              {{ showAllProducts ? 'Tampilkan top 10' : `Tampilkan semua (${products.length})` }}
            </Button>
          </div>
          <div class="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead class="text-right">Qty</TableHead>
                  <TableHead class="text-right">Pendapatan</TableHead>
                  <TableHead class="text-right">HPP</TableHead>
                  <TableHead class="text-right">Laba</TableHead>
                  <TableHead class="text-right">Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-if="!displayedProducts.length">
                  <TableCell colspan="6" class="text-center text-muted-foreground">
                    Belum ada penjualan dalam periode ini.
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
          <h2 class="text-lg font-semibold">Produk stok menipis</h2>
          <div class="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead class="text-right">Stok</TableHead>
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
