<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  AlertTriangle,
  Banknote,
  BarChart3,
  ClipboardList,
  Inbox,
  LayoutDashboard,
  List,
  Monitor,
  PackagePlus,
  Receipt,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
} from '@lucide/vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ProfitTrendChart from '@/components/analytics/ProfitTrendChart.vue'
import { getDateRangePreset, getFullAnalyticsReport } from '@/lib/analytics'
import { getCookie } from '@/lib/cookies'
import { getActiveQueues } from '@/lib/queue'
import { getLowStockProducts } from '@/lib/stock'
import { formatPercent, formatPrice } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  Product,
  ProductAnalyticsRow,
} from '@/types/database'

const LOW_STOCK_THRESHOLD = 5

const alertStore = useAlertStore()
const isLoading = ref(true)
const todaySummary = ref<AnalyticsSummary | null>(null)
const weekTrend = ref<DailyAnalyticsRow[]>([])
const topProductsToday = ref<ProductAnalyticsRow[]>([])
const lowStockProducts = ref<Product[]>([])
const queueWaiting = ref(0)
const queuePreparing = ref(0)
const queueReady = ref(0)

const userEmail = getCookie('_user_email')

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 11) return 'Selamat pagi'
  if (hour < 15) return 'Selamat siang'
  if (hour < 18) return 'Selamat sore'
  return 'Selamat malam'
})

const todayLabel = computed(() =>
  new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date()),
)

const activeQueueCount = computed(() => queueWaiting.value + queuePreparing.value + queueReady.value)

const quickActions = [
  { to: '/transactions', label: 'Buat Transaksi', icon: Receipt, description: 'Catat penjualan baru' },
  { to: '/orders/inbox', label: 'Pesanan Masuk', icon: Inbox, description: 'Proses pesanan online' },
  { to: '/queue', label: 'Antrian', icon: ClipboardList, description: 'Kelola pesanan dapur' },
  { to: '/transactions/list', label: 'Daftar Transaksi', icon: List, description: 'Riwayat & pembayaran' },
  { to: '/stock/restock', label: 'Restock', icon: PackagePlus, description: 'Tambah stok produk' },
  { to: '/analytics', label: 'Analisis', icon: BarChart3, description: 'Laporan keuntungan' },
]

async function loadDashboard() {
  isLoading.value = true

  const todayRange = getDateRangePreset('today')
  const weekRange = getDateRangePreset('7d')

  const [todayResult, weekResult, queueResult, lowStockResult] = await Promise.all([
    getFullAnalyticsReport(todayRange),
    getFullAnalyticsReport(weekRange),
    getActiveQueues(),
    getLowStockProducts(LOW_STOCK_THRESHOLD),
  ])

  isLoading.value = false

  if (todayResult.error) {
    alertStore.showAlert('Error', todayResult.error.message, 'error')
    return
  }

  if (weekResult.error) {
    alertStore.showAlert('Error', weekResult.error.message, 'error')
    return
  }

  if (queueResult.error) {
    alertStore.showAlert('Error', queueResult.error.message, 'error')
    return
  }

  if (lowStockResult.error) {
    alertStore.showAlert('Error', lowStockResult.error.message, 'error')
    return
  }

  todaySummary.value = todayResult.summary
  topProductsToday.value = (todayResult.products ?? []).slice(0, 5)
  weekTrend.value = weekResult.dailyTrend ?? []
  lowStockProducts.value = lowStockResult.products ?? []

  const queues = queueResult.queues ?? []
  queueWaiting.value = queues.filter((queue) => queue.status === 'waiting').length
  queuePreparing.value = queues.filter((queue) => queue.status === 'preparing').length
  queueReady.value = queues.filter((queue) => queue.status === 'ready').length
}

onMounted(loadDashboard)
</script>

