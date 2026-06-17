<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { Customer } from '@/types/database'

defineProps<{
  customers: Customer[]
}>()
</script>

<template>
  <div class="w-full max-w-2xl space-y-3">
    <h2 class="text-sm font-medium text-muted-foreground">
      {{ customers.length }} pembeli ditemukan
    </h2>
    <div class="grid gap-3">
      <Card
        v-for="customer in customers"
        :key="customer.id"
        class="bg-background/90 backdrop-blur-sm"
      >
        <CardHeader class="pb-2">
          <CardTitle class="text-base">{{ customer.name }}</CardTitle>
          <CardDescription v-if="customer.email">
            {{ customer.email }}
          </CardDescription>
        </CardHeader>
        <CardContent class="grid gap-1 text-sm text-muted-foreground">
          <p v-if="customer.phone">
            <span class="font-medium text-foreground">Telepon:</span> {{ customer.phone }}
          </p>
          <p v-if="customer.address">
            <span class="font-medium text-foreground">Alamat:</span> {{ customer.address }}
          </p>
          <p v-if="customer.notes">
            <span class="font-medium text-foreground">Catatan:</span> {{ customer.notes }}
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
