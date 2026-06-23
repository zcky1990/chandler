<script setup lang="ts">
import CustomerList from '@/components/CustomerList.vue'
import ProductList from '@/components/ProductList.vue'
import SearchInput from '@/components/search/Search.vue'
import CustomerUnpaidItemsDialog from '@/components/transactions/CustomerUnpaidItemsDialog.vue'
import PaymentInstructionsDialog from '@/components/transactions/PaymentInstructionsDialog.vue'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import TextType from '@/components/ui/text-type/TextType.vue'
import { useHomeSearch } from '@/composables/useHomeSearch'
import { Banknote } from '@lucide/vue'

const {
  searchQuery,
  selectedOption,
  searchInOptions,
  debtDialogOpen,
  debtDialogLoading,
  paymentInstructionsOpen,
  showPaymentCta,
  selectedCustomerSummary,
  resultType,
  productResults,
  customerResults,
  hasResults,
  resultsTitle,
  textColor,
  handleSearch,
  handleSelectCustomer,
} = useHomeSearch()
</script>

<template>
  <div class="flex min-h-svh w-full flex-col items-center px-4 py-10">
    <div class="flex w-full max-w-2xl flex-col items-center gap-8">
      <TextType
        :text="['Selamat Datang', 'Warung Zavi']"
        :typing-speed="75"
        :pause-duration="1500"
        :show-cursor="true"
        :text-colors="[textColor]"
        className="max-w-4xl text-center text-foreground sm:text-3xl md:text-4xl lg:text-4xl"
        cursor-character="|"
      />

      <div class="z-2 flex w-full flex-col gap-3">
        <SearchInput
          :search-in-options="searchInOptions"
          :search-query="searchQuery"
          :selected-option="selectedOption"
          @update:search-query="searchQuery = $event"
          @update:selected-option="selectedOption = $event"
          @submit="handleSearch"
        />
        <div class="flex flex-col gap-2 sm:flex-row">
          <Button class="flex-1" @click="handleSearch">
            Cari
          </Button>
          <Button
            v-if="showPaymentCta"
            variant="outline"
            class="flex-1"
            @click="paymentInstructionsOpen = true"
          >
            <Banknote class="size-4" />
            Cara Membayar
          </Button>
        </div>
      </div>

      <section
        v-if="hasResults"
        class="z-2 w-full space-y-3"
      >
        <div class="space-y-1 text-center">
          <p class="text-sm font-medium">
            {{ resultsTitle }}
          </p>
          <p class="text-sm text-muted-foreground">
            untuk "{{ searchQuery }}"
          </p>
        </div>
        <Separator />

        <ProductList
          v-if="resultType === 'product'"
          :products="productResults"
        />
        <CustomerList
          v-if="resultType === 'customers'"
          :customers="customerResults"
          @select="handleSelectCustomer"
        />
      </section>
    </div>

    <CustomerUnpaidItemsDialog
      v-model:open="debtDialogOpen"
      :customer="selectedCustomerSummary"
      :loading="debtDialogLoading"
    />

    <PaymentInstructionsDialog v-model:open="paymentInstructionsOpen" />
  </div>
</template>
