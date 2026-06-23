<script setup lang="ts">
import { Check, ChefHat, Play } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatItemWithAddons } from '@/lib/addon'
import { formatQueueNumber } from '@/lib/format'
import type { OrderQueueWithDetails } from '@/types/database'

defineProps<{
  queue: OrderQueueWithDetails
  statusLabel: string
  isUpdating: boolean
}>()

const emit = defineEmits<{
  pickup: [queueId: string]
  markReady: [queueId: string]
  complete: [queueId: string]
}>()

function formatItems(queue: OrderQueueWithDetails) {
  return (queue.transactions?.transaction_items ?? [])
    .map((item) => formatItemWithAddons(item))
    .join(', ')
}
</script>

<template>
  <Card class="gap-0 py-0">
    <CardHeader class="border-b px-4 py-4">
      <div class="flex items-start justify-between gap-3">
        <div>
          <CardTitle class="text-xl">
            {{ formatQueueNumber(queue.queue_number) }}
          </CardTitle>
          <p class="mt-1 text-sm text-muted-foreground">
            {{ queue.transactions?.customers?.name ?? 'Pembeli tidak diketahui' }}
            <span v-if="queue.table_number"> · Meja {{ queue.table_number }}</span>
          </p>
        </div>
        <span class="rounded-md border px-2 py-1 text-xs font-medium">
          {{ statusLabel }}
        </span>
      </div>
    </CardHeader>

    <CardContent class="space-y-4 p-4">
      <div>
        <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Item Pesanan
        </p>
        <p class="mt-1 text-sm">
          {{ formatItems(queue) || '-' }}
        </p>
      </div>

      <p
        v-if="queue.transactions?.notes"
        class="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground"
      >
        {{ queue.transactions.notes }}
      </p>

      <div class="flex flex-wrap gap-2">
        <Button
          v-if="queue.status === 'waiting'"
          size="sm"
          :disabled="isUpdating"
          @click="emit('pickup', queue.id)"
        >
          <Play class="size-4" />
          Pickup
        </Button>
        <Button
          v-if="queue.status === 'preparing'"
          size="sm"
          variant="secondary"
          :disabled="isUpdating"
          @click="emit('markReady', queue.id)"
        >
          <ChefHat class="size-4" />
          Siap
        </Button>
        <Button
          v-if="queue.status === 'ready'"
          size="sm"
          variant="outline"
          :disabled="isUpdating"
          @click="emit('complete', queue.id)"
        >
          <Check class="size-4" />
          Selesai
        </Button>
      </div>
    </CardContent>
  </Card>
</template>
