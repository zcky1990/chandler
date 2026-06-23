<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ArrowLeft, Banknote, QrCode, Smartphone } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useI18n } from '@/composables/useI18n'
import { getShopConfig } from '@/lib/config'
import { formatPrice } from '@/lib/format'
import type { PaymentMethod, ShopConfig, TransactionWithDetails } from '@/types/database'

const props = defineProps<{
  open: boolean
  transaction: TransactionWithDetails | null
  amount?: number
}>()

const { t } = useI18n()

const emit = defineEmits<{
  'update:open': [value: boolean]
  select: [method: PaymentMethod]
}>()

const paymentOptions = computed(() => [
  { value: 'qris' as const, label: t('payment.qris'), icon: QrCode },
  { value: 'cash' as const, label: t('payment.cash'), icon: Banknote },
  { value: 'transfer' as const, label: t('payment.transfer'), icon: Smartphone },
])

const selectedMethod = ref<PaymentMethod | null>(null)
const shopConfig = ref<ShopConfig | null>(null)
const isLoadingConfig = ref(false)

const displayAmount = computed(() =>
  props.transaction?.total_amount ?? props.amount ?? 0,
)

function resetState() {
  selectedMethod.value = null
  shopConfig.value = null
}

async function loadShopConfig() {
  isLoadingConfig.value = true
  const { config } = await getShopConfig()
  shopConfig.value = config
  isLoadingConfig.value = false
}

function handleOpenChange(isOpen: boolean) {
  emit('update:open', isOpen)
  if (!isOpen) {
    resetState()
  }
}

function selectMethod(method: PaymentMethod) {
  selectedMethod.value = method
}

function goBack() {
  selectedMethod.value = null
}

function confirmPayment() {
  if (!selectedMethod.value) return
  emit('select', selectedMethod.value)
}

watch(
  () => selectedMethod.value,
  (method) => {
    if (method === 'qris' || method === 'transfer') {
      loadShopConfig()
    }
  },
)
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="sm:max-w-[420px]">
      <DialogHeader>
        <DialogTitle>
          {{ selectedMethod ? t('payment.confirmPayment') : t('payment.chooseMethod') }}
        </DialogTitle>
        <DialogDescription>
          {{ t('payment.totalLabel') }} {{ formatPrice(displayAmount) }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="!selectedMethod" class="grid gap-3">
        <button
          v-for="option in paymentOptions"
          :key="option.value"
          type="button"
          class="flex items-center gap-3 rounded-xl border px-4 py-4 text-left transition-colors hover:bg-accent"
          @click="selectMethod(option.value)"
        >
          <div class="flex size-10 items-center justify-center rounded-lg bg-foreground text-background">
            <component :is="option.icon" class="size-5" />
          </div>
          <span class="font-medium">{{ option.label }}</span>
        </button>
      </div>

      <div v-else class="space-y-4">
        <div v-if="selectedMethod === 'qris'" class="space-y-4">
          <div
            v-if="isLoadingConfig"
            class="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground"
          >
            {{ t('payment.loadingQris') }}
          </div>
          <div
            v-else-if="shopConfig?.qris_image_url"
            class="flex justify-center rounded-xl border bg-muted/30 p-4"
          >
            <img
              :src="shopConfig.qris_image_url"
              alt="QRIS"
              class="max-h-64 max-w-full rounded-lg object-contain"
            >
          </div>
          <div
            v-else
            class="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground"
          >
            {{ t('payment.noQris') }}
          </div>
          <p class="text-sm text-muted-foreground">
            {{ t('payment.scanQris') }}
          </p>
        </div>

        <div v-else-if="selectedMethod === 'transfer'" class="space-y-4">
          <div
            v-if="isLoadingConfig"
            class="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground"
          >
            {{ t('payment.loadingBank') }}
          </div>
          <div
            v-else-if="shopConfig?.transfer_account_number"
            class="space-y-3 rounded-xl border bg-muted/30 p-4 text-sm"
          >
            <div class="flex justify-between gap-4">
              <span class="text-muted-foreground">{{ t('payment.bank') }}</span>
              <span class="font-medium">{{ shopConfig.transfer_bank_name || '-' }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-muted-foreground">{{ t('payment.accountNumber') }}</span>
              <span class="font-mono font-semibold">{{ shopConfig.transfer_account_number }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-muted-foreground">{{ t('payment.accountHolder') }}</span>
              <span class="font-medium">{{ shopConfig.transfer_account_holder || '-' }}</span>
            </div>
            <div class="flex justify-between gap-4 border-t pt-3">
              <span class="text-muted-foreground">{{ t('common.amount') }}</span>
              <span class="font-bold">{{ formatPrice(displayAmount) }}</span>
            </div>
          </div>
          <div
            v-else
            class="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground"
          >
            {{ t('payment.noBank') }}
          </div>
          <p class="text-sm text-muted-foreground">
            {{ t('payment.transferNote') }}
          </p>
        </div>

        <div v-else class="rounded-xl border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
          {{ t('payment.cashNote') }}
        </div>

        <div class="flex gap-2">
          <Button variant="outline" class="flex-1" @click="goBack">
            <ArrowLeft class="size-4" />
            {{ t('common.back') }}
          </Button>
          <Button class="flex-1" @click="confirmPayment">
            {{ t('payment.confirmPaid') }}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
