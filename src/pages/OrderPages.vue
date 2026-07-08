<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ArrowLeft } from '@lucide/vue'
import AddonSelectDialog from '@/components/transactions/AddonSelectDialog.vue'
import OrderCartPanel from '@/components/order/OrderCartPanel.vue'
import OrderMenuPanel from '@/components/order/OrderMenuPanel.vue'
import { Button } from '@/components/ui/button'
import { usePreOrderCart } from '@/composables/usePreOrderCart'
import { useI18n } from '@/composables/useI18n'
import ApplicationLayout from '@/layouts/ApplicationLayout.vue'

const { t } = useI18n()

const {
  cart,
  customerName,
  tableNumber,
  notes,
  searchQuery,
  categoryFilter,
  isLoading,
  isSubmitting,
  filteredMenuProducts,
  menuCategories,
  addonDialogOpen,
  pendingProduct,
  pendingProductAddons,
  pendingBundleIndex,
  pendingBundleTotal,
  totalAmount,
  allowPayNow,
  allowPayLater,
  paymentChoice,
  getCartLineSubtotal,
  getMenuQuantity,
  incrementMenuQuantity,
  decrementMenuQuantity,
  addProductFromMenu,
  handleAddonConfirm,
  updateQuantity,
  removeFromCart,
  clearCart,
  submitOrder,
} = usePreOrderCart()
</script>

<template>
  <ApplicationLayout>
    <div class="w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
      <div class="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">{{ t('order.title') }}</h1>
          <p class="text-sm text-muted-foreground">
            {{ t('order.subtitle') }}
          </p>
        </div>
        <Button variant="outline" size="sm" as-child>
          <RouterLink to="/">
            <ArrowLeft class="size-4" />
            {{ t('order.home') }}
          </RouterLink>
        </Button>
      </div>

      <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <OrderMenuPanel
          :products="filteredMenuProducts"
          :categories="menuCategories"
          :category-filter="categoryFilter"
          :search-query="searchQuery"
          :is-loading="isLoading"
          :get-menu-quantity="getMenuQuantity"
          @update:search-query="searchQuery = $event"
          @update:category-filter="categoryFilter = $event"
          @add="addProductFromMenu"
          @increment-quantity="incrementMenuQuantity"
          @decrement-quantity="decrementMenuQuantity"
        />

        <OrderCartPanel
          v-model:customer-name="customerName"
          v-model:table-number="tableNumber"
          v-model:notes="notes"
          v-model:payment-choice="paymentChoice"
          :cart="cart"
          :total-amount="totalAmount"
          :is-submitting="isSubmitting"
          :allow-pay-now="allowPayNow"
          :allow-pay-later="allowPayLater"
          :get-cart-line-subtotal="getCartLineSubtotal"
          @update-quantity="updateQuantity"
          @remove="removeFromCart"
          @clear="clearCart"
          @submit="submitOrder"
        />
      </div>

      <AddonSelectDialog
        v-model:open="addonDialogOpen"
        :product="pendingProduct"
        :addons="pendingProductAddons"
        :bundle-index="pendingBundleIndex"
        :bundle-total="pendingBundleTotal"
        @confirm="handleAddonConfirm"
      />

    </div>
  </ApplicationLayout>
</template>
