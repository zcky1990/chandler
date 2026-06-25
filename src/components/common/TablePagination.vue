<script setup lang="ts">
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useI18n } from '@/composables/useI18n'
import { PAGE_SIZE_OPTIONS } from '@/composables/usePagination'

defineProps<{
  from: number
  to: number
  total: number
  currentPage: number
  totalPages: number
  pageSize: number
}>()

const emit = defineEmits<{
  'update:pageSize': [value: number]
  previous: []
  next: []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
    <p class="text-sm text-muted-foreground">
      {{ t('common.showingResults', { from, to, total }) }}
    </p>
    <div class="flex flex-wrap items-center gap-2">
      <Select
        :model-value="String(pageSize)"
        @update:model-value="emit('update:pageSize', Number($event))"
      >
        <SelectTrigger class="w-[110px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="size in PAGE_SIZE_OPTIONS"
            :key="size"
            :value="String(size)"
          >
            {{ t('common.pageSize', { count: size }) }}
          </SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="icon-sm"
        :disabled="currentPage <= 1"
        :title="t('common.previous')"
        @click="emit('previous')"
      >
        <ChevronLeft class="size-4" />
      </Button>
      <span class="min-w-[88px] text-center text-sm tabular-nums">
        {{ t('common.pageOf', { page: currentPage, total: totalPages }) }}
      </span>
      <Button
        variant="outline"
        size="icon-sm"
        :disabled="currentPage >= totalPages"
        :title="t('common.next')"
        @click="emit('next')"
      >
        <ChevronRight class="size-4" />
      </Button>
    </div>
  </div>
</template>
