<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Pencil, Plus, Trash2 } from '@lucide/vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import CustomerFormDialog from '@/components/masterdata/CustomerFormDialog.vue'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { deleteCustomer, getCustomers } from '@/lib/customer'
import { useAlertStore } from '@/stores/useAlertStore'
import type { Customer } from '@/types/database'

const alertStore = useAlertStore()
const customers = ref<Customer[]>([])
const isLoading = ref(true)
const dialogOpen = ref(false)
const selectedCustomer = ref<Customer | null>(null)

async function loadCustomers() {
  isLoading.value = true
  const { customers: data, error } = await getCustomers()
  isLoading.value = false

  if (error) {
    alertStore.showAlert('Error', error.message, 'error')
    return
  }

  customers.value = data ?? []
}

function openCreateDialog() {
  selectedCustomer.value = null
  dialogOpen.value = true
}

function openEditDialog(customer: Customer) {
  selectedCustomer.value = customer
  dialogOpen.value = true
}

async function handleDelete(customer: Customer) {
  if (!confirm(`Hapus pembeli "${customer.name}"?`)) return

  const { error } = await deleteCustomer(customer.id)
  if (error) {
    alertStore.showAlert('Error', error.message, 'error')
    return
  }

  alertStore.showAlert('Berhasil', 'Pembeli berhasil dihapus', 'success')
  await loadCustomers()
}

onMounted(loadCustomers)
</script>

<template>
  <DashboardLayout>
    <div class="flex flex-col gap-6 p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Master Pembeli</h1>
          <p class="text-sm text-muted-foreground">Kelola data pembeli warung.</p>
        </div>
        <Button @click="openCreateDialog">
          <Plus class="size-4" />
          Tambah Pembeli
        </Button>
      </div>

      <div class="rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telepon</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="isLoading">
              <TableCell colspan="6" class="text-center text-muted-foreground">
                Memuat data...
              </TableCell>
            </TableRow>
            <TableRow v-else-if="!customers.length">
              <TableCell colspan="6" class="text-center text-muted-foreground">
                Belum ada pembeli.
              </TableCell>
            </TableRow>
            <TableRow v-for="customer in customers" :key="customer.id">
              <TableCell class="font-medium">{{ customer.name }}</TableCell>
              <TableCell>{{ customer.email || '-' }}</TableCell>
              <TableCell>{{ customer.phone || '-' }}</TableCell>
              <TableCell>{{ customer.address || '-' }}</TableCell>
              <TableCell>{{ customer.is_active ? 'Aktif' : 'Nonaktif' }}</TableCell>
              <TableCell class="text-right">
                <div class="flex justify-end gap-2">
                  <Button size="icon-sm" variant="outline" @click="openEditDialog(customer)">
                    <Pencil class="size-4" />
                  </Button>
                  <Button size="icon-sm" variant="destructive" @click="handleDelete(customer)">
                    <Trash2 class="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <CustomerFormDialog
        v-model:open="dialogOpen"
        :customer="selectedCustomer"
        @saved="loadCustomers"
      />
    </div>
  </DashboardLayout>
</template>
