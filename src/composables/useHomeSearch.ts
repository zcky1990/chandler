import { computed, onMounted, ref } from 'vue'
import { getCustomerByName } from '@/lib/customer'
import { getShopConfig, hasPaymentConfig } from '@/lib/config'
import { getPaymentProofWhatsapp } from '@/lib/payment'
import { getProductByName } from '@/lib/product'
import { getCustomerTransactionSummary, getCustomersWithDebt } from '@/lib/transaction'
import { useAlertStore } from '@/stores/useAlertStore'
import type { CustomerTransactionSummary, CustomerWithDebt, Product } from '@/types/database'

export function useHomeSearch() {
  const alertStore = useAlertStore()

  const searchQuery = ref('')
  const selectedOption = ref<{ label: string, value: string } | null>(null)
  const searchInOptions = [
    { label: 'Pembeli', value: 'customers' },
    { label: 'Produk', value: 'product' },
  ]

  const debtDialogOpen = ref(false)
  const debtDialogLoading = ref(false)
  const paymentInstructionsOpen = ref(false)
  const showPaymentCta = ref(false)
  const selectedCustomerSummary = ref<CustomerTransactionSummary | null>(null)
  const searchResults = ref<(Product | CustomerWithDebt)[]>([])
  const resultType = ref<'product' | 'customers' | null>(null)

  const productResults = computed(() =>
    resultType.value === 'product' ? (searchResults.value as Product[]) : [],
  )

  const customerResults = computed(() =>
    resultType.value === 'customers' ? (searchResults.value as CustomerWithDebt[]) : [],
  )

  const hasResults = computed(() =>
    resultType.value === 'product'
      ? productResults.value.length > 0
      : resultType.value === 'customers'
        ? customerResults.value.length > 0
        : false,
  )

  const resultsTitle = computed(() => {
    if (resultType.value === 'product') {
      return `${productResults.value.length} produk ditemukan`
    }
    if (resultType.value === 'customers') {
      return `${customerResults.value.length} pembeli ditemukan`
    }
    return ''
  })

  const textColor = computed(() => {
    const rootStyles = getComputedStyle(document.documentElement)
    return rootStyles.getPropertyValue('--color-text').trim()
  })

  async function enrichCustomersWithDebt(customers: CustomerWithDebt[]) {
    const { debtByCustomerId, error } = await getCustomersWithDebt(customers.map((customer) => customer.id))

    if (error) {
      alertStore.showAlert('Error', error.message, 'error')
      return customers.map((customer) => ({
        ...customer,
        outstandingAmount: 0,
        unpaidCount: 0,
      }))
    }

    return customers.map((customer) => {
      const debt = debtByCustomerId[customer.id]
      return {
        ...customer,
        outstandingAmount: debt?.outstandingAmount ?? 0,
        unpaidCount: debt?.unpaidCount ?? 0,
      }
    })
  }

  async function handleSearch() {
    const query = searchQuery.value.trim()

    if (!query) {
      alertStore.showAlert('Error', 'Masukkan kata kunci pencarian', 'error')
      return
    }

    if (!selectedOption.value) {
      alertStore.showAlert('Error', 'Pilih kategori pencarian', 'error')
      return
    }

    searchResults.value = []
    resultType.value = null

    if (selectedOption.value.value === 'product') {
      const { products: data, error } = await getProductByName(query)
      if (error) {
        alertStore.showAlert('Error', error.message, 'error')
        return
      }

      searchResults.value = data || []
      resultType.value = 'product'

      if (!searchResults.value.length) {
        alertStore.showAlert('Tidak ditemukan', `Produk "${query}" tidak ditemukan`, 'error')
      }
      return
    }

    if (selectedOption.value.value === 'customers') {
      const { customers: data, error } = await getCustomerByName(query)
      if (error) {
        alertStore.showAlert('Error', error.message, 'error')
        return
      }

      const customers = await enrichCustomersWithDebt((data ?? []) as CustomerWithDebt[])
      searchResults.value = customers
      resultType.value = 'customers'

      if (!searchResults.value.length) {
        alertStore.showAlert('Tidak ditemukan', `Pembeli "${query}" tidak ditemukan`, 'error')
      }
    }
  }

  async function handleSelectCustomer(customer: CustomerWithDebt) {
    debtDialogOpen.value = true
    debtDialogLoading.value = true
    selectedCustomerSummary.value = null

    const { summary, error } = await getCustomerTransactionSummary(customer.id, customer.name)
    debtDialogLoading.value = false

    if (error) {
      debtDialogOpen.value = false
      alertStore.showAlert('Error', error.message, 'error')
      return
    }

    if (!summary?.unpaidCount) {
      debtDialogOpen.value = false
      alertStore.showAlert('Info', 'Pembeli ini tidak memiliki tunggakan', 'error')
      await handleSearch()
      return
    }

    selectedCustomerSummary.value = summary
  }

  async function loadPaymentAvailability() {
    const { config } = await getShopConfig()
    showPaymentCta.value = hasPaymentConfig(config) || !!getPaymentProofWhatsapp()
  }

  onMounted(loadPaymentAvailability)

  return {
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
  }
}
