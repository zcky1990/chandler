<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Download, Landmark, MessageCircle, QrCode } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useI18n } from '@/composables/useI18n'
import { getShopConfig, hasPaymentConfig, hasQrisConfig, hasTransferConfig } from '@/lib/config'
import {
  formatWhatsappDisplay,
  getPaymentProofWhatsapp,
  getWhatsappProofUrl,
} from '@/lib/payment'
import type { ShopConfig } from '@/types/database'
import { useAlertStore } from '@/stores/useAlertStore'

const props = defineProps<{
  open: boolean
}>()

const { t } = useI18n()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const shopConfig = ref<ShopConfig | null>(null)
const isLoading = ref(false)
const isDownloadingQris = ref(false)
const alertStore = useAlertStore()

const paymentConfigured = computed(() => hasPaymentConfig(shopConfig.value))
const showQris = computed(() => hasQrisConfig(shopConfig.value))
const showTransfer = computed(() => hasTransferConfig(shopConfig.value))

const proofWhatsapp = computed(() => getPaymentProofWhatsapp())
const proofWhatsappDisplay = computed(() => formatWhatsappDisplay(proofWhatsapp.value))
const proofWhatsappUrl = computed(() => getWhatsappProofUrl())

async function loadConfig() {
  isLoading.value = true
  const { config } = await getShopConfig()
  shopConfig.value = config
  isLoading.value = false
}

async function downloadQris() {
  const url = shopConfig.value?.qris_image_url
  if (!url) return

  isDownloadingQris.value = true

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(t('paymentInstructions.downloadQrisFailed'))
    }

    const blob = await response.blob()
    const extension = blob.type.split('/')[1]?.replace('jpeg', 'jpg') || 'png'
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = `qris-warung-zavi.${extension}`
    link.click()
    URL.revokeObjectURL(objectUrl)
  } catch {
    alertStore.showAlert(t('alert.error'), t('paymentInstructions.downloadFailed'), 'error')
  } finally {
    isDownloadingQris.value = false
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      loadConfig()
    }
  },
)
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-[480px]">
      <DialogHeader>
        <DialogTitle>{{ t('paymentInstructions.title') }}</DialogTitle>
        <DialogDescription>
          {{ t('paymentInstructions.descDebt') }}
        </DialogDescription>
      </DialogHeader>

      <div
        v-if="isLoading"
        class="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground"
      >
        {{ t('paymentInstructions.loading') }}
      </div>

      <div v-else class="space-y-5">
        <template v-if="paymentConfigured">
          <section v-if="showQris" class="space-y-3">
            <div class="flex items-center gap-2">
              <div class="flex size-9 items-center justify-center rounded-lg bg-foreground text-background">
                <QrCode class="size-4" />
              </div>
              <h3 class="font-semibold">{{ t('paymentInstructions.qris') }}</h3>
            </div>
            <div class="flex justify-center rounded-xl border bg-muted/30 p-4">
              <img
                :src="shopConfig!.qris_image_url!"
                alt="QRIS"
                class="max-h-64 max-w-full rounded-lg object-contain"
              >
            </div>
            <Button
              variant="outline"
              class="w-full"
              :disabled="isDownloadingQris"
              @click="downloadQris"
            >
              <Download class="size-4" />
              {{ isDownloadingQris ? t('paymentInstructions.downloading') : t('paymentInstructions.downloadQris') }}
            </Button>
            <p class="text-sm text-muted-foreground">
              {{ t('paymentInstructions.qrisScanNote') }}
            </p>
          </section>

          <section v-if="showTransfer" class="space-y-3">
            <div class="flex items-center gap-2">
              <div class="flex size-9 items-center justify-center rounded-lg bg-foreground text-background">
                <Landmark class="size-4" />
              </div>
              <h3 class="font-semibold">{{ t('paymentInstructions.transfer') }}</h3>
            </div>
            <div class="space-y-3 rounded-xl border bg-muted/30 p-4 text-sm">
              <div class="flex justify-between gap-4">
                <span class="text-muted-foreground">{{ t('payment.bank') }}</span>
                <span class="font-medium">{{ shopConfig?.transfer_bank_name || '-' }}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-muted-foreground">{{ t('payment.accountNumber') }}</span>
                <span class="font-mono font-semibold">{{ shopConfig?.transfer_account_number }}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-muted-foreground">{{ t('payment.accountHolder') }}</span>
                <span class="font-medium">{{ shopConfig?.transfer_account_holder || '-' }}</span>
              </div>
            </div>
            <p class="text-sm text-muted-foreground">
              {{ t('paymentInstructions.transferDebtNote') }}
            </p>
          </section>
        </template>

        <div
          v-else
          class="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground"
        >
          {{ t('paymentInstructions.notConfigured') }}
        </div>

        <section class="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div class="flex items-start gap-3">
            <MessageCircle class="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div class="space-y-2 text-sm">
              <p class="font-medium">{{ t('paymentInstructions.proof') }}</p>
              <p class="text-muted-foreground">
                {{ t('paymentInstructions.proofDesc') }}
              </p>
              <p v-if="proofWhatsappDisplay" class="font-mono font-semibold">
                {{ proofWhatsappDisplay }}
              </p>
              <p v-else class="text-muted-foreground">
                {{ t('paymentInstructions.noWhatsappAdmin') }}
              </p>
              <Button
                v-if="proofWhatsappUrl"
                as-child
                class="w-full sm:w-auto"
              >
                <a
                  :href="proofWhatsappUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle class="size-4" />
                  {{ t('paymentInstructions.whatsapp') }}
                </a>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </DialogContent>
  </Dialog>
</template>
