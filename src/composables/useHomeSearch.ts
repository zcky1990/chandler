import { computed, onMounted, ref } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { getCustomerByName } from '@/lib/customer'
import { getShopConfig, hasPaymentConfig } from '@/lib/config'
import { getPaymentProofWhatsapp } from '@/lib/payment'
import { getProductByName } from '@/lib/product'
import { getCustomerTransactionSummary, getCustomersWithDebt } from '@/lib/transaction'
import { useAlertStore } from '@/stores/useAlertStore'
import type { CustomerTransactionSummary, CustomerWithDebt, Product } from '@/types/database'

export function useHomeSearch() {
  const { t } = useI18n()
  const alertStore = useAlertStore()

  const searchQuery = ref('')
  const selectedOption = ref<{ label: string, value: string } | null>(null)
  const searchInOptions = computed(() => [
    { label: t('home.buyer'), value: 'customers' },
    { label: t('home.product'), value: 'product' },
  ])

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
      return t('home.productsFound', { count: productResults.value.length })
    }
    if (resultType.value === 'customers') {
      return t('home.buyersFound', { count: customerResults.value.length })
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
      alertStore.showAlert(t('alert.error'), error.message, 'error')
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
      alertStore.showAlert(t('alert.error'), t('home.searchKeywordRequired'), 'error')
      return
    }

    if (!selectedOption.value) {
      alertStore.showAlert(t('alert.error'), t('home.searchCategoryRequired'), 'error')
      return
    }

    searchResults.value = []
    resultType.value = null

    if (selectedOption.value.value === 'product') {
      const { products: data, error } = await getProductByName(query)
      if (error) {
        alertStore.showAlert(t('alert.error'), error.message, 'error')
        return
      }

      searchResults.value = data || []
      resultType.value = 'product'

      if (!searchResults.value.length) {
        alertStore.showAlert(t('home.notFound'), t('home.productNotFound', { query }), 'error')
      }
      return
    }

    if (selectedOption.value.value === 'customers') {
      const { customers: data, error } = await getCustomerByName(query)
      if (error) {
        alertStore.showAlert(t('alert.error'), error.message, 'error')
        return
      }

      const customers = await enrichCustomersWithDebt((data ?? []) as CustomerWithDebt[])
      searchResults.value = customers
      resultType.value = 'customers'

      if (!searchResults.value.length) {
        alertStore.showAlert(t('home.notFound'), t('home.buyerNotFound', { query }), 'error')
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
      alertStore.showAlert(t('alert.error'), error.message, 'error')
      return
    }

    if (!summary?.unpaidCount) {
      debtDialogOpen.value = false
      alertStore.showAlert(t('alert.info'), t('home.noDebt'), 'error')
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
