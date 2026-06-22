<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { Banknote, ClipboardList, Minus, Plus, Receipt, ShoppingCart, Trash2 } from '@lucide/vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import PaymentMethodDialog from '@/components/transactions/PaymentMethodDialog.vue'
import AddonSelectDialog from '@/components/transactions/AddonSelectDialog.vue'
import TableNumberDialog from '@/components/transactions/TableNumberDialog.vue'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { getProducts, getProductAddonsMap } from '@/lib/product'
import { buildCartLineKey, cartAddonsToInput, getLineSubtotal, type CartAddonSelection } from '@/lib/addon'
import { createTransaction, getCustomersForTransaction, getPendingTransactionForCustomer } from '@/lib/transaction'
import { createQueueEntry } from '@/lib/queue'
import { useAlertStore } from '@/stores/useAlertStore'
import type { Customer, PaymentMethod, Product, Transaction } from '@/types/database'
import { WALK_IN_CUSTOMER_NAME } from '@/types/database'

type CartItem = {
  lineKey: string
  product: Product
  quantity: number
  addons: CartAddonSelection[]
}

const alertStore = useAlertStore()
const customers = ref<Customer[]>([])
const products = ref<Product[]>([])
const productAddonsMap = ref<Record<string, Product[]>>({})
const selectedCustomerId = ref('')
const selectedProductId = ref('')
const addQuantity = ref(1)
const notes = ref('')
const cart = ref<CartItem[]>([])
const pendingTransaction = ref<Transaction | null>(null)
const isLoading = ref(true)
const isSubmitting = ref(false)
const paymentDialogOpen = ref(false)
const paymentWithQueue = ref(false)
const tableDialogOpen = ref(false)
const pendingQueueAction = ref<'debt' | 'pay' | null>(null)
const pendingTableNumber = ref<string | null>(null)
const addonDialogOpen = ref(false)
const pendingProduct = ref<Product | null>(null)
const pendingQuantity = ref(1)

const selectedCustomer = computed(() =>
  customers.value.find((customer) => customer.id === selectedCustomerId.value) ?? null,
)

const selectedProduct = computed(() =>
  products.value.find((product) => product.id === selectedProductId.value) ?? null,
)

const availableProducts = computed(() =>
  products.value.filter((product) =>
    product.stock_quantity > 0
    && (product.product_type ?? 'menu') === 'menu',
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

function getCartLineSubtotal(item: CartItem) {
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

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)
}

async function loadData() {
  isLoading.value = true

  const [customerResult, productResult, addonMapResult] = await Promise.all([
    getCustomersForTransaction(),
    getProducts(),
    getProductAddonsMap(),
  ])

  isLoading.value = false

  if (customerResult.error) {
    alertStore.showAlert('Error', customerResult.error.message, 'error')
  } else {
    customers.value = customerResult.customers
    const walkIn = customerResult.customers.find((customer) => customer.name === WALK_IN_CUSTOMER_NAME)
    selectedCustomerId.value = walkIn?.id ?? customerResult.customers[0]?.id ?? ''
  }

  if (productResult.error) {
    alertStore.showAlert('Error', productResult.error.message, 'error')
    return
  }

  products.value = (productResult.products ?? []).filter((product) => product.is_active)
  productAddonsMap.value = addonMapResult.map ?? {}
  await loadPendingTransaction()
}

async function loadPendingTransaction() {
  if (!selectedCustomerId.value) {
    pendingTransaction.value = null
    return
  }

  const { transaction, error } = await getPendingTransactionForCustomer(selectedCustomerId.value)
  if (error) {
    pendingTransaction.value = null
    return
  }

  pendingTransaction.value = transaction as Transaction | null
}

watch(selectedCustomerId, loadPendingTransaction)

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

function handleAddSelectedProduct() {
  if (!selectedProduct.value) {
    alertStore.showAlert('Error', 'Pilih produk terlebih dahulu', 'error')
    return
  }

  if (addQuantity.value < 1) {
    alertStore.showAlert('Error', 'Jumlah minimal 1', 'error')
    return
  }

  const mappedAddons = productAddonsMap.value[selectedProduct.value.id] ?? []

  if (mappedAddons.length) {
    pendingProduct.value = selectedProduct.value
    pendingQuantity.value = addQuantity.value
    addonDialogOpen.value = true
    return
  }

  addToCart(selectedProduct.value, addQuantity.value)
  selectedProductId.value = ''
  addQuantity.value = 1
}

function handleAddonConfirm(addons: CartAddonSelection[]) {
  if (!pendingProduct.value) return

  addToCart(pendingProduct.value, pendingQuantity.value, addons)
  pendingProduct.value = null
  pendingQuantity.value = 1
  selectedProductId.value = ''
  addQuantity.value = 1
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
  notes.value = ''
  selectedProductId.value = ''
  addQuantity.value = 1
  const walkIn = customers.value.find((customer) => customer.name === WALK_IN_CUSTOMER_NAME)
  selectedCustomerId.value = walkIn?.id ?? customers.value[0]?.id ?? ''
}

function validateCart() {
  if (!selectedCustomerId.value) {
    alertStore.showAlert('Error', 'Pilih pembeli terlebih dahulu', 'error')
    return false
  }

  if (!cart.value.length) {
    alertStore.showAlert('Error', 'Tambahkan minimal 1 produk', 'error')
    return false
  }

  return true
}

function getTransactionPayload() {
  return {
    customer_id: selectedCustomerId.value,
    notes: notes.value || null,
    items: cart.value.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price: item.product.price,
      addons: cartAddonsToInput(item.addons),
    })),
  }
}

