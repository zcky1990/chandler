<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ArrowLeft, UtensilsCrossed } from '@lucide/vue'
import AddonSelectDialog from '@/components/transactions/AddonSelectDialog.vue'
import OrderCartPanel from '@/components/order/OrderCartPanel.vue'
import OrderCustomerForm from '@/components/order/OrderCustomerForm.vue'
import OrderMenuPanel from '@/components/order/OrderMenuPanel.vue'
import OrderSuccessDialog from '@/components/order/OrderSuccessDialog.vue'
import { Button } from '@/components/ui/button'
import { usePreOrderCart } from '@/composables/usePreOrderCart'
import ApplicationLayout from '@/layouts/ApplicationLayout.vue'

const {
  cart,
  customerName,
  tableNumber,
  notes,
  isLoading,
  isSubmitting,
  availableProducts,
  addonDialogOpen,
  pendingProduct,
  pendingProductAddons,
  totalAmount,
  successDialogOpen,
  submittedOrder,
  getCartLineSubtotal,
  openAddonDialog,
  handleAddonConfirm,
  updateQuantity,
  removeFromCart,
  submitOrder,
} = usePreOrderCart()
</script>

<template>
  <ApplicationLayout>
    <div class="flex w-full max-w-4xl flex-col gap-6 px-4 py-8">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h1 class="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <UtensilsCrossed class="size-6" />
            Pesan Sekarang
          </h1>
          <p class="text-sm text-muted-foreground">
            Pilih menu, buat pesanan, lalu menuju kasir untuk pembayaran.
          </p>
        </div>
        <Button variant="outline" as-child>
          <RouterLink to="/">
            <ArrowLeft class="size-4" />
            Beranda
          </RouterLink>
        </Button>
      </div>

      <div class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div class="space-y-4">
          <OrderMenuPanel
            :products="availableProducts"
            :is-loading="isLoading"
            @add="openAddonDialog"
          />
          <OrderCustomerForm
            v-model:customer-name="customerName"
            v-model:table-number="tableNumber"
            v-model:notes="notes"
          />
        </div>

        <OrderCartPanel
          :cart="cart"
          :total-amount="totalAmount"
          :is-submitting="isSubmitting"
          :get-cart-line-subtotal="getCartLineSubtotal"
          @update-quantity="updateQuantity"
          @remove="removeFromCart"
          @submit="submitOrder"
        />
      </div>

      <AddonSelectDialog
        v-model:open="addonDialogOpen"
        :product="pendingProduct"
        :addons="pendingProductAddons"
        @confirm="handleAddonConfirm"
      />

      <OrderSuccessDialog
        v-model:open="successDialogOpen"
        :order="submittedOrder"
      />
    </div>
  </ApplicationLayout>
</template>
