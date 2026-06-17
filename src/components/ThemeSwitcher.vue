<script setup lang="ts">
import { MonitorIcon, MoonIcon, SunIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useThemeStore, type Theme } from '@/stores/useThemeStore'

const themeStore = useThemeStore()

function onThemeChange(value: string) {
  themeStore.setTheme(value as Theme)
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" size="icon">
        <SunIcon
          class="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        />
        <MoonIcon
          class="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        />
        <span class="sr-only">Toggle theme</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>Theme</DropdownMenuLabel>
      <DropdownMenuRadioGroup
        :model-value="themeStore.themeState"
        @update:model-value="onThemeChange"
      >
        <DropdownMenuRadioItem value="light">
          <SunIcon />
          Light
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="dark">
          <MoonIcon />
          Dark
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="system">
          <MonitorIcon />
          System
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
