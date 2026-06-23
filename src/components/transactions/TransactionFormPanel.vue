<script setup lang="ts">
import { Plus } from '@lucide/vue'
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
import { formatPrice } from '@/lib/format'
import type { Customer, Product } from '@/types/database'
import { WALK_IN_CUSTOMER_NAME } from '@/types/database'

defineProps<{
  customers: Customer[]
  selectedCustomer: Customer | null
  availableProducts: Product[]
  selectedProduct: Product | null
}>()

const selectedCustomerId = defineModel<string>('selectedCustomerId', { required: true })
const notes = defineModel<string>('notes', { required: true })
const selectedProductId = defineModel<string>('selectedProductId', { required: true })
const addQuantity = defineModel<number>('addQuantity', { required: true })

const emit = defineEmits<{
  addProduct: []
}>()
</script>

<template>
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
            @click="emit('addProduct')"
          >
            <Plus class="size-4" />
            Tambah
          </Button>
        </div>
      </FieldGroup>
    </div>
  </section>
</template>
