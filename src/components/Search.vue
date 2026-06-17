<script setup lang="ts">
import WelcomeItem from './WelcomeItem.vue'
import DocumentationIcon from './icons/IconDocumentation.vue'
import ToolingIcon from './icons/IconTooling.vue'
import EcosystemIcon from './icons/IconEcosystem.vue'
import CommunityIcon from './icons/IconCommunity.vue'
import SupportIcon from './icons/IconSupport.vue'
import Search from '@/components/search/Search.vue'
import { ref } from 'vue'

const openReadmeInEditor = () => fetch('/__open-in-editor?file=README.md')
console.log(import.meta.env.VITE_TEST_ENV)

const searchQuery = ref<string>('')
const selectedOption = ref<{ label: string, value: string } | null>(null)
const searchInOptions = ref<{ label: string, value: string }[]>([
  { label: 'Pembeli', value: 'customer' },
  { label: 'Produk', value: 'product' },
])

const handleSearchQueryUpdate = (value: string) => {
  searchQuery.value = value
}

const handleSelectedOptionUpdate = (option: { label: string, value: string } | null) => {
  selectedOption.value = option
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
    <p>Search Query: {{ searchQuery }}</p>
    <p>Selected Option: {{ selectedOption?.label }}</p>
  </div>
</template>
