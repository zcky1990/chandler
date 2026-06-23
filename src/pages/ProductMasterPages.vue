<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Pencil, Plus, Trash2 } from '@lucide/vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ProductFormDialog from '@/components/masterdata/ProductFormDialog.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getCategories } from '@/lib/category'
import { deleteProduct, getProducts } from '@/lib/product'
import { formatPrice } from '@/lib/format'
import { useAlertStore } from '@/stores/useAlertStore'
import type { Product, ProductCategory } from '@/types/database'

type StatusFilter = 'all' | 'active' | 'inactive'
type AddonFilter = 'all' | 'addon' | 'menu'

const NO_CATEGORY = '__none__'

const alertStore = useAlertStore()
const products = ref<Product[]>([])
const categories = ref<ProductCategory[]>([])
const isLoading = ref(true)
const dialogOpen = ref(false)
const selectedProduct = ref<Product | null>(null)
const searchQuery = ref('')
const categoryFilter = ref('')
const statusFilter = ref<StatusFilter>('all')
const addonFilter = ref<AddonFilter>('all')

const filteredProducts = computed(() => {
  let result = products.value

  if (addonFilter.value === 'addon') {
    result = result.filter((product) => product.is_addons)
  } else if (addonFilter.value === 'menu') {
    result = result.filter((product) => !product.is_addons)
  }

  if (statusFilter.value === 'active') {
    result = result.filter((product) => product.is_active)
  } else if (statusFilter.value === 'inactive') {
    result = result.filter((product) => !product.is_active)
  }

  if (categoryFilter.value === NO_CATEGORY) {
    result = result.filter((product) => !product.category_id)
  } else if (categoryFilter.value) {
    result = result.filter((product) => product.category_id === categoryFilter.value)
  }

  const query = searchQuery.value.trim().toLowerCase()
  if (query) {
    result = result.filter((product) => {
      const name = product.name.toLowerCase()
      const sku = product.sku?.toLowerCase() ?? ''
      const category = product.product_categories?.name.toLowerCase() ?? ''
      return name.includes(query) || sku.includes(query) || category.includes(query)
    })
  }

  return result
})

const selectClass = 'border-input bg-background h-9 rounded-md border px-3 text-sm'

async function loadProducts() {
  isLoading.value = true
  const [productsResult, categoriesResult] = await Promise.all([
    getProducts(),
    getCategories(),
  ])
  isLoading.value = false

  if (productsResult.error) {
    alertStore.showAlert('Error', productsResult.error.message, 'error')
    return
  }

  if (categoriesResult.error) {
    alertStore.showAlert('Error', categoriesResult.error.message, 'error')
  }

  products.value = productsResult.products ?? []
  categories.value = categoriesResult.categories ?? []
}

function openCreateDialog() {
  selectedProduct.value = null
  dialogOpen.value = true
}

function openEditDialog(product: Product) {
  selectedProduct.value = product
  dialogOpen.value = true
}

async function handleDelete(product: Product) {
  if (!confirm(`Hapus produk "${product.name}"?`)) return

  const { error } = await deleteProduct(product.id)
  if (error) {
    alertStore.showAlert('Error', error.message, 'error')
    return
  }

  alertStore.showAlert('Berhasil', 'Produk berhasil dihapus', 'success')
  await loadProducts()
}

onMounted(loadProducts)
</script>

<template>
  <DashboardLayout>
    <div class="flex flex-col gap-6 p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Master Produk</h1>
          <p class="text-sm text-muted-foreground">Kelola data produk warung.</p>
        </div>
        <Button @click="openCreateDialog">
          <Plus class="size-4" />
          Tambah Produk
        </Button>
      </div>

      <div class="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <Input
          v-model="searchQuery"
          placeholder="Cari nama, SKU, atau kategori..."
          class="max-w-sm"
        />
        <select v-model="categoryFilter" :class="selectClass">
          <option value="">Semua kategori</option>
          <option :value="NO_CATEGORY">Tanpa kategori</option>
          <option
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
        <select v-model="addonFilter" :class="selectClass">
          <option value="all">Semua tipe</option>
          <option value="menu">Menu utama</option>
          <option value="addon">Addon</option>
        </select>
        <select v-model="statusFilter" :class="selectClass">
          <option value="all">Semua status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>
      </div>

      <div class="rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Addon</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Harga jual</TableHead>
              <TableHead>Harga beli</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="isLoading">
              <TableCell colspan="9" class="text-center text-muted-foreground">
                Memuat data...
              </TableCell>
            </TableRow>
            <TableRow v-else-if="!filteredProducts.length">
              <TableCell colspan="9" class="text-center text-muted-foreground">
                {{ products.length ? 'Tidak ada produk yang cocok dengan filter.' : 'Belum ada produk.' }}
              </TableCell>
            </TableRow>
            <TableRow v-for="product in filteredProducts" :key="product.id">
              <TableCell class="font-medium">{{ product.name }}</TableCell>
              <TableCell>{{ product.is_addons ? 'Ya' : 'Tidak' }}</TableCell>
              <TableCell>{{ product.product_categories?.name || '-' }}</TableCell>
              <TableCell>{{ formatPrice(product.price) }}</TableCell>
              <TableCell>{{ formatPrice(product.purchase_price ?? 0) }}</TableCell>
              <TableCell>{{ product.stock_quantity }}</TableCell>
              <TableCell>{{ product.sku || '-' }}</TableCell>
              <TableCell>{{ product.is_active ? 'Aktif' : 'Nonaktif' }}</TableCell>
              <TableCell class="text-right">
                <div class="flex justify-end gap-2">
                  <Button size="icon-sm" variant="outline" @click="openEditDialog(product)">
                    <Pencil class="size-4" />
                  </Button>
                  <Button size="icon-sm" variant="destructive" @click="handleDelete(product)">
                    <Trash2 class="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <ProductFormDialog
        v-model:open="dialogOpen"
        :product="selectedProduct"
        @saved="loadProducts"
      />
    </div>
  </DashboardLayout>
</template>
