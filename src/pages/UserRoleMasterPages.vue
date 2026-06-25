<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Plus, Shield } from '@lucide/vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import UserFormDialog from '@/components/masterdata/UserFormDialog.vue'
import TablePagination from '@/components/common/TablePagination.vue'
import { Button } from '@/components/ui/button'
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
import { getRoleLabelKey, getRoles, listProfiles, updateProfileRole } from '@/lib/profile'
import { getCurrentUser } from '@/lib/auth'
import { useAlertStore } from '@/stores/useAlertStore'
import type { AppRole, Profile, UserRole } from '@/types/database'

const { t } = useI18n()
const alertStore = useAlertStore()
const profiles = ref<Profile[]>([])
const roles = ref<AppRole[]>([])
const isLoading = ref(true)
const dialogOpen = ref(false)
const currentUserId = ref<string | null>(null)
const updatingUserId = ref<string | null>(null)

const roleRows = computed(() =>
  roles.value.map((role) => ({
    code: role.code,
    label: t(getRoleLabelKey(role.code)),
  })),
)

const {
  paginatedItems: paginatedProfiles,
  currentPage,
  pageSize,
  totalCount,
  totalPages,
  paginationFrom,
  paginationTo,
  goToPage,
} = usePagination(profiles)

async function loadData() {
  isLoading.value = true
  const [{ profiles: data, error }, { roles: roleData, error: roleError }, { user }] = await Promise.all([
    listProfiles(),
    getRoles(),
    getCurrentUser(),
  ])
  isLoading.value = false

  if (error) {
    alertStore.showAlert(t('alert.error'), error.message, 'error')
    return
  }
  if (roleError) {
    alertStore.showAlert(t('alert.error'), roleError.message, 'error')
  }

  profiles.value = data ?? []
  roles.value = roleData ?? []
  currentUserId.value = user?.id ?? null
}

async function handleRoleChange(profile: Profile, role: UserRole) {
  if (profile.role === role) return
  if (profile.id === currentUserId.value && role !== 'owner') {
    alertStore.showAlert(t('alert.error'), t('role.cannotDemoteSelf'), 'error')
    return
  }

  updatingUserId.value = profile.id
  const { error } = await updateProfileRole(profile.id, role)
  updatingUserId.value = null

  if (error) {
    alertStore.showAlert(t('alert.error'), error.message, 'error')
    return
  }

  alertStore.showAlert(t('alert.success'), t('role.updated'), 'success')
  await loadData()
}

onMounted(loadData)
</script>

<template>
  <DashboardLayout>
    <div class="flex flex-col gap-6 p-6">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h1 class="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Shield class="size-6" />
            {{ t('role.masterTitle') }}
          </h1>
          <p class="text-sm text-muted-foreground">{{ t('role.masterSubtitle') }}</p>
        </div>
        <Button @click="dialogOpen = true">
          <Plus class="size-4" />
          {{ t('role.addUser') }}
        </Button>
      </div>

      <div class="rounded-xl border bg-background p-4">
        <h2 class="text-sm font-semibold">{{ t('role.rolesTitle') }}</h2>
        <p class="mt-1 text-sm text-muted-foreground">{{ t('role.rolesDesc') }}</p>
        <ul class="mt-3 flex flex-wrap gap-2">
          <li
            v-for="role in roleRows"
            :key="role.code"
            class="rounded-md border px-3 py-1.5 text-sm font-medium"
          >
            {{ role.label }}
          </li>
        </ul>
      </div>

      <div class="rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{{ t('master.name') }}</TableHead>
              <TableHead>{{ t('master.email') }}</TableHead>
              <TableHead>{{ t('role.roleColumn') }}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="isLoading">
              <TableCell colspan="3" class="text-center text-muted-foreground">
                {{ t('common.loading') }}
              </TableCell>
            </TableRow>
            <TableRow v-else-if="!profiles.length">
              <TableCell colspan="3" class="text-center text-muted-foreground">
                {{ t('role.noUsers') }}
              </TableCell>
            </TableRow>
            <TableRow v-for="profile in paginatedProfiles" :key="profile.id">
              <TableCell class="font-medium">{{ profile.full_name || '-' }}</TableCell>
              <TableCell>{{ profile.email || '-' }}</TableCell>
              <TableCell>
                <Select
                  :model-value="profile.role"
                  :disabled="updatingUserId === profile.id"
                  @update:model-value="(value) => handleRoleChange(profile, value as UserRole)"
                >
                  <SelectTrigger class="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="role in roleRows"
                      :key="role.code"
                      :value="role.code"
                    >
                      {{ role.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
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

      <UserFormDialog v-model:open="dialogOpen" @saved="loadData" />
    </div>
  </DashboardLayout>
</template>
