<script setup lang="ts">
import { Languages } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useI18n } from '@/composables/useI18n'
import type { Locale } from '@/lib/i18n/messages'

const { t, locale, localeStore } = useI18n()

function onLocaleChange(value: string) {
  localeStore.setLocale(value as Locale)
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" size="icon">
        <Languages class="size-4" />
        <span class="sr-only">{{ t('language.label') }}</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>{{ t('language.label') }}</DropdownMenuLabel>
      <DropdownMenuRadioGroup
        :model-value="locale"
        @update:model-value="onLocaleChange"
      >
        <DropdownMenuRadioItem value="id">
          {{ t('language.id') }}
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="en">
          {{ t('language.en') }}
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
