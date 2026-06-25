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
import { Switch } from '@/components/ui/switch'
import { createDiningTable, updateDiningTable } from '@/lib/table'
import { useI18n } from '@/composables/useI18n'
import { useAlertStore } from '@/stores/useAlertStore'
import type { DiningTable } from '@/types/database'

type TableFormState = {
  table_number: string
  seats: number
  is_active: boolean
}

const props = defineProps<{
  open: boolean
  table?: DiningTable | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: []
}>()

const { t } = useI18n()
const alertStore = useAlertStore()
const isSubmitting = ref(false)
const errors = ref<Record<string, string>>({})

const defaultForm = (): TableFormState => ({
  table_number: '',
  seats: 4,
  is_active: true,
})

const form = ref<TableFormState>(defaultForm())

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return

    errors.value = {}
    form.value = props.table
      ? {
          table_number: props.table.table_number,
          seats: props.table.seats,
          is_active: props.table.is_active,
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
    table_number: form.value.table_number,
    seats: form.value.seats,
    is_active: form.value.is_active,
  }

  const result = props.table
    ? await updateDiningTable(props.table.id, payload)
    : await createDiningTable(payload)

  isSubmitting.value = false

  if (result.error && typeof result.error === 'object') {
    setError(result.error as Record<string, string[] | undefined>)
    return
  }

  if (result.error) {
    alertStore.showAlert(t('alert.error'), t('master.diningTableSaveFailed'), 'error')
    return
  }

  alertStore.showAlert(
    t('alert.success'),
    props.table ? t('master.diningTableUpdated') : t('master.diningTableCreated'),
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
        <DialogTitle>{{ table ? t('master.editDiningTable') : t('master.addDiningTable') }}</DialogTitle>
        <DialogDescription>
          {{ table ? t('master.diningTableEditDesc') : t('master.diningTableAddDesc') }}
        </DialogDescription>
      </DialogHeader>

      <form class="grid gap-4" @submit.prevent="handleSubmit">
        <FieldGroup>
          <Field>
            <FieldLabel for="dining-table-number">{{ t('master.diningTableNumber') }}</FieldLabel>
            <Input
              id="dining-table-number"
              v-model="form.table_number"
              :placeholder="t('master.diningTableNumberPh')"
              required
            />
            <p v-if="errors.table_number" class="text-sm text-destructive">{{ errors.table_number }}</p>
          </Field>

          <Field>
            <FieldLabel for="dining-table-seats">{{ t('master.diningTableSeats') }}</FieldLabel>
            <Input
              id="dining-table-seats"
              v-model.number="form.seats"
              type="number"
              min="1"
              required
            />
            <p v-if="errors.seats" class="text-sm text-destructive">{{ errors.seats }}</p>
          </Field>

          <div class="flex items-center justify-between rounded-lg border p-4">
            <div class="space-y-0.5">
              <Label for="dining-table-active">{{ t('common.active') }}</Label>
              <p class="text-xs text-muted-foreground">
                {{ form.is_active ? t('master.diningTableActiveHint') : t('master.diningTableInactiveHint') }}
              </p>
            </div>
            <Switch id="dining-table-active" v-model="form.is_active" />
          </div>
        </FieldGroup>

        <DialogFooter>
          <DialogClose as-child>
            <Button type="button" variant="outline">{{ t('common.cancel') }}</Button>
          </DialogClose>
          <Button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? t('common.saving') : t('common.save') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
