<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Pencil, Plus, Trash2 } from '@lucide/vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ProductFormDialog from '@/components/masterdata/ProductFormDialog.vue'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { deleteProduct, getProducts } from '@/lib/product'
import { formatPrice } from '@/lib/format'
import { useAlertStore } from '@/stores/useAlertStore'
import type { Product } from '@/types/database'

const alertStore = useAlertStore()
const products = ref<Product[]>([])
const isLoading = ref(true)
const dialogOpen = ref(false)
const selectedProduct = ref<Product | null>(null)

async function loadProducts() {
  isLoading.value = true
  const { products: data, error } = await getProducts()
  isLoading.value = false

  if (error) {
    alertStore.showAlert('Error', error.message, 'error')
    return
  }

  products.value = data ?? []
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

      <div class="rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Tipe</TableHead>
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
              <TableCell colspan="8" class="text-center text-muted-foreground">
                Memuat data...
              </TableCell>
            </TableRow>
            <TableRow v-else-if="!products.length">
              <TableCell colspan="8" class="text-center text-muted-foreground">
                Belum ada produk.
              </TableCell>
            </TableRow>
            <TableRow v-for="product in products" :key="product.id">
              <TableCell class="font-medium">{{ product.name }}</TableCell>
              <TableCell>{{ product.product_type === 'addon' ? 'Addon' : 'Menu' }}</TableCell>
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
