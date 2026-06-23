<script setup lang="ts">
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const customerName = defineModel<string>('customerName', { required: true })
const tableNumber = defineModel<string>('tableNumber', { required: true })
const notes = defineModel<string>('notes', { required: true })
</script>

<template>
  <FieldGroup class="gap-4">
    <Field>
      <FieldLabel for="order-customer-name">Nama Pelanggan</FieldLabel>
      <Input
        id="order-customer-name"
        v-model="customerName"
        placeholder="Opsional"
      />
    </Field>

    <Field>
      <FieldLabel for="order-table-number">Nomor Meja</FieldLabel>
      <Input
        id="order-table-number"
        v-model="tableNumber"
        placeholder="Contoh: 5"
      />
    </Field>

    <Field>
      <FieldLabel for="order-notes">Catatan</FieldLabel>
      <Textarea
        id="order-notes"
        v-model="notes"
        placeholder="Permintaan khusus"
        rows="2"
        class="resize-none"
      />
    </Field>
  </FieldGroup>
</template>
