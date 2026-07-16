<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { ImageIcon, ReceiptText, Trash2, Upload } from '@lucide/vue'
import { useI18n } from '@/composables/useI18n'

const props = defineProps<{
  primaryColor: string
  showLogo: boolean
  logoUrl: string | null
  taxId: string
  showTaxId: boolean
  termsText: string
  showTerms: boolean
  footerText: string
  showQris: boolean
  showItemPrices: boolean
  showQty: boolean
  logoPreview: string | null
  isUploadingLogo: boolean
  isRemovingLogo: boolean
  isSaving: boolean
  previewHtml: string
}>()

const emit = defineEmits<{
  'update:primaryColor': [value: string]
  'update:showLogo': [value: boolean]
  'update:taxId': [value: string]
  'update:showTaxId': [value: boolean]
  'update:termsText': [value: string]
  'update:showTerms': [value: boolean]
  'update:footerText': [value: string]
  'update:showQris': [value: boolean]
  'update:showItemPrices': [value: boolean]
  'update:showQty': [value: boolean]
  'uploadLogo': [event: Event]
  'removeLogo': []
  'save': []
}>()

const { t } = useI18n()
</script>

<template>
  <Card class="border-t-2 border-t-violet-500">
    <CardHeader>
      <div class="flex items-center gap-3">
        <div class="flex size-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
          <ReceiptText class="size-5" />
        </div>
        <div>
          <CardTitle>{{ t('config.invoiceTitle') }}</CardTitle>
          <CardDescription>{{ t('config.invoiceDesc') }}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <form class="flex flex-col gap-0 lg:flex-row lg:gap-8" @submit.prevent="$emit('save')">
        <div class="flex-1 space-y-4 lg:max-w-md">
          <Field>
            <FieldLabel for="invoice-primary-color">{{ t('config.invoicePrimaryColor') }}</FieldLabel>
            <div class="flex items-center gap-3">
              <Input id="invoice-primary-color" :model-value="primaryColor" @update:model-value="$emit('update:primaryColor', $event)" type="color" class="size-10 cursor-pointer border-0 p-1" />
              <span class="text-sm text-muted-foreground">{{ primaryColor }}</span>
            </div>
          </Field>
          <div class="flex items-center justify-between rounded-lg border px-3 py-3">
            <div><p class="text-sm font-medium">{{ t('config.invoiceShowLogo') }}</p></div>
            <Switch :model-value="showLogo" @update:model-value="$emit('update:showLogo', $event)" />
          </div>
          <template v-if="showLogo">
            <div class="flex min-h-[80px] items-center justify-center rounded-lg border border-dashed bg-muted/30 p-3">
              <img v-if="logoPreview" :src="logoPreview" alt="Invoice Logo" class="max-h-20 max-w-full rounded object-contain">
              <div v-else class="text-center text-sm text-muted-foreground">
                <ImageIcon class="mx-auto mb-1 size-6 opacity-50" />
                {{ t('config.invoiceNoLogo') }}
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <Button as-child :disabled="isUploadingLogo">
                <label class="cursor-pointer">
                  <Upload class="size-4" />
                  {{ isUploadingLogo ? t('config.uploading') : t('config.invoiceUploadLogo') }}
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" class="hidden" :disabled="isUploadingLogo" @change="$emit('uploadLogo', $event)">
                </label>
              </Button>
              <Button v-if="logoPreview" variant="outline" :disabled="isRemovingLogo" @click="$emit('removeLogo')">
                <Trash2 class="size-4" /> {{ t('common.delete') }}
              </Button>
            </div>
            <p class="text-xs text-muted-foreground">{{ t('config.imageFormat') }}</p>
          </template>
          <div class="flex items-center justify-between rounded-lg border px-3 py-3">
            <div><p class="text-sm font-medium">{{ t('config.invoiceShowTaxId') }}</p></div>
            <Switch :model-value="showTaxId" @update:model-value="$emit('update:showTaxId', $event)" />
          </div>
          <Field v-if="showTaxId">
            <FieldLabel for="invoice-tax-id">{{ t('config.invoiceTaxId') }}</FieldLabel>
            <Input id="invoice-tax-id" :model-value="taxId" @update:model-value="$emit('update:taxId', $event)" placeholder="00.000.000.0-000.000" />
          </Field>
          <div class="flex items-center justify-between rounded-lg border px-3 py-3">
            <div><p class="text-sm font-medium">{{ t('config.invoiceShowTerms') }}</p></div>
            <Switch :model-value="showTerms" @update:model-value="$emit('update:showTerms', $event)" />
          </div>
          <Field v-if="showTerms">
            <FieldLabel for="invoice-terms">{{ t('config.invoiceTermsText') }}</FieldLabel>
            <textarea id="invoice-terms" :value="termsText" @input="$emit('update:termsText', ($event.target as HTMLTextAreaElement).value)" class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" rows="2" placeholder="Payment due within 7 days" />
          </Field>
          <Field>
            <FieldLabel for="invoice-footer">{{ t('config.invoiceFooterText') }}</FieldLabel>
            <textarea id="invoice-footer" :value="footerText" @input="$emit('update:footerText', ($event.target as HTMLTextAreaElement).value)" class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" rows="2" placeholder="Thank you for your purchase!" />
          </Field>
          <div class="flex items-center justify-between rounded-lg border px-3 py-3">
            <div><p class="text-sm font-medium">{{ t('config.invoiceShowQris') }}</p></div>
            <Switch :model-value="showQris" @update:model-value="$emit('update:showQris', $event)" />
          </div>
          <div class="flex items-center justify-between rounded-lg border px-3 py-3">
            <div><p class="text-sm font-medium">{{ t('config.invoiceShowItemPrices') }}</p></div>
            <Switch :model-value="showItemPrices" @update:model-value="$emit('update:showItemPrices', $event)" />
          </div>
          <div class="flex items-center justify-between rounded-lg border px-3 py-3">
            <div>
              <p class="text-sm font-medium">{{ t('config.invoiceShowQty') }}</p>
              <p class="text-xs text-muted-foreground">{{ t('config.invoiceShowQtyDesc') }}</p>
            </div>
            <Switch :model-value="showQty" @update:model-value="$emit('update:showQty', $event)" />
          </div>
          <Button type="submit" :disabled="isSaving">
            {{ isSaving ? t('common.saving') : t('config.saveInvoice') }}
          </Button>
        </div>
        <div class="flex-1 lg:sticky lg:top-6 lg:self-start">
          <p class="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">Preview</p>
          <div class="overflow-hidden rounded-xl border bg-white shadow-sm">
            <div class="mx-auto max-w-[72mm] px-[4mm] py-[4mm]" v-html="previewHtml" />
          </div>
        </div>
      </form>
    </CardContent>
  </Card>
</template>
