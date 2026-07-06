<script setup lang="ts">
defineProps<{
  label: string
  title: string
  light?: boolean
}>()
</script>

<template>
  <div class="mb-10 text-center">
    <p
      class="mb-2 text-sm font-semibold tracking-[0.2em] uppercase"
      :class="light ? 'text-orange-300' : 'text-orange-400'"
    >
      {{ label }}
    </p>
    <h2
      class="text-3xl font-extrabold tracking-tight md:text-4xl"
      :class="light ? 'text-white' : 'text-white'"
    >
      {{ title }}
    </h2>
  </div>
</template>
