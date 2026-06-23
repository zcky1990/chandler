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
import { useI18n } from '@/composables/useI18n'
import { getCategories } from '@/lib/category'
import { deleteProduct, getProducts } from '@/lib/product'
import { formatPrice } from '@/lib/format'
import { useAlertStore } from '@/stores/useAlertStore'
import type { Product, ProductCategory } from '@/types/database'

type StatusFilter = 'all' | 'active' | 'inactive'
type AddonFilter = 'all' | 'addon' | 'menu'

const NO_CATEGORY = '__none__'

const { t } = useI18n()
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
    alertStore.showAlert(t('alert.error'), productsResult.error.message, 'error')
    return
  }

  if (categoriesResult.error) {
    alertStore.showAlert(t('alert.error'), categoriesResult.error.message, 'error')
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
  if (!confirm(t('master.deleteProductConfirm', { name: product.name }))) return

  const { error } = await deleteProduct(product.id)
  if (error) {
    alertStore.showAlert(t('alert.error'), error.message, 'error')
    return
  }

  alertStore.showAlert(t('alert.success'), t('master.productDeleted'), 'success')
  await loadProducts()
}

onMounted(loadProducts)
</script>

<template>
  <DashboardLayout>
    <div class="flex flex-col gap-6 p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">{{ t('master.productTitle') }}</h1>
          <p class="text-sm text-muted-foreground">{{ t('master.productSubtitle') }}</p>
        </div>
        <Button @click="openCreateDialog">
          <Plus class="size-4" />
          {{ t('master.addProduct') }}
        </Button>
      </div>

      <div class="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <Input
          v-model="searchQuery"
          :placeholder="t('master.searchProduct')"
          class="max-w-sm"
        />
        <select v-model="categoryFilter" :class="selectClass">
          <option value="">{{ t('master.allCategories') }}</option>
          <option :value="NO_CATEGORY">{{ t('master.noCategoryFilter') }}</option>
          <option
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
        <select v-model="addonFilter" :class="selectClass">
          <option value="all">{{ t('master.allTypes') }}</option>
          <option value="menu">{{ t('master.mainMenu') }}</option>
          <option value="addon">{{ t('master.addonType') }}</option>
        </select>
        <select v-model="statusFilter" :class="selectClass">
          <option value="all">{{ t('status.allStatus') }}</option>
          <option value="active">{{ t('common.active') }}</option>
          <option value="inactive">{{ t('common.inactive') }}</option>
        </select>
      </div>

      <div class="rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{{ t('master.name') }}</TableHead>
              <TableHead>{{ t('master.isAddon') }}</TableHead>
              <TableHead>{{ t('home.category') }}</TableHead>
              <TableHead>{{ t('master.salePrice') }}</TableHead>
              <TableHead>{{ t('master.purchasePrice') }}</TableHead>
              <TableHead>{{ t('common.stock') }}</TableHead>
              <TableHead>{{ t('common.sku') }}</TableHead>
              <TableHead>{{ t('common.status') }}</TableHead>
              <TableHead class="text-right">{{ t('common.actions') }}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="isLoading">
              <TableCell colspan="9" class="text-center text-muted-foreground">
                {{ t('common.loading') }}
              </TableCell>
            </TableRow>
            <TableRow v-else-if="!filteredProducts.length">
              <TableCell colspan="9" class="text-center text-muted-foreground">
                {{ products.length ? t('master.noProductFilterMatch') : t('master.noProduct') }}
              </TableCell>
            </TableRow>
            <TableRow v-for="product in filteredProducts" :key="product.id">
              <TableCell class="font-medium">{{ product.name }}</TableCell>
              <TableCell>{{ product.is_addons ? t('common.yes') : t('common.no') }}</TableCell>
              <TableCell>{{ product.product_categories?.name || '-' }}</TableCell>
              <TableCell>{{ formatPrice(product.price) }}</TableCell>
              <TableCell>{{ formatPrice(product.purchase_price ?? 0) }}</TableCell>
              <TableCell>{{ product.stock_quantity }}</TableCell>
              <TableCell>{{ product.sku || '-' }}</TableCell>
              <TableCell>{{ product.is_active ? t('common.active') : t('common.inactive') }}</TableCell>
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
