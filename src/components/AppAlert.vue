<script setup lang="ts">

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { AlertCircleIcon } from 'lucide-vue-next'
import { useAlertStore } from '@/stores/useAlertStore'
import { onMounted, computed } from 'vue'
const alertStore = useAlertStore()
const alertState = alertStore.alertState

onMounted(() => {
  if (alertState.show) {
    closeAlertAfterFiveseconds()
  }
})

const alertVariant = computed(() => {
  return alertState.type === 'success' ? 'success' : 'destructive'
})

const alertIcon = computed(() => {
  return alertState.type === 'success' ? 'CheckCircleIcon' : 'AlertCircleIcon'
})

const closeAlertAfterFiveseconds = () => {
  setTimeout(() => {
    alertStore.clearAlert()
  }, 5000)
}
</script>

<template>
    <div class="grid w-full max-w-xl items-start gap-4 p-4">
        <Alert :variant="alertVariant" v-if="alertState.show">
            <component :is="alertIcon" />
            <AlertTitle>{{ alertState.title }}</AlertTitle>
            <AlertDescription>{{ alertState.description }}</AlertDescription>
        </Alert>
    </div>
</template>