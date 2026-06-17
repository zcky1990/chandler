<script setup lang="ts">
import WelcomeItem from './WelcomeItem.vue'
import DocumentationIcon from './icons/IconDocumentation.vue'
import ToolingIcon from './icons/IconTooling.vue'
import EcosystemIcon from './icons/IconEcosystem.vue'
import CommunityIcon from './icons/IconCommunity.vue'
import SupportIcon from './icons/IconSupport.vue'
import Search from '@/components/search/Search.vue'
import { ref } from 'vue'
import { getProductByName } from '@/lib/product'
import { getCustomerByName } from '@/lib/customer'
import { useAlertStore } from '@/stores/useAlertStore'

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
    <h1>Welcome to the app</h1>
    <Search :searchInOptions="searchInOptions" 
      :searchQuery="searchQuery" 
      :selectedOption="selectedOption" 
      @update:searchQuery="handleSearchQueryUpdate" 
      @update:selectedOption="handleSelectedOptionUpdate" />
    <Button @click="handleSearch" variant="outline" class="rounded-full py-2 px-4 bg-primary text-white">Search</Button>
  </div>
</template>
