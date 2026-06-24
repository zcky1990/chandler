<script setup lang="ts">

import { AlertCircleIcon, CheckCircle2Icon, AlertTriangleIcon } from '@lucide/vue'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { useAlertStore } from '@/stores/useAlertStore'
import { computed, watch } from 'vue'
const alertStore = useAlertStore()
const alertState = alertStore.alertState

const alertVariant = computed(() => {
  return alertState.type === 'success' ? 'success' : 'destructive'
})

const alertIcon = computed(() => {
  return alertState.type === 'success' ? 'CheckCircleIcon' : 'AlertCircleIcon'
})

watch(
  alertState,
  (newState) => {
    if (newState.show) {
      closeAlertAfterFiveseconds()
    }
  }
)

const closeAlertAfterFiveseconds = () => {
  setTimeout(() => {
    alertStore.clearAlert()
  }, 5000)
}
</script>

<template>
    <div class="grid w-full max-w-xl items-start gap-4 p-4">
        <Alert class="bg-background" :variant="alertVariant" v-if="alertState.show">
            <component :is="alertIcon" />
            <AlertTitle>{{ alertState.title }}</AlertTitle>
            <AlertDescription>{{ alertState.description }}</AlertDescription>
        </Alert>
    </div>
</template>