function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message)
  }

  if (typeof error === 'object' && error !== null) {
    return Object.values(error).flat().join(', ')
  }

  return 'Gagal menyimpan transaksi'
}

async function createQueueForTransaction(transactionId: string, tableNumber: string | null = null) {
  const { queue, error } = await createQueueEntry(transactionId, { tableNumber })

  if (error) {
    alertStore.showAlert('Error', `Transaksi tersimpan, tetapi antrian gagal: ${error.message}`, 'error')
    return null
  }

  return queue
}

function queueSuccessMessage(queueNumber: number, tableNumber: string | null, prefix: string) {
  const tableLabel = tableNumber ? ` · Meja ${tableNumber}` : ''
  return `${prefix} ${formatQueueNumber(queueNumber)}${tableLabel}`
}

function formatQueueNumber(number: number) {
  return `#${String(number).padStart(3, '0')}`
}

async function handleSubmit(addToQueue = false, tableNumber: string | null = null) {
  if (!validateCart()) return

  isSubmitting.value = true

  const { transaction, merged, error } = await createTransaction(getTransactionPayload())

  if (error) {
    isSubmitting.value = false
    alertStore.showAlert('Error', getErrorMessage(error), 'error')
    return
  }

  if (addToQueue && transaction) {
    const queue = await createQueueForTransaction(transaction.id, tableNumber)
    isSubmitting.value = false

    if (!queue) {
      resetForm()
      await loadData()
      return
    }

    alertStore.showAlert(
      'Berhasil',
      merged
        ? queueSuccessMessage(queue.queue_number, tableNumber, 'Hutang diperbarui & antrian')
        : queueSuccessMessage(queue.queue_number, tableNumber, 'Transaksi hutang & antrian'),
      'success',
    )
  } else {
    isSubmitting.value = false
    alertStore.showAlert(
      'Berhasil',
      merged
        ? 'Pembelian ditambahkan ke transaksi belum dibayar hari ini'
        : 'Transaksi baru berhasil dibuat',
      'success',
    )
  }

  resetForm()
  await loadData()
}

function openQueueFlow(action: 'debt' | 'pay') {
  if (!validateCart()) return
  pendingQueueAction.value = action
  tableDialogOpen.value = true
}

function handleTableNumberConfirm(tableNumber: string | null) {
  if (pendingQueueAction.value === 'debt') {
    pendingQueueAction.value = null
    handleSubmit(true, tableNumber)
    return
  }

  if (pendingQueueAction.value === 'pay') {
    pendingTableNumber.value = tableNumber
    pendingQueueAction.value = null
    paymentWithQueue.value = true
    paymentDialogOpen.value = true
  }
}

function openPaymentDialog(withQueue = false) {
  if (!validateCart()) return
  paymentWithQueue.value = withQueue
  pendingTableNumber.value = null
  paymentDialogOpen.value = true
}

