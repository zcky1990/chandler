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
import { createCategory, updateCategory } from '@/lib/category'
import { useAlertStore } from '@/stores/useAlertStore'
import type { ProductCategory } from '@/types/database'

type CategoryFormState = {
  name: string
  description: string
  is_active: boolean
}

const props = defineProps<{
  open: boolean
  category?: ProductCategory | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: []
}>()

const alertStore = useAlertStore()
const isSubmitting = ref(false)
const errors = ref<Record<string, string>>({})

const defaultForm = (): CategoryFormState => ({
  name: '',
  description: '',
  is_active: true,
})

const form = ref<CategoryFormState>(defaultForm())

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return

    errors.value = {}
    form.value = props.category
      ? {
          name: props.category.name,
          description: props.category.description ?? '',
          is_active: props.category.is_active,
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
    description: form.value.description || null,
    is_active: form.value.is_active,
  }

  const result = props.category
    ? await updateCategory(props.category.id, payload)
    : await createCategory(payload)

  isSubmitting.value = false

  if (result.error && typeof result.error === 'object') {
    setError(result.error as Record<string, string[] | undefined>)
    return
  }

  if (result.error) {
    alertStore.showAlert('Error', 'Gagal menyimpan kategori', 'error')
    return
  }

  alertStore.showAlert(
    'Berhasil',
    props.category ? 'Kategori berhasil diperbarui' : 'Kategori berhasil ditambahkan',
    'success',
  )
  emit('update:open', false)
  emit('saved')
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[480px]">
      <DialogHeader>
        <DialogTitle>{{ category ? 'Edit Kategori' : 'Tambah Kategori' }}</DialogTitle>
        <DialogDescription>
          {{ category ? 'Perbarui data kategori di bawah ini.' : 'Isi form untuk menambahkan kategori baru.' }}
        </DialogDescription>
      </DialogHeader>

      <form class="grid gap-4" @submit.prevent="handleSubmit">
        <FieldGroup>
          <Field>
            <FieldLabel for="category-name">Nama</FieldLabel>
            <Input id="category-name" v-model="form.name" placeholder="Contoh: Minuman, Makanan" required />
            <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
          </Field>

          <Field>
            <FieldLabel for="category-description">Deskripsi</FieldLabel>
            <Textarea id="category-description" v-model="form.description" placeholder="Deskripsi kategori (opsional)" rows="2" />
          </Field>

          <div class="flex items-center justify-between rounded-lg border p-4">
            <div class="space-y-0.5">
              <Label for="category-active">Aktif</Label>
              <p class="text-xs text-muted-foreground">
                {{ form.is_active ? 'Kategori dapat dipilih pada produk' : 'Kategori disembunyikan dari form produk' }}
              </p>
            </div>
            <Switch id="category-active" v-model="form.is_active" />
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
