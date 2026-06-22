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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { createProduct, updateProduct } from '@/lib/product'
import { useAlertStore } from '@/stores/useAlertStore'
import type { Product } from '@/types/database'

type ProductFormState = {
  name: string
  description: string
  price: number
  stock_quantity: number
  sku: string
  image_url: string
  is_active: boolean
}

const props = defineProps<{
  open: boolean
  product?: Product | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: []
}>()

const alertStore = useAlertStore()
const isSubmitting = ref(false)
const errors = ref<Record<string, string>>({})

const defaultForm = (): ProductFormState => ({
  name: '',
  description: '',
  price: 0,
  stock_quantity: 0,
  sku: '',
  image_url: '',
  is_active: true,
})

const form = ref<ProductFormState>(defaultForm())

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return

    errors.value = {}
    form.value = props.product
      ? {
          name: props.product.name,
          description: props.product.description ?? '',
          price: props.product.price,
          stock_quantity: props.product.stock_quantity,
          sku: props.product.sku ?? '',
          image_url: props.product.image_url ?? '',
          is_active: props.product.is_active,
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
    price: form.value.price,
    stock_quantity: form.value.stock_quantity,
    sku: form.value.sku || null,
    image_url: form.value.image_url || null,
    is_active: form.value.is_active,
  }

  const result = props.product
    ? await updateProduct(props.product.id, payload)
    : await createProduct(payload)

  isSubmitting.value = false

  if (result.error && typeof result.error === 'object') {
    setError(result.error as Record<string, string[] | undefined>)
    return
  }

  if (result.error) {
    alertStore.showAlert('Error', 'Gagal menyimpan produk', 'error')
    return
  }

  alertStore.showAlert(
    'Berhasil',
    props.product ? 'Produk berhasil diperbarui' : 'Produk berhasil ditambahkan',
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
        <DialogTitle>{{ product ? 'Edit Produk' : 'Tambah Produk' }}</DialogTitle>
        <DialogDescription>
          {{ product ? 'Perbarui data produk di bawah ini.' : 'Isi form untuk menambahkan produk baru.' }}
        </DialogDescription>
      </DialogHeader>

      <form class="grid gap-4" @submit.prevent="handleSubmit">
        <FieldGroup>
          <Field>
            <FieldLabel for="product-name">Nama</FieldLabel>
            <Input id="product-name" v-model="form.name" placeholder="Nama produk" required />
            <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
          </Field>

          <Field>
            <FieldLabel for="product-description">Deskripsi</FieldLabel>
            <Textarea id="product-description" v-model="form.description" placeholder="Deskripsi produk" rows="3" />
          </Field>

          <div class="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel for="product-price">Harga</FieldLabel>
              <Input id="product-price" v-model.number="form.price" type="number" min="0" step="0.01" required />
              <p v-if="errors.price" class="text-sm text-destructive">{{ errors.price }}</p>
            </Field>

            <Field>
              <FieldLabel for="product-stock">Stok</FieldLabel>
              <Input id="product-stock" v-model.number="form.stock_quantity" type="number" min="0" required />
              <p v-if="errors.stock_quantity" class="text-sm text-destructive">{{ errors.stock_quantity }}</p>
            </Field>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel for="product-sku">SKU</FieldLabel>
              <Input id="product-sku" v-model="form.sku" placeholder="SKU-001" />
            </Field>

            <Field>
              <FieldLabel for="product-image">URL Gambar</FieldLabel>
              <Input id="product-image" v-model="form.image_url" placeholder="https://..." />
              <p v-if="errors.image_url" class="text-sm text-destructive">{{ errors.image_url }}</p>
            </Field>
          </div>

          <Field class="flex items-center justify-between rounded-lg border p-3">
            <FieldLabel for="product-active">Aktif</FieldLabel>
            <Switch id="product-active" v-model:checked="form.is_active" />
          </Field>
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
