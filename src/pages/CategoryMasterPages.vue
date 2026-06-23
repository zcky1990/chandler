<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Pencil, Plus, Trash2 } from '@lucide/vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import CategoryFormDialog from '@/components/masterdata/CategoryFormDialog.vue'
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
import { deleteCategory, getCategories } from '@/lib/category'
import { useAlertStore } from '@/stores/useAlertStore'
import type { ProductCategory } from '@/types/database'

type StatusFilter = 'all' | 'active' | 'inactive'

const alertStore = useAlertStore()
const categories = ref<ProductCategory[]>([])
const isLoading = ref(true)
const dialogOpen = ref(false)
const selectedCategory = ref<ProductCategory | null>(null)
const searchQuery = ref('')
const statusFilter = ref<StatusFilter>('all')

const filteredCategories = computed(() => {
  let result = categories.value

  if (statusFilter.value === 'active') {
    result = result.filter((category) => category.is_active)
  } else if (statusFilter.value === 'inactive') {
    result = result.filter((category) => !category.is_active)
  }

  const query = searchQuery.value.trim().toLowerCase()
  if (query) {
    result = result.filter((category) => {
      const name = category.name.toLowerCase()
      const description = category.description?.toLowerCase() ?? ''
      return name.includes(query) || description.includes(query)
    })
  }

  return result
})

const selectClass = 'border-input bg-background h-9 rounded-md border px-3 text-sm'

async function loadCategories() {
  isLoading.value = true
  const { categories: data, error } = await getCategories()
  isLoading.value = false

  if (error) {
    alertStore.showAlert('Error', error.message, 'error')
    return
  }

  categories.value = data ?? []
}

function openCreateDialog() {
  selectedCategory.value = null
  dialogOpen.value = true
}

function openEditDialog(category: ProductCategory) {
  selectedCategory.value = category
  dialogOpen.value = true
}

async function handleDelete(category: ProductCategory) {
  if (!confirm(`Hapus kategori "${category.name}"? Produk terkait akan kehilangan kategori.`)) return

  const { error } = await deleteCategory(category.id)
  if (error) {
    alertStore.showAlert('Error', error.message, 'error')
    return
  }

  alertStore.showAlert('Berhasil', 'Kategori berhasil dihapus', 'success')
  await loadCategories()
}

onMounted(loadCategories)
</script>

<template>
  <DashboardLayout>
    <div class="flex flex-col gap-6 p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Master Kategori</h1>
          <p class="text-sm text-muted-foreground">Kelola kategori produk warung.</p>
        </div>
        <Button @click="openCreateDialog">
          <Plus class="size-4" />
          Tambah Kategori
        </Button>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Input
          v-model="searchQuery"
          placeholder="Cari nama atau deskripsi..."
          class="max-w-sm"
        />
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
              <TableHead>Deskripsi</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="isLoading">
              <TableCell colspan="4" class="text-center text-muted-foreground">
                Memuat data...
              </TableCell>
            </TableRow>
            <TableRow v-else-if="!filteredCategories.length">
              <TableCell colspan="4" class="text-center text-muted-foreground">
                {{ categories.length ? 'Tidak ada kategori yang cocok dengan filter.' : 'Belum ada kategori.' }}
              </TableCell>
            </TableRow>
            <TableRow v-for="category in filteredCategories" :key="category.id">
              <TableCell class="font-medium">{{ category.name }}</TableCell>
              <TableCell>{{ category.description || '-' }}</TableCell>
              <TableCell>{{ category.is_active ? 'Aktif' : 'Nonaktif' }}</TableCell>
              <TableCell class="text-right">
                <div class="flex justify-end gap-2">
                  <Button size="icon-sm" variant="outline" @click="openEditDialog(category)">
                    <Pencil class="size-4" />
                  </Button>
                  <Button size="icon-sm" variant="destructive" @click="handleDelete(category)">
                    <Trash2 class="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <CategoryFormDialog
        v-model:open="dialogOpen"
        :category="selectedCategory"
        @saved="loadCategories"
      />
    </div>
  </DashboardLayout>
</template>
