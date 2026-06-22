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
import { Input } from '@/components/ui/input'

const props = defineProps<{
  open: boolean
}>()

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
        <DialogTitle>Nomor Meja</DialogTitle>
        <DialogDescription>
          Isi nomor meja jika pelanggan duduk di tempat. Boleh dikosongkan untuk dibawa pulang.
        </DialogDescription>
      </DialogHeader>

      <Field>
        <FieldLabel for="table-number">Nomor Meja (opsional)</FieldLabel>
        <Input
          id="table-number"
          v-model="tableNumber"
          placeholder="Contoh: 5, A2, Take away"
          @keyup.enter="handleConfirm"
        />
      </Field>

      <DialogFooter>
        <DialogClose as-child>
          <Button type="button" variant="outline">Batal</Button>
        </DialogClose>
        <Button type="button" @click="handleConfirm">
          Lanjutkan
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
