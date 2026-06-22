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
import type { CartAddonSelection } from '@/lib/addon'
import type { Product } from '@/types/database'

const props = defineProps<{
  open: boolean
  product: Product | null
  addons: Product[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: [addons: CartAddonSelection[]]
}>()

const selectedAddonIds = ref<string[]>([])

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      selectedAddonIds.value = []
    }
  },
)

const selectedAddons = computed(() =>
  props.addons.filter((addon) => selectedAddonIds.value.includes(addon.id)),
)

const addonTotal = computed(() =>
  selectedAddons.value.reduce((sum, addon) => sum + addon.price, 0),
)

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)
}

function toggleAddon(addonId: string, checked: boolean) {
  if (checked) {
    if (!selectedAddonIds.value.includes(addonId)) {
      selectedAddonIds.value = [...selectedAddonIds.value, addonId]
    }
    return
  }

  selectedAddonIds.value = selectedAddonIds.value.filter((id) => id !== addonId)
}

function handleConfirm() {
  emit(
    'confirm',
    selectedAddons.value.map((product) => ({
      product,
      quantity: 1,
    })),
  )
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[480px]">
      <DialogHeader class="shrink-0 border-b px-6 pt-6 pb-4">
        <DialogTitle>Pilih Addon</DialogTitle>
        <DialogDescription v-if="product">
          {{ product.name }} — addon opsional
        </DialogDescription>
      </DialogHeader>

      <div class="flex-1 space-y-4 overflow-y-auto px-6 py-4">
        <div class="space-y-2">
          <label
            v-for="addon in addons"
            :key="addon.id"
            class="flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm"
          >
            <span class="flex items-center gap-2">
              <input
                type="checkbox"
                class="size-4 rounded border"
                :checked="selectedAddonIds.includes(addon.id)"
                @change="toggleAddon(addon.id, ($event.target as HTMLInputElement).checked)"
              >
              <span>{{ addon.name }}</span>
            </span>
            <span class="text-muted-foreground">{{ formatPrice(addon.price) }}</span>
          </label>
        </div>

        <div class="flex items-center justify-between text-sm">
          <span class="text-muted-foreground">Tambahan addon</span>
          <span class="font-medium">{{ formatPrice(addonTotal) }}</span>
        </div>
      </div>

      <DialogFooter class="shrink-0 border-t bg-background px-6 py-4">
        <DialogClose as-child>
          <Button type="button" variant="outline">Batal</Button>
        </DialogClose>
        <Button type="button" @click="handleConfirm">
          Tambah ke Keranjang
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
