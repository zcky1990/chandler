<script setup lang="ts">
import { RouterLink } from 'vue-router'
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
import { formatPrice } from '@/lib/format'
import { formatPreOrderNumber } from '@/lib/pre-order'
import type { PreOrder } from '@/types/database'

defineProps<{
  open: boolean
  order: PreOrder | null
}>()

const { t } = useI18n()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[420px]">
      <DialogHeader>
        <DialogTitle>{{ t('order.successTitle') }}</DialogTitle>
        <DialogDescription v-if="order">
          {{ t('order.successDesc') }} <span class="font-semibold text-foreground">{{ formatPreOrderNumber(order.order_number) }}</span>
        </DialogDescription>
      </DialogHeader>

      <div v-if="order" class="space-y-3 text-sm">
        <p>
          {{ t('order.successTotal') }}: <span class="font-semibold">{{ formatPrice(order.total_amount) }}</span>
        </p>
        <p class="rounded-lg border bg-muted/40 p-3 text-muted-foreground">
          {{ t('order.successCashierDetail') }}
        </p>
      </div>

      <DialogFooter class="flex-col gap-2 sm:flex-col">
        <Button variant="outline" class="w-full" as-child>
          <RouterLink to="/" @click="emit('update:open', false)">
            {{ t('order.successHome') }}
          </RouterLink>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
