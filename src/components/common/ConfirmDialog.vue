<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useI18n } from '@/composables/useI18n'

defineProps<{
  open: boolean
  message: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
  cancel: []
}>()

const { t } = useI18n()
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[440px]">
      <DialogHeader>
        <DialogTitle>{{ t('common.confirm') }}</DialogTitle>
        <DialogDescription>{{ message }}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button type="button" variant="outline" @click="emit('cancel')">
          {{ t('common.cancel') }}
        </Button>
        <Button type="button" @click="emit('confirm')">
          {{ t('common.continue') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
