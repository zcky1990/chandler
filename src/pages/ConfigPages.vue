<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ImageIcon, Landmark, Printer, QrCode, Trash2, Upload } from '@lucide/vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/composables/useI18n'
import { getShopConfig, removeQrisImage, updateShopConfig, uploadQrisImage } from '@/lib/config'
import { useAlertStore } from '@/stores/useAlertStore'
import type { ShopConfig } from '@/types/database'

const { t } = useI18n()
const alertStore = useAlertStore()
const isLoading = ref(true)
const isSavingTransfer = ref(false)
const isSavingReceipt = ref(false)
const isUploadingQris = ref(false)
const isRemovingQris = ref(false)
const qrisPreview = ref<string | null>(null)

const transferForm = ref({
  transfer_bank_name: '',
  transfer_account_number: '',
  transfer_account_holder: '',
})

const receiptForm = ref({
  shop_name: '',
  shop_address: '',
})

function applyConfig(config: ShopConfig | null) {
  qrisPreview.value = config?.qris_image_url ?? null
  transferForm.value = {
    transfer_bank_name: config?.transfer_bank_name ?? '',
    transfer_account_number: config?.transfer_account_number ?? '',
    transfer_account_holder: config?.transfer_account_holder ?? '',
  }
  receiptForm.value = {
    shop_name: config?.shop_name ?? '',
    shop_address: config?.shop_address ?? '',
  }
}

async function loadConfig() {
  isLoading.value = true
  const { config, error } = await getShopConfig()
  isLoading.value = false

  if (error) {
    alertStore.showAlert(t('alert.error'), error.message, 'error')
    return
  }

  applyConfig(config)
}

async function handleQrisUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''

  if (!file) return

  if (!file.type.startsWith('image/')) {
    alertStore.showAlert(t('alert.error'), t('config.imageMustBeImage'), 'error')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    alertStore.showAlert(t('alert.error'), t('config.imageMaxSize'), 'error')
    return
  }

  isUploadingQris.value = true
  const { url, error } = await uploadQrisImage(file)
  isUploadingQris.value = false

  if (error) {
    alertStore.showAlert(t('alert.error'), error.message, 'error')
    return
  }

  qrisPreview.value = url
  alertStore.showAlert(t('alert.success'), t('config.qrisUploaded'), 'success')
}

async function handleRemoveQris() {
  if (!confirm(t('config.deleteQrisConfirm'))) return

  isRemovingQris.value = true
  const { error } = await removeQrisImage()
  isRemovingQris.value = false

  if (error) {
    const message = typeof error === 'object' && 'message' in error
      ? String(error.message)
      : t('config.qrisDeleteFailed')
    alertStore.showAlert(t('alert.error'), message, 'error')
    return
  }

  qrisPreview.value = null
  alertStore.showAlert(t('alert.success'), t('config.qrisDeleted'), 'success')
}

async function handleSaveTransfer() {
  isSavingTransfer.value = true
  const { error } = await updateShopConfig(transferForm.value)
  isSavingTransfer.value = false

  if (error) {
    const message = typeof error === 'object' && 'message' in error
      ? String(error.message)
      : t('config.transferSaveFailed')
    alertStore.showAlert(t('alert.error'), message, 'error')
    return
  }

  alertStore.showAlert(t('alert.success'), t('config.transferSaved'), 'success')
}

async function handleSaveReceipt() {
  isSavingReceipt.value = true
  const { error } = await updateShopConfig({
    shop_name: receiptForm.value.shop_name.trim() || null,
    shop_address: receiptForm.value.shop_address.trim() || null,
  })
  isSavingReceipt.value = false

  if (error) {
    const message = typeof error === 'object' && 'message' in error
      ? String(error.message)
      : t('config.receiptSaveFailed')
    alertStore.showAlert(t('alert.error'), message, 'error')
    return
  }

  alertStore.showAlert(t('alert.success'), t('config.receiptSaved'), 'success')
}

onMounted(loadConfig)
</script>

