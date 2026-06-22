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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createProduct,
  getAddonProducts,
  getProductAddons,
  saveProductAddons,
  updateProduct,
} from '@/lib/product'
import { useAlertStore } from '@/stores/useAlertStore'
import type { Product, ProductType } from '@/types/database'

type ProductFormState = {
  name: string
  description: string
  price: number
  purchase_price: number
  stock_quantity: number
  sku: string
  image_url: string
  product_type: ProductType
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
const isLoadingAddons = ref(false)
const errors = ref<Record<string, string>>({})
const addonOptions = ref<Product[]>([])
const selectedAddonIds = ref<string[]>([])

const defaultForm = (): ProductFormState => ({
  name: '',
  description: '',
  price: 0,
  purchase_price: 0,
  stock_quantity: 0,
  sku: '',
  image_url: '',
  product_type: 'menu',
  is_active: true,
})

const form = ref<ProductFormState>(defaultForm())

async function loadAddonData(productId?: string) {
  isLoadingAddons.value = true

  const { products, error } = await getAddonProducts()
  if (error) {
    alertStore.showAlert('Error', error.message, 'error')
    isLoadingAddons.value = false
    return
  }

  addonOptions.value = products ?? []

  if (productId) {
    const { addons, error: mappingError } = await getProductAddons(productId)
    if (mappingError) {
      alertStore.showAlert('Error', mappingError.message, 'error')
      selectedAddonIds.value = []
    } else {
      selectedAddonIds.value = addons.map((addon) => addon.id)
    }
  } else {
    selectedAddonIds.value = []
  }

  isLoadingAddons.value = false
}

function toggleAddon(addonId: string, checked: boolean) {
  if (checked) {
    if (!selectedAddonIds.value.includes(addonId)) {
      selectedAddonIds.value = [...selectedAddonIds.value, addonId]
    }
    return
  }

  selectedAddonIds.value = selectedAddonIds.value.filter((id) => id !== addonId)
}

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return

    errors.value = {}
    form.value = props.product
      ? {
          name: props.product.name,
          description: props.product.description ?? '',
          price: props.product.price,
          purchase_price: props.product.purchase_price ?? 0,
          stock_quantity: props.product.stock_quantity,
          sku: props.product.sku ?? '',
          image_url: props.product.image_url ?? '',
          product_type: props.product.product_type ?? 'menu',
          is_active: props.product.is_active,
        }
      : defaultForm()

    await loadAddonData(props.product?.id)
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
    purchase_price: form.value.purchase_price,
    stock_quantity: form.value.stock_quantity,
    sku: form.value.sku || null,
    image_url: form.value.image_url || null,
    product_type: form.value.product_type,
    is_active: form.value.is_active,
  }

  const result = props.product
    ? await updateProduct(props.product.id, payload)
    : await createProduct(payload)

  if (result.error && typeof result.error === 'object') {
    isSubmitting.value = false
    setError(result.error as Record<string, string[] | undefined>)
    return
  }

  if (result.error || !result.product) {
    isSubmitting.value = false
    alertStore.showAlert('Error', 'Gagal menyimpan produk', 'error')
    return
  }

  if (form.value.product_type === 'menu') {
    const { error: mappingError } = await saveProductAddons(result.product.id, selectedAddonIds.value)
    if (mappingError) {
      isSubmitting.value = false
      alertStore.showAlert('Error', mappingError.message, 'error')
      return
    }
  } else if (props.product) {
    await saveProductAddons(props.product.id, [])
  }

  isSubmitting.value = false

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
    <DialogContent class="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[520px]">
      <DialogHeader class="shrink-0 border-b px-6 pt-6 pb-4">
        <DialogTitle>{{ product ? 'Edit Produk' : 'Tambah Produk' }}</DialogTitle>
        <DialogDescription>
          {{ product ? 'Perbarui data produk di bawah ini.' : 'Isi form untuk menambahkan produk baru.' }}
        </DialogDescription>
      </DialogHeader>

      <form class="flex min-h-0 flex-1 flex-col" @submit.prevent="handleSubmit">
        <div class="flex-1 overflow-y-auto px-6 py-4">
          <FieldGroup>
          <Field>
            <FieldLabel for="product-type">Tipe</FieldLabel>
            <Select v-model="form.product_type">
              <SelectTrigger id="product-type" class="w-full">
                <SelectValue placeholder="Pilih tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="menu">Menu (makanan/minuman utama)</SelectItem>
                <SelectItem value="addon">Addon (topping/extra)</SelectItem>
              </SelectContent>
            </Select>
          </Field>

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
              <FieldLabel for="product-price">Harga jual</FieldLabel>
              <Input id="product-price" v-model.number="form.price" type="number" min="0" step="0.01" required />
              <p v-if="errors.price" class="text-sm text-destructive">{{ errors.price }}</p>
            </Field>

            <Field>
              <FieldLabel for="product-purchase-price">Harga beli (default)</FieldLabel>
              <Input
                id="product-purchase-price"
                v-model.number="form.purchase_price"
                type="number"
                min="0"
                step="0.01"
                required
              />
              <p class="text-xs text-muted-foreground">
                Dipakai sebagai default saat restock. Batch lama tidak berubah.
              </p>
              <p v-if="errors.purchase_price" class="text-sm text-destructive">{{ errors.purchase_price }}</p>
            </Field>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel for="product-stock">{{ product ? 'Stok saat ini' : 'Stok awal' }}</FieldLabel>
              <Input
                v-if="!product"
                id="product-stock"
                v-model.number="form.stock_quantity"
                type="number"
                min="0"
                required
              />
              <div v-else class="space-y-1">
                <Input
                  id="product-stock"
                  :model-value="form.stock_quantity"
                  type="number"
                  disabled
                />
                <p class="text-xs text-muted-foreground">
                  Gunakan menu Restock untuk menambah stok.
                </p>
              </div>
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

          <div
            v-if="form.product_type === 'menu'"
            class="space-y-3 rounded-lg border p-4"
          >
            <div>
              <p class="text-sm font-medium">Addon tersedia</p>
              <p class="text-xs text-muted-foreground">
                Pilih addon yang bisa ditambahkan saat transaksi untuk menu ini.
              </p>
            </div>

            <p v-if="isLoadingAddons" class="text-sm text-muted-foreground">Memuat addon...</p>
            <p v-else-if="!addonOptions.length" class="text-sm text-muted-foreground">
              Belum ada produk tipe Addon. Buat produk addon terlebih dahulu.
            </p>

            <div v-else class="space-y-2">
              <label
                v-for="addon in addonOptions"
                :key="addon.id"
                class="flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  class="size-4 rounded border"
                  :checked="selectedAddonIds.includes(addon.id)"
                  @change="toggleAddon(addon.id, ($event.target as HTMLInputElement).checked)"
                >
                <span>{{ addon.name }} · {{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(addon.price) }}</span>
              </label>
            </div>
          </div>

          <div class="flex items-center justify-between rounded-lg border p-4">
            <div class="space-y-0.5">
              <Label for="product-active">Aktif</Label>
              <p class="text-xs text-muted-foreground">
                {{ form.is_active
                  ? (form.product_type === 'menu' ? 'Produk dapat dipilih di transaksi' : 'Addon dapat dipilih pada menu')
                  : 'Produk disembunyikan dari transaksi' }}
              </p>
            </div>
            <Switch id="product-active" v-model="form.is_active" />
          </div>
        </FieldGroup>
        </div>

        <DialogFooter class="shrink-0 border-t bg-background px-6 py-4">
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
