<script setup lang="ts">
import { computed } from 'vue'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import TableSelect from '@/components/tables/TableSelect.vue'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/composables/useI18n'

const props = withDefaults(
  defineProps<{
    tableRequired?: boolean
  }>(),
  {
    tableRequired: false,
  },
)

const { t } = useI18n()

const customerName = defineModel<string>('customerName', { required: true })
const tableNumber = defineModel<string>('tableNumber', { required: true })
const notes = defineModel<string>('notes', { required: true })

const tablePlaceholder = computed(() =>
  props.tableRequired ? t('master.selectDiningTable') : t('common.optional'),
)
</script>

<template>
  <FieldGroup class="gap-4">
    <Field>
      <FieldLabel for="order-customer-name">{{ t('order.customerName') }}</FieldLabel>
      <Input
        id="order-customer-name"
        v-model="customerName"
        :placeholder="t('common.optional')"
      />
    </Field>

    <Field>
      <FieldLabel for="order-table-number">
        {{ t('order.tableNumber') }}
        <span v-if="tableRequired" class="text-destructive">*</span>
      </FieldLabel>
      <TableSelect
        id="order-table-number"
        v-model="tableNumber"
        :placeholder="tablePlaceholder"
      />
    </Field>

    <Field>
      <FieldLabel for="order-notes">{{ t('common.notes') }}</FieldLabel>
      <Textarea
        id="order-notes"
        v-model="notes"
        :placeholder="t('order.specialRequest')"
        rows="2"
        class="resize-none"
      />
    </Field>
  </FieldGroup>
</template>
