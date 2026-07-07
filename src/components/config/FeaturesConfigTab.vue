<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { CalendarDays, Gift, LayoutGrid } from '@lucide/vue'
import { useI18n } from '@/composables/useI18n'
import MenuCategoryConfigList from './MenuCategoryConfigList.vue'
import type { ProductCategory } from '@/types/database'

const { t } = useI18n()

const props = defineProps<{
  bookingEnabled: boolean
  bookingDuration: number
  bookingAdvanceDays: number
  bookingOpenTime: string
  bookingCloseTime: string
  bookingAutoConfirm: boolean
  isSavingBooking: boolean
  loyaltyEnabled: boolean
  loyaltyPointsPerTransaction: number
  loyaltyPointRedeemValue: number
  loyaltyMinimumTransactionAmount: number
  isSavingLoyalty: boolean
  menuCategoryCustom: boolean
  menuCategoryIds: string[]
  categories: ProductCategory[]
  isSavingMenuCategories: boolean
}>()

const emit = defineEmits<{
  'update:bookingEnabled': [value: boolean]
  'update:bookingDuration': [value: number]
  'update:bookingAdvanceDays': [value: number]
  'update:bookingOpenTime': [value: string]
  'update:bookingCloseTime': [value: string]
  'update:bookingAutoConfirm': [value: boolean]
  'saveBooking': []
  'update:loyaltyEnabled': [value: boolean]
  'update:loyaltyPointsPerTransaction': [value: number]
  'update:loyaltyPointRedeemValue': [value: number]
  'update:loyaltyMinimumTransactionAmount': [value: number]
  'saveLoyalty': []
  'update:menuCategoryCustom': [value: boolean | 'indeterminate']
  'update:menuCategoryIds': [value: string[]]
  'saveMenuCategories': []
}>()
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-2">
    <Card class="lg:col-span-2 border-t-2 border-t-amber-500">
      <CardHeader>
        <div class="flex items-center gap-3">
          <div class="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            <CalendarDays class="size-5" />
          </div>
          <div>
            <CardTitle>{{ t('config.bookingTitle') }}</CardTitle>
            <CardDescription>{{ t('config.bookingDesc') }}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form class="max-w-xl space-y-4" @submit.prevent="$emit('saveBooking')">
          <div class="flex items-center justify-between rounded-lg border px-3 py-3">
            <div>
              <p class="text-sm font-medium">{{ t('config.bookingEnable') }}</p>
              <p class="text-xs text-muted-foreground">{{ t('config.bookingEnableDesc') }}</p>
            </div>
            <Switch :model-value="bookingEnabled" @update:model-value="$emit('update:bookingEnabled', $event)" />
          </div>
          <FieldGroup>
            <Field>
              <FieldLabel for="booking-duration">{{ t('config.bookingDuration') }}</FieldLabel>
              <Input id="booking-duration" :model-value="bookingDuration.toString()" @update:model-value="$emit('update:bookingDuration', Number($event))" type="number" min="30" step="15" />
            </Field>
            <Field>
              <FieldLabel for="booking-advance">{{ t('config.bookingAdvanceDays') }}</FieldLabel>
              <Input id="booking-advance" :model-value="bookingAdvanceDays.toString()" @update:model-value="$emit('update:bookingAdvanceDays', Number($event))" type="number" min="1" max="90" />
            </Field>
            <div class="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel for="booking-open">{{ t('config.bookingOpenTime') }}</FieldLabel>
                <Input id="booking-open" :model-value="bookingOpenTime" @update:model-value="$emit('update:bookingOpenTime', $event)" type="time" />
              </Field>
              <Field>
                <FieldLabel for="booking-close">{{ t('config.bookingCloseTime') }}</FieldLabel>
                <Input id="booking-close" :model-value="bookingCloseTime" @update:model-value="$emit('update:bookingCloseTime', $event)" type="time" />
              </Field>
            </div>
          </FieldGroup>
          <div class="flex items-center justify-between rounded-lg border px-3 py-3">
            <div>
              <p class="text-sm font-medium">{{ t('config.bookingAutoConfirm') }}</p>
              <p class="text-xs text-muted-foreground">{{ t('config.bookingAutoConfirmDesc') }}</p>
            </div>
            <Switch :model-value="bookingAutoConfirm" @update:model-value="$emit('update:bookingAutoConfirm', $event)" />
          </div>
          <Button type="submit" :disabled="isSavingBooking">
            {{ isSavingBooking ? t('common.saving') : t('config.saveBooking') }}
          </Button>
        </form>
      </CardContent>
    </Card>

    <Card class="border-t-2 border-t-orange-500">
      <CardHeader>
        <div class="flex items-center gap-3">
          <div class="flex size-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
            <Gift class="size-5" />
          </div>
          <div>
            <CardTitle>{{ t('config.loyaltyTitle') }}</CardTitle>
            <CardDescription>{{ t('config.loyaltyDesc') }}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form class="max-w-xl space-y-4" @submit.prevent="$emit('saveLoyalty')">
          <div class="flex items-center justify-between rounded-lg border px-3 py-3">
            <div>
              <p class="text-sm font-medium">{{ t('config.loyaltyEnable') }}</p>
              <p class="text-xs text-muted-foreground">{{ t('config.loyaltyEnableDesc') }}</p>
            </div>
            <Switch :model-value="loyaltyEnabled" @update:model-value="$emit('update:loyaltyEnabled', $event)" />
          </div>
          <Field>
            <FieldLabel for="loyalty-points-per-tx">{{ t('config.loyaltyPointsPerTransaction') }}</FieldLabel>
            <Input id="loyalty-points-per-tx" :model-value="loyaltyPointsPerTransaction.toString()" @update:model-value="$emit('update:loyaltyPointsPerTransaction', Number($event))" type="number" min="0" step="1" :disabled="!loyaltyEnabled" />
          </Field>
          <Field>
            <FieldLabel for="loyalty-point-value">{{ t('config.loyaltyPointRedeemValue') }}</FieldLabel>
            <Input id="loyalty-point-value" :model-value="loyaltyPointRedeemValue.toString()" @update:model-value="$emit('update:loyaltyPointRedeemValue', Number($event))" type="number" min="0" step="100" :disabled="!loyaltyEnabled" />
          </Field>
          <Field>
            <FieldLabel for="loyalty-minimum-amount">{{ t('config.loyaltyMinimumTransactionAmount') }}</FieldLabel>
            <Input id="loyalty-minimum-amount" :model-value="loyaltyMinimumTransactionAmount.toString()" @update:model-value="$emit('update:loyaltyMinimumTransactionAmount', Number($event))" type="number" min="0" step="1000" :disabled="!loyaltyEnabled" />
            <p class="mt-1 text-xs text-muted-foreground">{{ t('config.loyaltyMinimumTransactionAmountDesc') }}</p>
          </Field>
          <Button type="submit" :disabled="isSavingLoyalty">
            {{ isSavingLoyalty ? t('common.saving') : t('config.saveLoyalty') }}
          </Button>
        </form>
      </CardContent>
    </Card>

    <Card class="lg:col-span-2 border-t-2 border-t-rose-500">
      <CardHeader>
        <div class="flex items-center gap-3">
          <div class="flex size-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
            <LayoutGrid class="size-5" />
          </div>
          <div>
            <CardTitle>{{ t('config.menuCategoryTitle') }}</CardTitle>
            <CardDescription>{{ t('config.menuCategoryDesc') }}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form class="max-w-2xl space-y-4" @submit.prevent="$emit('saveMenuCategories')">
          <div class="flex items-center justify-between rounded-lg border px-3 py-3">
            <div>
              <p class="text-sm font-medium">{{ t('config.menuCategoryCustom') }}</p>
              <p class="text-xs text-muted-foreground">{{ t('config.menuCategoryCustomDesc') }}</p>
            </div>
            <Switch :model-value="menuCategoryCustom" @update:model-value="$emit('update:menuCategoryCustom', $event)" />
          </div>
          <MenuCategoryConfigList v-if="menuCategoryCustom" :selected-ids="menuCategoryIds" @update:selected-ids="$emit('update:menuCategoryIds', $event)" :categories="categories" />
          <Button type="submit" :disabled="isSavingMenuCategories">
            {{ isSavingMenuCategories ? t('common.saving') : t('config.saveMenuCategories') }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