async function handlePayment(method: PaymentMethod) {
  isSubmitting.value = true
  const addToQueue = paymentWithQueue.value
  const tableNumber = pendingTableNumber.value

  const { transaction, error } = await createTransaction(getTransactionPayload(), { paymentMethod: method })

  if (error) {
    isSubmitting.value = false
    paymentDialogOpen.value = false
    paymentWithQueue.value = false
    pendingTableNumber.value = null
    alertStore.showAlert('Error', getErrorMessage(error), 'error')
    return
  }

  if (addToQueue && transaction) {
    const queue = await createQueueForTransaction(transaction.id, tableNumber)
    isSubmitting.value = false
    paymentDialogOpen.value = false
    paymentWithQueue.value = false
    pendingTableNumber.value = null

    if (!queue) {
      resetForm()
      await loadData()
      return
    }

    const methodLabel = method === 'qris' ? 'QRIS' : method === 'cash' ? 'Cash' : 'Transfer'
    alertStore.showAlert(
      'Berhasil',
      queueSuccessMessage(queue.queue_number, tableNumber, `Transaksi lunas (${methodLabel}) & antrian`),
      'success',
    )
  } else {
    isSubmitting.value = false
    paymentDialogOpen.value = false
    paymentWithQueue.value = false
    pendingTableNumber.value = null

    const methodLabel = method === 'qris' ? 'QRIS' : method === 'cash' ? 'Cash' : 'Transfer'
    alertStore.showAlert('Berhasil', `Transaksi lunas (${methodLabel}) berhasil dibuat`, 'success')
  }

  resetForm()
  await loadData()
}

onMounted(loadData)
</script>

