<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { PackagePlus, RefreshCw } from '@lucide/vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import RestockFormDialog from '@/components/stock/RestockFormDialog.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getProducts } from '@/lib/product'
import { getStockMovements } from '@/lib/stock'
import { useAlertStore } from '@/stores/useAlertStore'
import type { Product, StockMovementWithProduct } from '@/types/database'

const LOW_STOCK_THRESHOLD = 5
const HISTORY_LIMIT = 20

const alertStore = useAlertStore()
const products = ref<Product[]>([])
const recentMovements = ref<StockMovementWithProduct[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const lowStockOnly = ref(false)
const dialogOpen = ref(false)
const selectedProduct = ref<Product | null>(null)

const filteredProducts = computed(() => {
  let result = products.value.filter((product) => product.is_active)

  if (lowStockOnly.value) {
    result = result.filter((product) => product.stock_quantity <= LOW_STOCK_THRESHOLD)
  }

  const query = searchQuery.value.trim().toLowerCase()
  if (query) {
    result = result.filter((product) => {
      const name = product.name.toLowerCase()
      const sku = product.sku?.toLowerCase() ?? ''
      return name.includes(query) || sku.includes(query)
    })
  }

  return result.sort((a, b) => a.stock_quantity - b.stock_quantity)
})

function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)
}

function isLowStock(stock: number) {
  return stock <= LOW_STOCK_THRESHOLD
}

async function loadData() {
  isLoading.value = true

  const [productsResult, movementsResult] = await Promise.all([
    getProducts(),
    getStockMovements({ movementType: 'restock', limit: HISTORY_LIMIT }),
  ])

  isLoading.value = false

  if (productsResult.error) {
    alertStore.showAlert('Error', productsResult.error.message, 'error')
    return
  }

  if (movementsResult.error) {
    alertStore.showAlert('Error', movementsResult.error.message, 'error')
    return
  }

  products.value = productsResult.products ?? []
  recentMovements.value = movementsResult.movements ?? []
}

function openRestockDialog(product: Product) {
  selectedProduct.value = product
  dialogOpen.value = true
}

async function handleRestockSaved() {
  await loadData()
}

onMounted(loadData)
</script>

<template>
  <DashboardLayout>
    <div class="flex flex-col gap-6 p-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Restock</h1>
          <p class="text-sm text-muted-foreground">
            Tambah stok produk dan lihat riwayat restock terbaru.
          </p>
        </div>
        <Button variant="outline" :disabled="isLoading" @click="loadData">
          <RefreshCw class="mr-2 size-4" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </Button>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          v-model="searchQuery"
          placeholder="Cari nama atau SKU..."
          class="max-w-sm"
        />
        <label class="flex items-center gap-2 text-sm">
          <Switch v-model="lowStockOnly" />
          <span>Stok menipis (&le; {{ LOW_STOCK_THRESHOLD }})</span>
        </label>
      </div>

      <div class="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produk</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead class="text-right">Stok</TableHead>
              <TableHead class="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="isLoading">
              <TableCell colspan="4" class="text-center text-muted-foreground">
                Memuat data...
              </TableCell>
            </TableRow>
            <TableRow v-else-if="!filteredProducts.length">
              <TableCell colspan="4" class="text-center text-muted-foreground">
                Tidak ada produk ditemukan.
              </TableCell>
            </TableRow>
            <TableRow v-for="product in filteredProducts" :key="product.id">
              <TableCell class="font-medium">{{ product.name }}</TableCell>
              <TableCell>{{ product.sku || '-' }}</TableCell>
              <TableCell class="text-right">
                <span :class="{ 'font-semibold text-destructive': isLowStock(product.stock_quantity) }">
                  {{ product.stock_quantity }}
                </span>
              </TableCell>
              <TableCell class="text-right">
                <Button size="sm" @click="openRestockDialog(product)">
                  <PackagePlus class="mr-1 size-4" />
                  Restock
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div class="space-y-3">
        <h2 class="text-lg font-semibold">Riwayat Restock Terbaru</h2>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead class="text-right">Jumlah</TableHead>
                <TableHead class="text-right">Harga beli</TableHead>
                <TableHead class="text-right">Total biaya</TableHead>
                <TableHead class="text-right">Stok</TableHead>
                <TableHead>Catatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-if="isLoading">
                <TableCell colspan="7" class="text-center text-muted-foreground">
                  Memuat riwayat...
                </TableCell>
              </TableRow>
              <TableRow v-else-if="!recentMovements.length">
                <TableCell colspan="7" class="text-center text-muted-foreground">
                  Belum ada riwayat restock.
                </TableCell>
              </TableRow>
              <TableRow v-for="movement in recentMovements" :key="movement.id">
                <TableCell>{{ formatDate(movement.created_at) }}</TableCell>
                <TableCell>{{ movement.products?.name ?? '-' }}</TableCell>
                <TableCell class="text-right text-green-600">+{{ movement.quantity }}</TableCell>
                <TableCell class="text-right">{{ formatPrice(movement.unit_cost ?? 0) }}</TableCell>
                <TableCell class="text-right font-medium">{{ formatPrice(movement.total_cost ?? 0) }}</TableCell>
                <TableCell class="text-right text-muted-foreground">
                  {{ movement.stock_before }} → {{ movement.stock_after }}
                </TableCell>
                <TableCell>{{ movement.notes || '-' }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>

    <RestockFormDialog
      v-model:open="dialogOpen"
      :product="selectedProduct"
      @saved="handleRestockSaved"
    />
  </DashboardLayout>
</template>
