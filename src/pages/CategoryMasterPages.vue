<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Pencil, Plus, Trash2 } from '@lucide/vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import CategoryFormDialog from '@/components/masterdata/CategoryFormDialog.vue'
import TablePagination from '@/components/common/TablePagination.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useI18n } from '@/composables/useI18n'
import { usePagination } from '@/composables/usePagination'
import { useRoleStore } from '@/stores/useRoleStore'
import { deleteCategory, getCategories } from '@/lib/category'
import { useAlertStore } from '@/stores/useAlertStore'
import type { ProductCategory } from '@/types/database'

type StatusFilter = 'all' | 'active' | 'inactive'

const { t } = useI18n()
const roleStore = useRoleStore()
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

const {
  paginatedItems: paginatedCategories,
  currentPage,
  pageSize,
  totalCount,
  totalPages,
  paginationFrom,
  paginationTo,
  goToPage,
} = usePagination(filteredCategories, [searchQuery, statusFilter])

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
        <Button v-if="roleStore.isOwner" @click="openCreateDialog">
          <Plus class="size-4" />
          {{ t('master.addCategory') }}
        </Button>
      </div>

      <p v-if="roleStore.isStaff" class="text-sm text-muted-foreground">
        {{ t('role.readOnlyMaster') }}
      </p>

      <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Input
          v-model="searchQuery"
          :placeholder="t('master.searchCategory')"
          class="max-w-sm"
        />
        <Select v-model="statusFilter">
          <SelectTrigger class="w-full sm:w-[180px]">
            <SelectValue :placeholder="t('status.allStatus')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{{ t('status.allStatus') }}</SelectItem>
            <SelectItem value="active">{{ t('common.active') }}</SelectItem>
            <SelectItem value="inactive">{{ t('common.inactive') }}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{{ t('master.name') }}</TableHead>
              <TableHead>{{ t('master.description') }}</TableHead>
              <TableHead>{{ t('common.status') }}</TableHead>
              <TableHead v-if="roleStore.isOwner" class="text-right">{{ t('common.actions') }}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="isLoading">
              <TableCell :colspan="roleStore.isOwner ? 4 : 3" class="text-center text-muted-foreground">
                {{ t('common.loading') }}
              </TableCell>
            </TableRow>
            <TableRow v-else-if="!filteredCategories.length">
              <TableCell :colspan="roleStore.isOwner ? 4 : 3" class="text-center text-muted-foreground">
                {{ categories.length ? t('master.noCategoryFilterMatch') : t('master.noCategory') }}
              </TableCell>
            </TableRow>
            <TableRow v-for="category in paginatedCategories" :key="category.id">
              <TableCell class="font-medium">{{ category.name }}</TableCell>
              <TableCell>{{ category.description || '-' }}</TableCell>
              <TableCell>{{ category.is_active ? t('common.active') : t('common.inactive') }}</TableCell>
              <TableCell v-if="roleStore.isOwner" class="text-right">
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

        <TablePagination
          v-if="!isLoading && totalCount > 0"
          :from="paginationFrom"
          :to="paginationTo"
          :total="totalCount"
          :current-page="currentPage"
          :total-pages="totalPages"
          :page-size="pageSize"
          @update:page-size="pageSize = $event"
          @previous="goToPage(currentPage - 1)"
          @next="goToPage(currentPage + 1)"
        />
      </div>

      <CategoryFormDialog
        v-if="roleStore.isOwner"
        v-model:open="dialogOpen"
        :category="selectedCategory"
        @saved="loadCategories"
      />
    </div>
  </DashboardLayout>
</template>
