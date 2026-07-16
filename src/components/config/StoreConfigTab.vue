<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Printer } from '@lucide/vue'
import { useI18n } from '@/composables/useI18n'

defineProps<{
  appTitle: string
  shopName: string
  shopAddress: string
  isSaving: boolean
}>()

defineEmits<{
  'update:appTitle': [value: string]
  'update:shopName': [value: string]
  'update:shopAddress': [value: string]
  save: []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-2">
    <Card class="lg:col-span-2 border-t-2 border-t-slate-500">
      <CardHeader>
        <div class="flex items-center gap-3">
          <div class="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
            <Printer class="size-5" />
          </div>
          <div>
            <CardTitle>{{ t('config.receiptInfo') }}</CardTitle>
            <CardDescription>{{ t('config.receiptDesc') }}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form class="max-w-xl" @submit.prevent="$emit('save')">
          <FieldGroup>
            <Field>
              <FieldLabel for="app-title">{{ t('config.appTitle') }}</FieldLabel>
              <Input
                id="app-title"
                :model-value="appTitle"
                @update:model-value="$emit('update:appTitle', $event)"
                :placeholder="t('config.appTitlePh')"
              />
              <p class="mt-1 text-xs text-muted-foreground">{{ t('config.appTitleDesc') }}</p>
            </Field>
            <Field>
              <FieldLabel for="shop-name">{{ t('config.shopName') }}</FieldLabel>
              <Input
                id="shop-name"
                :model-value="shopName"
                @update:model-value="$emit('update:shopName', $event)"
                :placeholder="t('config.shopNamePh')"
              />
            </Field>
            <Field>
              <FieldLabel for="shop-address">{{ t('config.shopAddress') }}</FieldLabel>
              <Input
                id="shop-address"
                :model-value="shopAddress"
                @update:model-value="$emit('update:shopAddress', $event)"
                :placeholder="t('config.shopAddressPh')"
              />
            </Field>
          </FieldGroup>
          <Button type="submit" class="mt-6" :disabled="isSaving">
            {{ isSaving ? t('common.saving') : t('config.saveReceipt') }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