<template>
  <DashboardLayout>
    <div class="flex flex-col gap-6 p-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <LayoutDashboard class="size-6" />
            Dashboard
          </h1>
          <p class="text-sm text-muted-foreground">
            {{ greeting }}{{ userEmail ? `, ${userEmail}` : '' }} · {{ todayLabel }}
          </p>
        </div>
        <Button variant="outline" :disabled="isLoading" @click="loadDashboard">
          <RefreshCw class="size-4" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </Button>
      </div>

      <div v-if="isLoading" class="py-16 text-center text-sm text-muted-foreground">
        Memuat ringkasan...
      </div>

      <template v-else-if="todaySummary">
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card class="border-l-4 border-l-[var(--chart-1)]">
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">Pendapatan Hari Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-2xl font-bold">{{ formatPrice(todaySummary.revenue) }}</p>
              <p class="mt-1 text-xs text-muted-foreground">
                {{ todaySummary.transactionCount }} transaksi
              </p>
            </CardContent>
          </Card>

          <Card class="border-l-4 border-l-[var(--chart-3)]">
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">Laba Kotor Hari Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-2xl font-bold">{{ formatPrice(todaySummary.grossProfit) }}</p>
              <p class="mt-1 text-xs text-muted-foreground">
                Margin {{ formatPercent(todaySummary.marginPercent) }}
              </p>
            </CardContent>
          </Card>

          <Card class="border-l-4 border-l-[var(--chart-4)]">
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">Pembayaran Hari Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-2xl font-bold">{{ formatPrice(todaySummary.paidAmount) }}</p>
              <p class="mt-1 text-xs text-muted-foreground">
                {{ todaySummary.paidCount }} lunas · {{ todaySummary.unpaidCount }} belum dibayar
              </p>
            </CardContent>
          </Card>

          <Card class="border-l-4 border-l-amber-500">
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">Hutang & Antrian</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-2xl font-bold">{{ formatPrice(todaySummary.outstandingDebt) }}</p>
              <p class="mt-1 text-xs text-muted-foreground">
                {{ activeQueueCount }} antrian aktif
                <span v-if="activeQueueCount">
                  ({{ queueWaiting }} tunggu · {{ queuePreparing }} siapkan · {{ queueReady }} siap)
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 class="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Aksi Cepat
          </h2>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <RouterLink
              v-for="action in quickActions"
              :key="action.to"
              :to="action.to"
              class="group rounded-xl border bg-background p-4 transition-colors hover:bg-muted/50"
            >
              <component :is="action.icon" class="mb-2 size-5 text-primary" />
              <p class="font-medium">{{ action.label }}</p>
              <p class="mt-1 text-xs text-muted-foreground">{{ action.description }}</p>
            </RouterLink>
            <RouterLink
              :to="{ name: 'queue-display' }"
              target="_blank"
              rel="noopener noreferrer"
              class="group rounded-xl border bg-background p-4 transition-colors hover:bg-muted/50"
            >
              <Monitor class="mb-2 size-5 text-primary" />
              <p class="font-medium">Layar Antrian</p>
              <p class="mt-1 text-xs text-muted-foreground">Buka tampilan TV</p>
            </RouterLink>
          </div>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2 text-base">
                <ClipboardList class="size-4" />
                Status Antrian
              </CardTitle>
              <CardDescription>Pesanan aktif saat ini</CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="!activeQueueCount" class="text-sm text-muted-foreground">
                Tidak ada antrian aktif.
              </div>
              <div v-else class="grid grid-cols-3 gap-3">
                <div class="rounded-lg border bg-amber-500/10 px-3 py-4 text-center">
                  <p class="text-2xl font-bold">{{ queueWaiting }}</p>
                  <p class="text-xs text-muted-foreground">Menunggu</p>
                </div>
                <div class="rounded-lg border bg-blue-500/10 px-3 py-4 text-center">
                  <p class="text-2xl font-bold">{{ queuePreparing }}</p>
                  <p class="text-xs text-muted-foreground">Disiapkan</p>
                </div>
                <div class="rounded-lg border bg-green-500/10 px-3 py-4 text-center">
                  <p class="text-2xl font-bold">{{ queueReady }}</p>
                  <p class="text-xs text-muted-foreground">Siap</p>
                </div>
              </div>
              <Button class="mt-4 w-full" variant="outline" as-child>
                <RouterLink to="/queue">Kelola Antrian</RouterLink>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2 text-base">
                <AlertTriangle class="size-4 text-amber-500" />
                Stok Menipis
              </CardTitle>
              <CardDescription>Produk dengan stok ≤ {{ LOW_STOCK_THRESHOLD }}</CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="!lowStockProducts.length" class="text-sm text-muted-foreground">
                Semua stok dalam kondisi aman.
              </div>
              <ul v-else class="space-y-2">
                <li
                  v-for="product in lowStockProducts.slice(0, 5)"
                  :key="product.id"
                  class="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <span class="font-medium">{{ product.name }}</span>
                  <span class="text-muted-foreground">Stok {{ product.stock_quantity }}</span>
                </li>
              </ul>
              <Button class="mt-4 w-full" variant="outline" as-child>
                <RouterLink to="/stock/restock">Restock Sekarang</RouterLink>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div class="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2 text-base">
                <ShoppingCart class="size-4" />
                Produk Terlaris Hari Ini
              </CardTitle>
              <CardDescription>Berdasarkan jumlah terjual</CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="!topProductsToday.length" class="text-sm text-muted-foreground">
                Belum ada penjualan hari ini.
              </div>
              <Table v-else>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produk</TableHead>
                    <TableHead class="text-right">Qty</TableHead>
                    <TableHead class="text-right">Laba</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="product in topProductsToday" :key="product.productId">
                    <TableCell class="font-medium">{{ product.productName }}</TableCell>
                    <TableCell class="text-right">{{ product.quantitySold }}</TableCell>
                    <TableCell class="text-right">{{ formatPrice(product.grossProfit) }}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2 text-base">
                <TrendingUp class="size-4" />
                Tren 7 Hari Terakhir
              </CardTitle>
              <CardDescription>Pendapatan, HPP, dan laba kotor</CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="!weekTrend.length" class="text-sm text-muted-foreground">
                Belum ada data untuk ditampilkan.
              </div>
              <ProfitTrendChart v-else :data="weekTrend" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-base">
              <Banknote class="size-4" />
              Ringkasan Keuangan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p class="text-xs text-muted-foreground">Nilai inventori</p>
                <p class="text-lg font-semibold">{{ formatPrice(todaySummary.inventoryValue) }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Hutang belum lunas</p>
                <p class="text-lg font-semibold">{{ formatPrice(todaySummary.outstandingDebt) }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">HPP hari ini</p>
                <p class="text-lg font-semibold">{{ formatPrice(todaySummary.cogs) }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Belum dibayar hari ini</p>
                <p class="text-lg font-semibold">{{ formatPrice(todaySummary.unpaidAmount) }}</p>
              </div>
            </div>
            <Button class="mt-4" variant="outline" as-child>
              <RouterLink to="/analytics">Lihat Analisis Lengkap</RouterLink>
            </Button>
          </CardContent>
        </Card>
      </template>
    </div>
  </DashboardLayout>
</template>
