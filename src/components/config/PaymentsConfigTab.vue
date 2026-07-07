<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ImageIcon, Landmark, QrCode, Trash2, Upload, Wallet } from '@lucide/vue'
import { useI18n } from '@/composables/useI18n'
import type { PaymentFlowMode } from '@/types/database'

const { t } = useI18n()

const props = defineProps<{
  paymentFlowMode: PaymentFlowMode
  requireTableForEatFirst: boolean
  isSavingPaymentFlow: boolean
  qrisPreview: string | null
  isUploadingQris: boolean
  isRemovingQris: boolean
  transferBankName: string
  transferAccountNumber: string
  transferAccountHolder: string
  isSavingTransfer: boolean
}>()

const emit = defineEmits<{
  'update:paymentFlowMode': [value: PaymentFlowMode]
  'update:requireTableForEatFirst': [value: boolean]
  'savePaymentFlow': []
  'uploadQris': [event: Event]
  'removeQris': []
  'update:transferBankName': [value: string]
  'update:transferAccountNumber': [value: string]
  'update:transferAccountHolder': [value: string]
  'saveTransfer': []
}>()
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-2">
    <Card class="lg:col-span-2 border-t-2 border-t-emerald-500">
      <CardHeader>
        <div class="flex items-center gap-3">
          <div class="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            <Wallet class="size-5" />
          </div>
          <div>
            <CardTitle>{{ t('config.paymentFlowTitle') }}</CardTitle>
            <CardDescription>{{ t('config.paymentFlowDesc') }}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form class="max-w-xl space-y-4" @submit.prevent="$emit('savePaymentFlow')">
          <Field>
            <FieldLabel>{{ t('config.paymentFlowMode') }}</FieldLabel>
            <Select :model-value="paymentFlowMode" @update:model-value="$emit('update:paymentFlowMode', $event as PaymentFlowMode)">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pay_first_only">{{ t('config.paymentFlowPayFirst') }}</SelectItem>
                <SelectItem value="eat_first_only">{{ t('config.paymentFlowEatFirst') }}</SelectItem>
                <SelectItem value="both">{{ t('config.paymentFlowBoth') }}</SelectItem>
              </SelectContent>
            </Select>
            <p class="mt-1 text-xs text-muted-foreground">
              {{ paymentFlowMode === 'pay_first_only' ? t('config.paymentFlowPayFirstHint') : paymentFlowMode === 'eat_first_only' ? t('config.paymentFlowEatFirstHint') : t('config.paymentFlowBothHint') }}
            </p>
          </Field>

          <div class="flex items-center justify-between rounded-lg border px-3 py-3">
            <div>
              <p class="text-sm font-medium">{{ t('config.requireTableForEatFirst') }}</p>
              <p class="text-xs text-muted-foreground">{{ t('config.requireTableForEatFirstDesc') }}</p>
            </div>
            <Switch :model-value="requireTableForEatFirst" @update:model-value="$emit('update:requireTableForEatFirst', $event)" />
          </div>

          <Button type="submit" :disabled="isSavingPaymentFlow">
            {{ isSavingPaymentFlow ? t('common.saving') : t('config.savePaymentFlow') }}
          </Button>
        </form>
      </CardContent>
    </Card>

    <Card class="border-t-2 border-t-teal-500">
      <CardHeader>
        <div class="flex items-center gap-3">
          <div class="flex size-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
            <QrCode class="size-5" />
          </div>
          <div>
            <CardTitle>{{ t('config.qrisTitle') }}</CardTitle>
            <CardDescription>{{ t('config.qrisDesc') }}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed bg-muted/30 p-4">
          <img v-if="qrisPreview" :src="qrisPreview" alt="QRIS" class="max-h-64 max-w-full rounded-lg object-contain">
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
              <input type="file" accept="image/png,image/jpeg,image/webp" class="hidden" :disabled="isUploadingQris" @change="$emit('uploadQris', $event)">
            </label>
          </Button>
          <Button v-if="qrisPreview" variant="outline" :disabled="isRemovingQris" @click="$emit('removeQris')">
            <Trash2 class="size-4" /> {{ t('common.delete') }}
          </Button>
        </div>
        <p class="text-xs text-muted-foreground">{{ t('config.imageFormat') }}</p>
      </CardContent>
    </Card>

    <Card class="border-t-2 border-t-green-500">
      <CardHeader>
        <div class="flex items-center gap-3">
          <div class="flex size-10 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
            <Landmark class="size-5" />
          </div>
          <div>
            <CardTitle>{{ t('config.transferTitle') }}</CardTitle>
            <CardDescription>{{ t('config.transferDesc') }}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="$emit('saveTransfer')">
          <FieldGroup>
            <Field>
              <FieldLabel for="bank-name">{{ t('config.bankName') }}</FieldLabel>
              <Input id="bank-name" :model-value="transferBankName" @update:model-value="$emit('update:transferBankName', $event)" :placeholder="t('config.bankNamePh')" />
            </Field>
            <Field>
              <FieldLabel for="account-number">{{ t('payment.accountNumber') }}</FieldLabel>
              <Input id="account-number" :model-value="transferAccountNumber" @update:model-value="$emit('update:transferAccountNumber', $event)" :placeholder="t('config.accountNumberPh')" />
            </Field>
            <Field>
              <FieldLabel for="account-holder">{{ t('payment.accountHolder') }}</FieldLabel>
              <Input id="account-holder" :model-value="transferAccountHolder" @update:model-value="$emit('update:transferAccountHolder', $event)" :placeholder="t('config.accountHolderPh')" />
            </Field>
          </FieldGroup>
          <Button type="submit" class="mt-6" :disabled="isSavingTransfer">
            {{ isSavingTransfer ? t('common.saving') : t('config.saveTransfer') }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
