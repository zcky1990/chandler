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
import { useI18n } from '@/composables/useI18n'
import { getProducts } from '@/lib/product'
import { getStockMovements } from '@/lib/stock'
import { formatPrice } from '@/lib/format'
import { useAlertStore } from '@/stores/useAlertStore'
import type { Product, StockMovementWithProduct } from '@/types/database'

const LOW_STOCK_THRESHOLD = 5
const HISTORY_LIMIT = 20

const { t, locale } = useI18n()
const alertStore = useAlertStore()
const products = ref<Product[]>([])
const recentMovements = ref<StockMovementWithProduct[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const lowStockOnly = ref(false)
const dialogOpen = ref(false)
const selectedProduct = ref<Product | null>(null)

const dateLocale = computed(() => (locale.value === 'en' ? 'en-US' : 'id-ID'))

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
  return new Intl.DateTimeFormat(dateLocale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
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
    alertStore.showAlert(t('alert.error'), productsResult.error.message, 'error')
    return
  }

  if (movementsResult.error) {
    alertStore.showAlert(t('alert.error'), movementsResult.error.message, 'error')
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
          <h1 class="text-2xl font-bold tracking-tight">{{ t('restock.title') }}</h1>
          <p class="text-sm text-muted-foreground">
            {{ t('restock.subtitle') }}
          </p>
        </div>
        <Button variant="outline" :disabled="isLoading" @click="loadData">
          <RefreshCw class="mr-2 size-4" :class="{ 'animate-spin': isLoading }" />
          {{ t('common.refresh') }}
        </Button>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          v-model="searchQuery"
          :placeholder="t('restock.search')"
          class="max-w-sm"
        />
        <label class="flex items-center gap-2 text-sm">
          <Switch v-model="lowStockOnly" />
          <span>{{ t('restock.lowStock', { threshold: LOW_STOCK_THRESHOLD }) }}</span>
        </label>
      </div>

      <div class="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{{ t('common.product') }}</TableHead>
              <TableHead>{{ t('common.sku') }}</TableHead>
              <TableHead class="text-right">{{ t('common.stock') }}</TableHead>
              <TableHead class="text-right">{{ t('common.actions') }}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="isLoading">
              <TableCell colspan="4" class="text-center text-muted-foreground">
                {{ t('common.loading') }}
              </TableCell>
            </TableRow>
            <TableRow v-else-if="!filteredProducts.length">
              <TableCell colspan="4" class="text-center text-muted-foreground">
                {{ t('restock.noProduct') }}
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
                  {{ t('restock.title') }}
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div class="space-y-3">
        <h2 class="text-lg font-semibold">{{ t('restock.history') }}</h2>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{{ t('restock.time') }}</TableHead>
                <TableHead>{{ t('common.product') }}</TableHead>
                <TableHead class="text-right">{{ t('restock.qtyIn') }}</TableHead>
                <TableHead class="text-right">{{ t('restock.unitCost') }}</TableHead>
                <TableHead class="text-right">{{ t('restock.totalCost') }}</TableHead>
                <TableHead class="text-right">{{ t('common.stock') }}</TableHead>
                <TableHead>{{ t('common.notes') }}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-if="isLoading">
                <TableCell colspan="7" class="text-center text-muted-foreground">
                  {{ t('restock.loadingHistory') }}
                </TableCell>
              </TableRow>
              <TableRow v-else-if="!recentMovements.length">
                <TableCell colspan="7" class="text-center text-muted-foreground">
                  {{ t('restock.noHistory') }}
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
