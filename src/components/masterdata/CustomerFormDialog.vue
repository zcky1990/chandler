<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { createCustomer, updateCustomer } from '@/lib/customer'
import { useAlertStore } from '@/stores/useAlertStore'
import type { Customer } from '@/types/database'

type CustomerFormState = {
  name: string
  email: string
  phone: string
  address: string
  notes: string
  is_active: boolean
}

const props = defineProps<{
  open: boolean
  customer?: Customer | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: []
}>()

const alertStore = useAlertStore()
const isSubmitting = ref(false)
const errors = ref<Record<string, string>>({})

const defaultForm = (): CustomerFormState => ({
  name: '',
  email: '',
  phone: '',
  address: '',
  notes: '',
  is_active: true,
})

const form = ref<CustomerFormState>(defaultForm())

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return

    errors.value = {}
    form.value = props.customer
      ? {
          name: props.customer.name,
          email: props.customer.email ?? '',
          phone: props.customer.phone ?? '',
          address: props.customer.address ?? '',
          notes: props.customer.notes ?? '',
          is_active: props.customer.is_active,
        }
      : defaultForm()
  },
)

function setError(fieldErrors: Record<string, string[] | undefined>) {
  errors.value = Object.fromEntries(
    Object.entries(fieldErrors)
      .filter(([, messages]) => messages?.length)
      .map(([field, messages]) => [field, messages![0]!]),
  )
}

async function handleSubmit() {
  isSubmitting.value = true
  errors.value = {}

  const payload = {
    name: form.value.name,
    email: form.value.email || null,
    phone: form.value.phone || null,
    address: form.value.address || null,
    notes: form.value.notes || null,
    is_active: form.value.is_active,
  }

  const result = props.customer
    ? await updateCustomer(props.customer.id, payload)
    : await createCustomer(payload)

  isSubmitting.value = false

  if (result.error && typeof result.error === 'object') {
    setError(result.error as Record<string, string[] | undefined>)
    return
  }

  if (result.error) {
    alertStore.showAlert('Error', 'Gagal menyimpan pembeli', 'error')
    return
  }

  alertStore.showAlert(
    'Berhasil',
    props.customer ? 'Pembeli berhasil diperbarui' : 'Pembeli berhasil ditambahkan',
    'success',
  )
  emit('update:open', false)
  emit('saved')
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[520px]">
      <DialogHeader>
        <DialogTitle>{{ customer ? 'Edit Pembeli' : 'Tambah Pembeli' }}</DialogTitle>
        <DialogDescription>
          {{ customer ? 'Perbarui data pembeli di bawah ini.' : 'Isi form untuk menambahkan pembeli baru.' }}
        </DialogDescription>
      </DialogHeader>

      <form class="grid gap-4" @submit.prevent="handleSubmit">
        <FieldGroup>
          <Field>
            <FieldLabel for="customer-name">Nama</FieldLabel>
            <Input id="customer-name" v-model="form.name" placeholder="Nama pembeli" required />
            <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
          </Field>

          <div class="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel for="customer-email">Email</FieldLabel>
              <Input id="customer-email" v-model="form.email" type="email" placeholder="email@example.com" />
              <p v-if="errors.email" class="text-sm text-destructive">{{ errors.email }}</p>
            </Field>

            <Field>
              <FieldLabel for="customer-phone">Telepon</FieldLabel>
              <Input id="customer-phone" v-model="form.phone" placeholder="08xxxxxxxxxx" />
            </Field>
          </div>

          <Field>
            <FieldLabel for="customer-address">Alamat</FieldLabel>
            <Textarea id="customer-address" v-model="form.address" placeholder="Alamat pembeli" rows="2" />
          </Field>

          <Field>
            <FieldLabel for="customer-notes">Catatan</FieldLabel>
            <Textarea id="customer-notes" v-model="form.notes" placeholder="Catatan tambahan" rows="2" />
          </Field>

          <div class="flex items-center justify-between rounded-lg border p-4">
            <div class="space-y-0.5">
              <Label for="customer-active">Aktif</Label>
              <p class="text-xs text-muted-foreground">
                {{ form.is_active ? 'Pembeli dapat dipilih di transaksi' : 'Pembeli disembunyikan dari transaksi' }}
              </p>
            </div>
            <Switch id="customer-active" v-model="form.is_active" />
          </div>
        </FieldGroup>

        <DialogFooter>
          <DialogClose as-child>
            <Button type="button" variant="outline">Batal</Button>
          </DialogClose>
          <Button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
