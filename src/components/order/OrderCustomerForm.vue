<script setup lang="ts">
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const customerName = defineModel<string>('customerName', { required: true })
const tableNumber = defineModel<string>('tableNumber', { required: true })
const notes = defineModel<string>('notes', { required: true })
</script>

<template>
  <section class="rounded-xl border bg-background p-4">
    <h2 class="mb-3 text-sm font-medium">Detail Pesanan</h2>
    <FieldGroup>
      <Field>
        <FieldLabel for="order-customer-name">Nama (opsional)</FieldLabel>
        <Input
          id="order-customer-name"
          v-model="customerName"
          placeholder="Nama Anda"
        />
      </Field>

      <Field>
        <FieldLabel for="order-table-number">Nomor meja (opsional)</FieldLabel>
        <Input
          id="order-table-number"
          v-model="tableNumber"
          placeholder="Contoh: 5"
        />
      </Field>

      <Field>
        <FieldLabel for="order-notes">Catatan (opsional)</FieldLabel>
        <Textarea
          id="order-notes"
          v-model="notes"
          placeholder="Permintaan khusus"
          rows="2"
        />
      </Field>
    </FieldGroup>
  </section>
</template>
