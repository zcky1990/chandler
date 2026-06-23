<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Minus, Plus, Trash2 } from '@lucide/vue'
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
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { updateTransactionItems } from '@/lib/transaction'
import { formatPrice } from '@/lib/format'
import { useAlertStore } from '@/stores/useAlertStore'
import type { TransactionWithDetails } from '@/types/database'

type EditableItem = {
  id: string
  product_id: string
  name: string
  quantity: number
  unit_price: number
}

const props = defineProps<{
  open: boolean
  transaction: TransactionWithDetails | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: []
}>()

const alertStore = useAlertStore()
const notes = ref('')
const items = ref<EditableItem[]>([])
const isSubmitting = ref(false)
const errors = ref<Record<string, string>>({})

const totalAmount = computed(() =>
  items.value.reduce((sum, item) => sum + item.quantity * item.unit_price, 0),
)

function resetForm() {
  errors.value = {}

  if (!props.transaction) {
    notes.value = ''
    items.value = []
    return
  }

  notes.value = props.transaction.notes ?? ''
  items.value = props.transaction.transaction_items.map((item) => ({
    id: item.id,
    product_id: item.product_id ?? item.products?.id ?? '',
    name: item.products?.name ?? 'Produk',
    quantity: item.quantity,
    unit_price: Number(item.unit_price),
  }))
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) resetForm()
  },
)

function updateQuantity(itemId: string, quantity: number) {
  const item = items.value.find((entry) => entry.id === itemId)
  if (!item) return
  item.quantity = Math.max(1, Math.floor(quantity) || 1)
}

function removeItem(itemId: string) {
  if (items.value.length <= 1) {
    alertStore.showAlert('Perhatian', 'Transaksi harus memiliki minimal 1 item', 'error')
    return
  }

  items.value = items.value.filter((entry) => entry.id !== itemId)
}

function setFieldErrors(fieldErrors: Record<string, string[] | undefined>) {
  errors.value = Object.fromEntries(
    Object.entries(fieldErrors)
      .filter(([, messages]) => messages?.length)
      .map(([field, messages]) => [field, messages![0]!]),
  )
}

async function handleSave() {
  if (!props.transaction) return

  if (!items.value.length) {
    alertStore.showAlert('Perhatian', 'Transaksi harus memiliki minimal 1 item', 'error')
    return
  }

  isSubmitting.value = true
  const { error } = await updateTransactionItems(props.transaction.id, {
    notes: notes.value || null,
    items: items.value.map((item) => ({
      id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
    })),
  })
  isSubmitting.value = false

  if (error) {
    if (typeof error === 'object' && 'message' in error) {
      alertStore.showAlert('Error', String(error.message), 'error')
      return
    }

    setFieldErrors(error as Record<string, string[] | undefined>)
    return
  }

  alertStore.showAlert('Berhasil', 'Transaksi berhasil diperbarui', 'success')
  emit('update:open', false)
  emit('saved')
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
      <DialogHeader>
        <DialogTitle>Perbaiki Transaksi</DialogTitle>
        <DialogDescription v-if="transaction">
          Ubah jumlah item atau catatan transaksi.
        </DialogDescription>
      </DialogHeader>

      <div v-if="transaction" class="space-y-4">
        <div class="space-y-3">
          <p class="text-sm font-medium">Produk</p>
          <div
            v-for="item in items"
            :key="item.id"
            class="rounded-xl border px-4 py-3"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-medium">{{ item.name }}</p>
                <p class="text-sm text-muted-foreground">
                  {{ formatPrice(item.unit_price) }} / item
                </p>
              </div>
              <Button
                size="icon-sm"
                variant="ghost"
                :disabled="items.length <= 1"
                @click="removeItem(item.id)"
              >
                <Trash2 class="size-4" />
              </Button>
            </div>

            <div class="mt-3 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Button
                  size="icon-sm"
                  variant="outline"
                  @click="updateQuantity(item.id, item.quantity - 1)"
                >
                  <Minus class="size-4" />
                </Button>
                <Input
                  :model-value="item.quantity"
                  type="number"
                  min="1"
                  class="w-16 text-center"
                  @update:model-value="updateQuantity(item.id, Number($event))"
                />
                <Button
                  size="icon-sm"
                  variant="outline"
                  @click="updateQuantity(item.id, item.quantity + 1)"
                >
                  <Plus class="size-4" />
                </Button>
              </div>
              <p class="font-semibold">
                {{ formatPrice(item.unit_price * item.quantity) }}
              </p>
            </div>
          </div>
        </div>

        <Field>
          <FieldLabel for="edit-notes">Catatan</FieldLabel>
          <Textarea
            id="edit-notes"
            v-model="notes"
            placeholder="Catatan transaksi"
            rows="3"
          />
        </Field>

        <div class="flex items-center justify-between border-t pt-4">
          <span class="text-sm text-muted-foreground">Total</span>
          <span class="text-lg font-bold">{{ formatPrice(totalAmount) }}</span>
        </div>

        <p v-if="errors.items" class="text-sm text-destructive">{{ errors.items }}</p>
      </div>

      <DialogFooter>
        <DialogClose as-child>
          <Button type="button" variant="outline">Batal</Button>
        </DialogClose>
        <Button :disabled="isSubmitting" @click="handleSave">
          {{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
