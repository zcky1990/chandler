import { computed, onMounted, ref } from 'vue'
import {
  buildCartLineKey,
  cartAddonsToInput,
  getLineSubtotal,
  type CartAddonSelection,
} from '@/lib/addon'
import { formatPrice } from '@/lib/format'
import { createPreOrder, formatPreOrderNumber } from '@/lib/pre-order'
import { getProducts, getProductAddonsMap } from '@/lib/product'
import { useAlertStore } from '@/stores/useAlertStore'
import type { PreOrder, Product } from '@/types/database'

export type PreOrderCartItem = {
  lineKey: string
  product: Product
  quantity: number
  addons: CartAddonSelection[]
}

export function usePreOrderCart() {
  const alertStore = useAlertStore()
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
  const pendingQuantity = ref(1)
  const successDialogOpen = ref(false)
  const submittedOrder = ref<PreOrder | null>(null)

  const availableProducts = computed(() =>
    products.value.filter((product) =>
      product.stock_quantity > 0
      && product.is_active
      && !product.is_addons,
    ),
  )

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
      alertStore.showAlert('Error', productResult.error.message, 'error')
      return
    }

    products.value = (productResult.products ?? []).filter((product) => product.is_active)
    productAddonsMap.value = addonMapResult.map ?? {}
  }

  function getCartItem(lineKey: string) {
    return cart.value.find((item) => item.lineKey === lineKey)
  }

  function addToCart(product: Product, quantity = 1, addons: CartAddonSelection[] = []) {
    const lineKey = buildCartLineKey(product.id, addons)
    const existing = getCartItem(lineKey)

    if (existing) {
      const nextQuantity = existing.quantity + quantity
      if (!hasEnoughStock(product, addons, nextQuantity)) {
        alertStore.showAlert('Stok tidak cukup', 'Stok menu atau addon tidak mencukupi', 'error')
        return
      }

      existing.quantity = nextQuantity
      return
    }

    if (!hasEnoughStock(product, addons, quantity)) {
      alertStore.showAlert('Stok habis', `${product.name} atau addon tidak tersedia`, 'error')
      return
    }

    cart.value.push({
      lineKey,
      product,
      quantity: Math.min(quantity, product.stock_quantity),
      addons,
    })
  }

  function openAddonDialog(product: Product, quantity = 1) {
    const mappedAddons = productAddonsMap.value[product.id] ?? []

    if (mappedAddons.length) {
      pendingProduct.value = product
      pendingQuantity.value = quantity
      addonDialogOpen.value = true
      return
    }

    addToCart(product, quantity)
  }

  function handleAddonConfirm(addons: CartAddonSelection[]) {
    if (!pendingProduct.value) return

    addToCart(pendingProduct.value, pendingQuantity.value, addons)
    pendingProduct.value = null
    pendingQuantity.value = 1
  }

  function updateQuantity(lineKey: string, quantity: number) {
    const item = getCartItem(lineKey)
    if (!item) return

    if (quantity <= 0) {
      removeFromCart(lineKey)
      return
    }

    if (!hasEnoughStock(item.product, item.addons, quantity)) {
      alertStore.showAlert('Stok tidak cukup', 'Stok menu atau addon tidak mencukupi', 'error')
      return
    }

    item.quantity = quantity
  }

  function removeFromCart(lineKey: string) {
    cart.value = cart.value.filter((item) => item.lineKey !== lineKey)
  }

  function resetForm() {
    cart.value = []
    customerName.value = ''
    tableNumber.value = ''
    notes.value = ''
  }

  function validateCart() {
    if (!cart.value.length) {
      alertStore.showAlert('Error', 'Tambahkan minimal 1 produk', 'error')
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

    return 'Gagal mengirim pesanan'
  }

  async function submitOrder() {
    if (!validateCart()) return

    isSubmitting.value = true

    const { preOrder, error } = await createPreOrder({
      customer_name: customerName.value.trim() || null,
      table_number: tableNumber.value.trim() || null,
      notes: notes.value.trim() || null,
      payment_choice: 'pay_later',
      items: cart.value.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
        addons: cartAddonsToInput(item.addons),
      })),
    })

    isSubmitting.value = false

    if (error) {
      alertStore.showAlert('Error', getErrorMessage(error), 'error')
      return
    }

    submittedOrder.value = preOrder
    resetForm()
    successDialogOpen.value = true
  }

  onMounted(loadData)

  return {
    products,
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
    pendingQuantity,
    totalAmount,
    successDialogOpen,
    submittedOrder,
    formatPrice,
    formatPreOrderNumber,
    getCartLineSubtotal,
    openAddonDialog,
    handleAddonConfirm,
    updateQuantity,
    removeFromCart,
    submitOrder,
  }
}
