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
import { useI18n } from '@/composables/useI18n'
import { deleteCategory, getCategories } from '@/lib/category'
import { useAlertStore } from '@/stores/useAlertStore'
import type { ProductCategory } from '@/types/database'

type StatusFilter = 'all' | 'active' | 'inactive'

const { t } = useI18n()
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
    alertStore.showAlert(t('alert.error'), error.message, 'error')
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
  if (!confirm(t('master.deleteCategoryConfirm', { name: category.name }))) return

  const { error } = await deleteCategory(category.id)
  if (error) {
    alertStore.showAlert(t('alert.error'), error.message, 'error')
    return
  }

  alertStore.showAlert(t('alert.success'), t('master.categoryDeleted'), 'success')
  await loadCategories()
}

onMounted(loadCategories)
</script>

<template>
  <DashboardLayout>
    <div class="flex flex-col gap-6 p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">{{ t('master.categoryTitle') }}</h1>
          <p class="text-sm text-muted-foreground">{{ t('master.categorySubtitle') }}</p>
        </div>
        <Button @click="openCreateDialog">
          <Plus class="size-4" />
          {{ t('master.addCategory') }}
        </Button>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Input
          v-model="searchQuery"
          :placeholder="t('master.searchCategory')"
          class="max-w-sm"
        />
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
              <TableHead>{{ t('master.description') }}</TableHead>
              <TableHead>{{ t('common.status') }}</TableHead>
              <TableHead class="text-right">{{ t('common.actions') }}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="isLoading">
              <TableCell colspan="4" class="text-center text-muted-foreground">
                {{ t('common.loading') }}
              </TableCell>
            </TableRow>
            <TableRow v-else-if="!filteredCategories.length">
              <TableCell colspan="4" class="text-center text-muted-foreground">
                {{ categories.length ? t('master.noCategoryFilterMatch') : t('master.noCategory') }}
              </TableCell>
            </TableRow>
            <TableRow v-for="category in filteredCategories" :key="category.id">
              <TableCell class="font-medium">{{ category.name }}</TableCell>
              <TableCell>{{ category.description || '-' }}</TableCell>
              <TableCell>{{ category.is_active ? t('common.active') : t('common.inactive') }}</TableCell>
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