<template>
  <DashboardLayout>
    <div class="flex flex-col gap-6 p-6">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">{{ t('config.title') }}</h1>
        <p class="text-sm text-muted-foreground">
          {{ t('config.subtitle') }}
        </p>
      </div>

      <div v-if="isLoading" class="rounded-xl border px-4 py-10 text-center text-muted-foreground">
        {{ t('config.loading') }}
      </div>

      <div v-else class="grid gap-6 lg:grid-cols-2">
        <Card class="lg:col-span-2">
          <CardHeader>
            <div class="flex items-center gap-3">
              <div class="flex size-10 items-center justify-center rounded-lg bg-foreground text-background">
                <Printer class="size-5" />
              </div>
              <div>
                <CardTitle>{{ t('config.receiptInfo') }}</CardTitle>
                <CardDescription>{{ t('config.receiptDesc') }}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form class="max-w-xl" @submit.prevent="handleSaveReceipt">
              <FieldGroup>
                <Field>
                  <FieldLabel for="shop-name">{{ t('config.shopName') }}</FieldLabel>
                  <Input
                    id="shop-name"
                    v-model="receiptForm.shop_name"
                    :placeholder="t('config.shopNamePh')"
                  />
                </Field>
                <Field>
                  <FieldLabel for="shop-address">{{ t('config.shopAddress') }}</FieldLabel>
                  <Input
                    id="shop-address"
                    v-model="receiptForm.shop_address"
                    :placeholder="t('config.shopAddressPh')"
                  />
                </Field>
              </FieldGroup>
              <Button type="submit" class="mt-6" :disabled="isSavingReceipt">
                {{ isSavingReceipt ? t('common.saving') : t('config.saveReceipt') }}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div class="flex items-center gap-3">
              <div class="flex size-10 items-center justify-center rounded-lg bg-foreground text-background">
                <QrCode class="size-5" />
              </div>
              <div>
                <CardTitle>{{ t('config.qrisTitle') }}</CardTitle>
                <CardDescription>{{ t('config.qrisDesc') }}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-4">
            <div
              class="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed bg-muted/30 p-4"
            >
              <img
                v-if="qrisPreview"
                :src="qrisPreview"
                alt="QRIS"
                class="max-h-64 max-w-full rounded-lg object-contain"
              >
              <div v-else class="text-center text-sm text-muted-foreground">
                <ImageIcon class="mx-auto mb-2 size-8 opacity-50" />
                {{ t('config.noQris') }}
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <Button as-child :disabled="isUploadingQris">
                <label class="cursor-pointer">
                  <Upload class="size-4" />
                  {{ isUploadingQris ? t('config.uploading') : t('config.uploadImage') }}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    class="hidden"
                    :disabled="isUploadingQris"
                    @change="handleQrisUpload"
                  >
                </label>
              </Button>
              <Button
                v-if="qrisPreview"
                variant="outline"
                :disabled="isRemovingQris"
                @click="handleRemoveQris"
              >
                <Trash2 class="size-4" />
                {{ t('common.delete') }}
              </Button>
            </div>
            <p class="text-xs text-muted-foreground">
              {{ t('config.imageFormat') }}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div class="flex items-center gap-3">
              <div class="flex size-10 items-center justify-center rounded-lg bg-foreground text-background">
                <Landmark class="size-5" />
              </div>
              <div>
                <CardTitle>{{ t('config.transferTitle') }}</CardTitle>
                <CardDescription>{{ t('config.transferDesc') }}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form @submit.prevent="handleSaveTransfer">
              <FieldGroup>
                <Field>
                  <FieldLabel for="bank-name">{{ t('config.bankName') }}</FieldLabel>
                  <Input
                    id="bank-name"
                    v-model="transferForm.transfer_bank_name"
                    :placeholder="t('config.bankNamePh')"
                  />
                </Field>
                <Field>
                  <FieldLabel for="account-number">{{ t('payment.accountNumber') }}</FieldLabel>
                  <Input
                    id="account-number"
                    v-model="transferForm.transfer_account_number"
                    :placeholder="t('config.accountNumberPh')"
                  />
                </Field>
                <Field>
                  <FieldLabel for="account-holder">{{ t('payment.accountHolder') }}</FieldLabel>
                  <Input
                    id="account-holder"
                    v-model="transferForm.transfer_account_holder"
                    :placeholder="t('config.accountHolderPh')"
                  />
                </Field>
              </FieldGroup>

              <Button type="submit" class="mt-6" :disabled="isSavingTransfer">
                {{ isSavingTransfer ? t('common.saving') : t('config.saveTransfer') }}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  </DashboardLayout>
</template>
