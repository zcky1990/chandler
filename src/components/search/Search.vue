<script setup lang="ts">
import { ChevronDownIcon, Search as SearchIcon } from '@lucide/vue'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import { computed } from 'vue'

const props = defineProps<{
  searchInOptions?: { label: string, value: string }[]
  searchQuery?: string
  selectedOption?: { label: string, value: string } | null
}>()

const options = computed(() => props.searchInOptions || [])

const selectedOption = computed(() => props.selectedOption || null)

const emit = defineEmits<{
  (e: 'update:searchQuery', value: string): void
  (e: 'update:selectedOption', value: { label: string, value: string } | null): void
  (e: 'submit'): void
}>()

const queryModel = computed({
  get: () => props.searchQuery ?? '',
  set: (value) => {
    emit('update:searchQuery', value)
  },
})

function handleOptionSelect(option: { label: string, value: string }) {
  emit('update:selectedOption', option)
}

function handleSubmit() {
  emit('submit')
}
</script>

<template>
  <InputGroup class="h-11 w-full bg-background">
    <InputGroupAddon align="inline-start" class="pl-3 text-muted-foreground">
      <SearchIcon class="size-4" />
    </InputGroupAddon>
    <InputGroupInput
      v-model="queryModel"
      placeholder="Cari produk atau nama pembeli..."
      class="text-base"
      @keyup.enter="handleSubmit"
    />
    <InputGroupAddon align="inline-end" class="pr-1">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <InputGroupButton variant="ghost" class="text-sm">
            {{ selectedOption?.label || 'Kategori' }}
            <ChevronDownIcon class="size-3.5 opacity-50" />
          </InputGroupButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            v-for="option in options"
            :key="option.value"
            @click="handleOptionSelect(option)"
          >
            {{ option.label }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </InputGroupAddon>
  </InputGroup>
</template>
