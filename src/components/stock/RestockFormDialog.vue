<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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
import { useI18n } from '@/composables/useI18n'
import { restockProduct } from '@/lib/stock'
import { formatPrice } from '@/lib/format'
import { useAlertStore } from '@/stores/useAlertStore'
import type { Product } from '@/types/database'

type RestockFormState = {
  quantity: number
  unit_cost: number
  notes: string
}

const props = defineProps<{
  open: boolean
  product: Product | null
}>()

const { t } = useI18n()

const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: []
}>()

const alertStore = useAlertStore()
const isSubmitting = ref(false)
const errors = ref<Record<string, string>>({})

const defaultForm = (product: Product | null): RestockFormState => ({
  quantity: 1,
  unit_cost: product?.purchase_price ?? 0,
  notes: '',
})

const form = ref<RestockFormState>(defaultForm(null))

const totalCost = computed(() => form.value.quantity * form.value.unit_cost)

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return

    errors.value = {}
    form.value = defaultForm(props.product)
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
  if (!props.product) return

  isSubmitting.value = true
  errors.value = {}

  const result = await restockProduct({
    product_id: props.product.id,
    quantity: form.value.quantity,
    unit_cost: form.value.unit_cost,
    notes: form.value.notes || null,
  })

  isSubmitting.value = false

  if (result.error && typeof result.error === 'object' && !('message' in result.error)) {
    setError(result.error as Record<string, string[] | undefined>)
    return
  }

  if (result.error) {
    const message = 'message' in (result.error as object)
      ? (result.error as { message: string }).message
      : t('restock.failed')
    alertStore.showAlert(t('alert.error'), message, 'error')
    return
  }

  alertStore.showAlert(
    t('alert.success'),
    t('restock.successQty', { name: props.product.name, qty: form.value.quantity }),
    'success',
  )
  emit('update:open', false)
  emit('saved')
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[440px]">
      <DialogHeader>
        <DialogTitle>{{ t('restock.dialogTitle') }}</DialogTitle>
        <DialogDescription>
          {{ t('restock.dialogDesc', { name: product?.name ?? t('common.product') }) }}
        </DialogDescription>
      </DialogHeader>

      <form v-if="product" class="grid gap-4" @submit.prevent="handleSubmit">
        <FieldGroup>
          <Field>
            <FieldLabel>{{ t('restock.currentStock') }}</FieldLabel>
            <Input :model-value="product.stock_quantity" type="number" disabled />
          </Field>

          <Field>
            <FieldLabel for="restock-quantity">{{ t('restock.qtyInLabel') }}</FieldLabel>
            <Input
              id="restock-quantity"
              v-model.number="form.quantity"
              type="number"
              min="1"
              required
            />
            <p v-if="errors.quantity" class="text-sm text-destructive">{{ errors.quantity }}</p>
          </Field>

          <Field>
            <FieldLabel for="restock-unit-cost">{{ t('restock.unitCostLabel') }}</FieldLabel>
            <Input
              id="restock-unit-cost"
              v-model.number="form.unit_cost"
              type="number"
              min="0"
              step="0.01"
              required
            />
            <p class="text-xs text-muted-foreground">
              {{ t('restock.costHint') }}
            </p>
            <p v-if="errors.unit_cost" class="text-sm text-destructive">{{ errors.unit_cost }}</p>
          </Field>

          <div class="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
            <span class="text-muted-foreground">{{ t('restock.totalCostLabel') }} </span>
            <span class="font-semibold">{{ formatPrice(totalCost) }}</span>
          </div>

          <Field>
            <FieldLabel for="restock-notes">{{ t('restock.notesOptional') }}</FieldLabel>
            <Textarea
              id="restock-notes"
              v-model="form.notes"
              :placeholder="t('restock.notesPh')"
              rows="3"
            />
          </Field>
        </FieldGroup>

        <DialogFooter>
          <DialogClose as-child>
            <Button type="button" variant="outline">{{ t('common.cancel') }}</Button>
          </DialogClose>
          <Button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? t('common.saving') : t('restock.save') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