<template>
  <DashboardLayout>
    <div class="flex flex-col gap-6 p-6">
      <div>
        <h1 class="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Receipt class="size-6" />
          Transaksi
        </h1>
        <p class="text-sm text-muted-foreground">
          Pembelian pada hari yang sama akan digabung jika transaksi sebelumnya belum dibayar.
        </p>
      </div>

      <div
        v-if="pendingTransaction"
        class="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm"
      >
        <p class="font-medium text-foreground">Transaksi belum dibayar hari ini</p>
        <p class="text-muted-foreground">
          Pembelian berikutnya untuk pembeli ini akan ditambahkan ke transaksi
          <span class="font-medium text-foreground">{{ formatPrice(pendingTransaction.total_amount) }}</span>.
        </p>
      </div>

      <div v-if="isLoading" class="text-sm text-muted-foreground">
        Memuat data...
      </div>

      <div v-else class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section class="space-y-4">
          <div class="rounded-xl border bg-background p-4">
            <FieldGroup>
              <Field>
                <FieldLabel for="customer">Pembeli</FieldLabel>
                <select
                  id="customer"
                  v-model="selectedCustomerId"
                  class="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                >
                  <option
                    v-for="customer in customers"
                    :key="customer.id"
                    :value="customer.id"
                  >
                    {{ customer.name }}{{ customer.name === WALK_IN_CUSTOMER_NAME ? ' (default)' : '' }}
                  </option>
                </select>
                <p v-if="selectedCustomer" class="text-sm text-muted-foreground">
                  {{ selectedCustomer.phone || selectedCustomer.email || selectedCustomer.address || 'Tanpa detail kontak' }}
                </p>
              </Field>

              <Field>
                <FieldLabel for="notes">Catatan</FieldLabel>
                <Textarea
                  id="notes"
                  v-model="notes"
                  placeholder="Catatan transaksi (opsional)"
                  rows="2"
                />
              </Field>
            </FieldGroup>
          </div>

          <div class="rounded-xl border bg-background p-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Produk</FieldLabel>
                <Select v-model="selectedProductId">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Pilih produk" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="product in availableProducts"
                      :key="product.id"
                      :value="product.id"
                    >
                      {{ product.name }} · {{ formatPrice(product.price) }} · Stok {{ product.stock_quantity }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p v-if="selectedProduct" class="text-sm text-muted-foreground">
                  {{ formatPrice(selectedProduct.price) }} · Stok tersedia {{ selectedProduct.stock_quantity }}
                </p>
                <p v-else-if="!availableProducts.length" class="text-sm text-muted-foreground">
                  Tidak ada produk tersedia.
                </p>
              </Field>

              <div class="flex items-end gap-3">
                <Field class="flex-1">
                  <FieldLabel for="add-quantity">Jumlah</FieldLabel>
                  <Input
                    id="add-quantity"
                    v-model.number="addQuantity"
                    type="number"
                    min="1"
                    :max="selectedProduct?.stock_quantity ?? undefined"
                  />
                </Field>
                <Button
                  class="shrink-0"
                  :disabled="!availableProducts.length"
                  @click="handleAddSelectedProduct"
                >
                  <Plus class="size-4" />
                  Tambah
                </Button>
              </div>
            </FieldGroup>
          </div>
        </section>

        <section class="space-y-4">
          <div class="rounded-xl border bg-background p-4">
            <div class="mb-4 flex items-center gap-2">
              <ShoppingCart class="size-5" />
              <h2 class="font-semibold">Keranjang</h2>
            </div>

            <div v-if="!cart.length" class="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              Belum ada produk di keranjang.
            </div>

            <div v-else class="space-y-2">
              <div
                v-for="item in cart"
                :key="item.lineKey"
                class="rounded-xl border px-4 py-3"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="font-medium">{{ item.product.name }}</p>
                    <p class="text-sm text-muted-foreground">
                      {{ formatPrice(item.product.price) }} / item
                    </p>
                    <p
                      v-if="item.addons.length"
                      class="mt-1 text-xs text-muted-foreground"
                    >
                      + {{ item.addons.map((addon) => addon.product.name).join(', ') }}
                      ({{ formatPrice(item.addons.reduce((sum, addon) => sum + addon.product.price * addon.quantity, 0)) }})
                    </p>
                  </div>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    @click="removeFromCart(item.lineKey)"
                  >
                    <Trash2 class="size-4" />
                  </Button>
                </div>

                <div class="mt-3 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <Button
                      size="icon-sm"
                      variant="outline"
                      @click="updateQuantity(item.lineKey, item.quantity - 1)"
                    >
                      <Minus class="size-4" />
                    </Button>
                    <Input
                      :model-value="item.quantity"
                      type="number"
                      min="1"
                      :max="item.product.stock_quantity"
                      class="w-16 text-center"
                      @update:model-value="updateQuantity(item.lineKey, Number($event))"
                    />
                    <Button
                      size="icon-sm"
                      variant="outline"
                      @click="updateQuantity(item.lineKey, item.quantity + 1)"
                    >
                      <Plus class="size-4" />
                    </Button>
                  </div>
                  <p class="font-semibold">
                    {{ formatPrice(getCartLineSubtotal(item)) }}
                  </p>
                </div>
              </div>
            </div>

            <div class="mt-4 flex items-center justify-between border-t pt-4">
              <span class="text-sm text-muted-foreground">Total</span>
              <span class="text-lg font-bold">{{ formatPrice(totalAmount) }}</span>
            </div>

            <div class="mt-4 grid gap-2 sm:grid-cols-2">
              <Button
                variant="outline"
                :disabled="isSubmitting || !cart.length"
                @click="handleSubmit(false)"
              >
                {{ isSubmitting ? 'Menyimpan...' : 'Simpan Hutang' }}
              </Button>
              <Button
                variant="outline"
                :disabled="isSubmitting || !cart.length"
                @click="openQueueFlow('debt')"
              >
                <ClipboardList class="size-4" />
                {{ isSubmitting ? 'Memproses...' : 'Simpan Hutang & Antrian' }}
              </Button>
              <Button
                :disabled="isSubmitting || !cart.length"
                @click="openPaymentDialog(false)"
              >
                <Banknote class="size-4" />
                {{ isSubmitting ? 'Memproses...' : 'Bayar' }}
              </Button>
              <Button
                :disabled="isSubmitting || !cart.length"
                @click="openQueueFlow('pay')"
              >
                <Banknote class="size-4" />
                <ClipboardList class="size-4" />
                {{ isSubmitting ? 'Memproses...' : 'Bayar & Antrian' }}
              </Button>
            </div>
          </div>
        </section>
      </div>

      <PaymentMethodDialog
        v-model:open="paymentDialogOpen"
        :transaction="null"
        :amount="totalAmount"
        @select="handlePayment"
      />

      <TableNumberDialog
        v-model:open="tableDialogOpen"
        @confirm="handleTableNumberConfirm"
      />

      <AddonSelectDialog
        v-model:open="addonDialogOpen"
        :product="pendingProduct"
        :addons="pendingProductAddons"
        @confirm="handleAddonConfirm"
      />
    </div>
  </DashboardLayout>
</template>
