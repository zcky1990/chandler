<script setup lang="ts">
import Search from '@/components/search/Search.vue'
import { ref } from 'vue'
import { getProductByName } from '@/lib/product'
import { getCustomerByName } from '@/lib/customer'
import { useAlertStore } from '@/stores/useAlertStore'
import DotField from '@/components/ui/dot-field/DotField.vue'
import TextType from '@/components/ui/text-type/TextType.vue'

const searchQuery = ref<string>('')
const selectedOption = ref<{ label: string, value: string } | null>(null)
const searchInOptions = ref<{ label: string, value: string }[]>([
  { label: 'Pembeli', value: 'customer' },
  { label: 'Produk', value: 'product' },
])

const alertStore = useAlertStore()
const searchResults = ref<any[]>([])

const handleSearchQueryUpdate = (value: string) => {
  searchQuery.value = value
}

const handleSelectedOptionUpdate = (option: { label: string, value: string } | null) => {
  selectedOption.value = option
}

const handleSearch = async () => {
  if (selectedOption.value?.value === 'product' && searchQuery.value.length > 0) {
    const products = await getProductByName(searchQuery.value)
    searchResults.value = products
  }
  if (selectedOption.value?.value === 'customer' && searchQuery.value.length > 0) {
    const customers = await getCustomerByName(searchQuery.value)
    searchResults.value = customers
  }
  alertStore.showAlert('Search Results', 'Search results for ' + searchQuery.value+ ' not found', 'error')
}

</script>

<template>
  <div class="flex flex-col gap-4 items-center justify-center h-screen">
    <div class="absolute top-0 left-0 w-full h-full">
    <DotField
      :dot-radius="1.5"
      :dot-spacing="14"
      :bulge-strength="67"
      :glow-radius="160"
      :sparkle="false"
      :wave-amplitude="0"
      :cursor-radius="500"
      :cursor-force="0.1"
      bulge-only
      gradient-from="#7cff67"
      gradient-to="#A0FFBC"
      glow-color="#120F17"
    />
    </div>
    <TextType 
    :text="['Selamat Datang', 'di', 'Warung Zavi']"
    :typing-speed="75"
    :pause-duration="1500"
    :show-cursor="true"
    cursor-character="|"
  />
    <Search :searchInOptions="searchInOptions" 
      :searchQuery="searchQuery" 
      :selectedOption="selectedOption" 
      @update:searchQuery="handleSearchQueryUpdate" 
      @update:selectedOption="handleSelectedOptionUpdate" />
    <Button @click="handleSearch" variant="outline" class="rounded-full py-2 px-4 bg-primary text-primary-foreground">Search</Button>
  </div>
</template>
