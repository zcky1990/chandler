import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  buildBundleLineKey,
  buildCartLineKey,
  cartAddonsToInput,
  expandItemsForSubmit,
  getLineSubtotal,
  hasBundleAddons,
  type CartAddonSelection,
} from '@/lib/addon'
import { formatPrice } from '@/lib/format'
import { createPreOrder, formatPreOrderNumber } from '@/lib/pre-order'
import { saveOrderSuccessPayload } from '@/lib/order-success'
import { getProducts, getProductAddonsMap } from '@/lib/product'
import { useAlertStore } from '@/stores/useAlertStore'
import { useI18n } from '@/composables/useI18n'
import type { Product } from '@/types/database'

export type PreOrderCartItem = {
  lineKey: string
  product: Product
  quantity: number
  addons: CartAddonSelection[]
}

export function usePreOrderCart() {
  const alertStore = useAlertStore()
  const { t } = useI18n()
  const router = useRouter()
  const products = ref<Product[]>([])
  const productAddonsMap = ref<Record<string, Product[]>>({})
  const cart = ref<PreOrderCartItem[]>([])
  const customerName = ref('')
  const tableNumber = ref('')
  const notes = ref('')
  const isLoading = ref(true)
  const isSubmitting = ref(false)
  const addonDialogOpen = ref(false)
  const pendingProduct = ref<Product | null>(null)
  const pendingBundleIndex = ref(1)
  const pendingBundleTotal = ref(1)
  const searchQuery = ref('')
  const categoryFilter = ref('all')
  const menuQuantities = ref<Record<string, number>>({})

  const availableProducts = computed(() =>
    products.value.filter((product) =>
      product.stock_quantity > 0
      && product.is_active
      && !product.is_addons,
    ),
  )

  const menuCategories = computed(() => {
    const map = new Map<string, { id: string, name: string }>()

    for (const product of availableProducts.value) {
      const category = product.product_categories
      if (category) {
        map.set(category.id, category)
      }
    }

    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
  })

  const filteredMenuProducts = computed(() => {
    let result = availableProducts.value

    if (categoryFilter.value !== 'all') {
      result = result.filter((product) => product.category_id === categoryFilter.value)
    }

    const query = searchQuery.value.trim().toLowerCase()
    if (query) {
      result = result.filter((product) => {
        const name = product.name.toLowerCase()
        const category = product.product_categories?.name.toLowerCase() ?? ''
        return name.includes(query) || category.includes(query)
      })
    }

    return result
  })

  const pendingProductAddons = computed(() =>
    pendingProduct.value ? (productAddonsMap.value[pendingProduct.value.id] ?? []) : [],
  )

  const totalAmount = computed(() =>
    cart.value.reduce(
      (sum, item) => sum + getLineSubtotal(
        item.quantity,
        item.product.price,
        cartAddonsToInput(item.addons),
      ),
      0,
    ),
  )

  function getCartLineSubtotal(item: PreOrderCartItem) {
    return getLineSubtotal(item.quantity, item.product.price, cartAddonsToInput(item.addons))
  }

  function hasEnoughStock(product: Product, addons: CartAddonSelection[], menuQuantity: number) {
    if (menuQuantity > product.stock_quantity) return false

    for (const addon of addons) {
      const required = addon.quantity * menuQuantity
      if (required > addon.product.stock_quantity) return false
    }

    return true
  }

  async function loadData() {
    isLoading.value = true

    const [productResult, addonMapResult] = await Promise.all([
      getProducts(),
      getProductAddonsMap(),
    ])

    isLoading.value = false

    if (productResult.error) {
      alertStore.showAlert(t('alert.error'), productResult.error.message, 'error')
      return
    }

    products.value = (productResult.products ?? []).filter((product) => product.is_active)
    productAddonsMap.value = addonMapResult.map ?? {}
  }

  function getCartItem(lineKey: string) {
    return cart.value.find((item) => item.lineKey === lineKey)
  }

  function addToCart(product: Product, quantity = 1, addons: CartAddonSelection[] = []) {
    if (hasBundleAddons(addons)) {
      for (let i = 0; i < quantity; i++) {
        if (!hasEnoughStock(product, addons, 1)) {
          alertStore.showAlert(t('transaction.stockInsufficient'), t('transaction.stockMenuAddon'), 'error')
          return
        }

        cart.value.push({
          lineKey: buildBundleLineKey(product.id, addons),
          product,
          quantity: 1,
          addons,
        })
      }
      return
    }

    const lineKey = buildCartLineKey(product.id, addons)
    const existing = getCartItem(lineKey)

    if (existing) {
      const nextQuantity = existing.quantity + quantity
      if (!hasEnoughStock(product, addons, nextQuantity)) {
        alertStore.showAlert(t('transaction.stockInsufficient'), t('transaction.stockMenuAddon'), 'error')
        return
      }

      existing.quantity = nextQuantity
      return
    }

    if (!hasEnoughStock(product, addons, quantity)) {
      alertStore.showAlert(t('transaction.stockOut'), t('transaction.stockOutProduct', { name: product.name }), 'error')
      return
    }

    cart.value.push({
      lineKey,
      product,
      quantity: Math.min(quantity, product.stock_quantity),
      addons,
    })
  }

  function resetPendingAddonFlow() {
    pendingProduct.value = null
    pendingBundleIndex.value = 1
    pendingBundleTotal.value = 1
  }

  function openAddonDialog(product: Product, quantity = 1) {
    const mappedAddons = productAddonsMap.value[product.id] ?? []

    if (mappedAddons.length) {
      pendingProduct.value = product
      pendingBundleTotal.value = quantity
      pendingBundleIndex.value = 1
      addonDialogOpen.value = true
      return
    }

    addToCart(product, quantity)
  }

  function handleAddonConfirm(addons: CartAddonSelection[]) {
    if (!pendingProduct.value) return

    addToCart(pendingProduct.value, 1, addons)

    if (pendingBundleIndex.value < pendingBundleTotal.value) {
      pendingBundleIndex.value++
      return
    }

    addonDialogOpen.value = false
    resetPendingAddonFlow()
  }

  watch(addonDialogOpen, (open) => {
    if (!open) {
      resetPendingAddonFlow()
    }
  })

  function updateQuantity(lineKey: string, quantity: number) {
    const item = getCartItem(lineKey)
    if (!item) return

    if (hasBundleAddons(item.addons)) {
      if (quantity <= item.quantity) {
        removeFromCart(lineKey)
        return
      }

      openAddonDialog(item.product, quantity - item.quantity)
      return
    }

    if (quantity <= 0) {
      removeFromCart(lineKey)
      return
    }

    if (!hasEnoughStock(item.product, item.addons, quantity)) {
      alertStore.showAlert(t('transaction.stockInsufficient'), t('transaction.stockMenuAddon'), 'error')
      return
    }

    item.quantity = quantity
  }

  function removeFromCart(lineKey: string) {
    cart.value = cart.value.filter((item) => item.lineKey !== lineKey)
  }

  function clearCart() {
    cart.value = []
  }

  function getMenuQuantity(productId: string) {
    return menuQuantities.value[productId] ?? 1
  }

  function incrementMenuQuantity(productId: string, maxStock: number) {
    const next = Math.min(getMenuQuantity(productId) + 1, maxStock)
    menuQuantities.value[productId] = next
  }

  function decrementMenuQuantity(productId: string) {
    const next = Math.max(getMenuQuantity(productId) - 1, 1)
    menuQuantities.value[productId] = next
  }

  function addProductFromMenu(product: Product) {
    openAddonDialog(product, getMenuQuantity(product.id))
    menuQuantities.value[product.id] = 1
  }

  function resetForm() {
    cart.value = []
    customerName.value = ''
    tableNumber.value = ''
    notes.value = ''
  }

  function validateCart() {
    if (!cart.value.length) {
      alertStore.showAlert(t('alert.error'), t('transaction.addMinOneProduct'), 'error')
      return false
    }

    return true
  }

  function getErrorMessage(error: unknown) {
    if (typeof error === 'object' && error !== null && 'message' in error) {
      return String(error.message)
    }

    if (typeof error === 'object' && error !== null) {
      return Object.values(error).flat().join(', ')
    }

    return t('order.submitFailed')
  }

  async function submitOrder() {
    if (!validateCart()) return

    isSubmitting.value = true

    const { preOrder, error } = await createPreOrder({
      customer_name: customerName.value.trim() || null,
      table_number: tableNumber.value.trim() || null,
      notes: notes.value.trim() || null,
      payment_choice: 'pay_later',
      items: expandItemsForSubmit(cart.value.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
        addons: cartAddonsToInput(item.addons),
      }))),
    })

    isSubmitting.value = false

    if (error || !preOrder) {
      alertStore.showAlert(t('alert.error'), getErrorMessage(error), 'error')
      return
    }

    resetForm()
    saveOrderSuccessPayload({
      orderNumber: preOrder.order_number,
      totalAmount: Number(preOrder.total_amount),
    })
    router.push('/order/success')
  }

  onMounted(loadData)

  return {
    products,
    cart,
    customerName,
    tableNumber,
    notes,
    searchQuery,
    categoryFilter,
    isLoading,
    isSubmitting,
    availableProducts,
    filteredMenuProducts,
    menuCategories,
    addonDialogOpen,
    pendingProduct,
    pendingProductAddons,
    pendingBundleIndex,
    pendingBundleTotal,
    totalAmount,
    formatPrice,
    formatPreOrderNumber,
    getCartLineSubtotal,
    getMenuQuantity,
    incrementMenuQuantity,
    decrementMenuQuantity,
    addProductFromMenu,
    openAddonDialog,
    handleAddonConfirm,
    updateQuantity,
    removeFromCart,
    clearCart,
    submitOrder,
  }
}
