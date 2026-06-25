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
import { Field, FieldLabel } from '@/components/ui/field'
import TableSelect from '@/components/tables/TableSelect.vue'
import { useI18n } from '@/composables/useI18n'

const props = defineProps<{
  open: boolean
}>()

const { t } = useI18n()

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: [tableNumber: string | null]
}>()

const tableNumber = ref('')

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      tableNumber.value = ''
    }
  },
)

function handleConfirm() {
  const value = tableNumber.value.trim()
  emit('confirm', value || null)
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[400px]">
      <DialogHeader>
        <DialogTitle>{{ t('table.title') }}</DialogTitle>
        <DialogDescription>
          {{ t('table.desc') }}
        </DialogDescription>
      </DialogHeader>

      <Field>
        <FieldLabel for="table-number">{{ t('table.labelOptional') }}</FieldLabel>
        <TableSelect
          id="table-number"
          v-model="tableNumber"
          :placeholder="t('master.selectDiningTable')"
        />
      </Field>

      <DialogFooter>
        <DialogClose as-child>
          <Button type="button" variant="outline">{{ t('common.cancel') }}</Button>
        </DialogClose>
        <Button type="button" @click="handleConfirm">
          {{ t('common.continue') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
