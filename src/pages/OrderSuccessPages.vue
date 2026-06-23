<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCircle2, Receipt, UtensilsCrossed } from '@lucide/vue'
import ApplicationLayout from '@/layouts/ApplicationLayout.vue'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useI18n } from '@/composables/useI18n'
import { formatPrice } from '@/lib/format'
import {
  clearOrderSuccessPayload,
  readOrderSuccessPayload,
  type OrderSuccessPayload,
} from '@/lib/order-success'
import { formatPreOrderNumber } from '@/lib/pre-order'

const { t } = useI18n()
const router = useRouter()

const order = ref<OrderSuccessPayload | null>(null)

onMounted(() => {
  const payload = readOrderSuccessPayload()
  if (!payload) {
    router.replace('/order')
    return
  }

  order.value = payload
})

function handleNewOrder() {
  clearOrderSuccessPayload()
  router.push('/order')
}

function handleHome() {
  clearOrderSuccessPayload()
  router.push('/')
}
</script>

<template>
  <ApplicationLayout>
    <div class="flex min-h-[calc(100svh-4rem)] w-full items-center justify-center px-4 py-10">
      <Card v-if="order" class="w-full max-w-lg text-center">
        <CardHeader class="items-center space-y-4 pb-2">
          <div class="flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 class="size-9" />
          </div>
          <div class="space-y-1">
            <CardTitle class="text-2xl">{{ t('order.successTitle') }}</CardTitle>
            <CardDescription>{{ t('order.successPageDesc') }}</CardDescription>
          </div>
        </CardHeader>

        <CardContent class="space-y-6">
          <div class="rounded-xl border bg-muted/40 px-6 py-8">
            <p class="text-sm text-muted-foreground">{{ t('order.successDesc') }}</p>
            <p class="mt-2 text-4xl font-bold tracking-tight">
              {{ formatPreOrderNumber(order.orderNumber) }}
            </p>
            <p class="mt-4 text-sm text-muted-foreground">
              {{ t('order.successTotal') }}:
              <span class="font-semibold text-foreground">{{ formatPrice(order.totalAmount) }}</span>
            </p>
          </div>

          <div class="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-left text-sm">
            <p class="flex items-center gap-2 font-medium text-amber-800 dark:text-amber-300">
              <Receipt class="size-4 shrink-0" />
              {{ t('order.successCashier') }}
            </p>
            <p class="text-muted-foreground">
              {{ t('order.successCashierDetail') }}
            </p>
          </div>

          <div class="flex flex-col gap-2 sm:flex-row">
            <Button class="flex-1" @click="handleNewOrder">
              <UtensilsCrossed class="size-4" />
              {{ t('order.successNewOrder') }}
            </Button>
            <Button class="flex-1" variant="outline" @click="handleHome">
              {{ t('order.successHome') }}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </ApplicationLayout>
</template>
